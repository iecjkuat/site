/**
 * JKUAT Innovation Club - Events Page Footer Component
 * Handles footer rendering and functionality for the events page
 */

class EventsFooter {
    constructor() {
        this.init();
    }

    init() {
        console.log('🦶 Events Footer initializing...');
        this.renderFooter();
        this.setupFooterInteractions();
        console.log('✅ Events Footer initialized successfully');
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
                            <p>Join us in shaping the future through innovation, entrepreneurship, and technology. Connect with like-minded individuals and turn your ideas into reality.</p>
                            <div class="social-links">
                                <a href="#" class="social-link" title="Facebook">
                                    <i class="fab fa-facebook"></i>
                                </a>
                                <a href="#" class="social-link" title="Twitter">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" class="social-link" title="LinkedIn">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                                <a href="#" class="social-link" title="Instagram">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" class="social-link" title="GitHub">
                                    <i class="fab fa-github"></i>
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Events & Activities</h3>
                            <a href="/events">All Events</a>
                            <a href="/events?filter=workshop">Workshops</a>
                            <a href="/events?filter=seminar">Seminars</a>
                            <a href="/events?filter=competition">Competitions</a>
                            <a href="/events?filter=hackathon">Hackathons</a>
                            <a href="/events?filter=social">Social Events</a>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Quick Links</h3>
                            <a href="/">Home</a>
                            <a href="/dashboard">Dashboard</a>
                            <a href="/projects">Projects</a>
                            <a href="/opportunities">Opportunities</a>
                            <a href="/resources">Resources</a>
                            <a href="/leadership">Leadership</a>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Get Involved</h3>
                            <a href="/join">Join the Club</a>
                            <a href="/ideas">Submit Ideas</a>
                            <a href="/feedback">Give Feedback</a>
                            <a href="/support">Get Support</a>
                            <a href="/cms">News & Updates</a>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Contact Info</h3>
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <a href="mailto:events@jkuatinnovation.club">events@jkuatinnovation.club</a>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <a href="tel:+254700000000">+254 700 000 000</a>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>JKUAT Main Campus, Kiambu County</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-clock"></i>
                                <span>Mon-Fri: 8AM-6PM</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <div class="footer-left">
                                <p>&copy; ${new Date().getFullYear()} JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                            </div>
                            <div class="footer-center">
                                <span class="footer-badge">
                                    <i class="fas fa-heart" style="color: #e91e63;"></i>
                                    Made with passion by innovators
                                </span>
                            </div>
                            <div class="footer-right">
                                <div class="footer-links">
                                    <a href="/privacy">Privacy Policy</a>
                                    <a href="/terms">Terms of Service</a>
                                    <a href="/cookies">Cookie Policy</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    setupFooterInteractions() {
        // Add smooth scrolling for internal links
        const footerLinks = document.querySelectorAll('.footer a[href^="/"]');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add loading state for navigation
                const originalText = link.textContent;
                link.style.opacity = '0.7';
                
                // Restore after a short delay (simulating navigation)
                setTimeout(() => {
                    link.style.opacity = '1';
                }, 300);
            });
        });

        // Add hover effects for social links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-2px) scale(1.1)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Add click tracking for analytics (placeholder)
        document.querySelector('.footer').addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                console.log('Footer link clicked:', link.href, link.textContent);
                // Here you could add analytics tracking
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦶 Events Footer DOM loaded');
    if (!window.eventsFooter) {
        window.eventsFooter = new EventsFooter();
    }
});

// Make available globally
window.EventsFooter = EventsFooter;