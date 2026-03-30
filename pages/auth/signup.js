/**
 * Standalone Signup Page - JavaScript
 */

console.log('🔐 Signup page loaded');

// Form elements
const signupForm = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const registrationNumberInput = document.getElementById('registrationNumber');
const phoneInput = document.getElementById('phone');
const courseInput = document.getElementById('course');
const yearOfStudySelect = document.getElementById('yearOfStudy');
const collegeSelect = document.getElementById('college');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const agreeTermsCheckbox = document.getElementById('agreeTerms');
const messageContainer = document.getElementById('messageContainer');
const submitBtn = signupForm.querySelector('.submit-btn');

// Show message — persistent = true means it won't auto-hide
function showMessage(message, type = 'error', persistent = false) {
    messageContainer.innerHTML = `
        <div class="message ${type}">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    if (!persistent) {
        setTimeout(() => { messageContainer.innerHTML = ''; }, 6000);
    }
}

// Set loading state
function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.btn-text').textContent = 'SIGNING UP...';
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-text').textContent = 'SIGN UP';
    }
}

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const registrationNumber = registrationNumberInput.value.trim();
    const phone = phoneInput.value.trim();
    const course = courseInput.value.trim();
    const yearOfStudy = yearOfStudySelect.value;
    const college = collegeSelect.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const agreeTerms = agreeTermsCheckbox.checked;

    // Validation
    if (!name || !email || !registrationNumber || !phone || !course || !yearOfStudy || !college || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!email.includes('@')) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    if (!email.includes('@students.jkuat.ac.ke') && !email.includes('@jkuat.ac.ke')) {
        showMessage('Please use your JKUAT email (@students.jkuat.ac.ke or @jkuat.ac.ke)', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (!agreeTerms) {
        showMessage('Please agree to the terms of service', 'error');
        return;
    }

    setLoading(true);
    let success = false;

    try {
        console.log('🔐 Attempting registration via backend API...');

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, registrationNumber, phone, course, yearOfStudy, college, password })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.errors ? data.errors[0].msg : (data.message || 'Registration failed');
            throw new Error(errorMsg);
        }

        console.log('✅ Registration successful');
        success = true;

        // Show persistent success message with next steps
        messageContainer.innerHTML = `
            <div class="message success" style="line-height:1.8;">
                <i class="fas fa-check-circle"></i>
                <span>
                    <strong>Account created!</strong><br>
                    We've sent a verification link to <strong>${email}</strong>.<br>
                    Click the link in your JKUAT email to activate your account, then
                    <a href="/signin" style="color:#10b981;font-weight:600;">sign in here</a>.
                </span>
            </div>
        `;

        // Hide the form so they don't try to submit again
        signupForm.style.display = 'none';

    } catch (error) {
        console.error('❌ Registration error:', error);
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        // Only re-enable button if registration failed
        if (!success) setLoading(false);
    }
});

console.log('✅ Signup page ready');
