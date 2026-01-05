// Leadership Page - Authentication Handler
// Handles authentication state for leadership page

class LeadershipAuth {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        this.checkAuthState();
    }

    async checkAuthState() {
        try {
            const token = localStorage.getItem('jkuat_token');
            if (token) {
                const response = await window.jkuatApp.apiCall('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response && response.user) {
                    this.user = response.user;
                    this.updateUIForAuthenticatedUser();
                }
            }
        } catch (error) {
            console.log('User not authenticated');
            this.updateUIForGuestUser();
        }
    }

    updateUIForAuthenticatedUser() {
        // Show authenticated user features
        const authElements = document.querySelectorAll('.auth-required');
        authElements.forEach(el => el.style.display = 'block');

        // Update contact leadership section for authenticated users
        const contactSection = document.querySelector('.contact-leadership-content');
        if (contactSection && this.user) {
            const userGreeting = document.createElement('p');
            userGreeting.innerHTML = `<strong>Hello ${this.user.name}!</strong> As a club member, you have direct access to our leadership team.`;
            userGreeting.style.color = '#10b981';
            userGreeting.style.marginBottom = '1rem';
            contactSection.insertBefore(userGreeting, contactSection.firstChild);
        }
    }

    updateUIForGuestUser() {
        // Hide authenticated user features
        const authElements = document.querySelectorAll('.auth-required');
        authElements.forEach(el => el.style.display = 'none');

        // Show guest user message
        const contactSection = document.querySelector('.contact-leadership-content');
        if (contactSection) {
            const guestMessage = document.createElement('p');
            guestMessage.innerHTML = `<strong>Join our club</strong> to get direct access to our leadership team and exclusive member benefits.`;
            guestMessage.style.color = '#3b82f6';
            guestMessage.style.marginBottom = '1rem';
            contactSection.insertBefore(guestMessage, contactSection.firstChild);
        }
    }

    isAuthenticated() {
        return !!this.user;
    }

    getUserRole() {
        return this.user?.role || 'guest';
    }
}

window.LeadershipAuth = LeadershipAuth;