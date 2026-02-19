-- ============================================================================
-- Insert Sample Leadership Data
-- ============================================================================

-- Insert Executive Committee Members
INSERT INTO executive_committee (
    name, position, email, phone, bio, course, year_of_study,
    office_hours, term_start_date, term_end_date, is_active, display_order, social_links
) VALUES
(
    'John Kamau',
    'Chairperson',
    'john.kamau@students.jkuat.ac.ke',
    '+254 712 345 678',
    'Passionate about innovation and technology. Leading the club towards achieving its vision of fostering entrepreneurship among students.',
    'Bachelor of Science in Computer Science',
    'Fourth Year',
    'Monday & Wednesday, 2:00 PM - 4:00 PM',
    '2024-01-01',
    '2024-12-31',
    true,
    1,
    '{"linkedin": "https://linkedin.com/in/johnkamau", "twitter": "https://twitter.com/johnkamau"}'::jsonb
),
(
    'Mary Wanjiku',
    'Vice Chairperson',
    'mary.wanjiku@students.jkuat.ac.ke',
    '+254 723 456 789',
    'Dedicated to supporting innovation initiatives and coordinating club activities. Focused on member engagement and project development.',
    'Bachelor of Science in Information Technology',
    'Third Year',
    'Tuesday & Thursday, 3:00 PM - 5:00 PM',
    '2024-01-01',
    '2024-12-31',
    true,
    2,
    '{"linkedin": "https://linkedin.com/in/marywanjiku"}'::jsonb
),
(
    'David Omondi',
    'Secretary',
    'david.omondi@students.jkuat.ac.ke',
    '+254 734 567 890',
    'Responsible for maintaining club records, communications, and ensuring smooth operations of all club activities.',
    'Bachelor of Science in Software Engineering',
    'Third Year',
    'Monday & Friday, 1:00 PM - 3:00 PM',
    '2024-01-01',
    '2024-12-31',
    true,
    3,
    '{"linkedin": "https://linkedin.com/in/davidomondi", "github": "https://github.com/davidomondi"}'::jsonb
),
(
    'Grace Akinyi',
    'Treasurer',
    'grace.akinyi@students.jkuat.ac.ke',
    '+254 745 678 901',
    'Managing club finances, budgets, and ensuring transparent financial operations. Committed to fiscal responsibility.',
    'Bachelor of Commerce',
    'Fourth Year',
    'Wednesday, 2:00 PM - 4:00 PM',
    '2024-01-01',
    '2024-12-31',
    true,
    4,
    '{"linkedin": "https://linkedin.com/in/graceakinyi"}'::jsonb
),
(
    'Peter Mwangi',
    'Communications Director',
    'peter.mwangi@students.jkuat.ac.ke',
    '+254 756 789 012',
    'Leading club communications, social media presence, and public relations. Ensuring effective information dissemination.',
    'Bachelor of Science in Communication',
    'Third Year',
    'Tuesday & Thursday, 4:00 PM - 6:00 PM',
    '2024-01-01',
    '2024-12-31',
    true,
    5,
    '{"linkedin": "https://linkedin.com/in/petermwangi", "twitter": "https://twitter.com/petermwangi"}'::jsonb
),
(
    'Sarah Njeri',
    'Projects Coordinator',
    'sarah.njeri@students.jkuat.ac.ke',
    '+254 767 890 123',
    'Coordinating innovation projects, hackathons, and technical workshops. Passionate about hands-on learning.',
    'Bachelor of Science in Electrical Engineering',
    'Fourth Year',
    'Monday, 3:00 PM - 5:00 PM',
    '2024-01-01',
    '2024-12-31',
    true,
    6,
    '{"linkedin": "https://linkedin.com/in/sarahnjeri"}'::jsonb
);

-- Insert Club Patrons
INSERT INTO club_patrons (
    name, title, department, email, phone, office_location, bio,
    specialization, is_active, display_order, social_links
) VALUES
(
    'Dr. James Kariuki',
    'Senior Lecturer',
    'Department of Computer Science',
    'james.kariuki@jkuat.ac.ke',
    '+254 720 111 222',
    'ICT Building, Room 301',
    'Dr. Kariuki has over 15 years of experience in software engineering and innovation. He mentors students in developing cutting-edge technology solutions and has supervised numerous successful startup projects.',
    ARRAY['Software Engineering', 'Innovation Management', 'Entrepreneurship', 'AI & Machine Learning'],
    true,
    1,
    '{"linkedin": "https://linkedin.com/in/jameskariuki"}'::jsonb
),
(
    'Prof. Elizabeth Wambui',
    'Professor',
    'Department of Business Administration',
    'elizabeth.wambui@jkuat.ac.ke',
    '+254 720 222 333',
    'Business School, Room 205',
    'Prof. Wambui is a renowned expert in entrepreneurship and business development. She has helped launch over 50 student startups and provides strategic guidance on business planning and market entry.',
    ARRAY['Entrepreneurship', 'Business Strategy', 'Startup Development', 'Financial Management'],
    true,
    2,
    '{"linkedin": "https://linkedin.com/in/elizabethwambui"}'::jsonb
),
(
    'Dr. Michael Otieno',
    'Senior Lecturer',
    'Department of Electrical Engineering',
    'michael.otieno@jkuat.ac.ke',
    '+254 720 333 444',
    'Engineering Block, Room 402',
    'Dr. Otieno specializes in IoT and embedded systems. He guides students in developing innovative hardware solutions and has extensive industry connections for internship placements.',
    ARRAY['IoT', 'Embedded Systems', 'Hardware Innovation', 'Product Development'],
    true,
    3,
    '{"linkedin": "https://linkedin.com/in/michaelotieno"}'::jsonb
);

-- Verify data was inserted
SELECT 'Executive Committee' as table_name, COUNT(*) as count FROM executive_committee;
SELECT 'Club Patrons' as table_name, COUNT(*) as count FROM club_patrons;
