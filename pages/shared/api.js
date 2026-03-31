/**
 * Central API Client
 * Single source of truth for all HTTP calls.
 * Usage: window.api.auth.login({ identifier, password })
 */

(function () {
    const BASE_URL   = '/api/v1';
    const TIMEOUT_MS = 12000;
    const DEBUG      = false;

    const log = (...args) => { if (DEBUG) console.log('[API]', ...args); };

    // ── global error hook ─────────────────────────────────────────────────────
    let _onError = null;
    function setErrorHandler(fn) { _onError = fn; }

    // ── error class ───────────────────────────────────────────────────────────
    class APIError extends Error {
        constructor(message, status = 0, data = null) {
            super(message);
            this.name   = 'APIError';
            this.status = status;
            this.data   = data;
        }
    }

    // ── URL builder ───────────────────────────────────────────────────────────
    function buildURL(path, query) {
        const base = path.startsWith('http')
            ? path
            : `${BASE_URL}${path}`;
        const url = new URL(base, window.location.origin);
        if (query && typeof query === 'object') {
            Object.entries(query).forEach(([k, v]) => {
                if (v !== undefined && v !== null) url.searchParams.set(k, v);
            });
        }
        return url.toString();
    }

    // ── headers ───────────────────────────────────────────────────────────────
    function getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || null;
    }

    function buildHeaders(method, body, extra = {}) {
        const headers = { ...extra };
        const token = getAuthToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // Only set JSON content-type when there's a body and it's not a file upload
        if (body !== undefined && body !== null && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    // ── response parser ───────────────────────────────────────────────────────
    async function parseResponse(response) {
        let data;
        try {
            data = await response.json();
        } catch {
            throw new APIError(`Server error (${response.status})`, response.status);
        }
        if (!response.ok) {
            const msg = data?.errors?.[0]?.msg
                || data?.message
                || data?.error
                || `Request failed (${response.status})`;
            throw new APIError(msg, response.status, data);
        }
        return data;
    }

    // ── token refresh ─────────────────────────────────────────────────────────
    let _refreshPromise = null; // deduplicate concurrent refresh attempts

    async function refreshToken() {
        // If a refresh is already in flight, wait for it instead of firing another
        if (_refreshPromise) return _refreshPromise;

        _refreshPromise = (async () => {
            try {
                const data = await request('POST', '/auth/refresh', undefined, { _skipRefresh: true });
                if (data?.token) {
                    // Store new token in whichever storage the old one was in
                    const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
                    storage.setItem('authToken', data.token);
                    if (data.user) storage.setItem('user', JSON.stringify(data.user));
                    // Keep AuthState in sync (#8)
                    if (window.AuthState && data.user) {
                        window.AuthState._token = data.token;
                        window.AuthState._user  = data.user;
                    }
                    log('Token refreshed successfully');
                    return data.token;
                }
                throw new APIError('Refresh failed — no token returned', 401);
            } finally {
                _refreshPromise = null;
            }
        })();

        return _refreshPromise;
    }

    // ── core request ──────────────────────────────────────────────────────────
    async function request(method, path, body, options = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), options.timeout || TIMEOUT_MS);

        const safeBody = ['GET', 'DELETE', 'HEAD'].includes(method.toUpperCase())
            ? undefined
            : body !== undefined ? JSON.stringify(body) : undefined;

        const url = buildURL(path, options.query);
        log(method, url, body);

        try {
            const response = await fetch(url, {
                method,
                headers: buildHeaders(method, safeBody, options.headers || {}),
                body: safeBody,
                signal: controller.signal
            });

            // ── 401 handling: try token refresh once, then retry ──────────────
            if (response.status === 401 && !options._skipRefresh) {
                clearTimeout(timer);
                try {
                    await refreshToken();
                    // Retry the original request with the new token
                    return await request(method, path, body, { ...options, _skipRefresh: true });
                } catch {
                    // Refresh failed — fire global handler and throw
                    const err = new APIError('Session expired. Please log in again.', 401);
                    if (_onError) _onError(err);
                    throw err;
                }
            }

            return await parseResponse(response);

        } catch (err) {
            if (err instanceof APIError) {
                if (_onError && err.status !== 401) _onError(err);
                throw err;
            }
            const wrapped = err.name === 'AbortError'
                ? new APIError('Request timed out. Please try again.', 408)
                : new APIError('Network error. Please check your connection.', 0);
            if (_onError) _onError(wrapped);
            throw wrapped;
        } finally {
            clearTimeout(timer);
        }
    }

    // ── retry wrapper ─────────────────────────────────────────────────────────
    async function requestWithRetry(method, path, body, options = {}, retries = 1) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await request(method, path, body, options);
            } catch (err) {
                // Only retry on network errors (status 0) or 5xx, not on 4xx
                const shouldRetry = attempt < retries && (err.status === 0 || err.status >= 500);
                if (!shouldRetry) throw err;
                log(`Retrying (${attempt + 1}/${retries})...`);
                await new Promise(r => setTimeout(r, 600 * (attempt + 1))); // back-off
            }
        }
    }

    // ── public API ────────────────────────────────────────────────────────────
    const api = {
        // Raw methods
        get:    (path, opts)       => requestWithRetry('GET',    path, undefined, opts),
        post:   (path, body, opts) => request('POST',   path, body,      opts),
        put:    (path, body, opts) => request('PUT',    path, body,      opts),
        patch:  (path, body, opts) => request('PATCH',  path, body,      opts),
        delete: (path, opts)       => requestWithRetry('DELETE', path, undefined, opts),

        // Auth endpoints
        auth: {
            login:              (body)  => request('POST', '/auth/login',               body, { timeout: 10000 }),
            register:           (body)  => request('POST', '/auth/register',            body, { timeout: 15000 }),
            verify:             ()      => request('GET',  '/auth/verify'),
            verifyEmail:        (token) => request('GET',  '/auth/verify-email', undefined, { query: { token } }),
            resendVerification: (email) => request('POST', '/auth/resend-verification', { email }),
            logout:             ()      => request('POST', '/auth/logout'),
            profile:            ()      => request('GET',  '/auth/profile'),
            updateProfile:      (body)  => request('PUT',  '/auth/profile',             body),
            refresh:            ()      => request('POST', '/auth/refresh', undefined,  { _skipRefresh: true }),
        },

        // Resource endpoints
        events: {
            list:   (q) => requestWithRetry('GET', '/events',   undefined, { query: q }),
            get:    (id)=> requestWithRetry('GET', `/events/${id}`),
        },
        projects: {
            list:   (q) => requestWithRetry('GET', '/projects', undefined, { query: q }),
            get:    (id)=> requestWithRetry('GET', `/projects/${id}`),
        },
        ideas: {
            list:   (q) => requestWithRetry('GET', '/ideas',    undefined, { query: q }),
            get:    (id)=> requestWithRetry('GET', `/ideas/${id}`),
        },
        notifications: {
            list:   (q) => requestWithRetry('GET', '/notifications', undefined, { query: q }),
        },
        stats: {
            get:    ()  => requestWithRetry('GET', '/stats'),
        },

        // Config
        setErrorHandler,
        getAuthToken,
        APIError,
    };

    window.api      = api;
    window.APIError = APIError;

    // Wire global 401 handler — auto-logout when session expires
    setErrorHandler((err) => {
        if (err.status === 401 && window.AuthState) {
            window.AuthState.clear();
            // Only redirect if not already on auth pages
            const path = window.location.pathname;
            if (!['/signin', '/signup', '/verify-email'].includes(path)) {
                sessionStorage.setItem('redirectAfterLogin', path);
                window.location.href = '/signin';
            }
        }
    });

    console.log('✅ API client loaded');
})();
