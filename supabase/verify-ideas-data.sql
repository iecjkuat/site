-- ============================================================================
-- VERIFY IDEAS DATA
-- Run this to check if ideas were inserted successfully
-- ============================================================================

-- Check if idea_categories exist
SELECT 'Categories:' as check_type, COUNT(*) as count FROM idea_categories;
SELECT * FROM idea_categories ORDER BY name;

-- Check if ideas exist
SELECT 'Ideas:' as check_type, COUNT(*) as count FROM ideas;

-- Check ideas by status
SELECT 'Ideas by status:' as check_type, status, COUNT(*) as count 
FROM ideas 
GROUP BY status;

-- Check ideas with details
SELECT 
    i.id,
    i.title,
    i.status,
    ic.name as category,
    i.votes_count,
    i.comments_count,
    i.likes_count,
    i.looking_for_team,
    i.created_at
FROM ideas i
LEFT JOIN idea_categories ic ON i.category_id = ic.id
ORDER BY i.created_at DESC;

-- Check if users exist
SELECT 'Users:' as check_type, COUNT(*) as count FROM users;
