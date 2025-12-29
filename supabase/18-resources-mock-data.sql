-- =============================================
-- JKUAT Innovation Club - Resources Mock Data
-- =============================================

-- Note: Categories and SDG goals are already inserted in the schema file
-- This file only contains sample resources and related data

-- Insert Sample Resources
INSERT INTO resources (
    id, title, description, content, resource_type, category_id, 
    file_url, file_type, file_size, version, tags, is_featured, 
    access_level, created_by, is_public
) VALUES

-- Constitution & Governance Resources (Category 1)
(
    gen_random_uuid(),
    'JKUAT Innovation Club Constitution 2024',
    'Official constitution document outlining club structure, governance, and procedures for the JKUAT Innovation and Entrepreneurship Club.',
    'The official constitution of JKUAT Innovation and Entrepreneurship Club, establishing the legal framework for club operations, member rights, leadership structure, and governance procedures. This document serves as the foundational legal document for all club activities.',
    'constitution',
    1,
    '/documents/constitution-2024.pdf',
    'pdf',
    2048576,
    '2.1',
    ARRAY['constitution', 'governance', 'legal', 'official', 'club-rules'],
    true,
    'public',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Club Bylaws and Operating Procedures',
    'Detailed bylaws and standard operating procedures for day-to-day club activities and member conduct.',
    'Comprehensive bylaws document covering day-to-day operations, meeting procedures, project management, financial procedures, and member conduct guidelines. Essential reading for all club members.',
    'document',
    1,
    '/documents/bylaws-2024.pdf',
    'pdf',
    1536000,
    '1.3',
    ARRAY['bylaws', 'procedures', 'operations', 'guidelines'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Leadership Handbook',
    'Comprehensive guide for club leaders including responsibilities, procedures, and best practices.',
    'Essential handbook for all club leaders covering leadership responsibilities, meeting management, decision-making processes, conflict resolution, and member engagement strategies.',
    'handbook',
    1,
    '/documents/leadership-handbook.pdf',
    'pdf',
    3072000,
    '2.0',
    ARRAY['leadership', 'management', 'responsibilities', 'executive'],
    false,
    'executive',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),

-- Project Templates (Category 2)
(
    gen_random_uuid(),
    'Business Plan Template',
    'Comprehensive business plan template for innovation projects and startup ideas.',
    'Professional business plan template including executive summary, market analysis, financial projections, and implementation timeline. Perfect for innovation projects and entrepreneurship initiatives.',
    'template',
    2,
    '/templates/business-plan-template.docx',
    'docx',
    512000,
    '1.5',
    ARRAY['business-plan', 'template', 'startup', 'entrepreneurship'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Project Proposal Template',
    'Standard template for submitting innovation project proposals to the club.',
    'Structured template for project proposals including problem statement, solution overview, implementation plan, resource requirements, and expected outcomes.',
    'template',
    2,
    '/templates/project-proposal-template.docx',
    'docx',
    256000,
    '2.1',
    ARRAY['project', 'proposal', 'template', 'innovation'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Research Paper Template',
    'Academic research paper template following standard formatting guidelines.',
    'Professional research paper template with proper formatting, citation styles, and structure for academic and technical research publications.',
    'template',
    2,
    '/templates/research-paper-template.docx',
    'docx',
    384000,
    '1.2',
    ARRAY['research', 'academic', 'template', 'paper'],
    false,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),

-- Technical Documentation (Category 3)
(
    gen_random_uuid(),
    'API Development Guide',
    'Comprehensive guide for developing and documenting APIs for club projects.',
    'Technical guide covering REST API design principles, documentation standards, authentication methods, and best practices for API development in club projects.',
    'guide',
    3,
    '/docs/api-development-guide.pdf',
    'pdf',
    1792000,
    '1.4',
    ARRAY['api', 'development', 'technical', 'programming'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Database Design Standards',
    'Standards and best practices for database design in innovation projects.',
    'Technical documentation covering database design principles, normalization, indexing strategies, and security considerations for project databases.',
    'document',
    3,
    '/docs/database-design-standards.pdf',
    'pdf',
    1024000,
    '2.0',
    ARRAY['database', 'design', 'standards', 'technical'],
    false,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),

-- Training Materials (Category 4)
(
    gen_random_uuid(),
    'Innovation Methodology Workshop',
    'Training materials for innovation methodology and design thinking workshops.',
    'Comprehensive training materials covering design thinking process, innovation frameworks, ideation techniques, and prototyping methods for club workshops.',
    'guide',
    4,
    '/training/innovation-methodology.pdf',
    'pdf',
    2560000,
    '1.6',
    ARRAY['innovation', 'design-thinking', 'workshop', 'training'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Entrepreneurship Fundamentals',
    'Basic entrepreneurship training materials covering startup essentials.',
    'Training materials covering entrepreneurship basics, market validation, business model development, and startup funding strategies.',
    'document',
    4,
    '/training/entrepreneurship-fundamentals.pdf',
    'pdf',
    1856000,
    '1.3',
    ARRAY['entrepreneurship', 'startup', 'business', 'training'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),

-- Event Resources (Category 5)
(
    gen_random_uuid(),
    'Event Planning Checklist',
    'Comprehensive checklist for planning and organizing club events.',
    'Detailed checklist covering all aspects of event planning including venue booking, logistics, marketing, registration, and post-event evaluation.',
    'template',
    5,
    '/events/event-planning-checklist.pdf',
    'pdf',
    768000,
    '2.2',
    ARRAY['events', 'planning', 'checklist', 'organization'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Hackathon Organization Guide',
    'Complete guide for organizing successful hackathons and coding competitions.',
    'Comprehensive guide covering hackathon planning, participant management, judging criteria, prize structure, and technical infrastructure requirements.',
    'guide',
    5,
    '/events/hackathon-guide.pdf',
    'pdf',
    2048000,
    '1.8',
    ARRAY['hackathon', 'competition', 'coding', 'events'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),

-- Financial Templates (Category 6)
(
    gen_random_uuid(),
    'Budget Planning Template',
    'Excel template for project and event budget planning and tracking.',
    'Professional budget template with automated calculations, expense categories, and variance tracking for projects and events.',
    'template',
    6,
    '/finance/budget-template.xlsx',
    'xlsx',
    128000,
    '1.4',
    ARRAY['budget', 'finance', 'planning', 'template'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Financial Report Template',
    'Template for creating financial reports and statements.',
    'Professional financial reporting template including income statements, expense tracking, and financial analysis sections.',
    'template',
    6,
    '/finance/financial-report-template.xlsx',
    'xlsx',
    256000,
    '1.1',
    ARRAY['finance', 'reporting', 'template', 'accounting'],
    false,
    'executive',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),

-- Marketing Materials (Category 7)
(
    gen_random_uuid(),
    'Brand Guidelines 2024',
    'Official brand guidelines including logos, colors, fonts, and usage standards.',
    'Comprehensive brand guidelines document covering logo usage, color palette, typography, imagery style, and brand voice for all club communications.',
    'document',
    7,
    '/marketing/brand-guidelines-2024.pdf',
    'pdf',
    4096000,
    '3.0',
    ARRAY['branding', 'guidelines', 'logo', 'marketing'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Social Media Templates',
    'Collection of social media post templates and graphics.',
    'Ready-to-use social media templates for Facebook, Instagram, Twitter, and LinkedIn posts including event announcements, project showcases, and general updates.',
    'template',
    7,
    '/marketing/social-media-templates.zip',
    'zip',
    15728640,
    '1.5',
    ARRAY['social-media', 'templates', 'graphics', 'marketing'],
    true,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),

-- Research & Reports (Category 8)
(
    gen_random_uuid(),
    'Innovation Trends Report 2024',
    'Annual report on innovation trends and opportunities in Kenya.',
    'Comprehensive analysis of innovation trends, emerging technologies, market opportunities, and recommendations for student entrepreneurs in Kenya.',
    'document',
    8,
    '/reports/innovation-trends-2024.pdf',
    'pdf',
    3584000,
    '1.0',
    ARRAY['research', 'trends', 'innovation', 'report'],
    true,
    'public',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
),
(
    gen_random_uuid(),
    'Club Impact Assessment 2023',
    'Assessment report of club activities and member impact for 2023.',
    'Detailed assessment of club activities, member achievements, project outcomes, and community impact for the 2023 academic year.',
    'document',
    8,
    '/reports/impact-assessment-2023.pdf',
    'pdf',
    2304000,
    '1.2',
    ARRAY['impact', 'assessment', 'report', 'achievements'],
    false,
    'member',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Project Templates
INSERT INTO project_templates (
    id, name, description, template_type, file_url, file_type, 
    category_id, tags, is_active, created_by
) VALUES
(
    gen_random_uuid(),
    'Mobile App Development Proposal',
    'Template for mobile application development project proposals.',
    'mobile_app',
    '/templates/mobile-app-proposal.docx',
    'docx',
    2,
    ARRAY['mobile', 'app', 'development', 'proposal'],
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'IoT Project Blueprint',
    'Template for Internet of Things project planning and documentation.',
    'iot_project',
    '/templates/iot-project-blueprint.docx',
    'docx',
    2,
    ARRAY['iot', 'hardware', 'sensors', 'project'],
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'AI/ML Research Proposal',
    'Template for artificial intelligence and machine learning research proposals.',
    'ai_research',
    '/templates/ai-ml-research-proposal.docx',
    'docx',
    2,
    ARRAY['ai', 'machine-learning', 'research', 'proposal'],
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Social Impact Project Plan',
    'Template for projects focused on social impact and community development.',
    'social_impact',
    '/templates/social-impact-project.docx',
    'docx',
    2,
    ARRAY['social-impact', 'community', 'development', 'project'],
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Fintech Solution Proposal',
    'Template for financial technology solution proposals and business plans.',
    'fintech',
    '/templates/fintech-solution-proposal.docx',
    'docx',
    2,
    ARRAY['fintech', 'finance', 'technology', 'solution'],
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Resource Downloads (to simulate usage)
INSERT INTO resource_downloads (
    id, resource_id, user_id, download_date, ip_address
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Business Plan Template' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    '192.168.1.100'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'API Development Guide' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    '192.168.1.101'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Innovation Methodology Workshop' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    '192.168.1.102'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Brand Guidelines 2024' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '5 hours',
    '192.168.1.103'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Event Planning Checklist' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    '192.168.1.104'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Resource Reviews
INSERT INTO resource_reviews (
    id, resource_id, user_id, rating, review_text
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Business Plan Template' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    5,
    'Excellent template! Very comprehensive and easy to follow. Helped me create a professional business plan for my startup idea.'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'API Development Guide' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    4,
    'Great technical resource. Clear explanations and practical examples. Would recommend to anyone working on API projects.'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Innovation Methodology Workshop' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    5,
    'Outstanding training materials! The design thinking process is well explained with practical exercises. Must-read for innovation projects.'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Event Planning Checklist' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    4,
    'Very helpful for organizing events. Comprehensive checklist that covers all important aspects. Saved me a lot of time.'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Brand Guidelines 2024' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    5,
    'Perfect branding resource! Clear guidelines and beautiful design elements. Essential for maintaining consistent club branding.'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Resource SDG Mappings
INSERT INTO resource_sdg_mapping (
    id, resource_id, sdg_goal_id
) VALUES
-- Innovation Methodology Workshop -> Quality Education (SDG 4)
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Innovation Methodology Workshop' LIMIT 1),
    4
),
-- Innovation Methodology Workshop -> Industry, Innovation and Infrastructure (SDG 9)
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Innovation Methodology Workshop' LIMIT 1),
    9
),
-- Entrepreneurship Fundamentals -> Decent Work and Economic Growth (SDG 8)
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Entrepreneurship Fundamentals' LIMIT 1),
    8
),
-- Innovation Trends Report -> Industry, Innovation and Infrastructure (SDG 9)
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Innovation Trends Report 2024' LIMIT 1),
    9
),
-- Business Plan Template -> Decent Work and Economic Growth (SDG 8)
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Business Plan Template' LIMIT 1),
    8
),
-- API Development Guide -> Quality Education (SDG 4)
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'API Development Guide' LIMIT 1),
    4
),
-- Club Impact Assessment -> Partnerships for the Goals (SDG 17)
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Club Impact Assessment 2023' LIMIT 1),
    17
)
ON CONFLICT (resource_id, sdg_goal_id) DO NOTHING;

-- Insert Sample Resource Access Logs
INSERT INTO resource_access_logs (
    id, resource_id, user_id, action, ip_address, accessed_at
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'JKUAT Innovation Club Constitution 2024' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'view',
    '192.168.1.100',
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Business Plan Template' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'download',
    '192.168.1.100',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Brand Guidelines 2024' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'view',
    '192.168.1.101',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Innovation Trends Report 2024' LIMIT 1),
    NULL, -- Anonymous access
    'view',
    '203.0.113.45',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
),
(
    gen_random_uuid(),
    (SELECT id FROM resources WHERE title = 'Event Planning Checklist' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'share',
    '192.168.1.102',
    CURRENT_TIMESTAMP - INTERVAL '45 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- Update download counts based on actual downloads
UPDATE resources SET download_count = (
    SELECT COUNT(*) 
    FROM resource_downloads 
    WHERE resource_downloads.resource_id = resources.id
);

COMMIT;