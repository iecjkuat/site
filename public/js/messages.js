// Messages JavaScript
let currentUser = null;
let currentConversation = null;
let messages = [];
let groups = [];
let users = [];
let currentFilter = 'inbox';

// Initialize messages page
document.addEventListener('DOMContentLoaded', function() {
    // Check for direct conversation first to potentially hide hero
    const urlParams = new URLSearchParams(window.location.search);
    const recipientId = urlParams.get('recipient');
    
    if (recipientId) {
        // Hide hero section for direct conversations
        const heroSection = document.querySelector('section:first-of-type');
        if (heroSection) {
            heroSection.style.display = 'none';
            console.log('Hero section hidden for direct conversation');
        }
    }
    
    checkAuth();
    initializeEventListeners();
    loadMessages();
    loadUsers();
    loadGroups();
    
    // Check for direct conversation from URL parameters
    checkForDirectConversation();
});

// Check for direct conversation from URL parameters
function checkForDirectConversation() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipientId = urlParams.get('recipient');
    const hash = window.location.hash;
    
    if (recipientId) {
        console.log('Opening direct conversation with recipient:', recipientId);
        console.log('URL hash:', hash);
        
        // If hash is present, let browser handle initial scroll, then enhance it
        if (hash === '#messagesInterface') {
            console.log('Hash detected, enhancing scroll...');
            // Let browser do initial scroll, then enhance
            setTimeout(() => {
                scrollToMessagesInterface();
            }, 200);
        } else {
            // No hash, do manual scroll
            setTimeout(() => {
                console.log('No hash, doing manual scroll...');
                scrollToMessagesInterface();
            }, 100);
        }
        
        // Additional scroll attempts to ensure it works
        setTimeout(() => {
            console.log('Additional scroll attempt...');
            scrollToMessagesInterface();
        }, 500);
        
        setTimeout(() => {
            console.log('Final scroll attempt...');
            scrollToMessagesInterface();
        }, 1000);
        
        // Wait a bit for data to load, then open the conversation
        setTimeout(() => {
            openDirectConversation(recipientId);
        }, 1200);
    }
}

// Scroll to the messages interface section
function scrollToMessagesInterface() {
    console.log('scrollToMessagesInterface called');
    
    // Find the messages interface section by ID
    const messagesSection = document.getElementById('messagesInterface');
    console.log('Messages section found:', !!messagesSection);
    
    if (messagesSection) {
        // Get the position of the element
        const rect = messagesSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - 100; // 100px offset from top
        
        console.log('Target scroll position:', targetPosition);
        console.log('Current scroll position:', scrollTop);
        
        // Try multiple scroll methods
        try {
            // Method 1: scrollIntoView
            messagesSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            console.log('scrollIntoView executed');
        } catch (e) {
            console.error('scrollIntoView failed:', e);
        }
        
        // Method 2: window.scrollTo as backup
        setTimeout(() => {
            try {
                window.scrollTo({ 
                    top: targetPosition,
                    behavior: 'smooth' 
                });
                console.log('window.scrollTo executed to position:', targetPosition);
            } catch (e) {
                console.error('window.scrollTo failed:', e);
            }
        }, 100);
        
    } else {
        // Fallback: scroll to a specific position (skip hero section)
        console.log('Messages interface not found, using fallback scroll');
        const fallbackPosition = 700; // Increased fallback position
        
        try {
            window.scrollTo({ 
                top: fallbackPosition,
                behavior: 'smooth' 
            });
            console.log('Fallback scroll to position:', fallbackPosition);
        } catch (e) {
            console.error('Fallback scroll failed:', e);
            // Last resort: instant scroll
            window.scrollTo(0, fallbackPosition);
        }
    }
}

// Open direct conversation with a specific user
async function openDirectConversation(recipientId) {
    try {
        console.log('Opening direct conversation with:', recipientId);
        
        // First, try to find existing conversation with this user
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/messages/thread/${recipientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // If conversation exists, display it
            if (data.messages && data.messages.length > 0) {
                displayConversation(data.messages, recipientId);
                currentConversation = recipientId;
                
                // Highlight the conversation in the sidebar if it exists
                const conversationItems = document.querySelectorAll('.conversation-item');
                conversationItems.forEach(item => {
                    if (item.dataset.userId === recipientId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            } else {
                // No existing conversation, start a new one
                startNewConversation(recipientId);
            }
        } else {
            // No existing conversation, start a new one
            startNewConversation(recipientId);
        }
        
        // Show compose area
        const composeArea = document.getElementById('messageCompose');
        if (composeArea) {
            composeArea.style.display = 'block';
        }
        
        // Clear URL parameters to clean up the URL
        const url = new URL(window.location);
        url.searchParams.delete('recipient');
        window.history.replaceState({}, document.title, url.pathname);
        
    } catch (error) {
        console.error('Failed to open direct conversation:', error);
        // Fallback: show new message interface
        startNewConversation(recipientId);
    }
}

// Start a new conversation with a specific user
async function startNewConversation(recipientId) {
    try {
        console.log('Starting new conversation with:', recipientId);
        
        // Get user information for the recipient
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/auth/user/${recipientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let recipientName = 'Unknown User';
        let recipientInfo = null;
        
        if (response.ok) {
            const userData = await response.json();
            recipientInfo = userData.user;
            recipientName = userData.user.name;
            console.log('Recipient info loaded:', recipientInfo);
        } else {
            console.error('Failed to load recipient info:', response.status);
        }
        
        // Clear the messages area and show new conversation interface
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-user" style="font-size: 2rem; color: #3b82f6;"></i>
                    </div>
                    <h3 style="color: white; margin-bottom: 0.5rem;">New Conversation</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">Starting a new conversation with</p>
                    <h4 style="color: #10b981; font-weight: 700; margin-bottom: 0.5rem;">${recipientName}</h4>
                    ${recipientInfo ? `
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 1.5rem;">
                            ${recipientInfo.role || 'Club Member'} • ${recipientInfo.course || 'JKUAT'}
                        </p>
                    ` : `
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 1.5rem;">
                            Club Official
                        </p>
                    `}
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Type your message below to begin the conversation.</p>
                </div>
            `;
            console.log('New conversation interface displayed for:', recipientName);
        // Update chat header with recipient info
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader && recipientInfo) {
            const initials = recipientInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            chatHeader.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="position: relative;">
                        ${recipientInfo.profile_picture ? 
                            `<img src="${recipientInfo.profile_picture}" alt="${recipientInfo.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` :
                            `<div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem;">
                                ${initials}
                            </div>`
                        }
                        <div style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: #10b981; border: 2px solid rgba(0, 0, 0, 0.8); border-radius: 50%;"></div>
                    </div>
                    <div>
                        <h3 style="font-size: 1rem; font-weight: 600; color: white; margin: 0;">${recipientInfo.name}</h3>
                        <p style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6); margin: 0;">${recipientInfo.role || 'Club Member'}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button class="btn-glass btn-sm">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn-glass btn-sm">
                        <i class="fas fa-video"></i>
                    </button>
                    <button class="btn-glass btn-sm">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            `;
        }
                </div>
            `;
        }
        
        // Set the current conversation
        currentConversation = recipientId;
        
        // Pre-fill recipient in compose form if it exists
        const recipientSelect = document.getElementById('recipientSelect');
        if (recipientSelect) {
            recipientSelect.value = recipientId;
        }
        
        // Set up message input for new conversation
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessageBtn');
        
        if (messageInput && sendButton) {
            // Clear any existing event listeners
            const newSendButton = sendButton.cloneNode(true);
            sendButton.parentNode.replaceChild(newSendButton, sendButton);
            
            // Add event listener for sending messages
            newSendButton.addEventListener('click', () => sendFirstMessage(recipientId));
            
            // Add enter key listener
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendFirstMessage(recipientId);
                }
            });
            
            // Focus on input
            messageInput.focus();
            messageInput.placeholder = `Message ${recipientName}...`;
        }
        
        // Ensure we're scrolled to the messages interface
        setTimeout(() => {
            scrollToMessagesInterface();
        }, 100);
        
    } catch (error) {
        console.error('Failed to start new conversation:', error);
    }
}

// Send the first message in a new conversation
async function sendFirstMessage(recipientId) {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput || !messageInput.value.trim()) return;
    
    const messageContent = messageInput.value.trim();
    console.log('Sending first message to:', recipientId, 'Content:', messageContent);
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipientId: recipientId,
                content: messageContent,
                messageType: 'DIRECT'
            })
        });
        
        if (response.ok) {
            console.log('Message sent successfully');
            messageInput.value = '';
            
            // Reload the conversation to show the sent message
            setTimeout(() => {
                openDirectConversation(recipientId);
            }, 500);
        } else {
            console.error('Failed to send message:', response.status);
            alert('Failed to send message. Please try again.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Authentication failed');
        }
        
        const data = await response.json();
        currentUser = data.user;
        document.getElementById('userNameNav').textContent = currentUser.name;
        
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Message type toggle
    document.querySelectorAll('input[name="messageType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'direct') {
                document.getElementById('directFields').style.display = 'block';
                document.getElementById('groupFields').style.display = 'none';
            } else {
                document.getElementById('directFields').style.display = 'none';
                document.getElementById('groupFields').style.display = 'block';
            }
        });
    });
    
    // Message content character counter
    document.getElementById('messageContent').addEventListener('input', function() {
        document.getElementById('messageLength').textContent = this.value.length;
    });
    
    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter and reload messages
            currentFilter = this.dataset.filter;
            loadMessages();
        });
    });
    
    // Search on Enter
    document.getElementById('messageSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMessages();
        }
    });
}

// Load messages
async function loadMessages() {
    try {
        const token = localStorage.getItem('token');
        const endpoint = currentFilter === 'sent' ? '/api/messages/sent' : '/api/messages/inbox';
        
        const response = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        
        const data = await response.json();
        messages = data.messages;
        
        displayMessages(messages);
        updateUnreadCount(data.unreadCount || 0);
        
    } catch (error) {
        console.error('Failed to load messages:', error);
        document.getElementById('messageList').innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i>
                <p class="text-muted">Failed to load messages</p>
                <button class="btn btn-sm btn-primary" onclick="loadMessages()">Retry</button>
            </div>
        `;
    }
}

// Display messages in sidebar
function displayMessages(messageList) {
    const container = document.getElementById('messageList');
    
    if (messageList.length === 0) {
        container.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
                <p class="text-muted">No messages found</p>
            </div>
        `;
        return;
    }
    
    const html = messageList.map(message => {
        const isUnread = ['Sent', 'Delivered'].includes(message.status);
        const sender = currentFilter === 'sent' ? message.recipient : message.sender;
        const priorityClass = message.priority === 'High' ? 'priority-high' : 
                             message.priority === 'Urgent' ? 'priority-urgent' : '';
        
        return `
            <div class="message-item ${isUnread ? 'unread' : ''} ${priorityClass}" 
                 onclick="openConversation('${message._id}', '${sender._id}')">
                <div class="d-flex align-items-center mb-2">
                    <img src="${sender.profilePhoto || '/images/default-avatar.png'}" 
                         alt="Avatar" class="rounded-circle me-2" width="40" height="40">
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between">
                            <strong class="text-truncate">${sender.name}</strong>
                            <small class="text-muted">${formatMessageTime(message.createdAt)}</small>
                        </div>
                        <div class="text-muted small">${sender.role}</div>
                    </div>
                    ${message.isEmergency ? '<i class="fas fa-exclamation-triangle text-danger"></i>' : ''}
                </div>
                <div class="mb-1">
                    <strong class="text-truncate d-block">${message.subject}</strong>
                </div>
                <div class="text-muted small text-truncate">
                    ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="d-flex align-items-center">
                        ${message.messageType === 'Group' ? '<i class="fas fa-users text-primary me-1"></i>' : ''}
                        <span class="badge bg-${getPriorityColor(message.priority)} me-1">${message.priority}</span>
                        ${message.attachments && message.attachments.length > 0 ? '<i class="fas fa-paperclip text-muted"></i>' : ''}
                    </div>
                    <div class="text-end">
                        ${isUnread ? '<span class="badge bg-primary">New</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Open conversation
async function openConversation(messageId, userId) {
    try {
        // Mark message items as active
        document.querySelectorAll('.message-item').forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        currentConversation = userId;
        
        // Load conversation thread
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/messages/thread/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load conversation');
        }
        
        const data = await response.json();
        displayConversation(data.messages, userId);
        
        // Show compose area
        document.getElementById('messageCompose').style.display = 'block';
        
        // Update recipient info
        const otherUser = users.find(u => u._id === userId) || 
                         messages.find(m => m.sender._id === userId || m.recipient._id === userId)?.sender ||
                         messages.find(m => m.sender._id === userId || m.recipient._id === userId)?.recipient;
        
        if (otherUser) {
            document.getElementById('recipientAvatar').src = otherUser.profilePhoto || '/images/default-avatar.png';
            document.getElementById('recipientName').textContent = otherUser.name;
            document.getElementById('recipientInfo').textContent = `${otherUser.role} • ${otherUser.email}`;
        }
        
    } catch (error) {
        console.error('Failed to open conversation:', error);
        showError('Failed to load conversation');
    }
}

// Display conversation thread
function displayConversation(messageList, userId) {
    const container = document.getElementById('messageThread');
    
    if (messageList.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Start a conversation</h5>
                <p class="text-muted">Send your first message below</p>
            </div>
        `;
        return;
    }
    
    const html = messageList.map(message => {
        const isSent = message.sender._id === currentUser._id;
        const bubbleClass = isSent ? 'sent' : 'received';
        
        return `
            <div class="d-flex ${isSent ? 'justify-content-end' : 'justify-content-start'} mb-3">
                ${!isSent ? `<img src="${message.sender.profilePhoto || '/images/default-avatar.png'}" 
                            alt="Avatar" class="rounded-circle me-2" width="32" height="32">` : ''}
                <div class="message-bubble ${bubbleClass}">
                    <div class="mb-1">
                        <strong>${message.subject}</strong>
                    </div>
                    <div>${message.content}</div>
                    <div class="message-time">
                        ${formatMessageTime(message.createdAt)}
                        ${message.priority !== 'Normal' ? `• ${message.priority}` : ''}
                        ${message.isEmergency ? ' • EMERGENCY' : ''}
                    </div>
                </div>
                ${isSent ? `<img src="${currentUser.profilePhoto || '/images/default-avatar.png'}" 
                           alt="Avatar" class="rounded-circle ms-2" width="32" height="32">` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Send message in conversation
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !currentConversation) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipient: currentConversation,
                subject: 'Quick Reply',
                content: content,
                priority: 'Normal'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        
        // Clear input
        messageInput.value = '';
        
        // Reload conversation
        openConversation(null, currentConversation);
        
        // Reload message list
        loadMessages();
        
        showSuccess('Message sent successfully');
        
    } catch (error) {
        console.error('Failed to send message:', error);
        showError('Failed to send message');
    }
}

// Handle Enter key in message input
function handleMessageKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Load users for recipient selection
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/members', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        users = data.members.filter(user => user._id !== currentUser._id);
        
        // Populate recipient select
        const select = document.getElementById('recipientSelect');
        select.innerHTML = '<option value="">Select recipient...</option>' +
            users.map(user => `
                <option value="${user._id}">${user.name} (${user.role})</option>
            `).join('');
        
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

// Load groups
async function loadGroups() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/groups', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load groups');
        }
        
        const data = await response.json();
        groups = data.groups;
        
        // Populate group select
        const select = document.getElementById('groupSelect');
        select.innerHTML = '<option value="">Select group...</option>' +
            groups.map(group => `
                <option value="${group._id}">${group.name} (${group.members.length} members)</option>
            `).join('');
        
    } catch (error) {
        console.error('Failed to load groups:', error);
    }
}

// Send new message from compose modal
async function sendNewMessage() {
    const form = document.getElementById('composeForm');
    const formData = new FormData(form);
    
    const messageType = formData.get('messageType');
    const subject = document.getElementById('messageSubject').value.trim();
    const content = document.getElementById('messageContent').value.trim();
    const priority = document.getElementById('messagePriority').value;
    const isEmergency = document.getElementById('emergencyMessage').checked;
    
    if (!subject || !content) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        let endpoint, payload;
        
        if (messageType === 'direct') {
            const recipient = document.getElementById('recipientSelect').value;
            if (!recipient) {
                showError('Please select a recipient');
                return;
            }
            
            endpoint = '/api/messages/send';
            payload = {
                recipient,
                subject,
                content,
                priority,
                isEmergency
            };
        } else {
            const groupId = document.getElementById('groupSelect').value;
            if (!groupId) {
                showError('Please select a group');
                return;
            }
            
            endpoint = '/api/messages/send-group';
            payload = {
                groupId,
                subject,
                content,
                priority
            };
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('composeModal'));
        modal.hide();
        form.reset();
        document.getElementById('messageLength').textContent = '0';
        
        // Reload messages
        loadMessages();
        
        showSuccess('Message sent successfully');
        
    } catch (error) {
        console.error('Failed to send message:', error);
        showError('Failed to send message');
    }
}

// Search messages
async function searchMessages() {
    const query = document.getElementById('messageSearch').value.trim();
    
    if (!query || query.length < 2) {
        loadMessages();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const data = await response.json();
        displayMessages(data.messages);
        
    } catch (error) {
        console.error('Search failed:', error);
        showError('Search failed');
    }
}

// Update unread count
function updateUnreadCount(count) {
    document.getElementById('unreadCount').textContent = count;
    document.getElementById('unreadCount').style.display = count > 0 ? 'inline' : 'none';
}

// Utility functions
function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'High': return 'warning';
        case 'Urgent': return 'danger';
        default: return 'secondary';
    }
}

function showSuccess(message) {
    // Simple alert for now - in production, use toast notifications
    alert(message);
}

function showError(message) {
    alert('Error: ' + message);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Placeholder functions for future features
function toggleEmojiPicker() {
    alert('Emoji picker coming soon!');
}

function attachFile() {
    alert('File attachment coming soon!');
}

function createGroup() {
    alert('Group creation coming soon!');
}