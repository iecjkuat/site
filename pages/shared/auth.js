// Secure Client-Side Auth - Replaces localStorage tokens (XSS safe)
// Use cookies + proxy API calls through backend

/**
 * JKUAT Secure Auth Client
 * - Reads httpOnly session cookies (no JS access to token)
 * - Proxies API calls via /api/proxy/* (adds session cookie automatically)
 * - No localStorage/sessionStorage token storage
 */

class SecureAuthClient {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
    }

    // Get session cookie value (cannot access httpOnly directly, but detect existence)
    hasValidSession() {
        // Check for session cookie presence (indirect via backend /auth/verify)
        return fetch('/api/v1/auth/verify', { credentials: 'include' })
            .then(res => res.ok)
            .catch(() => false);
    }

    // Get user data (calls backend, cookie auto-sent)
    async getCurrentUser() {
        if (this.user) return this.user;
        
        try {
            const res = await fetch('/api/v1/auth/profile', { 
                credentials: 'include',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            
            if (res.ok) {
                this.user = await res.json();
                this.isAuthenticated = true;
                return this.user;
            }
            
            this.isAuthenticated = false;
            return null;
        } catch {
            this.isAuthenticated = false;
            return null;
        }
    }

    // Proxy API calls (backend adds auth cookie to upstream)
    async apiCall(path, options = {}) {
        const url = `/api/proxy${path}`;
        const defaults = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            }
        };
        
        const res = await fetch(url, { ...defaults, ...options });
        
        if (res.status === 401) {
            this.logout();
            window.location.href = '/signin';
        }
        
        return res;
    }

    // Logout (clear client state, backend clears session)
    async logout() {
        await fetch('/api/v1/auth/logout', { credentials: 'include', method: 'POST' });
        this.user = null;
        this.isAuthenticated = false;
        window.location.href = '/';
    }
}

// Global auth instance
window.authClient = new SecureAuthClient();

// Convenience methods (replace old localStorage patterns)
window.getAuthToken = () => null; // No client token (security!)
window.hasAuthToken = () => window.authClient.isAuthenticated;
window.getCurrentUser = () => window.authClient.getCurrentUser();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    window.authClient.hasValidSession().then(auth => {
        if (!auth) window.location.href = '/signin';
    });
});
