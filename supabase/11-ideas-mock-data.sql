-- Ideas Hub Mock Data
-- This file creates sample ideas, categories, and related data for the Ideas & Innovation Hub

-- First, ensure we have idea categories (using INSERT ... ON CONFLICT to handle duplicates)
INSERT INTO idea_categories (id, name, description, icon, color, sort_order, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Technology', 'Tech innovations and digital solutions', 'fas fa-laptop-code', '#3b82f6', 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Agriculture', 'Agricultural innovations and farming solutions', 'fas fa-seedling', '#10b981', 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'Healthcare', 'Medical and health-related innovations', 'fas fa-heartbeat', '#ef4444', 3, true),
('550e8400-e29b-41d4-a716-446655440004', 'Education', 'Educational technology and learning solutions', 'fas fa-graduation-cap', '#8b5cf6', 4, true),
('550e8400-e29b-41d4-a716-446655440005', 'Environment', 'Environmental sustainability and green tech', 'fas fa-leaf', '#059669', 5, true),
('550e8400-e29b-41d4-a716-446655440006', 'Business', 'Business models and entrepreneurship', 'fas fa-briefcase', '#f59e0b', 6, true),
('550e8400-e29b-41d4-a716-446655440007', 'Social Impact', 'Solutions for social problems', 'fas fa-hands-helping', '#ec4899', 7, true),
('550e8400-e29b-41d4-a716-446655440008', 'Finance', 'Financial technology and solutions', 'fas fa-coins', '#f97316', 8, true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Get a sample user ID (use the first admin user)
DO $$
DECLARE
    sample_user_id UUID;
    sample_club_id UUID;
    tech_cat_id UUID;
    agri_cat_id UUID;
    health_cat_id UUID;
    edu_cat_id UUID;
    env_cat_id UUID;
    biz_cat_id UUID;
    social_cat_id UUID;
    finance_cat_id UUID;
BEGIN
    -- Get sample user and club IDs
    SELECT id INTO sample_user_id FROM users WHERE role = 'admin' LIMIT 1;
    SELECT id INTO sample_club_id FROM clubs LIMIT 1;
    
    -- Get actual category IDs from the database
    SELECT id INTO tech_cat_id FROM idea_categories WHERE name LIKE '%Technology%' LIMIT 1;
    SELECT id INTO agri_cat_id FROM idea_categories WHERE name LIKE '%Agriculture%' LIMIT 1;
    SELECT id INTO health_cat_id FROM idea_categories WHERE name LIKE '%Healthcare%' LIMIT 1;
    SELECT id INTO edu_cat_id FROM idea_categories WHERE name LIKE '%Education%' LIMIT 1;
    SELECT id INTO env_cat_id FROM idea_categories WHERE name LIKE '%Environment%' LIMIT 1;
    SELECT id INTO biz_cat_id FROM idea_categories WHERE name LIKE '%Business%' LIMIT 1;
    SELECT id INTO social_cat_id FROM idea_categories WHERE name LIKE '%Social%' LIMIT 1;
    SELECT id INTO finance_cat_id FROM idea_categories WHERE name LIKE '%Finance%' OR name LIKE '%Business%' LIMIT 1;
    
    -- If no admin user exists, create a sample one
    IF sample_user_id IS NULL THEN
        INSERT INTO users (id, name, email, password_hash, role, email_verified, created_at)
        VALUES (
            '550e8400-e29b-41d4-a716-446655440099',
            'Innovation Admin',
            'innovation@jkuatinnovation.ac.ke',
            '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O',
            'admin',
            true,
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
        sample_user_id := '550e8400-e29b-41d4-a716-446655440099';
    END IF;
    
    -- Insert sample ideas using actual category IDs
    INSERT INTO ideas (
        id, user_id, club_id, title, description, category_id, 
        problem_statement, solution_overview, target_audience, 
        stage, complexity_level, estimated_timeline, required_skills, 
        tags, visibility, is_featured, is_seeking_collaborators, 
        views_count, likes_count, comments_count, status, created_at
    ) VALUES
    (
        '550e8400-e29b-41d4-a716-446655440010',
        sample_user_id,
        sample_club_id,
        'Smart Campus Navigation App',
        'A mobile application that helps students navigate the JKUAT campus using AR technology and real-time location services. The app would provide indoor navigation, class schedules integration, and facility information.',
        tech_cat_id,
        'Students often get lost on campus, especially new students. Finding specific lecture halls, labs, and facilities can be time-consuming and stressful.',
        'An AR-powered mobile app that overlays navigation directions on the camera view, integrates with class schedules, and provides real-time updates on facility availability.',
        'JKUAT students, faculty, and visitors',
        'prototype',
        'medium',
        '4-6 months',
        ARRAY['React Native', 'AR Development', 'Backend API', 'UI/UX Design'],
        ARRAY['mobile-app', 'augmented-reality', 'navigation', 'campus', 'student-life'],
        'public',
        true,
        true,
        156,
        23,
        8,
        'approved',
        NOW() - INTERVAL '5 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440011',
        sample_user_id,
        sample_club_id,
        'Vertical Farming System for Urban Areas',
        'An automated vertical farming system designed for urban environments, using IoT sensors and AI to optimize growing conditions for vegetables and herbs.',
        agri_cat_id,
        'Urban areas lack space for traditional farming, leading to food security issues and high transportation costs for fresh produce.',
        'A modular vertical farming system with automated irrigation, LED lighting, and AI-powered monitoring that can be installed in urban buildings.',
        'Urban communities, restaurants, schools',
        'concept',
        'high',
        '8-12 months',
        ARRAY['IoT Development', 'Agriculture Knowledge', 'AI/ML', 'Hardware Design'],
        ARRAY['vertical-farming', 'iot', 'urban-agriculture', 'sustainability', 'automation'],
        'public',
        false,
        true,
        89,
        15,
        12,
        'approved',
        NOW() - INTERVAL '3 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440012',
        sample_user_id,
        sample_club_id,
        'Mental Health Support Chatbot',
        'An AI-powered chatbot that provides 24/7 mental health support for students, offering coping strategies, mood tracking, and crisis intervention resources.',
        health_cat_id,
        'Many students struggle with mental health issues but lack access to immediate support, especially during off-hours or in crisis situations.',
        'A conversational AI trained on mental health resources that can provide immediate support, track mood patterns, and connect users with professional help when needed.',
        'University students, young adults',
        'testing',
        'medium',
        '6-8 months',
        ARRAY['Natural Language Processing', 'Psychology', 'Mobile Development', 'Data Security'],
        ARRAY['mental-health', 'chatbot', 'ai', 'student-support', 'crisis-intervention'],
        'public',
        true,
        false,
        234,
        31,
        19,
        'approved',
        NOW() - INTERVAL '1 day'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440013',
        sample_user_id,
        sample_club_id,
        'Peer-to-Peer Learning Platform',
        'A platform where students can teach and learn from each other, featuring video calls, screen sharing, and a credit system for knowledge exchange.',
        edu_cat_id,
        'Students often struggle with certain subjects and need personalized help that traditional classroom settings cannot provide.',
        'A web platform that matches students based on their strengths and learning needs, facilitating peer tutoring sessions with integrated tools and gamification.',
        'Students, educational institutions',
        'implementation',
        'medium',
        '5-7 months',
        ARRAY['Web Development', 'Video Streaming', 'Matching Algorithms', 'Gamification'],
        ARRAY['peer-learning', 'education', 'tutoring', 'video-calls', 'knowledge-sharing'],
        'public',
        false,
        true,
        178,
        27,
        14,
        'approved',
        NOW() - INTERVAL '2 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440014',
        sample_user_id,
        sample_club_id,
        'Solar-Powered Water Purification System',
        'A portable water purification system powered by solar energy, designed for rural communities without access to clean water infrastructure.',
        env_cat_id,
        'Many rural communities lack access to clean drinking water, leading to waterborne diseases and health issues.',
        'A compact, solar-powered system that uses UV sterilization and filtration to purify water from various sources, requiring minimal maintenance.',
        'Rural communities, disaster relief organizations',
        'prototype',
        'high',
        '10-14 months',
        ARRAY['Solar Engineering', 'Water Treatment', 'Hardware Design', 'Field Testing'],
        ARRAY['solar-power', 'water-purification', 'rural-development', 'sustainability', 'health'],
        'public',
        true,
        true,
        145,
        19,
        7,
        'approved',
        NOW() - INTERVAL '4 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440015',
        sample_user_id,
        sample_club_id,
        'Local Artisan Marketplace',
        'An e-commerce platform specifically designed for local artisans and craftspeople to sell their products directly to consumers, with integrated logistics.',
        biz_cat_id,
        'Local artisans struggle to reach customers beyond their immediate area and often rely on middlemen who reduce their profits.',
        'A digital marketplace with features tailored for artisans: story-telling tools, custom order management, local delivery networks, and fair pricing models.',
        'Local artisans, craft enthusiasts, tourists',
        'concept',
        'medium',
        '6-9 months',
        ARRAY['E-commerce Development', 'Payment Integration', 'Logistics', 'Marketing'],
        ARRAY['marketplace', 'artisans', 'e-commerce', 'local-business', 'crafts'],
        'public',
        false,
        false,
        67,
        11,
        5,
        'approved',
        NOW() - INTERVAL '6 days'
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        views_count = EXCLUDED.views_count,
        likes_count = EXCLUDED.likes_count,
        comments_count = EXCLUDED.comments_count;
    
    -- Insert some sample votes
    INSERT INTO idea_votes (id, idea_id, user_id, vote_type, created_at) VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', sample_user_id, 'like', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', sample_user_id, 'like', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440012', sample_user_id, 'like', NOW() - INTERVAL '3 days')
    ON CONFLICT DO NOTHING;
    
    -- Insert some sample comments
    INSERT INTO idea_comments (id, idea_id, user_id, content, created_at) VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', sample_user_id, 'This is a brilliant idea! I would love to help with the AR development.', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', sample_user_id, 'Have you considered the energy requirements for the LED lighting system?', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440012', sample_user_id, 'Mental health support is crucial. What measures will you take to ensure user privacy?', NOW() - INTERVAL '3 hours')
    ON CONFLICT DO NOTHING;
    
    -- Insert some sample collaboration requests
    INSERT INTO idea_collaborations (id, idea_id, user_id, role, message, skills_offered, status, created_at) VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', sample_user_id, 'developer', 'I have experience with React Native and AR development. Would love to contribute to this project!', ARRAY['React Native', 'ARCore', 'ARKit'], 'pending', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', sample_user_id, 'researcher', 'I am studying agricultural engineering and would like to help with the technical specifications.', ARRAY['Agricultural Engineering', 'IoT Systems'], 'accepted', NOW() - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;
    
END $$;

-- Update idea metrics to reflect the sample data
UPDATE ideas SET 
    views_count = FLOOR(RANDOM() * 200) + 50,
    likes_count = FLOOR(RANDOM() * 30) + 5,
    comments_count = FLOOR(RANDOM() * 15) + 2
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440017'
);

-- Create some sample views for analytics
INSERT INTO idea_views (id, idea_id, user_id, viewed_at)
SELECT 
    gen_random_uuid(),
    i.id,
    u.id,
    NOW() - (RANDOM() * INTERVAL '7 days')
FROM ideas i
CROSS JOIN users u
WHERE i.id IN (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440012'
)
AND RANDOM() < 0.3 -- Only 30% chance to create a view record
ON CONFLICT DO NOTHING;

COMMENT ON TABLE idea_categories IS 'Sample categories for the Ideas & Innovation Hub';
COMMENT ON TABLE ideas IS 'Sample innovative ideas from JKUAT Innovation Club members';