-- Add storage_path column to resources table if it doesn't exist
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(500);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_resources_storage_path ON resources(storage_path);

-- Add comment
COMMENT ON COLUMN resources.storage_path IS 'Path to file in Supabase Storage bucket';
