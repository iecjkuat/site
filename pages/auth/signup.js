/**
 * Standalone Signup Page - JavaScript
 */

console.log('🔐 Signup page loaded');

// Initialize Supabase client
const SUPABASE_URL = 'https://gakuuxwhlczhlgngcdrv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3V1eHdobGN6aGxnbmdjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzUyODksImV4cCI6MjA4MTY1MTI4OX0.wbgJik7A6qasB8FMEWZqZka8CEpZyUrSw-Ma2oLZZwM';

let supabaseClient = null;

// Initialize Supabase
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
} else {
    console.error('❌ Supabase library not loaded');
}

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

// Show message
function showMessage(message, type = 'error') {
    messageContainer.innerHTML = `
        <div class="message ${type}">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
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
    
    // Validate JKUAT email
    if (!email.includes('@students.jkuat.ac.ke') && !email.includes('@jkuat.ac.ke')) {
        showMessage('Please use a valid JKUAT email address (@students.jkuat.ac.ke or @jkuat.ac.ke)', 'error');
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
    
    try {
        console.log('🔐 Attempting registration via backend API...');
        
        // Use backend API for registration
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                registrationNumber: registrationNumber,
                phone: phone,
                course: course,
                yearOfStudy: yearOfStudy,
                college: college,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        console.log('✅ Registration successful');
        
        showMessage('Registration successful! Redirecting to sign in...', 'success');
        
        // Redirect to signin page after 2 seconds
        setTimeout(() => {
            window.location.href = '/signin';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
});

console.log('✅ Signup page ready');
