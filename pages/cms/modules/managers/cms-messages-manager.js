/**
 * CMS Messages Manager
 * Handles support messages/tickets with chat-like interface
 */

export class CMSMessagesManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.messages = [];
        this.selectedMessage = null;
        this.autoRefreshInterval = null;
    }

    async load() {
        console.log('📨 Loading Messages Manager...');
        
        const container = document.getElementById('cms-content');
        if (!container) {
            console.error('❌ CMS content container not found');
            return;
        }

        container.innerHTML = this.getMessagesHTML();
        
        // Load messages
        await this.loadMessages();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Auto-refresh every 30 seconds
        this.startAutoRefresh();
    }

    getMessagesHTML() {
        return `
            <div class="messages-manager">
                <!-- Header -->
                <div class="cms-section-header">
                    <div>
                        <h2><i class="fas fa-envelope"></i> Support Messages</h2>
                        <p>View and respond to user support requests</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-secondary" id="refreshMessagesBtn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <button class="btn-secondary" id="markAllReadBtn">
                            <i class="fas fa-check-double"></i> Mark All Read
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="messages-stats">
                    <div class="stat-card">
                        <i class="fas fa-inbox"></i>
                        <div>
                            <div class="stat-value" id="totalMessages">0</div>
                            <div class="stat-label">Total Messages</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <div class="stat-value" id="unreadMessages">0</div>
                            <div class="stat-label">Unread</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-check-double"></i>
                        <div>
                            <div class="stat-value" id="readMessages">0</div>
                            <div class="stat-label">Read</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <div>
                            <div class="stat-value" id="todayMessages">0</div>
                            <div class="stat-label">Today</div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="messages-filters">
                    <select id="readFilter" class="filter-select">
                        <option value="all">All Messages</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Read Only</option>
                    </select>
                    <input type="search" id="messageSearch" class="search-input" placeholder="Search messages...">
                </div>

                <!-- Messages Layout -->
                <div class="messages-layout">
                    <!-- Messages List -->
                    <div class="messages-list">
                        <div id="messagesListContainer">
                            <div class="loading-state">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Loading messages...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Message Detail/Chat -->
                    <div class="message-detail">
                        <div id="messageDetailContainer">
                            <div class="empty-state">
                                <i class="fas fa-envelope-open-text"></i>
                                <p>Select a message to view conversation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .messages-manager {
                    padding: 1.5rem;
                    background: #0a0e1a;
                    min-height: 100vh;
                }

                .cms-section-header {
                    margin-bottom: 1.5rem;
                }

                .cms-section-header h2 {
                    color: #25D366;
                    font-size: 1.5rem;
                    margin-bottom: 0.25rem;
                }

                .cms-section-header p {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.875rem;
                }

                .header-actions {
                    display: flex;
                    gap: 0.75rem;
                }

                .messages-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .stat-card {
                    background: #1a1f2e;
                    border: 1px solid rgba(37, 211, 102, 0.1);
                    border-radius: 12px;
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s;
                }

                .stat-card:hover {
                    border-color: rgba(37, 211, 102, 0.3);
                    transform: translateY(-2px);
                }

                .stat-card i {
                    font-size: 1.75rem;
                    color: #25D366;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: white;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .messages-filters {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .filter-select, .search-input {
                    padding: 0.875rem 1rem;
                    background: #1a1f2e;
                    border: 1px solid rgba(37, 211, 102, 0.2);
                    border-radius: 8px;
                    color: white;
                    font-size: 0.875rem;
                    transition: border-color 0.3s;
                }

                .filter-select:focus, .search-input:focus {
                    outline: none;
                    border-color: #25D366;
                }

                .search-input {
                    flex: 1;
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .messages-layout {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 0;
                    height: calc(100vh - 420px);
                    min-height: 600px;
                    background: #0f1419;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                /* WhatsApp-style Messages List */
                .messages-list {
                    background: #1a1f2e;
                    border-right: 1px solid rgba(37, 211, 102, 0.1);
                    overflow-y: auto;
                }

                .messages-list::-webkit-scrollbar {
                    width: 6px;
                }

                .messages-list::-webkit-scrollbar-track {
                    background: transparent;
                }

                .messages-list::-webkit-scrollbar-thumb {
                    background: rgba(37, 211, 102, 0.3);
                    border-radius: 3px;
                }

                .message-item {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .message-item:hover {
                    background: rgba(37, 211, 102, 0.05);
                }

                .message-item.active {
                    background: rgba(37, 211, 102, 0.1);
                    border-left: 4px solid #25D366;
                }

                .message-item.unread {
                    background: rgba(37, 211, 102, 0.03);
                }

                .message-item.unread::before {
                    content: '';
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 10px;
                    height: 10px;
                    background: #25D366;
                    border-radius: 50%;
                }

                .message-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .message-sender {
                    font-weight: 600;
                    color: white;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .message-time {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .message-subject {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 0.25rem;
                    font-weight: 500;
                }

                .message-preview {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.5);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 280px;
                }

                /* WhatsApp-style Chat Area */
                .message-detail {
                    background: #0f1419;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    height: 100%;
                }

                /* WhatsApp-style Chat Messages */
                .chat-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem 1.5rem;
                    background: #0a0e1a;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    min-height: 0;
                }

                .chat-container::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-container::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chat-container::-webkit-scrollbar-thumb {
                    background: rgba(37, 211, 102, 0.3);
                    border-radius: 3px;
                }

                .chat-message {
                    display: flex;
                    gap: 0.75rem;
                    max-width: 75%;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .chat-message.user {
                    align-self: flex-start;
                }

                .chat-message.admin {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .chat-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #25D366, #128C7E);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
                }

                .chat-message.user .chat-avatar {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                .chat-bubble {
                    background: #1a1f2e;
                    padding: 0.875rem 1rem;
                    border-radius: 12px;
                    flex: 1;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .chat-message.user .chat-bubble {
                    border-bottom-left-radius: 4px;
                }

                .chat-message.admin .chat-bubble {
                    background: rgba(37, 211, 102, 0.15);
                    border-bottom-right-radius: 4px;
                }

                .chat-sender {
                    font-weight: 600;
                    color: #25D366;
                    margin-bottom: 0.25rem;
                    font-size: 0.85rem;
                }

                .chat-message.user .chat-sender {
                    color: #667eea;
                }

                .chat-text {
                    color: rgba(255, 255, 255, 0.95);
                    line-height: 1.5;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }

                .chat-time {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.4);
                    text-align: right;
                }

                /* WhatsApp-style Reply Form */
                .reply-form {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid rgba(37, 211, 102, 0.1);
                    background: #1a1f2e;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .reply-textarea {
                    width: 100%;
                    min-height: 80px;
                    padding: 0.875rem 1rem;
                    background: #0f1419;
                    border: 1px solid rgba(37, 211, 102, 0.2);
                    border-radius: 8px;
                    color: white;
                    font-family: inherit;
                    font-size: 0.9rem;
                    resize: vertical;
                    transition: border-color 0.3s;
                }

                .reply-textarea:focus {
                    outline: none;
                    border-color: #25D366;
                }

                .reply-textarea::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .btn-primary {
                    background: #25D366;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    align-self: flex-end;
                }

                .btn-primary:hover {
                    background: #128C7E;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
                }

                .empty-state, .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: rgba(255, 255, 255, 0.4);
                    gap: 1rem;
                }

                .empty-state i, .loading-state i {
                    font-size: 3rem;
                    color: rgba(37, 211, 102, 0.3);
                }

                @media (max-width: 1024px) {
                    .messages-layout {
                        grid-template-columns: 1fr;
                    }

                    .messages-list {
                        height: 300px;
                        border-right: none;
                        border-bottom: 1px solid rgba(37, 211, 102, 0.1);
                    }
                }
            </style>
        `;
    }

    async loadMessages() {
        try {
            console.log('📨 Loading messages from API...');
            
            const response = await fetch('/api/v1/support', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', errorText);
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            console.log('📦 Data received:', data);
            
            const tickets = data.tickets || [];
            console.log('📋 Total tickets:', tickets.length);
            
            // Group tickets by user_id to create conversations
            const conversationsMap = new Map();
            
            tickets.forEach(ticket => {
                const userId = ticket.user_id || ticket.userId;
                console.log('Processing ticket:', ticket.id, 'User ID:', userId);
                
                if (!conversationsMap.has(userId)) {
                    conversationsMap.set(userId, {
                        user: ticket.user,
                        user_id: userId,
                        tickets: [],
                        lastMessage: ticket.created_at,
                        hasUnread: !ticket.read_at
                    });
                }
                
                const conversation = conversationsMap.get(userId);
                conversation.tickets.push(ticket);
                
                // Update last message time
                if (new Date(ticket.created_at) > new Date(conversation.lastMessage)) {
                    conversation.lastMessage = ticket.created_at;
                }
                
                // Update unread status
                if (!ticket.read_at) {
                    conversation.hasUnread = true;
                }
            });
            
            // Convert map to array and sort by last message time
            this.messages = Array.from(conversationsMap.values())
                .sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));
            
            console.log('💬 Conversations created:', this.messages.length);
            console.log('Conversations:', this.messages);
            console.log('✅ Conversations loaded:', this.messages.length);

            this.renderMessagesList();
            this.updateStats();

        } catch (error) {
            console.error('❌ Error loading messages:', error);
            this.cms.notifications.show('Failed to load messages', 'error');
        }
    }

    renderMessagesList() {
        const container = document.getElementById('messagesListContainer');
        if (!container) return;

        if (this.messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No messages yet</p>
                </div>
            `;
            return;
        }

        // Apply filters
        const readFilter = document.getElementById('readFilter')?.value || 'all';
        const searchQuery = document.getElementById('messageSearch')?.value.toLowerCase() || '';

        let filtered = this.messages;

        if (readFilter === 'unread') {
            filtered = filtered.filter(conv => conv.hasUnread);
        } else if (readFilter === 'read') {
            filtered = filtered.filter(conv => !conv.hasUnread);
        }

        if (searchQuery) {
            filtered = filtered.filter(conv => 
                conv.user?.name?.toLowerCase().includes(searchQuery) ||
                conv.user?.email?.toLowerCase().includes(searchQuery) ||
                conv.tickets.some(t => 
                    t.subject?.toLowerCase().includes(searchQuery) ||
                    t.description?.toLowerCase().includes(searchQuery)
                )
            );
        }

        container.innerHTML = filtered.map(conversation => this.createConversationItem(conversation)).join('');
    }

    createConversationItem(conversation) {
        const isUnread = conversation.hasUnread;
        const isActive = this.selectedConversation?.user_id === conversation.user_id;
        const timeAgo = this.getTimeAgo(new Date(conversation.lastMessage));
        const messageCount = conversation.tickets.length;
        const lastTicket = conversation.tickets[conversation.tickets.length - 1];

        return `
            <div class="message-item ${isUnread ? 'unread' : ''} ${isActive ? 'active' : ''}" 
                 data-user-id="${conversation.user_id}">
                <div class="message-item-header">
                    <div class="message-sender">
                        ${this.escapeHtml(conversation.user?.name || 'Unknown User')}
                        ${messageCount > 1 ? `<span style="color: rgba(255,255,255,0.5); font-size: 0.75rem; font-weight: 400;">(${messageCount})</span>` : ''}
                    </div>
                    <div class="message-time">${timeAgo}</div>
                </div>
                <div class="message-subject">${this.escapeHtml(lastTicket.subject || 'No Subject')}</div>
                <div class="message-preview">${this.escapeHtml(lastTicket.description || '')}</div>
            </div>
        `;
    }

    createMessageItem(message) {
        const isUnread = !message.read_at;
        const isActive = this.selectedMessage?.id === message.id;
        const timeAgo = this.getTimeAgo(new Date(message.created_at));

        return `
            <div class="message-item ${isUnread ? 'unread' : ''} ${isActive ? 'active' : ''}" 
                 data-message-id="${message.id}">
                <div class="message-item-header">
                    <div class="message-sender">
                        ${this.escapeHtml(message.user?.name || 'Unknown User')}
                    </div>
                    <div class="message-time">${timeAgo}</div>
                </div>
                <div class="message-subject">${this.escapeHtml(message.subject || 'No Subject')}</div>
                <div class="message-preview">${this.escapeHtml(message.description || '')}</div>
            </div>
        `;
    }

    async selectConversation(userId) {
        try {
            // Find the conversation
            const conversation = this.messages.find(c => c.user_id === userId);
            if (!conversation) return;

            this.selectedConversation = conversation;

            // Fetch full details for all tickets in this conversation
            const ticketPromises = conversation.tickets.map(ticket => 
                fetch(`/api/v1/support/${ticket.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }).then(res => res.json())
            );

            const ticketsWithReplies = await Promise.all(ticketPromises);

            this.renderConversationDetail(conversation, ticketsWithReplies);

            // Mark all as read
            for (const ticket of conversation.tickets) {
                if (!ticket.read_at) {
                    await this.markAsRead(ticket.id);
                }
            }

            // Update conversation status
            conversation.hasUnread = false;
            this.renderMessagesList();

        } catch (error) {
            console.error('Error loading conversation:', error);
            this.cms.notifications.show('Failed to load conversation', 'error');
        }
    }

    async selectMessage(messageId) {
        try {
            const response = await fetch(`/api/v1/support/${messageId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch message details');

            const data = await response.json();
            
            // Backend returns ticket directly, not wrapped
            this.selectedMessage = data;

            this.renderMessageDetail();

            // Mark as read
            if (!this.selectedMessage.read_at) {
                await this.markAsRead(messageId);
            }

        } catch (error) {
            console.error('Error loading message details:', error);
            this.cms.notifications.show('Failed to load message details', 'error');
        }
    }

    renderConversationDetail(conversation, ticketsWithReplies) {
        const container = document.getElementById('messageDetailContainer');
        if (!container) return;

        // Flatten all messages and replies into a single timeline
        const allMessages = [];

        ticketsWithReplies.forEach(ticket => {
            // Add the original ticket
            allMessages.push({
                type: 'ticket',
                sender: ticket.user,
                content: ticket.description,
                subject: ticket.subject,
                created_at: ticket.created_at,
                is_admin: false
            });

            // Add all replies
            if (ticket.replies && ticket.replies.length > 0) {
                ticket.replies.forEach(reply => {
                    allMessages.push({
                        type: 'reply',
                        sender: reply.sender,
                        content: reply.content,
                        created_at: reply.created_at,
                        is_admin: reply.is_admin
                    });
                });
            }
        });

        // Sort by timestamp
        allMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        container.innerHTML = `
            <div class="chat-container" id="chatContainer">
                ${allMessages.map(msg => `
                    <div class="chat-message ${msg.is_admin ? 'admin' : 'user'}">
                        <div class="chat-avatar">${this.getInitials(msg.sender?.name)}</div>
                        <div class="chat-bubble">
                            <div class="chat-sender">${this.escapeHtml(msg.sender?.name || 'Unknown')}</div>
                            ${msg.subject ? `<div style="font-weight: 600; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">${this.escapeHtml(msg.subject)}</div>` : ''}
                            <div class="chat-text">${this.escapeHtml(msg.content || '')}</div>
                            <div class="chat-time">${new Date(msg.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="reply-form">
                <textarea id="replyText" class="reply-textarea" placeholder="Type your reply..."></textarea>
                <button class="btn-primary" id="sendReplyBtn">
                    <i class="fas fa-paper-plane"></i> Send Reply
                </button>
            </div>
        `;

        // Setup reply handler - reply to the most recent ticket
        const latestTicket = ticketsWithReplies[ticketsWithReplies.length - 1];
        document.getElementById('sendReplyBtn')?.addEventListener('click', () => this.sendReplyToTicket(latestTicket.id));

        // Scroll to bottom
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    renderMessageDetail() {
        const container = document.getElementById('messageDetailContainer');
        if (!container || !this.selectedMessage) return;

        const message = this.selectedMessage;
        const user = window.authManager?.getUser();

        container.innerHTML = `
            <div class="chat-container" id="chatContainer">
                <!-- Original Message -->
                <div class="chat-message user">
                    <div class="chat-avatar">${this.getInitials(message.user?.name)}</div>
                    <div class="chat-bubble">
                        <div class="chat-sender">${this.escapeHtml(message.user?.name || 'Unknown User')}</div>
                        <div class="chat-text">${this.escapeHtml(message.description || '')}</div>
                        <div class="chat-time">${new Date(message.created_at).toLocaleString()}</div>
                    </div>
                </div>

                <!-- Replies -->
                ${(message.replies || []).map(reply => `
                    <div class="chat-message ${reply.is_admin ? 'admin' : 'user'}">
                        <div class="chat-avatar">${this.getInitials(reply.sender?.name)}</div>
                        <div class="chat-bubble">
                            <div class="chat-sender">${this.escapeHtml(reply.sender?.name || 'Unknown')}</div>
                            <div class="chat-text">${this.escapeHtml(reply.content || '')}</div>
                            <div class="chat-time">${new Date(reply.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="reply-form">
                <textarea id="replyText" class="reply-textarea" placeholder="Type your reply..."></textarea>
                <button class="btn-primary" id="sendReplyBtn">
                    <i class="fas fa-paper-plane"></i> Send Reply
                </button>
            </div>
        `;

        // Setup reply handler
        document.getElementById('sendReplyBtn')?.addEventListener('click', () => this.sendReply());

        // Scroll to bottom
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    async sendReplyToTicket(ticketId) {
        const replyText = document.getElementById('replyText')?.value.trim();

        if (!replyText) {
            this.cms.notifications.show('Please enter a reply', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/v1/support/${ticketId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    content: replyText
                })
            });

            if (!response.ok) throw new Error('Failed to send reply');

            this.cms.notifications.show('Reply sent successfully', 'success');

            // Reload conversation
            if (this.selectedConversation) {
                await this.selectConversation(this.selectedConversation.user_id);
            }

            // Reload messages list
            await this.loadMessages();

        } catch (error) {
            console.error('Error sending reply:', error);
            this.cms.notifications.show('Failed to send reply', 'error');
        }
    }

    async sendReply() {
        const replyText = document.getElementById('replyText')?.value.trim();

        if (!replyText) {
            this.cms.notifications.show('Please enter a reply', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/v1/support/${this.selectedMessage.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    content: replyText
                })
            });

            if (!response.ok) throw new Error('Failed to send reply');

            this.cms.notifications.show('Reply sent successfully', 'success');

            // Reload message details
            await this.selectMessage(this.selectedMessage.id);

            // Reload messages list
            await this.loadMessages();

        } catch (error) {
            console.error('Error sending reply:', error);
            this.cms.notifications.show('Failed to send reply', 'error');
        }
    }

    async updateStatus() {
        const newStatus = document.getElementById('statusSelect')?.value;

        if (!newStatus) return;

        try {
            const response = await fetch(`/api/v1/support/${this.selectedMessage.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            this.cms.notifications.show('Status updated successfully', 'success');

            // Reload
            await this.selectMessage(this.selectedMessage.id);
            await this.loadMessages();

        } catch (error) {
            console.error('Error updating status:', error);
            this.cms.notifications.show('Failed to update status', 'error');
        }
    }

    async markAsRead(messageId) {
        try {
            await fetch(`/api/v1/support/${messageId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    updateStats() {
        const total = this.messages.length;
        const unread = this.messages.filter(conv => conv.hasUnread).length;
        const read = total - unread;
        
        // Count conversations from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = this.messages.filter(conv => {
            const msgDate = new Date(conv.lastMessage);
            msgDate.setHours(0, 0, 0, 0);
            return msgDate.getTime() === today.getTime();
        }).length;

        document.getElementById('totalMessages').textContent = total;
        document.getElementById('unreadMessages').textContent = unread;
        document.getElementById('readMessages').textContent = read;
        document.getElementById('todayMessages').textContent = todayCount;
    }

    setupEventListeners() {
        // Conversation item clicks
        document.getElementById('messagesListContainer')?.addEventListener('click', (e) => {
            const item = e.target.closest('.message-item');
            if (item) {
                const userId = item.dataset.userId;
                if (userId) {
                    this.selectConversation(userId);
                }
            }
        });

        // Refresh button
        document.getElementById('refreshMessagesBtn')?.addEventListener('click', () => {
            this.loadMessages();
        });

        // Filters
        document.getElementById('readFilter')?.addEventListener('change', () => {
            this.renderMessagesList();
        });

        document.getElementById('messageSearch')?.addEventListener('input', () => {
            this.renderMessagesList();
        });

        // Mark all read
        document.getElementById('markAllReadBtn')?.addEventListener('click', async () => {
            // Implementation for marking all as read
            this.cms.notifications.show('Feature coming soon', 'info');
        });
    }

    startAutoRefresh() {
        // Clear existing interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        // Refresh every 30 seconds
        this.autoRefreshInterval = setInterval(() => {
            this.loadMessages();
        }, 30000);
    }

    cleanup() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    // Utility methods
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
