-- ============================================================================
-- Setup Supabase Storage for Resources
-- ============================================================================

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  false, -- Not public by default, will use signed URLs
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resources bucket

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

-- Allow public read for public resources (optional)
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
