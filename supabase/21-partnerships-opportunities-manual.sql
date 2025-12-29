-- =============================================
-- JKUAT Innovation Club - Partnerships & Opportunities Schema (Manual Version)
-- Copy and paste this into the Supabase SQL Editor
-- =============================================

-- Step 1: Create opportunity_categories table
CREATE TABLE IF NOT EXISTS opportunity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create partnership_organizations table
CREATE TABLE IF NOT EXISTS partnership_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(500),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    organization_type VARCHAR(50), -- 'corporate', 'ngo', 'government', 'academic'
    industry VARCHAR(100),
    partnership_type VARCHAR(50), -- 'sponsor', 'mentor', 'employer', 'collaborator'
    partnership_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'pending'
    benefits_offered TEXT[],
    linkedin_url VARCHAR(500),
    opportunities_posted INTEGER DEFAULT 0,
    members_hired INTEGER DEFAULT 0,
    events_sponsored INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add new columns to existing opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES opportunity_categories(id);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS location_type VARCHAR(20) DEFAULT 'hybrid';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS eligibility_criteria TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS compensation_type VARCHAR(50);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS compensation_amount DECIMAL(15,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS compensation_currency VARCHAR(10) DEFAULT 'KES';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS duration_months INTEGER;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS is_ongoing BOOLEAN DEFAULT FALSE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'normal';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- Step 4: Create opportunity_applications table
CREATE TABLE IF NOT EXISTS opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    application_status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'
    cover_letter TEXT,
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    additional_documents JSONB DEFAULT '[]',
    custom_responses JSONB DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(opportunity_id, user_id)
);

-- Step 5: Create opportunity_bookmarks table
CREATE TABLE IF NOT EXISTS opportunity_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(opportunity_id, user_id)
);

-- Step 6: Create opportunity_views table
CREATE TABLE IF NOT EXISTS opportunity_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create user_opportunity_preferences table
CREATE TABLE IF NOT EXISTS user_opportunity_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_types VARCHAR(50)[], -- Array of opportunity types
    preferred_categories UUID[], -- Array of category IDs
    preferred_locations VARCHAR(100)[], -- Array of location preferences
    location_type_preference VARCHAR(20) DEFAULT 'hybrid', -- 'remote', 'onsite', 'hybrid'
    min_compensation DECIMAL(15,2),
    max_compensation DECIMAL(15,2),
    email_notifications BOOLEAN DEFAULT TRUE,
    notification_frequency VARCHAR(20) DEFAULT 'weekly', -- 'immediate', 'daily', 'weekly', 'monthly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create opportunity_notifications table
CREATE TABLE IF NOT EXISTS opportunity_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'new_opportunity', 'deadline_reminder', 'application_update', 'recommendation'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: Add constraints and indexes (using DO blocks for conditional constraints)
DO $$
BEGIN
    -- Add priority_level constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'opportunities_priority_check' 
        AND table_name = 'opportunities'
    ) THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_priority_check 
            CHECK (priority_level IN ('low', 'normal', 'high', 'urgent'));
    END IF;

    -- Add location_type constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'opportunities_location_type_check' 
        AND table_name = 'opportunities'
    ) THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_location_type_check 
            CHECK (location_type IN ('remote', 'onsite', 'hybrid'));
    END IF;

    -- Add compensation_type constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'opportunities_compensation_check' 
        AND table_name = 'opportunities'
    ) THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_compensation_check 
            CHECK (compensation_type IN ('paid', 'unpaid', 'stipend', 'scholarship', 'grant'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_category_id ON opportunities(category_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_organization ON opportunities(organization);
CREATE INDEX IF NOT EXISTS idx_opportunities_location_type ON opportunities(location_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority_level ON opportunities(priority_level);
CREATE INDEX IF NOT EXISTS idx_opportunities_is_featured ON opportunities(is_featured);
CREATE INDEX IF NOT EXISTS idx_opportunities_compensation_type ON opportunities(compensation_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_application_deadline ON opportunities(application_deadline);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_user_id ON opportunity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_status ON opportunity_applications(application_status);

CREATE INDEX IF NOT EXISTS idx_opportunity_bookmarks_user_id ON opportunity_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_views_user_id ON opportunity_views(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_views_opportunity_id ON opportunity_views(opportunity_id);

-- Step 10: Insert initial opportunity categories
INSERT INTO opportunity_categories (name, description, icon, color) VALUES
('Competitions', 'Local and international competitions for students and innovators', 'fa-trophy', '#f59e0b'),
('Funding', 'Grants, scholarships, and funding opportunities for projects and education', 'fa-dollar-sign', '#10b981'),
('Internships', 'Internship opportunities with partner organizations', 'fa-briefcase', '#3b82f6'),
('Jobs', 'Full-time and part-time job opportunities', 'fa-user-tie', '#8b5cf6'),
('Networking', 'Networking events, conferences, and professional meetups', 'fa-users', '#ef4444'),
('Partnerships', 'Collaboration opportunities with industry partners', 'fa-handshake', '#06b6d4'),
('Grants', 'Research and project grants from various organizations', 'fa-award', '#f97316')
ON CONFLICT (name) DO NOTHING;

-- Step 11: Insert sample partnership organizations
INSERT INTO partnership_organizations (name, description, website, contact_person, contact_email, organization_type, industry, partnership_type, partnership_status, benefits_offered, linkedin_url) VALUES
(
    'Safaricom PLC',
    'Leading telecommunications company in Kenya, committed to supporting innovation and entrepreneurship among young people.',
    'https://www.safaricom.co.ke',
    'Innovation Team',
    'innovation@safaricom.co.ke',
    'corporate',
    'Telecommunications',
    'sponsor',
    'active',
    ARRAY['Internship opportunities', 'Mentorship programs', 'Funding for projects', 'Technical workshops'],
    'https://linkedin.com/company/safaricom'
),
(
    'Microsoft Kenya',
    'Global technology company providing cloud computing, productivity software, and AI solutions.',
    'https://www.microsoft.com/kenya',
    'Student Engagement Lead',
    'students@microsoft.com',
    'corporate',
    'Technology',
    'mentor',
    'active',
    ARRAY['Azure credits', 'Technical training', 'Certification programs', 'Hackathon sponsorship'],
    'https://linkedin.com/company/microsoft'
),
(
    'Kenya Commercial Bank (KCB)',
    'Premier financial services provider offering banking and investment solutions across East Africa.',
    'https://www.kcbgroup.com',
    'Graduate Program Manager',
    'graduates@kcb.co.ke',
    'corporate',
    'Financial Services',
    'employer',
    'active',
    ARRAY['Graduate trainee programs', 'Internships', 'Financial literacy training', 'Entrepreneurship support'],
    'https://linkedin.com/company/kcb-bank-group'
)
ON CONFLICT (name) DO NOTHING;

COMMIT;