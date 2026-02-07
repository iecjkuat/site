/**
 * CMS API Module
 * Handles all API operations using REST endpoints
 * Replaces direct Supabase queries with proper API calls
 */

export class CMSAPI {
    static API_BASE = '/api/v1';

    /**
     * Get authentication headers
     */
    static getAuthHeaders() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    /**
     * Handle API response
     */
    static async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Generic GET request
     */
    static async get(endpoint, params = {}) {
        const url = new URL(`${window.location.origin}${this.API_BASE}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse(response);
    }

    /**
     * Generic POST request
     */
    static async post(endpoint, data) {
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });

        return this.handleResponse(response);
    }

    /**
     * Generic PUT request
     */
    static async put(endpoint, data) {
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });

        return this.handleResponse(response);
    }

    /**
     * Generic DELETE request
     */
    static async delete(endpoint) {
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse(response);
    }

    // ==================== ARTICLES ====================

    /**
     * Get all articles
     */
    static async getArticles(filters = {}) {
        try {
            const data = await this.get('/content', filters);
            return data.articles || data.content || data.data || [];
        } catch (error) {
            console.error('Failed to fetch articles:', error);
            throw error;
        }
    }

    /**
     * Get single article
     */
    static async getArticle(id) {
        try {
            const data = await this.get(`/content/${id}`);
            return data.article || data.content || data.data;
        } catch (error) {
            console.error(`Failed to fetch article ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create article
     */
    static async createArticle(articleData) {
        try {
            const data = await this.post('/content', articleData);
            return data.article || data.content || data.data;
        } catch (error) {
            console.error('Failed to create article:', error);
            throw error;
        }
    }

    /**
     * Update article
     */
    static async updateArticle(id, articleData) {
        try {
            const data = await this.put(`/content/${id}`, articleData);
            return data.article || data.content || data.data;
        } catch (error) {
            console.error(`Failed to update article ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete article
     */
    static async deleteArticle(id) {
        try {
            await this.delete(`/content/${id}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete article ${id}:`, error);
            throw error;
        }
    }

    // ==================== EVENTS ====================

    /**
     * Get all events
     */
    static async getEvents(filters = {}) {
        try {
            const data = await this.get('/events', filters);
            return data.events || data.data || [];
        } catch (error) {
            console.error('Failed to fetch events:', error);
            throw error;
        }
    }

    /**
     * Get single event
     */
    static async getEvent(id) {
        try {
            const data = await this.get(`/events/${id}`);
            return data.event || data.data;
        } catch (error) {
            console.error(`Failed to fetch event ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create event
     */
    static async createEvent(eventData) {
        try {
            const data = await this.post('/events', eventData);
            return data.event || data.data;
        } catch (error) {
            console.error('Failed to create event:', error);
            throw error;
        }
    }

    /**
     * Update event
     */
    static async updateEvent(id, eventData) {
        try {
            const data = await this.put(`/events/${id}`, eventData);
            return data.event || data.data;
        } catch (error) {
            console.error(`Failed to update event ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete event
     */
    static async deleteEvent(id) {
        try {
            await this.delete(`/events/${id}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete event ${id}:`, error);
            throw error;
        }
    }

    // ==================== PROJECTS ====================

    /**
     * Get all projects
     */
    static async getProjects(filters = {}) {
        try {
            const data = await this.get('/projects', filters);
            return data.projects || data.data || [];
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            throw error;
        }
    }

    /**
     * Get single project
     */
    static async getProject(id) {
        try {
            const data = await this.get(`/projects/${id}`);
            return data.project || data.data;
        } catch (error) {
            console.error(`Failed to fetch project ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create project
     */
    static async createProject(projectData) {
        try {
            const data = await this.post('/projects', projectData);
            return data.project || data.data;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    }

    /**
     * Update project
     */
    static async updateProject(id, projectData) {
        try {
            const data = await this.put(`/projects/${id}`, projectData);
            return data.project || data.data;
        } catch (error) {
            console.error(`Failed to update project ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete project
     */
    static async deleteProject(id) {
        try {
            await this.delete(`/projects/${id}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete project ${id}:`, error);
            throw error;
        }
    }

    // ==================== RESOURCES ====================

    /**
     * Get all resources
     */
    static async getResources(filters = {}) {
        try {
            const data = await this.get('/resources', filters);
            return data.resources || data.data || [];
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            throw error;
        }
    }

    /**
     * Get single resource
     */
    static async getResource(id) {
        try {
            const data = await this.get(`/resources/${id}`);
            return data.resource || data.data;
        } catch (error) {
            console.error(`Failed to fetch resource ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create resource
     */
    static async createResource(resourceData) {
        try {
            const data = await this.post('/resources', resourceData);
            return data.resource || data.data;
        } catch (error) {
            console.error('Failed to create resource:', error);
            throw error;
        }
    }

    /**
     * Update resource
     */
    static async updateResource(id, resourceData) {
        try {
            const data = await this.put(`/resources/${id}`, resourceData);
            return data.resource || data.data;
        } catch (error) {
            console.error(`Failed to update resource ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete resource
     */
    static async deleteResource(id) {
        try {
            await this.delete(`/resources/${id}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete resource ${id}:`, error);
            throw error;
        }
    }

    // ==================== OPPORTUNITIES ====================

    /**
     * Get all opportunities
     */
    static async getOpportunities(filters = {}) {
        try {
            const data = await this.get('/opportunities', filters);
            return data.opportunities || data.data || [];
        } catch (error) {
            console.error('Failed to fetch opportunities:', error);
            throw error;
        }
    }

    /**
     * Get single opportunity
     */
    static async getOpportunity(id) {
        try {
            const data = await this.get(`/opportunities/${id}`);
            return data.opportunity || data.data;
        } catch (error) {
            console.error(`Failed to fetch opportunity ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create opportunity
     */
    static async createOpportunity(opportunityData) {
        try {
            const data = await this.post('/opportunities', opportunityData);
            return data.opportunity || data.data;
        } catch (error) {
            console.error('Failed to create opportunity:', error);
            throw error;
        }
    }

    /**
     * Update opportunity
     */
    static async updateOpportunity(id, opportunityData) {
        try {
            const data = await this.put(`/opportunities/${id}`, opportunityData);
            return data.opportunity || data.data;
        } catch (error) {
            console.error(`Failed to update opportunity ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete opportunity
     */
    static async deleteOpportunity(id) {
        try {
            await this.delete(`/opportunities/${id}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete opportunity ${id}:`, error);
            throw error;
        }
    }

    // ==================== IDEAS ====================

    /**
     * Get all ideas
     */
    static async getIdeas(filters = {}) {
        try {
            const data = await this.get('/ideas', filters);
            return data.ideas || data.data || [];
        } catch (error) {
            console.error('Failed to fetch ideas:', error);
            throw error;
        }
    }

    /**
     * Get single idea
     */
    static async getIdea(id) {
        try {
            const data = await this.get(`/ideas/${id}`);
            return data.idea || data.data;
        } catch (error) {
            console.error(`Failed to fetch idea ${id}:`, error);
            throw error;
        }
    }

    /**
     * Update idea (approve/reject)
     */
    static async updateIdea(id, ideaData) {
        try {
            const data = await this.put(`/ideas/${id}`, ideaData);
            return data.idea || data.data;
        } catch (error) {
            console.error(`Failed to update idea ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete idea
     */
    static async deleteIdea(id) {
        try {
            await this.delete(`/ideas/${id}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete idea ${id}:`, error);
            throw error;
        }
    }

    // ==================== MEMBERS ====================

    /**
     * Get all members
     */
    static async getMembers(filters = {}) {
        try {
            const data = await this.get('/admin/users', filters);
            return data.users || data.data || [];
        } catch (error) {
            console.error('Failed to fetch members:', error);
            throw error;
        }
    }

    /**
     * Update member
     */
    static async updateMember(id, memberData) {
        try {
            const data = await this.put(`/admin/users/${id}`, memberData);
            return data.user || data.data;
        } catch (error) {
            console.error(`Failed to update member ${id}:`, error);
            throw error;
        }
    }

    // ==================== STATS ====================

    /**
     * Get dashboard stats
     */
    static async getStats() {
        try {
            const data = await this.get('/stats');
            return data;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            // Return default stats on error
            return {
                articles: 0,
                events: 0,
                projects: 0,
                opportunities: 0,
                ideas: 0,
                members: 0
            };
        }
    }
}
