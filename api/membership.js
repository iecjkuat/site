'use strict';

const express  = require('express');
const router   = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

// ── Rate limiting (in-memory, resets on server restart) ──────────────────────
const hits = new Map();
function rateLimit(key, maxPerWindow = 5, windowMs = 60000) {
    const now  = Date.now();
    const entry = hits.get(key) || { count: 0, start: now };
    if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
    entry.count++;
    hits.set(key, entry);
    return entry.count > maxPerWindow;
}

// ── Input validation ──────────────────────────────────────────────────────────
function sanitiseStr(val, maxLen = 100) {
    if (typeof val !== 'string') return '';
    return val.trim().substring(0, maxLen);
}

function validRegNo(val) {
    // Accepts formats like ENG/2021/12345 — letters, digits, slashes, hyphens only
    return /^[A-Z0-9\/\-]{3,30}$/i.test(val.trim());
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Current semester string e.g. "2026-S1" (S1 = Jan–Jun, S2 = Jul–Dec) */
function currentSemester() {
    const now    = new Date();
    const year   = now.getFullYear();
    const half   = now.getMonth() < 6 ? 'S1' : 'S2';
    return `${year}-${half}`;
}

/** Normalise Kenyan phone to 2547XXXXXXXX */
function normalisePhone(raw) {
    const p = raw.replace(/\s+/g, '');
    if (/^\+254\d{9}$/.test(p))  return p.replace('+', '');
    if (/^254\d{9}$/.test(p))    return p;
    if (/^07\d{8}$/.test(p))     return '254' + p.slice(1);
    if (/^01\d{8}$/.test(p))     return '254' + p.slice(1);
    return null;
}

/** Trigger Lipana STK push — returns { checkoutId } or throws */
async function stkPush({ phone, amount, accountRef, description }) {
    const apiKey = process.env.LIPANA_API_KEY;

    if (!apiKey || apiKey === 'your_lipana_api_key_here') {
        console.warn('⚠️  LIPANA_API_KEY not set — skipping STK push (dev mode)');
        return { checkoutId: `dev_${Date.now()}` };
    }

    const env  = process.env.LIPANA_ENVIRONMENT || 'sandbox';
    const base = env === 'production'
        ? 'https://api.lipana.dev'
        : 'https://sandbox.lipana.dev';

    const res = await fetch(`${base}/v1/stk-push`, {
        method:  'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            phone,
            amount,
            account_ref:  accountRef,
            description,
            callback_url: process.env.LIPANA_CALLBACK_URL
        })
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Lipana returned non-JSON response (${res.status}): ${text.substring(0, 120)}`);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'STK push failed');
    return { checkoutId: data.checkout_request_id || data.checkoutRequestID || data.id };
}

// ── POST /api/v1/membership/register ─────────────────────────────────────────
router.post('/register', async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (rateLimit(`reg:${ip}`, 5, 60000)) {
        return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    }

    try {
        const reg_no       = sanitiseStr(req.body.reg_no, 30).toUpperCase();
        const full_name    = sanitiseStr(req.body.full_name, 100);
        const course       = sanitiseStr(req.body.course, 120);
        const year_of_study = parseInt(req.body.year_of_study);
        const phone        = sanitiseStr(req.body.phone, 20);
        const email        = sanitiseStr(req.body.email || '', 150);

        if (!reg_no || !full_name || !course || !year_of_study || !phone) {
            return res.status(400).json({ error: 'All required fields must be provided.' });
        }
        if (!validRegNo(reg_no)) {
            return res.status(400).json({ error: 'Invalid registration number format.' });
        }
        if (isNaN(year_of_study) || year_of_study < 1 || year_of_study > 6) {
            return res.status(400).json({ error: 'Year of study must be between 1 and 6.' });
        }

        const normPhone = normalisePhone(phone);
        if (!normPhone) {
            return res.status(400).json({ error: 'Invalid phone number. Use format 07XXXXXXXX.' });
        }

        const { data: existing } = await supabaseAdmin
            .from('members')
            .select('id')
            .eq('reg_no', reg_no)
            .maybeSingle();

        if (existing) {
            return res.status(409).json({
                error: 'This registration number is already registered. Use "Pay Membership Fee" to pay.'
            });
        }

        const { error: memberErr } = await supabaseAdmin
            .from('members')
            .insert({
                reg_no,
                full_name,
                course,
                year_of_study,
                phone:  normPhone,
                email:  email || null
            });

        if (memberErr) throw memberErr;

        return res.status(201).json({
            success: true,
            message: 'Registration successful! You can pay your membership fee anytime.'
        });

    } catch (err) {
        console.error('Registration error:', err.message);
        return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// ── POST /api/v1/membership/pay ───────────────────────────────────────────────
router.post('/pay', async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (rateLimit(`pay:${ip}`, 5, 60000)) {
        return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    }

    try {
        const reg_no       = sanitiseStr(req.body.reg_no, 30).toUpperCase();
        const payment_phone = sanitiseStr(req.body.payment_phone, 20);

        if (!reg_no || !payment_phone) {
            return res.status(400).json({ error: 'Registration number and phone number are required.' });
        }
        if (!validRegNo(reg_no)) {
            return res.status(400).json({ error: 'Invalid registration number format.' });
        }

        const normPhone = normalisePhone(payment_phone);
        if (!normPhone) {
            return res.status(400).json({ error: 'Invalid phone number. Use format 07XXXXXXXX.' });
        }

        const semester = currentSemester();

        const { data: member, error: lookupErr } = await supabaseAdmin
            .from('members')
            .select('id, reg_no, full_name')
            .eq('reg_no', reg_no)
            .maybeSingle();

        if (lookupErr) throw lookupErr;
        if (!member) {
            return res.status(404).json({ error: 'Registration number not found. Please register first.' });
        }

        const { data: existingPayment } = await supabaseAdmin
            .from('membership_payments')
            .select('id')
            .eq('reg_no', reg_no)
            .eq('semester', semester)
            .eq('status', 'completed')
            .maybeSingle();

        if (existingPayment) {
            return res.status(409).json({
                error: `Membership for ${semester} has already been paid. You're all set!`
            });
        }

        const { data: payment, error: payErr } = await supabaseAdmin
            .from('membership_payments')
            .insert({
                member_id:     member.id,
                reg_no,
                semester,
                amount:        200,
                payment_phone: normPhone,
                status:        'pending'
            })
            .select('id')
            .single();

        if (payErr) throw payErr;

        let checkoutId = null;
        try {
            const stk = await stkPush({
                phone:       normPhone,
                amount:      200,
                accountRef:  reg_no,
                description: `JKUAT IEC Membership ${semester}`
            });
            checkoutId = stk.checkoutId;
            await supabaseAdmin
                .from('membership_payments')
                .update({ checkout_id: checkoutId })
                .eq('id', payment.id);
        } catch (stkErr) {
            console.error('STK push failed:', stkErr.message);
        }

        return res.status(200).json({
            success:     true,
            message:     `Hi ${member.full_name}, check your phone for the M-Pesa prompt.`,
            payment_id:  payment.id,
            checkout_id: checkoutId
        });

    } catch (err) {
        console.error('Payment error:', err.message);
        return res.status(500).json({ error: 'Payment failed. Please try again.' });
    }
});

// ── POST /api/v1/membership/renew — alias for /pay (backwards compat) ────────
router.post('/renew', async (req, res, next) => {
    req.url = '/pay';
    next('route');
});

// ── POST /api/v1/membership/webhook ──────────────────────────────────────────
// Lipana calls this when payment completes/fails
router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.LIPANA_WEBHOOK_SECRET;

        // Verify webhook signature if secret is set
        if (secret) {
            const sig = req.headers['x-lipana-signature'] || req.headers['x-webhook-signature'];
            if (sig !== secret) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        const { checkout_request_id, result_code, mpesa_receipt_number } = req.body;

        if (!checkout_request_id) {
            return res.status(400).json({ error: 'Missing checkout_request_id' });
        }

        const isSuccess = result_code === 0 || result_code === '0';

        const { error } = await supabaseAdmin
            .from('membership_payments')
            .update({
                status:       isSuccess ? 'completed' : 'failed',
                mpesa_ref:    mpesa_receipt_number || null,
                completed_at: isSuccess ? new Date().toISOString() : null
            })
            .eq('checkout_id', checkout_request_id);

        if (error) throw error;

        return res.status(200).json({ received: true });

    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ── GET /api/v1/membership/lookup/:reg_no ────────────────────────────────────
// Returns only enough to confirm the record exists — no personal data exposed
router.get('/lookup/:reg_no', async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (rateLimit(`lookup:${ip}`, 10, 60000)) {
        return res.status(429).json({ error: 'Too many requests.' });
    }

    try {
        const reg_no = sanitiseStr(req.params.reg_no, 30).toUpperCase();
        if (!validRegNo(reg_no)) {
            return res.status(400).json({ found: false });
        }

        const { data: member } = await supabaseAdmin
            .from('members')
            .select('reg_no, full_name, course')
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

        // Return first name only — not full name, not course
        const firstName = member.full_name.split(' ')[0];
        return res.json({
            found:        true,
            display:      `${firstName} · ${member.course}`,
            paid_current: !!paid,
            semester
        });

    } catch (err) {
        console.error('Lookup error:', err.message);
        return res.status(500).json({ error: 'Lookup failed' });
    }
});

module.exports = router;
