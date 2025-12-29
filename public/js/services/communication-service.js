/**
 * Communication Service - Handles messaging, groups, and announcements
 */
class CommunicationService {
    constructor() {
        this.baseUrl = '/api/communication';
        this.useMockData = false;
    }

    // =============================================
    // DIRECT MESSAGING
    // =============================================

    async getConversations() {
        try {
            const response = await fetch(`${this.baseUrl}/conversations`);
            if (!response.ok) throw new Error('Failed to fetch conversations');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock conversations:', error.message);
            return this.getMockConversations();
        }
    }

    async getMessages(conversationId, page = 1, limit = 50) {
        try {
            const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock messages:', error.message);
            return this.getMockMessages(conversationId);
        }
    }

    async sendMessage(recipientId, content, attachments = []) {
        try {
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_id: recipientId,
                    content,
                    attachments
                })
            });
            if (!response.ok) throw new Error('Failed to send message');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock send:', error.message);
            return { success: true, message: { id: Date.now(), content, created_at: new Date().toISOString() } };
        }
    }

    async markAsRead(messageId) {
        try {
            const response = await fetch(`${this.baseUrl}/messages/${messageId}/read`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to mark as read');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, mock mark as read:', error.message);
            return { success: true };
        }
    }

    // =============================================
    // GROUP MESSAGING
    // =============================================

    async getGroups() {
        try {
            const response = await fetch(`${this.baseUrl}/groups`);
            if (!response.ok) throw new Error('Failed to fetch groups');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock groups:', error.message);
            return this.getMockGroups();
        }
    }

    async getGroupMessages(groupId, page = 1, limit = 50) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/messages?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch group messages');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock group messages:', error.message);
            return this.getMockGroupMessages(groupId);
        }
    }

    async sendGroupMessage(groupId, content, attachments = []) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, attachments })
            });
            if (!response.ok) throw new Error('Failed to send group message');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock group send:', error.message);
            return { success: true, message: { id: Date.now(), content, created_at: new Date().toISOString() } };
        }
    }

    async joinGroup(groupId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/join`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to join group');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, mock join group:', error.message);
            return { success: true };
        }
    }

    // =============================================
    // ANNOUNCEMENTS
    // =============================================

    async getAnnouncements(page = 1, limit = 20) {
        try {
            const response = await fetch(`${this.baseUrl}/announcements?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch announcements');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock announcements:', error.message);
            return this.getMockAnnouncements();
        }
    }

    async markAnnouncementAsRead(announcementId) {
        try {
            const response = await fetch(`${this.baseUrl}/announcements/${announcementId}/read`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to mark announcement as read');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, mock mark announcement as read:', error.message);
            return { success: true };
        }
    }

    // =============================================
    // EMERGENCY CONTACTS
    // =============================================

    async getEmergencyContacts() {
        try {
            const response = await fetch(`${this.baseUrl}/emergency-contacts`);
            if (!response.ok) throw new Error('Failed to fetch emergency contacts');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock emergency contacts:', error.message);
            return this.getMockEmergencyContacts();
        }
    }

    // =============================================
    // MOCK DATA METHODS
    // =============================================

    getMockConversations() {
        return {
            conversations: [
                {
                    id: 1,
                    participant: {
                        id: 2,
                        name: 'Executive User',
                        avatar: '/images/avatars/executive.jpg'
                    },
                    last_message: {
                        content: 'Welcome to the club! Looking forward to working with you.',
                        created_at: '2024-12-22T10:30:00Z',
                        is_read: true
                    },
                    unread_count: 0
                },
                {
                    id: 2,
                    participant: {
                        id: 3,
                        name: 'Admin User',
                        avatar: '/images/avatars/admin.jpg'
                    },
                    last_message: {
                        content: 'Please review the upcoming event details.',
                        created_at: '2024-12-23T08:15:00Z',
                        is_read: false
                    },
                    unread_count: 2
                }
            ]
        };
    }

    getMockMessages(conversationId) {
        const messages = {
            1: [
                {
                    id: 1,
                    sender_id: 2,
                    sender_name: 'Executive User',
                    content: 'Welcome to the club! Looking forward to working with you.',
                    created_at: '2024-12-22T10:30:00Z',
                    is_read: true
                },
                {
                    id: 2,
                    sender_id: 1,
                    sender_name: 'You',
                    content: 'Thank you! I\'m excited to be part of the team.',
                    created_at: '2024-12-22T10:35:00Z',
                    is_read: true
                }
            ],
            2: [
                {
                    id: 3,
                    sender_id: 3,
                    sender_name: 'Admin User',
                    content: 'Please review the upcoming event details.',
                    created_at: '2024-12-23T08:15:00Z',
                    is_read: false
                },
                {
                    id: 4,
                    sender_id: 3,
                    sender_name: 'Admin User',
                    content: 'Let me know if you have any questions.',
                    created_at: '2024-12-23T08:16:00Z',
                    is_read: false
                }
            ]
        };
        return { messages: messages[conversationId] || [] };
    }

    getMockGroups() {
        return {
            groups: [
                {
                    id: 1,
                    name: 'Tech Department',
                    description: 'Technology department discussions',
                    member_count: 15,
                    unread_count: 3,
                    last_message: {
                        content: 'Great progress on the mobile app project!',
                        created_at: '2024-12-23T09:20:00Z'
                    }
                },
                {
                    id: 2,
                    name: 'Executive Committee',
                    description: 'Executive committee private discussions',
                    member_count: 5,
                    unread_count: 0,
                    last_message: {
                        content: 'Budget meeting scheduled for tomorrow.',
                        created_at: '2024-12-22T16:45:00Z'
                    }
                },
                {
                    id: 3,
                    name: 'AI Innovation Project',
                    description: 'AI project team collaboration',
                    member_count: 8,
                    unread_count: 1,
                    last_message: {
                        content: 'Model accuracy improved to 87%!',
                        created_at: '2024-12-23T11:30:00Z'
                    }
                }
            ]
        };
    }

    getMockGroupMessages(groupId) {
        const messages = {
            1: [
                {
                    id: 5,
                    sender_id: 2,
                    sender_name: 'Executive User',
                    content: 'Great progress on the mobile app project!',
                    created_at: '2024-12-23T09:20:00Z',
                    reactions: { '👍': 3, '🚀': 2 }
                },
                {
                    id: 6,
                    sender_id: 3,
                    sender_name: 'Admin User',
                    content: 'The React Native components are looking good.',
                    created_at: '2024-12-23T09:25:00Z',
                    reactions: { '💯': 1 }
                }
            ],
            2: [
                {
                    id: 7,
                    sender_id: 3,
                    sender_name: 'Admin User',
                    content: 'Budget meeting scheduled for tomorrow.',
                    created_at: '2024-12-22T16:45:00Z',
                    reactions: {}
                }
            ],
            3: [
                {
                    id: 8,
                    sender_id: 2,
                    sender_name: 'Executive User',
                    content: 'Model accuracy improved to 87%!',
                    created_at: '2024-12-23T11:30:00Z',
                    reactions: { '🎉': 4, '🔥': 2 }
                }
            ]
        };
        return { messages: messages[groupId] || [] };
    }

    getMockAnnouncements() {
        return {
            announcements: [
                {
                    id: 1,
                    title: 'Annual General Meeting - December 30, 2024',
                    content: 'Dear Club Members, We are pleased to announce our Annual General Meeting...',
                    announcement_type: 'event',
                    priority_level: 'high',
                    created_at: '2024-12-20T10:00:00Z',
                    is_read: false
                },
                {
                    id: 2,
                    title: 'Innovation Showcase - January 12, 2025',
                    content: 'Get ready for our first Innovation Showcase of 2025!...',
                    announcement_type: 'event',
                    priority_level: 'normal',
                    created_at: '2024-12-22T14:30:00Z',
                    is_read: true
                },
                {
                    id: 3,
                    title: 'Emergency: Lab Access Temporarily Suspended',
                    content: 'URGENT NOTICE: Innovation Lab Access Temporarily Suspended...',
                    announcement_type: 'urgent',
                    priority_level: 'urgent',
                    created_at: '2024-12-23T10:00:00Z',
                    is_read: false
                }
            ]
        };
    }

    getMockEmergencyContacts() {
        return {
            contacts: [
                {
                    name: 'Club President',
                    phone: '+254722123456',
                    email: 'president@jkuatinnovation.ac.ke',
                    role: 'Leadership'
                },
                {
                    name: 'Security Office',
                    phone: '+254733654321',
                    email: 'security@jkuat.ac.ke',
                    role: 'Emergency'
                },
                {
                    name: 'Health Center',
                    phone: '+254711987654',
                    email: 'health@jkuat.ac.ke',
                    role: 'Medical'
                }
            ]
        };
    }
}

// Export for use in other modules
window.CommunicationService = CommunicationService;