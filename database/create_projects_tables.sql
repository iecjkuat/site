-- ============================================================================
-- JKUAT Innovation Club - Projects System Database Schema
-- ============================================================================

-- Drop existing tables if they exist (clean slate approach)
DROP TABLE IF EXISTS project_collaborations CASCADE;
DROP TABLE IF EXISTS project_submissions CASCADE;
DROP TABLE IF EXISTS hackathons CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'planning',
  project_type VARCHAR(50) DEFAULT 'personal', -- 'club' or 'personal'
  project_lead_id UUID REFERENCES users(id),
  github_url TEXT,
  demo_url TEXT,
  tech_stack TEXT[],
  technologies TEXT[],
  banner_image TEXT,
  gallery JSONB,
  tags TEXT[],
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  team_members JSONB,
  looking_for_collaborators BOOLEAN DEFAULT false,
  is_incubation BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('planning', 'active', 'completed', 'on_hold', 'cancelled')),
  CONSTRAINT valid_project_type CHECK (project_type IN ('club', 'personal'))
);

-- Create hackathons table
CREATE TABLE hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(255),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  registration_deadline TIMESTAMP,
  status VARCHAR(50) DEFAULT 'upcoming',
  location VARCHAR(255),
  is_virtual BOOLEAN DEFAULT false,
  prize_pool DECIMAL(10,2),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  organizer_id UUID REFERENCES users(id),
  banner_image TEXT,
  rules TEXT,
  judging_criteria JSONB,
  sponsors JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_hackathon_status CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create project_submissions table
CREATE TABLE project_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  expected_duration VARCHAR(100),
  budget_estimate DECIMAL(10,2) DEFAULT 0,
  technologies TEXT[],
  objectives TEXT[],
  submission_status VARCHAR(50) DEFAULT 'Pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_submission_status CHECK (submission_status IN ('Pending', 'Approved', 'Rejected', 'Under Review'))
);

-- Create project_collaborations table
CREATE TABLE project_collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  skills_offered TEXT[],
  time_commitment VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  response_message TEXT,
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_collaboration_status CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_lead ON projects(project_lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_dates ON hackathons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_hackathons_organizer ON hackathons(organizer_id);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON project_submissions(submission_status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON project_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON project_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collaborations_project ON project_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_user ON project_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON project_collaborations(status);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;

DROP POLICY IF EXISTS "Hackathons are viewable by everyone" ON hackathons;
DROP POLICY IF EXISTS "Admins can manage hackathons" ON hackathons;

DROP POLICY IF EXISTS "Submissions are viewable by submitter and admins" ON project_submissions;
DROP POLICY IF EXISTS "Anyone can create submissions" ON project_submissions;
DROP POLICY IF EXISTS "Admins can manage submissions" ON project_submissions;

DROP POLICY IF EXISTS "Collaborations viewable by project lead and requester" ON project_collaborations;
DROP POLICY IF EXISTS "Anyone can create collaboration requests" ON project_collaborations;
DROP POLICY IF EXISTS "Project leads can manage collaborations" ON project_collaborations;

-- RLS Policies for projects
CREATE POLICY "Projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (project_lead_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (project_lead_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for hackathons
CREATE POLICY "Hackathons are viewable by everyone" 
  ON hackathons FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage hackathons" 
  ON hackathons FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for project_submissions
CREATE POLICY "Submissions are viewable by submitter and admins" 
  ON project_submissions FOR SELECT 
  USING (submitter_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can create submissions" 
  ON project_submissions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can manage submissions" 
  ON project_submissions FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for project_collaborations
CREATE POLICY "Collaborations viewable by project lead and requester" 
  ON project_collaborations FOR SELECT 
  USING (user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM projects WHERE id = project_collaborations.project_id AND project_lead_id = auth.uid()) OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can create collaboration requests" 
  ON project_collaborations FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Project leads can manage collaborations" 
  ON project_collaborations FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM projects WHERE id = project_collaborations.project_id AND project_lead_id = auth.uid()) OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert sample projects
-- Note: These projects will have NULL project_lead_id initially
-- You can update them later with actual user IDs from your users table
INSERT INTO projects (title, description, category, status, project_type, tech_stack, tags, progress_percentage, likes_count, views_count, looking_for_collaborators, project_lead_id)
VALUES 
  ('Smart Campus Navigation', 'AI-powered indoor navigation system for JKUAT campus using computer vision and IoT sensors', 'innovation', 'active', 'club', ARRAY['Python', 'TensorFlow', 'React', 'IoT'], ARRAY['AI', 'IoT', 'Navigation'], 65, 45, 230, true, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('AgriTech IoT Platform', 'IoT-based smart farming solution for monitoring soil conditions and automating irrigation', 'innovation', 'active', 'club', ARRAY['Arduino', 'Node.js', 'MongoDB', 'React'], ARRAY['IoT', 'Agriculture', 'Automation'], 80, 67, 340, false, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('EcoTrack', 'Mobile app for tracking personal carbon footprint and suggesting eco-friendly alternatives', 'startup', 'planning', 'personal', ARRAY['React Native', 'Firebase', 'Node.js'], ARRAY['Environment', 'Mobile', 'Sustainability'], 30, 23, 120, true, (SELECT id FROM users LIMIT 1 OFFSET 1)),
  ('StudyBuddy AI', 'AI-powered study companion that creates personalized learning paths and quizzes', 'research', 'active', 'personal', ARRAY['Python', 'OpenAI', 'Flask', 'Vue.js'], ARRAY['AI', 'Education', 'Machine Learning'], 55, 89, 450, true, (SELECT id FROM users LIMIT 1 OFFSET 2)),
  ('Campus Events Hub', 'Centralized platform for discovering and managing all campus events and activities', 'innovation', 'completed', 'club', ARRAY['Next.js', 'PostgreSQL', 'Tailwind'], ARRAY['Events', 'Community', 'Web'], 100, 120, 680, false, (SELECT id FROM users WHERE role = 'admin' LIMIT 1));

-- Insert sample hackathons
INSERT INTO hackathons (title, description, theme, start_date, end_date, registration_deadline, status, location, is_virtual, prize_pool, max_participants, current_participants)
VALUES 
  ('Innovation Week Hackathon 2024', '48-hour hackathon focused on solving real-world problems using technology', 'Tech for Good', NOW() + INTERVAL '30 days', NOW() + INTERVAL '32 days', NOW() + INTERVAL '25 days', 'upcoming', 'JKUAT Main Campus', false, 500000.00, 100, 45),
  ('AI Challenge 2024', 'Build innovative AI solutions for agriculture and healthcare sectors', 'AI for Impact', NOW() + INTERVAL '60 days', NOW() + INTERVAL '62 days', NOW() + INTERVAL '55 days', 'upcoming', 'Virtual', true, 300000.00, 150, 23);

COMMENT ON TABLE projects IS 'Stores both club projects and personal member projects';
COMMENT ON TABLE hackathons IS 'Stores hackathon events organized by the club';
COMMENT ON TABLE project_submissions IS 'Stores project idea submissions for review';
COMMENT ON TABLE project_collaborations IS 'Stores collaboration requests for projects';
