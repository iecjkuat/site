-- Add last_password_change column to users table for token invalidation
-- This allows invalidating all tokens issued before a password change

-- Add column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_last_password_change 
ON users(last_password_change);

-- Add comment
COMMENT ON COLUMN users.last_password_change IS 'Timestamp of last password change - used to invalidate old tokens';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'last_password_change';
