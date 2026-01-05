// JKUAT Innovation Club - Resources Page Navigation Component

class ResourcesNavigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧭 ResourcesNavigation init() called');
        this.renderNavigation();
        this.bindEvents();
        console.log('✅ ResourcesNavigation init() completed');
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
                            <a href="/resources" class="glass-button">
                                <i class="fas fa-book"></i>Resources
                            </a>
                            <a href="/opportunities" class="glass-button">
                                <i class="fas fa-briefcase"></i>Opportunities
                            </a>
                            <a href="/ideas" class="glass-button">
                                <i class="fas fa-brain"></i>Ideas
                            </a>
                            <a href="/cms" class="glass-button">
                                <i class="fas fa-newspaper"></i>News
                            </a>
                            <a href="/about" class="glass-button">
                                <i class="fas fa-info-circle"></i>About
                            </a>
                            <a href="/support" class="glass-button">
                                <i class="fas fa-question-circle"></i>Support
                            </a>
                        </div>
                        
                        <!-- Right Side - Authentication -->
                        <div class="nav-auth">
                            <div id="authButtons">
                                <!-- Auth buttons will be populated by auth manager -->
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
    console.log('🧭 Resources Navigation DOM loaded');
    
    // Try immediate initialization
    const navigationPlaceholder = document.getElementById('navigation-placeholder');
    if (navigationPlaceholder) {
        console.log('✅ Found navigation placeholder immediately');
        window.resourcesNavigation = new ResourcesNavigation();
    } else {
        console.log('⚠️ Navigation placeholder not found immediately, trying with delay...');
        
        // Try with delay
        setTimeout(() => {
            const placeholder = document.getElementById('navigation-placeholder');
            if (placeholder) {
                console.log('✅ Found navigation placeholder after delay');
                window.resourcesNavigation = new ResourcesNavigation();
            } else {
                console.error('❌ Navigation placeholder never found!');
                // Force create navigation at top of body as fallback
                const nav = document.createElement('div');
                nav.id = 'navigation-placeholder';
                document.body.insertBefore(nav, document.body.firstChild);
                window.resourcesNavigation = new ResourcesNavigation();
            }
        }, 100);
    }
});

// Make available globally
window.ResourcesNavigation = ResourcesNavigation;