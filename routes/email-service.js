/**
 * Email Service Routes
 * Handles email notifications and reminders
 */

const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// Email transporter configuration
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production email service (e.g., SendGrid, Mailgun)
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Development - use Ethereal for testing
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'ethereal.user@ethereal.email',
                pass: 'ethereal.pass'
            }
        });
    }
};

// Send event registration confirmation
router.post('/registration-confirmation', [
    body('userId').isUUID().withMessage('Valid user ID required'),
    body('eventId').isUUID().withMessage('Valid event ID required'),
    body('registrationId').isUUID().withMessage('Valid registration ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, eventId, registrationId } = req.body;

        // Get user and event details
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', userId)
            .single();

        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('title, start_date, end_date, location, venue_details, fee')
            .eq('id', eventId)
            .single();

        if (userError || eventError || !user || !event) {
            return res.status(404).json({ message: 'User or event not found' });
        }

        // Create email content
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                    .event-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Registration Confirmed!</h1>
                        <p>JKUAT Innovation and Entrepreneurship Club</p>
                    </div>
                    <div class="content">
                        <p>Dear ${user.name},</p>
                        <p>Your registration for <strong>${event.title}</strong> has been confirmed!</p>
                        
                        <div class="event-details">
                            <h3>📅 Event Details</h3>
                            <p><strong>Event:</strong> ${event.title}</p>
                            <p><strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                            <p><strong>Time:</strong> ${new Date(event.start_date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                            })} - ${new Date(event.end_date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                            })}</p>
                            <p><strong>Location:</strong> ${event.location}</p>
                            ${event.venue_details ? `<p><strong>Venue Details:</strong> ${event.venue_details}</p>` : ''}
                            <p><strong>Registration Fee:</strong> ${event.fee > 0 ? `KES ${event.fee.toLocaleString()}` : 'Free for members'}</p>
                            <p><strong>Registration ID:</strong> ${registrationId}</p>
                        </div>
                        
                        <p><strong>What to bring:</strong></p>
                        <ul>
                            <li>Valid student ID</li>
                            <li>This confirmation email (digital or printed)</li>
                            <li>Notebook and pen for taking notes</li>
                            ${event.fee > 0 ? '<li>Payment receipt (if not paid online)</li>' : ''}
                        </ul>
                        
                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>Please arrive 15 minutes before the event starts</li>
                            <li>Bring your QR code (available in your dashboard) for quick check-in</li>
                            <li>Contact us if you need to cancel your registration</li>
                        </ul>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events" class="btn">View Event Details</a>
                        
                        <p>We're excited to see you at the event!</p>
                        <p>Best regards,<br>JKUAT Innovation and Entrepreneurship Club</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                        <p>If you have any questions, contact us at innovation@jkuat.ac.ke</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@jkuat.ac.ke>',
            to: user.email,
            subject: `Registration Confirmed: ${event.title}`,
            html: emailHtml
        };

        await transporter.sendMail(mailOptions);

        // Log email sent
        console.log(`Registration confirmation email sent to ${user.email} for event ${event.title}`);

        res.json({
            message: 'Registration confirmation email sent successfully',
            recipient: user.email,
            eventTitle: event.title
        });

    } catch (error) {
        console.error('Error sending registration confirmation:', error);
        res.status(500).json({ message: 'Failed to send confirmation email' });
    }
});

// Send event reminders
router.post('/send-reminders', [
    body('eventId').isUUID().withMessage('Valid event ID required'),
    body('reminderType').isIn(['24h', '1h', 'now']).withMessage('Invalid reminder type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId, reminderType } = req.body;

        // Get event details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('title, start_date, location')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Get registered attendees
        const { data: attendees, error: attendeesError } = await supabase
            .from('event_attendees')
            .select(`
                users:user_id(name, email)
            `)
            .eq('event_id', eventId)
            .eq('attendance_status', 'registered');

        if (attendeesError) {
            return res.status(500).json({ message: 'Failed to fetch attendees' });
        }

        const reminderMessages = {
            '24h': {
                subject: `Reminder: ${event.title} - Tomorrow`,
                message: 'Your event is tomorrow! Don\'t forget to attend.'
            },
            '1h': {
                subject: `Starting Soon: ${event.title} - 1 Hour`,
                message: 'Your event starts in 1 hour. Please make your way to the venue.'
            },
            'now': {
                subject: `Starting Now: ${event.title}`,
                message: 'Your event is starting now! Please check in at the venue.'
            }
        };

        const reminder = reminderMessages[reminderType];
        const transporter = createTransporter();
        let sentCount = 0;

        // Send reminders to all attendees
        for (const attendee of attendees) {
            if (attendee.users && attendee.users.email) {
                const mailOptions = {
                    from: process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@jkuat.ac.ke>',
                    to: attendee.users.email,
                    subject: reminder.subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #10b981;">📅 Event Reminder</h2>
                            <p>Dear ${attendee.users.name},</p>
                            <p>${reminder.message}</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <h3>${event.title}</h3>
                                <p><strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString()}</p>
                                <p><strong>Time:</strong> ${new Date(event.start_date).toLocaleTimeString()}</p>
                                <p><strong>Location:</strong> ${event.location}</p>
                            </div>
                            <p>See you there!</p>
                            <p>Best regards,<br>JKUAT Innovation Club</p>
                        </div>
                    `
                };

                try {
                    await transporter.sendMail(mailOptions);
                    sentCount++;
                } catch (emailError) {
                    console.error(`Failed to send reminder to ${attendee.users.email}:`, emailError);
                }
            }
        }

        res.json({
            message: 'Event reminders sent successfully',
            sentCount,
            totalAttendees: attendees.length,
            reminderType
        });

    } catch (error) {
        console.error('Error sending event reminders:', error);
        res.status(500).json({ message: 'Failed to send reminders' });
    }
});

// Send event updates/notifications
router.post('/event-update', [
    body('eventId').isUUID().withMessage('Valid event ID required'),
    body('updateType').isIn(['update', 'cancellation', 'postponement']).withMessage('Invalid update type'),
    body('message').notEmpty().withMessage('Update message required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId, updateType, message, newDate } = req.body;

        // Get event and attendees
        const { data: event } = await supabase
            .from('events')
            .select('title')
            .eq('id', eventId)
            .single();

        const { data: attendees } = await supabase
            .from('event_attendees')
            .select(`users:user_id(name, email)`)
            .eq('event_id', eventId);

        const updateTitles = {
            'update': `Update: ${event.title}`,
            'cancellation': `CANCELLED: ${event.title}`,
            'postponement': `POSTPONED: ${event.title}`
        };

        const transporter = createTransporter();
        let sentCount = 0;

        for (const attendee of attendees) {
            if (attendee.users && attendee.users.email) {
                const mailOptions = {
                    from: process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@jkuat.ac.ke>',
                    to: attendee.users.email,
                    subject: updateTitles[updateType],
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: ${updateType === 'cancellation' ? '#ef4444' : '#f59e0b'};">
                                📢 Event ${updateType.charAt(0).toUpperCase() + updateType.slice(1)}
                            </h2>
                            <p>Dear ${attendee.users.name},</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <h3>${event.title}</h3>
                                <p>${message}</p>
                                ${newDate ? `<p><strong>New Date:</strong> ${new Date(newDate).toLocaleDateString()}</p>` : ''}
                            </div>
                            <p>We apologize for any inconvenience caused.</p>
                            <p>Best regards,<br>JKUAT Innovation Club</p>
                        </div>
                    `
                };

                try {
                    await transporter.sendMail(mailOptions);
                    sentCount++;
                } catch (emailError) {
                    console.error(`Failed to send update to ${attendee.users.email}:`, emailError);
                }
            }
        }

        res.json({
            message: 'Event update notifications sent successfully',
            sentCount,
            updateType
        });

    } catch (error) {
        console.error('Error sending event updates:', error);
        res.status(500).json({ message: 'Failed to send event updates' });
    }
});

module.exports = router;