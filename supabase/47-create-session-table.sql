-- Supabase Migration: Create session table for connect-pg-simple
-- Run: node scripts/run-sql-direct.js supabase/47-create-session-table.sql

CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
) WITH (autovacuum_enabled=true, autovacuum_analyze_scale_factor=0.05);

SELECT pg_catalog.pg_extension_install('btree_gin');
CREATE UNIQUE INDEX IF NOT EXISTS user_sessions_pkey ON user_sessions (sid);
CREATE INDEX IF NOT EXISTS user_sessions_expire_idx ON user_sessions (expire);

-- RLS: Only admins/service can manage sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON user_sessions FOR ALL USING (true) WITH CHECK (false);
CREATE POLICY "Admin cleanup" ON user_sessions FOR DELETE USING (auth.role() = 'service_role');
