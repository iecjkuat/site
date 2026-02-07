# Fix Activity Logs Table

## Issue
The `activity_logs` table is missing the `details` column, causing audit log failures:
```
FAILED TO WRITE AUDIT LOG: LOGIN Could not find the 'details' column of 'activity_logs' in the schema cache
```

## Solution
Run the new migration file to create the `activity_logs` table with the correct schema.

## Steps to Fix

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Run the Migration
Copy and paste the contents of `supabase/04-activity-logs.sql` into the SQL editor and click "Run".

Or copy this SQL directly:

```sql
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
```

### 3. Verify the Table
After running the migration, verify the table exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid)
- user_id (uuid)
- action (character varying)
- details (jsonb) ← This is the missing column
- entity_type (character varying)
- entity_id (uuid)
- ip_address (character varying)
- user_agent (text)
- created_at (timestamp with time zone)

### 4. Test the Fix
After running the migration:
1. Try logging in again
2. Check the server logs - the error should be gone
3. Verify activity logs are being created:

```sql
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

## What This Table Does

The `activity_logs` table tracks all user activities for:
- **Security**: Monitor login attempts, failed logins, suspicious activities
- **Audit**: Track who did what and when
- **Compliance**: Maintain records for regulatory requirements
- **Analytics**: Understand user behavior patterns

### Example Log Entries:
- User login/logout
- Profile updates
- Password changes
- Payment transactions
- Content creation/deletion
- Admin actions

## Schema Details

### Columns:
- **id**: Unique identifier for each log entry
- **user_id**: References the user who performed the action
- **action**: Type of action (LOGIN, UPDATE_PROFILE, etc.)
- **details**: JSON object with additional context (IP, metadata, etc.)
- **entity_type**: Type of entity affected (USER, EVENT, PAYMENT, etc.)
- **entity_id**: ID of the affected entity
- **ip_address**: User's IP address
- **user_agent**: Browser/client information
- **created_at**: Timestamp of the action

### Indexes:
- Fast lookups by user_id
- Fast filtering by action type
- Fast sorting by date (most recent first)
- Fast queries by entity type and ID

## After Fix

Once the table is created, the auth system will automatically:
- ✅ Log all login attempts
- ✅ Track user registrations
- ✅ Record profile updates
- ✅ Monitor security events
- ✅ No more error messages in logs

## Note

This is a non-breaking change. The auth system will continue to work even if the audit log fails (it's designed to fail gracefully). However, having the audit log is important for security and compliance.
