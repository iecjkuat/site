// CMS Page - Footer Component

class CmsFooter {
    constructor() {
        this.init();
    }

    init() {
        console.log('🦶 Initializing CmsFooter...');
        this.createFooter();
        console.log('✅ CmsFooter initialized');
    }

    createFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) {
            // Create footer at the end of body if placeholder doesn't exist
            const footer = document.createElement('footer');
            footer.id = 'footer-placeholder';
            document.body.appendChild(footer);
        }

        const footer = document.getElementById('footer-placeholder');
        if (!footer) return;

        footer.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div>
                            <h3>JKUAT Innovation Club</h3>
                            <p>Empowering the next generation of innovators and entrepreneurs at JKUAT.</p>
                        </div>
                        
                        <div>
                            <h3>Quick Links</h3>
                            <a href="/">Home</a>
                            <a href="/events">Events</a>
                            <a href="/projects">Projects</a>
                            <a href="/resources">Resources</a>
                        </div>
                        
                        <div>
                            <h3>Account</h3>
                            <a href="/dashboard">Dashboard</a>
                            <a href="/settings">Settings</a>
                            <a href="/support">Support</a>
                        </div>
                        
                        <div>
                            <h3>Connect</h3>
                            <a href="#" target="_blank">
                                <i class="fab fa-twitter"></i>Twitter
                            </a>
                            <a href="#" target="_blank">
                                <i class="fab fa-linkedin"></i>LinkedIn
                            </a>
                            <a href="#" target="_blank">
                                <i class="fab fa-github"></i>GitHub
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                            © 2025 JKUAT Innovation and Entrepreneurship Club. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦶 CMS Footer DOM loaded');
    setTimeout(() => {
        window.cmsFooter = new CmsFooter();
    }, 200);
});

// Make available globally
window.CmsFooter = CmsFooter;