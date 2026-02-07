-- =====================================================
-- Elevate 'exec' User to Executive Role
-- =====================================================

-- First, find the user named 'exec'
SELECT id, name, email, role, membership_status 
FROM users 
WHERE name ILIKE '%exec%'
ORDER BY created_at DESC;

-- Update the user to executive role
UPDATE users 
SET role = 'executive',
    updated_at = NOW()
WHERE name ILIKE '%exec%';

-- Verify the change
SELECT id, name, email, role, membership_status, created_at
FROM users 
WHERE name ILIKE '%exec%';

-- Show all users with their roles
SELECT 
    name,
    email,
    role,
    membership_status,
    created_at
FROM users 
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'executive' THEN 2
        WHEN 'member' THEN 3
        ELSE 4
    END,
    created_at DESC;
