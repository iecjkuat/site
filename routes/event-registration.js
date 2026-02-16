const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

/**
 * Generate unique QR code data for event registration
 */
function generateQRCode(eventId, userId, registrationId) {
    const data = {
        event_id: eventId,
        user_id: userId,
        registration_id: registrationId,
        timestamp: Date.now()
    };
    
    // Create a secure hash
    const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex')
        .substring(0, 16);
    
    // Encode as base64 for QR code
    const qrData = Buffer.from(JSON.stringify({
        ...data,
        hash
    })).toString('base64');
    
    return qrData;
}

/**
 * Verify QR code data
 */
function verifyQRCode(qrData) {
    try {
        const decoded = JSON.parse(Buffer.from(qrData, 'base64').toString());
        
        // Verify hash
        const { hash, ...data } = decoded;
        const expectedHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex')
            .substring(0, 16);
        
        if (hash !== expectedHash) {
            return { valid: false, error: 'Invalid QR code' };
        }
        
        return { valid: true, data: decoded };
    } catch (error) {
        return { valid: false, error: 'Invalid QR code format' };
    }
}

/**
 * Register for an event
 * POST /api/v1/events/:eventId/register
 */
router.post('/:eventId/register', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.id;
        const { notes } = req.body;

        console.log('📝 Event registration request:', {
            eventId,
            userId,
            userObject: req.user,
            hasAuth: !!req.user
        });

        if (!userId) {
            console.error('❌ No user ID found in request');
            return res.status(400).json({ message: 'User authentication failed - no user ID' });
        }

        // Check if event exists and is open for registration
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            console.error('❌ Event not found:', eventError);
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if event has already started (registration closes when event starts)
        const now = new Date();
        const eventStartDate = new Date(event.start_date);
        
        console.log('⏰ Registration time check:', {
            currentTime: now.toISOString(),
            eventStartTime: eventStartDate.toISOString(),
            eventHasStarted: now >= eventStartDate,
            eventStatus: event.status
        });
        
        if (now >= eventStartDate) {
            console.log('❌ Registration closed - event has started');
            return res.status(400).json({ 
                message: 'Registration is closed. This event has already started.',
                reason: 'event_started'
            });
        }

        console.log('✅ Registration is open - event has not started yet');

        // Optional: Check registration deadline if it exists (for early bird cutoffs, etc.)
        // But don't use it as the primary check - event start date is the main cutoff
        if (event.registration_deadline) {
            const deadline = new Date(event.registration_deadline);
            if (now > deadline && deadline < eventStartDate) {
                // Only enforce if deadline is before event start (early bird scenario)
                return res.status(400).json({ 
                    message: 'Early registration deadline has passed.',
                    reason: 'deadline_passed'
                });
            }
        }

        // Check if event is full
        if (event.max_attendees) {
            const { count } = await supabase
                .from('event_attendees')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', eventId)
                .in('registration_status', ['confirmed', 'pending']);

            if (count >= event.max_attendees) {
                // Add to waitlist
                const { data: registration, error: regError } = await supabase
                    .from('event_attendees')
                    .insert([{
                        event_id: eventId,
                        user_id: userId,
                        registration_status: 'waitlisted',
                        payment_status: event.fee > 0 ? 'pending' : 'waived',
                        notes
                    }])
                    .select()
                    .single();

                if (regError) {
                    if (regError.code === '23505') { // Unique constraint violation
                        return res.status(400).json({ message: 'You are already registered for this event' });
                    }
                    throw regError;
                }

                return res.status(200).json({
                    message: 'Event is full. You have been added to the waitlist.',
                    registration,
                    waitlisted: true
                });
            }
        }

        // Create registration
        const registrationData = {
            event_id: eventId,
            user_id: userId,
            registration_status: event.fee > 0 ? 'pending' : 'confirmed',
            payment_status: event.fee > 0 ? 'pending' : 'waived',
            notes
        };

        const { data: registration, error: regError } = await supabase
            .from('event_attendees')
            .insert([registrationData])
            .select()
            .single();

        if (regError) {
            if (regError.code === '23505') {
                return res.status(400).json({ message: 'You are already registered for this event' });
            }
            throw regError;
        }

        // Generate QR code
        const qrCode = generateQRCode(eventId, userId, registration.id);

        // Update registration with QR code
        const { data: updatedRegistration, error: updateError } = await supabase
            .from('event_attendees')
            .update({ qr_code: qrCode })
            .eq('id', registration.id)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Error updating registration with QR code:', updateError);
            throw updateError;
        }

        // Update event attendee count
        console.log('📊 Incrementing attendee count for event:', eventId);
        const { error: rpcError } = await supabase.rpc('increment_event_attendees', { event_id: eventId });
        
        if (rpcError) {
            console.error('❌ Error incrementing attendee count:', rpcError);
            // Don't throw - registration is already created, just log the error
        }

        console.log('✅ Registration successful:', updatedRegistration.id);

        res.status(201).json({
            message: event.fee > 0 
                ? 'Registration pending payment. Please complete payment to confirm.' 
                : 'Successfully registered for event',
            registration: updatedRegistration,
            requiresPayment: event.fee > 0,
            amount: event.fee
        });
    } catch (error) {
        console.error('❌ Error registering for event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Get user's registration for an event
 * GET /api/v1/events/:eventId/registration
 */
router.get('/:eventId/registration', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        const { data: registration, error } = await supabase
            .from('event_attendees')
            .select(`
                *,
                event:events(id, title, start_date, end_date, location, fee)
            `)
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (error || !registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json({ registration });
    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all user's event registrations
 * GET /api/v1/events/registrations/my
 */
router.get('/registrations/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let query = supabase
            .from('event_attendees')
            .select(`
                *,
                event:events(*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('registration_status', status);
        }

        const { data: registrations, error } = await query;

        if (error) throw error;

        res.json({ registrations });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Cancel registration
 * DELETE /api/v1/events/:eventId/registration
 */
router.delete('/:eventId/registration', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        // Get registration
        const { data: registration, error: fetchError } = await supabase
            .from('event_attendees')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check if event has started
        const { data: event } = await supabase
            .from('events')
            .select('start_date')
            .eq('id', eventId)
            .single();

        if (event && new Date(event.start_date) < new Date()) {
            return res.status(400).json({ message: 'Cannot cancel registration after event has started' });
        }

        // Update status to cancelled
        const { error: updateError } = await supabase
            .from('event_attendees')
            .update({
                registration_status: 'cancelled',
                attendance_status: 'cancelled',
                updated_at: new Date()
            })
            .eq('id', registration.id);

        if (updateError) throw updateError;

        // Decrement attendee count
        await supabase.rpc('decrement_event_attendees', { event_id: eventId });

        res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Check-in with QR code
 * POST /api/v1/events/check-in
 */
router.post('/check-in', authenticateToken, async (req, res) => {
    try {
        const { qrCode } = req.body;

        if (!qrCode) {
            return res.status(400).json({ message: 'QR code is required' });
        }

        // Verify QR code
        const verification = verifyQRCode(qrCode);
        if (!verification.valid) {
            return res.status(400).json({ message: verification.error });
        }

        const { event_id, user_id, registration_id } = verification.data;

        // Get registration
        const { data: registration, error: fetchError } = await supabase
            .from('event_attendees')
            .select(`
                *,
                event:events(id, title, start_date, end_date),
                user:users(id, name, email)
            `)
            .eq('id', registration_id)
            .eq('event_id', event_id)
            .eq('user_id', user_id)
            .single();

        if (fetchError || !registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check if already checked in
        if (registration.attendance_status === 'checked_in' || registration.attendance_status === 'attended') {
            return res.status(400).json({ 
                message: 'Already checked in',
                checkInTime: registration.check_in_time
            });
        }

        // Check if registration is confirmed
        if (registration.registration_status !== 'confirmed') {
            return res.status(400).json({ 
                message: `Cannot check in. Registration status: ${registration.registration_status}` 
            });
        }

        // Check if payment is required and completed
        if (registration.payment_status === 'pending') {
            return res.status(400).json({ message: 'Payment required before check-in' });
        }

        // Update attendance
        const { data: updated, error: updateError } = await supabase
            .from('event_attendees')
            .update({
                attendance_status: 'checked_in',
                check_in_time: new Date(),
                updated_at: new Date()
            })
            .eq('id', registration_id)
            .select(`
                *,
                event:events(id, title, start_date, location),
                user:users(id, name, email)
            `)
            .single();

        if (updateError) throw updateError;

        res.json({
            message: 'Check-in successful',
            registration: updated
        });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Manual check-in by admin
 * POST /api/v1/events/:eventId/check-in/:userId
 */
router.post('/:eventId/check-in/:userId', authenticateToken, async (req, res) => {
    try {
        // TODO: Add admin authorization check
        const { eventId, userId } = req.params;

        const { data: registration, error: fetchError } = await supabase
            .from('event_attendees')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (registration.attendance_status === 'checked_in') {
            return res.status(400).json({ message: 'Already checked in' });
        }

        const { data: updated, error: updateError } = await supabase
            .from('event_attendees')
            .update({
                attendance_status: 'checked_in',
                check_in_time: new Date(),
                updated_at: new Date()
            })
            .eq('id', registration.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            message: 'Check-in successful',
            registration: updated
        });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
