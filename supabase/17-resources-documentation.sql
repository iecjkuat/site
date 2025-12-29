-- =============================================
-- JKUAT Innovation Club - Resources & Documentation System
-- =============================================

-- Resource Categories Table
CREATE TABLE IF NOT EXISTS resource_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SDG Goals Table (for mapping resources to UN Sustainable Development Goals)
CREATE TABLE IF NOT EXISTS sdg_goals (
    id SERIAL PRIMARY KEY,
    goal_number INTEGER NOT NULL UNIQUE CHECK (goal_number >= 1 AND goal_number <= 17),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    color VARCHAR(7) -- Hex color code
);

-- Project Templates Table
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL, -- 'business_plan', 'project_proposal', 'research_paper', etc.
    file_url VARCHAR(500),
    file_type VARCHAR(20),
    category_id INTEGER REFERENCES resource_categories(id),
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resource Reviews Table
CREATE TABLE IF NOT EXISTS resource_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL, -- Will reference resources(id) after table creation
    user_id UUID REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resource Downloads Tracking
CREATE TABLE IF NOT EXISTS resource_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL, -- Will reference resources(id) after table creation
    user_id UUID REFERENCES users(id),
    download_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Resource SDG Mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS resource_sdg_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL, -- Will reference resources(id) after table creation
    sdg_goal_id INTEGER REFERENCES sdg_goals(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, sdg_goal_id)
);

-- Resource Access Logs
CREATE TABLE IF NOT EXISTS resource_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL, -- Will reference resources(id) after table creation
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'view', 'download', 'share'
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Handle existing resources table migration
DO $$
BEGIN
    -- First, update any existing constraint issues
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resources') THEN
        -- Drop existing constraint if it exists
        ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_access_level_check;
        
        -- Update existing access_level values to new format
        UPDATE resources SET access_level = 'member' WHERE access_level = 'members';
        UPDATE resources SET access_level = 'executive' WHERE access_level = 'executives';
        
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'category_id') THEN
            ALTER TABLE resources ADD COLUMN category_id INTEGER REFERENCES resource_categories(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'content') THEN
            ALTER TABLE resources ADD COLUMN content TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'resource_type') THEN
            ALTER TABLE resources ADD COLUMN resource_type VARCHAR(50) DEFAULT 'document';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'is_featured') THEN
            ALTER TABLE resources ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'is_public') THEN
            ALTER TABLE resources ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'created_by') THEN
            ALTER TABLE resources ADD COLUMN created_by UUID REFERENCES users(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'updated_by') THEN
            ALTER TABLE resources ADD COLUMN updated_by UUID REFERENCES users(id);
        END IF;
        
        -- Update existing data
        UPDATE resources SET 
            resource_type = CASE 
                WHEN file_type = 'pdf' AND (category ILIKE '%constitution%' OR title ILIKE '%constitution%') THEN 'constitution'
                WHEN file_type = 'pdf' AND (category ILIKE '%template%' OR title ILIKE '%template%') THEN 'template'
                WHEN file_type = 'pdf' AND (category ILIKE '%guide%' OR title ILIKE '%guide%') THEN 'guide'
                WHEN file_type = 'pdf' AND (category ILIKE '%handbook%' OR title ILIKE '%handbook%') THEN 'handbook'
                ELSE 'document'
            END,
            is_public = CASE 
                WHEN access_level = 'public' THEN TRUE 
                ELSE FALSE 
            END,
            created_by = uploaded_by
        WHERE resource_type IS NULL OR resource_type = 'document';
        
        RAISE NOTICE 'Updated existing resources table structure';
    END IF;
END $$;

-- Create or recreate resources table with proper structure
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'document', -- 'document', 'template', 'guide', 'handbook', 'constitution'
    category_id INTEGER REFERENCES resource_categories(id),
    file_url VARCHAR(500),
    file_type VARCHAR(20), -- 'pdf', 'docx', 'xlsx', 'pptx', 'txt'
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    version VARCHAR(20) DEFAULT '1.0',
    tags TEXT[], -- Array of tags for better searchability
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    access_level VARCHAR(20) DEFAULT 'member' CHECK (access_level IN ('public', 'member', 'executive', 'admin')),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    uploaded_by UUID REFERENCES users(id), -- Keep for backward compatibility
    category VARCHAR(100), -- Keep for backward compatibility
    file_name VARCHAR(255), -- Keep for backward compatibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for resources table
ALTER TABLE resource_reviews ADD CONSTRAINT fk_resource_reviews_resource 
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

ALTER TABLE resource_downloads ADD CONSTRAINT fk_resource_downloads_resource 
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

ALTER TABLE resource_sdg_mapping ADD CONSTRAINT fk_resource_sdg_mapping_resource 
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

ALTER TABLE resource_access_logs ADD CONSTRAINT fk_resource_access_logs_resource 
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_public ON resources(is_public);
CREATE INDEX IF NOT EXISTS idx_resources_access_level ON resources(access_level);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_resource ON resource_downloads(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_user ON resource_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_sdg_mapping_resource ON resource_sdg_mapping(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_sdg_mapping_sdg ON resource_sdg_mapping(sdg_goal_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON project_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_active ON project_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_resource_reviews_resource ON resource_reviews(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_logs_resource ON resource_access_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_logs_user ON resource_access_logs(user_id);

-- =============================================
-- INITIAL DATA - RESOURCE CATEGORIES
-- =============================================

INSERT INTO resource_categories (id, name, description, icon, color, display_order) VALUES
(1, 'Constitution & Governance', 'Official documents, constitution, bylaws, and governance materials', 'fas fa-gavel', '#1e40af', 1),
(2, 'Project Templates', 'Templates and guides for project development and management', 'fas fa-project-diagram', '#059669', 2),
(3, 'Technical Documentation', 'Technical guides, API documentation, and development resources', 'fas fa-code', '#7c3aed', 3),
(4, 'Training Materials', 'Educational content, tutorials, and skill development resources', 'fas fa-graduation-cap', '#dc2626', 4),
(5, 'Event Resources', 'Event planning templates, guidelines, and organizational materials', 'fas fa-calendar-alt', '#ea580c', 5),
(6, 'Financial Templates', 'Budget templates, financial forms, and accounting resources', 'fas fa-chart-line', '#0891b2', 6),
(7, 'Marketing Materials', 'Branding guidelines, logos, and promotional materials', 'fas fa-bullhorn', '#be185d', 7),
(8, 'Research & Reports', 'Research papers, reports, and analytical documents', 'fas fa-file-alt', '#4338ca', 8)
ON CONFLICT (id) DO NOTHING;

-- Insert SDG Goals
INSERT INTO sdg_goals (goal_number, title, description, icon_url, color) VALUES
(1, 'No Poverty', 'End poverty in all its forms everywhere', '/images/sdg/sdg-1.png', '#e5243b'),
(2, 'Zero Hunger', 'End hunger, achieve food security and improved nutrition', '/images/sdg/sdg-2.png', '#dda63a'),
(3, 'Good Health and Well-being', 'Ensure healthy lives and promote well-being for all', '/images/sdg/sdg-3.png', '#4c9f38'),
(4, 'Quality Education', 'Ensure inclusive and equitable quality education', '/images/sdg/sdg-4.png', '#c5192d'),
(5, 'Gender Equality', 'Achieve gender equality and empower all women and girls', '/images/sdg/sdg-5.png', '#ff3a21'),
(6, 'Clean Water and Sanitation', 'Ensure availability and sustainable management of water', '/images/sdg/sdg-6.png', '#26bde2'),
(7, 'Affordable and Clean Energy', 'Ensure access to affordable, reliable, sustainable energy', '/images/sdg/sdg-7.png', '#fcc30b'),
(8, 'Decent Work and Economic Growth', 'Promote sustained, inclusive and sustainable economic growth', '/images/sdg/sdg-8.png', '#a21942'),
(9, 'Industry, Innovation and Infrastructure', 'Build resilient infrastructure, promote inclusive industrialization', '/images/sdg/sdg-9.png', '#fd6925'),
(10, 'Reduced Inequalities', 'Reduce inequality within and among countries', '/images/sdg/sdg-10.png', '#dd1367'),
(11, 'Sustainable Cities and Communities', 'Make cities and human settlements inclusive, safe, resilient', '/images/sdg/sdg-11.png', '#fd9d24'),
(12, 'Responsible Consumption and Production', 'Ensure sustainable consumption and production patterns', '/images/sdg/sdg-12.png', '#bf8b2e'),
(13, 'Climate Action', 'Take urgent action to combat climate change', '/images/sdg/sdg-13.png', '#3f7e44'),
(14, 'Life Below Water', 'Conserve and sustainably use the oceans, seas and marine resources', '/images/sdg/sdg-14.png', '#0a97d9'),
(15, 'Life on Land', 'Protect, restore and promote sustainable use of terrestrial ecosystems', '/images/sdg/sdg-15.png', '#56c02b'),
(16, 'Peace, Justice and Strong Institutions', 'Promote peaceful and inclusive societies for sustainable development', '/images/sdg/sdg-16.png', '#00689d'),
(17, 'Partnerships for the Goals', 'Strengthen the means of implementation and revitalize partnerships', '/images/sdg/sdg-17.png', '#19486a')
ON CONFLICT (goal_number) DO NOTHING;

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resources 
    SET download_count = download_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment download count
DROP TRIGGER IF EXISTS trigger_increment_download_count ON resource_downloads;
CREATE TRIGGER trigger_increment_download_count
    AFTER INSERT ON resource_downloads
    FOR EACH ROW
    EXECUTE FUNCTION increment_download_count();

-- Function to update resource updated_at timestamp
CREATE OR REPLACE FUNCTION update_resource_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on resource changes
DROP TRIGGER IF EXISTS trigger_update_resource_timestamp ON resources;
CREATE TRIGGER trigger_update_resource_timestamp
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_timestamp();

-- Function to get resources by category with statistics
CREATE OR REPLACE FUNCTION get_resources_by_category()
RETURNS TABLE (
    category_id INTEGER,
    category_name VARCHAR(100),
    category_description TEXT,
    category_icon VARCHAR(50),
    category_color VARCHAR(20),
    resource_count BIGINT,
    total_downloads BIGINT,
    featured_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.id as category_id,
        rc.name as category_name,
        rc.description as category_description,
        rc.icon as category_icon,
        rc.color as category_color,
        COALESCE(category_stats.count, 0) as resource_count,
        COALESCE(category_stats.downloads, 0) as total_downloads,
        COALESCE(category_stats.featured, 0) as featured_count
    FROM resource_categories rc
    LEFT JOIN (
        SELECT 
            r.category_id,
            COUNT(*) as count,
            SUM(r.download_count) as downloads,
            COUNT(*) FILTER (WHERE r.is_featured = true) as featured
        FROM resources r 
        WHERE r.is_public = true
        GROUP BY r.category_id
    ) category_stats ON rc.id = category_stats.category_id
    ORDER BY rc.display_order, rc.name;
END;
$$ LANGUAGE plpgsql;

-- Function to search resources with filters
CREATE OR REPLACE FUNCTION search_resources(
    search_term TEXT DEFAULT '',
    category_filter INTEGER DEFAULT NULL,
    resource_type_filter VARCHAR(50) DEFAULT NULL,
    access_level_filter VARCHAR(20) DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    resource_type VARCHAR(50),
    category_name VARCHAR(100),
    file_url VARCHAR(500),
    file_type VARCHAR(20),
    file_size BIGINT,
    download_count INTEGER,
    version VARCHAR(20),
    tags TEXT[],
    is_featured BOOLEAN,
    access_level VARCHAR(20),
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.description,
        r.resource_type,
        rc.name as category_name,
        r.file_url,
        r.file_type,
        r.file_size,
        r.download_count,
        r.version,
        r.tags,
        r.is_featured,
        r.access_level,
        u.name as created_by_name,
        r.created_at
    FROM resources r
    LEFT JOIN resource_categories rc ON r.category_id = rc.id
    LEFT JOIN users u ON r.created_by = u.id
    WHERE 
        (search_term = '' OR 
         r.title ILIKE '%' || search_term || '%' OR
         r.description ILIKE '%' || search_term || '%' OR
         search_term = ANY(r.tags))
        AND (category_filter IS NULL OR r.category_id = category_filter)
        AND (resource_type_filter IS NULL OR r.resource_type = resource_type_filter)
        AND (access_level_filter IS NULL OR r.access_level = access_level_filter)
        AND r.is_public = true
    ORDER BY 
        r.is_featured DESC,
        r.download_count DESC,
        r.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources
CREATE POLICY "Public resources are viewable by everyone" ON resources
    FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view member-level resources" ON resources
    FOR SELECT USING (
        is_public = true AND 
        (access_level = 'public' OR 
         (auth.role() = 'authenticated' AND access_level IN ('public', 'member')))
    );

CREATE POLICY "Executives can manage resources" ON resources
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'executive') OR
        auth.uid() = created_by
    );

-- RLS Policies for downloads
CREATE POLICY "Users can view their own downloads" ON resource_downloads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can record downloads" ON resource_downloads
    FOR INSERT WITH CHECK (true);

-- RLS Policies for templates
CREATE POLICY "Active templates are viewable by members" ON project_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Executives can manage templates" ON project_templates
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'executive'));

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews" ON resource_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON resource_reviews
    FOR ALL USING (auth.uid() = user_id);

COMMIT;