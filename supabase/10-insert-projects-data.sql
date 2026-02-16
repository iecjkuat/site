-- ============================================================================
-- INSERT SAMPLE PROJECTS DATA
-- Mix of club projects and personal projects
-- ============================================================================

-- First, let's add 'club' and 'personal' to the project_type enum if not already there
-- We'll update the constraint to allow these values
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
ALTER TABLE projects ADD CONSTRAINT projects_project_type_check 
  CHECK (project_type IN ('innovation', 'research', 'startup', 'hackathon', 'club', 'personal', 'other'));

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='github_url') THEN
        ALTER TABLE projects ADD COLUMN github_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='tech_stack') THEN
        ALTER TABLE projects ADD COLUMN tech_stack TEXT[];
    END IF;
END $$;

-- ============================================================================
-- CLUB PROJECTS (Created by admins/executives)
-- ============================================================================

INSERT INTO projects (
    title, description, category, status, project_type,
    github_url, demo_url, tech_stack, technologies,
    banner_image, tags, progress_percentage,
    start_date, created_at
) VALUES
(
    'Smart Campus Navigation System',
    'An AI-powered mobile app that helps students navigate the JKUAT campus efficiently. Features include real-time location tracking, building information, class schedules integration, and optimal route suggestions.',
    'innovation',
    'active',
    'club',
    'https://github.com/jkuat-innovation/campus-nav',
    'https://campus-nav.jkuat.ac.ke',
    ARRAY['React Native', 'Node.js', 'MongoDB', 'Google Maps API'],
    ARRAY['React Native', 'Node.js', 'MongoDB', 'Google Maps API'],
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    ARRAY['mobile', 'AI', 'navigation', 'campus'],
    75,
    '2025-09-01',
    NOW() - INTERVAL '4 months'
),
(
    'AgriTech IoT Platform',
    'IoT-based smart farming solution for Kenyan farmers. Monitors soil moisture, temperature, and provides automated irrigation recommendations using machine learning.',
    'innovation',
    'active',
    'club',
    'https://github.com/jkuat-innovation/agritech-iot',
    'https://agritech.jkuat.ac.ke',
    ARRAY['Python', 'Arduino', 'TensorFlow', 'React', 'PostgreSQL'],
    ARRAY['Python', 'Arduino', 'TensorFlow', 'React', 'PostgreSQL'],
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    ARRAY['IoT', 'agriculture', 'ML', 'sustainability'],
    60,
    '2025-08-15',
    NOW() - INTERVAL '5 months'
),
(
    'Student Marketplace Platform',
    'A peer-to-peer marketplace exclusively for JKUAT students to buy, sell, and exchange items. Features secure payments, user ratings, and campus delivery integration.',
    'startup',
    'completed',
    'club',
    'https://github.com/jkuat-innovation/student-marketplace',
    'https://marketplace.jkuat.ac.ke',
    ARRAY['Next.js', 'Stripe', 'Firebase', 'Tailwind CSS'],
    ARRAY['Next.js', 'Stripe', 'Firebase', 'Tailwind CSS'],
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    ARRAY['e-commerce', 'marketplace', 'fintech'],
    100,
    '2025-03-01',
    NOW() - INTERVAL '10 months'
),
(
    'Mental Health Chatbot',
    'AI-powered chatbot providing mental health support and resources for university students. Offers 24/7 anonymous counseling, mood tracking, and connects students with professional help.',
    'innovation',
    'active',
    'club',
    'https://github.com/jkuat-innovation/mental-health-bot',
    NULL,
    ARRAY['Python', 'NLP', 'Flask', 'Vue.js', 'PostgreSQL'],
    ARRAY['Python', 'NLP', 'Flask', 'Vue.js', 'PostgreSQL'],
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    ARRAY['AI', 'health', 'chatbot', 'mental-health'],
    45,
    '2026-01-10',
    NOW() - INTERVAL '1 month'
),
(
    'Blockchain Voting System',
    'Secure and transparent voting system for student elections using blockchain technology. Ensures vote integrity, anonymity, and real-time results.',
    'research',
    'planning',
    'club',
    'https://github.com/jkuat-innovation/blockchain-voting',
    NULL,
    ARRAY['Solidity', 'Ethereum', 'Web3.js', 'React'],
    ARRAY['Solidity', 'Ethereum', 'Web3.js', 'React'],
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    ARRAY['blockchain', 'security', 'voting', 'web3'],
    20,
    '2026-03-01',
    NOW() - INTERVAL '2 weeks'
);

-- ============================================================================
-- PERSONAL PROJECTS (Submitted by members)
-- ============================================================================

INSERT INTO projects (
    title, description, category, status, project_type,
    github_url, demo_url, tech_stack, technologies,
    banner_image, tags, progress_percentage,
    start_date, created_at
) VALUES
(
    'EcoTrack - Carbon Footprint Calculator',
    'Personal project to help individuals track and reduce their carbon footprint. Features daily activity logging, personalized recommendations, and community challenges.',
    'innovation',
    'active',
    'personal',
    'https://github.com/username/ecotrack',
    'https://ecotrack-demo.vercel.app',
    ARRAY['React', 'Node.js', 'MongoDB', 'Chart.js'],
    ARRAY['React', 'Node.js', 'MongoDB', 'Chart.js'],
    'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
    ARRAY['environment', 'sustainability', 'tracking'],
    80,
    '2025-11-01',
    NOW() - INTERVAL '3 months'
),
(
    'StudyBuddy - Collaborative Learning App',
    'Mobile app connecting students for group study sessions. Features include study room finder, note sharing, and video call integration.',
    'innovation',
    'active',
    'personal',
    'https://github.com/username/studybuddy',
    NULL,
    ARRAY['Flutter', 'Firebase', 'WebRTC'],
    ARRAY['Flutter', 'Firebase', 'WebRTC'],
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    ARRAY['education', 'mobile', 'collaboration'],
    55,
    '2025-10-15',
    NOW() - INTERVAL '4 months'
),
(
    'Recipe Recommendation Engine',
    'ML-powered app that suggests recipes based on available ingredients, dietary preferences, and nutritional goals.',
    'innovation',
    'completed',
    'personal',
    'https://github.com/username/recipe-engine',
    'https://recipe-engine.netlify.app',
    ARRAY['Python', 'TensorFlow', 'FastAPI', 'React'],
    ARRAY['Python', 'TensorFlow', 'FastAPI', 'React'],
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    ARRAY['ML', 'food', 'health', 'recommendation'],
    100,
    '2025-06-01',
    NOW() - INTERVAL '8 months'
),
(
    'Local Business Directory',
    'Web platform showcasing local businesses around JKUAT. Features business profiles, reviews, and location-based search.',
    'startup',
    'active',
    'personal',
    'https://github.com/username/local-biz',
    'https://jkuat-local.com',
    ARRAY['Next.js', 'PostgreSQL', 'Google Maps', 'Tailwind'],
    ARRAY['Next.js', 'PostgreSQL', 'Google Maps', 'Tailwind'],
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
    ARRAY['business', 'directory', 'local', 'maps'],
    70,
    '2025-09-20',
    NOW() - INTERVAL '5 months'
),
(
    'Fitness Tracker Dashboard',
    'Personal fitness tracking dashboard with workout logging, progress visualization, and goal setting features.',
    'innovation',
    'planning',
    'personal',
    'https://github.com/username/fitness-tracker',
    NULL,
    ARRAY['Vue.js', 'Express', 'MySQL', 'Chart.js'],
    ARRAY['Vue.js', 'Express', 'MySQL', 'Chart.js'],
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    ARRAY['health', 'fitness', 'tracking', 'dashboard'],
    30,
    '2026-02-01',
    NOW() - INTERVAL '2 weeks'
);

-- ============================================================================
-- Update statistics
-- ============================================================================

-- Add some likes and views to make it realistic
UPDATE projects SET likes_count = floor(random() * 50 + 10)::int WHERE project_type = 'club';
UPDATE projects SET likes_count = floor(random() * 30 + 5)::int WHERE project_type = 'personal';
UPDATE projects SET views_count = floor(random() * 200 + 50)::int WHERE project_type = 'club';
UPDATE projects SET views_count = floor(random() * 100 + 20)::int WHERE project_type = 'personal';

-- ============================================================================
-- Verify insertion
-- ============================================================================

SELECT 
    project_type,
    COUNT(*) as count,
    AVG(progress_percentage) as avg_progress
FROM projects
GROUP BY project_type
ORDER BY project_type;
