'use strict';

const crypto  = require('crypto');
const express = require('express');
const router  = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

// ── Constants ─────────────────────────────────────────────────────────────────
const MEMBERSHIP_FEE_KES = 200;
const SEMESTER_TIMEZONE  = 'Africa/Nairobi';

const JKUAT_EMAIL_DOMAIN = '@students.jkuat.ac.ke';

const COLLEGES = ['COPAS', 'COETEC', 'COHES', 'COANRE', 'COHRED'];

// ── Input validation ──────────────────────────────────────────────────────────

/** Trim and cap a string. Returns '' for non-strings so required checks catch type mismatches. */
function sanitiseStr(val, maxLen = 100) {
    if (typeof val !== 'string') return '';
    return val.trim().substring(0, maxLen);
}

/** JKUAT reg numbers: letters, digits, slashes, hyphens — 3 to 30 chars. */
function validRegNo(val) {
    return /^[A-Z0-9\/\-]{3,30}$/i.test(val);
}

/** Basic e-mail sanity check. */
function validEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/** JKUAT student email check — must end in @students.jkuat.ac.ke */
function validJkuatEmail(val) {
    return typeof val === 'string' && val.toLowerCase().endsWith(JKUAT_EMAIL_DOMAIN);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Current semester anchored to East African Time, e.g. "2026-S1". */
function currentSemester() {
    const now   = new Date();
    const year  = Number(new Intl.DateTimeFormat('en-KE', { timeZone: SEMESTER_TIMEZONE, year:  'numeric' }).format(now));
    const month = Number(new Intl.DateTimeFormat('en-KE', { timeZone: SEMESTER_TIMEZONE, month: 'numeric' }).format(now));
    return `${year}-${month <= 6 ? 'S1' : 'S2'}`;
}

/** Normalise a Kenyan phone number to 2547XXXXXXXX. Returns null if unrecognised. */
function normalisePhone(raw) {
    const p = raw.replace(/\s+/g, '');
    if (/^\+254\d{9}$/.test(p))  return p.slice(1);
    if (/^254\d{9}$/.test(p))    return p;
    if (/^0[17]\d{8}$/.test(p))  return '254' + p.slice(1);
    return null;
}

/**
 * Constant-time comparison via SHA-256 normalisation.
 * Prevents timing side-channel attacks on secret comparison.
 */
function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const ha = crypto.createHash('sha256').update(Buffer.from(a)).digest();
    const hb = crypto.createHash('sha256').update(Buffer.from(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

/** Trigger a Lipana M-Pesa STK push. Returns { checkoutId } or throws. */
async function stkPush({ phone, amount, accountRef, description }) {
    const apiKey = process.env.LIPANA_API_KEY;

    if (!apiKey || apiKey === 'your_lipana_api_key_here') {
        console.warn('⚠️  LIPANA_API_KEY not set — skipping STK push (dev mode)');
        return { checkoutId: `dev_${Date.now()}` };
    }

    const base = process.env.LIPANA_ENVIRONMENT === 'production'
        ? 'https://api.lipana.dev'
        : 'https://sandbox.lipana.dev';

    const res = await fetch(`${base}/api/transactions/push-stk`, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key':    apiKey,
        },
        body: JSON.stringify({
            phone:        '+' + phone,   // Lipana expects +254XXXXXXXXX format
            amount,
            callback_url: process.env.LIPANA_CALLBACK_URL,
        }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Lipana returned non-JSON (${res.status}): ${text.substring(0, 200)}`);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'STK push failed');

    const checkoutId = data.checkout_request_id || data.checkoutRequestID || data.id;
    if (!checkoutId) throw new Error('Lipana response missing checkout ID field');
    return { checkoutId };
}

// ── Core payment logic ────────────────────────────────────────────────────────
/**
 * Shared by /pay and /renew.
 * Returns { status, body } — never touches res directly (keeps it testable).
 */
async function processPayment(reg_no, payment_phone) {
    const normPhone = normalisePhone(payment_phone);
    if (!normPhone) {
        return { status: 400, body: { error: 'Invalid phone number. Use format 07XXXXXXXX or +254XXXXXXXXX.' } };
    }

    const semester = currentSemester();

    const { data: member, error: lookupErr } = await supabaseAdmin
        .from('members')
        .select('id, reg_no, full_name')
        .eq('reg_no', reg_no)
        .maybeSingle();

    if (lookupErr) throw lookupErr;
    if (!member) {
        return { status: 404, body: { error: 'Registration number not found. Please register first.' } };
    }

    // Block duplicate completed payments
    const { data: existingPayment } = await supabaseAdmin
        .from('membership_payments')
        .select('id')
        .eq('reg_no', reg_no)
        .eq('semester', semester)
        .eq('status', 'completed')
        .maybeSingle();

    if (existingPayment) {
        return { status: 409, body: { error: `Membership for ${semester} has already been paid. You're all set!` } };
    }

    // Insert pending row — DB unique constraint catches concurrent duplicates
    const { data: payment, error: payErr } = await supabaseAdmin
        .from('membership_payments')
        .insert({
            member_id:     member.id,
            reg_no,
            semester,
            amount:        MEMBERSHIP_FEE_KES,
            payment_phone: normPhone,
            status:        'pending',
        })
        .select('id')
        .single();

    if (payErr) {
        if (payErr.code === '23505') {
            return { status: 409, body: { error: 'A payment for this semester is already in progress.' } };
        }
        throw payErr;
    }

    // Trigger STK push — surface failure honestly, mark row failed, don't leave ghost pending rows
    try {
        const stk = await stkPush({
            phone:       normPhone,
            amount:      MEMBERSHIP_FEE_KES,
            accountRef:  reg_no,
            description: `JKUAT IEC Membership ${semester}`,
        });

        await supabaseAdmin
            .from('membership_payments')
            .update({ checkout_id: stk.checkoutId })
            .eq('id', payment.id);

        return {
            status: 200,
            body: {
                success:     true,
                message:     `Hi ${member.full_name.split(' ')[0]}, check your phone for the M-Pesa prompt.`,
                payment_id:  payment.id,
                checkout_id: stk.checkoutId,
            },
        };

    } catch (stkErr) {
        console.error('STK push failed:', stkErr);

        await supabaseAdmin
            .from('membership_payments')
            .update({ status: 'failed' })
            .eq('id', payment.id);

        return { status: 502, body: { error: 'Could not reach M-Pesa right now. Please try again in a moment.' } };
    }
}

// ── Shared route handler for /pay and /renew ──────────────────────────────────
function payHandler(label) {
    return async (req, res) => {
        try {
            const reg_no        = sanitiseStr(req.body.reg_no,        30).toUpperCase();
            const payment_phone = sanitiseStr(req.body.payment_phone, 20);

            if (!reg_no || !payment_phone) {
                return res.status(400).json({ error: 'reg_no and payment_phone are required.' });
            }
            if (!validRegNo(reg_no)) {
                return res.status(400).json({ error: 'Invalid registration number format.' });
            }

            const result = await processPayment(reg_no, payment_phone);
            return res.status(result.status).json(result.body);

        } catch (err) {
            console.error(`${label} error:`, err);
            return res.status(500).json({ error: 'Payment failed. Please try again.' });
        }
    };
}

// ── POST /api/v1/membership/register ─────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const reg_no        = sanitiseStr(req.body.reg_no,        30).toUpperCase();
        const full_name     = sanitiseStr(req.body.full_name,     100);
        const college       = sanitiseStr(req.body.college,        20).toUpperCase();
        const course        = sanitiseStr(req.body.course,        120);
        const raw_year      = req.body.year_of_study;
        const phone         = sanitiseStr(req.body.phone,          20);
        const email         = sanitiseStr(req.body.email || '',   150).toLowerCase();

        // Required fields
        if (!reg_no || !full_name || !college || !course || !phone) {
            return res.status(400).json({ error: 'reg_no, full_name, college, course, and phone are required.' });
        }
        if (raw_year === undefined || raw_year === null || raw_year === '') {
            return res.status(400).json({ error: 'year_of_study is required.' });
        }

        // Format validation
        if (!validRegNo(reg_no)) {
            return res.status(400).json({ error: 'Invalid registration number format.' });
        }
        if (!COLLEGES.includes(college)) {
            return res.status(400).json({ error: `College must be one of: ${COLLEGES.join(', ')}.` });
        }

        const year_of_study = Number(raw_year);
        if (!Number.isInteger(year_of_study) || year_of_study < 1 || year_of_study > 6) {
            return res.status(400).json({ error: 'year_of_study must be a whole number between 1 and 6.' });
        }

        const normPhone = normalisePhone(phone);
        if (!normPhone) {
            return res.status(400).json({ error: 'Invalid phone number. Use format 07XXXXXXXX or +254XXXXXXXXX.' });
        }

        // Email: if provided, must be a JKUAT student email
        if (email) {
            if (!validJkuatEmail(email)) {
                return res.status(400).json({
                    error: `Only JKUAT student emails are accepted (e.g. jm001@students.jkuat.ac.ke).`
                });
            }
        }

        const { error: memberErr } = await supabaseAdmin
            .from('members')
            .insert({ reg_no, full_name, college, course, year_of_study, phone: normPhone, email: email || null });

        if (memberErr) {
            if (memberErr.code === '23505') {
                return res.status(409).json({
                    error: 'This registration number is already registered. Use "Pay Membership Fee" to pay.',
                });
            }
            throw memberErr;
        }

        return res.status(201).json({
            success: true,
            message: 'Registration successful! You can now pay your membership fee.',
        });

    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// ── POST /api/v1/membership/pay ───────────────────────────────────────────────
router.post('/pay',   payHandler('Pay'));

// ── POST /api/v1/membership/renew — alias for /pay ───────────────────────────
router.post('/renew', payHandler('Renew'));

// ── POST /api/v1/membership/webhook ──────────────────────────────────────────
router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.LIPANA_WEBHOOK_SECRET;

        if (!secret) {
            console.error('LIPANA_WEBHOOK_SECRET is not set — rejecting webhook');
            return res.status(500).json({ error: 'Webhook secret not configured.' });
        }

        const sig = req.headers['x-lipana-signature'] || req.headers['x-webhook-signature'] || '';
        if (!safeEqual(sig, secret)) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }

        const { checkout_request_id, result_code, mpesa_receipt_number } = req.body;

        if (!checkout_request_id) {
            return res.status(400).json({ error: 'Missing checkout_request_id.' });
        }

        const isSuccess = result_code === 0 || result_code === '0';

        const { error, count } = await supabaseAdmin
            .from('membership_payments')
            .update({
                status:       isSuccess ? 'completed' : 'failed',
                mpesa_ref:    mpesa_receipt_number || null,
                completed_at: isSuccess ? new Date().toISOString() : null,
            })
            .eq('checkout_id', checkout_request_id);

        if (error) throw error;

        // Log if no row was matched — helps diagnose duplicate/stale callbacks
        if (count === 0) {
            console.warn('Webhook: no payment row matched checkout_id', checkout_request_id);
        }

        return res.status(200).json({ received: true });

    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(500).json({ error: 'Webhook processing failed.' });
    }
});

// ── GET /api/v1/membership/lookup/:reg_no ────────────────────────────────────
router.get('/lookup/:reg_no', async (req, res) => {
    try {
        const reg_no = sanitiseStr(req.params.reg_no, 30).toUpperCase();
        if (!validRegNo(reg_no)) {
            return res.status(400).json({ found: false });
        }

        const { data: member } = await supabaseAdmin
            .from('members')
            .select('full_name, course')
            .eq('reg_no', reg_no)
            .maybeSingle();

        if (!member) {
            return res.status(404).json({ found: false });
        }

        const semester = currentSemester();
        const { data: paid } = await supabaseAdmin
            .from('membership_payments')
            .select('id')
            .eq('reg_no', reg_no)
            .eq('semester', semester)
            .eq('status', 'completed')
            .maybeSingle();

        const firstName = member.full_name.split(' ')[0];
        return res.json({
            found:        true,
            display:      `${firstName} · ${member.course}`,
            paid_current: !!paid,
            semester,
        });

    } catch (err) {
        console.error('Lookup error:', err);
        return res.status(500).json({ error: 'Lookup failed.' });
    }
});

module.exports = router;
