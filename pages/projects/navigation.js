// Projects Page - Navigation Component

class ProjectsNavigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧭 Initializing ProjectsNavigation...');
        this.createNavigation();
        console.log('✅ ProjectsNavigation initialized');
    }

    createNavigation() {
        const navPlaceholder = document.getElementById('navigation-placeholder');
        if (!navPlaceholder) {
            const nav = document.createElement('div');
            nav.id = 'navigation-placeholder';
            document.body.insertBefore(nav, document.body.firstChild);
        }

        const navigation = document.getElementById('navigation-placeholder');
        if (!navigation) return;

        navigation.innerHTML = `
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
                            <a href="/projects" class="glass-button" style="background: rgba(16, 185, 129, 0.2) !important; border-color: rgba(16, 185, 129, 0.3) !important; color: #10b981 !important;">
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
                                    <a href="/ideas" class="dropdown-item">
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
                        
                        <!-- Auth Buttons -->
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

        // Add event listeners for auth buttons and dropdown
        this.setupAuthButtons();
        this.initializeDropdown();
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧭 Projects Navigation DOM loaded');
    setTimeout(() => {
        window.projectsNavigation = new ProjectsNavigation();
    }, 100);
});

// Make available globally
window.ProjectsNavigation = ProjectsNavigation;