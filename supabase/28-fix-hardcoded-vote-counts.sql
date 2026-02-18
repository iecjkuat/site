-- ============================================================================
-- FIX HARDCODED VOTE COUNTS
-- Reset all vote counts to match actual votes in idea_votes table
-- ============================================================================

-- This script will:
-- 1. Recalculate vote counts from actual idea_votes table
-- 2. Update ideas table with correct counts
-- 3. Remove any hardcoded/mock vote data

-- Step 1: Reset all vote counts to 0 first
UPDATE ideas 
SET 
    votes_count = 0,
    likes_count = 0,
    comments_count = 0;

-- Step 2: Update vote counts based on actual votes
UPDATE ideas i
SET 
    votes_count = COALESCE(vote_stats.likes, 0),
    likes_count = COALESCE(vote_stats.likes, 0)
FROM (
    SELECT 
        idea_id,
        COUNT(*) FILTER (WHERE vote_type = 'like') as likes,
        COUNT(*) FILTER (WHERE vote_type = 'dislike') as dislikes
    FROM idea_votes
    GROUP BY idea_id
) AS vote_stats
WHERE i.id = vote_stats.idea_id;

-- Step 3: Update comment counts based on actual comments
UPDATE ideas i
SET comments_count = COALESCE(comment_stats.count, 0)
FROM (
    SELECT 
        idea_id,
        COUNT(*) as count
    FROM idea_comments
    GROUP BY idea_id
) AS comment_stats
WHERE i.id = comment_stats.idea_id;

-- Step 4: Verify the results
SELECT 
    i.id,
    i.title,
    i.votes_count as stored_votes,
    i.likes_count as stored_likes,
    i.comments_count as stored_comments,
    COALESCE(actual_votes.likes, 0) as actual_likes,
    COALESCE(actual_votes.dislikes, 0) as actual_dislikes,
    COALESCE(actual_comments.count, 0) as actual_comments,
    CASE 
        WHEN i.votes_count = COALESCE(actual_votes.likes, 0) 
        THEN '✅ Votes Match' 
        ELSE '❌ Votes Mismatch' 
    END as vote_status,
    CASE 
        WHEN i.comments_count = COALESCE(actual_comments.count, 0) 
        THEN '✅ Comments Match' 
        ELSE '❌ Comments Mismatch' 
    END as comment_status
FROM ideas i
LEFT JOIN (
    SELECT 
        idea_id,
        COUNT(*) FILTER (WHERE vote_type = 'like') as likes,
        COUNT(*) FILTER (WHERE vote_type = 'dislike') as dislikes
    FROM idea_votes
    GROUP BY idea_id
) AS actual_votes ON i.id = actual_votes.idea_id
LEFT JOIN (
    SELECT 
        idea_id,
        COUNT(*) as count
    FROM idea_comments
    GROUP BY idea_id
) AS actual_comments ON i.id = actual_comments.idea_id
WHERE i.status = 'approved'
ORDER BY i.created_at DESC;

-- Step 5: Show summary
SELECT 
    'Total Ideas' as metric,
    COUNT(*) as count
FROM ideas
UNION ALL
SELECT 
    'Ideas with Votes' as metric,
    COUNT(DISTINCT idea_id) as count
FROM idea_votes
UNION ALL
SELECT 
    'Ideas with Comments' as metric,
    COUNT(DISTINCT idea_id) as count
FROM idea_comments
UNION ALL
SELECT 
    'Total Votes' as metric,
    COUNT(*) as count
FROM idea_votes
UNION ALL
SELECT 
    'Total Comments' as metric,
    COUNT(*) as count
FROM idea_comments;
