// Dashboard Page - Footer Component

class DashboardFooter {
    constructor() {
        this.init();
    }

    init() {
        console.log('🦶 Initializing DashboardFooter...');
        this.createFooter();
        console.log('✅ DashboardFooter initialized');
    }

    createFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) return;

        footerPlaceholder.innerHTML = `
            <!-- Footer -->
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        
                        <!-- Club Info -->
                        <div>
                            <h3>JKUAT Innovation Club</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">
                                Empowering students to innovate, create, and transform ideas into reality.
                            </p>
                            <div style="display: flex; gap: 1rem;">
                                <a href="#" style="color: rgba(255, 255, 255, 0.6); font-size: 1.25rem;">
                                    <i class="fab fa-facebook"></i>
                                </a>
                                <a href="#" style="color: rgba(255, 255, 255, 0.6); font-size: 1.25rem;">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" style="color: rgba(255, 255, 255, 0.6); font-size: 1.25rem;">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" style="color: rgba(255, 255, 255, 0.6); font-size: 1.25rem;">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h3>Quick Links</h3>
                            <a href="/events">Events</a>
                            <a href="/projects">Projects</a>
                            <a href="/opportunities">Opportunities</a>
                            <a href="/resources">Resources</a>
                            <a href="/support">Support</a>
                        </div>

                        <!-- Contact Info -->
                        <div>
                            <h3>Contact Us</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">
                                <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i> 
                                info@jkuatinnovation.club
                            </p>
                            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">
                                <i class="fas fa-phone" style="margin-right: 0.5rem;"></i> 
                                +254 700 000 000
                            </p>
                            <p style="color: rgba(255, 255, 255, 0.8);">
                                <i class="fas fa-map-marker-alt" style="margin-right: 0.5rem;"></i> 
                                JKUAT Main Campus
                            </p>
                        </div>

                    </div>

                    <!-- Bottom Bar -->
                    <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); margin-top: 2rem; padding-top: 2rem; text-align: center;">
                        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                            <p style="color: rgba(255, 255, 255, 0.6); margin: 0;">
                                © 2026 JKUAT Innovation and Entrepreneurship Club. All rights reserved.
                            </p>
                            <div style="display: flex; gap: 2rem;">
                                <a href="/privacy" style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Privacy Policy</a>
                                <a href="/terms" style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦶 Dashboard Footer DOM loaded');
    setTimeout(() => {
        window.dashboardFooter = new DashboardFooter();
    }, 200);
});

// Make available globally
window.DashboardFooter = DashboardFooter;