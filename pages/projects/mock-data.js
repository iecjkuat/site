// Projects Page - Mock Data

class ProjectsMockData {
    constructor() {
        this.init();
    }

    init() {
        console.log('📊 Initializing ProjectsMockData...');
        console.log('✅ ProjectsMockData initialized');
    }

    // Get sample projects
    getSampleProjects() {
        return [
            {
                id: '1',
                title: 'Smart Campus Navigation App',
                description: 'An AR-powered mobile app that helps students navigate the JKUAT campus using augmented reality overlays and real-time directions.',
                category: 'Innovation',
                status: 'Active',
                progress_percentage: 75,
                technologies: ['React Native', 'ARKit', 'Firebase', 'Google Maps API'],
                project_lead: {
                    name: 'Sarah Wilson',
                    email: 'sarah.wilson@jkuat.ac.ke',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                },
                team_size: 4,
                created_at: '2024-01-15T10:30:00Z',
                expected_completion: '2024-03-15T00:00:00Z',
                budget_estimate: 50000,
                objectives: [
                    'Develop AR navigation system',
                    'Integrate with campus map data',
                    'Test with student volunteers',
                    'Deploy to app stores'
                ]
            },
            {
                id: '2',
                title: 'Sustainable Energy Monitoring System',
                description: 'IoT-based system to monitor and optimize energy consumption in university buildings, promoting sustainability and cost reduction.',
                category: 'Research',
                status: 'Active',
                progress_percentage: 45,
                technologies: ['Arduino', 'Raspberry Pi', 'Python', 'InfluxDB', 'Grafana'],
                project_lead: {
                    name: 'James Mwangi',
                    email: 'james.mwangi@jkuat.ac.ke',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                },
                team_size: 6,
                created_at: '2024-01-08T15:45:00Z',
                expected_completion: '2024-05-20T00:00:00Z',
                budget_estimate: 75000,
                objectives: [
                    'Install IoT sensors in 5 buildings',
                    'Develop data analytics dashboard',
                    'Create energy optimization algorithms',
                    'Present findings to university management'
                ]
            },
            {
                id: '3',
                title: 'Student Marketplace Platform',
                description: 'A peer-to-peer marketplace where students can buy, sell, and exchange textbooks, electronics, and other items within the campus community.',
                category: 'Startup',
                status: 'Active',
                progress_percentage: 60,
                technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API', 'Socket.io'],
                project_lead: {
                    name: 'Grace Muthoni',
                    email: 'grace.muthoni@jkuat.ac.ke',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
                },
                team_size: 5,
                created_at: '2024-01-05T12:20:00Z',
                expected_completion: '2024-04-10T00:00:00Z',
                budget_estimate: 40000,
                objectives: [
                    'Complete user authentication system',
                    'Implement payment processing',
                    'Add messaging system',
                    'Launch beta version'
                ]
            },
            {
                id: '4',
                title: 'Digital Library Management System',
                description: 'Modern library management system with features for book cataloging, student check-outs, digital resources, and analytics.',
                category: 'Innovation',
                status: 'Completed',
                progress_percentage: 100,
                technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'Docker'],
                project_lead: {
                    name: 'Peter Kamau',
                    email: 'peter.kamau@jkuat.ac.ke',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                },
                team_size: 3,
                created_at: '2023-10-01T09:15:00Z',
                expected_completion: '2024-01-15T00:00:00Z',
                budget_estimate: 30000,
                objectives: [
                    'Replace legacy library system',
                    'Digitize book catalog',
                    'Implement student portal',
                    'Train library staff'
                ]
            },
            {
                id: '5',
                title: 'AI-Powered Study Assistant',
                description: 'An intelligent chatbot that helps students with course materials, provides study schedules, and answers academic questions using natural language processing.',
                category: 'Research',
                status: 'Active',
                progress_percentage: 30,
                technologies: ['Python', 'TensorFlow', 'NLTK', 'FastAPI', 'PostgreSQL'],
                project_lead: {
                    name: 'Mary Njeri',
                    email: 'mary.njeri@jkuat.ac.ke',
                    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
                },
                team_size: 4,
                created_at: '2024-01-20T14:30:00Z',
                expected_completion: '2024-06-30T00:00:00Z',
                budget_estimate: 60000,
                objectives: [
                    'Train NLP model on course materials',
                    'Develop chatbot interface',
                    'Integrate with LMS',
                    'Pilot test with students'
                ]
            }
        ];
    }

    // Get sample hackathons
    getSampleHackathons() {
        return [
            {
                id: 'hack_1',
                title: 'JKUAT Innovation Challenge 2025',
                description: 'A 48-hour hackathon focused on developing solutions for sustainable development goals using emerging technologies.',
                theme: 'Sustainability & Innovation',
                start_date: '2025-02-15T09:00:00Z',
                end_date: '2025-02-17T18:00:00Z',
                registration_deadline: '2025-02-10T23:59:59Z',
                max_participants: 200,
                current_participants: 156,
                registration_fee: 500,
                prizes: {
                    first: 'KSh 100,000',
                    second: 'KSh 50,000',
                    third: 'KSh 25,000'
                },
                sponsors: ['Safaricom', 'KCB Bank', 'Microsoft'],
                venue: 'JKUAT Main Campus',
                organizers: ['JKUAT Innovation Club', 'IEEE JKUAT Student Branch']
            },
            {
                id: 'hack_2',
                title: 'FinTech Solutions Hackathon',
                description: 'Build innovative financial technology solutions to address challenges in mobile money, digital banking, and financial inclusion.',
                theme: 'Financial Technology',
                start_date: '2025-03-22T09:00:00Z',
                end_date: '2025-03-24T18:00:00Z',
                registration_deadline: '2025-03-15T23:59:59Z',
                max_participants: 150,
                current_participants: 89,
                registration_fee: 750,
                prizes: {
                    first: 'KSh 150,000',
                    second: 'KSh 75,000',
                    third: 'KSh 40,000'
                },
                sponsors: ['Equity Bank', 'M-Pesa', 'Flutterwave'],
                venue: 'JKUAT Innovation Hub',
                organizers: ['JKUAT Innovation Club', 'FinTech Association Kenya']
            },
            {
                id: 'hack_3',
                title: 'AgriTech Innovation Weekend',
                description: 'Develop technology solutions to modernize agriculture and improve food security in Kenya.',
                theme: 'Agricultural Technology',
                start_date: '2025-04-12T09:00:00Z',
                end_date: '2025-04-14T18:00:00Z',
                registration_deadline: '2025-04-05T23:59:59Z',
                max_participants: 120,
                current_participants: 45,
                registration_fee: 600,
                prizes: {
                    first: 'KSh 80,000',
                    second: 'KSh 40,000',
                    third: 'KSh 20,000'
                },
                sponsors: ['Kenya Agricultural Research Institute', 'Twiga Foods'],
                venue: 'JKUAT Agricultural Campus',
                organizers: ['JKUAT Innovation Club', 'AgriTech Kenya']
            }
        ];
    }

    // Get sample incubation projects
    getSampleIncubationProjects() {
        return [
            {
                id: 'incub_1',
                title: 'EcoWaste Solutions',
                description: 'A startup focused on converting organic waste into biogas and organic fertilizer using innovative biotechnology processes.',
                founder: 'Alice Wanjiku',
                stage: 'Prototype',
                funding: '500,000',
                mentor: 'Dr. John Kiprotich',
                started_date: '2024-01-10T00:00:00Z',
                expected_launch: '2024-06-15T00:00:00Z',
                team_size: 3,
                market_validation: 'Completed',
                business_model: 'B2B Sales & Licensing'
            },
            {
                id: 'incub_2',
                title: 'MediConnect Kenya',
                description: 'A telemedicine platform connecting rural patients with healthcare professionals through mobile technology.',
                founder: 'David Ochieng',
                stage: 'Market Testing',
                funding: '750,000',
                mentor: 'Dr. Sarah Mwangi',
                started_date: '2023-11-15T00:00:00Z',
                expected_launch: '2024-04-30T00:00:00Z',
                team_size: 5,
                market_validation: 'In Progress',
                business_model: 'Subscription & Commission'
            },
            {
                id: 'incub_3',
                title: 'EduTech Learning Platform',
                description: 'An AI-powered personalized learning platform for K-12 students in Kenya, adapting to individual learning styles.',
                founder: 'Catherine Njoki',
                stage: 'Validation',
                funding: '300,000',
                mentor: 'Prof. Michael Waweru',
                started_date: '2024-02-01T00:00:00Z',
                expected_launch: '2024-08-01T00:00:00Z',
                team_size: 4,
                market_validation: 'Starting',
                business_model: 'Freemium & School Licenses'
            },
            {
                id: 'incub_4',
                title: 'Smart Irrigation Systems',
                description: 'IoT-based precision irrigation solutions for small-scale farmers to optimize water usage and crop yields.',
                founder: 'Robert Mwangi',
                stage: 'Pilot Testing',
                funding: '600,000',
                mentor: 'Eng. Grace Akinyi',
                started_date: '2023-12-01T00:00:00Z',
                expected_launch: '2024-05-15T00:00:00Z',
                team_size: 4,
                market_validation: 'Completed',
                business_model: 'Hardware Sales & SaaS'
            }
        ];
    }

    // Mock user data
    getMockUser() {
        return {
            id: 'user_123',
            name: 'John Doe',
            email: 'john.doe@jkuat.ac.ke',
            role: 'student',
            department: 'Computer Science',
            year: '3rd Year',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            joinedDate: '2024-01-15',
            skills: ['JavaScript', 'React', 'Node.js', 'Python'],
            interests: ['Web Development', 'AI/ML', 'Entrepreneurship']
        };
    }

    // Mock notification data
    getMockNotifications() {
        return [
            {
                id: 'notif_1',
                type: 'project_invitation',
                title: 'Project Collaboration Request',
                message: 'Sarah Wilson invited you to collaborate on "Smart Campus Navigation App"',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                read: false,
                actionUrl: '/projects#1'
            },
            {
                id: 'notif_2',
                type: 'hackathon_reminder',
                title: 'Hackathon Registration Reminder',
                message: 'Registration for JKUAT Innovation Challenge 2025 closes in 3 days',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                read: false,
                actionUrl: '/projects#hackathons'
            },
            {
                id: 'notif_3',
                type: 'project_update',
                title: 'Project Status Update',
                message: 'Digital Library Management System has reached 60% completion',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                read: true,
                actionUrl: '/projects#4'
            }
        ];
    }

    // Mock project statistics
    getProjectStats() {
        return {
            totalProjects: 24,
            activeProjects: 12,
            completedProjects: 8,
            incubationProjects: 4,
            totalMembers: 156,
            hackathonsHosted: 6,
            successfulStartups: 3
        };
    }
}

// Initialize immediately and make available globally
console.log('📊 Projects Mock Data initializing...');
window.projectsMockData = new ProjectsMockData();
console.log('✅ Projects Mock Data ready');

// Initialize when DOM is loaded as fallback
document.addEventListener('DOMContentLoaded', () => {
    if (!window.projectsMockData) {
        console.log('📊 Projects Mock Data DOM fallback');
        window.projectsMockData = new ProjectsMockData();
    }
});

// Make available globally
window.ProjectsMockData = ProjectsMockData;