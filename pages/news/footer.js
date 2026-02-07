/**
 * JKUAT Innovation Club - News Page Footer
 * Shared footer component for consistency
 */

document.addEventListener('DOMContentLoaded', function() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>JKUAT Innovation Club</h3>
                            <p>Empowering students through innovation, technology, and collaboration. Join us in shaping the future of technology at JKUAT.</p>
                            <div class="social-links">
                                <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                                <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                                <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Quick Links</h3>
                            <a href="/home/index.html">Home</a>
                            <a href="/events/events.html">Events</a>
                            <a href="/projects/projects.html">Projects</a>
                            <a href="/opportunities/opportunities.html">Opportunities</a>
                            <a href="/resources/resources.html">Resources</a>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Community</h3>
                            <a href="/leadership/leadership.html">Leadership</a>
                            <a href="/ideas/ideas.html">Ideas Hub</a>
                            <a href="/support/support.html">Support</a>
                            <a href="/feedback/feedback.html">Feedback</a>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Resources</h3>
                            <a href="/news/news.html">News & Articles</a>
                            <a href="/voting/voting.html">Voting</a>
                            <a href="/settings/settings.html">Settings</a>
                            <a href="/privacy/privacy.html">Privacy Policy</a>
                            <a href="/terms/terms.html">Terms of Service</a>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>&copy; 2026 JKUAT Innovation Club. All rights reserved.</p>
                        <a href="#" class="footer-top">
                            <i class="fas fa-arrow-up"></i>
                            Back to Top
                        </a>
                    </div>
                </div>
            </footer>
        `;

        // Add scroll to top functionality
        const backToTop = document.querySelector('.footer-top');
        if (backToTop) {
            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
});