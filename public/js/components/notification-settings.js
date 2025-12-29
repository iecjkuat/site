// JKUAT Innovation Club - Notification Settings Component
class NotificationSettings {
    constructor() {
        this.preferences = {};
        this.pushSubscription = null;
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Notification Settings...');
        
        try {
            await this.loadPreferences();
            this.createSettingsUI();
            this.setupEventListeners();
            
            console.log('✅ Notification Settings initialized');
        } catch (error) {
            console.error('❌ Error initializing Notification Settings:', error);
        }
    }

    async loadPreferences() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const response = await fetch(`/api/notifications/preferences/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.preferences = await response.json();
            } else {
                // Set default preferences
                this.preferences = {
                    email_enabled: true,
                    push_enabled: true,
                    in_app_enabled: true,
                    sms_enabled: false,
                    event_reminders: true,
                    meeting_schedules: true,
                    payment_reminders: true,
                    announcements: true,
                    idea_comments: true,
                    idea_collaborations: true,
                    election_periods: true,
                    system_alerts: true,
                    email_digest_frequency: 'daily',
                    quiet_hours_start: '22:00',
                    quiet_hours_end: '08:00',
                    timezone: 'Africa/Nairobi'
                };
            }
        } catch (error) {
            console.error('Error loading notification preferences:', error);
        }
    }

    createSettingsUI() {
        const container = document.getElementById('notificationSettingsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="notification-settings">
                <div class="settings-header">
                    <h3>Notification Preferences</h3>
                    <p>Customize how and when you receive notifications</p>
                </div>

                <!-- Channel Settings -->
                <div class="settings-section">
                    <h4><i class="fas fa-broadcast-tower"></i> Notification Channels</h4>
                    <p class="section-description">Choose how you want to receive notifications</p>
                    
                    <div class="settings-grid">
                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="emailEnabled">Email Notifications</label>
                                <small>Receive notifications via email</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="emailEnabled" ${this.preferences.email_enabled ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="pushEnabled">Push Notifications</label>
                                <small>Receive browser push notifications</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="pushEnabled" ${this.preferences.push_enabled ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="inAppEnabled">In-App Notifications</label>
                                <small>Show notifications in the notification center</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="inAppEnabled" ${this.preferences.in_app_enabled ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="smsEnabled">SMS Notifications</label>
                                <small>Receive notifications via SMS (premium feature)</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="smsEnabled" ${this.preferences.sms_enabled ? 'checked' : ''} disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notification Types -->
                <div class="settings-section">
                    <h4><i class="fas fa-list"></i> Notification Types</h4>
                    <p class="section-description">Choose which types of notifications you want to receive</p>
                    
                    <div class="settings-grid">
                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="eventReminders">Event Reminders</label>
                                <small>Notifications about upcoming events you're registered for</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="eventReminders" ${this.preferences.event_reminders ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="meetingSchedules">Meeting Schedules</label>
                                <small>Notifications about scheduled meetings and calls</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="meetingSchedules" ${this.preferences.meeting_schedules ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="paymentReminders">Payment Reminders</label>
                                <small>Notifications about due payments and fees</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="paymentReminders" ${this.preferences.payment_reminders ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="announcements">Announcements</label>
                                <small>Important club announcements and updates</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="announcements" ${this.preferences.announcements ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="ideaComments">Idea Comments</label>
                                <small>Notifications when someone comments on your ideas</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="ideaComments" ${this.preferences.idea_comments ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="ideaCollaborations">Collaboration Requests</label>
                                <small>Notifications about collaboration requests on your ideas</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="ideaCollaborations" ${this.preferences.idea_collaborations ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="electionPeriods">Election Notifications</label>
                                <small>Notifications about club elections and voting periods</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="electionPeriods" ${this.preferences.election_periods ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="systemAlerts">System Alerts</label>
                                <small>Important system notifications and security alerts</small>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="systemAlerts" ${this.preferences.system_alerts ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Email Settings -->
                <div class="settings-section">
                    <h4><i class="fas fa-envelope"></i> Email Settings</h4>
                    <p class="section-description">Configure email notification preferences</p>
                    
                    <div class="settings-grid">
                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="emailDigestFrequency">Email Digest Frequency</label>
                                <small>How often to receive email summaries</small>
                            </div>
                            <div class="setting-control">
                                <select id="emailDigestFrequency" class="setting-select">
                                    <option value="immediate" ${this.preferences.email_digest_frequency === 'immediate' ? 'selected' : ''}>Immediate</option>
                                    <option value="daily" ${this.preferences.email_digest_frequency === 'daily' ? 'selected' : ''}>Daily Digest</option>
                                    <option value="weekly" ${this.preferences.email_digest_frequency === 'weekly' ? 'selected' : ''}>Weekly Digest</option>
                                    <option value="never" ${this.preferences.email_digest_frequency === 'never' ? 'selected' : ''}>Never</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quiet Hours -->
                <div class="settings-section">
                    <h4><i class="fas fa-moon"></i> Quiet Hours</h4>
                    <p class="section-description">Set times when you don't want to receive push notifications</p>
                    
                    <div class="settings-grid">
                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="quietHoursStart">Start Time</label>
                                <small>When quiet hours begin</small>
                            </div>
                            <div class="setting-control">
                                <input type="time" id="quietHoursStart" class="setting-input" value="${this.preferences.quiet_hours_start || '22:00'}">
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="quietHoursEnd">End Time</label>
                                <small>When quiet hours end</small>
                            </div>
                            <div class="setting-control">
                                <input type="time" id="quietHoursEnd" class="setting-input" value="${this.preferences.quiet_hours_end || '08:00'}">
                            </div>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <label for="timezone">Timezone</label>
                                <small>Your local timezone</small>
                            </div>
                            <div class="setting-control">
                                <select id="timezone" class="setting-select">
                                    <option value="Africa/Nairobi" ${this.preferences.timezone === 'Africa/Nairobi' ? 'selected' : ''}>East Africa Time (EAT)</option>
                                    <option value="UTC" ${this.preferences.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
                                    <option value="America/New_York" ${this.preferences.timezone === 'America/New_York' ? 'selected' : ''}>Eastern Time (ET)</option>
                                    <option value="Europe/London" ${this.preferences.timezone === 'Europe/London' ? 'selected' : ''}>Greenwich Mean Time (GMT)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Push Notification Status -->
                <div class="settings-section">
                    <h4><i class="fas fa-mobile-alt"></i> Push Notification Status</h4>
                    <div id="pushNotificationStatus" class="push-status">
                        <div class="status-loading">
                            <div class="spinner"></div>
                            <span>Checking push notification status...</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="settings-actions">
                    <button id="saveNotificationSettings" class="btn btn-primary">
                        <i class="fas fa-save"></i>Save Preferences
                    </button>
                    <button id="testNotification" class="btn btn-outline">
                        <i class="fas fa-bell"></i>Send Test Notification
                    </button>
                    <button id="resetNotificationSettings" class="btn btn-outline">
                        <i class="fas fa-undo"></i>Reset to Defaults
                    </button>
                </div>
            </div>
        `;

        this.addNotificationSettingsStyles();
        this.checkPushNotificationStatus();
    }

    setupEventListeners() {
        // Save settings
        document.getElementById('saveNotificationSettings').addEventListener('click', () => {
            this.savePreferences();
        });

        // Test notification
        document.getElementById('testNotification').addEventListener('click', () => {
            this.sendTestNotification();
        });

        // Reset settings
        document.getElementById('resetNotificationSettings').addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Push notification toggle
        document.getElementById('pushEnabled').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.enablePushNotifications();
            } else {
                this.disablePushNotifications();
            }
        });

        // Auto-save on change
        const inputs = document.querySelectorAll('.notification-settings input, .notification-settings select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.autoSave();
            });
        });
    }

    async savePreferences() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            // Collect form data
            const formData = {
                email_enabled: document.getElementById('emailEnabled').checked,
                push_enabled: document.getElementById('pushEnabled').checked,
                in_app_enabled: document.getElementById('inAppEnabled').checked,
                sms_enabled: document.getElementById('smsEnabled').checked,
                event_reminders: document.getElementById('eventReminders').checked,
                meeting_schedules: document.getElementById('meetingSchedules').checked,
                payment_reminders: document.getElementById('paymentReminders').checked,
                announcements: document.getElementById('announcements').checked,
                idea_comments: document.getElementById('ideaComments').checked,
                idea_collaborations: document.getElementById('ideaCollaborations').checked,
                election_periods: document.getElementById('electionPeriods').checked,
                system_alerts: document.getElementById('systemAlerts').checked,
                email_digest_frequency: document.getElementById('emailDigestFrequency').value,
                quiet_hours_start: document.getElementById('quietHoursStart').value,
                quiet_hours_end: document.getElementById('quietHoursEnd').value,
                timezone: document.getElementById('timezone').value
            };

            const response = await fetch(`/api/notifications/preferences/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.preferences = await response.json();
                this.showNotification('Notification preferences saved successfully!', 'success');
            } else {
                throw new Error('Failed to save preferences');
            }
        } catch (error) {
            console.error('Error saving notification preferences:', error);
            this.showNotification('Failed to save preferences. Please try again.', 'error');
        }
    }

    async autoSave() {
        // Debounced auto-save
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.savePreferences();
        }, 1000);
    }

    async sendTestNotification() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    type: 'system_alert'
                })
            });

            if (response.ok) {
                this.showNotification('Test notification sent! Check your enabled channels.', 'success');
            } else {
                throw new Error('Failed to send test notification');
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            this.showNotification('Failed to send test notification.', 'error');
        }
    }

    resetToDefaults() {
        if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
            // Reset form to defaults
            document.getElementById('emailEnabled').checked = true;
            document.getElementById('pushEnabled').checked = true;
            document.getElementById('inAppEnabled').checked = true;
            document.getElementById('smsEnabled').checked = false;
            document.getElementById('eventReminders').checked = true;
            document.getElementById('meetingSchedules').checked = true;
            document.getElementById('paymentReminders').checked = true;
            document.getElementById('announcements').checked = true;
            document.getElementById('ideaComments').checked = true;
            document.getElementById('ideaCollaborations').checked = true;
            document.getElementById('electionPeriods').checked = true;
            document.getElementById('systemAlerts').checked = true;
            document.getElementById('emailDigestFrequency').value = 'daily';
            document.getElementById('quietHoursStart').value = '22:00';
            document.getElementById('quietHoursEnd').value = '08:00';
            document.getElementById('timezone').value = 'Africa/Nairobi';

            this.savePreferences();
        }
    }

    async checkPushNotificationStatus() {
        const statusContainer = document.getElementById('pushNotificationStatus');
        
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                statusContainer.innerHTML = `
                    <div class="status-error">
                        <i class="fas fa-times-circle"></i>
                        <span>Push notifications are not supported in this browser</span>
                    </div>
                `;
                return;
            }

            const permission = Notification.permission;
            const registration = await navigator.serviceWorker.getRegistration();
            const subscription = registration ? await registration.pushManager.getSubscription() : null;

            let statusHTML = '';
            
            if (permission === 'granted' && subscription) {
                statusHTML = `
                    <div class="status-success">
                        <i class="fas fa-check-circle"></i>
                        <span>Push notifications are enabled and working</span>
                    </div>
                `;
            } else if (permission === 'denied') {
                statusHTML = `
                    <div class="status-error">
                        <i class="fas fa-times-circle"></i>
                        <span>Push notifications are blocked. Please enable them in your browser settings.</span>
                    </div>
                `;
            } else {
                statusHTML = `
                    <div class="status-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Push notifications are not set up. Enable them above to receive push notifications.</span>
                    </div>
                `;
            }

            statusContainer.innerHTML = statusHTML;
        } catch (error) {
            console.error('Error checking push notification status:', error);
            statusContainer.innerHTML = `
                <div class="status-error">
                    <i class="fas fa-times-circle"></i>
                    <span>Unable to check push notification status</span>
                </div>
            `;
        }
    }

    async enablePushNotifications() {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // Initialize push notifications through notification center
                if (window.notificationCenter) {
                    await window.notificationCenter.initializePushNotifications();
                }
                this.checkPushNotificationStatus();
                this.showNotification('Push notifications enabled successfully!', 'success');
            } else {
                document.getElementById('pushEnabled').checked = false;
                this.showNotification('Push notification permission denied.', 'error');
            }
        } catch (error) {
            console.error('Error enabling push notifications:', error);
            document.getElementById('pushEnabled').checked = false;
            this.showNotification('Failed to enable push notifications.', 'error');
        }
    }

    async disablePushNotifications() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const registration = await navigator.serviceWorker.getRegistration();
            const subscription = registration ? await registration.pushManager.getSubscription() : null;

            if (subscription) {
                await fetch('/api/notifications/push/unsubscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        endpoint: subscription.endpoint
                    })
                });
            }

            this.checkPushNotificationStatus();
            this.showNotification('Push notifications disabled.', 'success');
        } catch (error) {
            console.error('Error disabling push notifications:', error);
            this.showNotification('Failed to disable push notifications.', 'error');
        }
    }

    showNotification(message, type = 'success') {
        // Use the global notification system if available
        if (window.notificationCenter) {
            window.notificationCenter.showNotification(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }

    addNotificationSettingsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-settings {
                max-width: 800px;
                margin: 0 auto;
            }

            .settings-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .settings-header h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: white;
                margin-bottom: 0.5rem;
            }

            .settings-header p {
                color: rgba(255, 255, 255, 0.8);
            }

            .settings-section {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 2rem;
            }

            .settings-section h4 {
                color: white;
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .section-description {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.875rem;
                margin-bottom: 1.5rem;
            }

            .settings-grid {
                display: grid;
                gap: 1rem;
            }

            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .setting-info label {
                color: white;
                font-weight: 500;
                display: block;
                margin-bottom: 0.25rem;
            }

            .setting-info small {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.8125rem;
            }

            .setting-control {
                flex-shrink: 0;
            }

            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.2);
                transition: 0.3s;
                border-radius: 24px;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }

            input:checked + .toggle-slider {
                background-color: #10b981;
            }

            input:checked + .toggle-slider:before {
                transform: translateX(26px);
            }

            .setting-select,
            .setting-input {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 0.5rem;
                color: white;
                min-width: 150px;
            }

            .setting-select:focus,
            .setting-input:focus {
                outline: none;
                border-color: #10b981;
                background: rgba(255, 255, 255, 0.15);
            }

            .push-status {
                padding: 1rem;
                border-radius: 12px;
            }

            .status-success {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                color: #10b981;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .status-warning {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: #f59e0b;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .status-error {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                color: #ef4444;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .status-loading {
                color: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .settings-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            @media (max-width: 768px) {
                .setting-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .setting-control {
                    align-self: flex-end;
                }

                .settings-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize notification settings when the settings page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('notificationSettingsContainer')) {
        window.notificationSettings = new NotificationSettings();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSettings;
}