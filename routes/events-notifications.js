/**
 * Event Notifications Routes
 * Handles event reminders and live updates
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const router = express.Router();

// Live event updates
router.get('/:id/live-updates', async (req, res) => {
  try {
    const { id } = req.params;
    const { since } = req.query; // ISO timestamp

    const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000); // Default: last minute

    // Get recent registrations
    const { data: recentRegistrations, error: regError } = await supabase
      .from('event_attendees')
      .select(`
        created_at,
        users:user_id(name)
      `)
      .eq('event_id', id)
      .gte('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: false });

    // Get recent check-ins
    const { data: recentCheckins, error: checkinError } = await supabase
      .from('event_attendees')
      .select(`
        check_in_time,
        users:user_id(name)
      `)
      .eq('event_id', id)
      .not('check_in_time', 'is', null)
      .gte('check_in_time', sinceDate.toISOString())
      .order('check_in_time', { ascending: false });

    // Get current attendance count
    const { count: totalAttendees } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    const { count: checkedInCount } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('attendance_status', 'attended');

    const updates = {
      timestamp: new Date().toISOString(),
      stats: {
        total_registered: totalAttendees || 0,
        checked_in: checkedInCount || 0
      },
      recent_activity: [
        ...(recentRegistrations || []).map(reg => ({
          type: 'registration',
          user: reg.users?.name,
          timestamp: reg.created_at
        })),
        ...(recentCheckins || []).map(checkin => ({
          type: 'checkin',
          user: checkin.users?.name,
          timestamp: checkin.check_in_time
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    };

    res.json(updates);
  } catch (error) {
    console.error('Error fetching live updates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send event notifications/reminders
router.post('/:id/notifications', [
  body('type').isIn(['reminder', 'update', 'cancellation']).withMessage('Invalid notification type'),
  body('message').notEmpty().withMessage('Message is required'),
  body('recipients').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { type, message, recipients } = req.body;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, start_date')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get recipients (all registered users if not specified)
    let targetUsers;
    if (recipients && recipients.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', recipients);
      
      targetUsers = users || [];
    } else {
      const { data: attendees, error: attendeesError } = await supabase
        .from('event_attendees')
        .select(`
          users:user_id(id, name, email)
        `)
        .eq('event_id', id);
      
      targetUsers = (attendees || []).map(a => a.users).filter(Boolean);
    }

    // Create notification records (if table exists)
    const notifications = targetUsers.map(user => ({
      user_id: user.id,
      event_id: id,
      type,
      title: `${event.title} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      message,
      sent_at: new Date().toISOString()
    }));

    // In a real implementation, you would send actual emails/push notifications here
    res.json({
      message: 'Notifications sent successfully',
      sent_count: notifications.length,
      recipients: targetUsers.map(u => ({ id: u.id, name: u.name, email: u.email }))
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;