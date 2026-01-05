// JKUAT Innovation Club - Support Page Footer Component

class SupportFooter {
    constructor() {
        this.init();
    }

    init() {
        console.log('🦶 Support Footer init() called');
        this.renderFooter();
        console.log('✅ Support Footer init() completed');
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
                        <div class="footer-section">
                            <h3>JKUAT Innovation Club</h3>
                            <p>Empowering the next generation of innovators and entrepreneurs at Jomo Kenyatta University of Agriculture and Technology.</p>
                            <div class="social-links">
                                <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Quick Links</h3>
                            <a href="/">Home</a>
                            <a href="/events">Events</a>
                            <a href="/projects">Projects</a>
                            <a href="/opportunities">Opportunities</a>
                            <a href="/resources">Resources</a>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Community</h3>
                            <a href="/ideas">Ideas</a>
                            <a href="/cms">News & Updates</a>
                            <a href="/support">Support</a>
                            <a href="/about">About Us</a>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Contact</h3>
                            <p><i class="fas fa-envelope"></i> info@jkuatinnovation.club</p>
                            <p><i class="fas fa-phone"></i> +254 700 000 000</p>
                            <p><i class="fas fa-map-marker-alt"></i> JKUAT Main Campus, Kiambu</p>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <p>&copy; 2024 JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                            <div class="footer-links">
                                <a href="/privacy">Privacy Policy</a>
                                <a href="/terms">Terms of Service</a>
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
    console.log('🦶 Support Footer DOM loaded');
    window.supportFooter = new SupportFooter();
});

// Make available globally
window.SupportFooter = SupportFooter;