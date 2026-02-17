-- ============================================================================
-- INSERT SAMPLE IDEAS DATA
-- Innovative ideas from JKUAT Innovation Club members
-- ============================================================================

-- First, ensure we have idea categories
INSERT INTO idea_categories (name, description, icon, color) VALUES
('Technology', 'Tech innovations and software solutions', 'fa-laptop-code', '#3b82f6'),
('Environment', 'Sustainability and environmental solutions', 'fa-leaf', '#10b981'),
('Health', 'Healthcare and wellness innovations', 'fa-heartbeat', '#ef4444'),
('Education', 'Educational technology and learning solutions', 'fa-graduation-cap', '#8b5cf6'),
('Agriculture', 'AgriTech and farming innovations', 'fa-seedling', '#22c55e'),
('Business', 'Business solutions and entrepreneurship', 'fa-briefcase', '#f59e0b'),
('Social Impact', 'Community and social good initiatives', 'fa-hands-helping', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
    tech_cat_id UUID;
    env_cat_id UUID;
    health_cat_id UUID;
    edu_cat_id UUID;
    agri_cat_id UUID;
    biz_cat_id UUID;
    social_cat_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get a valid user ID from the users table (use the first user found)
    SELECT id INTO admin_user_id FROM users LIMIT 1;
    
    -- If no users exist, raise an error
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in the database. Please create at least one user first.';
    END IF;
    
    -- Get category IDs
    SELECT id INTO tech_cat_id FROM idea_categories WHERE name = 'Technology';
    SELECT id INTO env_cat_id FROM idea_categories WHERE name = 'Environment';
    SELECT id INTO health_cat_id FROM idea_categories WHERE name = 'Health';
    SELECT id INTO edu_cat_id FROM idea_categories WHERE name = 'Education';
    SELECT id INTO agri_cat_id FROM idea_categories WHERE name = 'Agriculture';
    SELECT id INTO biz_cat_id FROM idea_categories WHERE name = 'Business';
    SELECT id INTO social_cat_id FROM idea_categories WHERE name = 'Social Impact';

    -- Insert sample ideas
    INSERT INTO ideas (
        title, description, problem_statement, proposed_solution,
        category_id, target_audience, market_potential, feasibility,
        innovation_level, status, tags, likes_count, comments_count,
        votes_count, looking_for_team, user_id, created_at
    ) VALUES
    -- Technology Ideas
    (
        'AI-Powered Study Assistant for Students',
        'An intelligent chatbot that helps students with homework, exam preparation, and personalized learning paths using natural language processing.',
        'Students struggle to get instant help with their studies, especially during late hours when tutors are unavailable.',
        'Develop an AI chatbot trained on academic content that can answer questions, explain concepts, generate practice problems, and track student progress.',
        tech_cat_id,
        ARRAY['University Students', 'High School Students', 'Self-learners'],
        'high',
        'high',
        'moderate',
        'approved',
        ARRAY['AI', 'Education', 'Chatbot', 'NLP'],
        45,
        12,
        58,
        true,
        admin_user_id,
        NOW() - INTERVAL '2 weeks'
    ),
    (
        'Campus Safety Alert System',
        'Real-time mobile app for reporting and receiving alerts about safety incidents on campus with GPS tracking and emergency contacts.',
        'Students feel unsafe on campus, especially at night, and there''s no quick way to alert security or fellow students about incidents.',
        'Create a mobile app with panic button, real-time incident mapping, anonymous reporting, and direct connection to campus security.',
        tech_cat_id,
        ARRAY['University Students', 'Campus Security', 'Parents'],
        'medium',
        'high',
        'incremental',
        'approved',
        ARRAY['Mobile App', 'Safety', 'GPS', 'Security'],
        67,
        18,
        85,
        true,
        admin_user_id,
        NOW() - INTERVAL '1 month'
    ),
    (
        'Blockchain-Based Academic Credentials',
        'Secure, verifiable digital certificates and transcripts stored on blockchain to prevent fraud and enable instant verification.',
        'Academic credential fraud is common, and verification processes are slow and cumbersome for employers and institutions.',
        'Use blockchain technology to issue tamper-proof digital certificates that can be instantly verified by anyone with proper permissions.',
        tech_cat_id,
        ARRAY['Universities', 'Employers', 'Students'],
        'very_high',
        'medium',
        'breakthrough',
        'approved',
        ARRAY['Blockchain', 'Education', 'Verification', 'Web3'],
        92,
        24,
        116,
        true,
        admin_user_id,
        NOW() - INTERVAL '3 weeks'
    ),

    -- Environment Ideas
    (
        'Smart Waste Sorting Bins',
        'IoT-enabled waste bins that automatically sort recyclables using computer vision and provide real-time fill-level monitoring.',
        'Poor waste sorting leads to contamination of recyclables and inefficient waste collection on campus.',
        'Deploy smart bins with cameras and sensors that identify waste types, sort automatically, and notify collection teams when full.',
        env_cat_id,
        ARRAY['Universities', 'Municipalities', 'Businesses'],
        'high',
        'medium',
        'moderate',
        'approved',
        ARRAY['IoT', 'Recycling', 'Computer Vision', 'Sustainability'],
        78,
        15,
        93,
        true,
        admin_user_id,
        NOW() - INTERVAL '10 days'
    ),
    (
        'Campus Carbon Footprint Tracker',
        'Web platform that calculates and tracks the carbon footprint of campus activities and suggests reduction strategies.',
        'Universities lack visibility into their environmental impact and struggle to meet sustainability goals.',
        'Build a comprehensive tracking system that monitors energy use, transportation, waste, and provides actionable insights for reduction.',
        env_cat_id,
        ARRAY['Universities', 'Environmental Officers', 'Students'],
        'medium',
        'high',
        'incremental',
        'approved',
        ARRAY['Sustainability', 'Analytics', 'Climate', 'Dashboard'],
        54,
        9,
        63,
        false,
        admin_user_id,
        NOW() - INTERVAL '5 days'
    ),

    -- Health Ideas
    (
        'Mental Health Support Chatbot',
        'AI-powered chatbot providing 24/7 mental health support, mood tracking, and connecting students with counselors when needed.',
        'Students face mental health challenges but hesitate to seek help due to stigma or lack of immediate access to counselors.',
        'Create an empathetic AI chatbot that provides initial support, tracks mental health patterns, and facilitates connections with professionals.',
        health_cat_id,
        ARRAY['University Students', 'Young Adults', 'Mental Health Professionals'],
        'very_high',
        'high',
        'moderate',
        'approved',
        ARRAY['Mental Health', 'AI', 'Wellness', 'Chatbot'],
        103,
        28,
        131,
        true,
        admin_user_id,
        NOW() - INTERVAL '1 month'
    ),
    (
        'Telemedicine Platform for Rural Areas',
        'Mobile-first telemedicine solution connecting rural patients with doctors via video calls, with offline diagnostic support.',
        'Rural communities lack access to healthcare professionals and must travel long distances for basic medical consultations.',
        'Develop a low-bandwidth telemedicine app with offline capabilities, symptom checker, and integration with local health workers.',
        health_cat_id,
        ARRAY['Rural Communities', 'Healthcare Providers', 'NGOs'],
        'high',
        'medium',
        'moderate',
        'approved',
        ARRAY['Telemedicine', 'Healthcare', 'Mobile', 'Rural'],
        61,
        14,
        75,
        true,
        admin_user_id,
        NOW() - INTERVAL '2 weeks'
    ),

    -- Education Ideas
    (
        'Peer-to-Peer Tutoring Marketplace',
        'Platform connecting students who need help with those who excel in specific subjects, with built-in scheduling and payments.',
        'Students often need help in specific subjects but can''t afford professional tutors, while top students could earn by teaching.',
        'Create a marketplace where students can offer tutoring services, with ratings, scheduling, video calls, and secure payments.',
        edu_cat_id,
        ARRAY['University Students', 'High School Students'],
        'high',
        'high',
        'incremental',
        'approved',
        ARRAY['Education', 'Marketplace', 'Tutoring', 'Peer Learning'],
        88,
        22,
        110,
        true,
        admin_user_id,
        NOW() - INTERVAL '3 weeks'
    ),
    (
        'Interactive Virtual Labs',
        'VR/AR platform for conducting science experiments virtually, making lab education accessible and safe.',
        'Lab equipment is expensive, dangerous, and not always available, limiting hands-on learning opportunities.',
        'Build virtual reality labs where students can conduct experiments safely, repeatedly, and without expensive equipment.',
        edu_cat_id,
        ARRAY['Universities', 'High Schools', 'Online Learners'],
        'very_high',
        'medium',
        'breakthrough',
        'approved',
        ARRAY['VR', 'AR', 'Education', 'Science', 'Labs'],
        125,
        31,
        156,
        true,
        admin_user_id,
        NOW() - INTERVAL '1 month'
    ),

    -- Agriculture Ideas
    (
        'Smart Irrigation System',
        'IoT-based irrigation system that monitors soil moisture and weather to optimize water usage for small-scale farmers.',
        'Farmers waste water and money on inefficient irrigation, leading to crop damage and environmental harm.',
        'Deploy affordable sensors and automated valves controlled by AI that irrigate crops only when needed based on real-time data.',
        agri_cat_id,
        ARRAY['Small-scale Farmers', 'Agricultural Cooperatives'],
        'high',
        'high',
        'moderate',
        'approved',
        ARRAY['IoT', 'Agriculture', 'Water Conservation', 'Smart Farming'],
        72,
        16,
        88,
        true,
        admin_user_id,
        NOW() - INTERVAL '2 weeks'
    ),
    (
        'Crop Disease Detection App',
        'Mobile app using computer vision to identify crop diseases from photos and recommend treatments.',
        'Farmers struggle to identify crop diseases early, leading to significant yield losses and overuse of pesticides.',
        'Train a machine learning model on crop disease images and deploy as a mobile app that provides instant diagnosis and treatment advice.',
        agri_cat_id,
        ARRAY['Farmers', 'Agricultural Extension Officers'],
        'very_high',
        'high',
        'moderate',
        'approved',
        ARRAY['AI', 'Agriculture', 'Computer Vision', 'Mobile'],
        96,
        20,
        116,
        false,
        admin_user_id,
        NOW() - INTERVAL '10 days'
    ),

    -- Business Ideas
    (
        'Local Artisan Marketplace',
        'E-commerce platform showcasing and selling products from local artisans and craftspeople with fair pricing.',
        'Local artisans struggle to reach customers beyond their immediate area and often get exploited by middlemen.',
        'Create an online marketplace with low fees, storytelling features, and direct connection between artisans and customers.',
        biz_cat_id,
        ARRAY['Artisans', 'Craftspeople', 'Conscious Consumers'],
        'medium',
        'high',
        'incremental',
        'approved',
        ARRAY['E-commerce', 'Marketplace', 'Artisans', 'Fair Trade'],
        65,
        13,
        78,
        true,
        admin_user_id,
        NOW() - INTERVAL '1 week'
    ),
    (
        'Micro-Investment Platform for Students',
        'App allowing students to invest small amounts in diversified portfolios and learn about financial markets.',
        'Students want to start investing but lack knowledge and capital, missing out on early wealth-building opportunities.',
        'Build a user-friendly investment app with educational content, low minimum investments, and automated portfolio management.',
        biz_cat_id,
        ARRAY['University Students', 'Young Professionals'],
        'high',
        'medium',
        'incremental',
        'approved',
        ARRAY['Fintech', 'Investment', 'Education', 'Mobile'],
        81,
        19,
        100,
        true,
        admin_user_id,
        NOW() - INTERVAL '2 weeks'
    ),

    -- Social Impact Ideas
    (
        'Community Skill-Sharing Platform',
        'Platform where community members can teach and learn skills from each other for free or low cost.',
        'Many people have valuable skills but no platform to share them, while others want to learn but can''t afford courses.',
        'Create a local skill-sharing network with in-person and virtual sessions, skill verification, and community building features.',
        social_cat_id,
        ARRAY['Community Members', 'Lifelong Learners', 'Skilled Professionals'],
        'medium',
        'high',
        'incremental',
        'approved',
        ARRAY['Community', 'Education', 'Skills', 'Social Good'],
        59,
        11,
        70,
        false,
        admin_user_id,
        NOW() - INTERVAL '1 week'
    ),
    (
        'Food Waste Redistribution Network',
        'App connecting restaurants and events with excess food to charities and individuals in need.',
        'Tons of edible food is wasted daily while many people go hungry, with no efficient system to connect surplus with need.',
        'Build a real-time platform where food providers can post available food and verified recipients can claim it quickly.',
        social_cat_id,
        ARRAY['Restaurants', 'Event Organizers', 'Charities', 'Food Banks'],
        'high',
        'high',
        'moderate',
        'approved',
        ARRAY['Food Security', 'Sustainability', 'Social Impact', 'Mobile'],
        112,
        26,
        138,
        true,
        admin_user_id,
        NOW() - INTERVAL '3 weeks'
    );

END $$;

-- ============================================================================
-- Verify insertion
-- ============================================================================

SELECT 
    ic.name as category,
    COUNT(i.id) as idea_count,
    AVG(i.votes_count) as avg_votes,
    AVG(i.likes_count) as avg_likes
FROM ideas i
JOIN idea_categories ic ON i.category_id = ic.id
GROUP BY ic.name
ORDER BY idea_count DESC;
