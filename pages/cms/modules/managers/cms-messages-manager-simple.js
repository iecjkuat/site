/**
 * Simple WhatsApp-style Messages Manager
 * Version 2.0 - Updated layout with avatars
 */

export class CMSMessagesManager {
    constructor(cmsManager) {
        console.log('🔄 CMSMessagesManager v2.0 loaded with avatar layout');
        this.cms = cmsManager;
        this.conversations = new Map(); // user_id -> conversation
        this.selectedUserId = null;
    }

    async load() {
        const container = document.getElementById('cms-content');
        if (!container) return;

        container.innerHTML = this.getHTML();
        await this.loadConversations();
        this.setupEventListeners();
    }

    getHTML() {
        return `
            <div class="whatsapp-container">
                <!-- Sidebar -->
                <div class="whatsapp-sidebar">
                    <div class="sidebar-header">
                        <h2>Messages</h2>
                        <button id="refreshBtn" class="icon-btn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="sidebar-search">
                        <input type="text" id="searchInput" placeholder="Search conversations...">
                    </div>
                    <div id="conversationsList" class="conversations-list">
                        <div class="loading">Loading...</div>
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="whatsapp-chat">
                    <div id="chatArea" class="empty-chat">
                        <i class="fas fa-comments"></i>
                        <p>Select a conversation to start messaging</p>
                    </div>
                </div>
            </div>

            <style>
                .whatsapp-container {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    height: calc(100vh - 200px);
                    background: #111b21;
                    border-radius: 8px;
                    overflow: hidden;
                }

                /* Sidebar */
                .whatsapp-sidebar {
                    background: #111b21;
                    border-right: 1px solid #2a3942;
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-header {
                    padding: 1.5rem;
                    background: #202c33;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sidebar-header h2 {
                    color: #e9edef;
                    font-size: 1.5rem;
                    margin: 0;
                }

                .icon-btn {
                    background: none;
                    border: none;
                    color: #aebac1;
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background 0.2s;
                }

                .icon-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .sidebar-search {
                    padding: 0.75rem 1rem;
                    background: #111b21;
                }

                .sidebar-search input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: #202c33;
                    border: none;
                    border-radius: 8px;
                    color: #e9edef;
                    font-size: 0.9rem;
                }

                .sidebar-search input::placeholder {
                    color: #667781;
                }

                .sidebar-search input:focus {
                    outline: none;
                }

                .conversations-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .conversations-list::-webkit-scrollbar {
                    width: 6px;
                }

                .conversations-list::-webkit-scrollbar-thumb {
                    background: #374045;
                    border-radius: 3px;
                }

                .conversation-item {
                    padding: 1rem;
                    border-bottom: 1px solid #2a3942;
                    cursor: pointer;
                    display: flex;
                    gap: 1rem;
                    transition: background 0.2s;
                }

                .conversation-item:hover {
                    background: #202c33;
                }

                .conversation-item.active {
                    background: #2a3942;
                }

                .conversation-item.unread {
                    background: #1c2b33;
                }

                .conversation-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #25d366, #128c7e);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .conversation-info {
                    flex: 1;
                    min-width: 0;
                }

                .conversation-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.25rem;
                }

                .conversation-name {
                    color: #e9edef;
                    font-weight: 500;
                    font-size: 1rem;
                }

                .conversation-time {
                    color: #667781;
                    font-size: 0.75rem;
                }

                .conversation-preview {
                    color: #667781;
                    font-size: 0.875rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .conversation-item.unread .conversation-preview {
                    color: #d1d7db;
                }

                .unread-badge {
                    background: #25d366;
                    color: #111b21;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-top: 0.25rem;
                }

                /* Chat Area */
                .whatsapp-chat {
                    background: #0b141a;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .empty-chat {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #667781;
                    gap: 1rem;
                }

                .empty-chat i {
                    font-size: 4rem;
                    color: #374045;
                }

                .chat-header {
                    padding: 1rem 1.5rem;
                    background: #202c33;
                    border-bottom: 1px solid #2a3942;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .chat-header-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #25d366, #128c7e);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                }

                .chat-header-info h3 {
                    color: #e9edef;
                    margin: 0;
                    font-size: 1rem;
                }

                .chat-header-info p {
                    color: #667781;
                    margin: 0;
                    font-size: 0.8rem;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem 1rem;
                    background: #0a1014;
                    background-image: 
                        repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.02) 35px, rgba(255,255,255,.02) 70px),
                        repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.02) 35px, rgba(255,255,255,.02) 70px);
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: #374045;
                    border-radius: 3px;
                }

                .message {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    animation: slideIn 0.2s ease;
                    align-items: flex-start;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .message.sent {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .message.received .message-avatar {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                .message.sent .message-avatar {
                    background: linear-gradient(135deg, #25d366, #128c7e);
                }

                .message-bubble {
                    max-width: 70%;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    position: relative;
                    box-shadow: 0 2px 8px rgba(0,0,0,.15);
                }

                .message.received .message-bubble {
                    background: #202c33;
                }

                .message.sent .message-bubble {
                    background: #005c4b;
                }

                .message-text {
                    color: #e9edef;
                    line-height: 1.5;
                    word-wrap: break-word;
                    font-size: 0.95rem;
                    margin-bottom: 0.25rem;
                    white-space: pre-wrap;
                }

                .message-time {
                    color: rgba(255,255,255,0.5);
                    font-size: 0.7rem;
                    text-align: right;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.25rem;
                }

                .message-time i {
                    font-size: 0.75rem;
                    color: #53bdeb;
                }

                .chat-input-area {
                    padding: 0.5rem 1rem;
                    background: #202c33;
                    display: flex;
                    gap: 0.5rem;
                    align-items: flex-end;
                }

                .input-icon-btn {
                    background: none;
                    border: none;
                    color: #8696a0;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    transition: color 0.2s;
                }

                .input-icon-btn:hover {
                    color: #aebac1;
                }

                .chat-input {
                    flex: 1;
                    background: #2a3942;
                    border: none;
                    border-radius: 8px;
                    padding: 0.6rem 0.75rem;
                    color: #e9edef;
                    font-size: 0.95rem;
                    resize: none;
                    max-height: 100px;
                    font-family: inherit;
                    line-height: 1.4;
                }

                .chat-input:focus {
                    outline: none;
                }

                .chat-input::placeholder {
                    color: #667781;
                }

                .send-btn {
                    background: #25d366;
                    border: none;
                    border-radius: 50%;
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #111b21;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .send-btn:hover {
                    background: #20ba5a;
                    transform: scale(1.05);
                }

                .send-btn:active {
                    transform: scale(0.95);
                }

                .loading {
                    text-align: center;
                    padding: 2rem;
                    color: #667781;
                }

                @media (max-width: 1024px) {
                    .whatsapp-container {
                        grid-template-columns: 1fr;
                    }
                    
                    .whatsapp-sidebar {
                        display: none;
                    }
                    
                    .whatsapp-sidebar.show {
                        display: flex;
                    }
                }
            </style>
        `;
    }

    async loadConversations() {
        try {
            const response = await fetch('/api/v1/support', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });

            if (!response.ok) throw new Error('Failed to load');

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
            console.error('Error:', error);
        }
    }

    renderConversations() {
        const list = document.getElementById('conversationsList');
        const convs = Array.from(this.conversations.values())
            .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

        if (convs.length === 0) {
            list.innerHTML = '<div class="loading">No conversations yet</div>';
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
                            <span class="conversation-name">${this.escapeHtml(conv.user?.name || 'Unknown')}</span>
                            <span class="conversation-time">${this.getTimeAgo(new Date(conv.lastTime))}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="conversation-preview">${this.escapeHtml(lastMsg.description || '')}</div>
                            ${conv.unread > 0 ? `<div class="unread-badge">${conv.unread}</div>` : ''}
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

        // Fetch full details
        const promises = conv.messages.map(msg => 
            fetch(`/api/v1/support/${msg.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            }).then(r => r.json())
        );

        const fullMessages = await Promise.all(promises);

        // Flatten all messages
        const timeline = [];
        fullMessages.forEach(ticket => {
            timeline.push({ ...ticket, type: 'ticket', isAdmin: false });
            (ticket.replies || []).forEach(reply => {
                timeline.push({ ...reply, type: 'reply', isAdmin: reply.is_admin });
            });
        });
        timeline.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        this.renderChat(conv, timeline);
        this.renderConversations();

        // Mark as read
        conv.messages.forEach(msg => {
            if (!msg.read_at) {
                fetch(`/api/v1/support/${msg.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
            }
        });
        conv.unread = 0;
    }

    renderChat(conv, timeline) {
        const chatArea = document.getElementById('chatArea');
        const currentUser = window.authManager?.getUser();

        chatArea.className = ''; // Remove empty-chat class
        chatArea.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-avatar">${this.getInitials(conv.user?.name)}</div>
                <div class="chat-header-info">
                    <h3>${this.escapeHtml(conv.user?.name || 'Unknown')}</h3>
                    <p>${this.escapeHtml(conv.user?.email || '')}</p>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                ${timeline.map((msg, index) => {
                    const isAdmin = msg.isAdmin || msg.is_admin;
                    const content = msg.content || msg.description || '';
                    const time = new Date(msg.created_at);
                    const senderName = isAdmin ? (currentUser?.name || 'You') : (conv.user?.name || 'User');
                    
                    return `
                        <div class="message ${isAdmin ? 'sent' : 'received'}" data-message-id="${msg.id}">
                            <div class="message-avatar">${this.getInitials(senderName)}</div>
                            <div class="message-bubble">
                                <div class="message-text">${this.escapeHtml(content)}</div>
                                <div class="message-time">
                                    ${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    ${isAdmin ? '<i class="fas fa-check-double"></i>' : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="chat-input-area">
                <button class="input-icon-btn" title="Emoji">
                    <i class="far fa-smile"></i>
                </button>
                <button class="input-icon-btn" title="Attach">
                    <i class="fas fa-paperclip"></i>
                </button>
                <textarea id="chatInput" class="chat-input" placeholder="Type a message" rows="1"></textarea>
                <button class="send-btn" id="sendBtn" title="Send">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        // Auto-resize textarea
        const input = document.getElementById('chatInput');
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });

        // Send button
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage(conv));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(conv);
            }
        });

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
        const text = input.value.trim();
        if (!text) return;

        const lastTicket = conv.messages[conv.messages.length - 1];

        try {
            await fetch(`/api/v1/support/${lastTicket.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ content: text })
            });

            input.value = '';
            input.style.height = 'auto';
            await this.openConversation(conv.userId);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('conversationsList').addEventListener('click', (e) => {
            const item = e.target.closest('.conversation-item');
            if (item) this.openConversation(item.dataset.userId);
        });

        document.getElementById('refreshBtn').addEventListener('click', () => this.loadConversations());

        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.conversation-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
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

    cleanup() {}
}
