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
            
            console.log('📊 Loading events from database...');
            await this.loadEvents();
            console.log('📊 Events loaded:', this.events.length);
            
            if (this.events.length > 0) {
                console.log('📊 Sample events:', this.events.map(e => e.title));
                console.log('🎨 Rendering events...');
                this.renderEvents();
                console.log('📈 Updating stats...');
                this.updateStats();
            } else {
                console.log('📭 No events found in database');
                this.showEmptyState();
            }
            
            console.log('✅ Events Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error in init():', error);
            this.showErrorState(error);
        }
    }
    
    showEmptyState() {
        const container = this.querySelector('#eventsGrid');
        const loading = this.querySelector('#eventsLoading');
        
        if (loading) loading.style.display = 'none';
        
        if (container) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 3rem; color: white; grid-column: 1 / -1;">
                    <i class="fas fa-calendar" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No Events Yet</h3>
                    <p style="opacity: 0.7; margin-bottom: 1.5rem;">Check back soon for upcoming events!</p>
                    <a href="/" class="btn" style="display: inline-block; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; border-radius: 25px; font-weight: 600;">
                        Back to Home
                    </a>
                </div>
            `;
        }
    }
    
    showErrorState(error) {
        const container = this.querySelector('#eventsGrid');
        const loading = this.querySelector('#eventsLoading');
        
        if (loading) loading.style.display = 'none';
        
        if (container) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 3rem; color: white; grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 1rem; color: #ef4444;"></i>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Failed to Load Events</h3>
                    <p style="opacity: 0.7; margin-bottom: 0.5rem;">Unable to connect to the server.</p>
                    <p style="font-size: 0.875rem; opacity: 0.5; margin-bottom: 1.5rem;">${error.message}</p>
                    <button onclick="window.location.reload()" class="btn" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
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
            case 'view-event-details':
                this.viewEventDetails(eventId);
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
            console.log('🌐 Fetching events from API...');
            const response = await fetch('/api/v1/events');
            console.log('🌐 API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }
            
            const data = await response.json();
            console.log('🌐 API data received:', data);
            
            // Map database events to UI format
            const rawEvents = data.events || data || [];
            this.events = rawEvents.map(event => ({
                ...event,
                // Map banner_image to media format
                media: event.banner_image ? {
                    type: 'image',
                    primary: event.banner_image
                } : null,
                // Map tags to hashtags
                hashtags: event.tags ? event.tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`) : [],
                // Ensure numeric fields
                likes: event.likes || 0,
                shares: event.shares || 0,
                comments: event.comments || [],
                // Map description_html to description if needed
                description: event.description || this.stripHtml(event.description_html || ''),
                // Ensure current_attendees exists
                current_attendees: event.current_attendees || event.stats?.totalAttendees || 0
            }));
            
            console.log('✅ Events loaded from API:', this.events.length);
            if (this.events.length > 0) {
                console.log('📝 Sample mapped event:', this.events[0]);
            }
        } catch (error) {
            console.error('❌ Failed to load events from API:', error);
            this.events = [];
            throw error; // Re-throw to show error in UI
        }
        
        console.log('📊 Final events array:', this.events);
    }
    
    // Helper to strip HTML tags from description
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
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

    viewEventDetails(eventId) {
        const event = this.events.find(e => this.normalizeId(e.id) === eventId);
        if (!event) {
            console.error('Event not found:', eventId);
            return;
        }

        // Create beautiful event details modal
        const modal = document.createElement('div');
        modal.id = 'eventDetailsModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            overflow-y: auto;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.95));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            position: relative;
        `;

        const startDate = new Date(event.start_date || event.event_date);
        const bannerImage = event.banner_image || (event.media && event.media.primary);
        
        modalContent.innerHTML = `
            <button id="closeModalBtn" style="position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(0, 0, 0, 0.7); border: none; border-radius: 50%; width: 40px; height: 40px; color: white; font-size: 1.5rem; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                ×
            </button>

            <div style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 60px; height: 60px; background: rgba(59, 130, 246, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-calendar-alt" style="font-size: 1.5rem; color: #3b82f6;"></i>
                    </div>
                    <h2 style="font-size: 2rem; font-weight: 700; color: white; margin: 0 0 0.5rem 0;">${this.escapeHTML(event.title)}</h2>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem;">JKUAT Innovation Club</p>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 16px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-calendar" style="color: #3b82f6;"></i>
                        <span>${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-clock" style="color: #3b82f6;"></i>
                        <span>${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-map-marker-alt" style="color: #3b82f6;"></i>
                        <span>${this.escapeHTML(event.location)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-tag" style="color: #3b82f6;"></i>
                        <span>${event.fee || event.registration_fee ? `KSh ${event.fee || event.registration_fee}` : 'Free'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                        <i class="fas fa-users" style="color: #3b82f6;"></i>
                        <span>${event.current_attendees || 0}/${event.max_attendees || 'Unlimited'} registered</span>
                    </div>
                </div>

                ${bannerImage ? `
                    <div style="margin-bottom: 2rem;">
                        <img src="${this.escapeHTML(bannerImage)}" alt="${this.escapeHTML(event.title)}" 
                             style="width: 100%; height: 300px; object-fit: cover; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
                    </div>
                ` : ''}

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                        Description
                    </h3>
                    <div style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                        ${event.description || event.description_html || 'No description available.'}
                    </div>
                </div>

                ${event.requirements && Array.isArray(event.requirements) && event.requirements.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-clipboard-list" style="color: #3b82f6;"></i>
                            Requirements
                        </h3>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                            ${event.requirements.map(req => `
                                <li style="display: flex; align-items: start; gap: 0.75rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                                    <i class="fas fa-check-circle" style="color: #10b981; margin-top: 0.25rem; flex-shrink: 0;"></i>
                                    <span>${this.escapeHTML(req)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${event.agenda && Array.isArray(event.agenda) && event.agenda.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-list-ul" style="color: #3b82f6;"></i>
                            Event Agenda
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            ${event.agenda.map(item => `
                                <div style="display: flex; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 3px solid #3b82f6;">
                                    <div style="flex-shrink: 0; width: 80px; color: #3b82f6; font-weight: 600; font-size: 0.875rem;">
                                        ${this.escapeHTML(item.time)}
                                    </div>
                                    <div style="flex: 1;">
                                        ${item.day ? `<div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">${this.escapeHTML(item.day)}</div>` : ''}
                                        <div style="color: white; font-weight: 600;">${this.escapeHTML(item.title)}</div>
                                        ${item.description ? `<div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-top: 0.25rem;">${this.escapeHTML(item.description)}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${event.tags && event.tags.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                            ${event.tags.map(tag => `
                                <span style="padding: 0.5rem 1rem; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; color: #3b82f6; font-size: 0.875rem; font-weight: 500;">
                                    ${tag.startsWith('#') ? this.escapeHTML(tag) : '#' + this.escapeHTML(tag)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-size: 1.25rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-images" style="color: #3b82f6;"></i>
                        Event Gallery
                    </h3>
                    <div id="eventGallery" style="min-height: 200px;">
                        ${event.gallery && Array.isArray(event.gallery) && event.gallery.length > 0 ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                                ${event.gallery.map(media => `
                                    <div style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                        ${media.type === 'video' ? `
                                            <video src="${this.escapeHTML(media.url)}" style="width: 100%; height: 100%; object-fit: cover;" controls></video>
                                        ` : `
                                            <img src="${this.escapeHTML(media.url)}" alt="Event photo" style="width: 100%; height: 100%; object-fit: cover;">
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 3rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 2px dashed rgba(255, 255, 255, 0.2);">
                                <i class="fas fa-camera" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem; display: block;"></i>
                                <p style="color: rgba(255, 255, 255, 0.6); margin: 0;">No photos or videos yet</p>
                                <p style="color: rgba(255, 255, 255, 0.4); font-size: 0.875rem; margin: 0.5rem 0 0 0;">Event photos will appear here after the event</p>
                            </div>
                        `}
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button id="modalCloseBtn" style="padding: 0.75rem 2rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        Close
                    </button>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close handlers
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        };

        modal.querySelector('#closeModalBtn').onclick = closeModal;
        modal.querySelector('#modalCloseBtn').onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.style.overflow = 'hidden';
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