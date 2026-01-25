-- Remove Invitation System - Complete Migration to Supabase Auth Only
-- This removes the password_hash column and any invitation-related functionality

-- Remove password_hash column from users table since we now use Supabase Auth exclusively
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Update any existing users to ensure they have proper Supabase Auth integration
-- Note: This is a data migration that should be run carefully in production

-- Add a comment to document the change
COMMENT ON TABLE users IS 'Users table - Uses Supabase Auth for authentication, no local password storage';

-- Update any sample data that might have password_hash references
-- This ensures clean state for new installations