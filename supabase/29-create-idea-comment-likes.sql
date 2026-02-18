-- Create idea_comment_likes table for tracking likes on idea comments
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS idea_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES idea_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure a user can only like a comment once
  UNIQUE(comment_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_idea_comment_likes_comment_id ON idea_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_idea_comment_likes_user_id ON idea_comment_likes(user_id);

-- Add comment
COMMENT ON TABLE idea_comment_likes IS 'Tracks likes on idea comments';

-- Create a function to update likes_count on idea_comments
CREATE OR REPLACE FUNCTION update_idea_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE idea_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE idea_comments 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update likes_count
DROP TRIGGER IF EXISTS update_idea_comment_likes_count_trigger ON idea_comment_likes;
CREATE TRIGGER update_idea_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON idea_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_idea_comment_likes_count();

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'idea_comment_likes'
ORDER BY ordinal_position;
