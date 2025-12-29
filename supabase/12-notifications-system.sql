-- JKUAT Innovation Club - Notifications & Alerts System
-- This file creates the complete notifications infrastructure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notification Types Enum
CREATE TYPE notification_type AS ENUM (
    'event_reminder',
    'meeting_schedule',
    'payment_reminder',
    'announcement',
    'idea_comment',
    'idea_collaboration',
    'election_period',
    'system_alert',
    'welcome',
    'achievement'
);

-- Notification Priority Enum
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Notification Status Enum
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- Notification Channels Enum
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'in_app', 'sms');

-- Main Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    priority notification_priority DEFAULT 'medium',
    status notification_status DEFAULT 'pending',
    
    -- Content
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    related_entity_type VARCHAR(50), -- 'event', 'idea', 'payment', etc.
    related_entity_id UUID,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Channels Table (tracks which channels were used)
CREATE TABLE notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
    status notification_status DEFAULT 'pending',
    
    -- Channel-specific data
    external_id VARCHAR(200), -- Push notification ID, email message ID, etc.
    response_data JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Timing
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Notification Preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    
    -- Type preferences
    event_reminders BOOLEAN DEFAULT true,
    meeting_schedules BOOLEAN DEFAULT true,
    payment_reminders BOOLEAN DEFAULT true,
    announcements BOOLEAN DEFAULT true,
    idea_comments BOOLEAN DEFAULT true,
    idea_collaborations BOOLEAN DEFAULT true,
    election_periods BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    
    -- Timing preferences
    email_digest_frequency VARCHAR(20) DEFAULT 'daily', -- 'immediate', 'daily', 'weekly', 'never'
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Push Notification Subscriptions (for web push)
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Push subscription data
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    
    -- Device info
    user_agent TEXT,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, endpoint)
);

-- Notification Templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    
    -- Template content
    name VARCHAR(100) NOT NULL,
    subject_template TEXT, -- For email
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    action_text_template TEXT,
    
    -- Template variables (JSON schema)
    variables JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(type, channel, version)
);

-- Notification Campaigns (for bulk notifications)
CREATE TABLE notification_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Campaign details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type notification_type NOT NULL,
    
    -- Targeting
    target_audience JSONB DEFAULT '{}', -- Criteria for selecting users
    estimated_recipients INTEGER DEFAULT 0,
    actual_recipients INTEGER DEFAULT 0,
    
    -- Content
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed', 'cancelled'
    
    -- Stats
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE INDEX idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_channel ON notification_deliveries(channel);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_deliveries_updated_at BEFORE UPDATE ON notification_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_campaigns_updated_at BEFORE UPDATE ON notification_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for notification management

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type notification_type,
    p_title VARCHAR(200),
    p_message TEXT,
    p_priority notification_priority DEFAULT 'medium',
    p_action_url VARCHAR(500) DEFAULT NULL,
    p_action_text VARCHAR(100) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_related_entity_type VARCHAR(50) DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, type, title, message, priority, action_url, action_text,
        metadata, related_entity_type, related_entity_id, scheduled_for
    ) VALUES (
        p_user_id, p_type, p_title, p_message, p_priority, p_action_url, p_action_text,
        p_metadata, p_related_entity_type, p_related_entity_id, p_scheduled_for
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET read_at = NOW(), status = 'read'
    WHERE id = p_notification_id AND user_id = p_user_id AND read_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM notifications
    WHERE user_id = p_user_id AND read_at IS NULL AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete notifications older than 90 days that have been read
    DELETE FROM notifications
    WHERE read_at IS NOT NULL AND read_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired notifications
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification templates
INSERT INTO notification_templates (type, channel, name, title_template, message_template, action_text_template, variables) VALUES
-- Event Reminders
('event_reminder', 'push', 'Event Reminder - Push', 'Event Tomorrow: {{event_title}}', 'Don''t forget about {{event_title}} starting at {{event_time}} at {{event_location}}', 'View Event', '{"event_title": "string", "event_time": "string", "event_location": "string", "event_id": "string"}'),
('event_reminder', 'email', 'Event Reminder - Email', 'Reminder: {{event_title}}', 'Hi {{user_name}},\n\nThis is a friendly reminder about the upcoming event:\n\n**{{event_title}}**\nDate: {{event_date}}\nTime: {{event_time}}\nLocation: {{event_location}}\n\n{{event_description}}\n\nSee you there!', 'View Event Details', '{"user_name": "string", "event_title": "string", "event_date": "string", "event_time": "string", "event_location": "string", "event_description": "string", "event_id": "string"}'),
('event_reminder', 'in_app', 'Event Reminder - In-App', 'Event Tomorrow: {{event_title}}', 'Don''t forget about {{event_title}} starting at {{event_time}} at {{event_location}}', 'View Event', '{"event_title": "string", "event_time": "string", "event_location": "string", "event_id": "string"}'),

-- Meeting Schedules
('meeting_schedule', 'push', 'Meeting Schedule - Push', 'Meeting: {{meeting_title}}', 'You have a meeting scheduled for {{meeting_time}} - {{meeting_title}}', 'Join Meeting', '{"meeting_title": "string", "meeting_time": "string", "meeting_link": "string"}'),
('meeting_schedule', 'email', 'Meeting Schedule - Email', 'Meeting Invitation: {{meeting_title}}', 'Hi {{user_name}},\n\nYou''re invited to attend:\n\n**{{meeting_title}}**\nDate: {{meeting_date}}\nTime: {{meeting_time}}\nLocation: {{meeting_location}}\n\nAgenda:\n{{meeting_agenda}}\n\nPlease confirm your attendance.', 'Join Meeting', '{"user_name": "string", "meeting_title": "string", "meeting_date": "string", "meeting_time": "string", "meeting_location": "string", "meeting_agenda": "string", "meeting_link": "string"}'),

-- Payment Reminders
('payment_reminder', 'push', 'Payment Reminder - Push', 'Payment Due: {{amount}}', 'Your payment of {{amount}} for {{item}} is due on {{due_date}}', 'Pay Now', '{"amount": "string", "item": "string", "due_date": "string", "payment_id": "string"}'),
('payment_reminder', 'email', 'Payment Reminder - Email', 'Payment Reminder: {{amount}} Due', 'Hi {{user_name}},\n\nThis is a reminder that your payment is due:\n\nAmount: {{amount}}\nFor: {{item}}\nDue Date: {{due_date}}\n\nPlease make your payment to avoid any late fees.', 'Pay Now', '{"user_name": "string", "amount": "string", "item": "string", "due_date": "string", "payment_id": "string"}'),

-- Announcements
('announcement', 'push', 'Announcement - Push', '{{title}}', '{{message}}', 'Read More', '{"title": "string", "message": "string", "announcement_id": "string"}'),
('announcement', 'email', 'Announcement - Email', '{{title}}', 'Hi {{user_name}},\n\n{{message}}\n\nBest regards,\nJKUAT Innovation Club', 'Read More', '{"user_name": "string", "title": "string", "message": "string", "announcement_id": "string"}'),

-- Idea Comments
('idea_comment', 'push', 'Idea Comment - Push', 'New comment on your idea', '{{commenter_name}} commented on "{{idea_title}}"', 'View Comment', '{"commenter_name": "string", "idea_title": "string", "idea_id": "string"}'),
('idea_comment', 'email', 'Idea Comment - Email', 'New Comment on Your Idea', 'Hi {{user_name}},\n\n{{commenter_name}} left a comment on your idea "{{idea_title}}":\n\n"{{comment_text}}"\n\nReply to keep the conversation going!', 'View & Reply', '{"user_name": "string", "commenter_name": "string", "idea_title": "string", "comment_text": "string", "idea_id": "string"}'),

-- Idea Collaborations
('idea_collaboration', 'push', 'Collaboration Request - Push', 'Collaboration request for your idea', '{{requester_name}} wants to collaborate on "{{idea_title}}"', 'View Request', '{"requester_name": "string", "idea_title": "string", "idea_id": "string"}'),
('idea_collaboration', 'email', 'Collaboration Request - Email', 'Collaboration Request for Your Idea', 'Hi {{user_name}},\n\n{{requester_name}} is interested in collaborating on your idea "{{idea_title}}".\n\nMessage: {{request_message}}\n\nSkills offered: {{skills_offered}}\n\nReview their request and decide if you''d like to collaborate!', 'Review Request', '{"user_name": "string", "requester_name": "string", "idea_title": "string", "request_message": "string", "skills_offered": "string", "idea_id": "string"}'),

-- Election Periods
('election_period', 'push', 'Election Notice - Push', 'Club Elections: {{election_title}}', 'Voting is now open for {{election_title}}. Cast your vote by {{deadline}}', 'Vote Now', '{"election_title": "string", "deadline": "string", "election_id": "string"}'),
('election_period', 'email', 'Election Notice - Email', 'Club Elections: Time to Vote!', 'Hi {{user_name}},\n\nVoting is now open for {{election_title}}!\n\nElection Period: {{start_date}} - {{end_date}}\nDeadline: {{deadline}}\n\nPositions available:\n{{positions}}\n\nYour vote matters - participate in shaping the future of our club!', 'Cast Your Vote', '{"user_name": "string", "election_title": "string", "start_date": "string", "end_date": "string", "deadline": "string", "positions": "string", "election_id": "string"}');

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Create a function to automatically create preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_notification_preferences
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

COMMENT ON TABLE notifications IS 'Main notifications table storing all user notifications';
COMMENT ON TABLE notification_deliveries IS 'Tracks delivery status across different channels';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification types and channels';
COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions';
COMMENT ON TABLE notification_templates IS 'Templates for different notification types and channels';
COMMENT ON TABLE notification_campaigns IS 'Bulk notification campaigns';