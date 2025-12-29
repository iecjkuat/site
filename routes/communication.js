const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');

// =============================================
// DIRECT MESSAGING ROUTES
// =============================================

// Get user's conversations (direct messages)
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { data: conversations, error } = await supabase
            .from('messages')
            .select(`
                id,
                sender_id,
                recipient_id,
                subject,
                content,
                created_at,
                read_count,
                sender:users!messages_sender_id_fkey(name, email, avatar_url),
                recipient:users!messages_recipient_id_fkey(name, email, avatar_url),
                message_recipients(delivery_status, read_at)
            `)
            .or(`sender_id.eq.${req.user.id},recipient_id.eq.${req.user.id}`)
            .eq('message_type', 'direct')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({ conversations, pagination: { page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Send direct message
router.post('/messages/direct', authenticateToken, async (req, res) => {
    try {
        const { recipientId, subject, content, attachmentUrl, attachmentType, priorityLevel = 'normal' } = req.body;

        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                sender_id: req.user.id,
                recipient_id: recipientId,
                subject,
                content,
                message_type: 'direct',
                attachment_url: attachmentUrl,
                attachment_type: attachmentType,
                priority_level: priorityLevel
            })
            .select(`
                *,
                sender:users!messages_sender_id_fkey(name, email, avatar_url),
                recipient:users!messages_recipient_id_fkey(name, email, avatar_url)
            `)
            .single();

        if (error) throw error;

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Mark message as read
router.put('/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('message_recipients')
            .update({ 
                delivery_status: 'read',
                read_at: new Date().toISOString()
            })
            .eq('message_id', id)
            .eq('recipient_id', req.user.id);

        if (error) throw error;

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

// =============================================
// GROUP CHAT ROUTES
// =============================================

// Get user's chat groups
router.get('/groups', authenticateToken, async (req, res) => {
    try {
        const { data: groups, error } = await supabase
            .rpc('get_user_chat_groups', { user_uuid: req.user.id });

        if (error) throw error;

        res.json(groups);
    } catch (error) {
        console.error('Error fetching chat groups:', error);
        res.status(500).json({ error: 'Failed to fetch chat groups' });
    }
});

// Get group messages
router.get('/groups/:id/messages', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Check if user is member of the group
        const { data: membership } = await supabase
            .from('chat_group_members')
            .select('id')
            .eq('group_id', id)
            .eq('user_id', req.user.id)
            .single();

        if (!membership) {
            return res.status(403).json({ error: 'Access denied to this group' });
        }

        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:users!messages_sender_id_fkey(name, email, avatar_url),
                message_reactions(emoji, user_id, users(name)),
                parent_message:messages!messages_parent_message_id_fkey(content, sender:users!messages_sender_id_fkey(name))
            `)
            .eq('group_id', id)
            .eq('message_type', 'group')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({ messages: messages.reverse(), pagination: { page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ error: 'Failed to fetch group messages' });
    }
});

// Send group message
router.post('/groups/:id/messages', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, attachmentUrl, attachmentType, parentMessageId, priorityLevel = 'normal' } = req.body;

        // Check if user is member of the group
        const { data: membership } = await supabase
            .from('chat_group_members')
            .select('id')
            .eq('group_id', id)
            .eq('user_id', req.user.id)
            .single();

        if (!membership) {
            return res.status(403).json({ error: 'Access denied to this group' });
        }

        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                sender_id: req.user.id,
                group_id: id,
                content,
                message_type: 'group',
                attachment_url: attachmentUrl,
                attachment_type: attachmentType,
                parent_message_id: parentMessageId,
                priority_level: priorityLevel
            })
            .select(`
                *,
                sender:users!messages_sender_id_fkey(name, email, avatar_url)
            `)
            .single();

        if (error) throw error;

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending group message:', error);
        res.status(500).json({ error: 'Failed to send group message' });
    }
});

// Create new chat group
router.post('/groups', authenticateToken, async (req, res) => {
    try {
        const { name, description, groupType, isPrivate = false, maxMembers = 100 } = req.body;

        const { data: group, error } = await supabase
            .from('chat_groups')
            .insert({
                name,
                description,
                group_type: groupType,
                is_private: isPrivate,
                max_members: maxMembers,
                created_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        // Add creator as admin
        await supabase
            .from('chat_group_members')
            .insert({
                group_id: group.id,
                user_id: req.user.id,
                role: 'admin'
            });

        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// Add member to group
router.post('/groups/:id/members', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role = 'member' } = req.body;

        // Check if user has permission to add members
        const { data: membership } = await supabase
            .from('chat_group_members')
            .select('role')
            .eq('group_id', id)
            .eq('user_id', req.user.id)
            .single();

        if (!membership || !['admin', 'moderator'].includes(membership.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const { data: newMember, error } = await supabase
            .from('chat_group_members')
            .insert({
                group_id: id,
                user_id: userId,
                role
            })
            .select(`
                *,
                user:users(name, email, avatar_url)
            `)
            .single();

        if (error) throw error;

        res.status(201).json(newMember);
    } catch (error) {
        console.error('Error adding group member:', error);
        res.status(500).json({ error: 'Failed to add group member' });
    }
});

// =============================================
// ANNOUNCEMENTS ROUTES
// =============================================

// Get announcements for user
router.get('/announcements', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, type, priority } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('announcements')
            .select(`
                *,
                created_by_user:users!announcements_created_by_fkey(name, email),
                announcement_recipients!inner(delivery_status, read_at)
            `)
            .eq('announcement_recipients.recipient_id', req.user.id)
            .is('expires_at', null)
            .or(`expires_at.gt.${new Date().toISOString()}`)
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('announcement_type', type);
        }

        if (priority) {
            query = query.eq('priority_level', priority);
        }

        query = query.range(offset, offset + limit - 1);

        const { data: announcements, error } = await query;

        if (error) throw error;

        res.json({ announcements, pagination: { page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Create announcement (executives only)
router.post('/announcements', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        const {
            title,
            content,
            announcementType,
            priorityLevel = 'normal',
            targetAudience = 'all',
            targetGroups,
            targetDepartments,
            targetCohorts,
            isEmergency = false,
            sendEmail = false,
            sendSms = false,
            sendPush = true,
            scheduledSendAt,
            expiresAt
        } = req.body;

        const { data: announcement, error } = await supabase
            .from('announcements')
            .insert({
                title,
                content,
                announcement_type: announcementType,
                priority_level: priorityLevel,
                target_audience: targetAudience,
                target_groups: targetGroups,
                target_departments: targetDepartments,
                target_cohorts: targetCohorts,
                is_emergency: isEmergency,
                send_email: sendEmail,
                send_sms: sendSms,
                send_push: sendPush,
                scheduled_send_at: scheduledSendAt,
                expires_at: expiresAt,
                created_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        // Send announcement immediately if not scheduled
        if (!scheduledSendAt) {
            const { data: recipientCount } = await supabase
                .rpc('send_announcement', { 
                    announcement_uuid: announcement.id,
                    send_immediately: true
                });

            announcement.recipient_count = recipientCount;
        }

        res.status(201).json(announcement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Mark announcement as read
router.put('/announcements/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('announcement_recipients')
            .update({ 
                delivery_status: 'read',
                read_at: new Date().toISOString()
            })
            .eq('announcement_id', id)
            .eq('recipient_id', req.user.id);

        if (error) throw error;

        res.json({ message: 'Announcement marked as read' });
    } catch (error) {
        console.error('Error marking announcement as read:', error);
        res.status(500).json({ error: 'Failed to mark announcement as read' });
    }
});

// =============================================
// MESSAGE REACTIONS ROUTES
// =============================================

// Add reaction to message
router.post('/messages/:id/reactions', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;

        const { data: reaction, error } = await supabase
            .from('message_reactions')
            .upsert({
                message_id: id,
                user_id: req.user.id,
                emoji
            })
            .select()
            .single();

        if (error) throw error;

        // Update reaction counts in message
        const { data: reactionCounts } = await supabase
            .from('message_reactions')
            .select('emoji')
            .eq('message_id', id);

        const counts = reactionCounts.reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
        }, {});

        await supabase
            .from('messages')
            .update({ reaction_counts: counts })
            .eq('id', id);

        res.status(201).json(reaction);
    } catch (error) {
        console.error('Error adding reaction:', error);
        res.status(500).json({ error: 'Failed to add reaction' });
    }
});

// Remove reaction from message
router.delete('/messages/:id/reactions/:emoji', authenticateToken, async (req, res) => {
    try {
        const { id, emoji } = req.params;

        const { error } = await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', id)
            .eq('user_id', req.user.id)
            .eq('emoji', emoji);

        if (error) throw error;

        res.json({ message: 'Reaction removed' });
    } catch (error) {
        console.error('Error removing reaction:', error);
        res.status(500).json({ error: 'Failed to remove reaction' });
    }
});

// =============================================
// EMERGENCY CONTACTS ROUTES
// =============================================

// Get user's emergency contacts
router.get('/emergency-contacts', authenticateToken, async (req, res) => {
    try {
        const { data: contacts, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('is_active', true)
            .order('is_primary', { ascending: false })
            .order('created_at');

        if (error) throw error;

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching emergency contacts:', error);
        res.status(500).json({ error: 'Failed to fetch emergency contacts' });
    }
});

// Add emergency contact
router.post('/emergency-contacts', authenticateToken, async (req, res) => {
    try {
        const {
            contactType,
            name,
            relationship,
            phoneNumber,
            email,
            address,
            isPrimary = false
        } = req.body;

        const { data: contact, error } = await supabase
            .from('emergency_contacts')
            .insert({
                user_id: req.user.id,
                contact_type: contactType,
                name,
                relationship,
                phone_number: phoneNumber,
                email,
                address,
                is_primary: isPrimary
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(contact);
    } catch (error) {
        console.error('Error adding emergency contact:', error);
        res.status(500).json({ error: 'Failed to add emergency contact' });
    }
});

// Update emergency contact
router.put('/emergency-contacts/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updated_at: new Date().toISOString() };

        const { data: contact, error } = await supabase
            .from('emergency_contacts')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(contact);
    } catch (error) {
        console.error('Error updating emergency contact:', error);
        res.status(500).json({ error: 'Failed to update emergency contact' });
    }
});

// =============================================
// COMMUNICATION PREFERENCES ROUTES
// =============================================

// Get user's communication preferences
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const { data: preferences, error } = await supabase
            .from('communication_preferences')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Return default preferences if none exist
        if (!preferences) {
            const defaultPreferences = {
                user_id: req.user.id,
                email_notifications: true,
                sms_notifications: false,
                push_notifications: true,
                direct_messages: true,
                group_messages: true,
                announcements: true,
                emergency_alerts: true,
                event_reminders: true,
                marketing_emails: false,
                digest_frequency: 'daily',
                quiet_hours_start: '22:00',
                quiet_hours_end: '07:00',
                timezone: 'Africa/Nairobi'
            };
            return res.json(defaultPreferences);
        }

        res.json(preferences);
    } catch (error) {
        console.error('Error fetching communication preferences:', error);
        res.status(500).json({ error: 'Failed to fetch communication preferences' });
    }
});

// Update communication preferences
router.put('/preferences', authenticateToken, async (req, res) => {
    try {
        const updateData = { ...req.body, user_id: req.user.id, updated_at: new Date().toISOString() };

        const { data: preferences, error } = await supabase
            .from('communication_preferences')
            .upsert(updateData)
            .select()
            .single();

        if (error) throw error;

        res.json(preferences);
    } catch (error) {
        console.error('Error updating communication preferences:', error);
        res.status(500).json({ error: 'Failed to update communication preferences' });
    }
});

// =============================================
// STATISTICS ROUTES
// =============================================

// Get unread message counts
router.get('/unread-counts', authenticateToken, async (req, res) => {
    try {
        const { data: counts, error } = await supabase
            .rpc('get_unread_message_count', { user_uuid: req.user.id });

        if (error) throw error;

        res.json(counts[0] || { direct_messages: 0, group_messages: 0, announcements: 0, total_unread: 0 });
    } catch (error) {
        console.error('Error fetching unread counts:', error);
        res.status(500).json({ error: 'Failed to fetch unread counts' });
    }
});

module.exports = router;