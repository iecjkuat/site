// JKUAT Innovation Club - Ideas Page Navigation Component

class IdeasNavigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧭 IdeasNavigation init() called');
        this.renderNavigation();
        this.bindEvents();
        console.log('✅ IdeasNavigation init() completed');
    }

    renderNavigation() {
        console.log('🧭 Rendering navigation...');
        const navigationPlaceholder = document.getElementById('navigation-placeholder');
        
        if (!navigationPlaceholder) {
            console.error('❌ navigation-placeholder element not found!');
            return;
        }
        
        console.log('✅ Found navigation-placeholder, rendering HTML...');

        navigationPlaceholder.innerHTML = `
            <nav class="glass-nav">
                <div class="container">
                    <!-- Club Header -->
                    <div class="nav-club-header">
                        <h1 class="nav-club-title">JKUAT Innovation and Entrepreneurship Club</h1>
                    </div>
                    
                    <!-- Navigation Links -->
                    <div class="nav-links-container">
                        <!-- Center Navigation -->
                        <div class="nav-center">
                            <a href="/" class="glass-button">
                                <i class="fas fa-home"></i>Home
                            </a>
                            <a href="/dashboard" class="glass-button">
                                <i class="fas fa-tachometer-alt"></i>Dashboard
                            </a>
                            <a href="/events" class="glass-button">
                                <i class="fas fa-calendar"></i>Events
                            </a>
                            <a href="/leadership" class="glass-button">
                                <i class="fas fa-users"></i>Leadership
                            </a>
                            <a href="/resources" class="glass-button">
                                <i class="fas fa-book"></i>Resources
                            </a>
                            <a href="/projects" class="glass-button">
                                <i class="fas fa-lightbulb"></i>Projects
                            </a>
                            
                            <!-- More Dropdown -->
                            <div class="nav-dropdown">
                                <button class="glass-button dropdown-toggle" id="moreDropdown">
                                    <i class="fas fa-ellipsis-h"></i>More
                                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                                </button>
                                <div class="dropdown-menu" id="moreDropdownMenu">
                                    <a href="/financial" class="dropdown-item">
                                        <i class="fas fa-chart-line"></i>Financial
                                    </a>
                                    <a href="/payment" class="dropdown-item">
                                        <i class="fas fa-credit-card"></i>Payments & Billing
                                    </a>
                                    <a href="/opportunities" class="dropdown-item">
                                        <i class="fas fa-briefcase"></i>Opportunities
                                    </a>
                                    <a href="/ideas" class="dropdown-item" style="background: rgba(139, 92, 246, 0.2) !important; color: #8b5cf6 !important;">
                                        <i class="fas fa-brain"></i>Ideas Hub
                                    </a>
                                    <a href="/cms" class="dropdown-item">
                                        <i class="fas fa-newspaper"></i>News & Articles
                                    </a>
                                    <a href="/support" class="dropdown-item">
                                        <i class="fas fa-headset"></i>Support
                                    </a>
                                    <a href="/settings" class="dropdown-item">
                                        <i class="fas fa-cog"></i>Settings
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Side - Authentication -->
                        <div class="nav-auth">
                            <div class="notification-bell" id="notificationBell">
                                <i class="fas fa-bell"></i>
                                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                            </div>
                            <button class="glass-button" id="navLoginBtn">
                                <i class="fas fa-user"></i>Login
                            </button>
                            <button class="glass-button" id="navJoinBtn">
                                <i class="fas fa-user-plus"></i>Join
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        `;
        
        console.log('✅ Navigation HTML rendered successfully');
        
        // Initialize dropdown functionality
        this.initializeDropdown();
    }

    bindEvents() {
        // Add hover effects to navigation links
        this.addHoverEffects('.glass-button');
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Setup auth buttons
        this.setupAuthButtons();
    }

    setupAuthButtons() {
        const loginBtn = document.getElementById('navLoginBtn');
        const joinBtn = document.getElementById('navJoinBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                // Redirect to home page with login modal
                window.location.href = '/#login';
            });
        }

        if (joinBtn) {
            joinBtn.addEventListener('click', () => {
                // Redirect to home page with registration modal
                window.location.href = '/#register';
            });
        }
    }

    initializeDropdown() {
        const dropdownToggle = document.getElementById('moreDropdown');
        const dropdownMenu = document.getElementById('moreDropdownMenu');
        
        if (dropdownToggle && dropdownMenu) {
            // Toggle dropdown on click
            dropdownToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = dropdownMenu.classList.contains('show');
                
                // Close all other dropdowns first
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                
                // Toggle current dropdown
                if (!isOpen) {
                    dropdownMenu.classList.add('show');
                    dropdownToggle.classList.add('active');
                } else {
                    dropdownMenu.classList.remove('show');
                    dropdownToggle.classList.remove('active');
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                    dropdownToggle.classList.remove('active');
                }
            });
            
            // Close dropdown on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdownMenu.classList.remove('show');
                    dropdownToggle.classList.remove('active');
                }
            });
            
            // Handle dropdown item clicks
            dropdownMenu.addEventListener('click', (e) => {
                const item = e.target.closest('.dropdown-item');
                if (item) {
                    // Close dropdown after selection
                    dropdownMenu.classList.remove('show');
                    dropdownToggle.classList.remove('active');
                }
            });
        }
    }

    addHoverEffects(selector) {
        document.querySelectorAll(selector).forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
            });
        });
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧭 Ideas Navigation DOM loaded');
    
    // Try immediate initialization
    const navigationPlaceholder = document.getElementById('navigation-placeholder');
    if (navigationPlaceholder) {
        console.log('✅ Found navigation placeholder immediately');
        window.ideasNavigation = new IdeasNavigation();
    } else {
        console.log('⚠️ Navigation placeholder not found immediately, trying with delay...');
        
        // Try with delay
        setTimeout(() => {
            const placeholder = document.getElementById('navigation-placeholder');
            if (placeholder) {
                console.log('✅ Found navigation placeholder after delay');
                window.ideasNavigation = new IdeasNavigation();
            } else {
                console.error('❌ Navigation placeholder never found!');
                // Force create navigation at top of body as fallback
                const nav = document.createElement('div');
                nav.id = 'navigation-placeholder';
                document.body.insertBefore(nav, document.body.firstChild);
                window.ideasNavigation = new IdeasNavigation();
            }
        }, 100);
    }
});

// Make available globally
window.IdeasNavigation = IdeasNavigation;