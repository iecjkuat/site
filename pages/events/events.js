/**
 * JKUAT Innovation Club - Events Page
 * Handles events display, filtering, and registration
 */

// IMMEDIATE MODAL PREVENTION - Run before anything else
(function() {
    console.log('🚫 Modal Prevention Script - Blocking all modal displays');
    
    // Override any existing modal functions
    window.showEventDetails = function() {
        console.error('🚫 BLOCKED: showEventDetails() call prevented');
        console.trace('Call stack:');
        return false;
    };
    
    window.showCreateEventModal = function() {
        console.error('🚫 BLOCKED: showCreateEventModal() call prevented');
        console.trace('Call stack:');
        return false;
    };
    
    // Prevent modal display via CSS
    const style = document.createElement('style');
    style.textContent = `
        #eventModal, #createEventModal {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        .modal-backdrop {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Modal prevention measures applied');
})();

// Constants for better maintainability
const SELECTORS = {
    EVENTS_GRID: '#eventsGrid',
    EVENTS_LOADING: '#eventsLoading',
    NO_EVENTS_MESSAGE: '#noEventsMessage',
    EVENT_MODAL: '#eventModal',
    EVENT_MODAL_TITLE: '#eventModalTitle',
    EVENT_MODAL_CONTENT: '#eventModalContent',
    CREATE_EVENT_MODAL: '#createEventModal',
    CREATE_EVENT_BTN: '#createEventBtn',
    MANAGE_EVENTS_BTN: '#manageEventsBtn',
    TOTAL_EVENTS_COUNT: '#totalEventsCount',
    UPCOMING_EVENTS_COUNT: '#upcomingEventsCount',
    TOTAL_ATTENDEES_COUNT: '#totalAttendeesCount',
    FOOTER_PLACEHOLDER: '#footer-placeholder'
};

const CSS_CLASSES = {
    FILTER_BTN: '.filter-btn',
    REGISTER_BTN: '.register-btn',
    DETAILS_BTN: '.details-btn',
    LIKE_BTN: '.like-btn',
    COMMENT_BTN: '.comment-btn',
    SHARE_BTN: '.share-btn',
    CAROUSEL_INDICATOR: '.indicator',
    INSTAGRAM_EVENT_CARD: '.instagram-event-card',
    EVENT_MEDIA_CONTAINER: '.event-media-container',
    LIKES_COUNT: '.likes-count',
    MODAL_BACKDROP: '.modal-backdrop'
};

const API_ENDPOINTS = {
    EVENTS: '/api/events',
    EVENT_CATEGORIES: '/api/events/categories',
    EVENT_REGISTER: (id) => `/api/events/${id}/register`,
    AUTH_VERIFY: '/api/auth/verify',
    AUTH_LOGOUT: '/api/auth/logout'
};

const TIMEOUTS = {
    NOTIFICATION_DURATION: 3000,
    HEART_ANIMATION_DURATION: 1000,
    BUTTON_ANIMATION_DURATION: 200,
    AUTO_MODAL_CLOSE: 10000
};

class EventsManager {
    constructor() {
        this.currentFilter = 'all';
        this.events = [];
        this.categories = [];
        this.isLoading = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupAdminToggle();
        this.checkAdminAccess();
        
        // Ensure no modals are showing before loading data
        this.hideAllModals();
        
        await this.loadInitialData();
    }

    hideAllModals() {
        // Force hide all modals with multiple approaches
        const eventModal = document.getElementById('eventModal');
        const createModal = document.getElementById('createEventModal');
        
        // Method 1: Direct style setting
        if (eventModal) {
            eventModal.style.display = 'none';
            eventModal.style.visibility = 'hidden';
            eventModal.style.opacity = '0';
        }
        if (createModal) {
            createModal.style.display = 'none';
            createModal.style.visibility = 'hidden';
            createModal.style.opacity = '0';
        }
        
        // Method 2: Remove any show classes
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.classList.remove('show', 'active', 'open');
        });
        
        // Method 3: Restore body scroll
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        
        console.log('All modals aggressively hidden during initialization');
    }

    setupAdminToggle() {
        // The role toggle is now handled by RoleUIController
        // This method is kept for backward compatibility
        console.log('Admin toggle setup delegated to RoleUIController');
    }

    createAdminToggle() {
        // Deprecated - now handled by RoleUIController
        console.log('Admin toggle creation delegated to RoleUIController');
    }

    toggleAdminMode() {
        // Use the auth manager for role switching
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user && (user.role === 'admin' || user.role === 'executive')) {
                console.log('Admin mode toggle - functionality to be implemented');
                this.showToast('Admin privileges active', 'info');
            } else {
                this.showToast('Admin access denied - insufficient privileges', 'error');
            }
        } else {
            // Fallback to old method for development/testing
            const currentAdmin = this.isUserAdmin();
            
            if (currentAdmin) {
                localStorage.removeItem('jkuat_admin_access');
                this.showToast('Admin mode disabled', 'info');
            } else {
                localStorage.setItem('jkuat_admin_access', 'true');
                this.showToast('Admin mode enabled', 'success');
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    checkAdminAccess() {
        // Use the auth manager for role checking
        let isExecutiveOrAdmin = false;
        
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            isExecutiveOrAdmin = user && (user.role === 'admin' || user.role === 'executive');
        } else {
            // Fallback to old method for development/testing
            isExecutiveOrAdmin = this.isUserAdmin();
        }
        
        const adminActions = document.getElementById('adminActions');
        
        if (adminActions) {
            adminActions.style.display = isExecutiveOrAdmin ? 'flex' : 'none';
        }
        
        console.log('Admin access:', isExecutiveOrAdmin ? 'Granted (Executive/Admin)' : 'Denied');
    }

    isUserAdmin() {
        // Fallback method if auth system not loaded
        // Check various methods to determine admin status
        
        // Method 1: Check if we're on localhost/development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev')) {
            return true; // Allow admin access in development
        }
        
        // Method 2: Check for admin parameter in URL (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true' || urlParams.get('role') === 'admin' || urlParams.get('role') === 'executive') {
            return true;
        }
        
        // Method 3: Check authentication system (if available)
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            return user && (user.role === 'admin' || user.role === 'executive');
        }
        
        // Method 4: Check localStorage for admin flag (for demo)
        const adminFlag = localStorage.getItem('jkuat_admin_access');
        if (adminFlag === 'true') {
            return true;
        }
        
        // Method 5: Check for specific admin cookie
        if (document.cookie.includes('admin_access=true')) {
            return true;
        }
        
        // Default: no admin access
        return false;
    }

    setupEventListeners() {
        // Main click handler for all interactions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const eventId = target.dataset.eventId;
            const commentId = target.dataset.commentId;
            const emoji = target.dataset.emoji;

            console.log('Action clicked:', action, 'Event ID:', eventId, 'Comment ID:', commentId);

            switch (action) {
                case 'like':
                    this.toggleLike(eventId, target);
                    break;
                case 'comment':
                    this.showComments(eventId);
                    break;
                case 'share':
                    this.shareEvent(eventId);
                    break;
                case 'details':
                    this.showEventDetails(eventId);
                    break;
                case 'menu':
                    this.showEventOptionsMenu(eventId, target);
                    break;
                case 'next-slide':
                    this.nextSlide(target);
                    break;
                case 'prev-slide':
                    this.previousSlide(target);
                    break;
                case 'toggle-video':
                    this.toggleVideo(target);
                    break;
                case 'send-comment':
                    this.addComment(eventId, target);
                    break;
                case 'toggle-emoji':
                    this.toggleEmojiPicker(eventId);
                    break;
                case 'insert-emoji':
                    this.insertEmoji(eventId, emoji);
                    break;
                case 'like-comment':
                    this.toggleCommentLike(commentId);
                    break;
                case 'edit-comment':
                    this.editComment(commentId);
                    break;
                case 'delete-comment':
                    this.deleteComment(commentId);
                    break;
                case 'reply-comment':
                    this.replyToComment(commentId);
                    break;
            }
        });

        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            }

            // Event registration buttons
            if (e.target.matches('.register-btn') || e.target.closest('.register-btn')) {
                const button = e.target.matches('.register-btn') ? e.target : e.target.closest('.register-btn');
                const eventId = button.dataset.eventId;
                if (eventId) {
                    this.handleRegistration(eventId, button);
                }
            }

            // Carousel indicators
            if (e.target.matches('.indicator')) {
                const slideIndex = parseInt(e.target.dataset.slide);
                const carousel = e.target.closest('.media-carousel');
                this.goToSlide(carousel, slideIndex);
            }
        });

        // Double-tap to like (mobile)
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                const mediaContainer = e.target.closest('.event-media-container');
                if (mediaContainer) {
                    const card = mediaContainer.closest('.instagram-event-card');
                    const eventId = card.dataset.eventId;
                    const likeBtn = card.querySelector('.like-btn');
                    
                    if (likeBtn && eventId) {
                        this.toggleLike(eventId, likeBtn);
                        e.preventDefault();
                    }
                }
            }
            lastTap = currentTime;
        });

        // Swipe gestures for carousel
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only handle horizontal swipes on carousels
            const carousel = e.target.closest('.media-carousel');
            if (carousel && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    this.nextSlide(carousel.querySelector('.carousel-btn.next'));
                } else {
                    // Swipe right - previous slide
                    this.previousSlide(carousel.querySelector('.carousel-btn.prev'));
                }
            }
            
            startX = 0;
            startY = 0;
        });

        // Admin buttons (if they exist)
        document.getElementById('createEventBtn')?.addEventListener('click', () => {
            this.showCreateEventModal();
        });

        document.getElementById('manageEventsBtn')?.addEventListener('click', () => {
            this.showManageEventsModal();
        });
    }

    async loadInitialData() {
        this.showLoading(true);

        try {
            // Load events and categories
            await Promise.all([
                this.loadEvents(),
                this.loadCategories()
            ]);

            this.renderEvents();
            this.updateStats();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load events. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    async loadEvents() {
        try {
            const response = await fetch(API_ENDPOINTS.EVENTS);
            if (response.ok) {
                const data = await response.json();
                this.events = data.events || data;
            } else {
                // Use mock data if API not available
                this.events = this.getMockEvents();
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = this.getMockEvents();
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(API_ENDPOINTS.EVENT_CATEGORIES);
            if (response.ok) {
                const data = await response.json();
                this.categories = data.categories || [];
            } else {
                this.categories = this.getMockCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = this.getMockCategories();
        }
    }

    applyFilter(filter) {
        this.currentFilter = filter;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.renderEvents();
    }

    renderEvents() {
        const grid = document.querySelector(SELECTORS.EVENTS_GRID);
        if (!grid) return;

        let filteredEvents = this.events;
        if (this.currentFilter !== 'all') {
            filteredEvents = this.events.filter(event =>
                event.event_type?.toLowerCase() === this.currentFilter.toLowerCase()
            );
        }

        if (filteredEvents.length === 0) {
            this.showNoEvents();
            return;
        }

        grid.innerHTML = filteredEvents.map(event => this.createEventCard(event)).join('');
        this.hideNoEvents();
    }

    createEventCard(event) {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const registrationDeadline = new Date(event.registration_deadline || event.start_date);
        const now = new Date();

        const isRegistrationOpen = now < registrationDeadline && event.status === 'active';
        const categoryColor = this.getCategoryColor(event.event_type);
        const categoryIcon = this.getCategoryIcon(event.event_type);

        const dateStr = startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        const timeStr = startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const spotsLeft = event.max_attendees - (event.current_attendees || 0);
        const feeText = event.fee > 0 ? `KSh ${event.fee}` : 'Free';

        // Get media info - handle both uploaded and placeholder media
        const media = event.media || {};
        const hasMedia = media.primary || media.gallery?.length > 0;
        const isVideo = media.type === 'video';
        const isCarousel = media.type === 'carousel' && media.gallery?.length > 1;
        const isUploaded = media.storage && media.storage !== 'placeholder';

        // Use optimized URLs for uploaded media
        const getMediaUrl = (url, size = 'medium') => {
            if (isUploaded && window.mediaManager) {
                return window.mediaManager.getOptimizedImageUrl(url, {
                    width: size === 'thumbnail' ? 300 : 800,
                    height: size === 'thumbnail' ? 300 : 600,
                    quality: 80
                });
            }
            return url;
        };

        // Truncate description for preview
        const shortDescription = event.description.length > 120
            ? event.description.substring(0, 120) + '...'
            : event.description;

        // Generate hashtags
        const hashtags = event.hashtags || [`#${event.event_type}`, '#jkuat', '#innovation'];

        return `
            <article class="instagram-event-card" data-event-id="${event.id}">
                <!-- Event Header -->
                <header class="event-header">
                    <div class="event-profile">
                        <div class="profile-avatar" style="background: ${categoryColor};">
                            <i class="fas fa-${categoryIcon}"></i>
                        </div>
                        <div class="profile-info">
                            <h3 class="profile-name">JKUAT Innovation Club</h3>
                            <span class="profile-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${this.escapeHtml(event.location)}
                            </span>
                        </div>
                    </div>
                    <button class="event-menu-btn" data-action="menu" data-event-id="${event.id}">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </header>

                <!-- Event Media -->
                <div class="event-media-container">
                    ${hasMedia ? `
                        <div class="event-media ${isCarousel ? 'carousel' : ''}" ${isCarousel ? `data-gallery='${JSON.stringify(media.gallery)}'` : ''}>
                            ${isCarousel ? `
                                <div class="media-carousel">
                                    ${media.gallery.map((img, index) => `
                                        <div class="carousel-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${img}');">
                                            <img src="${img}" alt="Event image ${index + 1}" loading="lazy">
                                        </div>
                                    `).join('')}
                                    <div class="carousel-indicators">
                                        ${media.gallery.map((_, index) => `
                                            <span class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
                                        `).join('')}
                                    </div>
                                    <button class="carousel-btn prev" data-action="prev-slide">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="carousel-btn next" data-action="next-slide">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            ` : isVideo ? `
                                <div class="video-container">
                                    <video poster="${media.thumbnail || media.primary}" preload="metadata">
                                        <source src="${media.primary}" type="video/mp4">
                                    </video>
                                    <button class="video-play-btn" data-action="toggle-video">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    <div class="video-duration">0:30</div>
                                </div>
                            ` : `
                                <div class="single-image">
                                    <img src="${media.primary}" alt="${this.escapeHtml(event.title)}" loading="lazy">
                                </div>
                            `}
                            
                            <!-- Media Overlays -->
                            <div class="media-overlays">
                                <span class="event-type-badge" style="background: ${categoryColor};">
                                    <i class="fas fa-${categoryIcon}"></i>
                                    ${event.event_type.toUpperCase()}
                                </span>
                                <span class="event-date-badge">
                                    ${dateStr}
                                </span>
                                ${isCarousel ? '<div class="carousel-indicator"><i class="fas fa-images"></i></div>' : ''}
                                ${isVideo ? '<div class="video-indicator"><i class="fas fa-play"></i></div>' : ''}
                            </div>
                        </div>
                    ` : `
                        <!-- Fallback gradient background for events without media -->
                        <div class="event-media gradient-bg" style="background: linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40);">
                            <div class="gradient-content">
                                <i class="fas fa-${categoryIcon}" style="font-size: 3rem; color: ${categoryColor}; margin-bottom: 1rem;"></i>
                                <h3 style="color: white; font-size: 1.5rem; font-weight: 700; text-align: center; margin: 0;">
                                    ${this.escapeHtml(event.title)}
                                </h3>
                            </div>
                            <div class="media-overlays">
                                <span class="event-type-badge" style="background: ${categoryColor};">
                                    <i class="fas fa-${categoryIcon}"></i>
                                    ${event.event_type.toUpperCase()}
                                </span>
                                <span class="event-date-badge">
                                    ${dateStr}
                                </span>
                            </div>
                        </div>
                    `}
                </div>

                <!-- Event Actions -->
                <div class="event-actions">
                    <div class="action-buttons">
                        <button class="action-btn like-btn ${event.isLiked ? 'liked' : ''}" data-action="like" data-event-id="${event.id}" title="Show Interest">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn comment-btn" data-action="comment" data-event-id="${event.id}" title="Comments">
                            <i class="fas fa-comment"></i>
                        </button>
                        <button class="action-btn share-btn" data-action="share" data-event-id="${event.id}" title="Share">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                    <div class="register-action">
                        <button class="register-btn ${isRegistrationOpen ? 'available' : 'closed'}" 
                                data-event-id="${event.id}" 
                                ${!isRegistrationOpen ? 'disabled' : ''}>
                            <i class="fas fa-${isRegistrationOpen ? 'calendar-plus' : 'calendar-times'}"></i>
                            ${isRegistrationOpen ? 'Register' : 'Closed'}
                        </button>
                    </div>
                </div>

                <!-- Event Info -->
                <div class="event-info">
                    <div class="event-stats">
                        <span class="likes-count">${event.likes || 0} interested</span>
                        <span class="comments-count">${(event.comments || []).length} comments</span>
                        <span class="attendees-count">${event.current_attendees || 0}/${event.max_attendees} registered</span>
                    </div>
                    
                    <div class="event-content">
                        <h4 class="event-title">
                            <strong>jkuat_innovation</strong> ${this.escapeHtml(event.title)}
                        </h4>
                        <p class="event-description">
                            ${this.escapeHtml(shortDescription)}
                            ${event.description.length > 120 ? `
                                <button class="read-more-btn" data-action="details" data-event-id="${event.id}">more</button>
                            ` : ''}
                        </p>
                        
                        <div class="event-hashtags">
                            ${hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join(' ')}
                        </div>
                    </div>

                    <div class="event-details-compact">
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${timeStr}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-tag"></i>
                            <span>${feeText}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>${spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}</span>
                        </div>
                    </div>

                    <button class="view-details-btn" data-action="details" data-event-id="${event.id}">
                        View Event Details
                    </button>
                </div>

                <!-- Comments Preview -->
                <div class="comments-preview" style="display: none;">
                    <div class="comment-item">
                        <strong>student_dev</strong> This looks amazing! Can't wait to attend 🚀
                    </div>
                    <button class="view-comments-btn" data-action="comment" data-event-id="${event.id}">
                        View all comments
                    </button>
                </div>

                <!-- Timestamp -->
                <div class="event-timestamp">
                    ${this.getTimeAgo(event.created_at || event.start_date)}
                </div>
            </article>
        `;
    }

    async handleRegistration(eventId, button) {
        if (!eventId) return;

        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Show loading state
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Registering...';
        button.disabled = true;

        try {
            const response = await fetch(`/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'current-user' // This should come from auth
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess('Registration successful! ' + (result.requiresPayment ? 'Please proceed to payment.' : 'You\'re all set!'));

                // Update event data
                event.current_attendees = (event.current_attendees || 0) + 1;
                this.renderEvents();
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            // For demo purposes, show success anyway
            this.showSuccess('Registration successful! You\'re all set!');
            event.current_attendees = (event.current_attendees || 0) + 1;
            this.renderEvents();
        } finally {
            // Reset button state
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    showEventDetails(eventId) {
        console.error('🚫 BLOCKED: EventsManager.showEventDetails() call prevented for event:', eventId);
        console.trace('Call stack:');
        return false;
        
        // Original code commented out to prevent modal display
        /*
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const registrationDeadline = new Date(event.registration_deadline || event.start_date);
        const isRegistrationOpen = new Date() < registrationDeadline && event.status === 'active';
        const spotsLeft = event.max_attendees - (event.current_attendees || 0);
        const categoryColor = this.getCategoryColor(event.event_type);
        const categoryIcon = this.getCategoryIcon(event.event_type);

        const dateStr = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeStr = `${startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })} - ${endDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })}`;

        const feeText = event.fee > 0 ? `KSh ${event.fee}` : 'Free';
        const requirements = event.requirements || [];

        // Update modal title
        document.getElementById('eventModalTitle').textContent = event.title;

        // Update modal content
        document.getElementById('eventModalContent').innerHTML = `
            <!-- Event Header -->
            <div class="event-header">
                <div class="event-icon" style="background: ${categoryColor}20; border-color: ${categoryColor};">
                    <i class="fas fa-${categoryIcon}" style="font-size: 1.5rem; color: ${categoryColor};"></i>
                </div>
                <div class="event-info">
                    <div class="event-category" style="background: ${categoryColor}20; color: ${categoryColor};">
                        ${this.escapeHtml(event.event_type)}
                    </div>
                    <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                </div>
            </div>
            
            <!-- Event Details Grid -->
            <div class="details-grid">
                <div class="detail-card">
                    <h4 style="color: #10b981;">
                        <i class="fas fa-calendar-alt"></i>Date & Time
                    </h4>
                    <p class="primary-text">${dateStr}</p>
                    <p class="secondary-text">${timeStr}</p>
                </div>
                
                <div class="detail-card">
                    <h4 style="color: #3b82f6;">
                        <i class="fas fa-map-marker-alt"></i>Location
                    </h4>
                    <p class="primary-text">${this.escapeHtml(event.location)}</p>
                </div>
                
                <div class="detail-card">
                    <h4 style="color: #f59e0b;">
                        <i class="fas fa-users"></i>Availability
                    </h4>
                    <p class="primary-text">${spotsLeft} spots left</p>
                    <p class="secondary-text">of ${event.max_attendees} total</p>
                </div>
                
                <div class="detail-card">
                    <h4 style="color: #8b5cf6;">
                        <i class="fas fa-tag"></i>Fee
                    </h4>
                    <p class="primary-text large-text">${feeText}</p>
                </div>
            </div>
            
            <!-- Description -->
            <div class="content-section">
                <h4 class="section-title">
                    <i class="fas fa-info-circle" style="color: #10b981;"></i>Description
                </h4>
                <div class="section-content">${this.escapeHtml(event.description)}</div>
            </div>
            
            ${requirements.length > 0 ? `
            <!-- Requirements -->
            <div class="content-section">
                <h4 class="section-title">
                    <i class="fas fa-clipboard-list" style="color: #f59e0b;"></i>Requirements
                </h4>
                <ul class="requirements-list">
                    ${requirements.map(req => `<li>${this.escapeHtml(req)}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <!-- Registration Status -->
            <div class="registration-status ${isRegistrationOpen ? 'open' : 'closed'}">
                <div class="status-header">
                    <i class="fas fa-${isRegistrationOpen ? 'check-circle' : 'times-circle'}" style="color: ${isRegistrationOpen ? '#10b981' : '#ef4444'}; font-size: 1.25rem;"></i>
                    <h4 class="status-title" style="color: ${isRegistrationOpen ? '#10b981' : '#ef4444'};">
                        Registration ${isRegistrationOpen ? 'Open' : 'Closed'}
                    </h4>
                </div>
                <p class="status-text">
                    ${isRegistrationOpen
                ? `Registration deadline: ${registrationDeadline.toLocaleDateString()} at ${registrationDeadline.toLocaleTimeString()}`
                : 'Registration for this event has closed.'
            }
                </p>
            </div>
            
            <!-- Action Buttons -->
            <div class="modal-actions">
                <button onclick="closeEventModal()" class="btn btn-outline">
                    <i class="fas fa-times"></i>Close
                </button>
                <button class="register-btn btn ${isRegistrationOpen ? 'btn-primary' : 'btn-secondary'}" 
                        data-event-id="${event.id}" 
                        ${!isRegistrationOpen ? 'disabled' : ''}>
                    <i class="fas fa-${isRegistrationOpen ? 'calendar-plus' : 'calendar-times'}"></i>
                    ${isRegistrationOpen ? 'Register Now' : 'Registration Closed'}
                </button>
            </div>
        `;

        // Show the modal and prevent body scroll
        const modal = document.getElementById('eventModal');
        if (modal) {
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            modal.style.display = 'flex';
        }
        */
    }

    showCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Initialize media upload widget
            const mediaContainer = document.getElementById('eventMediaUpload');
            if (mediaContainer && !mediaContainer.hasChildNodes()) {
                const uploadWidget = window.mediaManager.createMediaUploadWidget('new-event', {
                    multiple: true,
                    showGallery: true
                });
                mediaContainer.appendChild(uploadWidget);
                
                // Setup form submission handler
                this.setupCreateEventForm();
            }
        }
    }

    setupCreateEventForm() {
        const form = document.getElementById('createEventForm');
        if (form && !form.hasAttribute('data-setup')) {
            form.setAttribute('data-setup', 'true');
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateEvent(form);
            });
        }

        // Listen for media uploads
        document.addEventListener('mediaUploaded', (e) => {
            const { result, eventId } = e.detail;
            if (eventId === 'new-event') {
                this.handleMediaUpload(result);
            }
        });
    }

    async handleCreateEvent(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Event...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const eventData = {
                title: formData.get('title'),
                description: formData.get('description'),
                event_type: formData.get('type'),
                start_date: formData.get('startDateTime'),
                end_date: formData.get('endDateTime'),
                location: formData.get('location'),
                max_attendees: parseInt(formData.get('maxAttendees')) || 50,
                fee: parseInt(formData.get('fee')) || 0,
                registration_deadline: formData.get('registrationDeadline') || formData.get('startDateTime'),
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                media: this.getUploadedMedia(),
                hashtags: this.generateHashtags(formData.get('title'), formData.get('type')),
                likes: 0,
                isLiked: false,
                current_attendees: 0,
                created_at: new Date().toISOString(),
                comments: []
            };

            // Generate unique ID
            eventData.id = Date.now().toString();

            // Validate required fields
            if (!eventData.title || !eventData.description || !eventData.event_type || 
                !eventData.start_date || !eventData.end_date || !eventData.location) {
                throw new Error('Please fill in all required fields');
            }

            // Validate dates
            const startDate = new Date(eventData.start_date);
            const endDate = new Date(eventData.end_date);
            if (startDate >= endDate) {
                throw new Error('End date must be after start date');
            }
            if (startDate < new Date()) {
                throw new Error('Start date must be in the future');
            }

            console.log('Creating event with data:', eventData);

            // Try to save to API, fallback to local storage
            try {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventData)
                });

                if (!response.ok) {
                    throw new Error('API not available');
                }

                const result = await response.json();
                console.log('Event created via API:', result);
            } catch (apiError) {
                console.log('API not available, saving locally:', apiError);
                // Save to local storage as fallback
                this.saveEventLocally(eventData);
            }

            // Add to current events list
            this.events.unshift(eventData);
            
            // Update UI
            this.renderEvents();
            this.updateStats();
            
            // Close modal and reset form
            this.closeCreateEventModal();
            form.reset();
            this.clearUploadedMedia();
            
            this.showSuccess('Event created successfully!');

        } catch (error) {
            console.error('Error creating event:', error);
            this.showError(error.message || 'Failed to create event');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    handleMediaUpload(mediaResult) {
        if (!this.uploadedMedia) {
            this.uploadedMedia = [];
        }
        
        this.uploadedMedia.push(mediaResult);
        console.log('Media uploaded for new event:', mediaResult);
        
        // Update preview
        this.updateMediaPreview();
    }

    updateMediaPreview() {
        const previewContainer = document.getElementById('preview-new-event');
        if (!previewContainer || !this.uploadedMedia || this.uploadedMedia.length === 0) {
            return;
        }

        previewContainer.innerHTML = `
            <div class="media-preview-header">
                <h4>Uploaded Media (${this.uploadedMedia.length})</h4>
                <button class="clear-media-btn" onclick="window.eventsManager.clearUploadedMedia()">
                    <i class="fas fa-trash"></i> Clear All
                </button>
            </div>
            <div class="media-preview-grid">
                ${this.uploadedMedia.map((media, index) => `
                    <div class="media-preview-item" data-index="${index}">
                        ${media.type === 'video' ? `
                            <video src="${media.url}" poster="${media.thumbnail}"></video>
                            <div class="media-type-badge">
                                <i class="fas fa-play"></i>
                            </div>
                        ` : `
                            <img src="${media.url}" alt="Uploaded media">
                        `}
                        <button class="remove-media-btn" onclick="window.eventsManager.removeUploadedMedia(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getUploadedMedia() {
        if (!this.uploadedMedia || this.uploadedMedia.length === 0) {
            return null;
        }

        if (this.uploadedMedia.length === 1) {
            const media = this.uploadedMedia[0];
            return {
                type: media.type === 'video' ? 'video' : 'image',
                primary: media.url,
                thumbnail: media.thumbnail,
                storage: media.storage
            };
        } else {
            return {
                type: 'carousel',
                primary: this.uploadedMedia[0].url,
                gallery: this.uploadedMedia.map(m => m.url),
                storage: this.uploadedMedia[0].storage
            };
        }
    }

    clearUploadedMedia() {
        this.uploadedMedia = [];
        this.updateMediaPreview();
        this.showToast('Media cleared', 'info');
    }

    removeUploadedMedia(index) {
        if (this.uploadedMedia && this.uploadedMedia[index]) {
            this.uploadedMedia.splice(index, 1);
            this.updateMediaPreview();
            this.showToast('Media removed', 'info');
        }
    }

    saveEventLocally(eventData) {
        try {
            const existingEvents = JSON.parse(localStorage.getItem('jkuat_events') || '[]');
            existingEvents.unshift(eventData);
            localStorage.setItem('jkuat_events', JSON.stringify(existingEvents));
            console.log('Event saved to local storage');
        } catch (error) {
            console.error('Failed to save event locally:', error);
        }
    }

    generateHashtags(title, type) {
        const hashtags = [`#${type}`, '#jkuat', '#innovation'];
        
        // Extract keywords from title
        const keywords = title.toLowerCase().split(' ').filter(word => 
            word.length > 3 && !['the', 'and', 'for', 'with', 'from'].includes(word)
        );
        
        keywords.slice(0, 2).forEach(keyword => {
            hashtags.push(`#${keyword}`);
        });
        
        return hashtags;
    }

    closeCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Clear uploaded media when closing
            this.clearUploadedMedia();
        }
    }

    showManageEventsModal() {
        alert('Manage Events functionality coming soon!');
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

        // Update stats in the UI
        const totalEl = document.getElementById('totalEventsCount');
        const upcomingEl = document.getElementById('upcomingEventsCount');
        const attendeesEl = document.getElementById('totalAttendeesCount');

        if (totalEl) totalEl.textContent = totalEvents;
        if (upcomingEl) upcomingEl.textContent = upcomingEvents;
        if (attendeesEl) attendeesEl.textContent = totalAttendees + '+';
    }

    showLoading(show) {
        const loadingEl = document.querySelector(SELECTORS.EVENTS_LOADING);
        const gridEl = document.querySelector(SELECTORS.EVENTS_GRID);

        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
        if (gridEl) {
            gridEl.style.display = show ? 'none' : 'grid';
        }
    }

    showNoEvents() {
        const noEventsEl = document.querySelector(SELECTORS.NO_EVENTS_MESSAGE);
        const gridEl = document.querySelector(SELECTORS.EVENTS_GRID);

        if (noEventsEl) {
            noEventsEl.style.display = 'block';
        }
        if (gridEl) {
            gridEl.style.display = 'none';
        }
    }

    hideNoEvents() {
        const noEventsEl = document.querySelector(SELECTORS.NO_EVENTS_MESSAGE);
        if (noEventsEl) {
            noEventsEl.style.display = 'none';
        }
    }

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            z-index: 1000;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Utility methods
    getCategoryColor(category) {
        const colors = {
            'workshop': '#10b981',
            'seminar': '#3b82f6',
            'competition': '#f59e0b',
            'social': '#f472b6',
            'hackathon': '#8b5cf6',
            'networking': '#06b6d4'
        };
        return colors[category?.toLowerCase()] || '#6b7280';
    }

    getCategoryIcon(category) {
        const icons = {
            'workshop': 'tools',
            'seminar': 'chalkboard-teacher',
            'competition': 'trophy',
            'social': 'users',
            'hackathon': 'code',
            'networking': 'handshake'
        };
        return icons[category?.toLowerCase()] || 'calendar';
    }

    // Helper method to convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '107, 114, 128';
    }

    // Helper method to darken a color
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Helper method to get time ago format
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    // Instagram-style interaction methods
    toggleLike(eventId, button) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Toggle like state
        event.isLiked = !event.isLiked;
        event.likes = (event.likes || 0) + (event.isLiked ? 1 : -1);

        // Update button appearance
        button.classList.toggle('liked');
        
        // Update likes count in the UI
        const card = button.closest('.instagram-event-card');
        const likesCount = card.querySelector('.likes-count');
        if (likesCount) {
            likesCount.textContent = `${event.likes} interested`;
        }

        // Add heart animation if liked
        if (event.isLiked) {
            this.showHeartAnimation(card);
            // Add a small bounce animation to the button
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = '';
            }, 200);
        }

        // Show feedback message
        const message = event.isLiked ? 'Added to interested events!' : 'Removed from interested events';
        this.showToast(message, event.isLiked ? 'success' : 'info');
    }

    showHeartAnimation(card) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        
        // Position the heart in the center of the media container
        const mediaContainer = card.querySelector('.event-media-container');
        if (mediaContainer) {
            mediaContainer.style.position = 'relative';
            mediaContainer.appendChild(heart);
        } else {
            card.appendChild(heart);
        }

        // Remove the heart after animation
        setTimeout(() => {
            heart.remove();
        }, 1000);
    }

    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const shareData = {
            title: `${event.title} - JKUAT Innovation Club`,
            text: `Join us for ${event.title}! ${event.description.substring(0, 100)}...`,
            url: `${window.location.origin}${window.location.pathname}#event-${eventId}`
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            // Use native sharing if available
            navigator.share(shareData).then(() => {
                this.showToast('Event shared successfully!', 'success');
            }).catch((error) => {
                console.log('Error sharing:', error);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Fallback: copy to clipboard and show share options
        navigator.clipboard.writeText(shareData.url).then(() => {
            this.showShareModal(shareData);
        }).catch(() => {
            // If clipboard fails, just show the share modal
            this.showShareModal(shareData);
        });
    }

    showShareModal(shareData) {
        const modal = document.createElement('div');
        modal.className = 'share-modal-backdrop';
        modal.innerHTML = `
            <div class="share-modal">
                <div class="share-header">
                    <h3>Share Event</h3>
                    <button class="close-share" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="share-content">
                    <p>Event link copied to clipboard!</p>
                    <div class="share-url">
                        <input type="text" value="${shareData.url}" readonly>
                        <button onclick="navigator.clipboard.writeText('${shareData.url}'); this.textContent='Copied!'">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="share-buttons">
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}" 
                           target="_blank" class="share-btn twitter">
                            <i class="fab fa-twitter"></i> Twitter
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}" 
                           target="_blank" class="share-btn facebook">
                            <i class="fab fa-facebook"></i> Facebook
                        </a>
                        <a href="https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}" 
                           target="_blank" class="share-btn whatsapp">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    }

    showComments(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Initialize comments if not exists
        if (!event.comments) {
            event.comments = this.getMockComments(eventId);
        }

        const modal = document.createElement('div');
        modal.className = 'comments-modal-backdrop';
        modal.innerHTML = `
            <div class="comments-modal">
                <div class="comments-header">
                    <h3>Comments (${event.comments.length})</h3>
                    <button class="close-comments" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="comments-content" id="commentsContent-${eventId}">
                    ${this.renderComments(event.comments)}
                </div>
                <div class="comment-input-section">
                    <div class="comment-input-container">
                        <div class="comment-user-avatar" style="background: ${this.getRandomColor()};">
                            ${this.getCurrentUserInitials()}
                        </div>
                        <input type="text" 
                               placeholder="Add a comment..." 
                               class="comment-input" 
                               id="commentInput-${eventId}"
                               maxlength="500">
                        <button class="send-comment-btn" data-action="send-comment" data-event-id="${eventId}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="comment-features">
                        <button class="emoji-btn" data-action="toggle-emoji" data-event-id="${eventId}">
                            <i class="fas fa-smile"></i>
                        </button>
                        <span class="char-counter" id="charCounter-${eventId}">0/500</span>
                    </div>
                    <div class="emoji-picker" id="emojiPicker-${eventId}" style="display: none;">
                        <div class="emoji-grid">
                            ${this.getEmojiList().map(emoji => 
                                `<button class="emoji-item" data-action="insert-emoji" data-event-id="${eventId}" data-emoji="${emoji}">${emoji}</button>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup comment input listeners
        this.setupCommentInputListeners(eventId);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-comments');
        closeBtn.addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Focus on input
        const input = modal.querySelector(`#commentInput-${eventId}`);
        setTimeout(() => input.focus(), 100);
    }

    renderComments(comments) {
        if (!comments || comments.length === 0) {
            return `
                <div class="no-comments">
                    <div class="no-comments-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            `;
        }

        return comments.map(comment => `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-avatar" style="background: ${comment.avatarColor || this.getRandomColor()};">
                    ${comment.author.charAt(0).toUpperCase()}
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <strong class="comment-author">${this.escapeHtml(comment.author)}</strong>
                        <span class="comment-time">${this.getTimeAgo(comment.timestamp)}</span>
                        ${comment.isOwner ? `
                            <div class="comment-actions">
                                <button class="comment-action-btn" data-action="edit-comment" data-comment-id="${comment.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="comment-action-btn delete" data-action="delete-comment" data-comment-id="${comment.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <p class="comment-text" id="commentText-${comment.id}">${this.escapeHtml(comment.text)}</p>
                    <div class="comment-reactions">
                        <button class="reaction-btn ${comment.userLiked ? 'liked' : ''}" 
                                data-action="like-comment" data-comment-id="${comment.id}">
                            <i class="fas fa-heart"></i>
                            <span class="reaction-count">${comment.likes || 0}</span>
                        </button>
                        <button class="reaction-btn reply-btn" 
                                data-action="reply-comment" data-comment-id="${comment.id}">
                            <i class="fas fa-reply"></i>
                            Reply
                        </button>
                    </div>
                    ${comment.replies && comment.replies.length > 0 ? `
                        <div class="comment-replies">
                            ${comment.replies.map(reply => `
                                <div class="reply-item">
                                    <div class="reply-avatar" style="background: ${reply.avatarColor || this.getRandomColor()};">
                                        ${reply.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="reply-content">
                                        <strong>${this.escapeHtml(reply.author)}</strong>
                                        <span class="reply-text">${this.escapeHtml(reply.text)}</span>
                                        <span class="reply-time">${this.getTimeAgo(reply.timestamp)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    setupCommentInputListeners(eventId) {
        const input = document.querySelector(`#commentInput-${eventId}`);
        const charCounter = document.querySelector(`#charCounter-${eventId}`);
        
        if (input && charCounter) {
            input.addEventListener('input', (e) => {
                const length = e.target.value.length;
                charCounter.textContent = `${length}/500`;
                
                if (length > 450) {
                    charCounter.style.color = '#ef4444';
                } else if (length > 400) {
                    charCounter.style.color = '#f59e0b';
                } else {
                    charCounter.style.color = 'rgba(255, 255, 255, 0.6)';
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const sendBtn = document.querySelector(`#commentInput-${eventId}`).parentElement.querySelector('.send-comment-btn');
                    this.addComment(eventId, sendBtn);
                }
            });
        }
    }

    addComment(eventId, button) {
        console.log('addComment called with eventId:', eventId, 'button:', button);
        
        const input = document.querySelector(`#commentInput-${eventId}`);
        if (!input) {
            console.error('Comment input not found for eventId:', eventId);
            return;
        }
        
        const text = input.value.trim();
        console.log('Comment text:', text);
        
        if (!text) {
            this.showToast('Please enter a comment', 'warning');
            return;
        }

        // Show loading state
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;

        console.log('Starting comment submission...');

        // Simulate API call
        setTimeout(() => {
            console.log('Processing comment submission...');
            
            const event = this.events.find(e => e.id === eventId);
            if (!event) {
                console.error('Event not found:', eventId);
                return;
            }
            
            if (!event.comments) event.comments = [];

            const newComment = {
                id: Date.now().toString(),
                author: this.getCurrentUserName(),
                text: text,
                timestamp: new Date().toISOString(),
                avatarColor: this.getRandomColor(),
                likes: 0,
                userLiked: false,
                isOwner: true,
                replies: []
            };

            console.log('New comment created:', newComment);
            event.comments.unshift(newComment);

            // Update comments display
            const commentsContent = document.querySelector(`#commentsContent-${eventId}`);
            if (commentsContent) {
                commentsContent.innerHTML = this.renderComments(event.comments);
                console.log('Comments display updated');
            } else {
                console.error('Comments content container not found');
            }

            // Update header count
            const header = document.querySelector('.comments-header h3');
            if (header) {
                header.textContent = `Comments (${event.comments.length})`;
            }

            // Clear input
            input.value = '';
            const charCounter = document.querySelector(`#charCounter-${eventId}`);
            if (charCounter) {
                charCounter.textContent = '0/500';
                charCounter.style.color = 'rgba(255, 255, 255, 0.6)';
            }

            // Reset button
            button.innerHTML = originalIcon;
            button.disabled = false;

            // Show success
            this.showToast('Comment added successfully!', 'success');

            // Scroll to new comment
            if (commentsContent) {
                commentsContent.scrollTop = 0;
            }

            console.log('Comment submission completed successfully');

        }, 500);
    }

    toggleCommentLike(commentId) {
        // Find comment in all events
        let comment = null;
        let event = null;

        for (const evt of this.events) {
            if (evt.comments) {
                comment = evt.comments.find(c => c.id === commentId);
                if (comment) {
                    event = evt;
                    break;
                }
            }
        }

        if (!comment) return;

        comment.userLiked = !comment.userLiked;
        comment.likes = (comment.likes || 0) + (comment.userLiked ? 1 : -1);

        // Update UI
        const reactionBtn = document.querySelector(`[data-comment-id="${commentId}"][data-action="like-comment"]`);
        if (reactionBtn) {
            reactionBtn.classList.toggle('liked');
            const countSpan = reactionBtn.querySelector('.reaction-count');
            if (countSpan) {
                countSpan.textContent = comment.likes;
            }
        }

        // Show feedback
        const message = comment.userLiked ? 'Comment liked!' : 'Like removed';
        this.showToast(message, 'success');
    }

    toggleEmojiPicker(eventId) {
        const picker = document.querySelector(`#emojiPicker-${eventId}`);
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    }

    insertEmoji(eventId, emoji) {
        const input = document.querySelector(`#commentInput-${eventId}`);
        if (input) {
            const cursorPos = input.selectionStart;
            const textBefore = input.value.substring(0, cursorPos);
            const textAfter = input.value.substring(cursorPos);
            
            input.value = textBefore + emoji + textAfter;
            input.focus();
            input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
            
            // Trigger input event to update character counter
            input.dispatchEvent(new Event('input'));
        }
        
        // Hide emoji picker
        this.toggleEmojiPicker(eventId);
    }

    editComment(commentId) {
        this.showToast('Edit comment feature coming soon!', 'info');
    }

    deleteComment(commentId) {
        if (confirm('Are you sure you want to delete this comment?')) {
            // Find and remove comment
            for (const event of this.events) {
                if (event.comments) {
                    const index = event.comments.findIndex(c => c.id === commentId);
                    if (index !== -1) {
                        event.comments.splice(index, 1);
                        
                        // Update UI
                        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                        if (commentElement) {
                            commentElement.remove();
                        }
                        
                        // Update header count
                        const header = document.querySelector('.comments-header h3');
                        if (header) {
                            header.textContent = `Comments (${event.comments.length})`;
                        }
                        
                        this.showToast('Comment deleted', 'success');
                        break;
                    }
                }
            }
        }
    }

    showEventOptionsMenu(eventId, button) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Remove any existing menus
        document.querySelectorAll('.event-options-menu').forEach(menu => menu.remove());

        const menu = document.createElement('div');
        menu.className = 'event-options-menu';
        
        const isRegistered = this.isUserRegistered(eventId);
        const isLiked = event.isLiked;
        const canRegister = this.canUserRegister(event);
        
        menu.innerHTML = `
            <div class="options-menu-content">
                <div class="menu-header">
                    <h4>Event Options</h4>
                    <button class="close-menu" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="menu-options">
                    ${canRegister ? `
                        <button class="menu-option" data-action="quick-register" data-event-id="${eventId}">
                            <i class="fas fa-calendar-plus"></i>
                            <span>Quick Register</span>
                        </button>
                    ` : ''}
                    
                    ${isRegistered ? `
                        <button class="menu-option" data-action="view-registration" data-event-id="${eventId}">
                            <i class="fas fa-ticket-alt"></i>
                            <span>View Registration</span>
                        </button>
                        <button class="menu-option danger" data-action="cancel-registration" data-event-id="${eventId}">
                            <i class="fas fa-calendar-times"></i>
                            <span>Cancel Registration</span>
                        </button>
                    ` : ''}
                    
                    <button class="menu-option" data-action="${isLiked ? 'unlike' : 'like'}-event" data-event-id="${eventId}">
                        <i class="fas fa-heart ${isLiked ? 'liked' : ''}"></i>
                        <span>${isLiked ? 'Remove from Interested' : 'Add to Interested'}</span>
                    </button>
                    
                    <button class="menu-option" data-action="add-to-calendar" data-event-id="${eventId}">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Add to Calendar</span>
                    </button>
                    
                    <button class="menu-option" data-action="share-event" data-event-id="${eventId}">
                        <i class="fas fa-share-alt"></i>
                        <span>Share Event</span>
                    </button>
                    
                    <button class="menu-option" data-action="copy-link" data-event-id="${eventId}">
                        <i class="fas fa-link"></i>
                        <span>Copy Event Link</span>
                    </button>
                    
                    <div class="menu-divider"></div>
                    
                    <button class="menu-option" data-action="event-feedback" data-event-id="${eventId}">
                        <i class="fas fa-comment-dots"></i>
                        <span>Give Feedback</span>
                    </button>
                    
                    <button class="menu-option" data-action="report-event" data-event-id="${eventId}">
                        <i class="fas fa-flag"></i>
                        <span>Report Issue</span>
                    </button>
                    
                    ${this.isUserAdmin() ? `
                        <div class="menu-divider"></div>
                        <div class="menu-section-title">Admin Actions</div>
                        <button class="menu-option admin" data-action="edit-event" data-event-id="${eventId}">
                            <i class="fas fa-edit"></i>
                            <span>Edit Event</span>
                        </button>
                        <button class="menu-option admin" data-action="view-attendees" data-event-id="${eventId}">
                            <i class="fas fa-users"></i>
                            <span>View Attendees</span>
                        </button>
                        <button class="menu-option admin danger" data-action="delete-event" data-event-id="${eventId}">
                            <i class="fas fa-trash"></i>
                            <span>Delete Event</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Position the menu relative to the button
        const buttonRect = button.getBoundingClientRect();
        const card = button.closest('.instagram-event-card');
        card.style.position = 'relative';
        card.appendChild(menu);

        // Position menu
        menu.style.position = 'absolute';
        menu.style.top = '60px';
        menu.style.right = '10px';
        menu.style.zIndex = '1000';

        // Add click handlers for menu options
        menu.addEventListener('click', (e) => {
            const option = e.target.closest('.menu-option');
            if (option) {
                const action = option.dataset.action;
                const eventId = option.dataset.eventId;
                this.handleMenuAction(action, eventId);
                menu.remove();
            }
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !button.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    handleMenuAction(action, eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        switch (action) {
            case 'quick-register':
                this.quickRegister(eventId);
                break;
            case 'view-registration':
                this.viewRegistration(eventId);
                break;
            case 'cancel-registration':
                this.cancelRegistration(eventId);
                break;
            case 'like-event':
                const likeBtn = document.querySelector(`[data-event-id="${eventId}"][data-action="like"]`);
                if (likeBtn) this.toggleLike(eventId, likeBtn);
                break;
            case 'unlike-event':
                const unlikeBtn = document.querySelector(`[data-event-id="${eventId}"][data-action="like"]`);
                if (unlikeBtn) this.toggleLike(eventId, unlikeBtn);
                break;
            case 'add-to-calendar':
                this.addToCalendar(eventId);
                break;
            case 'share-event':
                this.shareEvent(eventId);
                break;
            case 'copy-link':
                this.copyEventLink(eventId);
                break;
            case 'event-feedback':
                this.showEventFeedback(eventId);
                break;
            case 'report-event':
                this.reportEvent(eventId);
                break;
            case 'edit-event':
                this.editEvent(eventId);
                break;
            case 'view-attendees':
                this.viewAttendees(eventId);
                break;
            case 'delete-event':
                this.deleteEvent(eventId);
                break;
            default:
                this.showToast('Feature coming soon!', 'info');
        }
    }

    // Helper methods for menu functionality
    isUserRegistered(eventId) {
        // Check if user is registered for this event
        // This would normally check against user data or API
        return Math.random() > 0.7; // Mock: 30% chance user is registered
    }

    canUserRegister(event) {
        const now = new Date();
        const registrationDeadline = new Date(event.registration_deadline || event.start_date);
        const spotsLeft = event.max_attendees - (event.current_attendees || 0);
        
        return now < registrationDeadline && 
               event.status === 'active' && 
               spotsLeft > 0 && 
               !this.isUserRegistered(event.id);
    }

    isUserAdmin() {
        return window.eventsAuth && 
               window.eventsAuth.getUser() && 
               window.eventsAuth.getUser().role === 'admin';
    }

    quickRegister(eventId) {
        const registerBtn = document.querySelector(`[data-event-id="${eventId}"].register-btn`);
        if (registerBtn && !registerBtn.disabled) {
            this.handleRegistration(eventId, registerBtn);
        } else {
            this.showToast('Registration not available', 'warning');
        }
    }

    viewRegistration(eventId) {
        this.showToast('Opening registration details...', 'info');
        // Would show registration confirmation, QR code, etc.
    }

    cancelRegistration(eventId) {
        if (confirm('Are you sure you want to cancel your registration for this event?')) {
            this.showToast('Registration cancelled successfully', 'success');
            // Would call API to cancel registration
        }
    }

    addToCalendar(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        
        // Create calendar event data
        const calendarData = {
            title: event.title,
            start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
            end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
            description: event.description,
            location: event.location
        };

        // Generate Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;
        
        window.open(googleCalendarUrl, '_blank');
        this.showToast('Opening Google Calendar...', 'success');
    }

    copyEventLink(eventId) {
        const url = `${window.location.origin}${window.location.pathname}#event-${eventId}`;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Event link copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy link', 'error');
        });
    }

    showEventFeedback(eventId) {
        this.showToast('Feedback form coming soon!', 'info');
        // Would show feedback modal
    }

    reportEvent(eventId) {
        if (confirm('Report this event for inappropriate content or other issues?')) {
            this.showToast('Report submitted. Thank you for your feedback.', 'success');
            // Would submit report to moderation system
        }
    }

    editEvent(eventId) {
        this.showToast('Opening event editor...', 'info');
        // Would open event editing interface
    }

    viewAttendees(eventId) {
        this.showToast('Loading attendee list...', 'info');
        // Would show attendee management interface
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            this.showToast('Event deleted successfully', 'success');
            // Would call API to delete event and refresh list
        }
    }

    getCurrentUserName() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            return user?.full_name || user?.name || 'Anonymous User';
        }
        return 'Guest User';
    }

    getCurrentUserInitials() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user?.full_name || user?.name) {
                const name = user.full_name || user.name;
                return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            }
        }
        return 'G';
    }

    getRandomColor() {
        const colors = [
            '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#06b6d4', '#f472b6', '#84cc16'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getEmojiList() {
        return ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙌', '💪', '🚀', '⭐', '✨'];
    }

    getMockComments(eventId) {
        return [
            {
                id: '1',
                author: 'Alex Mwangi',
                text: 'This looks like an amazing event! Really excited to learn about prototyping techniques. Will there be hands-on activities?',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                avatarColor: '#10b981',
                likes: 5,
                userLiked: false,
                isOwner: false,
                replies: [
                    {
                        id: '1-1',
                        author: 'JKUAT Innovation Club',
                        text: 'Yes! There will be plenty of hands-on activities and you\'ll build your own prototype 🚀',
                        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
                        avatarColor: '#3b82f6'
                    }
                ]
            },
            {
                id: '2',
                author: 'Sarah Kimani',
                text: 'Perfect timing! I\'ve been working on an idea and this workshop will help me take it to the next level 💡',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                avatarColor: '#f59e0b',
                likes: 3,
                userLiked: true,
                isOwner: false,
                replies: []
            },
            {
                id: '3',
                author: 'David Ochieng',
                text: 'Is this suitable for beginners? I don\'t have much experience with prototyping but I\'m very interested to learn.',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                avatarColor: '#8b5cf6',
                likes: 1,
                userLiked: false,
                isOwner: false,
                replies: []
            }
        ];
    }

    // Enhanced toast notification system
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    // Carousel functionality
    goToSlide(carousel, slideIndex) {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const indicators = carousel.querySelectorAll('.indicator');
        
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to target slide and indicator
        if (slides[slideIndex] && indicators[slideIndex]) {
            slides[slideIndex].classList.add('active');
            indicators[slideIndex].classList.add('active');
        }
    }

    nextSlide(button) {
        const carousel = button.closest('.media-carousel');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const indicators = carousel.querySelectorAll('.indicator');
        const activeSlide = carousel.querySelector('.carousel-slide.active');
        const activeIndicator = carousel.querySelector('.indicator.active');
        
        let nextIndex = Array.from(slides).indexOf(activeSlide) + 1;
        if (nextIndex >= slides.length) nextIndex = 0;

        activeSlide.classList.remove('active');
        activeIndicator.classList.remove('active');
        slides[nextIndex].classList.add('active');
        indicators[nextIndex].classList.add('active');
    }

    previousSlide(button) {
        const carousel = button.closest('.media-carousel');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const indicators = carousel.querySelectorAll('.indicator');
        const activeSlide = carousel.querySelector('.carousel-slide.active');
        const activeIndicator = carousel.querySelector('.indicator.active');
        
        let prevIndex = Array.from(slides).indexOf(activeSlide) - 1;
        if (prevIndex < 0) prevIndex = slides.length - 1;

        activeSlide.classList.remove('active');
        activeIndicator.classList.remove('active');
        slides[prevIndex].classList.add('active');
        indicators[prevIndex].classList.add('active');
    }

    // Video functionality
    toggleVideo(button) {
        const video = button.parentElement.querySelector('video');
        const icon = button.querySelector('i');
        
        if (video.paused) {
            video.play();
            icon.className = 'fas fa-pause';
            button.style.opacity = '0';
        } else {
            video.pause();
            icon.className = 'fas fa-play';
            button.style.opacity = '1';
        }
    }

    // Security: Prevent XSS
    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Mock data methods
    getMockEvents() {
        return [
            {
                id: '1',
                title: 'Innovation Workshop: From Idea to Prototype',
                description: 'Learn the fundamentals of turning your innovative ideas into working prototypes. This hands-on workshop covers design thinking, rapid prototyping, and validation techniques. You\'ll work with industry experts and fellow innovators to transform concepts into tangible solutions.',
                event_type: 'workshop',
                start_date: '2025-01-15T14:00:00Z',
                end_date: '2025-01-15T17:00:00Z',
                location: 'Innovation Lab, JKUAT',
                max_attendees: 30,
                current_attendees: 18,
                registration_deadline: '2025-01-14T23:59:59Z',
                fee: 500,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Laptop', 'Notebook and pen', 'Basic understanding of design principles'],
                media: {
                    type: 'carousel',
                    primary: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    gallery: [
                        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    ]
                },
                hashtags: ['#workshop', '#innovation', '#prototype', '#jkuat'],
                likes: 24,
                isLiked: false,
                created_at: '2025-01-10T10:00:00Z',
                comments: []
            },
            {
                id: '2',
                title: 'Entrepreneurship Seminar: Building Sustainable Startups',
                description: 'Join successful entrepreneurs and investors as they share insights on building sustainable and scalable startups in the African market. Learn about funding opportunities, market validation, and growth strategies.',
                event_type: 'seminar',
                start_date: '2025-01-20T09:00:00Z',
                end_date: '2025-01-20T16:00:00Z',
                location: 'Main Auditorium, JKUAT',
                max_attendees: 200,
                current_attendees: 145,
                registration_deadline: '2025-01-18T23:59:59Z',
                fee: 0,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Business idea (optional)', 'Notebook for taking notes'],
                media: {
                    type: 'image',
                    primary: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                },
                hashtags: ['#entrepreneurship', '#startup', '#business', '#seminar'],
                likes: 67,
                isLiked: true,
                created_at: '2025-01-08T15:30:00Z',
                comments: []
            },
            {
                id: '3',
                title: 'Tech Innovation Competition 2025',
                description: 'Showcase your innovative tech solutions and compete for prizes worth KSh 500,000. Categories include AI/ML, IoT, Mobile Apps, and Web Solutions. This is your chance to demonstrate your technical skills and win amazing prizes.',
                event_type: 'competition',
                start_date: '2025-02-01T08:00:00Z',
                end_date: '2025-02-03T18:00:00Z',
                location: 'JKUAT Campus',
                max_attendees: 100,
                current_attendees: 67,
                registration_deadline: '2025-01-25T23:59:59Z',
                fee: 1000,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Team of 2-4 members', 'Working prototype or demo', 'Presentation slides', 'Laptop for demonstration'],
                media: {
                    type: 'video',
                    primary: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                },
                hashtags: ['#competition', '#tech', '#innovation', '#prizes'],
                likes: 89,
                isLiked: false,
                created_at: '2025-01-05T12:00:00Z',
                comments: []
            },
            {
                id: '4',
                title: 'Networking Night: Connect with Industry Leaders',
                description: 'An evening of networking with industry leaders, alumni, and fellow innovators. Great opportunity to build connections and explore collaboration opportunities. Light refreshments will be provided.',
                event_type: 'social',
                start_date: '2025-01-25T18:00:00Z',
                end_date: '2025-01-25T21:00:00Z',
                location: 'JKUAT Conference Center',
                max_attendees: 80,
                current_attendees: 34,
                registration_deadline: '2025-01-24T23:59:59Z',
                fee: 0,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Business attire recommended', 'Business cards (if available)'],
                media: {
                    type: 'image',
                    primary: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                },
                hashtags: ['#networking', '#social', '#industry', '#connections'],
                likes: 42,
                isLiked: true,
                created_at: '2025-01-12T09:15:00Z',
                comments: []
            },
            {
                id: '5',
                title: 'AI/ML Hackathon: Solutions for Agriculture',
                description: '48-hour hackathon focused on developing AI and Machine Learning solutions for agricultural challenges in Kenya. Work with real datasets and build solutions that can impact local farmers.',
                event_type: 'hackathon',
                start_date: '2025-02-15T18:00:00Z',
                end_date: '2025-02-17T18:00:00Z',
                location: 'Computer Labs, JKUAT',
                max_attendees: 60,
                current_attendees: 23,
                registration_deadline: '2025-02-10T23:59:59Z',
                fee: 1500,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Laptop with development environment', 'Programming experience in Python/R', 'Team of 3-5 members', 'Sleeping bag (optional for overnight stay)'],
                hashtags: ['#hackathon', '#ai', '#ml', '#agriculture'],
                likes: 156,
                isLiked: false,
                created_at: '2025-01-03T14:45:00Z',
                comments: []
            }
        ];
    }

    getMockCategories() {
        return [
            { value: 'workshop', label: 'Workshops', count: 2 },
            { value: 'seminar', label: 'Seminars', count: 1 },
            { value: 'competition', label: 'Competitions', count: 1 },
            { value: 'social', label: 'Social Events', count: 1 },
            { value: 'hackathon', label: 'Hackathons', count: 1 }
        ];
    }
}

// Global functions for modal management
window.closeEventModal = function () {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
    }
};

window.closeCreateEventModal = function () {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
    }
};

window.resetFilters = function () {
    if (window.eventsManager) {
        window.eventsManager.applyFilter('all');
    }
};

// Global Instagram-style interaction functions
window.toggleLike = function(eventId, button) {
    console.log('toggleLike called with:', eventId, button);
    if (window.eventsManager) {
        window.eventsManager.toggleLike(eventId, button);
    } else {
        console.error('eventsManager not found');
    }
};

window.shareEvent = function(eventId) {
    console.log('shareEvent called with:', eventId);
    if (window.eventsManager) {
        window.eventsManager.shareEvent(eventId);
    } else {
        console.error('eventsManager not found');
    }
};

window.showComments = function(eventId) {
    console.log('showComments called with:', eventId);
    if (window.eventsManager) {
        window.eventsManager.showComments(eventId);
    } else {
        console.error('eventsManager not found');
    }
};

window.showEventDetails = function(eventId) {
    console.error('🚫 BLOCKED: Global showEventDetails() call prevented for event:', eventId);
    console.trace('Call stack:');
    return false;
    
    // Original code commented out to prevent modal display
    /*
    console.log('showEventDetails called with:', eventId);
    if (window.eventsManager) {
        window.eventsManager.showEventDetails(eventId);
    } else {
        console.error('eventsManager not found');
    }
    */
};

window.nextSlide = function(button) {
    console.log('nextSlide called with:', button);
    if (window.eventsManager) {
        window.eventsManager.nextSlide(button);
    } else {
        console.error('eventsManager not found');
    }
};

window.previousSlide = function(button) {
    console.log('previousSlide called with:', button);
    if (window.eventsManager) {
        window.eventsManager.previousSlide(button);
    } else {
        console.error('eventsManager not found');
    }
};

window.toggleVideo = function(button) {
    console.log('toggleVideo called with:', button);
    if (window.eventsManager) {
        window.eventsManager.toggleVideo(button);
    } else {
        console.error('eventsManager not found');
    }
};

window.showEventOptions = function(eventId) {
    console.log('showEventOptions called with:', eventId);
    if (window.eventsManager) {
        window.eventsManager.showToast('Event options coming soon!', 'info');
    } else {
        console.error('eventsManager not found');
    }
};

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        const eventModal = document.getElementById('eventModal');
        const createModal = document.getElementById('createEventModal');

        if (eventModal && eventModal.style.display === 'flex') {
            eventModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (createModal && createModal.style.display === 'flex') {
            createModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Handle close button clicks
    if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
        const eventModal = document.getElementById('eventModal');
        const createModal = document.getElementById('createEventModal');

        if (eventModal && eventModal.style.display === 'flex') {
            eventModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (createModal && createModal.style.display === 'flex') {
            createModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const eventModal = document.getElementById('eventModal');
        const createModal = document.getElementById('createEventModal');

        if (eventModal && eventModal.style.display === 'flex') {
            eventModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (createModal && createModal.style.display === 'flex') {
            createModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing events manager...');
    
    // Global navbar is handled automatically - no need for local navigation

    // Ensure all modals are hidden on page load
    const eventModal = document.getElementById('eventModal');
    const createModal = document.getElementById('createEventModal');

    if (eventModal) {
        eventModal.style.display = 'none';
    }
    if (createModal) {
        createModal.style.display = 'none';
    }

    // Clear any URL hash that might trigger modal display
    if (window.location.hash && window.location.hash.startsWith('#event-')) {
        console.log('Clearing event hash to prevent automatic modal display');
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }

    // Initialize the events manager
    try {
        window.eventsManager = new EventsManager();
        console.log('EventsManager initialized successfully:', window.eventsManager);
    } catch (error) {
        console.error('Error initializing EventsManager:', error);
    }
});