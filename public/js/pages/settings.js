// JKUAT Innovation Club - Settings Page

class SettingsPage {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.initializeTabs();
    }

    async loadUserData() {
        try {
            const authManager = window.jkuatApp.getModule('auth');
            this.currentUser = authManager.getCurrentUser();

            if (!this.currentUser) {
                window.location.href = '/';
                return;
            }

            this.populateUserData();
        } catch (error) {
            console.error('Error loading user data:', error);
            window.jkuatApp.showToast('Error loading user data', 'error');
        }
    }

    populateUserData() {
        if (!this.currentUser) return;

        // Profile section
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const bio = document.getElementById('bio');
        const course = document.getElementById('course');
        const year = document.getElementById('year');

        if (firstName) firstName.value = this.currentUser.first_name || '';
        if (lastName) lastName.value = this.currentUser.last_name || '';
        if (email) email.value = this.currentUser.email || '';
        if (phone) phone.value = this.currentUser.phone || '';
        if (bio) bio.value = this.currentUser.bio || '';
        if (course) course.value = this.currentUser.course || '';
        if (year) year.value = this.currentUser.year_of_study || '';

        // Notification Preferences
        const emailNotifications = document.getElementById('emailNotifications');
        const smsNotifications = document.getElementById('smsNotifications');
        const eventReminders = document.getElementById('eventReminders');
        const newsletter = document.getElementById('newsletter');

        if (emailNotifications) emailNotifications.checked = this.currentUser.email_notifications !== false;
        if (smsNotifications) smsNotifications.checked = this.currentUser.sms_notifications !== false;
        if (eventReminders) eventReminders.checked = this.currentUser.event_reminders !== false;
        if (newsletter) newsletter.checked = this.currentUser.newsletter_subscription !== false;

        // App Preferences (Load from local storage)
        const language = document.getElementById('language');
        const theme = document.getElementById('theme');

        if (language) language.value = localStorage.getItem('userLanguage') || 'en';
        if (theme) theme.value = localStorage.getItem('userTheme') || 'system';

        // Apply theme immediately if not set
        if (!document.documentElement.hasAttribute('data-theme')) {
            const savedTheme = localStorage.getItem('userTheme') || 'system';
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }

    bindEvents() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }

        // Notification Preferences form
        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => this.handlePreferencesUpdate(e));
        }

        // Also support the old id if it exists
        const preferencesForm = document.getElementById('preferencesForm');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', (e) => this.handlePreferencesUpdate(e));
        }

        // App Preferences form
        const appPreferencesForm = document.getElementById('appPreferencesForm');
        if (appPreferencesForm) {
            appPreferencesForm.addEventListener('submit', (e) => this.handleAppPreferencesUpdate(e));
        }

        // Privacy form
        const privacyForm = document.getElementById('privacyForm');
        if (privacyForm) {
            privacyForm.addEventListener('submit', (e) => this.handlePrivacyUpdate(e));
        }

        // Data Export
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.handleExportData());
        }

        // Delete account
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.handleDeleteAccount());
        }
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.settings-tab');
        const tabContents = document.querySelectorAll('.settings-section');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.getAttribute('data-tab');

                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    async handleProfileUpdate(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const profileData = Object.fromEntries(formData);

        try {
            const response = await window.jkuatApp.apiCall('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (response.success) {
                window.jkuatApp.showToast('Profile updated successfully', 'success');
                this.currentUser = { ...this.currentUser, ...profileData };
            } else {
                throw new Error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            window.jkuatApp.showToast('Error updating profile', 'error');
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            window.jkuatApp.showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            window.jkuatApp.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const response = await window.jkuatApp.apiCall('/api/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (response.success) {
                window.jkuatApp.showToast('Password changed successfully', 'success');
                e.target.reset();
            } else {
                throw new Error(response.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            window.jkuatApp.showToast('Error changing password', 'error');
        }
    }

    async handlePreferencesUpdate(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const preferences = {
            email_notifications: formData.has('emailNotifications'),
            sms_notifications: formData.has('smsNotifications'),
            event_reminders: formData.has('eventReminders'),
            newsletter_subscription: formData.has('newsletter')
        };

        try {
            const response = await window.jkuatApp.apiCall('/api/auth/preferences', {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });

            if (response.success) {
                window.jkuatApp.showToast('Preferences updated successfully', 'success');
                this.currentUser = { ...this.currentUser, ...preferences };
            } else {
                throw new Error(response.message || 'Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            window.jkuatApp.showToast('Error updating preferences', 'error');
        }
    }

    async handleAppPreferencesUpdate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Save to usage preferences
        localStorage.setItem('userLanguage', data.language);
        localStorage.setItem('userTheme', data.theme);

        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', data.theme);

        window.jkuatApp.showToast('App preferences saved', 'success');
    }

    async handlePrivacyUpdate(e) {
        e.preventDefault();
        // const formData = new FormData(e.target);
        // const data = Object.fromEntries(formData);

        // Mock success for privacy settings (would normally go to backend)
        window.jkuatApp.showToast('Privacy settings updated', 'success');
    }

    async handleExportData() {
        try {
            const response = await window.jkuatApp.apiCall('/api/auth/export-data');

            if (response) {
                // Trigger file download
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "jkuat_club_data_export.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();

                window.jkuatApp.showToast('Data export started', 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            window.jkuatApp.showToast('Failed to export data', 'error');
        }
    }

    async handleDeleteAccount() {
        const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');

        if (!confirmed) return;

        try {
            const response = await window.jkuatApp.apiCall('/api/auth/delete-account', {
                method: 'DELETE'
            });

            if (response.success) {
                window.jkuatApp.showToast('Account deleted successfully', 'success');
                localStorage.removeItem('authToken');
                window.location.href = '/';
            } else {
                throw new Error(response.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            window.jkuatApp.showToast('Error deleting account', 'error');
        }
    }
}

// Make available globally
window.SettingsPage = SettingsPage;