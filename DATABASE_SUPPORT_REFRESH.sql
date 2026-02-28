-- Refresh Supabase Schema Cache for Support Tables
-- Run this after creating/modifying the support_tickets table

-- First, verify the table exists and check its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('support_tickets', 'support_ticket_replies')
ORDER BY table_name, ordinal_position;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative: You can also restart the PostgREST service from Supabase Dashboard
-- Go to: Project Settings > API > Restart PostgREST

-- Verify the table is accessible
SELECT COUNT(*) as ticket_count FROM support_tickets;
SELECT COUNT(*) as reply_count FROM support_ticket_replies;
