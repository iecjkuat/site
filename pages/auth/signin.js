/**
 * Signin Page
 */

console.log('🔐 Signin page loaded');

// ── constants ─────────────────────────────────────────────────────────────────
const API_BASE = '/api';
const LOGIN_TIMEOUT_MS = 10000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── DOM ───────────────────────────────────────────────────────────────────────
const signinForm         = document.getElementById('signinForm');
const emailInput         = document.getElementById('email');
const passwordInput      = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const messageContainer   = document.getElementById('messageContainer');
const submitBtn          = signinForm?.querySelector('.submit-btn');

if (!signinForm || !submitBtn) {
    console.error('Required signin elements not found in DOM');
}

// ── helpers ───────────────────────────────────────────────────────────────────

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
}

let messageTimer;

function showMessage(message, type = 'error', persistent = false) {
    if (!messageContainer) return;
    clearTimeout(messageTimer);
    const icon = type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-circle';
    messageContainer.innerHTML = `
        <div class="message ${type}" role="alert" aria-live="assertive">
            <i class="fas fa-${icon}" aria-hidden="true"></i>
            <span>${escapeHTML(message)}</span>
        </div>
    `;
    if (!persistent) {
        messageTimer = setTimeout(() => { messageContainer.innerHTML = ''; }, 6000);
    }
}

function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('loading', isLoading);
    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = isLoading ? 'SIGNING IN...' : 'SIGN IN';
}

function safeRedirect(url) {
    if (!url) return '/dashboard';
    try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.origin !== window.location.origin) return '/dashboard';
        return parsed.pathname + parsed.search + parsed.hash;
    } catch {
        return url.startsWith('/') ? url : '/dashboard';
    }
}

function storeSession(token, user, rememberMe) {
    const keep   = rememberMe ? localStorage   : sessionStorage;
    const discard = rememberMe ? sessionStorage : localStorage;
    keep.setItem('authToken', token);
    keep.setItem('user', JSON.stringify(user));
    discard.removeItem('authToken');
    discard.removeItem('user');
}

async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// ── form submit ───────────────────────────────────────────────────────────────

if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prevent double-submission
        if (submitBtn?.disabled) return;

        const email      = emailInput?.value.trim() ?? '';
        const password   = passwordInput?.value.trim() ?? '';
        const rememberMe = rememberMeCheckbox?.checked ?? false;

        // Validation
        if (!email || !password) {
            showMessage('Please fill in all fields');
            if (!email) emailInput?.focus();
            else passwordInput?.focus();
            return;
        }
        if (!EMAIL_REGEX.test(email)) {
            showMessage('Please enter a valid email address');
            emailInput?.focus();
            return;
        }

        setLoading(true);
        let success = false;

        // Small delay to deter rapid brute-force from the client side
        await new Promise(r => setTimeout(r, 400));

        try {
            let response;
            try {
                // Use central API client if loaded, otherwise raw fetch
                if (window.api) {
                    const data = await window.api.auth.login({ identifier: email, password });
                    // api.auth.login throws on error, so if we're here it succeeded
                    success = true;
                    if (window.AuthState) {
                        window.AuthState.setSession(data.token, data.user, rememberMe);
                    } else {
                        storeSession(data.token, data.user, rememberMe);
                    }
                    const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
                    sessionStorage.removeItem('redirectAfterLogin');
                    const rawRedirect = storedRedirect || new URLSearchParams(window.location.search).get('redirect');
                    const redirectTo  = rawRedirect
                        ? safeRedirect(rawRedirect)
                        : (data.user?.role === 'admin' ? '/admin' : '/dashboard');
                    showMessage('Login successful! Redirecting...', 'success', true);
                    setTimeout(() => { window.location.href = redirectTo; }, 500);
                    return;
                }
                response = await fetchWithTimeout(
                    `${API_BASE}/auth/login`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ identifier: email, password })
                    },
                    LOGIN_TIMEOUT_MS
                );
            } catch (err) {
                if (err instanceof (window.APIError || Error) && err.status) throw err;
                if (err.name === 'AbortError') {
                    throw new Error('Request timed out. Please check your connection and try again.');
                }
                throw new Error('Network error. Please check your connection.');
            }

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error(`Server error (${response.status}) — please try again`);
            }

            if (!response.ok) {
        // Unverified email — build message with DOM, not innerHTML
                if (data.requiresVerification) {
                    if (messageContainer) {
                        messageContainer.innerHTML = '';
                        const div = document.createElement('div');
                        div.className = 'message error';
                        div.setAttribute('role', 'alert');
                        div.setAttribute('aria-live', 'assertive');

                        const icon = document.createElement('i');
                        icon.className = 'fas fa-envelope';
                        icon.setAttribute('aria-hidden', 'true');

                        const span = document.createElement('span');
                        span.textContent = 'Please verify your email first. ';

                        const link = document.createElement('a');
                        link.href = '#';
                        link.textContent = 'Resend verification email';
                        link.style.cssText = 'color:#10b981;text-decoration:underline;margin-left:4px;';

                        span.appendChild(link);
                        div.appendChild(icon);
                        div.appendChild(span);
                        messageContainer.appendChild(div);

                        // Use event delegation on the container
                        messageContainer.addEventListener('click', async (ev) => {
                            if (ev.target !== link) return;
                            ev.preventDefault();
                            link.textContent = 'Sending...';
                            link.style.pointerEvents = 'none';
                            try {
                                const r = await fetchWithTimeout(
                                    `${API_BASE}/auth/resend-verification`,
                                    {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email })
                                    },
                                    LOGIN_TIMEOUT_MS
                                );
                                let d;
                                try { d = await r.json(); } catch { d = {}; }
                                showMessage(d.message || (r.ok ? 'Verification email sent!' : 'Failed to resend.'), r.ok ? 'success' : 'error');
                            } catch {
                                showMessage('Failed to resend. Please try again.');
                            }
                        }, { once: true });
                    }
                    setLoading(false);
                    emailInput?.focus();
                    return;
                }

                throw new Error(data.message || 'Invalid credentials');
            }

            // ── success ──────────────────────────────────────────────────────
            success = true;

            // Store session via AuthState if available, otherwise fall back
            if (window.AuthState) {
                window.AuthState.setSession(data.token, data.user, rememberMe);
            } else if (data.token && data.user) {
                storeSession(data.token, data.user, rememberMe);
            }

            const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            const rawRedirect = storedRedirect || new URLSearchParams(window.location.search).get('redirect');
            const redirectTo  = rawRedirect
                ? safeRedirect(rawRedirect)
                : (data.user?.role === 'admin' ? '/admin' : '/dashboard');

            showMessage('Login successful! Redirecting...', 'success', true);
            setTimeout(() => { window.location.href = redirectTo; }, 500);

        } catch (error) {
            console.error('❌ Login error:', error.message);
            showMessage(error.message || 'Login failed. Please check your credentials.');
            // Focus the appropriate field based on the error
            if (error.message?.toLowerCase().includes('password')) {
                passwordInput?.focus();
            } else {
                emailInput?.focus();
            }
        } finally {
            if (!success) setLoading(false);
        }
    });
}

console.log('✅ Signin page ready');
