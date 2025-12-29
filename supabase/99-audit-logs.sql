-- Create activity_logs table if it implies compliance
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        action TEXT NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        entity_type TEXT,
        entity_id UUID,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
-- RLS Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
-- Admins can view all logs
CREATE POLICY "Admins can view all logs" ON activity_logs FOR
SELECT USING (
        auth.uid() IN (
            SELECT id
            FROM users
            WHERE role IN ('admin', 'executive', 'super_admin')
        )
    );
-- Users can view their own logs
CREATE POLICY "Users can view own logs" ON activity_logs FOR
SELECT USING (auth.uid() = user_id);
-- System can insert logs (service role or authenticated users performing actions)
CREATE POLICY "System can insert logs" ON activity_logs FOR
INSERT WITH CHECK (true);