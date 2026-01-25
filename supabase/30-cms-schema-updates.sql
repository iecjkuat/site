-- CMS Schema Updates for Production Backend Integration
-- Adds modern CMS features to existing tables

-- Update articles table for modern CMS
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS content_delta JSONB,
ADD COLUMN IF NOT EXISTS content_html TEXT,
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);

-- Update content column to be nullable (since we now have content_html and content_delta)
ALTER TABLE articles ALTER COLUMN content DROP NOT NULL;

-- Update view_count column name to match CMS expectations
ALTER TABLE articles RENAME COLUMN view_count TO views;

-- Update events table for CMS compatibility
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS description_html TEXT,
ADD COLUMN IF NOT EXISTS banner_image VARCHAR(500),
ADD COLUMN IF NOT EXISTS participants_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS author_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS type VARCHAR(50);

-- Map existing event_type to type for CMS compatibility
UPDATE events SET type = event_type WHERE type IS NULL;

-- Map existing description to description_html for CMS compatibility
UPDATE events SET description_html = description WHERE description_html IS NULL;

-- Map existing created_by to author_id for CMS compatibility
UPDATE events SET author_id = created_by WHERE author_id IS NULL;

-- Rename fee to registration_fee for CMS compatibility
ALTER TABLE events RENAME COLUMN fee TO registration_fee;

-- Rename registration_required to requires_registration for CMS compatibility
ALTER TABLE events RENAME COLUMN registration_required TO requires_registration;

-- Update opportunities table for CMS compatibility
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS description_html TEXT,
ADD COLUMN IF NOT EXISTS salary VARCHAR(100),
ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS author_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS type VARCHAR(50);

-- Map existing fields for CMS compatibility
UPDATE opportunities SET description_html = description WHERE description_html IS NULL;
UPDATE opportunities SET author_id = posted_by WHERE author_id IS NULL;
UPDATE opportunities SET type = opportunity_type WHERE type IS NULL;

-- Rename application_deadline to deadline for CMS compatibility
ALTER TABLE opportunities RENAME COLUMN application_deadline TO deadline;

-- Update media_files table for CMS compatibility
ALTER TABLE media_files 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS url VARCHAR(500),
ADD COLUMN IF NOT EXISTS size INTEGER,
ADD COLUMN IF NOT EXISTS type VARCHAR(100),
ADD COLUMN IF NOT EXISTS uploader_name VARCHAR(255);

-- Map existing fields for CMS compatibility
UPDATE media_files SET name = original_name WHERE name IS NULL;
UPDATE media_files SET url = file_path WHERE url IS NULL;
UPDATE media_files SET size = file_size WHERE size IS NULL;
UPDATE media_files SET type = mime_type WHERE type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_author_id ON events(author_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_author_id ON opportunities(author_id);

CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(type);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);

-- Update RLS policies for CMS access
-- Articles policies
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Articles can be created by authenticated users" ON articles;
DROP POLICY IF EXISTS "Articles can be updated by author or admin" ON articles;
DROP POLICY IF EXISTS "Articles can be deleted by author or admin" ON articles;

CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

CREATE POLICY "Articles can be created by executives and admins" ON articles
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

CREATE POLICY "Articles can be updated by author, executives, or admins" ON articles
    FOR UPDATE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

CREATE POLICY "Articles can be deleted by author, executives, or admins" ON articles
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

-- Events policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Events can be created by authenticated users" ON events;
DROP POLICY IF EXISTS "Events can be updated by creator or admin" ON events;
DROP POLICY IF EXISTS "Events can be deleted by creator or admin" ON events;

CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Events can be created by executives and admins" ON events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

CREATE POLICY "Events can be updated by author, executives, or admins" ON events
    FOR UPDATE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

CREATE POLICY "Events can be deleted by author, executives, or admins" ON events
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

-- Opportunities policies
DROP POLICY IF EXISTS "Opportunities are viewable by everyone" ON opportunities;
DROP POLICY IF EXISTS "Opportunities can be created by authenticated users" ON opportunities;
DROP POLICY IF EXISTS "Opportunities can be updated by poster or admin" ON opportunities;
DROP POLICY IF EXISTS "Opportunities can be deleted by poster or admin" ON opportunities;

CREATE POLICY "Opportunities are viewable by everyone" ON opportunities
    FOR SELECT USING (true);

CREATE POLICY "Opportunities can be created by executives and admins" ON opportunities
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

CREATE POLICY "Opportunities can be updated by author, executives, or admins" ON opportunities
    FOR UPDATE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

CREATE POLICY "Opportunities can be deleted by author, executives, or admins" ON opportunities
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

-- Media files policies
DROP POLICY IF EXISTS "Media files are viewable by everyone" ON media_files;
DROP POLICY IF EXISTS "Media files can be uploaded by authenticated users" ON media_files;
DROP POLICY IF EXISTS "Media files can be deleted by uploader or admin" ON media_files;

CREATE POLICY "Media files are viewable by everyone" ON media_files
    FOR SELECT USING (true);

CREATE POLICY "Media files can be uploaded by executives and admins" ON media_files
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

CREATE POLICY "Media files can be deleted by uploader, executives, or admins" ON media_files
    FOR DELETE USING (
        auth.uid() = uploaded_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('executive', 'admin')
        )
    );

-- Create function to automatically set author_name from user profile
CREATE OR REPLACE FUNCTION set_author_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Set author_name from user profile
    SELECT CONCAT(first_name, ' ', last_name) INTO NEW.author_name
    FROM users 
    WHERE id = NEW.author_id;
    
    -- Fallback to email if name not available
    IF NEW.author_name IS NULL OR NEW.author_name = ' ' THEN
        SELECT email INTO NEW.author_name
        FROM users 
        WHERE id = NEW.author_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically set author_name
DROP TRIGGER IF EXISTS set_article_author_name ON articles;
CREATE TRIGGER set_article_author_name
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    WHEN (NEW.author_id IS NOT NULL)
    EXECUTE FUNCTION set_author_name();

DROP TRIGGER IF EXISTS set_event_author_name ON events;
CREATE TRIGGER set_event_author_name
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW
    WHEN (NEW.author_id IS NOT NULL)
    EXECUTE FUNCTION set_author_name();

DROP TRIGGER IF EXISTS set_opportunity_author_name ON opportunities;
CREATE TRIGGER set_opportunity_author_name
    BEFORE INSERT OR UPDATE ON opportunities
    FOR EACH ROW
    WHEN (NEW.author_id IS NOT NULL)
    EXECUTE FUNCTION set_author_name();

-- Create function to set uploader_name for media files
CREATE OR REPLACE FUNCTION set_uploader_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Set uploader_name from user profile
    SELECT CONCAT(first_name, ' ', last_name) INTO NEW.uploader_name
    FROM users 
    WHERE id = NEW.uploaded_by;
    
    -- Fallback to email if name not available
    IF NEW.uploader_name IS NULL OR NEW.uploader_name = ' ' THEN
        SELECT email INTO NEW.uploader_name
        FROM users 
        WHERE id = NEW.uploaded_by;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_media_uploader_name ON media_files;
CREATE TRIGGER set_media_uploader_name
    BEFORE INSERT OR UPDATE ON media_files
    FOR EACH ROW
    WHEN (NEW.uploaded_by IS NOT NULL)
    EXECUTE FUNCTION set_uploader_name();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON COLUMN articles.content_delta IS 'Quill Delta format for rich text content (preferred for security)';
COMMENT ON COLUMN articles.content_html IS 'HTML content for display (sanitized server-side)';
COMMENT ON COLUMN articles.content IS 'Legacy plain text content (deprecated)';
COMMENT ON COLUMN events.description_html IS 'HTML description for display';
COMMENT ON COLUMN opportunities.description_html IS 'HTML description for display';