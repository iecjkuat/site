/**
 * Admin Dashboard Configuration
 * Central configuration for all dashboard settings
 */

const AdminConfig = {
    // API Configuration
    api: {
        baseUrl: '/api',
        timeout: 10000,
        retryAttempts: 3,
        endpoints: {
            auth: '/auth/verify',
            dashboard: '/admin/dashboard/stats',
            users: '/admin/users',
            events: '/admin/events',
            payments: '/admin/payments',
            ideas: '/admin/ideas',
            messages: '/admin/messages',
            export: '/admin/export'
        }
    },

    // UI Configuration
    ui: {
        theme: 'default',
        animations: true,
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        itemsPerPage: 20,
        maxSearchResults: 100,
        debounceDelay: 300
    },

    // Feature Flags
    features: {
        realTimeUpdates: true,
        templateSystem: true,
        advancedFiltering: true,
        bulkOperations: true,
        exportFunctionality: true,
        notificationSystem: true,
        auditLogging: true
    },

    // Section Configuration
    sections: {
        dashboard: {
            enabled: true,
            defaultView: 'overview',
            refreshOnLoad: true
        },
        users: {
            enabled: true,
            defaultView: 'analytics',
            views: ['analytics', 'list', 'pending'],
            filters: ['college', 'status', 'role'],
            sortOptions: ['name', 'date', 'status']
        },
        events: {
            enabled: true,
            defaultView: 'analytics',
            views: ['analytics', 'list', 'calendar', 'drafts'],
            filters: ['type', 'status', 'date'],
            sortOptions: ['date', 'name', 'attendees']
        },
        financial: {
            enabled: true,
            defaultView: 'analytics',
            views: ['analytics', 'payments', 'pending', 'reports'],
            filters: ['method', 'status', 'date', 'amount'],
            sortOptions: ['date', 'amount', 'status']
        },
        innovation: {
            enabled: true,
            defaultView: 'analytics',
            views: ['analytics', 'ideas', 'pending', 'challenges'],
            filters: ['category', 'status', 'votes'],
            sortOptions: ['votes', 'date', 'title']
        },
        communication: {
            enabled: true,
            defaultView: 'analytics',
            views: ['analytics', 'history', 'scheduled', 'templates'],
            filters: ['type', 'status', 'recipients', 'date'],
            sortOptions: ['date', 'recipients', 'status']
        },
        reports: {
            enabled: true,
            defaultView: 'overview',
            formats: ['csv', 'excel', 'pdf', 'json'],
            dateRanges: ['7d', '30d', '90d', '1y', 'custom']
        }
    },

    // Data Configuration
    data: {
        mockDataEnabled: true,
        cacheEnabled: true,
        cacheTimeout: 300000, // 5 minutes
        batchSize: 50,
        maxRetries: 3
    },

    // Notification Configuration
    notifications: {
        enabled: true,
        position: 'top-right',
        autoHide: true,
        hideDelay: 5000,
        types: {
            success: { icon: 'check-circle', color: 'success' },
            error: { icon: 'exclamation-circle', color: 'danger' },
            warning: { icon: 'exclamation-triangle', color: 'warning' },
            info: { icon: 'info-circle', color: 'info' }
        }
    },

    // Template Configuration
    templates: {
        enabled: true,
        basePath: 'templates/',
        cacheEnabled: true,
        preloadCommon: true,
        commonTemplates: [
            'user-card',
            'event-card',
            'payment-row',
            'idea-card',
            'message-row',
            'loading-skeleton'
        ]
    },

    // Security Configuration
    security: {
        requireAuth: true,
        requireAdminRole: true,
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 3,
        lockoutDuration: 900000 // 15 minutes
    },

    // Performance Configuration
    performance: {
        lazyLoading: true,
        virtualScrolling: false,
        imageOptimization: true,
        compressionEnabled: true,
        minificationEnabled: true
    },

    // Accessibility Configuration
    accessibility: {
        highContrast: false,
        screenReaderSupport: true,
        keyboardNavigation: true,
        focusIndicators: true,
        ariaLabels: true
    },

    // Development Configuration
    development: {
        debugMode: false,
        verboseLogging: false,
        mockApiDelay: 1000,
        showPerformanceMetrics: false,
        enableHotReload: false
    },

    // Color Schemes
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        light: '#f8f9fa',
        dark: '#212529'
    },

    // Status Mappings
    statusMappings: {
        user: {
            'Active': { color: 'success', icon: 'check-circle' },
            'Pending': { color: 'warning', icon: 'clock' },
            'Suspended': { color: 'danger', icon: 'ban' },
            'Inactive': { color: 'secondary', icon: 'user-slash' }
        },
        event: {
            'Draft': { color: 'secondary', icon: 'edit' },
            'Published': { color: 'success', icon: 'calendar-check' },
            'Ongoing': { color: 'primary', icon: 'play-circle' },
            'Completed': { color: 'success', icon: 'check-circle' },
            'Cancelled': { color: 'danger', icon: 'times-circle' }
        },
        payment: {
            'Completed': { color: 'success', icon: 'check-circle' },
            'Pending': { color: 'warning', icon: 'clock' },
            'Failed': { color: 'danger', icon: 'times-circle' },
            'Refunded': { color: 'info', icon: 'undo' }
        },
        idea: {
            'Pending': { color: 'warning', icon: 'clock' },
            'Approved': { color: 'success', icon: 'check-circle' },
            'Rejected': { color: 'danger', icon: 'times-circle' },
            'In Development': { color: 'info', icon: 'cog' },
            'Implemented': { color: 'success', icon: 'star' }
        },
        message: {
            'Delivered': { color: 'success', icon: 'check-circle' },
            'Pending': { color: 'warning', icon: 'clock' },
            'Failed': { color: 'danger', icon: 'times-circle' },
            'Scheduled': { color: 'info', icon: 'calendar' }
        }
    },

    // Default Data
    defaults: {
        pageSize: 20,
        sortOrder: 'desc',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        currency: 'KES',
        locale: 'en-US'
    }
};

// Freeze configuration to prevent accidental modifications
Object.freeze(AdminConfig);

// Export for global usage
window.AdminConfig = AdminConfig;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminConfig;
}