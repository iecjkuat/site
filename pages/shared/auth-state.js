/**
 * Auth State Manager
 * Single source of truth for authentication across the entire app.
 * Wraps the existing AuthManager in auth.js with a cleaner interface.
 *
 * Load AFTER auth.js and api.js:
 *   <script src="/shared/auth.js"></script>
 *   <script src="/shared/api.js"></script>
 *   <script src="/shared/auth-state.js"></script>
 */

(function () {

    // ── internal state ────────────────────────────────────────────────────────

    let _user    = null;
    let _token   = null;
    let _ready   = false;
    const _listeners = new Set();

    // ── helpers ───────────────────────────────────────────────────────────────

    function readStorage() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        let user = null;
        try {
            const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (raw) user = JSON.parse(raw);
        } catch { /* corrupt storage — ignore */ }
        return { token, user };
    }

    function notify(event, payload) {
        _listeners.forEach(fn => {
            try { fn(event, payload); } catch (e) { console.error('AuthState listener error:', e); }
        });
        // Also fire DOM events so existing code (navbar, etc.) keeps working
        document.dispatchEvent(new CustomEvent(event, { detail: payload }));
    }

    function setState(user, token) {
        _user  = user;
        _token = token;
    }

    // ── public interface ──────────────────────────────────────────────────────

    const AuthState = {

        /** True once the initial session check is complete */
        get ready()          { return _ready; },
        get isAuthenticated(){ return !!(_user && _token); },
        get user()           { return _user ? { ..._user } : null; },  // defensive copy
        get token()          { return _token; },
        get role()           { return _user?.role || 'guest'; },
        get isAdmin()        { return ['admin', 'super_admin'].includes(_user?.role); },

        /**
         * Initialise — call once on page load.
         * Restores session from storage and verifies the token with the backend.
         */
        async init() {
            const { token, user } = readStorage();

            if (token && user) {
                setState(user, token);
                notify('userLoggedIn', user);

                // Silently verify token in background — don't block page load
                this._verifyInBackground(token);
            }

            _ready = true;
            notify('authReady', { isAuthenticated: this.isAuthenticated });
        },

        async _verifyInBackground(token) {
            try {
                const data = await window.api?.auth.verify();
                if (data?.user) {
                    // Refresh user data from server
                    const fresh = data.user;
                    setState(fresh, token);
                    // Update storage with fresh data
                    const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
                    storage.setItem('user', JSON.stringify(fresh));
                    notify('userUpdated', fresh);
                }
            } catch (err) {
                if (err?.status === 401) {
                    // Token expired or revoked — log out silently
                    console.warn('AuthState: token invalid, clearing session');
                    this.clear();
                }
                // Network errors — keep existing session, don't log out
            }
        },

        /**
         * Call after a successful login response from the backend.
         */
        setSession(token, user, rememberMe = false) {
            setState(user, token);
            const storage = rememberMe ? localStorage : sessionStorage;
            const other   = rememberMe ? sessionStorage : localStorage;
            storage.setItem('authToken', token);
            storage.setItem('user', JSON.stringify(user));
            other.removeItem('authToken');
            other.removeItem('user');
            notify('userLoggedIn', user);
        },

        /**
         * Clear session — call on logout.
         */
        clear() {
            setState(null, null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            notify('userLoggedOut', null);
        },

        /**
         * Full logout — clears state and calls backend.
         */
        async logout() {
            try {
                if (_token) await window.api?.auth.logout();
            } catch { /* ignore — clear locally regardless */ }
            this.clear();
            window.location.href = '/';
        },

        /**
         * Subscribe to auth events.
         * @param {Function} fn  Called with (event, payload)
         * @returns {Function}   Unsubscribe function
         */
        subscribe(fn) {
            _listeners.add(fn);
            // Immediately call with current state if already ready
            if (_ready) fn(_user ? 'userLoggedIn' : 'userLoggedOut', _user);
            return () => _listeners.delete(fn);
        },

        /**
         * Require authentication — redirect to signin if not logged in.
         * Call at the top of protected pages.
         */
        requireAuth(redirectTo = window.location.pathname) {
            if (!this.isAuthenticated) {
                sessionStorage.setItem('redirectAfterLogin', redirectTo);
                window.location.href = '/signin';
                return false;
            }
            return true;
        },

        /**
         * Require admin role.
         */
        requireAdmin() {
            if (!this.isAuthenticated) return this.requireAuth();
            if (!this.isAdmin) {
                window.location.href = '/dashboard';
                return false;
            }
            return true;
        },
    };

    // ── auto-init ─────────────────────────────────────────────────────────────

    // Run init as soon as DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AuthState.init());
    } else {
        AuthState.init();
    }

    // Expose globally
    window.AuthState = AuthState;

    console.log('✅ AuthState loaded');
})();
