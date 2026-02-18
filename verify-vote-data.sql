-- Verify vote data is real (not mock data)

-- 1. Check the idea with 63 votes
SELECT 
    i.id,
    i.title,
    i.votes_count,
    i.dislikes_count,
    i.created_at
FROM ideas i
WHERE i.id = 'beb68709-ff05-44ad-a6cc-204286d89705';

-- 2. Count actual votes for this idea
SELECT 
    vote_type,
    COUNT(*) as count
FROM idea_votes
WHERE idea_id = 'beb68709-ff05-44ad-a6cc-204286d89705'
GROUP BY vote_type;

-- 3. Check total votes in idea_votes table
SELECT COUNT(*) as total_votes FROM idea_votes;

-- 4. Check if votes_count matches actual votes
SELECT 
    i.id,
    i.title,
    i.votes_count as stored_count,
    COUNT(iv.id) FILTER (WHERE iv.vote_type = 'like') as actual_likes,
    COUNT(iv.id) FILTER (WHERE iv.vote_type = 'dislike') as actual_dislikes,
    CASE 
        WHEN i.votes_count = COUNT(iv.id) FILTER (WHERE iv.vote_type = 'like') 
        THEN '✅ Match' 
        ELSE '❌ Mismatch' 
    END as status
FROM ideas i
LEFT JOIN idea_votes iv ON i.id = iv.idea_id
WHERE i.id = 'beb68709-ff05-44ad-a6cc-204286d89705'
GROUP BY i.id, i.title, i.votes_count;

-- 5. Check all ideas vote counts
SELECT 
    i.id,
    i.title,
    i.votes_count as stored_count,
    COUNT(iv.id) FILTER (WHERE iv.vote_type = 'like') as actual_likes,
    CASE 
        WHEN i.votes_count = COUNT(iv.id) FILTER (WHERE iv.vote_type = 'like') 
        THEN '✅' 
        ELSE '❌' 
    END as match
FROM ideas i
LEFT JOIN idea_votes iv ON i.id = iv.idea_id
GROUP BY i.id, i.title, i.votes_count
ORDER BY i.votes_count DESC
LIMIT 10;
