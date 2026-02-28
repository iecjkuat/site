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

    init() {
        // Chat input
        this.chatSendBtn?.addEventListener('click', () => this.sendMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick replies - removed, no AI responses
    }

    sendMessage() {
        const message = this.chatInput?.value.trim();
        if (!message) return;

        this.sendUserMessage(message);
        this.chatInput.value = '';
    }

    async sendUserMessage(message) {
        // Add user message to UI
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        try {
            // Get user info
            const user = window.authManager?.getUser();
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            console.log('📤 Sending message to backend...');
            console.log('👤 User:', user);
            console.log('🔑 Token exists:', !!token);

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

            console.log('📦 Data to send:', data);

            // Send to backend
            const response = await fetch('/api/v1/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });

            console.log('📡 Response status:', response.status);

            const responseData = await response.json();
            console.log('📦 Response data:', responseData);

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

            // Show confirmation
            this.addMessage("Thank you! Your message has been sent to our support team. We'll get back to you shortly. 📧", 'bot');

        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.hideTyping();
            this.addMessage("Sorry, there was an error sending your message. Please try again or contact us at info@jkuatinnovation.club", 'bot');
        }
    }

    addMessage(text, type = 'bot') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'bot' 
            ? '<i class="fas fa-robot"></i>' 
            : '<i class="fas fa-user"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);

        // Insert before typing indicator
        this.chatMessages?.insertBefore(messageDiv, this.typingIndicator);

        // Scroll to bottom
        this.scrollToBottom();
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
