-- JKUAT Innovation Club - Events Mock Data
-- Comprehensive sample data for testing the events management system

-- ============================================================================
-- SAMPLE EVENTS DATA
-- ============================================================================

-- Insert sample events with variety of types, dates, and scenarios
INSERT INTO events (
  id, title, description, event_type, start_date, end_date, location, venue_details,
  max_attendees, registration_required, registration_deadline, fee, status, tags,
  created_at, updated_at
) VALUES 
-- Upcoming Workshop
(
  uuid_generate_v4(),
  'Innovation Workshop 2024',
  'Join us for an intensive workshop on innovation methodologies, design thinking, and startup fundamentals. Learn from industry experts and network with fellow innovators. This hands-on workshop will cover ideation techniques, market validation, prototyping, and pitch development.',
  'workshop',
  '2024-12-28T10:25:00Z',
  '2024-12-29T16:30:00Z',
  'JKUAT Main Campus',
  'Engineering Block, Room E101. Please bring your laptop and notebook.',
  50,
  true,
  '2024-12-27T23:59:59Z',
  200,
  'upcoming',
  ARRAY['innovation', 'workshop', 'design thinking', 'startup'],
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days'
),

-- AI & Machine Learning Seminar
(
  uuid_generate_v4(),
  'AI & Machine Learning in Agriculture',
  'Explore the applications of artificial intelligence and machine learning in modern agriculture. Discover how technology is revolutionizing farming practices, crop monitoring, and food security. Guest speakers from leading agritech companies will share real-world case studies.',
  'seminar',
  '2025-01-15T14:00:00Z',
  '2025-01-15T17:00:00Z',
  'JKUAT Main Campus',
  'Main Auditorium, Ground Floor',
  200,
  true,
  '2025-01-12T23:59:59Z',
  0,
  'upcoming',
  ARRAY['AI', 'machine learning', 'agriculture', 'technology'],
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day'
),

-- Hackathon Event
(
  uuid_generate_v4(),
  'JKUAT Innovation Challenge 2025',
  'Annual 48-hour hackathon focusing on solutions for sustainable development and climate change. Teams will compete to develop innovative tech solutions addressing real-world problems. Prizes worth over KES 500,000 to be won!',
  'hackathon',
  '2025-03-15T09:00:00Z',
  '2025-03-17T18:00:00Z',
  'JKUAT Main Campus',
  'Innovation Hub, Multiple Labs',
  150,
  true,
  '2025-03-10T23:59:59Z',
  500,
  'upcoming',
  ARRAY['hackathon', 'competition', 'climate tech', 'sustainability'],
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '1 day'
),

-- Networking Event
(
  uuid_generate_v4(),
  'Tech Entrepreneurs Meetup',
  'Monthly networking event bringing together tech entrepreneurs, investors, and innovators. Share ideas, find co-founders, and build valuable connections in the Kenyan tech ecosystem. Light refreshments will be provided.',
  'networking',
  '2025-01-25T18:00:00Z',
  '2025-01-25T21:00:00Z',
  'JKUAT Innovation Hub',
  'Main Hall, 2nd Floor',
  80,
  true,
  '2025-01-23T23:59:59Z',
  300,
  'upcoming',
  ARRAY['networking', 'entrepreneurs', 'tech', 'startups'],
  NOW() - INTERVAL '4 days',
  NOW()
),

-- Competition Event
(
  uuid_generate_v4(),
  'Business Plan Competition 2025',
  'Present your business idea to a panel of experienced judges including venture capitalists and successful entrepreneurs. Winners receive seed funding and mentorship opportunities. Open to all students with innovative business concepts.',
  'competition',
  '2025-02-20T09:00:00Z',
  '2025-02-20T17:00:00Z',
  'JKUAT Business School',
  'Conference Hall A',
  30,
  true,
  '2025-02-15T23:59:59Z',
  1000,
  'upcoming',
  ARRAY['business plan', 'competition', 'funding', 'entrepreneurship'],
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '2 days'
),

-- Training Session
(
  uuid_generate_v4(),
  'Digital Marketing for Startups',
  'Comprehensive training on digital marketing strategies specifically tailored for startups and small businesses. Learn about social media marketing, content creation, SEO, and online advertising on a budget.',
  'training',
  '2025-01-30T13:00:00Z',
  '2025-01-30T17:00:00Z',
  'JKUAT Computer Lab',
  'ICT Building, Lab 3',
  40,
  true,
  '2025-01-28T23:59:59Z',
  150,
  'upcoming',
  ARRAY['digital marketing', 'training', 'startups', 'social media'],
  NOW() - INTERVAL '2 days',
  NOW()
),

-- Past Event (Completed)
(
  uuid_generate_v4(),
  'Blockchain Technology Workshop',
  'Introduction to blockchain technology, cryptocurrencies, and decentralized applications. Hands-on session building simple smart contracts and understanding the fundamentals of distributed ledger technology.',
  'workshop',
  '2024-11-15T10:00:00Z',
  '2024-11-15T16:00:00Z',
  'JKUAT Main Campus',
  'Engineering Block, Room E205',
  35,
  true,
  '2024-11-12T23:59:59Z',
  250,
  'completed',
  ARRAY['blockchain', 'cryptocurrency', 'smart contracts', 'technology'],
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '40 days'
),

-- Past Event (Completed)
(
  uuid_generate_v4(),
  'Women in Tech Leadership Summit',
  'Empowering women in technology through leadership development, mentorship, and networking. Featured keynote speakers, panel discussions, and breakout sessions focused on career advancement in tech.',
  'seminar',
  '2024-10-08T09:00:00Z',
  '2024-10-08T17:00:00Z',
  'JKUAT Conference Center',
  'Main Conference Hall',
  120,
  true,
  '2024-10-05T23:59:59Z',
  0,
  'completed',
  ARRAY['women in tech', 'leadership', 'career development', 'networking'],
  NOW() - INTERVAL '75 days',
  NOW() - INTERVAL '70 days'
),

-- Free Event
(
  uuid_generate_v4(),
  'Open Source Contribution Workshop',
  'Learn how to contribute to open source projects and build your developer portfolio. We will cover Git/GitHub workflows, finding projects to contribute to, and making your first pull request.',
  'workshop',
  '2025-02-05T14:00:00Z',
  '2025-02-05T18:00:00Z',
  'JKUAT Computer Lab',
  'ICT Building, Lab 1 & 2',
  60,
  true,
  '2025-02-03T23:59:59Z',
  0,
  'upcoming',
  ARRAY['open source', 'git', 'github', 'programming'],
  NOW() - INTERVAL '1 day',
  NOW()
),

-- Multi-day Event
(
  uuid_generate_v4(),
  'Startup Bootcamp Weekend',
  'Intensive 3-day bootcamp covering all aspects of starting a tech company. From idea validation to product development, fundraising, and scaling. Includes mentorship sessions, workshops, and pitch practice.',
  'training',
  '2025-04-04T09:00:00Z',
  '2025-04-06T18:00:00Z',
  'JKUAT Innovation Hub',
  'Multiple Rooms - Full Facility',
  25,
  true,
  '2025-03-30T23:59:59Z',
  2500,
  'upcoming',
  ARRAY['bootcamp', 'startup', 'intensive', 'mentorship'],
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '3 days'
),

-- Large Capacity Event
(
  uuid_generate_v4(),
  'Annual Innovation Expo 2025',
  'The biggest innovation showcase of the year! Students, startups, and companies will exhibit their latest innovations. Includes product demonstrations, investor meetings, and technology showcases from various industries.',
  'networking',
  '2025-05-15T08:00:00Z',
  '2025-05-17T20:00:00Z',
  'JKUAT Main Campus',
  'Multiple Venues - Campus Wide',
  500,
  true,
  '2025-05-10T23:59:59Z',
  500,
  'upcoming',
  ARRAY['expo', 'innovation', 'showcase', 'networking', 'investors'],
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '5 days'
),

-- Cancelled Event
(
  uuid_generate_v4(),
  'International Tech Conference',
  'Due to unforeseen circumstances, this event has been cancelled. All registered participants will receive full refunds. We apologize for any inconvenience caused.',
  'seminar',
  '2025-01-20T09:00:00Z',
  '2025-01-20T17:00:00Z',
  'JKUAT Conference Center',
  'Main Hall',
  200,
  true,
  '2025-01-18T23:59:59Z',
  1500,
  'cancelled',
  ARRAY['conference', 'international', 'cancelled'],
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '1 day'
);

-- ============================================================================
-- SAMPLE EVENT ATTENDEES DATA
-- ============================================================================

-- First, let's get some event IDs and user IDs for creating attendees
DO $$
DECLARE
    event_record RECORD;
    user_record RECORD;
    attendee_count INTEGER;
    i INTEGER;
BEGIN
    -- For each event, create some sample attendees
    FOR event_record IN 
        SELECT id, title, max_attendees, status 
        FROM events 
        WHERE status IN ('upcoming', 'completed')
    LOOP
        -- Determine how many attendees to create (random between 5 and 80% of max capacity)
        IF event_record.max_attendees IS NOT NULL THEN
            attendee_count := GREATEST(5, (event_record.max_attendees * (0.3 + random() * 0.5))::INTEGER);
        ELSE
            attendee_count := 15 + (random() * 25)::INTEGER;
        END IF;
        
        -- Create attendees for this event
        i := 0;
        FOR user_record IN 
            SELECT id FROM users 
            ORDER BY random() 
            LIMIT attendee_count
        LOOP
            INSERT INTO event_attendees (
                event_id, 
                user_id, 
                registration_date, 
                attendance_status,
                payment_status,
                check_in_time
            ) VALUES (
                event_record.id,
                user_record.id,
                NOW() - INTERVAL '1 day' * (random() * 10 + 1),
                CASE 
                    WHEN event_record.status = 'completed' THEN 
                        CASE WHEN random() > 0.2 THEN 'attended' ELSE 'no_show' END
                    ELSE 'registered'
                END,
                CASE WHEN random() > 0.1 THEN 'paid' ELSE 'pending' END,
                CASE 
                    WHEN event_record.status = 'completed' AND random() > 0.2 THEN 
                        NOW() - INTERVAL '1 day' * (random() * 5 + 1)
                    ELSE NULL
                END
            );
            
            i := i + 1;
            EXIT WHEN i >= attendee_count;
        END LOOP;
        
        RAISE NOTICE 'Created % attendees for event: %', attendee_count, event_record.title;
    END LOOP;
END $$;

-- ============================================================================
-- SAMPLE EVENT FEEDBACK DATA
-- ============================================================================

-- Add feedback for completed events
INSERT INTO event_feedback (event_id, user_id, rating, feedback_text, would_recommend, suggestions)
SELECT 
    ea.event_id,
    ea.user_id,
    (3 + random() * 2)::INTEGER, -- Random rating between 3-5
    CASE (random() * 4)::INTEGER
        WHEN 0 THEN 'Great event! Learned a lot and made valuable connections.'
        WHEN 1 THEN 'Very informative session. The speakers were knowledgeable and engaging.'
        WHEN 2 THEN 'Excellent organization and content. Would definitely attend again.'
        ELSE 'Inspiring event that gave me new ideas for my projects.'
    END,
    random() > 0.2, -- 80% would recommend
    CASE (random() * 3)::INTEGER
        WHEN 0 THEN 'More hands-on activities would be great.'
        WHEN 1 THEN 'Longer networking sessions please.'
        ELSE 'Provide more resources and follow-up materials.'
    END
FROM event_attendees ea
JOIN events e ON ea.event_id = e.id
WHERE e.status = 'completed' 
    AND ea.attendance_status = 'attended'
    AND random() > 0.3 -- Only 70% of attendees leave feedback
LIMIT 50;

-- ============================================================================
-- SAMPLE EVENT RESOURCES DATA
-- ============================================================================

-- Add sample resources for events
INSERT INTO event_resources (event_id, resource_name, resource_type, description, is_public, uploaded_by)
SELECT 
    e.id,
    CASE (random() * 4)::INTEGER
        WHEN 0 THEN e.title || ' - Presentation Slides'
        WHEN 1 THEN e.title || ' - Workshop Materials'
        WHEN 2 THEN e.title || ' - Resource Guide'
        ELSE e.title || ' - Recording'
    END,
    CASE (random() * 4)::INTEGER
        WHEN 0 THEN 'presentation'
        WHEN 1 THEN 'document'
        WHEN 2 THEN 'material'
        ELSE 'video'
    END,
    'Comprehensive materials from the ' || e.title || ' event including slides, worksheets, and additional resources.',
    true,
    u.id
FROM events e
CROSS JOIN users u
WHERE u.role IN ('admin', 'executive')
    AND e.status IN ('completed', 'upcoming')
    AND random() > 0.4 -- 60% of events have resources
LIMIT 20;

-- ============================================================================
-- UPDATE EVENT STATISTICS
-- ============================================================================

-- Update events with realistic attendee counts in the title/description where appropriate
UPDATE events SET 
    description = description || ' Current registrations: ' || (
        SELECT COUNT(*) FROM event_attendees WHERE event_id = events.id
    ) || ' participants.'
WHERE status = 'upcoming' AND random() > 0.7;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
    event_count INTEGER;
    attendee_count INTEGER;
    feedback_count INTEGER;
    resource_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO event_count FROM events;
    SELECT COUNT(*) INTO attendee_count FROM event_attendees;
    SELECT COUNT(*) INTO feedback_count FROM event_feedback;
    SELECT COUNT(*) INTO resource_count FROM event_resources;
    
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'JKUAT Innovation Club Events Mock Data Created Successfully!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '• % sample events (various types and dates)', event_count;
    RAISE NOTICE '• % event registrations/attendees', attendee_count;
    RAISE NOTICE '• % feedback entries', feedback_count;
    RAISE NOTICE '• % event resources', resource_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Event Types: Workshop, Seminar, Hackathon, Networking, Competition, Training';
    RAISE NOTICE 'Event Status: Upcoming, Completed, Cancelled';
    RAISE NOTICE 'Date Range: Past events (Nov 2024) to Future events (May 2025)';
    RAISE NOTICE 'Realistic Data: Attendee counts, feedback, resources, check-ins';
    RAISE NOTICE '=================================================================';
END $$;