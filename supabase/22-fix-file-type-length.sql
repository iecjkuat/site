-- Fix file_type column length in resources table
-- MIME types can be very long (e.g., application/vnd.openxmlformats-officedocument.wordprocessingml.document is 73 chars)

ALTER TABLE resources 
ALTER COLUMN file_type TYPE VARCHAR(150);

-- Verify the change
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'resources' 
AND column_name = 'file_type';
