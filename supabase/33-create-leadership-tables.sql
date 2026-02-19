-- ============================================================================
-- Leadership Tables and Storage Setup
-- ============================================================================

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
CREATE TABLE IF NOT EXISTS executive_committee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID, -- Optional, no foreign key constraint
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL, -- e.g., 'Chairperson', 'Vice Chairperson', 'Secretary', 'Treasurer'
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
    social_links JSONB DEFAULT '{}', -- {linkedin: '', twitter: '', github: ''}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club Patrons Table
CREATE TABLE IF NOT EXISTS club_patrons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID, -- Optional, no foreign key constraint
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL, -- e.g., 'Senior Lecturer', 'Professor'
    department VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    office_location VARCHAR(255),
    bio TEXT,
    specialization TEXT[], -- Array of specializations
    profile_image_url TEXT,
    storage_path VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_executive_committee_club_id ON executive_committee(club_id);
CREATE INDEX IF NOT EXISTS idx_executive_committee_position ON executive_committee(position);
CREATE INDEX IF NOT EXISTS idx_executive_committee_active ON executive_committee(is_active);
CREATE INDEX IF NOT EXISTS idx_executive_committee_display_order ON executive_committee(display_order);

CREATE INDEX IF NOT EXISTS idx_club_patrons_club_id ON club_patrons(club_id);
CREATE INDEX IF NOT EXISTS idx_club_patrons_active ON club_patrons(is_active);
CREATE INDEX IF NOT EXISTS idx_club_patrons_display_order ON club_patrons(display_order);

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
