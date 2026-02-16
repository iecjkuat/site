/**
 * CMS Manager Module
 * Main controller that orchestrates all CMS functionality
 * Enhanced with comprehensive features: real-time updates, advanced search, 
 * content scheduling, bulk operations, and improved error handling
 */

import { CMSSecurity } from './cms-security.js';
import { CMSAPI } from './cms-api.js';
import { CMSNotifications } from './cms-notifications.js';
import { CMSEditors } from './cms-editors.js';
import { CMSData } from './cms-data.js';
import { CMSUI } from './cms-ui.js';
import { CMSMockData } from './cms-mock-data.js';

export class SecureCMSManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.notifications = new CMSNotifications();
        this.editors = new CMSEditors();
        this.eventHandlers = new Map();
        this.isInitialized = false;
        
        // Enhanced features
        this.searchFilters = {
            query: '',
            type: 'all',
            status: 'all',
            dateRange: 'all'
        };
        this.selectedItems = new Set();
        this.realTimeSubscriptions = new Map();
        this.scheduledContent = new Map();
        
        // Memory management
        this.intervals = new Set();
        this.keyboardHandler = this.handleKeyboard.bind(this);
        
        this.init();
    }

    // Input validation methods
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            throw new Error('Title is required and must be a string');
        }
        
        // Normalize Unicode to prevent homoglyph attacks
        const t = title.normalize('NFKC').trim();
        
        if (t.length < 3) {
            throw new Error('Title must be at least 3 characters long');
        }
        if (t.length > 200) {
            throw new Error('Title must be less than 200 characters');
        }
        
        // Block control characters explicitly
        if (/[\u0000-\u001F\u007F]/.test(t)) {
            throw new Error('Title contains invalid control characters');
        }
        
        return true;
    }

    validateContent(content) {
        if (!content || typeof content !== 'string') {
            throw new Error('Content is required');
        }
        if (content.length > 50000) {
            throw new Error('Content is too long (maximum 50,000 characters)');
        }
        return true;
    }

    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw new Error('Email is required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        return true;
    }

    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('URL is required');
        }
        if (!CMSSecurity.isSafeHttpUrl(url)) {
            throw new Error('URL must be a valid http:// or https:// URL');
        }
        return true;
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Basic HTML entity encoding for display
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initializing Enhanced CMS...');
        
        try {
            // Validate required elements
            this.validateRequiredElements();
            
            // Setup UI first (always needed)
            this.setupTabs();
            this.setupEventDelegation();
            this.setupSearchAndFilters();
            this.setupBulkOperations();
            this.setupKeyboardShortcuts();
            
            // Wait for auth with timeout
            await this.waitForAuth(8000);
            
            // Check permissions
            this.checkPermissions();
            
            // Initialize real-time features
            await this.initializeRealTimeFeatures();
            
            // Load initial data
            await this.loadTabContent('dashboard');
            
            // Setup auto-save and periodic sync
            this.setupAutoSave();
            this.setupPeriodicSync();
            
            this.isInitialized = true;
            this.notifications.show('Enhanced CMS initialized successfully! 🚀', 'success');
            
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
            
            // User-friendly error messages
            let errorMessage = 'Initialization failed';
            if (error.message.includes('timeout')) {
                errorMessage = 'Connection timeout - please check your internet connection';
            } else if (error.message.includes('Authentication required')) {
                errorMessage = 'Please log in to access the CMS';
            } else if (error.message.includes('Access denied')) {
                errorMessage = 'You need executive or admin privileges to access the CMS';
            }
            
            this.notifications.show(errorMessage, 'error');
            
            // Redirect on auth failure with delay for user to read message
            if (error.message.includes('Authentication required')) {
                setTimeout(() => window.location.href = '/', 3000);
            } else if (error.message.includes('Access denied')) {
                setTimeout(() => window.location.href = '/dashboard', 3000);
            }
        }
    }

    validateRequiredElements() {
        const required = [
            'dashboard-tab', 'articles-tab', 'events-tab', 
            'opportunities-tab', 'innovation-tab', 'communications-tab', 
            'members-tab', 'media-tab'
        ];
        
        const missing = required.filter(id => !document.getElementById(id));
        if (missing.length > 0) {
            throw new Error(`Missing required elements: ${missing.join(', ')}`);
        }
    }

    async waitForAuth(timeoutMs = 8000) {
        if (!window.authManager) {
            console.log('⏳ Waiting for auth system...');
            const start = Date.now();
            
            await new Promise((resolve, reject) => {
                const check = () => {
                    if (window.authManager) {
                        resolve();
                    } else if (Date.now() - start > timeoutMs) {
                        reject(new Error('Auth system timeout - please refresh the page'));
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
        // Guard against double setup
        if (this._tabsSetup) return;
        this._tabsSetup = true;
        
        const tabButtons = document.querySelectorAll('.cms-tab');
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
        // Guard against double setup
        if (this._delegationSetup) return;
        this._delegationSetup = true;
        
        console.log('🎯 Setting up event delegation...');
        
        // Store handler reference for cleanup
        this.onDocumentClick = (e) => {
            // Check if the clicked element or its parent has the action data attribute
            const actionElement = e.target.closest('[data-action]');
            
            if (actionElement) {
                const action = actionElement.dataset.action;
                const id = actionElement.dataset.id;
                
                // Debug logging
                console.log('🔘 Button clicked:', { action, id, element: actionElement, hasHandler: this.eventHandlers.has(action) });
                
                if (this.eventHandlers.has(action)) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('✅ Executing handler for:', action);
                    try {
                        this.eventHandlers.get(action)(id, e);
                    } catch (handlerError) {
                        console.error('❌ Handler execution failed:', handlerError);
                        this.notifications.show(`Action failed: ${handlerError.message}`, 'error');
                    }
                } else {
                    console.warn('❌ No handler found for action:', action);
                    console.log('Available handlers:', Array.from(this.eventHandlers.keys()));
                }
            }
        };

        // Store change handler reference for cleanup
        this.onDocumentChange = (e) => {
            const target = e.target;
            if (target && target.classList?.contains('content-item-checkbox')) {
                const id = target.dataset.id;
                if (id) {
                    this.setItemSelection(id, target.checked);
                }
            }
        };
        
        // Use event delegation instead of inline onclick
        document.addEventListener('click', this.onDocumentClick);
        document.addEventListener('change', this.onDocumentChange);

        // Register handlers
        this.eventHandlers.set('view-article', (id) => this.viewContentById(id, 'article'));
        this.eventHandlers.set('view-event', (id) => this.viewContentById(id, 'event'));
        this.eventHandlers.set('view-project', (id) => this.viewContentById(id, 'project'));
        this.eventHandlers.set('view-opportunity', (id) => this.viewContentById(id, 'opportunity'));
        this.eventHandlers.set('edit-article', (id) => this.editArticle(id));
        this.eventHandlers.set('delete-article', (id) => this.deleteArticle(id));
        this.eventHandlers.set('edit-event', (id) => this.editEvent(id));
        this.eventHandlers.set('delete-event', (id) => this.deleteEvent(id));
        this.eventHandlers.set('edit-project', (id) => this.editProject(id));
        this.eventHandlers.set('delete-project', (id) => this.deleteProject(id));
        this.eventHandlers.set('edit-opportunity', (id) => this.editOpportunity(id));
        this.eventHandlers.set('delete-opportunity', (id) => this.deleteOpportunity(id));
        
        // New tab handlers
        this.eventHandlers.set('view-challenge', (id) => this.viewContentById(id, 'challenge'));
        this.eventHandlers.set('edit-challenge', (id) => this.editChallenge(id));
        this.eventHandlers.set('delete-challenge', (id) => this.deleteChallenge(id));
        this.eventHandlers.set('view-idea', (id) => this.viewContentById(id, 'idea'));
        this.eventHandlers.set('approve-idea', (id) => this.approveIdea(id));
        this.eventHandlers.set('reject-idea', (id) => this.rejectIdea(id));
        this.eventHandlers.set('view-message', (id) => this.viewContentById(id, 'message'));
        this.eventHandlers.set('resend-message', (id) => this.resendMessage(id));
        this.eventHandlers.set('delete-message', (id) => this.deleteMessage(id));
        this.eventHandlers.set('view-member', (id) => this.viewMember(id));
        this.eventHandlers.set('message-member', (id) => this.messageMember(id));
        this.eventHandlers.set('edit-member', (id) => this.editMember(id));
        
        // Enhanced handlers
        this.eventHandlers.set('bulk-delete', () => this.bulkDelete());
        this.eventHandlers.set('bulk-publish', () => this.bulkPublish());
        this.eventHandlers.set('bulk-draft', () => this.bulkDraft());
        this.eventHandlers.set('schedule-content', (id) => this.scheduleContent(id));
        this.eventHandlers.set('duplicate-content', (id) => this.duplicateContent(id));
        this.eventHandlers.set('export-content', () => this.exportContent());
        this.eventHandlers.set('toggle-select', (id) => this.toggleItemSelection(id));
        this.eventHandlers.set('select-all', () => this.selectAllItems());
        this.eventHandlers.set('clear-selection', () => this.clearSelection());
        
        console.log('🎯 Event handlers registered:', Array.from(this.eventHandlers.keys()));
    }

    // Enhanced setup methods
    setupSearchAndFilters() {
        console.log('🔍 Setting up search and filters...');
        
        // Create search bar if it doesn't exist
        this.createSearchInterface();
        
        // Setup search event listeners
        const searchInput = document.getElementById('cms-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchFilters.query = e.target.value;
                    this.applyFilters();
                }, 300);
            });
        }
        
        // Setup filter dropdowns
        const typeFilter = document.getElementById('cms-type-filter');
        const statusFilter = document.getElementById('cms-status-filter');
        const dateFilter = document.getElementById('cms-date-filter');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.searchFilters.type = e.target.value;
                this.applyFilters();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.searchFilters.status = e.target.value;
                this.applyFilters();
            });
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.searchFilters.dateRange = e.target.value;
                this.applyFilters();
            });
        }
    }

    setupBulkOperations() {
        console.log('📦 Setting up bulk operations...');
        
        // Create bulk operations toolbar
        this.createBulkOperationsToolbar();
        
        // Update toolbar visibility based on selection
        this.updateBulkOperationsVisibility();
    }

    setupKeyboardShortcuts() {
        // Guard against double setup
        if (this._keyboardSetup) return;
        this._keyboardSetup = true;
        
        console.log('⌨️ Setting up keyboard shortcuts...');
        
        // Store handler reference for cleanup
        document.addEventListener('keydown', this.keyboardHandler);
    }

    handleKeyboard(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Ctrl/Cmd + A - Select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            this.selectAllItems();
        }
        
        // Escape - Clear selection
        if (e.key === 'Escape') {
            this.clearSelection();
        }
        
        // Delete - Delete selected items
        if (e.key === 'Delete' && this.selectedItems.size > 0) {
            e.preventDefault();
            this.bulkDelete();
        }
        
        // Ctrl/Cmd + N - New content (based on current tab)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            
            // Proper tab to content type mapping
            const tabToType = {
                'articles': 'article',
                'events': 'event', 
                'opportunities': 'opportunity'
            };
            
            const contentType = tabToType[this.currentTab];
            if (contentType) {
                this.showCreateForm(contentType);
            }
        }
        
        // Ctrl/Cmd + F - Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('cms-search');
            if (searchInput) searchInput.focus();
        }
    }

    // Helper methods for tab and collection management
    getActiveListSelector() {
        const map = {
            articles: '#articles-list',
            events: '#events-list',
            opportunities: '#opportunities-list',
            projects: '#projects-list',
            media: '#media-library',
            innovation: '#innovation-content',
            communications: '#communications-content',
            members: '#members-content',
        };
        return map[this.currentTab] || null;
    }

    normalizeCollection(name) {
        // Ensure collection names are plural and consistent
        const plural = new Set([
            'articles', 'events', 'opportunities', 'projects', 
            'ideas', 'messages', 'members', 'media', 'challenges'
        ]);
        
        if (plural.has(name)) return name;
        
        // Handle singular to plural conversion
        const singularToPlural = {
            'article': 'articles',
            'event': 'events',
            'opportunity': 'opportunities',
            'project': 'projects',
            'idea': 'ideas',
            'message': 'messages',
            'member': 'members',
            'challenge': 'challenges'
        };
        
        return singularToPlural[name] || (name.endsWith('s') ? name : `${name}s`);
    }

    collectionForType(type) {
        // Centralized type → collection mapping
        return this.normalizeCollection(type);
    }

    getCurrentCollection() {
        const map = {
            'articles': 'articles',
            'events': 'events',
            'opportunities': 'opportunities',
            'projects': 'projects',
            'innovation': 'ideas',
            'communications': 'messages',
            'members': 'members',
            'media': 'media'
        };
        return map[this.currentTab] || null;
    }

    setItemSelection(id, selected) {
        if (!id) return;
        if (selected) this.selectedItems.add(id);
        else this.selectedItems.delete(id);
        
        this.updateBulkOperationsVisibility();
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        // Only update checkboxes inside the active list to avoid toggling hidden tabs
        const selector = this.getActiveListSelector();
        if (!selector) return;
        
        const checkboxes = document.querySelectorAll(`${selector} .content-item-checkbox`);
        checkboxes.forEach(cb => {
            const id = cb.dataset.id;
            cb.checked = this.selectedItems.has(id);
        });
    }

    clearSelection() {
        this.selectedItems.clear();
        
        // Uncheck all checkboxes
        const selector = this.getActiveListSelector();
        if (selector) {
            const checkboxes = document.querySelectorAll(`${selector} .content-item-checkbox`);
            checkboxes.forEach(cb => cb.checked = false);
        }
        
        this.updateBulkOperationsVisibility();
        this.updateSelectionUI();
    }

    selectAllItems() {
        const selector = this.getActiveListSelector();
        if (!selector) {
            console.warn('No active list selector for tab:', this.currentTab);
            return;
        }
        
        const checkboxes = document.querySelectorAll(`${selector} .content-item-checkbox`);
        checkboxes.forEach(cb => {
            const id = cb.dataset.id;
            if (!id) return;
            this.selectedItems.add(id);
            cb.checked = true;
        });
        
        this.updateBulkOperationsVisibility();
        this.updateSelectionUI();
    }

    updateBulkOperationsVisibility() {
        const toolbar = document.getElementById('cms-bulk-toolbar');
        const selectionCount = document.getElementById('selection-count');
        if (!toolbar) return;
        
        const count = this.selectedItems.size;
        toolbar.style.display = count > 0 ? 'flex' : 'none';
        if (selectionCount) selectionCount.textContent = `${count} selected`;
    }

    async initializeRealTimeFeatures() {
        console.log('🔄 Initializing real-time features...');
        
        try {
            // Setup real-time subscriptions for content updates
            await this.setupRealTimeSubscriptions();
            
            // Initialize content scheduling system
            this.initializeContentScheduling();
            
            // Setup collaborative editing indicators
            this.setupCollaborativeFeatures();
            
        } catch (error) {
            console.warn('⚠️ Real-time features initialization failed:', error);
            // Continue without real-time features
        }
    }

    async setupRealTimeSubscriptions() {
        // Guard against missing CMSSupabase
        if (!window.CMSSupabase || typeof window.CMSSupabase.isConnected !== 'function') {
            console.log('📡 CMSSupabase not available, skipping real-time subscriptions');
            return;
        }
        
        if (!window.CMSSupabase.isConnected()) {
            console.log('📡 Supabase not connected, skipping real-time subscriptions');
            return;
        }
        
        try {
            const sb = window.CMSSupabase;
            
            // Subscribe to articles changes
            const articlesSubscription = await sb.subscribeToChanges('articles', (payload) => {
                this.handleRealTimeUpdate('articles', payload);
            });
            
            // Subscribe to events changes
            const eventsSubscription = await sb.subscribeToChanges('events', (payload) => {
                this.handleRealTimeUpdate('events', payload);
            });
            
            // Subscribe to opportunities changes
            const opportunitiesSubscription = await sb.subscribeToChanges('opportunities', (payload) => {
                this.handleRealTimeUpdate('opportunities', payload);
            });
            
            this.realTimeSubscriptions.set('articles', articlesSubscription);
            this.realTimeSubscriptions.set('events', eventsSubscription);
            this.realTimeSubscriptions.set('opportunities', opportunitiesSubscription);
            
            console.log('✅ Real-time subscriptions established');
            
        } catch (error) {
            console.error('❌ Failed to setup real-time subscriptions:', error);
        }
    }

    handleRealTimeUpdate(type, payload) {
        console.log(`🔄 Real-time update for ${type}:`, payload);
        
        // Show notification for changes made by other users
        const currentUser = window.authManager?.getUser();
        if (payload.new?.updated_by !== currentUser?.id) {
            // Use proper singular labels
            const labels = {
                'articles': 'article',
                'events': 'event',
                'opportunities': 'opportunity',
                'projects': 'project',
                'ideas': 'idea',
                'messages': 'message'
            };
            
            const typeLabel = labels[type] || type;
            const title = payload.new?.title || 'Unknown';
            
            this.notifications.show(
                `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} "${title}" was updated by another user`,
                'info'
            );
        }
        
        // Refresh current tab if it matches the updated content type
        const tabName = this.normalizeCollection(type);
        if (this.currentTab === tabName) {
            this.loadTabContent(this.currentTab);
        }
        
        // Update dashboard stats
        if (this.currentTab === 'dashboard') {
            this.updateDashboardStats();
        }
    }

    initializeContentScheduling() {
        console.log('📅 Initializing content scheduling...');
        
        // Check for scheduled content every minute
        const schedulingInterval = setInterval(() => {
            this.processScheduledContent();
        }, 60000);
        
        this.intervals.add(schedulingInterval);
        
        // Process any pending scheduled content on startup
        this.processScheduledContent();
    }

    async processScheduledContent() {
        const now = new Date();
        const scheduledItems = Array.from(this.scheduledContent.entries());
        
        for (const [id, scheduledData] of scheduledItems) {
            if (new Date(scheduledData.publishAt) <= now) {
                try {
                    await this.publishScheduledContent(id, scheduledData);
                    this.scheduledContent.delete(id);
                    
                    this.notifications.show(
                        `Scheduled ${scheduledData.type} "${scheduledData.title}" has been published`,
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Failed to publish scheduled content:', error);
                    this.notifications.show(
                        `Failed to publish scheduled ${scheduledData.type}: ${error.message}`,
                        'error'
                    );
                }
            }
        }
    }

    setupCollaborativeFeatures() {
        console.log('👥 Setting up collaborative features...');
        
        // Show active editors indicator
        this.showActiveEditors();
        
        // Setup conflict resolution
        this.setupConflictResolution();
    }

    setupAutoSave() {
        console.log('💾 Setting up auto-save...');
        
        // Auto-save drafts every 30 seconds
        const autoSaveInterval = setInterval(() => {
            this.autoSaveDrafts();
        }, 30000);
        
        this.intervals.add(autoSaveInterval);
    }

    setupPeriodicSync() {
        console.log('🔄 Setting up periodic sync...');
        
        // Sync with server every 5 minutes
        const syncInterval = setInterval(() => {
            this.syncWithServer();
        }, 300000);
        
        this.intervals.add(syncInterval);
    }

    // Enhanced UI creation methods
    createSearchInterface() {
        const existingSearch = document.getElementById('cms-search-container');
        if (existingSearch) return;
        
        // Create single shared search interface
        const searchContainer = document.createElement('div');
        searchContainer.id = 'cms-search-container';
        searchContainer.className = 'ig-card';
        searchContainer.style.cssText = `
            margin-bottom: 24px;
            padding: 20px;
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
            position: sticky;
            top: 80px;
            z-index: 100;
            background: var(--ig-white);
        `;
        
        // Create search input container
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = 'flex: 1; min-width: 300px;';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'cms-search';
        searchInput.placeholder = 'Search content...';
        searchInput.style.cssText = `
            width: 100%; 
            padding: 12px 16px; 
            border: 1px solid var(--ig-border); 
            border-radius: var(--ig-radius-sm); 
            font-size: 14px;
        `;
        
        inputContainer.appendChild(searchInput);
        
        // Create filter dropdowns safely
        const typeFilter = this.createFilterSelect('cms-type-filter', [
            { value: 'all', text: 'All Types' },
            { value: 'article', text: 'Articles' },
            { value: 'event', text: 'Events' },
            { value: 'opportunity', text: 'Opportunities' }
        ]);
        
        const statusFilter = this.createFilterSelect('cms-status-filter', [
            { value: 'all', text: 'All Status' },
            { value: 'published', text: 'Published' },
            { value: 'draft', text: 'Draft' },
            { value: 'scheduled', text: 'Scheduled' }
        ]);
        
        const dateFilter = this.createFilterSelect('cms-date-filter', [
            { value: 'all', text: 'All Time' },
            { value: 'today', text: 'Today' },
            { value: 'week', text: 'This Week' },
            { value: 'month', text: 'This Month' },
            { value: 'year', text: 'This Year' }
        ]);
        
        // Assemble search interface
        searchContainer.appendChild(inputContainer);
        searchContainer.appendChild(typeFilter);
        searchContainer.appendChild(statusFilter);
        searchContainer.appendChild(dateFilter);
        
        // Insert once at the top of the main container
        const mainContainer = document.querySelector('.ig-container');
        if (mainContainer) {
            const firstChild = mainContainer.firstElementChild;
            if (firstChild) {
                mainContainer.insertBefore(searchContainer, firstChild);
            } else {
                mainContainer.appendChild(searchContainer);
            }
        }
        
        // Show/hide based on current tab
        this.updateSearchVisibility();
    }

    updateSearchVisibility() {
        const searchContainer = document.getElementById('cms-search-container');
        if (!searchContainer) return;
        
        // Show search only for content tabs (not dashboard or media)
        const showSearch = ['articles', 'events', 'opportunities', 'innovation', 'communications', 'members'].includes(this.currentTab);
        searchContainer.style.display = showSearch ? 'flex' : 'none';
    }

    createFilterSelect(id, options) {
        const select = document.createElement('select');
        select.id = id;
        select.style.cssText = `
            padding: 12px; 
            border: 1px solid var(--ig-border); 
            border-radius: var(--ig-radius-sm);
        `;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        
        return select;
    }

    createBulkOperationsToolbar() {
        const existingToolbar = document.getElementById('cms-bulk-toolbar');
        if (existingToolbar) return;
        
        const toolbar = document.createElement('div');
        toolbar.id = 'cms-bulk-toolbar';
        toolbar.className = 'ig-card';
        toolbar.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            padding: 16px 24px;
            display: none;
            align-items: center;
            gap: 16px;
            background: var(--ig-white);
            border: 1px solid var(--ig-border);
            border-radius: var(--ig-radius-lg);
            box-shadow: var(--ig-shadow-heavy);
        `;
        
        // Create selection count display
        const selectionCount = document.createElement('span');
        selectionCount.id = 'selection-count';
        selectionCount.style.cssText = 'font-weight: 600; color: var(--ig-dark);';
        selectionCount.textContent = '0 selected';
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 8px;';
        
        // Create buttons safely
        const buttons = [
            { action: 'bulk-publish', icon: 'fas fa-eye', text: 'Publish', className: 'ig-btn ig-btn-primary' },
            { action: 'bulk-draft', icon: 'fas fa-edit', text: 'Draft', className: 'ig-btn' },
            { action: 'bulk-delete', icon: 'fas fa-trash', text: 'Delete', className: 'ig-btn ig-btn-delete' },
            { action: 'export-content', icon: 'fas fa-download', text: 'Export', className: 'ig-btn' },
            { action: 'clear-selection', icon: 'fas fa-times', text: 'Clear', className: 'ig-btn' }
        ];
        
        buttons.forEach(buttonConfig => {
            const button = document.createElement('button');
            button.setAttribute('data-action', buttonConfig.action);
            button.className = buttonConfig.className;
            
            const icon = document.createElement('i');
            icon.className = buttonConfig.icon;
            
            button.appendChild(icon);
            button.appendChild(document.createTextNode(` ${buttonConfig.text}`));
            
            buttonContainer.appendChild(button);
        });
        
        toolbar.appendChild(selectionCount);
        toolbar.appendChild(buttonContainer);
        
        document.body.appendChild(toolbar);
    }

    async switchTab(tabName) {
        // Prevent concurrent tab switches
        if (this.isTabSwitching) {
            console.log('Tab switch already in progress, ignoring');
            return;
        }
        
        this.isTabSwitching = true;
        
        try {
            // Update active tab button using CSS classes
            document.querySelectorAll('.cms-tab').forEach(btn => {
                btn.classList.remove('active');
            });

            const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

            // Hide all tab contents
            document.querySelectorAll('.cms-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show selected tab content
            const selectedTab = document.getElementById(`${tabName}-tab`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }

            this.currentTab = tabName;
            
            // Clear selection to prevent state leaks across tabs
            this.clearSelection();
            this.updateBulkOperationsVisibility();
            
            // Update search visibility
            this.updateSearchVisibility();
            
            // Load content after UI updates
            await this.loadTabContent(tabName);
            
        } finally {
            this.isTabSwitching = false;
        }
    }

    async loadTabContent(tabName) {
        // Show loading state
        const tabElement = document.getElementById(`${tabName}-tab`);
        if (tabElement) {
            const existingContent = tabElement.querySelector('.tab-loading');
            if (!existingContent) {
                const loadingElement = document.createElement('div');
                loadingElement.className = 'tab-loading';
                loadingElement.style.cssText = `
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    display: flex; align-items: center; gap: 0.5rem; color: #6b7280;
                `;
                
                const spinner = document.createElement('div');
                spinner.style.cssText = `
                    width: 20px; height: 20px; border: 2px solid #e5e7eb;
                    border-top: 2px solid #3b82f6; border-radius: 50%;
                    animation: spin 1s linear infinite;
                `;
                
                const text = document.createElement('span');
                text.textContent = 'Loading...';
                
                loadingElement.appendChild(spinner);
                loadingElement.appendChild(text);
                tabElement.appendChild(loadingElement);
            }
        }
        
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
                case 'projects':
                    await this.loadProjects();
                    break;
                case 'opportunities':
                    await this.loadOpportunities();
                    break;
                case 'innovation':
                    await this.loadInnovationHub();
                    break;
                case 'communications':
                    await this.loadCommunications();
                    break;
                case 'members':
                    await this.loadMembers();
                    break;
                case 'media':
                    await this.loadMediaLibrary();
                    break;
                default:
                    throw new Error(`Unknown tab: ${tabName}`);
            }
        } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
            
            // Show user-friendly error message
            let errorMessage = `Failed to load ${tabName}`;
            if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage += ' - please check your internet connection';
            } else if (error.message.includes('permission') || error.message.includes('auth')) {
                errorMessage += ' - you may not have permission to view this content';
            }
            
            this.notifications.show(errorMessage, 'error');
            
            // Show error state in tab
            if (tabElement) {
                const errorElement = document.createElement('div');
                errorElement.className = 'tab-error';
                errorElement.style.cssText = `
                    text-align: center; padding: 2rem; color: #ef4444;
                `;
                errorElement.textContent = errorMessage;
                
                // Replace loading with error
                const loadingElement = tabElement.querySelector('.tab-loading');
                if (loadingElement) {
                    tabElement.replaceChild(errorElement, loadingElement);
                }
            }
        } finally {
            // Remove loading state
            if (tabElement) {
                const loadingElement = tabElement.querySelector('.tab-loading');
                if (loadingElement) {
                    loadingElement.remove();
                }
            }
        }
    }

    // Dashboard methods
    async updateDashboardStats() {
        const stats = CMSData.getStats();
        
        // Update counters with animation
        CMSUI.animateCounter('articles-count', stats.articles);
        CMSUI.animateCounter('events-count', stats.events);
        CMSUI.animateCounter('opportunities-count', stats.opportunities);
        CMSUI.animateCounter('ideas-count', stats.ideas || 0);
        CMSUI.animateCounter('members-count', stats.members || 0);
        CMSUI.animateCounter('media-count', stats.media);
        
        // Load recent activity
        await this.loadRecentActivity();
    }

    async loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        const recentItems = CMSData.getRecentActivity(5);
        
        // Use replaceChildren instead of innerHTML = ''
        container.replaceChildren();
        
        recentItems.forEach(item => {
            const activityItem = CMSUI.createActivityItem(item, () => {
                // Use normalizeCollection to handle opportunity → opportunities correctly
                this.switchTab(this.normalizeCollection(item.type));
            });
            container.appendChild(activityItem);
        });
    }

    // Content loading methods
    async loadArticles() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const realArticles = await CMSData.getArticles();
            // Merge with mock data (uses real if available, mock as fallback)
            const allArticles = CMSMockData.mergeWithRealData(realArticles, 'articles');
            const filteredArticles = this.filterItems(allArticles);
            this.renderArticles(filteredArticles);
        } catch (error) {
            console.error('Error loading articles:', error);
            // On error, use mock data
            const mockArticles = CMSMockData.get('articles');
            this.renderArticles(mockArticles);
        }
    }

    renderArticles(articles) {
        const container = document.getElementById('articles-list');
        container.replaceChildren(); // Safer than innerHTML = ''

        if (!articles.length) {
            container.appendChild(CMSUI.createEmptyState('No articles found. Create your first article!'));
            return;
        }

        // Add single-column grid layout for articles
        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'articles');

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

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const realEvents = await CMSData.getEvents();
            const allEvents = CMSMockData.mergeWithRealData(realEvents, 'events');
            const filteredEvents = this.filterItems(allEvents);
            this.renderEvents(filteredEvents);
        } catch (error) {
            console.error('Error loading events:', error);
            const mockEvents = CMSMockData.get('events');
            this.renderEvents(mockEvents);
        }
    }

    renderEvents(events) {
        const container = document.getElementById('events-list');
        container.replaceChildren(); // Safer than innerHTML = ''

        if (!events.length) {
            container.appendChild(CMSUI.createEmptyState('No events found. Create your first event!'));
            return;
        }

        // Add 2-column grid layout for events
        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'events');

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

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const realOpportunities = await CMSData.getOpportunities();
            const allOpportunities = CMSMockData.mergeWithRealData(realOpportunities, 'opportunities');
            const filteredOpportunities = this.filterItems(allOpportunities);
            this.renderOpportunities(filteredOpportunities);
        } catch (error) {
            console.error('Error loading opportunities:', error);
            const mockOpportunities = CMSMockData.get('opportunities');
            this.renderOpportunities(mockOpportunities);
        }
    }

    renderOpportunities(opportunities) {
        const container = document.getElementById('opportunities-list');
        container.replaceChildren(); // Safer than innerHTML = ''

        if (!opportunities.length) {
            container.appendChild(CMSUI.createEmptyState('No opportunities found. Post your first opportunity!'));
            return;
        }

        // Add single-column grid layout for opportunities
        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'opportunities');

        opportunities.forEach(opportunity => {
            const item = CMSUI.createContentItem(opportunity, 'opportunity', {
                onView: (data) => this.viewContent(data, 'opportunity'),
                onEdit: (id) => this.editOpportunity(id),
                onDelete: (id) => this.deleteOpportunity(id)
            });
            container.appendChild(item);
        });
    }

    async loadProjects() {
        const container = document.getElementById('projects-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const realProjects = await CMSAPI.getProjects();
            const allProjects = CMSMockData.mergeWithRealData(realProjects, 'projects');
            const filteredProjects = this.filterItems(allProjects);
            this.renderProjects(filteredProjects);
        } catch (error) {
            console.error('Error loading projects:', error);
            const mockProjects = CMSMockData.get('projects');
            this.renderProjects(mockProjects);
        }
    }

    renderProjects(projects) {
        const container = document.getElementById('projects-list');
        container.replaceChildren();

        if (!projects.length) {
            container.appendChild(CMSUI.createEmptyState('No projects found. Create your first project!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'projects');
        
        // Force grid layout with inline styles as fallback
        const updateGridColumns = () => {
            const width = window.innerWidth;
            if (width <= 768) {
                container.style.gridTemplateColumns = '1fr';
            } else if (width <= 1100) {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                container.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        };
        
        container.style.display = 'grid';
        container.style.gap = '2rem';
        container.style.width = '100%';
        container.style.padding = '1rem 0';
        updateGridColumns();
        
        // Update on window resize
        window.addEventListener('resize', updateGridColumns);

        projects.forEach(project => {
            const item = CMSUI.createContentItem(project, 'project', {
                onView: (data) => this.viewContent(data, 'project'),
                onEdit: (id) => this.editProject(id),
                onDelete: (id) => this.deleteProject(id)
            });
            container.appendChild(item);
        });
    }

    async loadMediaLibrary() {
        const container = document.getElementById('media-library');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const media = await CMSData.getMedia();
            this.renderMediaLibrary(media);
        } catch (error) {
            container.replaceChildren();
            container.appendChild(CMSUI.createErrorElement(error.message));
        }
    }

    renderMediaLibrary(media) {
        const container = document.getElementById('media-library');
        container.replaceChildren(); // Safer than innerHTML = ''

        if (!media.length) {
            container.appendChild(CMSUI.createEmptyState('No media files found. Upload your first file!'));
            return;
        }

        // Add grid layout for media with auto-fill columns
        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'media');
        container.style.cssText = `
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
        `;

        media.forEach(file => {
            const mediaItem = CMSUI.createMediaItem(file, {
                onView: (file) => this.viewMedia(file),
                onDelete: (id) => this.deleteMedia(id)
            });
            container.appendChild(mediaItem);
        });
    }

    // New tab loading methods
    async loadInnovationHub() {
        const container = document.getElementById('innovation-content');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            // Load innovation data (ideas and challenges)
            const realIdeas = await CMSData.getIdeas();
            const realChallenges = await CMSData.getChallenges();
            
            const ideas = CMSMockData.mergeWithRealData(realIdeas, 'ideas');
            const challenges = CMSMockData.mergeWithRealData(realChallenges, 'challenges');
            
            // Update stats
            this.updateInnovationStats(ideas, challenges);
            
            this.renderInnovationContent(ideas, challenges);
        } catch (error) {
            console.error('Error loading innovation hub:', error);
            const mockIdeas = CMSMockData.get('ideas');
            const mockChallenges = CMSMockData.get('challenges');
            this.updateInnovationStats(mockIdeas, mockChallenges);
            this.renderInnovationContent(mockIdeas, mockChallenges);
        }
    }

    renderInnovationContent(ideas, challenges) {
        const container = document.getElementById('innovation-content');
        container.replaceChildren();

        if (!ideas.length && !challenges.length) {
            container.appendChild(CMSUI.createEmptyState('No innovation content found. Create your first challenge!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'innovation');

        // Render challenges first
        challenges.forEach(challenge => {
            const item = CMSUI.createContentItem(challenge, 'challenge', {
                onView: (data) => this.viewContent(data, 'challenge'),
                onEdit: (id) => this.editChallenge(id),
                onDelete: (id) => this.deleteChallenge(id)
            });
            container.appendChild(item);
        });

        // Then render ideas
        ideas.forEach(idea => {
            const item = CMSUI.createContentItem(idea, 'idea', {
                onView: (data) => this.viewContent(data, 'idea'),
                onApprove: (id) => this.approveIdea(id),
                onReject: (id) => this.rejectIdea(id)
            });
            container.appendChild(item);
        });
    }

    updateInnovationStats(ideas, challenges) {
        const totalIdeas = ideas.length;
        const pendingIdeas = ideas.filter(idea => idea.status === 'pending').length;
        const approvedIdeas = ideas.filter(idea => idea.status === 'approved').length;
        const activeChallenges = challenges.filter(challenge => challenge.status === 'active').length;

        CMSUI.animateCounter('total-ideas-count', totalIdeas);
        CMSUI.animateCounter('pending-ideas-count', pendingIdeas);
        CMSUI.animateCounter('approved-ideas-count', approvedIdeas);
        CMSUI.animateCounter('active-challenges-count', activeChallenges);
    }

    async loadCommunications() {
        const container = document.getElementById('communications-content');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            // Load communication data
            const realMessages = await CMSData.getMessages();
            const messages = CMSMockData.mergeWithRealData(realMessages, 'communications');
            
            // Update stats
            this.updateCommunicationStats(messages);
            
            this.renderCommunications(messages);
        } catch (error) {
            console.error('Error loading communications:', error);
            const mockMessages = CMSMockData.get('communications');
            this.updateCommunicationStats(mockMessages);
            this.renderCommunications(mockMessages);
        }
    }

    renderCommunications(messages) {
        const container = document.getElementById('communications-content');
        container.replaceChildren();

        if (!messages.length) {
            container.appendChild(CMSUI.createEmptyState('No messages sent yet. Send your first announcement!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'communications');

        messages.forEach(message => {
            const item = CMSUI.createContentItem(message, 'message', {
                onView: (data) => this.viewContent(data, 'message'),
                onResend: (id) => this.resendMessage(id),
                onDelete: (id) => this.deleteMessage(id)
            });
            container.appendChild(item);
        });
    }

    updateCommunicationStats(messages) {
        const totalMessages = messages.length;
        const thisMonth = messages.filter(msg => {
            const msgDate = new Date(msg.sent_at);
            const now = new Date();
            return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
        }).length;
        
        // Calculate open rate (mock data for now)
        const openRate = messages.length > 0 ? Math.round((messages.filter(msg => msg.opened).length / messages.length) * 100) : 0;
        const activeMembers = 150; // This would come from actual member data

        CMSUI.animateCounter('total-messages-count', totalMessages);
        CMSUI.animateCounter('recent-messages-count', thisMonth);
        document.getElementById('message-open-rate').textContent = `${openRate}%`;
        CMSUI.animateCounter('active-members-count', activeMembers);
    }

    async loadMembers() {
            const container = document.getElementById('members-content');
            if (!container) {
                console.error('❌ Members container #members-content not found!');
                return;
            }

            console.log('🔄 Loading members...');
            container.replaceChildren();
            container.appendChild(CMSUI.createLoadingElement());

            try {
                // Clear cache to ensure fresh data
                CMSData.clearCache('members');
                console.log('✅ Cache cleared');
                
                // Load ONLY real member data from database
                console.log('📡 Fetching members from API...');
                const members = await CMSData.getMembers();

                console.log(`📊 Loaded ${members.length} real members from database`);
                
                if (members.length > 0) {
                    console.log('👤 Sample member:', members[0]);
                }

                // Update stats
                this.updateMemberStats(members);

                // Render members
                this.renderMembers(members);

                // Show message if no members found
                if (members.length === 0) {
                    console.log('⚠️ No members in database - showing empty state');
                    container.innerHTML = `
                        <div style="text-align: center; padding: 3rem; color: #666;">
                            <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                            <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No members found in database</p>
                            <p style="font-size: 0.9rem; opacity: 0.7;">Members will appear here once users register</p>
                        </div>
                    `;
                } else {
                    console.log('✅ Members rendered successfully');
                }
            } catch (error) {
                console.error('❌ Error loading members:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Failed to load members</p>
                        <p style="font-size: 0.9rem; opacity: 0.7;">${error.message}</p>
                        <button onclick="window.cmsManager.loadMembers()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        }


    renderMembers(members) {
        const container = document.getElementById('members-content');
        container.replaceChildren();

        if (!members.length) {
            container.appendChild(CMSUI.createEmptyState('No members found.'));
            return;
        }

        // Create table wrapper
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'members-table-wrapper';
        tableWrapper.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        `;

        // Create table
        const table = document.createElement('table');
        table.className = 'members-table';
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        `;

        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Name</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Email</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Student ID</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">College</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Role</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Status</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Joined</th>
                <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: #495057; white-space: nowrap;">Actions</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        
        members.forEach((member, index) => {
            const row = document.createElement('tr');
            row.style.cssText = `
                border-bottom: 1px solid #e9ecef;
                transition: background-color 0.2s;
            `;
            row.onmouseenter = () => row.style.backgroundColor = '#f8f9fa';
            row.onmouseleave = () => row.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafbfc';
            row.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafbfc';

            // Format date
            const joinDate = member.created_at ? new Date(member.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }) : 'N/A';

            // Status badge
            const statusColors = {
                'active': '#28a745',
                'pending': '#ffc107',
                'inactive': '#6c757d',
                'suspended': '#dc3545'
            };
            const statusColor = statusColors[member.membership_status] || '#6c757d';

            // Role badge
            const roleColors = {
                'admin': '#007bff',
                'executive': '#6f42c1',
                'member': '#17a2b8',
                'guest': '#6c757d'
            };
            const roleColor = roleColors[member.role] || '#17a2b8';

            row.innerHTML = `
                <td style="padding: 12px 16px; color: #212529; font-weight: 500;">
                    ${this.sanitizeInput(member.name || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057;">
                    ${this.sanitizeInput(member.email || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057; font-family: monospace;">
                    ${this.sanitizeInput(member.registration_number || member.student_id || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057;">
                    ${this.sanitizeInput(member.college || 'N/A')}
                </td>
                <td style="padding: 12px 16px;">
                    <span style="
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        background: ${roleColor}15;
                        color: ${roleColor};
                    ">${this.sanitizeInput(member.role || 'member')}</span>
                </td>
                <td style="padding: 12px 16px;">
                    <span style="
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: capitalize;
                        background: ${statusColor}15;
                        color: ${statusColor};
                    ">${this.sanitizeInput(member.membership_status || 'pending')}</span>
                </td>
                <td style="padding: 12px 16px; color: #6c757d; font-size: 0.85rem;">
                    ${joinDate}
                </td>
                <td style="padding: 12px 16px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button 
                            onclick="window.cmsManager.viewMember(${JSON.stringify(member).replace(/"/g, '&quot;')})"
                            style="
                                padding: 6px 12px;
                                background: #007bff;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.8rem;
                                transition: background 0.2s;
                            "
                            onmouseover="this.style.background='#0056b3'"
                            onmouseout="this.style.background='#007bff'"
                            title="View Details"
                        >
                            <i class="fas fa-eye"></i>
                        </button>
                        <button 
                            onclick="window.cmsManager.messageMember('${member.id}')"
                            style="
                                padding: 6px 12px;
                                background: #28a745;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.8rem;
                                transition: background 0.2s;
                            "
                            onmouseover="this.style.background='#218838'"
                            onmouseout="this.style.background='#28a745'"
                            title="Send Message"
                        >
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button 
                            onclick="window.cmsManager.editMember('${member.id}')"
                            style="
                                padding: 6px 12px;
                                background: #ffc107;
                                color: #212529;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.8rem;
                                transition: background 0.2s;
                            "
                            onmouseover="this.style.background='#e0a800'"
                            onmouseout="this.style.background='#ffc107'"
                            title="Edit Member"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        
        // Add summary footer
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 12px 16px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 0.85rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        footer.innerHTML = `
            <span>Showing ${members.length} member${members.length !== 1 ? 's' : ''}</span>
            <span>Total Members: ${members.length}</span>
        `;
        tableWrapper.appendChild(footer);

        container.replaceChildren(tableWrapper);
        container.style.padding = '0';
    }

    updateMemberStats(members) {
        const totalMembers = members.length;
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const activeThisMonth = members.filter(member => {
            const lastActive = new Date(member.last_active);
            return lastActive >= thisMonth;
        }).length;
        
        const newThisMonth = members.filter(member => {
            const joinDate = new Date(member.created_at);
            return joinDate >= thisMonth;
        }).length;
        
        // Calculate engagement rate (mock calculation)
        const engagementRate = totalMembers > 0 ? Math.round((activeThisMonth / totalMembers) * 100) : 0;

        // Update stats only if elements exist
        const totalMembersEl = document.getElementById('total-members-count');
        const activeMembersEl = document.getElementById('active-members-stat');
        const newMembersEl = document.getElementById('new-members-count');
        const engagementRateEl = document.getElementById('engagement-rate');
        
        if (totalMembersEl) CMSUI.animateCounter('total-members-count', totalMembers);
        if (activeMembersEl) CMSUI.animateCounter('active-members-stat', activeThisMonth);
        if (newMembersEl) CMSUI.animateCounter('new-members-count', newThisMonth);
        if (engagementRateEl) engagementRateEl.textContent = `${engagementRate}%`;
        
        console.log('📊 Member stats:', { totalMembers, activeThisMonth, newThisMonth, engagementRate });
    }

    // Event handlers
    viewContentById(id, type) {
        console.log(`🔍 Viewing ${type} with ID:`, id);
        
        try {
            const collection = this.collectionForType(type);
            const data = CMSData.findById(collection, id);
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
            window.open(file.url, '_blank', 'noopener,noreferrer');
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
            
            // Create proper edit modal instead of prompt()
            this.showEditModal('article', article, async (updatedData) => {
                try {
                    // Validate input
                    this.validateTitle(updatedData.title);
                    if (updatedData.content) {
                        this.validateContent(updatedData.content);
                    }
                    
                    // Update with validated data
                    await CMSData.updateItem('articles', id, updatedData);
                    this.notifications.show('Article updated successfully!', 'success');
                    this.loadArticles();
                    console.log(`✅ Article updated:`, updatedData.title);
                    
                } catch (error) {
                    console.error(`❌ Error updating article:`, error);
                    this.notifications.show(`Update failed: ${error.message}`, 'error');
                    throw error; // Prevent modal from closing
                }
            });
            
        } catch (error) {
            console.error(`❌ Error editing article:`, error);
            this.notifications.show(`Error editing article: ${error.message}`, 'error');
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
            
            // Create proper edit modal instead of prompt()
            this.showEditModal('event', event, async (updatedData) => {
                try {
                    // Validate input
                    this.validateTitle(updatedData.title);
                    if (updatedData.content) {
                        this.validateContent(updatedData.content);
                    }
                    
                    // Update with validated data
                    await CMSData.updateItem('events', id, updatedData);
                    this.notifications.show('Event updated successfully!', 'success');
                    this.loadEvents();
                    console.log(`✅ Event updated:`, updatedData.title);
                    
                } catch (error) {
                    console.error(`❌ Error updating event:`, error);
                    this.notifications.show(`Update failed: ${error.message}`, 'error');
                    throw error; // Prevent modal from closing
                }
            });
            
        } catch (error) {
            console.error(`❌ Error editing event:`, error);
            this.notifications.show(`Error editing event: ${error.message}`, 'error');
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
            
            // Create proper edit modal instead of prompt()
            this.showEditModal('opportunity', opportunity, async (updatedData) => {
                try {
                    // Validate input
                    this.validateTitle(updatedData.title);
                    if (updatedData.content) {
                        this.validateContent(updatedData.content);
                    }
                    if (updatedData.applicationLink) {
                        this.validateUrl(updatedData.applicationLink);
                    }
                    
                    // Update with validated data
                    await CMSData.updateItem('opportunities', id, updatedData);
                    this.notifications.show('Opportunity updated successfully!', 'success');
                    this.loadOpportunities();
                    console.log(`✅ Opportunity updated:`, updatedData.title);
                    
                } catch (error) {
                    console.error(`❌ Error updating opportunity:`, error);
                    this.notifications.show(`Update failed: ${error.message}`, 'error');
                    throw error; // Prevent modal from closing
                }
            });
            
        } catch (error) {
            console.error(`❌ Error editing opportunity:`, error);
            this.notifications.show(`Error editing opportunity: ${error.message}`, 'error');
        }
    }

    editProject(id) {
        console.log(`✏️ Editing project with ID:`, id);
        
        try {
            const project = CMSData.findById('projects', id);
            if (!project) {
                this.notifications.show('Project not found', 'error');
                return;
            }
            
            console.log(`✅ Found project:`, project.title);
            
            this.showEditModal('project', project, async (updatedData) => {
                try {
                    this.validateTitle(updatedData.title);
                    if (updatedData.content) {
                        this.validateContent(updatedData.content);
                    }
                    
                    await CMSAPI.updateProject(id, updatedData);
                    this.notifications.show('Project updated successfully!', 'success');
                    this.loadProjects();
                    console.log(`✅ Project updated:`, updatedData.title);
                    
                } catch (error) {
                    console.error(`❌ Error updating project:`, error);
                    this.notifications.show(`Update failed: ${error.message}`, 'error');
                    throw error;
                }
            });
            
        } catch (error) {
            console.error(`❌ Error editing project:`, error);
            this.notifications.show(`Error editing project: ${error.message}`, 'error');
        }
    }

    async deleteProject(id) {
        console.log(`🗑️ Deleting project with ID:`, id);
        
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }
        
        try {
            await CMSAPI.deleteProject(id);
            this.notifications.show('Project deleted successfully!', 'success');
            this.loadProjects();
            console.log(`✅ Project deleted:`, id);
        } catch (error) {
            console.error(`❌ Error deleting project:`, error);
            this.notifications.show(`Delete failed: ${error.message}`, 'error');
        }
    }

    showEditModal(type, data, onSave) {
        // Create accessible edit modal
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'edit-modal-title');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000; padding: 1rem;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #1f2937; border: 2px solid #374151; border-radius: 12px;
            padding: 2rem; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;
        `;
        
        // Create form elements safely
        const title = document.createElement('h2');
        title.id = 'edit-modal-title';
        title.style.cssText = 'color: white; margin-bottom: 1.5rem; text-align: center;';
        title.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        const form = document.createElement('form');
        form.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
        
        // Title input
        const titleLabel = document.createElement('label');
        titleLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
        titleLabel.textContent = 'Title';
        
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.name = 'title';
        titleInput.value = data.title || '';
        titleInput.required = true;
        titleInput.style.cssText = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem;
        `;
        
        // Content textarea (if applicable)
        let contentInput = null;
        if (data.content !== undefined) {
            const contentLabel = document.createElement('label');
            contentLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
            contentLabel.textContent = 'Content';
            
            contentInput = document.createElement('textarea');
            contentInput.name = 'content';
            contentInput.value = data.content || '';
            contentInput.rows = 6;
            contentInput.style.cssText = `
                padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
                background: #374151; color: white; font-size: 1rem; resize: vertical;
            `;
            
            form.appendChild(contentLabel);
            form.appendChild(contentInput);
        }
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: 1px solid #6b7280; border-radius: 0.5rem;
            background: #374151; color: white; cursor: pointer; font-weight: 600;
        `;
        
        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.textContent = 'Save Changes';
        saveButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem;
            background: #10b981; color: white; cursor: pointer; font-weight: 600;
        `;
        
        // Event handlers
        cancelButton.addEventListener('click', () => modal.remove());
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const updatedData = {
                title: formData.get('title'),
                ...(contentInput && { content: formData.get('content') })
            };
            
            try {
                await onSave(updatedData);
                modal.remove();
            } catch (error) {
                // Error is handled by onSave, modal stays open
            }
        });
        
        // Keyboard support
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });
        
        // Assemble modal
        form.appendChild(titleLabel);
        form.appendChild(titleInput);
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);
        form.appendChild(buttonContainer);
        
        modalContent.appendChild(title);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        // Focus management
        setTimeout(() => titleInput.focus(), 100);
    }



    deleteMedia(id) {
        // Check permissions before operation
        if (!this.checkOperationPermissions('delete', 'media')) {
            return;
        }
        
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

    async deleteArticle(id) {
        // Check permissions before operation
        if (!this.checkOperationPermissions('delete', 'article')) {
            return;
        }
        
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

    async deleteEvent(id) {
        // Check permissions before operation
        if (!this.checkOperationPermissions('delete', 'event')) {
            return;
        }
        
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

    async deleteOpportunity(id) {
        // Check permissions before operation
        if (!this.checkOperationPermissions('delete', 'opportunity')) {
            return;
        }
        
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
                } else if (type === 'challenge') {
                    await CMSData.createChallenge(data);
                    this.loadInnovationHub();
                } else if (type === 'announcement') {
                    await CMSData.sendAnnouncement(data);
                    this.loadCommunications();
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

    // Enhanced methods for comprehensive CMS functionality
    
    // Search and filtering
    applyFilters() {
        console.log('🔍 Applying filters:', this.searchFilters);
        
        // Reload current tab with filters applied
        this.loadTabContent(this.currentTab);
    }

    // Filter items client-side for better performance
    filterItems(items) {
        if (!items || !Array.isArray(items)) return [];
        
        const { query, type, status, dateRange } = this.searchFilters;
        
        let filtered = [...items];
        
        // Filter by search query (comprehensive)
        if (query && query.trim()) {
            const q = query.toLowerCase().trim();
            filtered = filtered.filter(item => {
                // Build comprehensive search haystack
                const haystack = [
                    item.title,
                    item.excerpt,
                    item.summary,
                    item.description,
                    item.content,
                    item.location,
                    item.company,
                    item.organization,
                    item.author_name,
                    ...(Array.isArray(item.tags) ? item.tags : [])
                ].filter(Boolean).join(' ').toLowerCase();
                
                return haystack.includes(q);
            });
        }
        
        // Note: Type filtering removed - items don't have type field, collection already implies type
        
        // Filter by status
        if (status && status !== 'all') {
            filtered = filtered.filter(item => item.status === status);
        }
        
        // Filter by date range
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            const ranges = {
                'today': 1,
                'week': 7,
                'month': 30,
                'year': 365
            };
            
            const days = ranges[dateRange];
            if (days) {
                const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(item => {
                    const itemDate = new Date(item.created_at || item.start_date || 0);
                    return itemDate >= cutoff;
                });
            }
        }
        
        return filtered;
    }

    matchesDateRange(item) {
        const range = this.searchFilters.dateRange;
        if (range === 'all') return true;
        
        const raw = item.created_at || item.updated_at || item.published_at || item.start_date;
        if (!raw) return true;
        
        const d = new Date(raw);
        if (isNaN(d.getTime())) return true;
        
        const now = new Date();
        
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        // Monday start (more common in Kenya)
        const day = startOfWeek.getDay();
        const diff = (day === 0 ? 6 : day - 1);
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        if (range === 'today') return d >= startOfToday;
        if (range === 'week') return d >= startOfWeek;
        if (range === 'month') return d >= startOfMonth;
        if (range === 'year') return d >= startOfYear;
        return true;
    }

    toggleItemSelection(id) {
        const isSelected = this.selectedItems.has(id);
        this.setItemSelection(id, !isSelected);
    }

    async bulkDelete() {
        if (this.selectedItems.size === 0) {
            this.notifications.show('No items selected', 'warning');
            return;
        }
        
        const raw = this.getCurrentCollection();
        if (!raw) {
            this.notifications.show('Cannot delete items from this tab', 'error');
            return;
        }
        
        const collection = this.normalizeCollection(raw);
        const count = this.selectedItems.size;
        
        const confirmed = confirm(`Are you sure you want to delete ${count} item${count > 1 ? 's' : ''}? This action cannot be undone.`);
        if (!confirmed) return;
        
        try {
            const deletePromises = Array.from(this.selectedItems).map(id => {
                return CMSData.deleteItem(collection, id);
            });
            
            await Promise.all(deletePromises);
            
            this.notifications.show(`Successfully deleted ${count} items`, 'success');
            this.clearSelection();
            this.loadTabContent(this.currentTab);
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('Bulk delete failed:', error);
            this.notifications.show(`Failed to delete items: ${error.message}`, 'error');
        }
    }

    async bulkPublish() {
        if (this.selectedItems.size === 0) {
            this.notifications.show('No items selected', 'warning');
            return;
        }
        
        const raw = this.getCurrentCollection();
        if (!raw) {
            this.notifications.show('Cannot publish items from this tab', 'error');
            return;
        }
        
        const collection = this.normalizeCollection(raw);
        
        try {
            const updatePromises = Array.from(this.selectedItems).map(id => {
                return CMSData.updateItem(collection, id, { status: 'published' });
            });
            
            await Promise.all(updatePromises);
            
            this.notifications.show(`Successfully published ${this.selectedItems.size} items`, 'success');
            this.clearSelection();
            this.loadTabContent(this.currentTab);
            
        } catch (error) {
            console.error('Bulk publish failed:', error);
            this.notifications.show(`Failed to publish items: ${error.message}`, 'error');
        }
    }

    async bulkDraft() {
        if (this.selectedItems.size === 0) {
            this.notifications.show('No items selected', 'warning');
            return;
        }
        
        const raw = this.getCurrentCollection();
        if (!raw) {
            this.notifications.show('Cannot draft items from this tab', 'error');
            return;
        }
        
        const collection = this.normalizeCollection(raw);
        
        try {
            const updatePromises = Array.from(this.selectedItems).map(id => {
                return CMSData.updateItem(collection, id, { status: 'draft' });
            });
            
            await Promise.all(updatePromises);
            
            this.notifications.show(`Successfully moved ${this.selectedItems.size} items to draft`, 'success');
            this.clearSelection();
            this.loadTabContent(this.currentTab);
            
        } catch (error) {
            console.error('Bulk draft failed:', error);
            this.notifications.show(`Failed to update items: ${error.message}`, 'error');
        }
    }

    // Content scheduling
    scheduleContent(id) {
        const modal = CMSUI.createSchedulingModal(id, (scheduleData) => {
            this.scheduledContent.set(id, scheduleData);
            this.notifications.show(`Content scheduled for ${new Date(scheduleData.publishAt).toLocaleString()}`, 'success');
        });
        
        document.body.appendChild(modal);
    }

    async publishScheduledContent(id, scheduledData) {
        const { type, title } = scheduledData;
        const collection = this.collectionForType(type);
        
        // Update the content status to published
        await CMSData.updateItem(collection, id, { 
            status: 'published',
            published_at: new Date().toISOString()
        });
        
        // Refresh current view if needed
        const tab = this.normalizeCollection(collection);
        if (this.currentTab === tab) {
            this.loadTabContent(this.currentTab);
        }
    }

    // Content duplication
    async duplicateContent(id) {
        try {
            const type = this.currentTab;
            const original = CMSData.findById(type, id);
            
            if (!original) {
                this.notifications.show('Content not found', 'error');
                return;
            }
            
            // Create duplicate with modified title
            const duplicate = {
                ...original,
                title: `${original.title} (Copy)`,
                status: 'draft',
                created_at: new Date().toISOString()
            };
            
            delete duplicate.id; // Remove ID so a new one is generated
            
            if (type === 'articles') {
                await CMSData.createArticle(duplicate);
            } else if (type === 'events') {
                await CMSData.createEvent(duplicate);
            } else if (type === 'opportunities') {
                await CMSData.createOpportunity(duplicate);
            }
            
            this.notifications.show('Content duplicated successfully', 'success');
            this.loadTabContent(this.currentTab);
            
        } catch (error) {
            this.notifications.show(`Failed to duplicate content: ${error.message}`, 'error');
        }
    }

    // Content export
    async exportContent() {
        try {
            let data;
            
            if (this.selectedItems.size > 0) {
                // Export selected items
                const collection = this.getCurrentCollection();
                if (!collection) {
                    this.notifications.show('Export is not available on this tab.', 'info');
                    return;
                }
                
                data = Array.from(this.selectedItems).map(id => {
                    return CMSData.findById(collection, id);
                }).filter(Boolean);
            } else {
                // Export all items from current tab
                if (this.currentTab === 'articles') {
                    data = await CMSData.getArticles();
                } else if (this.currentTab === 'events') {
                    data = await CMSData.getEvents();
                } else if (this.currentTab === 'opportunities') {
                    data = await CMSData.getOpportunities();
                } else {
                    this.notifications.show('Export is not available on this tab.', 'info');
                    return;
                }
            }
            
            // Create and download JSON file
            const jsonData = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `cms-${this.currentTab}-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.notifications.show('Content exported successfully', 'success');
            
        } catch (error) {
            this.notifications.show(`Failed to export content: ${error.message}`, 'error');
        }
    }

    // Auto-save functionality
    async autoSaveDrafts() {
        // Auto-save any open editors
        if (this.editors.hasUnsavedChanges()) {
            try {
                await this.editors.autoSave();
                console.log('✅ Auto-save completed');
            } catch (error) {
                console.warn('⚠️ Auto-save failed:', error);
            }
        }
    }

    // Server synchronization
    async syncWithServer() {
        try {
            // Sync local changes with server
            await CMSData.syncWithServer();
            console.log('✅ Server sync completed');
        } catch (error) {
            console.warn('⚠️ Server sync failed:', error);
        }
    }

    // Collaborative features
    showActiveEditors() {
        // Show indicators for content being edited by other users
        // This would integrate with real-time presence system
    }

    setupConflictResolution() {
        // Handle conflicts when multiple users edit the same content
        // This would show merge dialogs and conflict resolution UI
    }

    // Enhanced media management
    async uploadMedia(files) {
        const uploadPromises = Array.from(files).map(file => this.uploadSingleFile(file));
        
        try {
            const results = await Promise.all(uploadPromises);
            this.notifications.show(`Successfully uploaded ${results.length} files`, 'success');
            this.loadMediaLibrary();
            return results;
        } catch (error) {
            this.notifications.show(`Upload failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async uploadSingleFile(file) {
        const uploadId = Date.now() + Math.random();
        
        try {
            // Show upload progress
            this.showUploadProgress(uploadId, file.name, 0);
            
            // Simulate upload progress (replace with actual upload logic)
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                this.updateUploadProgress(uploadId, progress);
            }
            
            // Complete upload
            this.completeUpload(uploadId);
            
            return {
                id: uploadId,
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file) // Temporary URL for demo
            };
            
        } catch (error) {
            this.failUpload(uploadId, error.message);
            throw error;
        }
    }

    showUploadProgress(uploadId, filename, progress) {
        // Create or update upload progress indicator
        const progressContainer = document.getElementById('upload-progress-container') || this.createUploadProgressContainer();
        
        const progressItem = document.createElement('div');
        progressItem.id = `upload-${uploadId}`;
        progressItem.className = 'upload-progress-item';
        
        // Create elements safely without innerHTML to prevent XSS
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px;';
        
        const filenameSpan = document.createElement('span');
        filenameSpan.style.cssText = 'font-size: 14px; color: var(--ig-dark);';
        filenameSpan.textContent = filename; // Safe from XSS
        
        const progressSpan = document.createElement('span');
        progressSpan.style.cssText = 'font-size: 12px; color: var(--ig-gray);';
        progressSpan.textContent = `${progress}%`;
        
        headerDiv.appendChild(filenameSpan);
        headerDiv.appendChild(progressSpan);
        
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.cssText = 'background: var(--ig-border); height: 4px; border-radius: 2px; overflow: hidden;';
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `background: var(--ig-blue); height: 100%; width: ${progress}%; transition: width 0.3s ease;`;
        
        progressBarContainer.appendChild(progressBar);
        progressItem.appendChild(headerDiv);
        progressItem.appendChild(progressBarContainer);
        
        progressContainer.appendChild(progressItem);
    }

    updateUploadProgress(uploadId, progress) {
        const progressItem = document.getElementById(`upload-${uploadId}`);
        if (progressItem) {
            const progressBar = progressItem.querySelector('div > div');
            const progressText = progressItem.querySelector('span:last-child');
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${progress}%`;
        }
    }

    completeUpload(uploadId) {
        const progressItem = document.getElementById(`upload-${uploadId}`);
        if (progressItem) {
            setTimeout(() => progressItem.remove(), 2000);
        }
    }

    failUpload(uploadId, error) {
        const progressItem = document.getElementById(`upload-${uploadId}`);
        if (progressItem) {
            progressItem.style.background = 'rgba(239, 68, 68, 0.1)';
            
            // Clear existing content safely and create error message
            progressItem.replaceChildren();
            
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'color: #ef4444; font-size: 14px;';
            errorDiv.textContent = `Upload failed: ${error}`; // textContent already escapes, no need for sanitizeInput
            
            progressItem.appendChild(errorDiv);
            setTimeout(() => progressItem.remove(), 5000);
        }
    }

    createUploadProgressContainer() {
        const container = document.createElement('div');
        container.id = 'upload-progress-container';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            width: 300px;
            z-index: 1000;
            background: var(--ig-white);
            border: 1px solid var(--ig-border);
            border-radius: var(--ig-radius-md);
            padding: 16px;
            box-shadow: var(--ig-shadow-medium);
        `;
        
        document.body.appendChild(container);
        return container;
    }

    // New tab action methods
    editChallenge(id) {
        console.log(`✏️ Editing challenge with ID:`, id);
        
        try {
            const challenge = CMSData.findById('challenges', id);
            if (!challenge) {
                this.notifications.show('Challenge not found', 'error');
                return;
            }
            
            this.showEditModal('challenge', challenge, async (updatedData) => {
                try {
                    this.validateTitle(updatedData.title);
                    if (updatedData.content) {
                        this.validateContent(updatedData.content);
                    }
                    
                    await CMSData.updateItem('challenges', id, updatedData);
                    this.notifications.show('Challenge updated successfully!', 'success');
                    this.loadInnovationHub();
                    
                } catch (error) {
                    console.error(`❌ Error updating challenge:`, error);
                    this.notifications.show(`Update failed: ${error.message}`, 'error');
                    throw error;
                }
            });
            
        } catch (error) {
            console.error(`❌ Error editing challenge:`, error);
            this.notifications.show(`Error editing challenge: ${error.message}`, 'error');
        }
    }

    async deleteChallenge(id) {
        if (!this.checkOperationPermissions('delete', 'challenge')) {
            return;
        }
        
        if (!confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
            return;
        }
        
        try {
            const success = await CMSData.deleteItem('challenges', id);
            if (success) {
                this.notifications.show('Challenge deleted successfully!', 'success');
                this.loadInnovationHub();
                this.updateDashboardStats();
            } else {
                this.notifications.show('Challenge not found', 'error');
            }
        } catch (error) {
            this.notifications.show('Failed to delete challenge: ' + error.message, 'error');
        }
    }

    async approveIdea(id) {
        if (!this.checkOperationPermissions('approve', 'idea')) {
            return;
        }
        
        try {
            await CMSData.updateItem('ideas', id, { status: 'approved' });
            this.notifications.show('Idea approved successfully!', 'success');
            this.loadInnovationHub();
        } catch (error) {
            this.notifications.show('Failed to approve idea: ' + error.message, 'error');
        }
    }

    async rejectIdea(id) {
        if (!this.checkOperationPermissions('reject', 'idea')) {
            return;
        }
        
        const reason = prompt('Please provide a reason for rejection (optional):');
        
        try {
            await CMSData.updateItem('ideas', id, { 
                status: 'rejected',
                rejection_reason: reason || 'No reason provided'
            });
            this.notifications.show('Idea rejected', 'success');
            this.loadInnovationHub();
        } catch (error) {
            this.notifications.show('Failed to reject idea: ' + error.message, 'error');
        }
    }

    async resendMessage(id) {
        if (!this.checkOperationPermissions('send', 'message')) {
            return;
        }
        
        if (!confirm('Are you sure you want to resend this message?')) {
            return;
        }
        
        try {
            await CMSData.resendMessage(id);
            this.notifications.show('Message resent successfully!', 'success');
            this.loadCommunications();
        } catch (error) {
            this.notifications.show('Failed to resend message: ' + error.message, 'error');
        }
    }

    async deleteMessage(id) {
        if (!this.checkOperationPermissions('delete', 'message')) {
            return;
        }
        
        if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return;
        }
        
        try {
            const success = await CMSData.deleteItem('messages', id);
            if (success) {
                this.notifications.show('Message deleted successfully!', 'success');
                this.loadCommunications();
            } else {
                this.notifications.show('Message not found', 'error');
            }
        } catch (error) {
            this.notifications.show('Failed to delete message: ' + error.message, 'error');
        }
    }

    viewMember(data) {
        console.log(`👤 Viewing member:`, data);
        
        try {
            const modal = CMSUI.createMemberModal(data);
            document.body.appendChild(modal);
        } catch (error) {
            console.error(`❌ Error creating member modal:`, error);
            this.notifications.show(`Error displaying member: ${error.message}`, 'error');
        }
    }

    messageMember(id) {
        console.log(`💬 Messaging member with ID:`, id);
        
        try {
            const member = CMSData.findById('members', id);
            if (!member) {
                this.notifications.show('Member not found', 'error');
                return;
            }
            
            // Show message composition modal
            this.showMessageModal(member);
            
        } catch (error) {
            console.error(`❌ Error messaging member:`, error);
            this.notifications.show(`Error messaging member: ${error.message}`, 'error');
        }
    }

    editMember(id) {
        console.log(`✏️ Editing member with ID:`, id);
        
        try {
            const member = CMSData.findById('members', id);
            if (!member) {
                this.notifications.show('Member not found', 'error');
                return;
            }
            
            // Create dedicated member edit modal with proper fields
            this.showMemberEditModal(member, async (updatedData) => {
                try {
                    if (updatedData.email) {
                        this.validateEmail(updatedData.email);
                    }
                    
                    await CMSData.updateItem('members', id, updatedData);
                    this.notifications.show('Member updated successfully!', 'success');
                    this.loadMembers();
                    
                } catch (error) {
                    console.error(`❌ Error updating member:`, error);
                    this.notifications.show(`Update failed: ${error.message}`, 'error');
                    throw error;
                }
            });
            
        } catch (error) {
            console.error(`❌ Error editing member:`, error);
            this.notifications.show(`Error editing member: ${error.message}`, 'error');
        }
    }

    showMemberEditModal(member, onSave) {
        // Create dedicated member edit modal with proper fields (name, email, role, status)
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000; padding: 1rem;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #1f2937; border: 2px solid #374151; border-radius: 12px;
            padding: 2rem; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = 'color: white; margin-bottom: 1.5rem; text-align: center;';
        title.textContent = 'Edit Member';
        
        const form = document.createElement('form');
        form.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
        
        // Name field
        const nameLabel = document.createElement('label');
        nameLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
        nameLabel.textContent = 'Name';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.value = member.name || '';
        nameInput.required = true;
        nameInput.style.cssText = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem;
        `;
        
        // Email field
        const emailLabel = document.createElement('label');
        emailLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
        emailLabel.textContent = 'Email';
        
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'email';
        emailInput.value = member.email || '';
        emailInput.required = true;
        emailInput.style.cssText = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem;
        `;
        
        // Role field
        const roleLabel = document.createElement('label');
        roleLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
        roleLabel.textContent = 'Role';
        
        const roleSelect = document.createElement('select');
        roleSelect.name = 'role';
        roleSelect.style.cssText = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem;
        `;
        
        const roles = ['member', 'executive', 'admin'];
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            option.selected = member.role === role;
            roleSelect.appendChild(option);
        });
        
        // Status field
        const statusLabel = document.createElement('label');
        statusLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
        statusLabel.textContent = 'Status';
        
        const statusSelect = document.createElement('select');
        statusSelect.name = 'status';
        statusSelect.style.cssText = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem;
        `;
        
        const statuses = ['active', 'inactive', 'suspended'];
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            option.selected = member.status === status;
            statusSelect.appendChild(option);
        });
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: 1px solid #6b7280; border-radius: 0.5rem;
            background: #374151; color: white; cursor: pointer; font-weight: 600;
        `;
        
        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.textContent = 'Save Changes';
        saveButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem;
            background: var(--ig-success); color: white; cursor: pointer; font-weight: 600;
        `;
        
        // Event handlers
        cancelButton.addEventListener('click', () => modal.remove());
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const updatedData = {
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role'),
                status: formData.get('status')
            };
            
            try {
                await onSave(updatedData);
                modal.remove();
            } catch (error) {
                // Error already handled by onSave, don't close modal
            }
        });
        
        // Assemble modal
        form.appendChild(nameLabel);
        form.appendChild(nameInput);
        form.appendChild(emailLabel);
        form.appendChild(emailInput);
        form.appendChild(roleLabel);
        form.appendChild(roleSelect);
        form.appendChild(statusLabel);
        form.appendChild(statusSelect);
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);
        form.appendChild(buttonContainer);
        
        modalContent.appendChild(title);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        setTimeout(() => nameInput.focus(), 100);
    }

    showMessageModal(member) {
        // Create message composition modal for individual member
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000; padding: 1rem;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #1f2937; border: 2px solid #374151; border-radius: 12px;
            padding: 2rem; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = 'color: white; margin-bottom: 1.5rem; text-align: center;';
        title.textContent = `Message ${member.name}`;
        
        const form = document.createElement('form');
        form.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
        
        // Subject input
        const subjectLabel = document.createElement('label');
        subjectLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
        subjectLabel.textContent = 'Subject';
        
        const subjectInput = document.createElement('input');
        subjectInput.type = 'text';
        subjectInput.name = 'subject';
        subjectInput.required = true;
        subjectInput.style.cssText = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem;
        `;
        
        // Message textarea
        const messageLabel = document.createElement('label');
        messageLabel.style.cssText = 'color: rgba(255, 255, 255, 0.9); font-weight: 600;';
        messageLabel.textContent = 'Message';
        
        const messageInput = document.createElement('textarea');
        messageInput.name = 'message';
        messageInput.required = true;
        messageInput.rows = 6;
        messageInput.style.cssText = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem; resize: vertical;
        `;
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: 1px solid #6b7280; border-radius: 0.5rem;
            background: #374151; color: white; cursor: pointer; font-weight: 600;
        `;
        
        const sendButton = document.createElement('button');
        sendButton.type = 'submit';
        sendButton.textContent = 'Send Message';
        sendButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem;
            background: var(--ig-info); color: white; cursor: pointer; font-weight: 600;
        `;
        
        // Event handlers
        cancelButton.addEventListener('click', () => modal.remove());
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const messageData = {
                recipient_id: member.id,
                subject: formData.get('subject'),
                message: formData.get('message'),
                type: 'direct'
            };
            
            try {
                await CMSData.sendMessage(messageData);
                this.notifications.show('Message sent successfully!', 'success');
                modal.remove();
            } catch (error) {
                this.notifications.show(`Failed to send message: ${error.message}`, 'error');
            }
        });
        
        // Assemble modal
        form.appendChild(subjectLabel);
        form.appendChild(subjectInput);
        form.appendChild(messageLabel);
        form.appendChild(messageInput);
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(sendButton);
        form.appendChild(buttonContainer);
        
        modalContent.appendChild(title);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        setTimeout(() => subjectInput.focus(), 100);
    }

    // Cleanup method
    destroy() {
        // Cleanup subscriptions
        this.realTimeSubscriptions.forEach(subscription => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        });
        
        // Clear all intervals
        this.intervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        this.intervals.clear();
        
        // Remove event listeners
        document.removeEventListener('keydown', this.keyboardHandler);
        document.removeEventListener('click', this.onDocumentClick);
        document.removeEventListener('change', this.onDocumentChange);
        
        // Clear event handlers
        this.eventHandlers.clear();
        
        // Clear selected items
        this.selectedItems.clear();
        
        // Remove bulk operations toolbar
        const toolbar = document.getElementById('cms-bulk-toolbar');
        if (toolbar) {
            toolbar.remove();
        }
        
        // Remove search interface
        const searchContainer = document.getElementById('cms-search-container');
        if (searchContainer) {
            searchContainer.remove();
        }
        
        console.log('🧹 CMS Manager cleaned up');
    }

    // Permission checking for operations
    checkOperationPermissions(operation, contentType) {
        try {
            // Re-check authentication
            if (!window.authManager?.isAuthenticated()) {
                this.notifications.show('You must be logged in to perform this action', 'error');
                setTimeout(() => window.location.href = '/', 2000);
                return false;
            }
            
            // Re-check role permissions
            const user = window.authManager.getUser();
            if (!CMSSecurity.validateRole(user)) {
                this.notifications.show('You do not have permission to perform this action', 'error');
                return false;
            }
            
            // Additional operation-specific checks could go here
            if (operation === 'delete' && user.role === 'executive') {
                // Executives might have limited delete permissions
                console.log(`Executive ${user.email} attempting to delete ${contentType}`);
            }
            
            return true;
            
        } catch (error) {
            console.error('Permission check failed:', error);
            this.notifications.show('Permission check failed. Please refresh and try again.', 'error');
            return false;
        }
    }
}