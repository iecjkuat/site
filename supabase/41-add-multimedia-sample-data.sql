-- ============================================================================
-- Sample Data with Multimedia Voting Options
-- ============================================================================

DO $$
DECLARE
    logo_vote_id UUID;
    video_vote_id UUID;
    logo_pos_id UUID;
    video_pos_id UUID;
BEGIN
    -- ========================================================================
    -- 1. LOGO DESIGN VOTE (Image Voting)
    -- ========================================================================
    INSERT INTO elections (title, description, election_type, start_date, end_date, status, results_visible)
    VALUES (
        'New Club Logo Design',
        'Vote for your favorite logo design for the Innovation Club',
        'general',
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '3 days',
        'active',
        false
    ) RETURNING id INTO logo_vote_id;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (logo_vote_id, 'Select Logo Design', 'Choose the best logo design', 1, 1, 1)
    RETURNING id INTO logo_pos_id;

    -- Insert logo options (using placeholder images)
    INSERT INTO candidates (position_id, name, media_type, media_url, is_approved, is_active, display_order)
    VALUES 
        (logo_pos_id, 'Modern Tech Design', 'image', 'https://via.placeholder.com/300x300/10b981/ffffff?text=Logo+A', true, true, 1),
        (logo_pos_id, 'Classic Innovation', 'image', 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Logo+B', true, true, 2),
        (logo_pos_id, 'Bold Future', 'image', 'https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Logo+C', true, true, 3),
        (logo_pos_id, 'Minimalist Style', 'image', 'https://via.placeholder.com/300x300/f59e0b/ffffff?text=Logo+D', true, true, 4);

    INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
    SELECT logo_vote_id, id, true, true
    FROM users
    WHERE membership_status = 'active';

    -- ========================================================================
    -- 2. PROMOTIONAL VIDEO VOTE (Video Voting)
    -- ========================================================================
    INSERT INTO elections (title, description, election_type, start_date, end_date, status, results_visible)
    VALUES (
        'Best Promotional Video',
        'Vote for the best promotional video for our upcoming hackathon',
        'general',
        NOW() - INTERVAL '30 minutes',
        NOW() + INTERVAL '2 days',
        'active',
        false
    ) RETURNING id INTO video_vote_id;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (video_vote_id, 'Select Best Video', 'Choose the most engaging promotional video', 1, 1, 1)
    RETURNING id INTO video_pos_id;

    -- Insert video options (using placeholder thumbnails)
    INSERT INTO candidates (position_id, name, media_type, thumbnail_url, media_url, is_approved, is_active, display_order)
    VALUES 
        (video_pos_id, 'Innovation Showcase', 'video', 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Video+1', 'https://example.com/video1.mp4', true, true, 1),
        (video_pos_id, 'Tech Revolution', 'video', 'https://via.placeholder.com/400x300/10b981/ffffff?text=Video+2', 'https://example.com/video2.mp4', true, true, 2),
        (video_pos_id, 'Future Builders', 'video', 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Video+3', 'https://example.com/video3.mp4', true, true, 3);

    INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
    SELECT video_vote_id, id, true, true
    FROM users
    WHERE membership_status = 'active';

    -- ========================================================================
    -- 3. Update existing leadership election with profile pictures
    -- ========================================================================
    UPDATE candidates 
    SET 
        media_type = 'profile',
        image_url = CASE name
            WHEN 'Alex Mwangi' THEN 'https://i.pravatar.cc/150?img=12'
            WHEN 'Sarah Njeri' THEN 'https://i.pravatar.cc/150?img=47'
            WHEN 'David Omondi' THEN 'https://i.pravatar.cc/150?img=33'
            WHEN 'Grace Wanjiku' THEN 'https://i.pravatar.cc/150?img=45'
            WHEN 'James Kamau' THEN 'https://i.pravatar.cc/150?img=68'
            ELSE image_url
        END
    WHERE name IN ('Alex Mwangi', 'Sarah Njeri', 'David Omondi', 'Grace Wanjiku', 'James Kamau');

    RAISE NOTICE '✅ Multimedia voting samples created!';
    RAISE NOTICE '📊 Added:';
    RAISE NOTICE '   - Logo Design Vote (Image voting)';
    RAISE NOTICE '   - Promotional Video Vote (Video voting)';
    RAISE NOTICE '   - Updated leadership candidates with profile pictures';
END $$;
