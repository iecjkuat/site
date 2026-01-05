// CMS Page Mock Data

// Content Management System Mock Data
class CmsMockData {
    static getArticles() {
        return [
            {
                id: 1,
                title: 'JKUAT Innovation Club Launches AI Workshop Series',
                slug: 'ai-workshop-series-launch',
                excerpt: 'The Innovation Club announces a comprehensive AI workshop series designed to introduce students to machine learning fundamentals.',
                content: 'The JKUAT Innovation and Entrepreneurship Club is excited to announce the launch of our comprehensive AI Workshop Series...',
                author: 'Jane Smith',
                authorId: 2,
                category: 'Events',
                tags: ['AI', 'Workshop', 'Machine Learning', 'Education'],
                publishDate: '2025-01-01T10:00:00Z',
                lastModified: '2025-01-01T10:30:00Z',
                status: 'published',
                featured: true,
                views: 245,
                likes: 18,
                comments: 5
            },
            {
                id: 2,
                title: 'Student Startup Wins National Competition',
                slug: 'student-startup-wins-national-competition',
                excerpt: 'A team from our Innovation Club has won first place in the National Student Entrepreneurship Competition.',
                content: 'We are proud to announce that Team InnovateTech, comprising members from our Innovation Club...',
                author: 'John Doe',
                authorId: 1,
                category: 'Achievements',
                tags: ['Startup', 'Competition', 'Entrepreneurship', 'Success'],
                publishDate: '2024-12-28T14:00:00Z',
                lastModified: '2024-12-28T14:15:00Z',
                status: 'published',
                featured: false,
                views: 189,
                likes: 23,
                comments: 8
            },
            {
                id: 3,
                title: 'New Project Collaboration with Tech Industry',
                slug: 'new-project-collaboration-tech-industry',
                excerpt: 'The Innovation Club partners with leading tech companies to provide real-world project opportunities.',
                content: 'We are thrilled to announce new partnerships with several leading technology companies...',
                author: 'Alice Johnson',
                authorId: 3,
                category: 'Partnerships',
                tags: ['Collaboration', 'Industry', 'Projects', 'Partnerships'],
                publishDate: '2024-12-25T16:00:00Z',
                lastModified: '2024-12-25T16:30:00Z',
                status: 'draft',
                featured: false,
                views: 0,
                likes: 0,
                comments: 0
            }
        ];
    }

    static getCategories() {
        return [
            {
                id: 1,
                name: 'Events',
                slug: 'events',
                description: 'Club events, workshops, and activities',
                articleCount: 12,
                color: '#3B82F6'
            },
            {
                id: 2,
                name: 'Achievements',
                slug: 'achievements',
                description: 'Member and club achievements',
                articleCount: 8,
                color: '#10B981'
            },
            {
                id: 3,
                name: 'Partnerships',
                slug: 'partnerships',
                description: 'Industry partnerships and collaborations',
                articleCount: 5,
                color: '#8B5CF6'
            },
            {
                id: 4,
                name: 'Technology',
                slug: 'technology',
                description: 'Tech trends and innovations',
                articleCount: 15,
                color: '#F59E0B'
            },
            {
                id: 5,
                name: 'Entrepreneurship',
                slug: 'entrepreneurship',
                description: 'Startup stories and business insights',
                articleCount: 10,
                color: '#EF4444'
            }
        ];
    }

    static getTags() {
        return [
            { name: 'AI', count: 8 },
            { name: 'Machine Learning', count: 6 },
            { name: 'Workshop', count: 12 },
            { name: 'Startup', count: 9 },
            { name: 'Competition', count: 5 },
            { name: 'Innovation', count: 15 },
            { name: 'Technology', count: 18 },
            { name: 'Entrepreneurship', count: 11 },
            { name: 'Projects', count: 14 },
            { name: 'Collaboration', count: 7 }
        ];
    }

    static getAuthors() {
        return [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@student.jkuat.ac.ke',
                role: 'Editor',
                bio: 'Computer Science student passionate about AI and machine learning.',
                avatar: '/assets/images/avatars/john-doe.jpg',
                articlesCount: 8,
                joinDate: '2024-09-01T00:00:00Z'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@student.jkuat.ac.ke',
                role: 'Chief Editor',
                bio: 'Engineering student and club leader with expertise in project management.',
                avatar: '/assets/images/avatars/jane-smith.jpg',
                articlesCount: 15,
                joinDate: '2024-08-15T00:00:00Z'
            },
            {
                id: 3,
                name: 'Alice Johnson',
                email: 'alice.johnson@student.jkuat.ac.ke',
                role: 'Writer',
                bio: 'Business student focused on entrepreneurship and startup ecosystems.',
                avatar: '/assets/images/avatars/alice-johnson.jpg',
                articlesCount: 6,
                joinDate: '2024-10-01T00:00:00Z'
            }
        ];
    }

    static getComments() {
        return [
            {
                id: 1,
                articleId: 1,
                author: 'Bob Wilson',
                email: 'bob.wilson@student.jkuat.ac.ke',
                content: 'Great initiative! Looking forward to the AI workshops.',
                date: '2025-01-01T12:00:00Z',
                status: 'approved'
            },
            {
                id: 2,
                articleId: 1,
                author: 'Sarah Davis',
                email: 'sarah.davis@student.jkuat.ac.ke',
                content: 'When will registration open for these workshops?',
                date: '2025-01-01T13:30:00Z',
                status: 'approved'
            },
            {
                id: 3,
                articleId: 2,
                author: 'Mike Brown',
                email: 'mike.brown@student.jkuat.ac.ke',
                content: 'Congratulations to Team InnovateTech! Inspiring achievement.',
                date: '2024-12-28T15:00:00Z',
                status: 'approved'
            }
        ];
    }

    static getMediaLibrary() {
        return [
            {
                id: 1,
                filename: 'ai-workshop-banner.jpg',
                originalName: 'AI Workshop Banner.jpg',
                type: 'image',
                size: 245760,
                uploadDate: '2025-01-01T09:00:00Z',
                uploader: 'Jane Smith',
                url: '/assets/images/articles/ai-workshop-banner.jpg',
                alt: 'AI Workshop Series Banner'
            },
            {
                id: 2,
                filename: 'startup-competition-winners.jpg',
                originalName: 'Startup Competition Winners.jpg',
                type: 'image',
                size: 189440,
                uploadDate: '2024-12-28T13:00:00Z',
                uploader: 'John Doe',
                url: '/assets/images/articles/startup-competition-winners.jpg',
                alt: 'National Competition Winners'
            },
            {
                id: 3,
                filename: 'innovation-club-logo.png',
                originalName: 'Innovation Club Logo.png',
                type: 'image',
                size: 45120,
                uploadDate: '2024-12-20T10:00:00Z',
                uploader: 'Admin',
                url: '/assets/images/logo/innovation-club-logo.png',
                alt: 'JKUAT Innovation Club Logo'
            }
        ];
    }

    static getAnalytics() {
        return {
            totalArticles: 25,
            publishedArticles: 22,
            draftArticles: 3,
            totalViews: 5420,
            totalLikes: 234,
            totalComments: 89,
            monthlyViews: [
                { month: 'Dec 2024', views: 1200 },
                { month: 'Jan 2025', views: 1800 }
            ],
            topArticles: [
                { title: 'JKUAT Innovation Club Launches AI Workshop Series', views: 245 },
                { title: 'Student Startup Wins National Competition', views: 189 },
                { title: 'Tech Industry Partnership Announcement', views: 156 }
            ],
            popularCategories: [
                { name: 'Technology', percentage: 35 },
                { name: 'Events', percentage: 28 },
                { name: 'Achievements', percentage: 20 },
                { name: 'Entrepreneurship', percentage: 17 }
            ]
        };
    }
}

// Make available globally
window.CmsMockData = CmsMockData;

console.log('📰 CMS mock data loaded successfully');