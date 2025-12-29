-- =============================================
-- JKUAT Innovation Club - Partnerships & Opportunities Mock Data
-- =============================================

-- Insert Opportunity Categories
INSERT INTO opportunity_categories (id, name, description, icon, color) VALUES
(gen_random_uuid(), 'Competitions', 'Local and international competitions for students and innovators', 'fa-trophy', '#f59e0b'),
(gen_random_uuid(), 'Funding', 'Grants, scholarships, and funding opportunities for projects and education', 'fa-dollar-sign', '#10b981'),
(gen_random_uuid(), 'Internships', 'Internship opportunities with partner organizations', 'fa-briefcase', '#3b82f6'),
(gen_random_uuid(), 'Jobs', 'Full-time and part-time job opportunities', 'fa-user-tie', '#8b5cf6'),
(gen_random_uuid(), 'Networking', 'Networking events, conferences, and professional meetups', 'fa-users', '#ef4444'),
(gen_random_uuid(), 'Partnerships', 'Collaboration opportunities with industry partners', 'fa-handshake', '#06b6d4'),
(gen_random_uuid(), 'Grants', 'Research and project grants from various organizations', 'fa-award', '#f97316')
ON CONFLICT (name) DO NOTHING;

-- Insert Partnership Organizations
INSERT INTO partnership_organizations (id, name, description, website, contact_person, contact_email, organization_type, industry, partnership_type, partnership_status, benefits_offered, linkedin_url) VALUES
(
    gen_random_uuid(),
    'Safaricom PLC',
    'Leading telecommunications company in Kenya, committed to supporting innovation and entrepreneurship among young people.',
    'https://www.safaricom.co.ke',
    'Innovation Team',
    'innovation@safaricom.co.ke',
    'corporate',
    'Telecommunications',
    'sponsor',
    'active',
    ARRAY['Internship opportunities', 'Mentorship programs', 'Funding for projects', 'Technical workshops'],
    'https://linkedin.com/company/safaricom'
),
(
    gen_random_uuid(),
    'Kenya Commercial Bank (KCB)',
    'Premier financial services provider offering banking and investment solutions across East Africa.',
    'https://www.kcbgroup.com',
    'Graduate Program Manager',
    'graduates@kcb.co.ke',
    'corporate',
    'Financial Services',
    'employer',
    'active',
    ARRAY['Graduate trainee programs', 'Internships', 'Financial literacy training', 'Entrepreneurship support'],
    'https://linkedin.com/company/kcb-bank-group'
),
(
    gen_random_uuid(),
    'Microsoft Kenya',
    'Global technology company providing cloud computing, productivity software, and AI solutions.',
    'https://www.microsoft.com/kenya',
    'Student Engagement Lead',
    'students@microsoft.com',
    'corporate',
    'Technology',
    'mentor',
    'active',
    ARRAY['Azure credits', 'Technical training', 'Certification programs', 'Hackathon sponsorship'],
    'https://linkedin.com/company/microsoft'
),
(
    gen_random_uuid(),
    'iHub Nairobi',
    'Innovation hub and incubator supporting tech startups and entrepreneurs in Kenya.',
    'https://ihub.co.ke',
    'Programs Manager',
    'programs@ihub.co.ke',
    'ngo',
    'Technology',
    'collaborator',
    'active',
    ARRAY['Incubation programs', 'Co-working space', 'Networking events', 'Investor connections'],
    'https://linkedin.com/company/ihub'
),
(
    gen_random_uuid(),
    'Kenya Association of Manufacturers (KAM)',
    'Premier business membership organization representing value-add industries in Kenya.',
    'https://kam.co.ke',
    'Youth Programs Coordinator',
    'youth@kam.co.ke',
    'ngo',
    'Manufacturing',
    'collaborator',
    'active',
    ARRAY['Industrial attachments', 'Manufacturing insights', 'Policy advocacy', 'Trade missions'],
    'https://linkedin.com/company/kenya-association-of-manufacturers'
),
(
    gen_random_uuid(),
    'Mastercard Foundation',
    'Foundation working to advance learning and promote financial inclusion for young people in Africa.',
    'https://mastercardfdn.org',
    'Scholars Program Team',
    'scholars@mastercardfdn.org',
    'ngo',
    'Education',
    'sponsor',
    'active',
    ARRAY['Scholarships', 'Leadership development', 'Entrepreneurship training', 'Network access'],
    'https://linkedin.com/company/mastercard-foundation'
)
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Opportunities
DO $$
DECLARE
    competitions_cat_id UUID;
    funding_cat_id UUID;
    internships_cat_id UUID;
    jobs_cat_id UUID;
    networking_cat_id UUID;
    partnerships_cat_id UUID;
    grants_cat_id UUID;
    admin_user_id UUID;
    exec_user_id UUID;
    member_user_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO competitions_cat_id FROM opportunity_categories WHERE name = 'Competitions' LIMIT 1;
    SELECT id INTO funding_cat_id FROM opportunity_categories WHERE name = 'Funding' LIMIT 1;
    SELECT id INTO internships_cat_id FROM opportunity_categories WHERE name = 'Internships' LIMIT 1;
    SELECT id INTO jobs_cat_id FROM opportunity_categories WHERE name = 'Jobs' LIMIT 1;
    SELECT id INTO networking_cat_id FROM opportunity_categories WHERE name = 'Networking' LIMIT 1;
    SELECT id INTO partnerships_cat_id FROM opportunity_categories WHERE name = 'Partnerships' LIMIT 1;
    SELECT id INTO grants_cat_id FROM opportunity_categories WHERE name = 'Grants' LIMIT 1;
    
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Insert opportunities
    INSERT INTO opportunities (
        id, title, description, category_id, opportunity_type, organization, location, location_type,
        application_deadline, application_url, eligibility_criteria, compensation_type, compensation_amount,
        start_date, duration_months, status, priority_level, is_featured, tags, created_by
    ) VALUES
    -- Competitions
    (
        gen_random_uuid(),
        'Safaricom Hook Innovation Challenge 2025',
        'Annual innovation challenge seeking groundbreaking solutions in fintech, agritech, healthtech, and edtech. Winners receive funding, mentorship, and market access opportunities. Open to students and young entrepreneurs across Kenya.',
        competitions_cat_id,
        'competition',
        'Safaricom PLC',
        'Nairobi, Kenya',
        'hybrid',
        '2025-03-15 23:59:00+03',
        'https://hook.safaricom.co.ke/apply',
        'Kenyan citizens aged 18-35, students or recent graduates, innovative tech solutions',
        'grant',
        5000000.00,
        '2025-04-01 00:00:00+03',
        6,
        'active',
        'high',
        true,
        ARRAY['fintech', 'innovation', 'startup', 'technology'],
        admin_user_id
    ),
    (
        gen_random_uuid(),
        'Microsoft Imagine Cup 2025 - Kenya Regional',
        'Global student technology competition where teams compete to create innovative solutions using Microsoft technologies. Regional winners advance to world finals with $100,000 prize pool.',
        competitions_cat_id,
        'competition',
        'Microsoft Kenya',
        'Virtual/Global',
        'remote',
        '2025-02-28 23:59:00+03',
        'https://imaginecup.microsoft.com',
        'Currently enrolled students, teams of 1-4 members, use Microsoft Azure',
        'grant',
        100000.00,
        '2025-05-15 00:00:00+03',
        3,
        'active',
        'urgent',
        true,
        ARRAY['microsoft', 'azure', 'global', 'students'],
        admin_user_id
    ),

    -- Funding Opportunities
    (
        gen_random_uuid(),
        'Mastercard Foundation Scholars Program 2025',
        'Comprehensive scholarship program providing financial support, leadership development, and career guidance for academically talented young people from disadvantaged backgrounds across Africa.',
        funding_cat_id,
        'funding',
        'Mastercard Foundation',
        'Various African Universities',
        'onsite',
        '2025-01-31 23:59:00+03',
        'https://mastercardfdn.org/scholars',
        'African citizens, demonstrated financial need, academic excellence, leadership potential',
        'scholarship',
        2000000.00,
        '2025-09-01 00:00:00+03',
        48,
        'active',
        'high',
        true,
        ARRAY['scholarship', 'leadership', 'africa', 'education'],
        admin_user_id
    ),
    (
        gen_random_uuid(),
        'KCB Foundation Innovation Grant',
        'Seed funding for innovative projects addressing social challenges in Kenya. Focus areas include financial inclusion, education technology, healthcare solutions, and sustainable agriculture.',
        grants_cat_id,
        'grant',
        'Kenya Commercial Bank (KCB)',
        'Kenya',
        'hybrid',
        '2025-02-15 17:00:00+03',
        'https://kcbfoundation.org/grants',
        'Kenyan innovators, social impact focus, prototype or pilot ready',
        'grant',
        1500000.00,
        '2025-04-01 00:00:00+03',
        12,
        'active',
        'normal',
        false,
        ARRAY['social-impact', 'innovation', 'kenya', 'grant'],
        exec_user_id
    ),

    -- Internship Opportunities
    (
        gen_random_uuid(),
        'Safaricom Graduate Trainee Program 2025',
        'Comprehensive 18-month graduate development program offering rotational assignments across different business units. Includes mentorship, professional training, and potential for permanent employment.',
        internships_cat_id,
        'internship',
        'Safaricom PLC',
        'Nairobi, Kenya',
        'onsite',
        '2025-01-20 23:59:00+03',
        'https://careers.safaricom.co.ke/graduates',
        'Recent graduates (2023-2024), degree in Engineering/IT/Business, Kenyan citizen',
        'paid',
        80000.00,
        '2025-03-01 00:00:00+03',
        18,
        'active',
        'urgent',
        true,
        ARRAY['graduate', 'telecom', 'training', 'career'],
        admin_user_id
    ),
    (
        gen_random_uuid(),
        'Microsoft Student Accelerator Program',
        'Intensive 6-month program for computer science students to work on real Microsoft products. Includes technical mentorship, career coaching, and potential full-time offer.',
        internships_cat_id,
        'internship',
        'Microsoft Kenya',
        'Nairobi/Remote',
        'hybrid',
        '2025-02-10 23:59:00+03',
        'https://careers.microsoft.com/students',
        'Computer Science/Engineering students, strong programming skills, 3.5+ GPA',
        'paid',
        120000.00,
        '2025-06-01 00:00:00+03',
        6,
        'active',
        'high',
        true,
        ARRAY['microsoft', 'software', 'mentorship', 'tech'],
        exec_user_id
    ),

    -- Job Opportunities
    (
        gen_random_uuid(),
        'Junior Software Developer - KCB Bank',
        'Entry-level software developer position focusing on digital banking solutions. Work with modern technologies including React, Node.js, and cloud platforms to build customer-facing applications.',
        jobs_cat_id,
        'job',
        'Kenya Commercial Bank (KCB)',
        'Nairobi, Kenya',
        'hybrid',
        '2025-01-25 17:00:00+03',
        'https://careers.kcbgroup.com',
        'Computer Science degree, 0-2 years experience, JavaScript/React knowledge',
        'paid',
        150000.00,
        '2025-02-15 00:00:00+03',
        NULL,
        'active',
        'normal',
        false,
        ARRAY['software', 'banking', 'react', 'entry-level'],
        member_user_id
    ),

    -- Networking Events
    (
        gen_random_uuid(),
        'iHub Tech Entrepreneurs Meetup',
        'Monthly networking event bringing together tech entrepreneurs, investors, and innovators. Features keynote speakers, startup pitches, and networking sessions. Great opportunity to connect with the Kenyan tech ecosystem.',
        networking_cat_id,
        'networking',
        'iHub Nairobi',
        'iHub Nairobi',
        'onsite',
        '2025-01-15 18:00:00+03',
        'https://ihub.co.ke/events',
        'Tech entrepreneurs, students, professionals in tech industry',
        'unpaid',
        NULL,
        '2025-01-18 18:00:00+03',
        NULL,
        'active',
        'normal',
        false,
        ARRAY['networking', 'entrepreneurs', 'tech', 'nairobi'],
        exec_user_id
    ),

    -- Partnership Opportunities
    (
        gen_random_uuid(),
        'KAM Industrial Attachment Program',
        'Partnership program connecting engineering students with manufacturing companies for practical industrial experience. Includes factory visits, mentorship, and potential employment opportunities.',
        partnerships_cat_id,
        'partnership',
        'Kenya Association of Manufacturers (KAM)',
        'Various locations in Kenya',
        'onsite',
        '2025-02-28 17:00:00+03',
        'https://kam.co.ke/students',
        'Engineering students (3rd/4th year), Kenyan universities, manufacturing interest',
        'stipend',
        25000.00,
        '2025-05-01 00:00:00+03',
        4,
        'active',
        'normal',
        false,
        ARRAY['manufacturing', 'engineering', 'attachment', 'industry'],
        member_user_id
    ),

    -- Additional Recent Opportunities
    (
        gen_random_uuid(),
        'Africa Code Challenge 2025',
        'Continental programming competition for African developers and computer science students. Multiple categories including algorithms, web development, mobile apps, and AI/ML solutions.',
        competitions_cat_id,
        'competition',
        'African Development Bank',
        'Pan-African (Virtual)',
        'remote',
        '2025-03-01 23:59:00+03',
        'https://africacodechallenge.org',
        'African citizens/residents, programming experience, individual or team participation',
        'grant',
        50000.00,
        '2025-04-15 00:00:00+03',
        2,
        'active',
        'normal',
        false,
        ARRAY['programming', 'africa', 'algorithms', 'competition'],
        admin_user_id
    ),
    (
        gen_random_uuid(),
        'Google Developer Student Clubs Lead Application',
        'Leadership opportunity to establish and lead a Google Developer Student Club at JKUAT. Includes training, resources, and support from Google to organize tech events and workshops.',
        partnerships_cat_id,
        'partnership',
        'Google for Education',
        'JKUAT Campus',
        'hybrid',
        '2025-01-30 23:59:00+03',
        'https://developers.google.com/community/gdsc',
        'JKUAT students, leadership experience, passion for technology and community building',
        'unpaid',
        NULL,
        '2025-03-01 00:00:00+03',
        12,
        'active',
        'high',
        true,
        ARRAY['google', 'leadership', 'community', 'technology'],
        exec_user_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Opportunities inserted successfully';
END $$;

-- Insert Sample Applications
DO $$
DECLARE
    safaricom_opp_id UUID;
    microsoft_opp_id UUID;
    kcb_opp_id UUID;
    admin_user_id UUID;
    exec_user_id UUID;
    member_user_id UUID;
BEGIN
    -- Get opportunity IDs
    SELECT id INTO safaricom_opp_id FROM opportunities WHERE title LIKE '%Safaricom Hook%' LIMIT 1;
    SELECT id INTO microsoft_opp_id FROM opportunities WHERE title LIKE '%Microsoft Imagine Cup%' LIMIT 1;
    SELECT id INTO kcb_opp_id FROM opportunities WHERE title LIKE '%KCB Foundation%' LIMIT 1;
    
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Insert applications only if opportunities and users exist
    IF safaricom_opp_id IS NOT NULL AND member_user_id IS NOT NULL THEN
        INSERT INTO opportunity_applications (id, opportunity_id, user_id, application_status, cover_letter, submitted_at) VALUES
        (
            gen_random_uuid(),
            safaricom_opp_id,
            member_user_id,
            'submitted',
            'I am excited to apply for the Safaricom Hook Innovation Challenge with my fintech solution that addresses mobile money accessibility in rural areas...',
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        )
        ON CONFLICT (opportunity_id, user_id) DO NOTHING;
    END IF;
    
    IF microsoft_opp_id IS NOT NULL AND exec_user_id IS NOT NULL THEN
        INSERT INTO opportunity_applications (id, opportunity_id, user_id, application_status, cover_letter, submitted_at) VALUES
        (
            gen_random_uuid(),
            microsoft_opp_id,
            exec_user_id,
            'under_review',
            'Our team has developed an AI-powered educational platform using Microsoft Azure services. We believe this solution can transform learning in Africa...',
            CURRENT_TIMESTAMP - INTERVAL '5 days'
        )
        ON CONFLICT (opportunity_id, user_id) DO NOTHING;
    END IF;
    
    IF kcb_opp_id IS NOT NULL AND member_user_id IS NOT NULL THEN
        INSERT INTO opportunity_applications (id, opportunity_id, user_id, application_status, cover_letter, submitted_at) VALUES
        (
            gen_random_uuid(),
            kcb_opp_id,
            member_user_id,
            'shortlisted',
            'Our agricultural technology solution addresses food security challenges in Kenya through IoT sensors and data analytics...',
            CURRENT_TIMESTAMP - INTERVAL '10 days'
        )
        ON CONFLICT (opportunity_id, user_id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Applications inserted successfully';
END $$;

-- Insert Sample Bookmarks
DO $$
DECLARE
    mastercard_opp_id UUID;
    microsoft_student_opp_id UUID;
    google_opp_id UUID;
    admin_user_id UUID;
    exec_user_id UUID;
    member_user_id UUID;
BEGIN
    -- Get opportunity IDs
    SELECT id INTO mastercard_opp_id FROM opportunities WHERE title LIKE '%Mastercard Foundation%' LIMIT 1;
    SELECT id INTO microsoft_student_opp_id FROM opportunities WHERE title LIKE '%Microsoft Student%' LIMIT 1;
    SELECT id INTO google_opp_id FROM opportunities WHERE title LIKE '%Google Developer%' LIMIT 1;
    
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Insert bookmarks only if opportunities and users exist
    IF mastercard_opp_id IS NOT NULL AND member_user_id IS NOT NULL THEN
        INSERT INTO opportunity_bookmarks (id, opportunity_id, user_id) VALUES
        (gen_random_uuid(), mastercard_opp_id, member_user_id)
        ON CONFLICT (opportunity_id, user_id) DO NOTHING;
    END IF;
    
    IF microsoft_student_opp_id IS NOT NULL AND exec_user_id IS NOT NULL THEN
        INSERT INTO opportunity_bookmarks (id, opportunity_id, user_id) VALUES
        (gen_random_uuid(), microsoft_student_opp_id, exec_user_id)
        ON CONFLICT (opportunity_id, user_id) DO NOTHING;
    END IF;
    
    IF google_opp_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        INSERT INTO opportunity_bookmarks (id, opportunity_id, user_id) VALUES
        (gen_random_uuid(), google_opp_id, admin_user_id)
        ON CONFLICT (opportunity_id, user_id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Bookmarks inserted successfully';
END $$;

-- Insert Sample Views
INSERT INTO opportunity_views (id, opportunity_id, user_id, viewed_at) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM opportunities WHERE title LIKE '%Safaricom Hook%' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
),
(
    gen_random_uuid(),
    (SELECT id FROM opportunities WHERE title LIKE '%Safaricom Hook%' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '3 hours'
),
(
    gen_random_uuid(),
    (SELECT id FROM opportunities WHERE title LIKE '%Microsoft Imagine Cup%' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    gen_random_uuid(),
    (SELECT id FROM opportunities WHERE title LIKE '%Mastercard Foundation%' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '4 hours'
),
(
    gen_random_uuid(),
    (SELECT id FROM opportunities WHERE title LIKE '%KCB Foundation%' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '6 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample User Preferences
INSERT INTO user_opportunity_preferences (
    id, user_id, preferred_types, preferred_categories, preferred_locations, 
    location_type_preference, min_compensation, email_notifications, notification_frequency
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    ARRAY['internship', 'competition', 'funding'],
    ARRAY[
        (SELECT id FROM opportunity_categories WHERE name = 'Internships' LIMIT 1),
        (SELECT id FROM opportunity_categories WHERE name = 'Competitions' LIMIT 1)
    ],
    ARRAY['Nairobi', 'Kenya', 'Remote'],
    'hybrid',
    50000.00,
    true,
    'daily'
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    ARRAY['job', 'partnership', 'networking'],
    ARRAY[
        (SELECT id FROM opportunity_categories WHERE name = 'Jobs' LIMIT 1),
        (SELECT id FROM opportunity_categories WHERE name = 'Partnerships' LIMIT 1)
    ],
    ARRAY['Nairobi', 'Mombasa', 'International'],
    'hybrid',
    100000.00,
    true,
    'weekly'
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    ARRAY['grant', 'funding', 'partnership'],
    ARRAY[
        (SELECT id FROM opportunity_categories WHERE name = 'Grants' LIMIT 1),
        (SELECT id FROM opportunity_categories WHERE name = 'Funding' LIMIT 1)
    ],
    ARRAY['Kenya', 'East Africa', 'Global'],
    'remote',
    NULL,
    true,
    'immediate'
)
ON CONFLICT (user_id) DO NOTHING;

-- Insert Sample Notifications
INSERT INTO opportunity_notifications (
    id, user_id, opportunity_id, notification_type, title, message, is_read, created_at
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    (SELECT id FROM opportunities WHERE title LIKE '%Safaricom Hook%' LIMIT 1),
    'new_opportunity',
    'New Competition: Safaricom Hook Innovation Challenge 2025',
    'A new innovation challenge matching your interests has been posted. Application deadline: March 15, 2025.',
    false,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    (SELECT id FROM opportunities WHERE title LIKE '%Microsoft Imagine Cup%' LIMIT 1),
    'deadline_reminder',
    'Deadline Reminder: Microsoft Imagine Cup 2025',
    'Only 5 days left to apply for Microsoft Imagine Cup 2025. Don''t miss this global opportunity!',
    true,
    CURRENT_TIMESTAMP - INTERVAL '12 hours'
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    (SELECT id FROM opportunities WHERE title LIKE '%KCB Foundation%' LIMIT 1),
    'application_update',
    'Application Update: KCB Foundation Innovation Grant',
    'Congratulations! Your application has been shortlisted for the next round of review.',
    false,
    CURRENT_TIMESTAMP - INTERVAL '6 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Update opportunity statistics (view counts, application counts, etc.)
UPDATE opportunities SET 
    view_count = FLOOR(RANDOM() * 100) + 10,
    application_count = FLOOR(RANDOM() * 20) + 1,
    bookmark_count = FLOOR(RANDOM() * 15) + 1
WHERE id IN (SELECT id FROM opportunities LIMIT 10);

-- Update partnership organization statistics
UPDATE partnership_organizations SET 
    opportunities_posted = FLOOR(RANDOM() * 10) + 1,
    members_hired = FLOOR(RANDOM() * 5),
    events_sponsored = FLOOR(RANDOM() * 3)
WHERE partnership_status = 'active';

COMMIT;