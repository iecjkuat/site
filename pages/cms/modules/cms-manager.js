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
        try {
            // Fetch real stats from database
            const stats = await CMSData.getStats();
            
            console.log('📊 Dashboard stats:', stats);
            
            // Update counters with animation
            CMSUI.animateCounter('articles-count', stats.articles);
            CMSUI.animateCounter('events-count', stats.events);
            CMSUI.animateCounter('projects-count', stats.projects || 0);
            CMSUI.animateCounter('opportunities-count', stats.opportunities);
            CMSUI.animateCounter('ideas-count', stats.ideas || 0);
            CMSUI.animateCounter('members-count', stats.members || 0);
            CMSUI.animateCounter('media-count', stats.media || 0);
            
            // Load recent activity
            await this.loadRecentActivity();
        } catch (error) {
            console.error('Failed to update dashboard stats:', error);
        }
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
            // Clear cache to get fresh data
            CMSData.clearCache('events');
            
            // Load ONLY real events from database
            const events = await CMSData.getEvents();
            
            console.log(`📅 Loaded ${events.length} real events from database`);
            
            // Fetch likes and comments for each event
            const eventsWithStats = await Promise.all(events.map(async event => {
                try {
                    const [likesData, commentsData] = await Promise.all([
                        fetch(`/api/v1/events/${event.id}/likes`).then(r => r.json()).catch(() => ({ count: 0 })),
                        fetch(`/api/v1/events/${event.id}/comments`).then(r => r.json()).catch(() => ({ comments: [] }))
                    ]);
                    
                    return {
                        ...event,
                        likes_count: likesData.count || 0,
                        comments_count: (commentsData.comments || []).length
                    };
                } catch (error) {
                    console.error(`Error fetching stats for event ${event.id}:`, error);
                    return {
                        ...event,
                        likes_count: 0,
                        comments_count: 0
                    };
                }
            }));
            
            if (eventsWithStats.length > 0) {
                console.log('📝 Sample event with stats:', eventsWithStats[0]);
            }
            
            const filteredEvents = this.filterItems(eventsWithStats);
            this.renderEvents(filteredEvents);
            
            if (eventsWithStats.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <i class="fas fa-calendar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No events found</p>
                        <p style="font-size: 0.9rem; opacity: 0.7;">Create your first event to get started</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading events:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Failed to load events</p>
                    <p style="font-size: 0.9rem; opacity: 0.7;">${error.message}</p>
                </div>
            `;
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
            console.log('📦 Loaded projects from database:', realProjects.length);
            const filteredProjects = this.filterItems(realProjects);
            this.renderProjects(filteredProjects);
        } catch (error) {
            console.error('Error loading projects:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load projects. Please try again.'));
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

        // Remove grid styling and padding from container
        container.className = '';
        container.style.cssText = 'padding: 0; margin: 0;';

        // Create table wrapper with horizontal scroll - full width
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'members-table-wrapper';
        tableWrapper.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow-x: auto;
            overflow-y: visible;
            margin: 0;
            width: 100%;
        `;

        // Create table
        const table = document.createElement('table');
        table.className = 'members-table';
        table.style.cssText = `
            width: 100%;
            min-width: 1400px;
            border-collapse: collapse;
            font-size: 0.875rem;
        `;

        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap; position: sticky; left: 0; background: #f8f9fa; z-index: 10;">Name</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Email</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Phone</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Student ID</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Course</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Year</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">College</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Role</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Status</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Joined</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Last Active</th>
                <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: #495057; white-space: nowrap; position: sticky; right: 0; background: #f8f9fa; z-index: 10;">Actions</th>
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
            const bgColor = index % 2 === 0 ? 'white' : '#fafbfc';
            row.onmouseenter = () => row.style.backgroundColor = '#f8f9fa';
            row.onmouseleave = () => row.style.backgroundColor = bgColor;
            row.style.backgroundColor = bgColor;

            // Format dates
            const joinDate = member.created_at ? new Date(member.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }) : 'N/A';

            const lastActive = member.last_active ? new Date(member.last_active).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }) : 'Never';

            // Status badge colors
            const statusColors = {
                'active': '#28a745',
                'pending': '#ffc107',
                'inactive': '#6c757d',
                'suspended': '#dc3545',
                'pending_invitation': '#17a2b8'
            };
            const statusColor = statusColors[member.membership_status] || '#6c757d';

            // Role badge colors
            const roleColors = {
                'admin': '#007bff',
                'executive': '#6f42c1',
                'member': '#17a2b8',
                'guest': '#6c757d'
            };
            const roleColor = roleColors[member.role] || '#17a2b8';

            // Create row cells
            row.innerHTML = `
                <td style="padding: 12px 16px; color: #212529; font-weight: 500; white-space: nowrap; position: sticky; left: 0; background: ${bgColor}; z-index: 5;">
                    ${this.sanitizeInput(member.name || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${this.sanitizeInput(member.email || '')}">
                    ${this.sanitizeInput(member.email || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057; white-space: nowrap;">
                    ${this.sanitizeInput(member.phone || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057; font-family: monospace; white-space: nowrap;">
                    ${this.sanitizeInput(member.registration_number || member.student_id || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057; max-width: 150px; overflow: hidden; text-overflow: ellipsis;" title="${this.sanitizeInput(member.course || '')}">
                    ${this.sanitizeInput(member.course || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057; text-align: center;">
                    ${this.sanitizeInput(member.year_of_study || 'N/A')}
                </td>
                <td style="padding: 12px 16px; color: #495057; white-space: nowrap;">
                    ${this.sanitizeInput(member.college || 'N/A')}
                </td>
                <td style="padding: 12px 16px;">
                    <span style="
                        display: inline-block;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        background: ${roleColor}15;
                        color: ${roleColor};
                        white-space: nowrap;
                    ">${this.sanitizeInput(member.role || 'member')}</span>
                </td>
                <td style="padding: 12px 16px;">
                    <span style="
                        display: inline-block;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: capitalize;
                        background: ${statusColor}15;
                        color: ${statusColor};
                        white-space: nowrap;
                    ">${this.sanitizeInput((member.membership_status || 'pending').replace(/_/g, ' '))}</span>
                </td>
                <td style="padding: 12px 16px; color: #6c757d; font-size: 0.85rem; white-space: nowrap;">
                    ${joinDate}
                </td>
                <td style="padding: 12px 16px; color: #6c757d; font-size: 0.85rem; white-space: nowrap;">
                    ${lastActive}
                </td>
            `;

            // Create actions cell with proper event listeners
            const actionsCell = document.createElement('td');
            actionsCell.style.cssText = `padding: 12px 16px; text-align: center; position: sticky; right: 0; background: ${bgColor}; z-index: 5;`;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = 'display: flex; gap: 6px; justify-content: center; flex-wrap: nowrap;';

            // View button
            const viewBtn = this.createActionButton('eye', '#007bff', 'View Details');
            viewBtn.addEventListener('click', () => this.viewMember(member));
            actionsDiv.appendChild(viewBtn);

            // Activate button (only for non-active members)
            if (member.membership_status !== 'active') {
                const activateBtn = this.createActionButton('check', '#28a745', 'Activate Membership');
                activateBtn.addEventListener('click', () => this.activateMember(member.id));
                actionsDiv.appendChild(activateBtn);
            }

            // Suspend button (only for active members)
            if (member.membership_status === 'active') {
                const suspendBtn = this.createActionButton('pause', '#ffc107', 'Suspend Member', '#212529');
                suspendBtn.addEventListener('click', () => this.suspendMember(member.id));
                actionsDiv.appendChild(suspendBtn);
            }

            // Edit button
            const editBtn = this.createActionButton('edit', '#6c757d', 'Edit Member');
            editBtn.addEventListener('click', () => this.editMember(member.id));
            actionsDiv.appendChild(editBtn);

            // Remove button
            const removeBtn = this.createActionButton('trash', '#dc3545', 'Remove Member');
            removeBtn.addEventListener('click', () => this.removeMember(member.id, member.name));
            actionsDiv.appendChild(removeBtn);

            actionsCell.appendChild(actionsDiv);
            row.appendChild(actionsCell);

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
        
        const activeCount = members.filter(m => m.membership_status === 'active').length;
        const pendingCount = members.filter(m => m.membership_status === 'pending' || m.membership_status === 'pending_invitation').length;
        const suspendedCount = members.filter(m => m.membership_status === 'suspended').length;
        
        footer.innerHTML = `
            <span>Showing ${members.length} member${members.length !== 1 ? 's' : ''}</span>
            <div style="display: flex; gap: 16px;">
                <span><i class="fas fa-check-circle" style="color: #28a745;"></i> Active: ${activeCount}</span>
                <span><i class="fas fa-clock" style="color: #ffc107;"></i> Pending: ${pendingCount}</span>
                <span><i class="fas fa-pause-circle" style="color: #dc3545;"></i> Suspended: ${suspendedCount}</span>
            </div>
        `;
        tableWrapper.appendChild(footer);

        container.replaceChildren(tableWrapper);
        container.style.padding = '0';
    }

    createActionButton(icon, bgColor, title, textColor = 'white') {
        const button = document.createElement('button');
        button.style.cssText = `
            padding: 6px 10px;
            background: ${bgColor};
            color: ${textColor};
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.75rem;
            transition: all 0.2s;
            white-space: nowrap;
        `;
        button.title = title;
        button.innerHTML = `<i class="fas fa-${icon}"></i>`;
        
        // Hover effects
        const hoverColor = this.darkenColor(bgColor);
        button.addEventListener('mouseenter', () => {
            button.style.background = hoverColor;
            button.style.transform = 'translateY(-1px)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = bgColor;
            button.style.transform = 'translateY(0)';
        });
        
        return button;
    }

    darkenColor(color) {
        // Simple color darkening
        const colorMap = {
            '#007bff': '#0056b3',
            '#28a745': '#218838',
            '#ffc107': '#e0a800',
            '#6c757d': '#5a6268',
            '#dc3545': '#c82333'
        };
        return colorMap[color] || color;
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
            // For events, use the beautiful detailed modal
            if (type === 'event') {
                this.viewEventDetails(data);
            } else {
                // For other content types, use the standard modal
                const modal = CMSUI.createContentModal(data, type);
                document.body.appendChild(modal);
                console.log(`✅ Modal created and added to DOM`);
            }
        } catch (error) {
            console.error(`❌ Error creating modal:`, error);
            this.notifications.show(`Error displaying content: ${error.message}`, 'error');
        }
    }

    viewEventDetails(event) {
        // Create beautiful event details modal (same as events page)
        const modal = document.createElement('div');
        modal.id = 'eventDetailsModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            overflow-y: auto;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.95));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            position: relative;
        `;

        const startDate = new Date(event.start_date || event.event_date);
        const bannerImage = event.banner_image || (event.media && event.media.primary);
        
        modalContent.innerHTML = `
            <button id="closeModalBtn" style="position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(0, 0, 0, 0.7); border: none; border-radius: 50%; width: 40px; height: 40px; color: white; font-size: 1.5rem; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                ×
            </button>

            <div style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 60px; height: 60px; background: rgba(59, 130, 246, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-calendar-alt" style="font-size: 1.5rem; color: #3b82f6;"></i>
                    </div>
                    <h2 style="font-size: 2rem; font-weight: 700; color: white; margin: 0 0 0.5rem 0;">${this.escapeHTML(event.title)}</h2>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem;">JKUAT Innovation Club</p>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 16px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-calendar" style="color: #3b82f6;"></i>
                        <span>${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-clock" style="color: #3b82f6;"></i>
                        <span>${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-map-marker-alt" style="color: #3b82f6;"></i>
                        <span>${this.escapeHTML(event.location)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-tag" style="color: #3b82f6;"></i>
                        <span>${event.fee || event.registration_fee ? `KSh ${event.fee || event.registration_fee}` : 'Free'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-users" style="color: #3b82f6;"></i>
                        <span>${event.current_attendees || 0}/${event.max_attendees || 'Unlimited'} registered</span>
                    </div>
                </div>

                ${bannerImage ? `
                    <div style="margin-bottom: 2rem;">
                        <img src="${this.escapeHTML(bannerImage)}" alt="${this.escapeHTML(event.title)}" 
                             style="width: 100%; height: 300px; object-fit: cover; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
                    </div>
                ` : ''}

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                        Description
                    </h3>
                    <div style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                        ${event.description || event.description_html || 'No description available.'}
                    </div>
                </div>

                ${event.requirements && Array.isArray(event.requirements) && event.requirements.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-clipboard-list" style="color: #3b82f6;"></i>
                            Requirements
                        </h3>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                            ${event.requirements.map(req => `
                                <li style="display: flex; align-items: start; gap: 0.75rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                                    <i class="fas fa-check-circle" style="color: #10b981; margin-top: 0.25rem; flex-shrink: 0;"></i>
                                    <span>${this.escapeHTML(req)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${event.agenda && Array.isArray(event.agenda) && event.agenda.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-list-ul" style="color: #3b82f6;"></i>
                            Event Agenda
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            ${event.agenda.map(item => `
                                <div style="display: flex; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 3px solid #3b82f6;">
                                    <div style="flex-shrink: 0; width: 80px; color: #3b82f6; font-weight: 600; font-size: 0.875rem;">
                                        ${this.escapeHTML(item.time)}
                                    </div>
                                    <div style="flex: 1;">
                                        ${item.day ? `<div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">${this.escapeHTML(item.day)}</div>` : ''}
                                        <div style="color: white; font-weight: 600;">${this.escapeHTML(item.title)}</div>
                                        ${item.description ? `<div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-top: 0.25rem;">${this.escapeHTML(item.description)}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${event.tags && event.tags.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                            ${event.tags.map(tag => `
                                <span style="padding: 0.5rem 1rem; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; color: #3b82f6; font-size: 0.875rem; font-weight: 500;">
                                    ${tag.startsWith('#') ? this.escapeHTML(tag) : '#' + this.escapeHTML(tag)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-images" style="color: #3b82f6;"></i>
                        Event Gallery
                    </h3>
                    <div id="eventGallery" style="min-height: 200px;">
                        ${event.gallery && event.gallery.length > 0 ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                                ${event.gallery.map((media, index) => `
                                    <div class="gallery-item" data-index="${index}" style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.3s ease;" 
                                         onmouseover="this.style.transform='scale(1.05)'" 
                                         onmouseout="this.style.transform='scale(1)'">
                                        ${media.type === 'video' ? `
                                            <video src="${this.escapeHTML(media.url)}" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>
                                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.6); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                                                <i class="fas fa-play" style="color: white; font-size: 1.5rem; margin-left: 3px;"></i>
                                            </div>
                                        ` : `
                                            <img src="${this.escapeHTML(media.url)}" alt="Event photo" style="width: 100%; height: 100%; object-fit: cover;">
                                            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.3s ease; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0)'">
                                                <i class="fas fa-search-plus" style="color: white; font-size: 2rem; opacity: 0; transition: opacity 0.3s ease; pointer-events: none;"></i>
                                            </div>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 3rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 2px dashed rgba(255, 255, 255, 0.2);">
                                <i class="fas fa-camera" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem; display: block;"></i>
                                <p style="color: rgba(255, 255, 255, 0.6); margin: 0;">No photos or videos yet</p>
                                <p style="color: rgba(255, 255, 255, 0.4); font-size: 0.875rem; margin: 0.5rem 0 0 0;">Event photos will appear here after the event</p>
                            </div>
                        `}
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button id="modalCloseBtn" style="padding: 0.75rem 2rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        Close
                    </button>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add click handlers to gallery items
        const galleryItems = modal.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.onclick = () => {
                const index = parseInt(item.dataset.index);
                if (window.lightbox) {
                    window.lightbox.open(index, event.gallery);
                }
            };
        });

        // Close handlers
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        };

        modal.querySelector('#closeModalBtn').onclick = closeModal;
        modal.querySelector('#modalCloseBtn').onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.style.overflow = 'hidden';
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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
            // Try to find in cache first
            let event = CMSData.findById('events', id);
            
            // If not found in cache, try to find in the loaded events list
            if (!event) {
                console.log('Event not in cache, searching in loaded events...');
                const eventsContainer = document.getElementById('events-list');
                if (eventsContainer) {
                    // Get all event cards and find the one with matching ID
                    const eventCards = eventsContainer.querySelectorAll('[data-id]');
                    for (const card of eventCards) {
                        if (card.dataset.id === id) {
                            // Found the card, now fetch the event data from API
                            console.log('Found event card, fetching from API...');
                            this.fetchAndEditEvent(id);
                            return;
                        }
                    }
                }
            }
            
            if (!event) {
                console.error('Event not found with ID:', id);
                this.notifications.show('Event not found', 'error');
                return;
            }
            
            console.log(`✅ Found event:`, event.title);
            
            // Use specialized event edit modal
            this.showEventEditModal(event, async (updatedData) => {
                try {
                    // Validate input
                    this.validateTitle(updatedData.title);
                    
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

    async fetchAndEditEvent(id) {
        try {
            // Fetch event directly from API
            const response = await fetch(`/api/v1/events/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch event');
            }
            const event = await response.json();
            
            console.log(`✅ Fetched event from API:`, event.title);
            console.log(`📦 Event gallery:`, event.gallery);
            
            // Now call showEventEditModal with the fetched event
            this.showEventEditModal(event, async (updatedData) => {
                try {
                    this.validateTitle(updatedData.title);
                    
                    console.log(`📤 Sending update with gallery:`, updatedData.gallery ? `${updatedData.gallery.length} items` : 'No gallery');
                    if (updatedData.gallery && updatedData.gallery.length > 0) {
                        console.log(`📸 First gallery item:`, {
                            type: updatedData.gallery[0].type,
                            name: updatedData.gallery[0].name,
                            urlLength: updatedData.gallery[0].url ? updatedData.gallery[0].url.length : 0
                        });
                    }
                    
                    await CMSData.updateItem('events', id, updatedData);
                    this.notifications.show('Event updated successfully!', 'success');
                    this.loadEvents();
                    console.log(`✅ Event updated:`, updatedData.title);
                    
                } catch (error) {
                    console.error(`❌ Error updating event:`, error);
                    this.notifications.show(`Update failed: ${error.message}`, 'error');
                    throw error;
                }
            });
            
        } catch (error) {
            console.error(`❌ Error fetching event:`, error);
            this.notifications.show(`Error loading event: ${error.message}`, 'error');
        }
    }

    showEventEditModal(event, onSave) {
        // Create comprehensive event edit modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000; padding: 1rem; overflow-y: auto;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.95));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px; padding: 2rem; max-width: 800px; width: 100%;
            max-height: 90vh; overflow-y: auto;
        `;
        
        modalContent.innerHTML = `
            <h2 style="color: white; margin-bottom: 2rem; text-align: center; font-size: 1.75rem;">
                <i class="fas fa-edit"></i> Edit Event
            </h2>
            
            <form id="eventEditForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <!-- Title -->
                <div>
                    <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                        Event Title <span style="color: #ef4444;">*</span>
                    </label>
                    <input type="text" name="title" value="${this.escapeHTML(event.title || '')}" required
                           style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                </div>

                <!-- Location -->
                <div>
                    <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                        Location
                    </label>
                    <input type="text" name="location" value="${this.escapeHTML(event.location || '')}"
                           style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                </div>

                <!-- Date and Time -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                            Start Date & Time
                        </label>
                        <input type="datetime-local" name="start_date" value="${event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : ''}"
                               style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                            End Date & Time
                        </label>
                        <input type="datetime-local" name="end_date" value="${event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''}"
                               style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                    </div>
                </div>

                <!-- Event Type and Status -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                            Event Type
                        </label>
                        <select name="event_type" style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                            <option value="workshop" ${event.event_type === 'workshop' ? 'selected' : ''}>Workshop</option>
                            <option value="seminar" ${event.event_type === 'seminar' ? 'selected' : ''}>Seminar</option>
                            <option value="competition" ${event.event_type === 'competition' ? 'selected' : ''}>Competition</option>
                            <option value="hackathon" ${event.event_type === 'hackathon' ? 'selected' : ''}>Hackathon</option>
                            <option value="meeting" ${event.event_type === 'meeting' ? 'selected' : ''}>Meeting</option>
                            <option value="social" ${event.event_type === 'social' ? 'selected' : ''}>Social Event</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                            Visibility Status
                            <span style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); font-weight: 400; margin-left: 0.5rem;">
                                (Upcoming/Live/Completed auto-calculated from dates)
                            </span>
                        </label>
                        <select name="status" style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                            <option value="published" ${event.status === 'published' || (!event.status || (event.status !== 'draft' && event.status !== 'cancelled')) ? 'selected' : ''}>Published (Auto Status)</option>
                            <option value="draft" ${event.status === 'draft' ? 'selected' : ''}>Draft (Hidden)</option>
                            <option value="cancelled" ${event.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <p style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); margin-top: 0.5rem; margin-bottom: 0;">
                            Status is automatically set based on event dates: Upcoming (before start), Live (during event), Completed (after end)
                        </p>
                    </div>
                </div>

                <!-- Max Attendees and Fee -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                            Max Attendees
                        </label>
                        <input type="number" name="max_attendees" value="${event.max_attendees || ''}" min="0"
                               style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                            Registration Fee (KSh)
                        </label>
                        <input type="number" name="fee" value="${event.fee || event.registration_fee || 0}" min="0"
                               style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
                    </div>
                </div>

                <!-- Description -->
                <div>
                    <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                        Description
                    </label>
                    <textarea name="description" rows="6"
                              style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem; resize: vertical;">${this.escapeHTML(event.description || '')}</textarea>
                </div>

                <!-- Gallery Management -->
                <div>
                    <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">
                        <i class="fas fa-images"></i> Event Gallery
                    </label>
                    <div id="galleryManager" style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div id="galleryPreview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
                            <!-- Gallery items will be added here -->
                        </div>
                        <input type="file" id="galleryUpload" accept="image/*,video/*" multiple style="display: none;">
                        <button type="button" id="addGalleryBtn" style="width: 100%; padding: 0.75rem; background: rgba(59, 130, 246, 0.2); border: 1px dashed rgba(59, 130, 246, 0.5); border-radius: 8px; color: #3b82f6; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-plus"></i> Add Photos/Videos
                        </button>
                    </div>
                </div>

                <!-- Buttons -->
                <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button type="button" id="cancelBtn" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
                        Cancel
                    </button>
                    <button type="submit" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </form>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Initialize gallery with existing data
        const galleryData = Array.isArray(event.gallery) ? [...event.gallery] : [];
        let isUploading = false;
        
        const renderGallery = () => {
            const preview = document.getElementById('galleryPreview');
            if (!preview) return;

            preview.innerHTML = galleryData.map((item, index) => `
                <div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: rgba(0, 0, 0, 0.3);">
                    ${item.uploading ? `
                        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.5);">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: white; margin-bottom: 0.5rem;"></i>
                            <span style="color: white; font-size: 0.75rem;">Uploading...</span>
                        </div>
                    ` : item.type === 'video' ? `
                        <video src="${item.url}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                        <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; color: white; opacity: 0.8;"></i>
                    ` : `
                        <img src="${item.url}" style="width: 100%; height: 100%; object-fit: cover;">
                    `}
                    ${!item.uploading ? `
                        <button type="button" data-index="${index}" class="remove-gallery-item"
                                style="position: absolute; top: 0.25rem; right: 0.25rem; background: rgba(239, 68, 68, 0.9); border: none; border-radius: 50%; width: 24px; height: 24px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">
                            ×
                        </button>
                    ` : ''}
                </div>
            `).join('');

            // Add event listeners to remove buttons
            preview.querySelectorAll('.remove-gallery-item').forEach(btn => {
                btn.onclick = async () => {
                    const index = parseInt(btn.dataset.index);
                    const item = galleryData[index];
                    
                    // If it's a storage URL, delete from storage
                    if (item.url && item.url.includes('supabase.co/storage')) {
                        try {
                            const urlParts = item.url.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            const eventFolder = urlParts[urlParts.length - 2];
                            
                            await fetch(`/api/v1/upload/event-gallery/${eventFolder}/${fileName}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
                                }
                            });
                        } catch (error) {
                            console.error('Error deleting file from storage:', error);
                        }
                    }
                    
                    galleryData.splice(index, 1);
                    renderGallery();
                };
            });
        };

        renderGallery();

        // Gallery upload handler
        document.getElementById('addGalleryBtn').onclick = () => {
            if (isUploading) {
                this.notifications.show('Please wait for current uploads to complete', 'warning');
                return;
            }
            document.getElementById('galleryUpload').click();
        };

        document.getElementById('galleryUpload').onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            console.log('📤 Starting upload of', files.length, 'files');
            console.log('📦 Files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

            isUploading = true;
            const uploadBtn = document.getElementById('addGalleryBtn');
            uploadBtn.disabled = true;
            uploadBtn.style.opacity = '0.5';

            // Add placeholder items for each file
            const placeholderIndexes = [];
            files.forEach(file => {
                const index = galleryData.length;
                placeholderIndexes.push(index);
                galleryData.push({
                    type: file.type.startsWith('video') ? 'video' : 'image',
                    url: '',
                    name: file.name,
                    uploading: true
                });
            });
            renderGallery();

            // Upload files to Supabase Storage
            try {
                const formData = new FormData();
                files.forEach(file => formData.append('files', file));

                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const uploadUrl = `/api/v1/upload/event-gallery/${event.id}/batch`;
                
                console.log('🌐 Uploading to:', uploadUrl);
                console.log('🔑 Auth token:', token ? 'Present' : 'Missing');

                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                console.log('📡 Response status:', response.status);
                
                const result = await response.json();
                console.log('📦 Response data:', result);

                if (!response.ok) {
                    throw new Error(result.message || 'Upload failed');
                }
                
                // Replace placeholders with actual uploaded files
                if (result.files && result.files.length > 0) {
                    result.files.forEach((uploadedFile, i) => {
                        const placeholderIndex = placeholderIndexes[i];
                        if (placeholderIndex !== undefined) {
                            galleryData[placeholderIndex] = uploadedFile;
                        }
                    });
                }

                // Show errors if any
                if (result.errors && result.errors.length > 0) {
                    result.errors.forEach(err => {
                        this.notifications.show(`Failed to upload ${err.name}: ${err.error}`, 'error');
                    });
                }

                renderGallery();
                this.notifications.show(`Uploaded ${result.files.length} file(s) successfully!`, 'success');

            } catch (error) {
                console.error('❌ Upload error:', error);
                this.notifications.show('Failed to upload files. Please try again.', 'error');
                
                // Remove placeholder items
                placeholderIndexes.reverse().forEach(index => {
                    galleryData.splice(index, 1);
                });
                renderGallery();
            } finally {
                isUploading = false;
                uploadBtn.disabled = false;
                uploadBtn.style.opacity = '1';
                e.target.value = '';
            }
        };

        // Form submission
        document.getElementById('eventEditForm').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const updatedData = {
                title: formData.get('title'),
                location: formData.get('location'),
                start_date: formData.get('start_date'),
                end_date: formData.get('end_date'),
                event_type: formData.get('event_type'),
                status: formData.get('status'),
                max_attendees: parseInt(formData.get('max_attendees')) || null,
                fee: parseFloat(formData.get('fee')) || 0,
                description: formData.get('description'),
                gallery: galleryData
            };

            try {
                await onSave(updatedData);
                modal.remove();
            } catch (error) {
                // Error handled by onSave
            }
        };

        // Cancel button
        document.getElementById('cancelBtn').onclick = () => modal.remove();

        // Close on escape
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
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
            let exportType = 'json';
            
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
                } else if (this.currentTab === 'members') {
                    data = await CMSData.getMembers();
                    exportType = 'csv'; // Export members as CSV
                } else {
                    this.notifications.show('Export is not available on this tab.', 'info');
                    return;
                }
            }
            
            if (!data || data.length === 0) {
                this.notifications.show('No data to export', 'info');
                return;
            }
            
            let blob, filename;
            
            if (exportType === 'csv' && this.currentTab === 'members') {
                // Export members as CSV
                const csv = this.convertMembersToCSV(data);
                blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                filename = `members-export-${new Date().toISOString().split('T')[0]}.csv`;
            } else {
                // Export as JSON
                const jsonData = JSON.stringify(data, null, 2);
                blob = new Blob([jsonData], { type: 'application/json' });
                filename = `cms-${this.currentTab}-export-${new Date().toISOString().split('T')[0]}.json`;
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.notifications.show(`Exported ${data.length} ${this.currentTab} successfully`, 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.notifications.show(`Failed to export content: ${error.message}`, 'error');
        }
    }

    convertMembersToCSV(members) {
        // Define CSV headers
        const headers = [
            'Name',
            'Email',
            'Phone',
            'Student ID',
            'Course',
            'Year',
            'College',
            'Role',
            'Status',
            'Joined Date',
            'Last Active'
        ];
        
        // Create CSV rows
        const rows = members.map(member => {
            const joinDate = member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A';
            const lastActive = member.last_active ? new Date(member.last_active).toLocaleDateString() : 'Never';
            
            return [
                this.escapeCSV(member.name || ''),
                this.escapeCSV(member.email || ''),
                this.escapeCSV(member.phone || ''),
                this.escapeCSV(member.registration_number || member.student_id || ''),
                this.escapeCSV(member.course || ''),
                member.year_of_study || '',
                this.escapeCSV(member.college || ''),
                member.role || 'member',
                member.membership_status || 'pending',
                joinDate,
                lastActive
            ].join(',');
        });
        
        // Combine headers and rows
        return [headers.join(','), ...rows].join('\n');
    }

    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
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

    async activateMember(id) {
        console.log(`✅ Activating member with ID:`, id);
        
        if (!confirm('Are you sure you want to activate this member? They will gain full access to the platform.')) {
            return;
        }
        
        try {
            // Update member status to active
            await CMSData.updateItem('members', id, { 
                membership_status: 'active',
                updated_at: new Date().toISOString()
            });
            
            this.notifications.show('Member activated successfully!', 'success');
            this.loadMembers();
            
        } catch (error) {
            console.error(`❌ Error activating member:`, error);
            this.notifications.show(`Failed to activate member: ${error.message}`, 'error');
        }
    }

    async suspendMember(id) {
        console.log(`⏸️ Suspending member with ID:`, id);
        
        const reason = prompt('Please provide a reason for suspension (optional):');
        if (reason === null) return; // User cancelled
        
        if (!confirm('Are you sure you want to suspend this member? They will lose access to the platform.')) {
            return;
        }
        
        try {
            // Update member status to suspended
            await CMSData.updateItem('members', id, { 
                membership_status: 'suspended',
                suspension_reason: reason || 'No reason provided',
                suspended_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            this.notifications.show('Member suspended successfully!', 'warning');
            this.loadMembers();
            
        } catch (error) {
            console.error(`❌ Error suspending member:`, error);
            this.notifications.show(`Failed to suspend member: ${error.message}`, 'error');
        }
    }

    async removeMember(id, memberName) {
        console.log(`🗑️ Removing member with ID:`, id);
        
        const confirmation = prompt(
            `⚠️ WARNING: This will permanently delete ${memberName} from the system.\n\n` +
            `This action CANNOT be undone. All their data, including:\n` +
            `- Profile information\n` +
            `- Event registrations\n` +
            `- Ideas and contributions\n` +
            `- Activity history\n\n` +
            `Type "DELETE" to confirm:`
        );
        
        if (confirmation !== 'DELETE') {
            if (confirmation !== null) {
                this.notifications.show('Deletion cancelled - confirmation text did not match', 'info');
            }
            return;
        }
        
        try {
            // Delete member from database
            await CMSData.deleteItem('members', id);
            
            this.notifications.show(`${memberName} has been permanently removed`, 'success');
            this.loadMembers();
            
        } catch (error) {
            console.error(`❌ Error removing member:`, error);
            this.notifications.show(`Failed to remove member: ${error.message}`, 'error');
        }
    }

    showMemberEditModal(member, onSave) {
        // Create dedicated member edit modal with proper fields
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
            padding: 2rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = 'color: white; margin-bottom: 1.5rem; text-align: center;';
        title.textContent = 'Edit Member';
        
        const form = document.createElement('form');
        form.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
        
        const inputStyle = `
            padding: 0.75rem; border: 1px solid #374151; border-radius: 0.5rem;
            background: #374151; color: white; font-size: 1rem; width: 100%;
        `;
        
        const labelStyle = 'color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.25rem;';
        
        // Helper function to create form field
        const createField = (label, name, type, value, required = false, options = null) => {
            const container = document.createElement('div');
            container.style.cssText = 'display: flex; flex-direction: column;';
            
            const labelEl = document.createElement('label');
            labelEl.style.cssText = labelStyle;
            labelEl.textContent = label;
            
            let input;
            if (options) {
                input = document.createElement('select');
                input.style.cssText = inputStyle;
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    option.selected = value === opt.value;
                    input.appendChild(option);
                });
            } else {
                input = document.createElement('input');
                input.type = type;
                input.style.cssText = inputStyle;
                input.value = value || '';
            }
            
            input.name = name;
            input.required = required;
            
            container.appendChild(labelEl);
            container.appendChild(input);
            return container;
        };
        
        // Create form fields
        form.appendChild(createField('Name', 'name', 'text', member.name, true));
        form.appendChild(createField('Email', 'email', 'email', member.email, true));
        form.appendChild(createField('Phone', 'phone', 'tel', member.phone, false));
        form.appendChild(createField('Student ID', 'registration_number', 'text', member.registration_number || member.student_id, false));
        form.appendChild(createField('Course', 'course', 'text', member.course, false));
        form.appendChild(createField('Year of Study', 'year_of_study', 'number', member.year_of_study, false));
        form.appendChild(createField('College', 'college', 'text', member.college, false));
        
        form.appendChild(createField('Role', 'role', null, member.role, true, [
            { value: 'member', label: 'Member' },
            { value: 'executive', label: 'Executive' },
            { value: 'admin', label: 'Admin' }
        ]));
        
        form.appendChild(createField('Membership Status', 'membership_status', null, member.membership_status, true, [
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'pending_invitation', label: 'Pending Invitation' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' }
        ]));
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: 1px solid #6b7280; border-radius: 0.5rem;
            background: #374151; color: white; cursor: pointer; font-weight: 600;
            transition: background 0.2s;
        `;
        cancelButton.onmouseover = () => cancelButton.style.background = '#4b5563';
        cancelButton.onmouseout = () => cancelButton.style.background = '#374151';
        
        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.textContent = 'Save Changes';
        saveButton.style.cssText = `
            padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem;
            background: #10b981; color: white; cursor: pointer; font-weight: 600;
            transition: background 0.2s;
        `;
        saveButton.onmouseover = () => saveButton.style.background = '#059669';
        saveButton.onmouseout = () => saveButton.style.background = '#10b981';
        
        // Event handlers
        cancelButton.addEventListener('click', () => modal.remove());
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const updatedData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                registration_number: formData.get('registration_number'),
                course: formData.get('course'),
                year_of_study: formData.get('year_of_study'),
                college: formData.get('college'),
                role: formData.get('role'),
                membership_status: formData.get('membership_status'),
                updated_at: new Date().toISOString()
            };
            
            // Remove empty fields
            Object.keys(updatedData).forEach(key => {
                if (updatedData[key] === '' || updatedData[key] === null) {
                    delete updatedData[key];
                }
            });
            
            try {
                await onSave(updatedData);
                modal.remove();
            } catch (error) {
                // Error already handled by onSave, don't close modal
            }
        });
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);
        form.appendChild(buttonContainer);
        
        modalContent.appendChild(title);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        setTimeout(() => form.querySelector('input[name="name"]').focus(), 100);
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