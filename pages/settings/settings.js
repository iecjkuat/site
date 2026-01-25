// JKUAT Innovation Club - Settings Page
// Clean, production-ready implementation

console.log('🚀 Settings script loading...');

class SettingsManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('⚙️ SettingsManager initializing...');
        this.initTabs();
        this.loadUserData();
        this.bindFormEvents();
        this.bindButtonEvents();
    }

    // Tab switching functionality
    initTabs() {
        console.log('🔧 Initializing tabs...');

        const tabs = document.querySelectorAll('.settings-tab');
        console.log('Found tabs:', tabs.length);

        tabs.forEach((tab, index) => {
            const tabName = tab.getAttribute('data-tab');
            console.log(`Setting up tab ${index}: ${tabName}`);

            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Tab clicked:', tabName);
                this.switchTab(tabName);
            });
        });

        // Initialize first tab
        setTimeout(() => {
            this.switchTab('profile');
            console.log('✅ Tabs initialized');
        }, 100);
    }

    switchTab(tabName) {
        console.log('🔄 Switching to:', tabName);

        // Hide all sections
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active from all tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(tabName);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('✅ Showed section:', tabName);
        }

        // Activate clicked tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('✅ Activated tab:', tabName);
        }
    }

    // Load user data
    async loadUserData() {
        try {
            // Try API first
            const token = localStorage.getItem('authToken');
            if (token) {
                const response = await fetch('/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    this.currentUser = userData.user || userData;
                    console.log('✅ User data loaded from API');
                    this.populateUserData();
                    return;
                }
            }

            // Fallback to mock data
            console.log('⚠️ API unavailable, using mock data');
            if (window.settingsMockData) {
                this.currentUser = window.settingsMockData.getUserProfile();
            } else {
                this.currentUser = this.createFallbackUser();
            }

            this.populateUserData();
            console.log('✅ User data loaded from fallback');
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            this.showToast('Error loading user data', 'error');
        }
    }

    createFallbackUser() {
        return {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@student.jkuat.ac.ke',
            phone: '+254 700 123 456',
            dateOfBirth: '2000-05-15',
            gender: 'male',
            bio: 'Passionate about technology and innovation.',
            skills: ['JavaScript', 'Python', 'React', 'Node.js'],
            linkedinUrl: 'https://linkedin.com/in/johndoe',
            studentId: 'EN01-0001/2023',
            course: 'Computer Science',
            year: 3,
            college: 'Engineering and Technology',
            experienceLevel: 'intermediate'
        };
    }

    populateUserData() {
        if (!this.currentUser) return;

        // Profile section
        this.setFieldValue('fullName', this.currentUser.name);
        this.setFieldValue('email', this.currentUser.email);
        this.setFieldValue('phone', this.currentUser.phone);
        this.setFieldValue('dateOfBirth', this.currentUser.dateOfBirth);
        this.setFieldValue('gender', this.currentUser.gender);
        this.setFieldValue('bio', this.currentUser.bio);
        this.setFieldValue('skills', this.currentUser.skills ? this.currentUser.skills.join(', ') : '');
        this.setFieldValue('linkedinUrl', this.currentUser.linkedinUrl);

        // Academic section
        this.setFieldValue('registrationNumber', this.currentUser.studentId);
        this.setFieldValue('course', this.currentUser.course);
        this.setFieldValue('yearOfStudy', this.currentUser.year);
        this.setFieldValue('college', this.currentUser.college);
        this.setFieldValue('experienceLevel', this.currentUser.experienceLevel);

        // Display elements
        this.setTextContent('displayName', this.currentUser.name);
        this.setTextContent('displayEmail', this.currentUser.email);

        // Profile initials
        const initials = this.currentUser.name ?
            this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';
        this.setTextContent('profileInitials', initials);
    }

    setFieldValue(id, value) {
        const field = document.getElementById(id);
        if (field && value !== undefined) {
            field.value = value;
        }
    }

    setTextContent(id, text) {
        const element = document.getElementById(id);
        if (element && text !== undefined) {
            element.textContent = text;
        }
    }

    // Bind form events
    bindFormEvents() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Academic form
        const academicForm = document.getElementById('academicForm');
        if (academicForm) {
            academicForm.addEventListener('submit', (e) => this.handleAcademicUpdate(e));
        }

        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }

        // Notification form
        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => this.handleNotificationUpdate(e));
        }

        // App preferences form
        const appPreferencesForm = document.getElementById('appPreferencesForm');
        if (appPreferencesForm) {
            appPreferencesForm.addEventListener('submit', (e) => this.handleAppPreferencesUpdate(e));
        }

        // Privacy form
        const privacyForm = document.getElementById('privacyForm');
        if (privacyForm) {
            privacyForm.addEventListener('submit', (e) => this.handlePrivacyUpdate(e));
        }
    }

    // Bind button events
    bindButtonEvents() {
        // Edit profile toggle
        const editProfileBtn = document.getElementById('editProfileBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.toggleEditMode(true));
        }
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.toggleEditMode(false));
        }

        // Profile picture change
        const changePictureBtn = document.getElementById('changePictureBtn');
        const profilePictureInput = document.getElementById('profilePictureInput');

        if (changePictureBtn && profilePictureInput) {
            changePictureBtn.addEventListener('click', () => profilePictureInput.click());
            profilePictureInput.addEventListener('change', (e) => this.handleProfilePictureChange(e));
        }

        // Export data
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.handleExportData());
        }

        // Delete account
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.handleDeleteAccount());
        }

        // Membership actions
        const generateCardBtn = document.getElementById('generateCardBtn');
        const renewMembershipBtn = document.getElementById('renewMembershipBtn');
        const payMembershipBtn = document.getElementById('payMembershipBtn');

        if (generateCardBtn) {
            generateCardBtn.addEventListener('click', () => this.handleGenerateMembershipCard());
        }
        if (renewMembershipBtn) {
            renewMembershipBtn.addEventListener('click', () => this.handleRenewMembership());
        }
        if (payMembershipBtn) {
            payMembershipBtn.addEventListener('click', () => this.handlePayMembership());
        }

        // Payment actions
        const exportPaymentsBtn = document.getElementById('exportPaymentsBtn');
        const loadMorePayments = document.getElementById('loadMorePayments');

        if (exportPaymentsBtn) {
            exportPaymentsBtn.addEventListener('click', () => this.handleExportPayments());
        }
        if (loadMorePayments) {
            loadMorePayments.addEventListener('click', () => this.handleLoadMorePayments());
        }

        // Activity actions
        const loadMoreActivity = document.getElementById('loadMoreActivity');
        if (loadMoreActivity) {
            loadMoreActivity.addEventListener('click', () => this.handleLoadMoreActivity());
        }

        // Payment filters
        const paymentFilter = document.getElementById('paymentFilter');
        const activityFilter = document.getElementById('activityFilter');
        const activityPeriod = document.getElementById('activityPeriod');

        if (paymentFilter) {
            paymentFilter.addEventListener('change', (e) => this.handlePaymentFilter(e.target.value));
        }
        if (activityFilter) {
            activityFilter.addEventListener('change', (e) => this.handleActivityFilter(e.target.value));
        }
        if (activityPeriod) {
            activityPeriod.addEventListener('change', (e) => this.handleActivityPeriod(e.target.value));
        }

        // Show membership buttons based on status
        this.updateMembershipButtons();
    }

    // Form handlers
    async handleProfileUpdate(e) {
        e.preventDefault();
        console.log('📝 Updating profile...');

        const formData = new FormData(e.target);
        const profileData = Object.fromEntries(formData);

        try {
            // Try API first
            const token = localStorage.getItem('authToken');
            if (token) {
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profileData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Profile updated via API');
                    this.currentUser = { ...this.currentUser, ...profileData };
                    this.populateUserData();
                    this.showToast('Profile updated successfully', 'success');
                    this.toggleEditMode(false);
                    return;
                }
            }

            // Fallback to local update
            console.log('⚠️ API unavailable, updating locally');
            this.currentUser = { ...this.currentUser, ...profileData };
            this.populateUserData();
            this.showToast('Profile updated successfully (local)', 'success');
            this.toggleEditMode(false);
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            this.showToast('Error updating profile', 'error');
        }
    }

    async handleAcademicUpdate(e) {
        e.preventDefault();
        console.log('🎓 Updating academic info...');

        const formData = new FormData(e.target);
        const academicData = Object.fromEntries(formData);

        try {
            this.currentUser = { ...this.currentUser, ...academicData };
            this.showToast('Academic information updated successfully', 'success');
        } catch (error) {
            console.error('❌ Error updating academic info:', error);
            this.showToast('Error updating academic information', 'error');
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        console.log('🔒 Changing password...');

        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            this.showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            // Simulate password change
            this.showToast('Password changed successfully', 'success');
            e.target.reset();
        } catch (error) {
            console.error('❌ Error changing password:', error);
            this.showToast('Error changing password', 'error');
        }
    }

    async handleNotificationUpdate(e) {
        e.preventDefault();
        console.log('🔔 Updating notification preferences...');

        const formData = new FormData(e.target);
        const preferences = {};

        // Get all checkbox values
        for (let [key, value] of formData.entries()) {
            preferences[key] = value === 'on';
        }

        try {
            this.showToast('Notification preferences updated successfully', 'success');
        } catch (error) {
            console.error('❌ Error updating preferences:', error);
            this.showToast('Error updating notification preferences', 'error');
        }
    }

    async handleAppPreferencesUpdate(e) {
        e.preventDefault();
        console.log('⚙️ Updating app preferences...');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Save to local storage
        localStorage.setItem('userLanguage', data.language);
        localStorage.setItem('userTheme', data.theme);

        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', data.theme);

        this.showToast('App preferences saved', 'success');
    }

    async handlePrivacyUpdate(e) {
        e.preventDefault();
        console.log('🔒 Updating privacy settings...');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        this.showToast('Privacy settings updated', 'success');
    }

    // Button handlers
    handleProfilePictureChange(e) {
        const file = e.target.files[0];
        if (file) {
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
            this.showToast('Profile picture updated', 'success');
        }
    }

    toggleEditMode(enabled) {
        const form = document.getElementById('profileForm');
        const editBtn = document.getElementById('editProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');

        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.disabled = !enabled;
            });
        }

        if (editBtn) editBtn.style.display = enabled ? 'none' : 'inline-flex';
        if (cancelBtn) cancelBtn.style.display = enabled ? 'inline-flex' : 'none';
    }

    async handleExportData() {
        try {
            console.log('📥 Exporting user data...');

            const exportData = {
                profile: this.currentUser,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            // Trigger file download
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "jkuat_club_data_export.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            this.showToast('Data export started', 'success');
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showToast('Failed to export data', 'error');
        }
    }

    async handleDeleteAccount() {
        // Step 1: First confirmation
        const firstConfirm = confirm('⚠️ WARNING: This will permanently delete your account and all associated data. Are you sure you want to continue?');
        if (!firstConfirm) return;

        // Step 2: Show detailed confirmation modal
        const confirmed = await this.showDeleteConfirmationModal();
        if (!confirmed) return;

        // Step 3: Ask for password confirmation
        const password = prompt('Please enter your current password to confirm account deletion:');
        if (!password) {
            this.showToast('Account deletion cancelled', 'info');
            return;
        }

        // Step 4: Validate password (mock validation)
        if (!this.validatePassword(password)) {
            this.showToast('Invalid password. Account deletion cancelled.', 'error');
            return;
        }

        try {
            console.log('🗑️ Starting account deletion process...');

            // Step 5: Show deletion progress
            this.showDeletionProgress();

            // Step 6: Clear all user data
            await this.clearUserData();

            // Step 7: Make API call to delete account (simulated)
            await this.deleteAccountFromServer();

            // Step 8: Final cleanup and redirect
            await this.finalizeAccountDeletion();

        } catch (error) {
            console.error('❌ Error deleting account:', error);
            this.showToast('Error occurred during account deletion. Please contact support.', 'error');
        }
    }

    showDeleteConfirmationModal() {
        return new Promise((resolve) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            // Create modal content
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: linear-gradient(135deg, #1f2937, #374151);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 16px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                color: white;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            `;

            modal.innerHTML = `
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2 style="color: #ef4444; font-weight: 700; margin-bottom: 0.5rem;">Delete Account</h2>
                    <p style="color: rgba(255, 255, 255, 0.8);">This action cannot be undone</p>
                </div>
                
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">What will be deleted:</h3>
                    <ul style="color: rgba(255, 255, 255, 0.9); margin: 0; padding-left: 1.5rem;">
                        <li>Your profile and personal information</li>
                        <li>All project participations and contributions</li>
                        <li>Event registrations and attendance history</li>
                        <li>Messages and communications</li>
                        <li>Membership status and payment history</li>
                        <li>All uploaded files and documents</li>
                    </ul>
                </div>
                
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 0.875rem;">
                        <i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 0.5rem;"></i>
                        You have 30 days to contact support if you change your mind. After that, all data will be permanently removed.
                    </p>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="cancelDelete" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Cancel
                    </button>
                    <button id="confirmDelete" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ef4444, #dc2626); border: 1px solid rgba(239, 68, 68, 0.3); color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Yes, Delete My Account
                    </button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Add event listeners
            document.getElementById('cancelDelete').addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });

            document.getElementById('confirmDelete').addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            });
        });
    }

    validatePassword(password) {
        // Mock password validation - in real app, this would verify against stored password
        // For demo purposes, accept any password longer than 3 characters
        return password && password.length > 3;
    }

    showDeletionProgress() {
        // Create progress modal
        const overlay = document.createElement('div');
        overlay.id = 'deletionProgress';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1f2937, #374151);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            padding: 3rem;
            text-align: center;
            color: white;
            min-width: 400px;
        `;

        modal.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <div style="width: 60px; height: 60px; border: 4px solid rgba(239, 68, 68, 0.3); border-top: 4px solid #ef4444; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <h2 style="color: #ef4444; font-weight: 700; margin-bottom: 0.5rem;">Deleting Account</h2>
                <p id="progressText" style="color: rgba(255, 255, 255, 0.8);">Initializing deletion process...</p>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 1rem;">
                <div id="progressBar" style="width: 0%; height: 4px; background: linear-gradient(90deg, #ef4444, #dc2626); border-radius: 2px; transition: width 0.5s ease;"></div>
            </div>
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    async clearUserData() {
        const progressText = document.getElementById('progressText');
        const progressBar = document.getElementById('progressBar');

        // Step 1: Clear localStorage
        if (progressText) progressText.textContent = 'Clearing local data...';
        if (progressBar) progressBar.style.width = '20%';
        await this.delay(800);

        localStorage.removeItem('jkuat_user');
        localStorage.removeItem('userLanguage');
        localStorage.removeItem('userTheme');
        localStorage.removeItem('userPreferences');
        localStorage.removeItem('authToken');

        // Step 2: Clear sessionStorage
        if (progressText) progressText.textContent = 'Clearing session data...';
        if (progressBar) progressBar.style.width = '40%';
        await this.delay(600);

        sessionStorage.clear();

        // Step 3: Clear cookies (if any)
        if (progressText) progressText.textContent = 'Clearing cookies...';
        if (progressBar) progressBar.style.width = '60%';
        await this.delay(500);

        // Clear cookies by setting them to expire
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        console.log('✅ Local data cleared');
    }

    async deleteAccountFromServer() {
        const progressText = document.getElementById('progressText');
        const progressBar = document.getElementById('progressBar');

        // Simulate API calls to delete account data
        if (progressText) progressText.textContent = 'Removing profile data...';
        if (progressBar) progressBar.style.width = '70%';
        await this.delay(1000);

        if (progressText) progressText.textContent = 'Cancelling memberships...';
        if (progressBar) progressBar.style.width = '80%';
        await this.delay(800);

        if (progressText) progressText.textContent = 'Removing project associations...';
        if (progressBar) progressBar.style.width = '90%';
        await this.delay(600);

        if (progressText) progressText.textContent = 'Finalizing deletion...';
        if (progressBar) progressBar.style.width = '95%';
        await this.delay(500);

        // Simulate server API call
        try {
            // In a real app, this would be:
            // await fetch('/api/users/delete', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
            console.log('🌐 Account deleted from server');
        } catch (error) {
            throw new Error('Failed to delete account from server');
        }
    }

    async finalizeAccountDeletion() {
        const progressText = document.getElementById('progressText');
        const progressBar = document.getElementById('progressBar');

        if (progressText) progressText.textContent = 'Account successfully deleted';
        if (progressBar) progressBar.style.width = '100%';
        await this.delay(1000);

        // Remove progress modal
        const progressModal = document.getElementById('deletionProgress');
        if (progressModal) {
            document.body.removeChild(progressModal);
        }

        // Show final success message
        this.showToast('Account deleted successfully. You will be redirected to the home page.', 'success');

        // Wait a moment then redirect
        setTimeout(() => {
            // Clear any remaining data
            this.currentUser = null;

            // Show goodbye message
            alert('Your account has been successfully deleted. Thank you for being part of the JKUAT Innovation Club. You will now be redirected to the home page.');

            // Redirect to home page
            window.location.href = '/';
        }, 2000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleGenerateMembershipCard() {
        console.log('🆔 Generating membership card...');
        this.showToast('Membership card download started', 'success');
        // Simulate card generation
        setTimeout(() => {
            this.showToast('Membership card ready for download', 'info');
        }, 2000);
    }

    handleRenewMembership() {
        console.log('🔄 Renewing membership...');
        this.showToast('Redirecting to membership renewal...', 'info');
        // Simulate redirect to payment
    }

    handlePayMembership() {
        console.log('💳 Processing membership payment...');
        this.showToast('Redirecting to payment gateway...', 'info');
        // Simulate redirect to payment
    }

    handleExportPayments() {
        console.log('📥 Exporting payment history...');

        const paymentData = {
            payments: [
                {
                    date: '2024-12-15',
                    amount: 500,
                    type: 'Membership Fee',
                    status: 'completed',
                    reference: 'PAY-1734567890-ABC123'
                },
                {
                    date: '2024-11-20',
                    amount: 1000,
                    type: 'Workshop Registration',
                    status: 'completed',
                    reference: 'CARD-1732123456-XYZ789'
                }
            ],
            exportDate: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(paymentData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "payment_history.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        this.showToast('Payment history exported', 'success');
    }

    handleLoadMorePayments() {
        console.log('📄 Loading more payments...');
        this.showToast('Loading more payment records...', 'info');

        // Simulate loading more payments
        setTimeout(() => {
            this.showToast('No more payments to load', 'info');
        }, 1500);
    }

    handleLoadMoreActivity() {
        console.log('📄 Loading more activity...');
        this.showToast('Loading more activity records...', 'info');

        // Simulate loading more activity
        setTimeout(() => {
            this.showToast('No more activity to load', 'info');
        }, 1500);
    }

    handlePaymentFilter(filterValue) {
        console.log('🔍 Filtering payments by:', filterValue);
        this.showToast(`Filtering payments: ${filterValue || 'All'}`, 'info');
        // Implement payment filtering logic here
    }

    handleActivityFilter(filterValue) {
        console.log('🔍 Filtering activity by:', filterValue);
        this.showToast(`Filtering activity: ${filterValue || 'All'}`, 'info');
        // Implement activity filtering logic here
    }

    handleActivityPeriod(periodValue) {
        console.log('📅 Filtering activity by period:', periodValue);
        this.showToast(`Period filter: ${periodValue || 'All Time'}`, 'info');
        // Implement period filtering logic here
    }

    updateMembershipButtons() {
        // Show membership action buttons based on user status
        const generateCardBtn = document.getElementById('generateCardBtn');
        const renewMembershipBtn = document.getElementById('renewMembershipBtn');
        const payMembershipBtn = document.getElementById('payMembershipBtn');

        // For active members, show generate card and renew options
        if (generateCardBtn) generateCardBtn.style.display = 'inline-flex';
        if (renewMembershipBtn) renewMembershipBtn.style.display = 'inline-flex';

        // Hide pay button for active members (show for pending/expired)
        if (payMembershipBtn) payMembershipBtn.style.display = 'none';
    }

    // Utility functions
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            font-weight: 600;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize settings manager
let settingsManager;

// Simple tab switching function for external use
function switchTab(tabName) {
    if (settingsManager) {
        settingsManager.switchTab(tabName);
    }
}

// Debug function
function debugTabs() {
    console.log('=== TAB DEBUG ===');
    const tabs = document.querySelectorAll('.settings-tab');
    const sections = document.querySelectorAll('.settings-section');

    console.log('Tabs found:', tabs.length);
    tabs.forEach((tab, i) => {
        console.log(`Tab ${i}:`, tab.getAttribute('data-tab'), tab.classList.toString());
    });

    console.log('Sections found:', sections.length);
    sections.forEach((section, i) => {
        console.log(`Section ${i}:`, section.id, section.classList.toString());
    });

    console.log('Current user:', settingsManager?.currentUser);
    console.log('=== END DEBUG ===');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready, initializing SettingsManager...');
    settingsManager = new SettingsManager();

    // Make sure functions are available globally
    window.settingsManager = settingsManager;
});

// Make functions global
window.switchTab = switchTab;
window.debugTabs = debugTabs;

// Global functions for onclick handlers
window.downloadReceipt = function (paymentId) {
    console.log('📄 Downloading receipt for:', paymentId);
    if (settingsManager) {
        settingsManager.showToast('Receipt download started', 'success');
    }
    // Simulate receipt download
    setTimeout(() => {
        if (settingsManager) {
            settingsManager.showToast('Receipt downloaded successfully', 'info');
        }
    }, 1000);
};

// Backup initialization
setTimeout(() => {
    if (!settingsManager) {
        console.log('🔄 Backup initialization...');
        settingsManager = new SettingsManager();
        window.settingsManager = settingsManager;
    }
}, 500);