/**
 * Modern Support Page - Chat Widget
 */

class SupportChat {
    constructor() {
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatSendBtn = document.getElementById('chatSendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');

        this.init();
    }

    async init() {
        // Chat input
        this.chatSendBtn?.addEventListener('click', () => this.sendMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Wait for auth to be ready (with timeout)
        await this.waitForAuth();

        // Load previous messages
        await this.loadPreviousMessages();

        // Auto-refresh every 10 seconds to check for new replies
        setInterval(() => this.loadPreviousMessages(true), 10000);
    }

    async waitForAuth(maxWait = 5000) {
        const startTime = Date.now();
        
        while (!window.authManager && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!window.authManager) {
            console.warn('⚠️ Auth manager not available after timeout');
            return false;
        }

        // Wait a bit more for auth to initialize
        await new Promise(resolve => setTimeout(resolve, 200));
        return true;
    }

    async loadPreviousMessages(silent = false) {
        try {
            const user = window.authManager?.getUser();
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            // Only load if user is logged in
            if (!user || !user.id || !token) {
                if (!silent) {
                    console.log('ℹ️ User not logged in, skipping message load');
                }
                return;
            }

            if (!silent) {
                console.log('📥 Loading previous messages for user:', user.id);
            }

            const startTime = Date.now();

            // Fetch user's tickets with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(`/api/v1/support?userId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                signal: controller.signal
            }).catch(err => {
                if (err.name === 'AbortError') {
                    console.error('❌ Request timed out after 10 seconds');
                }
                throw err;
            }).finally(() => {
                clearTimeout(timeoutId);
            });

            if (!silent) {
                console.log(`⏱️ Fetch tickets took: ${Date.now() - startTime}ms`);
            }

            if (!response.ok) {
                console.error('❌ Failed to load messages:', response.status, response.statusText);
                return;
            }

            const data = await response.json();
            const tickets = data.tickets || [];

            if (!silent) {
                console.log(`📨 Found ${tickets.length} tickets`);
            }

            // If no tickets, just return
            if (tickets.length === 0) {
                if (!silent) {
                    console.log('ℹ️ No tickets found');
                }
                return;
            }

            const fetchStart = Date.now();

            // Fetch full details for each ticket (including replies) with timeout
            const fullTickets = await Promise.all(
                tickets.map(ticket => 
                    fetch(`/api/v1/support/${ticket.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    .then(r => {
                        if (!r.ok) throw new Error(`Failed to fetch ticket ${ticket.id}`);
                        return r.json();
                    })
                    .catch(err => {
                        console.error(`Error fetching ticket ${ticket.id}:`, err);
                        return null;
                    })
                )
            );

            if (!silent) {
                console.log(`⏱️ Fetch ticket details took: ${Date.now() - fetchStart}ms`);
            }

            // Filter out failed requests
            const validTickets = fullTickets.filter(t => t !== null);

            // Build timeline of all messages
            const timeline = [];
            validTickets.forEach(ticket => {
                // Add original ticket message
                timeline.push({
                    id: ticket.id,
                    content: ticket.description,
                    created_at: ticket.created_at,
                    isAdmin: false,
                    type: 'ticket'
                });

                // Add all replies
                (ticket.replies || []).forEach(reply => {
                    timeline.push({
                        id: reply.id,
                        content: reply.content,
                        created_at: reply.created_at,
                        isAdmin: reply.is_admin,
                        type: 'reply'
                    });
                });
            });

            // Sort by time
            timeline.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            if (!silent) {
                console.log(`💬 Total messages in timeline: ${timeline.length}`);
            }

            // Clear existing messages (except welcome message)
            this.clearMessages();

            const renderStart = Date.now();

            // Render all messages at once (faster than one-by-one)
            const fragment = document.createDocumentFragment();
            timeline.forEach(msg => {
                const messageElement = this.createMessageElement(msg.content, msg.isAdmin ? 'bot' : 'user', msg.created_at);
                fragment.appendChild(messageElement);
            });

            // Insert all messages at once before typing indicator
            this.chatMessages?.insertBefore(fragment, this.typingIndicator);

            if (!silent) {
                console.log(`⏱️ Render took: ${Date.now() - renderStart}ms`);
                console.log(`✅ Total load time: ${Date.now() - startTime}ms`);
            }

            // Scroll to bottom
            requestAnimationFrame(() => this.scrollToBottom());

        } catch (error) {
            console.error('❌ Error loading previous messages:', error);
            if (error.name === 'AbortError') {
                console.error('Request was aborted due to timeout');
            }
        }
    }

    createMessageElement(text, type = 'bot', timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'bot' 
            ? '<i class="fas fa-headset"></i>' 
            : '<i class="fas fa-user"></i>';

        const bubbleContainer = document.createElement('div');
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        bubbleContainer.appendChild(bubble);

        // Add timestamp if provided
        if (timestamp) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.style.fontSize = '0.7rem';
            timeDiv.style.color = 'rgba(255, 255, 255, 0.75)';
            timeDiv.style.marginTop = '0.25rem';
            timeDiv.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
            
            const date = new Date(timestamp);
            const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const dateStr = date.toLocaleDateString();
            
            timeDiv.textContent = `${dateStr} ${timeStr}`;
            bubbleContainer.appendChild(timeDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubbleContainer);

        return messageDiv;
    }

    clearMessages() {
        // Remove all messages except the welcome message and typing indicator
        const messages = this.chatMessages?.querySelectorAll('.chat-message');
        messages?.forEach((msg, index) => {
            // Keep the first message (welcome) and remove the rest
            if (index > 0) {
                msg.remove();
            }
        });
    }

    sendMessage() {
        const message = this.chatInput?.value.trim();
        if (!message) return;

        this.sendUserMessage(message);
        this.chatInput.value = '';
    }

    async sendUserMessage(message) {
        // Show typing indicator immediately
        this.showTyping();

        try {
            // Get user info
            const user = window.authManager?.getUser();
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            console.log('📤 Sending message to backend...');

            // Check if user is logged in
            if (!user || !user.id) {
                this.hideTyping();
                this.addMessage("Please log in to send a support message. You can sign in from the navigation menu.", 'bot');
                return;
            }

            // Prepare data
            const data = {
                userId: user.id,
                subject: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                description: message,
                category: 'GENERAL',
                priority: 'MEDIUM'
            };

            // Send to backend
            const response = await fetch('/api/v1/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            this.hideTyping();

            if (!response.ok) {
                console.error('❌ API Error:', responseData);
                
                // Show specific error message
                let errorMsg = 'Sorry, there was an error sending your message.';
                if (responseData.errors && responseData.errors.length > 0) {
                    errorMsg = responseData.errors.map(e => e.msg).join(', ');
                } else if (responseData.message) {
                    errorMsg = responseData.message;
                }
                
                this.addMessage(errorMsg + ' Please try again or contact us at info@jkuatinnovation.club', 'bot');
                return;
            }

            console.log('✅ Message sent successfully! Ticket ID:', responseData.ticket?.id);

            // Immediately reload messages to show the new message with timestamp
            await this.loadPreviousMessages(true);

        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.hideTyping();
            this.addMessage("Sorry, there was an error sending your message. Please try again or contact us at info@jkuatinnovation.club", 'bot');
        }
    }

    addMessage(text, type = 'bot', timestamp = null) {
        const messageElement = this.createMessageElement(text, type, timestamp);
        
        // Insert before typing indicator
        this.chatMessages?.insertBefore(messageElement, this.typingIndicator);

        // Scroll to bottom
        requestAnimationFrame(() => this.scrollToBottom());
    }

    showTyping() {
        this.typingIndicator?.classList.add('active');
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator?.classList.remove('active');
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.supportChat = new SupportChat();
});
