// JKUAT Innovation Club - Resources Page Auth Component

class ResourcesAuth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔐 Resources Auth init() called');
        this.loadCurrentUser();
        this.renderAuthButtons();
        console.log('✅ Resources Auth init() completed');
    }

    loadCurrentUser() {
        // Try to get user from localStorage
        const userData = localStorage.getItem('jkuat_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                console.log('✅ Current user loaded:', this.currentUser.email);
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                localStorage.removeItem('jkuat_user');
            }
        }
    }

    renderAuthButtons() {
        const authButtonsContainer = document.getElementById('authButtons');
        if (!authButtonsContainer) {
            console.error('❌ authButtons container not found');
            return;
        }

        if (this.currentUser) {
            // User is logged in
            authButtonsContainer.innerHTML = `
                <div class="user-menu">
                    <button class="glass-button user-button" onclick="window.resourcesAuth.toggleUserDropdown()">
                        <i class="fas fa-user"></i>
                        ${this.currentUser.name || this.currentUser.email}
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div id="userDropdown" class="user-dropdown hidden">
                        <a href="/dashboard" class="dropdown-item">
                            <i class="fas fa-tachometer-alt"></i>Dashboard
                        </a>
                        <a href="/settings" class="dropdown-item">
                            <i class="fas fa-cog"></i>Settings
                        </a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" onclick="window.resourcesAuth.logout()">
                            <i class="fas fa-sign-out-alt"></i>Logout
                        </button>
                    </div>
                </div>
            `;
        } else {
            // User is not logged in
            authButtonsContainer.innerHTML = `
                <a href="/login" class="glass-button">
                    <i class="fas fa-sign-in-alt"></i>Login
                </a>
                <a href="/register" class="btn btn-primary">
                    <i class="fas fa-user-plus"></i>Join Club
                </a>
            `;
        }
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    async logout() {
        try {
            // Clear user data
            localStorage.removeItem('jkuat_user');
            this.currentUser = null;
            
            // Show success message
            this.showMessage('Logged out successfully', 'success');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            this.showMessage('Error during logout', 'error');
        }
    }

    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Resources Auth DOM loaded');
    window.resourcesAuth = new ResourcesAuth();
});

// Make available globally
window.ResourcesAuth = ResourcesAuth;