-- JKUAT Innovation and Entrepreneurship Club - Sample Data
-- File 4: Insert Sample Data
-- Run this last to populate the database with initial data

-- Note: This database now serves only the JKUAT Innovation and Entrepreneurship Club
-- All club_id references have been removed as we only serve one club

DO $$
DECLARE
    admin_uuid UUID;
    exec_uuid UUID;
    member_uuid UUID;
    event_uuid UUID;
    idea_uuid UUID;
    resource_uuid UUID;
    opportunity_uuid UUID;
BEGIN
    -- Insert sample admin user (password: admin123)
    INSERT INTO users (
      id, name, email, phone, password_hash, registration_number,
      course, year_of_study, college, role, membership_status, email_verified,
      bio, skills, interests, social_links
    ) VALUES (
      uuid_generate_v4(),
      'System Administrator',
      'admin@jkuatinnovation.ac.ke',
      '+254700000001',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hMxl9OfvG',
      'EN111-0001/2020',
      'Computer Science',
      4,
      'Engineering',
      'admin',
      'active',
      true,
      'System administrator for JKUAT Innovation and Entrepreneurship Club.',
      ARRAY['Leadership', 'Project Management', 'Web Development'],
      ARRAY['Innovation', 'Technology', 'Entrepreneurship'],
      '{"linkedin": "https://linkedin.com/in/admin"}'
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO admin_uuid;
    
    -- Insert sample executive user
    INSERT INTO users (
      id, name, email, phone, password_hash, registration_number,
      course, year_of_study, college, role, membership_status, email_verified,
      bio, skills, interests
    ) VALUES (
      uuid_generate_v4(),
      'Jane Executive',
      'executive@jkuatinnovation.ac.ke',
      '+254700000002',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hMxl9OfvG',
      'EN111-0002/2021',
      'Business Information Technology',
      3,
      'Engineering',
      'executive',
      'active',
      true,
      'Executive member focused on business development.',
      ARRAY['Business Development', 'Marketing', 'Event Planning'],
      ARRAY['Business', 'Marketing', 'Networking']
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO exec_uuid;
    
    -- Insert sample regular member
    INSERT INTO users (
      id, name, email, phone, password_hash, registration_number,
      course, year_of_study, college, role, membership_status, email_verified,
      bio, skills, interests
    ) VALUES (
      uuid_generate_v4(),
      'John Member',
      'member@jkuatinnovation.ac.ke',
      '+254700000003',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hMxl9OfvG',
      'EN111-0003/2022',
      'Software Engineering',
      2,
      'Engineering',
      'member',
      'active',
      true,
      'Passionate software engineering student.',
      ARRAY['Programming', 'Mobile Development', 'Problem Solving'],
      ARRAY['Technology', 'Mobile Apps', 'Innovation']
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO member_uuid;
    
    -- Insert sample event
    INSERT INTO events (
      id, title, description, event_type, start_date, end_date,
      location, venue_details, max_attendees, registration_required, 
      registration_deadline, fee, status, tags, created_by
    ) VALUES (
      uuid_generate_v4(),
      'Innovation Workshop 2024',
      'Join us for an intensive workshop on innovation methodologies.',
      'workshop',
      CURRENT_TIMESTAMP + INTERVAL '7 days',
      CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '4 hours',
      'JKUAT Main Campus',
      'Engineering Block, Room E101.',
      50,
      true,
      CURRENT_TIMESTAMP + INTERVAL '5 days',
      200.00,
      'upcoming',
      ARRAY['innovation', 'workshop', 'startup'],
      admin_uuid
    ) RETURNING id INTO event_uuid;
    
    -- Insert sample idea
    INSERT INTO ideas (
      id, user_id, title, description, category, tags, status, upvotes
    ) VALUES (
      uuid_generate_v4(),
      member_uuid,
      'Smart Campus Navigation App',
      'A mobile application that helps students navigate the JKUAT campus.',
      'Technology',
      ARRAY['mobile-app', 'navigation', 'campus'],
      'approved',
      12
    ) RETURNING id INTO idea_uuid;
    
    -- Insert sample resource
    INSERT INTO resources (
      id, uploaded_by, title, description, category, tags, 
      access_level, file_type, file_name
    ) VALUES (
      uuid_generate_v4(),
      admin_uuid,
      'Club Handbook 2024',
      'Comprehensive guide for new and existing members.',
      'Documentation',
      ARRAY['handbook', 'guide', 'rules'],
      'members',
      'PDF',
      'JIEC_Handbook_2024.pdf'
    ) RETURNING id INTO resource_uuid;
    
    -- Insert sample opportunity
    INSERT INTO opportunities (
      id, posted_by, title, description, company, location, 
      opportunity_type, application_deadline, requirements, benefits, 
      application_url, contact_email, status, tags
    ) VALUES (
      uuid_generate_v4(),
      exec_uuid,
      'Software Development Internship',
      'Join our team as a software development intern.',
      'TechCorp Kenya',
      'Nairobi, Kenya',
      'internship',
      CURRENT_DATE + INTERVAL '30 days',
      ARRAY['Programming skills', 'Team collaboration'],
      ARRAY['Monthly stipend', 'Certificate'],
      'https://techcorp.ke/careers/internship',
      'careers@techcorp.ke',
      'active',
      ARRAY['internship', 'software', 'development']
    ) RETURNING id INTO opportunity_uuid;
    
    -- Insert sample support ticket
    INSERT INTO support_tickets (
      id, user_id, title, description, category, priority, status
    ) VALUES (
      uuid_generate_v4(),
      member_uuid,
      'Unable to Access Resources Section',
      'Having trouble accessing the resources section.',
      'Technical',
      'medium',
      'open'
    );
    
    -- Insert sample payment
    INSERT INTO payments (
      id, user_id, event_id, amount, currency, payment_type, 
      payment_method, transaction_id, reference_number, status, description
    ) VALUES (
      uuid_generate_v4(),
      member_uuid,
      event_uuid,
      200.00,
      'KES',
      'event',
      'mpesa',
      'TXN' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT,
      'REF' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT,
      'completed',
      'Payment for Innovation Workshop 2024 registration'
    );
    
    -- Register the member for the event
    INSERT INTO event_attendees (
      id, event_id, user_id, attendance_status, payment_status
    ) VALUES (
      uuid_generate_v4(),
      event_uuid,
      member_uuid,
      'registered',
      'paid'
    );
    
    -- Insert sample message
    INSERT INTO messages (
      id, sender_id, recipient_id, subject, content, message_type, priority
    ) VALUES (
      uuid_generate_v4(),
      admin_uuid,
      member_uuid,
      'Welcome to JKUAT Innovation Club!',
      'Welcome to the JKUAT Innovation and Entrepreneurship Club!',
      'direct',
      'normal'
    );
    
    -- Insert Executive Committee Members
    INSERT INTO executive_committee (
      user_id, position, position_order, bio, office_hours, contact_info, social_media,
      start_date, achievements, responsibilities
    ) VALUES 
    -- Chairperson
    (admin_uuid, 'Chairperson', 1, 
     'Visionary leader driving innovation and entrepreneurship initiatives at JKUAT. Passionate about fostering a culture of creativity and business development among students.',
     '{"monday": "2:00 PM - 4:00 PM", "wednesday": "10:00 AM - 12:00 PM", "friday": "3:00 PM - 5:00 PM"}',
     '{"email": "chairperson@jkuatinnovation.ac.ke", "phone": "+254700000001", "office": "Innovation Hub, Room 101"}',
     '{"linkedin": "https://linkedin.com/in/chairperson", "twitter": "@JKUATChair"}',
     '2024-01-01',
     ARRAY['Led 15+ successful innovation projects', 'Established partnerships with 10+ industry leaders', 'Increased club membership by 200%'],
     ARRAY['Strategic planning and vision setting', 'External partnerships and stakeholder relations', 'Overall club governance and leadership']
    ),
    
    -- Vice-Chairperson (Membership)
    (exec_uuid, 'Vice-Chairperson (Membership)', 2,
     'Dedicated to building and nurturing our vibrant community of innovators. Focuses on member engagement, retention, and creating meaningful networking opportunities.',
     '{"tuesday": "1:00 PM - 3:00 PM", "thursday": "11:00 AM - 1:00 PM"}',
     '{"email": "membership@jkuatinnovation.ac.ke", "phone": "+254700000002", "office": "Innovation Hub, Room 102"}',
     '{"linkedin": "https://linkedin.com/in/membership-vp", "instagram": "@jkuat_membership"}',
     '2024-01-01',
     ARRAY['Organized 20+ networking events', 'Implemented digital membership system', 'Achieved 95% member satisfaction rate'],
     ARRAY['Membership recruitment and onboarding', 'Member engagement programs', 'Community building initiatives']
    );
    
    -- Insert additional executive positions (using generated UUIDs for now)
    INSERT INTO executive_committee (
      position, position_order, bio, office_hours, contact_info, social_media,
      start_date, achievements, responsibilities
    ) VALUES 
    -- Vice-Chairperson (Projects)
    ('Vice-Chairperson (Projects)', 3,
     'Project management expert leading our technical initiatives. Coordinates innovation projects and ensures successful delivery of club objectives.',
     '{"monday": "10:00 AM - 12:00 PM", "wednesday": "2:00 PM - 4:00 PM", "friday": "1:00 PM - 3:00 PM"}',
     '{"email": "projects@jkuatinnovation.ac.ke", "phone": "+254700000003", "office": "Innovation Hub, Room 103"}',
     '{"linkedin": "https://linkedin.com/in/projects-vp", "github": "https://github.com/jkuat-projects"}',
     '2024-01-01',
     ARRAY['Managed 25+ innovation projects', 'Secured KSh 2M in project funding', 'Mentored 100+ student entrepreneurs'],
     ARRAY['Project planning and execution', 'Technical mentorship', 'Innovation challenge coordination']
    ),
    
    -- Vice-Chairperson (Education)
    ('Vice-Chairperson (Education)', 4,
     'Educational program coordinator focused on skill development and knowledge sharing. Organizes workshops, seminars, and training sessions.',
     '{"tuesday": "9:00 AM - 11:00 AM", "thursday": "3:00 PM - 5:00 PM"}',
     '{"email": "education@jkuatinnovation.ac.ke", "phone": "+254700000004", "office": "Innovation Hub, Room 104"}',
     '{"linkedin": "https://linkedin.com/in/education-vp", "youtube": "@JKUATEducation"}',
     '2024-01-01',
     ARRAY['Conducted 50+ educational workshops', 'Developed comprehensive curriculum', 'Trained 500+ students in entrepreneurship'],
     ARRAY['Educational program development', 'Workshop coordination', 'Curriculum design and implementation']
    ),
    
    -- Secretary-General
    ('Secretary-General', 5,
     'Administrative backbone of the club, ensuring smooth operations and effective communication. Maintains records and coordinates meetings.',
     '{"monday": "11:00 AM - 1:00 PM", "wednesday": "1:00 PM - 3:00 PM", "friday": "10:00 AM - 12:00 PM"}',
     '{"email": "secretary@jkuatinnovation.ac.ke", "phone": "+254700000005", "office": "Innovation Hub, Room 105"}',
     '{"linkedin": "https://linkedin.com/in/secretary-general", "twitter": "@JKUATSecretary"}',
     '2024-01-01',
     ARRAY['Streamlined club operations', 'Digitized all club records', 'Improved meeting efficiency by 40%'],
     ARRAY['Meeting coordination and minutes', 'Record keeping and documentation', 'Internal communication management']
    ),
    
    -- Treasurer
    ('Treasurer', 6,
     'Financial steward ensuring transparent and effective management of club resources. Oversees budgets, payments, and financial planning.',
     '{"tuesday": "2:00 PM - 4:00 PM", "thursday": "10:00 AM - 12:00 PM"}',
     '{"email": "treasurer@jkuatinnovation.ac.ke", "phone": "+254700000006", "office": "Innovation Hub, Room 106"}',
     '{"linkedin": "https://linkedin.com/in/treasurer", "twitter": "@JKUATTreasurer"}',
     '2024-01-01',
     ARRAY['Managed KSh 5M+ in club funds', 'Implemented transparent financial systems', 'Achieved 100% financial accountability'],
     ARRAY['Financial planning and budgeting', 'Payment processing and tracking', 'Financial reporting and transparency']
    ),
    
    -- Communications & PR Officer
    ('Communications & PR Officer', 7,
     'Brand ambassador and communications expert. Manages club publicity, social media presence, and external communications.',
     '{"monday": "3:00 PM - 5:00 PM", "wednesday": "11:00 AM - 1:00 PM", "friday": "2:00 PM - 4:00 PM"}',
     '{"email": "communications@jkuatinnovation.ac.ke", "phone": "+254700000007", "office": "Innovation Hub, Room 107"}',
     '{"linkedin": "https://linkedin.com/in/communications-officer", "twitter": "@JKUATComms", "instagram": "@jkuat_innovation"}',
     '2024-01-01',
     ARRAY['Grew social media following by 300%', 'Secured media coverage in 15+ publications', 'Launched successful PR campaigns'],
     ARRAY['Social media management', 'Public relations and media outreach', 'Brand development and marketing']
    );
    
    -- Insert Club Patrons
    INSERT INTO club_patrons (
      name, title, department, email, phone, office_location, office_hours, bio,
      social_media, specialization
    ) VALUES 
    ('Prof. Dr. Jane Wanjiku', 'Professor of Innovation Management', 'School of Business',
     'j.wanjiku@jkuat.ac.ke', '+254722000001', 'Business School, Office B201',
     '{"monday": "9:00 AM - 11:00 AM", "wednesday": "2:00 PM - 4:00 PM", "friday": "10:00 AM - 12:00 PM"}',
     'Renowned expert in innovation management and entrepreneurship with over 15 years of experience. Published author of 3 books on African entrepreneurship and innovation ecosystems. Passionate mentor to young entrepreneurs.',
     '{"linkedin": "https://linkedin.com/in/prof-wanjiku", "researchgate": "https://researchgate.net/profile/Jane-Wanjiku"}',
     ARRAY['Innovation Management', 'Entrepreneurship', 'Business Strategy', 'African Business Ecosystems']
    ),
    
    ('Dr. Michael Kiprotich', 'Senior Lecturer & Innovation Consultant', 'School of Engineering',
     'm.kiprotich@jkuat.ac.ke', '+254733000002', 'Engineering Block, Office E305',
     '{"tuesday": "1:00 PM - 3:00 PM", "thursday": "10:00 AM - 12:00 PM"}',
     'Technology innovation specialist with expertise in engineering solutions for African challenges. Former industry executive with 20+ years in technology development and commercialization.',
     '{"linkedin": "https://linkedin.com/in/dr-kiprotich", "twitter": "@DrKiprotich"}',
     ARRAY['Technology Innovation', 'Engineering Solutions', 'Product Development', 'Tech Commercialization']
    );
    
END $$;