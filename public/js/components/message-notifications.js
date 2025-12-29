/**
 * Message Notifications Component - Real-time messaging notifications
 */
class MessageNotifications {
    constructor() {
        this.unreadCount = 0;
        this.notifications = [];
        this.init();
    }

    init() {
        console.log('🔔 Initializing Message Notifications...');
        
        // Create notification container
        this.createNotificationContainer();
        
        // Setup WebSocket listeners
        this.setupWebSocketListeners();
        
        // Setup notification badge
        this.setupNotificationBadge();
        
        // Load initial unread count
        this.loadUnreadCount();
        
        console.log('✅ Message Notifications initialized');
    }

    createNotificationContainer() {
        // Create floating notification container
        const container = document.createElement('div');
        container.id = 'messageNotifications';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    setupWebSocketListeners() {
        if (window.WebSocketClient) {
            const wsClient = new WebSocketClient();
            
            // Listen for new messages
            wsClient.on('new_message', (data) => {
                this.handleNewMessage(data);
            });
            
            // Listen for message read events
            wsClient.on('message_read', (data) => {
                this.handleMessageRead(data);
            });
            
            // Listen for new announcements
            wsClient.on('new_announcement', (data) => {
                this.handleNewAnnouncement(data);
            });
        }
    }

    setupNotificationBadge() {
        // Add notification badge to messages link in navigation
        const messageLinks = document.querySelectorAll('a[href="/messages"]');
        messageLinks.forEach(link => {
            const badge = document.createElement('span');
            badge.className = 'message-notification-badge';
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 10px;
                font-weight: 600;
                display: none;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            `;
            
            // Make parent relative for positioning
            link.style.position = 'relative';
            link.appendChild(badge);
        });
    }

    handleNewMessage(data) {
        console.log('📨 New message received:', data);
        
        // Increment unread count
        this.unreadCount++;
        this.updateNotificationBadge();
        
        // Show notification if not on messages page
        if (!window.location.pathname.includes('messages')) {
            this.showNotification({
                type: 'message',
                title: `New message from ${data.sender_name}`,
                content: data.content,
                avatar: data.sender_avatar,
                timestamp: new Date(),
                onClick: () => {
                    window.location.href = '/messages';
                }
            });
        }
        
        // Play notification sound
        this.playNotificationSound();
    }

    handleMessageRead(data) {
        console.log('👁️ Message read:', data);
        
        // Decrement unread count
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateNotificationBadge();
    }

    handleNewAnnouncement(data) {
        console.log('📢 New announcement:', data);
        
        // Show high-priority notification for announcements
        this.showNotification({
            type: 'announcement',
            title: data.title,
            content: data.content.substring(0, 100) + '...',
            priority: data.priority_level,
            timestamp: new Date(),
            onClick: () => {
                window.location.href = '/messages';
            }
        });
        
        // Play notification sound
        this.playNotificationSound();
    }

    showNotification(notification) {
        const container = document.getElementById('messageNotifications');
        if (!container) return;
        
        const notificationEl = document.createElement('div');
        notificationEl.className = 'message-notification';
        notificationEl.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 0.5rem;
            max-width: 350px;
            cursor: pointer;
            pointer-events: auto;
            transform: translateX(100%);
            transition: all 0.3s ease;
            animation: slideIn 0.3s ease forwards;
        `;
        
        const priorityColor = this.getPriorityColor(notification.priority);
        
        notificationEl.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                ${notification.avatar ? 
                    `<img src="${notification.avatar}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` :
                    `<div style="width: 40px; height: 40px; background: ${priorityColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem;">
                        <i class="fas ${notification.type === 'announcement' ? 'fa-bullhorn' : 'fa-envelope'}"></i>
                    </div>`
                }
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                        <div style="font-weight: 600; color: white; font-size: 0.875rem; truncate;">${notification.title}</div>
                        <button class="close-notification" style="background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 0.25rem;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 0.75rem; line-height: 1.4; margin-bottom: 0.5rem;">${notification.content}</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.625rem;">${this.formatTime(notification.timestamp)}</div>
                </div>
            </div>
        `;
        
        // Add click handler
        notificationEl.addEventListener('click', (e) => {
            if (!e.target.closest('.close-notification')) {
                notification.onClick?.();
                this.removeNotification(notificationEl);
            }
        });
        
        // Add close handler
        const closeBtn = notificationEl.querySelector('.close-notification');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNotification(notificationEl);
        });
        
        // Add to container
        container.appendChild(notificationEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notificationEl.parentNode) {
                this.removeNotification(notificationEl);
            }
        }, 5000);
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }
    }

    removeNotification(notificationEl) {
        notificationEl.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.parentNode.removeChild(notificationEl);
            }
        }, 300);
    }

    updateNotificationBadge() {
        const badges = document.querySelectorAll('.message-notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
        
        // Update hero stats if on messages page
        const unreadCountEl = document.getElementById('unreadMessagesCount');
        if (unreadCountEl) {
            unreadCountEl.textContent = this.unreadCount;
        }
    }

    async loadUnreadCount() {
        try {
            if (window.CommunicationService) {
                const service = new CommunicationService();
                // This would be a real API call to get unread count
                // For now, using mock data
                this.unreadCount = 3; // Mock unread count
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }

    playNotificationSound() {
        // Create and play notification sound
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore audio play errors (user interaction required)
            });
        } catch (error) {
            // Ignore audio errors
        }
    }

    getPriorityColor(priority) {
        const colors = {
            urgent: 'linear-gradient(135deg, #ef4444, #dc2626)',
            high: 'linear-gradient(135deg, #f59e0b, #d97706)',
            normal: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            low: 'linear-gradient(135deg, #6b7280, #4b5563)'
        };
        return colors[priority] || colors.normal;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Public methods for manual control
    markAllAsRead() {
        this.unreadCount = 0;
        this.updateNotificationBadge();
    }

    addUnreadMessage() {
        this.unreadCount++;
        this.updateNotificationBadge();
    }

    removeUnreadMessage() {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateNotificationBadge();
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.messageNotifications = new MessageNotifications();
});

// Export for use in other modules
window.MessageNotifications = MessageNotifications;