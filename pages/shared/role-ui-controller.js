/**
 * JKUAT Innovation Club - Role-based UI Controller
 * Manages UI elements based on user roles and permissions
 */

class RoleUIController {
    constructor() {
        this.authSystem = window.authManager;
        this.init();
    }

    init() {
        this.setupEventListeners();

        // Wait for auth manager to be ready
        if (window.authManager && window.authManager.isAuthenticated()) {
            this.applyRoleBasedUI();
        } else {
            // Wait for auth manager to initialize
            document.addEventListener('userLoggedIn', () => {
                this.applyRoleBasedUI();
            });
        }

        console.log('🎨 Role UI Controller initialized');
    }

    setupEventListeners() {
        // Listen for auth state changes
        document.addEventListener('userLoggedIn', () => {
            this.applyRoleBasedUI();
        });

        document.addEventListener('userLoggedOut', () => {
            this.applyRoleBasedUI();
        });

        // Listen for role changes
        document.addEventListener('userRoleChanged', () => {
            this.applyRoleBasedUI();
        });

        // Apply UI when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.applyRoleBasedUI(), 200);
            });
        } else {
            setTimeout(() => this.applyRoleBasedUI(), 200);
        }
    }

    applyRoleBasedUI() {
        this.updateNavigationElements();
        this.updateAdminControls();
        this.updateContentCreationElements();
        this.updateUserInfo();
    }

    updateNavigationElements() {
        // Show/hide navigation elements based on role
        const user = this.authSystem?.getUser();
        const userRole = user?.role;

        // Admin-only navigation items (system administration)
        this.toggleElements('.admin-only', userRole === 'admin');

        // Executive+ navigation items (content management - executives and admins)
        this.toggleElements('.executive-only', userRole === 'executive' || userRole === 'admin');

        // Member+ navigation items (authenticated users)
        this.toggleElements('.member-only', this.authSystem?.isAuthenticated());

        // Guest-only items (non-authenticated)
        this.toggleElements('.guest-only', !this.authSystem?.isAuthenticated());
    }

    updateAdminControls() {
        // Events page admin controls
        const adminActions = document.getElementById('adminActions');
        const user = this.authSystem?.getUser();
        const isAdmin = user && user.role === 'admin';
        const isExecutive = user && user.role === 'executive';
        
        if (adminActions) {
            // Show admin actions for executives and admins
            adminActions.style.display = (isExecutive || isAdmin) ? 'flex' : 'none';
        }

        // Individual admin buttons with specific permissions
        this.toggleElementsByPermission('#createEventBtn', 'create_events');
        this.toggleElementsByPermission('#manageEventsBtn', 'edit_events');
        this.toggleElementsByPermission('.media-management-btn', 'access_media_library');

        // Admin dashboard access (admins only)
        this.toggleElements('.admin-dashboard-link', isAdmin);
        
        // CMS access (executives and admins)
        this.toggleElements('.cms-link', isExecutive || isAdmin);
    }

    updateContentCreationElements() {
        // Content creation buttons
        this.toggleElementsByPermission('.create-news-btn', 'post_news');
        this.toggleElementsByPermission('.create-article-btn', 'post_articles');
        this.toggleElementsByPermission('.manage-projects-btn', 'manage_projects');
        this.toggleElementsByPermission('.upload-media-btn', 'upload_media');

        // Content editing controls
        this.toggleElementsByPermission('.edit-content-btn', 'edit_events');
        this.toggleElementsByPermission('.delete-content-btn', 'delete_own_events');

        // Advanced content controls
        this.toggleElementsByPermission('.moderate-comments-btn', 'moderate_comments');
        this.toggleElementsByPermission('.send-notifications-btn', 'send_notifications');
    }

    updateUserInfo() {
        const user = this.authSystem?.getUser();
        const userInfo = {
            name: user?.full_name || user?.name || 'Guest User',
            role: user?.role || 'guest',
            initials: this.getUserInitials(user)
        };

        // Update user name displays
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = userInfo.name;
        });

        // Update user role displays
        document.querySelectorAll('.user-role').forEach(el => {
            el.textContent = this.getRoleDisplayName(userInfo.role);
        });

        // Update user initials
        document.querySelectorAll('.user-initials').forEach(el => {
            el.textContent = userInfo.initials;
        });

        // Update role badges
        this.updateRoleBadges(this.getRoleDisplayName(userInfo.role));
    }

    getUserInitials(user) {
        if (user?.full_name || user?.name) {
            const name = user.full_name || user.name;
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
        return 'G';
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'System Administrator',
            'executive': 'Executive Committee',
            'member': 'Club Member',
            'guest': 'Guest'
        };
        return roleNames[role] || 'Guest';
    }

    updateRoleBadges(roleName) {
        document.querySelectorAll('.role-badge').forEach(badge => {
            badge.textContent = roleName;
            badge.className = 'role-badge ' + this.getRoleBadgeClass(roleName);
        });
    }

    getRoleBadgeClass(roleName) {
        const roleClasses = {
            'Club Member': 'badge-member',
            'Executive Committee': 'badge-executive',
            'System Administrator': 'badge-admin'
        };
        return roleClasses[roleName] || 'badge-default';
    }

    // Utility methods
    toggleElements(selector, show) {
        document.querySelectorAll(selector).forEach(element => {
            element.style.display = show ? '' : 'none';
        });
    }

    toggleElementsByPermission(selector, permission) {
        // Simplified permission check based on role
        const user = this.authSystem?.getUser();
        const hasPermission = this.checkPermission(user?.role, permission);
        this.toggleElements(selector, hasPermission);
    }

    checkPermission(role, permission) {
        // Define role-based permissions
        const permissions = {
            'admin': ['create_events', 'edit_events', 'delete_events', 'access_media_library', 'post_news', 'post_articles', 'manage_projects', 'upload_media', 'moderate_comments', 'send_notifications', 'manage_users', 'system_config'],
            'executive': ['create_events', 'edit_events', 'access_media_library', 'post_news', 'post_articles', 'manage_projects', 'upload_media'],
            'member': ['view_content', 'register_events'],
            'guest': []
        };
        
        return permissions[role]?.includes(permission) || false;
    }

    showForRole(selector, requiredRole) {
        const user = this.authSystem?.getUser();
        const hasAccess = this.roleHasAccess(user?.role, requiredRole);
        this.toggleElements(selector, hasAccess);
    }

    roleHasAccess(userRole, requiredRole) {
        const roleHierarchy = {
            'guest': 0,
            'member': 1,
            'executive': 2,
            'admin': 3
        };
        
        const userLevel = roleHierarchy[userRole] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    }

    // Content creation helpers
    addContentCreationButton(containerId, buttonConfig) {
        const container = document.getElementById(containerId);
        const user = this.authSystem?.getUser();
        const hasPermission = this.checkPermission(user?.role, buttonConfig.permission);
        
        if (!container || !hasPermission) {
            return;
        }

        const button = document.createElement('button');
        button.className = buttonConfig.className || 'btn btn-primary';
        button.innerHTML = `
            <i class="${buttonConfig.icon}"></i>
            ${buttonConfig.text}
        `;

        if (buttonConfig.onClick) {
            button.addEventListener('click', buttonConfig.onClick);
        }

        container.appendChild(button);
    }

    // Activity tracking
    trackUserAction(action, details = {}) {
        // Log user activity (could be sent to backend)
        console.log('User action:', action, details);
        
        // Could implement actual logging here
        if (this.authSystem?.isAuthenticated()) {
            const user = this.authSystem.getUser();
            console.log(`User ${user?.email} performed action: ${action}`, details);
        }
    }

    // Permission-based content rendering
    renderContentByPermission(containerId, content, requiredPermission) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = this.authSystem?.getUser();
        const hasPermission = this.checkPermission(user?.role, requiredPermission);

        if (hasPermission) {
            container.innerHTML = content;
            container.style.display = '';
        } else {
            container.style.display = 'none';
        }
    }

    // Role-specific styling
    applyRoleTheming() {
        const user = this.authSystem?.getUser();
        const role = user?.role || 'guest';
        const body = document.body;

        // Remove existing role classes
        body.classList.remove('role-member', 'role-executive', 'role-admin', 'role-guest');

        // Add current role class
        body.classList.add(`role-${role}`);

        // Update CSS custom properties for role-specific colors
        const root = document.documentElement;
        const roleColors = {
            member: '#3b82f6',
            executive: '#10b981',
            admin: '#ef4444',
            guest: '#6b7280'
        };

        root.style.setProperty('--role-color', roleColors[role]);
        root.style.setProperty('--role-color-light', roleColors[role] + '20');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for auth manager...');

    if (window.authManager) {
        console.log('Auth manager found, initializing role UI controller...');
        window.roleUIController = new RoleUIController();
    } else {
        console.log('Auth manager not found, waiting...');
        // Wait a bit more for auth manager to load
        setTimeout(() => {
            if (window.authManager) {
                console.log('Auth manager loaded, initializing role UI controller...');
                window.roleUIController = new RoleUIController();
            } else {
                console.error('Auth manager failed to load');
            }
        }, 500);
    }
});

// Also try to initialize when auth manager becomes available
window.addEventListener('load', () => {
    if (window.authManager && !window.roleUIController) {
        console.log('Window loaded, initializing role UI controller...');
        window.roleUIController = new RoleUIController();
    }
});

// Listen for user login events
document.addEventListener('userLoggedIn', () => {
    if (!window.roleUIController) {
        console.log('User logged in, initializing role UI controller...');
        window.roleUIController = new RoleUIController();
    }
});

// Make available globally
window.RoleUIController = RoleUIController;


// Add debug function
window.debugRoleSystem = function () {
    console.log('=== ROLE SYSTEM DEBUG ===');
    console.log('Auth Manager:', window.authManager);
    console.log('Role UI Controller:', window.roleUIController);
    console.log('Current User:', window.authManager?.getUser());
    console.log('Is Authenticated:', window.authManager?.isAuthenticated());
    console.log('========================');
};