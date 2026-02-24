-- =============================================
-- VOTING STORAGE BUCKETS
-- =============================================
-- Create storage buckets for voting media uploads
-- Run this file to set up storage for candidate photos, images, and videos

-- Create bucket for candidate profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'candidate-photos',
    'candidate-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for voting images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'voting-images',
    'voting-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for voting videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'voting-videos',
    'voting-videos',
    true,
    104857600, -- 100MB limit
    ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Policy: Allow authenticated users to upload candidate photos
CREATE POLICY "Authenticated users can upload candidate photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'candidate-photos');

-- Policy: Allow public read access to candidate photos
CREATE POLICY "Public read access to candidate photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'candidate-photos');

-- Policy: Allow admins to delete candidate photos
CREATE POLICY "Admins can delete candidate photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'candidate-photos' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'super_admin')
    )
);

-- Policy: Allow authenticated users to upload voting images
CREATE POLICY "Authenticated users can upload voting images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voting-images');

-- Policy: Allow public read access to voting images
CREATE POLICY "Public read access to voting images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'voting-images');

-- Policy: Allow admins to delete voting images
CREATE POLICY "Admins can delete voting images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'voting-images' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'super_admin')
    )
);

-- Policy: Allow authenticated users to upload voting videos
CREATE POLICY "Authenticated users can upload voting videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voting-videos');

-- Policy: Allow public read access to voting videos
CREATE POLICY "Public read access to voting videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'voting-videos');

-- Policy: Allow admins to delete voting videos
CREATE POLICY "Admins can delete voting videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'voting-videos' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'super_admin')
    )
);

-- =============================================
-- VERIFICATION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Voting storage buckets created successfully!';
    RAISE NOTICE '📦 Buckets: candidate-photos, voting-images, voting-videos';
    RAISE NOTICE '🔒 Storage policies configured';
END $$;
