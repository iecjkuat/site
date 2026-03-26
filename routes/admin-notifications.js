/**
 * Admin Notification Management Routes
 * Handles notification creation, campaigns, templates, and analytics
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// =====================================================
// NOTIFICATION STATISTICS
// =====================================================

// Get notification statistics
router.get('/stats', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = end_date || new Date().toISOString().split('T')[0];

        const { data: stats, error } = await supabase
            .rpc('get_notification_stats', {
                p_start_date: startDate,
                p_end_date: endDate
            });

        if (error) throw error;

        res.json(stats[0] || {
            total_sent: 0,
            total_delivered: 0,
            total_read: 0,
            total_failed: 0,
            delivery_rate: 0,
            read_rate: 0
        });
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// =====================================================
// NOTIFICATIONS CRUD
// =====================================================

// Get all notifications (with pagination and filters)
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            type, 
            status, 
            priority,
            user_id 
        } = req.query;

        const offset = (page - 1) * limit;

        let query = supabase
            .from('notifications')
            .select(`
                *,
                users!inner(id, name, email)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        // Apply filters
        if (type) query = query.eq('type', type);
        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (user_id) query = query.eq('user_id', user_id);

        const { data: notifications, error, count } = await query;

        if (error) throw error;

        res.json({
            notifications: notifications || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get single notification
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: notification, error } = await supabase
            .from('notifications')
            .select(`
                *,
                users!inner(id, name, email),
                notification_deliveries(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ error: 'Failed to fetch notification' });
    }
});

// Send notification to single user or group
router.post('/send', async (req, res) => {
    try {
        const {
            type,
            title,
            message,
            priority = 'medium',
            action_url,
            action_text,
            recipient_type,
            recipient_email,
            recipient_role,
            recipient_status,
            send_email = false,
            send_push = false
        } = req.body;

        // Validate required fields
        if (!type || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get recipient user IDs based on type
        let userIds = [];

        if (recipient_type === 'single' && recipient_email) {
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('email', recipient_email)
                .single();
            
            if (user) userIds.push(user.id);
        } else if (recipient_type === 'all') {
            const { data: users } = await supabase
                .from('users')
                .select('id');
            userIds = users.map(u => u.id);
        } else if (recipient_type === 'role' && recipient_role) {
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('role', recipient_role);
            userIds = users.map(u => u.id);
        } else if (recipient_type === 'status' && recipient_status) {
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('membership_status', recipient_status);
            userIds = users.map(u => u.id);
        }

        if (userIds.length === 0) {
            return res.status(400).json({ error: 'No recipients found' });
        }

        // Create notifications for each user
        const notifications = userIds.map(userId => ({
            user_id: userId,
            type,
            title,
            message,
            priority,
            action_url,
            action_text,
            status: 'sent',
            sent_at: new Date().toISOString()
        }));

        const { data: createdNotifications, error } = await supabase
            .from('notifications')
            .insert(notifications)
            .select();

        if (error) throw error;

        // TODO: Trigger email/push notifications if requested
        // This would integrate with the NotificationService from routes/notifications.js

        res.status(201).json({
            message: 'Notifications sent successfully',
            count: createdNotifications.length,
            notifications: createdNotifications
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Resend notification
router.post('/:id/resend', async (req, res) => {
    try {
        const { id } = req.params;

        // Get original notification
        const { data: notification, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Update status to resend
        const { error: updateError } = await supabase
            .from('notifications')
            .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({ message: 'Notification resent successfully' });
    } catch (error) {
        console.error('Error resending notification:', error);
        res.status(500).json({ error: 'Failed to resend notification' });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// =====================================================
// CAMPAIGNS
// =====================================================

// Get all campaigns
router.get('/campaigns', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('notification_campaigns')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (status) query = query.eq('status', status);

        const { data: campaigns, error, count } = await query;

        if (error) throw error;

        res.json({
            campaigns: campaigns || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// Get single campaign
router.get('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: campaign, error } = await supabase
            .from('notification_campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
});

// Create campaign
router.post('/campaigns', async (req, res) => {
    try {
        const {
            name,
            description,
            type,
            title,
            message,
            action_url,
            action_text,
            scheduled_for,
            target_audience = {}
        } = req.body;

        // Validate required fields
        if (!name || !type || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get target users count
        let query = supabase.from('users').select('id', { count: 'exact', head: true });

        if (target_audience.roles && target_audience.roles.length > 0) {
            query = query.in('role', target_audience.roles);
        }
        if (target_audience.membership_status) {
            query = query.eq('membership_status', target_audience.membership_status);
        }

        const { count: estimatedRecipients } = await query;

        // Create campaign
        const { data: campaign, error } = await supabase
            .from('notification_campaigns')
            .insert({
                name,
                description,
                type,
                title,
                message,
                action_url,
                action_text,
                scheduled_for,
                target_audience,
                estimated_recipients: estimatedRecipients || 0,
                created_by: req.user.id,
                status: scheduled_for ? 'scheduled' : 'draft'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(campaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// Send campaign
router.post('/campaigns/:id/send', async (req, res) => {
    try {
        const { id } = req.params;

        // Get campaign
        const { data: campaign, error: fetchError } = await supabase
            .from('notification_campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Get target users
        let query = supabase.from('users').select('id');

        const targetAudience = campaign.target_audience || {};
        if (targetAudience.roles && targetAudience.roles.length > 0) {
            query = query.in('role', targetAudience.roles);
        }
        if (targetAudience.membership_status) {
            query = query.eq('membership_status', targetAudience.membership_status);
        }

        const { data: users } = await query;
        const userIds = users.map(u => u.id);

        // Create notifications for each user
        const notifications = userIds.map(userId => ({
            user_id: userId,
            type: campaign.type,
            title: campaign.title,
            message: campaign.message,
            action_url: campaign.action_url,
            action_text: campaign.action_text,
            priority: 'medium',
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: { campaign_id: campaign.id }
        }));

        const { data: createdNotifications, error: insertError } = await supabase
            .from('notifications')
            .insert(notifications)
            .select();

        if (insertError) throw insertError;

        // Update campaign status
        const { error: updateError } = await supabase
            .from('notification_campaigns')
            .update({
                status: 'completed',
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                actual_recipients: userIds.length,
                sent_count: createdNotifications.length
            })
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({
            message: 'Campaign sent successfully',
            recipients: userIds.length,
            notifications_created: createdNotifications.length
        });
    } catch (error) {
        console.error('Error sending campaign:', error);
        res.status(500).json({ error: 'Failed to send campaign' });
    }
});

// Update campaign
router.put('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow updating certain fields
        delete updates.id;
        delete updates.created_at;
        delete updates.created_by;

        const { data: campaign, error } = await supabase
            .from('notification_campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

// Delete campaign
router.delete('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('notification_campaigns')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
});

// =====================================================
// TEMPLATES
// =====================================================

// Get all templates
router.get('/templates', async (req, res) => {
    try {
        const { type, channel, is_active } = req.query;

        let query = supabase
            .from('notification_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (type) query = query.eq('type', type);
        if (channel) query = query.eq('channel', channel);
        if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');

        const { data: templates, error } = await query;

        if (error) throw error;

        res.json({ templates: templates || [] });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Create template
router.post('/templates', async (req, res) => {
    try {
        const {
            name,
            description,
            type,
            channel,
            title_template,
            subject_template,
            message_template,
            variables = []
        } = req.body;

        if (!name || !type || !channel || !message_template) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: template, error } = await supabase
            .from('notification_templates')
            .insert({
                name,
                description,
                type,
                channel,
                title_template,
                subject_template,
                message_template,
                variables,
                created_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Update template
router.put('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        delete updates.id;
        delete updates.created_at;
        delete updates.created_by;

        updates.last_modified_by = req.user.id;
        updates.version = supabase.raw('version + 1');

        const { data: template, error } = await supabase
            .from('notification_templates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('notification_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// =====================================================
// ANALYTICS
// =====================================================

// Get delivery analytics
router.get('/analytics/delivery', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const { data: deliveries, error } = await supabase
            .from('notification_deliveries')
            .select('channel, status, created_at')
            .gte('created_at', start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .lte('created_at', end_date || new Date().toISOString());

        if (error) throw error;

        // Group by channel and status
        const analytics = {};
        deliveries.forEach(delivery => {
            if (!analytics[delivery.channel]) {
                analytics[delivery.channel] = {
                    total: 0,
                    sent: 0,
                    delivered: 0,
                    failed: 0
                };
            }
            analytics[delivery.channel].total++;
            analytics[delivery.channel][delivery.status]++;
        });

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching delivery analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get engagement analytics
router.get('/analytics/engagement', async (req, res) => {
    try {
        const { start_date, end_date, type } = req.query;

        let query = supabase
            .from('notifications')
            .select('type, status, read_at, created_at')
            .gte('created_at', start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .lte('created_at', end_date || new Date().toISOString());

        if (type) query = query.eq('type', type);

        const { data: notifications, error } = await query;

        if (error) throw error;

        // Calculate engagement metrics
        const total = notifications.length;
        const read = notifications.filter(n => n.read_at).length;
        const readRate = total > 0 ? ((read / total) * 100).toFixed(2) : 0;

        // Group by type
        const byType = {};
        notifications.forEach(notif => {
            if (!byType[notif.type]) {
                byType[notif.type] = { total: 0, read: 0 };
            }
            byType[notif.type].total++;
            if (notif.read_at) byType[notif.type].read++;
        });

        res.json({
            total,
            read,
            readRate: parseFloat(readRate),
            byType
        });
    } catch (error) {
        console.error('Error fetching engagement analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
