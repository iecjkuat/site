-- ============================================================================
-- Drop and Recreate Leadership Tables
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS executive_committee CASCADE;
DROP TABLE IF EXISTS club_patrons CASCADE;

-- Drop existing trigger function if it exists
DROP FUNCTION IF EXISTS update_leadership_updated_at() CASCADE;

-- Create storage bucket for leadership profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'leadership',
  'leadership',
  true, -- Public for profile images
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can upload leadership images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read leadership images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete leadership images" ON storage.objects;

-- Storage policies for leadership bucket
CREATE POLICY "Authenticated users can upload leadership images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'leadership');

CREATE POLICY "Anyone can read leadership images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'leadership');

CREATE POLICY "Admins can delete leadership images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'leadership' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Executive Committee Table
CREATE TABLE executive_committee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    course VARCHAR(255),
    year_of_study VARCHAR(50),
    profile_image_url TEXT,
    storage_path VARCHAR(500),
    office_hours VARCHAR(255),
    term_start_date DATE,
    term_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club Patrons Table
CREATE TABLE club_patrons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    office_location VARCHAR(255),
    bio TEXT,
    specialization TEXT[],
    profile_image_url TEXT,
    storage_path VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_executive_committee_position ON executive_committee(position);
CREATE INDEX idx_executive_committee_active ON executive_committee(is_active);
CREATE INDEX idx_executive_committee_display_order ON executive_committee(display_order);

CREATE INDEX idx_club_patrons_active ON club_patrons(is_active);
CREATE INDEX idx_club_patrons_display_order ON club_patrons(display_order);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leadership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER executive_committee_updated_at
    BEFORE UPDATE ON executive_committee
    FOR EACH ROW
    EXECUTE FUNCTION update_leadership_updated_at();

CREATE TRIGGER club_patrons_updated_at
    BEFORE UPDATE ON club_patrons
    FOR EACH ROW
    EXECUTE FUNCTION update_leadership_updated_at();

-- Comments
COMMENT ON TABLE executive_committee IS 'Student executive committee members';
COMMENT ON TABLE club_patrons IS 'Faculty patrons and mentors';
COMMENT ON COLUMN executive_committee.display_order IS 'Order for displaying members (lower numbers first)';
COMMENT ON COLUMN club_patrons.display_order IS 'Order for displaying patrons (lower numbers first)';

-- Verify tables were created
SELECT 
    'executive_committee' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'executive_committee'
ORDER BY ordinal_position;

SELECT 
    'club_patrons' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'club_patrons'
ORDER BY ordinal_position;
