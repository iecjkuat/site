// Analytics Page - Authentication Component

class AnalyticsAuth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔐 Initializing AnalyticsAuth...');
        this.checkAuthState();
        this.bindEvents();
        console.log('✅ AnalyticsAuth initialized');
    }

    checkAuthState() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                this.updateUIForLoggedInUser();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.redirectToLogin();
            }
        } else {
            this.redirectToLogin();
        }
    }

    updateUIForLoggedInUser() {
        // Update user info in analytics
        const userNameElements = document.querySelectorAll('.user-name');
        const userEmailElements = document.querySelectorAll('.user-email');
        
        userNameElements.forEach(el => {
            if (el) el.textContent = this.currentUser.name || 'User';
        });
        
        userEmailElements.forEach(el => {
            if (el) el.textContent = this.currentUser.email || '';
        });
    }

    redirectToLogin() {
        console.log('No valid auth found, redirecting to home...');
        window.location.href = '/';
    }

    bindEvents() {
        // Logout functionality
        const logoutBtns = document.querySelectorAll('.logout-btn, #logoutBtn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Analytics Auth DOM loaded');
    window.analyticsAuth = new AnalyticsAuth();
});

// Make available globally
window.AnalyticsAuth = AnalyticsAuth;