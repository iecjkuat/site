// JKUAT Innovation Club - User Profile Management System

class UserProfileManager {
    constructor() {
        this.currentUser = null;
        this.editMode = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserProfile();
        this.loadMembershipStatus();
        this.loadPaymentHistory();
        this.loadActivityLog();
        this.loadNotificationPreferences();
    }

    bindEvents() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-tab')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Profile editing
        const editBtn = document.getElementById('editProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.toggleEditMode(true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.toggleEditMode(false));
        }

        // Profile picture upload
        const changePictureBtn = document.getElementById('changePictureBtn');
        const pictureInput = document.getElementById('profilePictureInput');
        
        if (changePictureBtn && pictureInput) {
            changePictureBtn.addEventListener('click', () => pictureInput.click());
            pictureInput.addEventListener('change', (e) => this.handleProfilePictureUpload(e));
        }

        // Form submissions
        const profileForm = document.getElementById('profileForm');
        const academicForm = document.getElementById('academicForm');
        const notificationForm = document.getElementById('notificationForm');
        
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }
        
        if (academicForm) {
            academicForm.addEventListener('submit', (e) => this.handleAcademicUpdate(e));
        }
        
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => this.handleNotificationUpdate(e));
        }

        // Filter events
        const paymentFilter = document.getElementById('paymentFilter');
        const activityFilter = document.getElementById('activityFilter');
        
        if (paymentFilter) {
            paymentFilter.addEventListener('change', () => this.filterPayments());
        }
        
        if (activityFilter) {
            activityFilter.addEventListener('change', () => this.filterActivity());
        }

        // Load more buttons
        const loadMorePayments = document.getElementById('loadMorePayments');
        const loadMoreActivity = document.getElementById('loadMoreActivity');
        
        if (loadMorePayments) {
            loadMorePayments.addEventListener('click', () => this.loadMorePayments());
        }
        
        if (loadMoreActivity) {
            loadMoreActivity.addEventListener('click', () => this.loadMoreActivity());
        }

        // Export buttons
        const exportPaymentsBtn = document.getElementById('exportPaymentsBtn');
        if (exportPaymentsBtn) {
            exportPaymentsBtn.addEventListener('click', () => this.exportPayments());
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.background = 'rgba(255, 255, 255, 0.1)';
            tab.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            tab.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.background = 'rgba(16, 185, 129, 0.2)';
            activeTab.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            activeTab.style.color = 'white';
        }

        // Update content sections
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        const activeSection = document.getElementById(tabName);
        if (activeSection) {
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
        }
    }

    async loadUserProfile() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData;
                this.populateProfileData(userData);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    populateProfileData(user) {
        // Update display elements
        const displayName = document.getElementById('displayName');
        const displayEmail = document.getElementById('displayEmail');
        const displayRole = document.getElementById('displayRole');
        const profileInitials = document.getElementById('profileInitials');

        if (displayName) displayName.textContent = user.name || 'User';
        if (displayEmail) displayEmail.textContent = user.email || '';
        if (displayRole) displayRole.textContent = this.getRoleLabel(user.role, user.membership_status);
        if (profileInitials) profileInitials.textContent = this.getInitials(user.name || 'User');

        // Populate form fields
        const fields = {
            'fullName': user.name,
            'email': user.email,
            'phone': user.phone,
            'dateOfBirth': user.date_of_birth,
            'gender': user.gender,
            'linkedinUrl': user.linkedin_url,
            'bio': user.bio,
            'skills': user.skills ? user.skills.join(', ') : '',
            'registrationNumber': user.registration_number,
            'course': user.course,
            'yearOfStudy': user.year_of_study,
            'college': user.college,
            'experienceLevel': user.experience_level
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
            }
        });
    }

    toggleEditMode(enabled) {
        this.editMode = enabled;
        const form = document.getElementById('profileForm');
        const editBtn = document.getElementById('editProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');

        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.disabled = !enabled;
            });
        }

        if (editBtn) {
            editBtn.style.display = enabled ? 'none' : 'inline-flex';
        }
        
        if (cancelBtn) {
            cancelBtn.style.display = enabled ? 'inline-flex' : 'none';
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const profileData = Object.fromEntries(formData.entries());
            
            // Convert skills string to array
            if (profileData.skills) {
                profileData.skills = profileData.skills.split(',').map(s => s.trim()).filter(s => s);
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                this.currentUser = updatedUser;
                this.populateProfileData(updatedUser);
                this.toggleEditMode(false);
                this.showNotification('Profile updated successfully!', 'success');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Failed to update profile. Please try again.', 'error');
        }
    }

    async handleAcademicUpdate(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const academicData = Object.fromEntries(formData.entries());

            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/auth/academic', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(academicData)
            });

            if (response.ok) {
                this.showNotification('Academic information updated successfully!', 'success');
            } else {
                throw new Error('Failed to update academic information');
            }
        } catch (error) {
            console.error('Error updating academic info:', error);
            this.showNotification('Failed to update academic information. Please try again.', 'error');
        }
    }

    async handleNotificationUpdate(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const preferences = {};
            
            // Handle checkboxes
            const checkboxes = e.target.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                preferences[checkbox.name] = checkbox.checked;
            });
            
            // Handle selects
            const selects = e.target.querySelectorAll('select');
            selects.forEach(select => {
                preferences[select.name] = select.value;
            });

            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/auth/preferences', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                this.showNotification('Notification preferences updated successfully!', 'success');
            } else {
                throw new Error('Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            this.showNotification('Failed to update preferences. Please try again.', 'error');
        }
    }

    async handleProfilePictureUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('Image size must be less than 5MB.', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/auth/profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                // Update profile picture display
                const profilePicture = document.getElementById('profilePicture');
                if (profilePicture && result.profilePictureUrl) {
                    profilePicture.style.backgroundImage = `url(${result.profilePictureUrl})`;
                    profilePicture.style.backgroundSize = 'cover';
                    profilePicture.style.backgroundPosition = 'center';
                    profilePicture.innerHTML = ''; // Remove initials
                }
                this.showNotification('Profile picture updated successfully!', 'success');
            } else {
                throw new Error('Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            this.showNotification('Failed to upload profile picture. Please try again.', 'error');
        }
    }

    async loadMembershipStatus() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('/api/membership/status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const membershipData = await response.json();
                this.updateMembershipDisplay(membershipData);
            }
        } catch (error) {
            console.error('Error loading membership status:', error);
        }
    }

    updateMembershipDisplay(membershipData) {
        const { status, membershipCard, expiryDate, user } = membershipData;

        // Update status indicators
        const statusElements = document.querySelectorAll('.membership-status');
        statusElements.forEach(element => {
            element.textContent = this.getStatusLabel(status);
            element.className = `membership-status status-${status.toLowerCase()}`;
        });

        // Update dates
        const memberSince = document.getElementById('memberSince');
        const membershipExpiry = document.querySelectorAll('.membership-expiry');
        
        if (memberSince && user.created_at) {
            memberSince.textContent = new Date(user.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
        }

        membershipExpiry.forEach(element => {
            if (expiryDate) {
                element.textContent = new Date(expiryDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                });
            }
        });

        // Show/hide action buttons
        const generateCardBtn = document.getElementById('generateCardBtn');
        const renewBtn = document.getElementById('renewMembershipBtn');
        const payBtn = document.getElementById('payMembershipBtn');

        if (generateCardBtn) {
            generateCardBtn.style.display = (status === 'active' && membershipCard) ? 'inline-flex' : 'none';
        }

        if (renewBtn) {
            const isExpiringSoon = expiryDate && new Date(expiryDate) - new Date() < 30 * 24 * 60 * 60 * 1000;
            renewBtn.style.display = (status === 'active' && isExpiringSoon) || status === 'expired' ? 'inline-flex' : 'none';
        }

        if (payBtn) {
            payBtn.style.display = status === 'pending' ? 'inline-flex' : 'none';
        }
    }

    async loadPaymentHistory() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('/api/payments?userId=' + this.getCurrentUserId(), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderPaymentHistory(data.payments);
                this.updatePaymentSummary(data.payments);
            }
        } catch (error) {
            console.error('Error loading payment history:', error);
        }
    }

    renderPaymentHistory(payments) {
        const container = document.getElementById('paymentHistory');
        if (!container || !payments.length) return;

        const paymentsHTML = payments.map(payment => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                <div style="width: 50px; height: 50px; background: ${this.getPaymentTypeColor(payment.payment_type)}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="${this.getPaymentTypeIcon(payment.payment_type)}" style="color: ${this.getPaymentTypeColorValue(payment.payment_type)};"></i>
                </div>
                <div style="flex: 1;">
                    <div style="color: white; font-weight: 600; margin-bottom: 0.25rem;">${this.getPaymentTypeLabel(payment.payment_type)}</div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">${new Date(payment.created_at).toLocaleDateString()} • ${payment.payment_method.toUpperCase()}</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">Ref: ${payment.reference_number}</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: ${this.getStatusColor(payment.status)}; font-weight: 700; font-size: 1.125rem;">KSh ${payment.amount}</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">${payment.status}</div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="downloadReceipt('${payment.id}')">
                    <i class="fas fa-receipt"></i>Receipt
                </button>
            </div>
        `).join('');

        container.innerHTML = paymentsHTML;
    }

    updatePaymentSummary(payments) {
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const completedPayments = payments.filter(p => p.status === 'completed');
        const lastPayment = completedPayments.length > 0 ? completedPayments[0] : null;

        // Update summary cards (these would need to be created in the HTML)
        // This is a simplified version - you'd want to update actual DOM elements
        console.log('Payment Summary:', {
            totalPaid,
            transactionCount: payments.length,
            lastPaymentAmount: lastPayment ? lastPayment.amount : 0
        });
    }

    async loadActivityLog() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // This would be a new endpoint to get user activity
            const response = await fetch('/api/users/activity', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const activities = await response.json();
                this.renderActivityLog(activities);
            }
        } catch (error) {
            console.error('Error loading activity log:', error);
        }
    }

    renderActivityLog(activities) {
        const container = document.getElementById('activityTimeline');
        if (!container) return;

        // For now, we'll keep the static content
        // In a real implementation, you'd render dynamic activity data
        console.log('Activity log loaded:', activities);
    }

    async loadNotificationPreferences() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('/api/auth/preferences', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const preferences = await response.json();
                this.populateNotificationPreferences(preferences);
            }
        } catch (error) {
            console.error('Error loading notification preferences:', error);
        }
    }

    populateNotificationPreferences(preferences) {
        Object.entries(preferences).forEach(([key, value]) => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    // Utility methods
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getRoleLabel(role, membershipStatus) {
        const roleLabels = {
            'admin': 'Administrator',
            'executive': 'Executive Member',
            'member': 'Member'
        };
        
        const statusLabels = {
            'active': 'Active',
            'pending': 'Pending',
            'expired': 'Expired',
            'suspended': 'Suspended'
        };

        return `${statusLabels[membershipStatus] || 'Unknown'} ${roleLabels[role] || 'Member'}`;
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Pending Payment',
            'active': 'Active Member',
            'inactive': 'Inactive',
            'suspended': 'Suspended',
            'expired': 'Expired'
        };
        return labels[status] || status;
    }

    getPaymentTypeColor(type) {
        const colors = {
            'membership': 'rgba(16, 185, 129, 0.2)',
            'event': 'rgba(59, 130, 246, 0.2)',
            'renewal': 'rgba(245, 158, 11, 0.2)'
        };
        return colors[type] || 'rgba(139, 92, 246, 0.2)';
    }

    getPaymentTypeColorValue(type) {
        const colors = {
            'membership': '#10b981',
            'event': '#3b82f6',
            'renewal': '#f59e0b'
        };
        return colors[type] || '#8b5cf6';
    }

    getPaymentTypeIcon(type) {
        const icons = {
            'membership': 'fas fa-id-card',
            'event': 'fas fa-calendar',
            'renewal': 'fas fa-refresh'
        };
        return icons[type] || 'fas fa-credit-card';
    }

    getPaymentTypeLabel(type) {
        const labels = {
            'membership': 'Membership Fee Payment',
            'event': 'Event Registration',
            'renewal': 'Membership Renewal'
        };
        return labels[type] || 'Payment';
    }

    getStatusColor(status) {
        const colors = {
            'completed': '#10b981',
            'pending': '#f59e0b',
            'failed': '#ef4444',
            'refunded': '#6b7280'
        };
        return colors[status] || '#6b7280';
    }

    getCurrentUserId() {
        // This would extract user ID from JWT token or current user data
        return this.currentUser?.id || null;
    }

    filterPayments() {
        // Implementation for filtering payments
        const filter = document.getElementById('paymentFilter')?.value;
        console.log('Filtering payments by:', filter);
        // Reload payments with filter
        this.loadPaymentHistory();
    }

    filterActivity() {
        // Implementation for filtering activity
        const filter = document.getElementById('activityFilter')?.value;
        console.log('Filtering activity by:', filter);
        // Reload activity with filter
        this.loadActivityLog();
    }

    loadMorePayments() {
        // Implementation for pagination
        console.log('Loading more payments...');
    }

    loadMoreActivity() {
        // Implementation for pagination
        console.log('Loading more activity...');
    }

    exportPayments() {
        // Implementation for exporting payments
        console.log('Exporting payments...');
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global functions for button clicks
window.downloadReceipt = async function(paymentId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/payments/${paymentId}/receipt`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const receiptData = await response.json();
            // Open receipt in new window or download
            console.log('Receipt data:', receiptData);
            alert('Receipt downloaded successfully!');
        }
    } catch (error) {
        console.error('Error downloading receipt:', error);
        alert('Failed to download receipt');
    }
};

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new UserProfileManager();
});

// Make class available globally
window.UserProfileManager = UserProfileManager;