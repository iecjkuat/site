-- ============================================================================
-- Add Unique Constraint to Prevent Duplicate Votes
-- ============================================================================
-- This prevents race conditions where a user could submit multiple votes
-- by clicking the submit button rapidly

-- Add unique constraint for non-anonymous votes
-- This ensures one vote per user per position per election
-- Note: We use a partial unique index instead of a constraint with WHERE clause
CREATE UNIQUE INDEX IF NOT EXISTS unique_voter_election_position_idx 
ON votes (election_id, position_id, voter_id) 
WHERE voter_id IS NOT NULL;

-- Note: Anonymous votes don't have this constraint since voter_id is NULL
-- Anonymous voting prevention is handled by the voter_participation table

-- Verify the index was created
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'votes'
AND indexname = 'unique_voter_election_position_idx';
