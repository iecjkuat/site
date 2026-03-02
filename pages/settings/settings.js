/**
 * Settings Page - Production Ready
 * JKUAT Innovation and Entrepreneurship Club
 * Clean, accessible, secure
 */

console.log('🚀 Settings script loading...');

class SettingsManager {
    constructor() {
        this.currentUser = null;
        
        // Wait for DOM if needed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('⚙️ SettingsManager initializing...');
        try {
            this.initTabs();
            this.loadUserData();
            this.bindFormEvents();
            this.bindButtonEvents();
            console.log('✅ SettingsManager initialized');
        } catch (error) {
            console.error('❌ Init error:', error);
        }
    }

    // ============================================
    // TAB NAVIGATION - Fully Accessible
    // ============================================
    initTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        const panels = document.querySelectorAll('.tab-panel');

        const activate = (tabName, { focusTab = false } = {}) => {
            // Update tabs
            tabs.forEach(btn => {
                const isActive = btn.dataset.tab === tabName;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', String(isActive));
                btn.setAttribute('tabindex', isActive ? '0' : '-1');
                if (isActive && focusTab) btn.focus();
            });

            // Update panels
            panels.forEach(panel => {
                const isActive = panel.id === tabName;
                panel.classList.toggle('active', isActive);
                panel.setAttribute('aria-hidden', String(!isActive));
            });

            // Persist in URL hash
            history.replaceState(null, '', `#${tabName}`);
        };

        // Click events
        tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                activate(btn.dataset.tab);
            });

            // Keyboard navigation: Left/Right/Home/End
            btn.addEventListener('keydown', (e) => {
                const idx = Array.from(tabs).indexOf(btn);
                
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const next = tabs[(idx + 1) % tabs.length];
                    activate(next.dataset.tab, { focusTab: true });
                }
                
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
                    activate(prev.dataset.tab, { focusTab: true });
                }
                
                if (e.key === 'Home') {
                    e.preventDefault();
                    activate(tabs[0].dataset.tab, { focusTab: true });
                }
                
                if (e.key === 'End') {
                    e.preventDefault();
                    activate(tabs[tabs.length - 1].dataset.tab, { focusTab: true });
                }
            });
        });

        // Initial tab from URL hash or default
        const initial = location.hash?.replace('#', '') || 'profile';
        const initialExists = document.getElementById(initial);
        activate(initialExists ? initial : 'profile');
    }

    // ============================================
    // DATA LOADING
    // ============================================
    async loadUserData() {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token found, redirecting to login...');
                window.location.href = '/auth/signin.html';
                return;
            }

            console.log('🔄 Loading user profile data...');
            
            const response = await fetch('/api/auth/profile', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Profile API response status:', response.status);

            if (response.ok) {
                const userData = await response.json();
                console.log('✅ User data loaded:', userData);
                
                this.currentUser = userData.user || userData;
                this.populateUserData();
                return;
            } else {
                const errorData = await response.json();
                console.error('❌ Profile API error:', errorData);
                
                if (response.status === 401) {
                    console.warn('⚠️ Unauthorized, redirecting to login...');
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    window.location.href = '/auth/signin.html';
                    return;
                }
                
                throw new Error(errorData.message || 'Failed to load profile');
            }
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            this.showToast('Failed to load profile data. Please refresh the page.', 'error');
        }
    }

    // ============================================
    // DATA NORMALIZATION (snake_case → camelCase)
    // ============================================
    
    populateUserData() {
        if (!this.currentUser) return;

        // Profile section
        this.setFieldValue('fullName', this.currentUser.name);
        this.setFieldValue('email', this.currentUser.email);
        this.setFieldValue('phone', this.currentUser.phone);
        this.setFieldValue('dateOfBirth', this.currentUser.dateOfBirth || this.currentUser.date_of_birth);
        this.setFieldValue('gender', this.currentUser.gender);
        this.setFieldValue('bio', this.currentUser.bio);
        this.setFieldValue('skills', Array.isArray(this.currentUser.skills) ? this.currentUser.skills.join(', ') : '');
        this.setFieldValue('linkedinUrl', this.currentUser.linkedinUrl || this.currentUser.linkedin_url);

        // Academic section
        this.setFieldValue('registrationNumber', this.currentUser.studentId || this.currentUser.registration_number);
        this.setFieldValue('course', this.currentUser.course);
        this.setFieldValue('yearOfStudy', this.currentUser.year || this.currentUser.year_of_study);
        this.setFieldValue('college', this.currentUser.college);

        // Display elements
        this.setTextContent('displayName', this.currentUser.name);
        this.setTextContent('displayEmail', this.currentUser.email);

        // Profile picture
        const profilePicture = document.getElementById('profilePicture');
        const profileInitials = document.getElementById('profileInitials');
        
        if (this.currentUser.profile_picture && profilePicture && profileInitials) {
            profilePicture.style.backgroundImage = `url(${this.currentUser.profile_picture})`;
            profilePicture.style.backgroundSize = 'cover';
            profilePicture.style.backgroundPosition = 'center';
            profileInitials.style.display = 'none';
        } else if (profileInitials) {
            // Profile initials
            const initials = this.currentUser.name
                ? this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : 'JD';
            this.setTextContent('profileInitials', initials);
        }
    }

    setFieldValue(id, value) {
        const field = document.getElementById(id);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    }

    setTextContent(id, text) {
        const element = document.getElementById(id);
        if (element && text !== undefined && text !== null) {
            element.textContent = text;
        }
    }

    // ============================================
    // DATA NORMALIZATION (snake_case → camelCase)
    // ============================================
    normalizeProfileData(rawData) {
        return {
            name: rawData.name,
            email: rawData.email,
            phone: rawData.phone,
            dateOfBirth: rawData.date_of_birth,
            gender: rawData.gender,
            bio: rawData.bio,
            linkedinUrl: rawData.linkedin_url,
            skills: rawData.skills ? rawData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
        };
    }

    normalizeAcademicData(rawData) {
        return {
            studentId: rawData.registration_number,
            course: rawData.course,
            year: Number(rawData.year_of_study),
            college: rawData.college
        };
    }

    // ============================================
    // FORM HANDLERS
    // ============================================
    bindFormEvents() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }

        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => this.handleNotificationUpdate(e));
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                this.showToast('Please log in to update profile', 'error');
                return;
            }

            // Update profile (name, email, phone)
            const profileResponse = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone
                })
            });

            if (!profileResponse.ok) {
                const errorData = await profileResponse.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            // Update academic info (registration_number, course, year_of_study, college)
            const academicResponse = await fetch('/api/auth/academic', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    registration_number: data.registration_number,
                    course: data.course,
                    year_of_study: parseInt(data.year_of_study),
                    college: data.college
                })
            });

            if (!academicResponse.ok) {
                const errorData = await academicResponse.json();
                throw new Error(errorData.message || 'Failed to update academic information');
            }

            // Reload user data to reflect changes
            await this.loadUserData();
            this.showToast('Information updated successfully', 'success');
        } catch (error) {
            console.error('❌ Error updating information:', error);
            this.showToast(error.message || 'Error updating information', 'error');
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        console.log('🔐 Password change attempt:', {
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword,
            hasConfirmPassword: !!confirmPassword,
            currentPasswordLength: currentPassword?.length,
            newPasswordLength: newPassword?.length
        });

        if (newPassword !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                this.showToast('Please log in to change password', 'error');
                return;
            }

            const requestBody = { currentPassword, newPassword };
            console.log('📤 Sending password change request:', {
                url: '/api/auth/change-password',
                method: 'POST',
                hasToken: !!token,
                bodyKeys: Object.keys(requestBody)
            });

            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 Response status:', response.status);

            const data = await response.json();
            console.log('📥 Response data:', data);

            if (response.ok) {
                this.showToast('Password changed successfully', 'success');
                e.target.reset();
                return;
            }

            // Handle specific error cases
            if (response.status === 401) {
                this.showToast('Current password is incorrect', 'error');
            } else if (response.status === 400 && data.errors) {
                // Show validation errors
                const errorMessages = data.errors.map(err => err.msg).join(', ');
                this.showToast(`Validation error: ${errorMessages}`, 'error');
            } else {
                this.showToast(data.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('❌ Error changing password:', error);
            this.showToast('Error changing password', 'error');
        }
    }

    async handleNotificationUpdate(e) {
        e.preventDefault();

        const form = e.target;
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        const preferences = {};

        // Capture both checked and unchecked states
        checkboxes.forEach(cb => {
            preferences[cb.name] = cb.checked;
        });

        try {
            const token = localStorage.getItem('authToken');
            
            if (token) {
                const response = await fetch('/api/auth/preferences', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(preferences)
                });

                if (response.ok) {
                    this.showToast('Notification preferences updated successfully', 'success');
                    return;
                }

                const errorData = await response.json();
                this.showToast(errorData.message || 'Failed to update preferences', 'error');
                return;
            }

            // Fallback
            console.log('Notification preferences (local):', preferences);
            this.showToast('Notification preferences updated (local)', 'success');
        } catch (error) {
            console.error('❌ Error updating preferences:', error);
            this.showToast('Error updating preferences', 'error');
        }
    }

    // ============================================
    // BUTTON HANDLERS
    // ============================================
    bindButtonEvents() {
        const changePictureBtn = document.getElementById('changePictureBtn');
        const profilePictureInput = document.getElementById('profilePictureInput');

        if (changePictureBtn && profilePictureInput) {
            changePictureBtn.addEventListener('click', () => profilePictureInput.click());
            profilePictureInput.addEventListener('change', (e) => this.handleProfilePictureChange(e));
        }

        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.handleDeleteAccount());
        }
    }

    handleProfilePictureChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select an image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Image must be less than 5MB', 'error');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (event) => {
            const profilePicture = document.getElementById('profilePicture');
            const profileInitials = document.getElementById('profileInitials');

            if (profilePicture && profileInitials) {
                profilePicture.style.backgroundImage = `url(${event.target.result})`;
                profilePicture.style.backgroundSize = 'cover';
                profilePicture.style.backgroundPosition = 'center';
                profileInitials.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);

        // Upload to server
        this.uploadProfilePicture(file);
    }

    async uploadProfilePicture(file) {
        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                this.showToast('Please log in to upload profile picture', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            this.showToast('Uploading profile picture...', 'info');

            const response = await fetch('/api/auth/profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update current user data
                if (this.currentUser) {
                    this.currentUser.profile_picture = data.profilePictureUrl;
                }

                this.showToast('Profile picture updated successfully', 'success');
            } else {
                const errorData = await response.json();
                this.showToast(errorData.message || 'Failed to upload profile picture', 'error');
                
                // Reload original picture on error
                await this.loadUserData();
            }
        } catch (error) {
            console.error('❌ Error uploading profile picture:', error);
            this.showToast('Error uploading profile picture', 'error');
            
            // Reload original picture on error
            await this.loadUserData();
        }
    }

    async handleDeleteAccount() {
        const confirmed = confirm(
            '⚠️ WARNING: This will permanently delete your account and all associated data.\n\n' +
            'This action cannot be undone. Are you absolutely sure?'
        );
        
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('authToken');
            
            if (token) {
                const response = await fetch('/api/auth/delete-account', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    this.showToast('Account deleted successfully', 'success');
                    
                    setTimeout(() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/';
                    }, 2000);
                    return;
                }

                const errorData = await response.json();
                this.showToast(errorData.message || 'Failed to delete account', 'error');
                return;
            }

            // Fallback
            this.showToast('Please log in to delete account', 'error');
        } catch (error) {
            console.error('❌ Error deleting account:', error);
            this.showToast('Error deleting account. Please contact support.', 'error');
        }
    }

    // ============================================
    // UTILITIES - XSS Safe Toast
    // ============================================
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        const row = document.createElement('div');
        row.className = 'toast-row';

        const icon = document.createElement('i');
        icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}`;

        const text = document.createElement('span');
        text.textContent = String(message); // ✅ Safe from XSS

        row.appendChild(icon);
        row.appendChild(text);
        toast.appendChild(row);

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ============================================
// INITIALIZATION - Single Guard
// ============================================
let settingsManager;

function initSettingsOnce() {
    if (window.settingsManager) {
        console.log('⚠️ SettingsManager already initialized');
        return;
    }
    
    try {
        window.settingsManager = new SettingsManager();
        settingsManager = window.settingsManager;
        console.log('✅ SettingsManager ready');
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSettingsOnce);

// Backup initialization (guarded)
setTimeout(initSettingsOnce, 500);
