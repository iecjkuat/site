// JKUAT Innovation Club - Main Home Controller

class HomePage {
    constructor() {
        this.isInitialized = false;

        // Initialize modules (removed authManager and navigationManager)
        this.componentsManager = new ComponentsManager(this);
        this.animationsManager = new AnimationsManager(this);

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        console.log('🏠 Initializing Modern HomePage...');

        // Initialize auth system integration
        this.initializeAuthIntegration();

        // Initialize components
        console.log('🔗 Binding events...');
        this.bindEvents();

        console.log('🎨 Initializing animations...');
        this.animationsManager.initializeAnimations();

        console.log('🧩 Initializing components...');
        this.componentsManager.initializeComponents();

        // Initialize modern features
        console.log('✨ Initializing modern features...');
        this.initializeModernFeatures();

        this.isInitialized = true;
        console.log('✅ Modern HomePage initialized successfully');
    }

    bindEvents() {
        console.log('🔗 Binding events...');

        // Initialize smooth scrolling (moved from NavigationManager)
        this.initializeSmoothScrolling();

        // Attach button handlers
        this.attachButtonHandlers();
    }

    initializeSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    attachButtonHandlers() {
        console.log('🔘 Attaching button handlers...');

        const handlers = {
            'navbar-login-btn': (e) => { // Match shared navbar ID
                e.preventDefault();
                if (window.authManager?.isAuthenticated()) {
                    this.showUserMenu();
                } else {
                    const currentPage = window.location.pathname;
                    window.location.href = `/signin?redirect=${encodeURIComponent(currentPage)}`;
                }
            },
            'heroRegisterBtn': (e) => {
                e.preventDefault();
                const isAuth = window.authManager?.isAuthenticated();
                if (isAuth) {
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/signup';
                }
            },
            'heroLearnMoreBtn': (e) => {
                e.preventDefault();
                document.getElementById('activity-feed')?.scrollIntoView({ behavior: 'smooth' });
            }
        };

        Object.entries(handlers).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = handler;
                console.log(`✅ Event handler set for ${id}`);
            }
        });
    }

    initializeAuthIntegration() {
        // Check if we have the auth manager available
        const hasAuthManager = window.authManager;

        if (hasAuthManager) {
            this.updateUIForRole();
            // Listen for auth state changes
            document.addEventListener('userLoggedIn', () => {
                this.updateUIForRole();
            });
            document.addEventListener('userLoggedOut', () => {
                this.updateUIForRole();
            });
        } else {
            console.log('⚠️ Auth manager not available, using guest mode');
            this.updateUIForGuestMode();
        }

        // Listen for auth manager ready events
        document.addEventListener('authManagerReady', () => {
            this.updateUIForRole();
        });
    }

    initializeSupabaseAuth() {
        if (!window.supabase) return;

        // Listen for auth state changes
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Supabase auth state changed:', event);
            this.updateUIForRole();
        });

        // Check current session
        window.supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('🔐 Found existing Supabase session');
                this.updateUIForRole();
            }
        });
    }

    updateUIForGuestMode() {
        // Set up UI for guest users
        const loginBtn = document.getElementById('navLoginBtn');
        const joinBtn = document.getElementById('navJoinBtn');

        if (loginBtn) {
            // Safely update button content
            loginBtn.innerHTML = '';
            const icon = document.createElement('i');
            icon.className = 'fas fa-user';
            loginBtn.appendChild(icon);
            loginBtn.appendChild(document.createTextNode(' Login'));
        }
        if (joinBtn) {
            joinBtn.innerHTML = '';
            const icon = document.createElement('i');
            icon.className = 'fas fa-user-plus';
            joinBtn.appendChild(icon);
            joinBtn.appendChild(document.createTextNode(' Join'));
            joinBtn.style.display = '';
        }
    }

    updateUIForRole() {
        // Use auth manager
        let user = null;
        let isAuthenticated = false;

        if (window.authManager) {
            user = window.authManager.getUser();
            isAuthenticated = window.authManager.isAuthenticated();
        }

        this.updateNavForUser(user, isAuthenticated);
    }

    updateNavForUser(user, isAuthenticated) {
        // Update navigation based on auth state
        const loginBtn = document.getElementById('navLoginBtn');
        const joinBtn = document.getElementById('navJoinBtn');

        if (isAuthenticated && user) {
            // Show user info instead of login/join buttons
            if (loginBtn) {
                const userName = user.user_metadata?.full_name || user.full_name || user.name || user.email?.split('@')[0] || 'User';
                // Safely update button content
                loginBtn.innerHTML = '';
                const icon = document.createElement('i');
                icon.className = 'fas fa-user';
                loginBtn.appendChild(icon);
                loginBtn.appendChild(document.createTextNode(' ' + userName));
            }
            if (joinBtn) {
                joinBtn.style.display = 'none';
            }

            // Update hero buttons for authenticated users
            this.updateHeroButtonsForAuth();
        } else {
            // Reset to default state for non-authenticated users
            if (loginBtn) {
                loginBtn.innerHTML = '';
                const icon = document.createElement('i');
                icon.className = 'fas fa-user';
                loginBtn.appendChild(icon);
                loginBtn.appendChild(document.createTextNode(' Login'));
            }
            if (joinBtn) {
                joinBtn.style.display = '';
                joinBtn.innerHTML = '';
                const icon = document.createElement('i');
                icon.className = 'fas fa-user-plus';
                joinBtn.appendChild(icon);
                joinBtn.appendChild(document.createTextNode(' Join'));
            }
        }

        // Update engagement cards based on role
        this.updateEngagementCards();

        // Update activity feed for role-specific content
        if (window.activityFeed) {
            window.activityFeed.loadFeedData();
        }
    }

    updateEngagementCards() {
        const engagementCards = document.querySelectorAll('.engagement-card .card-cta');

        engagementCards.forEach(button => {
            // Prevent duplicate event listeners
            if (button.dataset.bound === 'true') return;
            button.dataset.bound = 'true';

            const role = button.dataset.role;

            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEngagementAction(role);
            });
        });
    }

    updateHeroButtonsForAuth() {
        const heroRegisterBtn = document.getElementById('heroRegisterBtn');

        // Check authentication status from auth manager
        let isAuthenticated = false;
        if (window.authManager) {
            isAuthenticated = window.authManager.isAuthenticated();
        }

        if (heroRegisterBtn && isAuthenticated) {
            // Safely update hero button content
            heroRegisterBtn.innerHTML = '';
            const iconSpan = document.createElement('span');
            iconSpan.className = 'btn-icon';
            const icon = document.createElement('i');
            icon.className = 'fas fa-tachometer-alt';
            iconSpan.appendChild(icon);

            const textSpan = document.createElement('span');
            textSpan.className = 'btn-text';
            textSpan.textContent = 'Go to Dashboard';

            heroRegisterBtn.appendChild(iconSpan);
            heroRegisterBtn.appendChild(textSpan);

            const shineSpan = document.createElement('span');
            shineSpan.className = 'btn-shine';
            heroRegisterBtn.appendChild(shineSpan);

            heroRegisterBtn.onclick = () => window.location.href = '/dashboard';
        }
    }

    handleEngagementAction(role) {
        switch (role) {
            case 'student':
                // Check authentication using auth manager
                let isAuthenticated = false;
                if (window.authManager) {
                    isAuthenticated = window.authManager.isAuthenticated();
                }

                if (isAuthenticated) {
                    window.location.href = '../events/events.html';
                } else {
                    window.showRegister?.();
                }
                break;
            case 'professional':
                window.location.href = '/partnerships';
                break;
            case 'alumni':
                window.location.href = '/alumni';
                break;
        }
    }

    initializeModernFeatures() {
        // Initialize rotating text in hero
        this.initializeRotatingText();

        // Initialize scroll animations
        this.initializeScrollAnimations();

        // Initialize interactive elements
        this.initializeInteractiveElements();
    }

    initializeRotatingText() {
        const rotatingElement = document.querySelector('.rotating-text');
        if (!rotatingElement) return;

        const texts = JSON.parse(rotatingElement.dataset.texts || '[]');
        if (texts.length === 0) return;

        let currentIndex = 0;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % texts.length;
            rotatingElement.textContent = texts[currentIndex];
        }, 3000);
    }

    initializeScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements with data-aos attributes
        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });
    }

    initializeInteractiveElements() {
        // Add hover effects to cards
        document.querySelectorAll('.feed-item, .dashboard-widget, .engagement-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        // Initialize counter animations
        this.initializeCounters();
    }

    initializeCounters() {
        const counters = document.querySelectorAll('.counter');

        const animateCounter = (counter) => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 16);
        };

        // Animate counters when they come into view
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    showUserMenu() {
        // Show user menu with profile options
        const menu = document.createElement('div');
        menu.className = 'user-menu-dropdown';

        const menuContent = document.createElement('div');
        menuContent.className = 'user-menu-content';

        // Create menu items
        const profileLink = document.createElement('a');
        profileLink.href = '/profile';
        profileLink.className = 'menu-item';
        profileLink.innerHTML = '<i class="fas fa-user"></i> Profile';

        const dashboardLink = document.createElement('a');
        dashboardLink.href = '/dashboard';
        dashboardLink.className = 'menu-item';
        dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';

        const settingsLink = document.createElement('a');
        settingsLink.href = '/settings';
        settingsLink.className = 'menu-item';
        settingsLink.innerHTML = '<i class="fas fa-cog"></i> Settings';

        const divider = document.createElement('hr');
        divider.className = 'menu-divider';

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'menu-item logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = () => {
            if (window.authManager) {
                window.authManager.logout();
            }
            menu.remove();
        };

        // Append all items
        menuContent.appendChild(profileLink);
        menuContent.appendChild(dashboardLink);
        menuContent.appendChild(settingsLink);
        menuContent.appendChild(divider);
        menuContent.appendChild(logoutBtn);
        menu.appendChild(menuContent);

        document.body.appendChild(menu);

        // Position menu
        const loginBtn = document.getElementById('navLoginBtn');
        const rect = loginBtn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 10}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !loginBtn.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    showAuthModal(mode = 'login') {
        // Redirect to standalone auth pages instead of showing modal
        if (mode === 'login') {
            window.location.href = '/signin';
        } else if (mode === 'register') {
            window.location.href = '/signup';
        } else {
            console.error('Unknown auth mode:', mode);
        }
    }

    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        toast.style.color = 'white';
        toast.style.padding = '1rem 1.5rem';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        toast.style.zIndex = '10000';
        toast.style.fontFamily = 'inherit';
        toast.style.fontWeight = '500';
        toast.style.animation = 'slideIn 0.3s ease-out';

        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    refreshComponents() {
        console.log('🔄 Refreshing home page components...');
        this.componentsManager.refreshComponents();
        console.log('✅ Components refresh completed');
    }

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
    const homePage = new HomePage();
    window.homePage = homePage;

    // Make HomePage available to auth manager for toast notifications
    if (window.authManager) {
        window.authManager.homePageInstance = window.homePage;
    }

    // Listen for auth manager ready event to connect them
    document.addEventListener('authManagerReady', () => {
        if (window.authManager && window.homePage) {
            window.authManager.homePageInstance = window.homePage;
            console.log('🔗 Connected auth manager to home page for notifications');
        }
    });
});

window.HomePage = HomePage;
