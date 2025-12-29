-- =============================================
-- JKUAT Innovation Club - Meetings & Governance System
-- =============================================

-- Meeting Types Table
CREATE TABLE IF NOT EXISTS meeting_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    requires_quorum BOOLEAN DEFAULT true,
    min_notice_days INTEGER DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type_id INTEGER REFERENCES meeting_types(id),
    description TEXT,
    meeting_date TIMESTAMP NOT NULL,
    venue VARCHAR(200),
    virtual_link TEXT,
    agenda TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed')),
    quorum_required INTEGER DEFAULT 0,
    quorum_achieved INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting Attendees Table
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    attendance_status VARCHAR(50) DEFAULT 'invited' CHECK (attendance_status IN ('invited', 'confirmed', 'attended', 'absent', 'excused')),
    rsvp_date TIMESTAMP,
    check_in_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meeting_id, user_id)
);

-- Meeting Minutes Table
CREATE TABLE IF NOT EXISTS meeting_minutes (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    action_items TEXT,
    decisions_made TEXT,
    next_meeting_date TIMESTAMP,
    recorded_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constitutional Documents Table
CREATE TABLE IF NOT EXISTS constitutional_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- 'constitution', 'bylaws', 'policy', 'procedure'
    content TEXT,
    file_url TEXT,
    version VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'superseded', 'archived')),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Elections Table
CREATE TABLE IF NOT EXISTS elections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    election_type VARCHAR(100) NOT NULL, -- 'annual', 'special', 'referendum'
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    nomination_start TIMESTAMP NOT NULL,
    nomination_end TIMESTAMP NOT NULL,
    campaign_start TIMESTAMP,
    campaign_end TIMESTAMP,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'nomination_open', 'campaign_period', 'voting_open', 'completed', 'cancelled')),
    eligible_voters_count INTEGER DEFAULT 0,
    total_votes_cast INTEGER DEFAULT 0,
    results_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Election Positions Table
CREATE TABLE IF NOT EXISTS election_positions (
    id SERIAL PRIMARY KEY,
    election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
    position_name VARCHAR(100) NOT NULL,
    description TEXT,
    max_candidates INTEGER DEFAULT 10,
    max_winners INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Election Candidates Table
CREATE TABLE IF NOT EXISTS election_candidates (
    id SERIAL PRIMARY KEY,
    election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES election_positions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    manifesto TEXT,
    qualifications TEXT,
    experience TEXT,
    photo_url TEXT,
    nomination_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'nominated' CHECK (status IN ('nominated', 'approved', 'rejected', 'withdrawn')),
    votes_received INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(election_id, position_id, user_id)
);

-- Election Votes Table
CREATE TABLE IF NOT EXISTS election_votes (
    id SERIAL PRIMARY KEY,
    election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES election_positions(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES election_candidates(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id),
    vote_hash VARCHAR(255) NOT NULL, -- For anonymity and verification
    cast_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(election_id, position_id, voter_id)
);

-- Election Results Table
CREATE TABLE IF NOT EXISTS election_results (
    id SERIAL PRIMARY KEY,
    election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES election_positions(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES election_candidates(id) ON DELETE CASCADE,
    votes_count INTEGER NOT NULL,
    percentage DECIMAL(5,2),
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Governance Proposals Table
CREATE TABLE IF NOT EXISTS governance_proposals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    proposal_type VARCHAR(100) NOT NULL, -- 'constitutional_amendment', 'policy_change', 'budget_approval', 'special_resolution'
    content TEXT,
    proposed_by UUID REFERENCES users(id),
    seconded_by UUID REFERENCES users(id),
    meeting_id INTEGER REFERENCES meetings(id),
    voting_start TIMESTAMP,
    voting_end TIMESTAMP,
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'voting', 'passed', 'rejected', 'withdrawn')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposal Votes Table
CREATE TABLE IF NOT EXISTS proposal_votes (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER REFERENCES governance_proposals(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id),
    vote VARCHAR(20) NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
    comment TEXT,
    cast_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, voter_id)
);

-- Insert Default Meeting Types
INSERT INTO meeting_types (name, description, requires_quorum, min_notice_days) VALUES
('Annual General Meeting', 'Yearly meeting for all members to review club activities and elect leadership', true, 21),
('Special General Meeting', 'Emergency or special purpose meeting called by leadership or members', true, 14),
('Executive Committee Meeting', 'Regular meeting of elected officials and committee heads', true, 7),
('Department Meeting', 'Meeting for specific department or section members', false, 3),
('Project Review Meeting', 'Meeting to review ongoing projects and initiatives', false, 3),
('Training Session', 'Educational or skill-building session for members', false, 7);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user ON meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_dates ON elections(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_election_votes_election ON election_votes(election_id);
CREATE INDEX IF NOT EXISTS idx_election_votes_voter ON election_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_status ON governance_proposals(status);

-- Create Functions for Election Management
CREATE OR REPLACE FUNCTION update_election_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update election status based on current time
    IF NEW.nomination_start <= CURRENT_TIMESTAMP AND NEW.nomination_end > CURRENT_TIMESTAMP THEN
        NEW.status = 'nomination_open';
    ELSIF NEW.campaign_start <= CURRENT_TIMESTAMP AND NEW.campaign_end > CURRENT_TIMESTAMP THEN
        NEW.status = 'campaign_period';
    ELSIF NEW.start_date <= CURRENT_TIMESTAMP AND NEW.end_date > CURRENT_TIMESTAMP THEN
        NEW.status = 'voting_open';
    ELSIF NEW.end_date <= CURRENT_TIMESTAMP THEN
        NEW.status = 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger for Election Status Updates
DROP TRIGGER IF EXISTS trigger_update_election_status ON elections;
CREATE TRIGGER trigger_update_election_status
    BEFORE UPDATE ON elections
    FOR EACH ROW
    EXECUTE FUNCTION update_election_status();

-- Create Function to Calculate Election Results
CREATE OR REPLACE FUNCTION calculate_election_results(election_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    pos_record RECORD;
    candidate_record RECORD;
    total_votes INTEGER;
    vote_percentage DECIMAL(5,2);
BEGIN
    -- Clear existing results
    DELETE FROM election_results WHERE election_id = election_id_param;
    
    -- Calculate results for each position
    FOR pos_record IN 
        SELECT id FROM election_positions WHERE election_id = election_id_param
    LOOP
        -- Get total votes for this position
        SELECT COUNT(*) INTO total_votes 
        FROM election_votes 
        WHERE election_id = election_id_param AND position_id = pos_record.id;
        
        -- Calculate results for each candidate in this position
        FOR candidate_record IN
            SELECT c.id, c.user_id, COUNT(v.id) as votes_count
            FROM election_candidates c
            LEFT JOIN election_votes v ON c.id = v.candidate_id
            WHERE c.election_id = election_id_param AND c.position_id = pos_record.id
            GROUP BY c.id, c.user_id
        LOOP
            -- Calculate percentage
            IF total_votes > 0 THEN
                vote_percentage = (candidate_record.votes_count::DECIMAL / total_votes) * 100;
            ELSE
                vote_percentage = 0;
            END IF;
            
            -- Insert result
            INSERT INTO election_results (election_id, position_id, candidate_id, votes_count, percentage)
            VALUES (election_id_param, pos_record.id, candidate_record.id, candidate_record.votes_count, vote_percentage);
            
            -- Update candidate votes count
            UPDATE election_candidates 
            SET votes_received = candidate_record.votes_count 
            WHERE id = candidate_record.id;
        END LOOP;
        
        -- Mark winners (highest vote count for each position)
        UPDATE election_results 
        SET is_winner = true 
        WHERE election_id = election_id_param 
        AND position_id = pos_record.id 
        AND votes_count = (
            SELECT MAX(votes_count) 
            FROM election_results 
            WHERE election_id = election_id_param AND position_id = pos_record.id
        );
    END LOOP;
    
    -- Update total votes cast in election
    UPDATE elections 
    SET total_votes_cast = (
        SELECT COUNT(DISTINCT voter_id) 
        FROM election_votes 
        WHERE election_id = election_id_param
    )
    WHERE id = election_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create Function for Meeting Quorum Check
CREATE OR REPLACE FUNCTION check_meeting_quorum(meeting_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    required_quorum INTEGER;
    current_attendance INTEGER;
BEGIN
    -- Get required quorum
    SELECT quorum_required INTO required_quorum 
    FROM meetings 
    WHERE id = meeting_id_param;
    
    -- Get current attendance count
    SELECT COUNT(*) INTO current_attendance 
    FROM meeting_attendees 
    WHERE meeting_id = meeting_id_param 
    AND attendance_status IN ('confirmed', 'attended');
    
    -- Update meeting quorum achieved
    UPDATE meetings 
    SET quorum_achieved = current_attendance 
    WHERE id = meeting_id_param;
    
    -- Return whether quorum is met
    RETURN current_attendance >= required_quorum;
END;
$$ LANGUAGE plpgsql;

-- Grant Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ Meetings & Governance system tables created successfully!';
    RAISE NOTICE '📋 Created tables: meeting_types, meetings, meeting_attendees, meeting_minutes';
    RAISE NOTICE '🗳️ Created tables: elections, election_positions, election_candidates, election_votes, election_results';
    RAISE NOTICE '📜 Created tables: constitutional_documents, governance_proposals, proposal_votes';
    RAISE NOTICE '⚡ Created functions: update_election_status, calculate_election_results, check_meeting_quorum';
END $$;