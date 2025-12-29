// Global variables
let currentUser = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token and load user data
        verifyToken(token);
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize button event listeners
    initializeButtonListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // JKUAT Portal integration event listeners
    initializePortalEventListeners();
}

// Initialize JKUAT Portal event listeners
function initializePortalEventListeners() {
    // Registration method selection
    const portalRegisterBtn = document.getElementById('portalRegisterBtn');
    const manualRegisterBtn = document.getElementById('manualRegisterBtn');
    
    if (portalRegisterBtn) {
        portalRegisterBtn.addEventListener('click', () => setRegistrationMode('portal'));
    }
    
    if (manualRegisterBtn) {
        manualRegisterBtn.addEventListener('click', () => setRegistrationMode('manual'));
    }
    
    // Login method selection
    const standardLoginBtn = document.getElementById('standardLoginBtn');
    const portalLoginBtn = document.getElementById('portalLoginBtn');
    
    if (standardLoginBtn) {
        standardLoginBtn.addEventListener('click', () => setLoginMode('standard'));
    }
    
    if (portalLoginBtn) {
        portalLoginBtn.addEventListener('click', () => setLoginMode('portal'));
    }
    
    // Student validation
    const validateStudentBtn = document.getElementById('validateStudentBtn');
    if (validateStudentBtn) {
        validateStudentBtn.addEventListener('click', handleStudentValidation);
    }
}

// Initialize button event listeners
function initializeButtonListeners() {
    // Login buttons
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    if (loginBtn) loginBtn.addEventListener('click', showLoginModal);
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', function() {
            showLoginModal();
            toggleMobileMenu();
        });
    }
    
    // Register buttons
    const registerBtn = document.getElementById('registerBtn');
    const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    if (registerBtn) registerBtn.addEventListener('click', showRegisterModal);
    if (mobileRegisterBtn) {
        mobileRegisterBtn.addEventListener('click', function() {
            showRegisterModal();
            toggleMobileMenu();
        });
    }
    if (heroRegisterBtn) heroRegisterBtn.addEventListener('click', showRegisterModal);
    
    // Close buttons
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const closeRegisterBtn = document.getElementById('closeRegisterBtn');
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', hideLoginModal);
    if (closeRegisterBtn) closeRegisterBtn.addEventListener('click', hideRegisterModal);
    
    // Mobile menu button
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Hero learn more button
    const heroLearnMoreBtn = document.getElementById('heroLearnMoreBtn');
    if (heroLearnMoreBtn) {
        heroLearnMoreBtn.addEventListener('click', function() {
            scrollToSection('about');
        });
    }
    
    // Modal link buttons
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const loginToRegisterLink = document.getElementById('loginToRegisterLink');
    const registerToLoginLink = document.getElementById('registerToLoginLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const closeForgotPasswordBtn = document.getElementById('closeForgotPasswordBtn');
    
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', showForgotPasswordModal);
    if (loginToRegisterLink) loginToRegisterLink.addEventListener('click', showRegisterModal);
    if (registerToLoginLink) registerToLoginLink.addEventListener('click', showLoginModal);
    if (backToLoginLink) backToLoginLink.addEventListener('click', showLoginModal);
    if (closeForgotPasswordBtn) closeForgotPasswordBtn.addEventListener('click', hideForgotPasswordModal);
    
    // CTA buttons
    const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');
    const ctaLearnMoreBtn = document.getElementById('ctaLearnMoreBtn');
    if (ctaRegisterBtn) ctaRegisterBtn.addEventListener('click', showRegisterModal);
    if (ctaLearnMoreBtn) {
        ctaLearnMoreBtn.addEventListener('click', function() {
            scrollToSection('about');
        });
    }
    
    // Quick navigation
    const quickNavToggle = document.getElementById('quickNavToggle');
    const quickNavLoginBtn = document.getElementById('quickNavLoginBtn');
    const quickNavRegisterBtn = document.getElementById('quickNavRegisterBtn');
    
    if (quickNavToggle) quickNavToggle.addEventListener('click', toggleQuickNav);
    if (quickNavLoginBtn) {
        quickNavLoginBtn.addEventListener('click', function() {
            showLoginModal();
            toggleQuickNav();
        });
    }
    if (quickNavRegisterBtn) {
        quickNavRegisterBtn.addEventListener('click', function() {
            showRegisterModal();
            toggleQuickNav();
        });
    }
}

// Modal functions - Make them globally available
function showLoginModal() {
    hideRegisterModal();
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Login modal shown');
    } else {
        console.error('Login modal element not found');
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Login modal hidden');
    }
}

function showRegisterModal() {
    hideLoginModal();
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Register modal shown');
    } else {
        console.error('Register modal element not found');
    }
}

function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Register modal hidden');
    }
}

// Attach functions to window object to make them globally available
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.showRegisterModal = showRegisterModal;
window.hideRegisterModal = hideRegisterModal;

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
        console.log('Mobile menu toggled');
    }
}

// Make globally available
window.toggleMobileMenu = toggleMobileMenu;

// Scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        console.log('Scrolled to section:', sectionId);
    }
    return false; // Prevent default anchor behavior
}

// Make globally available
window.scrollToSection = scrollToSection;

// Forgot password modal functions
function showForgotPasswordModal() {
    hideLoginModal();
    hideRegisterModal();
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Forgot password modal shown');
    }
}

function hideForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Forgot password modal hidden');
    }
}

// Quick navigation functions
function toggleQuickNav() {
    const quickNavMenu = document.getElementById('quickNavMenu');
    if (quickNavMenu) {
        quickNavMenu.classList.toggle('hidden');
        console.log('Quick nav toggled');
    }
}

function hideQuickNav() {
    const quickNavMenu = document.getElementById('quickNavMenu');
    if (quickNavMenu) {
        quickNavMenu.classList.add('hidden');
    }
}

// Make globally available
window.showForgotPasswordModal = showForgotPasswordModal;
window.hideForgotPasswordModal = hideForgotPasswordModal;
window.toggleQuickNav = toggleQuickNav;
window.hideQuickNav = hideQuickNav;

// JKUAT Portal Integration Functions

// Set registration mode (portal or manual)
function setRegistrationMode(mode) {
    const portalBtn = document.getElementById('portalRegisterBtn');
    const manualBtn = document.getElementById('manualRegisterBtn');
    const portalSection = document.getElementById('portalValidationSection');
    const portalModeText = document.getElementById('portalModeText');
    const manualModeText = document.getElementById('manualModeText');
    const usePortalData = document.getElementById('usePortalData');
    
    if (mode === 'portal') {
        portalBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        portalBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        manualBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        manualBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        
        portalSection.classList.remove('hidden');
        portalModeText.classList.remove('hidden');
        manualModeText.classList.add('hidden');
        
        if (usePortalData) usePortalData.value = 'true';
        
        // Make form fields read-only until validation
        setFormFieldsReadonly(true);
    } else {
        manualBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        manualBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        portalBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        portalBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        
        portalSection.classList.add('hidden');
        manualModeText.classList.remove('hidden');
        portalModeText.classList.add('hidden');
        
        if (usePortalData) usePortalData.value = 'false';
        
        // Make form fields editable
        setFormFieldsReadonly(false);
        clearValidationResult();
    }
}

// Set login mode (standard or portal)
function setLoginMode(mode) {
    const standardBtn = document.getElementById('standardLoginBtn');
    const portalBtn = document.getElementById('portalLoginBtn');
    const identifierLabel = document.getElementById('loginIdentifierLabel');
    const identifierInput = document.getElementById('loginIdentifier');
    const identifierHint = document.getElementById('loginIdentifierHint');
    const usePortalAuth = document.getElementById('usePortalAuth');
    const portalAuthLabel = document.getElementById('portalAuthLabel');
    const passwordHint = document.getElementById('passwordHint');
    const standardLoginText = document.getElementById('standardLoginText');
    const portalLoginText = document.getElementById('portalLoginText');
    
    if (mode === 'portal') {
        portalBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        portalBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        standardBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        standardBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        
        identifierLabel.textContent = 'Registration Number';
        identifierInput.placeholder = 'e.g., EN111-0001/2021';
        identifierInput.type = 'text';
        identifierHint.textContent = 'Your JKUAT registration number';
        passwordHint.textContent = 'Your JKUAT portal password';
        
        usePortalAuth.checked = true;
        portalAuthLabel.classList.remove('hidden');
        
        standardLoginText.classList.add('hidden');
        portalLoginText.classList.remove('hidden');
    } else {
        standardBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        standardBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        portalBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        portalBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        
        identifierLabel.textContent = 'Email';
        identifierInput.placeholder = 'Enter your email';
        identifierInput.type = 'email';
        identifierHint.textContent = 'Use your registered email address';
        passwordHint.textContent = 'Your club account password';
        
        usePortalAuth.checked = false;
        portalAuthLabel.classList.add('hidden');
        
        portalLoginText.classList.add('hidden');
        standardLoginText.classList.remove('hidden');
    }
}

// Set form fields readonly state
function setFormFieldsReadonly(readonly) {
    const fields = ['registerName', 'registerEmail', 'registerPhone', 'registerNumber', 'registerCourse', 'registerYear', 'registerCollege'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.readOnly = readonly;
            if (readonly) {
                field.classList.add('bg-gray-100');
                field.classList.add('cursor-not-allowed');
            } else {
                field.classList.remove('bg-gray-100');
                field.classList.remove('cursor-not-allowed');
            }
        }
    });
}

// Handle student validation
async function handleStudentValidation(e) {
    e.preventDefault();
    
    const regNumber = document.getElementById('portalRegNumber').value.trim();
    const portalPassword = document.getElementById('portalPassword').value;
    const validateBtn = document.getElementById('validateStudentBtn');
    const resultDiv = document.getElementById('validationResult');
    
    if (!regNumber) {
        showValidationResult('error', 'Please enter your registration number');
        return;
    }
    
    // Show loading state
    validateBtn.disabled = true;
    validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Validating...';
    
    try {
        const response = await fetch('/api/auth/validate-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                registrationNumber: regNumber,
                portalPassword: portalPassword || undefined
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showValidationResult('success', 'Student validation successful!');
            populateFormWithPortalData(data.studentData);
        } else {
            showValidationResult('error', data.message || 'Validation failed');
        }
    } catch (error) {
        console.error('Validation error:', error);
        showValidationResult('error', 'Network error. Please try again.');
    } finally {
        // Reset button state
        validateBtn.disabled = false;
        validateBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Validate Student';
    }
}

// Show validation result
function showValidationResult(type, message) {
    const resultDiv = document.getElementById('validationResult');
    if (!resultDiv) return;
    
    resultDiv.classList.remove('hidden');
    
    if (type === 'success') {
        resultDiv.className = 'mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800';
        resultDiv.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    } else {
        resultDiv.className = 'mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800';
        resultDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    }
}

// Clear validation result
function clearValidationResult() {
    const resultDiv = document.getElementById('validationResult');
    if (resultDiv) {
        resultDiv.classList.add('hidden');
    }
}

// Populate form with portal data
function populateFormWithPortalData(studentData) {
    const fieldMapping = {
        'registerName': studentData.name,
        'registerEmail': studentData.email,
        'registerPhone': studentData.phone,
        'registerNumber': studentData.registrationNumber,
        'registerCourse': studentData.course,
        'registerYear': studentData.yearOfStudy,
        'registerCollege': studentData.college
    };
    
    Object.entries(fieldMapping).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
        }
    });
    
    // Make fields readonly after population
    setFormFieldsReadonly(true);
    
    showNotification('Student details loaded from JKUAT portal', 'success');
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const usePortalAuth = document.getElementById('usePortalAuth').checked;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                identifier, 
                password,
                usePortalAuth 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            
            // Update UI
            updateUIForLoggedInUser();
            hideLoginModal();
            
            // Show success message
            showNotification('Login successful!', 'success');
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const usePortalData = document.getElementById('usePortalData').value === 'true';
    
    const formData = {
        password: document.getElementById('registerPassword').value,
        registrationNumber: document.getElementById('registerNumber').value,
        usePortalData: usePortalData
    };
    
    // Add manual data if not using portal
    if (!usePortalData) {
        formData.name = document.getElementById('registerName').value;
        formData.email = document.getElementById('registerEmail').value;
        formData.phone = document.getElementById('registerPhone').value;
        formData.course = document.getElementById('registerCourse').value;
        formData.yearOfStudy = parseInt(document.getElementById('registerYear').value);
        formData.college = document.getElementById('registerCollege').value;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            hideRegisterModal();
            showNotification('Registration successful! Please check your email for verification.', 'success');
            
            // Clear form
            document.getElementById('registerForm').reset();
        } else {
            if (data.errors) {
                const errorMessages = data.errors.map(error => error.msg).join(', ');
                showNotification(errorMessages, 'error');
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Verify token
async function verifyToken(token) {
    try {
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForLoggedInUser();
        } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('token');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    // Store user data for navbar
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Reinitialize navbar to show logged-in state
    const currentPage = window.location.pathname === '/events' ? 'events' : 
                       window.location.pathname === '/dashboard' ? 'dashboard' : 'home';
    initializeNavbar(currentPage);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // Redirect to homepage
    window.location.href = '/';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Utility functions
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// API helper functions
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(endpoint, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (e.target === loginModal) {
        hideLoginModal();
    }
    
    if (e.target === registerModal) {
        hideRegisterModal();
    }
});

// Handle escape key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideLoginModal();
        hideRegisterModal();
        hideQuickNav();
    }
});

// Quick navigation functions
function toggleQuickNav() {
    const quickNavMenu = document.getElementById('quickNavMenu');
    if (quickNavMenu) {
        quickNavMenu.classList.toggle('hidden');
    }
}

function hideQuickNav() {
    const quickNavMenu = document.getElementById('quickNavMenu');
    if (quickNavMenu) {
        quickNavMenu.classList.add('hidden');
    }
}

// Close quick nav when clicking outside
document.addEventListener('click', function(e) {
    const quickNavButton = e.target.closest('[onclick="toggleQuickNav()"]');
    const quickNavMenu = document.getElementById('quickNavMenu');
    
    if (!quickNavButton && quickNavMenu && !quickNavMenu.contains(e.target)) {
        hideQuickNav();
    }
});