/**
 * CMS Messages Manager - Chat Style
 * Uses the exact structure from support page chat window
 */

export class CMSMessagesManager {
    constructor(cmsManager) {
        console.log('💬 CMSMessagesManager (Chat Style) initialized');
        this.cms = cmsManager;
        this.conversations = new Map();
        this.selectedUserId = null;
        this.refreshInterval = null;
    }

    async load() {
        const container = document.getElementById('cms-content');
        if (!container) return;

        container.innerHTML = this.getHTML();
        await this.loadConversations();
        this.setupEventListeners();
        
        // Auto-refresh every 10 seconds
        this.refreshInterval = setInterval(() => this.loadConversations(), 10000);
    }

    getHTML() {
        return `
            <div class="messages-container">
                <!-- Conversations List -->
                <div class="conversations-sidebar">
                    <div class="sidebar-header">
                        <h2><i class="fas fa-comments"></i> Messages</h2>
                        <button id="refreshMessagesBtn" class="icon-btn" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="sidebar-search">
                        <input type="text" id="searchConversations" placeholder="Search conversations...">
                    </div>
                    <div id="conversationsList" class="conversations-list">
                        <div class="loading-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading conversations...</p>
                        </div>
                    </div>
                </div>

                <!-- Chat Window -->
                <div class="chat-window-container">
                    <div id="chatWindowArea" class="empty-state">
                        <i class="fas fa-comments"></i>
                        <h3>Select a conversation</h3>
                        <p>Choose a conversation from the list to view messages</p>
                    </div>
                </div>
            </div>

            <style>
                .messages-container {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 1.5rem;
                    height: calc(100vh - 250px);
                    min-height: 500px;
                }

                /* Conversations Sidebar */
                .conversations-sidebar {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .sidebar-header {
                    padding: 1.25rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sidebar-header h2 {
                    color: white;
                    font-size: 1.25rem;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .icon-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .icon-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.05);
                }

                .sidebar-search {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .sidebar-search input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 0.875rem;
                }

                .sidebar-search input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .sidebar-search input:focus {
                    outline: none;
                    border-color: rgba(16, 185, 129, 0.5);
                    background: rgba(255, 255, 255, 0.08);
                }

                .conversations-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .conversations-list::-webkit-scrollbar {
                    width: 6px;
                }

                .conversations-list::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }

                .conversation-item {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    transition: all 0.2s;
                }

                .conversation-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .conversation-item.active {
                    background: rgba(16, 185, 129, 0.1);
                    border-left: 3px solid #10b981;
                }

                .conversation-item.unread {
                    background: rgba(59, 130, 246, 0.05);
                }

                .conversation-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }

                .conversation-info {
                    flex: 1;
                    min-width: 0;
                }

                .conversation-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }

                .conversation-name {
                    color: white;
                    font-weight: 600;
                    font-size: 0.95rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .conversation-time {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.75rem;
                    flex-shrink: 0;
                }

                .conversation-preview {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.85rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .unread-badge {
                    background: #10b981;
                    color: white;
                    border-radius: 10px;
                    padding: 0.125rem 0.5rem;
                    font-size: 0.7rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                /* Chat Window Container */
                .chat-window-container {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.5);
                    gap: 1rem;
                    padding: 2rem;
                }

                .empty-state i {
                    font-size: 4rem;
                    color: rgba(255, 255, 255, 0.2);
                }

                .empty-state h3 {
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                    font-size: 1.25rem;
                }

                .empty-state p {
                    margin: 0;
                    font-size: 0.9rem;
                }

                .loading-state {
                    padding: 2rem;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.6);
                }

                .loading-state i {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: #10b981;
                }

                /* Chat Window (Active) - Exact structure from support page */
                .chat-window {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .chat-header {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .chat-header-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .chat-header-text h3 {
                    font-size: 1rem;
                    margin: 0 0 0.15rem 0;
                }

                .chat-header-text p {
                    font-size: 0.8rem;
                    margin: 0;
                    opacity: 0.9;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    background: rgba(0, 0, 0, 0.2);
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }

                .chat-message {
                    margin-bottom: 1rem;
                    display: flex;
                    gap: 0.75rem;
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
                    flex-direction: row;
                }

                .chat-message.admin {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .chat-message.user .message-avatar {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                .chat-message.admin .message-avatar {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .message-bubble {
                    max-width: 70%;
                    padding: 0.75rem 1rem;
                    border-radius: 1rem;
                    position: relative;
                }

                .chat-message.user .message-bubble {
                    background: rgba(255, 255, 255, 0.1);
                    border-bottom-left-radius: 0.25rem;
                }

                .chat-message.admin .message-bubble {
                    background: linear-gradient(135deg, #10b981, #059669);
                    border-bottom-right-radius: 0.25rem;
                }

                .message-text {
                    color: white;
                    line-height: 1.5;
                    word-wrap: break-word;
                    font-size: 0.9rem;
                    margin-bottom: 0.25rem;
                    white-space: pre-wrap;
                }

                .message-time {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .chat-message.admin .message-time {
                    justify-content: flex-end;
                }

                .chat-input-area {
                    padding: 1rem 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .chat-input-wrapper {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .chat-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 2rem;
                    color: white;
                    font-family: inherit;
                    font-size: 0.9rem;
                    resize: none;
                    max-height: 100px;
                }

                .chat-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .chat-input:focus {
                    outline: none;
                    border-color: rgba(16, 185, 129, 0.5);
                    background: rgba(255, 255, 255, 0.08);
                }

                .chat-send-btn {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10b981, #059669);
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .chat-send-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                }

                .chat-send-btn:active {
                    transform: scale(0.95);
                }

                @media (max-width: 1024px) {
                    .messages-container {
                        grid-template-columns: 1fr;
                    }

                    .conversations-sidebar {
                        display: none;
                    }

                    .conversations-sidebar.show {
                        display: flex;
                    }
                }
            </style>
        `;
    }

    async loadConversations() {
        try {
            const response = await fetch('/api/v1/support', {
                headers: { 'Authorization': `Bearer ${(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))}` }
            });

            if (!response.ok) throw new Error('Failed to load conversations');

            const data = await response.json();
            const tickets = data.tickets || [];

            // Group by user
            this.conversations.clear();
            tickets.forEach(ticket => {
                const userId = ticket.user_id || ticket.userId;
                if (!this.conversations.has(userId)) {
                    this.conversations.set(userId, {
                        user: ticket.user,
                        userId: userId,
                        messages: [],
                        lastTime: ticket.created_at,
                        unread: 0
                    });
                }
                
                const conv = this.conversations.get(userId);
                conv.messages.push(ticket);
                if (!ticket.read_at) conv.unread++;
                if (new Date(ticket.created_at) > new Date(conv.lastTime)) {
                    conv.lastTime = ticket.created_at;
                }
            });

            this.renderConversations();
        } catch (error) {
            console.error('Error loading conversations:', error);
            const list = document.getElementById('conversationsList');
            if (list) {
                list.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load conversations</p>
                    </div>
                `;
            }
        }
    }

    renderConversations() {
        const list = document.getElementById('conversationsList');
        if (!list) return;

        const convs = Array.from(this.conversations.values())
            .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

        if (convs.length === 0) {
            list.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-inbox"></i>
                    <p>No conversations yet</p>
                </div>
            `;
            return;
        }

        list.innerHTML = convs.map(conv => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            return `
                <div class="conversation-item ${conv.unread > 0 ? 'unread' : ''} ${this.selectedUserId === conv.userId ? 'active' : ''}"
                     data-user-id="${conv.userId}">
                    <div class="conversation-avatar">${this.getInitials(conv.user?.name)}</div>
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <span class="conversation-name">${this.escapeHtml(conv.user?.name || 'Unknown User')}</span>
                            <span class="conversation-time">${this.getTimeAgo(new Date(conv.lastTime))}</span>
                        </div>
                        <div class="conversation-preview">
                            <span>${this.escapeHtml(lastMsg.description || lastMsg.subject || 'No message')}</span>
                            ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async openConversation(userId) {
        this.selectedUserId = userId;
        const conv = this.conversations.get(userId);
        if (!conv) return;

        // Fetch full details with replies
        const promises = conv.messages.map(msg => 
            fetch(`/api/v1/support/${msg.id}`, {
                headers: { 'Authorization': `Bearer ${(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))}` }
            }).then(r => r.json())
        );

        const fullMessages = await Promise.all(promises);

        // Flatten all messages into timeline
        const timeline = [];
        fullMessages.forEach(ticket => {
            timeline.push({ 
                ...ticket, 
                type: 'ticket', 
                isAdmin: false,
                content: ticket.description 
            });
            (ticket.replies || []).forEach(reply => {
                timeline.push({ 
                    ...reply, 
                    type: 'reply', 
                    isAdmin: reply.is_admin 
                });
            });
        });
        timeline.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        this.renderChatWindow(conv, timeline);
        this.renderConversations(); // Update sidebar

        // Mark as read
        conv.messages.forEach(msg => {
            if (!msg.read_at) {
                fetch(`/api/v1/support/${msg.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))}` }
                });
            }
        });
        conv.unread = 0;
    }

    renderChatWindow(conv, timeline) {
        const chatArea = document.getElementById('chatWindowArea');
        if (!chatArea) return;

        const currentUser = window.authManager?.getUser();

        chatArea.className = 'chat-window';
        chatArea.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-avatar">${this.getInitials(conv.user?.name)}</div>
                <div class="chat-header-text">
                    <h3>${this.escapeHtml(conv.user?.name || 'Unknown User')}</h3>
                    <p>${this.escapeHtml(conv.user?.email || '')}</p>
                </div>
            </div>

            <div class="chat-messages" id="chatMessages">
                ${timeline.map(msg => {
                    const isAdmin = msg.isAdmin || msg.is_admin;
                    const content = msg.content || msg.description || '';
                    const time = new Date(msg.created_at);
                    const senderName = isAdmin ? (currentUser?.name || 'You') : (conv.user?.name || 'User');
                    
                    return `
                        <div class="chat-message ${isAdmin ? 'admin' : 'user'}">
                            <div class="message-avatar">${this.getInitials(senderName)}</div>
                            <div class="message-bubble">
                                <div class="message-text">${this.escapeHtml(content)}</div>
                                <div class="message-time">
                                    ${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    ${isAdmin ? '<i class="fas fa-check"></i>' : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="chat-input-area">
                <div class="chat-input-wrapper">
                    <textarea id="chatInput" class="chat-input" placeholder="Type your reply..." rows="1"></textarea>
                    <button class="chat-send-btn" id="sendMessageBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        // Auto-resize textarea
        const input = document.getElementById('chatInput');
        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 100) + 'px';
            });

            // Send on Enter (without Shift)
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(conv);
                }
            });
        }

        // Send button
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage(conv));
        }

        // Scroll to bottom
        setTimeout(() => {
            const messages = document.getElementById('chatMessages');
            if (messages) {
                messages.scrollTop = messages.scrollHeight;
            }
        }, 100);
    }

    async sendMessage(conv) {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        const lastTicket = conv.messages[conv.messages.length - 1];

        try {
            const response = await fetch(`/api/v1/support/${lastTicket.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))}`
                },
                body: JSON.stringify({ content: text })
            });

            if (!response.ok) throw new Error('Failed to send message');

            input.value = '';
            input.style.height = 'auto';
            
            // Reload conversation
            await this.openConversation(conv.userId);
            
            this.cms.notifications.show('Message sent', 'success');
        } catch (error) {
            console.error('Error sending message:', error);
            this.cms.notifications.show('Failed to send message', 'error');
        }
    }

    setupEventListeners() {
        // Conversation click
        const list = document.getElementById('conversationsList');
        if (list) {
            list.addEventListener('click', (e) => {
                const item = e.target.closest('.conversation-item');
                if (item) {
                    this.openConversation(item.dataset.userId);
                }
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshMessagesBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadConversations());
        }

        // Search
        const searchInput = document.getElementById('searchConversations');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll('.conversation-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(query) ? 'flex' : 'none';
                });
            });
        }
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}
