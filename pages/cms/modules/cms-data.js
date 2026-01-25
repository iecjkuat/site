/**
 * CMS Data Module
 * Handles all data operations, mock data, and CRUD functionality
 */

import { CMSSupabase } from './cms-supabase.js';

export class CMSData {
    // Mock data for demonstration
    static mockArticles = [
        {
            id: '1',
            title: 'JKUAT Innovation Club Launches New Tech Incubator Program',
            category: 'news',
            status: 'published',
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            author_name: 'Dr. Sarah Kimani',
            author_id: 'admin1',
            content: '<p>We are excited to announce the launch of our new Tech Incubator Program, designed to support student entrepreneurs in developing innovative solutions to real-world problems.</p><p>The program will provide mentorship, funding opportunities, and access to state-of-the-art facilities.</p>',
            featured_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            tags: ['innovation', 'incubator', 'entrepreneurship', 'technology'],
            views: 1247,
            likes: 89
        },
        {
            id: '2',
            title: 'Student Team Wins National Hackathon with AI-Powered Agriculture Solution',
            category: 'achievements',
            status: 'published',
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            author_name: 'Prof. Michael Wanjiku',
            author_id: 'admin2',
            content: '<p>Our talented team of computer science students has won first place at the National Innovation Hackathon with their groundbreaking AI solution for precision agriculture.</p><p>The solution uses machine learning to optimize crop yields and reduce water consumption by up to 40%.</p>',
            featured_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
            tags: ['hackathon', 'AI', 'agriculture', 'students', 'award'],
            views: 2156,
            likes: 203
        },
        {
            id: '3',
            title: 'How to Build Your First Mobile App: A Beginner\'s Guide',
            category: 'tutorials',
            status: 'published',
            created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
            author_name: 'James Mwangi',
            author_id: 'content1',
            content: '<p>Starting your mobile app development journey can be overwhelming. This comprehensive guide will walk you through the essential steps to create your first mobile application.</p><h3>Getting Started</h3><p>First, choose your development platform...</p>',
            featured_image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
            tags: ['tutorial', 'mobile', 'development', 'beginner'],
            views: 892,
            likes: 67
        },
        {
            id: '4',
            title: 'Partnership Announcement: JKUAT Innovation Club x TechCorp Kenya',
            category: 'news',
            status: 'published',
            created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            author_name: 'Dr. Sarah Kimani',
            author_id: 'admin1',
            content: '<p>We are thrilled to announce our strategic partnership with TechCorp Kenya, one of the leading technology companies in East Africa.</p><p>This partnership will provide our members with internship opportunities, mentorship programs, and access to cutting-edge technology.</p>',
            featured_image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
            tags: ['partnership', 'internship', 'mentorship', 'technology'],
            views: 1543,
            likes: 124
        },
        {
            id: '5',
            title: 'Upcoming Workshop: Introduction to Machine Learning with Python',
            category: 'events',
            status: 'draft',
            created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            author_name: 'Alice Wanjiru',
            author_id: 'content2',
            content: '<p>Join us for an intensive workshop on machine learning fundamentals using Python. Perfect for beginners and intermediate programmers.</p><p>Topics covered: Data preprocessing, supervised learning, model evaluation, and practical projects.</p>',
            featured_image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
            tags: ['workshop', 'machine learning', 'python', 'programming'],
            views: 234,
            likes: 18
        }
    ];

    static mockEvents = [
        {
            id: '1',
            title: 'Annual Innovation Showcase 2026',
            type: 'conference',
            status: 'published',
            start_date: new Date(Date.now() + 21 * 86400000).toISOString(),
            end_date: new Date(Date.now() + 21 * 86400000 + 8 * 3600000).toISOString(),
            location: 'JKUAT Main Auditorium',
            description: '<p>Join us for our biggest event of the year! Students will showcase their innovative projects, compete for prizes, and network with industry professionals.</p><p>Featured speakers include tech leaders from major companies and successful alumni entrepreneurs.</p>',
            max_participants: 500,
            registration_fee: 0,
            requires_registration: true,
            banner_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            tags: ['showcase', 'innovation', 'networking', 'competition'],
            registered_count: 287,
            created_by: 'admin1',
            created_at: new Date(Date.now() - 14 * 86400000).toISOString()
        },
        {
            id: '2',
            title: 'Web Development Bootcamp - React & Node.js',
            type: 'workshop',
            status: 'published',
            start_date: new Date(Date.now() + 7 * 86400000).toISOString(),
            end_date: new Date(Date.now() + 9 * 86400000).toISOString(),
            location: 'Computer Lab 3, ICT Building',
            description: '<p>Intensive 3-day bootcamp covering modern web development with React and Node.js. Build a complete full-stack application from scratch.</p><p>Prerequisites: Basic JavaScript knowledge. Laptops required.</p>',
            max_participants: 30,
            registration_fee: 2000,
            requires_registration: true,
            banner_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
            tags: ['bootcamp', 'web development', 'react', 'nodejs'],
            registered_count: 28,
            created_by: 'content1',
            created_at: new Date(Date.now() - 10 * 86400000).toISOString()
        },
        {
            id: '3',
            title: 'AI Ethics Panel Discussion',
            type: 'seminar',
            status: 'published',
            start_date: new Date(Date.now() + 14 * 86400000).toISOString(),
            end_date: new Date(Date.now() + 14 * 86400000 + 2 * 3600000).toISOString(),
            location: 'Virtual Event (Zoom)',
            description: '<p>Join leading experts in AI and ethics for a thought-provoking discussion on the responsible development and deployment of artificial intelligence.</p><p>Topics include bias in AI, privacy concerns, and the future of AI governance.</p>',
            max_participants: 200,
            registration_fee: 0,
            requires_registration: true,
            banner_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
            tags: ['AI', 'ethics', 'panel', 'discussion'],
            registered_count: 156,
            created_by: 'admin2',
            created_at: new Date(Date.now() - 7 * 86400000).toISOString()
        }
    ];

    static mockOpportunities = [
        {
            id: '1',
            title: 'Software Engineering Internship - Safaricom PLC',
            type: 'internship',
            company: 'Safaricom PLC',
            location: 'Nairobi, Kenya',
            deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
            description: '<p>Join Kenya\'s leading telecommunications company as a Software Engineering Intern. Work on cutting-edge mobile and web applications serving millions of users.</p><p><strong>Requirements:</strong></p><ul><li>Computer Science or related field</li><li>Proficiency in Java, Python, or JavaScript</li><li>Strong problem-solving skills</li></ul>',
            salary: 'KSh 40,000/month',
            application_link: 'https://careers.safaricom.co.ke/internships',
            status: 'published',
            tags: ['internship', 'software', 'mobile', 'telecommunications'],
            applications_count: 234,
            created_by: 'admin1',
            created_at: new Date(Date.now() - 12 * 86400000).toISOString()
        }
    ];

    static mockMedia = [
        {
            id: '1',
            name: 'innovation-showcase-2025.jpg',
            type: 'image/jpeg',
            size: 2456789,
            url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            uploaded_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            uploaded_by: 'admin1',
            tags: ['event', 'showcase', 'innovation']
        }
    ];

    // In-memory storage for new items (simulates database)
    static storage = {
        articles: [...this.mockArticles],
        events: [...this.mockEvents],
        opportunities: [...this.mockOpportunities],
        media: [...this.mockMedia]
    };

    // CRUD Operations
    static async getArticles() {
        try {
            return await CMSSupabase.select('articles', {
                orderBy: { field: 'created_at', ascending: false }
            });
        } catch (error) {
            console.warn('Articles table not found, using mock data');
            return this.storage.articles;
        }
    }

    static async getEvents() {
        try {
            return await CMSSupabase.select('events', {
                orderBy: { field: 'start_date', ascending: false }
            });
        } catch (error) {
            console.warn('Events table not found, using mock data');
            return this.storage.events;
        }
    }

    static async getOpportunities() {
        try {
            return await CMSSupabase.select('opportunities', {
                orderBy: { field: 'created_at', ascending: false }
            });
        } catch (error) {
            console.warn('Opportunities table not found, using mock data');
            return this.storage.opportunities;
        }
    }

    static async getMedia() {
        return this.storage.media;
    }

    static async createArticle(data) {
        const user = window.authManager?.getUser();
        if (!user) throw new Error('User not authenticated');

        const articleData = {
            id: this.generateId(),
            title: data.title,
            content: data.content || data.description,
            category: data.category,
            status: data.status || 'published',
            author_id: user.id,
            author_name: user.name || user.email,
            tags: this.parseTags(data.tags),
            featured_image: data.featured_image || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            views: 0,
            likes: 0
        };

        try {
            const result = await CMSSupabase.insert('articles', articleData);
            return result;
        } catch (error) {
            if (error.message.includes('relation "articles" does not exist')) {
                this.storage.articles.unshift(articleData);
                return [articleData];
            }
            throw error;
        }
    }

    static async createEvent(data) {
        const user = window.authManager?.getUser();
        if (!user) throw new Error('User not authenticated');

        const eventData = {
            id: this.generateId(),
            title: data.title,
            type: data.type,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date || data.start_date,
            location: data.location,
            max_participants: data.max_participants || null,
            registration_fee: parseFloat(data.registration_fee) || 0,
            requires_registration: data.requires_registration === 'true' || data.requires_registration === true,
            status: data.status || 'published',
            tags: this.parseTags(data.tags),
            banner_image: data.banner_image || null,
            created_by: user.id,
            created_at: new Date().toISOString(),
            registered_count: 0
        };

        try {
            const result = await CMSSupabase.insert('events', eventData);
            return result;
        } catch (error) {
            if (error.message.includes('relation "events" does not exist')) {
                this.storage.events.unshift(eventData);
                return [eventData];
            }
            throw error;
        }
    }

    static async createOpportunity(data) {
        const user = window.authManager?.getUser();
        if (!user) throw new Error('User not authenticated');

        const opportunityData = {
            id: this.generateId(),
            title: data.title,
            type: data.type,
            company: data.company,
            location: data.location,
            description: data.description,
            deadline: data.deadline,
            salary: data.salary || null,
            application_link: data.application_link,
            status: data.status || 'published',
            tags: this.parseTags(data.tags),
            created_by: user.id,
            created_at: new Date().toISOString(),
            applications_count: 0
        };

        try {
            const result = await CMSSupabase.insert('opportunities', opportunityData);
            return result;
        } catch (error) {
            if (error.message.includes('relation "opportunities" does not exist')) {
                this.storage.opportunities.unshift(opportunityData);
                return [opportunityData];
            }
            throw error;
        }
    }

    static async updateItem(type, id, updates) {
        updates.updated_at = new Date().toISOString();
        
        try {
            const result = await CMSSupabase.update(type, id, updates);
            return result;
        } catch (error) {
            // Fallback to mock storage
            const index = this.storage[type].findIndex(item => item.id === id);
            if (index > -1) {
                this.storage[type][index] = { ...this.storage[type][index], ...updates };
                return this.storage[type][index];
            }
            throw new Error(`${type} with id ${id} not found`);
        }
    }

    static async deleteItem(type, id) {
        try {
            await CMSSupabase.delete(type, id);
            return true;
        } catch (error) {
            // Fallback to mock storage
            const index = this.storage[type].findIndex(item => item.id === id);
            if (index > -1) {
                this.storage[type].splice(index, 1);
                return true;
            }
            return false;
        }
    }

    // Utility methods
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static parseTags(tagsString) {
        if (!tagsString) return [];
        if (Array.isArray(tagsString)) return tagsString;
        return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    static getStats() {
        return {
            articles: this.storage.articles.length,
            events: this.storage.events.length,
            opportunities: this.storage.opportunities.length,
            media: this.storage.media.length,
            totalViews: this.storage.articles.reduce((sum, article) => sum + (article.views || 0), 0),
            totalApplications: this.storage.opportunities.reduce((sum, opp) => sum + (opp.applications_count || 0), 0),
            totalRegistrations: this.storage.events.reduce((sum, event) => sum + (event.registered_count || 0), 0)
        };
    }

    static getRecentActivity(limit = 5) {
        const allItems = [
            ...this.storage.articles.map(item => ({ ...item, type: 'article', icon: 'newspaper' })),
            ...this.storage.events.map(item => ({ ...item, type: 'event', icon: 'calendar' })),
            ...this.storage.opportunities.map(item => ({ ...item, type: 'opportunity', icon: 'briefcase' }))
        ];

        return allItems
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    }

    static findById(type, id) {
        return this.storage[type].find(item => item.id === id);
    }

    static search(type, query, filters = {}) {
        let items = this.storage[type];

        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            items = items.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.content && item.content.toLowerCase().includes(searchTerm)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                items = items.filter(item => item[key] === value);
            }
        });

        return items;
    }
}