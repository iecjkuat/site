-- ============================================================================
-- Sample Election Data for Testing
-- ============================================================================

-- Insert a sample election
INSERT INTO elections (
    title, 
    description, 
    election_type,
    start_date, 
    end_date, 
    status,
    results_visible
) VALUES (
    '2026 Leadership Elections',
    'Annual leadership elections for JKUAT Innovation Club executive committee positions',
    'general',
    '2026-03-01 08:00:00',
    '2026-03-07 18:00:00',
    'draft',
    false
) RETURNING id;

-- Note: Save the election ID from above to use in the following inserts
-- For this example, we'll use a variable approach

DO $$
DECLARE
    election_uuid UUID;
    president_pos_uuid UUID;
    vp_pos_uuid UUID;
    secretary_pos_uuid UUID;
    treasurer_pos_uuid UUID;
BEGIN
    -- Get the election ID we just created
    SELECT id INTO election_uuid FROM elections WHERE title = '2026 Leadership Elections' LIMIT 1;

    -- Insert positions
    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES 
        (election_uuid, 'President', 'Lead the club and represent members', 1, 1, 1)
    RETURNING id INTO president_pos_uuid;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES 
        (election_uuid, 'Vice President', 'Assist the president and deputize when needed', 1, 1, 2)
    RETURNING id INTO vp_pos_uuid;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES 
        (election_uuid, 'Secretary', 'Manage club records and communications', 1, 1, 3)
    RETURNING id INTO secretary_pos_uuid;

    INSERT INTO positions (election_id, title, description, max_votes, min_votes, display_order)
    VALUES 
        (election_uuid, 'Treasurer', 'Manage club finances and budgets', 1, 1, 4)
    RETURNING id INTO treasurer_pos_uuid;

    -- Insert sample candidates (using placeholder data)
    -- President candidates
    INSERT INTO candidates (position_id, name, email, bio, manifesto, is_approved, is_active, display_order)
    VALUES 
        (president_pos_uuid, 'John Doe', 'john.doe@student.jkuat.ac.ke', 
         'Third-year Computer Science student with passion for innovation',
         'I will focus on increasing member engagement and securing more funding for projects',
         true, true, 1),
        (president_pos_uuid, 'Jane Smith', 'jane.smith@student.jkuat.ac.ke',
         'Final-year Engineering student and current project lead',
         'My vision is to expand our partnerships with industry and create more opportunities',
         true, true, 2);

    -- VP candidates
    INSERT INTO candidates (position_id, name, email, bio, manifesto, is_approved, is_active, display_order)
    VALUES 
        (vp_pos_uuid, 'Mike Johnson', 'mike.j@student.jkuat.ac.ke',
         'Second-year Business IT student',
         'I will work to improve our internal processes and member experience',
         true, true, 1),
        (vp_pos_uuid, 'Sarah Williams', 'sarah.w@student.jkuat.ac.ke',
         'Third-year Software Engineering student',
         'Focus on mentorship programs and skill development workshops',
         true, true, 2);

    -- Secretary candidates
    INSERT INTO candidates (position_id, name, email, bio, manifesto, is_approved, is_active, display_order)
    VALUES 
        (secretary_pos_uuid, 'David Brown', 'david.b@student.jkuat.ac.ke',
         'Second-year Information Technology student',
         'Streamline communication and improve documentation',
         true, true, 1);

    -- Treasurer candidates
    INSERT INTO candidates (position_id, name, email, bio, manifesto, is_approved, is_active, display_order)
    VALUES 
        (treasurer_pos_uuid, 'Emily Davis', 'emily.d@student.jkuat.ac.ke',
         'Third-year Accounting student',
         'Transparent financial management and budget optimization',
         true, true, 1),
        (treasurer_pos_uuid, 'Robert Wilson', 'robert.w@student.jkuat.ac.ke',
         'Final-year Finance student',
         'Increase revenue streams and financial sustainability',
         true, true, 2);

    -- Make all active users eligible to vote
    INSERT INTO voter_eligibility (election_id, user_id, is_eligible, is_verified)
    SELECT election_uuid, id, true, true
    FROM users
    WHERE membership_status = 'active';

    RAISE NOTICE 'Sample election data inserted successfully!';
    RAISE NOTICE 'Election ID: %', election_uuid;
END $$;
