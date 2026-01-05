// JKUAT Innovation Club - Auth Component

class Auth {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('jkuat_token');
    }

    async getCurrentUser() {
        if (this.token) {
            try {
                const response = await window.jkuatApp.apiCall('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                this.user = response.user;
                return this.user;
            } catch (error) {
                console.error('Auth verification failed:', error);
                this.logout();
            }
        }
        return null;
    }

    logout() {
        localStorage.removeItem('jkuat_token');
        this.user = null;
        this.token = null;
    }

    isAuthenticated() {
        return !!this.token;
    }
}

window.Auth = Auth;