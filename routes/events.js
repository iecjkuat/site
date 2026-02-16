const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { enrichEventsWithStatus, enrichEventWithStatus } = require('../utils/event-status');

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
        id, title, description, event_type, start_date, end_date, location,
        venue_details, is_virtual, meeting_link, registration_required,
        registration_deadline, max_attendees, current_attendees, fee, currency,
        status, banner_image, gallery, tags, requirements, agenda, created_at, updated_at, published_at
      `)
      .order('start_date', { ascending: true });

    if (status) query = query.eq('status', status);
    if (upcoming === 'true') query = query.gte('start_date', new Date().toISOString());
    if (category) query = query.eq('event_type', category);

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    let eventsWithStats = events || [];

    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);

      // Fetch all attendee counts in a single query
      const { data: attendeeCounts, error: countError } = await supabase
        .from('event_attendees')
        .select('event_id')
        .in('event_id', eventIds);

      if (countError) {
        console.error('Error fetching attendee counts:', countError);
        // Continue without stats if this fails
      }

      if (attendeeCounts) {
        // Count attendees per event
        const countsMap = new Map();
        attendeeCounts.forEach(a => {
          countsMap.set(a.event_id, (countsMap.get(a.event_id) || 0) + 1);
        });

        eventsWithStats = events.map(event => {
          const attendeeCount = countsMap.get(event.id) || 0;
          return {
            ...event,
            stats: {
              totalAttendees: attendeeCount,
              spotsRemaining: event.max_attendees ? event.max_attendees - attendeeCount : null
            }
          };
        });
      }
    }

    // Enrich events with calculated status based on dates
    eventsWithStats = enrichEventsWithStatus(eventsWithStats);

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
    res.status(500).json({ message: 'Server error', error: error.message });
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

    let eventWithStats = {
      ...event,
      attendees: attendees || [],
      stats: {
        totalAttendees: attendeeCount || 0,
        spotsRemaining: event.max_attendees ? event.max_attendees - (attendeeCount || 0) : null
      }
    };

    // Enrich with calculated status
    eventWithStats = enrichEventWithStatus(eventWithStats);

    res.json(eventWithStats);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// OLD REGISTRATION ROUTE - DEPRECATED
// This route has been replaced by the event-registration.js routes
// which provide better functionality including QR codes, waitlists, etc.
// Keeping commented for reference
/*
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
*/

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

// ============================================================================
// LIKES ENDPOINTS
// ============================================================================

// Get likes for an event
router.get('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: likes, error, count } = await supabase
      .from('event_likes')
      .select('*', { count: 'exact' })
      .eq('event_id', id);

    if (error) {
      console.error('Error fetching likes:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json({ count: count || 0, likes: likes || [] });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle like on an event
router.post('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user already liked
    const { data: existingLike } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', id)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        console.error('Error removing like:', error);
        return res.status(500).json({ message: 'Failed to remove like' });
      }

      // Get updated count
      const { count } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      return res.json({ liked: false, count: count || 0 });
    } else {
      // Like
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: id, user_id: userId });

      if (error) {
        console.error('Error adding like:', error);
        return res.status(500).json({ message: 'Failed to add like' });
      }

      // Get updated count
      const { count } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      return res.json({ liked: true, count: count || 0 });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// COMMENTS ENDPOINTS
// ============================================================================

// Get comments for an event
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: comments, error } = await supabase
      .from('event_comments')
      .select(`
        id, content, created_at, likes_count,
        user:user_id (id, name, email)
      `)
      .eq('event_id', id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a comment
router.post('/:id/comments', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('content').trim().notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { userId, content } = req.body;

    const { data: comment, error } = await supabase
      .from('event_comments')
      .insert({
        event_id: id,
        user_id: userId,
        content: content
      })
      .select(`
        id, content, created_at, likes_count,
        user:user_id (id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error posting comment:', error);
      return res.status(500).json({ message: 'Failed to post comment' });
    }

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// COMMENT LIKES ENDPOINTS
// ============================================================================

// Toggle like on a comment
router.post('/comments/:commentId/likes', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user already liked this comment
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        console.error('Error removing comment like:', error);
        return res.status(500).json({ message: 'Failed to remove like' });
      }

      // Get updated comment with new likes_count
      const { data: comment } = await supabase
        .from('event_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      return res.json({ liked: false, likes_count: comment?.likes_count || 0 });
    } else {
      // Like
      const { error } = await supabase
        .from('comment_likes')
        .insert({ comment_id: commentId, user_id: userId });

      if (error) {
        console.error('Error adding comment like:', error);
        return res.status(500).json({ message: 'Failed to add like' });
      }

      // Get updated comment with new likes_count
      const { data: comment } = await supabase
        .from('event_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      return res.json({ liked: true, likes_count: comment?.likes_count || 0 });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;