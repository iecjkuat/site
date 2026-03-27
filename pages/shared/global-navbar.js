/**
 * JKUAT Innovation Club – Global Navbar System
 * -------------------------------------------------
 * Refactored 2024‑06‑26
 *   • Private fields (`#`) for encapsulation
 *   • Robust initialization guard (`static canInitialize()`)
 *   • ARIA attributes & keyboard handling (Esc, focus‑trap optional)
 *   • Unified, debounced body‑padding logic
 *   • Dropdown arrow rotation via CSS class (`.rotated`)
 *   • Auth button click listener re‑attached after every markup change
 *   • `destroy()` method for SPA / PJAX environments
 *   • Debug logging – toggle with `window.DEBUG_GLOBAL_NAVBAR = true`
 *
 * NOTE: Add the following rule to your navbar CSS (or the global‑navbar.css file):
 *
 *   #global-navbar .dropdown-arrow { transition: transform 0.25s ease; }
 *   #global-navbar .dropdown-arrow.rotated { transform: rotate(180deg); }
 *
 * ----------------------------------------------------------------- */
(() => {
    /* --------------------------  Debug helper  -------------------------- */
    const debug = (...args) => {
        if (window.DEBUG_GLOBAL_NAVBAR) console.log('[GlobalNavbar]', ...args);
    };

    /* --------------------------  Class definition  -------------------------- */
    class GlobalNavbar {
        /* ----------------------  Private fields  ---------------------- */
        #options;
        #isInitialized = false;

        #hamburgerBtn = null;
        #navLinksContainer = null;
        #dropdownToggle = null;
        #dropdownMenu = null;

        #documentClickHandler = null;
        #hamburgerClickHandler = null;
        #dropdownClickHandler = null;
        #resizeHandler = null;
        #keyDownHandler = null;

        /* -------------------  Static guard (early exit)  ------------------- */
        static canInitialize() {
            if (window.preventGlobalNavbar) {
                debug('preventGlobalNavbar flag set – aborting creation');
                return false;
            }
            if (document.getElementById('global-navbar')) {
                debug('Navbar already present in DOM');
                return false;
            }
            if (document.querySelector('nav.glass-nav:not(#global-navbar)')) {
                debug('Static .glass-nav detected – using static navbar');
                return false;
            }
            return true;
        }

        /* -------------------  Constructor  ------------------- */
        constructor(options = {}) {
            if (!GlobalNavbar.canInitialize()) {
                /* Return a minimal stub – calling `init()` on it does nothing */
                return { init: () => {} };
            }

            this.#options = {
                activePagePath: window.location.pathname,
                showNotifications: true,
                ...options,
            };

            /* Private debounced body‑padding handler (used in createNavbar & resize) */
            this.#adjustBodyPadding = this.debounced(() => {
                const isMobile = window.innerWidth <= 768;
                document.body.style.paddingTop = isMobile ? '65px' : '110px';
            }, 150);

            this.init(); // start the set‑up process
        }

        /* -------------------  Public init (idempotent)  ------------------- */
        init() {
            if (this.#isInitialized) return;
            this.#isInitialized = true;

            debug('Initializing Global Navbar...');
            this.createNavbar();
            this.cacheDomElements();
            this.setupEventListeners();
            this.setupAuthIntegration();

            // Expose a global reference for debugging / manual calls
            window.globalNavbar = this;

            document.dispatchEvent(new CustomEvent('globalNavbarReady'));
            debug('Global Navbar initialized');
        }

        /* -------------------  Create & inject markup  ------------------- */
        createNavbar() {
            // Defensive double‑check (should never fire because of the guard)
            if (document.getElementById('global-navbar')) return;

            const nav = document.createElement('nav');
            nav.id = 'global-navbar';
            nav.className = 'glass-nav';
            nav.innerHTML = this.getNavbarHTML();

            /* Insert at the very top of <body> */
            document.body.insertBefore(nav, document.body.firstChild);

            /* Initial body‑padding (desktop vs. mobile) */
            this.#adjustBodyPadding();

            /* Listen to window resize – debounced to avoid layout‑thrashing */
            this.#resizeHandler = this.#adjustBodyPadding;
            window.addEventListener('resize', this.#resizeHandler);

            debug('Navbar element created and inserted');
        }

        /* -------------------  HTML generation (template literals)  ------------------- */
        getNavbarHTML() {
            // The markup already contains ARIA attributes for accessibility.
            return `
                <div class="global-navbar-container">
                    <div class="global-navbar-inner">
                        <!-- Club Header -->
                        <div class="nav-club-header">
                            <div class="nav-club-title">JKUAT Innovation &amp; Entrepreneurship Club</div>
                        </div>

                        <!-- Hamburger (mobile) -->
                        <button class="hamburger-menu"
                                id="hamburger-btn"
                                aria-label="Toggle navigation menu"
                                aria-expanded="false"
                                aria-controls="nav-links-container">
                            <span class="hamburger-line"></span>
                            <span class="hamburger-line"></span>
                            <span class="hamburger-line"></span>
                        </button>

                        <!-- Navigation links (drawer on mobile) -->
                        <div class="nav-links-container"
                             id="nav-links-container"
                             aria-hidden="true">
                            <div class="nav-center">
                                ${this.getNavLink('/', '🏠 Home')}
                                ${this.getNavLink('/dashboard', '📊 Dashboard')}
                                ${this.getNavLink('/events', '📅 Events')}
                                ${this.getNavLink('/projects', '🚀 Projects')}
                                ${this.getNavLink('/ideas', '💡 Ideas')}
                                ${this.getNavLink('/news', '📰 News')}

                                <!-- Desktop dropdown -->
                                <div class="nav-dropdown desktop-only">
                                    ${this.getDropdownMenu()}
                                </div>

                                <!-- Mobile‑only links (inside the drawer) -->
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

                            <!-- Auth / notification section -->
                            <div class="nav-auth">
                                ${this.getNotificationButton()}
                                <button id="navbar-login-btn"
                                        class="glass-button"
                                        aria-label="Login">
                                    <i class="fas fa-user"></i> Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        getDropdownMenu() {
            // Arrow rotation will be handled by a CSS class (`rotated`).
            return `
                <button class="glass-button dropdown-toggle"
                        id="navbar-more-menu"
                        aria-haspopup="true"
                        aria-expanded="false"
                        aria-controls="navbar-more-dropdown">
                    <i class="fas fa-ellipsis-h"></i> More
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </button>

                <div class="dropdown-menu"
                     id="navbar-more-dropdown"
                     aria-hidden="true">
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
            const activeClass = this.isActivePage(href) ? ' active' : '';
            const cls = isDropdownItem
                ? `dropdown-item${activeClass}`
                : `glass-button${activeClass}`;
            return `<a href="${href}" class="${cls}">${text}</a>`;
        }

        getNotificationButton() {
            return `
                <button id="navbar-notification-btn"
                        class="notification-bell"
                        aria-label="Notifications">
                    <i class="fas fa-bell"></i>
                    <span id="navbar-notification-badge"
                          class="notification-badge"
                          style="display:none;">0</span>
                </button>
            `;
        }

        /* -------------------  Active‑page detection  ------------------- */
        isActivePage(href) {
            const current = new URL(location.href).pathname.replace(/\/+$/, '');
            const target = href.replace(/\/+$/, '');

            if (target === '/' && (current === '/' || current === '/home' || current === '/index.html')) {
                return true;
            }
            // Ensure a true segment match (prevents `/dashboard-admin` from matching `/dashboard`)
            return current === target || current.startsWith(`${target}/`);
        }

        /* -------------------  Cache frequently‑accessed DOM nodes  ------------------- */
        cacheDomElements() {
            this.#hamburgerBtn       = document.getElementById('hamburger-btn');
            this.#navLinksContainer  = document.getElementById('nav-links-container');
            this.#dropdownToggle     = document.getElementById('navbar-more-menu');
            this.#dropdownMenu       = document.getElementById('navbar-more-dropdown');
        }

        /* -------------------  Set up all listeners  ------------------- */
        setupEventListeners() {
            /* ---- Hamburger (mobile drawer) ---- */
            this.#hamburgerClickHandler = (e) => {
                e.stopPropagation();
                const isOpen = this.#hamburgerBtn.classList.toggle('active');
                this.#navLinksContainer.classList.toggle('active', isOpen);
                this.#hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
                this.#navLinksContainer.setAttribute('aria-hidden', String(!isOpen));
            };
            this.#hamburgerBtn.addEventListener('click', this.#hamburgerClickHandler);

            /* ---- Dropdown (desktop “More”) ---- */
            this.setupDropdownListeners(); // registers click handler for the toggle

            /* ---- Global click – close both drawer & dropdown if click occurs outside ---- */
            this.#documentClickHandler = this.handleDocumentClick.bind(this);
            document.addEventListener('click', this.#documentClickHandler);

            /* ---- Escape key closes open menus ---- */
            this.#keyDownHandler = this.handleKeyDown.bind(this);
            document.addEventListener('keydown', this.#keyDownHandler);
        }

        /* -------------------  Dropdown listeners (single source of truth) ------------------- */
        setupDropdownListeners() {
            if (!this.#dropdownToggle || !this.#dropdownMenu) return;

            // Remove any previously‑attached handler (defensive)
            if (this.#dropdownClickHandler) {
                this.#dropdownToggle.removeEventListener('click', this.#dropdownClickHandler);
            }

            this.#dropdownClickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = this.#dropdownMenu.classList.toggle('show');
                this.#dropdownToggle.setAttribute('aria-expanded', String(isOpen));
                this.#dropdownMenu.setAttribute('aria-hidden', String(!isOpen));

                const arrow = this.#dropdownToggle.querySelector('.dropdown-arrow');
                if (arrow) arrow.classList.toggle('rotated', isOpen);
            };
            this.#dropdownToggle.addEventListener('click', this.#dropdownClickHandler);
        }

        /* -------------------  Global click (outside‑click) ------------------- */
        handleDocumentClick(e) {
            const target = e.target;

            /* ---- close dropdown if click is outside it ---- */
            if (this.#dropdownToggle && this.#dropdownMenu) {
                if (!this.#dropdownToggle.contains(target) && !this.#dropdownMenu.contains(target)) {
                    this.closeDropdown();
                }
            }

            /* ---- close hamburger drawer if click is outside it ---- */
            if (this.#hamburgerBtn && this.#navLinksContainer) {
                if (!this.#hamburgerBtn.contains(target) && !this.#navLinksContainer.contains(target)) {
                    if (this.#hamburgerBtn.classList.contains('active')) {
                        this.#hamburgerBtn.classList.remove('active');
                        this.#navLinksContainer.classList.remove('active');
                        this.#hamburgerBtn.setAttribute('aria-expanded', 'false');
                        this.#navLinksContainer.setAttribute('aria-hidden', 'true');
                    }
                }
            }
        }

        /* -------------------  Escape key handling ------------------- */
        handleKeyDown(e) {
            if (e.key !== 'Escape') return;

            // close drawer
            if (this.#hamburgerBtn?.classList.contains('active')) {
                this.#hamburgerBtn.classList.remove('active');
                this.#navLinksContainer?.classList.remove('active');
                this.#hamburgerBtn.setAttribute('aria-expanded', 'false');
                this.#navLinksContainer?.setAttribute('aria-hidden', 'true');
            }

            // close dropdown
            if (this.#dropdownMenu?.classList.contains('show')) {
                this.closeDropdown();
            }
        }

        /* -------------------  Open / close dropdown helpers ------------------- */
        openDropdown() {
            if (!this.#dropdownMenu) return;
            this.#dropdownMenu.classList.add('show');
            this.#dropdownToggle.setAttribute('aria-expanded', 'true');
            this.#dropdownMenu.setAttribute('aria-hidden', 'false');

            const arrow = this.#dropdownToggle.querySelector('.dropdown-arrow');
            if (arrow) arrow.classList.add('rotated');
        }

        closeDropdown() {
            if (!this.#dropdownMenu) return;
            this.#dropdownMenu.classList.remove('show');
            this.#dropdownToggle.setAttribute('aria-expanded', 'false');
            this.#dropdownMenu.setAttribute('aria-hidden', 'true');

            const arrow = this.#dropdownToggle.querySelector('.dropdown-arrow');
            if (arrow) arrow.classList.remove('rotated');
        }

        /* -------------------  Auth integration ------------------- */
        setupAuthIntegration() {
            debug('Setting up auth listeners');

            document.addEventListener('userLoggedIn', (ev) => this.updateAuthButton(ev.detail));
            document.addEventListener('userLoggedOut', () => this.updateAuthButton(null));
            document.addEventListener('authReady', () => {
                if (window.authManager?.isAuthenticated?.()) {
                    this.updateAuthButton(window.authManager.getUser());
                }
            });

            // In case `authReady` already fired before we attached the listener:
            setTimeout(() => {
                if (window.authManager?.isAuthenticated?.()) {
                    this.updateAuthButton(window.authManager.getUser());
                }
            }, 100);
        }

        /**
         * Update the Login/Logout button according to the current auth state.
         * The click handler (`handleAuthButtonClick`) is (re)attached after
         * each markup change so it always works.
         */
        updateAuthButton(user) {
            const btn = document.getElementById('navbar-login-btn');
            if (!btn) {
                debug('Login button not found – cannot update auth UI');
                return;
            }

            const shouldBeLoggedIn = !!user;
            const currentlyLoggedIn = btn.textContent.includes('Logout');

            if (shouldBeLoggedIn === currentlyLoggedIn) {
                debug('Auth button already in correct state – no update needed');
                return;
            }

            // -----------------------------------------------------------------
            // 1️⃣ Update the button's innerHTML (Login ↔ Logout)
            // -----------------------------------------------------------------
            if (shouldBeLoggedIn) {
                btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                btn.setAttribute('aria-label', 'Logout');
            } else {
                btn.innerHTML = '<i class="fas fa-user"></i> Login';
                btn.setAttribute('aria-label', 'Login');
            }

            // -----------------------------------------------------------------
            // 2️⃣ (Re)attach the click handler – this was the missing piece
            // -----------------------------------------------------------------
            btn.removeEventListener('click', this.handleAuthButtonClick);
            btn.addEventListener('click', this.handleAuthButtonClick);

            debug('✅ Auth button updated and click handler (re)attached');
        }

        /**
         * Click handler for the login/logout button.
         * - If the user is already logged in → logout via `authManager`.
         * - If not logged in → redirect to the sign‑in page (preserving a return URL).
         */
        handleAuthButtonClick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isLoggedIn = window.authManager?.isAuthenticated?.();

            if (isLoggedIn) {
                debug('Logout requested');
                if (window.authManager) await window.authManager.logout();
            } else {
                debug('Login redirect requested');
                const redirect = encodeURIComponent(window.location.pathname);
                window.location.href = `/signin?redirect=${redirect}`;
            }
        };

        /* -------------------  Notification badge ------------------- */
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

        /* -------------------  Programmatic active‑page change ------------------- */
        setActivePage(path) {
            this.#options.activePagePath = path;
            const navbar = document.getElementById('global-navbar');
            if (!navbar) return;

            navbar.innerHTML = this.getNavbarHTML();
            this.cacheDomElements();
            this.setupEventListeners(); // re‑attach listeners to the new markup
        }

        /* -------------------  Utility: debounce ------------------- */
        debounced(fn, delay) {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), delay);
            };
        }

        /* -------------------  Debug helper – dropdown state ------------------- */
        debugDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            if (!menu) {
                console.log('❌ No dropdown found');
                return;
            }

            console.table({
                classes:     menu.className,
                display:     getComputedStyle(menu).display,
                visibility:  getComputedStyle(menu).visibility,
                opacity:     getComputedStyle(menu).opacity,
                maxHeight:   getComputedStyle(menu).maxHeight,
                overflow:    getComputedStyle(menu).overflow,
            });

            const sections = menu.querySelectorAll('.dropdown-section');
            console.log(`🔧 ${sections.length} section(s) found`);
            sections.forEach((s, i) => {
                const title = s.querySelector('.dropdown-section-title')?.textContent?.trim() || '—';
                const items = s.querySelectorAll('.dropdown-item').length;
                console.log(`  ${i + 1}. ${title} – ${items} item(s)`);
            });

            console.log('👤 Current user (if any):', window.authManager?.getUser?.());
        }

        /* -------------------  Clean‑up for SPA / PJAX environments ------------------- */
        destroy() {
            // Remove all listeners we added
            if (this.#hamburgerBtn && this.#hamburgerClickHandler) {
                this.#hamburgerBtn.removeEventListener('click', this.#hamburgerClickHandler);
            }
            if (this.#dropdownToggle && this.#dropdownClickHandler) {
                this.#dropdownToggle.removeEventListener('click', this.#dropdownClickHandler);
            }
            if (this.#documentClickHandler) {
                document.removeEventListener('click', this.#documentClickHandler);
            }
            if (this.#keyDownHandler) {
                document.removeEventListener('keydown', this.#keyDownHandler);
            }
            if (this.#resizeHandler) {
                window.removeEventListener('resize', this.#resizeHandler);
            }

            // Remove the navbar element itself
            const el = document.getElementById('global-navbar');
            if (el) el.remove();

            // Clean global references
            if (window.globalNavbar === this) delete window.globalNavbar;

            this.#isInitialized = false;
            debug('Global Navbar destroyed');
        }
    }

    /* -------------------------------------------------
       Auto‑initialize the component
       ------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.globalNavbar) {
            window.globalNavbar = new GlobalNavbar();
        }
    });

    // In case the script loads after DOMContentLoaded has already fired
    if (document.readyState !== 'loading' && !window.globalNavbar) {
        window.globalNavbar = new GlobalNavbar();
    }

    // Expose the class for testing / manual instantiation
    window.GlobalNavbar = GlobalNavbar;
})();
