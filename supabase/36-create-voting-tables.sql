-- ============================================================================
-- JKUAT Innovation Club - Voting/Elections System
-- Creates all tables needed for the voting portal
-- ============================================================================

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS voter_eligibility CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS elections CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS election_results CASCADE;
DROP VIEW IF EXISTS voter_participation CASCADE;

-- ============================================================================
-- ELECTIONS TABLE (Main voting events)
-- ============================================================================
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    election_type VARCHAR(50) DEFAULT 'general',
    
    -- Timing
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Settings
    allow_multiple_votes BOOLEAN DEFAULT false,
    require_verification BOOLEAN DEFAULT true,
    results_visible BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- ============================================================================
-- POSITIONS TABLE (Positions being voted for)
-- ============================================================================
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    
    -- Position Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    
    -- Voting Rules
    max_votes INTEGER DEFAULT 1,
    min_votes INTEGER DEFAULT 1,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_vote_range CHECK (max_votes >= min_votes AND min_votes >= 0)
);

-- ============================================================================
-- CANDIDATES TABLE (People running for positions)
-- ============================================================================
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    
    -- Candidate Info
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    bio TEXT,
    manifesto TEXT,
    image_url TEXT,
    
    -- Status
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(position_id, user_id)
);

-- ============================================================================
-- VOTES TABLE (Individual votes cast)
-- ============================================================================
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id),
    
    -- Vote Info
    vote_hash VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate votes
    UNIQUE(election_id, position_id, voter_id, candidate_id)
);

-- ============================================================================
-- VOTER_ELIGIBILITY TABLE (Who can vote in which elections)
-- ============================================================================
CREATE TABLE voter_eligibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Eligibility Info
    is_eligible BOOLEAN DEFAULT true,
    eligibility_reason TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(election_id, user_id)
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_dates ON elections(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_positions_election ON positions(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position_id);
CREATE INDEX IF NOT EXISTS idx_candidates_user ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_position ON votes(position_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_voter_eligibility_election ON voter_eligibility(election_id);
CREATE INDEX IF NOT EXISTS idx_voter_eligibility_user ON voter_eligibility(user_id);

-- ============================================================================
-- TRIGGERS for Updated Timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_voting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_elections_updated_at ON elections;
CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections
    FOR EACH ROW EXECUTE FUNCTION update_voting_updated_at();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_voting_updated_at();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_voting_updated_at();

DROP TRIGGER IF EXISTS update_voter_eligibility_updated_at ON voter_eligibility;
CREATE TRIGGER update_voter_eligibility_updated_at BEFORE UPDATE ON voter_eligibility
    FOR EACH ROW EXECUTE FUNCTION update_voting_updated_at();

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Elections: Public can view active elections
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active elections" ON elections;
CREATE POLICY "Anyone can view active elections" ON elections
    FOR SELECT USING (status = 'active' OR status = 'completed');

DROP POLICY IF EXISTS "Admins can manage elections" ON elections;
CREATE POLICY "Admins can manage elections" ON elections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Positions: Public can view positions for active elections
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view positions for active elections" ON positions;
CREATE POLICY "Anyone can view positions for active elections" ON positions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM elections e
            WHERE e.id = positions.election_id 
            AND e.status IN ('active', 'completed')
        )
    );

DROP POLICY IF EXISTS "Admins can manage positions" ON positions;
CREATE POLICY "Admins can manage positions" ON positions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Candidates: Public can view approved candidates
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved candidates" ON candidates;
CREATE POLICY "Anyone can view approved candidates" ON candidates
    FOR SELECT USING (is_approved = true AND is_active = true);

DROP POLICY IF EXISTS "Users can register as candidates" ON candidates;
CREATE POLICY "Users can register as candidates" ON candidates
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage candidates" ON candidates;
CREATE POLICY "Admins can manage candidates" ON candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Votes: Users can only see their own votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own votes" ON votes;
CREATE POLICY "Users can view their own votes" ON votes
    FOR SELECT USING (voter_id = auth.uid());

DROP POLICY IF EXISTS "Eligible users can vote" ON votes;
CREATE POLICY "Eligible users can vote" ON votes
    FOR INSERT WITH CHECK (
        voter_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM elections e
            WHERE e.id = votes.election_id 
            AND e.status = 'active'
            AND CURRENT_TIMESTAMP BETWEEN e.start_date AND e.end_date
        ) AND
        EXISTS (
            SELECT 1 FROM voter_eligibility ve
            WHERE ve.election_id = votes.election_id 
            AND ve.user_id = auth.uid()
            AND ve.is_eligible = true
        )
    );

DROP POLICY IF EXISTS "Admins can view all votes" ON votes;
CREATE POLICY "Admins can view all votes" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Voter Eligibility: Users can view their own eligibility
ALTER TABLE voter_eligibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own eligibility" ON voter_eligibility;
CREATE POLICY "Users can view their own eligibility" ON voter_eligibility
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage voter eligibility" ON voter_eligibility;
CREATE POLICY "Admins can manage voter eligibility" ON voter_eligibility
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Election Results Summary
CREATE OR REPLACE VIEW election_results AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    p.id as position_id,
    p.title as position_title,
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as vote_count,
    RANK() OVER (PARTITION BY p.id ORDER BY COUNT(v.id) DESC) as rank
FROM elections e
JOIN positions p ON p.election_id = e.id
JOIN candidates c ON c.position_id = p.id
LEFT JOIN votes v ON v.candidate_id = c.id
WHERE e.results_visible = true OR e.status = 'completed'
GROUP BY e.id, e.title, p.id, p.title, c.id, c.name
ORDER BY e.id, p.display_order, vote_count DESC;

-- View: Voter Participation
CREATE OR REPLACE VIEW voter_participation AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    COUNT(DISTINCT ve.user_id) as eligible_voters,
    COUNT(DISTINCT v.voter_id) as voters_participated,
    ROUND(COUNT(DISTINCT v.voter_id)::NUMERIC / NULLIF(COUNT(DISTINCT ve.user_id), 0) * 100, 2) as participation_rate
FROM elections e
LEFT JOIN voter_eligibility ve ON ve.election_id = e.id AND ve.is_eligible = true
LEFT JOIN votes v ON v.election_id = e.id
GROUP BY e.id, e.title;

-- ============================================================================
-- END OF VOTING SYSTEM SCHEMA
-- ============================================================================
