-- =============================================
-- ANONYMOUS VOTING SUPPORT
-- =============================================
-- Adds support for anonymous voting by:
-- 1. Adding anonymous_voting flag to elections table
-- 2. Creating voter_participation table to track who voted (not what they voted)
-- 3. Making voter_id nullable in votes table

-- Drop the existing voter_participation VIEW first
DROP VIEW IF EXISTS voter_participation CASCADE;

-- Add anonymous_voting column to elections table
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS anonymous_voting BOOLEAN DEFAULT false;

-- Create voter_participation TABLE to track who voted without linking to specific votes
CREATE TABLE IF NOT EXISTS voter_participation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Prevent duplicate participation records
    UNIQUE(election_id, user_id)
);

-- Make voter_id nullable in votes table (for anonymous votes)
ALTER TABLE votes 
ALTER COLUMN voter_id DROP NOT NULL;

-- Update the unique constraint to handle anonymous votes
-- Drop the old constraint if it exists
ALTER TABLE votes 
DROP CONSTRAINT IF EXISTS votes_election_id_position_id_voter_id_candidate_id_key;

-- Add new constraint that works with nullable voter_id
-- For non-anonymous: (election_id, position_id, voter_id, candidate_id) must be unique
-- For anonymous: we rely on voter_participation table to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS votes_non_anonymous_unique 
ON votes (election_id, position_id, voter_id, candidate_id) 
WHERE voter_id IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voter_participation_election 
ON voter_participation(election_id);

CREATE INDEX IF NOT EXISTS idx_voter_participation_user 
ON voter_participation(user_id);

CREATE INDEX IF NOT EXISTS idx_votes_anonymous 
ON votes(election_id, position_id, candidate_id) 
WHERE voter_id IS NULL;

-- Update election_results view to work with anonymous votes
DROP VIEW IF EXISTS election_results;

CREATE VIEW election_results AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    e.anonymous_voting,
    p.id as position_id,
    p.title as position_title,
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as vote_count,
    ROUND(
        COUNT(v.id) * 100.0 / 
        NULLIF(SUM(COUNT(v.id)) OVER (PARTITION BY p.id), 0), 
        2
    ) as vote_percentage
FROM elections e
JOIN positions p ON p.election_id = e.id
JOIN candidates c ON c.position_id = p.id
LEFT JOIN votes v ON v.candidate_id = c.id
GROUP BY e.id, e.title, e.anonymous_voting, p.id, p.title, c.id, c.name
ORDER BY e.id, p.display_order, vote_count DESC;

-- Update voter_participation view (recreate with different name to avoid conflict)
DROP VIEW IF EXISTS voter_participation_stats;

CREATE VIEW voter_participation_stats AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    e.anonymous_voting,
    CASE 
        WHEN e.anonymous_voting THEN 
            (SELECT COUNT(DISTINCT vp.user_id) 
             FROM voter_participation vp 
             WHERE vp.election_id = e.id)
        ELSE 
            (SELECT COUNT(DISTINCT v.voter_id) 
             FROM votes v 
             WHERE v.election_id = e.id AND v.voter_id IS NOT NULL)
    END as total_voters,
    (SELECT COUNT(DISTINCT user_id) 
     FROM voter_eligibility 
     WHERE election_id = e.id AND is_eligible = true) as eligible_voters,
    ROUND(
        CASE 
            WHEN e.anonymous_voting THEN 
                (SELECT COUNT(DISTINCT vp.user_id) 
                 FROM voter_participation vp 
                 WHERE vp.election_id = e.id)
            ELSE 
                (SELECT COUNT(DISTINCT v.voter_id) 
                 FROM votes v 
                 WHERE v.election_id = e.id AND v.voter_id IS NOT NULL)
        END * 100.0 / 
        NULLIF((SELECT COUNT(DISTINCT user_id) 
                FROM voter_eligibility 
                WHERE election_id = e.id AND is_eligible = true), 0),
        2
    ) as participation_rate
FROM elections e;

-- Add comment explaining the anonymous voting system
COMMENT ON COLUMN elections.anonymous_voting IS 
'When true, votes are stored without voter_id. Voter participation is tracked separately in voter_participation table.';

COMMENT ON TABLE voter_participation IS 
'Tracks who voted in each election without linking to specific votes. Used for anonymous voting to prevent duplicate voting while maintaining ballot secrecy.';

-- =============================================
-- VERIFICATION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Anonymous voting support added successfully!';
    RAISE NOTICE '📊 Elections table: anonymous_voting column added';
    RAISE NOTICE '📊 Voter participation TABLE created (replaced old VIEW)';
    RAISE NOTICE '📊 Votes table: voter_id is now nullable';
    RAISE NOTICE '📊 Views updated to support anonymous voting';
    RAISE NOTICE '📊 New view: voter_participation_stats (for statistics)';
    RAISE NOTICE '';
    RAISE NOTICE '💡 How it works:';
    RAISE NOTICE '   - Set anonymous_voting=true when creating election';
    RAISE NOTICE '   - Votes stored WITHOUT voter_id';
    RAISE NOTICE '   - Participation tracked in voter_participation TABLE';
    RAISE NOTICE '   - Prevents duplicate voting while maintaining anonymity';
END $$;
