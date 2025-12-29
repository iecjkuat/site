/**
 * Messages Page - Communication & Networking Frontend
 */
class MessagesPage {
    constructor() {
        this.communicationService = new CommunicationService();
        this.currentConversation = null;
        this.currentGroup = null;
        this.activeTab = 'direct'; // 'direct', 'groups', 'announcements'
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Messages Page...');
        
        // Initialize UI components
        this.initializeUI();
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup real-time updates if WebSocket is available
        this.setupRealTimeUpdates();
        
        console.log('✅ Messages Page initialized');
    }

    initializeUI() {
        // Create main messaging interface
        const mainContent = document.querySelector('.messages-container') || this.createMessagingInterface();
        
        // Initialize tabs
        this.initializeTabs();
        
        // Initialize conversation list
        this.initializeConversationList();
        
        // Initialize message area
        this.initializeMessageArea();
    }

    createMessagingInterface() {
        const container = document.createElement('div');
        container.className = 'messages-container';
        container.innerHTML = `
            <div class="messaging-interface glass-card" style="margin: 2rem auto; max-width: 1200px; height: 600px; display: flex; border-radius: 20px; overflow: hidden;">
                <!-- Sidebar -->
                <div class="messaging-sidebar" style="width: 350px; background: rgba(255, 255, 255, 0.1); border-right: 1px solid rgba(255, 255, 255, 0.2);">
                    <!-- Tabs -->
                    <div class="messaging-tabs" style="display: flex; border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
                        <button class="tab-btn active" data-tab="direct" style="flex: 1; padding: 1rem; background: none; border: none; color: white; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-comment"></i> Direct
                        </button>
                        <button class="tab-btn" data-tab="groups" style="flex: 1; padding: 1rem; background: none; border: none; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer;">
                            <i class="fas fa-users"></i> Groups
                        </button>
                        <button class="tab-btn" data-tab="announcements" style="flex: 1; padding: 1rem; background: none; border: none; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer;">
                            <i class="fas fa-bullhorn"></i> News
                        </button>
                    </div>
                    
                    <!-- Search -->
                    <div class="search-container" style="padding: 1rem;">
                        <div style="position: relative;">
                            <input type="text" id="searchInput" placeholder="Search conversations..." 
                                   style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: white; font-size: 0.875rem;">
                            <i class="fas fa-search" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.5);"></i>
                        </div>
                    </div>
                    
                    <!-- Conversation List -->
                    <div class="conversation-list" style="flex: 1; overflow-y: auto; padding: 0 1rem;">
                        <div id="conversationsList">
                            <div class="loading-spinner" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">
                                <i class="fas fa-spinner fa-spin"></i> Loading conversations...
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Chat Area -->
                <div class="messaging-main" style="flex: 1; display: flex; flex-direction: column;">
                    <!-- Chat Header -->
                    <div class="chat-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.05);">
                        <div id="chatHeaderContent" style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="color: rgba(255,255,255,0.7); font-size: 0.875rem;">
                                Select a conversation to start messaging
                            </div>
                        </div>
                    </div>
                    
                    <!-- Messages Area -->
                    <div class="messages-area" style="flex: 1; overflow-y: auto; padding: 1rem;">
                        <div id="messagesContainer">
                            <div class="welcome-message" style="text-align: center; padding: 3rem 2rem; color: rgba(255,255,255,0.6);">
                                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                                <h3 style="margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Welcome to Club Communications</h3>
                                <p>Select a conversation from the sidebar to start messaging with club members.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Message Input -->
                    <div class="message-input-area" style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.05);">
                        <div id="messageInputContainer" style="display: none;">
                            <div style="display: flex; align-items: flex-end; gap: 0.75rem;">
                                <div style="flex: 1; position: relative;">
                                    <textarea id="messageInput" placeholder="Type your message..." 
                                              style="width: 100%; min-height: 40px; max-height: 120px; padding: 0.75rem 3rem 0.75rem 1rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; color: white; resize: none; font-family: inherit; font-size: 0.875rem;"
                                              rows="1"></textarea>
                                    <button id="attachBtn" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 0.25rem;">
                                        <i class="fas fa-paperclip"></i>
                                    </button>
                                </div>
                                <button id="sendBtn" style="padding: 0.75rem 1.25rem; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; border-radius: 20px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after hero section
        const heroSection = document.querySelector('section');
        heroSection.parentNode.insertBefore(container, heroSection.nextSibling);
        
        return container;
    }

    initializeTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    async switchTab(tab) {
        this.activeTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
            btn.style.color = btn.dataset.tab === tab ? 'white' : 'rgba(255,255,255,0.7)';
        });
        
        // Load appropriate content
        switch (tab) {
            case 'direct':
                await this.loadConversations();
                break;
            case 'groups':
                await this.loadGroups();
                break;
            case 'announcements':
                await this.loadAnnouncements();
                break;
        }
        
        // Clear current chat
        this.clearCurrentChat();
    }

    async loadInitialData() {
        // Load conversations by default
        await this.loadConversations();
        
        // Update stats in hero section
        this.updateHeroStats();
    }

    async loadConversations() {
        const listContainer = document.getElementById('conversationsList');
        listContainer.innerHTML = '<div class="loading-spinner" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading conversations...</div>';
        
        try {
            const data = await this.communicationService.getConversations();
            this.renderConversations(data.conversations);
        } catch (error) {
            console.error('Error loading conversations:', error);
            listContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">Failed to load conversations</div>';
        }
    }

    renderConversations(conversations) {
        const listContainer = document.getElementById('conversationsList');
        
        if (!conversations || conversations.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">No conversations yet</div>';
            return;
        }
        
        listContainer.innerHTML = conversations.map(conv => `
            <div class="conversation-item" data-id="${conv.id}" style="padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div class="avatar" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem;">
                        ${conv.participant.name.charAt(0)}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                            <div style="font-weight: 600; color: white; font-size: 0.875rem; truncate;">${conv.participant.name}</div>
                            ${conv.unread_count > 0 ? `<div style="background: #ef4444; color: white; border-radius: 10px; padding: 0.125rem 0.5rem; font-size: 0.75rem; font-weight: 600;">${conv.unread_count}</div>` : ''}
                        </div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem; truncate;">${conv.last_message.content}</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.625rem; margin-top: 0.25rem;">${this.formatTime(conv.last_message.created_at)}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = item.dataset.id;
                this.openConversation(convId);
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(255,255,255,0.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255,255,255,0.05)';
            });
        });
    }

    async loadGroups() {
        const listContainer = document.getElementById('conversationsList');
        listContainer.innerHTML = '<div class="loading-spinner" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading groups...</div>';
        
        try {
            const data = await this.communicationService.getGroups();
            this.renderGroups(data.groups);
        } catch (error) {
            console.error('Error loading groups:', error);
            listContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">Failed to load groups</div>';
        }
    }

    renderGroups(groups) {
        const listContainer = document.getElementById('conversationsList');
        
        if (!groups || groups.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">No groups available</div>';
            return;
        }
        
        listContainer.innerHTML = groups.map(group => `
            <div class="group-item" data-id="${group.id}" style="padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div class="group-avatar" style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                            <div style="font-weight: 600; color: white; font-size: 0.875rem; truncate;">${group.name}</div>
                            ${group.unread_count > 0 ? `<div style="background: #ef4444; color: white; border-radius: 10px; padding: 0.125rem 0.5rem; font-size: 0.75rem; font-weight: 600;">${group.unread_count}</div>` : ''}
                        </div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem; truncate;">${group.last_message ? group.last_message.content : 'No messages yet'}</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.625rem; margin-top: 0.25rem;">${group.member_count} members</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', () => {
                const groupId = item.dataset.id;
                this.openGroup(groupId);
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(255,255,255,0.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255,255,255,0.05)';
            });
        });
    }

    async loadAnnouncements() {
        const listContainer = document.getElementById('conversationsList');
        listContainer.innerHTML = '<div class="loading-spinner" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading announcements...</div>';
        
        try {
            const data = await this.communicationService.getAnnouncements();
            this.renderAnnouncements(data.announcements);
        } catch (error) {
            console.error('Error loading announcements:', error);
            listContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">Failed to load announcements</div>';
        }
    }

    renderAnnouncements(announcements) {
        const listContainer = document.getElementById('conversationsList');
        
        if (!announcements || announcements.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">No announcements</div>';
            return;
        }
        
        listContainer.innerHTML = announcements.map(announcement => `
            <div class="announcement-item" data-id="${announcement.id}" style="padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; transition: all 0.2s; ${!announcement.is_read ? 'border-left: 3px solid #3b82f6;' : ''}">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <div class="announcement-icon" style="width: 40px; height: 40px; background: ${this.getAnnouncementColor(announcement.priority_level)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem;">
                        <i class="fas ${this.getAnnouncementIcon(announcement.announcement_type)}"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <div style="font-weight: 600; color: white; font-size: 0.875rem; truncate;">${announcement.title}</div>
                            ${!announcement.is_read ? '<div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>' : ''}
                        </div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${announcement.content}</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.625rem; margin-top: 0.5rem;">${this.formatTime(announcement.created_at)}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        document.querySelectorAll('.announcement-item').forEach(item => {
            item.addEventListener('click', () => {
                const announcementId = item.dataset.id;
                this.openAnnouncement(announcementId);
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(255,255,255,0.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255,255,255,0.05)';
            });
        });
    }

    async openConversation(conversationId) {
        this.currentConversation = conversationId;
        this.currentGroup = null;
        
        // Update header
        this.updateChatHeader('Direct Message', 'Loading...');
        
        // Show message input
        document.getElementById('messageInputContainer').style.display = 'block';
        
        // Load messages
        try {
            const data = await this.communicationService.getMessages(conversationId);
            this.renderMessages(data.messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async openGroup(groupId) {
        this.currentGroup = groupId;
        this.currentConversation = null;
        
        // Update header
        this.updateChatHeader('Group Chat', 'Loading...');
        
        // Show message input
        document.getElementById('messageInputContainer').style.display = 'block';
        
        // Load messages
        try {
            const data = await this.communicationService.getGroupMessages(groupId);
            this.renderMessages(data.messages);
        } catch (error) {
            console.error('Error loading group messages:', error);
        }
    }

    openAnnouncement(announcementId) {
        // Mark as read
        this.communicationService.markAnnouncementAsRead(announcementId);
        
        // Hide message input for announcements
        document.getElementById('messageInputContainer').style.display = 'none';
        
        // Show announcement details
        this.showAnnouncementDetails(announcementId);
    }

    updateChatHeader(type, title) {
        const headerContent = document.getElementById('chatHeaderContent');
        headerContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="color: white; font-weight: 600;">${title}</div>
                <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">${type}</div>
            </div>
        `;
    }

    renderMessages(messages) {
        const container = document.getElementById('messagesContainer');
        
        if (!messages || messages.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">No messages yet</div>';
            return;
        }
        
        container.innerHTML = messages.map(message => `
            <div class="message" style="margin-bottom: 1rem; display: flex; align-items: flex-start; gap: 0.75rem;">
                <div class="message-avatar" style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.75rem; flex-shrink: 0;">
                    ${message.sender_name.charAt(0)}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <div style="font-weight: 600; color: white; font-size: 0.875rem;">${message.sender_name}</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem;">${this.formatTime(message.created_at)}</div>
                    </div>
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.5; font-size: 0.875rem;">${message.content}</div>
                    ${message.reactions ? this.renderReactions(message.reactions) : ''}
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    renderReactions(reactions) {
        if (!reactions || Object.keys(reactions).length === 0) return '';
        
        return `
            <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; flex-wrap: wrap;">
                ${Object.entries(reactions).map(([emoji, count]) => `
                    <span style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 0.25rem 0.5rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.25rem;">
                        ${emoji} ${count}
                    </span>
                `).join('')}
            </div>
        `;
    }

    clearCurrentChat() {
        this.currentConversation = null;
        this.currentGroup = null;
        
        document.getElementById('chatHeaderContent').innerHTML = `
            <div style="color: rgba(255,255,255,0.7); font-size: 0.875rem;">
                Select a conversation to start messaging
            </div>
        `;
        
        document.getElementById('messagesContainer').innerHTML = `
            <div class="welcome-message" style="text-align: center; padding: 3rem 2rem; color: rgba(255,255,255,0.6);">
                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Welcome to Club Communications</h3>
                <p>Select a conversation from the sidebar to start messaging with club members.</p>
            </div>
        `;
        
        document.getElementById('messageInputContainer').style.display = 'none';
    }

    setupEventListeners() {
        // Message input auto-resize
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                messageInput.style.height = 'auto';
                messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
            });
            
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Send button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        try {
            if (this.currentConversation) {
                await this.communicationService.sendMessage(this.currentConversation, content);
            } else if (this.currentGroup) {
                await this.communicationService.sendGroupMessage(this.currentGroup, content);
            }
            
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            // Reload messages
            if (this.currentConversation) {
                const data = await this.communicationService.getMessages(this.currentConversation);
                this.renderMessages(data.messages);
            } else if (this.currentGroup) {
                const data = await this.communicationService.getGroupMessages(this.currentGroup);
                this.renderMessages(data.messages);
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            window.jkuatApp?.showToast('Failed to send message', 'error');
        }
    }

    setupRealTimeUpdates() {
        // Setup WebSocket connection if available
        if (window.WebSocketClient) {
            const wsClient = new WebSocketClient();
            wsClient.on('new_message', (data) => {
                // Refresh current conversation if it matches
                if (data.conversation_id === this.currentConversation || data.group_id === this.currentGroup) {
                    this.refreshCurrentChat();
                }
                
                // Update conversation list
                this.refreshConversationList();
            });
        }
    }

    async refreshCurrentChat() {
        if (this.currentConversation) {
            const data = await this.communicationService.getMessages(this.currentConversation);
            this.renderMessages(data.messages);
        } else if (this.currentGroup) {
            const data = await this.communicationService.getGroupMessages(this.currentGroup);
            this.renderMessages(data.messages);
        }
    }

    async refreshConversationList() {
        if (this.activeTab === 'direct') {
            await this.loadConversations();
        } else if (this.activeTab === 'groups') {
            await this.loadGroups();
        }
    }

    updateHeroStats() {
        // Update unread messages count
        const unreadEl = document.getElementById('unreadMessagesCount');
        if (unreadEl) {
            // This would be calculated from actual data
            unreadEl.textContent = '3';
        }
        
        // Update total conversations count
        const totalEl = document.getElementById('totalConversationsCount');
        if (totalEl) {
            totalEl.textContent = '12';
        }
    }

    filterConversations(query) {
        const items = document.querySelectorAll('.conversation-item, .group-item, .announcement-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }

    getAnnouncementColor(priority) {
        const colors = {
            urgent: 'linear-gradient(135deg, #ef4444, #dc2626)',
            high: 'linear-gradient(135deg, #f59e0b, #d97706)',
            normal: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            low: 'linear-gradient(135deg, #6b7280, #4b5563)'
        };
        return colors[priority] || colors.normal;
    }

    getAnnouncementIcon(type) {
        const icons = {
            event: 'fa-calendar',
            urgent: 'fa-exclamation-triangle',
            achievement: 'fa-trophy',
            general: 'fa-bullhorn'
        };
        return icons[type] || icons.general;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('messages')) {
        new MessagesPage();
    }
});