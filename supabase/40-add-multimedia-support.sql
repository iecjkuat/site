-- ============================================================================
-- Add Multimedia Support to Voting System
-- ============================================================================

-- Add media columns to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'profile')),
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update existing candidates to have profile type
UPDATE candidates SET media_type = 'profile' WHERE image_url IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN candidates.media_type IS 'Type of voting option: text (simple text), image (vote on images), video (vote on videos), profile (candidate with photo)';
COMMENT ON COLUMN candidates.media_url IS 'URL for image or video content';
COMMENT ON COLUMN candidates.thumbnail_url IS 'Thumbnail URL for videos or large images';

-- Create index for media queries
CREATE INDEX IF NOT EXISTS idx_candidates_media_type ON candidates(media_type);

DO $$
BEGIN
    RAISE NOTICE '✅ Multimedia support added to voting system!';
END $$;
