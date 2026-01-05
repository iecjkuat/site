// JKUAT Innovation Club - Opportunities Page Authentication Module

class OpportunitiesAuthManager {
    constructor() {
        this.currentUser = null;
        this.loginModal = null;
        this.registerModal = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔐 Initializing OpportunitiesAuthManager...');
        this.checkAuthState();
        this.createModals();
        this.bindEvents();
        this.isInitialized = true;
        
        // Debug: Check if buttons exist after a delay
        setTimeout(() => {
            this.debugButtonExistence();
            this.bindDirectEvents();
        }, 1000);
        
        console.log('✅ OpportunitiesAuthManager initialized successfully');
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
        const authButtons = document.getElementById('authButtons');
        if (!authButtons) return;

        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="glass-button" onclick="window.location.href='/dashboard'">
                    <i class="fas fa-user"></i>${this.currentUser.name}
                </button>
                <button class="glass-button" onclick="opportunitiesAuthManager.logout()">
                    <i class="fas fa-sign-out-alt"></i>Logout
                </button>
            </div>
        `;
    }

    createModals() {
        console.log('Creating modals...');
        this.createLoginModal();
        this.createRegisterModal();
        console.log('Modals created:', {
            loginModal: !!this.loginModal,
            registerModal: !!this.registerModal
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
        this.loginModal.className = 'modal-backdrop hidden';
        this.loginModal.style.display = 'none'; // Ensure it starts hidden
        this.loginModal.innerHTML = `
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

                    <button type="submit" id="loginSubmitBtn" class="btn-primary" style="width: 100%; justify-content: center;">
                        <i class="fas fa-sign-in-alt"></i>Sign In
                    </button>
                </form>

                <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                        Don't have an account? 
                        <a href="#" id="loginToRegisterLink" style="color: #10b981; text-decoration: none; font-weight: 600;">Join the club</a>
                    </p>
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
        this.registerModal.className = 'modal-backdrop hidden';
        this.registerModal.style.display = 'none'; // Ensure it starts hidden
        this.registerModal.innerHTML = `
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
                            <i class="fas fa-lock" style="margin-right: 0.5rem; color: #10b981;"></i>Password
                        </label>
                        <input type="password" name="password" placeholder="Create a strong password" required minlength="6" class="glass-input">
                    </div>

                    <button type="submit" id="registerSubmitBtn" class="btn-primary" style="width: 100%; justify-content: center;">
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
        `;
        document.body.appendChild(this.registerModal);
        console.log('Register modal created and appended to body');
    }

    bindEvents() {
        console.log('Binding auth events...');
        
        // Use event delegation to handle dynamically loaded buttons
        document.addEventListener('click', (e) => {
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
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideLogin();
                this.hideRegister();
            }
        });
        
        console.log('Auth events bound successfully');
    }

    bindDirectEvents() {
        console.log('🔗 Attempting to bind direct events...');
        
        const buttons = [
            { id: 'loginBtn', action: 'login' },
            { id: 'registerBtn', action: 'register' }
        ];

        let boundCount = 0;
        buttons.forEach(({ id, action }) => {
            const element = document.getElementById(id);
            if (element && !this.currentUser) {
                console.log(`✅ Binding direct event to ${id}`);
                
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
    }

    handleClick(e) {
        const targetId = e.target.id;
        
        console.log(`handleClick called for: ${targetId} (${e.target.tagName})`);
        
        // Close buttons
        if (targetId === 'closeLoginBtn') {
            e.preventDefault();
            this.hideLogin();
        } else if (targetId === 'closeRegisterBtn') {
            e.preventDefault();
            this.hideRegister();
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
        }
        
        // Auth buttons (only if not logged in)
        else if (!this.currentUser) {
            if (['loginBtn'].includes(targetId)) {
                e.preventDefault();
                console.log('Showing login modal for:', targetId);
                this.showLogin();
            } else if (['registerBtn'].includes(targetId)) {
                e.preventDefault();
                console.log('Showing register modal for:', targetId);
                this.showRegister();
            }
        }
    }

    showLogin() {
        console.log('showLogin called');
        if (this.loginModal) {
            this.loginModal.classList.remove('hidden');
            this.loginModal.style.display = 'flex';
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

    async handleLogin(event) {
        const form = event.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('#loginSubmitBtn');
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Signing In...';
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
                
                alert('Login successful!');
                location.reload();
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
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Creating Account...';
        submitBtn.disabled = true;
        
        const registerData = {
            email: formData.get('email'),
            password: formData.get('password'),
            registrationNumber: formData.get('registrationNumber'),
            name: formData.get('firstName') + ' ' + formData.get('lastName')
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
            
            if (data.user) {
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

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            this.currentUser = null;
            location.reload();
        }
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
document.addEventListener('DOMContentLoaded', () => {
    window.opportunitiesAuthManager = new OpportunitiesAuthManager();
});

// Make available globally
window.OpportunitiesAuthManager = OpportunitiesAuthManager;