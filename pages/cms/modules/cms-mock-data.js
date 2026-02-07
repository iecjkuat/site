/**
 * CMS Mock Data Module
 * Provides fallback data for development and testing
 * Production will use real API data
 */

export class CMSMockData {
    static articles = [
        {
            id: 'mock-article-1',
            title: 'Innovation Workshop: Building the Future',
            description: 'Join us for an intensive workshop on innovation methodologies and design thinking. Learn how to transform ideas into viable products.',
            content: '<p>Detailed content about the innovation workshop...</p>',
            author: 'John Doe',
            author_id: 'user-1',
            category: 'Workshop',
            status: 'published',
            tags: ['innovation', 'workshop', 'design-thinking'],
            banner_image: null,
            views_count: 245,
            likes_count: 34,
            comments_count: 12,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-article-2',
            title: 'Startup Success Stories from JKUAT',
            description: 'Discover how JKUAT alumni are making waves in the startup ecosystem with innovative solutions to real-world problems.',
            content: '<p>Success stories content...</p>',
            author: 'Jane Smith',
            author_id: 'user-2',
            category: 'Success Story',
            status: 'published',
            tags: ['startup', 'entrepreneurship', 'alumni'],
            banner_image: null,
            views_count: 512,
            likes_count: 67,
            comments_count: 23,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-article-3',
            title: 'Tech Trends 2026: What to Watch',
            description: 'An analysis of emerging technologies and trends that will shape the innovation landscape in 2026.',
            content: '<p>Tech trends analysis...</p>',
            author: 'Mike Johnson',
            author_id: 'user-3',
            category: 'Technology',
            status: 'draft',
            tags: ['technology', 'trends', 'future'],
            banner_image: null,
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            published_at: null
        }
    ];

    static events = [
        {
            id: 'mock-event-1',
            title: 'Annual Innovation Summit 2026',
            description: 'The biggest innovation event of the year featuring keynote speakers, workshops, and networking opportunities.',
            event_type: 'conference',
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'JKUAT Main Campus',
            venue_details: 'Conference Hall A',
            is_virtual: false,
            registration_required: true,
            registration_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            max_attendees: 500,
            current_attendees: 234,
            fee: 1000,
            currency: 'KES',
            status: 'upcoming',
            banner_image: null,
            tags: ['innovation', 'summit', 'networking'],
            likes_count: 156,
            comments_count: 0,
            shares_count: 45,
            created_by: 'user-1',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-event-2',
            title: 'Hackathon: Code for Change',
            description: '48-hour hackathon focused on creating solutions for social impact. Form teams and build something amazing!',
            event_type: 'hackathon',
            start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Innovation Lab',
            venue_details: 'Building C, 3rd Floor',
            is_virtual: false,
            registration_required: true,
            registration_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            max_attendees: 100,
            current_attendees: 67,
            fee: 0,
            currency: 'KES',
            status: 'upcoming',
            banner_image: null,
            tags: ['hackathon', 'coding', 'social-impact'],
            likes_count: 124,
            comments_count: 0,
            shares_count: 28,
            created_by: 'user-2',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-event-3',
            title: 'Blockchain Workshop',
            description: 'Learn the fundamentals of blockchain technology and smart contracts in this hands-on workshop.',
            event_type: 'workshop',
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'JKUAT Blockchain Lab',
            venue_details: 'Tech Building, Room 301',
            is_virtual: false,
            registration_required: true,
            registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            max_attendees: 50,
            current_attendees: 42,
            fee: 500,
            currency: 'KES',
            status: 'active',
            banner_image: null,
            tags: ['blockchain', 'workshop', 'technology'],
            likes_count: 42,
            comments_count: 0,
            shares_count: 12,
            created_by: 'user-1',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    static projects = [
        {
            id: 'mock-project-1',
            title: 'Smart Agriculture Platform',
            description: 'IoT-based platform for monitoring soil conditions, weather patterns, and crop health to optimize farming practices.',
            category: 'Agriculture',
            status: 'active',
            project_type: 'innovation',
            project_lead_id: 'user-1',
            project_lead: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
            team_size: 5,
            progress_percentage: 65,
            is_incubation: true,
            incubation_stage: 'development',
            technologies: ['IoT', 'React', 'Node.js', 'MongoDB', 'Arduino'],
            demo_url: null,
            repository_url: 'https://github.com/example/smart-agri',
            likes_count: 45,
            views_count: 234,
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-project-2',
            title: 'EduConnect: Learning Management System',
            description: 'Modern LMS designed for African universities with offline capabilities and mobile-first approach.',
            category: 'Education',
            status: 'active',
            project_type: 'startup',
            project_lead_id: 'user-2',
            project_lead: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
            team_size: 8,
            progress_percentage: 80,
            is_incubation: true,
            incubation_stage: 'launch',
            technologies: ['React Native', 'Django', 'PostgreSQL', 'Redis'],
            demo_url: 'https://educonnect-demo.com',
            repository_url: null,
            likes_count: 78,
            views_count: 456,
            created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-project-3',
            title: 'Smart Campus Navigation App',
            description: 'An AR-powered mobile app that helps students navigate the JKUAT campus using augmented reality overlays and real-time directions.',
            category: 'Technology',
            status: 'active',
            project_type: 'innovation',
            project_lead_id: 'user-3',
            project_lead: { id: 'user-3', name: 'Sarah Wilson', email: 'sarah@example.com' },
            team_size: 4,
            progress_percentage: 45,
            is_incubation: false,
            incubation_stage: 'ideation',
            technologies: ['React Native', 'ARKit', 'Firebase', 'Google Maps'],
            demo_url: null,
            repository_url: 'https://github.com/example/campus-nav',
            likes_count: 92,
            views_count: 312,
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-project-4',
            title: 'Sustainable Energy Monitoring System',
            description: 'IoT-based system to monitor and optimize energy consumption in university buildings, promoting sustainability and cost reduction.',
            category: 'Environment',
            status: 'planning',
            project_type: 'research',
            project_lead_id: 'user-4',
            project_lead: { id: 'user-4', name: 'James Mwangi', email: 'james@example.com' },
            team_size: 6,
            progress_percentage: 25,
            is_incubation: true,
            incubation_stage: 'validation',
            technologies: ['Arduino', 'Raspberry Pi', 'Python', 'InfluxDB', 'Grafana'],
            demo_url: null,
            repository_url: null,
            likes_count: 67,
            views_count: 189,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-project-5',
            title: 'Student Marketplace Platform',
            description: 'A peer-to-peer marketplace where students can buy, sell, and exchange textbooks, electronics, and other items within the campus community.',
            category: 'E-commerce',
            status: 'active',
            project_type: 'startup',
            project_lead_id: 'user-5',
            project_lead: { id: 'user-5', name: 'Grace Muthoni', email: 'grace@example.com' },
            team_size: 5,
            progress_percentage: 70,
            is_incubation: true,
            incubation_stage: 'development',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
            demo_url: 'https://student-marketplace-demo.com',
            repository_url: null,
            likes_count: 134,
            views_count: 567,
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    static opportunities = [
        {
            id: 'mock-opp-1',
            title: 'Software Engineering Internship',
            description: 'Join our team as a software engineering intern and work on real-world projects with cutting-edge technologies.',
            opportunity_type: 'internship',
            organization: 'TechCorp Kenya',
            organization_logo: null,
            location: 'Nairobi, Kenya',
            is_remote: true,
            application_url: 'https://techcorp.ke/careers',
            application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            requirements: ['Computer Science student', 'JavaScript/Python knowledge', 'Problem-solving skills'],
            eligibility: ['Currently enrolled in university', 'Available for 3-6 months'],
            benefits: ['Stipend provided', 'Mentorship', 'Certificate'],
            status: 'active',
            is_featured: true,
            category_id: 'cat-1',
            category: { name: 'Technology', icon: 'laptop', color: '#3B82F6' },
            views_count: 345,
            applications_count: 23,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-opp-2',
            title: 'Innovation Challenge Grant',
            description: 'Apply for funding to develop your innovative idea. Grants up to KSh 500,000 available for selected projects.',
            opportunity_type: 'grant',
            organization: 'Kenya Innovation Fund',
            organization_logo: null,
            location: 'Kenya',
            is_remote: true,
            application_url: 'https://innovationfund.ke/apply',
            application_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            requirements: ['Innovative project idea', 'Team of 2-5 members', 'Detailed proposal'],
            eligibility: ['Kenyan citizen', 'Age 18-35', 'Registered business or student'],
            benefits: ['Up to KSh 500,000', 'Mentorship', 'Networking'],
            status: 'active',
            is_featured: true,
            category_id: 'cat-2',
            category: { name: 'Innovation', icon: 'lightbulb', color: '#F59E0B' },
            views_count: 567,
            applications_count: 45,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    static ideas = [
        {
            id: 'mock-idea-1',
            title: 'Mobile App for Waste Management',
            description: 'A mobile application that connects households with waste collectors and recycling centers, promoting proper waste disposal.',
            problem_statement: 'Poor waste management in urban areas leads to environmental pollution',
            proposed_solution: 'Mobile platform connecting all stakeholders in waste management',
            category_id: 'cat-env',
            category: 'Environment',
            status: 'approved',
            market_potential: 'high',
            feasibility: 'high',
            innovation_level: 'moderate',
            looking_for_team: true,
            votes_count: 45,
            likes_count: 67,
            comments_count: 12,
            created_by: 'user-1',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-idea-2',
            title: 'AI-Powered Study Assistant',
            description: 'An AI assistant that helps students with personalized study plans, practice questions, and progress tracking.',
            problem_statement: 'Students struggle with effective study planning and time management',
            proposed_solution: 'AI-powered platform that adapts to individual learning styles',
            category_id: 'cat-edu',
            category: 'Education',
            status: 'under_review',
            market_potential: 'very_high',
            feasibility: 'medium',
            innovation_level: 'breakthrough',
            looking_for_team: true,
            votes_count: 89,
            likes_count: 123,
            comments_count: 34,
            created_by: 'user-2',
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    static challenges = [
        {
            id: 'mock-challenge-1',
            title: 'Climate Change Solutions Challenge',
            description: 'Develop innovative solutions to combat climate change and promote environmental sustainability in Kenya.',
            category: 'Environment',
            status: 'active',
            start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
            prize: 'KSh 100,000',
            participants_count: 45,
            submissions_count: 12,
            creator_name: 'Innovation Hub',
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-challenge-2',
            title: 'HealthTech Innovation Challenge',
            description: 'Create technology solutions to improve healthcare delivery and accessibility in rural areas.',
            category: 'Healthcare',
            status: 'active',
            start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
            prize: 'KSh 150,000',
            participants_count: 67,
            submissions_count: 8,
            creator_name: 'Health Ministry',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    static members = [
        {
            id: 'mock-member-1',
            name: 'John Doe',
            email: 'john.doe@student.jkuat.ac.ke',
            registration_number: 'ENG01-0001/2023',
            course: 'Computer Science',
            year_of_study: 3,
            college: 'Engineering',
            role: 'executive',
            membership_status: 'active',
            profile_picture: null,
            events_attended: 12,
            projects_count: 3,
            created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-member-2',
            name: 'Jane Smith',
            email: 'jane.smith@student.jkuat.ac.ke',
            registration_number: 'ENG01-0002/2023',
            course: 'Software Engineering',
            year_of_study: 4,
            college: 'Engineering',
            role: 'member',
            membership_status: 'active',
            profile_picture: null,
            events_attended: 8,
            projects_count: 2,
            created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-member-3',
            name: 'Mike Johnson',
            email: 'mike.j@student.jkuat.ac.ke',
            registration_number: 'ENG01-0003/2024',
            course: 'Information Technology',
            year_of_study: 2,
            college: 'Engineering',
            role: 'member',
            membership_status: 'active',
            profile_picture: null,
            events_attended: 5,
            projects_count: 1,
            created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    static communications = [
        {
            id: 'mock-comm-1',
            title: 'Welcome to Innovation Club 2026',
            type: 'announcement',
            priority: 'high',
            content: 'Welcome all new members! We are excited to have you join our community of innovators.',
            recipients_count: 234,
            opened_count: 189,
            sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'mock-comm-2',
            title: 'Upcoming Events This Month',
            type: 'newsletter',
            priority: 'medium',
            content: 'Check out the exciting events we have planned for this month...',
            recipients_count: 234,
            opened_count: 156,
            sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    /**
     * Get mock data with optional filtering
     */
    static get(type, filters = {}) {
        const data = this[type] || [];
        
        // Apply basic filtering if provided
        if (filters.status) {
            return data.filter(item => item.status === filters.status);
        }
        
        if (filters.limit) {
            return data.slice(0, filters.limit);
        }
        
        return data;
    }

    /**
     * Check if we should use mock data
     * Returns true in development or when FORCE_MOCK_DATA is set
     */
    static shouldUseMockData() {
        // Check for explicit flag
        if (localStorage.getItem('FORCE_MOCK_DATA') === 'true') {
            return true;
        }
        
        // Use mock data in development (localhost)
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
        
        return isDev;
    }

    /**
     * Merge real data with mock data (fallback)
     * If real data is empty or fails, use mock data
     */
    static mergeWithRealData(realData, mockType) {
        // If we have real data and it's not empty, use it
        if (realData && Array.isArray(realData) && realData.length > 0) {
            console.log(`✅ Using real ${mockType} data (${realData.length} items)`);
            return realData;
        }
        
        // Otherwise, fall back to mock data
        const mockData = this.get(mockType);
        console.log(`⚠️ Using mock ${mockType} data (${mockData.length} items) - real data unavailable`);
        return mockData;
    }
}

// Helper to enable/disable mock data
window.enableMockData = () => {
    localStorage.setItem('FORCE_MOCK_DATA', 'true');
    console.log('✅ Mock data enabled. Refresh the page.');
};

window.disableMockData = () => {
    localStorage.removeItem('FORCE_MOCK_DATA');
    console.log('✅ Mock data disabled. Refresh the page.');
};

console.log('📦 Mock data module loaded. Use window.enableMockData() or window.disableMockData() to toggle.');
