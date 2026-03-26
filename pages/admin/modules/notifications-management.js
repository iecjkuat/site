/**
 * Admin Notification Management Module
 * Handles notification creation, campaigns, templates, and analytics
 */

class NotificationManagement {
    constructor(adminDashboard) {
        this.admin = adminDashboard;
        this.currentView = 'overview';
        this.notifications = [];
        this.campaigns = [];
        this.templates = [];
        this.stats = null;
        this.isSending = false;
        this.isCreatingCampaign = false;
    }

    async init() {
        console.log('📢 Initializing Notification Management...');
        await this.loadOverview();
    }

    async loadOverview() {
        const container = document.getElementById('notificationContent');
        if (!container) return;

        // Show loading state
        this.showLoading(container);

        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Fetch all data in parallel with Promise.allSettled for resilience
            const [statsRes, notificationsRes, campaignsRes] = await Promise.allSettled([
                this.fetchWithRetry('/api/admin/notifications/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                this.fetchWithRetry('/api/admin/notifications?limit=10', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                this.fetchWithRetry('/api/admin/notifications/campaigns?limit=5', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            // Process stats
            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                this.stats = await statsRes.value.json();
                console.log('✅ Stats loaded:', this.stats);
            } else {
                console.warn('⚠️ Failed to load stats, using defaults');
                this.stats = {
                    total_sent: 0,
                    total_delivered: 0,
                    total_read: 0,
                    delivery_rate: 0,
                    read_rate: 0
                };
            }

            // Process notifications
            if (notificationsRes.status === 'fulfilled' && notificationsRes.value.ok) {
                const data = await notificationsRes.value.json();
                this.notifications = data.notifications || [];
                console.log('✅ Notifications loaded:', this.notifications.length);
            } else {
                console.warn('⚠️ Failed to load notifications');
                this.notifications = [];
            }

            // Process campaigns
            if (campaignsRes.status === 'fulfilled' && campaignsRes.value.ok) {
                const data = await campaignsRes.value.json();
                this.campaigns = data.campaigns || [];
                console.log('✅ Campaigns loaded:', this.campaigns.length);
            } else {
                console.warn('⚠️ Failed to load campaigns');
                this.campaigns = [];
            }

            this.renderOverview();
        } catch (error) {
            console.error('❌ Failed to load notification data:', error);
            this.showError(container, error.message);
        }
    }

    showLoading(container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #3b82f6;"></i>
                <p style="color: white; margin-top: 1rem; font-size: 1.1rem;">Loading notification data...</p>
            </div>
        `;
    }

    showError(container, message) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
                <p style="color: white; margin-top: 1rem; font-size: 1.1rem;">Failed to load notification data</p>
                <p style="color: rgba(255,255,255,0.7); margin-top: 0.5rem;">${this.escapeHTML(message)}</p>
                <button onclick="window.notificationMgmt.loadOverview()" class="btn btn-primary" style="margin-top: 1.5rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async fetchWithRetry(url, options, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                
                // Don't retry on 4xx errors (client errors)
                if (response.status >= 400 && response.status < 500) {
                    return response;
                }
                
                if (response.ok) {
                    return response;
                }
                
                // Retry on 5xx errors (server errors)
                if (i < maxRetries - 1) {
                    const delay = 1000 * Math.pow(2, i); // Exponential backoff
                    console.log(`⏳ Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                // Network error, retry
                const delay = 1000 * Math.pow(2, i);
                console.log(`⏳ Network error, retry ${i + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Max retries exceeded');
    }

    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    renderOverview() {
        const container = document.getElementById('notificationContent');
        if (!container) return;

        const stats = this.stats || {
            total_sent: 0,
            total_delivered: 0,
            total_read: 0,
            delivery_rate: 0,
            read_rate: 0
        };

        container.innerHTML = `
            <div class="notification-management">
                <!-- Header -->
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="margin: 0; color: white;"><i class="fas fa-bell"></i> Notification Management</h2>
                        <p style="margin: 0.5rem 0 0 0; color: rgba(255,255,255,0.7);">Manage system notifications and campaigns</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-outline" data-action="show-templates">
                            <i class="fas fa-file-alt"></i> Templates
                        </button>
                        <button class="btn btn-primary" data-action="send-notification">
                            <i class="fas fa-plus"></i> Send Notification
                        </button>
                        <button class="btn btn-success" data-action="create-campaign">
                            <i class="fas fa-bullhorn"></i> Create Campaign
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 1rem; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: rgba(59, 130, 246, 0.2); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-paper-plane" style="color: #3b82f6; font-size: 1.5rem;"></i>
                            </div>
                            <div>
                                <h3 style="margin: 0; color: white; font-size: 2rem;">${stats.total_sent || 0}</h3>
                                <p style="margin: 0; color: rgba(255,255,255,0.7);">Total Sent</p>
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 1rem; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: rgba(16, 185, 129, 0.2); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.5rem;"></i>
                            </div>
                            <div>
                                <h3 style="margin: 0; color: white; font-size: 2rem;">${stats.total_delivered || 0}</h3>
                                <p style="margin: 0; color: rgba(255,255,255,0.7);">Delivered</p>
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 1rem; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: rgba(139, 92, 246, 0.2); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-eye" style="color: #8b5cf6; font-size: 1.5rem;"></i>
                            </div>
                            <div>
                                <h3 style="margin: 0; color: white; font-size: 2rem;">${stats.total_read || 0}</h3>
                                <p style="margin: 0; color: rgba(255,255,255,0.7);">Read</p>
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 1rem; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: rgba(245, 158, 11, 0.2); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-percentage" style="color: #f59e0b; font-size: 1.5rem;"></i>
                            </div>
                            <div>
                                <h3 style="margin: 0; color: white; font-size: 2rem;">${stats.delivery_rate || 0}%</h3>
                                <p style="margin: 0; color: rgba(255,255,255,0.7);">Delivery Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 3rem; text-align: center;">
                    <i class="fas fa-bell-slash" style="font-size: 4rem; color: rgba(255,255,255,0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: white; margin-bottom: 0.5rem;">No Notifications Yet</h3>
                    <p style="color: rgba(255,255,255,0.7); margin-bottom: 2rem;">Start by sending your first notification or creating a campaign</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-primary" data-action="send-notification">
                            <i class="fas fa-plus"></i> Send Notification
                        </button>
                        <button class="btn btn-success" data-action="create-campaign">
                            <i class="fas fa-bullhorn"></i> Create Campaign
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event delegation for buttons
        this.attachButtonListeners(container);
    }

    attachButtonListeners(container) {
        // Use event delegation to handle all button clicks
        container.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            
            switch(action) {
                case 'send-notification':
                    this.showCreateNotificationModal();
                    break;
                case 'create-campaign':
                    this.showCreateCampaignModal();
                    break;
                case 'show-templates':
                    this.showView('templates');
                    break;
            }
        });
    }

    showCreateNotificationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop active';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        
        modal.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.2); border-radius: 1rem; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; margin: 0;"><i class="fas fa-bell"></i> Send Notification</h2>
                    <button class="modal-close-btn" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>

                <form id="createNotificationForm">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Notification Type *</label>
                        <select name="type" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;">
                            <option value="">Select type...</option>
                            <option value="announcement">Announcement</option>
                            <option value="event_reminder">Event Reminder</option>
                            <option value="payment_reminder">Payment Reminder</option>
                            <option value="system_alert">System Alert</option>
                            <option value="membership_update">Membership Update</option>
                            <option value="project_update">Project Update</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Recipient Type *</label>
                        <select name="recipient_type" required onchange="if(window.notificationMgmt) window.notificationMgmt.toggleRecipientInput(this.value);" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;">
                            <option value="single">Single User</option>
                            <option value="all">All Users</option>
                            <option value="role">By Role</option>
                            <option value="status">By Membership Status</option>
                        </select>
                    </div>

                    <div id="recipientInput" style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">User Email</label>
                        <input type="email" name="recipient_email" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="user@example.com">
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Priority *</label>
                        <select name="priority" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Title *</label>
                        <input type="text" name="title" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="Notification title">
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Message *</label>
                        <textarea name="message" required rows="4" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="Notification message"></textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Action URL (optional)</label>
                        <input type="url" name="action_url" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="https://...">
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Action Button Text (optional)</label>
                        <input type="text" name="action_text" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="View Details">
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline modal-cancel-btn">Cancel</button>
                        <button type="button" class="btn btn-primary modal-send-btn">
                            <i class="fas fa-paper-plane"></i> Send Notification
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for modal buttons
        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-send-btn').addEventListener('click', () => this.sendNotification());
        
        // Handle recipient type change
        const recipientTypeSelect = modal.querySelector('select[name="recipient_type"]');
        recipientTypeSelect.addEventListener('change', (e) => this.toggleRecipientInput(e.target.value));
    }

    toggleRecipientInput(type) {
        const recipientInput = document.getElementById('recipientInput');
        if (!recipientInput) return;

        const inputStyle = 'width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;';
        const labelStyle = 'display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;';

        switch(type) {
            case 'single':
                recipientInput.innerHTML = `
                    <label style="${labelStyle}">User Email</label>
                    <input type="email" name="recipient_email" style="${inputStyle}" placeholder="user@example.com" required>
                `;
                break;
            case 'role':
                recipientInput.innerHTML = `
                    <label style="${labelStyle}">Role</label>
                    <select name="recipient_role" required style="${inputStyle}">
                        <option value="member">Members</option>
                        <option value="admin">Admins</option>
                        <option value="moderator">Moderators</option>
                    </select>
                `;
                break;
            case 'status':
                recipientInput.innerHTML = `
                    <label style="${labelStyle}">Membership Status</label>
                    <select name="recipient_status" required style="${inputStyle}">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                    </select>
                `;
                break;
            case 'all':
                recipientInput.innerHTML = '<p style="color: rgba(255,255,255,0.7);">Notification will be sent to all users</p>';
                break;
        }
    }

    validateNotificationData(data) {
        const errors = [];

        // Validate type
        const validTypes = ['announcement', 'event_reminder', 'payment_reminder', 'system_alert', 'membership_update', 'project_update'];
        if (!data.type || !validTypes.includes(data.type)) {
            errors.push('Invalid notification type');
        }

        // Validate title
        if (!data.title || typeof data.title !== 'string') {
            errors.push('Title is required');
        } else if (data.title.length < 3) {
            errors.push('Title must be at least 3 characters');
        } else if (data.title.length > 200) {
            errors.push('Title must not exceed 200 characters');
        }

        // Validate message
        if (!data.message || typeof data.message !== 'string') {
            errors.push('Message is required');
        } else if (data.message.length < 10) {
            errors.push('Message must be at least 10 characters');
        } else if (data.message.length > 5000) {
            errors.push('Message must not exceed 5000 characters');
        }

        // Validate priority
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!data.priority || !validPriorities.includes(data.priority)) {
            errors.push('Invalid priority level');
        }

        // Validate action URL if provided
        if (data.action_url && data.action_url.trim()) {
            try {
                new URL(data.action_url);
                if (!data.action_url.match(/^https?:\/\/.+/)) {
                    errors.push('Action URL must start with http:// or https://');
                }
            } catch (e) {
                errors.push('Invalid action URL format');
            }
        }

        // Validate recipient type
        const validRecipientTypes = ['single', 'all', 'role', 'status'];
        if (!data.recipient_type || !validRecipientTypes.includes(data.recipient_type)) {
            errors.push('Invalid recipient type');
        }

        // Validate recipient-specific fields
        if (data.recipient_type === 'single' && !data.recipient_email) {
            errors.push('Recipient email is required for single user notifications');
        }
        if (data.recipient_type === 'role' && !data.recipient_role) {
            errors.push('Recipient role is required');
        }
        if (data.recipient_type === 'status' && !data.recipient_status) {
            errors.push('Recipient status is required');
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        return true;
    }

    validateCampaignData(data) {
        const errors = [];

        // Validate name
        if (!data.name || typeof data.name !== 'string') {
            errors.push('Campaign name is required');
        } else if (data.name.length < 3) {
            errors.push('Campaign name must be at least 3 characters');
        } else if (data.name.length > 100) {
            errors.push('Campaign name must not exceed 100 characters');
        }

        // Validate type
        const validTypes = ['announcement', 'newsletter', 'event_promotion', 'membership_drive'];
        if (!data.type || !validTypes.includes(data.type)) {
            errors.push('Invalid campaign type');
        }

        // Validate title
        if (!data.title || typeof data.title !== 'string') {
            errors.push('Title is required');
        } else if (data.title.length < 3) {
            errors.push('Title must be at least 3 characters');
        } else if (data.title.length > 200) {
            errors.push('Title must not exceed 200 characters');
        }

        // Validate message
        if (!data.message || typeof data.message !== 'string') {
            errors.push('Message is required');
        } else if (data.message.length < 10) {
            errors.push('Message must be at least 10 characters');
        } else if (data.message.length > 5000) {
            errors.push('Message must not exceed 5000 characters');
        }

        // Validate action URL if provided
        if (data.action_url && data.action_url.trim()) {
            try {
                new URL(data.action_url);
                if (!data.action_url.match(/^https?:\/\/.+/)) {
                    errors.push('Action URL must start with http:// or https://');
                }
            } catch (e) {
                errors.push('Invalid action URL format');
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        return true;
    }

    async sendNotification() {
        // Prevent double submission
        if (this.isSending) {
            alert('⏳ Already sending, please wait...');
            return;
        }

        const form = document.getElementById('createNotificationForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = {
            type: formData.get('type'),
            title: formData.get('title'),
            message: formData.get('message'),
            priority: formData.get('priority'),
            action_url: formData.get('action_url'),
            action_text: formData.get('action_text'),
            recipient_type: formData.get('recipient_type'),
            recipient_email: formData.get('recipient_email'),
            recipient_role: formData.get('recipient_role'),
            recipient_status: formData.get('recipient_status')
        };

        // Validate data
        try {
            this.validateNotificationData(data);
        } catch (error) {
            alert('❌ Validation Error:\n\n' + error.message);
            return;
        }

        // Set sending state
        this.isSending = true;
        const sendBtn = document.querySelector('.modal-send-btn');
        const originalText = sendBtn.innerHTML;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const token = localStorage.getItem('authToken');
            const response = await this.fetchWithRetry('/api/admin/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send notification');
            }

            const result = await response.json();
            alert(`✅ Notification sent successfully to ${result.count} user(s)!`);
            document.querySelector('.modal-backdrop').remove();
            this.loadOverview();
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('❌ Failed to send notification:\n\n' + error.message);
            // Re-enable button on error
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
        } finally {
            this.isSending = false;
        }
    }

    showCreateCampaignModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop active';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        
        modal.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.2); border-radius: 1rem; padding: 2rem; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; margin: 0;"><i class="fas fa-bullhorn"></i> Create Campaign</h2>
                    <button class="modal-close-btn" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>

                <form id="createCampaignForm">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Campaign Name *</label>
                        <input type="text" name="name" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="e.g., Monthly Newsletter">
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Description</label>
                        <textarea name="description" rows="2" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="Campaign description"></textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Campaign Type *</label>
                        <select name="type" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;">
                            <option value="announcement">Announcement</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="event_promotion">Event Promotion</option>
                            <option value="membership_drive">Membership Drive</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Title *</label>
                        <input type="text" name="title" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="Campaign title">
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Message *</label>
                        <textarea name="message" required rows="5" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="Campaign message"></textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Action URL (optional)</label>
                        <input type="url" name="action_url" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" placeholder="https://...">
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline modal-cancel-btn">Cancel</button>
                        <button type="button" class="btn btn-success modal-campaign-btn">
                            <i class="fas fa-paper-plane"></i> Create & Send
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for modal buttons
        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-campaign-btn').addEventListener('click', () => this.createAndSendCampaign());
    }

    async createAndSendCampaign() {
        // Prevent double submission
        if (this.isCreatingCampaign) {
            alert('⏳ Already creating campaign, please wait...');
            return;
        }

        const form = document.getElementById('createCampaignForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            type: formData.get('type'),
            title: formData.get('title'),
            message: formData.get('message'),
            action_url: formData.get('action_url'),
            target_audience: {}
        };

        // Validate data
        try {
            this.validateCampaignData(data);
        } catch (error) {
            alert('❌ Validation Error:\n\n' + error.message);
            return;
        }

        // Set creating state
        this.isCreatingCampaign = true;
        const campaignBtn = document.querySelector('.modal-campaign-btn');
        const originalText = campaignBtn.innerHTML;
        campaignBtn.disabled = true;
        campaignBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        try {
            const token = localStorage.getItem('authToken');
            
            // Create campaign
            const createResponse = await this.fetchWithRetry('/api/admin/notifications/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || 'Failed to create campaign');
            }

            const campaign = await createResponse.json();
            console.log('✅ Campaign created:', campaign.id);

            // Update button text
            campaignBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Send campaign
            const sendResponse = await this.fetchWithRetry(`/api/admin/notifications/campaigns/${campaign.id}/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.getCSRFToken()
                }
            });

            if (!sendResponse.ok) {
                const error = await sendResponse.json();
                throw new Error(error.error || 'Failed to send campaign');
            }

            const result = await sendResponse.json();
            alert(`✅ Campaign sent successfully to ${result.recipients} user(s)!`);
            document.querySelector('.modal-backdrop').remove();
            this.loadOverview();
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('❌ Failed to create campaign:\n\n' + error.message);
            // Re-enable button on error
            campaignBtn.disabled = false;
            campaignBtn.innerHTML = originalText;
        } finally {
            this.isCreatingCampaign = false;
        }
    }

    async loadTemplates() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await this.fetchWithRetry('/api/admin/notifications/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                this.templates = data.templates || [];
                console.log('✅ Templates loaded:', this.templates.length);
                this.renderTemplates();
            } else {
                throw new Error('Failed to load templates');
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
            const container = document.getElementById('notificationContent');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 4rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
                        <p style="color: white; margin-top: 1rem;">Failed to load templates</p>
                        <button onclick="window.notificationMgmt.loadTemplates()" class="btn btn-primary" style="margin-top: 1rem;">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    renderTemplates() {
        const container = document.getElementById('notificationContent');
        if (!container) return;

        if (!this.templates || this.templates.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem;">
                    <i class="fas fa-file-alt" style="font-size: 4rem; color: rgba(255,255,255,0.3);"></i>
                    <h3 style="color: white; margin-top: 1rem;">No Templates Yet</h3>
                    <p style="color: rgba(255,255,255,0.7);">Create reusable notification templates</p>
                    <button class="btn btn-primary" data-action="create-template" style="margin-top: 1.5rem;">
                        <i class="fas fa-plus"></i> Create Template
                    </button>
                </div>
            `;
            this.attachTemplateListeners(container);
            return;
        }

        container.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem;">
                    <h3 style="color: white; margin: 0;">
                        <i class="fas fa-file-alt"></i> Notification Templates
                    </h3>
                    <div style="display: flex; gap: 1rem; flex: 1; max-width: 600px;">
                        <input 
                            type="text" 
                            placeholder="Search templates..." 
                            class="search-input"
                            data-action="search-templates"
                            style="flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;"
                        >
                        <button class="btn btn-primary" data-action="create-template">
                            <i class="fas fa-plus"></i> Create Template
                        </button>
                    </div>
                </div>
                <div id="templatesGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                    ${this.templates.map(template => this.renderTemplateCard(template)).join('')}
                </div>
            </div>
        `;

        this.attachTemplateListeners(container);
    }

    attachTemplateListeners(container) {
        // Search functionality
        const searchInput = container.querySelector('[data-action="search-templates"]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTemplates(e.target.value));
        }

        // Event delegation for all template actions
        container.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const templateId = button.getAttribute('data-template-id');

            switch(action) {
                case 'create-template':
                    this.showCreateTemplateModal();
                    break;
                case 'view-template':
                    this.viewTemplate(templateId);
                    break;
                case 'edit-template':
                    this.editTemplate(templateId);
                    break;
                case 'delete-template':
                    this.deleteTemplate(templateId);
                    break;
            }
        });
    }

    filterTemplates(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const grid = document.getElementById('templatesGrid');
        if (!grid) return;

        if (!term) {
            // Show all templates
            grid.innerHTML = this.templates.map(template => this.renderTemplateCard(template)).join('');
            return;
        }

        // Filter templates
        const filtered = this.templates.filter(template => 
            template.name.toLowerCase().includes(term) ||
            (template.description && template.description.toLowerCase().includes(term)) ||
            template.type.toLowerCase().includes(term)
        );

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: rgba(255,255,255,0.3);"></i>
                    <p style="color: rgba(255,255,255,0.7); margin-top: 1rem;">No templates found matching "${this.escapeHTML(searchTerm)}"</p>
                </div>
            `;
        } else {
            grid.innerHTML = filtered.map(template => this.renderTemplateCard(template)).join('');
        }
    }

    renderTemplateCard(template) {
        return `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h4 style="color: white; margin: 0;">${this.escapeHTML(template.name)}</h4>
                    <span class="badge badge-${template.is_active ? 'green' : 'gray'}">
                        ${template.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 1rem;">
                    ${this.escapeHTML(template.description || 'No description')}
                </p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-outline" data-action="view-template" data-template-id="${template.id}" style="flex: 1;">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-primary" data-action="edit-template" data-template-id="${template.id}" style="flex: 1;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
    }

    showCreateTemplateModal() {
        alert('Template creation coming soon! This will allow you to create reusable notification templates.');
    }

    viewTemplate(id) {
        const template = this.templates.find(t => t.id === id);
        if (!template) {
            alert('Template not found');
            return;
        }
        alert(`Template: ${template.name}\n\nType: ${template.type}\nChannel: ${template.channel}\n\nMessage:\n${template.message_template}`);
    }

    editTemplate(id) {
        alert('Template editing coming soon! Template ID: ' + id);
    }

    async deleteTemplate(id) {
        if (!confirm('Delete this template? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await this.fetchWithRetry(`/api/admin/notifications/templates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.getCSRFToken()
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete template');
            }

            alert('✅ Template deleted successfully');
            this.loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('❌ Failed to delete template:\n\n' + error.message);
        }
    }

    showView(view) {
        console.log('Switching to view:', view);
        if (view === 'templates') {
            this.loadTemplates();
        }
    }
}

// Export for use in admin dashboard
window.NotificationManagement = NotificationManagement;
