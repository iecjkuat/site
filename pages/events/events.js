/**
 * Events Page Manager - Dark Theme with Glass Morphism
 * Matching Ideas Page Design System
 */

console.log('🎪 Events Manager script loaded');

class EventsManager {
    constructor() {
        console.log('🔧 EventsManager constructor called');
        
        this.events = [];
        this.expandedComments = new Set();
        this.userLikes = new Set();
        this.userSaves = new Set();
        
        // Scoped root element to prevent ID conflicts
        this.root = document.getElementById('eventsPage');
        console.log('📍 Root element:', this.root ? 'FOUND' : 'NOT FOUND');
        
        if (!this.root) {
            console.error('❌ Events page root element not found');
            throw new Error('Events page root element not found');
        }
        
        // Bind methods once for better performance and cleanup
        this.handleClick = this.handleClick.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        
        console.log('🔧 EventsManager constructor completed, calling init...');
        this.init();
    }

    // Scoped element queries to prevent ID conflicts
    querySelector(selector) {
        return this.root?.querySelector(selector);
    }

    querySelectorAll(selector) {
        return this.root?.querySelectorAll(selector) || [];
    }

    async init() {
        console.log('🎪 Events Manager: Initializing...');
        console.log('📍 Root element found:', this.root ? 'YES' : 'NO');
        
        try {
            console.log('🔧 Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('📊 Loading events...');
            await this.loadEvents();
            console.log('📊 Events loaded:', this.events.length);
            console.log('📊 Sample events:', this.events.map(e => e.title));
            
            console.log('🎨 Rendering events...');
            this.renderEvents();
            
            console.log('📈 Updating stats...');
            this.updateStats();
            
            console.log('✅ Events Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error in init():', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Single event delegation for all interactions
        document.addEventListener('click', this.handleClick);
        document.addEventListener('input', this.handleInput);
        document.addEventListener('keydown', this.handleKeydown);

        // Initialize filter tabs immediately (not in DOMContentLoaded)
        this.initFilterTabs();
        
        // Double-tap to like (mobile)
        this.setupDoubleTapLike();
    }

    handleClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const eventId = this.normalizeId(target.dataset.eventId);
        const commentId = this.normalizeId(target.dataset.commentId);

        switch (action) {
            case 'like':
                this.toggleLike(eventId, target);
                break;
            case 'comment':
                this.toggleComments(eventId);
                break;
            case 'share':
                this.shareEvent(eventId);
                break;
            case 'save':
                this.toggleSave(eventId, target);
                break;
            case 'register':
                this.handleRegistration(eventId, target);
                break;
            case 'post-comment':
                this.postComment(eventId);
                break;
            case 'like-comment':
                this.toggleCommentLike(commentId, target);
                break;
            case 'reply-comment':
                this.replyToComment(commentId);
                break;
            case 'show-more-comments':
                this.showMoreComments(eventId);
                break;
        }
    }

    handleInput(e) {
        if (e.target.classList.contains('comment-input')) {
            this.handleCommentInput(e.target);
        }
    }

    handleKeydown(e) {
        if (e.target.classList.contains('comment-input') && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const eventCard = e.target.closest('.event-card');
            if (eventCard) {
                const eventId = this.normalizeId(eventCard.dataset.eventId);
                this.postComment(eventId);
            }
        }
    }

    initFilterTabs() {
        const filterTabs = this.querySelectorAll('.filter-tab');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Apply filter
                const filter = tab.dataset.filter;
                this.applyFilter(filter);
            });
        });
    }

    // Normalize IDs to prevent type mismatch bugs
    normalizeId(id) {
        return String(id || '');
    }

    // Security: Escape HTML to prevent XSS
    escapeHTML(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    // Security: Whitelist event status
    safeStatus(status) {
        return ['upcoming', 'live', 'completed', 'active'].includes(status) ? status : 'upcoming';
    }

    // Security: Validate URLs
    safeUrl(url) {
        if (!url) return '#';
        try {
            const parsed = new URL(url, window.location.origin);
            return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '#';
        } catch {
            return '#';
        }
    }

    setupDoubleTapLike() {
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                const mediaContainer = e.target.closest('.event-media');
                if (mediaContainer) {
                    const card = mediaContainer.closest('.event-card');
                    const eventId = this.normalizeId(card?.dataset.eventId);
                    const likeBtn = card?.querySelector('[data-action="like"]');
                    
                    if (likeBtn && eventId) {
                        this.toggleLike(eventId, likeBtn);
                        this.showHeartAnimation(mediaContainer); // Fixed: pass media container directly
                        e.preventDefault();
                    }
                }
            }
            lastTap = currentTime;
        });
    }

    async loadEvents() {
        console.log('📊 loadEvents() called');
        try {
            console.log('🌐 Attempting to fetch from API...');
            const response = await fetch('/api/v1/events');
            console.log('🌐 API response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('🌐 API data received:', data);
                this.events = data.events || data || [];
                console.log('✅ Events loaded from API:', this.events.length);
            } else {
                throw new Error(`API responded with status ${response.status}`);
            }
        } catch (error) {
            console.log('⚠️ API not available, using sample data. Error:', error.message);
            console.log('🎭 Calling getSampleEvents()...');
            this.events = this.getSampleEvents();
            console.log('✅ Sample events loaded:', this.events.length);
            console.log('📋 Sample events titles:', this.events.map(e => e.title));
        }
        
        console.log('📊 Final events array:', this.events);
    }

    renderEvents() {
        console.log('🎨 renderEvents() called');
        const container = this.querySelector('#eventsGrid');
        console.log('📦 Events container found:', container ? 'YES' : 'NO');
        console.log('📦 Container element:', container);
        
        if (!container) {
            console.error('❌ Events grid container not found!');
            return;
        }

        // Hide loading with scoped query
        const loading = this.querySelector('#eventsLoading');
        if (loading) {
            loading.style.display = 'none';
            console.log('🔄 Loading hidden');
        } else {
            console.log('⚠️ Loading element not found');
        }

        console.log('🎨 Creating event cards for', this.events.length, 'events');
        const eventsHTML = this.events.map((event, index) => {
            console.log(`🎨 Creating card ${index + 1}:`, event.title);
            return this.createEventCard(event);
        }).join('');
        
        console.log('🎨 Generated HTML length:', eventsHTML.length);
        console.log('🎨 First 200 chars of HTML:', eventsHTML.substring(0, 200));
        
        container.innerHTML = eventsHTML;
        console.log('✅ Events rendered to container');
        console.log('📦 Container innerHTML length after render:', container.innerHTML.length);
    }

    createEventCard(event) {
        const eventId = this.normalizeId(event.id);
        const isLiked = this.userLikes.has(eventId);
        const isSaved = this.userSaves.has(eventId);
        const commentsExpanded = this.expandedComments.has(eventId);
        
        const startDate = new Date(event.start_date);
        const now = new Date();
        const isCompleted = event.status === 'completed' || startDate < now;
        const safeStatus = this.safeStatus(event.status);

        return `
            <article class="event-card instagram-style" data-event-id="${eventId}">
                <!-- Event Header -->
                <header class="event-header">
                    <div class="event-profile">
                        <div class="profile-avatar">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="profile-info">
                            <h3 class="profile-name">JKUAT Innovation Club</h3>
                            <p class="profile-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${this.escapeHTML(event.location)}
                            </p>
                        </div>
                    </div>
                    <div class="event-date-badge">
                        ${this.formatDate(event.start_date)}
                    </div>
                </header>

                <!-- Event Media -->
                <div class="event-media">
                    ${event.media ? this.renderMedia(event.media) : this.renderPlaceholder(event)}
                    <div class="event-status-badge ${safeStatus}">
                        ${this.getStatusText(safeStatus)}
                    </div>
                </div>

                <!-- Instagram-Style Interaction Bar -->
                <div class="event-interactions">
                    <div class="interaction-stats">
                        <button class="interaction-stat ${isLiked ? 'liked' : ''}" 
                                data-action="like" data-event-id="${eventId}">
                            <span class="icon">${isLiked ? '❤️' : '🤍'}</span>
                            <span class="count">${event.likes || 0}</span>
                        </button>
                        
                        <button class="interaction-stat" 
                                data-action="comment" data-event-id="${eventId}">
                            <span class="icon">💬</span>
                            <span class="count">${(event.comments || []).length}</span>
                        </button>
                        
                        <button class="interaction-stat" 
                                data-action="share" data-event-id="${eventId}">
                            <span class="icon">📤</span>
                            <span class="count">${event.shares || 0}</span>
                        </button>
                    </div>
                    
                    <div class="interaction-actions">
                        <button class="save-btn ${isSaved ? 'saved' : ''}" 
                                data-action="save" data-event-id="${eventId}">
                            ${isSaved ? '🔖' : '📌'}
                        </button>
                    </div>
                </div>

                <!-- Event Content -->
                <div class="event-content">
                    <h4 class="event-title">
                        <strong>jkuat_innovation</strong> ${this.escapeHTML(event.title)}
                    </h4>
                    <p class="event-description">${this.escapeHTML(event.description)}</p>
                    
                    <div class="event-details">
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatTime(event.start_date)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-tag"></i>
                            <span>${event.fee ? `KSh ${event.fee}` : 'Free'}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>${event.current_attendees || 0}/${event.max_attendees} registered</span>
                        </div>
                    </div>

                    ${event.hashtags ? `
                        <div class="event-hashtags">
                            ${event.hashtags.map(tag => `<span class="hashtag">${this.escapeHTML(tag)}</span>`).join(' ')}
                        </div>
                    ` : ''}
                </div>

                <!-- Event Recap (for completed events) -->
                ${isCompleted && event.recap ? this.renderEventRecap(event.recap) : ''}

                <!-- Registration Button -->
                <div class="event-registration">
                    <button class="register-btn ${this.getRegistrationStatus(event)}" 
                            data-action="register" data-event-id="${eventId}"
                            ${!this.canRegister(event) ? 'disabled' : ''}>
                        <i class="fas fa-${this.getRegistrationIcon(event)}"></i>
                        ${this.getRegistrationText(event)}
                    </button>
                </div>

                <!-- Instagram-Style Comments Section -->
                <div class="comments-section ${commentsExpanded ? 'expanded' : ''}" 
                     id="comments-${eventId}">
                    ${this.renderComments(event)}
                </div>

                <!-- Timestamp -->
                <div class="event-timestamp">
                    ${this.getTimeAgo(event.created_at || event.start_date)}
                </div>
            </article>
        `;
    }

    renderEventRecap(recap) {
        return `
            <div class="event-recap">
                <div class="recap-header">
                    <h4><span class="recap-icon">📸</span> Event Recap</h4>
                </div>
                
                <div class="recap-summary">
                    <p>${this.escapeHTML(recap.summary)}</p>
                </div>

                ${recap.highlights ? `
                    <div class="recap-section">
                        <h5><span>✨</span> Highlights</h5>
                        <ul class="recap-highlights">
                            ${recap.highlights.map(highlight => `<li>${this.escapeHTML(highlight)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${recap.stats ? `
                    <div class="recap-section">
                        <h5><span>📊</span> Event Stats</h5>
                        <div class="recap-stats">
                            <div class="stat-item">
                                <span class="stat-value">${this.escapeHTML(recap.stats.attendees)}</span>
                                <span class="stat-label">Attendees</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${this.escapeHTML(recap.stats.satisfaction)}</span>
                                <span class="stat-label">Satisfaction</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${recap.stats.projects || 0}</span>
                                <span class="stat-label">Projects</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${recap.photos && recap.photos.length > 0 ? `
                    <div class="recap-section">
                        <h5><span>📷</span> Event Photos</h5>
                        <div class="recap-photos">
                            ${recap.photos.slice(0, 6).map(photo => `
                                <div class="recap-photo">
                                    <img src="${this.escapeHTML(this.safeUrl(photo.url))}" alt="${this.escapeHTML(photo.caption)}" loading="lazy">
                                </div>
                            `).join('')}
                            ${recap.photos.length > 6 ? `
                                <div class="recap-photo more-photos">
                                    <span>+${recap.photos.length - 6} more</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${recap.resources && recap.resources.length > 0 ? `
                    <div class="recap-section">
                        <h5><span>📚</span> Resources</h5>
                        <div class="recap-resources">
                            ${recap.resources.map(resource => `
                                <a href="${this.escapeHTML(this.safeUrl(resource.url))}" class="resource-item" target="_blank" rel="noopener noreferrer">
                                    <div class="resource-icon">${this.escapeHTML(resource.icon)}</div>
                                    <div class="resource-info">
                                        <p class="resource-title">${this.escapeHTML(resource.title)}</p>
                                        <p class="resource-description">${this.escapeHTML(resource.description)}</p>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderComments(event) {
        const comments = event.comments || [];
        const eventId = this.normalizeId(event.id);
        const commentsExpanded = this.expandedComments.has(eventId);
        
        if (!commentsExpanded) {
            // Show preview of first 2 comments
            const previewComments = comments.slice(0, 2);
            return `
                <div class="comments-preview">
                    ${previewComments.map(comment => this.renderComment(comment, true)).join('')}
                    ${comments.length > 2 ? `
                        <button class="view-all-comments" data-action="comment" data-event-id="${eventId}">
                            View all ${comments.length} comments
                        </button>
                    ` : ''}
                </div>
            `;
        }

        // Show full comments section
        return `
            <div class="comments-full">
                <div class="comments-list">
                    ${comments.map(comment => this.renderComment(comment, false)).join('')}
                </div>
                
                <!-- Comment Input -->
                <div class="comment-input-section">
                    <div class="comment-input-container">
                        <div class="comment-avatar">U</div>
                        <input type="text" 
                               class="comment-input" 
                               placeholder="Add a comment..." 
                               data-event-id="${eventId}">
                        <button class="post-comment-btn" 
                                data-action="post-comment" 
                                data-event-id="${eventId}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderComment(comment, isPreview = false) {
        const commentId = this.normalizeId(comment.id);
        const isLiked = comment.isLiked || false;
        
        return `
            <div class="comment-item ${isPreview ? 'preview' : ''}" data-comment-id="${commentId}">
                <div class="comment-avatar">${this.escapeHTML(comment.user.charAt(0).toUpperCase())}</div>
                <div class="comment-content">
                    <div class="comment-text">
                        <strong class="comment-user">${this.escapeHTML(comment.user)}</strong>
                        <span class="comment-message">${this.escapeHTML(comment.message)}</span>
                    </div>
                    
                    ${!isPreview ? `
                        <div class="comment-actions">
                            <span class="comment-time">${this.getTimeAgo(comment.timestamp)}</span>
                            <button class="comment-action ${isLiked ? 'liked' : ''}" 
                                    data-action="like-comment" 
                                    data-comment-id="${commentId}">
                                ${comment.likes > 0 ? `${comment.likes} likes` : 'Like'}
                            </button>
                            <button class="comment-action" 
                                    data-action="reply-comment" 
                                    data-comment-id="${commentId}">
                                Reply
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Event Interaction Methods
    toggleLike(eventId, button) {
        const event = this.events.find(e => this.normalizeId(e.id) === eventId);
        if (!event) return;

        const isLiked = this.userLikes.has(eventId);
        
        if (isLiked) {
            this.userLikes.delete(eventId);
            event.likes = Math.max(0, (event.likes || 0) - 1);
        } else {
            this.userLikes.add(eventId);
            event.likes = (event.likes || 0) + 1;
            this.showHeartAnimation(button.closest('.event-card'));
        }

        // Update UI
        button.classList.toggle('liked');
        const iconEl = button.querySelector('.icon');
        const countEl = button.querySelector('.count');
        if (iconEl) iconEl.textContent = isLiked ? '🤍' : '❤️';
        if (countEl) countEl.textContent = event.likes;

        this.showToast(isLiked ? 'Removed from interested' : 'Added to interested!', 
                      isLiked ? 'info' : 'success');
    }

    applyFilter(filter) {
        const events = this.events;
        const now = new Date();
        
        let filteredEvents = events;
        
        switch (filter) {
            case 'upcoming':
                filteredEvents = events.filter(event => {
                    const startDate = new Date(event.start_date);
                    return startDate > now && event.status !== 'completed';
                });
                break;
            case 'live':
                filteredEvents = events.filter(event => {
                    const startDate = new Date(event.start_date);
                    const endDate = new Date(event.end_date);
                    return startDate <= now && endDate >= now;
                });
                break;
            case 'completed':
                filteredEvents = events.filter(event => {
                    return event.status === 'completed' || new Date(event.end_date) < now;
                });
                break;
            case 'workshop':
                filteredEvents = events.filter(event => 
                    event.event_type === 'workshop' || 
                    (event.hashtags && event.hashtags.some(tag => tag.toLowerCase().includes('workshop')))
                );
                break;
            case 'seminar':
                filteredEvents = events.filter(event => 
                    event.event_type === 'seminar' ||
                    (event.hashtags && event.hashtags.some(tag => tag.toLowerCase().includes('seminar')))
                );
                break;
            case 'competition':
                filteredEvents = events.filter(event => 
                    event.event_type === 'competition' ||
                    (event.hashtags && event.hashtags.some(tag => tag.toLowerCase().includes('competition')))
                );
                break;
            default:
                filteredEvents = events;
        }
        
        // Update the display with scoped queries
        const container = this.querySelector('#eventsGrid');
        const noEventsMsg = this.querySelector('#noEventsMessage');
        
        if (container) {
            if (filteredEvents.length === 0) {
                container.innerHTML = '';
                if (noEventsMsg) noEventsMsg.style.display = 'block';
            } else {
                if (noEventsMsg) noEventsMsg.style.display = 'none';
                container.innerHTML = filteredEvents.map(event => this.createEventCard(event)).join('');
            }
        }
    }

    toggleComments(eventId) {
        const isExpanded = this.expandedComments.has(eventId);
        
        if (isExpanded) {
            this.expandedComments.delete(eventId);
        } else {
            this.expandedComments.add(eventId);
        }

        // Re-render just the comments section
        const commentsSection = document.getElementById(`comments-${eventId}`);
        const event = this.events.find(e => this.normalizeId(e.id) === eventId);
        
        if (commentsSection && event) {
            commentsSection.outerHTML = `
                <div class="comments-section ${!isExpanded ? 'expanded' : ''}" 
                     id="comments-${eventId}">
                    ${this.renderComments(event)}
                </div>
            `;

            // Focus on comment input if expanding
            if (!isExpanded) {
                setTimeout(() => {
                    const input = document.querySelector(`#comments-${eventId} .comment-input`);
                    if (input) input.focus();
                }, 100);
            }
        }
    }

    postComment(eventId) {
        const input = document.querySelector(`#comments-${eventId} .comment-input`);
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        const event = this.events.find(e => this.normalizeId(e.id) === eventId);
        if (!event) return;

        // Create new comment
        const newComment = {
            id: `comment-${Date.now()}`,
            user: 'You',
            message: message,
            timestamp: new Date().toISOString(),
            likes: 0,
            isLiked: false
        };

        // Add to event
        if (!event.comments) event.comments = [];
        event.comments.unshift(newComment);

        // Clear input
        input.value = '';

        // Re-render comments
        const commentsSection = document.getElementById(`comments-${eventId}`);
        if (commentsSection) {
            commentsSection.outerHTML = `
                <div class="comments-section expanded" id="comments-${eventId}">
                    ${this.renderComments(event)}
                </div>
            `;
        }

        // Update comment count in interaction bar
        const commentBtn = document.querySelector(`[data-event-id="${eventId}"][data-action="comment"]`);
        if (commentBtn) {
            const countEl = commentBtn.querySelector('.count');
            if (countEl) countEl.textContent = event.comments.length;
        }

        this.showToast('Comment posted!', 'success');
    }

    toggleCommentLike(commentId, button) {
        // Find the comment across all events
        let comment = null;
        
        for (const e of this.events) {
            if (e.comments) {
                comment = e.comments.find(c => this.normalizeId(c.id) === commentId);
                if (comment) break;
            }
        }
        
        if (!comment) return;
        
        // Toggle like state
        comment.isLiked = !comment.isLiked;
        comment.likes = Math.max(0, (comment.likes || 0) + (comment.isLiked ? 1 : -1));
        
        // Update UI
        button.classList.toggle('liked');
        button.textContent = comment.likes > 0 ? `${comment.likes} likes` : 'Like';
        
        this.showToast(comment.isLiked ? 'Comment liked!' : 'Comment unliked', 'info');
    }

    replyToComment(commentId) {
        // Find the comment input for this event
        const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentItem) return;
        
        const eventCard = commentItem.closest('.event-card');
        const commentInput = eventCard?.querySelector('.comment-input');
        
        if (commentInput) {
            // Find the comment user
            const commentUserEl = commentItem.querySelector('.comment-user');
            if (commentUserEl) {
                const commentUser = commentUserEl.textContent;
                commentInput.value = `@${commentUser} `;
                commentInput.focus();
                
                // Move cursor to end
                setTimeout(() => {
                    commentInput.setSelectionRange(commentInput.value.length, commentInput.value.length);
                }, 10);
            }
        }
    }

    showMoreComments(eventId) {
        // This would typically load more comments from the server
        this.showToast('Loading more comments...', 'info');
        
        // For demo, just expand the comments section
        this.toggleComments(eventId);
    }

    handleCommentInput(input) {
        const hasText = input.value.trim().length > 0;
        const postBtn = input.parentNode?.querySelector('.post-comment-btn');
        
        if (postBtn) {
            postBtn.classList.toggle('active', hasText);
        }
    }

    toggleSave(eventId, button) {
        const isSaved = this.userSaves.has(eventId);
        
        if (isSaved) {
            this.userSaves.delete(eventId);
            button.textContent = '📌';
            button.classList.remove('saved');
            this.showToast('Removed from saved events', 'info');
        } else {
            this.userSaves.add(eventId);
            button.textContent = '🔖';
            button.classList.add('saved');
            this.showToast('Event saved!', 'success');
        }
    }

    shareEvent(eventId) {
        const event = this.events.find(e => this.normalizeId(e.id) === eventId);
        if (!event) return;

        const shareData = {
            title: `${event.title} - JKUAT Innovation Club`,
            text: `Join us for ${event.title}! ${event.description.substring(0, 100)}...`,
            url: `${window.location.origin}/events#${eventId}`
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => {
                    this.showToast('Event shared!', 'success');
                    // Update share count
                    event.shares = (event.shares || 0) + 1;
                    const shareBtn = document.querySelector(`[data-event-id="${eventId}"][data-action="share"]`);
                    if (shareBtn) {
                        const countEl = shareBtn.querySelector('.count');
                        if (countEl) countEl.textContent = event.shares;
                    }
                })
                .catch(() => {
                    this.showToast('Share cancelled', 'info');
                });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showToast('Link copied to clipboard!', 'success');
            }).catch(() => {
                this.showToast('Unable to copy link', 'error');
            });
        }
    }

    // Animation and UI helpers
    showHeartAnimation(targetEl) {
        // Fixed: accept either .event-card or .event-media
        const media = targetEl?.classList.contains('event-media')
            ? targetEl
            : targetEl?.querySelector('.event-media');
        
        if (!media) return;
        
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = '❤️';
        
        media.style.position = 'relative';
        media.appendChild(heart);
        
        setTimeout(() => heart.remove(), 1000);
    }

    showToast(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status'); // Accessibility
        toast.setAttribute('aria-live', 'polite'); // Accessibility
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getRegistrationText(event) {
        if (!this.canRegister(event)) return 'Registration Closed';
        const spotsLeft = Math.max(0, (event.max_attendees || 0) - (event.current_attendees || 0)); // Fixed: prevent negative
        if (spotsLeft <= 5 && spotsLeft > 0) return `Only ${spotsLeft} spots left!`;
        return 'Register Now';
    }

    renderPlaceholder(event) {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        const idStr = String(event.id ?? ''); // Fixed: handle number IDs
        const color = colors[idStr.charCodeAt(0) % colors.length];
        
        return `
            <div class="event-placeholder" style="background: linear-gradient(135deg, ${color}20, ${color}40);">
                <div class="placeholder-content">
                    <i class="fas fa-calendar" style="font-size: 3rem; color: ${color}; margin-bottom: 1rem;"></i>
                    <h3 style="color: white; font-size: 1.2rem; font-weight: 700; text-align: center; margin: 0;">
                        ${this.escapeHTML(event.title)}
                    </h3>
                </div>
            </div>
        `;
    }

    toggleSave(eventId, button) {
        const isSaved = this.userSaves.has(eventId);
        
        if (isSaved) {
            this.userSaves.delete(eventId);
            button.textContent = '📌';
            button.classList.remove('saved');
            this.showToast('Removed from saved events', 'info');
        } else {
            this.userSaves.add(eventId);
            button.textContent = '🔖';
            button.classList.add('saved');
            this.showToast('Event saved!', 'success');
        }
    }

    handleRegistration(eventId, button) {
        const event = this.events.find(e => this.normalizeId(e.id) === eventId);
        if (!event) return;

        if (!this.canRegister(event)) {
            this.showToast('Registration not available', 'error');
            return;
        }

        // Show loading state
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        button.disabled = true;

        // Simulate registration
        setTimeout(() => {
            event.current_attendees = (event.current_attendees || 0) + 1;
            
            // Update UI
            button.innerHTML = '<i class="fas fa-check"></i> Registered';
            button.classList.add('registered');
            
            // Update attendee count in card
            const attendeeSpan = button.closest('.event-card')?.querySelector('.detail-item:last-child span');
            if (attendeeSpan) {
                attendeeSpan.textContent = `${event.current_attendees}/${event.max_attendees} registered`;
            }

            this.showToast('Registration successful!', 'success');
        }, 1500);
    }

    updateStats() {
        const totalEvents = this.events.length;
        const upcomingEvents = this.events.filter(event => {
            const startDate = new Date(event.start_date);
            return startDate > new Date();
        }).length;
        const totalAttendees = this.events.reduce((sum, event) => {
            return sum + (event.current_attendees || 0);
        }, 0);

        // Update stats in the UI with scoped queries
        const totalEl = this.querySelector('#totalEventsCount');
        const upcomingEl = this.querySelector('#upcomingEventsCount');
        const attendeesEl = this.querySelector('#totalAttendeesCount');

        if (totalEl) totalEl.textContent = totalEvents.toString();
        if (upcomingEl) upcomingEl.textContent = upcomingEvents.toString();
        if (attendeesEl) attendeesEl.textContent = totalAttendees + '+';
    }

    // Unified status and registration methods
    canRegister(event) {
        const now = new Date();
        const startDate = new Date(event.start_date);
        const registrationDeadline = new Date(event.registration_deadline || event.start_date);
        
        // Use computed status instead of conflicting status field
        const isActive = event.status === 'active' || (startDate > now && event.status !== 'completed');
        
        return isActive && 
               now < registrationDeadline && 
               (event.current_attendees || 0) < (event.max_attendees || Infinity);
    }

    getRegistrationStatus(event) {
        if (!this.canRegister(event)) return 'closed';
        const spotsLeft = Math.max(0, (event.max_attendees || 0) - (event.current_attendees || 0));
        return spotsLeft <= 5 ? 'few-spots' : 'available';
    }

    getRegistrationIcon(event) {
        if (!this.canRegister(event)) return 'calendar-times';
        return 'calendar-plus';
    }

    getRegistrationText(event) {
        if (!this.canRegister(event)) return 'Registration Closed';
        const spotsLeft = Math.max(0, (event.max_attendees || 0) - (event.current_attendees || 0));
        if (spotsLeft <= 5 && spotsLeft > 0) return `Only ${spotsLeft} spots left!`;
        return 'Register Now';
    }

    renderMedia(media) {
        if (media.type === 'carousel' && media.gallery) {
            return `
                <div class="media-carousel">
                    ${media.gallery.map((img, index) => `
                        <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                            <img src="${this.escapeHTML(this.safeUrl(img))}" alt="Event image ${index + 1}" loading="lazy">
                        </div>
                    `).join('')}
                    <div class="carousel-indicators">
                        ${media.gallery.map((_, index) => `
                            <span class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (media.primary) {
            return `<img src="${this.escapeHTML(this.safeUrl(media.primary))}" alt="Event image" loading="lazy">`;
        }
        return '';
    }

    renderPlaceholder(event) {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        const idStr = String(event.id ?? ''); // Fixed: handle number IDs
        const color = colors[idStr.charCodeAt(0) % colors.length];
        
        return `
            <div class="event-placeholder" style="background: linear-gradient(135deg, ${color}20, ${color}40);">
                <div class="placeholder-content">
                    <i class="fas fa-calendar" style="font-size: 3rem; color: ${color}; margin-bottom: 1rem;"></i>
                    <h3 style="color: white; font-size: 1.2rem; font-weight: 700; text-align: center; margin: 0;">
                        ${this.escapeHTML(event.title)}
                    </h3>
                </div>
            </div>
        `;
    }
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    getStatusText(status) {
        const statusMap = {
            'upcoming': '📅 Upcoming',
            'live': '🔴 Live Now',
            'completed': '✅ Completed'
        };
        return statusMap[status] || '📅 Event';
    }

    getSampleEvents() {
        console.log('🎭 getSampleEvents() called');
        const sampleEvents = [
            {
                id: '1',
                title: 'AI & Machine Learning Workshop',
                description: 'Join us for an intensive workshop on artificial intelligence and machine learning. Learn the fundamentals of AI, explore popular ML algorithms, and build your first neural network. Perfect for beginners and intermediate developers looking to dive into the world of AI.',
                event_type: 'workshop',
                start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
                location: 'JKUAT Innovation Lab',
                max_attendees: 50,
                current_attendees: 23,
                fee: 0,
                status: 'active',
                likes: 42,
                shares: 12,
                hashtags: ['#AI', '#MachineLearning', '#Workshop', '#JKUAT'],
                media: {
                    type: 'carousel',
                    primary: '/images/ai-workshop-1.jpg',
                    gallery: [
                        '/images/ai-workshop-1.jpg',
                        '/images/ai-workshop-2.jpg',
                        '/images/ai-workshop-3.jpg'
                    ]
                },
                comments: [
                    {
                        id: 'c1',
                        user: 'student_dev',
                        message: 'This looks amazing! Can\'t wait to attend 🚀',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        likes: 3,
                        isLiked: false
                    },
                    {
                        id: 'c2',
                        user: 'tech_enthusiast',
                        message: 'Will there be hands-on coding sessions?',
                        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        likes: 1,
                        isLiked: true
                    },
                    {
                        id: 'c3',
                        user: 'ai_researcher',
                        message: 'Great initiative! Looking forward to the neural network section.',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        likes: 5,
                        isLiked: false
                    }
                ],
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                title: 'Blockchain Workshop - Completed',
                description: 'An intensive workshop covering blockchain technology, cryptocurrency fundamentals, and smart contract development. Participants gained hands-on experience with Ethereum development.',
                event_type: 'workshop',
                start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
                location: 'JKUAT Blockchain Lab',
                max_attendees: 40,
                current_attendees: 38,
                fee: 800,
                status: 'completed',
                likes: 124,
                shares: 28,
                hashtags: ['#Blockchain', '#Cryptocurrency', '#SmartContracts', '#JKUAT'],
                media: {
                    type: 'image',
                    primary: '/images/blockchain-workshop.jpg'
                },
                comments: [
                    {
                        id: 'c4',
                        user: 'crypto_student',
                        message: 'Best workshop ever! Learned so much about DeFi 💎',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        likes: 8,
                        isLiked: false
                    },
                    {
                        id: 'c5',
                        user: 'blockchain_dev',
                        message: 'The smart contract deployment was mind-blowing! 🤯',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        likes: 12,
                        isLiked: true
                    }
                ],
                recap: {
                    summary: 'The Blockchain & Cryptocurrency Workshop was a huge success! Participants gained hands-on experience with blockchain development and learned about the future of decentralized finance.',
                    highlights: [
                        'Built and deployed smart contracts on Ethereum testnet',
                        'Created personal cryptocurrency wallets',
                        'Learned about DeFi protocols and yield farming',
                        'Networked with blockchain industry professionals',
                        'Received certificates of completion'
                    ],
                    stats: {
                        attendees: 38,
                        satisfaction: '4.8/5',
                        projects: 12
                    },
                    photos: [
                        { url: '/images/blockchain-recap-1.jpg', caption: 'Group photo with certificates' },
                        { url: '/images/blockchain-recap-2.jpg', caption: 'Smart contract deployment demo' },
                        { url: '/images/blockchain-recap-3.jpg', caption: 'Networking session' },
                        { url: '/images/blockchain-recap-4.jpg', caption: 'Hands-on coding' },
                        { url: '/images/blockchain-recap-5.jpg', caption: 'Final presentations' },
                        { url: '/images/blockchain-recap-6.jpg', caption: 'Team collaboration' }
                    ],
                    resources: [
                        {
                            title: 'Workshop Slides',
                            description: 'Complete presentation materials',
                            icon: '📊',
                            url: '/resources/blockchain-slides.pdf'
                        },
                        {
                            title: 'Code Repository',
                            description: 'All workshop code examples',
                            icon: '💻',
                            url: 'https://github.com/jkuat-innovation/blockchain-workshop'
                        },
                        {
                            title: 'Certificate Template',
                            description: 'Downloadable certificate',
                            icon: '🏆',
                            url: '/resources/blockchain-certificate.pdf'
                        }
                    ]
                },
                created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                title: 'Innovation Pitch Competition',
                description: 'Present your innovative ideas to a panel of industry experts and investors. Win cash prizes, mentorship opportunities, and potential funding for your startup. Open to all students with groundbreaking ideas.',
                event_type: 'competition',
                start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
                location: 'JKUAT Main Auditorium',
                max_attendees: 200,
                current_attendees: 87,
                fee: 0,
                status: 'active',
                likes: 156,
                shares: 45,
                hashtags: ['#Innovation', '#Pitch', '#Competition', '#Startup', '#JKUAT'],
                comments: [
                    {
                        id: 'c6',
                        user: 'entrepreneur_jane',
                        message: 'This is exactly what we need! Time to pitch my fintech idea 💡',
                        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                        likes: 7,
                        isLiked: false
                    },
                    {
                        id: 'c7',
                        user: 'startup_founder',
                        message: 'Who are the judges? Any VCs on the panel?',
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                        likes: 2,
                        isLiked: false
                    }
                ],
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        console.log('🎭 Sample events created:', sampleEvents.length);
        console.log('🎭 Sample event titles:', sampleEvents.map(e => e.title));
        return sampleEvents;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing Events Manager...');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Document body classes:', document.body.className);
    
    // Force apply events page classes
    document.body.classList.add('events-page', 'bg-pattern');
    console.log('✅ Events page classes applied:', document.body.className);
    
    // Check if elements exist
    const eventsPage = document.getElementById('eventsPage');
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsLoading = document.getElementById('eventsLoading');
    
    console.log('📍 Elements check:');
    console.log('  - eventsPage:', eventsPage ? 'EXISTS' : 'MISSING');
    console.log('  - eventsGrid:', eventsGrid ? 'EXISTS' : 'MISSING');
    console.log('  - eventsLoading:', eventsLoading ? 'EXISTS' : 'MISSING');
    
    // Check if global navbar loaded
    setTimeout(() => {
        const globalNavbar = document.getElementById('global-navbar');
        const globalNavbarMount = document.getElementById('global-navbar-mount');
        console.log('📍 Navbar check:');
        console.log('  - global-navbar:', globalNavbar ? 'EXISTS' : 'MISSING');
        console.log('  - global-navbar-mount:', globalNavbarMount ? 'EXISTS' : 'MISSING');
        
        if (globalNavbar) {
            document.body.classList.add('has-global-navbar');
            console.log('✅ Global navbar detected');
        } else {
            console.log('⚠️ Global navbar not found - using fallback spacing');
        }
    }, 100);
    
    if (!eventsPage) {
        console.error('❌ Events page element not found!');
        return;
    }
    
    // Initialize the manager
    try {
        console.log('🔧 Creating EventsManager instance...');
        window.eventsManager = new EventsManager();
        console.log('✅ Events Manager initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing Events Manager:', error);
        console.error('❌ Error stack:', error.stack);
        
        // Show error message to user
        const container = document.getElementById('eventsGrid');
        if (container) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 2rem; color: white;">
                    <h3>⚠️ Error Loading Events</h3>
                    <p>There was a problem initializing the events system.</p>
                    <p style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Error: ${error.message}</p>
                    <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 25px; cursor: pointer; margin-top: 1rem;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
});