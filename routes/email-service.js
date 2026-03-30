/**
 * Email Service - powered by Resend
 */

const express = require('express');
const { Resend } = require('resend');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');

const router = express.Router();

// Initialise Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@iecjkuat.com>';
const SITE = process.env.FRONTEND_URL || 'https://iecjkuat.com';

/* ─── helpers ─────────────────────────────────────────────── */

function baseTemplate(title, bodyHtml) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body{font-family:Arial,sans-serif;background:#0f172a;color:#f9fafb;margin:0;padding:0}
      .wrap{max-width:600px;margin:40px auto;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden}
      .hdr{background:linear-gradient(135deg,#10b981,#059669);padding:28px 32px}
      .hdr h1{margin:0;font-size:1.5rem;color:#fff}
      .hdr p{margin:4px 0 0;color:rgba(255,255,255,.85);font-size:.9rem}
      .body{padding:32px}
      .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:20px;margin:20px 0}
      .btn{display:inline-block;background:#10b981;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;margin-top:16px}
      .ftr{text-align:center;padding:20px;color:rgba(255,255,255,.4);font-size:.8rem;border-top:1px solid rgba(255,255,255,.08)}
    </style></head><body>
    <div class="wrap">
      <div class="hdr"><h1>${title}</h1><p>JKUAT Innovation &amp; Entrepreneurship Club</p></div>
      <div class="body">${bodyHtml}</div>
      <div class="ftr">© 2025 JKUAT Innovation Club · <a href="mailto:info@iecjkuat.com" style="color:#10b981">info@iecjkuat.com</a></div>
    </div></body></html>`;
}

async function sendEmail(to, subject, html) {
    if (!resend) throw new Error('Email service not configured — set RESEND_API_KEY');
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw new Error(error.message);
    return data;
}

/* ─── welcome / signup confirmation ───────────────────────── */

router.post('/welcome', async (req, res) => {
    try {
        const { userId } = req.body;
        const { data: user } = await supabase.from('users').select('name,email').eq('id', userId).single();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const html = baseTemplate('Welcome to the Club! 🎉', `
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Welcome to the JKUAT Innovation &amp; Entrepreneurship Club! We're thrilled to have you.</p>
            <div class="card">
                <p>✅ Your account is active</p>
                <p>🚀 Explore projects, events, and ideas</p>
                <p>💡 Submit your first idea</p>
            </div>
            <a href="${SITE}/dashboard" class="btn">Go to Dashboard</a>
        `);

        await sendEmail(user.email, 'Welcome to JKUAT Innovation Club!', html);
        res.json({ message: 'Welcome email sent', recipient: user.email });
    } catch (err) {
        console.error('Welcome email error:', err);
        res.status(500).json({ message: 'Failed to send welcome email', error: err.message });
    }
});

/* ─── event registration confirmation ─────────────────────── */

router.post('/registration-confirmation', [
    body('userId').isUUID(),
    body('eventId').isUUID(),
    body('registrationId').isUUID()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { userId, eventId, registrationId } = req.body;

        const [{ data: user }, { data: event }] = await Promise.all([
            supabase.from('users').select('name,email').eq('id', userId).single(),
            supabase.from('events').select('title,start_date,end_date,location,fee').eq('id', eventId).single()
        ]);

        if (!user || !event) return res.status(404).json({ message: 'User or event not found' });

        const dateStr = new Date(event.start_date).toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
        const timeStr = new Date(event.start_date).toLocaleTimeString('en-KE', { hour:'2-digit', minute:'2-digit' });

        const html = baseTemplate('Registration Confirmed! 🎉', `
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your registration for <strong>${event.title}</strong> is confirmed.</p>
            <div class="card">
                <p>📅 <strong>Date:</strong> ${dateStr}</p>
                <p>🕐 <strong>Time:</strong> ${timeStr}</p>
                <p>📍 <strong>Location:</strong> ${event.location}</p>
                <p>💳 <strong>Fee:</strong> ${event.fee > 0 ? `KES ${event.fee.toLocaleString()}` : 'Free'}</p>
                <p>🔖 <strong>Registration ID:</strong> ${registrationId}</p>
            </div>
            <a href="${SITE}/events" class="btn">View Event</a>
        `);

        await sendEmail(user.email, `Registration Confirmed: ${event.title}`, html);
        res.json({ message: 'Confirmation email sent', recipient: user.email });
    } catch (err) {
        console.error('Registration confirmation error:', err);
        res.status(500).json({ message: 'Failed to send confirmation email', error: err.message });
    }
});

/* ─── event reminders ──────────────────────────────────────── */

router.post('/send-reminders', [
    body('eventId').isUUID(),
    body('reminderType').isIn(['24h', '1h', 'now'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { eventId, reminderType } = req.body;
        const { data: event } = await supabase.from('events').select('title,start_date,location').eq('id', eventId).single();
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const { data: attendees } = await supabase
            .from('event_attendees')
            .select('users:user_id(name,email)')
            .eq('event_id', eventId)
            .eq('attendance_status', 'registered');

        const labels = { '24h': 'Tomorrow', '1h': 'In 1 Hour', 'now': 'Starting Now' };
        const subject = `${labels[reminderType]}: ${event.title}`;
        let sentCount = 0;

        for (const a of (attendees || [])) {
            if (!a.users?.email) continue;
            const html = baseTemplate(`Event Reminder — ${labels[reminderType]}`, `
                <p>Hi <strong>${a.users.name}</strong>,</p>
                <p>Your event is <strong>${labels[reminderType].toLowerCase()}</strong>!</p>
                <div class="card">
                    <p>📅 <strong>${event.title}</strong></p>
                    <p>🕐 ${new Date(event.start_date).toLocaleString('en-KE')}</p>
                    <p>📍 ${event.location}</p>
                </div>
                <a href="${SITE}/events" class="btn">View Event</a>
            `);
            try { await sendEmail(a.users.email, subject, html); sentCount++; } catch (e) { console.error(e); }
        }

        res.json({ message: 'Reminders sent', sentCount, total: attendees?.length || 0 });
    } catch (err) {
        console.error('Reminder error:', err);
        res.status(500).json({ message: 'Failed to send reminders', error: err.message });
    }
});

/* ─── test endpoint ────────────────────────────────────────── */

router.post('/test', async (req, res) => {
    try {
        const { to } = req.body;
        if (!to) return res.status(400).json({ message: 'Recipient email required' });

        const html = baseTemplate('Test Email ✅', `
            <p>This is a test email from your JKUAT Innovation Club platform.</p>
            <p>If you received this, your Resend integration is working correctly! 🎉</p>
            <a href="${SITE}" class="btn">Visit Website</a>
        `);

        await sendEmail(to, 'Test Email — JKUAT Innovation Club', html);
        res.json({ message: 'Test email sent successfully', recipient: to });
    } catch (err) {
        console.error('Test email error:', err);
        res.status(500).json({ message: 'Failed to send test email', error: err.message });
    }
});

/* ─── bulk announcement ────────────────────────────────────── */

router.post('/announcement', async (req, res) => {
    try {
        const { subject, body } = req.body;
        if (!subject || !body) return res.status(400).json({ message: 'Subject and body required' });

        const { data: users } = await supabase
            .from('users')
            .select('name,email')
            .eq('membership_status', 'active');

        if (!users?.length) return res.status(404).json({ message: 'No active members found' });

        const html = baseTemplate(subject, `
            <p>${body.replace(/\n/g, '<br>')}</p>
            <a href="${SITE}" class="btn">Visit Website</a>
        `);

        let sentCount = 0;
        for (const user of users) {
            try {
                await sendEmail(user.email, subject, html);
                sentCount++;
            } catch (e) {
                console.error(`Failed to send to ${user.email}:`, e.message);
            }
        }

        res.json({ message: 'Announcement sent', sentCount, total: users.length });
    } catch (err) {
        console.error('Announcement error:', err);
        res.status(500).json({ message: 'Failed to send announcement', error: err.message });
    }
});

module.exports = router;
