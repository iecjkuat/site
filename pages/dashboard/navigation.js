// Dashboard Page - Navigation Component

class DashboardNavigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧭 Initializing DashboardNavigation...');
        this.createNavigation();
        this.bindEvents();
        console.log('✅ DashboardNavigation initialized');
    }

    createNavigation() {
        const navPlaceholder = document.getElementById('navigation-placeholder');
        if (!navPlaceholder) return;

        navPlaceholder.innerHTML = `
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
                            <a href="/dashboard" class="glass-button" style="background: rgba(16, 185, 129, 0.2) !important; border-color: rgba(16, 185, 129, 0.3) !important; color: #10b981 !important;">
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
                        
                        <!-- User Menu -->
                        <div class="nav-auth">
                            <div class="notification-bell" id="notificationBell">
                                <i class="fas fa-bell"></i>
                                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                            </div>
                            <div class="user-menu">
                                <button id="userMenuBtn" class="glass-button">
                                    <i class="fas fa-user"></i>
                                    <span class="user-name">User</span>
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
                                    <button class="dropdown-item logout-btn">
                                        <i class="fas fa-sign-out-alt"></i>Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Initialize dropdown functionality
        this.initializeDropdown();
    }

    bindEvents() {
        // User menu toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }

        // Update user name in navigation when available
        this.updateNavigationUserName();
    }

    updateNavigationUserName() {
        // Wait for user data to be available
        const checkForUser = () => {
            if (window.currentUser) {
                const userNameSpan = document.querySelector('.user-name');
                if (userNameSpan) {
                    const displayName = window.currentUser.name || 
                                      `${window.currentUser.firstName || ''} ${window.currentUser.lastName || ''}`.trim() || 
                                      'User';
                    userNameSpan.textContent = displayName;
                    console.log('✅ Navigation user name updated:', displayName);
                }
            } else {
                // Check again after a short delay
                setTimeout(checkForUser, 500);
            }
        };
        
        // Initial check
        setTimeout(checkForUser, 100);
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
    console.log('🧭 Dashboard Navigation DOM loaded');
    setTimeout(() => {
        window.dashboardNavigation = new DashboardNavigation();
    }, 100);
});

// Make available globally
window.DashboardNavigation = DashboardNavigation;