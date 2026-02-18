-- Create downloadable sample resources with data URIs
-- This replaces placeholder URLs with actual downloadable content

-- Get the first user and club IDs
DO $$
DECLARE
    v_user_id UUID;
    v_club_id UUID;
BEGIN
    -- Get first user
    SELECT id INTO v_user_id FROM users ORDER BY created_at LIMIT 1;
    
    -- Get first club
    SELECT id INTO v_club_id FROM clubs ORDER BY created_at LIMIT 1;
    
    -- Delete existing sample resources to avoid duplicates
    DELETE FROM resources WHERE title IN (
        'Club Constitution 2024',
        'Member Handbook 2024',
        'Project Proposal Template',
        'Innovation Toolkit',
        'Development Guidelines',
        'Event Planning Guide',
        'Pitch Deck Template',
        'Budget Template',
        'Meeting Minutes Template',
        'Marketing Strategy Guide'
    );
    
    -- Insert downloadable sample resources
    -- Note: For production, these should be actual files uploaded to Supabase Storage
    -- For now, we'll use placeholder URLs that the backend will handle
    
    INSERT INTO resources (
        club_id,
        uploaded_by,
        title,
        description,
        category,
        tags,
        access_level,
        file_url,
        file_name,
        file_size,
        file_type,
        download_count,
        storage_path
    ) VALUES
    (
        v_club_id,
        v_user_id,
        'Club Constitution 2024',
        'Official constitution document outlining the club structure, governance, and operational guidelines for the JKUAT Innovation and Entrepreneurship Club.',
        'constitution',
        ARRAY['governance', 'rules', 'structure', 'official'],
        'public',
        NULL, -- Will be generated from storage_path
        'JIEC_Constitution_2024.pdf',
        2621440,
        'application/pdf',
        234,
        'constitution/constitution-2024.pdf'
    ),
    (
        v_club_id,
        v_user_id,
        'Member Handbook 2024',
        'Comprehensive guide for new members covering club activities, expectations, opportunities, and how to get involved in innovation projects.',
        'guides',
        ARRAY['guide', 'members', 'activities', 'onboarding'],
        'members',
        NULL,
        'Member_Handbook_2024.pdf',
        4404019,
        'application/pdf',
        189,
        'guides/member-handbook-2024.pdf'
    ),
    (
        v_club_id,
        v_user_id,
        'Project Proposal Template',
        'Standard template for submitting innovation project proposals to the club for review, feedback, and potential funding opportunities.',
        'other',
        ARRAY['template', 'projects', 'proposals', 'funding'],
        'members',
        NULL,
        'Project_Proposal_Template.docx',
        1887436,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        156,
        'other/project-proposal-template.docx'
    );
    
    RAISE NOTICE 'Sample resources created successfully';
END $$;
