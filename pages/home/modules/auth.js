// JKUAT Innovation Club - Authentication Module

class AuthManager {
    constructor(homeInstance) {
        this.home = homeInstance;
    }

    checkAuthState() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                this.updateNavForLoggedInUser(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
    }

    updateNavForLoggedInUser(user) {
        const navLoginBtn = document.getElementById('navLoginBtn');
        const navJoinBtn = document.getElementById('navJoinBtn');
        
        if (navLoginBtn && navJoinBtn) {
            // Replace login/join buttons with user menu
            const navAuth = document.querySelector('.nav-auth');
            navAuth.innerHTML = `
                <a href="/dashboard" class="glass-button">
                    <i class="fas fa-tachometer-alt"></i>Dashboard
                </a>
                <button class="glass-button" id="navLogoutBtn">
                    <i class="fas fa-sign-out-alt"></i>Logout
                </button>
            `;
            
            // Bind logout event
            const logoutBtn = document.getElementById('navLogoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.handleLogout();
                });
            }
        }
    }

    handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.home.showToast('Logged out successfully!', 'success');
        
        // Restore original navigation
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin: 0;">Sign In</h2>
                    <button class="btn-glass" style="padding: 0.5rem;" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="loginForm" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Email or Student ID</label>
                        <input type="text" name="identifier" class="glass-input" placeholder="Enter your email or student ID" required>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Password</label>
                        <input type="password" name="password" class="glass-input" placeholder="Enter your password" required>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                            <input type="checkbox" name="remember" style="accent-color: #10b981;">
                            Remember me
                        </label>
                        <a href="#" onclick="event.preventDefault(); window.homePage.authManager.showForgotPasswordModal();" style="color: #10b981; text-decoration: none; font-size: 0.875rem;">
                            Forgot password?
                        </a>
                    </div>
                    
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">Don't have an account?</p>
                    <button onclick="window.homePage.authManager.showRegistrationModal(); this.closest('.modal-backdrop').remove();" class="btn-glass" style="width: 100%;">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = modal.querySelector('#loginForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(form, modal);
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input[name="identifier"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    showForgotPasswordModal() {
        // Remove existing modals
        document.querySelectorAll('.modal-backdrop').forEach(modal => modal.remove());
        
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin: 0;">Reset Password</h2>
                    <button class="btn-glass" style="padding: 0.5rem;" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem;">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form id="forgotPasswordForm" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Email Address</label>
                        <input type="email" name="email" class="glass-input" placeholder="Enter your email address" required>
                    </div>
                    
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-paper-plane"></i> Send Reset Link
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                    <button onclick="window.homePage.authManager.showLoginModal(); this.closest('.modal-backdrop').remove();" class="btn-glass">
                        <i class="fas fa-arrow-left"></i> Back to Sign In
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = modal.querySelector('#forgotPasswordForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword(form, modal);
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Focus on email input
        setTimeout(() => {
            const emailInput = modal.querySelector('input[name="email"]');
            if (emailInput) emailInput.focus();
        }, 100);
    }

    showRegistrationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin: 0;">Join JKUAT Innovation Club</h2>
                    <button class="btn-glass" style="padding: 0.5rem;" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem;">
                    Ready to start your innovation journey? Join our community of 500+ students transforming ideas into reality.
                </p>
                
                <form id="registrationForm" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">First Name</label>
                            <input type="text" name="firstName" class="glass-input" placeholder="Enter your first name" required>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Last Name</label>
                            <input type="text" name="lastName" class="glass-input" placeholder="Enter your last name" required>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Email Address</label>
                        <input type="email" name="email" class="glass-input" placeholder="Enter your email address" required>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Student ID</label>
                        <input type="text" name="studentId" class="glass-input" placeholder="Enter your JKUAT student ID" required>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Phone Number</label>
                        <input type="tel" name="phone" class="glass-input" placeholder="Enter your phone number" required>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Course/Program</label>
                        <select name="course" class="glass-input" required>
                            <option value="">Select your course</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Business Administration">Business Administration</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Password</label>
                        <input type="password" name="password" class="glass-input" placeholder="Create a strong password" required>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Confirm Password</label>
                        <input type="password" name="confirmPassword" class="glass-input" placeholder="Confirm your password" required>
                    </div>
                    
                    <div style="margin: 1rem 0;">
                        <label style="display: flex; align-items: flex-start; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; line-height: 1.4;">
                            <input type="checkbox" name="terms" style="accent-color: #10b981; margin-top: 0.2rem;" required>
                            I agree to the <a href="/terms" style="color: #10b981; text-decoration: none;">Terms of Service</a> and <a href="/privacy" style="color: #10b981; text-decoration: none;">Privacy Policy</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">Already have an account?</p>
                    <button onclick="window.homePage.authManager.showLoginModal(); this.closest('.modal-backdrop').remove();" class="btn-glass" style="width: 100%;">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = modal.querySelector('#registrationForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistrationSubmit(form, modal);
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input[name="firstName"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    async handleLogin(form, modal) {
        const formData = new FormData(form);
        const identifier = formData.get('identifier');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        try {
            // For development, create a mock successful login
            const mockUser = {
                id: 'user-' + Date.now(),
                firstName: 'John',
                lastName: 'Doe',
                name: 'John Doe',
                email: identifier.includes('@') ? identifier : `${identifier}@student.jkuat.ac.ke`,
                studentId: identifier.includes('@') ? 'SCT211-0001/2023' : identifier,
                course: 'Computer Science',
                role: 'Member',
                isMember: true,
                created_at: new Date().toISOString(),
                avatar: null
            };
            
            const mockToken = 'auth-token-' + Date.now();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Store auth data
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            // Show success message
            this.home.showToast('Login successful! Redirecting to dashboard...', 'success');
            
            // Close modal and redirect
            document.body.removeChild(modal);
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            this.home.showToast(error.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleForgotPassword(form, modal) {
        const formData = new FormData(form);
        const email = formData.get('email');
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.home.showToast('Password reset link sent to your email!', 'success');
            document.body.removeChild(modal);
            
        } catch (error) {
            console.error('Forgot password error:', error);
            this.home.showToast(error.message || 'Failed to send reset link. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegistrationSubmit(form, modal) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            this.home.showToast('Passwords do not match!', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;
        
        try {
            // For development, create a mock successful registration
            const mockUser = {
                id: 'user-' + Date.now(),
                firstName: data.firstName,
                lastName: data.lastName,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                studentId: data.studentId,
                phone: data.phone,
                course: data.course,
                role: 'Member',
                isMember: false, // New users need to pay membership fee
                created_at: new Date().toISOString(),
                avatar: null
            };
            
            const mockToken = 'auth-token-' + Date.now();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Store auth data
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            this.home.showToast('Account created successfully! Welcome to JKUAT Innovation Club!', 'success');
            document.body.removeChild(modal);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            this.home.showToast(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    handleRegistration() {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            window.location.href = '/dashboard';
        } else {
            // Show registration modal or redirect to login
            this.showRegistrationModal();
        }
    }

    handleEventRegistration() {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            this.home.showToast('Registration successful! Check your email for details.', 'success');
        } else {
            this.showRegistrationModal();
        }
    }
}

window.AuthManager = AuthManager;