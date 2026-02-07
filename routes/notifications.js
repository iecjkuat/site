// JKUAT Innovation Club - Notifications Service
const express = require('express');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const webpush = require('web-push');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure Web Push (only if VAPID keys are provided and valid)
if (process.env.VAPID_PUBLIC_KEY && 
    process.env.VAPID_PRIVATE_KEY && 
    process.env.VAPID_PUBLIC_KEY !== 'your_vapid_public_key' &&
    process.env.VAPID_PRIVATE_KEY !== 'your_vapid_private_key') {
    try {
        webpush.setVapidDetails(
            'mailto:innovation@jkuat.ac.ke',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        console.log('✅ Web Push notifications configured');
    } catch (error) {
        console.log('⚠️ Web Push configuration failed:', error.message);
    }
} else {
    console.log('⚠️ Web Push notifications disabled (VAPID keys not configured)');
}

// Configure Email
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Notification Service Class
class NotificationService {
    
    // Create a new notification
    async createNotification(data) {
        try {
            const { data: notification, error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: data.userId,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    priority: data.priority || 'medium',
                    action_url: data.actionUrl,
                    action_text: data.actionText,
                    metadata: data.metadata || {},
                    related_entity_type: data.relatedEntityType,
                    related_entity_id: data.relatedEntityId,
                    scheduled_for: data.scheduledFor
                }])
                .select()
                .single();

            if (error) throw error;

            // Send immediately if not scheduled
            if (!data.scheduledFor) {
                await this.sendNotification(notification.id);
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Send notification through all enabled channels
    async sendNotification(notificationId) {
        try {
            // Get notification details
            const { data: notification, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    users!inner(id, name, email),
                    notification_preferences!inner(*)
                `)
                .eq('id', notificationId)
                .single();

            if (error) throw error;

            const user = notification.users;
            const preferences = notification.notification_preferences;

            // Check if user wants this type of notification
            const typePreference = this.getTypePreference(notification.type, preferences);
            if (!typePreference) {
                console.log(`User ${user.id} has disabled ${notification.type} notifications`);
                return;
            }

            // Send through enabled channels
            const deliveryPromises = [];

            if (preferences.push_enabled) {
                deliveryPromises.push(this.sendPushNotification(notification, user));
            }

            if (preferences.email_enabled) {
                deliveryPromises.push(this.sendEmailNotification(notification, user));
            }

            if (preferences.in_app_enabled) {
                deliveryPromises.push(this.sendInAppNotification(notification, user));
            }

            // Wait for all deliveries
            await Promise.allSettled(deliveryPromises);

            // Update notification status
            await supabase
                .from('notifications')
                .update({ status: 'sent', sent_at: new Date().toISOString() })
                .eq('id', notificationId);

        } catch (error) {
            console.error('Error sending notification:', error);
            
            // Mark as failed
            await supabase
                .from('notifications')
                .update({ status: 'failed' })
                .eq('id', notificationId);
        }
    }

    // Send push notification
    async sendPushNotification(notification, user) {
        try {
            // Get user's push subscriptions
            const { data: subscriptions } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true);

            if (!subscriptions || subscriptions.length === 0) {
                console.log(`No push subscriptions for user ${user.id}`);
                return;
            }

            const payload = JSON.stringify({
                title: notification.title,
                body: notification.message,
                icon: '/assets/images/logo.png',
                badge: '/assets/images/badge.png',
                data: {
                    notificationId: notification.id,
                    actionUrl: notification.action_url,
                    type: notification.type
                },
                actions: notification.action_url ? [{
                    action: 'open',
                    title: notification.action_text || 'View'
                }] : []
            });

            // Send to all subscriptions
            const sendPromises = subscriptions.map(async (subscription) => {
                try {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh_key,
                            auth: subscription.auth_key
                        }
                    };

                    const result = await webpush.sendNotification(pushSubscription, payload);
                    
                    // Record successful delivery
                    await supabase
                        .from('notification_deliveries')
                        .insert({
                            notification_id: notification.id,
                            channel: 'push',
                            status: 'sent',
                            external_id: result.headers?.location,
                            sent_at: new Date().toISOString()
                        });

                    return { success: true, subscription: subscription.id };
                } catch (error) {
                    console.error('Push notification failed:', error);
                    
                    // Record failed delivery
                    await supabase
                        .from('notification_deliveries')
                        .insert({
                            notification_id: notification.id,
                            channel: 'push',
                            status: 'failed',
                            error_message: error.message,
                            sent_at: new Date().toISOString()
                        });

                    // Deactivate invalid subscriptions
                    if (error.statusCode === 410) {
                        await supabase
                            .from('push_subscriptions')
                            .update({ is_active: false })
                            .eq('id', subscription.id);
                    }

                    return { success: false, error: error.message };
                }
            });

            await Promise.allSettled(sendPromises);
        } catch (error) {
            console.error('Error in sendPushNotification:', error);
        }
    }

    // Send email notification
    async sendEmailNotification(notification, user) {
        try {
            // Get email template
            const { data: template } = await supabase
                .from('notification_templates')
                .select('*')
                .eq('type', notification.type)
                .eq('channel', 'email')
                .eq('is_active', true)
                .order('version', { ascending: false })
                .limit(1)
                .single();

            if (!template) {
                console.log(`No email template found for type: ${notification.type}`);
                return;
            }

            // Prepare template variables
            const variables = {
                user_name: user.name,
                ...notification.metadata
            };

            // Render template
            const subject = this.renderTemplate(template.subject_template || template.title_template, variables);
            const htmlContent = this.renderEmailTemplate(template.message_template, variables, notification);

            // Send email
            const mailOptions = {
                from: `"JKUAT Innovation Club" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: subject,
                html: htmlContent,
                text: notification.message // Fallback plain text
            };

            const result = await emailTransporter.sendMail(mailOptions);

            // Record successful delivery
            await supabase
                .from('notification_deliveries')
                .insert({
                    notification_id: notification.id,
                    channel: 'email',
                    status: 'sent',
                    external_id: result.messageId,
                    sent_at: new Date().toISOString()
                });

        } catch (error) {
            console.error('Email notification failed:', error);
            
            // Record failed delivery
            await supabase
                .from('notification_deliveries')
                .insert({
                    notification_id: notification.id,
                    channel: 'email',
                    status: 'failed',
                    error_message: error.message,
                    sent_at: new Date().toISOString()
                });
        }
    }

    // Send in-app notification (just mark as delivered since it's stored in DB)
    async sendInAppNotification(notification, user) {
        try {
            // Record delivery
            await supabase
                .from('notification_deliveries')
                .insert({
                    notification_id: notification.id,
                    channel: 'in_app',
                    status: 'delivered',
                    sent_at: new Date().toISOString(),
                    delivered_at: new Date().toISOString()
                });

        } catch (error) {
            console.error('In-app notification failed:', error);
        }
    }

    // Helper methods
    getTypePreference(type, preferences) {
        const typeMap = {
            'event_reminder': preferences.event_reminders,
            'meeting_schedule': preferences.meeting_schedules,
            'payment_reminder': preferences.payment_reminders,
            'announcement': preferences.announcements,
            'idea_comment': preferences.idea_comments,
            'idea_collaboration': preferences.idea_collaborations,
            'election_period': preferences.election_periods,
            'system_alert': preferences.system_alerts
        };
        return typeMap[type] !== false;
    }

    renderTemplate(template, variables) {
        let rendered = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, value || '');
        }
        return rendered;
    }

    renderEmailTemplate(template, variables, notification) {
        const renderedContent = this.renderTemplate(template, variables);
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${notification.title}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                .button:hover { background: #059669; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>JKUAT Innovation Club</h1>
                </div>
                <div class="content">
                    <h2>${notification.title}</h2>
                    <div style="white-space: pre-line;">${renderedContent}</div>
                    ${notification.action_url ? `
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${notification.action_url}" class="button">${notification.action_text || 'View Details'}</a>
                        </p>
                    ` : ''}
                </div>
                <div class="footer">
                    <p>JKUAT Innovation and Entrepreneurship Club<br>
                    Jomo Kenyatta University of Agriculture and Technology</p>
                    <p><a href="${process.env.FRONTEND_URL}/settings">Manage notification preferences</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Bulk notification methods
    async createBulkNotification(data) {
        try {
            // Create campaign
            const { data: campaign, error } = await supabase
                .from('notification_campaigns')
                .insert([{
                    name: data.name,
                    description: data.description,
                    type: data.type,
                    target_audience: data.targetAudience || {},
                    title: data.title,
                    message: data.message,
                    action_url: data.actionUrl,
                    action_text: data.actionText,
                    scheduled_for: data.scheduledFor,
                    created_by: data.createdBy
                }])
                .select()
                .single();

            if (error) throw error;

            // Get target users
            const users = await this.getTargetUsers(data.targetAudience);
            
            // Update estimated recipients
            await supabase
                .from('notification_campaigns')
                .update({ estimated_recipients: users.length })
                .eq('id', campaign.id);

            // Create individual notifications
            if (!data.scheduledFor) {
                await this.sendBulkNotifications(campaign.id, users, data);
            }

            return campaign;
        } catch (error) {
            console.error('Error creating bulk notification:', error);
            throw error;
        }
    }

    async getTargetUsers(criteria) {
        let query = supabase.from('users').select('id, name, email');
        
        // Apply targeting criteria
        if (criteria.roles && criteria.roles.length > 0) {
            query = query.in('role', criteria.roles);
        }
        
        if (criteria.membershipStatus) {
            query = query.eq('membership_status', criteria.membershipStatus);
        }
        
        if (criteria.departments && criteria.departments.length > 0) {
            query = query.in('department', criteria.departments);
        }

        const { data: users, error } = await query;
        if (error) throw error;
        
        return users || [];
    }

    async sendBulkNotifications(campaignId, users, data) {
        try {
            // Update campaign status
            await supabase
                .from('notification_campaigns')
                .update({ 
                    status: 'sending', 
                    started_at: new Date().toISOString(),
                    actual_recipients: users.length 
                })
                .eq('id', campaignId);

            // Create notifications for each user
            const notifications = users.map(user => ({
                user_id: user.id,
                type: data.type,
                title: data.title,
                message: data.message,
                action_url: data.actionUrl,
                action_text: data.actionText,
                metadata: { ...data.metadata, campaign_id: campaignId }
            }));

            // Batch insert notifications
            const { data: createdNotifications, error } = await supabase
                .from('notifications')
                .insert(notifications)
                .select('id');

            if (error) throw error;

            // Send each notification
            const sendPromises = createdNotifications.map(notification => 
                this.sendNotification(notification.id)
            );

            await Promise.allSettled(sendPromises);

            // Update campaign status
            await supabase
                .from('notification_campaigns')
                .update({ 
                    status: 'completed', 
                    completed_at: new Date().toISOString() 
                })
                .eq('id', campaignId);

        } catch (error) {
            console.error('Error sending bulk notifications:', error);
            
            // Mark campaign as failed
            await supabase
                .from('notification_campaigns')
                .update({ status: 'failed' })
                .eq('id', campaignId);
        }
    }
}

const notificationService = new NotificationService();

// Routes

// Get user notifications
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, unread_only = false } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (unread_only === 'true') {
            query = query.is('read_at', null);
        }

        // Add expiration filter
        query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

        const { data: notifications, error } = await query;
        if (error) throw error;

        // Get unread count
        const { data: unreadCount } = await supabase
            .rpc('get_unread_count', { p_user_id: userId });

        res.json({
            notifications: notifications || [],
            unreadCount: unreadCount || 0,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                hasMore: notifications && notifications.length === parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { userId } = req.body;

        const { data: success } = await supabase
            .rpc('mark_notification_read', { 
                p_notification_id: notificationId, 
                p_user_id: userId 
            });

        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Notification not found or already read' });
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.patch('/user/:userId/read-all', async (req, res) => {
    try {
        const { userId } = req.params;

        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString(), status: 'read' })
            .eq('user_id', userId)
            .is('read_at', null);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});

// Create notification
router.post('/', async (req, res) => {
    try {
        const notification = await notificationService.createNotification(req.body);
        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// Create bulk notification
router.post('/bulk', async (req, res) => {
    try {
        const campaign = await notificationService.createBulkNotification(req.body);
        res.status(201).json(campaign);
    } catch (error) {
        console.error('Error creating bulk notification:', error);
        res.status(500).json({ error: 'Failed to create bulk notification' });
    }
});

// Subscribe to push notifications
router.post('/push/subscribe', async (req, res) => {
    try {
        const { userId, subscription, userAgent } = req.body;
        
        // Parse user agent for device info
        const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';
        const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                       userAgent.includes('Firefox') ? 'Firefox' : 
                       userAgent.includes('Safari') ? 'Safari' : 'Unknown';

        const { data, error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                p256dh_key: subscription.keys.p256dh,
                auth_key: subscription.keys.auth,
                user_agent: userAgent,
                device_type: deviceType,
                browser: browser,
                is_active: true,
                last_used_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,endpoint'
            })
            .select();

        if (error) throw error;

        res.json({ success: true, subscription: data[0] });
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        res.status(500).json({ error: 'Failed to subscribe to push notifications' });
    }
});

// Unsubscribe from push notifications
router.delete('/push/unsubscribe', async (req, res) => {
    try {
        const { userId, endpoint } = req.body;

        const { error } = await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('endpoint', endpoint);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
    }
});

// Get notification preferences
router.get('/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: preferences, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json(preferences || {});
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
});

// Update notification preferences
router.patch('/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;

        const { data, error } = await supabase
            .from('notification_preferences')
            .upsert({
                user_id: userId,
                ...preferences,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select();

        if (error) throw error;

        res.json(data[0]);
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: 'Failed to update notification preferences' });
    }
});

// Get VAPID public key for push notifications
router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Test notification endpoint (for development)
router.post('/test', async (req, res) => {
    try {
        const { userId, type = 'system_alert' } = req.body;
        
        const notification = await notificationService.createNotification({
            userId,
            type,
            title: 'Test Notification',
            message: 'This is a test notification to verify the system is working correctly.',
            priority: 'medium',
            actionUrl: '/dashboard',
            actionText: 'View Dashboard'
        });

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

// Cleanup old notifications (scheduled job endpoint)
router.post('/cleanup', async (req, res) => {
    try {
        const { data: deletedCount } = await supabase
            .rpc('cleanup_old_notifications');

        res.json({ success: true, deletedCount });
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
        res.status(500).json({ error: 'Failed to cleanup notifications' });
    }
});

module.exports = router;