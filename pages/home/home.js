// JKUAT Innovation Club - Main Home Controller

class HomePage {
    constructor() {
        this.isInitialized = false;
        
        // Initialize modules
        this.authManager = new AuthManager(this);
        this.componentsManager = new ComponentsManager(this);
        this.animationsManager = new AnimationsManager(this);
        this.newsletterManager = new NewsletterManager(this);
        this.navigationManager = new NavigationManager(this);
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🏠 Initializing HomePage...');
        this.authManager.checkAuthState();
        this.bindEvents();
        this.animationsManager.initializeAnimations();
        this.newsletterManager.initializeNewsletter();
        this.componentsManager.initializeComponents();
        this.isInitialized = true;
        console.log('✅ HomePage initialized');
    }

    bindEvents() {
        // Navigation dropdown functionality
        this.navigationManager.initializeDropdown();
        this.navigationManager.initializeSmoothScrolling();
        
        // Hero buttons
        const heroRegisterBtn = document.getElementById('heroRegisterBtn');
        const heroLearnMoreBtn = document.getElementById('heroLearnMoreBtn');
        const joinMembershipBtn = document.getElementById('joinMembershipBtn');
        const viewEventsBtn = document.getElementById('viewEventsBtn');

        // Navigation auth buttons
        const navLoginBtn = document.getElementById('navLoginBtn');
        const navJoinBtn = document.getElementById('navJoinBtn');

        if (heroRegisterBtn) {
            heroRegisterBtn.addEventListener('click', () => {
                this.authManager.handleRegistration();
            });
        }

        if (heroLearnMoreBtn) {
            heroLearnMoreBtn.addEventListener('click', () => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        if (joinMembershipBtn) {
            joinMembershipBtn.addEventListener('click', () => {
                this.authManager.handleRegistration();
            });
        }

        if (viewEventsBtn) {
            viewEventsBtn.addEventListener('click', () => {
                window.location.href = '/events';
            });
        }

        // Navigation auth buttons
        if (navLoginBtn) {
            navLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.authManager.showLoginModal();
            });
        }

        if (navJoinBtn) {
            navJoinBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.authManager.showRegistrationModal();
            });
        }

        // Event card buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-register') || e.target.closest('.btn-register')) {
                e.preventDefault();
                this.authManager.handleEventRegistration();
            }
            
            if (e.target.classList.contains('btn-details') || e.target.closest('.btn-details')) {
                e.preventDefault();
                this.componentsManager.showEventDetails();
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
                       type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
                       'rgba(59, 130, 246, 0.2)';
        const textColor = type === 'success' ? '#10b981' : 
                         type === 'error' ? '#ef4444' : 
                         '#3b82f6';
        const borderColor = type === 'success' ? '#10b981' : 
                           type === 'error' ? '#ef4444' : 
                           '#3b82f6';

        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${bgColor};
            backdrop-filter: blur(20px);
            border: 1px solid ${borderColor};
            color: ${textColor};
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // Method to refresh all dynamic components
    refreshComponents() {
        console.log('🔄 Refreshing home page components...');
        this.componentsManager.refreshComponents();
        console.log('✅ Components refresh completed');
    }

    // Method to check component status
    getComponentStatus() {
        return {
            ...this.componentsManager.getComponentStatus(),
            isInitialized: this.isInitialized
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 DOM loaded, initializing HomePage...');
    
    // Wait for all scripts to load
    setTimeout(() => {
        const homePage = new HomePage();
        
        // Make available globally for debugging
        window.homePage = homePage;
        
    }, 200);
});

// Make available globally
window.HomePage = HomePage;