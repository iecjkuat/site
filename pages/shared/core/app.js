// JKUAT Innovation Club - Core App JavaScript

class JKUATApp {
    constructor() {
        this.user = null;
        this.notifications = null;
        this.init();
    }

    init() {
        // Initialize app
        console.log('JKUAT App initialized');
        this.initializeNotifications();
    }

    initializeNotifications() {
        // Wait for notifications system to be available
        if (window.notifications) {
            this.notifications = window.notifications;
            console.log('Notifications system connected');
        } else {
            // Retry after a short delay
            setTimeout(() => this.initializeNotifications(), 100);
        }
    }

    async apiCall(endpoint, options = {}) {
        try {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const config = { ...defaultOptions, ...options };
            
            const response = await fetch(endpoint, config);
            const data = await response.json();

            if (!response.ok) {
                // Show error notification
                if (this.notifications) {
                    this.notifications.error(`API Error: ${data.message || 'Request failed'}`, {
                        actions: [{
                            label: 'Retry',
                            callback: `window.location.reload()`
                        }]
                    });
                }
                throw new Error(data.message || 'API call failed');
            }

            return data;
        } catch (error) {
            console.error('API call error:', error);
            
            // Show network error notification
            if (this.notifications && error.message.includes('fetch')) {
                this.notifications.warning('Network error. Please check your connection.', {
                    persistent: true,
                    actions: [{
                        label: 'Retry',
                        callback: `window.location.reload()`
                    }]
                });
            }
            
            throw error;
        }
    }

    showToast(message, type = 'info') {
        // Use new notification system if available, fallback to simple toast
        if (this.notifications) {
            this.notifications.show(message, type);
        } else {
            // Simple toast notification fallback
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    // Notification helper methods
    notify(message, type = 'info', options = {}) {
        if (this.notifications) {
            return this.notifications.show(message, type, options);
        } else {
            this.showToast(message, type);
        }
    }

    notifySuccess(message, options = {}) {
        return this.notify(message, 'success', options);
    }

    notifyError(message, options = {}) {
        return this.notify(message, 'error', options);
    }

    notifyWarning(message, options = {}) {
        return this.notify(message, 'warning', options);
    }

    notifyInfo(message, options = {}) {
        return this.notify(message, 'info', options);
    }
}

// Initialize global app instance
window.jkuatApp = new JKUATApp();