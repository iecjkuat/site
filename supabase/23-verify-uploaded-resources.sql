-- Check if resources were uploaded successfully
SELECT 
    id,
    title,
    category,
    file_name,
    file_type,
    file_size,
    access_level,
    uploaded_by,
    created_at
FROM resources
ORDER BY created_at DESC
LIMIT 10;
