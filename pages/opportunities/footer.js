// JKUAT Innovation Club - Opportunities Page Footer Component

class OpportunitiesFooter {
    constructor() {
        this.init();
    }

    init() {
        this.renderFooter();
    }

    renderFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) return;

        footerPlaceholder.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <!-- Club Info -->
                        <div>
                            <h3>JKUAT Innovation Club</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem; line-height: 1.6;">
                                Empowering JKUAT students to transform innovative ideas into impactful solutions through technology and entrepreneurship.
                            </p>
                            <div style="display: flex; gap: 1rem;">
                                <a href="#" style="color: rgba(255, 255, 255, 0.8); font-size: 1.25rem; transition: color 0.3s ease;" onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='rgba(255, 255, 255, 0.8)'">
                                    <i class="fab fa-facebook"></i>
                                </a>
                                <a href="#" style="color: rgba(255, 255, 255, 0.8); font-size: 1.25rem; transition: color 0.3s ease;" onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='rgba(255, 255, 255, 0.8)'">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" style="color: rgba(255, 255, 255, 0.8); font-size: 1.25rem; transition: color 0.3s ease;" onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='rgba(255, 255, 255, 0.8)'">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" style="color: rgba(255, 255, 255, 0.8); font-size: 1.25rem; transition: color 0.3s ease;" onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='rgba(255, 255, 255, 0.8)'">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h3>Quick Links</h3>
                            <a href="/">Home</a>
                            <a href="/about">About Us</a>
                            <a href="/events">Events</a>
                            <a href="/projects">Projects</a>
                            <a href="/resources">Resources</a>
                            <a href="/gallery">Gallery</a>
                        </div>

                        <!-- Support -->
                        <div>
                            <h3>Support</h3>
                            <a href="/support">Help Center</a>
                            <a href="/contact">Contact Us</a>
                            <a href="/terms">Terms of Service</a>
                            <a href="/privacy">Privacy Policy</a>
                        </div>

                        <!-- Contact Info -->
                        <div>
                            <h3>Contact Info</h3>
                            <div style="color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
                                <p style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-map-marker-alt" style="color: #10b981;"></i>
                                    JKUAT Main Campus, Juja
                                </p>
                                <p style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-envelope" style="color: #10b981;"></i>
                                    info@jkuatinnovation.ac.ke
                                </p>
                                <p style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-phone" style="color: #10b981;"></i>
                                    +254 700 000 000
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Copyright -->
                    <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 2rem; padding-top: 2rem; text-align: center;">
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                            © ${new Date().getFullYear()} JKUAT Innovation and Entrepreneurship Club. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.opportunitiesFooter = new OpportunitiesFooter();
});

window.OpportunitiesFooter = OpportunitiesFooter;