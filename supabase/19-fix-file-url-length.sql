-- Fix file_url column length in resources table
-- The column is too short to store full Supabase Storage URLs
-- We need to drop the policy that references this column first

-- Step 1: Drop ALL storage policies that reference the resources table
DROP POLICY IF EXISTS "Public can read public resources" ON storage.objects;
DROP POLICY IF EXISTS "Resource owners and admins can delete" ON storage.objects;

-- Step 2: Alter the column types
ALTER TABLE resources 
ALTER COLUMN file_url TYPE VARCHAR(1000);

ALTER TABLE resources 
ALTER COLUMN storage_path TYPE VARCHAR(1000);

-- Step 3: Recreate the storage policies

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

-- Allow public read for public resources
CREATE POLICY "Public can read public resources"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM resources
    WHERE resources.file_url LIKE '%' || storage.objects.name || '%'
    AND resources.access_level = 'public'
  )
);

-- Verify the changes
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'resources' 
AND column_name IN ('file_url', 'storage_path');
