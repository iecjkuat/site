-- ============================================================================
-- Create Storage Bucket for Resources (If Missing)
-- ============================================================================

-- First, check if bucket exists
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    -- Check if resources bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'resources'
    ) INTO bucket_exists;
    
    IF bucket_exists THEN
        RAISE NOTICE '✅ Resources bucket already exists';
    ELSE
        RAISE NOTICE '❌ Resources bucket does not exist - creating now...';
        
        -- Create storage bucket for resources
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'resources',
            'resources',
            true, -- Make public for easier access (can be changed to false for signed URLs only)
            10485760, -- 10MB limit
            ARRAY[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/zip',
                'application/x-zip-compressed'
            ]
        );
        
        RAISE NOTICE '✅ Resources bucket created successfully';
    END IF;
END $$;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read resources" ON storage.objects;
DROP POLICY IF EXISTS "Resource owners and admins can delete" ON storage.objects;
DROP POLICY IF EXISTS "Public can read public resources" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read resources" ON storage.objects;

-- Create storage policies

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow authenticated users to read resources
CREATE POLICY "Authenticated users can read resources"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resources');

-- Allow anyone to read resources (for public access)
CREATE POLICY "Anyone can read resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow resource owners and admins to delete
CREATE POLICY "Resource owners and admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND (
    auth.uid() = owner OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  )
);

-- Allow resource owners and admins to update
CREATE POLICY "Resource owners and admins can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resources' AND (
    auth.uid() = owner OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  )
);

-- Verify setup
SELECT 
    '✅ Bucket Setup Complete' as status,
    id,
    name,
    public,
    file_size_limit / 1024 / 1024 as size_limit_mb,
    array_length(allowed_mime_types, 1) as allowed_types_count
FROM storage.buckets
WHERE id = 'resources';

-- Show policies
SELECT 
    '✅ Storage Policies' as status,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%resource%'
ORDER BY policyname;
