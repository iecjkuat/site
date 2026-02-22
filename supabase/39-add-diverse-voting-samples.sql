-- ============================================================================
-- Diverse Voting Activities Sample Data
-- ============================================================================

DO $$
DECLARE
    leadership_election_id UUID;
    project_vote_id UUID;
    decision_vote_id UUID;
    referendum_vote_id UUID;
    event_vote_id UUID;
    
    president_pos_id UUID;
    vp_pos_id UUID;
    project_pos_id UUID;
    decision_pos_id UUID;
    amendment_pos_id UUID;
    event_pos_id UUID;
    
    venue_opt1_id UUID;
    venue_opt2_id UUID;
    venue_opt3_id UUID;
BEGIN
    -- ========================================================================
    -- 1. LEADERSHIP ELECTION (Active)
    -- ========================================================================
    INSERT INTO elections (title, description, election_type, start_date, end_date, status, results_visible)
    VALUES (
        '2026 Executive Committee Elections',
        'Annual elections for club leadership positions',
        'leadership',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '6 days',
        'active',
        false
    ) RETURNING id INTO leadership_election_id;

    -- President Position
    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (leadership_election_id, 'Club President', 'Lead the club and represent all members', 1, 1, 1)
    RETURNING id INTO president_pos_id;

    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES 
        (president_pos_id, 'Alex Mwangi', true, true, 1),
        (president_pos_id, 'Sarah Njeri', true, true, 2),
        (president_pos_id, 'David Omondi', true, true, 3);

    -- Vice President Position
    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (leadership_election_id, 'Vice President', 'Support the president and deputize when needed', 1, 1, 2)
    RETURNING id INTO vp_pos_id;

    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES 
        (vp_pos_id, 'Grace Wanjiku', true, true, 1),
        (vp_pos_id, 'James Kamau', true, true, 2);

    -- Make all active members eligible
    INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
    SELECT leadership_election_id, id, true, true
    FROM users
    WHERE membership_status = 'active';

    -- ========================================================================
    -- 2. PROJECT FUNDING VOTE (Active)
    -- ========================================================================
    INSERT INTO elections (title, description, election_type, start_date, end_date, status, results_visible)
    VALUES (
        'Q1 2026 Project Funding Priority',
        'Vote for which project should receive priority funding this quarter',
        'project',
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '4 days',
        'active',
        false
    ) RETURNING id INTO project_vote_id;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (project_vote_id, 'Select Priority Project', 'Choose one project to receive KSh 100,000 funding', 1, 1, 1)
    RETURNING id INTO project_pos_id;

    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES 
        (project_pos_id, 'AI Campus Assistant Chatbot', true, true, 1),
        (project_pos_id, 'Smart Irrigation System', true, true, 2),
        (project_pos_id, 'Mobile App for Club Events', true, true, 3),
        (project_pos_id, 'IoT Lab Equipment Tracker', true, true, 4);

    INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
    SELECT project_vote_id, id, true, true
    FROM users
    WHERE membership_status = 'active';

    -- ========================================================================
    -- 3. CONSTITUTION AMENDMENT (Active)
    -- ========================================================================
    INSERT INTO elections (title, description, election_type, start_date, end_date, status, results_visible)
    VALUES (
        'Constitution Amendment: Membership Fees',
        'Vote on proposed amendment to increase annual membership fees from KSh 500 to KSh 1,000',
        'referendum',
        NOW() - INTERVAL '3 hours',
        NOW() + INTERVAL '5 days',
        'active',
        false
    ) RETURNING id INTO referendum_vote_id;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (referendum_vote_id, 'Amendment Vote', 'Do you support this amendment?', 1, 1, 1)
    RETURNING id INTO amendment_pos_id;

    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES 
        (amendment_pos_id, 'Yes - Support Amendment', true, true, 1),
        (amendment_pos_id, 'No - Reject Amendment', true, true, 2);

    INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
    SELECT referendum_vote_id, id, true, true
    FROM users
    WHERE membership_status = 'active';

    -- ========================================================================
    -- 4. GENERAL DECISION VOTE (Upcoming)
    -- ========================================================================
    INSERT INTO elections (title, description, election_type, start_date, end_date, status, results_visible)
    VALUES (
        'Club Meeting Day Change',
        'Vote on changing our weekly meeting day from Friday to Wednesday',
        'general',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '9 days',
        'draft',
        false
    ) RETURNING id INTO decision_vote_id;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (decision_vote_id, 'Meeting Day Preference', 'Select your preferred meeting day', 1, 1, 1)
    RETURNING id INTO decision_pos_id;

    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES 
        (decision_pos_id, 'Keep Friday', true, true, 1),
        (decision_pos_id, 'Change to Wednesday', true, true, 2),
        (decision_pos_id, 'Change to Thursday', true, true, 3);

    INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
    SELECT decision_vote_id, id, true, true
    FROM users
    WHERE membership_status = 'active';

    -- ========================================================================
    -- 5. SPECIAL EVENT VOTE (Completed - with results visible)
    -- ========================================================================
    INSERT INTO elections (title, description, election_type, start_date, end_date, status, results_visible)
    VALUES (
        'Annual Hackathon Venue Selection',
        'Choose the venue for our 2026 Annual Hackathon',
        'special',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '3 days',
        'completed',
        true
    ) RETURNING id INTO event_vote_id;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES (event_vote_id, 'Venue Selection', 'Select the best venue for our hackathon', 1, 1, 1)
    RETURNING id INTO event_pos_id;

    -- Insert candidates and get first one's ID
    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES (event_pos_id, 'JKUAT Main Campus Auditorium', true, true, 1)
    RETURNING id INTO venue_opt1_id;
    
    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES (event_pos_id, 'Nairobi Innovation Hub', true, true, 2)
    RETURNING id INTO venue_opt2_id;
    
    INSERT INTO candidates (position_id, name, is_approved, is_active, display_order)
    VALUES (event_pos_id, 'iHub Nairobi', true, true, 3)
    RETURNING id INTO venue_opt3_id;

    -- Simulate some votes for the completed election
    INSERT INTO votes (election_id, position_id, candidate_id, voter_id, vote_hash)
    SELECT 
        event_vote_id,
        event_pos_id,
        CASE 
            WHEN random() < 0.5 THEN venue_opt1_id
            WHEN random() < 0.75 THEN venue_opt2_id
            ELSE venue_opt3_id
        END,
        id,
        md5(random()::text)
    FROM users
    WHERE membership_status = 'active'
    LIMIT 45;

    RAISE NOTICE '✅ Diverse voting activities created successfully!';
    RAISE NOTICE '📊 Created 5 different voting activities:';
    RAISE NOTICE '   - Leadership Election (Active)';
    RAISE NOTICE '   - Project Funding Vote (Active)';
    RAISE NOTICE '   - Constitution Amendment (Active)';
    RAISE NOTICE '   - Meeting Day Vote (Upcoming)';
    RAISE NOTICE '   - Hackathon Venue (Completed with Results)';
END $$;
