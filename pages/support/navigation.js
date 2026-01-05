// JKUAT Innovation Club - Support Page Navigation Component

class SupportNavigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧭 SupportNavigation init() called');
        this.renderNavigation();
        this.bindEvents();
        console.log('✅ SupportNavigation init() completed');
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
                        <!-- Left Side - Main Navigation -->
                        <div class="nav-center">
                            <a href="/" class="glass-button">
                                <i class="fas fa-home"></i>Home
                            </a>
                            <a href="/events" class="glass-button">
                                <i class="fas fa-calendar"></i>Events
                            </a>
                            <a href="/projects" class="glass-button">
                                <i class="fas fa-lightbulb"></i>Projects
                            </a>
                            <a href="/opportunities" class="glass-button">
                                <i class="fas fa-briefcase"></i>Opportunities
                            </a>
                            <a href="/ideas" class="glass-button">
                                <i class="fas fa-brain"></i>Ideas
                            </a>
                            
                            <!-- More Dropdown -->
                            <div class="nav-dropdown">
                                <button class="glass-button dropdown-toggle" id="moreDropdownBtn">
                                    <i class="fas fa-ellipsis-h"></i>More
                                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                                </button>
                                <div class="dropdown-menu" id="moreDropdown">
                                    <a href="/resources" class="dropdown-item">
                                        <i class="fas fa-book"></i>Resources
                                    </a>
                                    <a href="/financial" class="dropdown-item">
                                        <i class="fas fa-chart-line"></i>Financial
                                    </a>
                                    <a href="/payment" class="dropdown-item">
                                        <i class="fas fa-credit-card"></i>Payments & Billing
                                    </a>
                                    <a href="/cms" class="dropdown-item">
                                        <i class="fas fa-newspaper"></i>News & Articles
                                    </a>
                                    <a href="/leadership" class="dropdown-item">
                                        <i class="fas fa-users"></i>Leadership
                                    </a>
                                    <a href="/support" class="dropdown-item active">
                                        <i class="fas fa-question-circle"></i>Support
                                    </a>
                                    <a href="/settings" class="dropdown-item">
                                        <i class="fas fa-cog"></i>Settings
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Side - Authentication & Notifications -->
                        <div class="nav-auth">
                            <!-- Notification Bell -->
                            <div class="notification-bell" id="notificationBell">
                                <i class="fas fa-bell"></i>
                                <span class="notification-badge" id="notificationBadge">0</span>
                            </div>
                            
                            <div id="authButtons">
                                <button class="glass-button" id="loginBtn">
                                    <i class="fas fa-sign-in-alt"></i>Login
                                </button>
                                <button class="glass-button btn-primary" id="registerBtn">
                                    <i class="fas fa-user-plus"></i>Join
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
        
        console.log('✅ Navigation HTML rendered successfully');
    }

    bindEvents() {
        // Add hover effects to navigation links
        this.addHoverEffects('.glass-button');
        
        // Dropdown functionality
        const dropdownBtn = document.getElementById('moreDropdownBtn');
        const dropdown = document.getElementById('moreDropdown');
        
        if (dropdownBtn && dropdown) {
            dropdownBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isVisible = dropdown.style.display === 'block';
                dropdown.style.display = isVisible ? 'none' : 'block';
                
                // Update arrow direction
                const arrow = dropdownBtn.querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdownBtn?.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                const arrow = dropdownBtn?.querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
        
        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdown && dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
                const arrow = dropdownBtn?.querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
        
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
    console.log('🧭 Support Navigation DOM loaded');
    
    // Try immediate initialization
    const navigationPlaceholder = document.getElementById('navigation-placeholder');
    if (navigationPlaceholder) {
        console.log('✅ Found navigation placeholder immediately');
        window.supportNavigation = new SupportNavigation();
    } else {
        console.log('⚠️ Navigation placeholder not found immediately, trying with delay...');
        
        // Try with delay
        setTimeout(() => {
            const placeholder = document.getElementById('navigation-placeholder');
            if (placeholder) {
                console.log('✅ Found navigation placeholder after delay');
                window.supportNavigation = new SupportNavigation();
            } else {
                console.error('❌ Navigation placeholder never found!');
                // Force create navigation at top of body as fallback
                const nav = document.createElement('div');
                nav.id = 'navigation-placeholder';
                document.body.insertBefore(nav, document.body.firstChild);
                window.supportNavigation = new SupportNavigation();
            }
        }, 100);
    }
});

// Make available globally
window.SupportNavigation = SupportNavigation;