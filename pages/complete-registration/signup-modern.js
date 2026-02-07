/**
 * Modern Signup Form JavaScript
 * Handles user registration with validation
 */

class ModernSignup {
    constructor() {
        this.form = document.getElementById('signupForm');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSocialButtons();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        emailInput.addEventListener('blur', () => this.validateEmail(emailInput.value));
        passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput.value));

        // Enter key handling
        this.form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit();
            }
        });
    }

    setupSocialButtons() {
        const socialButtons = document.querySelectorAll('.social-btn');
        
        socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = btn.classList.contains('facebook') ? 'Facebook' :
                               btn.classList.contains('google') ? 'Google' : 'Twitter';
                this.handleSocialLogin(platform);
            });
        });
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // At least 8 characters, 1 letter, 1 number
        return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    }

    async handleSubmit() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const submitBtn = document.querySelector('.signup-btn');

        // Remove any existing messages
        this.removeMessage();

        // Validation
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showMessage('Password must be at least 8 characters with letters and numbers', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showMessage('Please agree to the terms of service', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Registration successful! Redirecting...', 'success');
                
                // Store auth token if provided
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Redirect after 1.5 seconds
                setTimeout(() => {
                    window.location.href = data.redirectUrl || '/complete-profile';
                }, 1500);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    async handleSocialLogin(platform) {
        this.showMessage(`${platform} login coming soon!`, 'error');
        
        // TODO: Implement social login
        // Example for Google OAuth:
        /*
        try {
            const response = await fetch(`/api/auth/oauth/${platform.toLowerCase()}`, {
                method: 'GET'
            });
            
            const data = await response.json();
            
            if (data.authUrl) {
                window.location.href = data.authUrl;
            }
        } catch (error) {
            console.error('Social login error:', error);
            this.showMessage('Social login failed. Please try again.', 'error');
        }
        */
    }

    showMessage(text, type = 'error') {
        this.removeMessage();

        const message = document.createElement('div');
        message.className = `message ${type} show`;
        message.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${text}
        `;

        this.form.insertBefore(message, this.form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeMessage();
        }, 5000);
    }

    removeMessage() {
        const existingMessage = this.form.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernSignup();
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';
