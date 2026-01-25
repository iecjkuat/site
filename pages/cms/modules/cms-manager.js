/**
 * CMS Manager Module
 * Main controller that orchestrates all CMS functionality
 */

import { CMSSecurity } from './cms-security.js';
import { CMSSupabase } from './cms-supabase.js';
import { CMSNotifications } from './cms-notifications.js';
import { CMSEditors } from './cms-editors.js';
import { CMSData } from './cms-data.js';
import { CMSUI } from './cms-ui.js';

export class SecureCMSManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.notifications = new CMSNotifications();
        this.editors = new CMSEditors();
        this.eventHandlers = new Map();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initializing Secure CMS...');
        
        try {
            // Validate required elements
            this.validateRequiredElements();
            
            // Setup UI first (always needed)
            this.setupTabs();
            this.setupEventDelegation();
            
            // Wait for auth
            await this.waitForAuth();
            
            // Check permissions
            this.checkPermissions();
            
            // Load initial data
            await this.loadTabContent('dashboard');
            
            this.isInitialized = true;
            this.notifications.show('CMS initialized successfully! 🎉', 'success');
            
        } catch (error) {
            console.error('❌ CMS initialization failed:', error);
            
            // Still set up basic UI even if auth fails
            if (!this.isInitialized) {
                try {
                    this.setupTabs();
                    this.setupEventDelegation();
                } catch (uiError) {
                    console.error('❌ UI setup also failed:', uiError);
                }
            }
            
            this.notifications.show(`Initialization failed: ${error.message}`, 'error');
            
            // Redirect on auth failure
            if (error.message.includes('Authentication required')) {
                setTimeout(() => window.location.href = '/', 2000);
            } else if (error.message.includes('Access denied')) {
                setTimeout(() => window.location.href = '/dashboard', 2000);
            }
        }
    }

    validateRequiredElements() {
        const required = [
            'dashboard-tab', 'articles-tab', 'events-tab', 
            'opportunities-tab', 'media-tab'
        ];
        
        const missing = required.filter(id => !document.getElementById(id));
        if (missing.length > 0) {
            throw new Error(`Missing required elements: ${missing.join(', ')}`);
        }
    }

    async waitForAuth() {
        if (!window.authManager) {
            console.log('⏳ Waiting for auth system...');
            await new Promise(resolve => {
                const check = () => {
                    if (window.authManager) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }
    }

    checkPermissions() {
        if (!window.authManager.isAuthenticated()) {
            throw new Error('Authentication required');
        }
        
        const user = window.authManager.getUser();
        if (!CMSSecurity.validateRole(user)) {
            throw new Error(`Access denied. CMS access requires executive or admin role.\nYour role: ${user?.role || 'none'}\nContact an admin to update your role if needed.`);
        }
        
        console.log('✅ CMS access granted for:', user.role, user.email);
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = button.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }

    setupEventDelegation() {
        console.log('🎯 Setting up event delegation...');
        
        // Use event delegation instead of inline onclick
        document.addEventListener('click', (e) => {
            // Check if the clicked element or its parent has the action data attribute
            let target = e.target;
            let action = target.dataset.action;
            let id = target.dataset.id;
            
            // If the target doesn't have the action, check its parent (for icon clicks)
            if (!action && target.parentElement) {
                target = target.parentElement;
                action = target.dataset.action;
                id = target.dataset.id;
            }
            
            // Debug logging
            if (action) {
                console.log('🔘 Button clicked:', { action, id, target, hasHandler: this.eventHandlers.has(action) });
            }
            
            if (action && this.eventHandlers.has(action)) {
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ Executing handler for:', action);
                try {
                    this.eventHandlers.get(action)(id, e);
                } catch (handlerError) {
                    console.error('❌ Handler execution failed:', handlerError);
                    this.notifications.show(`Action failed: ${handlerError.message}`, 'error');
                }
            } else if (action) {
                console.warn('❌ No handler found for action:', action);
                console.log('Available handlers:', Array.from(this.eventHandlers.keys()));
            }
        });

        // Register handlers
        this.eventHandlers.set('view-article', (id) => this.viewContentById(id, 'article'));
        this.eventHandlers.set('view-event', (id) => this.viewContentById(id, 'event'));
        this.eventHandlers.set('view-opportunity', (id) => this.viewContentById(id, 'opportunity'));
        this.eventHandlers.set('edit-article', (id) => this.editArticle(id));
        this.eventHandlers.set('delete-article', (id) => this.deleteArticle(id));
        this.eventHandlers.set('edit-event', (id) => this.editEvent(id));
        this.eventHandlers.set('delete-event', (id) => this.deleteEvent(id));
        this.eventHandlers.set('edit-opportunity', (id) => this.editOpportunity(id));
        this.eventHandlers.set('delete-opportunity', (id) => this.deleteOpportunity(id));
        
        console.log('🎯 Event handlers registered:', Array.from(this.eventHandlers.keys()));
    }

    async switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = 'rgba(16, 185, 129, 0.2)';
            activeBtn.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            activeBtn.style.color = '#10b981';
        }

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });

        // Show selected tab content
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        this.currentTab = tabName;
        await this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        try {
            switch (tabName) {
                case 'dashboard':
                    await this.updateDashboardStats();
                    break;
                case 'articles':
                    await this.loadArticles();
                    break;
                case 'events':
                    await this.loadEvents();
                    break;
                case 'opportunities':
                    await this.loadOpportunities();
                    break;
                case 'media':
                    await this.loadMediaLibrary();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
            this.notifications.show(`Failed to load ${tabName}: ${error.message}`, 'error');
        }
    }

    // Dashboard methods
    async updateDashboardStats() {
        const stats = CMSData.getStats();
        
        // Update counters with animation
        CMSUI.animateCounter('articles-count', stats.articles);
        CMSUI.animateCounter('events-count', stats.events);
        CMSUI.animateCounter('opportunities-count', stats.opportunities);
        CMSUI.animateCounter('media-count', stats.media);
        
        // Load recent activity
        await this.loadRecentActivity();
    }

    async loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        const recentItems = CMSData.getRecentActivity(5);
        
        container.innerHTML = '';
        
        recentItems.forEach(item => {
            const activityItem = CMSUI.createActivityItem(item, () => {
                this.switchTab(`${item.type}s`);
            });
            container.appendChild(activityItem);
        });
    }

    // Content loading methods
    async loadArticles() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        container.innerHTML = '';
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const articles = await CMSData.getArticles();
            this.renderArticles(articles);
        } catch (error) {
            container.innerHTML = '';
            container.appendChild(CMSUI.createErrorElement(error.message));
        }
    }

    renderArticles(articles) {
        const container = document.getElementById('articles-list');
        container.innerHTML = '';

        if (!articles.length) {
            container.appendChild(CMSUI.createEmptyState('No articles found. Create your first article!'));
            return;
        }

        articles.forEach(article => {
            const item = CMSUI.createContentItem(article, 'article', {
                onView: (data) => this.viewContent(data, 'article'),
                onEdit: (id) => this.editArticle(id),
                onDelete: (id) => this.deleteArticle(id)
            });
            container.appendChild(item);
        });
    }

    async loadEvents() {
        const container = document.getElementById('events-list');
        if (!container) return;

        container.innerHTML = '';
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const events = await CMSData.getEvents();
            this.renderEvents(events);
        } catch (error) {
            container.innerHTML = '';
            container.appendChild(CMSUI.createErrorElement(error.message));
        }
    }

    renderEvents(events) {
        const container = document.getElementById('events-list');
        container.innerHTML = '';

        if (!events.length) {
            container.appendChild(CMSUI.createEmptyState('No events found. Create your first event!'));
            return;
        }

        events.forEach(event => {
            const item = CMSUI.createContentItem(event, 'event', {
                onView: (data) => this.viewContent(data, 'event'),
                onEdit: (id) => this.editEvent(id),
                onDelete: (id) => this.deleteEvent(id)
            });
            container.appendChild(item);
        });
    }

    async loadOpportunities() {
        const container = document.getElementById('opportunities-list');
        if (!container) return;

        container.innerHTML = '';
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const opportunities = await CMSData.getOpportunities();
            this.renderOpportunities(opportunities);
        } catch (error) {
            container.innerHTML = '';
            container.appendChild(CMSUI.createErrorElement(error.message));
        }
    }

    renderOpportunities(opportunities) {
        const container = document.getElementById('opportunities-list');
        container.innerHTML = '';

        if (!opportunities.length) {
            container.appendChild(CMSUI.createEmptyState('No opportunities found. Post your first opportunity!'));
            return;
        }

        opportunities.forEach(opportunity => {
            const item = CMSUI.createContentItem(opportunity, 'opportunity', {
                onView: (data) => this.viewContent(data, 'opportunity'),
                onEdit: (id) => this.editOpportunity(id),
                onDelete: (id) => this.deleteOpportunity(id)
            });
            container.appendChild(item);
        });
    }

    async loadMediaLibrary() {
        const container = document.getElementById('media-library');
        if (!container) return;

        container.innerHTML = '';
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const media = await CMSData.getMedia();
            this.renderMediaLibrary(media);
        } catch (error) {
            container.innerHTML = '';
            container.appendChild(CMSUI.createErrorElement(error.message));
        }
    }

    renderMediaLibrary(media) {
        const container = document.getElementById('media-library');
        container.innerHTML = '';

        if (!media.length) {
            container.appendChild(CMSUI.createEmptyState('No media files found. Upload your first file!'));
            return;
        }

        // Create grid layout
        container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
        `;

        media.forEach(file => {
            const mediaItem = CMSUI.createMediaItem(file, {
                onView: (file) => this.viewMedia(file),
                onDelete: (id) => this.deleteMedia(id)
            });
            container.appendChild(mediaItem);
        });
    }

    // Event handlers
    viewContentById(id, type) {
        console.log(`🔍 Viewing ${type} with ID:`, id);
        
        try {
            const data = CMSData.findById(type + 's', id);
            if (data) {
                console.log(`✅ Found ${type}:`, data.title);
                this.viewContent(data, type);
            } else {
                console.warn(`❌ ${type} not found with ID:`, id);
                this.notifications.show(`${type.charAt(0).toUpperCase() + type.slice(1)} not found`, 'error');
            }
        } catch (error) {
            console.error(`❌ Error viewing ${type}:`, error);
            this.notifications.show(`Error viewing ${type}: ${error.message}`, 'error');
        }
    }

    viewContent(data, type) {
        console.log(`📖 Creating modal for ${type}:`, data.title);
        
        try {
            const modal = CMSUI.createContentModal(data, type);
            document.body.appendChild(modal);
            console.log(`✅ Modal created and added to DOM`);
        } catch (error) {
            console.error(`❌ Error creating modal:`, error);
            this.notifications.show(`Error displaying content: ${error.message}`, 'error');
        }
    }

    viewMedia(file) {
        if (file.type.startsWith('image/')) {
            window.open(file.url, '_blank');
        } else {
            this.notifications.show('File preview not available', 'info');
        }
    }

    editArticle(id) {
        console.log(`✏️ Editing article with ID:`, id);
        
        try {
            const article = CMSData.findById('articles', id);
            if (!article) {
                this.notifications.show('Article not found', 'error');
                return;
            }
            
            console.log(`✅ Found article:`, article.title);
            
            // For now, simple prompt - can be enhanced with full modal
            const newTitle = prompt('Edit article title:', article.title);
            if (newTitle && newTitle !== article.title) {
                CMSData.updateItem('articles', id, { title: newTitle });
                this.notifications.show('Article updated successfully!', 'success');
                this.loadArticles();
                console.log(`✅ Article updated:`, newTitle);
            } else if (newTitle === null) {
                console.log(`❌ Edit cancelled by user`);
            } else {
                console.log(`❌ No changes made`);
            }
        } catch (error) {
            console.error(`❌ Error editing article:`, error);
            this.notifications.show(`Error editing article: ${error.message}`, 'error');
        }
    }

    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }
        
        try {
            const success = await CMSData.deleteItem('articles', id);
            if (success) {
                this.notifications.show('Article deleted successfully!', 'success');
                this.loadArticles();
                this.updateDashboardStats();
            } else {
                this.notifications.show('Article not found', 'error');
            }
        } catch (error) {
            this.notifications.show('Failed to delete article: ' + error.message, 'error');
        }
    }

    editEvent(id) {
        console.log(`✏️ Editing event with ID:`, id);
        
        try {
            const event = CMSData.findById('events', id);
            if (!event) {
                this.notifications.show('Event not found', 'error');
                return;
            }
            
            console.log(`✅ Found event:`, event.title);
            
            const newTitle = prompt('Edit event title:', event.title);
            if (newTitle && newTitle !== event.title) {
                CMSData.updateItem('events', id, { title: newTitle });
                this.notifications.show('Event updated successfully!', 'success');
                this.loadEvents();
                console.log(`✅ Event updated:`, newTitle);
            }
        } catch (error) {
            console.error(`❌ Error editing event:`, error);
            this.notifications.show(`Error editing event: ${error.message}`, 'error');
        }
    }

    async deleteEvent(id) {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }
        
        try {
            const success = await CMSData.deleteItem('events', id);
            if (success) {
                this.notifications.show('Event deleted successfully!', 'success');
                this.loadEvents();
                this.updateDashboardStats();
            } else {
                this.notifications.show('Event not found', 'error');
            }
        } catch (error) {
            this.notifications.show('Failed to delete event: ' + error.message, 'error');
        }
    }

    editOpportunity(id) {
        console.log(`✏️ Editing opportunity with ID:`, id);
        
        try {
            const opportunity = CMSData.findById('opportunities', id);
            if (!opportunity) {
                this.notifications.show('Opportunity not found', 'error');
                return;
            }
            
            console.log(`✅ Found opportunity:`, opportunity.title);
            
            const newTitle = prompt('Edit opportunity title:', opportunity.title);
            if (newTitle && newTitle !== opportunity.title) {
                CMSData.updateItem('opportunities', id, { title: newTitle });
                this.notifications.show('Opportunity updated successfully!', 'success');
                this.loadOpportunities();
                console.log(`✅ Opportunity updated:`, newTitle);
            }
        } catch (error) {
            console.error(`❌ Error editing opportunity:`, error);
            this.notifications.show(`Error editing opportunity: ${error.message}`, 'error');
        }
    }

    async deleteOpportunity(id) {
        if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
            return;
        }
        
        try {
            const success = await CMSData.deleteItem('opportunities', id);
            if (success) {
                this.notifications.show('Opportunity deleted successfully!', 'success');
                this.loadOpportunities();
                this.updateDashboardStats();
            } else {
                this.notifications.show('Opportunity not found', 'error');
            }
        } catch (error) {
            this.notifications.show('Failed to delete opportunity: ' + error.message, 'error');
        }
    }

    deleteMedia(id) {
        if (!confirm('Are you sure you want to delete this media file?')) {
            return;
        }
        
        const success = CMSData.deleteItem('media', id);
        if (success) {
            this.notifications.show('Media file deleted successfully!', 'success');
            this.loadMediaLibrary();
            this.updateDashboardStats();
        } else {
            this.notifications.show('Media file not found', 'error');
        }
    }

    // Content creation methods
    showCreateForm(type) {
        const modal = CMSUI.createContentForm(type, async (data) => {
            try {
                if (type === 'article') {
                    await CMSData.createArticle(data);
                    this.loadArticles();
                } else if (type === 'event') {
                    await CMSData.createEvent(data);
                    this.loadEvents();
                } else if (type === 'opportunity') {
                    await CMSData.createOpportunity(data);
                    this.loadOpportunities();
                }
                
                this.notifications.show(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`, 'success');
                this.updateDashboardStats();
            } catch (error) {
                this.notifications.show(`Failed to create ${type}: ${error.message}`, 'error');
                throw error; // Re-throw to prevent modal from closing
            }
        });
        
        document.body.appendChild(modal);
    }
}