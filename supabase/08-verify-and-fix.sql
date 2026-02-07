-- ============================================================================
-- Verification and Alternative Fixes
-- ============================================================================

-- Check if event_date column exists
SELECT 
  column_name, 
  data_type,
  is_generated,
  generation_expression
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND column_name IN ('event_date', 'start_date');

-- Check projects foreign key
SELECT 
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'projects' 
  AND constraint_type = 'FOREIGN KEY';

-- Check opportunities foreign key to categories
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'opportunities' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Check ideas foreign key to categories
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'ideas' 
  AND tc.constraint_type = 'FOREIGN KEY';
