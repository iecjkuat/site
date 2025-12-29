/**
 * WebSocket Service for Real-time Updates
 * Handles live event updates, notifications, and real-time communication
 */

const WebSocket = require('ws');
const { supabase } = require('../lib/supabase');

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Store client connections with metadata
        this.eventSubscriptions = new Map(); // Track event subscriptions
        
        this.setupWebSocketServer();
        this.setupDatabaseListeners();
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            console.log(`🔌 WebSocket client connected: ${clientId}`);
            
            // Store client connection
            this.clients.set(clientId, {
                ws,
                userId: null,
                subscribedEvents: new Set(),
                connectedAt: new Date()
            });

            // Handle incoming messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(clientId, data);
                } catch (error) {
                    console.error('Invalid WebSocket message:', error);
                    this.sendToClient(clientId, {
                        type: 'error',
                        message: 'Invalid message format'
                    });
                }
            });

            // Handle client disconnect
            ws.on('close', () => {
                console.log(`🔌 WebSocket client disconnected: ${clientId}`);
                this.handleClientDisconnect(clientId);
            });

            // Send welcome message
            this.sendToClient(clientId, {
                type: 'connected',
                clientId,
                message: 'WebSocket connection established'
            });
        });
    }

    handleClientMessage(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        switch (data.type) {
            case 'authenticate':
                this.authenticateClient(clientId, data.token);
                break;
                
            case 'subscribe_event':
                this.subscribeToEvent(clientId, data.eventId);
                break;
                
            case 'unsubscribe_event':
                this.unsubscribeFromEvent(clientId, data.eventId);
                break;
                
            case 'ping':
                this.sendToClient(clientId, { type: 'pong' });
                break;
                
            default:
                console.warn(`Unknown message type: ${data.type}`);
        }
    }

    async authenticateClient(clientId, token) {
        try {
            // Verify JWT token and get user info
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (error || !user) {
                this.sendToClient(clientId, {
                    type: 'auth_error',
                    message: 'Invalid authentication token'
                });
                return;
            }

            // Update client with user info
            const client = this.clients.get(clientId);
            if (client) {
                client.userId = user.id;
                console.log(`🔐 Client ${clientId} authenticated as user ${user.id}`);
                
                this.sendToClient(clientId, {
                    type: 'authenticated',
                    userId: user.id,
                    message: 'Authentication successful'
                });
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.sendToClient(clientId, {
                type: 'auth_error',
                message: 'Authentication failed'
            });
        }
    }

    subscribeToEvent(clientId, eventId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.subscribedEvents.add(eventId);
        
        // Track event subscriptions
        if (!this.eventSubscriptions.has(eventId)) {
            this.eventSubscriptions.set(eventId, new Set());
        }
        this.eventSubscriptions.get(eventId).add(clientId);

        console.log(`📅 Client ${clientId} subscribed to event ${eventId}`);
        
        this.sendToClient(clientId, {
            type: 'subscribed',
            eventId,
            message: `Subscribed to event updates`
        });
    }

    unsubscribeFromEvent(clientId, eventId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.subscribedEvents.delete(eventId);
        
        if (this.eventSubscriptions.has(eventId)) {
            this.eventSubscriptions.get(eventId).delete(clientId);
            
            // Clean up empty subscriptions
            if (this.eventSubscriptions.get(eventId).size === 0) {
                this.eventSubscriptions.delete(eventId);
            }
        }

        console.log(`📅 Client ${clientId} unsubscribed from event ${eventId}`);
        
        this.sendToClient(clientId, {
            type: 'unsubscribed',
            eventId,
            message: `Unsubscribed from event updates`
        });
    }

    handleClientDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        // Clean up event subscriptions
        client.subscribedEvents.forEach(eventId => {
            if (this.eventSubscriptions.has(eventId)) {
                this.eventSubscriptions.get(eventId).delete(clientId);
                
                if (this.eventSubscriptions.get(eventId).size === 0) {
                    this.eventSubscriptions.delete(eventId);
                }
            }
        });

        // Remove client
        this.clients.delete(clientId);
    }

    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    }

    // Broadcast to all clients subscribed to an event
    broadcastToEvent(eventId, data) {
        const subscribers = this.eventSubscriptions.get(eventId);
        if (!subscribers) return;

        const message = JSON.stringify({
            type: 'event_update',
            eventId,
            timestamp: new Date().toISOString(),
            ...data
        });

        subscribers.forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        });

        console.log(`📡 Broadcasted to ${subscribers.size} clients for event ${eventId}`);
    }

    // Broadcast to all authenticated clients
    broadcastToAll(data) {
        const message = JSON.stringify({
            type: 'global_update',
            timestamp: new Date().toISOString(),
            ...data
        });

        this.clients.forEach((client, clientId) => {
            if (client.userId && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }

    // Send notification to specific user
    sendToUser(userId, data) {
        const message = JSON.stringify({
            type: 'user_notification',
            timestamp: new Date().toISOString(),
            ...data
        });

        this.clients.forEach((client, clientId) => {
            if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }

    setupDatabaseListeners() {
        // Listen for event updates
        const eventChannel = supabase
            .channel('events_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'events' },
                (payload) => this.handleEventChange(payload)
            )
            .subscribe();

        // Listen for event registration changes
        const registrationChannel = supabase
            .channel('registrations_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'event_attendees' },
                (payload) => this.handleRegistrationChange(payload)
            )
            .subscribe();

        // Listen for payment updates
        const paymentChannel = supabase
            .channel('payments_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'payments' },
                (payload) => this.handlePaymentChange(payload)
            )
            .subscribe();

        console.log('🔄 Database listeners setup for real-time updates');
    }

    handleEventChange(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        const eventId = newRecord?.id || oldRecord?.id;

        if (!eventId) return;

        let updateType = 'event_modified';
        let updateData = { event: newRecord };

        switch (eventType) {
            case 'INSERT':
                updateType = 'event_created';
                break;
            case 'UPDATE':
                updateType = 'event_updated';
                updateData.changes = this.getChanges(oldRecord, newRecord);
                break;
            case 'DELETE':
                updateType = 'event_deleted';
                updateData = { eventId };
                break;
        }

        this.broadcastToEvent(eventId, {
            updateType,
            ...updateData
        });
    }

    handleRegistrationChange(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        const eventId = newRecord?.event_id || oldRecord?.event_id;

        if (!eventId) return;

        let updateType = 'registration_changed';
        let updateData = {};

        switch (eventType) {
            case 'INSERT':
                updateType = 'new_registration';
                updateData = { 
                    userId: newRecord.user_id,
                    registrationId: newRecord.id 
                };
                break;
            case 'UPDATE':
                updateType = 'registration_updated';
                updateData = {
                    userId: newRecord.user_id,
                    registrationId: newRecord.id,
                    changes: this.getChanges(oldRecord, newRecord)
                };
                break;
            case 'DELETE':
                updateType = 'registration_cancelled';
                updateData = { 
                    userId: oldRecord.user_id,
                    registrationId: oldRecord.id 
                };
                break;
        }

        this.broadcastToEvent(eventId, {
            updateType,
            ...updateData
        });
    }

    handlePaymentChange(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        const record = newRecord || oldRecord;

        if (!record || eventType !== 'UPDATE') return;

        // Only broadcast payment status changes
        if (oldRecord.status !== newRecord.status) {
            // Notify the specific user
            this.sendToUser(newRecord.user_id, {
                updateType: 'payment_status_changed',
                paymentId: newRecord.id,
                status: newRecord.status,
                eventId: newRecord.event_id,
                amount: newRecord.amount
            });

            // Notify event subscribers if payment completed
            if (newRecord.status === 'completed' && newRecord.event_id) {
                this.broadcastToEvent(newRecord.event_id, {
                    updateType: 'payment_completed',
                    userId: newRecord.user_id,
                    amount: newRecord.amount
                });
            }
        }
    }

    getChanges(oldRecord, newRecord) {
        const changes = {};
        
        Object.keys(newRecord).forEach(key => {
            if (oldRecord[key] !== newRecord[key]) {
                changes[key] = {
                    from: oldRecord[key],
                    to: newRecord[key]
                };
            }
        });
        
        return changes;
    }

    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get connection statistics
    getStats() {
        return {
            totalConnections: this.clients.size,
            authenticatedConnections: Array.from(this.clients.values()).filter(c => c.userId).length,
            eventSubscriptions: this.eventSubscriptions.size,
            totalSubscriptions: Array.from(this.eventSubscriptions.values()).reduce((sum, set) => sum + set.size, 0)
        };
    }
}

module.exports = WebSocketService;