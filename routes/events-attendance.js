/**
 * Event Attendance Routes
 * Handles QR code check-ins and attendance tracking
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../lib/supabase');
const router = express.Router();

// QR Code attendance tracking
router.post('/:id/checkin', [
  body('qrData').notEmpty().withMessage('QR data is required'),
  body('location').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { qrData, location } = req.body;

    // Parse QR data
    let parsedQRData;
    try {
      parsedQRData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }

    // Validate QR data
    if (parsedQRData.eventId !== id) {
      return res.status(400).json({ message: 'QR code does not match this event' });
    }

    // Check if user is registered for the event
    const { data: registration, error: regError } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', parsedQRData.attendeeId)
      .single();

    if (regError || !registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Update attendance status
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('event_attendees')
      .update({
        attendance_status: 'attended',
        check_in_time: new Date().toISOString(),
        check_in_location: location
      })
      .eq('id', registration.id)
      .select()
      .single();

    if (updateError) {
      console.error('Check-in error:', updateError);
      return res.status(500).json({ message: 'Check-in failed' });
    }

    res.json({
      message: 'Check-in successful',
      registration: updatedRegistration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event attendance statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: attendees, error } = await supabase
      .from('event_attendees')
      .select(`
        attendance_status,
        check_in_time,
        users:user_id(name, registration_number)
      `)
      .eq('event_id', id);

    if (error) {
      console.error('Error fetching attendance stats:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    const stats = {
      total_registered: attendees.length,
      attended: attendees.filter(a => a.attendance_status === 'attended').length,
      no_show: attendees.filter(a => a.attendance_status === 'no_show').length,
      pending: attendees.filter(a => a.attendance_status === 'registered').length,
      attendance_rate: attendees.length > 0 
        ? Math.round((attendees.filter(a => a.attendance_status === 'attended').length / attendees.length) * 100)
        : 0,
      recent_checkins: attendees
        .filter(a => a.check_in_time)
        .sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time))
        .slice(0, 10)
        .map(a => ({
          name: a.users?.name,
          registration_number: a.users?.registration_number,
          check_in_time: a.check_in_time
        }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;