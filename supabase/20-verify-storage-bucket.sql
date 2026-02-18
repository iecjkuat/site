-- Verify storage bucket exists and check policies

-- Check if bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'resources';

-- Check storage policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%resource%';

-- Check if we can list objects in the bucket (should be empty initially)
-- Note: This is a query, not a storage operation
SELECT COUNT(*) as file_count
FROM storage.objects
WHERE bucket_id = 'resources';
