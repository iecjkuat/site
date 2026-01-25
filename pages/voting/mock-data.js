/**
 * Mock Data for Voting Portal - Enhanced for Various Voting Types
 */

window.mockVotes = [
    {
        id: '1',
        title: 'Executive Committee Elections 2026',
        description: 'Annual elections for the leadership positions including President, Secretary, and Treasurer of the Innovation Club.',
        type: 'leadership',
        status: 'active',
        start_date: '2026-01-01T00:00:00Z',
        end_date: '2026-01-15T23:59:59Z',
        total_voters: 150,
        votes_cast: 89,
        positions: [
            {
                id: 'p1',
                position_name: 'Club President',
                candidates: [
                    { 
                        id: 'c1', 
                        name: 'John Doe', 
                        course: 'Computer Science', 
                        year: 3, 
                        manifesto: 'Innovation for all members. I will focus on increasing industry partnerships and creating more opportunities for hands-on projects.',
                        votes: 45
                    },
                    { 
                        id: 'c2', 
                        name: 'Jane Smith', 
                        course: 'Mechatronics', 
                        year: 4, 
                        manifesto: 'Engineering a better future through collaborative innovation and inclusive leadership.',
                        votes: 32
                    }
                ]
            },
            {
                id: 'p2',
                position_name: 'Secretary General',
                candidates: [
                    { 
                        id: 'c3', 
                        name: 'James Kariuki', 
                        course: 'Business IT', 
                        year: 2, 
                        manifesto: 'Transparency and efficiency in all club operations. Better communication systems.',
                        votes: 38
                    },
                    { 
                        id: 'c4', 
                        name: 'Mary Atieno', 
                        course: 'Software Engineering', 
                        year: 3, 
                        manifesto: 'Inclusive communication and digital transformation of club processes.',
                        votes: 41
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        title: 'Project Funding Priority Vote',
        description: 'Vote on which projects should receive priority funding from the club budget this semester.',
        type: 'project',
        status: 'active',
        start_date: '2026-01-20T00:00:00Z',
        end_date: '2026-01-25T23:59:59Z',
        total_voters: 150,
        votes_cast: 23,
        voting_type: 'multiple_choice',
        max_selections: 3,
        options: [
            {
                id: 'proj1',
                title: 'AI-Powered Campus Assistant',
                description: 'Develop an AI chatbot to help students navigate campus services and information.',
                budget_requested: 'KSh 50,000',
                team_lead: 'Tech Team Alpha',
                votes: 15
            },
            {
                id: 'proj2',
                title: 'Smart Irrigation System',
                description: 'IoT-based irrigation system for the university farm using sensors and automation.',
                budget_requested: 'KSh 75,000',
                team_lead: 'AgriTech Squad',
                votes: 12
            },
            {
                id: 'proj3',
                title: 'Student Marketplace App',
                description: 'Mobile app for students to buy, sell, and exchange items within the campus.',
                budget_requested: 'KSh 40,000',
                team_lead: 'Mobile Dev Team',
                votes: 18
            },
            {
                id: 'proj4',
                title: 'Renewable Energy Monitor',
                description: 'System to monitor and optimize solar panel efficiency in university buildings.',
                budget_requested: 'KSh 60,000',
                team_lead: 'Green Energy Group',
                votes: 8
            }
        ]
    },
    {
        id: '3',
        title: 'Club Constitution Amendment',
        description: 'Vote on proposed changes to the club constitution regarding membership requirements and meeting procedures.',
        type: 'decision',
        status: 'upcoming',
        start_date: '2026-02-01T00:00:00Z',
        end_date: '2026-02-03T23:59:59Z',
        total_voters: 150,
        votes_cast: 0,
        voting_type: 'yes_no',
        proposal: {
            title: 'Amendment to Article 3: Membership Requirements',
            description: 'Proposal to allow graduate students and alumni to become voting members of the club.',
            current_text: 'Only undergraduate students enrolled at JKUAT may become voting members.',
            proposed_text: 'Undergraduate students, graduate students, and JKUAT alumni may become voting members.',
            rationale: 'This change will bring valuable experience and continuity to the club while expanding our network.'
        }
    },
    {
        id: '4',
        title: 'Event Planning Committee Selection',
        description: 'Choose members for the annual innovation summit planning committee.',
        type: 'committee',
        status: 'upcoming',
        start_date: '2026-02-10T00:00:00Z',
        end_date: '2026-02-12T23:59:59Z',
        total_voters: 150,
        votes_cast: 0,
        voting_type: 'multiple_choice',
        max_selections: 5,
        committee_info: {
            name: 'Innovation Summit 2026 Planning Committee',
            description: 'Organize the annual innovation summit including speakers, venues, and logistics.',
            commitment: '3 months, 5-10 hours per week',
            positions_available: 5
        },
        candidates: [
            { id: 'cm1', name: 'Alice Wanjiku', course: 'Event Management', year: 3, experience: 'Organized 3 major campus events' },
            { id: 'cm2', name: 'Peter Mwangi', course: 'Business Administration', year: 4, experience: 'Former student council member' },
            { id: 'cm3', name: 'Grace Akinyi', course: 'Marketing', year: 2, experience: 'Social media coordinator for 2 clubs' },
            { id: 'cm4', name: 'David Kiprotich', course: 'Computer Science', year: 3, experience: 'Tech lead for hackathon events' },
            { id: 'cm5', name: 'Sarah Njeri', course: 'Communications', year: 4, experience: 'PR officer for student union' },
            { id: 'cm6', name: 'Michael Ochieng', course: 'Engineering', year: 3, experience: 'Logistics coordinator for tech meetups' }
        ]
    },
    {
        id: '5',
        title: '2025 Executive Elections Results',
        description: 'Results from the previous academic year leadership elections.',
        type: 'leadership',
        status: 'completed',
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-01-10T23:59:59Z',
        total_voters: 142,
        votes_cast: 128,
        results_published: true
    }
];
