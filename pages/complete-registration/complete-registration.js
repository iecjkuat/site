/**
 * Complete Registration Page JavaScript
 * Handles user invitation verification and profile completion
 */

class CompleteRegistration {
    constructor() {
        this.token = null;
        this.userData = null;
        this.init();
    }

    init() {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get('token');

        if (!this.token) {
            this.showError('Invalid invitation link. Please check your email for the correct link.');
            return;
        }

        // Verify invitation token
        this.verifyInvitation();

        // Setup event listeners
        this.setupEventListeners();
    }

    async verifyInvitation() {
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error-container');
        const formEl = document.getElementById('registrationForm');

        loadingEl.style.display = 'block';

        try {
            const response = await fetch('/api/auth/verify-invitation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: this.token })
            });

            const data = await response.json();

            if (response.ok) {
                this.userData = data.user;
                this.populateForm();
                loadingEl.style.display = 'none';
                formEl.style.display = 'block';
            } else {
                throw new Error(data.message || 'Invalid or expired invitation');
            }
        } catch (error) {
            console.error('Invitation verification failed:', error);
            loadingEl.style.display = 'none';
            this.showError(error.message || 'Failed to verify invitation. Please try again.');
        }
    }

    populateForm() {
        if (!this.userData) return;

        // Populate readonly fields
        document.getElementById('name').value = this.userData.name || '';
        document.getElementById('email').value = this.userData.email || '';

        // Populate existing data if available
        document.getElementById('phone').value = this.userData.phone || '';
        document.getElementById('registrationNumber').value = this.userData.registration_number || '';
        document.getElementById('course').value = this.userData.course || '';
        document.getElementById('yearOfStudy').value = this.userData.year_of_study || '';
        document.getElementById('college').value = this.userData.college || '';
        document.getElementById('bio').value = this.userData.bio || '';
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitRegistration();
        });

        // Password toggle
        document.getElementById('togglePassword').addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = document.querySelector('#togglePassword i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });

        // Password strength checker
        document.getElementById('password').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
            this.checkPasswordMatch();
        });

        // Password confirmation
        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.checkPasswordMatch();
        });
    }

    checkPasswordStrength(password) {
        const strengthEl = document.getElementById('passwordStrength');
        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        strengthEl.className = 'password-strength';
        
        if (strength < 3) {
            strengthEl.classList.add('strength-weak');
        } else if (strength < 4) {
            strengthEl.classList.add('strength-medium');
        } else {
            strengthEl.classList.add('strength-strong');
        }
    }

    checkPasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const matchEl = document.getElementById('passwordMatch');

        if (confirmPassword === '') {
            matchEl.textContent = '';
            matchEl.className = 'form-text';
            return;
        }

        if (password === confirmPassword) {
            matchEl.textContent = '✓ Passwords match';
            matchEl.className = 'form-text text-success';
        } else {
            matchEl.textContent = '✗ Passwords do not match';
            matchEl.className = 'form-text text-danger';
        }
    }

    async submitRegistration() {
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Completing Registration...';

        try {
            const formData = {
                token: this.token,
                password: document.getElementById('password').value,
                phone: document.getElementById('phone').value,
                registration_number: document.getElementById('registrationNumber').value,
                course: document.getElementById('course').value,
                year_of_study: document.getElementById('yearOfStudy').value,
                college: document.getElementById('college').value,
                bio: document.getElementById('bio').value
            };

            const response = await fetch('/api/auth/complete-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                document.getElementById('registrationForm').style.display = 'none';
                document.getElementById('success-container').style.display = 'block';

                // Store auth token if provided
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            this.showAlert(error.message || 'Registration failed. Please try again.', 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    validateForm() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Password validation
        if (password.length < 8) {
            this.showAlert('Password must be at least 8 characters long', 'danger');
            return false;
        }

        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
            this.showAlert('Password must contain both letters and numbers', 'danger');
            return false;
        }

        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'danger');
            return false;
        }

        if (!agreeTerms) {
            this.showAlert('Please agree to the Terms of Service and Privacy Policy', 'danger');
            return false;
        }

        return true;
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-container').style.display = 'block';
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert-dismissible');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type} alert-dismissible fade show`;
        alertEl.innerHTML = `
            <i class="fas fa-${type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert at top of form
        const form = document.getElementById('registrationForm');
        form.insertBefore(alertEl, form.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertEl.parentNode) {
                alertEl.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CompleteRegistration();
});