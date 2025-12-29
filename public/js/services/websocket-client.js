/**
 * WebSocket Client Service
 * Handles real-time updates and notifications
 */

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventListeners = new Map();
        this.subscribedEvents = new Set();
        
        this.connect();
    }

    connect() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            console.log('🔌 Connecting to WebSocket:', wsUrl);
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Authenticate if user is logged in
                const token = localStorage.getItem('authToken');
                if (token) {
                    this.authenticate(token);
                }
                
                // Re-subscribe to events
                this.subscribedEvents.forEach(eventId => {
                    this.subscribeToEvent(eventId);
                });
                
                this.emit('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.isConnected = false;
                this.emit('disconnected');
                
                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    
                    setTimeout(() => {
                        this.connect();
                    }, this.reconnectDelay * this.reconnectAttempts);
                } else {
                    console.error('❌ Max reconnection attempts reached');
                    this.emit('connection_failed');
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.emit('connection_failed', error);
        }
    }

    handleMessage(data) {
        console.log('📨 WebSocket message received:', data);
        
        switch (data.type) {
            case 'connected':
                this.clientId = data.clientId;
                break;
                
            case 'authenticated':
                console.log('🔐 WebSocket authenticated');
                this.emit('authenticated', data);
                break;
                
            case 'auth_error':
                console.error('Authentication failed:', data.message);
                this.emit('auth_error', data);
                break;
                
            case 'event_update':
                this.handleEventUpdate(data);
                break;
                
            case 'user_notification':
                this.handleUserNotification(data);
                break;
                
            case 'global_update':
                this.handleGlobalUpdate(data);
                break;
                
            case 'subscribed':
            case 'unsubscribed':
                console.log(`📅 ${data.type} to event ${data.eventId}`);
                break;
                
            case 'pong':
                // Handle ping/pong for connection health
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
        
        // Emit the raw message for custom handlers
        this.emit('message', data);
    }

    handleEventUpdate(data) {
        console.log('📅 Event update received:', data);
        
        switch (data.updateType) {
            case 'event_created':
                this.emit('event_created', data.event);
                this.showNotification('New Event', `${data.event.title} has been created!`);
                break;
                
            case 'event_updated':
                this.emit('event_updated', data);
                if (data.changes.start_date || data.changes.location) {
                    this.showNotification('Event Updated', `${data.event.title} details have changed`);
                }
                break;
                
            case 'event_deleted':
                this.emit('event_deleted', data);
                this.showNotification('Event Cancelled', 'An event you were interested in has been cancelled');
                break;
                
            case 'new_registration':
                this.emit('new_registration', data);
                break;
                
            case 'registration_updated':
                this.emit('registration_updated', data);
                break;
                
            case 'payment_completed':
                this.emit('payment_completed', data);
                break;
        }
    }

    handleUserNotification(data) {
        console.log('👤 User notification received:', data);
        
        switch (data.updateType) {
            case 'payment_status_changed':
                this.emit('payment_status_changed', data);
                
                if (data.status === 'completed') {
                    this.showNotification('Payment Successful', 'Your payment has been processed successfully!');
                } else if (data.status === 'failed') {
                    this.showNotification('Payment Failed', 'Your payment could not be processed. Please try again.');
                }
                break;
                
            default:
                this.emit('user_notification', data);
        }
    }

    handleGlobalUpdate(data) {
        console.log('🌐 Global update received:', data);
        this.emit('global_update', data);
    }

    // Public methods
    authenticate(token) {
        if (this.isConnected) {
            this.send({
                type: 'authenticate',
                token: token
            });
        }
    }

    subscribeToEvent(eventId) {
        this.subscribedEvents.add(eventId);
        
        if (this.isConnected) {
            this.send({
                type: 'subscribe_event',
                eventId: eventId
            });
        }
    }

    unsubscribeFromEvent(eventId) {
        this.subscribedEvents.delete(eventId);
        
        if (this.isConnected) {
            this.send({
                type: 'unsubscribe_event',
                eventId: eventId
            });
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected, message queued:', data);
        }
    }

    // Event listener management
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // Utility methods
    showNotification(title, message, options = {}) {
        // Check if browser supports notifications
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/images/logo.png',
                    badge: '/images/logo.png',
                    ...options
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body: message,
                            icon: '/images/logo.png',
                            badge: '/images/logo.png',
                            ...options
                        });
                    }
                });
            }
        }
        
        // Also show in-app notification
        this.showInAppNotification(title, message);
    }

    showInAppNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'ws-notification';
        notification.innerHTML = `
            <div class="ws-notification-content">
                <div class="ws-notification-title">${title}</div>
                <div class="ws-notification-message">${message}</div>
                <button class="ws-notification-close">&times;</button>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('ws-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'ws-notification-styles';
            styles.textContent = `
                .ws-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 16px;
                    max-width: 300px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                
                .ws-notification-content {
                    position: relative;
                }
                
                .ws-notification-title {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 4px;
                }
                
                .ws-notification-message {
                    color: #6b7280;
                    font-size: 14px;
                }
                
                .ws-notification-close {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button handler
        notification.querySelector('.ws-notification-close').onclick = () => {
            notification.remove();
        };
    }

    ping() {
        this.send({ type: 'ping' });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            clientId: this.clientId,
            reconnectAttempts: this.reconnectAttempts,
            subscribedEvents: Array.from(this.subscribedEvents)
        };
    }
}

// Create global instance
window.wsClient = new WebSocketClient();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketClient;
}