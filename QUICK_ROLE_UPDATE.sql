-- =====================================================
-- QUICK ROLE UPDATE - Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: See current users
SELECT name, email, role, membership_status FROM users ORDER BY created_at DESC;

-- Step 2: Update admin@jkuat.ac.ke to admin
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@jkuat.ac.ke';

-- Step 3: Update test.user to executive
UPDATE users 
SET role = 'executive', updated_at = NOW()
WHERE email = 'test.user@students.jkuat.ac.ke';

-- Step 4: Verify changes
SELECT 
    name,
    email,
    role,
    membership_status
FROM users 
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'executive' THEN 2
        WHEN 'member' THEN 3
    END;

-- Expected result:
-- Denis Mugo    | admin@jkuat.ac.ke                  | admin     | active
-- Test User     | test.user@students.jkuat.ac.ke     | executive | active
-- (other users) | ...                                | member    | active
