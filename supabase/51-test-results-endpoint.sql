-- Test script to verify results data
-- This checks if votes exist and what the results endpoint should return

-- 1. Check if we have any votes
SELECT 
    'Total Votes' as check_type,
    COUNT(*) as count
FROM votes;

-- 2. Check votes by election
SELECT 
    e.title as election_title,
    e.status,
    e.end_date,
    COUNT(v.id) as vote_count
FROM elections e
LEFT JOIN positions p ON p.election_id = e.id
LEFT JOIN votes v ON v.position_id = p.id
GROUP BY e.id, e.title, e.status, e.end_date
ORDER BY e.created_at DESC;

-- 3. Check detailed vote breakdown for completed elections
SELECT 
    e.title as election_title,
    e.status,
    p.title as position_title,
    c.name as candidate_name,
    COUNT(v.id) as vote_count
FROM elections e
JOIN positions p ON p.election_id = e.id
JOIN candidates c ON c.position_id = p.id
LEFT JOIN votes v ON v.candidate_id = c.id
WHERE e.status = 'completed' OR e.end_date < NOW()
GROUP BY e.id, e.title, e.status, p.id, p.title, c.id, c.name
ORDER BY e.title, p.display_order, COUNT(v.id) DESC;

-- 4. Check voter participation
SELECT 
    e.title as election_title,
    COUNT(DISTINCT vp.user_id) as users_who_voted,
    COUNT(DISTINCT ve.user_id) as eligible_voters
FROM elections e
LEFT JOIN voter_participation vp ON vp.election_id = e.id
LEFT JOIN voter_eligibility ve ON ve.election_id = e.id
WHERE e.status = 'completed' OR e.end_date < NOW()
GROUP BY e.id, e.title;

-- 5. Sample what the results endpoint should return for one election
-- (Replace the election_id with an actual completed election ID)
SELECT 
    e.id as election_id,
    e.title as election_title,
    e.anonymous_voting,
    p.id as position_id,
    p.title as position_title,
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as vote_count
FROM elections e
JOIN positions p ON p.election_id = e.id
JOIN candidates c ON c.position_id = p.id
LEFT JOIN votes v ON v.candidate_id = c.id
WHERE e.status = 'completed' OR e.end_date < NOW()
GROUP BY e.id, e.title, e.anonymous_voting, p.id, p.title, c.id, c.name
ORDER BY e.title, p.display_order, COUNT(v.id) DESC
LIMIT 20;
