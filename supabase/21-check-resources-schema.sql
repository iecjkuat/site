-- Check resources table schema to find VARCHAR(50) column
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'resources'
ORDER BY ordinal_position;
