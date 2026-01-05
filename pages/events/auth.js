// Events Page - Authentication Component

class EventsAuth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔐 Initializing EventsAuth...');
        this.checkAuthState();
        this.bindEvents();
        console.log('✅ EventsAuth initialized');
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
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
    }

    updateUIForLoggedInUser() {
        // Update auth buttons to show user info
        const authButtons = document.querySelector('.nav-auth');
        if (authButtons && this.currentUser) {
            authButtons.innerHTML = `
                <a href="/dashboard" class="glass-button">
                    <i class="fas fa-tachometer-alt"></i>Dashboard
                </a>
                <button class="glass-button logout-btn">
                    <i class="fas fa-sign-out-alt"></i>Logout
                </button>
            `;
            this.bindLogoutEvent();
        }
    }

    bindEvents() {
        // Logout functionality will be bound after UI update
    }

    bindLogoutEvent() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
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
    console.log('🔐 Events Auth DOM loaded');
    window.eventsAuth = new EventsAuth();
});

// Make available globally
window.EventsAuth = EventsAuth;