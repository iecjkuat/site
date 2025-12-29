-- JKUAT Innovation Club - Departmental Sections Setup
-- Database schema for Projects, Education, and Communications departments

-- ============================================================================
-- PROJECTS & INNOVATION DEPARTMENT
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'Innovation', 'Hackathon', 'Research', 'Startup'
  status VARCHAR(50) DEFAULT 'Planning', -- 'Planning', 'Active', 'Completed', 'On Hold', 'Cancelled'
  priority VARCHAR(20) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  funding_source VARCHAR(255),
  project_lead_id UUID REFERENCES users(id),
  team_members UUID[] DEFAULT '{}',
  technologies TEXT[],
  objectives TEXT[],
  deliverables TEXT[],
  milestones JSONB DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  repository_url VARCHAR(500),
  documentation_url VARCHAR(500),
  demo_url VARCHAR(500),
  is_incubation BOOLEAN DEFAULT false,
  ip_documentation TEXT,
  collaboration_requests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project submissions table
CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_id UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  team_members TEXT[],
  technologies TEXT[],
  expected_duration VARCHAR(100),
  budget_estimate DECIMAL(10,2),
  objectives TEXT[],
  submission_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Under Review', 'Approved', 'Rejected'
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Hackathons and challenges table
CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  venue VARCHAR(255),
  prizes JSONB DEFAULT '[]',
  sponsors TEXT[],
  rules TEXT[],
  judging_criteria TEXT[],
  status VARCHAR(50) DEFAULT 'Upcoming', -- 'Upcoming', 'Registration Open', 'Ongoing', 'Completed', 'Cancelled'
  organizer_id UUID REFERENCES users(id),
  registration_fee DECIMAL(10,2) DEFAULT 0,
  external_url VARCHAR(500),
  banner_image VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hackathon registrations
CREATE TABLE IF NOT EXISTS hackathon_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_name VARCHAR(255),
  team_members JSONB DEFAULT '[]',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Registered', -- 'Registered', 'Confirmed', 'Cancelled'
  UNIQUE(hackathon_id, user_id)
);

-- ============================================================================
-- EDUCATION & TRAINING DEPARTMENT
-- ============================================================================

-- Workshops and seminars
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'Technical', 'Business', 'Soft Skills', 'Leadership'
  instructor_name VARCHAR(255),
  instructor_bio TEXT,
  instructor_id UUID REFERENCES users(id),
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  venue VARCHAR(255),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  materials_url VARCHAR(500),
  recording_url VARCHAR(500),
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  status VARCHAR(50) DEFAULT 'Upcoming', -- 'Upcoming', 'Registration Open', 'Ongoing', 'Completed', 'Cancelled'
  is_online BOOLEAN DEFAULT false,
  meeting_link VARCHAR(500),
  certificate_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workshop registrations
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  attendance_status VARCHAR(50) DEFAULT 'Registered', -- 'Registered', 'Attended', 'No Show', 'Cancelled'
  certificate_issued BOOLEAN DEFAULT false,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  UNIQUE(workshop_id, user_id)
);

-- Training materials library
CREATE TABLE IF NOT EXISTS training_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'Video', 'PDF', 'Presentation', 'Interactive', 'Course'
  file_type VARCHAR(50), -- 'video/mp4', 'application/pdf', etc.
  file_url VARCHAR(500),
  file_size BIGINT,
  duration_minutes INTEGER, -- for videos
  difficulty_level VARCHAR(20) DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
  tags TEXT[],
  author_id UUID REFERENCES users(id),
  download_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentorship program
CREATE TABLE IF NOT EXISTS mentorship_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_type VARCHAR(100) NOT NULL, -- 'Technical', 'Career', 'Entrepreneurship', 'Leadership'
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Completed', 'Paused', 'Terminated'
  meeting_frequency VARCHAR(50), -- 'Weekly', 'Bi-weekly', 'Monthly'
  goals TEXT[],
  progress_notes TEXT,
  mentor_feedback TEXT,
  mentee_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mentor_id, mentee_id)
);

-- Skills and certifications tracking
CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  certification_name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  credential_id VARCHAR(255),
  credential_url VARCHAR(500),
  verification_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Verified', 'Expired', 'Invalid'
  skill_areas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMMUNICATIONS, PR & PARTNERSHIPS DEPARTMENT
-- ============================================================================

-- News and announcements
CREATE TABLE IF NOT EXISTS news_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category VARCHAR(100) NOT NULL, -- 'News', 'Announcement', 'Achievement', 'Event', 'Partnership'
  priority VARCHAR(20) DEFAULT 'Normal', -- 'Low', 'Normal', 'High', 'Urgent'
  author_id UUID REFERENCES users(id) NOT NULL,
  featured_image VARCHAR(500),
  gallery_images TEXT[],
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_enabled BOOLEAN DEFAULT true,
  external_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media gallery
CREATE TABLE IF NOT EXISTS media_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document'
  file_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  file_size BIGINT,
  dimensions VARCHAR(20), -- '1920x1080' for images/videos
  event_id UUID REFERENCES events(id),
  album_name VARCHAR(255),
  photographer_credit VARCHAR(255),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Press releases
CREATE TABLE IF NOT EXISTS press_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline VARCHAR(255) NOT NULL,
  subheadline VARCHAR(500),
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL,
  media_contact_name VARCHAR(255),
  media_contact_email VARCHAR(255),
  media_contact_phone VARCHAR(20),
  featured_image VARCHAR(500),
  attachments JSONB DEFAULT '[]',
  distribution_list TEXT[],
  status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Approved', 'Published', 'Archived'
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partnerships and sponsors
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name VARCHAR(255) NOT NULL,
  partnership_type VARCHAR(100) NOT NULL, -- 'Sponsor', 'Academic', 'Industry', 'Government', 'NGO'
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  description TEXT,
  partnership_level VARCHAR(50), -- 'Bronze', 'Silver', 'Gold', 'Platinum', 'Strategic'
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  contract_value DECIMAL(12,2),
  benefits_provided TEXT[],
  obligations TEXT[],
  status VARCHAR(50) DEFAULT 'Active', -- 'Prospective', 'Active', 'Expired', 'Terminated'
  partnership_manager_id UUID REFERENCES users(id),
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social media integration
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL, -- 'Twitter', 'LinkedIn', 'Instagram', 'Facebook', 'YouTube'
  post_content TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  scheduled_time TIMESTAMP WITH TIME ZONE,
  posted_time TIMESTAMP WITH TIME ZONE,
  post_url VARCHAR(500),
  engagement_metrics JSONB DEFAULT '{}', -- likes, shares, comments, views
  author_id UUID REFERENCES users(id) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Scheduled', 'Posted', 'Failed'
  campaign_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_lead ON projects(project_lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

-- Workshops indexes
CREATE INDEX IF NOT EXISTS idx_workshops_datetime ON workshops(start_datetime);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshops_category ON workshops(category);

-- News indexes
CREATE INDEX IF NOT EXISTS idx_news_published ON news_announcements(is_published, publish_date);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_announcements(category);

-- Media gallery indexes
CREATE INDEX IF NOT EXISTS idx_media_type ON media_gallery(media_type);
CREATE INDEX IF NOT EXISTS idx_media_event ON media_gallery(event_id);

-- Partnerships indexes
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_type ON partnerships(partnership_type);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'JKUAT Innovation Club Departmental Sections Setup Complete!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Created tables for:';
    RAISE NOTICE '• Projects & Innovation Department (projects, submissions, hackathons)';
    RAISE NOTICE '• Education & Training Department (workshops, materials, mentorship)';
    RAISE NOTICE '• Communications & PR Department (news, media, partnerships)';
    RAISE NOTICE '=================================================================';
END $$;