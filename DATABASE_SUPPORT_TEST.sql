-- Test Support Tickets System
-- Run this to verify everything is working

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('support_tickets', 'support_ticket_replies');

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'support_tickets'
ORDER BY ordinal_position;

-- 3. Count tickets
SELECT COUNT(*) as total_tickets FROM support_tickets;

-- 4. View all tickets (bypassing RLS for testing)
SELECT 
    id,
    user_id,
    subject,
    status,
    priority,
    created_at
FROM support_tickets
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('support_tickets', 'support_ticket_replies');

-- 6. Check user roles (to verify admin users)
SELECT id, name, email, role
FROM users
WHERE role IN ('admin', 'executive', 'super_admin')
LIMIT 5;

-- 7. Test if a specific ticket exists
SELECT 
    st.*,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role
FROM support_tickets st
LEFT JOIN users u ON u.id = st.user_id
WHERE st.id = 'd2f85810-9f4d-44be-8227-af1c47203f42';
