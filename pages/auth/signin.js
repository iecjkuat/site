/**
 * Standalone Signin Page - JavaScript
 */

console.log('🔐 Signin page loaded');

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
const signinForm = document.getElementById('signinForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const messageContainer = document.getElementById('messageContainer');
const submitBtn = signinForm.querySelector('.submit-btn');

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
        submitBtn.querySelector('.btn-text').textContent = 'SIGNING IN...';
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-text').textContent = 'SIGN IN';
    }
}

// Handle form submission
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;
    
    // Validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    setLoading(true);
    
    try {
        console.log('🔐 Attempting login via backend API...');
        
        // Use backend API for login
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        console.log('✅ Login successful');
        
        // Store token
        if (data.token) {
            if (rememberMe) {
                localStorage.setItem('authToken', data.token);
            } else {
                sessionStorage.setItem('authToken', data.token);
            }
        }
        
        // Store user data
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Get the page to redirect to (from URL parameter or default to dashboard)
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/dashboard';
        
        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = redirectTo;
        }, 1000);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
        setLoading(false);
    }
});

console.log('✅ Signin page ready');
