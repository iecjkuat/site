// Projects Page - Auth Component

class ProjectsAuth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔐 Initializing ProjectsAuth...');
        this.loadUserSession();
        console.log('✅ ProjectsAuth initialized');
    }

    loadUserSession() {
        // Check for existing session
        const savedUser = localStorage.getItem('jkuat_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('👤 User session loaded:', this.currentUser.name);
            } catch (error) {
                console.error('Error parsing user session:', error);
                localStorage.removeItem('jkuat_user');
            }
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    login(userData) {
        this.currentUser = userData;
        localStorage.setItem('jkuat_user', JSON.stringify(userData));
        console.log('✅ User logged in:', userData.name);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('jkuat_user');
        console.log('👋 User logged out');
        window.location.href = '/';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Projects Auth DOM loaded');
    window.projectsAuth = new ProjectsAuth();
});

// Make available globally
window.ProjectsAuth = ProjectsAuth;