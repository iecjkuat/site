// JKUAT Innovation Club - Projects Page Footer Component

class ProjectsFooter {
    constructor() {
        this.init();
    }

    init() {
        console.log('🦶 ProjectsFooter init() called');
        this.renderFooter();
        console.log('✅ ProjectsFooter init() completed');
    }

    renderFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (!footerPlaceholder) {
            console.error('❌ footer-placeholder element not found!');
            return;
        }

        footerPlaceholder.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        
                        <!-- Club Info -->
                        <div>
                            <h3>JKUAT Innovation Club</h3>
                            <p class="footer-desc">
                                Empowering students to innovate, create, and transform ideas into reality.
                            </p>
                            <div class="footer-social-links">
                                <a href="#" class="footer-social-link">
                                    <i class="fab fa-facebook"></i>
                                </a>
                                <a href="#" class="footer-social-link">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" class="footer-social-link">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" class="footer-social-link">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h3>Quick Links</h3>
                            <a href="/">Home</a>
                            <a href="/events">Events</a>
                            <a href="/projects">Projects</a>
                            <a href="/opportunities">Opportunities</a>
                            <a href="/resources">Resources</a>
                            <a href="/support">Support</a>
                        </div>

                        <!-- Contact Info -->
                        <div>
                            <h3>Contact Us</h3>
                            <p class="footer-contact-item">
                                <i class="fas fa-envelope footer-contact-icon"></i> 
                                info@jkuatinnovation.club
                            </p>
                            <p class="footer-contact-item">
                                <i class="fas fa-phone footer-contact-icon"></i> 
                                +254 700 000 000
                            </p>
                            <p class="footer-contact-item">
                                <i class="fas fa-map-marker-alt footer-contact-icon"></i> 
                                JKUAT Main Campus
                            </p>
                        </div>

                    </div>

                    <!-- Bottom Bar -->
                    <div class="footer-bottom-bar">
                        <div class="footer-bottom-content">
                            <p class="footer-copyright">
                                © 2026 JKUAT Innovation and Entrepreneurship Club. All rights reserved.
                            </p>
                            <div class="footer-bottom-links">
                                <a href="/privacy" class="footer-bottom-link">Privacy Policy</a>
                                <a href="/terms" class="footer-bottom-link">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦶 Projects Footer DOM loaded');
    window.projectsFooter = new ProjectsFooter();
});

// Make available globally
window.ProjectsFooter = ProjectsFooter;