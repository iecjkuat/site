-- Ideas & Innovation Hub
-- Creates tables and functions for idea submission, collaboration, and innovation management

-- First, create idea categories table
CREATE TABLE IF NOT EXISTS idea_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- Font Awesome icon class
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate existing ideas table to new structure
DO $$$
BEGIN
    -- Check if we need to add new columns to existing ideas table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'category_id'
    ) THEN
        -- Add new columns to existing table
        ALTER TABLE ideas 
        ADD COLUMN category_id UUID REFERENCES idea_categories(id) ON DELETE SET NULL,
        ADD COLUMN problem_statement TEXT,
        ADD COLUMN solution_overview TEXT,
        ADD COLUMN target_audience TEXT,
        ADD COLUMN stage VARCHAR(50) DEFAULT 'concept',
        ADD COLUMN complexity_level VARCHAR(20) DEFAULT 'medium',
        ADD COLUMN estimated_timeline VARCHAR(100),
        ADD COLUMN required_skills TEXT[],
        ADD COLUMN visibility VARCHAR(20) DEFAULT 'public',
        ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
        ADD COLUMN is_seeking_collaborators BOOLEAN DEFAULT FALSE,
        ADD COLUMN views_count INTEGER DEFAULT 0,
        ADD COLUMN likes_count INTEGER DEFAULT 0,
        ADD COLUMN comments_count INTEGER DEFAULT 0,
        ADD COLUMN collaborators_count INTEGER DEFAULT 0,
        ADD COLUMN keywords TEXT;
        
        -- Update existing data
        UPDATE ideas SET 
            likes_count = COALESCE(upvotes, 0),
            views_count = 0,
            comments_count = 0,
            collaborators_count = 0
        WHERE likes_count IS NULL;
        
    END IF;
END $$;

-- Idea Votes table
CREATE TABLE IF NOT EXISTS idea_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(idea_id, user_id)
);

-- Idea Comments table
CREATE TABLE IF NOT EXISTS idea_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES idea_comments(id) ON DELETE CASCADE, -- For nested comments
    
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idea Collaborations table
CREATE TABLE IF NOT EXISTS idea_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'contributor', -- contributor, co-founder, advisor, etc.
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    message TEXT,
    skills_offered TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(idea_id, user_id)
);

-- Idea Views tracking table
CREATE TABLE IF NOT EXISTS idea_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous views
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idea Media/Attachments table (separate from JSONB for better querying)
CREATE TABLE IF NOT EXISTS idea_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    
    is_primary BOOLEAN DEFAULT FALSE, -- Main image/document
    description TEXT,
    
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default idea categories
INSERT INTO idea_categories (name, description, icon, color, sort_order) VALUES
('Technology & Software', 'Software development, apps, platforms, and tech solutions', 'fas fa-laptop-code', '#3b82f6', 1),
('Agriculture & Food', 'Agricultural innovations, food tech, and sustainable farming', 'fas fa-seedling', '#10b981', 2),
('Healthcare & Medicine', 'Medical devices, health apps, and healthcare solutions', 'fas fa-heartbeat', '#ef4444', 3),
('Education & Learning', 'Educational tools, e-learning platforms, and teaching methods', 'fas fa-graduation-cap', '#8b5cf6', 4),
('Environment & Sustainability', 'Green technology, renewable energy, and environmental solutions', 'fas fa-leaf', '#059669', 5),
('Business & Finance', 'Fintech, business models, and entrepreneurship ideas', 'fas fa-chart-line', '#f59e0b', 6),
('Social Impact', 'Community solutions, social enterprises, and humanitarian projects', 'fas fa-hands-helping', '#ec4899', 7),
('Transportation & Mobility', 'Transport solutions, logistics, and mobility innovations', 'fas fa-car', '#6b7280', 8),
('Entertainment & Media', 'Gaming, content creation, and entertainment platforms', 'fas fa-gamepad', '#f97316', 9),
('Other', 'Ideas that don''t fit into other categories', 'fas fa-lightbulb', '#64748b', 10)
ON CONFLICT (name) DO NOTHING;

-- Ideas Analytics View
CREATE OR REPLACE VIEW ideas_analytics AS
SELECT 
    i.id,
    i.title,
    i.category_id,
    ic.name as category_name,
    i.user_id,
    u.name as author_name,
    i.stage,
    i.complexity_level,
    i.status,
    i.visibility,
    i.is_featured,
    i.is_seeking_collaborators,
    i.created_at,
    i.updated_at,
    
    -- Engagement metrics
    COALESCE(i.views_count, 0) as total_views,
    COALESCE(i.likes_count, 0) as total_likes,
    COALESCE(i.comments_count, 0) as total_comments,
    COALESCE(i.collaborators_count, 0) as total_collaborators,
    
    -- Recent engagement (last 7 days)
    COALESCE(recent_views.count, 0) as recent_views_count,
    COALESCE(recent_likes.count, 0) as recent_likes_count,
    COALESCE(recent_comments.count, 0) as recent_comments_count,
    
    -- Collaboration interest
    COALESCE(collab_requests.count, 0) as collaboration_requests_count,
    
    -- Media count
    COALESCE(media_count.count, 0) as media_count

FROM ideas i
LEFT JOIN idea_categories ic ON i.category_id = ic.id
LEFT JOIN users u ON i.user_id = u.id

-- Recent views (last 7 days)
LEFT JOIN (
    SELECT idea_id, COUNT(*) as count
    FROM idea_views 
    WHERE viewed_at >= NOW() - INTERVAL '7 days'
    GROUP BY idea_id
) recent_views ON i.id = recent_views.idea_id

-- Recent likes (last 7 days)
LEFT JOIN (
    SELECT idea_id, COUNT(*) as count
    FROM idea_votes 
    WHERE vote_type = 'like' AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY idea_id
) recent_likes ON i.id = recent_likes.idea_id

-- Recent comments (last 7 days)
LEFT JOIN (
    SELECT idea_id, COUNT(*) as count
    FROM idea_comments 
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY idea_id
) recent_comments ON i.id = recent_comments.idea_id

-- Collaboration requests
LEFT JOIN (
    SELECT idea_id, COUNT(*) as count
    FROM idea_collaborations 
    WHERE status = 'pending'
    GROUP BY idea_id
) collab_requests ON i.id = collab_requests.idea_id

-- Media count
LEFT JOIN (
    SELECT idea_id, COUNT(*) as count
    FROM idea_media
    GROUP BY idea_id
) media_count ON i.id = media_count.idea_id;

-- Function to get similar ideas based on tags, category, and keywords
CREATE OR REPLACE FUNCTION get_similar_ideas(target_idea_id UUID, similarity_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    idea_id UUID,
    title VARCHAR(200),
    similarity_score NUMERIC,
    matching_tags TEXT[]
) AS $$$
BEGIN
    RETURN QUERY
    WITH target_idea AS (
        SELECT tags, keywords, category_id
        FROM ideas 
        WHERE id = target_idea_id
    )
    SELECT 
        i.id as idea_id,
        i.title,
        (
            -- Base similarity score
            CASE WHEN array_length(i.tags, 1) > 0 AND array_length(ti.tags, 1) > 0 
                 THEN (SELECT COUNT(*) FROM unnest(i.tags) tag WHERE tag = ANY(ti.tags))::NUMERIC / 
                      GREATEST(array_length(i.tags, 1), array_length(ti.tags, 1))
                 ELSE 0 
            END +
            
            -- Boost score if same category
            CASE WHEN i.category_id = ti.category_id THEN 0.2 ELSE 0 END +
            
            -- Keyword similarity (simple text matching)
            CASE WHEN i.keywords IS NOT NULL AND ti.keywords IS NOT NULL 
                 THEN similarity(i.keywords, ti.keywords) * 0.3
                 ELSE 0 
            END
        ) as similarity_score,
        
        -- Get matching tags
        ARRAY(
            SELECT unnest(i.tags) 
            INTERSECT 
            SELECT unnest(ti.tags)
        ) as matching_tags
        
    FROM ideas i, target_idea ti
    WHERE i.id != target_idea_id 
      AND i.visibility = 'public'
      AND i.status = 'active'
    ORDER BY similarity_score DESC
    LIMIT similarity_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update idea engagement metrics
CREATE OR REPLACE FUNCTION update_idea_metrics(target_idea_id UUID)
RETURNS VOID AS $$$
BEGIN
    UPDATE ideas SET
        views_count = (
            SELECT COUNT(*) FROM idea_views WHERE idea_id = target_idea_id
        ),
        likes_count = (
            SELECT COUNT(*) FROM idea_votes WHERE idea_id = target_idea_id AND vote_type = 'like'
        ),
        comments_count = (
            SELECT COUNT(*) FROM idea_comments WHERE idea_id = target_idea_id
        ),
        collaborators_count = (
            SELECT COUNT(*) FROM idea_collaborations WHERE idea_id = target_idea_id AND status = 'accepted'
        )
    WHERE id = target_idea_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics when votes change
CREATE OR REPLACE FUNCTION update_idea_metrics_trigger()
RETURNS TRIGGER AS $$$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_idea_metrics(NEW.idea_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_idea_metrics(OLD.idea_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_idea_metrics_votes ON idea_votes;
CREATE TRIGGER trigger_update_idea_metrics_votes
    AFTER INSERT OR UPDATE OR DELETE ON idea_votes
    FOR EACH ROW EXECUTE FUNCTION update_idea_metrics_trigger();

DROP TRIGGER IF EXISTS trigger_update_idea_metrics_comments ON idea_comments;
CREATE TRIGGER trigger_update_idea_metrics_comments
    AFTER INSERT OR UPDATE OR DELETE ON idea_comments
    FOR EACH ROW EXECUTE FUNCTION update_idea_metrics_trigger();

DROP TRIGGER IF EXISTS trigger_update_idea_metrics_collaborations ON idea_collaborations;
CREATE TRIGGER trigger_update_idea_metrics_collaborations
    AFTER INSERT OR UPDATE OR DELETE ON idea_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_idea_metrics_trigger();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category_id ON ideas(category_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_visibility ON ideas(visibility);
CREATE INDEX IF NOT EXISTS idx_ideas_stage ON ideas(stage);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_is_featured ON ideas(is_featured);
CREATE INDEX IF NOT EXISTS idx_ideas_is_seeking_collaborators ON ideas(is_seeking_collaborators);

CREATE INDEX IF NOT EXISTS idx_idea_votes_idea_id ON idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_votes_user_id ON idea_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_votes_vote_type ON idea_votes(vote_type);

CREATE INDEX IF NOT EXISTS idx_idea_comments_idea_id ON idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_comments_user_id ON idea_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_comments_parent_id ON idea_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_user_id ON idea_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_status ON idea_collaborations(status);

CREATE INDEX IF NOT EXISTS idx_idea_views_idea_id ON idea_views(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_views_viewed_at ON idea_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_idea_media_idea_id ON idea_media(idea_id);

-- Enable RLS
ALTER TABLE idea_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Idea categories (read-only for users)
CREATE POLICY "Anyone can view active categories" ON idea_categories FOR SELECT USING (is_active = true);

-- Idea votes
CREATE POLICY "Users can view all votes" ON idea_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes" ON idea_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON idea_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON idea_votes FOR DELETE USING (auth.uid() = user_id);

-- Idea comments
CREATE POLICY "Users can view all comments" ON idea_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON idea_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON idea_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON idea_comments FOR DELETE USING (auth.uid() = user_id);

-- Idea collaborations
CREATE POLICY "Users can view all collaborations" ON idea_collaborations FOR SELECT USING (true);
CREATE POLICY "Users can insert collaboration requests" ON idea_collaborations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collaboration requests" ON idea_collaborations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Idea owners can update collaboration status" ON idea_collaborations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND user_id = auth.uid())
);

-- Idea views (insert only for tracking)
CREATE POLICY "Anyone can insert views" ON idea_views FOR INSERT WITH CHECK (true);

-- Idea media
CREATE POLICY "Users can view all media" ON idea_media FOR SELECT USING (true);
CREATE POLICY "Users can insert their own media" ON idea_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media" ON idea_media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media" ON idea_media FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE idea_categories IS 'Categories for organizing ideas';
COMMENT ON TABLE idea_votes IS 'User votes (likes/dislikes) on ideas';
COMMENT ON TABLE idea_comments IS 'Comments and discussions on ideas';
COMMENT ON TABLE idea_collaborations IS 'Collaboration requests and partnerships';
COMMENT ON TABLE idea_views IS 'View tracking for analytics';
COMMENT ON TABLE idea_media IS 'Media files and attachments for ideas';
COMMENT ON VIEW ideas_analytics IS 'Analytics view for idea engagement metrics';