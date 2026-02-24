-- Quick check to see if we can manually build results
-- This tests the same logic the API uses

-- Pick a completed election
WITH completed_election AS (
    SELECT id, title, status, end_date, anonymous_voting, results_visible
    FROM elections
    WHERE status = 'completed' OR end_date < NOW()
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    ce.id as election_id,
    ce.title as election_title,
    ce.status,
    ce.end_date,
    ce.results_visible,
    CASE 
        WHEN ce.status = 'completed' THEN true
        WHEN ce.end_date < NOW() THEN true
        ELSE false
    END as should_show_results
FROM completed_election ce;

-- Check positions for that election
WITH completed_election AS (
    SELECT id FROM elections
    WHERE status = 'completed' OR end_date < NOW()
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    p.id as position_id,
    p.title as position_title,
    p.display_order
FROM positions p
JOIN completed_election ce ON p.election_id = ce.id
ORDER BY p.display_order;

-- Check candidates for those positions
WITH completed_election AS (
    SELECT id FROM elections
    WHERE status = 'completed' OR end_date < NOW()
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    p.title as position_title,
    c.id as candidate_id,
    c.name as candidate_name,
    c.is_active
FROM candidates c
JOIN positions p ON c.position_id = p.id
JOIN completed_election ce ON p.election_id = ce.id
WHERE c.is_active = true
ORDER BY p.display_order, c.name;

-- Check vote counts
WITH completed_election AS (
    SELECT id FROM elections
    WHERE status = 'completed' OR end_date < NOW()
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    p.title as position_title,
    c.name as candidate_name,
    COUNT(v.id) as vote_count
FROM candidates c
JOIN positions p ON c.position_id = p.id
JOIN completed_election ce ON p.election_id = ce.id
LEFT JOIN votes v ON v.candidate_id = c.id
WHERE c.is_active = true
GROUP BY p.id, p.title, p.display_order, c.id, c.name
ORDER BY p.display_order, vote_count DESC;

-- Final results format (what API should return)
WITH completed_election AS (
    SELECT id, title, anonymous_voting FROM elections
    WHERE status = 'completed' OR end_date < NOW()
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    ce.id as election_id,
    ce.title as election_title,
    ce.anonymous_voting,
    p.id as position_id,
    p.title as position_title,
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as vote_count,
    CASE 
        WHEN SUM(COUNT(v.id)) OVER (PARTITION BY p.id) > 0 
        THEN ROUND((COUNT(v.id)::numeric / SUM(COUNT(v.id)) OVER (PARTITION BY p.id) * 100), 2)
        ELSE 0 
    END as vote_percentage
FROM completed_election ce
JOIN positions p ON p.election_id = ce.id
JOIN candidates c ON c.position_id = p.id AND c.is_active = true
LEFT JOIN votes v ON v.candidate_id = c.id
GROUP BY ce.id, ce.title, ce.anonymous_voting, p.id, p.title, p.display_order, c.id, c.name
ORDER BY p.display_order, vote_count DESC;
