-- =============================================
-- CHECK VOTE IMAGES
-- =============================================
-- Verify that images are stored in the database

-- Check the most recent election
SELECT id, title, election_type, anonymous_voting, status, created_at
FROM elections
ORDER BY created_at DESC
LIMIT 1;

-- Check positions for the latest election
SELECT p.id, p.title, p.election_id
FROM positions p
JOIN elections e ON e.id = p.election_id
ORDER BY e.created_at DESC, p.display_order
LIMIT 5;


-- Check candidates with their media info
SELECT 
    c.id,
    c.name,
    c.media_type,
    c.media_url,
    c.thumbnail_url,
    p.title as position_title,
    e.title as election_title
FROM candidates c
JOIN positions p ON p.id = c.position_id
JOIN elections e ON e.id = p.election_id
ORDER BY e.created_at DESC, c.display_order
LIMIT 10;
