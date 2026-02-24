-- ============================================================================
-- Add All Users to Voter Eligibility for All Elections
-- ============================================================================
-- This script makes all active users eligible to vote in all elections
-- Run this if you're getting "403 Forbidden" when trying to vote

-- First, let's see what users exist
SELECT id, email FROM users LIMIT 10;

-- Make ALL users eligible for ALL elections
INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
SELECT 
    e.id as election_id,
    u.id as user_id,
    true as is_eligible,
    true as is_verified
FROM elections e
CROSS JOIN users u
WHERE NOT EXISTS (
    SELECT 1 FROM voter_eligibility ve 
    WHERE ve.election_id = e.id 
    AND ve.user_id = u.id
);

-- Verify eligibility was added
SELECT 
    e.title as election_title,
    u.email as user_email,
    ve.is_eligible,
    ve.is_verified,
    ve.created_at
FROM voter_eligibility ve
JOIN elections e ON e.id = ve.election_id
JOIN users u ON u.id = ve.user_id
ORDER BY e.title, u.email;


