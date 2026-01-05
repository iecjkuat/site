// Ideas Page - Footer Component

class IdeasFooter {
    constructor() {
        this.init();
    }

    init() {
        console.log('🦶 Initializing IdeasFooter...');
        this.createFooter();
        console.log('✅ IdeasFooter initialized');
    }

    createFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) {
            const footer = document.createElement('div');
            footer.id = 'footer-placeholder';
            document.body.appendChild(footer);
        }

        const footer = document.getElementById('footer-placeholder');
        if (!footer) return;

        footer.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <!-- Club Info -->
                        <div>
                            <h3>JKUAT Innovation Club</h3>
                            <p>Empowering the next generation of innovators and entrepreneurs at Jomo Kenyatta University of Agriculture and Technology.</p>
                        </div>
                        
                        <!-- Quick Links -->
                        <div>
                            <h3>Quick Links</h3>
                            <a href="/">Home</a>
                            <a href="/events">Events</a>
                            <a href="/projects">Projects</a>
                            <a href="/ideas">Ideas Hub</a>
                            <a href="/resources">Resources</a>
                            <a href="/opportunities">Opportunities</a>
                        </div>
                        
                        <!-- Contact -->
                        <div>
                            <h3>Contact</h3>
                            <p>📧 innovation@jkuat.ac.ke</p>
                            <p>📱 +254 700 000 000</p>
                            <p>📍 JKUAT Main Campus, Juja</p>
                        </div>
                    </div>
                    
                    <!-- Copyright -->
                    <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: rgba(255, 255, 255, 0.8);">© 2024 JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦶 Ideas Footer DOM loaded');
    setTimeout(() => {
        window.ideasFooter = new IdeasFooter();
    }, 200);
});

// Make available globally
window.IdeasFooter = IdeasFooter;