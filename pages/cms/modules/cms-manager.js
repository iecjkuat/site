/**
 * CMS Manager - Refactored
 * Main coordinator that delegates to specialized managers
 */

import { CMSSecurity } from './core/cms-security.js';
import { CMSAPI } from './core/cms-api.js';
import { CMSNotifications } from './core/cms-notifications.js';
import { CMSEditors } from './core/cms-editors.js';
import { CMSData } from './core/cms-data.js';
import { CMSUI } from './core/cms-ui.js';

// Import all managers
import { CMSArticlesManager } from './managers/cms-articles-manager.js';
import { CMSEventsManager } from './managers/cms-events-manager.js';
import { CMSProjectsManager } from './managers/cms-projects-manager.js';
import { CMSOpportunitiesManager } from './managers/cms-opportunities-manager.js';
import { CMSInnovationManager } from './managers/cms-innovation-manager.js';
import { CMSVotingManager } from './managers/cms-voting-manager.js';
import { CMSCommunicationsManager } from './managers/cms-communications-manager.js';
import { CMSResourcesManager } from './managers/cms-resources-manager.js';
import { CMSMembersManager } from './managers/cms-members-manager.js';
import { CMSMediaManager } from './managers/cms-media-manager.js';
import { CMSLeadershipManager } from './managers/cms-leadership-manager.js';
import { CMSFeedbackManager } from './managers/cms-feedback-manager.js';
import { CMSFeedbackSimple } from './managers/cms-feedback-simple.js';
import { CMSMessagesManager } from './managers/cms-messages-manager-simple.js';

export class SecureCMSManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.notifications = new CMSNotifications();
        this.editors = new CMSEditors();
        this.eventHandlers = new Map();
        this.isInitialized = false;
        
        // Expose utilities globally for managers and legacy code
        window.CMSUI = CMSUI;
        window.CMSData = CMSData;
        window.CMSAPI = CMSAPI;
        window.CMSSecurity = CMSSecurity;
        
        // Search and filters
        this.searchFilters = {
            query: '',
            type: 'all',
            status: 'all',
            dateRange: 'all'
        };
        this.selectedItems = new Set();
        
        // Memory management
        this.intervals = new Set();
        this.abortControllers = new Map();
        this.currentLoadController = null;
        this.keyboardHandler = this.handleKeyboard.bind(this);
        
        // Initialize all managers
        this.articlesManager = new CMSArticlesManager(this);
        this.eventsManager = new CMSEventsManager(this);
        this.projectsManager = new CMSProjectsManager(this);
        this.opportunitiesManager = new CMSOpportunitiesManager(this);
        this.innovationManager = new CMSInnovationManager(this);
        this.votingManager = new CMSVotingManager(this);
        this.communicationsManager = new CMSCommunicationsManager(this);
        this.resourcesManager = new CMSResourcesManager(this);
        this.membersManager = new CMSMembersManager(this);
        this.mediaManager = new CMSMediaManager(this);
        this.leadershipManager = new CMSLeadershipManager(this);
        this.feedbackManager = new CMSFeedbackSimple(this); // Use simple version
        this.messagesManager = new CMSMessagesManager(this);
        
        this.init();
    }

    // ==================== INITIALIZATION ====================
    
    async init() {
        if (this.isInitialized) {
            console.warn('⚠️ CMS Manager already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing CMS Manager...');
            
            // Auth is already checked by cms.js before this is called
            // Just verify we have the user object
            const user = window.authManager?.getUser();
            if (!user) {
                console.warn('⚠️ No user object available, but continuing initialization');
            } else if (!this.checkUserPermissions(user)) {
                console.error('❌ User does not have CMS access');
                this.notifications.show('You do not have permission to access the CMS', 'error');
                setTimeout(() => window.location.href = '/', 3000);
                return;
            }

            // Setup UI
            this.setupTabs();
            this.setupSearch();
            this.setupKeyboardShortcuts();
            this.bindGlobalEvents();
            
            // Load dashboard
            await this.loadDashboard();
            
            this.isInitialized = true;
            console.log('✅ CMS Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize CMS Manager:', error);
            this.notifications.show('Failed to initialize CMS', 'error');
        }
    }

    checkUserPermissions(user) {
        const allowedRoles = ['admin', 'leader', 'content_manager'];
        return user && allowedRoles.includes(user.role);
    }

    // ==================== TAB MANAGEMENT ====================
    
    setupTabs() {
        const tabs = document.querySelectorAll('.cms-tab');
        console.log(`📑 Found ${tabs.length} tabs`);
        tabs.forEach(tab => {
            console.log(`  - Tab: ${tab.dataset.tab}`);
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                console.log(`🖱️ Tab clicked: ${tabName}`);
                this.switchTab(tabName);
            });
        });
    }

    async switchTab(tabName) {
        if (this.currentTab === tabName) {
            console.log(`⏭️ Already on tab: ${tabName}`);
            return;
        }
        
        console.log(`🔄 Switching from ${this.currentTab} to ${tabName}`);
        
        // Clean up previous tab (stop auto-refresh, etc.)
        this.cleanupCurrentTab();
        
        // Update UI
        const tabs = document.querySelectorAll('.cms-tab');
        console.log(`  Found ${tabs.length} tab buttons`);
        tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.classList.toggle('active', isActive);
            if (isActive) console.log(`  ✓ Activated tab button: ${tabName}`);
        });
        
        const contents = document.querySelectorAll('.cms-content');
        console.log(`  Found ${contents.length} tab content areas`);
        contents.forEach(content => {
            const isActive = content.id === `${tabName}-tab`;
            content.classList.toggle('active', isActive);
            if (isActive) console.log(`  ✓ Activated content area: ${content.id}`);
        });
        
        this.currentTab = tabName;
        
        // Load tab content
        await this.loadTabContent(tabName);
    }

    cleanupCurrentTab() {
        // Stop auto-refresh for members tab
        if (this.currentTab === 'members' && this.membersManager) {
            this.membersManager.stopAutoRefresh();
        }
        // Stop auto-refresh for messages tab
        if (this.currentTab === 'messages' && this.messagesManager) {
            this.messagesManager.cleanup();
        }
        // Add cleanup for other tabs as needed
    }

    async loadTabContent(tabName) {
        try {
            // Cancel any in-flight requests
            if (this.currentLoadController) {
                this.currentLoadController.abort();
            }
            this.currentLoadController = new AbortController();
            
            // Delegate to appropriate manager
            switch(tabName) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'articles':
                    await this.articlesManager.load();
                    break;
                case 'events':
                    await this.eventsManager.load();
                    break;
                case 'projects':
                    await this.projectsManager.load();
                    break;
                case 'opportunities':
                    await this.opportunitiesManager.load();
                    break;
                case 'innovation':
                    await this.innovationManager.load();
                    break;
                case 'voting':
                    await this.votingManager.load();
                    break;
                case 'communications':
                    await this.communicationsManager.load();
                    break;
                case 'resources':
                    await this.resourcesManager.load();
                    break;
                case 'members':
                    await this.membersManager.load();
                    break;
                case 'leadership':
                    await this.leadershipManager.load();
                    break;
                case 'media':
                    await this.mediaManager.load();
                    break;
                case 'feedback':
                    await this.feedbackManager.load();
                    break;
                case 'messages':
                    await this.messagesManager.load();
                    break;
                default:
                    console.warn(`Unknown tab: ${tabName}`);
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request cancelled');
                return;
            }
            console.error(`Error loading ${tabName}:`, error);
            this.notifications.show(`Failed to load ${tabName}`, 'error');
        }
    }

    // ==================== DASHBOARD ====================
    
    async loadDashboard() {
        const container = document.getElementById('dashboard-tab');
        if (!container) return;

        try {
            // Load stats
            const stats = await this.loadStats();
            this.renderDashboard(stats);
            
            // Load recent activity
            await this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.notifications.show('Failed to load dashboard', 'error');
        }
    }

    async loadStats() {
        try {
            console.log('📊 Loading dashboard stats...');
            console.log('CMSData available?', !!window.CMSData);
            
            const [articles, events, projects, opportunities, ideas, members] = await Promise.all([
                CMSData.getArticles().catch(err => { console.error('Articles error:', err); return []; }),
                CMSData.getEvents().catch(err => { console.error('Events error:', err); return []; }),
                CMSData.getProjects().catch(err => { console.error('Projects error:', err); return []; }),
                CMSData.getOpportunities().catch(err => { console.error('Opportunities error:', err); return []; }),
                CMSData.getIdeas().catch(err => { console.error('Ideas error:', err); return []; }),
                CMSData.getMembers().catch(err => { console.error('Members error:', err); return []; })
            ]);

            console.log('📊 Stats loaded:', {
                articles: articles.length,
                events: events.length,
                projects: projects.length,
                opportunities: opportunities.length,
                ideas: ideas.length,
                members: members.length
            });

            return {
                articles: articles.length,
                events: events.length,
                projects: projects.length,
                opportunities: opportunities.length,
                ideas: ideas.length,
                members: members.length
            };
        } catch (error) {
            console.error('Error loading stats:', error);
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

    renderDashboard(stats) {
        console.log('🎨 Rendering dashboard with stats:', stats);
        
        const counters = [
            { id: 'articles-count', value: stats.articles },
            { id: 'events-count', value: stats.events },
            { id: 'projects-count', value: stats.projects },
            { id: 'opportunities-count', value: stats.opportunities },
            { id: 'ideas-count', value: stats.ideas },
            { id: 'members-count', value: stats.members }
        ];
        
        counters.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`  ✓ Found element #${id}, setting to ${value}`);
                CMSUI.animateCounter(id, value);
            } else {
                console.error(`  ❌ Element #${id} not found in DOM`);
            }
        });
    }

    async loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Recent activity will appear here...</p>';
    }

    // ==================== SEARCH & FILTERS ====================
    
    setupSearch() {
        const searchInput = document.getElementById('cms-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchFilters.query = e.target.value;
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        // Reload current tab with filters
        this.loadTabContent(this.currentTab);
    }

    filterItems(items) {
        if (!this.searchFilters.query) return items;
        
        const query = this.searchFilters.query.toLowerCase();
        return items.filter(item => {
            return (
                item.title?.toLowerCase().includes(query) ||
                item.name?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
            );
        });
    }

    // ==================== SHARED UTILITIES ====================
    
    checkOperationPermissions(operation, type) {
        const user = window.authManager?.getUser();
        if (!user) return false;
        
        // Admins can do everything
        if (user.role === 'admin') return true;
        
        // Leaders can do most things
        if (user.role === 'leader') {
            return operation !== 'delete' || type !== 'member';
        }
        
        // Content managers can edit content but not users
        if (user.role === 'content_manager') {
            return type !== 'member';
        }
        
        return false;
    }

    viewContent(data, type) {
        console.log(`Viewing ${type}:`, data);
        
        // For resources, show a detailed view modal
        if (type === 'resource') {
            this.viewResource(data);
            return;
        }
        
        // For other types, show coming soon
        this.notifications.show('View functionality coming soon', 'info');
    }

    viewResource(resource) {
        const uploadDate = new Date(resource.created_at || Date.now());
        const dateStr = uploadDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const fileSize = resource.file_size ? CMSUI.formatFileSize(resource.file_size) : 'Unknown';
        
        const modalHTML = `
            <div class="modal-backdrop" id="viewResourceModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;">
                <div class="modal-content" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; position: relative;">
                    <button class="modal-close" id="closeViewResourceModal" style="position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; line-height: 1; z-index: 10;">&times;</button>
                    
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
                            <i class="fas fa-file-alt" style="font-size: 2rem; color: white;"></i>
                        </div>
                        <h2 style="color: white; font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem 0;">${resource.title || 'Untitled Resource'}</h2>
                        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 0.375rem 1rem; border-radius: 999px; font-size: 0.875rem; font-weight: 600;">
                            <i class="fas fa-folder"></i>
                            <span>${resource.category || 'General'}</span>
                        </div>
                    </div>

                    <!-- Details Grid -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                        <!-- File Type -->
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <i class="fas fa-file" style="color: #3b82f6; font-size: 1.25rem;"></i>
                                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; font-weight: 600;">File Type</span>
                            </div>
                            <p style="color: white; font-size: 1rem; font-weight: 600; margin: 0;">${resource.file_type || 'Unknown'}</p>
                        </div>

                        <!-- File Size -->
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <i class="fas fa-hdd" style="color: #8b5cf6; font-size: 1.25rem;"></i>
                                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; font-weight: 600;">File Size</span>
                            </div>
                            <p style="color: white; font-size: 1rem; font-weight: 600; margin: 0;">${fileSize}</p>
                        </div>

                        <!-- Upload Date -->
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <i class="fas fa-calendar" style="color: #10b981; font-size: 1.25rem;"></i>
                                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; font-weight: 600;">Uploaded</span>
                            </div>
                            <p style="color: white; font-size: 1rem; font-weight: 600; margin: 0;">${dateStr}</p>
                        </div>

                        <!-- Access Level -->
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <i class="fas fa-lock" style="color: #f59e0b; font-size: 1.25rem;"></i>
                                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; font-weight: 600;">Access Level</span>
                            </div>
                            <p style="color: white; font-size: 1rem; font-weight: 600; margin: 0; text-transform: capitalize;">${resource.access_level || 'Public'}</p>
                        </div>
                    </div>

                    <!-- Description -->
                    ${resource.description ? `
                    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h3 style="color: white; font-size: 1rem; font-weight: 600; margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-align-left" style="color: #3b82f6;"></i>
                            Description
                        </h3>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0;">${resource.description}</p>
                    </div>
                    ` : ''}

                    <!-- Actions -->
                    <div style="display: flex; gap: 1rem;">
                        <button id="downloadResourceBtn" style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 0.875rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s ease;">
                            <i class="fas fa-download"></i>
                            Download Resource
                        </button>
                        <button id="closeResourceViewBtn" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.875rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        const modal = document.getElementById('viewResourceModal');
        const closeBtn = document.getElementById('closeViewResourceModal');
        const closeBtn2 = document.getElementById('closeResourceViewBtn');
        const downloadBtn = document.getElementById('downloadResourceBtn');

        const closeModal = () => {
            modal?.remove();
        };

        closeBtn?.addEventListener('click', closeModal);
        closeBtn2?.addEventListener('click', closeModal);
        
        downloadBtn?.addEventListener('click', () => {
            if (resource.file_url) {
                // Create a temporary anchor element to trigger download
                const link = document.createElement('a');
                link.href = resource.file_url;
                link.download = resource.file_name || resource.title || 'download';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                
                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.notifications.show('Download started', 'success');
            } else {
                this.notifications.show('File URL not available', 'error');
            }
        });

        // Close on backdrop click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // ==================== KEYBOARD SHORTCUTS ====================
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', this.keyboardHandler);
    }

    handleKeyboard(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('cms-search')?.focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop').forEach(modal => modal.remove());
        }
    }

    // ==================== EVENT BINDING ====================
    
    bindGlobalEvents() {
        // Handle modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal-backdrop')) {
                e.target.closest('.modal-backdrop')?.remove();
            }
        });
    }

    // ==================== VALIDATION ====================
    
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            throw new Error('Title is required');
        }
        const t = title.trim();
        if (t.length < 3 || t.length > 200) {
            throw new Error('Title must be between 3 and 200 characters');
        }
        return true;
    }

    validateContent(content) {
        if (!content || typeof content !== 'string') {
            throw new Error('Content is required');
        }
        if (content.length > 50000) {
            throw new Error('Content is too long (max 50,000 characters)');
        }
        return true;
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return CMSSecurity.sanitizeHtml(input);
    }

    // ==================== CLEANUP ====================
    
    destroy() {
        console.log('🧹 Cleaning up CMS Manager...');
        
        // Clear intervals
        this.intervals.forEach(id => clearInterval(id));
        this.intervals.clear();
        
        // Abort pending requests
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
        
        if (this.currentLoadController) {
            this.currentLoadController.abort();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.keyboardHandler);
        
        // Cleanup managers
        // (Managers should implement their own cleanup if needed)
        
        this.isInitialized = false;
        console.log('✅ CMS Manager cleaned up');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cmsManager = new SecureCMSManager();
    });
} else {
    window.cmsManager = new SecureCMSManager();
}

export default SecureCMSManager;
