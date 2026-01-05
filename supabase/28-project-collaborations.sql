-- Project Collaborations System
-- Creates table and functions for project collaboration requests

-- Project Collaborations table
CREATE TABLE IF NOT EXISTS project_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- developer, designer, researcher, marketing, business, mentor, other
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, withdrawn
    message TEXT NOT NULL,
    skills_offered TEXT[] DEFAULT '{}',
    time_commitment VARCHAR(50), -- part-time, significant, full-time, flexible
    contact_email VARCHAR(255),
    
    -- Response from project lead
    response_message TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id) -- One request per user per project
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_project_collaboration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_collaboration_updated_at ON project_collaborations;
CREATE TRIGGER trigger_update_project_collaboration_updated_at
    BEFORE UPDATE ON project_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_project_collaboration_updated_at();

-- Function to update project team_members when collaboration is accepted
CREATE OR REPLACE FUNCTION handle_project_collaboration_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    -- If collaboration request is accepted, add user to project team_members
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        UPDATE projects 
        SET team_members = COALESCE(team_members, '{}') || ARRAY[NEW.user_id]
        WHERE id = NEW.project_id
        AND NOT (NEW.user_id = ANY(COALESCE(team_members, '{}')));
    END IF;
    
    -- If collaboration request is declined or withdrawn, remove user from team_members
    IF (NEW.status IN ('declined', 'withdrawn')) AND OLD.status = 'accepted' THEN
        UPDATE projects 
        SET team_members = array_remove(COALESCE(team_members, '{}'), NEW.user_id)
        WHERE id = NEW.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_project_collaboration_acceptance ON project_collaborations;
CREATE TRIGGER trigger_handle_project_collaboration_acceptance
    AFTER UPDATE ON project_collaborations
    FOR EACH ROW EXECUTE FUNCTION handle_project_collaboration_acceptance();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_collaborations_project_id ON project_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborations_user_id ON project_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborations_status ON project_collaborations(status);
CREATE INDEX IF NOT EXISTS idx_project_collaborations_created_at ON project_collaborations(created_at);

-- Row Level Security
ALTER TABLE project_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all collaboration requests" ON project_collaborations FOR SELECT USING (true);
CREATE POLICY "Users can insert their own collaboration requests" ON project_collaborations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collaboration requests" ON project_collaborations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Project leads can update collaboration status" ON project_collaborations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND project_lead_id = auth.uid())
);

-- Comments
COMMENT ON TABLE project_collaborations IS 'Collaboration requests for projects';
COMMENT ON COLUMN project_collaborations.role IS 'Role the user wants to play in the project';
COMMENT ON COLUMN project_collaborations.status IS 'Status of the collaboration request';
COMMENT ON COLUMN project_collaborations.time_commitment IS 'How much time the user can commit';

-- Insert sample data for testing
DO $$
DECLARE
    sample_project_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get a sample project ID
    SELECT id INTO sample_project_id FROM projects LIMIT 1;
    
    -- Get a sample user ID (not the project lead)
    SELECT id INTO sample_user_id FROM users 
    WHERE id != (SELECT project_lead_id FROM projects WHERE id = sample_project_id LIMIT 1)
    LIMIT 1;
    
    -- Insert sample collaboration requests if we have valid IDs
    IF sample_project_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
        INSERT INTO project_collaborations (
            project_id, 
            user_id, 
            role, 
            message, 
            skills_offered, 
            time_commitment, 
            contact_email,
            status
        ) VALUES
        (
            sample_project_id,
            sample_user_id,
            'developer',
            'I have 3 years of experience in React and Node.js. I would love to contribute to this project and help bring it to life!',
            ARRAY['React', 'Node.js', 'JavaScript', 'MongoDB'],
            'part-time',
            'developer@example.com',
            'pending'
        )
        ON CONFLICT (project_id, user_id) DO NOTHING;
    END IF;
END $$;