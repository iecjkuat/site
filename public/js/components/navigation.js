// JKUAT Innovation Club - Navigation Component

class Navigation {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // More dropdown toggle
        document.getElementById('moreMenuBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown('moreDropdown');
        });

        // Mobile more menu toggle
        document.getElementById('mobileMoreBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown('mobileMoreMenu');
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#moreMenuBtn') && !e.target.closest('#moreDropdown')) {
                this.hideDropdown('moreDropdown');
            }
            if (!e.target.closest('#mobileMoreBtn') && !e.target.closest('#mobileMoreMenu')) {
                this.hideDropdown('mobileMoreMenu');
            }
        });

        // Add hover effects to dropdown items
        this.addHoverEffects('#moreDropdown a, #moreDropdown button');
        this.addHoverEffects('#mobileMoreMenu a, #mobileMoreMenu button');
    }

    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            const isVisible = dropdown.style.display !== 'none';
            dropdown.style.display = isVisible ? 'none' : 'block';
        }
    }

    hideDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.style.display = 'none';
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
    window.navigation = new Navigation();
});

// Make available globally
window.Navigation = Navigation;