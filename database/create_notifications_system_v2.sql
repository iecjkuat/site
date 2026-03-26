-- =====================================================
-- JKUAT Innovation Club - Notification System (Safe Version)
-- Run this step by step if you encounter errors
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Create notifications table
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Notification Content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Action/Link
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending',
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_notifications_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT chk_notifications_status CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed'))
);

-- Add foreign key only if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

SELECT 'Step 1: notifications table created' AS status;

-- =====================================================
-- STEP 2: Create notification_preferences table
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    
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
    digest_frequency VARCHAR(20) DEFAULT 'daily',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_digest_frequency CHECK (digest_frequency IN ('daily', 'weekly', 'monthly'))
);

-- Add foreign key only if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE notification_preferences 
        ADD CONSTRAINT fk_notification_preferences_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

SELECT 'Step 2: notification_preferences table created' AS status;

-- =====================================================
-- STEP 3: Create notification_templates table
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Identity
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    
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
    created_by UUID,
    last_modified_by UUID,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_template_channel CHECK (channel IN ('email', 'push', 'in_app', 'sms'))
);

-- Add foreign keys only if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE notification_templates 
        ADD CONSTRAINT fk_notification_templates_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id);
        
        ALTER TABLE notification_templates 
        ADD CONSTRAINT fk_notification_templates_modified_by 
        FOREIGN KEY (last_modified_by) REFERENCES users(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_channel ON notification_templates(channel);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

SELECT 'Step 3: notification_templates table created' AS status;

-- =====================================================
-- STEP 4: Create notification_campaigns table
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
    status VARCHAR(20) DEFAULT 'draft',
    
    -- Analytics
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_campaign_status CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'))
);

-- Add foreign key only if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE notification_campaigns 
        ADD CONSTRAINT fk_notification_campaigns_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_created_by ON notification_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_scheduled ON notification_campaigns(scheduled_for);

SELECT 'Step 4: notification_campaigns table created' AS status;

-- =====================================================
-- STEP 5: Create notification_deliveries table
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL,
    
    -- Delivery Details
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    
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
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_delivery_channel CHECK (channel IN ('email', 'push', 'in_app', 'sms')),
    CONSTRAINT chk_delivery_status CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced'))
);

-- Add foreign key
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE notification_deliveries 
        ADD CONSTRAINT fk_notification_deliveries_notification_id 
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_channel ON notification_deliveries(channel);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status);

SELECT 'Step 5: notification_deliveries table created' AS status;

-- =====================================================
-- STEP 6: Create push_subscriptions table
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
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

-- Add foreign key only if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE push_subscriptions 
        ADD CONSTRAINT fk_push_subscriptions_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

SELECT 'Step 6: push_subscriptions table created' AS status;

-- =====================================================
-- STEP 7: Create database functions
-- =====================================================

-- Function: Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = p_user_id
        AND read_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
        AND status != 'failed'
    );
END;
$$ LANGUAGE plpgsql;

SELECT 'Function get_unread_count created' AS status;

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

SELECT 'Function mark_notification_read created' AS status;

-- Function: Cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE read_at IS NOT NULL
    AND read_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
    
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

SELECT 'Function cleanup_old_notifications created' AS status;

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
        COUNT(*) FILTER (WHERE n.status IN ('sent', 'delivered', 'read')) as total_sent,
        COUNT(*) FILTER (WHERE n.status IN ('delivered', 'read')) as total_delivered,
        COUNT(*) FILTER (WHERE n.status = 'read') as total_read,
        COUNT(*) FILTER (WHERE n.status = 'failed') as total_failed,
        ROUND(
            COUNT(*) FILTER (WHERE n.status IN ('delivered', 'read'))::NUMERIC / 
            NULLIF(COUNT(*) FILTER (WHERE n.status IN ('sent', 'delivered', 'read', 'failed')), 0) * 100,
            2
        ) as delivery_rate,
        ROUND(
            COUNT(*) FILTER (WHERE n.status = 'read')::NUMERIC / 
            NULLIF(COUNT(*) FILTER (WHERE n.status IN ('delivered', 'read')), 0) * 100,
            2
        ) as read_rate
    FROM notifications n
    WHERE n.created_at::DATE BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

SELECT 'Function get_notification_stats created' AS status;

-- =====================================================
-- STEP 8: Create triggers
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_campaigns_updated_at ON notification_campaigns;
CREATE TRIGGER update_notification_campaigns_updated_at BEFORE UPDATE ON notification_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Triggers created' AS status;

-- =====================================================
-- STEP 9: Create default preferences for existing users
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        INSERT INTO notification_preferences (user_id)
        SELECT id FROM users
        WHERE id NOT IN (SELECT user_id FROM notification_preferences)
        ON CONFLICT (user_id) DO NOTHING;
        
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Created default preferences for % users', v_count;
    ELSE
        RAISE NOTICE 'Users table not found - skipping default preferences';
    END IF;
END $$;

SELECT 'Default preferences created' AS status;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================
SELECT 
    'Notification System Setup Complete!' AS message,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'notification%' OR table_name = 'push_subscriptions') AS tables_created,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name LIKE '%notification%') AS functions_created,
    (SELECT COUNT(*) FROM notification_preferences) AS default_preferences_created;
