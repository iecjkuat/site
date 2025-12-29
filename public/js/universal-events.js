// Universal Event Handlers for All Pages
// This file handles login/register buttons across all pages

document.addEventListener('DOMContentLoaded', function() {
    console.log('Universal events loaded');
    
    // Initialize button event listeners for all pages
    initializeUniversalButtons();
});

function initializeUniversalButtons() {
    // Login buttons
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const quickNavLoginBtn = document.getElementById('quickNavLoginBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            } else {
                console.error('showLoginModal function not available');
            }
        });
    }
    
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', function() {
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
            if (typeof window.toggleMobileMenu === 'function') {
                window.toggleMobileMenu();
            }
        });
    }
    
    if (quickNavLoginBtn) {
        quickNavLoginBtn.addEventListener('click', function() {
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
            if (typeof window.toggleQuickNav === 'function') {
                window.toggleQuickNav();
            }
        });
    }
    
    // Register buttons
    const registerBtn = document.getElementById('registerBtn');
    const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
    const quickNavRegisterBtn = document.getElementById('quickNavRegisterBtn');
    const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            } else {
                console.error('showRegisterModal function not available');
            }
        });
    }
    
    if (mobileRegisterBtn) {
        mobileRegisterBtn.addEventListener('click', function() {
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            }
            if (typeof window.toggleMobileMenu === 'function') {
                window.toggleMobileMenu();
            }
        });
    }
    
    if (quickNavRegisterBtn) {
        quickNavRegisterBtn.addEventListener('click', function() {
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            }
            if (typeof window.toggleQuickNav === 'function') {
                window.toggleQuickNav();
            }
        });
    }
    
    if (ctaRegisterBtn) {
        ctaRegisterBtn.addEventListener('click', function() {
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            }
        });
    }
    
    if (heroRegisterBtn) {
        heroRegisterBtn.addEventListener('click', function() {
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            }
        });
    }
    
    // Mobile menu button
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            if (typeof window.toggleMobileMenu === 'function') {
                window.toggleMobileMenu();
            }
        });
    }
    
    // Quick navigation toggle
    const quickNavToggle = document.getElementById('quickNavToggle');
    if (quickNavToggle) {
        quickNavToggle.addEventListener('click', function() {
            if (typeof window.toggleQuickNav === 'function') {
                window.toggleQuickNav();
            }
        });
    }
    
    // Close buttons
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const closeRegisterBtn = document.getElementById('closeRegisterBtn');
    const closeForgotPasswordBtn = document.getElementById('closeForgotPasswordBtn');
    
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', function() {
            if (typeof window.hideLoginModal === 'function') {
                window.hideLoginModal();
            }
        });
    }
    
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', function() {
            if (typeof window.hideRegisterModal === 'function') {
                window.hideRegisterModal();
            }
        });
    }
    
    if (closeForgotPasswordBtn) {
        closeForgotPasswordBtn.addEventListener('click', function() {
            if (typeof window.hideForgotPasswordModal === 'function') {
                window.hideForgotPasswordModal();
            }
        });
    }
    
    // Modal link buttons
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const loginToRegisterLink = document.getElementById('loginToRegisterLink');
    const registerToLoginLink = document.getElementById('registerToLoginLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.showForgotPasswordModal === 'function') {
                window.showForgotPasswordModal();
            }
        });
    }
    
    if (loginToRegisterLink) {
        loginToRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            }
        });
    }
    
    if (registerToLoginLink) {
        registerToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
        });
    }
    
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
        });
    }
    
    // Learn more buttons
    const heroLearnMoreBtn = document.getElementById('heroLearnMoreBtn');
    const ctaLearnMoreBtn = document.getElementById('ctaLearnMoreBtn');
    
    if (heroLearnMoreBtn) {
        heroLearnMoreBtn.addEventListener('click', function() {
            if (typeof window.scrollToSection === 'function') {
                window.scrollToSection('about');
            }
        });
    }
    
    if (ctaLearnMoreBtn) {
        ctaLearnMoreBtn.addEventListener('click', function() {
            if (typeof window.scrollToSection === 'function') {
                window.scrollToSection('about');
            }
        });
    }
    
    console.log('Universal button event listeners initialized');
}