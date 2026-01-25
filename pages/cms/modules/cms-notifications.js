/**
 * CMS Notifications Module
 * Handles user notifications and feedback messages
 */

export class CMSNotifications {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        if (document.getElementById('cms-notifications')) return;
        
        this.container = document.createElement('div');
        this.container.id = 'cms-notifications';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 4000, options = {}) {
        const id = Date.now().toString();
        const notification = this.createNotification(message, type, id, options);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
        
        return id;
    }

    createNotification(message, type, id, options) {
        const notification = document.createElement('div');
        
        const colors = {
            success: { bg: 'rgba(16, 185, 129, 0.9)', border: '#10b981', icon: 'check-circle' },
            error: { bg: 'rgba(239, 68, 68, 0.9)', border: '#ef4444', icon: 'exclamation-circle' },
            warning: { bg: 'rgba(245, 158, 11, 0.9)', border: '#f59e0b', icon: 'exclamation-triangle' },
            info: { bg: 'rgba(59, 130, 246, 0.9)', border: '#3b82f6', icon: 'info-circle' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            background: ${color.bg};
            backdrop-filter: blur(10px);
            border: 1px solid ${color.border};
            border-radius: 12px;
            padding: 16px 20px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        // Icon
        const iconEl = document.createElement('i');
        iconEl.className = `fas fa-${color.icon}`;
        iconEl.style.cssText = 'font-size: 16px; flex-shrink: 0;';
        
        // Message
        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        messageEl.style.flex = '1';
        
        // Close button
        const closeEl = document.createElement('i');
        closeEl.className = 'fas fa-times';
        closeEl.style.cssText = 'font-size: 12px; opacity: 0.7; cursor: pointer;';
        
        notification.appendChild(iconEl);
        notification.appendChild(messageEl);
        
        if (!options.hideClose) {
            notification.appendChild(closeEl);
        }
        
        notification.onclick = () => this.remove(id);
        
        return notification;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }

    showProgress(message, progress = 0) {
        const id = Date.now().toString();
        const notification = this.createProgressNotification(message, progress, id);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        return id;
    }

    updateProgress(id, progress, message) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        const progressBar = notification.querySelector('.progress-bar');
        const messageEl = notification.querySelector('.progress-message');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (messageEl && message) {
            messageEl.textContent = message;
        }
        
        if (progress >= 100) {
            setTimeout(() => this.remove(id), 1000);
        }
    }

    createProgressNotification(message, progress, id) {
        const notification = document.createElement('div');
        
        notification.style.cssText = `
            background: rgba(59, 130, 246, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 16px 20px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
        `;
        
        notification.innerHTML = `
            <div class="progress-message" style="margin-bottom: 8px;">${message}</div>
            <div style="background: rgba(255, 255, 255, 0.2); border-radius: 4px; height: 6px; overflow: hidden;">
                <div class="progress-bar" style="background: white; height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
            </div>
        `;
        
        return notification;
    }
}