-- Fix Event Dates to 2026 for Launch
-- Update all events to have future dates so registration shows as open

-- First, delete existing events to avoid conflicts
DELETE FROM events WHERE title LIKE '%2025%' OR title LIKE '%2026%';

-- Insert updated events with 2026 dates
INSERT INTO events (
    title, 
    description, 
    event_type, 
    start_date, 
    end_date, 
    location, 
    venue_details, 
    max_attendees, 
    registration_required, 
    registration_deadline, 
    fee, 
    status, 
    tags
) VALUES 
-- Event 1: AI Workshop (Next Week)
(
    'AI & Machine Learning Workshop 2026',
    'Comprehensive hands-on workshop covering the fundamentals of artificial intelligence and machine learning. Learn to build your first ML models using Python, TensorFlow, and real-world datasets. Perfect for beginners and intermediate developers.',
    'workshop',
    '2026-01-08T14:00:00Z',
    '2026-01-08T18:00:00Z',
    'JKUAT Main Campus',
    'Engineering Block, Computer Lab 1 & 2. Please bring your laptop with Python installed.',
    50,
    true,
    '2026-01-06T23:59:59Z',
    500,
    'upcoming',
    ARRAY['AI', 'machine learning', 'python', 'tensorflow', 'workshop', 'hands-on']
),

-- Event 2: Startup Pitch Competition (Next Month)
(
    'Innovation Startup Pitch Competition 2026',
    'Present your startup idea to a panel of experienced judges including venture capitalists, successful entrepreneurs, and industry experts. Winners receive seed funding, mentorship, and incubation support.',
    'competition',
    '2026-02-15T09:00:00Z',
    '2026-02-15T17:00:00Z',
    'JKUAT Business School',
    'Main Auditorium. Participants should prepare a 5-minute pitch and demo.',
    30,
    true,
    '2026-02-10T23:59:59Z',
    1000,
    'upcoming',
    ARRAY['startup', 'pitch', 'competition', 'funding', 'entrepreneurship', 'business']
),

-- Event 3: Tech Industry Networking (This Month)
(
    'Tech Industry Networking Night',
    'Connect with JKUAT alumni working in top tech companies, startup founders, and industry professionals. Great opportunity for internships, job opportunities, and mentorship connections.',
    'social',
    '2026-01-25T18:00:00Z',
    '2026-01-25T21:00:00Z',
    'JKUAT Innovation Hub',
    'Main Hall, 2nd Floor. Business casual dress code recommended.',
    80,
    true,
    '2026-01-23T23:59:59Z',
    300,
    'upcoming',
    ARRAY['networking', 'alumni', 'tech industry', 'careers', 'mentorship']
),

-- Event 4: Blockchain & Web3 Seminar (Next Month)
(
    'Blockchain Technology & Web3 Development Seminar',
    'Explore the future of decentralized technology with blockchain and Web3 development. Learn about smart contracts, DeFi, NFTs, and how to build decentralized applications.',
    'seminar',
    '2026-02-08T10:00:00Z',
    '2026-02-08T16:00:00Z',
    'JKUAT Main Campus',
    'Conference Hall A, ICT Building. Lunch will be provided.',
    100,
    true,
    '2026-02-05T23:59:59Z',
    0,
    'upcoming',
    ARRAY['blockchain', 'web3', 'cryptocurrency', 'smart contracts', 'defi', 'nft']
),

-- Event 5: Mobile App Development Bootcamp (Next Week)
(
    'Mobile App Development Bootcamp',
    'Intensive 2-day bootcamp covering iOS and Android app development using React Native and Flutter. Build and deploy your first mobile app by the end of the bootcamp.',
    'workshop',
    '2026-01-11T09:00:00Z',
    '2026-01-12T17:00:00Z',
    'JKUAT Computer Lab',
    'ICT Building, Labs 1-3. Laptops will be provided, but bring your own if preferred.',
    40,
    true,
    '2026-01-09T23:59:59Z',
    1500,
    'upcoming',
    ARRAY['mobile development', 'react native', 'flutter', 'ios', 'android', 'bootcamp']
),

-- Event 6: Innovation Challenge Hackathon (Next Month)
(
    'JKUAT Innovation Challenge Hackathon 2026',
    '48-hour hackathon focusing on solutions for climate change, healthcare, and education. Teams will compete to develop innovative tech solutions with mentorship from industry experts.',
    'competition',
    '2026-03-07T18:00:00Z',
    '2026-03-09T18:00:00Z',
    'JKUAT Innovation Hub',
    'Multiple labs and meeting rooms. Meals and accommodation provided.',
    120,
    true,
    '2026-03-01T23:59:59Z',
    800,
    'upcoming',
    ARRAY['hackathon', 'innovation', 'climate tech', 'healthcare', 'education', 'competition']
),

-- Event 7: Digital Marketing for Startups (This Month)
(
    'Digital Marketing Strategies for Tech Startups',
    'Learn effective digital marketing strategies specifically tailored for tech startups and small businesses. Covers social media marketing, SEO, content marketing, and growth hacking.',
    'workshop',
    '2026-01-30T13:00:00Z',
    '2026-01-30T17:00:00Z',
    'JKUAT Business School',
    'Seminar Room B. Materials and resources will be provided.',
    35,
    true,
    '2026-01-28T23:59:59Z',
    400,
    'upcoming',
    ARRAY['digital marketing', 'startups', 'social media', 'seo', 'growth hacking']
),

-- Event 8: Women in Tech Leadership Summit (Next Month)
(
    'Women in Tech Leadership Summit 2026',
    'Empowering women in technology through leadership development, mentorship, and networking. Featured keynote speakers, panel discussions, and breakout sessions on career advancement.',
    'seminar',
    '2026-02-22T09:00:00Z',
    '2026-02-22T17:00:00Z',
    'JKUAT Conference Center',
    'Main Conference Hall. Professional attire recommended.',
    150,
    true,
    '2026-02-18T23:59:59Z',
    0,
    'upcoming',
    ARRAY['women in tech', 'leadership', 'career development', 'networking', 'mentorship']
)

ON CONFLICT (id) DO NOTHING;