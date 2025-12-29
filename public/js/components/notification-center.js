// JKUAT Innovation Club - Notification Center Component
class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.isOpen = false;
        this.pushSubscription = null;
        this.vapidPublicKey = null;
        
        this.init();
    }

    async init() {
        console.log('🔔 Initializing Notification Center...');
        
        try {
            // Get VAPID public key
            await this.getVapidPublicKey();
            
            // Initialize push notifications if supported
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                await this.initializePushNotifications();
            }
            
            // Create notification center UI
            this.createNotificationCenter();
            
            // Load initial notifications
            await this.loadNotifications();
            
            // Set up periodic refresh
            this.startPeriodicRefresh();
            
            console.log('✅ Notification Center initialized');
        } catch (error) {
            console.error('❌ Error initializing Notification Center:', error);
        }
    }

    async getVapidPublicKey() {
        try {
            const response = await fetch('/api/notifications/vapid-public-key');
            const data = await response.json();
            this.vapidPublicKey = data.publicKey;
        } catch (error) {
            console.error('Error getting VAPID public key:', error);
        }
    }

    async initializePushNotifications() {
        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/js/sw.js');
            console.log('Service Worker registered:', registration);

            // Check if user is already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            
            if (existingSubscription) {
                this.pushSubscription = existingSubscription;
                console.log('Already subscribed to push notifications');
            } else {
                // Ask for permission and subscribe
                await this.requestPushPermission(registration);
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    async requestPushPermission(registration) {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // Subscribe to push notifications
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
                });

                this.pushSubscription = subscription;
                
                // Send subscription to server
                await this.sendSubscriptionToServer(subscription);
                
                console.log('✅ Subscribed to push notifications');
            } else {
                console.log('Push notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting push permission:', error);
        }
    }

    async sendSubscriptionToServer(subscription) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const response = await fetch('/api/notifications/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    subscription: subscription.toJSON(),
                    userAgent: navigator.userAgent
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send subscription to server');
            }
        } catch (error) {
            console.error('Error sending subscription to server:', error);
        }
    }

    createNotificationCenter() {
        // Create notification bell icon
        const bellIcon = document.createElement('div');
        bellIcon.id = 'notificationBell';
        bellIcon.innerHTML = `
            <button class="notification-bell-btn">
                <i class="fas fa-bell"></i>
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </button>
        `;
        
        // Create notification panel
        const notificationPanel = document.createElement('div');
        notificationPanel.id = 'notificationPanel';
        notificationPanel.className = 'notification-panel';
        notificationPanel.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <div class="notification-actions">
                    <button id="markAllReadBtn" class="btn-text">Mark all read</button>
                    <button id="notificationSettingsBtn" class="btn-text">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
            <div class="notification-content">
                <div id="notificationList" class="notification-list">
                    <div class="notification-loading">
                        <div class="spinner"></div>
                        <p>Loading notifications...</p>
                    </div>
                </div>
                <div class="notification-footer">
                    <button id="loadMoreNotifications" class="btn btn-outline btn-sm" style="display: none;">
                        Load More
                    </button>
                </div>
            </div>
        `;

        // Add to navigation
        const navigation = document.querySelector('#desktopNav, nav .container > div');
        if (navigation) {
            // Insert before login/register buttons
            const authButtons = navigation.querySelector('#loginBtn, #registerBtn');
            if (authButtons) {
                navigation.insertBefore(bellIcon, authButtons.parentElement);
            } else {
                navigation.appendChild(bellIcon);
            }
        }

        // Add panel to body
        document.body.appendChild(notificationPanel);

        // Add event listeners
        this.setupEventListeners();

        // Add CSS
        this.addNotificationStyles();
    }

    setupEventListeners() {
        // Bell click
        document.getElementById('notificationBell').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotificationPanel();
        });

        // Mark all read
        document.getElementById('markAllReadBtn').addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Settings
        document.getElementById('notificationSettingsBtn').addEventListener('click', () => {
            this.openNotificationSettings();
        });

        // Load more
        document.getElementById('loadMoreNotifications').addEventListener('click', () => {
            this.loadMoreNotifications();
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationPanel');
            const bell = document.getElementById('notificationBell');
            
            if (this.isOpen && !panel.contains(e.target) && !bell.contains(e.target)) {
                this.closeNotificationPanel();
            }
        });

        // Handle notification clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notificationItem = e.target.closest('.notification-item');
                const notificationId = notificationItem.dataset.notificationId;
                const actionUrl = notificationItem.dataset.actionUrl;
                
                this.markAsRead(notificationId);
                
                if (actionUrl) {
                    window.location.href = actionUrl;
                }
            }
        });
    }

    async loadNotifications(page = 1) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const response = await fetch(`/api/notifications/user/${user.id}?page=${page}&limit=20`);
            if (!response.ok) throw new Error('Failed to load notifications');

            const data = await response.json();
            
            if (page === 1) {
                this.notifications = data.notifications;
            } else {
                this.notifications = [...this.notifications, ...data.notifications];
            }
            
            this.unreadCount = data.unreadCount;
            this.updateBadge();
            this.renderNotifications();
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreNotifications');
            if (data.pagination.hasMore) {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.dataset.nextPage = page + 1;
            } else {
                loadMoreBtn.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showNotificationError();
        }
    }

    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        
        if (this.notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                    <small>You'll see notifications here when you have updates</small>
                </div>
            `;
            return;
        }

        const notificationsHTML = this.notifications.map(notification => 
            this.createNotificationItem(notification)
        ).join('');

        notificationList.innerHTML = notificationsHTML;
    }

    createNotificationItem(notification) {
        const isUnread = !notification.read_at;
        const timeAgo = this.getTimeAgo(new Date(notification.created_at));
        const iconClass = this.getNotificationIcon(notification.type);
        const priorityClass = notification.priority === 'high' || notification.priority === 'urgent' ? 'high-priority' : '';

        return `
            <div class="notification-item ${isUnread ? 'unread' : ''} ${priorityClass}" 
                 data-notification-id="${notification.id}"
                 data-action-url="${notification.action_url || ''}">
                <div class="notification-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-meta">
                        <span class="notification-time">${timeAgo}</span>
                        ${notification.action_text ? `<span class="notification-action">${notification.action_text}</span>` : ''}
                    </div>
                </div>
                ${isUnread ? '<div class="notification-unread-dot"></div>' : ''}
            </div>
        `;
    }

    getNotificationIcon(type) {
        const iconMap = {
            'event_reminder': 'fas fa-calendar-alt',
            'meeting_schedule': 'fas fa-users',
            'payment_reminder': 'fas fa-credit-card',
            'announcement': 'fas fa-bullhorn',
            'idea_comment': 'fas fa-comment',
            'idea_collaboration': 'fas fa-handshake',
            'election_period': 'fas fa-vote-yea',
            'system_alert': 'fas fa-exclamation-triangle',
            'welcome': 'fas fa-hand-wave',
            'achievement': 'fas fa-trophy'
        };
        return iconMap[type] || 'fas fa-bell';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        
        if (this.isOpen) {
            this.closeNotificationPanel();
        } else {
            this.openNotificationPanel();
        }
    }

    openNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        panel.classList.add('open');
        this.isOpen = true;
        
        // Refresh notifications when opening
        this.loadNotifications();
    }

    closeNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        panel.classList.remove('open');
        this.isOpen = false;
    }

    async markAsRead(notificationId) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            if (response.ok) {
                // Update local state
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification && !notification.read_at) {
                    notification.read_at = new Date().toISOString();
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                    this.updateBadge();
                    this.renderNotifications();
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const response = await fetch(`/api/notifications/user/${user.id}/read-all`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Update local state
                this.notifications.forEach(notification => {
                    if (!notification.read_at) {
                        notification.read_at = new Date().toISOString();
                    }
                });
                this.unreadCount = 0;
                this.updateBadge();
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    loadMoreNotifications() {
        const loadMoreBtn = document.getElementById('loadMoreNotifications');
        const nextPage = parseInt(loadMoreBtn.dataset.nextPage || '2');
        this.loadNotifications(nextPage);
    }

    openNotificationSettings() {
        // Redirect to settings page with notifications tab
        window.location.href = '/settings?tab=notifications';
    }

    showNotificationError() {
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = `
            <div class="notification-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load notifications</p>
                <button onclick="window.notificationCenter.loadNotifications()" class="btn btn-sm btn-outline">
                    Try Again
                </button>
            </div>
        `;
    }

    startPeriodicRefresh() {
        // Refresh notifications every 30 seconds
        setInterval(() => {
            if (this.isOpen) {
                this.loadNotifications();
            } else {
                // Just update the badge count
                this.updateUnreadCount();
            }
        }, 30000);
    }

    async updateUnreadCount() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) return;

            const response = await fetch(`/api/notifications/user/${user.id}?unread_only=true&limit=1`);
            if (!response.ok) return;

            const data = await response.json();
            this.unreadCount = data.unreadCount;
            this.updateBadge();
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }

    // Utility function for VAPID key conversion
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Notification Bell */
            .notification-bell-btn {
                position: relative;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 0.75rem;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 1rem;
            }

            .notification-bell-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }

            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }

            /* Notification Panel */
            .notification-panel {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 400px;
                max-height: 600px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                transform: translateY(-10px) scale(0.95);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .notification-panel.open {
                transform: translateY(0) scale(1);
                opacity: 1;
                visibility: visible;
            }

            .notification-header {
                padding: 1.5rem;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.8);
            }

            .notification-header h3 {
                margin: 0;
                font-size: 1.125rem;
                font-weight: 700;
                color: #1f2937;
            }

            .notification-actions {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            .btn-text {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                font-size: 0.875rem;
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .btn-text:hover {
                background: rgba(0, 0, 0, 0.05);
                color: #374151;
            }

            .notification-content {
                max-height: 500px;
                overflow-y: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .notification-content::-webkit-scrollbar {
                display: none;
            }

            .notification-list {
                padding: 0;
            }

            .notification-item {
                display: flex;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                gap: 1rem;
            }

            .notification-item:hover {
                background: rgba(0, 0, 0, 0.02);
            }

            .notification-item.unread {
                background: rgba(59, 130, 246, 0.05);
            }

            .notification-item.high-priority {
                border-left: 3px solid #ef4444;
            }

            .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(59, 130, 246, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #3b82f6;
                flex-shrink: 0;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-weight: 600;
                color: #1f2937;
                font-size: 0.875rem;
                margin-bottom: 0.25rem;
                line-height: 1.3;
            }

            .notification-message {
                color: #6b7280;
                font-size: 0.8125rem;
                line-height: 1.4;
                margin-bottom: 0.5rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .notification-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.75rem;
            }

            .notification-time {
                color: #9ca3af;
            }

            .notification-action {
                color: #3b82f6;
                font-weight: 500;
            }

            .notification-unread-dot {
                position: absolute;
                top: 1rem;
                right: 1rem;
                width: 8px;
                height: 8px;
                background: #3b82f6;
                border-radius: 50%;
            }

            .notification-empty,
            .notification-error,
            .notification-loading {
                text-align: center;
                padding: 3rem 1.5rem;
                color: #6b7280;
            }

            .notification-empty i,
            .notification-error i,
            .notification-loading .spinner {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #d1d5db;
            }

            .notification-footer {
                padding: 1rem 1.5rem;
                border-top: 1px solid rgba(0, 0, 0, 0.05);
                text-align: center;
                background: rgba(255, 255, 255, 0.8);
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .notification-panel {
                    right: 10px;
                    left: 10px;
                    width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize notification center when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
        window.notificationCenter = new NotificationCenter();
    }
});

// Re-initialize when user logs in
document.addEventListener('userLoggedIn', () => {
    if (!window.notificationCenter) {
        window.notificationCenter = new NotificationCenter();
    }
});

// Clean up when user logs out
document.addEventListener('userLoggedOut', () => {
    if (window.notificationCenter) {
        const bell = document.getElementById('notificationBell');
        const panel = document.getElementById('notificationPanel');
        
        if (bell) bell.remove();
        if (panel) panel.remove();
        
        window.notificationCenter = null;
    }
});