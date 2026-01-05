// JKUAT Innovation Club - Ideas Page Mock Data

class IdeasMockData {
    constructor() {
        this.init();
    }

    init() {
        console.log('💡 Ideas Mock Data initialized');
    }

    // Get all ideas
    getIdeas() {
        return [
            {
                id: 1,
                title: 'Smart Campus Navigation App',
                description: 'An AR-powered mobile app that helps students navigate the JKUAT campus using augmented reality overlays and real-time directions.',
                author: {
                    id: 2,
                    name: 'Sarah Johnson',
                    avatar: '/assets/images/avatars/sarah.jpg',
                    role: 'Computer Science Student'
                },
                category: 'Mobile App',
                tags: ['AR', 'Navigation', 'Mobile', 'Campus'],
                status: 'approved', // approved, pending, rejected
                submissionStatus: 'published',
                votes: 45,
                comments: 12,
                views: 234,
                createdAt: '2024-01-10T10:30:00Z',
                updatedAt: '2024-01-15T14:20:00Z',
                approvedAt: '2024-01-11T09:15:00Z',
                approvedBy: 'admin_user',
                difficulty: 'Medium',
                estimatedTime: '3-4 months',
                requiredSkills: ['React Native', 'ARKit/ARCore', 'GPS', 'UI/UX Design'],
                stage: 'Concept',
                isBookmarked: true,
                hasVoted: false
            },
            {
                id: 2,
                title: 'Sustainable Energy Monitoring System',
                description: 'IoT-based system to monitor and optimize energy consumption in university buildings, promoting sustainability and cost reduction.',
                author: {
                    id: 5,
                    name: 'James Wilson',
                    avatar: '/assets/images/avatars/james.jpg',
                    role: 'Engineering Student'
                },
                category: 'IoT',
                tags: ['IoT', 'Sustainability', 'Energy', 'Monitoring'],
                status: 'approved',
                submissionStatus: 'published',
                votes: 38,
                comments: 8,
                views: 189,
                createdAt: '2024-01-08T15:45:00Z',
                updatedAt: '2024-01-14T09:30:00Z',
                approvedAt: '2024-01-09T11:20:00Z',
                approvedBy: 'admin_user',
                difficulty: 'Hard',
                estimatedTime: '6-8 months',
                requiredSkills: ['Arduino/Raspberry Pi', 'Sensors', 'Data Analytics', 'Web Development'],
                stage: 'Prototype',
                isBookmarked: false,
                hasVoted: true
            },
            {
                id: 3,
                title: 'Student Marketplace Platform',
                description: 'A peer-to-peer marketplace where students can buy, sell, and exchange textbooks, electronics, and other items within the campus community.',
                author: {
                    id: 8,
                    name: 'Grace Muthoni',
                    avatar: '/assets/images/avatars/grace.jpg',
                    role: 'Business Student'
                },
                category: 'E-commerce',
                tags: ['Marketplace', 'E-commerce', 'Student', 'Community'],
                status: 'approved',
                submissionStatus: 'published',
                votes: 52,
                comments: 15,
                views: 312,
                createdAt: '2024-01-05T12:20:00Z',
                updatedAt: '2024-01-13T16:45:00Z',
                approvedAt: '2024-01-06T14:30:00Z',
                approvedBy: 'admin_user',
                difficulty: 'Medium',
                estimatedTime: '4-5 months',
                requiredSkills: ['Web Development', 'Database Design', 'Payment Integration', 'UI/UX'],
                stage: 'Concept',
                isBookmarked: true,
                hasVoted: true
            },
            {
                id: 4,
                title: 'AI-Powered Study Assistant',
                description: 'An intelligent chatbot that helps students with course materials, provides study schedules, and answers academic questions using natural language processing.',
                author: {
                    id: 9,
                    name: 'Peter Kamau',
                    avatar: '/assets/images/avatars/peter.jpg',
                    role: 'AI/ML Enthusiast'
                },
                category: 'AI/ML',
                tags: ['AI', 'Chatbot', 'Education', 'NLP'],
                status: 'approved',
                submissionStatus: 'published',
                votes: 67,
                comments: 23,
                views: 445,
                createdAt: '2024-01-02T09:15:00Z',
                updatedAt: '2024-01-12T11:30:00Z',
                approvedAt: '2024-01-03T10:45:00Z',
                approvedBy: 'admin_user',
                difficulty: 'Hard',
                estimatedTime: '5-6 months',
                requiredSkills: ['Python', 'NLP', 'Machine Learning', 'API Development'],
                stage: 'Testing',
                isBookmarked: false,
                hasVoted: false
            },
            {
                id: 5,
                title: 'Campus Event Management System',
                description: 'Comprehensive platform for organizing, promoting, and managing campus events with features for registration, ticketing, and feedback collection.',
                author: {
                    id: 12,
                    name: 'Mary Njeri',
                    avatar: '/assets/images/avatars/mary.jpg',
                    role: 'Event Coordinator'
                },
                category: 'Web Platform',
                tags: ['Events', 'Management', 'Registration', 'Campus'],
                status: 'approved',
                submissionStatus: 'published',
                votes: 29,
                comments: 7,
                views: 156,
                createdAt: '2023-12-28T14:30:00Z',
                updatedAt: '2024-01-11T10:15:00Z',
                approvedAt: '2023-12-29T16:20:00Z',
                approvedBy: 'admin_user',
                difficulty: 'Medium',
                estimatedTime: '3-4 months',
                requiredSkills: ['Full-stack Development', 'Database Design', 'Payment Systems'],
                stage: 'Concept',
                isBookmarked: false,
                hasVoted: false
            }
        ];
    }

    // Get pending ideas (for admin approval)
    getPendingIdeas() {
        return window.pendingIdeas || [
            {
                id: 'pending_1',
                title: 'Virtual Reality Learning Platform',
                description: 'An immersive VR platform for interactive learning experiences in science and engineering subjects.',
                author: {
                    id: 14,
                    name: 'Alex Kiprotich',
                    avatar: '/assets/images/avatars/alex.jpg',
                    role: 'Computer Science Student'
                },
                category: 'Education',
                tags: ['VR', 'Education', 'Interactive', 'Science'],
                status: 'pending',
                submissionStatus: 'pending',
                votes: 0,
                comments: 0,
                views: 0,
                createdAt: '2024-01-16T14:20:00Z',
                submittedAt: '2024-01-16T14:20:00Z',
                submittedBy: 'alex_kiprotich',
                difficulty: 'High',
                estimatedTime: '8-10 months',
                requiredSkills: ['Unity', 'VR Development', '3D Modeling', 'Educational Design'],
                collaborators: [],
                isBookmarked: false,
                hasVoted: false
            },
            {
                id: 'pending_2',
                title: 'Smart Parking System',
                description: 'IoT-based parking management system for the campus with real-time availability tracking and mobile app integration.',
                author: {
                    id: 15,
                    name: 'Diana Wanjiku',
                    avatar: '/assets/images/avatars/diana.jpg',
                    role: 'Engineering Student'
                },
                category: 'IoT',
                tags: ['IoT', 'Parking', 'Smart City', 'Mobile'],
                status: 'pending',
                submissionStatus: 'pending',
                votes: 0,
                comments: 0,
                views: 0,
                createdAt: '2024-01-17T09:30:00Z',
                submittedAt: '2024-01-17T09:30:00Z',
                submittedBy: 'diana_wanjiku',
                difficulty: 'Medium',
                estimatedTime: '4-6 months',
                requiredSkills: ['IoT Sensors', 'Mobile Development', 'Backend APIs', 'Database Design'],
                collaborators: [],
                isBookmarked: false,
                hasVoted: false
            }
        ];
    }

    // Get rejected ideas (for reference)
    getRejectedIdeas() {
        return [
            {
                id: 'rejected_1',
                title: 'Cryptocurrency Mining Farm',
                description: 'Setting up a cryptocurrency mining operation on campus.',
                author: {
                    id: 16,
                    name: 'John Doe',
                    avatar: '/assets/images/avatars/john.jpg',
                    role: 'Student'
                },
                category: 'Technology',
                status: 'rejected',
                submissionStatus: 'rejected',
                rejectedAt: '2024-01-15T10:30:00Z',
                rejectedBy: 'admin_user',
                rejectionReason: 'Not aligned with educational goals and may violate campus energy policies.',
                createdAt: '2024-01-14T16:20:00Z',
                submittedAt: '2024-01-14T16:20:00Z'
            }
        ];
    }

    // Get idea categories
    getCategories() {
        return [
            {
                id: 'mobile-app',
                name: 'Mobile App',
                icon: 'fas fa-mobile-alt',
                color: '#3b82f6',
                count: 12
            },
            {
                id: 'web-platform',
                name: 'Web Platform',
                icon: 'fas fa-globe',
                color: '#10b981',
                count: 18
            },
            {
                id: 'iot',
                name: 'IoT',
                icon: 'fas fa-microchip',
                color: '#f59e0b',
                count: 8
            },
            {
                id: 'ai-ml',
                name: 'AI/ML',
                icon: 'fas fa-brain',
                color: '#8b5cf6',
                count: 15
            },
            {
                id: 'e-commerce',
                name: 'E-commerce',
                icon: 'fas fa-shopping-cart',
                color: '#ef4444',
                count: 6
            },
            {
                id: 'education',
                name: 'Education',
                icon: 'fas fa-graduation-cap',
                color: '#06b6d4',
                count: 11
            },
            {
                id: 'sustainability',
                name: 'Sustainability',
                icon: 'fas fa-leaf',
                color: '#84cc16',
                count: 9
            },
            {
                id: 'other',
                name: 'Other',
                icon: 'fas fa-lightbulb',
                color: '#6b7280',
                count: 5
            }
        ];
    }

    // Get comments for an idea
    getComments(ideaId) {
        const commentsByIdea = {
            1: [
                {
                    id: 1,
                    author: {
                        id: 3,
                        name: 'Mike Chen',
                        avatar: '/assets/images/avatars/mike.jpg',
                        role: 'Computer Science Student'
                    },
                    text: 'This is a brilliant idea! I\'d love to contribute to the development. I have experience with React Native and AR frameworks.',
                    timestamp: '2024-01-12T10:30:00Z',
                    likes: 5,
                    replies: [
                        {
                            id: 2,
                            author: {
                                id: 2,
                                name: 'Sarah Johnson',
                                avatar: '/assets/images/avatars/sarah.jpg',
                                role: 'Computer Science Student'
                            },
                            text: 'That would be amazing, Mike! Let\'s connect and discuss the technical requirements.',
                            timestamp: '2024-01-12T11:15:00Z',
                            likes: 2
                        }
                    ]
                },
                {
                    id: 3,
                    author: {
                        id: 4,
                        name: 'Emily Davis',
                        avatar: '/assets/images/avatars/emily.jpg',
                        role: 'UI/UX Designer'
                    },
                    text: 'I can help with the UI/UX design. This could really improve the campus experience for new students.',
                    timestamp: '2024-01-13T14:20:00Z',
                    likes: 3,
                    replies: []
                },
                {
                    id: 5,
                    author: {
                        id: 7,
                        name: 'David Ochieng',
                        avatar: '/assets/images/avatars/david.jpg',
                        role: 'Engineering Student'
                    },
                    text: 'Have you considered adding indoor navigation as well? The engineering building can be quite confusing for new students.',
                    timestamp: '2024-01-14T16:45:00Z',
                    likes: 7,
                    replies: [
                        {
                            id: 6,
                            author: {
                                id: 2,
                                name: 'Sarah Johnson',
                                avatar: '/assets/images/avatars/sarah.jpg',
                                role: 'Computer Science Student'
                            },
                            text: 'Great suggestion! Indoor navigation using beacons could be a phase 2 feature.',
                            timestamp: '2024-01-14T17:20:00Z',
                            likes: 4
                        }
                    ]
                }
            ],
            2: [
                {
                    id: 4,
                    author: {
                        id: 6,
                        name: 'Lisa Wanjiku',
                        avatar: '/assets/images/avatars/lisa.jpg',
                        role: 'Environmental Science Student'
                    },
                    text: 'Great sustainability focus! Have you considered integrating with existing building management systems?',
                    timestamp: '2024-01-10T09:45:00Z',
                    likes: 4,
                    replies: []
                },
                {
                    id: 7,
                    author: {
                        id: 10,
                        name: 'Robert Mwangi',
                        avatar: '/assets/images/avatars/robert.jpg',
                        role: 'Engineering Student'
                    },
                    text: 'This could save the university thousands in energy costs. I have some experience with IoT sensors if you need help.',
                    timestamp: '2024-01-11T13:30:00Z',
                    likes: 6,
                    replies: [
                        {
                            id: 8,
                            author: {
                                id: 5,
                                name: 'James Wilson',
                                avatar: '/assets/images/avatars/james.jpg',
                                role: 'Engineering Student'
                            },
                            text: 'That would be fantastic, Robert! Let\'s discuss the sensor specifications.',
                            timestamp: '2024-01-11T14:15:00Z',
                            likes: 3
                        }
                    ]
                }
            ],
            3: [
                {
                    id: 9,
                    author: {
                        id: 11,
                        name: 'Catherine Njoki',
                        avatar: '/assets/images/avatars/catherine.jpg',
                        role: 'Business Student'
                    },
                    text: 'This marketplace idea is exactly what we need! I\'ve been looking for affordable textbooks everywhere.',
                    timestamp: '2024-01-07T11:20:00Z',
                    likes: 8,
                    replies: []
                },
                {
                    id: 10,
                    author: {
                        id: 13,
                        name: 'Kevin Mutua',
                        avatar: '/assets/images/avatars/kevin.jpg',
                        role: 'Computer Science Student'
                    },
                    text: 'I can help with the payment integration. Have you thought about mobile money integration for local students?',
                    timestamp: '2024-01-08T15:45:00Z',
                    likes: 5,
                    replies: [
                        {
                            id: 11,
                            author: {
                                id: 8,
                                name: 'Grace Muthoni',
                                avatar: '/assets/images/avatars/grace.jpg',
                                role: 'Business Student'
                            },
                            text: 'Absolutely! M-Pesa integration is definitely on the roadmap.',
                            timestamp: '2024-01-08T16:30:00Z',
                            likes: 4
                        }
                    ]
                }
            ],
            4: [
                {
                    id: 12,
                    author: {
                        id: 14,
                        name: 'Alice Wanjiru',
                        avatar: '/assets/images/avatars/alice.jpg',
                        role: 'AI/ML Student'
                    },
                    text: 'This AI assistant could be a game-changer for students! Have you considered using GPT or similar models?',
                    timestamp: '2024-01-04T12:30:00Z',
                    likes: 9,
                    replies: []
                },
                {
                    id: 13,
                    author: {
                        id: 15,
                        name: 'Samuel Kiprotich',
                        avatar: '/assets/images/avatars/samuel.jpg',
                        role: 'Computer Science Student'
                    },
                    text: 'I\'d love to contribute to the NLP components. This could help so many struggling students.',
                    timestamp: '2024-01-05T09:15:00Z',
                    likes: 6,
                    replies: [
                        {
                            id: 14,
                            author: {
                                id: 9,
                                name: 'Peter Kamau',
                                avatar: '/assets/images/avatars/peter.jpg',
                                role: 'AI/ML Enthusiast'
                            },
                            text: 'That would be great, Samuel! I\'m planning to use a combination of fine-tuned models.',
                            timestamp: '2024-01-05T10:45:00Z',
                            likes: 4
                        }
                    ]
                }
            ],
            5: [
                {
                    id: 15,
                    author: {
                        id: 16,
                        name: 'Nancy Akinyi',
                        avatar: '/assets/images/avatars/nancy.jpg',
                        role: 'Event Management Student'
                    },
                    text: 'This platform would make organizing club events so much easier! Can it handle recurring events?',
                    timestamp: '2024-01-01T14:20:00Z',
                    likes: 4,
                    replies: [
                        {
                            id: 16,
                            author: {
                                id: 12,
                                name: 'Mary Njeri',
                                avatar: '/assets/images/avatars/mary.jpg',
                                role: 'Event Coordinator'
                            },
                            text: 'Yes! Recurring events and automated reminders are key features I\'m planning.',
                            timestamp: '2024-01-01T15:30:00Z',
                            likes: 3
                        }
                    ]
                }
            ]
        };

        return commentsByIdea[ideaId] || [];
    }

    // Get trending ideas
    getTrendingIdeas() {
        return this.getIdeas()
            .sort((a, b) => (b.votes + b.comments + b.views) - (a.votes + a.comments + a.views))
            .slice(0, 5);
    }

    // Get user's ideas
    getUserIdeas(userId) {
        return this.getIdeas().filter(idea => idea.author.id === userId);
    }

    // Get user's bookmarked ideas
    getBookmarkedIdeas() {
        return this.getIdeas().filter(idea => idea.isBookmarked);
    }

    // Get ideas by status
    getIdeasByStatus(status) {
        return this.getIdeas().filter(idea => idea.status === status);
    }

    // Get ideas by category
    getIdeasByCategory(category) {
        return this.getIdeas().filter(idea => 
            idea.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === category
        );
    }

    // Get idea statistics
    getIdeaStats() {
        const ideas = this.getIdeas();
        return {
            totalIdeas: ideas.length,
            openIdeas: ideas.filter(i => i.status === 'open').length,
            inProgressIdeas: ideas.filter(i => i.status === 'in-progress').length,
            completedIdeas: ideas.filter(i => i.status === 'completed').length,
            totalVotes: ideas.reduce((sum, i) => sum + i.votes, 0),
            totalComments: ideas.reduce((sum, i) => sum + i.comments, 0),
            totalViews: ideas.reduce((sum, i) => sum + i.views, 0),
            activeCollaborators: 25
        };
    }

    // Get popular tags
    getPopularTags() {
        const ideas = this.getIdeas();
        const tagCounts = {};
        
        ideas.forEach(idea => {
            idea.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }
}

// Initialize and make available globally immediately
window.ideasMockData = new IdeasMockData();
console.log('💡 Ideas Mock Data ready');

// Also initialize on DOMContentLoaded for compatibility
document.addEventListener('DOMContentLoaded', () => {
    if (!window.ideasMockData) {
        window.ideasMockData = new IdeasMockData();
        console.log('💡 Ideas Mock Data ready (fallback)');
    }
});

// Export for use in other modules
window.IdeasMockData = IdeasMockData;