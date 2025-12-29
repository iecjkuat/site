-- JKUAT Innovation and Entrepreneurship Club - Leadership & Team Section Setup
-- Complete SQL script to create leadership tables and populate with sample data
-- Run this entire file in Supabase SQL Editor

-- ============================================================================
-- STEP 1: CREATE LEADERSHIP TABLES
-- ============================================================================

-- Executive Committee/Leadership table
CREATE TABLE IF NOT EXISTS executive_committee (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position VARCHAR(100) NOT NULL,
  position_order INTEGER NOT NULL DEFAULT 0,
  department VARCHAR(100),
  bio TEXT,
  profile_photo VARCHAR(500),
  office_hours JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  is_patron BOOLEAN DEFAULT false,
  achievements TEXT[],
  responsibilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Club Patrons table (separate from executive committee)
CREATE TABLE IF NOT EXISTS club_patrons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  office_location VARCHAR(255),
  office_hours JSONB DEFAULT '{}',
  bio TEXT,
  profile_photo VARCHAR(500),
  social_media JSONB DEFAULT '{}',
  specialization TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_executive_committee_user_id ON executive_committee(user_id);
CREATE INDEX IF NOT EXISTS idx_executive_committee_position ON executive_committee(position);
CREATE INDEX IF NOT EXISTS idx_executive_committee_is_active ON executive_committee(is_active);
CREATE INDEX IF NOT EXISTS idx_executive_committee_position_order ON executive_committee(position_order);

CREATE INDEX IF NOT EXISTS idx_club_patrons_is_active ON club_patrons(is_active);
CREATE INDEX IF NOT EXISTS idx_club_patrons_department ON club_patrons(department);

-- ============================================================================
-- STEP 2: INSERT SAMPLE LEADERSHIP DATA
-- ============================================================================

DO $$
DECLARE
    admin_uuid UUID;
    exec_uuid UUID;
    member_uuid UUID;
BEGIN
    -- Get existing user IDs for executive positions
    SELECT id INTO admin_uuid FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_uuid FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_uuid FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Clear existing data (in case of re-run)
    DELETE FROM executive_committee;
    DELETE FROM club_patrons;
    
    -- Insert Executive Committee Members
    INSERT INTO executive_committee (
      user_id, position, position_order, bio, office_hours, contact_info, social_media,
      start_date, achievements, responsibilities
    ) VALUES 
    -- Chairperson
    (admin_uuid, 'Chairperson', 1, 
     'Visionary leader driving innovation and entrepreneurship initiatives at JKUAT. Passionate about fostering a culture of creativity and business development among students. With over 3 years of leadership experience, leads strategic planning and external partnerships.',
     '{"monday": "2:00 PM - 4:00 PM", "wednesday": "10:00 AM - 12:00 PM", "friday": "3:00 PM - 5:00 PM"}',
     '{"email": "chairperson@jkuatinnovation.ac.ke", "phone": "+254700000001", "office": "Innovation Hub, Room 101"}',
     '{"linkedin": "https://linkedin.com/in/chairperson", "twitter": "@JKUATChair"}',
     '2024-01-01',
     ARRAY['Led 15+ successful innovation projects', 'Established partnerships with 10+ industry leaders', 'Increased club membership by 200%', 'Secured KSh 3M in funding for student projects'],
     ARRAY['Strategic planning and vision setting', 'External partnerships and stakeholder relations', 'Overall club governance and leadership', 'Board meeting coordination']
    ),
    
    -- Vice-Chairperson (Membership)
    (exec_uuid, 'Vice-Chairperson (Membership)', 2,
     'Dedicated to building and nurturing our vibrant community of innovators. Focuses on member engagement, retention, and creating meaningful networking opportunities. Expert in community building and student engagement strategies.',
     '{"tuesday": "1:00 PM - 3:00 PM", "thursday": "11:00 AM - 1:00 PM", "saturday": "10:00 AM - 12:00 PM"}',
     '{"email": "membership@jkuatinnovation.ac.ke", "phone": "+254700000002", "office": "Innovation Hub, Room 102"}',
     '{"linkedin": "https://linkedin.com/in/membership-vp", "instagram": "@jkuat_membership"}',
     '2024-01-01',
     ARRAY['Organized 20+ networking events', 'Implemented digital membership system', 'Achieved 95% member satisfaction rate', 'Launched mentorship program with 100+ pairs'],
     ARRAY['Membership recruitment and onboarding', 'Member engagement programs', 'Community building initiatives', 'Alumni network development']
    ),
    
    -- Vice-Chairperson (Projects)
    (member_uuid, 'Vice-Chairperson (Projects)', 3,
     'Project management expert leading our technical initiatives. Coordinates innovation projects and ensures successful delivery of club objectives. Specializes in agile methodologies and startup incubation.',
     '{"monday": "10:00 AM - 12:00 PM", "wednesday": "2:00 PM - 4:00 PM", "friday": "1:00 PM - 3:00 PM"}',
     '{"email": "projects@jkuatinnovation.ac.ke", "phone": "+254700000003", "office": "Innovation Hub, Room 103"}',
     '{"linkedin": "https://linkedin.com/in/projects-vp", "github": "https://github.com/jkuat-projects"}',
     '2024-01-01',
     ARRAY['Managed 25+ innovation projects', 'Secured KSh 2M in project funding', 'Mentored 100+ student entrepreneurs', 'Launched 5 successful startups'],
     ARRAY['Project planning and execution', 'Technical mentorship', 'Innovation challenge coordination', 'Startup incubation oversight']
    );
    
    -- Insert additional executive positions (without user_id for now - these are vacant positions)
    INSERT INTO executive_committee (
      position, position_order, bio, office_hours, contact_info, social_media,
      start_date, achievements, responsibilities
    ) VALUES 
    -- Vice-Chairperson (Education)
    ('Vice-Chairperson (Education)', 4,
     'Educational program coordinator focused on skill development and knowledge sharing. Organizes workshops, seminars, and training sessions. Passionate about curriculum development and experiential learning.',
     '{"tuesday": "9:00 AM - 11:00 AM", "thursday": "3:00 PM - 5:00 PM", "saturday": "2:00 PM - 4:00 PM"}',
     '{"email": "education@jkuatinnovation.ac.ke", "phone": "+254700000004", "office": "Innovation Hub, Room 104"}',
     '{"linkedin": "https://linkedin.com/in/education-vp", "youtube": "@JKUATEducation"}',
     '2024-01-01',
     ARRAY['Conducted 50+ educational workshops', 'Developed comprehensive curriculum', 'Trained 500+ students in entrepreneurship', 'Created online learning platform'],
     ARRAY['Educational program development', 'Workshop coordination', 'Curriculum design and implementation', 'Skills assessment and certification']
    ),
    
    -- Secretary-General
    ('Secretary-General', 5,
     'Administrative backbone of the club, ensuring smooth operations and effective communication. Maintains records and coordinates meetings. Expert in organizational systems and process optimization.',
     '{"monday": "11:00 AM - 1:00 PM", "wednesday": "1:00 PM - 3:00 PM", "friday": "10:00 AM - 12:00 PM"}',
     '{"email": "secretary@jkuatinnovation.ac.ke", "phone": "+254700000005", "office": "Innovation Hub, Room 105"}',
     '{"linkedin": "https://linkedin.com/in/secretary-general", "twitter": "@JKUATSecretary"}',
     '2024-01-01',
     ARRAY['Streamlined club operations', 'Digitized all club records', 'Improved meeting efficiency by 40%', 'Implemented digital communication systems'],
     ARRAY['Meeting coordination and minutes', 'Record keeping and documentation', 'Internal communication management', 'Administrative process optimization']
    ),
    
    -- Treasurer
    ('Treasurer', 6,
     'Financial steward ensuring transparent and effective management of club resources. Oversees budgets, payments, and financial planning. Certified in financial management and accounting principles.',
     '{"tuesday": "2:00 PM - 4:00 PM", "thursday": "10:00 AM - 12:00 PM", "friday": "4:00 PM - 6:00 PM"}',
     '{"email": "treasurer@jkuatinnovation.ac.ke", "phone": "+254700000006", "office": "Innovation Hub, Room 106"}',
     '{"linkedin": "https://linkedin.com/in/treasurer", "twitter": "@JKUATTreasurer"}',
     '2024-01-01',
     ARRAY['Managed KSh 5M+ in club funds', 'Implemented transparent financial systems', 'Achieved 100% financial accountability', 'Reduced operational costs by 25%'],
     ARRAY['Financial planning and budgeting', 'Payment processing and tracking', 'Financial reporting and transparency', 'Investment and fund management']
    ),
    
    -- Communications & PR Officer
    ('Communications & PR Officer', 7,
     'Brand ambassador and communications expert. Manages club publicity, social media presence, and external communications. Specialist in digital marketing and public relations.',
     '{"monday": "3:00 PM - 5:00 PM", "wednesday": "11:00 AM - 1:00 PM", "friday": "2:00 PM - 4:00 PM"}',
     '{"email": "communications@jkuatinnovation.ac.ke", "phone": "+254700000007", "office": "Innovation Hub, Room 107"}',
     '{"linkedin": "https://linkedin.com/in/communications-officer", "twitter": "@JKUATComms", "instagram": "@jkuat_innovation"}',
     '2024-01-01',
     ARRAY['Grew social media following by 300%', 'Secured media coverage in 15+ publications', 'Launched successful PR campaigns', 'Increased brand awareness by 250%'],
     ARRAY['Social media management', 'Public relations and media outreach', 'Brand development and marketing', 'Content creation and strategy']
    );
    
    -- Insert Club Patrons
    INSERT INTO club_patrons (
      name, title, department, email, phone, office_location, office_hours, bio,
      social_media, specialization
    ) VALUES 
    ('Prof. Dr. Jane Wanjiku', 'Professor of Innovation Management', 'School of Business',
     'j.wanjiku@jkuat.ac.ke', '+254722000001', 'Business School, Office B201',
     '{"monday": "9:00 AM - 11:00 AM", "wednesday": "2:00 PM - 4:00 PM", "friday": "10:00 AM - 12:00 PM"}',
     'Renowned expert in innovation management and entrepreneurship with over 15 years of experience in academia and industry. Published author of 3 books on African entrepreneurship and innovation ecosystems. Passionate mentor to young entrepreneurs and startup founders. Former consultant to World Bank on innovation policy.',
     '{"linkedin": "https://linkedin.com/in/prof-wanjiku", "researchgate": "https://researchgate.net/profile/Jane-Wanjiku"}',
     ARRAY['Innovation Management', 'Entrepreneurship', 'Business Strategy', 'African Business Ecosystems', 'Startup Incubation', 'Policy Development']
    ),
    
    ('Dr. Michael Kiprotich', 'Senior Lecturer & Innovation Consultant', 'School of Engineering',
     'm.kiprotich@jkuat.ac.ke', '+254733000002', 'Engineering Block, Office E305',
     '{"tuesday": "1:00 PM - 3:00 PM", "thursday": "10:00 AM - 12:00 PM", "friday": "3:00 PM - 5:00 PM"}',
     'Technology innovation specialist with expertise in engineering solutions for African challenges. Former industry executive with 20+ years in technology development and commercialization. Led multiple successful tech startups and holds 8 patents in renewable energy systems. Active mentor in the Kenyan startup ecosystem.',
     '{"linkedin": "https://linkedin.com/in/dr-kiprotich", "twitter": "@DrKiprotich"}',
     ARRAY['Technology Innovation', 'Engineering Solutions', 'Product Development', 'Tech Commercialization', 'Renewable Energy', 'Patent Strategy']
    );
    
    RAISE NOTICE 'Leadership tables created and populated successfully!';
    RAISE NOTICE 'Executive Committee: % members', (SELECT COUNT(*) FROM executive_committee WHERE is_active = true);
    RAISE NOTICE 'Club Patrons: % members', (SELECT COUNT(*) FROM club_patrons WHERE is_active = true);
    
END $$;

-- ============================================================================
-- STEP 3: VERIFICATION QUERIES
-- ============================================================================

-- Check executive committee table
SELECT 
    'Executive Committee' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_users,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as without_users
FROM executive_committee 
WHERE is_active = true;

-- Check club patrons table  
SELECT 
    'Club Patrons' as table_name,
    COUNT(*) as record_count
FROM club_patrons 
WHERE is_active = true;

-- List all executive positions
SELECT 
    position_order,
    position,
    CASE 
        WHEN user_id IS NOT NULL THEN 'Assigned'
        ELSE 'Vacant'
    END as status,
    COALESCE((contact_info->>'email'), 'No email') as contact_email
FROM executive_committee 
WHERE is_active = true
ORDER BY position_order;

-- List all club patrons
SELECT 
    name,
    title,
    department,
    email,
    array_length(specialization, 1) as specialization_count
FROM club_patrons 
WHERE is_active = true
ORDER BY created_at;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'JKUAT Innovation Club Leadership & Team Section Setup Complete!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test API: http://localhost:3000/api/leadership/executive-committee';
    RAISE NOTICE '2. View page: http://localhost:3000/leadership';
    RAISE NOTICE '3. Check navigation for "Leadership" link in More dropdown';
    RAISE NOTICE '=================================================================';
END $$;