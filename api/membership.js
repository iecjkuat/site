'use strict';

const express  = require('express');
const router   = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

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
// First-time registration — saves details only, no payment
router.post('/register', async (req, res) => {
    try {
        const { reg_no, full_name, course, year_of_study, phone, email } = req.body;

        if (!reg_no || !full_name || !course || !year_of_study || !phone) {
            return res.status(400).json({ error: 'All required fields must be provided.' });
        }

        const normPhone = normalisePhone(phone);
        if (!normPhone) {
            return res.status(400).json({ error: 'Invalid phone number. Use format 07XXXXXXXX.' });
        }

        // Check if reg_no already exists
        const { data: existing } = await supabaseAdmin
            .from('members')
            .select('id')
            .eq('reg_no', reg_no.trim().toUpperCase())
            .maybeSingle();

        if (existing) {
            return res.status(409).json({
                error: 'This registration number is already registered. Use "Pay Membership Fee" to pay.'
            });
        }

        // Insert member record only — no payment yet
        const { error: memberErr } = await supabaseAdmin
            .from('members')
            .insert({
                reg_no:        reg_no.trim().toUpperCase(),
                full_name:     full_name.trim(),
                course:        course.trim(),
                year_of_study: parseInt(year_of_study),
                phone:         normPhone,
                email:         email?.trim() || null
            });

        if (memberErr) throw memberErr;

        return res.status(201).json({
            success: true,
            message: 'Registration successful! You can pay your membership fee anytime.'
        });

    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// ── POST /api/v1/membership/pay ───────────────────────────────────────────────
// Pay membership fee — works for any registered member
router.post('/pay', async (req, res) => {
    try {
        const { reg_no, payment_phone } = req.body;

        if (!reg_no || !payment_phone) {
            return res.status(400).json({ error: 'Registration number and phone number are required.' });
        }

        const normPhone = normalisePhone(payment_phone);
        if (!normPhone) {
            return res.status(400).json({ error: 'Invalid phone number. Use format 07XXXXXXXX.' });
        }

        const semester = currentSemester();

        // Look up member
        const { data: member, error: lookupErr } = await supabaseAdmin
            .from('members')
            .select('id, reg_no, full_name')
            .eq('reg_no', reg_no.trim().toUpperCase())
            .maybeSingle();

        if (lookupErr) throw lookupErr;

        if (!member) {
            return res.status(404).json({
                error: 'Registration number not found. Please register first.'
            });
        }

        // Check if already paid this semester
        const { data: existingPayment } = await supabaseAdmin
            .from('membership_payments')
            .select('id')
            .eq('reg_no', reg_no.trim().toUpperCase())
            .eq('semester', semester)
            .eq('status', 'completed')
            .maybeSingle();

        if (existingPayment) {
            return res.status(409).json({
                error: `Membership for ${semester} has already been paid. You're all set!`
            });
        }

        // Insert pending payment
        const { data: payment, error: payErr } = await supabaseAdmin
            .from('membership_payments')
            .insert({
                member_id:     member.id,
                reg_no:        reg_no.trim().toUpperCase(),
                semester,
                amount:        200,
                payment_phone: normPhone,
                status:        'pending'
            })
            .select('id')
            .single();

        if (payErr) throw payErr;

        // Trigger STK push
        let checkoutId = null;
        try {
            const stk = await stkPush({
                phone:       normPhone,
                amount:      200,
                accountRef:  reg_no.trim().toUpperCase(),
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
        console.error('Payment error:', err);
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
// Check if a reg_no exists (used by renewal form to confirm before showing payment field)
router.get('/lookup/:reg_no', async (req, res) => {
    try {
        const { data: member } = await supabaseAdmin
            .from('members')
            .select('reg_no, full_name, course, year_of_study')
            .eq('reg_no', req.params.reg_no.trim().toUpperCase())
            .maybeSingle();

        if (!member) {
            return res.status(404).json({ found: false });
        }

        const semester = currentSemester();
        const { data: paid } = await supabaseAdmin
            .from('membership_payments')
            .select('id')
            .eq('reg_no', req.params.reg_no.trim().toUpperCase())
            .eq('semester', semester)
            .eq('status', 'completed')
            .maybeSingle();

        return res.json({
            found:        true,
            full_name:    member.full_name,
            course:       member.course,
            paid_current: !!paid,
            semester
        });

    } catch (err) {
        console.error('Lookup error:', err);
        return res.status(500).json({ error: 'Lookup failed' });
    }
});

module.exports = router;
