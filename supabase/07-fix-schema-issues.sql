-- ============================================================================
-- JKUAT Innovation Club - Schema Fixes
-- Fix database schema issues identified in frontend errors
-- ============================================================================

-- ============================================================================
-- FIX 1: Events table - event_date column doesn't exist
-- The table uses start_date but frontend queries event_date
-- ============================================================================

-- Add event_date as an alias/view or update queries to use start_date
-- Option 1: Add a generated column (recommended for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE events ADD COLUMN event_date TIMESTAMP WITH TIME ZONE 
    GENERATED ALWAYS AS (start_date) STORED;
    
    COMMENT ON COLUMN events.event_date IS 'Alias for start_date for backward compatibility';
  END IF;
END $$;

-- ============================================================================
-- FIX 2: Projects table - Missing foreign key constraint
-- Frontend expects: projects_project_lead_id_fkey
-- ============================================================================

-- Add missing columns to projects table if they don't exist
DO $$ 
BEGIN
  -- Add project_lead_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'project_lead_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_lead_id UUID;
  END IF;
  
  -- Add is_incubation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'is_incubation'
  ) THEN
    ALTER TABLE projects ADD COLUMN is_incubation BOOLEAN DEFAULT false;
  END IF;
  
  -- Add incubation_stage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'incubation_stage'
  ) THEN
    ALTER TABLE projects ADD COLUMN incubation_stage VARCHAR(50) CHECK (incubation_stage IN ('ideation', 'validation', 'development', 'launch', 'growth'));
  END IF;
  
  -- Add team_members
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'team_members'
  ) THEN
    ALTER TABLE projects ADD COLUMN team_members UUID[];
  END IF;
  
  -- Add team_size
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'team_size'
  ) THEN
    ALTER TABLE projects ADD COLUMN team_size INTEGER DEFAULT 1;
  END IF;
  
  -- Add progress_percentage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'progress_percentage'
  ) THEN
    ALTER TABLE projects ADD COLUMN progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100);
  END IF;
  
  -- Add milestones
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'milestones'
  ) THEN
    ALTER TABLE projects ADD COLUMN milestones JSONB DEFAULT '[]';
  END IF;
  
  -- Add budget
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'budget'
  ) THEN
    ALTER TABLE projects ADD COLUMN budget DECIMAL(12,2);
  END IF;
  
  -- Add funding_received
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'funding_received'
  ) THEN
    ALTER TABLE projects ADD COLUMN funding_received DECIMAL(12,2) DEFAULT 0;
  END IF;
  
  -- Add resources_needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'resources_needed'
  ) THEN
    ALTER TABLE projects ADD COLUMN resources_needed TEXT[];
  END IF;
  
  -- Add banner_image
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'banner_image'
  ) THEN
    ALTER TABLE projects ADD COLUMN banner_image TEXT;
  END IF;
  
  -- Add gallery
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'gallery'
  ) THEN
    ALTER TABLE projects ADD COLUMN gallery JSONB DEFAULT '[]';
  END IF;
  
  -- Add demo_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'demo_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN demo_url TEXT;
  END IF;
  
  -- Add repository_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'repository_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN repository_url TEXT;
  END IF;
  
  -- Add technologies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'technologies'
  ) THEN
    ALTER TABLE projects ADD COLUMN technologies TEXT[];
  END IF;
  
  -- Add impact_metrics
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'impact_metrics'
  ) THEN
    ALTER TABLE projects ADD COLUMN impact_metrics JSONB DEFAULT '{}';
  END IF;
  
  -- Add likes_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE projects ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add views_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE projects ADD COLUMN views_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add start_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add end_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add project_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'project_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_type VARCHAR(50) CHECK (project_type IN ('innovation', 'research', 'startup', 'hackathon', 'other'));
  END IF;
END $$;

-- Then add the foreign key constraint with the specific name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'projects_project_lead_id_fkey'
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE projects 
    ADD CONSTRAINT projects_project_lead_id_fkey 
    FOREIGN KEY (project_lead_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create projects table with inline foreign key constraint (if table doesn't exist)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  -- Project Details
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold', 'cancelled')),
  project_type VARCHAR(50) CHECK (project_type IN ('innovation', 'research', 'startup', 'hackathon', 'other')),
  
  -- Team
  project_lead_id UUID,
  team_members UUID[],
  team_size INTEGER DEFAULT 1,
  
  -- Incubation
  is_incubation BOOLEAN DEFAULT false,
  incubation_stage VARCHAR(50) CHECK (incubation_stage IN ('ideation', 'validation', 'development', 'launch', 'growth')),
  
  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  milestones JSONB DEFAULT '[]',
  
  -- Resources
  budget DECIMAL(12,2),
  funding_received DECIMAL(12,2) DEFAULT 0,
  resources_needed TEXT[],
  
  -- Media
  banner_image TEXT,
  gallery JSONB DEFAULT '[]',
  demo_url TEXT,
  repository_url TEXT,
  
  -- Additional
  tags TEXT[],
  technologies TEXT[],
  impact_metrics JSONB DEFAULT '{}',
  
  -- Social
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key constraint with specific name
  CONSTRAINT projects_project_lead_id_fkey FOREIGN KEY (project_lead_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- FIX 3: Opportunities table and opportunity_categories relationship
-- ============================================================================

-- Create opportunity_categories table first
CREATE TABLE IF NOT EXISTS opportunity_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to opportunities table if it exists
DO $$ 
BEGIN
  -- Add category_id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'category_id'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN category_id UUID;
    END IF;
    
    -- Add other potentially missing columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'organization_logo'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN organization_logo TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'contact_email'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN contact_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'contact_phone'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN contact_phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'is_remote'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN is_remote BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'application_url'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN application_url TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'application_deadline'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN application_deadline TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'requirements'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN requirements TEXT[];
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'eligibility'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN eligibility TEXT[];
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'benefits'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN benefits TEXT[];
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'is_featured'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'banner_image'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN banner_image TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'attachments'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'views_count'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'applications_count'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN applications_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'published_at'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'created_by'
    ) THEN
      ALTER TABLE opportunities ADD COLUMN created_by UUID;
    END IF;
  END IF;
END $$;

-- Add foreign key constraint for opportunities.created_by
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'opportunities_created_by_fkey'
      AND table_name = 'opportunities'
    ) THEN
      ALTER TABLE opportunities 
      ADD CONSTRAINT opportunities_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add foreign key constraint for opportunities.category_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'opportunities_category_id_fkey'
      AND table_name = 'opportunities'
    ) THEN
      ALTER TABLE opportunities 
      ADD CONSTRAINT opportunities_category_id_fkey 
      FOREIGN KEY (category_id) REFERENCES opportunity_categories(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Create opportunities table if it doesn't exist
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opportunity_type VARCHAR(50) CHECK (opportunity_type IN ('internship', 'job', 'competition', 'scholarship', 'grant', 'mentorship', 'other')),
  
  -- Category
  category_id UUID REFERENCES opportunity_categories(id) ON DELETE SET NULL,
  
  -- Organization
  organization VARCHAR(255),
  organization_logo TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  
  -- Details
  location VARCHAR(255),
  is_remote BOOLEAN DEFAULT false,
  application_url TEXT,
  application_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Requirements
  requirements TEXT[],
  eligibility TEXT[],
  benefits TEXT[],
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'expired')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Media
  banner_image TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Additional
  tags TEXT[],
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  
  -- Creator
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create opportunity_applications table
CREATE TABLE IF NOT EXISTS opportunity_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  additional_documents JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(opportunity_id, user_id)
);

-- Create opportunity_bookmarks table
CREATE TABLE IF NOT EXISTS opportunity_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(opportunity_id, user_id)
);

-- ============================================================================
-- FIX 4: Ideas table with proper category relationship
-- ============================================================================

-- Create idea_categories table first
CREATE TABLE IF NOT EXISTS idea_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to ideas table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ideas') THEN
    -- Add category_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'category_id'
    ) THEN
      ALTER TABLE ideas ADD COLUMN category_id UUID;
    END IF;
    
    -- Add other potentially missing columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'problem_statement'
    ) THEN
      ALTER TABLE ideas ADD COLUMN problem_statement TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'proposed_solution'
    ) THEN
      ALTER TABLE ideas ADD COLUMN proposed_solution TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'target_audience'
    ) THEN
      ALTER TABLE ideas ADD COLUMN target_audience TEXT[];
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'market_potential'
    ) THEN
      ALTER TABLE ideas ADD COLUMN market_potential VARCHAR(50) CHECK (market_potential IN ('low', 'medium', 'high', 'very_high'));
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'feasibility'
    ) THEN
      ALTER TABLE ideas ADD COLUMN feasibility VARCHAR(50) CHECK (feasibility IN ('low', 'medium', 'high'));
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'innovation_level'
    ) THEN
      ALTER TABLE ideas ADD COLUMN innovation_level VARCHAR(50) CHECK (innovation_level IN ('incremental', 'moderate', 'breakthrough'));
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'estimated_budget'
    ) THEN
      ALTER TABLE ideas ADD COLUMN estimated_budget DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'required_skills'
    ) THEN
      ALTER TABLE ideas ADD COLUMN required_skills TEXT[];
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'required_resources'
    ) THEN
      ALTER TABLE ideas ADD COLUMN required_resources TEXT[];
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'attachments'
    ) THEN
      ALTER TABLE ideas ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'likes_count'
    ) THEN
      ALTER TABLE ideas ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'comments_count'
    ) THEN
      ALTER TABLE ideas ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'votes_count'
    ) THEN
      ALTER TABLE ideas ADD COLUMN votes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'looking_for_team'
    ) THEN
      ALTER TABLE ideas ADD COLUMN looking_for_team BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'team_members'
    ) THEN
      ALTER TABLE ideas ADD COLUMN team_members UUID[];
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'submitted_at'
    ) THEN
      ALTER TABLE ideas ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'reviewed_at'
    ) THEN
      ALTER TABLE ideas ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'created_by'
    ) THEN
      ALTER TABLE ideas ADD COLUMN created_by UUID;
    END IF;
  END IF;
END $$;

-- Add foreign key constraint for ideas.created_by
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ideas') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'ideas_created_by_fkey'
      AND table_name = 'ideas'
    ) THEN
      ALTER TABLE ideas 
      ADD CONSTRAINT ideas_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add foreign key constraint for ideas.category_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ideas') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'ideas_category_id_fkey'
      AND table_name = 'ideas'
    ) THEN
      ALTER TABLE ideas 
      ADD CONSTRAINT ideas_category_id_fkey 
      FOREIGN KEY (category_id) REFERENCES idea_categories(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Create ideas table if it doesn't exist
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem_statement TEXT,
  proposed_solution TEXT,
  
  -- Category
  category_id UUID REFERENCES idea_categories(id) ON DELETE SET NULL,
  
  -- Details
  target_audience TEXT[],
  market_potential VARCHAR(50) CHECK (market_potential IN ('low', 'medium', 'high', 'very_high')),
  feasibility VARCHAR(50) CHECK (feasibility IN ('low', 'medium', 'high')),
  innovation_level VARCHAR(50) CHECK (innovation_level IN ('incremental', 'moderate', 'breakthrough')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'implemented')),
  
  -- Resources
  estimated_budget DECIMAL(12,2),
  required_skills TEXT[],
  required_resources TEXT[],
  
  -- Media
  attachments JSONB DEFAULT '[]',
  
  -- Additional
  tags TEXT[],
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  
  -- Collaboration
  looking_for_team BOOLEAN DEFAULT false,
  team_members UUID[],
  
  -- Creator
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create idea_votes table
CREATE TABLE IF NOT EXISTS idea_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(idea_id, user_id)
);

-- Create idea_comments table
CREATE TABLE IF NOT EXISTS idea_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES idea_comments(id) ON DELETE CASCADE,
  
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_project_lead_id ON projects(project_lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_incubation ON projects(is_incubation);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_category_id ON opportunities(category_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_opportunity_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_by ON opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_opportunities_application_deadline ON opportunities(application_deadline);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opportunity_id ON opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_user_id ON opportunity_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_bookmarks_opportunity_id ON opportunity_bookmarks(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_bookmarks_user_id ON opportunity_bookmarks(user_id);

-- Ideas indexes
CREATE INDEX IF NOT EXISTS idx_ideas_category_id ON ideas(category_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

CREATE INDEX IF NOT EXISTS idx_idea_votes_idea_id ON idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_votes_user_id ON idea_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_idea_comments_idea_id ON idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_comments_user_id ON idea_comments(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop and recreate triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunity_categories_updated_at ON opportunity_categories;
CREATE TRIGGER update_opportunity_categories_updated_at BEFORE UPDATE ON opportunity_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunity_applications_updated_at ON opportunity_applications;
CREATE TRIGGER update_opportunity_applications_updated_at BEFORE UPDATE ON opportunity_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_idea_categories_updated_at ON idea_categories;
CREATE TRIGGER update_idea_categories_updated_at BEFORE UPDATE ON idea_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_idea_comments_updated_at ON idea_comments;
CREATE TRIGGER update_idea_comments_updated_at BEFORE UPDATE ON idea_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - Default Categories
-- ============================================================================

-- Opportunity Categories
INSERT INTO opportunity_categories (name, description, icon, color, display_order) VALUES
  ('Technology', 'Tech-related opportunities', 'laptop', '#3B82F6', 1),
  ('Business', 'Business and entrepreneurship', 'briefcase', '#10B981', 2),
  ('Research', 'Research and academic opportunities', 'flask', '#8B5CF6', 3),
  ('Innovation', 'Innovation and creativity', 'lightbulb', '#F59E0B', 4),
  ('Leadership', 'Leadership and management', 'users', '#EF4444', 5),
  ('Other', 'Other opportunities', 'star', '#6B7280', 6)
ON CONFLICT (name) DO NOTHING;

-- Idea Categories
INSERT INTO idea_categories (name, description, icon, color) VALUES
  ('Technology', 'Tech innovations and solutions', 'laptop', '#3B82F6'),
  ('Social Impact', 'Ideas for social good', 'heart', '#EF4444'),
  ('Environment', 'Environmental sustainability', 'leaf', '#10B981'),
  ('Education', 'Educational innovations', 'book', '#8B5CF6'),
  ('Health', 'Healthcare solutions', 'activity', '#EC4899'),
  ('Agriculture', 'Agricultural innovations', 'sun', '#F59E0B'),
  ('Other', 'Other innovative ideas', 'star', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE projects IS 'Projects including hackathons and incubation programs';
COMMENT ON TABLE opportunities IS 'Opportunities like internships, jobs, competitions, scholarships';
COMMENT ON TABLE opportunity_categories IS 'Categories for opportunities';
COMMENT ON TABLE ideas IS 'Innovation ideas submitted by members';
COMMENT ON TABLE idea_categories IS 'Categories for ideas';

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the fixes)
-- ============================================================================

-- Verify events.event_date column exists
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'events' AND column_name = 'event_date';

-- Verify projects foreign key constraint
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'projects' AND constraint_name = 'projects_project_lead_id_fkey';

-- Verify opportunities and categories relationship
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('opportunities', 'opportunity_categories');

-- Verify ideas and categories relationship
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('ideas', 'idea_categories');
