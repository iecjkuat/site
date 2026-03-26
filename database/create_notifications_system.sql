-- =====================================================
-- JKUAT Innovation Club - Comprehensive Notification System
-- Database Schema
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. NOTIFICATIONS TABLE
-- Core table for storing all notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Action/Link
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

COMMENT ON TABLE notifications IS 'Stores all user notifications across the platform';
COMMENT ON COLUMN notifications.type IS 'Type of notification: event_reminder, payment_reminder, announcement, etc.';
COMMENT ON COLUMN notifications.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN notifications.metadata IS 'Additional data in JSON format';
COMMENT ON COLUMN notifications.related_entity_type IS 'Type of related entity: event, payment, idea, etc.';
COMMENT ON COLUMN notifications.related_entity_id IS 'ID of the related entity';

-- =====================================================
-- 2. NOTIFICATION_PREFERENCES TABLE
-- User-specific notification settings
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Channel Preferences
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    
    -- Type-Specific Preferences
    event_reminders BOOLEAN DEFAULT true,
    meeting_schedules BOOLEAN DEFAULT true,
    payment_reminders BOOLEAN DEFAULT true,
    announcements BOOLEAN DEFAULT true,
    idea_comments BOOLEAN DEFAULT true,
    idea_collaborations BOOLEAN DEFAULT true,
    election_periods BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    project_updates BOOLEAN DEFAULT true,
    membership_updates BOOLEAN DEFAULT true,
    
    -- Advanced Settings
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    digest_enabled BOOLEAN DEFAULT false,
    digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

COMMENT ON TABLE notification_preferences IS 'User-specific notification preferences and settings';
COMMENT ON COLUMN notification_preferences.quiet_hours_enabled IS 'Whether to suppress notifications during quiet hours';
COMMENT ON COLUMN notification_preferences.digest_enabled IS 'Whether to receive digest emails instead of individual notifications';

-- =====================================================
-- 3. NOTIFICATION_TEMPLATES TABLE
-- Reusable notification templates
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Identity
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'push', 'in_app', 'sms')),
    
    -- Template Content
    title_template VARCHAR(255),
    subject_template VARCHAR(255),
    message_template TEXT NOT NULL,
    
    -- Template Variables
    variables JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    last_modified_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_channel ON notification_templates(channel);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

COMMENT ON TABLE notification_templates IS 'Reusable templates for notifications';
COMMENT ON COLUMN notification_templates.variables IS 'Array of variable names used in template (e.g., ["user_name", "event_title"])';
COMMENT ON COLUMN notification_templates.version IS 'Template version number for tracking changes';

-- =====================================================
-- 4. NOTIFICATION_CAMPAIGNS TABLE
-- Bulk notification campaigns
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Campaign Identity
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    
    -- Targeting
    target_audience JSONB DEFAULT '{}',
    estimated_recipients INTEGER DEFAULT 0,
    actual_recipients INTEGER DEFAULT 0,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled')),
    
    -- Analytics
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_created_by ON notification_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_scheduled ON notification_campaigns(scheduled_for);

COMMENT ON TABLE notification_campaigns IS 'Bulk notification campaigns for mass communication';
COMMENT ON COLUMN notification_campaigns.target_audience IS 'JSON criteria for targeting users (e.g., {"roles": ["member"], "membership_status": "active"})';
COMMENT ON COLUMN notification_campaigns.sent_count IS 'Number of notifications sent';
COMMENT ON COLUMN notification_campaigns.delivered_count IS 'Number of notifications delivered';
COMMENT ON COLUMN notification_campaigns.read_count IS 'Number of notifications read';
COMMENT ON COLUMN notification_campaigns.click_count IS 'Number of action links clicked';

-- =====================================================
-- 5. NOTIFICATION_DELIVERIES TABLE
-- Tracks delivery attempts per channel
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    
    -- Delivery Details
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'push', 'in_app', 'sms')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    
    -- External Service Tracking
    external_id VARCHAR(255),
    external_response JSONB,
    
    -- Error Tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_channel ON notification_deliveries(channel);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status);

COMMENT ON TABLE notification_deliveries IS 'Tracks delivery attempts for each notification channel';
COMMENT ON COLUMN notification_deliveries.external_id IS 'ID from external service (e.g., email service message ID)';
COMMENT ON COLUMN notification_deliveries.external_response IS 'Full response from external service';

-- =====================================================
-- 6. PUSH_SUBSCRIPTIONS TABLE
-- Web push notification subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription Details
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    
    -- Device Information
    user_agent TEXT,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions for users';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Public key for encryption';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Authentication secret';

-- =====================================================
-- 7. DATABASE FUNCTIONS
-- =====================================================

-- Function: Get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = p_user_id
        AND read_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
        AND status != 'failed'
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unread_count IS 'Returns the count of unread notifications for a user';

-- Function: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE notifications
    SET read_at = NOW(),
        status = 'read',
        updated_at = NOW()
    WHERE id = p_notification_id
    AND user_id = p_user_id
    AND read_at IS NULL;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_notification_read IS 'Marks a notification as read and returns success status';

-- Function: Cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    -- Delete read notifications older than 90 days
    DELETE FROM notifications
    WHERE read_at IS NOT NULL
    AND read_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    -- Delete expired notifications
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
    
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_notifications IS 'Removes old read notifications and expired notifications';

-- Function: Get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    total_sent BIGINT,
    total_delivered BIGINT,
    total_read BIGINT,
    total_failed BIGINT,
    delivery_rate NUMERIC,
    read_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'read')) as total_sent,
        COUNT(*) FILTER (WHERE status IN ('delivered', 'read')) as total_delivered,
        COUNT(*) FILTER (WHERE status = 'read') as total_read,
        COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
        ROUND(
            COUNT(*) FILTER (WHERE status IN ('delivered', 'read'))::NUMERIC / 
            NULLIF(COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'read', 'failed')), 0) * 100,
            2
        ) as delivery_rate,
        ROUND(
            COUNT(*) FILTER (WHERE status = 'read')::NUMERIC / 
            NULLIF(COUNT(*) FILTER (WHERE status IN ('delivered', 'read')), 0) * 100,
            2
        ) as read_rate
    FROM notifications
    WHERE created_at::DATE BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_notification_stats IS 'Returns notification statistics for a date range';

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_campaigns_updated_at BEFORE UPDATE ON notification_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DEFAULT NOTIFICATION PREFERENCES
-- Create default preferences for existing users
-- =====================================================
DO $$
BEGIN
    -- Create default preferences for existing users who don't have them
    INSERT INTO notification_preferences (user_id)
    SELECT id FROM users
    WHERE id NOT IN (SELECT user_id FROM notification_preferences)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Default notification preferences created for existing users';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create default preferences: %', SQLERRM;
END $$;

-- =====================================================
-- 10. SAMPLE NOTIFICATION TEMPLATES
-- =====================================================

-- Only insert templates if we have at least one admin user
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Get first admin user ID
    SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Only proceed if admin exists
    IF v_admin_id IS NOT NULL THEN
        -- Email template for event reminders
        INSERT INTO notification_templates (name, description, type, channel, title_template, subject_template, message_template, variables, created_by)
        VALUES (
            'Event Reminder Email',
            'Email template for event reminders',
            'event_reminder',
            'email',
            'Reminder: {{event_title}}',
            'Reminder: {{event_title}} is coming up!',
            'Hi {{user_name}},

This is a friendly reminder that {{event_title}} is scheduled for {{event_date}} at {{event_time}}.

Location: {{event_location}}

Don''t forget to mark your calendar!

See you there!',
            '["user_name", "event_title", "event_date", "event_time", "event_location"]'::jsonb,
            v_admin_id
        )
        ON CONFLICT DO NOTHING;

        -- Push notification template for announcements
        INSERT INTO notification_templates (name, description, type, channel, title_template, message_template, variables, created_by)
        VALUES (
            'Announcement Push',
            'Push notification template for announcements',
            'announcement',
            'push',
            'New Announcement',
            '{{announcement_title}}: {{announcement_preview}}',
            '["announcement_title", "announcement_preview"]'::jsonb,
            v_admin_id
        )
        ON CONFLICT DO NOTHING;

        -- In-app template for payment reminders
        INSERT INTO notification_templates (name, description, type, channel, title_template, message_template, variables, created_by)
        VALUES (
            'Payment Reminder',
            'In-app notification for payment reminders',
            'payment_reminder',
            'in_app',
            'Payment Reminder',
            'Your {{payment_type}} payment of {{amount}} is due on {{due_date}}. Please complete your payment to maintain your membership.',
            '["payment_type", "amount", "due_date"]'::jsonb,
            v_admin_id
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample notification templates created successfully';
    ELSE
        RAISE NOTICE 'No admin user found - skipping sample template creation';
    END IF;
END $$;

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'notification%' OR table_name = 'push_subscriptions'
ORDER BY table_name;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename LIKE 'notification%' OR tablename = 'push_subscriptions'
ORDER BY tablename, indexname;

-- Check functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%notification%'
ORDER BY routine_name;

-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table LIKE 'notification%' OR event_object_table = 'push_subscriptions'
ORDER BY event_object_table, trigger_name;

-- Count default preferences created
SELECT COUNT(*) as default_preferences_created
FROM notification_preferences;

-- Count sample templates
SELECT COUNT(*) as sample_templates_created
FROM notification_templates;

-- =====================================================
-- 12. SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Get all unread notifications for a user
-- SELECT * FROM notifications WHERE user_id = 'USER_ID' AND read_at IS NULL ORDER BY created_at DESC;

-- Get notification statistics for last 30 days
-- SELECT * FROM get_notification_stats(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

-- Get user's notification preferences
-- SELECT * FROM notification_preferences WHERE user_id = 'USER_ID';

-- Get active push subscriptions for a user
-- SELECT * FROM push_subscriptions WHERE user_id = 'USER_ID' AND is_active = true;

-- Get campaign performance
-- SELECT name, status, sent_count, delivered_count, read_count, 
--        ROUND((delivered_count::NUMERIC / NULLIF(sent_count, 0)) * 100, 2) as delivery_rate,
--        ROUND((read_count::NUMERIC / NULLIF(delivered_count, 0)) * 100, 2) as read_rate
-- FROM notification_campaigns
-- WHERE status = 'completed'
-- ORDER BY created_at DESC;

-- =====================================================
-- ROLLBACK SCRIPT (Use only if needed)
-- =====================================================

/*
-- WARNING: This will delete all notification data

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
DROP TRIGGER IF EXISTS update_notification_campaigns_updated_at ON notification_campaigns;
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;

DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_unread_count(UUID);
DROP FUNCTION IF EXISTS mark_notification_read(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_old_notifications();
DROP FUNCTION IF EXISTS get_notification_stats(DATE, DATE);

DROP TABLE IF EXISTS notification_deliveries CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notification_campaigns CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================
