// JKUAT Innovation Club - Resources Page Mock Data

class ResourcesMockData {
    constructor() {
        this.init();
    }

    init() {
        console.log('📚 Resources Mock Data initialized');
    }

    // Learning Resources
    getLearningResources() {
        return [
            {
                id: 1,
                title: 'Introduction to Machine Learning',
                description: 'Comprehensive guide to getting started with machine learning concepts and practical applications.',
                type: 'course',
                category: 'Technology',
                difficulty: 'Beginner',
                duration: '6 weeks',
                provider: 'JKUAT Innovation Club',
                rating: 4.8,
                enrollments: 234,
                thumbnail: '/assets/images/ml-course.jpg',
                tags: ['Machine Learning', 'Python', 'Data Science'],
                url: '#',
                isFree: true,
                createdAt: '2024-01-10'
            },
            {
                id: 2,
                title: 'Startup Fundamentals',
                description: 'Learn the basics of starting and running a successful startup from ideation to scaling.',
                type: 'workshop',
                category: 'Entrepreneurship',
                difficulty: 'Intermediate',
                duration: '3 days',
                provider: 'Industry Expert',
                rating: 4.6,
                enrollments: 156,
                thumbnail: '/assets/images/startup-fundamentals.jpg',
                tags: ['Startup', 'Business', 'Entrepreneurship'],
                url: '#',
                isFree: false,
                price: 2500,
                createdAt: '2024-01-08'
            },
            {
                id: 3,
                title: 'Web Development Bootcamp',
                description: 'Full-stack web development course covering HTML, CSS, JavaScript, React, and Node.js.',
                type: 'bootcamp',
                category: 'Technology',
                difficulty: 'Beginner',
                duration: '12 weeks',
                provider: 'Tech Academy',
                rating: 4.9,
                enrollments: 89,
                thumbnail: '/assets/images/web-dev-bootcamp.jpg',
                tags: ['Web Development', 'JavaScript', 'React', 'Node.js'],
                url: '#',
                isFree: true,
                createdAt: '2024-01-05'
            },
            {
                id: 4,
                title: 'Digital Marketing Essentials',
                description: 'Master the fundamentals of digital marketing including SEO, social media, and content marketing.',
                type: 'course',
                category: 'Marketing',
                difficulty: 'Beginner',
                duration: '4 weeks',
                provider: 'Marketing Pro',
                rating: 4.5,
                enrollments: 178,
                thumbnail: '/assets/images/digital-marketing.jpg',
                tags: ['Digital Marketing', 'SEO', 'Social Media'],
                url: '#',
                isFree: false,
                price: 1800,
                createdAt: '2024-01-03'
            }
        ];
    }

    // Resource Categories
    getResourceCategories() {
        return [
            {
                id: 'technology',
                name: 'Technology',
                icon: 'fas fa-laptop-code',
                color: '#3b82f6',
                count: 45,
                description: 'Programming, AI, Web Development, Mobile Apps'
            },
            {
                id: 'entrepreneurship',
                name: 'Entrepreneurship',
                icon: 'fas fa-rocket',
                color: '#10b981',
                count: 32,
                description: 'Startup, Business Planning, Funding, Scaling'
            },
            {
                id: 'design',
                name: 'Design',
                icon: 'fas fa-palette',
                color: '#f59e0b',
                count: 28,
                description: 'UI/UX, Graphic Design, Product Design'
            },
            {
                id: 'marketing',
                name: 'Marketing',
                icon: 'fas fa-bullhorn',
                color: '#8b5cf6',
                count: 24,
                description: 'Digital Marketing, Branding, Growth Hacking'
            },
            {
                id: 'finance',
                name: 'Finance',
                icon: 'fas fa-chart-line',
                color: '#ef4444',
                count: 19,
                description: 'Investment, Financial Planning, Accounting'
            },
            {
                id: 'leadership',
                name: 'Leadership',
                icon: 'fas fa-users',
                color: '#06b6d4',
                count: 15,
                description: 'Team Management, Communication, Strategy'
            }
        ];
    }

    // Tools and Software
    getToolsAndSoftware() {
        return [
            {
                id: 1,
                name: 'Visual Studio Code',
                description: 'Free source-code editor with support for debugging, syntax highlighting, and extensions.',
                category: 'Development',
                type: 'IDE',
                platform: ['Windows', 'macOS', 'Linux'],
                price: 'Free',
                rating: 4.9,
                website: 'https://code.visualstudio.com',
                logo: '/assets/images/vscode-logo.png',
                tags: ['Code Editor', 'Development', 'Microsoft']
            },
            {
                id: 2,
                name: 'Figma',
                description: 'Collaborative interface design tool for creating user interfaces and prototypes.',
                category: 'Design',
                type: 'Design Tool',
                platform: ['Web', 'Windows', 'macOS'],
                price: 'Freemium',
                rating: 4.8,
                website: 'https://figma.com',
                logo: '/assets/images/figma-logo.png',
                tags: ['UI/UX', 'Design', 'Prototyping']
            },
            {
                id: 3,
                name: 'Notion',
                description: 'All-in-one workspace for notes, tasks, wikis, and databases.',
                category: 'Productivity',
                type: 'Productivity Tool',
                platform: ['Web', 'Windows', 'macOS', 'iOS', 'Android'],
                price: 'Freemium',
                rating: 4.7,
                website: 'https://notion.so',
                logo: '/assets/images/notion-logo.png',
                tags: ['Productivity', 'Notes', 'Organization']
            },
            {
                id: 4,
                name: 'Canva',
                description: 'Graphic design platform for creating social media graphics, presentations, and more.',
                category: 'Design',
                type: 'Design Tool',
                platform: ['Web', 'iOS', 'Android'],
                price: 'Freemium',
                rating: 4.6,
                website: 'https://canva.com',
                logo: '/assets/images/canva-logo.png',
                tags: ['Graphic Design', 'Templates', 'Social Media']
            }
        ];
    }

    // Books and Publications
    getBooksAndPublications() {
        return [
            {
                id: 1,
                title: 'The Lean Startup',
                author: 'Eric Ries',
                description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses',
                category: 'Entrepreneurship',
                type: 'Book',
                rating: 4.7,
                pages: 336,
                publishYear: 2011,
                isbn: '978-0307887894',
                cover: '/assets/images/lean-startup.jpg',
                tags: ['Startup', 'Innovation', 'Business'],
                availability: 'Available in Library'
            },
            {
                id: 2,
                title: 'Clean Code',
                author: 'Robert C. Martin',
                description: 'A Handbook of Agile Software Craftsmanship',
                category: 'Technology',
                type: 'Book',
                rating: 4.8,
                pages: 464,
                publishYear: 2008,
                isbn: '978-0132350884',
                cover: '/assets/images/clean-code.jpg',
                tags: ['Programming', 'Software Development', 'Best Practices'],
                availability: 'Available in Library'
            },
            {
                id: 3,
                title: 'Design of Everyday Things',
                author: 'Don Norman',
                description: 'Revised and Expanded Edition',
                category: 'Design',
                type: 'Book',
                rating: 4.6,
                pages: 368,
                publishYear: 2013,
                isbn: '978-0465050659',
                cover: '/assets/images/design-everyday-things.jpg',
                tags: ['Design', 'UX', 'Psychology'],
                availability: 'Available in Library'
            }
        ];
    }

    // Templates and Downloads
    getTemplatesAndDownloads() {
        return [
            {
                id: 1,
                title: 'Business Plan Template',
                description: 'Comprehensive business plan template for startups and new ventures.',
                category: 'Entrepreneurship',
                type: 'Template',
                format: 'DOCX',
                size: '2.3 MB',
                downloads: 456,
                rating: 4.8,
                thumbnail: '/assets/images/business-plan-template.jpg',
                downloadUrl: '#',
                tags: ['Business Plan', 'Startup', 'Template'],
                createdAt: '2024-01-12'
            },
            {
                id: 2,
                title: 'Pitch Deck Template',
                description: 'Professional pitch deck template for investor presentations.',
                category: 'Entrepreneurship',
                type: 'Template',
                format: 'PPTX',
                size: '5.7 MB',
                downloads: 234,
                rating: 4.7,
                thumbnail: '/assets/images/pitch-deck-template.jpg',
                downloadUrl: '#',
                tags: ['Pitch Deck', 'Presentation', 'Investment'],
                createdAt: '2024-01-10'
            },
            {
                id: 3,
                title: 'UI Kit Components',
                description: 'Modern UI components library for web and mobile applications.',
                category: 'Design',
                type: 'Resource Pack',
                format: 'FIGMA',
                size: '12.4 MB',
                downloads: 189,
                rating: 4.9,
                thumbnail: '/assets/images/ui-kit.jpg',
                downloadUrl: '#',
                tags: ['UI Kit', 'Components', 'Design System'],
                createdAt: '2024-01-08'
            }
        ];
    }

    // Featured Resources
    getFeaturedResources() {
        return [
            {
                id: 1,
                title: 'Innovation Workshop Series',
                description: 'Monthly workshops covering latest trends in technology and entrepreneurship.',
                type: 'Workshop Series',
                status: 'Ongoing',
                nextSession: '2024-02-15',
                participants: 89,
                rating: 4.8,
                image: '/assets/images/innovation-workshop.jpg'
            },
            {
                id: 2,
                title: 'Startup Incubator Program',
                description: '6-month intensive program for early-stage startups with mentorship and funding opportunities.',
                type: 'Program',
                status: 'Applications Open',
                deadline: '2024-02-28',
                participants: 24,
                rating: 4.9,
                image: '/assets/images/incubator-program.jpg'
            },
            {
                id: 3,
                title: 'Tech Talk Series',
                description: 'Weekly talks by industry experts on emerging technologies and career guidance.',
                type: 'Talk Series',
                status: 'Ongoing',
                nextSession: '2024-02-08',
                participants: 156,
                rating: 4.6,
                image: '/assets/images/tech-talks.jpg'
            }
        ];
    }

    // Resource Statistics
    getResourceStats() {
        return {
            totalResources: 234,
            totalDownloads: 12456,
            totalUsers: 1890,
            averageRating: 4.7,
            categoriesCount: 6,
            newThisMonth: 23
        };
    }
}

// Initialize and make available globally
document.addEventListener('DOMContentLoaded', () => {
    window.resourcesMockData = new ResourcesMockData();
    console.log('📚 Resources Mock Data ready');
});

// Export for use in other modules
window.ResourcesMockData = ResourcesMockData;