/**
 * WebSocket Manager for Real-time Updates
 * Handles WebSocket connections and real-time data synchronization
 */

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.eventHandlers = new Map();
        this.heartbeatInterval = null;
        this.lastHeartbeat = null;
        
        this.init();
    }

    init() {
        this.connect();
        this.setupEventHandlers();
    }

    connect() {
        try {
            // Use secure WebSocket in production, regular WebSocket in development
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/admin`;
            
            console.log('🔌 Connecting to WebSocket:', wsUrl);
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = this.onOpen.bind(this);
            this.socket.onmessage = this.onMessage.bind(this);
            this.socket.onclose = this.onClose.bind(this);
            this.socket.onerror = this.onError.bind(this);
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }

    onOpen(event) {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send authentication
        this.authenticate();
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Notify listeners
        this.emit('connected', { timestamp: new Date() });
    }

    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data);
            
            // Handle different message types
            switch (data.type) {
                case 'heartbeat':
                    this.handleHeartbeat(data);
                    break;
                case 'user_update':
                    this.handleUserUpdate(data);
                    break;
                case 'event_update':
                    this.handleEventUpdate(data);
                    break;
                case 'payment_update':
                    this.handlePaymentUpdate(data);
                    break;
                case 'idea_update':
                    this.handleIdeaUpdate(data);
                    break;
                case 'message_update':
                    this.handleMessageUpdate(data);
                    break;
                case 'system_alert':
                    this.handleSystemAlert(data);
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
            }
            
            // Emit generic update event
            this.emit('update', data);
            
        } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
        }
    }

    onClose(event) {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // Emit disconnected event
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
    }

    onError(error) {
        console.error('❌ WebSocket error:', error);
        this.emit('error', error);
    }

    authenticate() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.send({
                type: 'auth',
                token: token,
                role: 'admin'
            });
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'heartbeat', timestamp: Date.now() });
                this.lastHeartbeat = Date.now();
            }
        }, 30000); // Send heartbeat every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    handleHeartbeat(data) {
        // Server responded to heartbeat
        console.log('💓 Heartbeat acknowledged');
    }

    handleUserUpdate(data) {
        console.log('👤 User update received:', data);
        
        // Update user count in dashboard
        if (data.action === 'created') {
            this.updateUserCount(1);
            this.showNotification('New user registered: ' + data.user.name, 'success');
        } else if (data.action === 'updated') {
            this.refreshUserData(data.user.id);
        } else if (data.action === 'deleted') {
            this.updateUserCount(-1);
            this.removeUserFromUI(data.user.id);
        }
        
        this.emit('user_update', data);
    }

    handleEventUpdate(data) {
        console.log('📅 Event update received:', data);
        
        if (data.action === 'created') {
            this.updateEventCount(1);
            this.showNotification('New event created: ' + data.event.title, 'info');
        } else if (data.action === 'updated') {
            this.refreshEventData(data.event.id);
        } else if (data.action === 'cancelled') {
            this.showNotification('Event cancelled: ' + data.event.title, 'warning');
        }
        
        this.emit('event_update', data);
    }

    handlePaymentUpdate(data) {
        console.log('💰 Payment update received:', data);
        
        if (data.action === 'completed') {
            this.updateRevenueCount(data.payment.amount);
            this.showNotification(`Payment received: KES ${data.payment.amount}`, 'success');
        } else if (data.action === 'failed') {
            this.showNotification('Payment failed', 'error');
        }
        
        this.emit('payment_update', data);
    }

    handleIdeaUpdate(data) {
        console.log('💡 Idea update received:', data);
        
        if (data.action === 'submitted') {
            this.updateIdeaCount(1);
            this.showNotification('New idea submitted: ' + data.idea.title, 'info');
        } else if (data.action === 'approved') {
            this.showNotification('Idea approved: ' + data.idea.title, 'success');
        }
        
        this.emit('idea_update', data);
    }

    handleMessageUpdate(data) {
        console.log('📧 Message update received:', data);
        
        if (data.action === 'delivered') {
            this.showNotification('Message delivered successfully', 'success');
        } else if (data.action === 'failed') {
            this.showNotification('Message delivery failed', 'error');
        }
        
        this.emit('message_update', data);
    }

    handleSystemAlert(data) {
        console.log('🚨 System alert received:', data);
        
        this.showNotification(data.message, data.level || 'warning');
        this.emit('system_alert', data);
    }

    send(data) {
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('⚠️ Cannot send message: WebSocket not connected');
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.emit('max_reconnect_attempts');
        }
    }

    // Event system
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('❌ Event handler error:', error);
                }
            });
        }
    }

    // UI update methods
    updateUserCount(delta) {
        const element = document.getElementById('totalUsers');
        if (element) {
            const current = parseInt(element.textContent) || 0;
            element.textContent = current + delta;
        }
    }

    updateEventCount(delta) {
        const element = document.getElementById('totalEvents');
        if (element) {
            const current = parseInt(element.textContent) || 0;
            element.textContent = current + delta;
        }
    }

    updateRevenueCount(amount) {
        const element = document.getElementById('totalRevenue');
        if (element) {
            const current = this.parseRevenue(element.textContent);
            const newAmount = current + amount;
            element.textContent = `KES ${this.formatNumber(newAmount)}`;
        }
    }

    updateIdeaCount(delta) {
        const element = document.getElementById('totalIdeas');
        if (element) {
            const current = parseInt(element.textContent) || 0;
            element.textContent = current + delta;
        }
    }

    parseRevenue(text) {
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    refreshUserData(userId) {
        // Refresh specific user data in the UI
        if (window.adminDashboard && window.adminDashboard.userManagement) {
            window.adminDashboard.userManagement.refreshUser(userId);
        }
    }

    refreshEventData(eventId) {
        // Refresh specific event data in the UI
        if (window.adminDashboard && window.adminDashboard.management) {
            window.adminDashboard.management.refreshEvent(eventId);
        }
    }

    removeUserFromUI(userId) {
        const userCard = document.querySelector(`[data-user-id="${userId}"]`);
        if (userCard) {
            userCard.remove();
        }
    }

    showNotification(message, type = 'info') {
        if (window.adminDashboard) {
            window.adminDashboard.showToast(message, type);
        }
    }

    // Connection status
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            lastHeartbeat: this.lastHeartbeat
        };
    }

    // Manual reconnect
    reconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.reconnectAttempts = 0;
        this.connect();
    }

    // Cleanup
    disconnect() {
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.close(1000, 'Manual disconnect');
        }
        this.isConnected = false;
    }
}

// Global WebSocket manager instance
window.wsManager = new WebSocketManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketManager;
}