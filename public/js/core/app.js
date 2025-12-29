// JKUAT Innovation Club - Main Application

class JKUATApp {
    constructor() {
        this.config = {
            apiBaseUrl: '/api',
            version: '1.0.0',
            debug: window.location.hostname === 'localhost'
        };
        
        this.modules = new Map();
        this.init();
    }

    init() {
        this.log('Initializing JKUAT Innovation Club App...');
        
        // Initialize core modules
        this.initializeModules();
        
        // Set up global event listeners
        this.setupGlobalEvents();
        
        // Initialize page-specific functionality
        this.initializePage();
        
        this.log('App initialized successfully');
    }

    initializeModules() {
        // Register core modules
        this.registerModule('navigation', new NavigationManager());
        this.registerModule('auth', new AuthManager());
        
        // Initialize message notifications (global component)
        if (typeof MessageNotifications !== 'undefined') {
            this.registerModule('messageNotifications', new MessageNotifications());
        }
        
        // Initialize all modules
        this.modules.forEach((module, name) => {
            if (typeof module.init === 'function') {
                module.init();
                this.log(`Module '${name}' initialized`);
            }
        });
    }

    registerModule(name, module) {
        this.modules.set(name, module);
        return this;
    }

    getModule(name) {
        return this.modules.get(name);
    }

    setupGlobalEvents() {
        // Handle mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.id === 'mobileMenuBtn') {
                this.toggleMobileMenu();
            }
        });

        // Handle smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Handle escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    initializePage() {
        const pageName = this.getCurrentPageName();
        this.log(`Initializing page: ${pageName}`);
        
        // Load page-specific module if it exists
        if (window[`${pageName}Page`]) {
            new window[`${pageName}Page`]();
        }
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        return path.replace('/', '').replace('.html', '');
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            const isHidden = mobileMenu.style.display === 'none' || !mobileMenu.style.display;
            mobileMenu.style.display = isHidden ? 'block' : 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.closest('[id$="Modal"]')?.classList.add('hidden');
        });
    }

    // Utility methods
    async apiCall(endpoint, options = {}) {
        const url = `${this.config.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            defaultOptions.headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    }

    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(var(--glass-blur));
            border: 1px solid var(--glass-border);
            color: white;
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-lg);
            z-index: var(--z-tooltip);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    log(...args) {
        if (this.config.debug) {
            console.log('[JKUAT App]', ...args);
        }
    }

    error(...args) {
        console.error('[JKUAT App]', ...args);
    }
}

// Navigation Manager
class NavigationManager {
    constructor() {
        this.currentPage = null;
    }

    init() {
        this.currentPage = this.getCurrentPage();
        this.updateActiveNavigation();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        return path.replace('/', '').replace('.html', '');
    }

    updateActiveNavigation() {
        // Update navigation active states
        document.querySelectorAll('nav a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `/${this.currentPage}` || (href === '/' && this.currentPage === 'home')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jkuatApp = new JKUATApp();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);