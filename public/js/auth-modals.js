// JKUAT Innovation Club - Authentication Modals
// Reusable login and registration modals for all pages

class AuthModals {
    constructor() {
        this.loginModal = null;
        this.registerModal = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.createModals();
        this.attachEventListeners();
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
        // Update navigation buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
        
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user" style="margin-right: 0.5rem;"></i>' + this.currentUser.name;
            loginBtn.onclick = () => window.location.href = '/dashboard';
        }
        
        if (registerBtn) {
            registerBtn.innerHTML = '<i class="fas fa-tachometer-alt" style="margin-right: 0.5rem;"></i>Dashboard';
            registerBtn.onclick = () => window.location.href = '/dashboard';
        }
        
        if (mobileLoginBtn) {
            mobileLoginBtn.innerHTML = '<i class="fas fa-user" style="margin-right: 0.75rem;"></i>' + this.currentUser.name;
            mobileLoginBtn.onclick = () => window.location.href = '/dashboard';
        }
        
        if (mobileRegisterBtn) {
            mobileRegisterBtn.innerHTML = '<i class="fas fa-tachometer-alt" style="margin-right: 0.75rem;"></i>Dashboard';
            mobileRegisterBtn.onclick = () => window.location.href = '/dashboard';
        }
    }

    createModals() {
        this.createLoginModal();
        this.createRegisterModal();
    }

    createLoginModal() {
        if (document.getElementById('loginModal')) return;

        this.loginModal = document.createElement('div');
        this.loginModal.id = 'loginModal';
        this.loginModal.className = 'hidden';
        this.loginModal.innerHTML = `
            <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem;">
                <div class="glass-card" style="max-width: 420px; width: 100%; position: relative;">
                    <button id="closeLoginBtn" class="gla