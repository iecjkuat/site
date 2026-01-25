// JKUAT Innovation Club - Notifications Module (Optimized for Performance)

class NotificationManager {
    constructor(dashboardInstance) {
        this.dashboard = dashboardInstance;
        this.notifications = [];
        this.notificationElements = new Map(); // Map to track notification DOM elements by ID
        this.priorityOrder = { 'urgent': 3, 'warning': 2, 'info': 1 };
        this.typeIcons = {
            'event': 'fas fa-calendar-alt',
            'project': 'fas fa-project-diagram',
            'payment': 'fas fa-credit-card',
            'admin': 'fas fa-bullhorn'
        };
        this.priorityColors = {
            'urgent': 'text-red-400',
            'warning': 'text-yellow-400',
            'info': 'text-blue-400'
        };
        this.priorityBorderColors = {
            'urgent': 'border-l-red-500',
            'warning': 'border-l-yellow-500',
            'info': 'border-l-blue-500'
        };
    }

    // Security: Prevent XSS attacks
    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initialize the notifications list
    async loadNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        try {
            // Try API first
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                this.notifications = data.notifications || [];
                console.log('✅ Notifications loaded from API:', this.notifications.length);
            } else {
                throw new Error('API failed');
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock notifications');
            this.notifications = this.getMockNotifications();
        }

        if (!this.notifications.length) {
            this.showEmptyNotifications(container);
            return;
        }

        // Sort notifications once
        const sorted = this.sortNotifications(this.notifications);

        // Add missing notifications to DOM (incremental)
        sorted.forEach(notification => {
            if (!this.notificationElements.has(notification.id)) {
                const element = this.createNotificationItem(notification);
                container.appendChild(element);
                this.notificationElements.set(notification.id, element);
            }
        });

        this.updateNotificationCount();
    }

    sortNotifications(notifications) {
        return [...notifications].sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            if (this.priorityOrder[a.priority] !== this.priorityOrder[b.priority])
                return this.priorityOrder[b.priority] - this.priorityOrder[a.priority];
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    createNotificationItem(notification) {
        const item = document.createElement('div');
        item.className = `notification-item p-3 rounded-lg border transition-all cursor-pointer ${notification.read
                ? 'bg-white/5 border-white/10 opacity-70'
                : 'bg-white/10 border-white/20'
            }`;

        if (!notification.read) {
            item.classList.add('border-l-4', this.priorityBorderColors[notification.priority] || 'border-l-blue-500');
        }

        const typeIcon = this.typeIcons[notification.type] || 'fas fa-bell';
        const priorityColor = this.priorityColors[notification.priority] || 'text-blue-400';
        const timeAgo = this.getTimeAgo(notification.createdAt);

        item.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <i class="${typeIcon} ${priorityColor} text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                        <h4 class="text-white text-sm font-semibold">${this.escapeHtml(notification.title)}</h4>
                        <div class="flex items-center gap-2">
                            ${this.getPriorityBadge(notification.priority)}
                            ${!notification.read ? '<div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>' : ''}
                        </div>
                    </div>
                    <p class="text-gray-300 text-xs mb-2 leading-relaxed">${this.escapeHtml(notification.message)}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400 text-xs">${timeAgo}</span>
                        ${notification.actionText ? `
                            <button class="notification-action text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" 
                                    data-action-url="${this.escapeHtml(notification.actionUrl || '')}" 
                                    data-notification-id="${notification.id}">
                                ${this.escapeHtml(notification.actionText)}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Click to mark read
        item.addEventListener('click', e => {
            if (!e.target.closest('.notification-action')) {
                this.markNotificationRead(notification.id);
            }
        });

        // Action button
        const actionBtn = item.querySelector('.notification-action');
        if (actionBtn) {
            actionBtn.addEventListener('click', e => {
                e.stopPropagation();
                this.handleNotificationAction(notification);
            });
        }

        return item;
    }

    getPriorityBadge(priority) {
        const badges = {
            'urgent': '<span class="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">Urgent</span>',
            'warning': '<span class="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">Important</span>',
            'info': ''
        };
        return badges[priority] || '';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    showEmptyNotifications(container) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-bell-slash text-gray-400 text-xl"></i>
                </div>
                <h3 class="text-white text-sm font-medium mb-2">No notifications yet</h3>
                <p class="text-gray-400 text-xs">You're all caught up! New notifications will appear here.</p>
            </div>
        `;
    }

    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const bell = document.querySelector('.notification-bell');
        if (!bell) return;

        let badge = bell.querySelector('.notification-badge');
        if (unreadCount > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold';
                bell.appendChild(badge);
            }
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        } else badge?.remove();
    }

    handleNotificationAction(notification) {
        this.markNotificationRead(notification.id);

        if (notification.actionUrl) window.location.href = notification.actionUrl;
        else if (notification.actionText?.toLowerCase().includes('mentor')) this.dashboard?.showMentorRequestModal();

        console.log('Notification action taken:', notification);
    }

    markNotificationRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification || notification.read) return;

        notification.read = true;

        const element = this.notificationElements.get(notificationId);
        if (element) {
            element.classList.add('opacity-70', 'bg-white/5', 'border-white/10');
            element.classList.remove('bg-white/10', 'border-white/20', 'border-l-4', 'border-l-red-500', 'border-l-yellow-500', 'border-l-blue-500');
            element.querySelectorAll('.w-2.h-2.bg-blue-500, .bg-red-500\\/20, .bg-yellow-500\\/20').forEach(el => el.remove());
        }

        this.updateNotificationCount();
    }

    markAllNotificationsRead() {
        const unread = this.notifications.filter(n => !n.read);
        if (!unread.length) return window.jkuatApp?.showToast('No unread notifications', 'info');

        unread.forEach(n => this.markNotificationRead(n.id));
        window.jkuatApp?.showToast(`${unread.length} notifications marked as read`, 'success');
    }

    addNotification(notificationData) {
        const newNotification = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            type: notificationData.type || 'info',
            priority: notificationData.priority || 'info',
            title: notificationData.title,
            message: notificationData.message,
            createdAt: new Date(),
            read: false,
            actionUrl: notificationData.actionUrl || null,
            actionText: notificationData.actionText || null
        };

        this.notifications.unshift(newNotification);

        // Add only new DOM element
        const container = document.getElementById('notificationsList');
        if (container) {
            const element = this.createNotificationItem(newNotification);
            container.prepend(element);
            this.notificationElements.set(newNotification.id, element);
        }

        this.updateNotificationCount();
        window.jkuatApp?.showToast(`New notification: ${newNotification.title}`, 'info');
        console.log('New notification added:', newNotification);
    }

    simulateNotification() {
        const sample = [
            { type: 'event', priority: 'urgent', title: 'Event Starting Soon', message: 'AI Workshop starts in 30 minutes. Join now!', actionUrl: '/events', actionText: 'Join Now' },
            { type: 'project', priority: 'warning', title: 'Project Deadline Approaching', message: 'Your project submission is due in 2 days.', actionUrl: '/projects', actionText: 'View Project' },
            { type: 'admin', priority: 'info', title: 'New Club Announcement', message: 'Check out the latest updates from club leadership.', actionUrl: '/announcements', actionText: 'Read More' }
        ];

        const random = sample[Math.floor(Math.random() * sample.length)];
        this.addNotification(random);
    }

    getMockNotifications() {
        return [
            {
                id: 'notif-1',
                type: 'event',
                priority: 'urgent',
                title: 'Hackathon Registration Closing Soon',
                message: 'Only 2 days left to register for the Annual Innovation Hackathon. Don\'t miss out!',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false,
                actionText: 'Register Now',
                actionUrl: '/events'
            },
            {
                id: 'notif-2',
                type: 'payment',
                priority: 'warning',
                title: 'Membership Fee Due',
                message: 'Your annual membership fee of KSh 1,500 is due in 5 days.',
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                read: false,
                actionText: 'Pay Now',
                actionUrl: '/payment'
            },
            {
                id: 'notif-3',
                type: 'project',
                priority: 'info',
                title: 'Project Submission Approved',
                message: 'Your project "Smart Campus System" has been approved for the incubation program.',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                read: true,
                actionText: 'View Project',
                actionUrl: '/projects'
            }
        ];
    }
}

window.NotificationManager = NotificationManager;
