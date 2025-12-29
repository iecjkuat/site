const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../lib/supabase');

// Import sub-route modules
const attendanceRoutes = require('./events-attendance');
const notificationRoutes = require('./events-notifications');

const router = express.Router();

// Mount sub-routes
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);

// Get all events
router.get('/', async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('events')
      .select(`
        id, title, description, event_type, start_date, end_date, location, venue_details,
        max_attendees, registration_required, registration_deadline, fee, status, tags,
        created_at, updated_at
      `)
      .order('start_date', { ascending: true });

    if (status) query = query.eq('status', status);
    if (upcoming === 'true') query = query.gte('start_date', new Date().toISOString());
    if (category) query = query.eq('event_type', category);

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    // Get attendee counts for each event
    const eventsWithStats = await Promise.all(
      (events || []).map(async (event) => {
        const { count: attendeeCount } = await supabase
          .from('event_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        return {
          ...event,
          stats: {
            totalAttendees: attendeeCount || 0,
            spotsRemaining: event.max_attendees ? event.max_attendees - (attendeeCount || 0) : null
          }
        };
      })
    );

    res.json({
      events: eventsWithStats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil((count || 0) / parseInt(limit)),
        count: events?.length || 0,
        totalEvents: count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get attendees
    const { data: attendees, count: attendeeCount } = await supabase
      .from('event_attendees')
      .select(`
        *, 
        users:user_id(id, name, email, registration_number)
      `)
      .eq('event_id', id);

    const eventWithStats = {
      ...event,
      attendees: attendees || [],
      stats: {
        totalAttendees: attendeeCount || 0,
        spotsRemaining: event.max_attendees ? event.max_attendees - (attendeeCount || 0) : null
      }
    };

    res.json(eventWithStats);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
router.post('/:id/register', [
  body('userId').isUUID().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { userId } = req.body;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validation checks
    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Event is not open for registration' });
    }

    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if user already registered
    const { data: existingRegistration } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', id)
      .eq('user_id', userId)
      .single();

    if (existingRegistration) {
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    // Check capacity
    const { count: attendeeCount } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    if (event.max_attendees && attendeeCount >= event.max_attendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Register user
    const { data: registration, error: regError } = await supabase
      .from('event_attendees')
      .insert({
        event_id: id,
        user_id: userId,
        payment_status: event.fee > 0 ? 'pending' : 'paid'
      })
      .select()
      .single();

    if (regError) {
      console.error('Registration error:', regError);
      return res.status(500).json({ message: 'Registration failed' });
    }

    res.status(201).json({
      message: 'Registration successful',
      registration,
      requiresPayment: event.fee > 0
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event categories
router.get('/categories/list', async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('event_type')
      .not('event_type', 'is', null);

    if (error) {
      return res.status(500).json({ message: 'Server error' });
    }

    const categories = [...new Set(events.map(e => e.event_type))];
    
    res.json({
      categories: categories.map(cat => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: events.filter(e => e.event_type === cat).length
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;