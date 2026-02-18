-- Add club_id column to resources table
-- This is needed to associate resources with clubs

-- Add the column
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id);

-- Set club_id for existing resources (use first club)
UPDATE resources 
SET club_id = (SELECT id FROM clubs ORDER BY created_at LIMIT 1)
WHERE club_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_resources_club_id ON resources(club_id);

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'resources' 
AND column_name = 'club_id';
