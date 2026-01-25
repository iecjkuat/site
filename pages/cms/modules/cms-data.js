/**
 * CMS Data Module
 * Handles all data operations with Supabase integration and fallback to in-memory mock storage
 * Enhanced with Delta content support and comprehensive security
 */

import { CMSSupabase } from './cms-supabase.js';

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
        opportunities: [],
        media: []
    };

    // Seed once
    static seedIfEmpty() {
        if (!this.storage.articles.length) this.storage.articles = [...this.mockArticles];
        if (!this.storage.events.length) this.storage.events = [...this.mockEvents];
        if (!this.storage.opportunities.length) this.storage.opportunities = [...this.mockOpportunities];
        if (!this.storage.media.length) this.storage.media = [...this.mockMedia];
    }
    // ---------- Articles ----------
    static async getArticles(filters = {}) {
        const cacheKey = this.getCacheKey('articles', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Try Supabase first
        try {
            if (this.useSupabase) {
                const data = await CMSSupabase.getArticles(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('Supabase getArticles failed, using fallback:', error);
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
                const result = await CMSSupabase.createArticle(data);
                this.clearCache('articles');
                return result;
            }
        } catch (error) {
            console.warn('Supabase createArticle failed, using fallback:', error);
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
                const result = await CMSSupabase.updateArticle(id, data);
                this.clearCache('articles');
                return result;
            }
        } catch (error) {
            console.warn('Supabase updateArticle failed, using fallback:', error);
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
                await CMSSupabase.deleteArticle(id);
                this.clearCache('articles');
                return true;
            }
        } catch (error) {
            console.warn('Supabase deleteArticle failed, using fallback:', error);
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
        if (cached) return cached;

        try {
            if (this.useSupabase) {
                const data = await CMSSupabase.getEvents(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('Supabase getEvents failed, using fallback:', error);
        }

        this.seedIfEmpty();
        let items = [...this.storage.events];

        if (filters.status) items = items.filter(e => e.status === filters.status);
        if (filters.type) items = items.filter(e => e.type === filters.type);

        if (filters.search) {
            const search = String(filters.search).toLowerCase();
            items = items.filter(e =>
                String(e.title || '').toLowerCase().includes(search) ||
                String(e.description_html || e.description || '').toLowerCase().includes(search)
            );
        }

        if (filters.upcoming) {
            const now = new Date().toISOString();
            items = items.filter(e => String(e.start_date || '') >= now);
        }

        if (filters.limit) items = items.slice(0, filters.limit);

        this.setCache(cacheKey, items);
        return items;
    }
    static async createEvent(data) {
        try {
            if (this.useSupabase) {
                const result = await CMSSupabase.createEvent(data);
                this.clearCache('events');
                return result;
            }
        } catch (error) {
            console.warn('Supabase createEvent failed, using fallback:', error);
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
                const result = await CMSSupabase.updateEvent(id, data);
                this.clearCache('events');
                return result;
            }
        } catch (error) {
            console.warn('Supabase updateEvent failed, using fallback:', error);
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
                await CMSSupabase.deleteEvent(id);
                this.clearCache('events');
                return true;
            }
        } catch (error) {
            console.warn('Supabase deleteEvent failed, using fallback:', error);
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
                const data = await CMSSupabase.getOpportunities(filters);
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.warn('Supabase getOpportunities failed, using fallback:', error);
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
                const result = await CMSSupabase.createOpportunity(data);
                this.clearCache('opportunities');
                return result;
            }
        } catch (error) {
            console.warn('Supabase createOpportunity failed, using fallback:', error);
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
                const result = await CMSSupabase.updateOpportunity(id, data);
                this.clearCache('opportunities');
                return result;
            }
        } catch (error) {
            console.warn('Supabase updateOpportunity failed, using fallback:', error);
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
                await CMSSupabase.deleteOpportunity(id);
                this.clearCache('opportunities');
                return true;
            }
        } catch (error) {
            console.warn('Supabase deleteOpportunity failed, using fallback:', error);
        }

        this.seedIfEmpty();
        const idx = this.storage.opportunities.findIndex(o => o.id === id);
        if (idx === -1) return false;
        this.storage.opportunities.splice(idx, 1);
        this.clearCache('opportunities');
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

    // ---------- Utilities ----------
    static generateId() {
        return (window.CMSSecurity?.generateSecureId?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
    }

    static parseTags(tags) {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags;
        return String(tags).split(',').map(t => t.trim()).filter(Boolean);
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
            opportunity: 'opportunities', 
            media_file: 'media', 
            media: 'media' 
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
    static getStats() {
        return {
            articles: this.storage.articles.length,
            events: this.storage.events.length,
            opportunities: this.storage.opportunities.length,
            media: this.storage.media.length
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
            'opportunities': this.storage.opportunities,
            'media': this.storage.media
        };
        
        const data = dataMap[key];
        return data ? data.find(item => item.id === id) : null;
    }

    static updateItem(type, id, updates) {
        const key = this.normalizeType(type);
        const dataMap = {
            'articles': this.storage.articles,
            'events': this.storage.events,
            'opportunities': this.storage.opportunities,
            'media': this.storage.media
        };
        
        const data = dataMap[key];
        if (data) {
            const index = data.findIndex(item => item.id === id);
            if (index !== -1) {
                data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
                this.clearCache(String(key)); // Fix cache invalidation bug
                return data[index];
            }
        }
        return null;
    }

    static async deleteItem(type, id) {
        const key = this.normalizeType(type);
        const deleteMap = {
            'articles': () => this.deleteArticle(id),
            'events': () => this.deleteEvent(id),
            'opportunities': () => this.deleteOpportunity(id),
            'media': () => this.deleteMedia(id)
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