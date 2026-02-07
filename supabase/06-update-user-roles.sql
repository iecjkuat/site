-- =====================================================
-- Update User Roles
-- =====================================================
-- This script updates user roles for testing

-- First, let's see what users we have
SELECT id, name, email, role, membership_status 
FROM users 
ORDER BY created_at DESC;

-- Update admin@jkuat.ac.ke to admin role
UPDATE users 
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@jkuat.ac.ke';

-- Update the test user to executive role
UPDATE users 
SET role = 'executive',
    updated_at = NOW()
WHERE email = 'test.user@students.jkuat.ac.ke';

-- Verify the changes
SELECT id, name, email, role, membership_status 
FROM users 
WHERE email IN ('admin@jkuat.ac.ke', 'test.user@students.jkuat.ac.ke')
ORDER BY role;

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
