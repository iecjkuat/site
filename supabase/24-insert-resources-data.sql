-- Insert sample resources data
-- This will populate the resources table with sample documents

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
    
    -- Insert sample resources
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
        'https://example.com/constitution-2024.pdf',
        'JIEC_Constitution_2024.pdf',
        2621440, -- 2.5 MB
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
        'https://example.com/member-handbook.pdf',
        'Member_Handbook_2024.pdf',
        4404019, -- 4.2 MB
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
        'https://example.com/project-proposal-template.docx',
        'Project_Proposal_Template.docx',
        1887436, -- 1.8 MB
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        156,
        'other/project-proposal-template.docx'
    ),
    (
        v_club_id,
        v_user_id,
        'Innovation Toolkit',
        'Comprehensive guide to innovation methodologies, design thinking processes, and problem-solving frameworks used in the club.',
        'guides',
        ARRAY['innovation', 'design-thinking', 'methodology', 'frameworks'],
        'public',
        'https://example.com/innovation-toolkit.pdf',
        'Innovation_Toolkit.pdf',
        6397952, -- 6.1 MB
        'application/pdf',
        298,
        'guides/innovation-toolkit.pdf'
    ),
    (
        v_club_id,
        v_user_id,
        'Development Guidelines',
        'Best practices and coding standards for technical projects within the innovation club, including version control and documentation.',
        'guides',
        ARRAY['coding', 'standards', 'development', 'best-practices'],
        'members',
        'https://example.com/development-guidelines.txt',
        'Development_Guidelines.txt',
        3565158, -- 3.4 MB
        'text/plain',
        127,
        'guides/development-guidelines.txt'
    ),
    (
        v_club_id,
        v_user_id,
        'Event Planning Guide',
        'Step-by-step guide for organizing successful innovation events, workshops, hackathons, and networking sessions.',
        'guides',
        ARRAY['events', 'planning', 'workshops', 'hackathons'],
        'members',
        'https://example.com/event-planning-guide.docx',
        'Event_Planning_Guide.docx',
        3041280, -- 2.9 MB
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        203,
        'guides/event-planning-guide.docx'
    ),
    (
        v_club_id,
        v_user_id,
        'Meeting Minutes Template',
        'Standard template for recording meeting minutes, decisions, and action items during club meetings and committee sessions.',
        'minutes',
        ARRAY['template', 'meetings', 'minutes', 'documentation'],
        'members',
        'https://example.com/meeting-minutes-template.docx',
        'Meeting_Minutes_Template.docx',
        1048576, -- 1 MB
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        87,
        'minutes/meeting-minutes-template.docx'
    ),
    (
        v_club_id,
        v_user_id,
        'Financial Policy Document',
        'Official financial policies covering membership fees, event budgets, project funding, and expense reimbursement procedures.',
        'policies',
        ARRAY['finance', 'policy', 'budget', 'funding'],
        'members',
        'https://example.com/financial-policy.pdf',
        'Financial_Policy_2024.pdf',
        2097152, -- 2 MB
        'application/pdf',
        145,
        'policies/financial-policy-2024.pdf'
    ),
    (
        v_club_id,
        v_user_id,
        'Annual Report 2023',
        'Comprehensive annual report covering club achievements, projects completed, events organized, and financial summary for 2023.',
        'reports',
        ARRAY['annual-report', '2023', 'achievements', 'summary'],
        'public',
        'https://example.com/annual-report-2023.pdf',
        'Annual_Report_2023.pdf',
        5242880, -- 5 MB
        'application/pdf',
        312,
        'reports/annual-report-2023.pdf'
    ),
    (
        v_club_id,
        v_user_id,
        'Code of Conduct',
        'Official code of conduct outlining expected behavior, ethics, and professional standards for all club members and participants.',
        'policies',
        ARRAY['conduct', 'ethics', 'behavior', 'standards'],
        'public',
        'https://example.com/code-of-conduct.pdf',
        'Code_of_Conduct.pdf',
        1572864, -- 1.5 MB
        'application/pdf',
        267,
        'policies/code-of-conduct.pdf'
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample resources inserted successfully';
END $$;

-- Verify the inserted data
SELECT 
    id,
    title,
    category,
    file_type,
    download_count,
    access_level,
    created_at
FROM resources
ORDER BY created_at DESC
LIMIT 10;
