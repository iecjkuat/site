-- =============================================
-- VERIFY STORAGE BUCKETS
-- =============================================
-- Check if voting storage buckets exist

-- List all storage buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name IN ('candidate-photos', 'voting-images', 'voting-videos')
ORDER BY name;

-- If no results, the buckets don't exist
-- Run supabase/42-create-voting-storage-buckets.sql first
