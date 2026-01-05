// JKUAT Innovation Club - Global Notification System

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000; // 5 seconds
        this.init();
    }

    init() {
        this.createContainer();
        this.createPanel();
        this.loadStoredNotifications();
        this.bindEvents();
        this.updateBadge();
    }

    createContainer() {
        // Create notification container if it doesn't exist
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    createPanel() {
        // Create notification panel for the bell dropdown
        this.panel = document.getElementById('notification-panel');
        if (!this.panel) {
            this.panel = document.createElement('div');
            this.panel.id = 'notification-panel';
            this.panel.className = 'notification-panel';
            this.panel.style.display = 'none';
            this.panel.innerHTML = `
                <div class="notification-panel-header">
                    <h3>Notifications</h3>
                    <button class="clear-all-btn" onclick="window.notifications.clearAll()">
                        Clear All
                    </button>
                </div>
                <div class="notification-panel-content" id="notification-panel-content">
                    <div class="no-notifications">
                        <i class="fas fa-bell-slash"></i>
                        <p>No notifications</p>
                    </div>
                </div>
            `;
            document.body.appendChild(this.panel);
        }
    }

    // Show a notification
    show(message, type = 'info', options = {}) {
        const notification = {
            id: this.generateId(),
            message,
            type, // 'success', 'error', 'warning', 'info'
            timestamp: new Date(),
            duration: options.duration || this.defaultDuration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            icon: options.icon || this.getDefaultIcon(type)
        };

        this.notifications.unshift(notification);
        this.renderNotification(notification);
        this.manageNotificationLimit();

        // Auto-remove if not persistent
        if (!notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        // Store in localStorage for persistence
        this.storeNotifications();
        this.updateBadge();
        this.updatePanel();

        return notification.id;
    }

    // Convenience methods for different types
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { ...options, duration: options.duration || 8000 });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // Show system notifications (events, payments, etc.)
    system(message, options = {}) {
        return this.show(message, 'system', {
            ...options,
            icon: 'fas fa-bell',
            persistent: true
        });
    }

    // Remove a notification
    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            const element = document.getElementById(`notification-${id}`);
            if (element) {
                element.classList.add('notification-exit');
                setTimeout(() => {
                    element.remove();
                }, 300);
            }
            
            this.notifications = this.notifications.filter(n => n.id !== id);
            this.storeNotifications();
            this.updateBadge();
            this.updatePanel();
        }
    }

    // Clear all notifications
    clear() {
        this.notifications = [];
        this.container.innerHTML = '';
        this.storeNotifications();
        this.updateBadge();
        this.updatePanel();
    }

    // Clear all notifications (alias for panel)
    clearAll() {
        this.clear();
    }

    // Render a notification element
    renderNotification(notification) {
        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = `notification notification-${notification.type}`;
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <i class="${notification.icon}"></i>
                    <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                    ${!notification.persistent ? `
                        <button class="notification-close" onclick="window.notifications.remove('${notification.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="notification-message">${notification.message}</div>
                ${notification.actions.length > 0 ? `
                    <div class="notification-actions">
                        ${notification.actions.map(action => `
                            <button class="notification-action" onclick="${action.callback}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Add entrance animation
        element.classList.add('notification-enter');
        this.container.appendChild(element);

        // Remove entrance class after animation
        setTimeout(() => {
            element.classList.remove('notification-enter');
        }, 300);
    }

    // Manage notification limit
    manageNotificationLimit() {
        while (this.notifications.length > this.maxNotifications) {
            const oldest = this.notifications.pop();
            this.remove(oldest.id);
        }
    }

    // Generate unique ID
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get default icon for notification type
    getDefaultIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            system: 'fas fa-bell'
        };
        return icons[type] || icons.info;
    }

    // Format timestamp
    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            return Math.floor(diff / 60000) + 'm ago';
        } else if (diff < 86400000) { // Less than 1 day
            return Math.floor(diff / 3600000) + 'h ago';
        } else {
            return timestamp.toLocaleDateString();
        }
    }

    // Store notifications in localStorage
    storeNotifications() {
        try {
            const persistentNotifications = this.notifications.filter(n => n.persistent);
            localStorage.setItem('jkuat_notifications', JSON.stringify(persistentNotifications));
        } catch (error) {
            console.warn('Failed to store notifications:', error);
        }
    }

    // Load stored notifications
    loadStoredNotifications() {
        try {
            const stored = localStorage.getItem('jkuat_notifications');
            if (stored) {
                const notifications = JSON.parse(stored);
                notifications.forEach(notification => {
                    notification.timestamp = new Date(notification.timestamp);
                    this.notifications.push(notification);
                    this.renderNotification(notification);
                });
            }
        } catch (error) {
            console.warn('Failed to load stored notifications:', error);
        }
    }

    // Bind global events
    bindEvents() {
        // Listen for custom notification events
        document.addEventListener('jkuat:notification', (event) => {
            const { message, type, options } = event.detail;
            this.show(message, type, options);
        });

        // Listen for API errors
        document.addEventListener('jkuat:api-error', (event) => {
            const { message, error } = event.detail;
            this.error(`API Error: ${message}`, {
                actions: [{
                    label: 'Retry',
                    callback: 'location.reload()'
                }]
            });
        });

        // Listen for connection status
        window.addEventListener('online', () => {
            this.success('Connection restored', { duration: 3000 });
        });

        window.addEventListener('offline', () => {
            this.warning('You are offline. Some features may not work.', { persistent: true });
        });
    }

    // Get notification count
    getCount() {
        return this.notifications.length;
    }

    // Get unread count (for UI badges)
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    // Mark notification as read
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.storeNotifications();
        }
    }

    // Mark all as read
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.storeNotifications();
        this.updateBadge();
    }

    // Toggle notification panel
    togglePanel() {
        const panel = document.getElementById('notification-panel');
        const isVisible = panel.style.display !== 'none';
        
        if (isVisible) {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            this.updatePanel();
            this.markAllAsRead();
        }
    }

    // Update notification badge
    updateBadge() {
        const badge = document.getElementById('notification-badge');
        const count = this.getUnreadCount();
        
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
                
                // Ring the bell
                const bell = document.querySelector('.notification-bell i');
                if (bell) {
                    bell.classList.add('notification-bell-ring');
                    setTimeout(() => {
                        bell.classList.remove('notification-bell-ring');
                    }, 1000);
                }
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Update notification panel content
    updatePanel() {
        const content = document.getElementById('notification-panel-content');
        if (!content) return;

        if (this.notifications.length === 0) {
            content.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
        } else {
            content.innerHTML = this.notifications.map(notification => `
                <div class="panel-notification ${notification.read ? 'read' : 'unread'}">
                    <div class="panel-notification-icon">
                        <i class="${notification.icon}"></i>
                    </div>
                    <div class="panel-notification-content">
                        <div class="panel-notification-message">${notification.message}</div>
                        <div class="panel-notification-time">${this.formatTime(notification.timestamp)}</div>
                    </div>
                    <button class="panel-notification-remove" onclick="window.notifications.remove('${notification.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

// Global notification helper functions
window.notify = {
    success: (message, options) => window.notifications.success(message, options),
    error: (message, options) => window.notifications.error(message, options),
    warning: (message, options) => window.notifications.warning(message, options),
    info: (message, options) => window.notifications.info(message, options),
    system: (message, options) => window.notifications.system(message, options),
    clear: () => window.notifications.clear(),
    remove: (id) => window.notifications.remove(id)
};

// Initialize global notification system
window.notifications = new NotificationSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}