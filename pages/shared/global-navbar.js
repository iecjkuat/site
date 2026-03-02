/**
 * JKUAT Innovation Club - Global Navbar System
 * Shared navigation component for all pages
 */

console.log('🧭 Loading Global Navbar System...');

class GlobalNavbar {
    constructor(options = {}) {
        // Early exit if prevention flag is set
        if (window.preventGlobalNavbar) {
            console.log('🚫 GlobalNavbar constructor blocked by prevention flag');
            return { init: () => {} }; // Return dummy object
        }
        
        // Early exit if global navbar already exists
        if (document.getElementById('global-navbar')) {
            console.log('🚫 GlobalNavbar constructor blocked - already exists');
            return { init: () => {} }; // Return dummy object
        }
        
        this.options = {
            activePagePath: window.location.pathname,
            showNotifications: true,
            ...options
        };
        
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Defensive check: prevent double initialization
        if (document.getElementById('global-navbar')) {
            console.log('🚫 Global navbar already in DOM - skipping init');
            return;
        }
        
        // Check if global navbar should be prevented
        if (window.preventGlobalNavbar) {
            console.log('🚫 Global navbar prevented - static navbar detected');
            return;
        }
        
        // Check if a static navbar already exists (more specific check)
        if (document.querySelector('nav.glass-nav:not(#global-navbar)')) {
            console.log('🚫 Global navbar skipped - static .glass-nav navbar found');
            return;
        }

        console.log('🧭 Initializing Global Navbar...');
        
        // Create navbar immediately
        this.createNavbar();
        
        // Setup functionality
        this.setupEventListeners();
        this.setupAuthIntegration();
        
        // Mark as initialized
        this.isInitialized = true;
        
        // Make globally accessible for debugging
        window.globalNavbar = this;
        
        console.log('✅ Global Navbar initialized successfully');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('globalNavbarReady'));
    }

    createNavbar() {
        // Defensive check: prevent double creation
        if (document.getElementById('global-navbar')) {
            console.log('🚫 createNavbar skipped - global navbar already exists');
            return;
        }
        
        // Create navbar container
        const navContainer = document.createElement('nav');
        navContainer.id = 'global-navbar';
        navContainer.className = 'glass-nav';
        
        navContainer.innerHTML = this.getNavbarHTML();
        
        // Insert at the beginning of body
        document.body.insertBefore(navContainer, document.body.firstChild);
        
        // Add body padding to account for fixed navbar - match home page
        if (!document.body.style.paddingTop) {
            document.body.style.paddingTop = '140px';
        }
        
        console.log('✅ Global navbar created and inserted');
    }

    getNavbarHTML() {
        return `
            <div class="global-navbar-container">
                <div class="global-navbar-inner">
                    <!-- Club Header -->
                    <div class="nav-club-header">
                        <div class="nav-club-title">JKUAT Innovation & Entrepreneurship Club</div>
                    </div>

                    <!-- Hamburger Menu Button (Mobile Only) -->
                    <button class="hamburger-menu" id="hamburger-btn" aria-label="Toggle navigation menu">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>

                    <!-- Navigation Links Container -->
                    <div class="nav-links-container" id="nav-links-container">
                        <!-- Navigation Links -->
                        <div class="nav-center">
                            ${this.getNavLink('/', '🏠 Home')}
                            ${this.getNavLink('/dashboard', '📊 Dashboard')}
                            ${this.getNavLink('/events', '📅 Events')}
                            ${this.getNavLink('/projects', '🚀 Projects')}
                            ${this.getNavLink('/ideas', '💡 Ideas')}
                            ${this.getNavLink('/news', '📰 News')}
                            
                            <!-- Desktop: Dropdown Menu, Mobile: Direct Links -->
                            <div class="nav-dropdown desktop-only">
                                ${this.getDropdownMenu()}
                            </div>
                            
                            <!-- Mobile: All Links Directly -->
                            <div class="mobile-nav-links">
                                ${this.getNavLink('/opportunities', '💼 Opportunities')}
                                ${this.getNavLink('/resources', '📚 Resources')}
                                ${this.getNavLink('/leadership', '👥 Leadership')}
                                ${this.getNavLink('/voting', '🗳️ Voting')}
                                ${this.getNavLink('/payment', '💳 Payments')}
                                ${this.getNavLink('/support', '🆘 Support')}
                                ${this.getNavLink('/feedback', '💬 Feedback')}
                                ${this.getNavLink('/settings', '⚙️ Settings')}
                                ${this.getNavLink('/cms', '📝 Content Hub')}
                                ${this.getNavLink('/admin', '🔧 Admin Dashboard')}
                            </div>
                        </div>

                        <!-- Auth Section -->
                        <div class="nav-auth">
                            <!-- Login Button (always visible) -->
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
            <div class="nav-dropdown">
                <button class="glass-button dropdown-toggle" id="navbar-more-menu">
                    <i class="fas fa-ellipsis-h"></i> More
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </button>
                <div class="dropdown-menu" id="navbar-more-dropdown">
                    <!-- Community Section -->
                    <div class="dropdown-section">
                        <div class="dropdown-section-title">Community</div>
                        ${this.getNavLink('/opportunities', '💼 Opportunities', true)}
                        ${this.getNavLink('/resources', '📚 Resources', true)}
                        ${this.getNavLink('/leadership', '👥 Leadership', true)}
                        ${this.getNavLink('/voting', '🗳️ Voting', true)}
                    </div>
                    
                    <!-- Services Section -->
                    <div class="dropdown-section">
                        <div class="dropdown-section-title">Services</div>
                        ${this.getNavLink('/payment', '💳 Payments', true)}
                        ${this.getNavLink('/support', '🆘 Support', true)}
                        ${this.getNavLink('/feedback', '💬 Feedback', true)}
                        ${this.getNavLink('/settings', '⚙️ Settings', true)}
                    </div>
                    
                    <!-- Management Section -->
                    <div class="dropdown-section">
                        <div class="dropdown-section-title">Management</div>
                        ${this.getNavLink('/cms', '📝 Content Hub', true)}
                        ${this.getNavLink('/admin', '🔧 Admin Dashboard', true)}
                    </div>
                </div>
            </div>
        `;
    }

    getNavLink(href, text, isDropdownItem = false) {
        const isActive = this.isActivePage(href);
        const activeClass = isActive ? ' active' : '';

        // Convert relative paths to proper relative paths based on current location
        let actualHref = href;
        if (href.startsWith('/')) {
            // Use clean URLs instead of relative HTML paths
            const pathMap = {
                '/': '/',
                '/dashboard': '/dashboard',
                '/events': '/events',
                '/projects': '/projects',
                '/ideas': '/ideas',
                '/news': '/news',
                '/opportunities': '/opportunities',
                '/resources': '/resources',
                '/leadership': '/leadership',
                '/voting': '/voting',
                '/payment': '/payment',
                '/support': '/support',
                '/feedback': '/feedback',
                '/settings': '/settings',
                '/cms': '/cms',
                '/admin': '/admin'
            };
            actualHref = pathMap[href] || href;
        }

        if (isDropdownItem) {
            return `
                <a href="${actualHref}" class="dropdown-item${activeClass}">
                    ${text}
                </a>
            `;
        }

        return `
            <a href="${actualHref}" class="glass-button${activeClass}">
                ${text}
            </a>
        `;
    }

    getNotificationButton() {
        return `
            <button id="navbar-notification-btn" class="notification-bell">
                <i class="fas fa-bell"></i>
                <span id="navbar-notification-badge" class="notification-badge" style="display: none;">0</span>
            </button>
        `;
    }

    isActivePage(href) {
        const currentPath = this.options.activePagePath;
        
        // Handle home page
        if (href === '/') {
            return currentPath === '/' || currentPath.includes('/home/') || currentPath.includes('index.html');
        }
        
        // For other pages, check if current path contains the page name
        const pageName = href.substring(1); // Remove leading slash
        return currentPath.includes(`/${pageName}/`) || currentPath.includes(`${pageName}.html`);
    }

    handleAuthButtonClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isLoggedIn = window.authManager?.isAuthenticated?.();
        
        if (isLoggedIn) {
            console.log('🔐 Logout clicked');
            if (window.authManager) {
                await window.authManager.logout();
            }
        } else {
            console.log('🔐 Login clicked - redirecting to signin page');
            // Store current page for redirect after login
            const currentPage = window.location.pathname;
            window.location.href = `/signin?redirect=${encodeURIComponent(currentPage)}`;
        }
    }

    setupEventListeners() {
        // Use setTimeout to ensure DOM elements are fully rendered
        setTimeout(() => {
            // Setup hamburger menu
            this.setupHamburgerMenu();
            
            // Setup dropdown listeners
            this.setupDropdownListeners();
            
            // Close dropdown when clicking outside (but not on logout button)
            document.addEventListener('click', (e) => {
                const dropdownToggle = document.getElementById('navbar-more-menu');
                const dropdownMenu = document.getElementById('navbar-more-dropdown');
                const isLogoutButton = e.target.closest('#navbar-login-btn');
                
                if (!isLogoutButton && dropdownToggle && dropdownMenu && 
                    !dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    this.closeDropdown();
                }
            });

            // Auth buttons - single click handler that handles both login and logout
            const loginBtn = document.getElementById('navbar-login-btn');
            const notificationBtn = document.getElementById('navbar-notification-btn');

            if (loginBtn) {
                // Use single onclick handler instead of addEventListener
                loginBtn.onclick = this.handleAuthButtonClick;
            }

            if (notificationBtn) {
                notificationBtn.addEventListener('click', () => {
                    alert('Notifications feature coming soon!');
                });
            }
        }, 100); // Small delay to ensure DOM is ready
    }

    setupHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navLinksContainer = document.getElementById('nav-links-container');
        
        if (hamburgerBtn && navLinksContainer) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                hamburgerBtn.classList.toggle('active');
                navLinksContainer.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navLinksContainer.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                    hamburgerBtn.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                }
            });
            
            // Close menu when clicking on a link
            const navLinks = navLinksContainer.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburgerBtn.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                });
            });
        }
    }

    openDropdown() {
        console.log('🔽 Opening dropdown...');
        const dropdownMenu = document.getElementById('navbar-more-dropdown');
        const dropdownArrow = document.querySelector('#global-navbar .dropdown-arrow');
        
        if (dropdownMenu) {
            dropdownMenu.classList.add('show');
            console.log('✅ Added show class to dropdown');
            console.log('📋 Dropdown classes:', dropdownMenu.className);
            console.log('📋 Dropdown computed style:', {
                display: window.getComputedStyle(dropdownMenu).display,
                opacity: window.getComputedStyle(dropdownMenu).opacity,
                visibility: window.getComputedStyle(dropdownMenu).visibility
            });
        } else {
            console.error('❌ Dropdown menu not found for opening');
        }
        
        if (dropdownArrow) {
            dropdownArrow.style.transform = 'rotate(180deg)';
            console.log('✅ Rotated dropdown arrow');
        } else {
            console.log('⚠️ Dropdown arrow not found');
        }
        
        const toggle = document.getElementById('navbar-more-menu');
        if (toggle) {
            toggle.classList.add('active');
            console.log('✅ Added active class to toggle');
        } else {
            console.log('⚠️ Dropdown toggle not found');
        }
    }

    closeDropdown() {
        console.log('🔼 Closing dropdown...');
        const dropdownMenu = document.getElementById('navbar-more-dropdown');
        const dropdownArrow = document.querySelector('#global-navbar .dropdown-arrow');
        
        if (dropdownMenu) {
            dropdownMenu.classList.remove('show');
            console.log('✅ Removed show class from dropdown');
            console.log('📋 Dropdown classes:', dropdownMenu.className);
        } else {
            console.error('❌ Dropdown menu not found for closing');
        }
        
        if (dropdownArrow) {
            dropdownArrow.style.transform = 'rotate(0deg)';
            console.log('✅ Reset dropdown arrow rotation');
        } else {
            console.log('⚠️ Dropdown arrow not found');
        }
        
        const toggle = document.getElementById('navbar-more-menu');
        if (toggle) {
            toggle.classList.remove('active');
            console.log('✅ Removed active class from toggle');
        } else {
            console.log('⚠️ Dropdown toggle not found');
        }
    }

    setupAuthIntegration() {
        console.log('🔐 Setting up auth integration...');
        
        // Listen for auth state changes
        document.addEventListener('userLoggedIn', (event) => {
            console.log('🔐 User logged in event received:', event.detail);
            this.updateAuthButton(event.detail);
        });
        
        document.addEventListener('userLoggedOut', () => {
            console.log('🔐 User logged out event received');
            this.updateAuthButton(null);
        });
        
        // Check initial auth state when auth system is ready
        document.addEventListener('authReady', () => {
            console.log('🔐 Auth system ready, checking initial state');
            if (window.authManager && window.authManager.isAuthenticated()) {
                const user = window.authManager.getUser();
                console.log('🔐 User already authenticated:', user);
                this.updateAuthButton(user);
            }
        });
        
        // Also check immediately if auth system is already ready
        setTimeout(() => {
            if (window.authManager && window.authManager.isAuthenticated()) {
                const user = window.authManager.getUser();
                console.log('🔐 Auth system already ready, user:', user);
                this.updateAuthButton(user);
            }
        }, 100);
    }

    showAuthModal(type) {
        console.log('🔐 showAuthModal called with type:', type);
        console.log('🔐 Current authModal state:', !!window.authModal);
        
        // Prevent rapid successive calls
        if (this.authModalCooldown) {
            console.log('⚠️ Auth modal on cooldown, ignoring call');
            return;
        }
        
        // Prevent modal from showing immediately after logout
        if (this.justLoggedOut) {
            console.log('🚫 Preventing modal show immediately after logout');
            return;
        }
        
        this.authModalCooldown = true;
        setTimeout(() => {
            this.authModalCooldown = false;
        }, 1000);
        
        // Wait for auth system to be ready
        if (!window.authModal) {
            console.log('⏳ Auth modal not ready, waiting...');
            
            // Wait up to 3 seconds for auth system to load
            let attempts = 0;
            const maxAttempts = 30; // 3 seconds with 100ms intervals
            
            const waitForAuth = () => {
                attempts++;
                if (window.authModal) {
                    console.log('✅ Auth modal ready after', attempts * 100, 'ms');
                    if (type === 'login') {
                        window.authModal.show('login');
                    } else if (type === 'register') {
                        window.authModal.show('register');
                    }
                } else if (attempts < maxAttempts) {
                    setTimeout(waitForAuth, 100);
                } else {
                    console.error('❌ Auth modal failed to load after 3 seconds');
                    alert('Authentication system is still loading. Please refresh the page and try again.');
                }
            };
            
            waitForAuth();
            return;
        }
        
        if (type === 'login') {
            console.log('✅ Using window.authModal.show(login)');
            window.authModal.show('login');
        } else if (type === 'register') {
            console.log('✅ Using window.authModal.show(register)');
            window.authModal.show('register');
        } else {
            console.error('❌ Unknown auth modal type:', type);
        }
    }

    updateAuthButton(user) {
        const loginBtn = document.getElementById('navbar-login-btn');
        if (!loginBtn) {
            console.log('⚠️ Login button not found in navbar');
            return;
        }
        
        // Check if button is already in the correct state
        const currentText = loginBtn.textContent.trim();
        const isCurrentlyLoggedIn = currentText.includes('Logout');
        const shouldBeLoggedIn = !!user;
        
        if (isCurrentlyLoggedIn === shouldBeLoggedIn) {
            console.log('🔐 Navbar button already in correct state, skipping update');
            return;
        }
        
        if (user) {
            // User is logged in - show logout button
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginBtn.title = 'Click to logout';
            console.log('✅ Updated navbar button for logged in user: Logout');
        } else {
            // User is logged out - show login button
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
            loginBtn.title = 'Click to login';
            console.log('✅ Updated navbar button for logged out state');
        }
        
        // Update dropdown menu to show/hide admin options
        this.updateDropdownMenu();
        
        // Note: Click handler is managed by handleAuthButtonClick() - no need to set onclick here
    }

    updateDropdownMenu() {
        console.log('🔄 Updating dropdown menu...');
        
        // Re-create the dropdown menu (now shows all pages to everyone)
        const dropdownContainer = document.querySelector('.nav-dropdown');
        if (dropdownContainer) {
            // Get the new dropdown HTML and extract just the inner content
            const newDropdownHTML = this.getDropdownMenu();
            console.log('📋 New dropdown HTML length:', newDropdownHTML.length);
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newDropdownHTML;
            const newContent = tempDiv.querySelector('.nav-dropdown').innerHTML;
            
            // Replace the content
            dropdownContainer.innerHTML = newContent;
            
            // Debug what was created
            const sections = dropdownContainer.querySelectorAll('.dropdown-section');
            console.log('📋 Dropdown sections created:', sections.length);
            sections.forEach((section, index) => {
                const title = section.querySelector('.dropdown-section-title');
                const items = section.querySelectorAll('.dropdown-item');
                console.log(`   ${index + 1}. ${title?.textContent || 'No title'} (${items.length} items)`);
            });
            
            // Re-setup dropdown event listeners
            setTimeout(() => {
                this.setupDropdownListeners();
            }, 100);
            
            console.log('✅ Dropdown menu updated successfully');
        } else {
            console.warn('⚠️ Dropdown container not found for update');
        }
    }

    // Force refresh method for debugging
    forceRefresh() {
        console.log('🔄 Force refreshing entire navbar...');
        this.updateDropdownMenu();
    }

    // Debug method to inspect dropdown state
    debugDropdown() {
        console.log('🔍 Debugging dropdown state...');
        
        const dropdown = document.querySelector('.dropdown-menu');
        if (dropdown) {
            const sections = dropdown.querySelectorAll('.dropdown-section');
            const items = dropdown.querySelectorAll('.dropdown-item');
            
            console.log('📋 Dropdown found');
            console.log('📋 Sections:', sections.length);
            console.log('📋 Items:', items.length);
            console.log('📋 Classes:', dropdown.className);
            console.log('📋 Computed styles:', {
                display: window.getComputedStyle(dropdown).display,
                visibility: window.getComputedStyle(dropdown).visibility,
                opacity: window.getComputedStyle(dropdown).opacity,
                maxHeight: window.getComputedStyle(dropdown).maxHeight,
                overflow: window.getComputedStyle(dropdown).overflow
            });
            
            sections.forEach((section, index) => {
                const title = section.querySelector('.dropdown-section-title');
                const sectionItems = section.querySelectorAll('.dropdown-item');
                console.log(`Section ${index + 1}: ${title?.textContent || 'No title'} (${sectionItems.length} items)`);
                console.log(`   Display: ${window.getComputedStyle(section).display}`);
                console.log(`   Visibility: ${window.getComputedStyle(section).visibility}`);
                console.log(`   Opacity: ${window.getComputedStyle(section).opacity}`);
            });
        } else {
            console.log('❌ Dropdown not found');
        }
        
        // Also check user state
        const user = window.authManager?.getUser();
        console.log('👤 Current user:', user);
        console.log('🔑 User role:', user?.role);
    }

    setupDropdownListeners() {
        const dropdownToggle = document.getElementById('navbar-more-menu');
        const dropdownMenu = document.getElementById('navbar-more-dropdown');
        
        if (dropdownToggle && dropdownMenu) {
            // Remove any existing listeners first
            dropdownToggle.removeEventListener('click', this.dropdownClickHandler);
            
            // Create bound handler
            this.dropdownClickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Dropdown toggle clicked');
                
                const isOpen = dropdownMenu.classList.contains('show');
                console.log('📋 Dropdown current state:', isOpen ? 'open' : 'closed');
                
                if (isOpen) {
                    this.closeDropdown();
                } else {
                    this.openDropdown();
                }
            };
            
            dropdownToggle.addEventListener('click', this.dropdownClickHandler);
        }
    }

    async handleLogout() {
        if (window.authManager) {
            await window.authManager.logout();
        }
    }

    // Utility methods
    updateNotificationCount(count) {
        const badge = document.getElementById('navbar-notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count.toString();
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    setActivePage(path) {
        // Update active page highlighting
        this.options.activePagePath = path;
        // Re-create navbar to update active states
        const navbar = document.getElementById('global-navbar');
        if (navbar) {
            navbar.innerHTML = this.getNavbarHTML();
            this.setupEventListeners();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧭 DOM loaded, checking for existing global navbar...');
    
    if (!window.globalNavbar) {
        console.log('🧭 Creating new global navbar instance...');
        window.globalNavbar = new GlobalNavbar();
    } else {
        console.log('🧭 Global navbar already exists');
    }
});

// Also try immediate initialization in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    console.log('🧭 Document still loading, waiting for DOMContentLoaded...');
} else {
    console.log('🧭 Document already loaded, initializing navbar immediately...');
    
    if (!window.globalNavbar) {
        window.globalNavbar = new GlobalNavbar();
    }
}

// Make available globally
window.GlobalNavbar = GlobalNavbar;

console.log('🧭 Global Navbar script loaded');