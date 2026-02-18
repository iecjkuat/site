-- Verify Storage Bucket Setup
-- Run this to check if everything is configured correctly

-- Check if resources bucket exists
SELECT 
    'Storage Bucket Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'resources') 
        THEN '✅ Resources bucket exists'
        ELSE '❌ Resources bucket NOT found - Run 17-setup-storage.sql'
    END as status;

-- Check if storage_path column exists in resources table
SELECT 
    'Database Column Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'resources' 
            AND column_name = 'storage_path'
        ) 
        THEN '✅ storage_path column exists'
        ELSE '❌ storage_path column NOT found - Run 18-add-storage-path-column.sql'
    END as status;

-- Check storage policies
SELECT 
    'Storage Policies Check' as check_type,
    COUNT(*) || ' policies found' as status
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Show bucket details if it exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'resources';
