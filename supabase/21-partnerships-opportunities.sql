-- =============================================
-- JKUAT Innovation Club - Partnerships & Opportunities System
-- =============================================

-- Opportunity Categories Table
CREATE TABLE IF NOT EXISTS opportunity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- FontAwesome icon class
    color VARCHAR(20), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES opportunity_categories(id),
    opportunity_type VARCHAR(50) NOT NULL, -- 'competition', 'funding', 'internship', 'job', 'networking', 'partnership', 'grant'
    organization VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    location_type VARCHAR(20) DEFAULT 'hybrid', -- 'remote', 'onsite', 'hybrid'
    
    -- Application details
    application_deadline TIMESTAMP WITH TIME ZONE,
    application_url VARCHAR(500),
    application_requirements TEXT,
    eligibility_criteria TEXT,
    
    -- Financial information
    compensation_type VARCHAR(50), -- 'paid', 'unpaid', 'stipend', 'scholarship', 'grant'
    compensation_amount DECIMAL(15,2),
    compensation_currency VARCHAR(10) DEFAULT 'KES',
    
    -- Duration and timing
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    duration_months INTEGER,
    is_ongoing BOOLEAN DEFAULT FALSE,
    
    -- Status and visibility
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'filled', 'cancelled'
    priority_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Engagement tracking
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- Content and media
    image_url VARCHAR(500),
    attachments JSONB DEFAULT '[]',
    tags VARCHAR(100)[],
    
    -- Metadata
    source VARCHAR(100), -- 'internal', 'partner', 'external'
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    external_id VARCHAR(100), -- For tracking external opportunities
    
    -- Audit fields
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT opportunities_type_check CHECK (opportunity_type IN ('competition', 'funding', 'internship', 'job', 'networking', 'partnership', 'grant')),
    CONSTRAINT opportunities_status_check CHECK (status IN ('active', 'expired', 'filled', 'cancelled')),
    CONSTRAINT opportunities_priority_check CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT opportunities_location_type_check CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
    CONSTRAINT opportunities_compensation_check CHECK (compensation_type IN ('paid', 'unpaid', 'stipend', 'scholarship', 'grant'))
);

-- User Opportunity Applications Table
CREATE TABLE IF NOT EXISTS opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Application details
    application_status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'
    cover_letter TEXT,
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    additional_documents JSONB DEFAULT '[]',
    
    -- Application responses
    custom_responses JSONB DEFAULT '{}', -- Store responses to custom questions
    
    -- Timeline
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_at TIMESTAMP WITH TIME ZONE,
    
    -- Feedback
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Metadata
    application_source VARCHAR(50) DEFAULT 'website', -- 'website', 'email', 'referral'
    referrer_id UUID REFERENCES users(id),
    
    UNIQUE(opportunity_id, user_id),
    CONSTRAINT applications_status_check CHECK (application_status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'))
);

-- User Opportunity Bookmarks Table
CREATE TABLE IF NOT EXISTS opportunity_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(opportunity_id, user_id)
);

-- Opportunity Views Tracking Table
CREATE TABLE IF NOT EXISTS opportunity_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100)
);

-- Partnership Organizations Table
CREATE TABLE IF NOT EXISTS partnership_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(500),
    logo_url VARCHAR(500),
    
    -- Contact information
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Organization details
    organization_type VARCHAR(50), -- 'corporate', 'ngo', 'government', 'academic', 'startup'
    industry VARCHAR(100),
    size VARCHAR(20), -- 'startup', 'small', 'medium', 'large', 'enterprise'
    location VARCHAR(255),
    
    -- Partnership details
    partnership_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'pending', 'terminated'
    partnership_type VARCHAR(50), -- 'sponsor', 'mentor', 'employer', 'collaborator', 'vendor'
    partnership_start_date DATE,
    partnership_end_date DATE,
    
    -- Benefits and offerings
    benefits_offered TEXT[],
    resources_provided TEXT[],
    
    -- Engagement tracking
    opportunities_posted INTEGER DEFAULT 0,
    members_hired INTEGER DEFAULT 0,
    events_sponsored INTEGER DEFAULT 0,
    
    -- Social media
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    facebook_url VARCHAR(500),
    
    -- Metadata
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT partnership_status_check CHECK (partnership_status IN ('active', 'inactive', 'pending', 'terminated')),
    CONSTRAINT organization_type_check CHECK (organization_type IN ('corporate', 'ngo', 'government', 'academic', 'startup')),
    CONSTRAINT partnership_type_check CHECK (partnership_type IN ('sponsor', 'mentor', 'employer', 'collaborator', 'vendor'))
);

-- Opportunity Notifications Table
CREATE TABLE IF NOT EXISTS opportunity_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'new_opportunity', 'deadline_reminder', 'application_update', 'similar_opportunity'
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery tracking
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery methods
    send_email BOOLEAN DEFAULT TRUE,
    send_push BOOLEAN DEFAULT TRUE,
    send_sms BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT notification_type_check CHECK (notification_type IN ('new_opportunity', 'deadline_reminder', 'application_update', 'similar_opportunity'))
);

-- User Opportunity Preferences Table
CREATE TABLE IF NOT EXISTS user_opportunity_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Preferred opportunity types
    preferred_types VARCHAR(50)[] DEFAULT '{}',
    preferred_categories UUID[] DEFAULT '{}',
    
    -- Location preferences
    preferred_locations VARCHAR(255)[] DEFAULT '{}',
    location_type_preference VARCHAR(20) DEFAULT 'hybrid',
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    
    -- Compensation preferences
    min_compensation DECIMAL(15,2),
    compensation_currency VARCHAR(10) DEFAULT 'KES',
    compensation_types VARCHAR(50)[] DEFAULT '{}',
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    notification_frequency VARCHAR(20) DEFAULT 'daily', -- 'immediate', 'daily', 'weekly', 'monthly'
    
    -- Matching preferences
    auto_apply_enabled BOOLEAN DEFAULT FALSE,
    match_threshold INTEGER DEFAULT 70, -- Percentage match required for auto-suggestions
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT location_type_pref_check CHECK (location_type_preference IN ('remote', 'onsite', 'hybrid')),
    CONSTRAINT notification_freq_check CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'monthly'))
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(application_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority_level);
CREATE INDEX IF NOT EXISTS idx_opportunities_featured ON opportunities(is_featured);
CREATE INDEX IF NOT EXISTS idx_opportunities_organization ON opportunities(organization);
CREATE INDEX IF NOT EXISTS idx_opportunities_location_type ON opportunities(location_type);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON opportunity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON opportunity_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted ON opportunity_applications(submitted_at);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON opportunity_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_opportunity ON opportunity_bookmarks(opportunity_id);

-- Views indexes
CREATE INDEX IF NOT EXISTS idx_views_opportunity ON opportunity_views(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_views_user ON opportunity_views(user_id);
CREATE INDEX IF NOT EXISTS idx_views_date ON opportunity_views(viewed_at);

-- Partnership organizations indexes
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnership_organizations(partnership_status);
CREATE INDEX IF NOT EXISTS idx_partnerships_type ON partnership_organizations(partnership_type);
CREATE INDEX IF NOT EXISTS idx_partnerships_industry ON partnership_organizations(industry);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_search ON opportunities USING gin(to_tsvector('english', title || ' ' || description || ' ' || organization));
CREATE INDEX IF NOT EXISTS idx_partnerships_search ON partnership_organizations USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(industry, '')));

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update opportunity view count
CREATE OR REPLACE FUNCTION update_opportunity_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE opportunities 
    SET view_count = view_count + 1
    WHERE id = NEW.opportunity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update view count
DROP TRIGGER IF EXISTS trigger_update_opportunity_view_count ON opportunity_views;
CREATE TRIGGER trigger_update_opportunity_view_count
    AFTER INSERT ON opportunity_views
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunity_view_count();

-- Function to update application count
CREATE OR REPLACE FUNCTION update_opportunity_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE opportunities 
        SET application_count = application_count + 1
        WHERE id = NEW.opportunity_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE opportunities 
        SET application_count = application_count - 1
        WHERE id = OLD.opportunity_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update application count
DROP TRIGGER IF EXISTS trigger_update_opportunity_application_count ON opportunity_applications;
CREATE TRIGGER trigger_update_opportunity_application_count
    AFTER INSERT OR DELETE ON opportunity_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunity_application_count();

-- Function to update bookmark count
CREATE OR REPLACE FUNCTION update_opportunity_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE opportunities 
        SET bookmark_count = bookmark_count + 1
        WHERE id = NEW.opportunity_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE opportunities 
        SET bookmark_count = bookmark_count - 1
        WHERE id = OLD.opportunity_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update bookmark count
DROP TRIGGER IF EXISTS trigger_update_opportunity_bookmark_count ON opportunity_bookmarks;
CREATE TRIGGER trigger_update_opportunity_bookmark_count
    AFTER INSERT OR DELETE ON opportunity_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunity_bookmark_count();

-- Function to auto-expire opportunities
CREATE OR REPLACE FUNCTION auto_expire_opportunities()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE opportunities 
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'active' 
    AND application_deadline IS NOT NULL 
    AND application_deadline < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get opportunity recommendations for user
CREATE OR REPLACE FUNCTION get_opportunity_recommendations(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    opportunity_id UUID,
    title VARCHAR(255),
    organization VARCHAR(255),
    opportunity_type VARCHAR(50),
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as opportunity_id,
        o.title,
        o.organization,
        o.opportunity_type,
        CASE 
            WHEN uop.preferred_types IS NOT NULL AND o.opportunity_type = ANY(uop.preferred_types) THEN 90
            WHEN uop.preferred_categories IS NOT NULL AND o.category_id = ANY(uop.preferred_categories) THEN 85
            WHEN uop.preferred_locations IS NOT NULL AND o.location = ANY(uop.preferred_locations) THEN 80
            WHEN uop.location_type_preference = o.location_type THEN 75
            ELSE 60
        END as match_score
    FROM opportunities o
    LEFT JOIN user_opportunity_preferences uop ON uop.user_id = user_uuid
    WHERE o.status = 'active'
    AND (o.application_deadline IS NULL OR o.application_deadline > CURRENT_TIMESTAMP)
    AND NOT EXISTS (
        SELECT 1 FROM opportunity_applications oa 
        WHERE oa.opportunity_id = o.id AND oa.user_id = user_uuid
    )
    ORDER BY match_score DESC, o.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get opportunity statistics
CREATE OR REPLACE FUNCTION get_opportunity_statistics()
RETURNS TABLE (
    total_opportunities BIGINT,
    active_opportunities BIGINT,
    expired_opportunities BIGINT,
    total_applications BIGINT,
    opportunities_by_type JSONB,
    top_organizations JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM opportunities) as total_opportunities,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'active') as active_opportunities,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'expired') as expired_opportunities,
        (SELECT COUNT(*) FROM opportunity_applications) as total_applications,
        (SELECT jsonb_object_agg(opportunity_type, count) 
         FROM (
             SELECT opportunity_type, COUNT(*) as count 
             FROM opportunities 
             WHERE status = 'active' 
             GROUP BY opportunity_type
         ) type_counts) as opportunities_by_type,
        (SELECT jsonb_agg(jsonb_build_object('organization', organization, 'count', count))
         FROM (
             SELECT organization, COUNT(*) as count 
             FROM opportunities 
             WHERE status = 'active' 
             GROUP BY organization 
             ORDER BY count DESC 
             LIMIT 10
         ) top_orgs) as top_organizations;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_opportunity_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities
CREATE POLICY "Anyone can view active opportunities" ON opportunities
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all opportunities" ON opportunities
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'executive'));

-- RLS Policies for applications
CREATE POLICY "Users can view their own applications" ON opportunity_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" ON opportunity_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON opportunity_applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON opportunity_applications
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'executive'));

-- RLS Policies for bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON opportunity_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for preferences
CREATE POLICY "Users can manage their own preferences" ON user_opportunity_preferences
    FOR ALL USING (auth.uid() = user_id);

COMMIT;