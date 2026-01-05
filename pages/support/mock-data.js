// JKUAT Innovation Club - Support Page Mock Data

class SupportMockData {
    constructor() {
        this.init();
    }

    init() {
        console.log('🆘 Support Mock Data initialized');
    }

    // Get FAQ categories
    getFAQCategories() {
        return [
            {
                id: 'general',
                name: 'General',
                icon: 'fas fa-info-circle',
                color: '#3b82f6',
                count: 12
            },
            {
                id: 'membership',
                name: 'Membership',
                icon: 'fas fa-users',
                color: '#10b981',
                count: 8
            },
            {
                id: 'events',
                name: 'Events',
                icon: 'fas fa-calendar',
                color: '#f59e0b',
                count: 15
            },
            {
                id: 'projects',
                name: 'Projects',
                icon: 'fas fa-lightbulb',
                color: '#8b5cf6',
                count: 10
            },
            {
                id: 'technical',
                name: 'Technical',
                icon: 'fas fa-cog',
                color: '#ef4444',
                count: 6
            },
            {
                id: 'account',
                name: 'Account',
                icon: 'fas fa-user',
                color: '#06b6d4',
                count: 9
            }
        ];
    }

    // Get frequently asked questions
    getFAQs() {
        return [
            {
                id: 1,
                category: 'general',
                question: 'What is the JKUAT Innovation and Entrepreneurship Club?',
                answer: 'The JKUAT Innovation and Entrepreneurship Club is a student-led organization that fosters innovation, creativity, and entrepreneurial thinking among students at Jomo Kenyatta University of Agriculture and Technology. We provide a platform for students to develop their ideas, collaborate on projects, and connect with industry professionals.',
                tags: ['about', 'club', 'mission'],
                views: 234,
                helpful: 45,
                lastUpdated: '2024-01-10T10:30:00Z'
            },
            {
                id: 2,
                category: 'membership',
                question: 'How do I join the Innovation Club?',
                answer: 'Joining is easy! Simply click the "Join Club" button on our website, fill out the registration form with your details, and pay the small membership fee. Once approved, you\'ll receive access to all club resources, events, and opportunities.',
                tags: ['join', 'registration', 'membership'],
                views: 189,
                helpful: 38,
                lastUpdated: '2024-01-08T14:20:00Z'
            },
            {
                id: 3,
                category: 'membership',
                question: 'What are the membership benefits?',
                answer: 'Members enjoy access to exclusive workshops, networking events, mentorship programs, project collaboration opportunities, resource library, career guidance, and priority access to competitions and funding opportunities.',
                tags: ['benefits', 'perks', 'membership'],
                views: 156,
                helpful: 42,
                lastUpdated: '2024-01-05T09:15:00Z'
            },
            {
                id: 4,
                category: 'events',
                question: 'How do I register for events?',
                answer: 'Browse our events page, click on the event you\'re interested in, and click the "Register" button. Some events are free for members, while others may have a small fee. You\'ll receive confirmation and event details via email.',
                tags: ['events', 'registration', 'tickets'],
                views: 203,
                helpful: 51,
                lastUpdated: '2024-01-12T16:45:00Z'
            },
            {
                id: 5,
                category: 'projects',
                question: 'Can I propose my own project idea?',
                answer: 'Absolutely! We encourage members to share their innovative ideas. Visit our Ideas page, submit your proposal with details about the concept, required skills, and timeline. Other members can then join your project as collaborators.',
                tags: ['projects', 'ideas', 'collaboration'],
                views: 178,
                helpful: 33,
                lastUpdated: '2024-01-07T11:30:00Z'
            },
            {
                id: 6,
                category: 'technical',
                question: 'I\'m having trouble accessing my account. What should I do?',
                answer: 'First, try resetting your password using the "Forgot Password" link on the login page. If that doesn\'t work, clear your browser cache and cookies. Still having issues? Contact our technical support team with your registered email address.',
                tags: ['login', 'password', 'account', 'technical'],
                views: 145,
                helpful: 28,
                lastUpdated: '2024-01-09T13:20:00Z'
            },
            {
                id: 7,
                category: 'events',
                question: 'Can I get a refund if I can\'t attend an event?',
                answer: 'Refund policies vary by event. For paid events, you can typically get a full refund if you cancel at least 48 hours before the event. Check the specific event\'s terms and conditions or contact our support team.',
                tags: ['refund', 'cancellation', 'events'],
                views: 134,
                helpful: 25,
                lastUpdated: '2024-01-06T15:10:00Z'
            },
            {
                id: 8,
                category: 'account',
                question: 'How do I update my profile information?',
                answer: 'Log into your account, go to Settings, and click on "Profile Settings". You can update your personal information, skills, interests, and profile picture. Don\'t forget to save your changes!',
                tags: ['profile', 'settings', 'update'],
                views: 167,
                helpful: 31,
                lastUpdated: '2024-01-11T12:40:00Z'
            }
        ];
    }

    // Get support tickets
    getSupportTickets() {
        return [
            {
                id: 'TICK-001',
                subject: 'Unable to access project files',
                category: 'technical',
                priority: 'high',
                status: 'open',
                description: 'I can\'t access the shared project files in our team workspace. Getting a 403 error.',
                submittedBy: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john.doe@student.jkuat.ac.ke'
                },
                assignedTo: {
                    id: 2,
                    name: 'Tech Support Team'
                },
                createdAt: '2024-01-15T09:30:00Z',
                updatedAt: '2024-01-15T10:15:00Z',
                responses: [
                    {
                        id: 1,
                        author: 'Tech Support',
                        message: 'We\'re looking into this issue. Can you please provide your project ID?',
                        timestamp: '2024-01-15T10:15:00Z'
                    }
                ]
            },
            {
                id: 'TICK-002',
                subject: 'Event registration not working',
                category: 'events',
                priority: 'medium',
                status: 'in-progress',
                description: 'The registration button for the AI Workshop is not responding when clicked.',
                submittedBy: {
                    id: 3,
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@student.jkuat.ac.ke'
                },
                assignedTo: {
                    id: 4,
                    name: 'Events Team'
                },
                createdAt: '2024-01-14T14:20:00Z',
                updatedAt: '2024-01-15T08:45:00Z',
                responses: [
                    {
                        id: 2,
                        author: 'Events Team',
                        message: 'Thanks for reporting this. We\'ve identified the issue and are working on a fix.',
                        timestamp: '2024-01-15T08:45:00Z'
                    }
                ]
            }
        ];
    }

    // Get contact information
    getContactInfo() {
        return {
            general: {
                email: 'info@jkuatinnovation.club',
                phone: '+254 700 000 000',
                address: 'JKUAT Main Campus, Kiambu, Kenya',
                hours: 'Monday - Friday: 8:00 AM - 5:00 PM'
            },
            departments: [
                {
                    name: 'Technical Support',
                    email: 'tech@jkuatinnovation.club',
                    description: 'Website issues, account problems, technical difficulties'
                },
                {
                    name: 'Events Team',
                    email: 'events@jkuatinnovation.club',
                    description: 'Event registration, scheduling, workshop inquiries'
                },
                {
                    name: 'Projects Team',
                    email: 'projects@jkuatinnovation.club',
                    description: 'Project collaboration, idea submissions, mentorship'
                },
                {
                    name: 'Membership',
                    email: 'membership@jkuatinnovation.club',
                    description: 'Membership applications, benefits, account management'
                }
            ],
            socialMedia: [
                {
                    platform: 'Facebook',
                    url: 'https://facebook.com/jkuatinnovation',
                    icon: 'fab fa-facebook'
                },
                {
                    platform: 'Twitter',
                    url: 'https://twitter.com/jkuatinnovation',
                    icon: 'fab fa-twitter'
                },
                {
                    platform: 'LinkedIn',
                    url: 'https://linkedin.com/company/jkuat-innovation',
                    icon: 'fab fa-linkedin'
                },
                {
                    platform: 'Instagram',
                    url: 'https://instagram.com/jkuatinnovation',
                    icon: 'fab fa-instagram'
                }
            ]
        };
    }

    // Get help articles
    getHelpArticles() {
        return [
            {
                id: 1,
                title: 'Getting Started Guide',
                description: 'Complete guide for new members to get started with the club',
                category: 'general',
                readTime: '5 min',
                views: 456,
                rating: 4.8,
                lastUpdated: '2024-01-10T10:00:00Z'
            },
            {
                id: 2,
                title: 'How to Submit Project Ideas',
                description: 'Step-by-step guide to proposing and managing project ideas',
                category: 'projects',
                readTime: '3 min',
                views: 234,
                rating: 4.6,
                lastUpdated: '2024-01-08T14:30:00Z'
            },
            {
                id: 3,
                title: 'Event Registration Process',
                description: 'Learn how to register for events and manage your bookings',
                category: 'events',
                readTime: '4 min',
                views: 189,
                rating: 4.7,
                lastUpdated: '2024-01-12T09:15:00Z'
            },
            {
                id: 4,
                title: 'Troubleshooting Common Issues',
                description: 'Solutions to frequently encountered technical problems',
                category: 'technical',
                readTime: '7 min',
                views: 167,
                rating: 4.5,
                lastUpdated: '2024-01-09T16:20:00Z'
            }
        ];
    }

    // Get support statistics
    getSupportStats() {
        return {
            totalTickets: 45,
            openTickets: 12,
            resolvedTickets: 33,
            averageResponseTime: '2.5 hours',
            satisfactionRating: 4.6,
            totalFAQs: 25,
            totalArticles: 18,
            monthlyTickets: 15
        };
    }

    // Get system status
    getSystemStatus() {
        return {
            overall: 'operational',
            services: [
                {
                    name: 'Website',
                    status: 'operational',
                    uptime: '99.9%'
                },
                {
                    name: 'User Authentication',
                    status: 'operational',
                    uptime: '99.8%'
                },
                {
                    name: 'Event Registration',
                    status: 'operational',
                    uptime: '99.7%'
                },
                {
                    name: 'File Storage',
                    status: 'maintenance',
                    uptime: '98.5%'
                },
                {
                    name: 'Email Notifications',
                    status: 'operational',
                    uptime: '99.9%'
                }
            ],
            lastIncident: {
                date: '2024-01-10T15:30:00Z',
                description: 'Brief maintenance window for database optimization',
                duration: '30 minutes',
                resolved: true
            }
        };
    }
}

// Initialize and make available globally
document.addEventListener('DOMContentLoaded', () => {
    window.supportMockData = new SupportMockData();
    console.log('🆘 Support Mock Data ready');
});

// Export for use in other modules
window.SupportMockData = SupportMockData;