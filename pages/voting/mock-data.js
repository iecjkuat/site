/**
 * Mock Data for Voting Portal - Comprehensive Dataset
 */

console.log('📊 Loading comprehensive mock voting data...');

window.mockVotes = [
    {
        id: '1',
        title: 'Executive Committee Elections 2026',
        description: 'Choose the next generation of leaders for the JKUAT Innovation Club. These students will lead the club for the 2026/2027 academic year.',
        type: 'leadership',
        status: 'active',
        start_date: '2026-02-01T08:00:00Z',
        end_date: '2026-02-15T17:00:00Z',
        total_voters: 250,
        votes_cast: 142,
        positions: [
            {
                id: 'p1',
                position_name: 'Club President',
                description: 'The President serves as the primary representative and visionary for the Innovation Club.',
                candidates: [
                    {
                        id: 'c1',
                        name: 'John Doe',
                        course: 'BSc. Computer Science',
                        year: 3,
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
                        manifesto: 'Innovation for all members. I will focus on increasing industry partnerships, securing more hardware resources for the lab, and creating a formal mentorship program for freshmen seeking to join the innovation ecosystem.',
                        votes: 65
                    },
                    {
                        id: 'c2',
                        name: 'Jane Smith',
                        course: 'BSc. Mechatronic Engineering',
                        year: 4,
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
                        manifesto: 'Engineering a better future through collaborative innovation. My goal is to bridge the gap between our software and hardware teams and host the first JKUAT Inter-University Tech Summit.',
                        votes: 77
                    }
                ]
            },
            {
                id: 'p2',
                position_name: 'Secretary General',
                description: 'Responsible for maintaining club records, internal communications, and administrative efficiency.',
                candidates: [
                    {
                        id: 'c3',
                        name: 'James Kariuki',
                        course: 'BSc. Business Information Technology',
                        year: 2,
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
                        manifesto: 'Transparency and efficiency are key. I will implement a real-time digital record system for all club meetings and project approvals, ensuring every member knows exactly what\'s happening.',
                        votes: 58
                    },
                    {
                        id: 'c4',
                        name: 'Mary Atieno',
                        course: 'BSc. Software Engineering',
                        year: 3,
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
                        manifesto: 'Inclusive communication through digital transformation. I propose building an internal club portal to centralize all notifications, project updates, and resource sharing.',
                        votes: 84
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        title: 'Project Funding Priority - Semester 1, 2026',
        description: 'Voters can select up to 3 projects that should prioritize for funding from the $5,000 semester budget.',
        type: 'project',
        status: 'active',
        start_date: '2026-02-01T00:00:00Z',
        end_date: '2026-02-10T23:59:59Z',
        total_voters: 250,
        votes_cast: 89,
        voting_type: 'multiple_choice',
        max_selections: 3,
        options: [
            {
                id: 'proj1',
                title: 'AI-Powered Campus Guide',
                description: 'A custom LLM chatbot trained on university curriculum and services to assist students with schedules and inquiries.',
                budget_requested: 'KSh 45,000',
                team_lead: 'AI Research Group',
                votes: 42
            },
            {
                id: 'proj2',
                title: 'Smart Campus Waste Manager',
                description: 'IoT-enabled bins that notify collection services when full and categorize waste using computer vision.',
                budget_requested: 'KSh 85,000',
                team_lead: 'Green Tech Team',
                votes: 31
            },
            {
                id: 'proj3',
                title: 'Member Project Showcase Portal',
                description: 'A platform dedicated to showcasing member innovations to potential angel investors and employers.',
                budget_requested: 'KSh 20,000',
                team_lead: 'Web Core Team',
                votes: 16
            },
            {
                id: 'proj4',
                title: 'Low-Cost Portable ECG Monitor',
                description: 'A medical innovation project aiming to bring affordable heart monitoring to rural health centers.',
                budget_requested: 'KSh 60,000',
                team_lead: 'BioMed Innovators',
                votes: 27
            }
        ]
    },
    {
        id: '3',
        title: 'Referendum: Article 5 Amendment',
        description: 'Should the club allow part-time and online students to hold executive leadership positions?',
        type: 'decision',
        status: 'active',
        start_date: '2026-02-05T00:00:00Z',
        end_date: '2026-02-12T23:59:59Z',
        total_voters: 250,
        votes_cast: 156,
        voting_type: 'yes_no',
        proposal: {
            title: 'Inclusivity in Leadership Amendment',
            description: 'Currently, only full-time on-campus students can run for President or Secretary General.',
            current_text: 'Candidates for Executive roles must be full-time undergraduate students currently in residence at JKUAT Main Campus.',
            proposed_text: 'Candidates for Executive roles must be registered students of JKUAT (full-time, part-time, or online) in good academic standing.',
            rationale: 'The club has grown to include talented students across all modes of study. Restricting leadership to on-campus students excludes diverse perspectives and talents.'
        }
    },
    {
        id: '4',
        title: 'Annual Innovation Summit Committee',
        description: 'Selec the 5 members who will coordinate the 2026 Innovation Summit logistics and speaker outreach.',
        type: 'committee',
        status: 'upcoming',
        start_date: '2026-02-20T00:00:00Z',
        end_date: '2026-02-25T23:59:59Z',
        total_voters: 250,
        votes_cast: 0,
        voting_type: 'multiple_choice',
        max_selections: 5,
        committee_info: {
            name: 'Summit 2026 Organizing Committee',
            description: 'Responsible for speaker recruitment, venue branding, scholarship management, and corporate sponsorship.',
            commitment: 'High (10-15 hrs/week in lead-up)',
            positions_available: 5
        },
        candidates: [
            { id: 'cm1', name: 'Alice Wanjiru', course: 'Project Management', year: 3, avatar: 'https://i.pravatar.cc/150?u=cm1', experience: 'Coordinated logistics for the 2024 JKUAT Hackathon.' },
            { id: 'cm2', name: 'David Mwangi', course: 'Mass Comm', year: 4, avatar: 'https://i.pravatar.cc/150?u=cm2', experience: 'Former PR Lead for the Student Tech Community.' },
            { id: 'cm3', name: 'Sarah Atieno', course: 'Economics', year: 2, avatar: 'https://i.pravatar.cc/150?u=cm3', experience: 'Treasurer for the University Finance Club; expert in sponsorship outreach.' },
            { id: 'cm4', name: 'Michael Ochieng', course: 'Software Engineering', year: 3, avatar: 'https://i.pravatar.cc/150?u=cm4', experience: 'Full-stack developer; will manage the summit registration portal.' },
            { id: 'cm5', name: 'Grace Mutua', course: 'Architecture', year: 3, avatar: 'https://i.pravatar.cc/150?u=cm5', experience: 'Experienced in venue design and branding.' },
            { id: 'cm6', name: 'Ken Kiplagat', course: 'HR Management', year: 4, avatar: 'https://i.pravatar.cc/150?u=cm6', experience: 'Volunteer coordinator for previous 3 Tech Summits.' }
        ]
    },
    {
        id: '5',
        title: '2025 Constitutional Review Results',
        description: 'Voter results for the major constitutional overhaul voted on last year.',
        type: 'decision',
        status: 'completed',
        start_date: '2025-11-10T00:00:00Z',
        end_date: '2025-11-15T23:59:59Z',
        total_voters: 210,
        votes_cast: 185,
        results_published: true,
        summary: 'The amendments passed with an overwhelming 86% Support.',
        results: {
            yes: 159,
            no: 26,
            abstain: 0
        },
        proposal: {
            title: 'Structural Overhaul of the Executive Council',
            description: 'Introducing specialized Director roles (Tech, Ops, Outreach).'
        }
    }
];

// Seed user's voting history to demonstrate "already voted" UI state
try {
    const userVotingHistory = [
        { voteId: '3', choice: 'yes', timestamp: new Date(Date.now() - 86400000).toISOString() }, // Voted yesterday
        { voteId: '5', choice: 'yes', timestamp: new Date(Date.now() - 86400000 * 60).toISOString() } // Voted 2 months ago
    ];
    localStorage.setItem('userVotingHistory', JSON.stringify(userVotingHistory));
    localStorage.setItem('hasVotedBefore', 'true');
} catch (e) {
    console.warn('LocalStorage not available for mock seeding');
}

console.log('✅ Comprehensive mock voting data loaded:', window.mockVotes.length, 'votes');
