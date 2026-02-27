/**
 * CMS Data Module
 * Handles all data operations with REST API integration and fallback to in-memory mock storage
 * Enhanced with Delta content support and comprehensive security
 */

import { CMSAPI } from './cms-api.js';

export class CMSData {
    static useSupabase = true;

    // Cache
    static cache = new Map();
    static cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // ---------- Cache helpers ----------
    static getCacheKey(type, filters = {}) {
        // stable-ish key (order of keys matters in JSON.stringify, but fine if your filters are consistent)
        return `${type}-${JSON.stringify(filters)}`;
    }

    static getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data;
        return null;
    }

    static setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    static clearCache(pattern = null) {
        if (!pattern) return this.cache.clear();
        for (const key of this.cache.keys()) if (key.includes(pattern)) this.cache.delete(key);
    }

    // ---------- In-memory fallback store ----------
    static storage = {
        articles: [],
        events: [],
        projects: [],
        opportunities: [],
        media: [],
        ideas: [],
        challenges: [],
        messages: [],
        members: []
    };

    // Seed once
    static seedIfEmpty() {
        if (!this.storage.articles.length) this.storage.articles = [...this.mockArticles];
        if (!this.storage.events.length) this.storage.events = [...this.mockEvents];
        if (!this.storage.opportunities.length) this.storage.opportunities = [...this.mockOpportunities];
        if (!this.storage.media.length) this.storage.media = [...this.mockMedia];
        if (!this.storage.ideas.length) this.storage.ideas = [...this.mockIdeas];
        if (!this.storage.challenges.length) this.storage.challenges = [...this.mockChallenges];
        if (!this.storage.messages.length) this.storage.messages = [...this.mockMessages];
        if (!this.storage.members.length) this.storage.members = [...this.mockMembers];
    }
    // ---------- Articles ----------
    static async getArticles(filters = {}) {
        const cacheKey = this.getCacheKey('articles', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Try API first
        try {
            if (this.useSupabase) {
                const data = await CMSAPI.getArticles(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('API getArticles failed, using fallback:', error);
        }

        // Fallback
        this.seedIfEmpty();
        let items = [...this.storage.articles];

        if (filters.status) items = items.filter(a => a.status === filters.status);
        if (filters.category) items = items.filter(a => a.category === filters.category);

        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(a =>
                String(a.title || '').toLowerCase().includes(search) ||
                String(a.content_html || a.content || '').toLowerCase().includes(search)
            );
        }

        if (filters.author_id) items = items.filter(a => a.author_id === filters.author_id);
        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }

    static async createArticle(data) {
        // data can include:
        // - content_delta (preferred) OR content/content_html (legacy)
        // - title, category, status, featured_image, tags
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.createArticle(data);
                this.clearCache('articles');
                return result;
            }
        } catch (error) {
            console.warn('API createArticle failed, using fallback:', error);
        }

        // Fallback
        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newArticle = {
            id: this.generateId(),
            title: this.safeText(data.title, 200),
            category: this.safeText(data.category, 50),
            status: this.normalizeStatus(data.status),
            featured_image: window.CMSSecurity?.toSafeHttpUrl?.(data.featured_image) || null,
            tags: this.safeTags(data.tags),

            // Prefer Delta if provided
            content_delta: this.safeDelta(data.content_delta),

            // Keep html in fallback for preview, but be aware: sanitize when rendering
            content_html: this.safeText(data.content_html ?? data.content ?? '', 200_000),

            author_id: user?.id || null,
            author_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown Author'),

            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            views: 0,
            likes: 0
        };

        this.storage.articles.unshift(newArticle);
        this.clearCache('articles');
        return newArticle;
    }
    static async updateArticle(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.updateArticle(id, data);
                this.clearCache('articles');
                return result;
            }
        } catch (error) {
            console.warn('API updateArticle failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.articles.findIndex(a => a.id === id);
        if (idx === -1) throw new Error('Article not found');

        this.storage.articles[idx] = {
            ...this.storage.articles[idx],
            title: this.safeText(data.title, 200),
            category: this.safeText(data.category, 50),
            status: this.normalizeStatus(data.status),
            featured_image: window.CMSSecurity?.toSafeHttpUrl?.(data.featured_image) || this.storage.articles[idx].featured_image,
            tags: data.tags ? this.safeTags(data.tags) : this.storage.articles[idx].tags,
            content_delta: data.content_delta ? this.safeDelta(data.content_delta) : this.storage.articles[idx].content_delta,
            content_html: data.content_html ? this.safeText(data.content_html, 200_000) : this.storage.articles[idx].content_html,
            updated_at: new Date().toISOString()
        };

        this.clearCache('articles');
        return this.storage.articles[idx];
    }

    static async deleteArticle(id) {
        try {
            if (this.useSupabase) {
                await CMSAPI.deleteArticle(id);
                this.clearCache('articles');
                return true;
            }
        } catch (error) {
            console.warn('API deleteArticle failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.articles.findIndex(a => a.id === id);
        if (idx === -1) return false;
        this.storage.articles.splice(idx, 1);
        this.clearCache('articles');
        return true;
    }

    // ---------- Events ----------
    static async getEvents(filters = {}) {
        const cacheKey = this.getCacheKey('events', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('📦 Using cached events:', cached.length);
            return cached;
        }

        try {
            if (this.useSupabase) {
                console.log('🔄 Calling CMSAPI.getEvents...');
                const data = await CMSAPI.getEvents(filters);
                console.log('✅ CMSAPI returned:', data.length, 'events');
                
                if (data && data.length > 0) {
                    console.log('📝 Sample event from API:', data[0]);
                }
                
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.error('❌ API getEvents failed:', error);
            throw error; // Don't fall back to mock data
        }

        throw new Error('Supabase is disabled or API call failed');
    }
    static async createEvent(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.createEvent(data);
                this.clearCache('events');
                return result;
            }
        } catch (error) {
            console.warn('API createEvent failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newEvent = {
            id: this.generateId(),
            title: this.safeText(data.title, 200),
            type: this.safeText(data.type, 50),
            status: this.normalizeStatus(data.status, ['draft', 'published', 'upcoming', 'completed', 'cancelled']),
            start_date: this.normalizeIsoDate(data.start_date),
            end_date: this.normalizeIsoDate(data.end_date) || this.normalizeIsoDate(data.start_date),
            location: this.safeText(data.location, 255),
            max_participants: this.safeNumber(data.max_participants),
            registration_fee: this.safeNumber(data.registration_fee),
            requires_registration: data.requires_registration === true || data.requires_registration === 'true',
            tags: this.safeTags(data.tags),
            banner_image: window.CMSSecurity?.toSafeHttpUrl?.(data.banner_image) || null,
            description_html: this.safeText(data.description_html ?? data.description ?? '', 50_000),

            author_id: user?.id || null,
            author_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown Author'),

            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            participants_count: 0
        };

        this.storage.events.unshift(newEvent);
        this.clearCache('events');
        return newEvent;
    }

    static async updateEvent(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.updateEvent(id, data);
                this.clearCache('events');
                return result;
            }
        } catch (error) {
            console.warn('API updateEvent failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.events.findIndex(e => e.id === id);
        if (idx === -1) throw new Error('Event not found');

        this.storage.events[idx] = {
            ...this.storage.events[idx],
            title: this.safeText(data.title, 200),
            type: this.safeText(data.type, 50),
            status: this.normalizeStatus(data.status, ['draft', 'published', 'upcoming', 'completed', 'cancelled']),
            start_date: data.start_date ? this.normalizeIsoDate(data.start_date) : this.storage.events[idx].start_date,
            end_date: data.end_date ? this.normalizeIsoDate(data.end_date) : this.storage.events[idx].end_date,
            location: this.safeText(data.location, 255),
            max_participants: data.max_participants !== undefined ? this.safeNumber(data.max_participants) : this.storage.events[idx].max_participants,
            registration_fee: data.registration_fee !== undefined ? this.safeNumber(data.registration_fee) : this.storage.events[idx].registration_fee,
            requires_registration: data.requires_registration !== undefined ? (data.requires_registration === true || data.requires_registration === 'true') : this.storage.events[idx].requires_registration,
            tags: data.tags ? this.safeTags(data.tags) : this.storage.events[idx].tags,
            banner_image: data.banner_image ? window.CMSSecurity?.toSafeHttpUrl?.(data.banner_image) : this.storage.events[idx].banner_image,
            description_html: data.description_html ? this.safeText(data.description_html, 50_000) : this.storage.events[idx].description_html,
            updated_at: new Date().toISOString()
        };

        this.clearCache('events');
        return this.storage.events[idx];
    }

    static async deleteEvent(id) {
        try {
            if (this.useSupabase) {
                await CMSAPI.deleteEvent(id);
                this.clearCache('events');
                return true;
            }
        } catch (error) {
            console.warn('API deleteEvent failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.events.findIndex(e => e.id === id);
        if (idx === -1) return false;
        this.storage.events.splice(idx, 1);
        this.clearCache('events');
        return true;
    }
    // ---------- Opportunities ----------
    static async getOpportunities(filters = {}) {
        const cacheKey = this.getCacheKey('opportunities', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSAPI.getOpportunities(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('API getOpportunities failed, using fallback:', error);
        }

        this.seedIfEmpty();
        let items = [...this.storage.opportunities];

        if (filters.status) items = items.filter(o => o.status === filters.status);
        if (filters.type) items = items.filter(o => o.type === filters.type);

        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(o =>
                String(o.title || '').toLowerCase().includes(search) ||
                String(o.company || '').toLowerCase().includes(search) ||
                String(o.description_html || o.description || '').toLowerCase().includes(search)
            );
        }

        if (filters.active) {
            const now = new Date().toISOString();
            items = items.filter(o => String(o.deadline || '') >= now);
        }

        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }

    static async createOpportunity(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.createOpportunity(data);
                this.clearCache('opportunities');
                return result;
            }
        } catch (error) {
            console.warn('API createOpportunity failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newOpp = {
            id: this.generateId(),
            title: this.safeText(data.title, 200),
            type: this.safeText(data.type, 50),
            company: this.safeText(data.company, 255),
            location: this.safeText(data.location, 255),
            deadline: this.normalizeIsoDate(data.deadline),
            salary: this.safeText(data.salary, 100),
            application_link: window.CMSSecurity?.toSafeHttpUrl?.(data.application_link) || '',
            status: this.normalizeStatus(data.status, ['draft', 'published', 'active', 'expired', 'filled']),
            tags: this.safeTags(data.tags),
            description_html: this.safeText(data.description_html ?? data.description ?? '', 50_000),

            author_id: user?.id || null,
            author_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown Author'),

            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: 0
        };

        this.storage.opportunities.unshift(newOpp);
        this.clearCache('opportunities');
        return newOpp;
    }
    static async updateOpportunity(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.updateOpportunity(id, data);
                this.clearCache('opportunities');
                return result;
            }
        } catch (error) {
            console.warn('API updateOpportunity failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.opportunities.findIndex(o => o.id === id);
        if (idx === -1) throw new Error('Opportunity not found');

        this.storage.opportunities[idx] = {
            ...this.storage.opportunities[idx],
            title: this.safeText(data.title, 200),
            type: this.safeText(data.type, 50),
            company: this.safeText(data.company, 255),
            location: this.safeText(data.location, 255),
            deadline: data.deadline ? this.normalizeIsoDate(data.deadline) : this.storage.opportunities[idx].deadline,
            salary: data.salary ? this.safeText(data.salary, 100) : this.storage.opportunities[idx].salary,
            application_link: data.application_link ? window.CMSSecurity?.toSafeHttpUrl?.(data.application_link) : this.storage.opportunities[idx].application_link,
            status: this.normalizeStatus(data.status, ['draft', 'published', 'active', 'expired', 'filled']),
            tags: data.tags ? this.safeTags(data.tags) : this.storage.opportunities[idx].tags,
            description_html: data.description_html ? this.safeText(data.description_html, 50_000) : this.storage.opportunities[idx].description_html,
            updated_at: new Date().toISOString()
        };

        this.clearCache('opportunities');
        return this.storage.opportunities[idx];
    }

    static async deleteOpportunity(id) {
        try {
            if (this.useSupabase) {
                await CMSAPI.deleteOpportunity(id);
                this.clearCache('opportunities');
                return true;
            }
        } catch (error) {
            console.warn('API deleteOpportunity failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.opportunities.findIndex(o => o.id === id);
        if (idx === -1) return false;
        this.storage.opportunities.splice(idx, 1);
        this.clearCache('opportunities');
        return true;
    }

    // ---------- Projects ----------
    static async getProjects(filters = {}) {
        const cacheKey = this.getCacheKey('projects', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSAPI.getProjects(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('API getProjects failed, using fallback:', error);
        }

        this.seedIfEmpty();
        let items = this.storage.projects || [];

        if (filters.status) items = items.filter(p => p.status === filters.status);
        if (filters.category) items = items.filter(p => p.category === filters.category);

        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(p =>
                String(p.title || '').toLowerCase().includes(search) ||
                String(p.description || '').toLowerCase().includes(search)
            );
        }

        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }

    static async createProject(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.createProject(data);
                this.clearCache('projects');
                return result;
            }
        } catch (error) {
            console.warn('API createProject failed, using fallback:', error);
        }

        this.seedIfEmpty();
        if (!this.storage.projects) this.storage.projects = [];
        
        const user = window.authManager?.getUser?.();

        const newProject = {
            id: this.generateId(),
            title: this.safeText(data.title, 200),
            description: this.safeText(data.description, 5000),
            category: this.safeText(data.category, 50),
            status: this.normalizeStatus(data.status, ['draft', 'published', 'active', 'completed', 'archived']),
            tags: this.safeTags(data.tags),
            github_url: data.github_url ? window.CMSSecurity?.toSafeHttpUrl?.(data.github_url) : null,
            demo_url: data.demo_url ? window.CMSSecurity?.toSafeHttpUrl?.(data.demo_url) : null,
            
            author_id: user?.id || null,
            author_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown Author'),
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            views: 0,
            likes: 0
        };

        this.storage.projects.unshift(newProject);
        this.clearCache('projects');
        return newProject;
    }

    static async updateProject(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.updateProject(id, data);
                this.clearCache('projects');
                return result;
            }
        } catch (error) {
            console.warn('API updateProject failed, using fallback:', error);
        }

        this.seedIfEmpty();
        if (!this.storage.projects) this.storage.projects = [];
        
        const idx = this.storage.projects.findIndex(p => p.id === id);
        if (idx === -1) throw new Error('Project not found');

        this.storage.projects[idx] = {
            ...this.storage.projects[idx],
            title: data.title ? this.safeText(data.title, 200) : this.storage.projects[idx].title,
            description: data.description ? this.safeText(data.description, 5000) : this.storage.projects[idx].description,
            category: data.category ? this.safeText(data.category, 50) : this.storage.projects[idx].category,
            status: data.status ? this.normalizeStatus(data.status, ['draft', 'published', 'active', 'completed', 'archived']) : this.storage.projects[idx].status,
            tags: data.tags ? this.safeTags(data.tags) : this.storage.projects[idx].tags,
            github_url: data.github_url ? window.CMSSecurity?.toSafeHttpUrl?.(data.github_url) : this.storage.projects[idx].github_url,
            demo_url: data.demo_url ? window.CMSSecurity?.toSafeHttpUrl?.(data.demo_url) : this.storage.projects[idx].demo_url,
            updated_at: new Date().toISOString()
        };

        this.clearCache('projects');
        return this.storage.projects[idx];
    }

    static async deleteProject(id) {
        try {
            if (this.useSupabase) {
                await CMSAPI.deleteProject(id);
                this.clearCache('projects');
                return true;
            }
        } catch (error) {
            console.warn('API deleteProject failed, using fallback:', error);
        }

        this.seedIfEmpty();
        if (!this.storage.projects) this.storage.projects = [];
        
        const idx = this.storage.projects.findIndex(p => p.id === id);
        if (idx === -1) return false;
        this.storage.projects.splice(idx, 1);
        this.clearCache('projects');
        return true;
    }

    // ---------- Media ----------
    static async getMedia(filters = {}) {
        const cacheKey = this.getCacheKey('media', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSSupabase.getMediaFiles(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('Supabase getMedia failed, using fallback:', error);
        }

        this.seedIfEmpty();
        let items = [...this.storage.media];

        if (filters.type) items = items.filter(m => String(m.type || '').startsWith(filters.type));
        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(m => String(m.name || '').toLowerCase().includes(search));
        }
        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }
    static async uploadMedia(file) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.uploadFile(file);
                this.clearCache('media');
                return result;
            }
        } catch (error) {
            console.warn('Supabase uploadMedia failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newMedia = {
            id: this.generateId(),
            name: this.safeText(file?.name || 'file', 255),
            url: file ? URL.createObjectURL(file) : '',
            size: this.safeNumber(file?.size),
            type: this.safeText(file?.type || '', 100),
            created_at: new Date().toISOString(),
            uploader_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown User'),
            uploaded_by: user?.id || null
        };

        this.storage.media.unshift(newMedia);
        this.clearCache('media');
        return newMedia;
    }

    static async deleteMedia(id) {
        try {
            if (this.useSupabase) {
                await CMSSupabase.deleteMediaFile(id);
                this.clearCache('media');
                return true;
            }
        } catch (error) {
            console.warn('Supabase deleteMedia failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.media.findIndex(m => m.id === id);
        if (idx === -1) return false;
        this.storage.media.splice(idx, 1);
        this.clearCache('media');
        return true;
    }

    // ---------- Ideas ----------
    static async getIdeas(filters = {}) {
        const cacheKey = this.getCacheKey('ideas', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSAPI.getIdeas(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('API getIdeas failed, using fallback:', error);
        }

        this.seedIfEmpty();
        let items = [...this.storage.ideas];

        if (filters.status) items = items.filter(i => i.status === filters.status);
        if (filters.category) items = items.filter(i => i.category === filters.category);

        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(i =>
                String(i.title || '').toLowerCase().includes(search) ||
                String(i.description || '').toLowerCase().includes(search)
            );
        }

        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }

    static async createIdea(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.createIdea(data);
                this.clearCache('ideas');
                return result;
            }
        } catch (error) {
            console.warn('Supabase createIdea failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newIdea = {
            id: this.generateId(),
            title: this.safeText(data.title, 200),
            description: this.safeText(data.description, 5000),
            category: this.safeText(data.category, 50),
            status: this.normalizeStatus(data.status, ['pending', 'approved', 'rejected', 'implemented']),
            tags: this.safeTags(data.tags),
            
            submitter_id: user?.id || null,
            submitter_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Anonymous'),
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            votes: 0,
            comments_count: 0
        };

        this.storage.ideas.unshift(newIdea);
        this.clearCache('ideas');
        return newIdea;
    }

    static async updateIdea(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.updateIdea(id, data);
                this.clearCache('ideas');
                return result;
            }
        } catch (error) {
            console.warn('API updateIdea failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.ideas.findIndex(i => i.id === id);
        if (idx === -1) throw new Error('Idea not found');

        this.storage.ideas[idx] = {
            ...this.storage.ideas[idx],
            title: data.title ? this.safeText(data.title, 200) : this.storage.ideas[idx].title,
            description: data.description ? this.safeText(data.description, 5000) : this.storage.ideas[idx].description,
            category: data.category ? this.safeText(data.category, 50) : this.storage.ideas[idx].category,
            status: data.status ? this.normalizeStatus(data.status, ['pending', 'approved', 'rejected', 'implemented']) : this.storage.ideas[idx].status,
            tags: data.tags ? this.safeTags(data.tags) : this.storage.ideas[idx].tags,
            rejection_reason: data.rejection_reason ? this.safeText(data.rejection_reason, 500) : this.storage.ideas[idx].rejection_reason,
            updated_at: new Date().toISOString()
        };

        this.clearCache('ideas');
        return this.storage.ideas[idx];
    }

    static async deleteIdea(id) {
        try {
            if (this.useSupabase) {
                await CMSAPI.deleteIdea(id);
                this.clearCache('ideas');
                return true;
            }
        } catch (error) {
            console.warn('API deleteIdea failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.ideas.findIndex(i => i.id === id);
        if (idx === -1) return false;
        this.storage.ideas.splice(idx, 1);
        this.clearCache('ideas');
        return true;
    }

    // ---------- Challenges ----------
    static async getChallenges(filters = {}) {
        const cacheKey = this.getCacheKey('challenges', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSSupabase.getChallenges(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('Supabase getChallenges failed, using fallback:', error);
        }

        this.seedIfEmpty();
        let items = [...this.storage.challenges];

        if (filters.status) items = items.filter(c => c.status === filters.status);
        if (filters.category) items = items.filter(c => c.category === filters.category);

        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(c =>
                String(c.title || '').toLowerCase().includes(search) ||
                String(c.description || '').toLowerCase().includes(search)
            );
        }

        if (filters.active) {
            const now = new Date().toISOString();
            items = items.filter(c => String(c.end_date || '') >= now);
        }

        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }

    static async createChallenge(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.createChallenge(data);
                this.clearCache('challenges');
                return result;
            }
        } catch (error) {
            console.warn('Supabase createChallenge failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newChallenge = {
            id: this.generateId(),
            title: this.safeText(data.title, 200),
            description: this.safeText(data.description, 10000),
            category: this.safeText(data.category, 50),
            status: this.normalizeStatus(data.status, ['draft', 'published', 'active', 'completed', 'cancelled']),
            start_date: this.normalizeIsoDate(data.start_date),
            end_date: this.normalizeIsoDate(data.end_date),
            prize: this.safeText(data.prize, 100),
            max_participants: this.safeNumber(data.max_participants),
            tags: this.safeTags(data.tags),
            
            creator_id: user?.id || null,
            creator_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown Creator'),
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            participants_count: 0,
            submissions_count: 0
        };

        this.storage.challenges.unshift(newChallenge);
        this.clearCache('challenges');
        return newChallenge;
    }

    static async updateChallenge(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.updateChallenge(id, data);
                this.clearCache('challenges');
                return result;
            }
        } catch (error) {
            console.warn('Supabase updateChallenge failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.challenges.findIndex(c => c.id === id);
        if (idx === -1) throw new Error('Challenge not found');

        this.storage.challenges[idx] = {
            ...this.storage.challenges[idx],
            title: data.title ? this.safeText(data.title, 200) : this.storage.challenges[idx].title,
            description: data.description ? this.safeText(data.description, 10000) : this.storage.challenges[idx].description,
            category: data.category ? this.safeText(data.category, 50) : this.storage.challenges[idx].category,
            status: data.status ? this.normalizeStatus(data.status, ['draft', 'published', 'active', 'completed', 'cancelled']) : this.storage.challenges[idx].status,
            start_date: data.start_date ? this.normalizeIsoDate(data.start_date) : this.storage.challenges[idx].start_date,
            end_date: data.end_date ? this.normalizeIsoDate(data.end_date) : this.storage.challenges[idx].end_date,
            prize: data.prize ? this.safeText(data.prize, 100) : this.storage.challenges[idx].prize,
            max_participants: data.max_participants !== undefined ? this.safeNumber(data.max_participants) : this.storage.challenges[idx].max_participants,
            tags: data.tags ? this.safeTags(data.tags) : this.storage.challenges[idx].tags,
            updated_at: new Date().toISOString()
        };

        this.clearCache('challenges');
        return this.storage.challenges[idx];
    }

    static async deleteChallenge(id) {
        try {
            if (this.useSupabase) {
                await CMSSupabase.deleteChallenge(id);
                this.clearCache('challenges');
                return true;
            }
        } catch (error) {
            console.warn('Supabase deleteChallenge failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.challenges.findIndex(c => c.id === id);
        if (idx === -1) return false;
        this.storage.challenges.splice(idx, 1);
        this.clearCache('challenges');
        return true;
    }

    // ---------- Messages ----------
    static async getMessages(filters = {}) {
        const cacheKey = this.getCacheKey('messages', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSSupabase.getMessages(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('Supabase getMessages failed, using fallback:', error);
        }

        this.seedIfEmpty();
        let items = [...this.storage.messages];

        if (filters.type) items = items.filter(m => m.type === filters.type);
        if (filters.status) items = items.filter(m => m.status === filters.status);

        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(m =>
                String(m.subject || '').toLowerCase().includes(search) ||
                String(m.content || '').toLowerCase().includes(search)
            );
        }

        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }

    static async sendAnnouncement(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.sendAnnouncement(data);
                this.clearCache('messages');
                return result;
            }
        } catch (error) {
            console.warn('Supabase sendAnnouncement failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newMessage = {
            id: this.generateId(),
            subject: this.safeText(data.subject, 200),
            content: this.safeText(data.content, 10000),
            type: 'announcement',
            priority: this.normalizeStatus(data.priority, ['normal', 'high', 'urgent']),
            recipients: this.safeText(data.recipients, 50),
            method: this.normalizeStatus(data.method, ['notification', 'email', 'both']),
            status: 'sent',
            
            sender_id: user?.id || null,
            sender_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown Sender'),
            
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            recipients_count: this.getRecipientsCount(data.recipients),
            opened_count: 0,
            opened: false
        };

        this.storage.messages.unshift(newMessage);
        this.clearCache('messages');
        return newMessage;
    }

    static async sendMessage(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.sendMessage(data);
                this.clearCache('messages');
                return result;
            }
        } catch (error) {
            console.warn('Supabase sendMessage failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const user = window.authManager?.getUser?.();

        const newMessage = {
            id: this.generateId(),
            subject: this.safeText(data.subject, 200),
            content: this.safeText(data.message, 10000),
            type: data.type || 'direct',
            recipient_id: data.recipient_id,
            status: 'sent',
            
            sender_id: user?.id || null,
            sender_name: (user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : (user?.name || user?.email || 'Unknown Sender'),
            
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            recipients_count: 1,
            opened_count: 0,
            opened: false
        };

        this.storage.messages.unshift(newMessage);
        this.clearCache('messages');
        return newMessage;
    }

    static async resendMessage(id) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.resendMessage(id);
                this.clearCache('messages');
                return result;
            }
        } catch (error) {
            console.warn('Supabase resendMessage failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const message = this.storage.messages.find(m => m.id === id);
        if (!message) throw new Error('Message not found');

        // Create a copy with new timestamp
        const resentMessage = {
            ...message,
            id: this.generateId(),
            sent_at: new Date().toISOString(),
            opened_count: 0,
            opened: false
        };

        this.storage.messages.unshift(resentMessage);
        this.clearCache('messages');
        return resentMessage;
    }

    static async deleteMessage(id) {
        try {
            if (this.useSupabase) {
                await CMSSupabase.deleteMessage(id);
                this.clearCache('messages');
                return true;
            }
        } catch (error) {
            console.warn('Supabase deleteMessage failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.messages.findIndex(m => m.id === id);
        if (idx === -1) return false;
        this.storage.messages.splice(idx, 1);
        this.clearCache('messages');
        return true;
    }

    // ---------- Members ----------
    static async getMembers(filters = {}) {
        const cacheKey = this.getCacheKey('members', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('📦 Using cached members:', cached.length);
            return cached;
        }

        try {
            if (this.useSupabase) {
                console.log('🔄 Calling CMSAPI.getMembers...');
                const data = await CMSAPI.getMembers(filters);
                console.log('✅ CMSAPI returned:', data.length, 'members');
                
                if (data && data.length > 0) {
                    console.log('📝 Sample member from API:', data[0]);
                }
                
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.error('❌ API getMembers failed:', error);
            throw error; // Don't fall back to mock data - throw the error
        }

        // This should never be reached if useSupabase is true
        throw new Error('Supabase is disabled or API call failed');
    }

    static async updateMember(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.updateMember(id, data);
                this.clearCache('members');
                return result;
            }
        } catch (error) {
            console.warn('API updateMember failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.members.findIndex(m => m.id === id);
        if (idx === -1) throw new Error('Member not found');

        this.storage.members[idx] = {
            ...this.storage.members[idx],
            name: data.name ? this.safeText(data.name, 100) : this.storage.members[idx].name,
            email: data.email ? this.safeText(data.email, 255) : this.storage.members[idx].email,
            role: data.role ? this.normalizeStatus(data.role, ['member', 'executive', 'admin']) : this.storage.members[idx].role,
            college: data.college ? this.safeText(data.college, 100) : this.storage.members[idx].college,
            year_of_study: data.year_of_study ? this.safeNumber(data.year_of_study) : this.storage.members[idx].year_of_study,
            phone: data.phone ? this.safeText(data.phone, 20) : this.storage.members[idx].phone,
            bio: data.bio ? this.safeText(data.bio, 500) : this.storage.members[idx].bio,
            updated_at: new Date().toISOString()
        };

        this.clearCache('members');
        return this.storage.members[idx];
    }

    // ---------- Resources ----------
    static async getResources(filters = {}) {
        const cacheKey = this.getCacheKey('resources', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSAPI.getResources(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('API getResources failed:', error);
            throw error;
        }
    }

    static async getResource(id) {
        try {
            if (this.useSupabase) {
                console.log('🔍 Fetching resource with ID:', id);
                const data = await CMSAPI.getResource(id);
                console.log('📦 Raw API response:', data);
                const resource = data.resource || data.data || data;
                console.log('✅ Processed resource:', resource);
                return resource;
            }
        } catch (error) {
            console.warn('API getResource failed:', error);
            throw error;
        }
    }

    static async createResource(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.createResource(data);
                this.clearCache('resources');
                return result;
            }
        } catch (error) {
            console.warn('API createResource failed:', error);
            throw error;
        }
    }

    static async updateResource(id, data) {
        try {
            if (this.useSupabase) {
                const result = await CMSAPI.updateResource(id, data);
                this.clearCache('resources');
                return result;
            }
        } catch (error) {
            console.warn('API updateResource failed:', error);
            throw error;
        }
    }

    static async deleteResource(id) {
        try {
            if (this.useSupabase) {
                await CMSAPI.deleteResource(id);
                this.clearCache('resources');
                return true;
            }
        } catch (error) {
            console.warn('API deleteResource failed:', error);
            throw error;
        }
    }

    // ---------- Utilities ----------
    static generateId() {
        return (window.CMSSecurity?.generateSecureId?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
    }

    static parseTags(tags) {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags;
        return String(tags).split(',').map(t => t.trim()).filter(Boolean);
    }

    static getRecipientsCount(recipients) {
        // Mock recipient counts based on type
        const counts = {
            'all': 150,
            'executives': 12,
            'active': 89,
            'new': 23
        };
        return counts[recipients] || 1;
    }

    // ---------- Input Validation & Normalization ----------
    static normalizeStatus(value, allowed = ['draft', 'published', 'archived']) {
        const v = String(value || '').toLowerCase();
        return allowed.includes(v) ? v : 'draft';
    }

    static normalizeIsoDate(value) {
        const d = new Date(value);
        return Number.isFinite(d.getTime()) ? d.toISOString() : null;
    }

    static safeNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    static safeText(value, max = 5000) {
        if (value === null || value === undefined) return '';
        return String(value).slice(0, max);
    }

    static safeTags(tags) {
        const arr = this.parseTags(tags)
            .map(t => this.safeText(t, 40))
            .filter(Boolean)
            .slice(0, 20);
        // Dedupe tags
        return Array.from(new Set(arr));
    }

    static safeDelta(delta) {
        // Quill Delta should be object with ops array
        if (!delta || typeof delta !== 'object') return null;
        if (!Array.isArray(delta.ops)) return null;
        // Basic size limit
        const json = JSON.stringify(delta);
        if (json.length > 200_000) return null; // ~200KB
        return delta;
    }

    static normalizeType(type) {
        const t = String(type || '').toLowerCase();
        const map = { 
            article: 'articles', 
            event: 'events',
            project: 'projects',
            opportunity: 'opportunities', 
            media_file: 'media', 
            media: 'media',
            idea: 'ideas',
            challenge: 'challenges',
            message: 'messages',
            member: 'members'
        };
        return map[t] || t;
    }

    // ---------- Content Display Helpers ----------
    static getArticleHtml(article) {
        // Preferred: render delta -> html using Quill on the client (safe-ish) OR use sanitized stored html
        if (article?.content_html) return String(article.content_html);
        return '';
    }

    static getArticleDelta(article) {
        return this.safeDelta(article?.content_delta);
    }

    // Safe HTML rendering helper
    static renderSafeHtml(htmlContent, container) {
        if (!container || !htmlContent) return;
        
        // For now, escape HTML to prevent XSS
        // TODO: In production, consider using DOMPurify for rich content rendering
        if (window.CMSSecurity?.escapeHtml) {
            container.innerHTML = window.CMSSecurity.escapeHtml(htmlContent);
        } else {
            container.textContent = htmlContent;
        }
    }

    // Legacy compatibility methods
    static async getStats() {
        if (this.useSupabase) {
            try {
                // Fetch real counts from API
                const [articles, events, opportunities, ideas, members] = await Promise.all([
                    CMSAPI.getArticles().catch(() => []),
                    CMSAPI.getEvents().catch(() => []),
                    CMSAPI.getOpportunities().catch(() => []),
                    CMSAPI.getIdeas().catch(() => []),
                    CMSAPI.getMembers().catch(() => [])
                ]);
                
                return {
                    articles: articles.length,
                    events: events.length,
                    projects: 0, // TODO: Add projects API
                    opportunities: opportunities.length,
                    media: 0, // TODO: Add media API
                    ideas: ideas.length,
                    challenges: 0, // TODO: Add challenges API
                    messages: 0, // TODO: Add messages API
                    members: members.length
                };
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
        
        // Fallback to local storage
        return {
            articles: this.storage.articles.length,
            events: this.storage.events.length,
            projects: (this.storage.projects || []).length,
            opportunities: this.storage.opportunities.length,
            media: this.storage.media.length,
            ideas: this.storage.ideas.length,
            challenges: this.storage.challenges.length,
            messages: this.storage.messages.length,
            members: this.storage.members.length
        };
    }

    static getRecentActivity(limit = 5) {
        const activities = [];
        
        // Add recent articles
        this.storage.articles.slice(0, 2).forEach(article => {
            activities.push({
                id: article.id,
                type: 'article',
                title: article.title,
                action: 'published',
                created_at: article.created_at,
                author: article.author_name,
                icon: 'newspaper'
            });
        });

        // Add recent events
        this.storage.events.slice(0, 2).forEach(event => {
            activities.push({
                id: event.id,
                type: 'event',
                title: event.title,
                action: 'created',
                created_at: event.created_at,
                author: event.author_name,
                icon: 'calendar'
            });
        });

        // Add recent opportunities
        this.storage.opportunities.slice(0, 1).forEach(opportunity => {
            activities.push({
                id: opportunity.id,
                type: 'opportunity',
                title: opportunity.title,
                action: 'posted',
                created_at: opportunity.created_at,
                author: opportunity.author_name,
                icon: 'briefcase'
            });
        });

        // Sort by timestamp and limit
        return activities
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    }

    static findById(type, id) {
        const key = this.normalizeType(type);
        const dataMap = {
            'articles': this.storage.articles,
            'events': this.storage.events,
            'projects': this.storage.projects || [],
            'opportunities': this.storage.opportunities,
            'media': this.storage.media,
            'ideas': this.storage.ideas,
            'challenges': this.storage.challenges,
            'messages': this.storage.messages,
            'members': this.storage.members
        };
        
        const data = dataMap[key];
        return data ? data.find(item => item.id === id) : null;
    }

    static async updateItem(type, id, updates) {
        const key = this.normalizeType(type);
        
        // For members and events, use the API
        if ((key === 'members' || key === 'events') && this.useSupabase) {
            try {
                const endpoint = key === 'members' ? 'users' : 'events';
                console.log(`🔄 Updating ${key} via API:`, id, updates);
                const response = await fetch(`${window.location.origin}/api/v1/admin/${endpoint}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(updates)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `Failed to update ${key}`);
                }
                
                const data = await response.json();
                console.log(`✅ ${key} updated successfully:`, data);
                
                this.clearCache(key);
                return data.event || data.user || data;
            } catch (error) {
                console.error(`❌ Failed to update ${key}:`, error);
                throw error;
            }
        }
        
        // For other types, use local storage
        const dataMap = {
            'articles': this.storage.articles,
            'events': this.storage.events,
            'projects': this.storage.projects || [],
            'opportunities': this.storage.opportunities,
            'media': this.storage.media,
            'ideas': this.storage.ideas,
            'challenges': this.storage.challenges,
            'messages': this.storage.messages,
            'members': this.storage.members
        };
        
        const data = dataMap[key];
        if (data) {
            const index = data.findIndex(item => item.id === id);
            if (index !== -1) {
                data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
                this.clearCache(String(key));
                return data[index];
            }
        }
        return null;
    }

    static async deleteItem(type, id) {
        const key = this.normalizeType(type);
        
        // For members, use the API
        if (key === 'members' && this.useSupabase) {
            try {
                console.log('🗑️ Deleting member via API:', id);
                const response = await fetch(`${window.location.origin}/api/v1/admin/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete member');
                }
                
                console.log('✅ Member deleted successfully');
                this.clearCache('members');
                return true;
            } catch (error) {
                console.error('❌ Failed to delete member:', error);
                throw error;
            }
        }
        
        const deleteMap = {
            'articles': () => this.deleteArticle(id),
            'events': () => this.deleteEvent(id),
            'projects': () => this.deleteProject(id),
            'opportunities': () => this.deleteOpportunity(id),
            'media': () => this.deleteMedia(id),
            'ideas': () => this.deleteIdea(id),
            'challenges': () => this.deleteChallenge(id),
            'messages': () => this.deleteMessage(id)
        };
        
        const deleteFunc = deleteMap[key];
        return deleteFunc ? await deleteFunc() : false;
    }
    // ---------- Mock seed data ----------
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
            content_html: '<p>We are excited to announce the launch of our new Tech Incubator Program, designed to support student entrepreneurs in developing innovative solutions to real-world problems.</p><p>The program will provide mentorship, funding opportunities, and access to state-of-the-art facilities.</p>',
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
            content_html: '<p>Our talented team of computer science students has won first place at the National Innovation Hackathon with their groundbreaking AI solution for precision agriculture.</p><p>The solution uses machine learning to optimize crop yields and reduce water consumption by up to 40%.</p>',
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
            content_html: '<p>Starting your mobile app development journey can be overwhelming. This comprehensive guide will walk you through the essential steps to create your first mobile application.</p><h3>Getting Started</h3><p>First, choose your development platform...</p>',
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
            content_html: '<p>We are thrilled to announce our strategic partnership with TechCorp Kenya, one of the leading technology companies in East Africa.</p><p>This partnership will provide our members with internship opportunities, mentorship programs, and access to cutting-edge technology.</p>',
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
            content_html: '<p>Join us for an intensive workshop on machine learning fundamentals using Python. Perfect for beginners and intermediate programmers.</p><p>Topics covered: Data preprocessing, supervised learning, model evaluation, and practical projects.</p>',
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
            description_html: '<p>Join us for our biggest event of the year! Students will showcase their innovative projects, compete for prizes, and network with industry professionals.</p><p>Featured speakers include tech leaders from major companies and successful alumni entrepreneurs.</p>',
            max_participants: 500,
            registration_fee: 0,
            requires_registration: true,
            banner_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            tags: ['showcase', 'innovation', 'networking', 'competition'],
            participants_count: 287,
            author_name: 'Dr. Sarah Kimani',
            author_id: 'admin1',
            created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 14 * 86400000).toISOString()
        },
        {
            id: '2',
            title: 'Web Development Bootcamp - React & Node.js',
            type: 'workshop',
            status: 'published',
            start_date: new Date(Date.now() + 7 * 86400000).toISOString(),
            end_date: new Date(Date.now() + 9 * 86400000).toISOString(),
            location: 'Computer Lab 3, ICT Building',
            description_html: '<p>Intensive 3-day bootcamp covering modern web development with React and Node.js. Build a complete full-stack application from scratch.</p><p>Prerequisites: Basic JavaScript knowledge. Laptops required.</p>',
            max_participants: 30,
            registration_fee: 2000,
            requires_registration: true,
            banner_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
            tags: ['bootcamp', 'web development', 'react', 'nodejs'],
            participants_count: 28,
            author_name: 'James Mwangi',
            author_id: 'content1',
            created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
        },
        {
            id: '3',
            title: 'AI Ethics Panel Discussion',
            type: 'seminar',
            status: 'published',
            start_date: new Date(Date.now() + 14 * 86400000).toISOString(),
            end_date: new Date(Date.now() + 14 * 86400000 + 2 * 3600000).toISOString(),
            location: 'Virtual Event (Zoom)',
            description_html: '<p>Join leading experts in AI and ethics for a thought-provoking discussion on the responsible development and deployment of artificial intelligence.</p><p>Topics include bias in AI, privacy concerns, and the future of AI governance.</p>',
            max_participants: 200,
            registration_fee: 0,
            requires_registration: true,
            banner_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
            tags: ['AI', 'ethics', 'panel', 'discussion'],
            participants_count: 156,
            author_name: 'Prof. Michael Wanjiku',
            author_id: 'admin2',
            created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
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
            description_html: '<p>Join Kenya\'s leading telecommunications company as a Software Engineering Intern. Work on cutting-edge mobile and web applications serving millions of users.</p><p><strong>Requirements:</strong></p><ul><li>Computer Science or related field</li><li>Proficiency in Java, Python, or JavaScript</li><li>Strong problem-solving skills</li></ul>',
            salary: 'KSh 40,000/month',
            application_link: 'https://careers.safaricom.co.ke/internships',
            status: 'published',
            tags: ['internship', 'software', 'mobile', 'telecommunications'],
            applications_count: 234,
            author_name: 'Dr. Sarah Kimani',
            author_id: 'admin1',
            created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 12 * 86400000).toISOString()
        },
        {
            id: '2',
            title: 'Data Science Fellowship - Kenya Data Networks',
            type: 'fellowship',
            company: 'Kenya Data Networks',
            location: 'Remote/Hybrid',
            deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
            description_html: '<p>12-month fellowship program focusing on data science applications in telecommunications and fintech. Work with real datasets and cutting-edge ML models.</p><p><strong>Requirements:</strong></p><ul><li>Statistics, Mathematics, or Computer Science background</li><li>Python/R proficiency</li><li>Machine learning experience</li></ul>',
            salary: 'KSh 80,000/month + benefits',
            application_link: 'https://kdn.co.ke/fellowship',
            status: 'published',
            tags: ['fellowship', 'data science', 'machine learning', 'fintech'],
            applications_count: 89,
            author_name: 'Alice Wanjiru',
            author_id: 'content2',
            created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 8 * 86400000).toISOString()
        },
        {
            id: '3',
            title: 'Google Summer of Code 2026 - Open Source Projects',
            type: 'competition',
            company: 'Google',
            location: 'Remote',
            deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
            description_html: '<p>Contribute to open source projects during the summer while earning a stipend. Perfect opportunity to gain experience with large codebases and global collaboration.</p><p><strong>Requirements:</strong></p><ul><li>University student or recent graduate</li><li>Programming experience in any language</li><li>Passion for open source</li></ul>',
            salary: '$3,000 - $6,600 stipend',
            application_link: 'https://summerofcode.withgoogle.com/',
            status: 'published',
            tags: ['competition', 'open source', 'google', 'summer'],
            applications_count: 156,
            author_name: 'James Mwangi',
            author_id: 'content1',
            created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 15 * 86400000).toISOString()
        }
    ];
    static mockMedia = [
        {
            id: '1',
            name: 'innovation-showcase-2025.jpg',
            type: 'image/jpeg',
            size: 2456789,
            url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            uploader_name: 'Dr. Sarah Kimani',
            uploaded_by: 'admin1'
        },
        {
            id: '2',
            name: 'hackathon-winners.jpg',
            type: 'image/jpeg',
            size: 1876543,
            url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
            created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
            uploader_name: 'Prof. Michael Wanjiku',
            uploaded_by: 'admin2'
        },
        {
            id: '3',
            name: 'mobile-app-tutorial.pdf',
            type: 'application/pdf',
            size: 5432109,
            url: '/media/mobile-app-tutorial.pdf',
            created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
            uploader_name: 'James Mwangi',
            uploaded_by: 'content1'
        },
        {
            id: '4',
            name: 'partnership-announcement.mp4',
            type: 'video/mp4',
            size: 15678901,
            url: '/media/partnership-announcement.mp4',
            created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
            uploader_name: 'Alice Wanjiru',
            uploaded_by: 'content2'
        }
    ];

    static mockIdeas = [
        {
            id: '1',
            title: 'Smart Campus Navigation App',
            description: 'An AR-powered mobile app that helps students navigate the campus using their phone camera. It would show directions, building information, and available services in real-time.',
            category: 'technology',
            status: 'approved',
            tags: ['mobile', 'AR', 'navigation', 'campus'],
            submitter_id: 'student1',
            submitter_name: 'Alice Wanjiru',
            created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
            votes: 47,
            comments_count: 12
        },
        {
            id: '2',
            title: 'Sustainable Energy Monitoring System',
            description: 'IoT-based system to monitor and optimize energy consumption across campus buildings. Would include solar panel efficiency tracking and automated lighting controls.',
            category: 'sustainability',
            status: 'pending',
            tags: ['IoT', 'energy', 'sustainability', 'monitoring'],
            submitter_id: 'student2',
            submitter_name: 'John Kamau',
            created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            votes: 23,
            comments_count: 5
        },
        {
            id: '3',
            title: 'Digital Student ID with NFC',
            description: 'Replace physical student IDs with NFC-enabled digital cards on smartphones. Would work for library access, meal plans, and attendance tracking.',
            category: 'technology',
            status: 'approved',
            tags: ['NFC', 'digital', 'student ID', 'mobile'],
            submitter_id: 'student3',
            submitter_name: 'Grace Muthoni',
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            votes: 89,
            comments_count: 18
        }
    ];

    static mockChallenges = [
        {
            id: '1',
            title: 'Climate Change Solutions Challenge 2026',
            description: 'Develop innovative solutions to address climate change impacts in Kenya. Focus areas include renewable energy, sustainable agriculture, water conservation, and carbon reduction technologies.',
            category: 'sustainability',
            status: 'active',
            start_date: new Date(Date.now() - 7 * 86400000).toISOString(),
            end_date: new Date(Date.now() + 53 * 86400000).toISOString(),
            prize: 'KSh 100,000 + Incubation Support',
            max_participants: 50,
            tags: ['climate', 'sustainability', 'innovation', 'environment'],
            creator_id: 'admin1',
            creator_name: 'Dr. Sarah Kimani',
            created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
            participants_count: 34,
            submissions_count: 12
        },
        {
            id: '2',
            title: 'FinTech Innovation Challenge',
            description: 'Create financial technology solutions that address the needs of underserved communities in Kenya. Solutions should focus on mobile payments, microfinance, or financial literacy.',
            category: 'business',
            status: 'published',
            start_date: new Date(Date.now() + 14 * 86400000).toISOString(),
            end_date: new Date(Date.now() + 74 * 86400000).toISOString(),
            prize: 'KSh 75,000 + Mentorship',
            max_participants: 30,
            tags: ['fintech', 'mobile payments', 'innovation', 'business'],
            creator_id: 'admin2',
            creator_name: 'Prof. Michael Wanjiku',
            created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            participants_count: 0,
            submissions_count: 0
        }
    ];

    static mockMessages = [
        {
            id: '1',
            subject: 'Welcome to the New Academic Year!',
            content: 'Dear Innovation Club members, we are excited to welcome you to the 2026 academic year. This year promises to be filled with exciting opportunities, workshops, and competitions. Stay tuned for upcoming events and make sure to participate actively in our programs.',
            type: 'announcement',
            priority: 'normal',
            recipients: 'all',
            method: 'both',
            status: 'sent',
            sender_id: 'admin1',
            sender_name: 'Dr. Sarah Kimani',
            sent_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            recipients_count: 150,
            opened_count: 127,
            opened: true
        },
        {
            id: '2',
            subject: 'Urgent: Workshop Registration Deadline Extended',
            content: 'Due to popular demand, we have extended the registration deadline for the Web Development Bootcamp to Friday, February 7th. Don\'t miss this opportunity to learn React and Node.js from industry experts!',
            type: 'announcement',
            priority: 'high',
            recipients: 'all',
            method: 'notification',
            status: 'sent',
            sender_id: 'content1',
            sender_name: 'James Mwangi',
            sent_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            recipients_count: 150,
            opened_count: 89,
            opened: true
        },
        {
            id: '3',
            subject: 'Executive Meeting Minutes - January 2026',
            content: 'Please find attached the minutes from our January executive meeting. Key decisions include the new mentorship program launch and budget allocation for upcoming events.',
            type: 'announcement',
            priority: 'normal',
            recipients: 'executives',
            method: 'email',
            status: 'sent',
            sender_id: 'admin1',
            sender_name: 'Dr. Sarah Kimani',
            sent_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            recipients_count: 12,
            opened_count: 12,
            opened: true
        }
    ];

    static mockMembers = [
        {
            id: '1',
            name: 'Alice Wanjiru',
            email: 'alice.wanjiru@student.jkuat.ac.ke',
            student_id: 'EN251-0123/2023',
            role: 'executive',
            college: 'Engineering',
            year_of_study: 3,
            phone: '+254712345678',
            bio: 'Passionate about mobile app development and UI/UX design. Currently working on AR applications for education.',
            status: 'active',
            last_active: new Date(Date.now() - 1 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            events_attended: 15,
            projects_completed: 3
        },
        {
            id: '2',
            name: 'John Kamau',
            email: 'john.kamau@student.jkuat.ac.ke',
            student_id: 'EN251-0456/2024',
            role: 'member',
            college: 'Engineering',
            year_of_study: 2,
            phone: '+254723456789',
            bio: 'Interested in IoT and sustainable technology solutions. Working on smart agriculture projects.',
            status: 'active',
            last_active: new Date(Date.now() - 2 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            events_attended: 8,
            projects_completed: 1
        },
        {
            id: '3',
            name: 'Grace Muthoni',
            email: 'grace.muthoni@student.jkuat.ac.ke',
            student_id: 'BU251-0789/2023',
            role: 'member',
            college: 'Business',
            year_of_study: 3,
            phone: '+254734567890',
            bio: 'Business student with interest in fintech and digital innovation. Exploring entrepreneurship opportunities.',
            status: 'active',
            last_active: new Date(Date.now() - 3 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 300 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
            events_attended: 12,
            projects_completed: 2
        },
        {
            id: '4',
            name: 'David Ochieng',
            email: 'david.ochieng@student.jkuat.ac.ke',
            student_id: 'AG251-0321/2024',
            role: 'member',
            college: 'Agriculture',
            year_of_study: 1,
            phone: '+254745678901',
            bio: 'First-year agriculture student interested in agritech and precision farming solutions.',
            status: 'active',
            last_active: new Date(Date.now() - 7 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
            events_attended: 4,
            projects_completed: 0
        },
        {
            id: '5',
            name: 'Sarah Njeri',
            email: 'sarah.njeri@student.jkuat.ac.ke',
            student_id: 'HS251-0654/2023',
            role: 'executive',
            college: 'Health Sciences',
            year_of_study: 4,
            phone: '+254756789012',
            bio: 'Health sciences student passionate about digital health solutions and medical technology innovation.',
            status: 'active',
            last_active: new Date(Date.now() - 1 * 86400000).toISOString(),
            created_at: new Date(Date.now() - 400 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            events_attended: 20,
            projects_completed: 4
        }
    ];

    /*
     * SECURITY & ARCHITECTURE NOTES:
     * 
     * ✅ Structural Integrity:
     * - Single source of truth with this.storage
     * - No duplicate method definitions
     * - Clean class structure with proper syntax
     * - Consistent error handling and fallbacks
     * 
     * ✅ Content Security:
     * - Supports content_delta (Quill Delta) for secure rich text
     * - Falls back to content_html for legacy compatibility
     * - All HTML content should be sanitized before display
     * - Mock data uses content_html for demonstration
     * 
     * ✅ Data Flow:
     * - Supabase first, fallback to in-memory storage
     * - Consistent caching across all operations
     * - Proper cache invalidation on mutations
     * - Secure ID generation with CMSSecurity integration
     * 
     * ⚠️  PRODUCTION RECOMMENDATIONS:
     * - Add content_delta JSONB column to database tables
     * - Store Quill Delta in database for maximum security
     * - Use server-side HTML sanitization (DOMPurify) for display
     * - Implement proper RLS policies in Supabase
     * - Consider rate limiting for content creation
     */
}