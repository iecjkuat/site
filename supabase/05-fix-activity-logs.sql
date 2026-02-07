-- =====================================================
-- Fix Activity Logs Table - Add Missing Columns
-- =====================================================

-- Add the missing 'details' column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' AND column_name = 'details'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN details JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add other potentially missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN entity_type VARCHAR(50);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN entity_id UUID;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN ip_address VARCHAR(45);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN user_agent TEXT;
    END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Add comments
COMMENT ON COLUMN activity_logs.details IS 'Additional details about the action (JSON)';
COMMENT ON COLUMN activity_logs.entity_type IS 'Type of entity acted upon (e.g., USER, EVENT, PAYMENT)';
COMMENT ON COLUMN activity_logs.entity_id IS 'ID of the entity acted upon';
COMMENT ON COLUMN activity_logs.ip_address IS 'IP address of the user';
COMMENT ON COLUMN activity_logs.user_agent IS 'Browser user agent string';
