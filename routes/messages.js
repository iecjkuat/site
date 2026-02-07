const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const router = express.Router();

// Helper to format message with nested relations
const formatMessage = (msg) => {
  if (!msg) return null;
  return {
    ...msg,
    senderId: msg.sender_id,
    recipientId: msg.recipient_id,
    clubId: msg.club_id,
    parentMessageId: msg.parent_message_id,
    readAt: msg.read_at,
    repliedAt: msg.replied_at,
    createdAt: msg.created_at,
    messageType: msg.message_type,
    // Flatten nested arrays that come from 1:1 relations in Supabase
    sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
    recipient: Array.isArray(msg.recipient) ? msg.recipient[0] : msg.recipient,
    club: Array.isArray(msg.club) ? msg.club[0] : msg.club,
    parentMessage: Array.isArray(msg.parent_message) ? msg.parent_message[0] : msg.parent_message
  };
};

// Get user's messages (inbox)
router.get('/inbox/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(name, email, registration_number),
        club:clubs(name, short_name),
        parent_message:messages!parent_message_id(id, subject)
      `, { count: 'exact' })
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (unreadOnly === 'true') {
      query = query.is('read_at', null);
    }

    const { data: messages, count, error } = await query;

    if (error) throw error;

    // Get unread count separately
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null);

    res.json({
      messages: messages.map(formatMessage),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: messages.length,
        totalMessages: count
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's sent messages
router.get('/sent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    const { data: messages, count, error } = await supabase
      .from('messages')
      .select(`
        *,
        recipient:users!recipient_id(name, email, registration_number),
        club:clubs(name, short_name),
        parent_message:messages!parent_message_id(id, subject)
      `, { count: 'exact' })
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      messages: messages.map(formatMessage),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: messages.length,
        totalMessages: count
      }
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single message
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: message, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(name, email, registration_number),
        recipient:users!recipient_id(name, email, registration_number),
        club:clubs(name, short_name),
        parent_message:messages!parent_message_id(
          id, subject, content, created_at,
          sender:users!sender_id(name)
        ),
        replies:messages!parent_message_id(
          id, content, created_at,
          sender:users!sender_id(name, email)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(formatMessage(message));
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send new message
router.post('/', [
  body('clubId').isUUID().withMessage('Valid club ID is required'),
  body('senderId').isUUID().withMessage('Valid sender ID is required'),
  body('recipientId').isUUID().withMessage('Valid recipient ID is required'),
  body('content').notEmpty().withMessage('Message content is required'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty if provided'),
  body('messageType').optional().isIn(['DIRECT', 'GROUP', 'ANNOUNCEMENT']).withMessage('Invalid message type'),
  body('parentMessageId').optional().isUUID().withMessage('Valid parent message ID required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      clubId, senderId, recipientId, subject, content,
      messageType = 'DIRECT', parentMessageId, attachments = []
    } = req.body;

    // Validate users exist and belong to the club
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('club_id', clubId)
      .in('id', [senderId, recipientId]);

    // Should find 2 users (if sender != recipient) or 1 (if self-message), or check separately
    if (userError || !users || (senderId !== recipientId && users.length < 2)) {
      return res.status(400).json({
        message: 'Sender or recipient not found or not in the same club'
      });
    }

    // If replying, validate parent message exists
    if (parentMessageId) {
      const { data: parent } = await supabase
        .from('messages')
        .select('id')
        .eq('id', parentMessageId)
        .single();

      if (!parent) {
        return res.status(400).json({ message: 'Parent message not found' });
      }
    }

    // Create message
    const { data: message, error: createError } = await supabase
      .from('messages')
      .insert({
        club_id: clubId,
        sender_id: senderId,
        recipient_id: recipientId,
        subject,
        content,
        message_type: messageType,
        parent_message_id: parentMessageId,
        attachments
      })
      .select(`
        *,
        sender:users!sender_id(name, email),
        recipient:users!recipient_id(name, email),
        club:clubs(name, short_name)
      `)
      .single();

    if (createError) throw createError;

    res.status(201).json({
      message: 'Message sent successfully',
      data: formatMessage(message)
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: message } = await supabase
      .from('messages')
      .select('read_at')
      .eq('id', id)
      .single();

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.read_at) {
      return res.json({ message: 'Message already marked as read' });
    }

    const { data: updatedMessage, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        sender:users!sender_id(name, email)
      `)
      .single();

    if (error) throw error;

    res.json({
      message: 'Message marked as read',
      data: formatMessage(updatedMessage)
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to message
router.post('/:id/reply', [
  body('senderId').isUUID().withMessage('Valid sender ID is required'),
  body('content').notEmpty().withMessage('Reply content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { senderId, content, attachments = [] } = req.body;

    const { data: originalMessage, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    // Create reply
    const { data: reply, error: createError } = await supabase
      .from('messages')
      .insert({
        club_id: originalMessage.club_id,
        sender_id: senderId,
        recipient_id: originalMessage.sender_id, // Reply to original sender
        subject: originalMessage.subject?.startsWith('Re: ')
          ? originalMessage.subject
          : `Re: ${originalMessage.subject || 'Message'}`,
        content,
        message_type: originalMessage.message_type,
        parent_message_id: id,
        attachments
      })
      .select(`
        *,
        sender:users!sender_id(name, email),
        recipient:users!recipient_id(name, email)
      `)
      .single();

    if (createError) throw createError;

    // Update original message reply timestamp
    await supabase
      .from('messages')
      .update({ replied_at: new Date().toISOString() })
      .eq('id', id);

    res.status(201).json({
      message: 'Reply sent successfully',
      data: formatMessage(reply)
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check for replies
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('parent_message_id', id);

    if (count > 0) {
      return res.status(400).json({
        message: 'Cannot delete message with replies'
      });
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search messages
router.get('/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { query, type = 'all', page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let dbQuery = supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(name, email),
        recipient:users!recipient_id(name, email),
        club:clubs(name, short_name)
      `, { count: 'exact' })
      .or(`subject.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filter by message type
    if (type === 'inbox') {
      dbQuery = dbQuery.eq('recipient_id', userId);
    } else if (type === 'sent') {
      dbQuery = dbQuery.eq('sender_id', userId);
    } else {
      dbQuery = dbQuery.or(`recipient_id.eq.${userId},sender_id.eq.${userId}`);
    }

    const { data: messages, count, error } = await dbQuery;

    if (error) throw error;

    res.json({
      query,
      type,
      messages: messages.map(formatMessage),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: messages.length,
        totalMessages: count
      }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get message thread
router.get('/:id/thread', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the message to start traversal
    let { data: currentMessage, error } = await supabase
      .from('messages')
      .select('id, parent_message_id')
      .eq('id', id)
      .single();

    if (error || !currentMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Traverse up to find root
    // A more efficient SQL way exists but for now we loop
    let rootId = currentMessage.id;
    let parentId = currentMessage.parent_message_id;

    // Safety limit to prevent infinite loops if cycle exists
    let depth = 0;
    while (parentId && depth < 10) {
      const { data: parent } = await supabase
        .from('messages')
        .select('id, parent_message_id')
        .eq('id', parentId)
        .single();

      if (!parent) break;

      rootId = parent.id;
      parentId = parent.parent_message_id;
      depth++;
    }

    // Get all messages in the thread (root + children)
    const { data: threadMessages, error: threadError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(name, email),
        recipient:users!recipient_id(name, email)
      `)
      .or(`id.eq.${rootId},parent_message_id.eq.${rootId}`)
      .order('created_at', { ascending: true });

    if (threadError) throw threadError;

    res.json({
      rootMessage: rootId,
      thread: threadMessages.map(formatMessage),
      count: threadMessages.length
    });
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messaging statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [
      { count: totalReceived },
      { count: totalSent },
      { count: unreadCount },
      { count: recentActivity }
    ] = await Promise.all([
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', userId),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', userId),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', userId).is('read_at', null),
      supabase.from('messages').select('id', { count: 'exact', head: true })
        .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const stats = {
      totalReceived: totalReceived || 0,
      totalSent: totalSent || 0,
      unreadCount: unreadCount || 0,
      recentActivity: recentActivity || 0,
      readRate: (totalReceived || 0) > 0 ? (((totalReceived || 0) - (unreadCount || 0)) / (totalReceived || 0) * 100).toFixed(1) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching messaging stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk mark messages as read
router.put('/bulk/mark-read', [
  body('messageIds').isArray().withMessage('Message IDs array is required'),
  body('userId').isUUID().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messageIds, userId } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds)
      .eq('recipient_id', userId)
      .is('read_at', null)
      .select();

    if (error) throw error;

    res.json({
      message: `${data.length} messages marked as read`,
      count: data.length
    });
  } catch (error) {
    console.error('Error bulk marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;