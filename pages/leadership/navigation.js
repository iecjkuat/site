// Leadership Page - Navigation Handler
// Handles navigation specific to leadership page

class LeadershipNavigation {
    constructor() {
        this.currentSection = 'executive-committee';
        this.init();
    }

    init() {
        this.setupSectionNavigation();
        this.setupScrollSpy();
        this.highlightCurrentPage();
    }

    setupSectionNavigation() {
        // Add quick navigation within the leadership page
        const heroSection = document.querySelector('.hero-section .container');
        if (heroSection) {
            const quickNav = document.createElement('div');
            quickNav.className = 'quick-navigation';
            quickNav.innerHTML = `
                <div class="quick-nav-links">
                    <a href="#executive-committee" class="quick-nav-link active" data-section="executive-committee">
                        <i class="fas fa-users"></i> Executive Committee
                    </a>
                    <a href="#club-patrons" class="quick-nav-link" data-section="club-patrons">
                        <i class="fas fa-university"></i> Club Patrons
                    </a>
                    <a href="#structure" class="quick-nav-link" data-section="structure">
                        <i class="fas fa-sitemap"></i> Structure
                    </a>
                </div>
            `;
            
            // Add CSS for quick navigation
            const style = document.createElement('style');
            style.textContent = `
                .quick-navigation {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: center;
                }
                .quick-nav-links {
                    display: flex;
                    gap: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50px;
                    padding: 0.5rem;
                }
                .quick-nav-link {
                    color: rgba(255, 255, 255, 0.8);
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    transition: all 0.3s ease;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .quick-nav-link:hover,
                .quick-nav-link.active {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                    text-decoration: none;
                }
                @media (max-width: 768px) {
                    .quick-nav-links {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            `;
            document.head.appendChild(style);
            
            heroSection.appendChild(quickNav);

            // Add click handlers
            const navLinks = quickNav.querySelectorAll('.quick-nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = link.dataset.section;
                    this.navigateToSection(section);
                    this.updateActiveNavLink(link);
                });
            });
        }
    }

    setupScrollSpy() {
        // Update active navigation based on scroll position
        const sections = ['executive-committee', 'club-patrons', 'structure'];
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id || entry.target.className.split(' ')[0].replace('-section', '');
                    this.currentSection = sectionId;
                    this.updateActiveNavLink();
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        });

        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId) || document.querySelector(`.${sectionId}-section`);
            if (element) {
                observer.observe(element);
            }
        });
    }

    navigateToSection(sectionId) {
        const element = document.getElementById(sectionId) || document.querySelector(`.${sectionId}-section`);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateActiveNavLink(activeLink = null) {
        const navLinks = document.querySelectorAll('.quick-nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (activeLink) {
                if (link === activeLink) {
                    link.classList.add('active');
                }
            } else {
                if (link.dataset.section === this.currentSection) {
                    link.classList.add('active');
                }
            }
        });
    }

    highlightCurrentPage() {
        // Highlight leadership in main navigation
        const navLinks = document.querySelectorAll('.glass-button, .nav-link');
        navLinks.forEach(link => {
            if (link.href && link.href.includes('/leadership')) {
                link.style.background = 'rgba(16, 185, 129, 0.2)';
                link.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                link.style.color = '#10b981';
            }
        });
    }
}

window.LeadershipNavigation = LeadershipNavigation;