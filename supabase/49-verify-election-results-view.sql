-- ============================================================================
-- Verify Election Results View
-- ============================================================================

-- Check if the view exists
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views
WHERE viewname = 'election_results';

-- Show the view definition
SELECT pg_get_viewdef('election_results', true);

-- Test the view with sample data
SELECT * FROM election_results LIMIT 5;

-- Check what columns the view has
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'election_results'
ORDER BY ordinal_position;
