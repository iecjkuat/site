-- =============================================
-- JKUAT Innovation Club - Communication & Networking Mock Data
-- =============================================

-- First, let's ensure we have the required users
DO $$
BEGIN
    -- Check if we have the required users, if not create them
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@jkuatinnovation.ac.ke') THEN
        INSERT INTO users (id, email, name, role, status) VALUES 
        (gen_random_uuid(), 'admin@jkuatinnovation.ac.ke', 'Admin User', 'admin', 'active');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'executive@jkuatinnovation.ac.ke') THEN
        INSERT INTO users (id, email, name, role, status) VALUES 
        (gen_random_uuid(), 'executive@jkuatinnovation.ac.ke', 'Executive User', 'executive', 'active');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'member@jkuatinnovation.ac.ke') THEN
        INSERT INTO users (id, email, name, role, status) VALUES 
        (gen_random_uuid(), 'member@jkuatinnovation.ac.ke', 'Member User', 'member', 'active');
    END IF;
END $$;

-- Insert Sample Chat Groups
INSERT INTO chat_groups (id, name, description, group_type, is_private, created_by) VALUES
(
    gen_random_uuid(),
    'Executive Committee',
    'Private group for executive committee members to discuss leadership matters and make important decisions.',
    'executive',
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Tech Department',
    'Discussion group for technology department members to collaborate on technical projects and share knowledge.',
    'department',
    false,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Business Department',
    'Group for business department members to discuss entrepreneurship, business plans, and market opportunities.',
    'department',
    false,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'AI Innovation Project',
    'Project team working on artificial intelligence solutions for local businesses and community challenges.',
    'project',
    false,
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Fintech Solutions Team',
    'Team developing financial technology solutions to improve access to financial services in Kenya.',
    'project',
    false,
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Class of 2024',
    'Cohort group for students who joined the club in 2024 to network and support each other.',
    'cohort',
    false,
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Class of 2023',
    'Cohort group for students who joined the club in 2023, now senior members mentoring newer cohorts.',
    'cohort',
    false,
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'General Discussion',
    'Open forum for all club members to share ideas, ask questions, and engage in general discussions.',
    'general',
    false,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Chat Group Members
INSERT INTO chat_group_members (id, group_id, user_id, role) VALUES
-- Executive Committee Members
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Executive Committee' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    'admin'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Executive Committee' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'admin'
),

-- Tech Department Members
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Tech Department' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    'moderator'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Tech Department' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Tech Department' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
),

-- Business Department Members
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Business Department' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'moderator'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Business Department' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
),

-- AI Innovation Project Team
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'AI Innovation Project' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'admin'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'AI Innovation Project' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
),

-- Fintech Solutions Team
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Fintech Solutions Team' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'admin'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Fintech Solutions Team' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
),

-- Class of 2024 Cohort
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Class of 2024' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'admin'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'Class of 2024' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
),

-- General Discussion (All Members)
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'General Discussion' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    'moderator'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'General Discussion' LIMIT 1),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
),
(
    gen_random_uuid(),
    (SELECT id FROM chat_groups WHERE name = 'General Discussion' LIMIT 1),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'member'
)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Insert Sample Messages with proper column checking
DO $$
DECLARE
    has_group_id BOOLEAN;
    has_message_type BOOLEAN;
    has_priority_level BOOLEAN;
    admin_user_id UUID;
    exec_user_id UUID;
    member_user_id UUID;
    tech_group_id UUID;
    ai_group_id UUID;
    general_group_id UUID;
    exec_group_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Get group IDs
    SELECT id INTO tech_group_id FROM chat_groups WHERE name = 'Tech Department' LIMIT 1;
    SELECT id INTO ai_group_id FROM chat_groups WHERE name = 'AI Innovation Project' LIMIT 1;
    SELECT id INTO general_group_id FROM chat_groups WHERE name = 'General Discussion' LIMIT 1;
    SELECT id INTO exec_group_id FROM chat_groups WHERE name = 'Executive Committee' LIMIT 1;
    
    -- Check which columns exist in messages table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'group_id'
    ) INTO has_group_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'message_type'
    ) INTO has_message_type;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'priority_level'
    ) INTO has_priority_level;
    
    -- Insert messages based on available columns
    IF has_group_id AND has_message_type AND has_priority_level THEN
        -- Full feature set available
        RAISE NOTICE 'Inserting messages with full feature set';
        
        -- Direct Messages
        INSERT INTO messages (id, sender_id, recipient_id, group_id, subject, content, message_type, priority_level, created_at) VALUES
        (
            gen_random_uuid(),
            exec_user_id,
            member_user_id,
            NULL,
            'Welcome to the Club!',
            'Hi there! Welcome to JKUAT Innovation Club. I''m excited to have you on board. Feel free to reach out if you have any questions about our projects or activities.',
            'direct',
            'normal',
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        ),
        (
            gen_random_uuid(),
            member_user_id,
            exec_user_id,
            NULL,
            'Thank you!',
            'Thank you so much for the warm welcome! I''m really looking forward to contributing to the club''s projects. Could you tell me more about the current AI innovation project?',
            'direct',
            'normal',
            CURRENT_TIMESTAMP - INTERVAL '1 day 20 hours'
        );
        
        -- Group Messages - Tech Department
        INSERT INTO messages (id, sender_id, recipient_id, group_id, subject, content, message_type, priority_level, created_at) VALUES
        (
            gen_random_uuid(),
            admin_user_id,
            NULL,
            tech_group_id,
            NULL,
            'Team, we have an exciting opportunity to collaborate with a local startup on their mobile app development. They''re looking for students to help with React Native development. Who''s interested?',
            'group',
            'normal',
            CURRENT_TIMESTAMP - INTERVAL '1 day 12 hours'
        ),
        (
            gen_random_uuid(),
            member_user_id,
            NULL,
            tech_group_id,
            NULL,
            'I''m definitely interested! I''ve been working with React Native for the past few months and would love to gain more real-world experience.',
            'group',
            'normal',
            CURRENT_TIMESTAMP - INTERVAL '1 day 10 hours'
        ),
        (
            gen_random_uuid(),
            exec_user_id,
            NULL,
            tech_group_id,
            NULL,
            'Count me in too! This sounds like a great learning opportunity. When do we start?',
            'group',
            'normal',
            CURRENT_TIMESTAMP - INTERVAL '1 day 8 hours'
        );
        
        -- Group Messages - AI Innovation Project
        INSERT INTO messages (id, sender_id, recipient_id, group_id, subject, content, message_type, priority_level, created_at) VALUES
        (
            gen_random_uuid(),
            exec_user_id,
            NULL,
            ai_group_id,
            NULL,
            'Great progress on the machine learning model! The accuracy has improved to 87%. Let''s schedule a meeting this week to discuss the next phase of development.',
            'group',
            'high',
            CURRENT_TIMESTAMP - INTERVAL '8 hours'
        ),
        (
            gen_random_uuid(),
            member_user_id,
            NULL,
            ai_group_id,
            NULL,
            'Excellent work everyone! I''m available for the meeting on Wednesday or Thursday afternoon. Should we also prepare a demo for the upcoming showcase?',
            'group',
            'normal',
            CURRENT_TIMESTAMP - INTERVAL '6 hours'
        );
        
        -- Group Messages - General Discussion
        INSERT INTO messages (id, sender_id, recipient_id, group_id, subject, content, message_type, priority_level, created_at) VALUES
        (
            gen_random_uuid(),
            admin_user_id,
            NULL,
            general_group_id,
            NULL,
            'Reminder: Our monthly innovation showcase is coming up next Friday! All project teams should prepare their presentations. This is a great opportunity to share your work with the entire club.',
            'group',
            'high',
            CURRENT_TIMESTAMP - INTERVAL '4 hours'
        ),
        (
            gen_random_uuid(),
            member_user_id,
            NULL,
            general_group_id,
            NULL,
            'Looking forward to it! Our fintech team has made some exciting breakthroughs that we can''t wait to share.',
            'group',
            'normal',
            CURRENT_TIMESTAMP - INTERVAL '3 hours'
        );
        
        -- Executive Committee Messages
        INSERT INTO messages (id, sender_id, recipient_id, group_id, subject, content, message_type, priority_level, created_at) VALUES
        (
            gen_random_uuid(),
            admin_user_id,
            NULL,
            exec_group_id,
            NULL,
            'We need to finalize the budget allocation for Q1 2025. Please review the draft budget I shared and provide your feedback by tomorrow.',
            'group',
            'urgent',
            CURRENT_TIMESTAMP - INTERVAL '2 hours'
        ),
        (
            gen_random_uuid(),
            exec_user_id,
            NULL,
            exec_group_id,
            NULL,
            'Reviewed the budget. I suggest increasing the allocation for the innovation lab equipment. We''ve had many requests for new hardware.',
            'group',
            'high',
            CURRENT_TIMESTAMP - INTERVAL '1 hour'
        );
        
    ELSIF has_group_id AND has_message_type THEN
        -- Group support but no priority levels
        RAISE NOTICE 'Inserting messages with group support (no priority levels)';
        
        INSERT INTO messages (id, sender_id, recipient_id, group_id, subject, content, message_type, created_at) VALUES
        (
            gen_random_uuid(),
            exec_user_id,
            member_user_id,
            NULL,
            'Welcome to the Club!',
            'Hi there! Welcome to JKUAT Innovation Club. I''m excited to have you on board.',
            'direct',
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        ),
        (
            gen_random_uuid(),
            admin_user_id,
            NULL,
            tech_group_id,
            NULL,
            'Team, we have an exciting opportunity to collaborate with a local startup on mobile app development.',
            'group',
            CURRENT_TIMESTAMP - INTERVAL '1 day 12 hours'
        );
        
    ELSE
        -- Basic messages table - only direct messages
        RAISE NOTICE 'Inserting basic direct messages only';
        
        INSERT INTO messages (id, sender_id, recipient_id, subject, content, created_at) VALUES
        (
            gen_random_uuid(),
            exec_user_id,
            member_user_id,
            'Welcome to the Club!',
            'Hi there! Welcome to JKUAT Innovation Club. I''m excited to have you on board.',
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        ),
        (
            gen_random_uuid(),
            member_user_id,
            exec_user_id,
            'Thank you!',
            'Thank you so much for the warm welcome! I''m really looking forward to contributing to the club''s projects.',
            CURRENT_TIMESTAMP - INTERVAL '1 day 20 hours'
        );
    END IF;
    
    RAISE NOTICE 'Messages inserted successfully';
END $$;

-- Insert Sample Announcements
INSERT INTO announcements (id, title, content, announcement_type, priority_level, target_audience, is_emergency, send_email, created_by, published_at) VALUES
(
    gen_random_uuid(),
    'Annual General Meeting - December 30, 2024',
    'Dear Club Members,

We are pleased to announce our Annual General Meeting (AGM) scheduled for December 30, 2024, at 2:00 PM in the JKUAT Main Auditorium.

Agenda:
1. Review of 2024 activities and achievements
2. Financial report presentation
3. Elections for 2025 leadership positions
4. Strategic planning for 2025
5. Q&A session

All members are encouraged to attend. Light refreshments will be provided.

Best regards,
JKUAT Innovation Club Executive Committee',
    'event',
    'high',
    'all',
    false,
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
    gen_random_uuid(),
    'Innovation Showcase - January 12, 2025',
    'Get ready for our first Innovation Showcase of 2025!

Date: January 12, 2025
Time: 10:00 AM - 4:00 PM
Venue: Innovation Lab & Main Hall

This is your opportunity to:
- Present your projects to industry experts
- Network with potential investors and mentors
- Win exciting prizes and recognition
- Learn from fellow innovators

Registration deadline: January 8, 2025
Register at: https://showcase.jkuatinnovation.ac.ke

Don''t miss this amazing opportunity to showcase your innovations!',
    'event',
    'normal',
    'all',
    false,
    true,
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    gen_random_uuid(),
    'New Partnership with Safaricom PLC',
    'We are thrilled to announce our new partnership with Safaricom PLC!

This partnership will provide our members with:
- Internship opportunities in fintech and mobile technology
- Mentorship from Safaricom engineers and business experts
- Access to Safaricom''s innovation labs and resources
- Potential funding for outstanding projects

The partnership officially begins in January 2025. More details about application processes and opportunities will be shared soon.

This is a game-changer for our club and opens up incredible opportunities for all members!',
    'achievement',
    'high',
    'all',
    false,
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '6 hours'
),
(
    gen_random_uuid(),
    'Emergency: Lab Access Temporarily Suspended',
    'URGENT NOTICE: Innovation Lab Access Temporarily Suspended

Due to a water leak in the innovation lab, access is temporarily suspended for safety reasons.

Affected areas:
- Main innovation lab (Room 204)
- 3D printing station
- Electronics workshop

Alternative arrangements:
- Computer Lab 3 is available for software development
- Mobile workstations set up in Room 206
- 3D printing services available at the library

We expect to resolve this issue by tomorrow afternoon. Updates will be provided as soon as more information is available.

For urgent project needs, contact the executive committee immediately.

Thank you for your understanding.',
    'urgent',
    'urgent',
    'all',
    true,
    true,
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Emergency Contacts
INSERT INTO emergency_contacts (id, user_id, contact_type, name, relationship, phone_number, email, is_primary) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'primary',
    'Mary Wanjiku',
    'Mother',
    '+254722123456',
    'mary.wanjiku@gmail.com',
    true
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    'secondary',
    'John Kimani',
    'Father',
    '+254733654321',
    'john.kimani@gmail.com',
    false
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'primary',
    'Grace Ochieng',
    'Sister',
    '+254711987654',
    'grace.ochieng@gmail.com',
    true
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    'secondary',
    'Peter Ochieng',
    'Father',
    '+254722456789',
    'peter.ochieng@gmail.com',
    false
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    'primary',
    'Sarah Mutua',
    'Spouse',
    '+254733789123',
    'sarah.mutua@gmail.com',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Communication Preferences
INSERT INTO communication_preferences (id, user_id, email_notifications, sms_notifications, push_notifications, digest_frequency) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
    true,
    true,
    true,
    'daily'
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
    true,
    false,
    true,
    'daily'
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
    true,
    false,
    true,
    'weekly'
)
ON CONFLICT (user_id) DO NOTHING;

-- Insert Sample Email Templates
INSERT INTO email_templates (id, name, subject, html_content, text_content, template_type, variables, created_by) VALUES
(
    gen_random_uuid(),
    'Welcome New Member',
    'Welcome to JKUAT Innovation Club, {{name}}!',
    '<html><body><h1>Welcome {{name}}!</h1><p>We are excited to have you join the JKUAT Innovation and Entrepreneurship Club. Your journey of innovation starts here!</p><p>Next steps:</p><ul><li>Complete your profile</li><li>Join relevant project groups</li><li>Attend our orientation session</li></ul><p>Best regards,<br>JKUAT Innovation Club Team</p></body></html>',
    'Welcome {{name}}! We are excited to have you join the JKUAT Innovation and Entrepreneurship Club. Your journey of innovation starts here! Next steps: 1. Complete your profile 2. Join relevant project groups 3. Attend our orientation session. Best regards, JKUAT Innovation Club Team',
    'welcome',
    '{"name": "Member Name"}',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Event Reminder',
    'Reminder: {{event_name}} - {{event_date}}',
    '<html><body><h1>Event Reminder</h1><p>This is a friendly reminder about the upcoming event:</p><h2>{{event_name}}</h2><p><strong>Date:</strong> {{event_date}}</p><p><strong>Time:</strong> {{event_time}}</p><p><strong>Venue:</strong> {{event_venue}}</p><p>We look forward to seeing you there!</p></body></html>',
    'Event Reminder: {{event_name}} on {{event_date}} at {{event_time}} in {{event_venue}}. We look forward to seeing you there!',
    'reminder',
    '{"event_name": "Event Name", "event_date": "Event Date", "event_time": "Event Time", "event_venue": "Event Venue"}',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
),
(
    gen_random_uuid(),
    'Emergency Alert',
    'URGENT: {{alert_title}}',
    '<html><body style="background-color: #fee; padding: 20px;"><h1 style="color: #d00;">URGENT ALERT</h1><h2>{{alert_title}}</h2><p>{{alert_message}}</p><p><strong>Action Required:</strong> {{action_required}}</p><p>For immediate assistance, contact: {{emergency_contact}}</p></body></html>',
    'URGENT ALERT: {{alert_title}}. {{alert_message}}. Action Required: {{action_required}}. For immediate assistance, contact: {{emergency_contact}}',
    'emergency',
    '{"alert_title": "Alert Title", "alert_message": "Alert Message", "action_required": "Required Action", "emergency_contact": "Emergency Contact"}',
    (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)
)
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Message Reactions (only if messages exist)
DO $$
DECLARE
    msg_id UUID;
    admin_user_id UUID;
    exec_user_id UUID;
    member_user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Add reactions to messages if they exist
    SELECT id INTO msg_id FROM messages WHERE content LIKE '%mobile app development%' LIMIT 1;
    IF msg_id IS NOT NULL THEN
        INSERT INTO message_reactions (id, message_id, user_id, emoji) VALUES
        (gen_random_uuid(), msg_id, member_user_id, '👍'),
        (gen_random_uuid(), msg_id, exec_user_id, '🚀')
        ON CONFLICT (message_id, user_id, emoji) DO NOTHING;
    END IF;
    
    SELECT id INTO msg_id FROM messages WHERE content LIKE '%machine learning model%' LIMIT 1;
    IF msg_id IS NOT NULL THEN
        INSERT INTO message_reactions (id, message_id, user_id, emoji) VALUES
        (gen_random_uuid(), msg_id, member_user_id, '🎉')
        ON CONFLICT (message_id, user_id, emoji) DO NOTHING;
    END IF;
    
    SELECT id INTO msg_id FROM messages WHERE content LIKE '%innovation showcase%' LIMIT 1;
    IF msg_id IS NOT NULL THEN
        INSERT INTO message_reactions (id, message_id, user_id, emoji) VALUES
        (gen_random_uuid(), msg_id, exec_user_id, '💡'),
        (gen_random_uuid(), msg_id, member_user_id, '👏')
        ON CONFLICT (message_id, user_id, emoji) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Message reactions added successfully';
END $$;

-- Update message reaction counts
UPDATE messages SET reaction_counts = (
    SELECT jsonb_object_agg(emoji, count)
    FROM (
        SELECT emoji, COUNT(*) as count
        FROM message_reactions
        WHERE message_id = messages.id
        GROUP BY emoji
    ) reactions
) WHERE id IN (
    SELECT DISTINCT message_id FROM message_reactions
);

-- Create some read receipts for messages
DO $$
DECLARE
    msg_id UUID;
    admin_user_id UUID;
    exec_user_id UUID;
    member_user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- Add read receipts for direct messages
    SELECT id INTO msg_id FROM messages WHERE content LIKE '%Welcome to the Club%' LIMIT 1;
    IF msg_id IS NOT NULL THEN
        INSERT INTO message_recipients (id, message_id, recipient_id, delivery_status, read_at) VALUES
        (gen_random_uuid(), msg_id, member_user_id, 'read', CURRENT_TIMESTAMP - INTERVAL '1 day 18 hours')
        ON CONFLICT (message_id, recipient_id) DO NOTHING;
    END IF;
    
    SELECT id INTO msg_id FROM messages WHERE content LIKE '%Thank you so much%' LIMIT 1;
    IF msg_id IS NOT NULL THEN
        INSERT INTO message_recipients (id, message_id, recipient_id, delivery_status, read_at) VALUES
        (gen_random_uuid(), msg_id, exec_user_id, 'read', CURRENT_TIMESTAMP - INTERVAL '1 day 15 hours')
        ON CONFLICT (message_id, recipient_id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Message recipients added successfully';
END $$;

-- Create announcement recipients
DO $$
DECLARE
    ann_id UUID;
    admin_user_id UUID;
    exec_user_id UUID;
    member_user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO exec_user_id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1;
    SELECT id INTO member_user_id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1;
    
    -- AGM Announcement
    SELECT id INTO ann_id FROM announcements WHERE title LIKE '%Annual General Meeting%' LIMIT 1;
    IF ann_id IS NOT NULL THEN
        INSERT INTO announcement_recipients (id, announcement_id, recipient_id, delivery_method, delivery_status, read_at) VALUES
        (gen_random_uuid(), ann_id, member_user_id, 'in_app', 'read', CURRENT_TIMESTAMP - INTERVAL '2 days'),
        (gen_random_uuid(), ann_id, exec_user_id, 'in_app', 'read', CURRENT_TIMESTAMP - INTERVAL '2 days 12 hours')
        ON CONFLICT (announcement_id, recipient_id, delivery_method) DO NOTHING;
    END IF;
    
    -- Innovation Showcase Announcement
    SELECT id INTO ann_id FROM announcements WHERE title LIKE '%Innovation Showcase%' LIMIT 1;
    IF ann_id IS NOT NULL THEN
        INSERT INTO announcement_recipients (id, announcement_id, recipient_id, delivery_method, delivery_status, read_at) VALUES
        (gen_random_uuid(), ann_id, member_user_id, 'in_app', 'delivered', NULL),
        (gen_random_uuid(), ann_id, exec_user_id, 'in_app', 'read', CURRENT_TIMESTAMP - INTERVAL '20 hours')
        ON CONFLICT (announcement_id, recipient_id, delivery_method) DO NOTHING;
    END IF;
    
    -- Emergency Lab Access
    SELECT id INTO ann_id FROM announcements WHERE title LIKE '%Emergency: Lab Access%' LIMIT 1;
    IF ann_id IS NOT NULL THEN
        INSERT INTO announcement_recipients (id, announcement_id, recipient_id, delivery_method, delivery_status, read_at) VALUES
        (gen_random_uuid(), ann_id, member_user_id, 'in_app', 'delivered', NULL),
        (gen_random_uuid(), ann_id, exec_user_id, 'in_app', 'read', CURRENT_TIMESTAMP - INTERVAL '1 hour')
        ON CONFLICT (announcement_id, recipient_id, delivery_method) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Announcement recipients added successfully';
END $$;

COMMIT;