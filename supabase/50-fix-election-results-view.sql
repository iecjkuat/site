-- ============================================================================
-- Fix Election Results View
-- ============================================================================
-- Recreate the view without using rank() function

DROP VIEW IF EXISTS election_results CASCADE;

CREATE VIEW election_results AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    e.anonymous_voting,
    p.id as position_id,
    p.title as position_title,
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as vote_count,
    ROUND(
        COUNT(v.id) * 100.0 / 
        NULLIF(SUM(COUNT(v.id)) OVER (PARTITION BY p.id), 0), 
        2
    ) as vote_percentage,
    RANK() OVER (PARTITION BY p.id ORDER BY COUNT(v.id) DESC) as candidate_rank
FROM elections e
JOIN positions p ON p.election_id = e.id
JOIN candidates c ON c.position_id = p.id
LEFT JOIN votes v ON v.candidate_id = c.id
GROUP BY e.id, e.title, e.anonymous_voting, p.id, p.title, c.id, c.name
ORDER BY e.id, p.display_order, vote_count DESC;

-- Verify the view works
SELECT * FROM election_results LIMIT 5;
