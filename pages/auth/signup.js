/**
 * Signup Page
 */

console.log('🔐 Signup page loaded');

// ── constants ─────────────────────────────────────────────────────────────────
const API_BASE         = '/api';
const SIGNUP_TIMEOUT   = 15000;
const EMAIL_REGEX      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;

// ── DOM ───────────────────────────────────────────────────────────────────────
const signupForm             = document.getElementById('signupForm');
const nameInput              = document.getElementById('name');
const emailInput             = document.getElementById('email');
const registrationNumberInput = document.getElementById('registrationNumber');
const phoneInput             = document.getElementById('phone');
const courseInput            = document.getElementById('course');
const yearOfStudySelect      = document.getElementById('yearOfStudy');
const collegeSelect          = document.getElementById('college');
const passwordInput          = document.getElementById('password');
const confirmPasswordInput   = document.getElementById('confirmPassword');
const agreeTermsCheckbox     = document.getElementById('agreeTerms');
const messageContainer       = document.getElementById('messageContainer');
const submitBtn              = signupForm?.querySelector('.submit-btn');

if (!signupForm || !submitBtn) {
    console.error('Required signup elements not found in DOM');
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
    if (btnText) btnText.textContent = isLoading ? 'SIGNING UP...' : 'SIGN UP';
}

function normalizePhone(phone) {
    // Strip everything except digits and leading +
    const digits = phone.replace(/[^\d+]/g, '').replace(/(?!^\+)\+/g, '');
    const nums = digits.replace(/^\+/, '');
    if (nums.startsWith('254') && nums.length === 12) return '+' + nums;
    if (nums.startsWith('0') && nums.length === 10) return '+254' + nums.slice(1);
    if (nums.length === 9) return '+254' + nums; // bare 7XXXXXXXX
    return digits.startsWith('+') ? digits : '+' + nums;
}

function isJKUATEmail(email) {
    const lower = email.toLowerCase();
    return JKUAT_DOMAINS.some(domain => lower.endsWith(domain));
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

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prevent double-submission
        if (submitBtn?.disabled) return;

        const name               = nameInput?.value.trim() ?? '';
        const email              = emailInput?.value.trim() ?? '';
        const registrationNumber = registrationNumberInput?.value.trim() ?? '';
        const phone              = phoneInput?.value.trim() ?? '';
        const course             = courseInput?.value.trim() ?? '';
        const yearOfStudy        = yearOfStudySelect?.value ?? '';
        const college            = collegeSelect?.value ?? '';
        const password           = passwordInput?.value ?? '';
        const confirmPassword    = confirmPasswordInput?.value ?? '';
        const agreeTerms         = agreeTermsCheckbox?.checked ?? false;

        // ── validation ────────────────────────────────────────────────────────
        const required = [
            [name,               nameInput,               'Full name is required'],
            [email,              emailInput,              'Email is required'],
            [registrationNumber, registrationNumberInput, 'Registration number is required'],
            [phone,              phoneInput,              'Phone number is required'],
            [course,             courseInput,             'Course is required'],
            [yearOfStudy,        yearOfStudySelect,       'Year of study is required'],
            [college,            collegeSelect,           'College is required'],
            [password,           passwordInput,           'Password is required'],
            [confirmPassword,    confirmPasswordInput,    'Please confirm your password'],
        ];

        for (const [val, el, msg] of required) {
            if (!val) {
                showMessage(msg);
                el?.focus();
                return;
            }
        }

        if (!EMAIL_REGEX.test(email)) {
            showMessage('Please enter a valid email address');
            emailInput?.focus();
            return;
        }

        if (password.length < MIN_PASSWORD_LEN) {
            showMessage(`Password must be at least ${MIN_PASSWORD_LEN} characters`);
            passwordInput?.focus();
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match');
            confirmPasswordInput?.focus();
            return;
        }

        if (!agreeTerms) {
            showMessage('Please agree to the terms of service');
            agreeTermsCheckbox?.focus();
            return;
        }

        setLoading(true);
        let success = false;

        try {
            let response;
            try {
                const payload = {
                    name, email,
                    registrationNumber,
                    phone: normalizePhone(phone),
                    course, yearOfStudy, college, password
                };

                if (window.api) {
                    await window.api.auth.register(payload);
                    success = true;
                } else {
                    response = await fetchWithTimeout(
                        `${API_BASE}/auth/register`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        },
                        SIGNUP_TIMEOUT
                    );
                }
            } catch (err) {
                if (err instanceof (window.APIError || Error) && err.status) throw err;
                if (err.name === 'AbortError') {
                    throw new Error('Request timed out. Please check your connection and try again.');
                }
                throw new Error('Network error. Please check your connection.');
            }

            if (response) {
                let data;
                try {
                    data = await response.json();
                } catch {
                    throw new Error(`Server error (${response.status}) — please try again`);
                }
                if (!response.ok) {
                    const errorMsg = data.errors ? data.errors[0].msg : (data.message || 'Registration failed');
                    throw new Error(errorMsg);
                }
                success = true;
            }

            // Build success message with DOM (no innerHTML with user data)
            if (messageContainer) {
                messageContainer.innerHTML = '';
                const div = document.createElement('div');
                div.className = 'message success';
                div.setAttribute('role', 'alert');
                div.setAttribute('aria-live', 'assertive');
                div.style.lineHeight = '1.8';

                const icon = document.createElement('i');
                icon.className = 'fas fa-check-circle';
                icon.setAttribute('aria-hidden', 'true');

                const span = document.createElement('span');

                const strong1 = document.createElement('strong');
                strong1.textContent = 'Account created!';

                const br1 = document.createElement('br');
                const sentText = document.createTextNode('We\'ve sent a verification link to ');

                const strong2 = document.createElement('strong');
                strong2.textContent = email; // safe — DOM text node, not innerHTML

                const br2 = document.createElement('br');
                const instrText = document.createTextNode('Click the link in your JKUAT email to activate your account, then ');

                const signinLink = document.createElement('a');
                signinLink.href = '/signin';
                signinLink.textContent = 'sign in here';
                signinLink.style.cssText = 'color:#10b981;font-weight:600;';

                const dotText = document.createTextNode('.');

                span.append(strong1, br1, sentText, strong2, br2, instrText, signinLink, dotText);
                div.appendChild(icon);
                div.appendChild(span);
                messageContainer.appendChild(div);
            }

            // Hide form — user must verify before they can do anything else
            signupForm.style.display = 'none';

        } catch (error) {
            console.error('❌ Registration error:', error.message);
            showMessage(error.message || 'Registration failed. Please try again.');
            if (error.message?.toLowerCase().includes('email')) {
                emailInput?.focus();
            } else if (error.message?.toLowerCase().includes('password')) {
                passwordInput?.focus();
            } else if (error.message?.toLowerCase().includes('registration')) {
                registrationNumberInput?.focus();
            } else {
                emailInput?.focus();
            }
        } finally {
            if (!success) setLoading(false);
        }
    });
}

console.log('✅ Signup page ready');
