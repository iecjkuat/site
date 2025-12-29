-- =============================================
-- JKUAT Innovation Club - Partnerships & Opportunities Mock Data (Simple Version)
-- This version works with the existing opportunities table structure
-- =============================================

-- Insert sample opportunities using existing table structure
INSERT INTO opportunities (
    id, 
    title, 
    description, 
    company, 
    location, 
    opportunity_type, 
    application_deadline, 
    requirements, 
    benefits, 
    application_url, 
    contact_email, 
    status, 
    tags,
    posted_by
) VALUES
-- Competition 1: Safaricom Hook Innovation Challenge
(
    gen_random_uuid(),
    'Safaricom Hook Innovation Challenge 2025',
    'Annual innovation challenge seeking groundbreaking solutions in fintech, agritech, healthtech, and edtech. Winners receive funding, mentorship, and market access opportunities. Open to students and young entrepreneurs across Kenya with innovative tech solutions.',
    'Safaricom PLC',
    'Nairobi, Kenya (Hybrid)',
    'competition',
    '2025-03-15',
    ARRAY[
        'Kenyan citizens aged 18-35',
        'Students or recent graduates',
        'Innovative tech solutions',
        'Team of 1-5 members',
        'Working prototype preferred'
    ],
    ARRAY[
        'Cash prizes up to KES 5,000,000',
        'Mentorship from industry experts',
        'Market access opportunities',
        'Media coverage and recognition',
        'Networking with investors'
    ],
    'https://hook.safaricom.co.ke/apply',
    'innovation@safaricom.co.ke',
    'active',
    ARRAY['fintech', 'innovation', 'startup', 'technology', 'competition'],
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Competition 2: Microsoft Imagine Cup
(
    gen_random_uuid(),
    'Microsoft Imagine Cup 2025 - Kenya Regional',
    'Global student technology competition where teams compete to create innovative solutions using Microsoft technologies. Regional winners advance to world finals with $100,000 prize pool. Perfect opportunity for computer science students.',
    'Microsoft Kenya',
    'Virtual/Global (Remote)',
    'competition',
    '2025-02-28',
    ARRAY[
        'Currently enrolled students',
        'Teams of 1-4 members',
        'Use Microsoft Azure technologies',
        'Original innovative solution',
        'English proficiency required'
    ],
    ARRAY[
        'Prize pool up to $100,000 USD',
        'Global recognition',
        'Microsoft mentorship',
        'Azure credits worth $5,000',
        'Career opportunities at Microsoft'
    ],
    'https://imaginecup.microsoft.com',
    'students@microsoft.com',
    'active',
    ARRAY['microsoft', 'azure', 'global', 'students', 'technology'],
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Funding 1: Mastercard Foundation Scholars
(
    gen_random_uuid(),
    'Mastercard Foundation Scholars Program 2025',
    'Comprehensive scholarship program providing financial support, leadership development, and career guidance for academically talented young people from disadvantaged backgrounds across Africa. Covers full tuition, accommodation, and living expenses.',
    'Mastercard Foundation',
    'Various African Universities',
    'funding',
    '2025-01-31',
    ARRAY[
        'African citizens from disadvantaged backgrounds',
        'Demonstrated financial need',
        'Academic excellence (minimum 3.5 GPA)',
        'Leadership potential and community service',
        'Commitment to giving back to Africa'
    ],
    ARRAY[
        'Full tuition coverage up to KES 2,000,000',
        'Accommodation and living expenses',
        'Leadership development programs',
        'Mentorship and career guidance',
        'Alumni network access'
    ],
    'https://mastercardfdn.org/scholars',
    'scholars@mastercardfdn.org',
    'active',
    ARRAY['scholarship', 'leadership', 'africa', 'education', 'funding'],
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Internship 1: Safaricom Graduate Trainee
(
    gen_random_uuid(),
    'Safaricom Graduate Trainee Program 2025',
    'Comprehensive 18-month graduate development program offering rotational assignments across different business units including Technology, Finance, Marketing, and Operations. Includes mentorship, professional training, and potential for permanent employment.',
    'Safaricom PLC',
    'Nairobi, Kenya',
    'internship',
    '2025-01-20',
    ARRAY[
        'Recent graduates (2023-2024)',
        'Degree in Engineering, IT, Business, or related field',
        'Kenyan citizen',
        'Strong analytical and communication skills',
        'Willingness to work in different departments'
    ],
    ARRAY[
        'Monthly stipend of KES 80,000',
        'Comprehensive training program',
        'Mentorship from senior executives',
        'Potential for permanent employment',
        'Professional certification opportunities'
    ],
    'https://careers.safaricom.co.ke/graduates',
    'graduates@safaricom.co.ke',
    'active',
    ARRAY['graduate', 'telecom', 'training', 'career', 'internship'],
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Job 1: KCB Software Developer
(
    gen_random_uuid(),
    'Junior Software Developer - KCB Bank',
    'Entry-level software developer position focusing on digital banking solutions. Work with modern technologies including React, Node.js, and cloud platforms to build customer-facing applications. Join our dynamic team and contribute to Kenya\'s digital banking transformation.',
    'Kenya Commercial Bank (KCB)',
    'Nairobi, Kenya (Hybrid)',
    'job',
    '2025-01-25',
    ARRAY[
        'Computer Science degree or equivalent',
        '0-2 years of programming experience',
        'JavaScript/React knowledge required',
        'Understanding of databases (SQL/NoSQL)',
        'Team collaboration skills'
    ],
    ARRAY[
        'Competitive salary KES 150,000+',
        'Health insurance coverage',
        'Professional development opportunities',
        'Flexible working arrangements',
        'Career growth within banking sector'
    ],
    'https://careers.kcbgroup.com',
    'careers@kcb.co.ke',
    'active',
    ARRAY['software', 'banking', 'react', 'entry-level', 'javascript'],
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Grant 1: KCB Innovation Grant
(
    gen_random_uuid(),
    'KCB Foundation Innovation Grant 2025',
    'Seed funding for innovative projects addressing social challenges in Kenya. Focus areas include financial inclusion, education technology, healthcare solutions, and sustainable agriculture. Perfect for student entrepreneurs with social impact ideas.',
    'KCB Foundation',
    'Kenya (Multiple Locations)',
    'grant',
    '2025-02-15',
    ARRAY[
        'Kenyan innovators and entrepreneurs',
        'Social impact focus required',
        'Prototype or pilot project ready',
        'Clear implementation plan',
        'Measurable impact metrics'
    ],
    ARRAY[
        'Grant funding up to KES 1,500,000',
        'Business mentorship and coaching',
        'Access to KCB business network',
        'Marketing and publicity support',
        'Potential for follow-up funding'
    ],
    'https://kcbfoundation.org/grants',
    'grants@kcbfoundation.org',
    'active',
    ARRAY['social-impact', 'innovation', 'kenya', 'grant', 'entrepreneurship'],
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Networking 1: iHub Tech Meetup
(
    gen_random_uuid(),
    'iHub Tech Entrepreneurs Monthly Meetup',
    'Monthly networking event bringing together tech entrepreneurs, investors, and innovators in Nairobi. Features keynote speakers, startup pitches, and networking sessions. Great opportunity to connect with the Kenyan tech ecosystem and find potential collaborators.',
    'iHub Nairobi',
    'iHub Nairobi, Senteu Plaza',
    'networking',
    '2025-01-18',
    ARRAY[
        'Tech entrepreneurs and students',
        'Professionals in tech industry',
        'Startup founders and team members',
        'Investors and mentors welcome',
        'Bring business cards for networking'
    ],
    ARRAY[
        'Free attendance',
        'Networking with industry leaders',
        'Learning from keynote speakers',
        'Startup pitch opportunities',
        'Access to investor network'
    ],
    'https://ihub.co.ke/events',
    'events@ihub.co.ke',
    'active',
    ARRAY['networking', 'entrepreneurs', 'tech', 'nairobi', 'startups'],
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Partnership 1: Google Developer Student Clubs
(
    gen_random_uuid(),
    'Google Developer Student Clubs Lead Application - JKUAT',
    'Leadership opportunity to establish and lead a Google Developer Student Club at JKUAT. Includes training, resources, and support from Google to organize tech events, workshops, and study groups. Build a community of student developers on campus.',
    'Google for Education',
    'JKUAT Campus (Hybrid)',
    'partnership',
    '2025-01-30',
    ARRAY[
        'Current JKUAT students (2nd year and above)',
        'Leadership and organizational experience',
        'Passion for technology and community building',
        'Good communication skills',
        'Commitment for full academic year'
    ],
    ARRAY[
        'Google training and certification',
        'Access to Google Cloud credits',
        'Event organization support',
        'Global GDSC network access',
        'Resume enhancement opportunity'
    ],
    'https://developers.google.com/community/gdsc',
    'gdsc@google.com',
    'active',
    ARRAY['google', 'leadership', 'community', 'technology', 'students'],
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Update existing opportunities with better data if they exist
UPDATE opportunities SET
    description = CASE 
        WHEN title LIKE '%Software Development Internship%' THEN 
            'Join our dynamic team as a software development intern. Work on real-world projects, learn modern technologies including React, Node.js, Python, and gain valuable industry experience. Perfect opportunity for students looking to bridge the gap between academic learning and professional practice.'
        ELSE description
    END,
    requirements = CASE 
        WHEN title LIKE '%Software Development Internship%' THEN 
            ARRAY[
                'Programming skills (Python/JavaScript/Java)',
                'Basic understanding of databases',
                'Team collaboration skills',
                'Problem-solving mindset',
                'Currently enrolled in relevant course'
            ]
        ELSE requirements
    END,
    benefits = CASE 
        WHEN title LIKE '%Software Development Internship%' THEN 
            ARRAY[
                'Monthly stipend of KES 25,000',
                'Mentorship from senior developers',
                'Certificate of completion',
                'Networking opportunities',
                'Potential for full-time offer'
            ]
        ELSE benefits
    END,
    tags = CASE 
        WHEN title LIKE '%Software Development Internship%' THEN 
            ARRAY['internship', 'software', 'development', 'programming', 'tech']
        ELSE tags
    END
WHERE title LIKE '%Software Development Internship%';

-- Add some additional opportunities for variety
INSERT INTO opportunities (
    id, 
    title, 
    description, 
    company, 
    location, 
    opportunity_type, 
    application_deadline, 
    requirements, 
    benefits, 
    application_url, 
    contact_email, 
    status, 
    tags,
    posted_by
) VALUES
-- Additional Competition
(
    gen_random_uuid(),
    'Africa Code Challenge 2025',
    'Continental programming competition for African developers and computer science students. Multiple categories including algorithms, web development, mobile apps, and AI/ML solutions. Showcase your coding skills on a continental stage.',
    'African Development Bank',
    'Pan-African (Virtual)',
    'competition',
    '2025-03-01',
    ARRAY[
        'African citizens or residents',
        'Programming experience required',
        'Individual or team participation (max 4)',
        'Submit original code solutions',
        'English or French proficiency'
    ],
    ARRAY[
        'Prize money up to $50,000 USD',
        'Continental recognition',
        'Mentorship opportunities',
        'Job placement assistance',
        'Certificate of participation'
    ],
    'https://africacodechallenge.org',
    'info@africacodechallenge.org',
    'active',
    ARRAY['programming', 'africa', 'algorithms', 'competition', 'coding'],
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),

-- Additional Internship
(
    gen_random_uuid(),
    'Microsoft Student Accelerator Program Kenya',
    'Intensive 6-month program for computer science students to work on real Microsoft products. Includes technical mentorship, career coaching, and potential full-time offer. Work with cutting-edge technologies and global teams.',
    'Microsoft Kenya',
    'Nairobi/Remote (Hybrid)',
    'internship',
    '2025-02-10',
    ARRAY[
        'Computer Science/Engineering students',
        'Strong programming skills (C#, Python, JavaScript)',
        'GPA of 3.5 or higher',
        'Excellent English communication',
        'Available for 6-month commitment'
    ],
    ARRAY[
        'Monthly stipend of KES 120,000',
        'Microsoft certification training',
        'Mentorship from Microsoft engineers',
        'Potential full-time job offer',
        'Global project exposure'
    ],
    'https://careers.microsoft.com/students',
    'students@microsoft.com',
    'active',
    ARRAY['microsoft', 'software', 'mentorship', 'tech', 'accelerator'],
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

COMMIT;