-- ============================================================================
-- PROJECT COLLABORATIONS SYSTEM
-- Handles collaboration requests for projects
-- ============================================================================

-- Create project_collaborations table
CREATE TABLE IF NOT EXISTS project_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Collaboration Details
    role VARCHAR(100) NOT NULL, -- e.g., "Developer", "Designer", "Marketing"
    message TEXT NOT NULL, -- Why they want to collaborate
    skills_offered TEXT[], -- Array of skills they can contribute
    time_commitment VARCHAR(100), -- e.g., "5 hours/week", "Full-time"
    contact_email VARCHAR(255) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
    
    -- Response from project lead
    response_message TEXT,
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(project_id, user_id) -- One collaboration request per user per project
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_collaborations_project_id ON project_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborations_user_id ON project_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborations_status ON project_collaborations(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_project_collaborations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_collaborations_updated_at
    BEFORE UPDATE ON project_collaborations
    FOR EACH ROW
    EXECUTE FUNCTION update_project_collaborations_updated_at();

-- Enable Row Level Security
ALTER TABLE project_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can create a collaboration request
CREATE POLICY "Anyone can create collaboration requests"
    ON project_collaborations
    FOR INSERT
    WITH CHECK (true);

-- Users can view their own collaboration requests
CREATE POLICY "Users can view their own collaboration requests"
    ON project_collaborations
    FOR SELECT
    USING (user_id = auth.uid());

-- Project leads can view all collaboration requests for their projects
CREATE POLICY "Project leads can view collaboration requests for their projects"
    ON project_collaborations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_collaborations.project_id
            AND projects.project_lead_id = auth.uid()
        )
    );

-- Project leads can update collaboration requests for their projects
CREATE POLICY "Project leads can update collaboration requests"
    ON project_collaborations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_collaborations.project_id
            AND projects.project_lead_id = auth.uid()
        )
    );

-- Users can withdraw their own collaboration requests
CREATE POLICY "Users can withdraw their own requests"
    ON project_collaborations
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (status = 'withdrawn');

-- Admins can view and manage all collaboration requests
CREATE POLICY "Admins can manage all collaboration requests"
    ON project_collaborations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'executive')
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get collaboration statistics for a project
CREATE OR REPLACE FUNCTION get_project_collaboration_stats(project_uuid UUID)
RETURNS TABLE (
    total_requests BIGINT,
    pending_requests BIGINT,
    accepted_requests BIGINT,
    declined_requests BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted_requests,
        COUNT(*) FILTER (WHERE status = 'declined') as declined_requests
    FROM project_collaborations
    WHERE project_id = project_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'project_collaborations'
ORDER BY ordinal_position;

-- Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'project_collaborations';
