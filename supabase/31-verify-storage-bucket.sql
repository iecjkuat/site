-- ============================================================================
-- Verify Storage Bucket for Resources
-- ============================================================================

-- Check if resources bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'resources';

-- If no results, the bucket doesn't exist and needs to be created

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

-- Check if we can list objects in the bucket
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'resources'
ORDER BY created_at DESC
LIMIT 10;

-- Count total files in resources bucket
SELECT COUNT(*) as total_files
FROM storage.objects
WHERE bucket_id = 'resources';
