-- =============================================
-- JKUAT Innovation Club - Partnerships & Opportunities Mock Data (Final Version)
-- Run this AFTER applying the schema (21-partnerships-opportunities-simple.sql)
-- =============================================

-- Insert Sample Opportunities using the new schema structure
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
    
    -- Insert opportunities with new schema structure
    INSERT INTO opportunities (
        id, title, description, category_id, opportunity_type, organization, location, location_type,
        application_deadline, eligibility_criteria, compensation_type, compensation_amount,
        start_date, duration_months, status, priority_level, is_featured, tags, posted_by,
        view_count, application_count, bookmark_count, source
    ) VALUES
    
    -- Competition 1: Safaricom Hook Innovation Challenge
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
        'Kenyan citizens aged 18-35, students or recent graduates, innovative tech solutions',
        'grant',
        5000000.00,
        '2025-04-01 00:00:00+03',
        6,
        'active',
        'high',
        true,
        ARRAY['fintech', 'innovation', 'startup', 'technology'],
        admin_user_id,
        245,
        67,
        89,
        'partner'
    ),
    
    -- Competition 2: Microsoft Imagine Cup
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
        'Currently enrolled students, teams of 1-4 members, use Microsoft Azure',
        'grant',
        100000.00,
        '2025-05-15 00:00:00+03',
        3,
        'active',
        'urgent',
        true,
        ARRAY['microsoft', 'azure', 'global', 'students'],
        admin_user_id,
        189,
        34,
        56,
        'partner'
    ),

    -- Funding 1: Mastercard Foundation Scholars
    (
        gen_random_uuid(),
        'Mastercard Foundation Scholars Program 2025',
        'Comprehensive scholarship program providing financial support, leadership development, and career guidance for academically talented young people from disadvantaged backgrounds across Africa.',
        funding_cat_id,
        'scholarship',
        'Mastercard Foundation',
        'Various African Universities',
        'onsite',
        '2025-01-31 23:59:00+03',
        'African citizens, demonstrated financial need, academic excellence, leadership potential',
        'scholarship',
        2000000.00,
        '2025-09-01 00:00:00+03',
        48,
        'active',
        'high',
        true,
        ARRAY['scholarship', 'leadership', 'africa', 'education'],
        admin_user_id,
        312,
        123,
        167,
        'partner'
    ),

    -- Internship 1: Safaricom Graduate Trainee
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
        'Recent graduates (2023-2024), degree in Engineering/IT/Business, Kenyan citizen',
        'paid',
        80000.00,
        '2025-03-01 00:00:00+03',
        18,
        'active',
        'urgent',
        true,
        ARRAY['graduate', 'telecom', 'training', 'career'],
        admin_user_id,
        456,
        234,
        189,
        'partner'
    ),

    -- Job 1: KCB Software Developer
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
        'Computer Science degree, 0-2 years experience, JavaScript/React knowledge',
        'paid',
        150000.00,
        '2025-02-15 00:00:00+03',
        NULL,
        'active',
        'normal',
        false,
        ARRAY['software', 'banking', 'react', 'entry-level'],
        exec_user_id,
        234,
        89,
        45,
        'partner'
    ),

    -- Grant 1: KCB Innovation Grant
    (
        gen_random_uuid(),
        'KCB Foundation Innovation Grant 2025',
        'Seed funding for innovative projects addressing social challenges in Kenya. Focus areas include financial inclusion, education technology, healthcare solutions, and sustainable agriculture.',
        grants_cat_id,
        'scholarship',
        'KCB Foundation',
        'Kenya',
        'hybrid',
        '2025-02-15 17:00:00+03',
        'Kenyan innovators, social impact focus, prototype or pilot ready',
        'grant',
        1500000.00,
        '2025-04-01 00:00:00+03',
        12,
        'active',
        'normal',
        false,
        ARRAY['social-impact', 'innovation', 'kenya', 'grant'],
        exec_user_id,
        178,
        45,
        67,
        'partner'
    ),

    -- Networking 1: iHub Tech Meetup
    (
        gen_random_uuid(),
        'iHub Tech Entrepreneurs Monthly Meetup',
        'Monthly networking event bringing together tech entrepreneurs, investors, and innovators. Features keynote speakers, startup pitches, and networking sessions. Great opportunity to connect with the Kenyan tech ecosystem.',
        networking_cat_id,
        'job',
        'iHub Nairobi',
        'iHub Nairobi',
        'onsite',
        '2025-01-15 18:00:00+03',
        'Tech entrepreneurs, students, professionals in tech industry',
        'unpaid',
        NULL,
        '2025-01-18 18:00:00+03',
        NULL,
        'active',
        'normal',
        false,
        ARRAY['networking', 'entrepreneurs', 'tech', 'nairobi'],
        exec_user_id,
        89,
        23,
        34,
        'partner'
    ),

    -- Partnership 1: Google Developer Student Clubs
    (
        gen_random_uuid(),
        'Google Developer Student Clubs Lead Application',
        'Leadership opportunity to establish and lead a Google Developer Student Club at JKUAT. Includes training, resources, and support from Google to organize tech events and workshops.',
        partnerships_cat_id,
        'internship',
        'Google for Education',
        'JKUAT Campus',
        'hybrid',
        '2025-01-30 23:59:00+03',
        'JKUAT students, leadership experience, passion for technology and community building',
        'unpaid',
        NULL,
        '2025-03-01 00:00:00+03',
        12,
        'active',
        'high',
        true,
        ARRAY['google', 'leadership', 'community', 'technology'],
        exec_user_id,
        156,
        78,
        92,
        'partner'
    ),

    -- Additional Competition
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
        'African citizens/residents, programming experience, individual or team participation',
        'grant',
        50000.00,
        '2025-04-15 00:00:00+03',
        2,
        'active',
        'normal',
        false,
        ARRAY['programming', 'africa', 'algorithms', 'competition'],
        admin_user_id,
        134,
        28,
        41,
        'external'
    ),

    -- Additional Internship
    (
        gen_random_uuid(),
        'Microsoft Student Accelerator Program Kenya',
        'Intensive 6-month program for computer science students to work on real Microsoft products. Includes technical mentorship, career coaching, and potential full-time offer.',
        internships_cat_id,
        'internship',
        'Microsoft Kenya',
        'Nairobi/Remote',
        'hybrid',
        '2025-02-10 23:59:00+03',
        'Computer Science/Engineering students, strong programming skills, 3.5+ GPA',
        'paid',
        120000.00,
        '2025-06-01 00:00:00+03',
        6,
        'active',
        'high',
        true,
        ARRAY['microsoft', 'software', 'mentorship', 'tech'],
        exec_user_id,
        267,
        156,
        123,
        'partner'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Mock opportunities inserted successfully';
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
    SELECT id INTO safaricom_opp_id FROM opportunities WHERE title LIKE '%Safaricom Hook%' AND organization = 'Safaricom PLC' LIMIT 1;
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
    
    RAISE NOTICE 'Sample applications inserted successfully';
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
    
    RAISE NOTICE 'Sample bookmarks inserted successfully';
END $$;

-- Insert Sample Views (tracking who viewed what)
INSERT INTO opportunity_views (id, opportunity_id, user_id, viewed_at) 
SELECT 
    gen_random_uuid(),
    o.id,
    u.id,
    CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
FROM opportunities o
CROSS JOIN users u
WHERE RANDOM() < 0.3  -- 30% chance each user viewed each opportunity
LIMIT 50;

-- Insert Sample User Preferences
DO $$
DECLARE
    member_user_id UUID;
    exec_user_id UUID;
    admin_user_id UUID;
    internships_cat_id UUID;
    competitions_cat_id UUID;
    jobs_cat_id UUID;
    partnerships_cat_id UUID;
    grants_cat_id UUID;
    funding_cat_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Get category IDs
    SELECT id INTO internships_cat_id FROM opportunity_categories WHERE name = 'Internships' LIMIT 1;
    SELECT id INTO competitions_cat_id FROM opportunity_categories WHERE name = 'Competitions' LIMIT 1;
    SELECT id INTO jobs_cat_id FROM opportunity_categories WHERE name = 'Jobs' LIMIT 1;
    SELECT id INTO partnerships_cat_id FROM opportunity_categories WHERE name = 'Partnerships' LIMIT 1;
    SELECT id INTO grants_cat_id FROM opportunity_categories WHERE name = 'Grants' LIMIT 1;
    SELECT id INTO funding_cat_id FROM opportunity_categories WHERE name = 'Funding' LIMIT 1;
    
    -- Insert user preferences
    INSERT INTO user_opportunity_preferences (
        id, user_id, preferred_types, preferred_categories, preferred_locations, 
        location_type_preference, min_compensation, email_notifications, notification_frequency
    ) VALUES
    (
        gen_random_uuid(),
        member_user_id,
        ARRAY['internship', 'competition', 'scholarship'],
        ARRAY[internships_cat_id, competitions_cat_id],
        ARRAY['Nairobi', 'Kenya', 'Remote'],
        'hybrid',
        50000.00,
        true,
        'daily'
    ),
    (
        gen_random_uuid(),
        exec_user_id,
        ARRAY['job', 'internship', 'networking'],
        ARRAY[jobs_cat_id, partnerships_cat_id],
        ARRAY['Nairobi', 'Mombasa', 'International'],
        'hybrid',
        100000.00,
        true,
        'weekly'
    ),
    (
        gen_random_uuid(),
        admin_user_id,
        ARRAY['scholarship', 'competition', 'internship'],
        ARRAY[grants_cat_id, funding_cat_id],
        ARRAY['Kenya', 'East Africa', 'Global'],
        'remote',
        NULL,
        true,
        'immediate'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'User preferences inserted successfully';
END $$;

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

-- Success message
SELECT 'Partnerships & Opportunities mock data inserted successfully!' as result,
       COUNT(*) as total_opportunities 
FROM opportunities 
WHERE organization IN ('Safaricom PLC', 'Microsoft Kenya', 'KCB Foundation', 'Mastercard Foundation', 'Google for Education', 'iHub Nairobi', 'African Development Bank');

COMMIT;