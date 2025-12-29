// JKUAT Innovation Club - Authentication Module

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loginModal = null;
        this.registerModal = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔐 Initializing AuthManager...');
        this.checkAuthState();
        this.createModals();
        this.bindEvents();
        this.isInitialized = true;
        
        // Debug: Check if buttons exist after a delay
        setTimeout(() => {
            this.debugButtonExistence();
            this.bindDirectEvents();
        }, 1000);
        
        console.log('✅ AuthManager initialized successfully');
    }
    
    debugButtonExistence() {
        const buttons = ['loginBtn', 'registerBtn', 'heroRegisterBtn', 'joinMembershipBtn'];
        console.log('=== Button Existence Check ===');
        buttons.forEach(id => {
            const element = document.getElementById(id);
            console.log(`${id}:`, element ? 'EXISTS' : 'NOT FOUND');
        });
        
        // Also check if modals were created
        console.log('=== Modal Check ===');
        console.log('loginModal:', !!this.loginModal);
        console.log('registerModal:', !!this.registerModal);
    }

    checkAuthState() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                this.updateUIForLoggedInUser();
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
    }

    updateUIForLoggedInUser() {
        const elements = {
            loginBtn: document.getElementById('loginBtn'),
            registerBtn: document.getElementById('registerBtn'),
            mobileLoginBtn: document.getElementById('mobileLoginBtn'),
            mobileRegisterBtn: document.getElementById('mobileRegisterBtn')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (!element) return;

            if (key.includes('login')) {
                element.innerHTML = `<i class="fas fa-user" style="margin-right: 0.5rem;"></i>${this.currentUser.name}`;
                element.onclick = () => window.location.href = '/dashboard';
            } else if (key.includes('register')) {
                element.innerHTML = `<i class="fas fa-tachometer-alt" style="margin-right: 0.5rem;"></i>Dashboard`;
                element.onclick = () => window.location.href = '/dashboard';
            }
        });
    }

    createModals() {
        console.log('Creating modals...');
        this.createLoginModal();
        this.createRegisterModal();
        this.createEmailVerificationModal();
        this.createPasswordResetModal();
        console.log('Modals created:', {
            loginModal: !!this.loginModal,
            registerModal: !!this.registerModal,
            emailVerificationModal: !!this.emailVerificationModal,
            passwordResetModal: !!this.passwordResetModal
        });
    }

    createLoginModal() {
        if (document.getElementById('loginModal')) {
            console.log('Login modal already exists');
            return;
        }

        console.log('Creating login modal...');
        this.loginModal = document.createElement('div');
        this.loginModal.id = 'loginModal';
        this.loginModal.className = 'hidden';
        this.loginModal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content" style="max-width: 420px;">
                    <button id="closeLoginBtn" class="glass-button" style="position: absolute; top: 1rem; right: 1rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">&times;</button>
                    
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(59, 130, 246, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                            <i class="fas fa-sign-in-alt" style="font-size: 1.5rem; color: #3b82f6;"></i>
                        </div>
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Welcome Back</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Sign in to your account</p>
                    </div>

                    <form id="loginForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-envelope" style="margin-right: 0.5rem; color: #3b82f6;"></i>Email or Registration Number
                            </label>
                            <input type="text" name="identifier" placeholder="Enter your email or registration number" required class="glass-input">
                        </div>
                        
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-lock" style="margin-right: 0.5rem; color: #3b82f6;"></i>Password
                            </label>
                            <input type="password" name="password" placeholder="Enter your password" required class="glass-input">
                        </div>

                        <button type="submit" id="loginSubmitBtn" class="glass-button primary" style="width: 100%; justify-content: center;">
                            <i class="fas fa-sign-in-alt"></i>Sign In
                        </button>
                    </form>

                    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                            Don't have an account? 
                            <a href="#" id="loginToRegisterLink" style="color: #10b981; text-decoration: none; font-weight: 600;">Join the club</a>
                        </p>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-top: 0.5rem;">
                            Forgot your password? 
                            <a href="#" id="forgotPasswordLink" style="color: #f59e0b; text-decoration: none; font-weight: 600;">Reset it here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.loginModal);
        console.log('Login modal created and appended to body');
    }

    createRegisterModal() {
        if (document.getElementById('registerModal')) {
            console.log('Register modal already exists');
            return;
        }

        console.log('Creating register modal...');
        this.registerModal = document.createElement('div');
        this.registerModal.id = 'registerModal';
        this.registerModal.className = 'hidden';
        this.registerModal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <button id="closeRegisterBtn" class="glass-button" style="position: absolute; top: 1rem; right: 1rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">&times;</button>
                    
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(16, 185, 129, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
                            <i class="fas fa-user-plus" style="font-size: 1.5rem; color: #10b981;"></i>
                        </div>
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Join the Innovation</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Become part of JKUAT's premier innovation community</p>
                    </div>

                    <form id="registerForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                    <i class="fas fa-user" style="margin-right: 0.5rem; color: #10b981;"></i>First Name
                                </label>
                                <input type="text" name="firstName" placeholder="John" required class="glass-input">
                            </div>
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                    <i class="fas fa-user" style="margin-right: 0.5rem; color: #10b981;"></i>Last Name
                                </label>
                                <input type="text" name="lastName" placeholder="Doe" required class="glass-input">
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-envelope" style="margin-right: 0.5rem; color: #10b981;"></i>Email Address
                            </label>
                            <input type="email" name="email" placeholder="john.doe@student.jkuat.ac.ke" required class="glass-input">
                        </div>

                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-id-card" style="margin-right: 0.5rem; color: #10b981;"></i>Student Registration Number
                            </label>
                            <input type="text" name="registrationNumber" placeholder="SCT211-0000/2023" required class="glass-input">
                        </div>

                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-graduation-cap" style="margin-right: 0.5rem; color: #10b981;"></i>Course/Program
                            </label>
                            <input type="text" name="course" placeholder="Computer Science" required class="glass-input">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                    <i class="fas fa-phone" style="margin-right: 0.5rem; color: #10b981;"></i>Phone Number
                                </label>
                                <input type="tel" name="phone" placeholder="+254700000000" required class="glass-input">
                            </div>
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                    <i class="fas fa-calendar" style="margin-right: 0.5rem; color: #10b981;"></i>Year of Study
                                </label>
                                <select name="yearOfStudy" required class="glass-input">
                                    <option value="">Select Year</option>
                                    <option value="1">Year 1</option>
                                    <option value="2">Year 2</option>
                                    <option value="3">Year 3</option>
                                    <option value="4">Year 4</option>
                                    <option value="5">Year 5</option>
                                    <option value="6">Year 6</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-university" style="margin-right: 0.5rem; color: #10b981;"></i>College/School
                            </label>
                            <input type="text" name="college" placeholder="College of Engineering and Technology" required class="glass-input">
                        </div>
                        
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-lock" style="margin-right: 0.5rem; color: #10b981;"></i>Password
                            </label>
                            <input type="password" name="password" placeholder="Create a strong password" required minlength="6" class="glass-input">
                        </div>

                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1rem;">
                            <label style="display: flex; align-items: flex-start; color: rgba(255, 255, 255, 0.8); cursor: pointer; font-size: 0.875rem; line-height: 1.5;">
                                <input type="checkbox" name="agreeTerms" required style="margin-right: 0.75rem; margin-top: 0.125rem; accent-color: #10b981;">
                                I agree to the <a href="#" style="color: #10b981; text-decoration: none;">Terms of Service</a> and <a href="#" style="color: #10b981; text-decoration: none;">Privacy Policy</a>, and I confirm that I am a current JKUAT student.
                            </label>
                        </div>

                        <button type="submit" id="registerSubmitBtn" class="glass-button primary" style="width: 100%; justify-content: center;">
                            <i class="fas fa-rocket"></i>Join the Innovation Club
                        </button>
                    </form>

                    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                            Already have an account? 
                            <a href="#" id="registerToLoginLink" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Sign in here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.registerModal);
        console.log('Register modal created and appended to body');
    }

    createEmailVerificationModal() {
        if (document.getElementById('emailVerificationModal')) return;

        this.emailVerificationModal = document.createElement('div');
        this.emailVerificationModal.id = 'emailVerificationModal';
        this.emailVerificationModal.className = 'hidden';
        this.emailVerificationModal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content" style="max-width: 420px;">
                    <button id="closeEmailVerificationBtn" class="glass-button" style="position: absolute; top: 1rem; right: 1rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">&times;</button>
                    
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(245, 158, 11, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);">
                            <i class="fas fa-envelope-open" style="font-size: 1.5rem; color: #f59e0b;"></i>
                        </div>
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Check Your Email</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">We've sent a verification link to your email address</p>
                    </div>

                    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; line-height: 1.6; margin-bottom: 1rem;">
                            <strong>Email sent to:</strong><br>
                            <span id="verificationEmail" style="color: #f59e0b; font-weight: 600;"></span>
                        </p>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; line-height: 1.6;">
                            Click the verification link in your email to activate your account. The link will expire in 24 hours.
                        </p>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <button id="resendVerificationBtn" class="glass-button" style="width: 100%; justify-content: center;">
                            <i class="fas fa-paper-plane"></i>Resend Verification Email
                        </button>
                        
                        <button id="backToLoginBtn" class="glass-button primary" style="width: 100%; justify-content: center;">
                            <i class="fas fa-arrow-left"></i>Back to Login
                        </button>
                    </div>

                    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; line-height: 1.5;">
                            <i class="fas fa-info-circle" style="margin-right: 0.25rem;"></i>
                            Check your spam folder if you don't see the email within a few minutes.
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.emailVerificationModal);
    }

    createPasswordResetModal() {
        if (document.getElementById('passwordResetModal')) return;

        this.passwordResetModal = document.createElement('div');
        this.passwordResetModal.id = 'passwordResetModal';
        this.passwordResetModal.className = 'hidden';
        this.passwordResetModal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content" style="max-width: 420px;">
                    <button id="closePasswordResetBtn" class="glass-button" style="position: absolute; top: 1rem; right: 1rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">&times;</button>
                    
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(239, 68, 68, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);">
                            <i class="fas fa-key" style="font-size: 1.5rem; color: #ef4444;"></i>
                        </div>
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Reset Password</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Enter your email to receive a password reset link</p>
                    </div>

                    <form id="passwordResetForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-envelope" style="margin-right: 0.5rem; color: #ef4444;"></i>Email Address
                            </label>
                            <input type="email" name="email" placeholder="Enter your email address" required class="glass-input">
                        </div>

                        <button type="submit" id="passwordResetSubmitBtn" class="glass-button primary" style="width: 100%; justify-content: center;">
                            <i class="fas fa-paper-plane"></i>Send Reset Link
                        </button>
                    </form>

                    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                            Remember your password? 
                            <a href="#" id="resetToLoginLink" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Sign in here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.passwordResetModal);
    }

    bindEvents() {
        console.log('Binding auth events...');
        
        // Use event delegation to handle dynamically loaded buttons
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target.id, e.target.tagName, e.target.className);
            this.handleClick(e);
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e);
            } else if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister(e);
            } else if (e.target.id === 'passwordResetForm') {
                e.preventDefault();
                this.handlePasswordReset(e);
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideLogin();
                this.hideRegister();
                this.hideEmailVerification();
                this.hidePasswordReset();
            }
        });
        
        // Also try to bind directly to existing buttons after a delay
        setTimeout(() => {
            this.bindDirectEvents();
        }, 500);
        
        console.log('Auth events bound successfully');
    }

    bindDirectEvents() {
        console.log('🔗 Attempting to bind direct events...');
        
        const buttons = [
            { id: 'loginBtn', action: 'login' },
            { id: 'registerBtn', action: 'register' },
            { id: 'mobileLoginBtn', action: 'login' },
            { id: 'mobileRegisterBtn', action: 'register' },
            { id: 'heroRegisterBtn', action: 'register' },
            { id: 'joinMembershipBtn', action: 'register' }
        ];

        let boundCount = 0;
        buttons.forEach(({ id, action }) => {
            const element = document.getElementById(id);
            if (element && !this.currentUser) {
                console.log(`✅ Binding direct event to ${id}`);
                
                // Remove any existing listeners
                element.removeEventListener('click', this.handleButtonClick);
                
                // Add new listener
                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 Direct event triggered for ${id} - ${action}`);
                    if (action === 'login') {
                        this.showLogin();
                    } else if (action === 'register') {
                        this.showRegister();
                    }
                };
                
                element.addEventListener('click', handler);
                element.style.cursor = 'pointer';
                boundCount++;
            }
        });
        
        console.log(`🎯 Successfully bound ${boundCount} direct button events`);
        
        // Also try to bind after additional delays
        setTimeout(() => this.bindDirectEvents(), 2000);
        setTimeout(() => this.bindDirectEvents(), 5000);
    }

    // Method to manually trigger auth actions (for debugging)
    triggerLogin() {
        console.log('🔐 Manual login trigger');
        this.showLogin();
    }

    triggerRegister() {
        console.log('📝 Manual register trigger');
        this.showRegister();
    }

    handleClick(e) {
        const targetId = e.target.id;
        const targetClass = e.target.className;
        
        console.log(`handleClick called for: ${targetId} (${e.target.tagName}) - classes: ${targetClass}`);
        
        // Close buttons
        if (targetId === 'closeLoginBtn') {
            e.preventDefault();
            this.hideLogin();
        } else if (targetId === 'closeRegisterBtn') {
            e.preventDefault();
            this.hideRegister();
        } else if (targetId === 'closeEmailVerificationBtn') {
            e.preventDefault();
            this.hideEmailVerification();
        } else if (targetId === 'closePasswordResetBtn') {
            e.preventDefault();
            this.hidePasswordReset();
        }
        
        // Switch between modals
        else if (targetId === 'loginToRegisterLink') {
            e.preventDefault();
            this.hideLogin();
            this.showRegister();
        } else if (targetId === 'registerToLoginLink') {
            e.preventDefault();
            this.hideRegister();
            this.showLogin();
        } else if (targetId === 'forgotPasswordLink') {
            e.preventDefault();
            this.hideLogin();
            this.showPasswordReset();
        } else if (targetId === 'resetToLoginLink') {
            e.preventDefault();
            this.hidePasswordReset();
            this.showLogin();
        } else if (targetId === 'backToLoginBtn') {
            e.preventDefault();
            this.hideEmailVerification();
            this.showLogin();
        }
        
        // Email verification actions
        else if (targetId === 'resendVerificationBtn') {
            e.preventDefault();
            this.handleResendVerification();
        }
        
        // Auth buttons (only if not logged in)
        else if (!this.currentUser) {
            if (['loginBtn', 'mobileLoginBtn'].includes(targetId)) {
                e.preventDefault();
                console.log('Showing login modal for:', targetId);
                this.showLogin();
            } else if (['registerBtn', 'mobileRegisterBtn', 'heroRegisterBtn', 'joinMembershipBtn'].includes(targetId)) {
                e.preventDefault();
                console.log('Showing register modal for:', targetId);
                this.showRegister();
            }
        }
        
        // Other action buttons
        else if (targetId === 'viewEventsBtn') {
            window.location.href = '/events';
        } else if (targetId === 'heroLearnMoreBtn') {
            // Scroll to about section
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    showLogin() {
        console.log('showLogin called');
        if (this.loginModal) {
            this.loginModal.classList.remove('hidden');
            this.loginModal.style.display = 'flex';
            this.loginModal.style.position = 'fixed';
            this.loginModal.style.top = '0';
            this.loginModal.style.left = '0';
            this.loginModal.style.width = '100%';
            this.loginModal.style.height = '100%';
            this.loginModal.style.zIndex = '9999';
            console.log('Login modal should be visible now');
        } else {
            console.log('Login modal not found!');
        }
    }

    hideLogin() {
        console.log('hideLogin called');
        if (this.loginModal) {
            this.loginModal.classList.add('hidden');
            this.loginModal.style.display = 'none';
        }
    }

    showRegister() {
        console.log('showRegister called');
        if (this.registerModal) {
            this.registerModal.classList.remove('hidden');
            this.registerModal.style.display = 'flex';
            this.registerModal.style.position = 'fixed';
            this.registerModal.style.top = '0';
            this.registerModal.style.left = '0';
            this.registerModal.style.width = '100%';
            this.registerModal.style.height = '100%';
            this.registerModal.style.zIndex = '9999';
            console.log('Register modal should be visible now');
        } else {
            console.log('Register modal not found!');
        }
    }

    hideRegister() {
        console.log('hideRegister called');
        if (this.registerModal) {
            this.registerModal.classList.add('hidden');
            this.registerModal.style.display = 'none';
        }
    }

    showEmailVerification() {
        if (this.emailVerificationModal) {
            this.emailVerificationModal.classList.remove('hidden');
        }
    }

    hideEmailVerification() {
        if (this.emailVerificationModal) {
            this.emailVerificationModal.classList.add('hidden');
        }
    }

    showPasswordReset() {
        if (this.passwordResetModal) {
            this.passwordResetModal.classList.remove('hidden');
        }
    }

    hidePasswordReset() {
        if (this.passwordResetModal) {
            this.passwordResetModal.classList.add('hidden');
        }
    }

    showEmailVerificationMessage(email) {
        const emailElement = document.getElementById('verificationEmail');
        if (emailElement) {
            emailElement.textContent = email;
        }
        this.currentVerificationEmail = email;
        this.showEmailVerification();
    }

    async handleLogin(event) {
        const form = event.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('#loginSubmitBtn');
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner"></div>Signing In...';
        submitBtn.disabled = true;
        
        const loginData = {
            identifier: formData.get('identifier'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Check if profile is completed
                if (!data.user.profileCompleted) {
                    alert('Login successful! Please complete your profile to get started.');
                    window.location.href = '/complete-profile';
                } else {
                    alert('Login successful!');
                    location.reload();
                }
            } else if (data.requiresVerification) {
                // User exists but email not verified
                this.hideLogin();
                this.showEmailVerificationMessage(data.email);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(event) {
        const form = event.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('#registerSubmitBtn');
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner"></div>Creating Account...';
        submitBtn.disabled = true;
        
        const registerData = {
            email: formData.get('email'),
            password: formData.get('password'),
            registrationNumber: formData.get('registrationNumber'),
            name: formData.get('firstName') + ' ' + formData.get('lastName'),
            phone: formData.get('phone'),
            course: formData.get('course'),
            yearOfStudy: parseInt(formData.get('yearOfStudy')),
            college: formData.get('college')
        };
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });
            
            const data = await response.json();
            
            if (data.user && data.requiresVerification) {
                // Show email verification message
                this.showEmailVerificationMessage(data.user.email);
                this.hideRegister();
            } else if (data.user) {
                alert('Registration successful! You can now login with your credentials.');
                
                this.hideRegister();
                this.showLogin();
                
                const loginForm = this.loginModal.querySelector('#loginForm');
                loginForm.querySelector('input[name="identifier"]').value = formData.get('email');
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handlePasswordReset(event) {
        const form = event.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('#passwordResetSubmitBtn');
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner"></div>Sending Reset Link...';
        submitBtn.disabled = true;
        
        const resetData = {
            email: formData.get('email')
        };
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resetData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Password reset link sent! Check your email for instructions.');
                this.hidePasswordReset();
                this.showLogin();
            } else {
                throw new Error(data.message || 'Failed to send reset link');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Failed to send reset link: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleResendVerification() {
        if (!this.currentVerificationEmail) {
            alert('No email address found. Please try registering again.');
            return;
        }

        const resendBtn = document.getElementById('resendVerificationBtn');
        const originalText = resendBtn.innerHTML;
        resendBtn.innerHTML = '<div class="spinner"></div>Sending...';
        resendBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: this.currentVerificationEmail })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Verification email resent! Check your inbox.');
            } else {
                throw new Error(data.message || 'Failed to resend verification email');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            alert('Failed to resend verification email: ' + error.message);
        } finally {
            resendBtn.innerHTML = originalText;
            resendBtn.disabled = false;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.currentUser = null;
        location.reload();
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }

    getToken() {
        return localStorage.getItem('authToken');
    }
}

// Initialize auth manager when DOM is loaded
let authManager;
// Don't auto-initialize - let the page control when to initialize
// document.addEventListener('DOMContentLoaded', () => {
//     authManager = new AuthManager();
// });

// Global functions for manual testing
window.testLogin = function() {
    console.log('🧪 Testing login modal...');
    if (window.authManager) {
        window.authManager.triggerLogin();
    } else {
        console.error('❌ AuthManager not available');
    }
};

window.testRegister = function() {
    console.log('🧪 Testing register modal...');
    if (window.authManager) {
        window.authManager.triggerRegister();
    } else {
        console.error('❌ AuthManager not available');
    }
};

// Make AuthManager available globally
window.AuthManager = AuthManager;