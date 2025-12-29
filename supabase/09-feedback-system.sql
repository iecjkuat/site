-- Post-Event Feedback System
-- Creates tables and functions for event feedback collection and analytics

-- Event Feedback table
CREATE TABLE IF NOT EXISTS event_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous feedback
    
    -- Rating system (1-5 stars)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
    organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
    venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
    
    -- Feedback content
    title VARCHAR(200),
    comment TEXT,
    suggestions TEXT,
    
    -- Feedback metadata
    is_anonymous BOOLEAN DEFAULT FALSE,
    attendance_confirmed BOOLEAN DEFAULT FALSE, -- Only attendees can give feedback
    would_recommend BOOLEAN,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_feedback_content CHECK (
        overall_rating IS NOT NULL OR 
        comment IS NOT NULL OR 
        suggestions IS NOT NULL
    )
);

-- Event Feedback Photos table
CREATE TABLE IF NOT EXISTS event_feedback_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES event_feedback(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Photo details
    photo_url TEXT NOT NULL,
    photo_filename VARCHAR(255),
    photo_size INTEGER, -- in bytes
    photo_type VARCHAR(50), -- image/jpeg, image/png, etc.
    
    -- Photo metadata
    caption TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE, -- Moderation
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id)
);

-- Feedback Categories (for structured feedback)
CREATE TABLE IF NOT EXISTS feedback_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- Font Awesome icon class
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Category Ratings (detailed ratings per category)
CREATE TABLE IF NOT EXISTS feedback_category_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES event_feedback(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES feedback_categories(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    UNIQUE(feedback_id, category_id)
);

-- Feedback Analytics View
CREATE OR REPLACE VIEW event_feedback_analytics AS
SELECT 
    e.id as event_id,
    e.title as event_title,
    e.start_date,
    e.end_date,
    
    -- Feedback counts
    COUNT(ef.id) as total_feedback_count,
    COUNT(CASE WHEN ef.is_anonymous = false THEN 1 END) as named_feedback_count,
    COUNT(CASE WHEN ef.is_anonymous = true THEN 1 END) as anonymous_feedback_count,
    
    -- Rating averages
    ROUND(AVG(ef.overall_rating), 2) as avg_overall_rating,
    ROUND(AVG(ef.content_rating), 2) as avg_content_rating,
    ROUND(AVG(ef.organization_rating), 2) as avg_organization_rating,
    ROUND(AVG(ef.venue_rating), 2) as avg_venue_rating,
    
    -- Rating distributions
    COUNT(CASE WHEN ef.overall_rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN ef.overall_rating = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN ef.overall_rating = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN ef.overall_rating = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN ef.overall_rating = 1 THEN 1 END) as one_star_count,
    
    -- Recommendation stats
    COUNT(CASE WHEN ef.would_recommend = true THEN 1 END) as would_recommend_count,
    COUNT(CASE WHEN ef.would_recommend = false THEN 1 END) as would_not_recommend_count,
    
    -- Photo stats
    COUNT(efp.id) as total_photos_count,
    COUNT(CASE WHEN efp.is_approved = true THEN 1 END) as approved_photos_count,
    
    -- Attendee stats
    COUNT(CASE WHEN ef.attendance_confirmed = true THEN 1 END) as attendee_feedback_count,
    
    -- Timestamps
    MIN(ef.created_at) as first_feedback_at,
    MAX(ef.created_at) as latest_feedback_at

FROM events e
LEFT JOIN event_feedback ef ON e.id = ef.event_id
LEFT JOIN event_feedback_photos efp ON e.id = efp.event_id
GROUP BY e.id, e.title, e.start_date, e.end_date;

-- Insert default feedback categories
INSERT INTO feedback_categories (name, description, icon, sort_order) VALUES
('Content Quality', 'Rate the quality and relevance of the event content', 'fas fa-book-open', 1),
('Speaker/Presenter', 'Rate the effectiveness of speakers and presenters', 'fas fa-microphone', 2),
('Organization', 'Rate the event organization and logistics', 'fas fa-tasks', 3),
('Venue & Facilities', 'Rate the venue, facilities, and comfort', 'fas fa-building', 4),
('Networking Opportunities', 'Rate the networking and interaction opportunities', 'fas fa-handshake', 5),
('Learning Outcomes', 'Rate how much you learned from the event', 'fas fa-graduation-cap', 6),
('Value for Money', 'Rate if the event provided good value for the cost', 'fas fa-dollar-sign', 7),
('Overall Experience', 'Rate your overall event experience', 'fas fa-star', 8)
ON CONFLICT (name) DO NOTHING;

-- Function to calculate feedback sentiment
CREATE OR REPLACE FUNCTION calculate_feedback_sentiment(event_uuid UUID)
RETURNS TABLE (
    sentiment_score NUMERIC,
    sentiment_label TEXT,
    positive_feedback_count INTEGER,
    neutral_feedback_count INTEGER,
    negative_feedback_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH sentiment_data AS (
        SELECT 
            ef.overall_rating,
            CASE 
                WHEN ef.overall_rating >= 4 THEN 'positive'
                WHEN ef.overall_rating = 3 THEN 'neutral'
                ELSE 'negative'
            END as sentiment
        FROM event_feedback ef
        WHERE ef.event_id = event_uuid
        AND ef.overall_rating IS NOT NULL
    )
    SELECT 
        COALESCE(AVG(sd.overall_rating), 0)::NUMERIC as sentiment_score,
        CASE 
            WHEN AVG(sd.overall_rating) >= 4 THEN 'Positive'
            WHEN AVG(sd.overall_rating) >= 3 THEN 'Neutral'
            ELSE 'Negative'
        END as sentiment_label,
        COUNT(CASE WHEN sd.sentiment = 'positive' THEN 1 END)::INTEGER as positive_feedback_count,
        COUNT(CASE WHEN sd.sentiment = 'neutral' THEN 1 END)::INTEGER as neutral_feedback_count,
        COUNT(CASE WHEN sd.sentiment = 'negative' THEN 1 END)::INTEGER as negative_feedback_count
    FROM sentiment_data sd;
END;
$$ LANGUAGE plpgsql;

-- Function to get feedback summary for an event
CREATE OR REPLACE FUNCTION get_event_feedback_summary(event_uuid UUID)
RETURNS TABLE (
    total_feedback INTEGER,
    avg_rating NUMERIC,
    recommendation_rate NUMERIC,
    top_positive_comments TEXT[],
    top_suggestions TEXT[],
    category_ratings JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH feedback_stats AS (
        SELECT 
            COUNT(*)::INTEGER as total_count,
            ROUND(AVG(overall_rating), 2) as average_rating,
            ROUND(
                (COUNT(CASE WHEN would_recommend = true THEN 1 END)::NUMERIC / 
                 NULLIF(COUNT(CASE WHEN would_recommend IS NOT NULL THEN 1 END), 0)) * 100, 
                1
            ) as recommend_percentage
        FROM event_feedback 
        WHERE event_id = event_uuid
    ),
    top_comments AS (
        SELECT ARRAY_AGG(comment ORDER BY created_at DESC) FILTER (WHERE comment IS NOT NULL AND LENGTH(comment) > 10) as comments
        FROM (
            SELECT comment, created_at
            FROM event_feedback 
            WHERE event_id = event_uuid 
            AND comment IS NOT NULL 
            AND LENGTH(comment) > 10
            AND overall_rating >= 4
            LIMIT 5
        ) t
    ),
    top_suggestions AS (
        SELECT ARRAY_AGG(suggestions ORDER BY created_at DESC) FILTER (WHERE suggestions IS NOT NULL AND LENGTH(suggestions) > 10) as suggestions
        FROM (
            SELECT suggestions, created_at
            FROM event_feedback 
            WHERE event_id = event_uuid 
            AND suggestions IS NOT NULL 
            AND LENGTH(suggestions) > 10
            LIMIT 5
        ) t
    ),
    category_data AS (
        SELECT jsonb_object_agg(
            fc.name, 
            jsonb_build_object(
                'avg_rating', ROUND(AVG(fcr.rating), 2),
                'count', COUNT(fcr.rating)
            )
        ) as categories
        FROM feedback_categories fc
        LEFT JOIN feedback_category_ratings fcr ON fc.id = fcr.category_id
        LEFT JOIN event_feedback ef ON fcr.feedback_id = ef.id
        WHERE ef.event_id = event_uuid OR ef.event_id IS NULL
        GROUP BY fc.id
        HAVING COUNT(fcr.rating) > 0
    )
    SELECT 
        fs.total_count,
        fs.average_rating,
        fs.recommend_percentage,
        COALESCE(tc.comments, ARRAY[]::TEXT[]),
        COALESCE(ts.suggestions, ARRAY[]::TEXT[]),
        COALESCE(cd.categories, '{}'::JSONB)
    FROM feedback_stats fs
    CROSS JOIN top_comments tc
    CROSS JOIN top_suggestions ts
    CROSS JOIN category_data cd;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_feedback_event_id ON event_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_user_id ON event_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_created_at ON event_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_event_feedback_overall_rating ON event_feedback(overall_rating);
CREATE INDEX IF NOT EXISTS idx_event_feedback_photos_event_id ON event_feedback_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_photos_feedback_id ON event_feedback_photos(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_category_ratings_feedback_id ON feedback_category_ratings(feedback_id);

-- Enable RLS
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_feedback_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_category_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Event feedback policies
CREATE POLICY "Users can view all feedback" ON event_feedback FOR SELECT USING (true);
CREATE POLICY "Users can insert their own feedback" ON event_feedback FOR INSERT WITH CHECK (auth.uid() = user_id OR is_anonymous = true);
CREATE POLICY "Users can update their own feedback" ON event_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feedback" ON event_feedback FOR DELETE USING (auth.uid() = user_id);

-- Feedback photos policies
CREATE POLICY "Users can view approved photos" ON event_feedback_photos FOR SELECT USING (is_approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can upload their own photos" ON event_feedback_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own photos" ON event_feedback_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own photos" ON event_feedback_photos FOR DELETE USING (auth.uid() = user_id);

-- Feedback categories policies (read-only for users)
CREATE POLICY "Anyone can view feedback categories" ON feedback_categories FOR SELECT USING (is_active = true);

-- Category ratings policies
CREATE POLICY "Users can view all category ratings" ON feedback_category_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert category ratings with their feedback" ON feedback_category_ratings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM event_feedback WHERE id = feedback_id AND (user_id = auth.uid() OR is_anonymous = true))
);
CREATE POLICY "Users can update their category ratings" ON feedback_category_ratings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM event_feedback WHERE id = feedback_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their category ratings" ON feedback_category_ratings FOR DELETE USING (
    EXISTS (SELECT 1 FROM event_feedback WHERE id = feedback_id AND user_id = auth.uid())
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_feedback_updated_at
    BEFORE UPDATE ON event_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

COMMENT ON TABLE event_feedback IS 'Stores post-event feedback from attendees';
COMMENT ON TABLE event_feedback_photos IS 'Stores photos uploaded by attendees as part of feedback';
COMMENT ON TABLE feedback_categories IS 'Predefined categories for structured feedback';
COMMENT ON TABLE feedback_category_ratings IS 'Detailed ratings per feedback category';
COMMENT ON VIEW event_feedback_analytics IS 'Analytics view for event feedback data';