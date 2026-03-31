/**
 * JKUAT Innovation Club - Supabase Authentication System
 * Pure Supabase Auth - no custom JWT, clean and simple
 */

console.log('🔐 Loading Supabase Authentication System...');

// =============================================================================
// SUPABASE CLIENT SETUP
// =============================================================================

let supabaseClient = null;
let authManager = null;

async function initializeSupabase() {
    if (supabaseClient) return supabaseClient;
    
    try {
        console.log('🔗 Initializing Supabase client...');
        
        const SUPABASE_URL = 'https://gakuuxwhlczhlgngcdrv.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3V1eHdobGN6aGxnbmdjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzUyODksImV4cCI6MjA4MTY1MTI4OX0.wbgJik7A6qasB8FMEWZqZka8CEpZyUrSw-Ma2oLZZwM';
        
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase library not loaded');
        }
        
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Test connection
        const { error } = await supabaseClient.auth.getSession();
        if (error) {
            console.warn('⚠️ Supabase connection warning:', error.message);
        } else {
            console.log('✅ Supabase connection successful');
        }
        
        // Make available globally
        window.supabaseClient = supabaseClient;
        
        return supabaseClient;
        
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return null;
    }
}

// =============================================================================
// SUPABASE AUTH MANAGER
// =============================================================================

// =============================================================================
// AUTHENTICATION MANAGER
// =============================================================================

class AuthManager {
    constructor() {
        this.user = null;
        this.session = null;
        this.isReady = false;
    }

    async init() {
        if (!supabaseClient) {
            await initializeSupabase();
        }
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        // Check for JWT token from backend API login
        const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (authToken && storedUser) {
            try {
                // We have a backend JWT token, use the stored user data
                this.user = JSON.parse(storedUser);
                this.session = { access_token: authToken }; // Mock session for compatibility
                console.log('✅ Restored JWT session:', this.user.email);
                console.log('👤 User object:', this.user);
                
                // Update UI immediately
                this.updateUI();
                // userLoggedIn will be dispatched at the end of init() — don't fire twice (#15)
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
            }
        } else {
            // Fallback to Supabase session check
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (error) {
                console.error('Session error:', error);
            } else if (session) {
                this.session = session;
                this.user = this.formatUser(session.user);
                
                // Store user data in localStorage for admin page compatibility
                localStorage.setItem('user', JSON.stringify(this.user));
                
                console.log('✅ Restored Supabase session:', this.user.email);
            }
        }
        
        // Listen for Supabase auth changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Supabase auth state changed:', event);
            
            // Ignore INITIAL_SESSION event if we already have a JWT token
            if (event === 'INITIAL_SESSION' && !session) {
                const hasJWT = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                if (hasJWT) {
                    console.log('⚠️ Ignoring INITIAL_SESSION with no session - JWT token exists');
                    return;
                }
            }
            
            // Ignore SIGNED_OUT event if we have a JWT token (backend auth)
            if (event === 'SIGNED_OUT') {
                const hasJWT = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                if (hasJWT) {
                    console.log('⚠️ Ignoring SIGNED_OUT event - JWT token exists');
                    return;
                }
            }
            
            if (session) {
                this.session = session;
                this.user = this.formatUser(session.user);
                
                // Store user data in localStorage for admin page compatibility
                localStorage.setItem('user', JSON.stringify(this.user));
                
                document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: this.user }));
            } else {
                // Only clear state if we don't have a JWT token
                const hasJWT = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                if (!hasJWT) {
                    this.session = null;
                    this.user = null;
                    
                    // Clear localStorage when logged out
                    localStorage.removeItem('user');
                    
                    document.dispatchEvent(new CustomEvent('userLoggedOut'));
                } else {
                    console.log('⚠️ Supabase session cleared but JWT exists - keeping user logged in');
                }
            }
            
            this.updateUI();
        });
        
        this.isReady = true;
        console.log('✅ Auth Manager initialized');
        document.dispatchEvent(new CustomEvent('authReady'));
        this.updateUI();
        
        // Dispatch initial auth state if user is logged in
        if (this.user) {
            console.log('🔐 Dispatching initial userLoggedIn event');
            document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: this.user }));
        }
    }

    formatUser(supabaseUser) {
        return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
            role: supabaseUser.user_metadata?.role || 'member',
            registration_number: supabaseUser.user_metadata?.registration_number,
            phone: supabaseUser.user_metadata?.phone,
            course: supabaseUser.user_metadata?.course,
            year_of_study: supabaseUser.user_metadata?.year_of_study,
            college: supabaseUser.user_metadata?.college,
            created_at: supabaseUser.created_at,
            email_confirmed_at: supabaseUser.email_confirmed_at
        };
    }

    async login(email, password) {
        try {
            console.log('🔐 Attempting Supabase login for:', email);
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ Supabase login failed:', error);
                
                // Handle specific error cases with better messaging
                if (error.message.includes('Invalid login credentials')) {
                    return { 
                        success: false, 
                        error: 'Invalid email or password. Please check your credentials.' 
                    };
                }
                
                if (error.message.includes('Email not confirmed')) {
                    return { 
                        success: false, 
                        error: 'Please verify your email address first. Check your inbox for the verification link.' 
                    };
                }
                
                return { success: false, error: error.message };
            }

            if (data.user && data.session) {
                // Update local state
                this.session = data.session;
                this.user = this.formatUser(data.user);
                
                // Store user data in localStorage for admin page compatibility
                localStorage.setItem('user', JSON.stringify(this.user));
                
                console.log('✅ Supabase login successful');
                document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: this.user }));
                this.updateUI();
                
                return { success: true, user: this.user };
            }
            
            return { success: false, error: 'Login failed - no session received' };
            
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message || 'Network error - please try again' };
        }
    }

    async register(userData) {
        try {
            console.log('🔐 Attempting Supabase registration for:', userData.email);
            
            // Use Supabase Auth for registration
            const { data, error } = await supabaseClient.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        registration_number: userData.registrationNumber,
                        phone: userData.phone,
                        course: userData.course,
                        year_of_study: userData.yearOfStudy,
                        college: userData.college
                    }
                }
            });

            if (error) {
                console.error('❌ Supabase registration failed:', error);
                
                if (error.message.includes('User already registered')) {
                    return { 
                        success: false, 
                        error: 'An account with this email already exists. Please try logging in instead.' 
                    };
                }
                
                return { success: false, error: error.message };
            }

            console.log('✅ Supabase registration successful');
            
            if (data.user && !data.user.email_confirmed_at) {
                return { 
                    success: true, 
                    message: 'Registration successful! Please check your email to verify your account before logging in.',
                    requiresConfirmation: true
                };
            } else {
                return { 
                    success: true, 
                    message: 'Registration successful! You can now log in.',
                    canLoginImmediately: true
                };
            }
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: error.message || 'Network error - please try again' };
        }
    }

    async logout() {
        try {
            this.isLoggingOut = true;

            // Sign out from Supabase first, then clear storage (#19 — reversed order)
            const { error } = await supabaseClient.auth.signOut();
            if (error) console.error('❌ Supabase signOut error:', error);

            // Clear JWT tokens and user data
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('user'); // was missing before

            // Clear local state
            this.session = null;
            this.user = null;

            // Keep AuthState in sync (#48)
            if (window.AuthState) window.AuthState.clear();

            document.dispatchEvent(new CustomEvent('userLoggedOut'));
            this.updateUI();
            window.location.href = '/';

        } catch (error) {
            console.error('❌ Logout error:', error);
            this.session = null;
            this.user = null;
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            if (window.AuthState) window.AuthState.clear();
            document.dispatchEvent(new CustomEvent('userLoggedOut'));
            this.updateUI();
            window.location.href = '/';
        } finally {
            setTimeout(() => { this.isLoggingOut = false; }, 1000);
        }
    }

    isAuthenticated() {
        return !!(this.session && this.user);
    }

    getUser() {
        return this.user;
    }

    getSession() {
        return this.session;
    }

    // Helper to get auth headers for API calls
    getAuthHeaders() {
        if (this.session?.access_token) {
            return {
                'Authorization': `Bearer ${this.session.access_token}`,
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    }

    updateUI() {
        // Update login buttons (but exclude navbar button which is handled separately)
        document.querySelectorAll('[data-auth="login-btn"]:not(#navbar-login-btn)').forEach(btn => {
            if (this.isAuthenticated()) {
                const userName = this.user?.name || 'User';
                // SECURITY FIX: Use safe DOM manipulation instead of innerHTML
                btn.innerHTML = ''; // Clear existing content
                const icon = document.createElement('i');
                icon.className = 'fas fa-user';
                const textNode = document.createTextNode(` ${userName}`);
                btn.appendChild(icon);
                btn.appendChild(textNode);
                btn.onclick = () => window.location.href = '/dashboard';
            } else {
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                btn.onclick = () => window.location.href = '/signin';
            }
        });

        // Update auth-required elements
        document.querySelectorAll('[data-auth="required"]').forEach(el => {
            el.style.display = this.isAuthenticated() ? '' : 'none';
        });

        // Update guest-only elements
        document.querySelectorAll('[data-auth="guest-only"]').forEach(el => {
            el.style.display = this.isAuthenticated() ? 'none' : '';
        });
    }
}

// =============================================================================
// AUTH MODAL UI
// =============================================================================

class AuthModal {
    constructor() {
        this.currentModal = null;
        this.isShowing = false;
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('auth-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'auth-modal-styles';
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 2147483647;
                display: flex !important;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 1 !important;
                animation: none !important;
                pointer-events: auto !important;
            }

            .auth-container {
                background: white !important;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
                max-width: 900px;
                width: 100%;
                max-height: 95vh;
                overflow: hidden;
                position: relative;
                transform: translateY(0) !important;
                animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                z-index: 2147483647;
                opacity: 1 !important;
                display: flex !important;
                visibility: visible !important;
                pointer-events: auto !important;
            }

            .auth-split-container {
                display: flex;
                width: 100%;
                min-height: 600px;
            }

            .auth-brand-panel {
                flex: 1;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 3rem;
                color: white;
                text-align: center;
            }

            .auth-brand-panel::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 80%, rgba(255,255,255,0.15) 0%, transparent 50%);
                opacity: 0.8;
            }

            .brand-content {
                position: relative;
                z-index: 2;
            }

            .brand-logo {
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 2rem;
                font-size: 2rem;
                backdrop-filter: blur(10px);
            }

            .brand-title {
                font-size: 2rem;
                font-weight: 800;
                margin-bottom: 1rem;
                line-height: 1.2;
            }

            .brand-subtitle {
                font-size: 1.1rem;
                opacity: 0.9;
                margin-bottom: 2rem;
                line-height: 1.5;
            }

            .brand-features {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .brand-features li {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
                font-size: 0.95rem;
                opacity: 0.9;
            }

            .brand-features li::before {
                content: '✓';
                background: rgba(255, 255, 255, 0.2);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 1rem;
                font-weight: bold;
                font-size: 0.8rem;
            }

            .auth-form-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                position: relative;
            }

            .auth-header {
                padding: 2.5rem 2.5rem 1.5rem;
                text-align: center;
                background: white;
                color: #1f2937;
                border-radius: 0;
                position: relative;
                overflow: visible;
            }

            .auth-header h2 {
                margin: 0 0 0.5rem;
                font-size: 1.75rem;
                font-weight: 700;
                position: relative;
                z-index: 1;
                color: #1f2937;
            }

            .auth-header p {
                margin: 0;
                opacity: 0.7;
                font-size: 1rem;
                position: relative;
                z-index: 1;
                color: #6b7280;
            }

            .auth-form {
                padding: 0 2.5rem 2.5rem;
                flex: 1;
                overflow-y: auto;
            }

            .form-row {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .form-row .form-group {
                flex: 1;
                margin-bottom: 0;
            }

            .form-group {
                margin-bottom: 1.5rem;
                position: relative;
            }

            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: #374151;
                font-weight: 600;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .required-indicator {
                color: #dc2626;
                margin-left: 2px;
            }

            .form-group input, .form-group select {
                width: 100%;
                padding: 1rem 1.25rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 1rem;
                transition: all 0.3s ease;
                background: #f9fafb;
                box-sizing: border-box;
                font-family: inherit;
            }

            .form-group input:focus, .form-group select:focus {
                outline: none;
                border-color: #667eea;
                background: white;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                transform: translateY(-1px);
            }

            .form-group input::placeholder {
                color: #9ca3af;
                font-style: italic;
            }

            .password-field {
                position: relative;
            }

            .password-toggle {
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: color 0.2s ease;
            }

            .password-toggle:hover {
                color: #374151;
            }

            .form-help {
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 0.25rem;
                font-style: italic;
            }

            .submit-btn {
                width: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
                overflow: hidden;
            }

            .submit-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s ease;
            }

            .submit-btn:hover::before {
                left: 100%;
            }

            .submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            }

            .submit-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .auth-footer {
                padding: 0 2.5rem 2.5rem;
                text-align: center;
                border-top: 1px solid #f3f4f6;
                margin-top: 1rem;
                padding-top: 2rem;
            }

            .auth-footer p {
                margin: 0 0 1rem;
                color: #6b7280;
            }

            .link-btn {
                background: none;
                border: none;
                color: #667eea;
                cursor: pointer;
                font-weight: 600;
                text-decoration: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .link-btn:hover {
                background: rgba(102, 126, 234, 0.1);
                transform: translateY(-1px);
            }

            .close-btn {
                position: absolute;
                top: 1.5rem;
                right: 1.5rem;
                background: rgba(107, 114, 128, 0.1);
                border: none;
                font-size: 1.5rem;
                color: #6b7280;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
                z-index: 10;
            }

            .close-btn:hover {
                background: rgba(107, 114, 128, 0.2);
                transform: scale(1.1);
            }

            .message {
                padding: 1rem 1.25rem;
                border-radius: 12px;
                font-size: 0.875rem;
                margin-bottom: 1.5rem;
                border: 1px solid;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                animation: slideDown 0.3s ease;
            }

            .message.error {
                background: #fef2f2;
                border-color: #fecaca;
                color: #dc2626;
            }

            .message.success {
                background: #f0fdf4;
                border-color: #bbf7d0;
                color: #16a34a;
            }

            .message.info {
                background: #eff6ff;
                border-color: #bfdbfe;
                color: #2563eb;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Mobile responsiveness - stack vertically */
            @media (max-width: 768px) {
                .auth-container {
                    max-width: 95%;
                    margin: 10px;
                    flex-direction: column;
                    max-height: 90vh;
                }
                
                .auth-split-container {
                    flex-direction: column;
                    min-height: auto;
                }
                
                .auth-brand-panel {
                    padding: 2rem 1.5rem;
                    min-height: 200px;
                }
                
                .brand-title {
                    font-size: 1.5rem;
                }
                
                .brand-subtitle {
                    font-size: 1rem;
                }
                
                .brand-features {
                    display: none;
                }
                
                .auth-header {
                    padding: 2rem 1.5rem 1rem;
                }
                
                .auth-form {
                    padding: 0 1.5rem 1.5rem;
                }
                
                .form-row {
                    flex-direction: column;
                    gap: 0;
                }
                
                .form-row .form-group {
                    margin-bottom: 1.5rem;
                }
            }

            body.modal-open {
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    show(mode = 'login') {
        console.log('🔐 AuthModal.show() called with mode:', mode);
        
        // Prevent showing modal during logout process
        if (window.authManager && window.authManager.isLoggingOut) {
            console.log('🚫 Preventing modal show during logout process');
            return;
        }
        
        // Prevent multiple rapid calls
        if (this.isShowing) {
            console.log('⚠️ Modal already showing, ignoring duplicate call');
            return;
        }
        
        this.isShowing = true;
        
        if (this.currentModal) {
            console.log('🔐 Hiding existing modal first');
            this.hide();
        }

        console.log('🔐 Creating modal...');
        const modal = this.createModal(mode);
        
        console.log('🔐 Appending modal to body...');
        document.body.appendChild(modal);
        
        // Force visibility (safety measure) - but don't override container display
        modal.style.opacity = '1';
        modal.style.display = 'flex';
        modal.style.zIndex = '999999';
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        
        this.currentModal = modal;

        console.log('🔐 Modal created and shown');

        // Reset the showing flag after a short delay
        setTimeout(() => {
            this.isShowing = false;
        }, 500);

        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                console.log('🔐 Focusing first input');
                firstInput.focus();
            }
        }, 100);
    }

    hide() {
        
        if (this.currentModal) {
            console.log('🔐 Removing modal from DOM');
            this.currentModal.remove();
            this.currentModal = null;
            // document.body.classList.remove('modal-open');
            document.body.style.overflow = ''; // Restore scrolling
            this.isShowing = false;
            console.log('🔐 Modal hidden successfully');
        } else {
            console.log('⚠️ No modal to hide');
        }
    }

    createModal(mode) {
        console.log('🔐 Creating modal with mode:', mode);
        
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        
        // Add click handler with proper event handling
        modal.addEventListener('click', (e) => {
            // Only hide if clicking directly on the backdrop (not on child elements)
            if (e.target === modal) {
                console.log('🔐 Modal backdrop clicked, hiding modal');
                this.hide();
            }
        });

        modal.innerHTML = `
            <div class="auth-container">
                <div class="auth-split-container">
                    <div class="auth-brand-panel">
                        <div class="brand-content">
                            <div class="brand-logo">
                                <i class="fas fa-rocket"></i>
                            </div>
                            <h1 class="brand-title">JKUAT Innovation Club</h1>
                            <p class="brand-subtitle">Empowering the next generation of innovators and entrepreneurs through collaborative learning and cutting-edge projects.</p>
                            <ul class="brand-features">
                                <li>Access to exclusive workshops and events</li>
                                <li>Collaborate on real-world projects</li>
                                <li>Network with industry professionals</li>
                                <li>Mentorship from experienced developers</li>
                                <li>Career development opportunities</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="auth-form-panel">
                        <button class="close-btn" type="button">&times;</button>
                        
                        <div class="auth-header">
                            <h2>${mode === 'login' ? 'Welcome Back' : 'Join Our Community'}</h2>
                            <p>${mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}</p>
                        </div>

                        <form class="auth-form" method="post" autocomplete="off">
                            <div id="message-container"></div>
                            
                            ${mode === 'register' ? `
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="firstName">First Name <span class="required-indicator">*</span></label>
                                        <input type="text" id="firstName" name="firstName" placeholder="John" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="lastName">Last Name <span class="required-indicator">*</span></label>
                                        <input type="text" id="lastName" name="lastName" placeholder="Doe" required>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="email">Email Address <span class="required-indicator">*</span></label>
                                    <input type="email" id="email" name="email" placeholder="john.doe@students.jkuat.ac.ke" required>
                                    <div class="form-help">Must be a valid JKUAT student email</div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="registrationNumber">Registration Number <span class="required-indicator">*</span></label>
                                        <input type="text" id="registrationNumber" name="registrationNumber" placeholder="EN111-0001/2024" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="phone">Phone Number <span class="required-indicator">*</span></label>
                                        <input type="tel" id="phone" name="phone" placeholder="+254 700 000 000" required>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="course">Course <span class="required-indicator">*</span></label>
                                        <input type="text" id="course" name="course" placeholder="Bachelor of Engineering" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="yearOfStudy">Year of Study <span class="required-indicator">*</span></label>
                                        <select id="yearOfStudy" name="yearOfStudy" required>
                                            <option value="">Select year</option>
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                            <option value="5">Year 5</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="college">College <span class="required-indicator">*</span></label>
                                    <select id="college" name="college" required>
                                        <option value="">Select college</option>
                                        <option value="COETEC">College of Engineering and Technology</option>
                                        <option value="COHES">College of Health Sciences</option>
                                        <option value="CONAS">College of Natural Sciences</option>
                                        <option value="COHRED">College of Human Resource Development</option>
                                        <option value="COAFS">College of Agriculture and Food Sciences</option>
                                    </select>
                                </div>
                                
                                <div class="form-group password-field">
                                    <label for="password">Password <span class="required-indicator">*</span></label>
                                    <input type="password" id="password" name="password" placeholder="Create a strong password" required>
                                    <button type="button" class="password-toggle">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <div class="form-help">Minimum 6 characters with letters and numbers</div>
                                </div>
                                
                                <div class="form-group password-field">
                                    <label for="confirmPassword">Confirm Password <span class="required-indicator">*</span></label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required>
                                    <button type="button" class="password-toggle">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" name="terms" required style="margin-right: 0.5rem;">
                                        I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                                    </label>
                                </div>
                            ` : `
                                <div class="form-group">
                                    <label for="email">Email Address <span class="required-indicator">*</span></label>
                                    <input type="email" id="email" name="email" placeholder="your.email@students.jkuat.ac.ke" required>
                                    <div class="form-help">Use your JKUAT student email address</div>
                                </div>
                                
                                <div class="form-group password-field">
                                    <label for="password">Password <span class="required-indicator">*</span></label>
                                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                                    <button type="button" class="password-toggle">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            `}

                            <button type="submit" class="submit-btn">
                                ${mode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div class="auth-footer">
                            <p>
                                ${mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                                <button type="button" class="link-btn">
                                    ${mode === 'login' ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add CSP-compliant event listeners immediately after DOM creation
        // Close button
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Form submission
        const form = modal.querySelector('.auth-form');
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.handleSubmit(event, mode);
            });
        }

        // Switch mode button
        const switchBtn = modal.querySelector('.link-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => {
                this.hide();
                setTimeout(() => {
                    this.show(mode === 'login' ? 'register' : 'login');
                }, 100);
            });
        }

        // Password toggle buttons
        const passwordToggles = modal.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                this.togglePassword(event);
            });
        });

        console.log('🔐 Modal HTML created successfully');
        return modal;
    }

    switchMode(currentMode) {
        this.hide();
        setTimeout(() => {
            this.show(currentMode === 'login' ? 'register' : 'login');
        }, 100);
    }

    togglePassword(event) {
        const button = event.target.closest('.password-toggle');
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    async handleSubmit(event, mode) {
        // Ensure preventDefault is called immediately
        event.preventDefault();
        event.stopPropagation();
        
        const form = event.target;
        const submitBtn = form.querySelector('.submit-btn');
        const messageContainer = form.querySelector('#message-container');
        
        // Clear previous messages
        messageContainer.innerHTML = '';
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Please wait...';

        try {
            const formData = new FormData(form);
            
            // Validate registration form
            if (mode === 'register') {
                const password = formData.get('password');
                const confirmPassword = formData.get('confirmPassword');
                const terms = formData.get('terms');
                const email = formData.get('email');
                
                // Check email format (must be JKUAT email)
                if (!email.includes('@students.jkuat.ac.ke') && !email.includes('@jkuat.ac.ke')) {
                    throw new Error('Please use a valid JKUAT email address (@students.jkuat.ac.ke or @jkuat.ac.ke)');
                }
                
                // Check password confirmation
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                
                // Check password strength (match backend requirements)
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }
                
                // Basic password strength check
                if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
                    throw new Error('Password must contain both letters and numbers');
                }
                
                // Check terms acceptance
                if (!terms) {
                    throw new Error('You must agree to the Terms of Service and Privacy Policy');
                }
            }
            
            let result;

            if (mode === 'login') {
                result = await authManager.login(
                    formData.get('email'),
                    formData.get('password')
                );
            } else {
                // Combine first and last name
                const firstName = formData.get('firstName');
                const lastName = formData.get('lastName');
                const fullName = `${firstName} ${lastName}`.trim();
                
                result = await authManager.register({
                    name: fullName,
                    email: formData.get('email'),
                    password: formData.get('password'),
                    registrationNumber: formData.get('registrationNumber'),
                    phone: formData.get('phone'),
                    course: formData.get('course'),
                    yearOfStudy: formData.get('yearOfStudy'),
                    college: formData.get('college')
                });
            }

            if (result.success) {
                messageContainer.innerHTML = `
                    <div class="message success">
                        ${mode === 'login' ? 'Signed in successfully!' : 'Account created successfully!'}
                    </div>
                `;

                setTimeout(() => {
                    this.hide();
                    if (mode === 'login') {
                        window.location.reload();
                    }
                }, 1500);
            } else {
                throw new Error(result.error || 'Authentication failed');
            }

        } catch (error) {
            console.error('❌ Form submission error:', error);
            messageContainer.innerHTML = '';
            const errDiv = document.createElement('div');
            errDiv.className = 'message error';
            errDiv.textContent = error.message || 'An error occurred. Please try again.';
            messageContainer.appendChild(errDiv);
        } finally {
            // Reset button state
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
        }

        return false;
    }
}

// =============================================================================
// GLOBAL INITIALIZATION
// =============================================================================

// Early stub functions to prevent errors if called before init
window.showLogin = () => {
    if (!window.authModal) {
        console.warn('Auth system not ready yet');
        return;
    }
    window.authModal.show('login');
};

window.showRegister = () => {
    if (!window.authModal) {
        console.warn('Auth system not ready yet');
        return;
    }
    window.authModal.show('register');
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔐 Initializing Supabase Authentication System...');
    
    try {
        // Initialize Supabase
        console.log('Step 1: Initializing Supabase client...');
        await initializeSupabase();
        console.log('Step 1: ✅ Supabase client initialized');
        
        // Initialize Auth Manager
        console.log('Step 2: Creating AuthManager instance...');
        authManager = new AuthManager();
        console.log('Step 2: ✅ AuthManager instance created');
        
        console.log('Step 3: Initializing AuthManager...');
        await authManager.init();
        console.log('Step 3: ✅ AuthManager initialized');
        
        // Initialize Auth Modal
        console.log('Step 4: Creating AuthModal...');
        window.authModal = new AuthModal();
        console.log('Step 4: ✅ AuthModal created');
        
        // Make everything globally available
        console.log('Step 5: Exposing to window object...');
        window.authManager = authManager;
        window.supabaseClient = supabaseClient;
        
        // Update global helper functions
        window.showLogin = () => authModal.show('login');
        window.showRegister = () => authModal.show('register');
        window.logout = () => authManager.logout();
        window.isAuthenticated = () => authManager.isAuthenticated();
        window.getCurrentUser = () => authManager.getUser();
        window.getAuthHeaders = () => authManager.getAuthHeaders();
        
        console.log('Step 5: ✅ All functions exposed');
        console.log('✅ Supabase Authentication System Ready');
        console.log('🔍 window.authManager:', window.authManager);
        console.log('🔍 authManager.isAuthenticated:', typeof window.authManager?.isAuthenticated);
        console.log('🔍 authManager.getUser:', typeof window.authManager?.getUser);
        
    } catch (error) {
        console.error('❌ Failed to initialize auth system:', error);
        console.error('❌ Error stack:', error.stack);
    }
});

console.log('🔐 Supabase Authentication System Loaded');