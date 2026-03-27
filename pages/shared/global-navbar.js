/**
 * JKUAT Innovation Club - Global Navbar System
 * Shared navigation component for all pages
 */

console.log('Loading Global Navbar System...');

class GlobalNavbar {
    constructor(options = {}) {
        if (window.preventGlobalNavbar) return { init: () => {} };
        if (document.getElementById('global-navbar')) return { init: () => {} };

        this.options = {
            activePagePath: window.location.pathname,
            showNotifications: true,
            ...options
        };

        this.isInitialized = false;
        this.hamburgerBtn = null;
        this.navLinksContainer = null;
        this.dropdownToggle = null;
        this.dropdownMenu = null;
        this.dropdownClickHandler = null;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        if (document.getElementById('global-navbar')) return;
        if (window.preventGlobalNavbar) return;
        if (document.querySelector('nav.glass-nav:not(#global-navbar)')) return;

        this.createNavbar();
        this.setupEventListeners();
        this.setupAuthIntegration();

        this.isInitialized = true;
        window.globalNavbar = this;

        document.dispatchEvent(new CustomEvent('globalNavbarReady'));
        console.log('Global Navbar initialized');
    }

    createNavbar() {
        if (document.getElementById('global-navbar')) return;

        const nav = document.createElement('nav');
        nav.id = 'global-navbar';
        nav.className = 'glass-nav';
        nav.innerHTML = this.getNavbarHTML();

        document.body.insertBefore(nav, document.body.firstChild);

        // Set body padding based on viewport
        const setPadding = () => {
            if (!document.body.dataset.customPadding) {
                document.body.style.paddingTop = window.innerWidth <= 768 ? '65px' : '110px';
            }
        };
        setPadding();
        window.addEventListener('resize', setPadding);

        console.log('Global navbar created');
    }

    getNavbarHTML() {
        return `
            <div class="global-navbar-container">
                <div class="global-navbar-inner">
                    <div class="nav-club-header">
                        <div class="nav-club-title">JKUAT Innovation &amp; Entrepreneurship Club</div>
                    </div>

                    <button class="hamburger-menu" id="hamburger-btn" aria-label="Toggle navigation menu">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>

                    <div class="nav-links-container" id="nav-links-container">
                        <div class="nav-center">
                            ${this.getNavLink('/', '🏠 Home')}
                            ${this.getNavLink('/dashboard', '📊 Dashboard')}
                            ${this.getNavLink('/events', '📅 Events')}
                            ${this.getNavLink('/projects', '🚀 Projects')}
                            ${this.getNavLink('/ideas', '💡 Ideas')}
                            ${this.getNavLink('/news', '📰 News')}

                            <div class="nav-dropdown desktop-only">
                                ${this.getDropdownMenu()}
                            </div>

                            <div class="mobile-nav-links">
                                <span class="mobile-section-label">Community</span>
                                ${this.getNavLink('/opportunities', '💼 Opportunities')}
                                ${this.getNavLink('/resources', '📚 Resources')}
                                ${this.getNavLink('/leadership', '👥 Leadership')}
                                ${this.getNavLink('/voting', '🗳️ Voting')}
                                <span class="mobile-section-label">Services</span>
                                ${this.getNavLink('/payment', '💳 Payments')}
                                ${this.getNavLink('/support', '🆘 Support')}
                                ${this.getNavLink('/feedback', '💬 Feedback')}
                                ${this.getNavLink('/settings', '⚙️ Settings')}
                                <span class="mobile-section-label">Management</span>
                                ${this.getNavLink('/cms', '📝 Content Hub')}
                                ${this.getNavLink('/admin', '🔧 Admin Dashboard')}
                            </div>
                        </div>

                        <div class="nav-auth">
                            <button id="navbar-login-btn" class="glass-button">
                                <i class="fas fa-user"></i> Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDropdownMenu() {
        return `
            <button class="glass-button dropdown-toggle" id="navbar-more-menu">
                <i class="fas fa-ellipsis-h"></i> More
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            </button>
            <div class="dropdown-menu" id="navbar-more-dropdown">
                <div class="dropdown-section">
                    <div class="dropdown-section-title">Community</div>
                    ${this.getNavLink('/opportunities', '💼 Opportunities', true)}
                    ${this.getNavLink('/resources', '📚 Resources', true)}
                    ${this.getNavLink('/leadership', '👥 Leadership', true)}
                    ${this.getNavLink('/voting', '🗳️ Voting', true)}
                </div>
                <div class="dropdown-section">
                    <div class="dropdown-section-title">Services</div>
                    ${this.getNavLink('/payment', '💳 Payments', true)}
                    ${this.getNavLink('/support', '🆘 Support', true)}
                    ${this.getNavLink('/feedback', '💬 Feedback', true)}
                    ${this.getNavLink('/settings', '⚙️ Settings', true)}
                </div>
                <div class="dropdown-section">
                    <div class="dropdown-section-title">Management</div>
                    ${this.getNavLink('/cms', '📝 Content Hub', true)}
                    ${this.getNavLink('/admin', '🔧 Admin Dashboard', true)}
                </div>
            </div>
        `;
    }

    getNavLink(href, text, isDropdownItem = false) {
        const isActive = this.isActivePage(href);
        const activeClass = isActive ? ' active' : '';
        const cls = isDropdownItem ? `dropdown-item${activeClass}` : `glass-button${activeClass}`;
        return `<a href="${href}" class="${cls}">${text}</a>`;
    }

    isActivePage(href) {
        const current = window.location.pathname.replace(/\/+$/, '') || '/';
        const target = href.replace(/\/+$/, '') || '/';
        if (target === '/') {
            return current === '/' || current === '/home' || current.includes('index.html');
        }
        return current === target || current.startsWith(target + '/');
    }

    setupEventListeners() {
        this.hamburgerBtn = document.getElementById('hamburger-btn');
        this.navLinksContainer = document.getElementById('nav-links-container');
        this.dropdownToggle = document.getElementById('navbar-more-menu');
        this.dropdownMenu = document.getElementById('navbar-more-dropdown');

        // Hamburger
        if (this.hamburgerBtn && this.navLinksContainer) {
            this.hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = this.hamburgerBtn.classList.toggle('active');
                this.navLinksContainer.classList.toggle('active', isOpen);
            });

            // Close drawer when a link is clicked
            this.navLinksContainer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.hamburgerBtn.classList.remove('active');
                    this.navLinksContainer.classList.remove('active');
                });
            });
        }

        // Dropdown
        this.setupDropdownListeners();

        // Close on outside click
        document.addEventListener('click', (e) => {
            // Close dropdown
            if (this.dropdownToggle && this.dropdownMenu) {
                if (!this.dropdownToggle.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
                    this.closeDropdown();
                }
            }
            // Close drawer
            if (this.hamburgerBtn && this.navLinksContainer) {
                if (!this.hamburgerBtn.contains(e.target) && !this.navLinksContainer.contains(e.target)) {
                    this.hamburgerBtn.classList.remove('active');
                    this.navLinksContainer.classList.remove('active');
                }
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
                this.hamburgerBtn?.classList.remove('active');
                this.navLinksContainer?.classList.remove('active');
            }
        });

        // Auth button
        const loginBtn = document.getElementById('navbar-login-btn');
        if (loginBtn) loginBtn.onclick = this.handleAuthButtonClick;
    }

    setupDropdownListeners() {
        if (!this.dropdownToggle || !this.dropdownMenu) return;

        if (this.dropdownClickHandler) {
            this.dropdownToggle.removeEventListener('click', this.dropdownClickHandler);
        }

        this.dropdownClickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = this.dropdownMenu.classList.toggle('show');
            const arrow = this.dropdownToggle.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        };

        this.dropdownToggle.addEventListener('click', this.dropdownClickHandler);
    }

    openDropdown() {
        if (!this.dropdownMenu) return;
        this.dropdownMenu.classList.add('show');
        const arrow = this.dropdownToggle?.querySelector('.dropdown-arrow');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }

    closeDropdown() {
        if (!this.dropdownMenu) return;
        this.dropdownMenu.classList.remove('show');
        const arrow = this.dropdownToggle?.querySelector('.dropdown-arrow');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }

    setupAuthIntegration() {
        document.addEventListener('userLoggedIn', (e) => this.updateAuthButton(e.detail));
        document.addEventListener('userLoggedOut', () => this.updateAuthButton(null));
        document.addEventListener('authReady', () => {
            if (window.authManager?.isAuthenticated?.()) {
                this.updateAuthButton(window.authManager.getUser());
            }
        });

        setTimeout(() => {
            if (window.authManager?.isAuthenticated?.()) {
                this.updateAuthButton(window.authManager.getUser());
            }
        }, 100);
    }

    updateAuthButton(user) {
        const btn = document.getElementById('navbar-login-btn');
        if (!btn) return;

        const currentlyLoggedIn = btn.textContent.includes('Logout');
        const shouldBeLoggedIn = !!user;

        if (currentlyLoggedIn === shouldBeLoggedIn) return;

        if (shouldBeLoggedIn) {
            btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        } else {
            btn.innerHTML = '<i class="fas fa-user"></i> Login';
        }

        btn.onclick = this.handleAuthButtonClick;
        this.updateDropdownMenu();
    }

    handleAuthButtonClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isLoggedIn = window.authManager?.isAuthenticated?.();

        if (isLoggedIn) {
            if (window.authManager) await window.authManager.logout();
        } else {
            const redirect = encodeURIComponent(window.location.pathname);
            window.location.href = `/signin?redirect=${redirect}`;
        }
    }

    updateDropdownMenu() {
        const dropdownContainer = document.querySelector('#global-navbar .nav-dropdown');
        if (!dropdownContainer) return;

        const temp = document.createElement('div');
        temp.innerHTML = this.getDropdownMenu();
        dropdownContainer.innerHTML = temp.innerHTML;

        // Re-cache and re-attach
        this.dropdownToggle = document.getElementById('navbar-more-menu');
        this.dropdownMenu = document.getElementById('navbar-more-dropdown');
        this.dropdownClickHandler = null;
        this.setupDropdownListeners();
    }

    updateNotificationCount(count) {
        const badge = document.getElementById('navbar-notification-badge');
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    setActivePage(path) {
        this.options.activePagePath = path;
        const navbar = document.getElementById('global-navbar');
        if (!navbar) return;
        navbar.innerHTML = this.getNavbarHTML();
        this.setupEventListeners();
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!window.globalNavbar) {
        window.globalNavbar = new GlobalNavbar();
    }
});

if (document.readyState !== 'loading' && !window.globalNavbar) {
    window.globalNavbar = new GlobalNavbar();
}

window.GlobalNavbar = GlobalNavbar;

console.log('Global Navbar script loaded');
