/**
 * Ideas Page Footer - JKUAT Innovation Club
 */

document.addEventListener('DOMContentLoaded', () => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div>
                            <h3>JKUAT Innovation Club</h3>
                            <p>Fostering innovation and entrepreneurship among students through collaborative projects, mentorship, and community engagement.</p>
                        </div>
                        <div>
                            <h3>Quick Links</h3>
                            <a href="/home">Home</a>
                            <a href="/ideas">Ideas Hub</a>
                            <a href="/projects">Projects</a>
                            <a href="/events">Events</a>
                            <a href="/resources">Resources</a>
                        </div>
                        <div>
                            <h3>Community</h3>
                            <a href="/leadership">Leadership</a>
                            <a href="/opportunities">Opportunities</a>
                            <a href="/news">News</a>
                            <a href="/support">Support</a>
                        </div>
                        <div>
                            <h3>Contact</h3>
                            <p><i class="fas fa-envelope"></i> innovation@jkuat.ac.ke</p>
                            <p><i class="fas fa-phone"></i> +254 700 000 000</p>
                            <p><i class="fas fa-map-marker-alt"></i> JKUAT Main Campus</p>
                        </div>
                    </div>
                    <div class="footer-copyright">
                        <p>&copy; 2024 JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
    }
});