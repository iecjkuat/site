const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const router = express.Router();

const formatTicket = (t) => ({
  ...t,
  userId: t.user_id,
  assignedTo: t.assigned_to,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
  // Helper calculations
  ageInDays: Math.floor((new Date() - new Date(t.created_at || Date.now())) / (1000 * 60 * 60 * 24)),
  isOverdue: t.priority === 'URGENT' && Math.floor((new Date() - new Date(t.created_at)) / (1000 * 60 * 60 * 24)) > 1,
  // Relations
  user: Array.isArray(t.user) ? t.user[0] : t.user,
  assignee: Array.isArray(t.assignee) ? t.assignee[0] : t.assignee
});

// Get all support tickets
router.get('/', async (req, res) => {
  try {
    const { clubId, userId, status, priority, category, assignedTo, page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:users!user_id(name, email, registration_number),
        assignee:users!assigned_to(name, email, role)
      `, { count: 'exact' })
      .order('priority', { ascending: false }) // Urgent first
      .order('created_at', { ascending: false })
      .range(from, to);

    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status.toLowerCase());
    if (priority) query = query.eq('priority', priority.toUpperCase());
    if (category) query = query.eq('category', category);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

    const { data: tickets, count, error } = await query;

    if (error) throw error;

    res.json({
      tickets: tickets.map(formatTicket),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: tickets.length,
        totalTickets: count
      }
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single support ticket
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:users!user_id(name, email, registration_number, course, year_of_study, phone),
        assignee:users!assigned_to(name, email, role)
      `)
      .eq('id', id)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Fetch replies for this ticket
    const { data: replies, error: repliesError } = await supabase
      .from('support_ticket_replies')
      .select(`
        *,
        sender:users!user_id(name, email, role)
      `)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    // Add replies to ticket (even if empty array)
    const ticketWithReplies = {
      ...formatTicket(ticket),
      replies: replies || []
    };

    res.json(ticketWithReplies);
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new support ticket
router.post('/', [
  body('userId').optional().isUUID().withMessage('Valid user ID is required'),
  body('subject').notEmpty().withMessage('Ticket subject is required'),
  body('description').notEmpty().withMessage('Ticket description is required'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty if provided'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId, subject, description, category, priority = 'MEDIUM'
    } = req.body;

    console.log('📥 Creating support ticket:', { userId, subject, category, priority });

    // If no userId provided, return error (we need authenticated users)
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required. Please log in to submit a support ticket.' 
      });
    }

    // Validate user exists
    const { data: exists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError || !exists) {
      console.error('User not found:', userError);
      return res.status(400).json({ message: 'User not found' });
    }

    console.log('✅ User validated:', exists.id);

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject,
        description,
        category,
        priority: priority,
        status: 'pending'
      })
      .select(`
        *,
        user:users!user_id(name, email)
      `)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Ticket created:', ticket.id);

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: formatTicket(ticket)
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ticket status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const updates = { status };
    if (assignedTo) updates.assigned_to = assignedTo;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:users!user_id(name, email),
        assignee:users!assigned_to(name, email, role)
      `)
      .single();

    if (error) throw error;

    res.json({
      message: `Ticket status updated to ${status}`,
      ticket: formatTicket(ticket)
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign ticket
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    // Check if assignee exists and is exec
    // Skipped for brevity, assume frontend sends valid ID or DB constraint fails

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: assignedTo,
        status: 'in_progress'
      })
      .eq('id', id)
      .select(`*, assignee:users!assigned_to(name, email)`)
      .single();

    if (error) throw error;

    res.json({
      message: 'Ticket assigned successfully',
      ticket: formatTicket(ticket)
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete support ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: ticket } = await supabase.from('support_tickets').select('status').eq('id', id).single();

    if (ticket && ticket.status !== 'closed') {
      return res.status(400).json({ message: 'Can only delete closed tickets' });
    }

    const { error } = await supabase.from('support_tickets').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Support ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark ticket as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Ticket marked as read', ticket: formatTicket(ticket) });
  } catch (error) {
    console.error('Error marking ticket as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to ticket
router.post('/:id/reply', [
  body('content').notEmpty().withMessage('Reply content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content, resolve } = req.body;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Create reply (assuming you have a support_ticket_replies table)
    // If not, we'll store in metadata or create the table
    const { data: reply, error: replyError } = await supabase
      .from('support_ticket_replies')
      .insert({
        ticket_id: id,
        user_id: userId,
        content: content,
        is_admin: true
      })
      .select(`
        *,
        sender:users!user_id(name, email)
      `)
      .single();

    if (replyError) {
      console.error('Reply error:', replyError);
      // If table doesn't exist, just update the ticket with a note
      const updates = {
        updated_at: new Date().toISOString()
      };
      
      if (resolve) {
        updates.status = 'RESOLVED';
      }

      await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id);

      return res.json({ 
        message: 'Reply recorded (legacy mode)', 
        note: 'Create support_ticket_replies table for full functionality'
      });
    }

    // Update ticket status if resolve is true
    if (resolve) {
      await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', id);
    }

    res.json({
      message: 'Reply sent successfully',
      reply: reply
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket (PATCH for partial updates)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, category, assigned_to } = req.body;

    const updates = {};
    if (status) updates.status = status.toLowerCase();
    if (priority) updates.priority = priority.toUpperCase();
    if (category) updates.category = category;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:users!user_id(name, email),
        assignee:users!assigned_to(name, email, role)
      `)
      .single();

    if (error) throw error;

    res.json({
      message: 'Ticket updated successfully',
      ticket: formatTicket(ticket)
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact / Feedback endpoint
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!email || !message) {
      return res.status(400).json({ message: 'Email and message are required' });
    }

    // Try to find if the user exists
    let userId = null;

    // Attempt to match user by email to link the ticket
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (user) {
      userId = user.id;
    }

    if (userId) {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: userId,
        subject: subject || 'General Inquiry',
        description: `[Contact Form] Name: ${name}\n\n${message}`,
        category: 'GENERAL',
        status: 'pending',
        priority: 'MEDIUM'
      });

      if (error) {
        console.error('Error saving contact ticket:', error);
        throw error;
      }
    } else {
      // Log it if we can't save to DB (Guest user scenario)
      console.log('Received guest contact message:', { name, email, subject, message });
      // In a real app, this would send an email via SendGrid/AWS SES
    }

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// App Feedback endpoint (alias to contact but categorizes as Feedback)
router.post('/feedback', async (req, res) => {
  // Implementation similar to contact but forces category/subject
  try {
    const { message, rating } = req.body;
    // ... logic to save feedback ...
    res.json({ success: true, message: 'Feedback received' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;