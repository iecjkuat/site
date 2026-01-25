/**
 * CMS Notifications Module
 * Handles user notifications and feedback messages
 */

export class CMSNotifications {
    constructor(maxNotifications = 5) {
        this.container = null;
        this.notifications = new Map();
        this.maxNotifications = maxNotifications;
        this.init();
    }

    init() {
        const existing = document.getElementById('cms-notifications');
        if (existing) {
            this.container = existing;
            return;
        }
        
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
        const id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
        const notification = this.createNotification(message, type, id, options);
        
        // Limit max notifications - remove oldest immediately if at limit
        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId, { immediate: true });
        }
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        // Respect reduced-motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // No slide animation for reduced-motion users
            notification.style.transform = 'translateX(0)';
        } else {
            // Animate in for users who prefer motion
            requestAnimationFrame(() => {
                notification.style.transform = 'translateX(0)';
            });
        }
        
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
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        
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
        
        notification.appendChild(iconEl);
        notification.appendChild(messageEl);
        
        // Close button
        if (!options.hideClose) {
            const closeEl = document.createElement('i');
            closeEl.className = 'fas fa-times';
            closeEl.style.cssText = 'font-size: 12px; opacity: 0.7; cursor: pointer; padding: 4px;';
            closeEl.setAttribute('aria-label', 'Close notification');
            closeEl.setAttribute('role', 'button');
            closeEl.setAttribute('tabindex', '0');
            
            closeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.remove(id);
            });
            
            // Keyboard support for close button
            closeEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.remove(id);
                }
            });
            
            notification.appendChild(closeEl);
        }
        
        // Optional click-to-close
        if (options.closeOnClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', () => this.remove(id));
        }
        
        return notification;
    }

    remove(id, { immediate = false } = {}) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // Prevent double-remove timers
        if (notification.dataset.removing === '1') return;
        notification.dataset.removing = '1';
        
        if (immediate) {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
            return;
        }
        
        // Respect reduced-motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // No slide animation for reduced-motion users - remove immediately
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        } else {
            // Animate out for users who prefer motion
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id, { immediate: true });
        });
    }

    showProgress(message, progress = 0) {
        const id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
        const notification = this.createProgressNotification(message, progress, id);
        
        // Limit max notifications - remove oldest immediately if at limit
        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId, { immediate: true });
        }
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        // Respect reduced-motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // No slide animation for reduced-motion users
            notification.style.transform = 'translateX(0)';
        } else {
            // Animate in for users who prefer motion
            requestAnimationFrame(() => {
                notification.style.transform = 'translateX(0)';
            });
        }
        
        return id;
    }

    updateProgress(id, progress, message) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        const progressBar = notification.querySelector('.progress-bar');
        const messageEl = notification.querySelector('.progress-message');
        
        // Clamp progress between 0 and 100
        const safe = Math.max(0, Math.min(100, Number(progress) || 0));
        
        if (progressBar) {
            progressBar.style.width = `${safe}%`;
        }
        
        if (messageEl && message) {
            messageEl.textContent = message;
        }
        
        if (safe >= 100) {
            setTimeout(() => this.remove(id), 1000);
        }
    }

    createProgressNotification(message, progress, id) {
        const notification = document.createElement('div');
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        
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
        
        // Create message element safely
        const messageEl = document.createElement('div');
        messageEl.className = 'progress-message';
        messageEl.style.marginBottom = '8px';
        messageEl.textContent = message;
        
        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = 'background: rgba(255, 255, 255, 0.2); border-radius: 4px; height: 6px; overflow: hidden;';
        
        // Create progress bar with clamped progress
        const safe = Math.max(0, Math.min(100, Number(progress) || 0));
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.cssText = `background: white; height: 100%; width: ${safe}%; transition: width 0.3s ease;`;
        
        progressContainer.appendChild(progressBar);
        notification.appendChild(messageEl);
        notification.appendChild(progressContainer);
        
        return notification;
    }
}