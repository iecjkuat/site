/**
 * JKUAT Innovation Club - Admin Dashboard (Modular)
 * Lightweight main controller that delegates to specialized modules
 */

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentView = 'overview'; // For sub-views like financial overview, list, pending, reports
        this.isLoading = false;
        this.cache = new Map();
        this.eventHandlers = new Map();

        // Initialize all modules
        this.initializeModules();

        this.init();
    }

    initializeModules() {
        // Core modules
        console.log('📊 Creating charts module...');
        this.chartsModule = new AdminCharts(this);
        console.log('📊 Charts module created:', !!this.chartsModule);
        this.userManagement = new AdminUserManagement(this);
        
        // Specialized management modules (new modular structure)
        this.ideasManagement = new IdeasManagement(this);
        this.eventManagement = new EventManagement(this);
        this.financialManagement = new FinancialManagement(this);
        this.communicationManagement = new CommunicationManagement(this);
        
        // Legacy management module (for remaining functionality)
        this.management = new AdminManagement(this);

        // Utility modules (if available)
        this.templateLoader = window.templateLoader || null;
        this.searchEngine = window.searchEngine || null;
        this.validationEngine = window.validationEngine || null;
        this.performanceMonitor = window.performanceMonitor || null;
        this.wsManager = window.wsManager || null;

        console.log('ðŸ”§ Modules initialized:', {
            analytics: !!this.analytics,
            charts: !!this.chartsModule,
            userManagement: !!this.userManagement,
            management: !!this.management,
            ideasManagement: !!this.ideasManagement,
            eventManagement: !!this.eventManagement,
            templateLoader: !!this.templateLoader,
            searchEngine: !!this.searchEngine,
            validationEngine: !!this.validationEngine,
            performanceMonitor: !!this.performanceMonitor,
            wsManager: !!this.wsManager
        });
    }

    async init() {
        console.log('ðŸ”§ Initializing Modular Admin Dashboard...');

        try {
            // Check admin authentication
            if (!await this.checkAdminAuth()) {
                this.redirectToLogin();
                return;
            }

            // Initialize components in order
            await this.initializeComponents();

            // Restore state from URL or load initial data
            await this.initializeFromURL();

            console.log('âœ… Admin Dashboard initialized successfully');
        } catch (error) {
            console.error('âŒ Failed to initialize admin dashboard:', error);
            this.showError('Failed to initialize dashboard. Please refresh the page.');
        }
    }

    async checkAdminAuth() {
        try {
            // Check localStorage first for quick validation
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) {
                const userData = JSON.parse(cachedUser);
                if (userData.role === 'admin') {
                    console.log('âœ… Admin access granted via localStorage');
                    return true;
                } else {
                    console.log('âŒ User is not admin:', userData.role);
                    alert('Access denied. Admin privileges required.');
                    return false;
                }
            }

            // Fallback to API check
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.log('âŒ No auth token found');
                alert('Please login first.');
                return false;
            }

            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.log('âŒ Token verification failed');
                return false;
            }

            const userData = await response.json();

            // Check if user is admin
            if (userData.user?.role !== 'admin') {
                console.log('âŒ API says user is not admin');
                alert('Access denied. Admin privileges required.');
                return false;
            }

            console.log('âœ… Admin access granted via API');
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            console.log('âŒ Auth check failed, assuming no admin access');
            alert('Authentication failed. Please login again.');
            return false;
        }
    }

    redirectToLogin() {
        alert('Admin access required. Please login with admin credentials.');
        window.location.href = '/#login';
    }

    async initializeComponents() {
        // Setup event listeners
        this.setupEventListeners();

        // Initialize UI components
        this.initializeUI();

        // Initialize utility modules
        await this.initializeUtilities();
    }

    setupEventListeners() {
        // Global action dispatcher (event delegation)
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (actionEl) {
                e.preventDefault();
                const action = actionEl.dataset.action;
                const id = actionEl.dataset.id;
                this.handleAction(action, id, e);
            }

            const sectionEl = e.target.closest('[data-section]');
            if (sectionEl) {
                e.preventDefault();
                const section = sectionEl.dataset.section;
                this.showSection(section);
            }
        });

        // Browser back/forward button support
        window.addEventListener('popstate', (e) => {
            console.log('🔙 Browser navigation detected, restoring state');

            // Parse URL to get new state
            const urlParams = new URLSearchParams(window.location.search);
            const newSection = urlParams.get('section') || 'dashboard';
            const newView = urlParams.get('view') || 'analytics';

            // Only update if the state actually changed
            if (newSection !== this.currentSection || newView !== this.currentView) {
                this.currentSection = newSection;
                this.currentView = newView;

                if (newSection === 'dashboard') {
                    this.showDashboardSection();
                } else {
                    this.showSection(newSection);
                    if (newView !== 'analytics') {
                        setTimeout(() => this.showSubView(newSection, newView), 100);
                    }
                }
            }
        });

        // Search inputs with debouncing
        this.setupSearchListeners();

        // Filter dropdowns
        this.setupFilterListeners();

        // Handle logout
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn') || e.target.closest('.logout-btn')) {
                logout();
            }
        });

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Central action dispatcher for all data-action button clicks
     */
    handleAction(action, id, event) {
        console.log(`🎯 Action triggered: ${action}`, id ? `(ID: ${id})` : '');

        // Get additional data attributes
        const element = event?.target?.closest('[data-action]');
        const dataType = element?.dataset?.type;

        const actions = {
            // Dashboard Quick Actions
            'createNewEvent': () => this.eventManagement.showCreateEventModal(),
            'showUserList': () => this.showSection('users'),
            'sendMessage': () => this.showSection('communication'),
            'generateFinancialReport': () => this.generateReport('financial'),
            'exportData': () => this.exportData(dataType || 'general'),
            'showSystemSettings': () => this.showSettingsModal(),
            'refreshData': () => this.refreshAllData(),

            // User Management Actions
            'showAddUserModal': () => this.userManagement.showAddUserModal(),
            'showUserAnalytics': () => this.userManagement.showView('analytics'),
            'showUserList': () => this.userManagement.showView('list'),
            'showPendingUsers': () => this.userManagement.showView('pending'),
            'showBulkActionsModal': () => this.userManagement.showBulkActionsModal(),
            'exportUsers': () => this.userManagement.exportUsers(),
            'viewUserDetails': () => this.userManagement.viewUserDetails(id),
            'editUser': () => this.userManagement.editUser(id),
            'deleteUser': () => this.userManagement.deleteUser(id),
            'approveUser': () => this.userManagement.approveUser(id),
            'rejectUser': () => this.userManagement.rejectUser(id),

            // Event Management Actions
            'showEventAnalytics': () => this.eventManagement.showEventView('analytics'),
            'showEventList': () => this.eventManagement.showEventView('list'),
            'showEventCalendar': () => this.eventManagement.showEventView('calendar'),
            'showEventDrafts': () => this.eventManagement.showEventView('drafts'),
            'showEventTemplates': () => this.eventManagement.showEventTemplates(),
            'exportEvents': () => this.eventManagement.exportEvents(),
            'viewEventDetails': () => this.eventManagement.viewEventDetails(id),
            'editEvent': () => this.eventManagement.editEvent(id),
            'deleteEvent': () => this.eventManagement.deleteEvent(id),

            // Financial Management Actions
            'addManualPayment': () => this.financialManagement.showPaymentModal(),
            'reconcilePayments': () => this.financialManagement.reconcilePayments(),
            'exportFinance': () => this.financialManagement.exportFinance(),
            'showPaymentsAnalytics': () => this.financialManagement.showFinancialView('analytics'),
            'showFinancialAnalytics': () => this.financialManagement.showFinancialView('analytics'),
            'showPaymentsList': () => this.financialManagement.showFinancialView('list'),
            'showPaymentList': () => this.financialManagement.showFinancialView('list'), // HTML uses this name
            'showPendingPayments': () => this.financialManagement.showFinancialView('pending'),
            'showFinancialReports': () => this.financialManagement.showFinancialView('reports'),
            'viewPaymentDetails': () => this.financialManagement.viewPaymentDetails(id),

            // Innovation Hub Actions
            'reviewPendingIdeas': () => this.ideasManagement.showIdeasView('pending'),
            'showIdeasAnalytics': () => this.ideasManagement.showIdeasView('analytics'),
            'showIdeasList': () => this.ideasManagement.showIdeasView('list'),
            'showIdeasApproved': () => this.ideasManagement.showIdeasView('approved'),
            'showInnovationAnalytics': () => this.ideasManagement.showIdeasView('analytics'),
            'showIdeaList': () => this.ideasManagement.showIdeasView('list'),
            'showPendingIdeas': () => this.ideasManagement.showIdeasView('pending'),
            'showIdeaChallenges': () => this.ideasManagement.showIdeaChallenges(),
            'exportIdeas': () => this.ideasManagement.exportIdeas(),
            'viewIdeaDetails': () => this.ideasManagement.viewIdeaDetails(id),
            'approveIdea': () => this.ideasManagement.approveIdea(id),
            'rejectIdea': () => this.ideasManagement.rejectIdea(id),
            'promoteIdea': () => this.ideasManagement.promoteIdea(id),

            // Communication Actions
            'composeBulkMessage': () => this.communicationManagement.showComposeModal(),
            'createTemplate': () => this.communicationManagement.showTemplateModal(),
            'showCommunicationAnalytics': () => this.communicationManagement.showCommunicationView('analytics'),
            'showMessageList': () => this.communicationManagement.showCommunicationView('list'),
            'showMessageTemplates': () => this.communicationManagement.showCommunicationView('templates'),
            'showScheduledMessages': () => this.communicationManagement.showCommunicationView('scheduled'),
            'exportMessages': () => this.communicationManagement.exportMessages(),

            // Reports Actions
            'generateUserReport': () => this.management.exportData('users'),
            'generateEventReport': () => this.management.exportData('events'),
            'generateFinancialReport': () => this.management.exportData('payments'),
            'generateIdeasReport': () => this.management.exportData('ideas'),
            'generateFullReport': () => this.management.exportAllData(),
            'generateFullUserReport': () => this.management.exportSpecificData('full-user-report'),
            'exportUserCSV': () => this.management.exportData('users'),
            'downloadReport': () => this.management.exportData(id),
            'viewReportHistory': () => this.management.showReportHistory(),

            // Export Actions
            'exportSelectedData': () => this.management.exportSelectedData(),
            'exportAllData': () => this.management.exportAllData(),
            'exportUserActivity': () => this.management.exportSpecificData('user-activity'),
            'exportDemographics': () => this.management.exportSpecificData('demographics'),
            'exportAttendance': () => this.management.exportSpecificData('attendance'),
            'exportEventPerformance': () => this.management.exportSpecificData('event-performance'),
            'exportRevenue': () => this.management.exportSpecificData('revenue'),
            'exportInnovationMetrics': () => this.management.exportSpecificData('innovation-metrics'),
            'exportChallengeResults': () => this.management.exportSpecificData('challenge-results'),

            // Filter Actions
            'clearFinancialFilters': () => this.clearFilters('financial'),
            'clearIdeaFilters': () => this.clearFilters('ideas'),
            'clearMessageFilters': () => this.clearFilters('messages'),

            // Communication Actions (additional)
            'sendBulkMessage': () => this.communicationManagement.showComposeModal(),
            'createMessageTemplate': () => this.communicationManagement.showTemplateModal(),
            'scheduleMessage': () => this.communicationManagement.scheduleMessage(),
            'submitCreateEvent': () => this.eventManagement.submitCreateEvent(),
            'submitAddUser': () => this.userManagement.submitAddUser(),
            'publishEvent': () => this.eventManagement.publishEvent(id),
            'useTemplate': () => this.eventManagement.useTemplate(id),
            'createCustomTemplate': () => this.showToast('Custom template creation coming soon', 'info'),
            'manageEventType': () => this.manageEventType(actionElement.dataset.type),
            'showEventTemplates': () => this.eventManagement.showEventTemplates(),

            // Modal Submit Actions
            'submitAddUser': () => this.userManagement.submitAddUser(),
            'submitCreateEvent': () => this.eventManagement.submitCreateEvent(),
            'submitPayment': () => this.financialManagement.submitPayment(),
            'submitMessage': () => this.communicationManagement.sendBulkMessage(),

            // Analytics Actions
            'loadUserAnalytics': () => this.analytics.loadUserAnalytics(),
            'loadAdvancedUserAnalytics': () => this.analytics.loadAdvancedUserAnalytics(),
            'viewCollegeUsers': () => this.viewCollegeUsers(element?.dataset?.college),
            'manageEventType': () => this.manageEventType(element?.dataset?.type),
            'viewCategoryIdeas': () => this.viewCategoryIdeas(element?.dataset?.category)
        };

        if (actions[action]) {
            try {
                actions[action]();
            } catch (error) {
                console.error(`Error executing action ${action}:`, error);
                this.showError(`Failed to execute action: ${action}`);
            }
        } else {
            console.warn(`⚠️ Unknown action: ${action}`);
            this.showToast(`Action "${action}" is not yet implemented`, 'warning');
        }
    }

    // Modal and Report helper methods
    showCreateEventModal() {
        this.eventManagement.showCreateEventModal();
    }

    showExportModal() {
        this.management.showExportModal();
    }

    showSettingsModal() {
        this.management.showSettingsModal();
    }

    generateReport(type) {
        this.management.generateReport(type);
    }

    downloadReport(reportId) {
        this.management.downloadReport(reportId);
    }

    setupSearchListeners() {
        const searchInputs = [
            'userSearchInput',
            'eventSearchInput',
            'paymentSearchInput',
            'ideaSearchInput',
            'messageSearchInput'
        ];

        searchInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                let timeout;
                input.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.handleSearch(inputId, e.target.value);
                    }, 300);
                });
            }
        });
    }

    setupFilterListeners() {
        const filterSelects = [
            'collegeFilter', 'statusFilter', 'roleFilter',
            'eventTypeFilter', 'eventStatusFilter', 'eventDateFilter',
            'paymentMethodFilter', 'paymentStatusFilter', 'paymentDateFilter',
            'ideaCategoryFilter', 'ideaStatusFilter', 'ideaVotesFilter',
            'messageTypeFilter', 'messageStatusFilter', 'recipientFilter'
        ];

        filterSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.handleFilter(selectId, e.target.value);
                });
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshAllData();
                        break;
                    case '1':
                        e.preventDefault();
                        this.showSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.showSection('users');
                        break;
                    case '3':
                        e.preventDefault();
                        this.showSection('events');
                        break;
                }
            }
        });
    }

    initializeUI() {
        // Initialize content sections
        this.initializeContentSections();

        // Initialize tooltips
        this.initializeTooltips();

        // Initialize modals
        this.initializeModals();

        // Setup loading states
        this.setupLoadingStates();
    }

    initializeContentSections() {
        // Hide all content sections initially - we'll show the correct one after URL parsing
        document.querySelectorAll('.content-section').forEach((section) => {
            section.style.display = 'none';
            section.classList.remove('active');
            section.style.opacity = '0';
        });

        // Remove active class from all nav links initially
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        console.log('âœ… Content sections initialized - Dashboard active');
    }

    initializeTooltips() {
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }
    }

    initializeModals() {
        document.addEventListener('hidden.bs.modal', (e) => {
            const modal = e.target;
            if (modal.id.includes('Modal')) {
                modal.remove();
            }
        });
    }

    setupLoadingStates() {
        if (!document.getElementById('globalLoader')) {
            const loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.className = 'global-loader d-none';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            document.body.appendChild(loader);
        }
    }

    async initializeUtilities() {
        // Initialize search engine with mock data
        if (this.searchEngine) {
            await this.initializeSearchEngine();
        }

        // Setup WebSocket event handlers
        if (this.wsManager) {
            this.setupWebSocketHandlers();
        }

        // Setup performance monitoring
        if (this.performanceMonitor) {
            this.setupPerformanceMonitoring();
        }

        // Initialize validation for forms
        if (this.validationEngine) {
            this.initializeValidation();
        }

        // Preload templates
        if (this.templateLoader) {
            await this.preloadTemplates();
        }
    }

    async initializeSearchEngine() {
        // Delegate to search module
        const mockData = this.getMockDataForSearch();

        this.searchEngine.indexData('users', mockData.users);
        this.searchEngine.indexData('events', mockData.events);
        this.searchEngine.indexData('payments', mockData.payments);
        this.searchEngine.indexData('ideas', mockData.ideas);
        this.searchEngine.indexData('messages', mockData.messages);

        console.log('ðŸ” Search engine initialized with mock data');
    }

    setupWebSocketHandlers() {
        // Delegate to WebSocket module
        this.wsManager.on('user_update', (data) => this.handleUserUpdate(data));
        this.wsManager.on('event_update', (data) => this.handleEventUpdate(data));
        this.wsManager.on('payment_update', (data) => this.handlePaymentUpdate(data));
        this.wsManager.on('idea_update', (data) => this.handleIdeaUpdate(data));
        this.wsManager.on('system_alert', (data) => this.showToast(data.message, data.level || 'warning'));

        console.log('ðŸ”Œ WebSocket handlers initialized');
    }

    setupPerformanceMonitoring() {
        // Delegate to performance module
        this.on('performance_report', (report) => {
            console.log('ðŸ“Š Performance report received:', report);

            if (report.recommendations.length > 0) {
                const highPriorityIssues = report.recommendations.filter(r => r.priority === 'high');
                if (highPriorityIssues.length > 0) {
                    this.showToast(`Performance issues detected: ${highPriorityIssues.length} high priority`, 'warning');
                }
            }
        });

        console.log('ðŸ“Š Performance monitoring initialized');
    }

    initializeValidation() {
        // Delegate to validation module
        const forms = document.querySelectorAll('form[data-validate]');
        forms.forEach(form => {
            const validateType = form.dataset.validate;
            this.validationEngine.setupRealTimeValidation(form, validateType);
        });

        console.log('âœ… Form validation initialized');
    }

    async preloadTemplates() {
        // Delegate to template module
        const commonTemplates = [
            'user-card',
            'event-card',
            'payment-row',
            'idea-card',
            'message-row',
            'loading-skeleton'
        ];

        try {
            await this.templateLoader.preloadTemplates(commonTemplates);
            console.log('âœ… Templates preloaded successfully');
        } catch (error) {
            console.warn('âš ï¸ Some templates failed to preload:', error);
        }
    }

    async loadInitialData() {
        try {
            // Load dashboard overview data
            await this.loadDashboardData();

            // Update last updated timestamp
            this.updateLastUpdated();

        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    /* ================= URL STATE MANAGEMENT ================= */

    async initializeFromURL() {
        // Show loading state to prevent flickering
        document.body.classList.add('admin-loading');

        // Parse URL parameters to restore state
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section') || 'dashboard';
        const view = urlParams.get('view') || 'analytics';

        console.log(`🔗 Restoring state from URL: section=${section}, view=${view}`);

        // Set current state
        this.currentSection = section;
        this.currentView = view;

        // Show the correct section immediately (no delay)
        if (section === 'dashboard') {
            // Show dashboard section and load its data
            this.showDashboardSection();
            await this.loadInitialData();
        } else {
            // Show the specified section
            this.showSection(section);

            // If it's a section with sub-views, show the specific view
            if (view !== 'analytics') {
                // Small delay to ensure section is loaded, but much shorter
                setTimeout(() => {
                    this.showSubView(section, view);
                }, 100);
            }
        }

        // Remove loading state
        document.body.classList.remove('admin-loading');
    }

    showDashboardSection() {
        // Show dashboard section immediately
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
            dashboardSection.classList.add('active');
            dashboardSection.style.opacity = '1';
        }

        // Activate dashboard nav link
        const dashboardLink = document.querySelector('[data-section="dashboard"]');
        if (dashboardLink) {
            dashboardLink.classList.add('active');
        }

        this.currentSection = 'dashboard';
        
        // Initialize charts when dashboard is shown (reduce delay)
        if (this.chartsModule) {
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                this.chartsModule.initializeCharts();
            });
        }

        console.log('✅ Dashboard section shown');
    }

    updateURL(section, view = 'analytics') {
        // Update URL without page reload
        const url = new URL(window.location);

        if (section === 'dashboard') {
            // Remove parameters for dashboard
            url.searchParams.delete('section');
            url.searchParams.delete('view');
        } else {
            url.searchParams.set('section', section);
            if (view !== 'analytics') {
                url.searchParams.set('view', view);
            } else {
                url.searchParams.delete('view');
            }
        }

        // Update URL without triggering page reload
        window.history.replaceState({}, '', url);

        console.log(`🔗 URL updated: ${url.pathname}${url.search}`);
    }

    showSubView(section, view) {
        console.log(`🎯 Showing sub-view: ${section}/${view}`);

        // Update current view
        this.currentView = view;

        // Delegate to appropriate module based on section
        switch (section) {
            case 'financial':
                this.financialManagement.showFinancialView(view);
                break;
            case 'events':
                this.eventManagement.showEventView(view);
                break;
            case 'innovation':
                this.ideasManagement.showIdeasView(view);
                break;
            case 'users':
                this.userManagement.showView(view);
                break;
            case 'communication':
                this.communicationManagement.showCommunicationView(view);
                break;
            default:
                console.warn(`Unknown section for sub-view: ${section}`);
        }
    }

    async loadDashboardData() {
        try {
            console.log('ðŸ“Š Loading dashboard data...');

            // Load overview stats and charts in parallel
            await Promise.all([
                this.loadOverviewStats(),
                this.chartsModule.refreshAllCharts(),
                this.loadSystemAlerts()
            ]);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            throw error;
        }
    }

    async loadOverviewStats() {
        try {
            const token = localStorage.getItem('authToken');

            // Try API first
            const response = await fetch('/api/admin/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('âœ… Admin stats loaded from API:', data);
                this.updateOverviewCards(data);
                return;
            }
        } catch (error) {
            console.log('âš ï¸ API unavailable, using mock admin data');
        }

        // Fallback to mock data immediately (no artificial delay)
        console.log('⚡️ Loading mock admin stats immediately');
        const mockStats = this.getMockAdminStats();
        this.updateOverviewCards(mockStats);
    }

    async loadSystemAlerts() {
        // Container for alerts
        const container = document.querySelector('#dashboard-section .col-md-4 .card-body');
        if (!container) return; // Be safer with selector if structure changes, but assuming it matches admin.html structure for "System Alerts" card

        try {
            // Find the specific card header to be sure matches "System Alerts"
            const alertsCard = Array.from(document.querySelectorAll('#dashboard-section .card')).find(c => c.querySelector('.card-header h5')?.textContent.trim() === 'System Alerts');
            if (!alertsCard) return;

            const body = alertsCard.querySelector('.card-body');
            const token = localStorage.getItem('authToken');

            const res = await fetch('/api/admin/alerts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const alerts = await res.json();
                this.renderSystemAlerts(alerts, body);
                return;
            }
        } catch (e) {
            console.warn('Failed to load system alerts, using partial/static content', e);
        }
    }

    renderSystemAlerts(alerts, container) {
        let html = '';

        if (alerts.pendingUsers > 0) {
            html += `
            <div class="alert alert-warning alert-sm">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>${alerts.pendingUsers} users</strong> pending approval
                <button class="btn btn-sm btn-outline-warning ms-2" onclick="window.adminDashboard.showSection('users')">Review</button>
            </div>`;
        }

        if (alerts.pendingEvents > 0) {
            html += `
            <div class="alert alert-info alert-sm">
                <i class="fas fa-calendar-check me-2"></i>
                <strong>${alerts.pendingEvents} events</strong> in draft
                <button class="btn btn-sm btn-outline-info ms-2" onclick="window.adminDashboard.showSection('events')">View</button>
            </div>`;
        }

        if (alerts.pendingIdeas > 0) {
            html += `
            <div class="alert alert-primary alert-sm">
                <i class="fas fa-lightbulb me-2"></i>
                <strong>${alerts.pendingIdeas} ideas</strong> pending review
                <button class="btn btn-sm btn-outline-primary ms-2" onclick="window.adminDashboard.showSection('innovation')">Review</button>
            </div>`;
        }

        // Always show system status if everything is clear
        if (html === '') {
            html = `
            <div class="alert alert-success alert-sm">
                <i class="fas fa-check-circle me-2"></i>
                All systems operational. No pending actions.
            </div>`;
        } else {
            // Append backup status anyway
            html += `
            <div class="alert alert-success alert-sm">
                <i class="fas fa-database me-2"></i>
                System backup active
            </div>`;
        }

        container.innerHTML = html;
    }

    updateOverviewCards(data) {
        // Update user stats
        this.updateElement('totalUsers', data.users?.total || 0);
        this.updateElement('newUsersWeek', `+${data.users?.newThisWeek || 0} this week`);

        // Update event stats
        this.updateElement('totalEvents', data.events?.total || 0);
        this.updateElement('upcomingEvents', `${data.events?.upcoming || 0} upcoming`);

        // Update revenue stats
        this.updateElement('totalRevenue', `KES ${this.formatNumber(data.payments?.totalRevenue || 0)}`);
        this.updateElement('revenueMonth', `+KES ${this.formatNumber(data.payments?.monthlyRevenue || 0)} this month`);

        // Update ideas stats
        this.updateElement('totalIdeas', data.ideas?.total || 0);
        this.updateElement('ideasMonth', `+${data.ideas?.monthlyIdeas || 0} this month`);
    }

    getMockAdminStats() {
        return {
            users: { total: 287, newThisWeek: 23, activeUsers: 245 },
            events: { total: 24, upcoming: 5, thisMonth: 8 },
            payments: { totalRevenue: 145000, monthlyRevenue: 23500, totalPayments: 156 },
            ideas: { total: 89, monthlyIdeas: 12, pendingReview: 15 }
        };
    }

    showSection(sectionName) {
        if (this.isLoading) return;

        console.log(`ðŸ”„ Switching to section: ${sectionName}`);

        // Hide all sections and remove active class
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.opacity = '0';
            section.classList.remove('active');
            setTimeout(() => {
                if (!section.classList.contains('active')) {
                    section.style.display = 'none';
                }
            }, 150);
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section with animation
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');

            // Trigger fade-in animation
            setTimeout(() => {
                targetSection.style.opacity = '1';
            }, 50);
        } else {
            console.error(`âŒ Section not found: ${sectionName}-section`);
        }

        // Add active class to clicked nav link
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        } else {
            console.error(`âŒ Nav link not found for section: ${sectionName}`);
        }

        this.currentSection = sectionName;

        // Update URL to preserve state
        this.updateURL(sectionName, this.currentView);

        // Load section-specific data
        this.loadSectionData(sectionName);

        console.log(`âœ… Successfully switched to section: ${sectionName}`);
    }

    async loadSectionData(section) {
        try {
            // Delegate to appropriate module
            switch (section) {
                case 'users':
                    await this.analytics.loadUserAnalytics();
                    break;
                case 'events':
                    await this.analytics.loadEventAnalytics();
                    break;
                case 'financial':
                    await this.analytics.loadFinancialAnalytics();
                    break;
                case 'innovation':
                    await this.analytics.loadInnovationAnalytics();
                    break;
                case 'communication':
                    await this.analytics.loadCommunicationAnalytics();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${section} data:`, error);
            this.showError(`Failed to load ${section} data`);
        }
    }

    handleSearch(inputId, query) {
        if (!this.searchEngine || !query.trim()) {
            // Fallback to basic search if search engine not available
            this.basicSearch(inputId, query);
            return;
        }

        // Delegate to search engine
        const searchResults = this.searchEngine.search(query, this.currentSection, {
            limit: 20,
            filters: this.getCurrentFilters()
        });

        console.log('ðŸ” Search results:', searchResults);
        this.displaySearchResults(searchResults);

        if (searchResults.suggestions.length > 0) {
            this.showSearchSuggestions(searchResults.suggestions);
        }
    }

    basicSearch(inputId, query) {
        // Basic search implementation when search engine is not available
        console.log(`Basic search in ${inputId}:`, query);
        // Implement basic filtering logic here
    }

    handleFilter(filterId, value) {
        console.log(`Filter ${filterId}:`, value);

        // Delegate to appropriate module based on current section
        switch (this.currentSection) {
            case 'users':
                this.userManagement.applyFilter(filterId, value);
                break;
            case 'events':
                this.eventManagement.applyEventFilter(filterId, value);
                break;
            case 'financial':
                this.financialManagement.applyPaymentFilter(filterId, value);
                break;
            case 'innovation':
                this.ideasManagement.applyIdeaFilter(filterId, value);
                break;
            case 'communication':
                this.communicationManagement.applyMessageFilter(filterId, value);
                break;
        }
    }

    // Real-time update handlers (delegate to modules)
    handleUserUpdate(data) {
        console.log('ðŸ‘¤ Handling user update:', data);
        this.userManagement.handleUpdate(data);
        if (this.currentSection === 'users' || this.currentSection === 'dashboard') {
            this.refreshSectionData('users');
        }
    }

    handleEventUpdate(data) {
        console.log('ðŸ“… Handling event update:', data);
        this.management.handleEventUpdate(data);
        if (this.currentSection === 'events' || this.currentSection === 'dashboard') {
            this.refreshSectionData('events');
        }
    }

    handlePaymentUpdate(data) {
        console.log('ðŸ’° Handling payment update:', data);
        this.management.handlePaymentUpdate(data);
        if (this.currentSection === 'financial' || this.currentSection === 'dashboard') {
            this.refreshSectionData('financial');
        }
    }

    handleIdeaUpdate(data) {
        console.log('ðŸ’¡ Handling idea update:', data);
        this.management.handleIdeaUpdate(data);
        if (this.currentSection === 'innovation' || this.currentSection === 'dashboard') {
            this.refreshSectionData('innovation');
        }
    }

    async refreshAllData() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showGlobalLoader();

        try {
            // Clear cache to force fresh data
            this.cache.clear();
            console.log('🗑️ Cache cleared for fresh data');

            // Refresh current section data
            await this.loadSectionData(this.currentSection);

            // Refresh dashboard overview if on dashboard
            if (this.currentSection === 'dashboard') {
                await this.loadOverviewStats();
            }

            this.updateLastUpdated();
            this.showSuccess('Data refreshed successfully');

        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.showError('Failed to refresh data');
        } finally {
            this.isLoading = false;
            this.hideGlobalLoader();
        }
    }

    async refreshSectionData(section) {
        try {
            await this.loadSectionData(section);
            console.log(`âœ… Refreshed ${section} data`);
        } catch (error) {
            console.error(`âŒ Failed to refresh ${section} data:`, error);
        }
    }

    // Utility methods
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        this.updateElement('lastUpdated', `Last updated: ${timeString}`);
    }

    showGlobalLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.remove('d-none');
        }
    }

    hideGlobalLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.add('d-none');
        }
    }

    showError(message) {
        console.error(message);
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        console.log(message);
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="toast-close" data-action="closeToast">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add click handler for close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    clearFilters(section) {
        console.log(`🧹 Clearing filters for section: ${section}`);

        const filterMaps = {
            'financial': ['paymentSearchInput', 'paymentMethodFilter', 'paymentStatusFilter', 'paymentDateFilter', 'amountRangeFilter'],
            'ideas': ['ideaSearchInput', 'ideaCategoryFilter', 'ideaStatusFilter', 'ideaDateFilter'],
            'messages': ['messageSearchInput', 'messageTypeFilter', 'messageStatusFilter', 'messageDateFilter']
        };

        const filters = filterMaps[section] || [];

        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.value = '';
            }
        });

        // Trigger refresh of the section
        if (section === 'financial') {
            this.financialManagement.showFinancialView('analytics');
        } else if (section === 'ideas') {
            this.ideasManagement.showIdeasView('analytics');
        } else if (section === 'messages') {
            this.communicationManagement.showCommunicationView('analytics');
        }

        this.showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} filters cleared`, 'success');
    }

    // Communication between modules is handled via management and analytics modules

    viewCollegeUsers(collegeName) {
        console.log(`👥 Viewing users from college: ${collegeName}`);
        this.userManagement.showUserManagement(collegeName);
    }

    manageEventType(eventType) {
        console.log(`🎯 Managing event type: ${eventType}`);

        // Show modal with event type management options
        const modalId = 'manageEventTypeModal';
        let modalEl = document.getElementById(modalId);

        if (!modalEl) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Manage ${eventType} Events</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" onclick="window.adminDashboard.filterEventsByType('${eventType}')">
                                        <i class="fas fa-filter me-2"></i>View All ${eventType} Events
                                    </button>
                                    <button class="btn btn-success" onclick="window.adminDashboard.createEventOfType('${eventType}')">
                                        <i class="fas fa-plus me-2"></i>Create New ${eventType}
                                    </button>
                                    <button class="btn btn-info" onclick="window.adminDashboard.analyzeEventType('${eventType}')">
                                        <i class="fas fa-chart-bar me-2"></i>View ${eventType} Analytics
                                    </button>
                                    <button class="btn btn-warning" onclick="window.adminDashboard.exportEventType('${eventType}')">
                                        <i class="fas fa-download me-2"></i>Export ${eventType} Data
                                    </button>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            modalEl = document.getElementById(modalId);
        }

        // Update modal title and content for the specific event type
        modalEl.querySelector('.modal-title').textContent = `Manage ${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Events`;

        new bootstrap.Modal(modalEl).show();
    }

    filterEventsByType(eventType) {
        console.log(`🔍 Filtering events by type: ${eventType}`);

        // Switch to event list view and filter by type
        this.showSection('events');
        this.management.showEventView('list');

        // Add filter logic here
        setTimeout(() => {
            const events = this.management.cache.events || [];
            const filteredEvents = events.filter(e => e.event_type === eventType);

            this.showToast(`Found ${filteredEvents.length} ${eventType} events`, 'info');
        }, 500);

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }

    createEventOfType(eventType) {
        console.log(`➕ Creating new ${eventType} event`);

        // Use the template system to create an event of this type
        this.management.useTemplate(eventType);

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }

    analyzeEventType(eventType) {
        console.log(`📊 Analyzing ${eventType} events`);

        this.showToast(`${eventType.charAt(0).toUpperCase() + eventType.slice(1)} analytics coming soon`, 'info');

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }

    exportEventType(eventType) {
        console.log(`📥 Exporting ${eventType} events`);

        this.exportSpecificData(`${eventType}-events`);

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }

    // Event system for internal module communication
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Event handler error:', error);
                }
            });
        }
    }

    // Helper methods for modules
    getCurrentFilters() {
        const filters = {};
        const filterSelects = document.querySelectorAll(`#${this.currentSection}-section select[id*="Filter"]`);

        filterSelects.forEach(select => {
            if (select.value) {
                const filterName = select.id.replace('Filter', '').toLowerCase();
                filters[filterName] = select.value;
            }
        });

        return filters;
    }

    getMockDataForSearch() {
        // Return mock data for search engine initialization
        return {
            users: [
                { id: 1, name: 'John Doe', email: 'john.doe@jkuat.ac.ke', college: 'Engineering', role: 'Member', status: 'Active' },
                { id: 2, name: 'Jane Smith', email: 'jane.smith@jkuat.ac.ke', college: 'Business', role: 'Leader', status: 'Active' }
            ],
            events: [
                { id: 1, title: 'AI Workshop', type: 'Workshop', status: 'Published', organizer: 'Tech Club' },
                { id: 2, title: 'Entrepreneurship Seminar', type: 'Seminar', status: 'Published', organizer: 'Business Club' }
            ],
            payments: [
                { id: 1, transactionId: 'TXN001', amount: 1500, method: 'M-Pesa', status: 'Completed', userName: 'John Doe' },
                { id: 2, transactionId: 'TXN002', amount: 2000, method: 'Bank Transfer', status: 'Pending', userName: 'Jane Smith' }
            ],
            ideas: [
                { id: 1, title: 'Smart Campus Navigation', category: 'Technology', status: 'Approved', submitterName: 'John Doe' },
                { id: 2, title: 'Sustainable Farming App', category: 'Agriculture', status: 'Pending', submitterName: 'Jane Smith' }
            ],
            messages: [
                { id: 1, subject: 'Welcome Message', type: 'Email', status: 'Delivered', recipientCount: 150 },
                { id: 2, subject: 'Event Reminder', type: 'SMS', status: 'Delivered', recipientCount: 75 }
            ]
        };
    }

    // Additional helper methods for search results display
    displaySearchResults(searchResults) {
        const container = document.getElementById(`${this.currentSection}Analytics`);
        if (!container) return;

        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'search-results-header mb-3';
        resultsHeader.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Search Results (${searchResults.totalResults} found in ${searchResults.searchTime.toFixed(2)}ms)</h6>
                <button class="btn btn-sm btn-outline-secondary" onclick="clearSearch()">
                    <i class="fas fa-times me-1"></i>Clear Search
                </button>
            </div>
        `;

        container.innerHTML = '';
        container.appendChild(resultsHeader);

        if (searchResults.results.length > 0) {
            this.renderSearchResults(searchResults.results, container);
        } else {
            container.innerHTML += '<div class="alert alert-info">No results found for your search.</div>';
        }
    }

    async renderSearchResults(results, container) {
        if (!this.templateLoader) {
            // Fallback rendering without templates
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results';
            resultsContainer.innerHTML = results.map(result =>
                `<div class="card mb-2"><div class="card-body">${result.title || result.name || result.id}</div></div>`
            ).join('');
            container.appendChild(resultsContainer);
            return;
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';

        for (const result of results) {
            const templateName = this.getTemplateForType(result.type);
            if (templateName) {
                const rendered = await this.templateLoader.renderTemplate(templateName, result);
                resultsContainer.innerHTML += rendered;
            }
        }

        container.appendChild(resultsContainer);
    }

    getTemplateForType(type) {
        const templateMap = {
            'users': 'user-card',
            'events': 'event-card',
            'payments': 'payment-row',
            'ideas': 'idea-card',
            'messages': 'message-row'
        };

        return templateMap[type];
    }

    showSearchSuggestions(suggestions) {
        // Implementation for search suggestions
        console.log('Search suggestions:', suggestions);
    }

    // Event Type Management Methods
    manageEventType(eventType) {
        console.log(`🎯 Managing event type: ${eventType}`);

        // Show modal with event type management options
        const modalId = 'manageEventTypeModal';
        let modalEl = document.getElementById(modalId);

        if (!modalEl) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Manage ${eventType} Events</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" onclick="window.adminDashboard.filterEventsByType('${eventType}')">
                                        <i class="fas fa-filter me-2"></i>View All ${eventType} Events
                                    </button>
                                    <button class="btn btn-success" onclick="window.adminDashboard.createEventOfType('${eventType}')">
                                        <i class="fas fa-plus me-2"></i>Create New ${eventType}
                                    </button>
                                    <button class="btn btn-info" onclick="window.adminDashboard.analyzeEventType('${eventType}')">
                                        <i class="fas fa-chart-bar me-2"></i>View ${eventType} Analytics
                                    </button>
                                    <button class="btn btn-warning" onclick="window.adminDashboard.exportEventType('${eventType}')">
                                        <i class="fas fa-download me-2"></i>Export ${eventType} Data
                                    </button>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            modalEl = document.getElementById(modalId);
        }

        // Update modal title and content for the specific event type
        modalEl.querySelector('.modal-title').textContent = `Manage ${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Events`;

        new bootstrap.Modal(modalEl).show();
    }

    filterEventsByType(eventType) {
        console.log(`🔍 Filtering events by type: ${eventType}`);

        // Switch to event list view and filter by type
        this.showSection('events');
        this.management.showEventView('list');

        // Add filter logic here
        setTimeout(() => {
            const events = this.management.cache.events || [];
            const filteredEvents = events.filter(e => e.event_type === eventType);

            this.showToast(`Found ${filteredEvents.length} ${eventType} events`, 'info');
        }, 500);

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }

    createEventOfType(eventType) {
        console.log(`➕ Creating new ${eventType} event`);

        // Use the template system to create an event of this type
        this.management.useTemplate(eventType);

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }

    analyzeEventType(eventType) {
        console.log(`📊 Analyzing ${eventType} events`);

        this.showToast(`${eventType.charAt(0).toUpperCase() + eventType.slice(1)} analytics coming soon`, 'info');

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }

    exportEventType(eventType) {
        console.log(`📥 Exporting ${eventType} events`);

        this.exportSpecificData(`${eventType}-events`);

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageEventTypeModal'));
        if (modal) modal.hide();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Global functions for HTML onclick handlers (maintain compatibility)
function refreshData() {
    if (window.adminDashboard) {
        window.adminDashboard.refreshAllData();
    }
}

function clearSearch() {
    const searchInputs = document.querySelectorAll('input[id*="SearchInput"]');
    searchInputs.forEach(input => {
        input.value = '';
    });

    if (window.adminDashboard) {
        window.adminDashboard.loadSectionData(window.adminDashboard.currentSection);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/';
    }
}
