/**
 * Event Notifications Component
 * Handles notifications, reminders, and toasts
 */

class EventNotifications {
    constructor() {
        this.init();
    }

    init() {
        this.setupNotifications();
        this.checkReminders();
        
        // Check reminders every minute
        setInterval(() => {
            this.checkReminders();
        }, 60000);
    }

    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    checkReminders() {
        const reminders = JSON.parse(localStorage.getItem('eventReminders') || '[]');
        const now = new Date();
        
        reminders.forEach((reminder, index) => {
            const reminderTime = new Date(reminder.reminderTime);
            
            if (now >= reminderTime && !reminder.sent) {
                this.sendReminder(reminder);
                
                // Mark as sent
                reminders[index].sent = true;
                localStorage.setItem('eventReminders', JSON.stringify(reminders));
            }
        });
    }

    sendReminder(reminder) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Event Reminder: ${reminder.eventTitle}`, {
                body: `Your event starts in 24 hours`,
                icon: '/assets/images/logo.png',
                tag: `event-${reminder.eventId}`
            });
        }
        
        // In-app notification
        this.showToast(
            'Event Reminder', 
            `${reminder.eventTitle} starts tomorrow!`, 
            'info'
        );
    }

    scheduleNotification(reminder) {
        const now = new Date();
        const reminderTime = new Date(reminder.reminderTime);
        const delay = reminderTime.getTime() - now.getTime();
        
        if (delay > 0) {
            setTimeout(() => {
                this.sendReminder(reminder);
            }, delay);
        }
    }

    showToast(title, message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const toastIcon = document.getElementById('toastIcon');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast) return;
        
        // Set icon and color based on type
        const config = {
            success: { icon: 'fas fa-check-circle', color: '#10b981' },
            error: { icon: 'fas fa-exclamation-circle', color: '#ef4444' },
            info: { icon: 'fas fa-info-circle', color: '#3b82f6' },
            warning: { icon: 'fas fa-exclamation-triangle', color: '#f59e0b' }
        };
        
        const { icon, color } = config[type] || config.success;
        
        toastIcon.className = icon;
        toastIcon.style.color = color;
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Update border color
        toast.querySelector('.glass-card').style.borderLeftColor = color;
        
        // Show toast
        toast.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }

    createReminder(eventId, eventTitle, eventDate) {
        const eventDateTime = new Date(eventDate);
        const reminderTime = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
        
        const reminders = JSON.parse(localStorage.getItem('eventReminders') || '[]');
        const reminder = {
            eventId,
            eventTitle,
            eventDate,
            reminderTime: reminderTime.toISOString(),
            created: new Date().toISOString()
        };
        
        reminders.push(reminder);
        localStorage.setItem('eventReminders', JSON.stringify(reminders));
        
        this.showToast('Reminder Set', `You'll be reminded 24 hours before ${eventTitle}`, 'success');
        
        // Schedule notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            this.scheduleNotification(reminder);
        }
    }

    removeReminder(eventId) {
        const reminders = JSON.parse(localStorage.getItem('eventReminders') || '[]');
        const filteredReminders = reminders.filter(r => r.eventId !== eventId);
        localStorage.setItem('eventReminders', JSON.stringify(filteredReminders));
    }

    getReminders() {
        return JSON.parse(localStorage.getItem('eventReminders') || '[]');
    }

    clearAllReminders() {
        localStorage.removeItem('eventReminders');
        this.showToast('Reminders Cleared', 'All event reminders have been removed', 'info');
    }
}

window.EventNotifications = EventNotifications;