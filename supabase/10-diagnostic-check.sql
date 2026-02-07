-- ============================================================================
-- Diagnostic Check - Verify all fixes are in place
-- ============================================================================

-- Check 1: Events table columns
SELECT 
  'Events Table Columns' as check_category,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND column_name IN ('event_date', 'start_date', 'end_date', 'event_type')
ORDER BY column_name;

-- Check 2: Projects table columns and constraints
SELECT 
  'Projects Table Columns' as check_category,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND column_name IN ('project_lead_id', 'is_incubation', 'category')
ORDER BY column_name;

SELECT 
  'Projects Foreign Keys' as check_category,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'projects' 
  AND constraint_type = 'FOREIGN KEY';

-- Check 3: Opportunities and categories
SELECT 
  'Opportunities Columns' as check_category,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
  AND column_name IN ('category_id', 'created_by', 'opportunity_type')
ORDER BY column_name;

SELECT 
  'Opportunities Foreign Keys' as check_category,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'opportunities' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Check 4: Ideas and categories
SELECT 
  'Ideas Columns' as check_category,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'ideas' 
  AND column_name IN ('category_id', 'created_by', 'status')
ORDER BY column_name;

SELECT 
  'Ideas Foreign Keys' as check_category,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'ideas' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Check 5: Category tables exist
SELECT 
  'Category Tables' as check_category,
  table_name
FROM information_schema.tables 
WHERE table_name IN ('opportunity_categories', 'idea_categories')
ORDER BY table_name;

-- Check 6: Sample data from categories
SELECT 'Opportunity Categories Count' as check_category, COUNT(*) as count 
FROM opportunity_categories;

SELECT 'Idea Categories Count' as check_category, COUNT(*) as count 
FROM idea_categories;

-- Final summary
SELECT 
  'SUMMARY' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_date')
    THEN '✓' ELSE '✗' 
  END as event_date_exists,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'projects_project_lead_id_fkey')
    THEN '✓' ELSE '✗' 
  END as projects_fkey_exists,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'opportunities_category_id_fkey')
    THEN '✓' ELSE '✗' 
  END as opportunities_fkey_exists,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ideas_category_id_fkey')
    THEN '✓' ELSE '✗' 
  END as ideas_fkey_exists;
