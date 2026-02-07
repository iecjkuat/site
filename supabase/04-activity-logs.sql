-- =====================================================
-- Activity Logs Table
-- =====================================================
-- This table tracks all user activities and security events

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Comments
COMMENT ON TABLE activity_logs IS 'Tracks all user activities and security events';
COMMENT ON COLUMN activity_logs.user_id IS 'User who performed the action';
COMMENT ON COLUMN activity_logs.action IS 'Action performed (e.g., LOGIN, UPDATE_PROFILE, PAYMENT_INITIATED)';
COMMENT ON COLUMN activity_logs.details IS 'Additional details about the action (JSON)';
COMMENT ON COLUMN activity_logs.entity_type IS 'Type of entity acted upon (e.g., USER, EVENT, PAYMENT)';
COMMENT ON COLUMN activity_logs.entity_id IS 'ID of the entity acted upon';
COMMENT ON COLUMN activity_logs.ip_address IS 'IP address of the user';
COMMENT ON COLUMN activity_logs.user_agent IS 'Browser user agent string';
