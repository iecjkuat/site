-- Fix vote_type constraint to accept 'like' and 'dislike' instead of 'up' and 'down'
-- This aligns the database with the frontend/backend implementation

-- Drop the old constraint
ALTER TABLE idea_votes DROP CONSTRAINT IF EXISTS idea_votes_vote_type_check;

-- Add new constraint with correct values
ALTER TABLE idea_votes ADD CONSTRAINT idea_votes_vote_type_check 
    CHECK (vote_type IN ('like', 'dislike'));

-- Update any existing votes (if any) from old format to new format
UPDATE idea_votes SET vote_type = 'like' WHERE vote_type = 'up';
UPDATE idea_votes SET vote_type = 'dislike' WHERE vote_type = 'down';
