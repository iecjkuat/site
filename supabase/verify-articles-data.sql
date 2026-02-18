-- Verify articles table and data
SELECT 
  'Articles:' as check_type,
  COUNT(*) as count
FROM articles;

-- Show sample articles
SELECT 
  id,
  title,
  category,
  status,
  views,
  likes,
  created_at
FROM articles
ORDER BY created_at DESC
LIMIT 5;
