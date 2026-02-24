-- Comprehensive debug script for voting system
-- Run this to understand what's happening with votes and results

-- 1. Check all elections
SELECT 
    id,
    title,
    status,
    start_date,
    end_date,
    anonymous_voting,
    results_visible,
    CASE 
        WHEN status = 'completed' THEN 'Completed'
        WHEN NOW() > end_date THEN 'Ended (not marked completed)'
        WHEN NOW() < start_date THEN 'Not started'
        ELSE 'Active'
    END as actual_status
FROM elections
ORDER BY created_at DESC;

-- 2. Check all votes in the system
SELECT 
    v.id as vote_id,
    e.title as election_title,
    p.title as position_title,
    c.name as candidate_name,
    v.voter_id,
    v.created_at as voted_at,
    e.anonymous_voting
FROM votes v
JOIN elections e ON e.id = v.election_id
JOIN positions p ON p.id = v.position_id
JOIN candidates c ON c.id = v.candidate_id
ORDER BY v.created_at DESC
LIMIT 50;

-- 3. Vote counts by election
SELECT 
    e.id as election_id,
    e.title as election_title,
    e.status,
    e.anonymous_voting,
    COUNT(v.id) as total_votes,
    COUNT(DISTINCT v.voter_id) as unique_voters
FROM elections e
LEFT JOIN positions p ON p.election_id = e.id
LEFT JOIN votes v ON v.position_id = p.id
GROUP BY e.id, e.title, e.status, e.anonymous_voting
ORDER BY e.created_at DESC;

-- 4. Detailed results for each completed election
-- This mimics what the API endpoint should return
SELECT 
    e.id as election_id,
    e.title as election_title,
    e.anonymous_voting,
    p.id as position_id,
    p.title as position_title,
    p.display_order,
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as vote_count,
    ROUND(
        CASE 
            WHEN SUM(COUNT(v.id)) OVER (PARTITION BY p.id) > 0 
            THEN (COUNT(v.id)::numeric / SUM(COUNT(v.id)) OVER (PARTITION BY p.id) * 100)
            ELSE 0 
        END, 
        2
    ) as vote_percentage
FROM elections e
JOIN positions p ON p.election_id = e.id
JOIN candidates c ON c.position_id = p.id AND c.is_active = true
LEFT JOIN votes v ON v.candidate_id = c.id
WHERE e.status = 'completed' OR e.end_date < NOW()
GROUP BY e.id, e.title, e.anonymous_voting, p.id, p.title, p.display_order, c.id, c.name
ORDER BY e.title, p.display_order, vote_count DESC;

-- 5. Check voter participation
SELECT 
    e.title as election_title,
    e.anonymous_voting,
    COUNT(DISTINCT vp.user_id) as participated_count,
    COUNT(DISTINCT ve.user_id) as eligible_count
FROM elections e
LEFT JOIN voter_participation vp ON vp.election_id = e.id
LEFT JOIN voter_eligibility ve ON ve.election_id = e.id AND ve.is_eligible = true
GROUP BY e.id, e.title, e.anonymous_voting
ORDER BY e.created_at DESC;

-- 6. Check if there are any orphaned votes (votes without matching candidates)
SELECT 
    v.id as vote_id,
    v.election_id,
    v.position_id,
    v.candidate_id,
    v.created_at,
    CASE 
        WHEN c.id IS NULL THEN 'Candidate not found'
        WHEN p.id IS NULL THEN 'Position not found'
        WHEN e.id IS NULL THEN 'Election not found'
        ELSE 'OK'
    END as status
FROM votes v
LEFT JOIN candidates c ON c.id = v.candidate_id
LEFT JOIN positions p ON p.id = v.position_id
LEFT JOIN elections e ON e.id = v.election_id
WHERE c.id IS NULL OR p.id IS NULL OR e.id IS NULL;

-- 7. Sample a specific election's results (pick the first completed one)
DO $$
DECLARE
    sample_election_id UUID;
BEGIN
    -- Get first completed election
    SELECT id INTO sample_election_id
    FROM elections
    WHERE status = 'completed' OR end_date < NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF sample_election_id IS NOT NULL THEN
        RAISE NOTICE 'Sample election ID: %', sample_election_id;
        
        -- Show what the API should return for this election
        RAISE NOTICE 'Results for this election:';
    END IF;
END $$;
