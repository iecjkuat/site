-- Add missing columns to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Update existing articles to have published_at if null
UPDATE articles 
SET published_at = created_at 
WHERE published_at IS NULL AND status = 'published';

-- Verify the update
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;
