/**
 * Ideas Page - Main functionality for the ideas hub
 * Uses real API data from /api/v1/ideas
 */

class IdeasPage {
    constructor() {
        this.currentTab = 'browse';
        this.currentFilters = {
            category: 'all',
            search: '',
            sort: 'newest'
        };
        this.currentPage = 1;
        this.pageSize = 12;
        this.isLoading = false;
        this.hasMore = true;
        this.allIdeas = [];
        this.categories = [];
        this.expandedComments = new Set(); // Track which idea cards have expanded comments
        
        // Memory management and cleanup
        this.searchTimeout = null;
        this.searchController = null;
        this.loadController = null;
        this.eventHandlers = new Map();
        
        // PERFORMANCE IMPROVEMENT 1: Client-side caching
        this.cache = {
            categories: null,
            categoriesTimestamp: 0,
            stats: null,
            statsTimestamp: 0,
            ideas: new Map(),
            cacheDuration: 5 * 60 * 1000 // 5 minutes
        };
        
        // PERFORMANCE IMPROVEMENT 2: Request deduplication
        this.pendingRequests = new Map();
        
        // PERFORMANCE IMPROVEMENT 3: Batch updates
        this.updateScheduled = false;
        this.pendingStats = null;

        this.init();
    }
    
    /**
     * Validate idea ID format
     * @param {string|number} ideaId - The ID to validate
     * @returns {string} - Validated ID as string
     */
    validateIdeaId(ideaId) {
        if (!ideaId) {
            throw new Error('Idea ID is required');
        }
        
        if (typeof ideaId !== 'string' && typeof ideaId !== 'number') {
            throw new Error('Invalid idea ID format');
        }
        
        const idStr = String(ideaId);
        
        // Check for UUID format or numeric ID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const numericRegex = /^\d+$/;
        
        if (!uuidRegex.test(idStr) && !numericRegex.test(idStr)) {
            throw new Error('Invalid idea ID format');
        }
        
        return idStr;
    }
    
    /**
     * PERFORMANCE IMPROVEMENT 4: Generate cache key for ideas
     */
    getIdeasCacheKey() {
        return `${this.currentFilters.category}-${this.currentFilters.search}-${this.currentFilters.sort}-${this.currentPage}`;
    }
    
    /**
     * PERFORMANCE IMPROVEMENT 5: Check if cache is valid
     */
    isCacheValid(timestamp) {
        return timestamp && (Date.now() - timestamp) < this.cache.cacheDuration;
    }
    
    /**
     * PERFORMANCE IMPROVEMENT 6: Fetch with timeout and abort support
     */
    async fetchWithTimeout(url, options = {}, timeout = 8000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
        }
    }
    
    /**
     * PERFORMANCE IMPROVEMENT 7: Deduplicate in-flight requests
     */
    async fetchWithDedupe(url, options = {}, requestKey) {
        // If there's already a pending request with the same key, return its promise
        if (this.pendingRequests.has(requestKey)) {
            console.log('Reusing pending request for:', requestKey);
            return this.pendingRequests.get(requestKey);
        }
        
        // Create new request promise
        const requestPromise = this.fetchWithTimeout(url, options).finally(() => {
            // Clean up after request completes
            this.pendingRequests.delete(requestKey);
        });
        
        // Store the promise
        this.pendingRequests.set(requestKey, requestPromise);
        
        return requestPromise;
    }
    
    /**
     * Cleanup method - prevents memory leaks
     */
    destroy() {
        console.log('Cleaning up Ideas Page...');
        
        // Clear timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Abort in-flight requests
        if (this.searchController) {
            this.searchController.abort();
        }
        if (this.loadController) {
            this.loadController.abort();
        }
        
        // Cancel all pending requests
        this.pendingRequests.clear();
        
        // Remove event listeners
        this.eventHandlers.forEach((handler, element) => {
            const [eventType, fn] = handler;
            element.removeEventListener(eventType, fn);
        });
        this.eventHandlers.clear();
        
        console.log('Ideas Page cleaned up');
    }

    async init() {
        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupPage());
            } else {
                this.setupPage();
            }
        } catch (error) {
            console.error('Failed to initialize ideas page:', error);
        }
    }

    async setupPage() {
        try {
            console.log('Setting up Ideas Page...');

            // Setup event listeners first (synchronous)
            this.setupEventListeners();
            
            // Check URL hash for direct tab navigation
            const hash = window.location.hash.substring(1); // Remove the #
            if (hash && ['browse', 'submit', 'trending'].includes(hash)) {
                this.switchTab(hash);
            }

            // PERFORMANCE IMPROVEMENT 8: Parallel loading
            const startTime = performance.now();
            
            const [categoriesResult, statsResult, ideasResult] = await Promise.allSettled([
                this.loadCategories(),
                this.loadStats(),
                this.loadIdeas()
            ]);

            const loadTime = performance.now() - startTime;
            console.log(`Parallel loading completed in ${loadTime.toFixed(2)}ms`);

            // Check for failures
            const failures = [];
            if (categoriesResult.status === 'rejected') failures.push('categories');
            if (statsResult.status === 'rejected') failures.push('stats');
            if (ideasResult.status === 'rejected') failures.push('ideas');

            if (failures.length > 0) {
                console.warn('Some data failed to load:', failures);
            }

            // Hide loading state
            this.hideLoadingState();

            console.log('Ideas Page setup complete');

        } catch (error) {
            console.error('Failed to setup page:', error);
            this.showError('Failed to load ideas. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Category filters
        document.querySelectorAll('[data-category]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.loadIdeas();
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const searchHandler = (e) => {
                clearTimeout(this.searchTimeout);
                
                // Cancel previous search request
                if (this.searchController) {
                    this.searchController.abort();
                }
                
                this.searchTimeout = setTimeout(() => {
                    this.searchController = new AbortController();
                    this.currentFilters.search = e.target.value;
                    this.currentPage = 1; // Reset pagination on search
                    this.loadIdeas({ signal: this.searchController.signal });
                }, 500);
            };
            
            searchInput.addEventListener('input', searchHandler);
            this.eventHandlers.set(searchInput, ['input', searchHandler]);
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            const loadMoreHandler = () => this.loadMore();
            loadMoreBtn.addEventListener('click', loadMoreHandler);
            this.eventHandlers.set(loadMoreBtn, ['click', loadMoreHandler]);
        }

        // Idea actions (like, comment, etc.) - Event delegation
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            const actionType = action.dataset.action;
            const ideaId = action.dataset.ideaId;
            const commentId = action.dataset.commentId;

            switch (actionType) {
                case 'like-idea':
                    this.likeIdea(ideaId);
                    break;
                case 'toggle-comments':
                    this.toggleComments(ideaId);
                    break;
                case 'post-comment':
                    this.postInlineComment(ideaId);
                    break;
                case 'like-comment':
                    this.toggleCommentLike(commentId, action);
                    break;
                case 'reply-comment':
                    this.replyToInlineComment(commentId, action.dataset.commentUser);
                    break;
            }
        });
        
        // Handle Enter key in comment inputs
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('comment-input') && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const ideaId = e.target.dataset.ideaId;
                if (ideaId) {
                    this.postInlineComment(ideaId);
                }
            }
        });
        
        // Submit idea form
        const submitIdeaForm = document.getElementById('inlineSubmitForm');
        if (submitIdeaForm) {
            const submitHandler = (e) => {
                e.preventDefault();
                this.submitIdea(e.target);
            };
            submitIdeaForm.addEventListener('submit', submitHandler);
            this.eventHandlers.set(submitIdeaForm, ['submit', submitHandler]);
        }
    }

    async loadCategories() {
        try {
            console.log('Loading categories...');
            
            // PERFORMANCE IMPROVEMENT 9: Check cache first
            if (this.isCacheValid(this.cache.categoriesTimestamp)) {
                console.log('Using cached categories');
                this.categories = this.cache.categories;
                this.renderCategoryFilters(this.categories);
                this.populateCategorySelect(this.categories);
                return;
            }

            const response = await this.fetchWithTimeout('/api/v1/ideas/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');

            const data = await response.json();
            this.categories = data.categories || [];

            // Update cache
            this.cache.categories = this.categories;
            this.cache.categoriesTimestamp = Date.now();

            console.log('Categories loaded:', this.categories.length);
            this.renderCategoryFilters(this.categories);
            this.populateCategorySelect(this.categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategoryFilters(categories) {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        const html = `
            <button class="filter-chip active" data-category="all">
                <i class="fas fa-th"></i>
                <span>All Ideas</span>
            </button>
            ${categories.map(cat => `
                <button class="filter-chip" data-category="${cat.id}">
                    <i class="fas ${cat.icon || 'fa-lightbulb'}"></i>
                    <span>${this.escapeHtml(cat.name)}</span>
                </button>
            `).join('')}
        `;

        container.innerHTML = html;
    }

    populateCategorySelect(categories) {
        const select = document.getElementById('inlineIdeaCategory');
        if (!select) return;

        const html = `
            <option value="">Select Category</option>
            ${categories.map(cat => `
                <option value="${cat.name}" style="background: #1f2937; color: white;">${this.escapeHtml(cat.name)}</option>
            `).join('')}
        `;

        select.innerHTML = html;
    }

    async loadStats() {
        try {
            console.log('Loading stats...');
            
            // PERFORMANCE IMPROVEMENT 10: Check cache first
            if (this.isCacheValid(this.cache.statsTimestamp)) {
                console.log('Using cached stats');
                this.renderStats(this.cache.stats);
                return;
            }

            const response = await this.fetchWithTimeout('/api/v1/ideas/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');

            const stats = await response.json();

            // Update cache
            this.cache.stats = stats;
            this.cache.statsTimestamp = Date.now();

            console.log('Stats loaded:', stats);
            this.renderStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
            // Show default stats
            this.renderStats({
                totalIdeas: 0,
                totalVotes: 0,
                totalComments: 0,
                activeCollaborators: 0
            });
        }
    }

    renderStats(stats) {
        console.log('Rendering stats:', stats);
        
        // PERFORMANCE IMPROVEMENT 11: Batch DOM updates
        if (this.updateScheduled) {
            this.pendingStats = stats;
            return;
        }
        
        this.updateScheduled = true;
        this.pendingStats = stats;
        
        requestAnimationFrame(() => {
            const currentStats = this.pendingStats || stats;
            
            const totalIdeasEl = document.getElementById('totalIdeasCount');
            const activeIdeasEl = document.getElementById('activeIdeasCount');
            const collaborationsEl = document.getElementById('collaborationsCount');
            const implementedEl = document.getElementById('implementedCount');

            if (totalIdeasEl) {
                totalIdeasEl.textContent = currentStats.totalIdeas || 0;
            }
            
            if (activeIdeasEl) {
                activeIdeasEl.textContent = currentStats.totalIdeas || 0;
            }
            
            if (collaborationsEl) {
                collaborationsEl.textContent = currentStats.activeCollaborators || 0;
            }
            
            if (implementedEl) {
                implementedEl.textContent = 0;
            }
            
            this.updateScheduled = false;
            this.pendingStats = null;
        });
    }

    async loadIdeas(options = {}) {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            console.log('Loading ideas...');
            const startTime = Date.now();

            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageSize,
                sort: this.currentFilters.sort
            });

            if (this.currentFilters.category && this.currentFilters.category !== 'all') {
                params.append('category', this.currentFilters.category);
            }

            if (this.currentFilters.search) {
                params.append('search', this.currentFilters.search);
            }

            console.log('Fetching ideas with params:', params.toString());
            
            // PERFORMANCE IMPROVEMENT 12: Check cache
            const cacheKey = this.getIdeasCacheKey();
            if (!options.forceRefresh && this.cache.ideas.has(cacheKey)) {
                const cached = this.cache.ideas.get(cacheKey);
                if (this.isCacheValid(cached.timestamp)) {
                    console.log('Using cached ideas for:', cacheKey);
                    this.allIdeas = cached.data;
                    this.hasMore = cached.hasMore;
                    this.renderIdeas(this.allIdeas);
                    this.updateLoadMoreButton();
                    this.isLoading = false;
                    this.hideLoadingState();
                    return;
                }
            }

            // Use provided signal or create new controller
            const signal = options.signal || (this.loadController = new AbortController()).signal;
            
            // PERFORMANCE IMPROVEMENT 13: Use fetch with timeout
            const response = await this.fetchWithTimeout(
                `/api/v1/ideas?${params}`, 
                { signal },
                8000 // Shorter timeout
            );

            const loadTime = Date.now() - startTime;
            console.log(`Ideas fetch took ${loadTime}ms`);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please log in to view ideas');
                } else if (response.status === 429) {
                    throw new Error('Too many requests. Please try again later');
                }
                throw new Error('Failed to fetch ideas');
            }

            const data = await response.json();
            const ideas = data.ideas || [];

            console.log('Ideas loaded:', ideas.length, `in ${loadTime}ms`);

            // Transform API data to match expected format
            this.allIdeas = ideas.map(idea => ({
                id: idea.id,
                title: idea.title,
                description: idea.description,
                author: {
                    name: idea.users?.name || 'Anonymous',
                    avatar: idea.users?.profile_picture || '/assets/images/default-avatar.png'
                },
                category: idea.idea_categories?.name || 'Uncategorized',
                tags: idea.tags || [],
                votes: idea.votes_count || 0,
                comments: idea.comments_count || 0,
                views: idea.views_count || 0,
                createdAt: idea.created_at,
                created_at: idea.created_at
            }));

            // PERFORMANCE IMPROVEMENT 14: Cache the results
            this.cache.ideas.set(cacheKey, {
                data: this.allIdeas,
                hasMore: ideas.length === this.pageSize,
                timestamp: Date.now()
            });

            this.renderIdeas(this.allIdeas);
            this.hasMore = ideas.length === this.pageSize;
            this.updateLoadMoreButton();

        } catch (error) {
            // Handle abort gracefully
            if (error.name === 'AbortError') {
                console.log('Request was cancelled');
                return;
            }
            
            console.error('Error loading ideas:', error);
            
            // More specific error messages
            let message = 'Failed to load ideas';
            if (error.message.includes('log in')) {
                message = error.message;
                setTimeout(() => window.location.href = '/pages/auth/signin.html', 2000);
            } else if (error.message.includes('Too many requests')) {
                message = error.message;
            } else if (error.message.includes('Failed to fetch') || error.message.includes('timeout')) {
                message = 'Network error. Please check your internet connection';
            }
            
            this.showError(message);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    renderIdeas(ideas) {
        const container = document.getElementById('ideasGrid');
        console.log('renderIdeas called with', ideas.length, 'ideas');
        
        if (!container) {
            console.error('ideasGrid container not found!');
            return;
        }

        if (ideas.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-lightbulb" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem;"></i>
                    <p style="color: rgba(255, 255, 255, 0.6);">No ideas found. Be the first to share your innovation!</p>
                </div>
            `;
            return;
        }

        // PERFORMANCE IMPROVEMENT 15: Use DocumentFragment for batch DOM updates
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        
        ideas.forEach(idea => {
            const html = this.createIdeaCard(idea);
            tempDiv.innerHTML = html;
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
        });

        // Clear container once and append all at once
        container.innerHTML = '';
        container.appendChild(fragment);
        
        console.log('Ideas rendered successfully');
    }

    createIdeaCard(idea) {
        const timeAgo = this.getTimeAgo(new Date(idea.createdAt || idea.created_at));
        const ideaId = idea.id;
        const commentsExpanded = this.expandedComments?.has(ideaId) || false;
        const comments = idea.commentsData || [];
        
        // Get category color
        const categoryColor = this.getCategoryColor(idea.category);
        const cardGradient = this.getCardGradient(idea.category);

        return `
            <div class="idea-card" data-idea-id="${ideaId}" style="--card-gradient: ${cardGradient};">
                <div class="idea-header">
                    <div style="flex: 1;">
                        <h3 class="idea-title">${this.escapeHtml(idea.title)}</h3>
                        <div class="idea-meta">
                            <span><i class="fas fa-user"></i> ${this.escapeHtml(idea.author.name)}</span>
                            <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                            <span class="idea-category" style="background: ${categoryColor.bg}; color: ${categoryColor.text}; border-color: ${categoryColor.border};">
                                ${this.escapeHtml(idea.category)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <p class="idea-description">${this.escapeHtml(idea.description)}</p>
                
                ${idea.tags && idea.tags.length > 0 ? `
                    <div class="idea-tags">
                        ${idea.tags.slice(0, 3).map((tag, index) => {
                            const tagColor = this.getTagColor(index);
                            return `<span class="idea-tag" style="background: ${tagColor.bg}; color: ${tagColor.text}; border-color: ${tagColor.border};">${this.escapeHtml(tag)}</span>`;
                        }).join('')}
                        ${idea.tags.length > 3 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">+${idea.tags.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="idea-stats">
                    <div class="idea-stat">
                        <i class="fas fa-thumbs-up" style="color: #10b981;"></i>
                        <span>${idea.votes || 0} likes</span>
                    </div>
                    <div class="idea-stat">
                        <i class="fas fa-comments" style="color: #3b82f6;"></i>
                        <span class="comment-count">${comments.length || 0} comments</span>
                    </div>
                </div>
                
                <div class="idea-actions">
                    <button class="btn btn-primary btn-sm" data-action="like-idea" data-idea-id="${ideaId}">
                        <i class="fas fa-thumbs-up"></i>Like Idea
                    </button>
                    <button class="btn btn-outline btn-sm" data-action="toggle-comments" data-idea-id="${ideaId}">
                        <i class="fas fa-comments"></i>${commentsExpanded ? 'Hide' : 'Show'} Comments
                    </button>
                </div>
                
                <!-- Inline Comments Section (Events-style) -->
                <div class="comments-section ${commentsExpanded ? 'expanded' : ''}" id="comments-${ideaId}">
                    ${this.renderInlineComments(idea, comments, commentsExpanded)}
                </div>
            </div>
        `;
    }

    getCardGradient(category) {
        const gradients = {
            'Technology': 'linear-gradient(135deg, #3b82f6, #2563eb)',
            'Healthcare': 'linear-gradient(135deg, #ef4444, #dc2626)',
            'Education': 'linear-gradient(135deg, #a855f7, #9333ea)',
            'Environment': 'linear-gradient(135deg, #10b981, #059669)',
            'Business': 'linear-gradient(135deg, #f59e0b, #d97706)',
            'Social Impact': 'linear-gradient(135deg, #ec4899, #db2777)',
            'AI/ML': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            'IoT': 'linear-gradient(135deg, #06b6d4, #0891b2)',
            'Mobile App': 'linear-gradient(135deg, #6366f1, #4f46e5)',
            'Web Platform': 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            'E-commerce': 'linear-gradient(135deg, #fb923c, #f97316)'
        };
        
        return gradients[category] || 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    }

    getCategoryColor(category) {
        const colors = {
            'Technology': { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
            'Healthcare': { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
            'Education': { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
            'Environment': { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
            'Business': { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
            'Social Impact': { bg: 'rgba(236, 72, 153, 0.2)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
            'AI/ML': { bg: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
            'IoT': { bg: 'rgba(6, 182, 212, 0.2)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
            'Mobile App': { bg: 'rgba(99, 102, 241, 0.2)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
            'Web Platform': { bg: 'rgba(14, 165, 233, 0.2)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' },
            'E-commerce': { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' }
        };
        
        return colors[category] || { bg: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
    }

    getTagColor(index) {
        const colors = [
            { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)' },      // Blue
            { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.25)' },      // Green
            { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.25)' },      // Orange
            { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.25)' },      // Pink
            { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.25)' },      // Purple
            { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.25)' }         // Red
        ];
        
        return colors[index % colors.length];
    }

    renderInlineComments(idea, comments, isExpanded) {
        const ideaId = idea.id;
        
        if (!isExpanded) {
            // Show preview of first 2 comments
            const previewComments = comments.slice(0, 2);
            if (previewComments.length === 0) return '';
            
            return `
                <div class="comments-preview">
                    ${previewComments.map(comment => this.renderInlineComment(comment, true)).join('')}
                    ${comments.length > 2 ? `
                        <button class="view-all-comments" data-action="toggle-comments" data-idea-id="${ideaId}">
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
                    ${comments.length > 0 ? comments.map(comment => this.renderInlineComment(comment, false)).join('') : '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 1rem;">No comments yet. Be the first to comment!</p>'}
                </div>
                
                <!-- Comment Input -->
                <div class="comment-input-section">
                    <div class="comment-input-container">
                        <div class="comment-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <input type="text" 
                               class="comment-input" 
                               placeholder="Add a comment..." 
                               data-idea-id="${ideaId}">
                        <button class="post-comment-btn" 
                                data-action="post-comment" 
                                data-idea-id="${ideaId}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderInlineComment(comment, isPreview = false) {
        const commentId = comment.id;
        const userName = comment.user?.name || 'Anonymous';
        const userInitial = userName.charAt(0).toUpperCase();
        const timeAgo = this.getTimeAgo(new Date(comment.created_at));
        const isReply = comment.parent_comment_id != null;
        const likesCount = comment.likes_count || 0;
        const isLiked = comment.isLiked || false;
        
        return `
            <div class="comment-item ${isPreview ? 'preview' : ''} ${isReply ? 'reply' : ''}" data-comment-id="${commentId}">
                <div class="comment-avatar">${userInitial}</div>
                <div class="comment-content">
                    <div class="comment-text">
                        <strong class="comment-user">${this.escapeHtml(userName)}</strong>
                        <span class="comment-message">${this.escapeHtml(comment.content)}</span>
                    </div>
                    
                    ${!isPreview ? `
                        <div class="comment-actions">
                            <span class="comment-time">${timeAgo}</span>
                            <button class="comment-like-btn ${isLiked ? 'liked' : ''}" 
                                    data-action="like-comment" 
                                    data-comment-id="${commentId}"
                                    title="${isLiked ? 'Unlike' : 'Like'} this comment">
                                <i class="fas fa-heart"></i>
                                ${likesCount > 0 ? `<span class="like-count">${likesCount}</span>` : ''}
                            </button>
                            ${!isReply ? `
                                <button class="comment-action" 
                                        data-action="reply-comment" 
                                        data-comment-id="${commentId}"
                                        data-comment-user="${this.escapeHtml(userName)}">
                                    Reply
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    switchTab(tabName) {
        if (tabName === 'submit') {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                if (confirm('Please log in to submit an idea. Do you want to log in now?')) {
                    window.location.href = '/pages/auth/signin.html';
                }
                return;
            }
        }

        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content - use display style instead of class
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === `${tabName}Tab`) {
                content.style.display = 'block';
                content.classList.add('active');
            } else {
                content.style.display = 'none';
                content.classList.remove('active');
            }
        });

        // Load data for the tab
        if (tabName === 'browse') {
            this.loadIdeas();
        }
    }

    filterByCategory(category) {
        this.currentFilters.category = category;
        this.currentPage = 1;

        // Update active filter button
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.loadIdeas();
    }

    async loadMore() {
        this.currentPage++;
        await this.loadIdeas();
    }

    updateLoadMoreButton() {
        const btn = document.getElementById('loadMoreBtn');
        if (!btn) return;

        if (this.hasMore) {
            btn.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Load More Ideas';
        } else {
            btn.style.display = 'none';
        }
    }

    async likeIdea(ideaId) {
        try {
            // Validate idea ID
            const validatedId = this.validateIdeaId(ideaId);
            
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                alert('Please log in to like ideas');
                window.location.href = '/pages/auth/signin.html';
                return;
            }
            
            console.log('Attempting to like idea:', {
                ideaId: validatedId,
                hasToken: !!token
            });
            
            const response = await fetch(`/api/v1/ideas/${validatedId}/vote`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ voteType: 'like' })
            });

            console.log('Vote response:', {
                status: response.status,
                ok: response.ok
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Vote failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: error,
                    errorMessage: error.message,
                    fullError: JSON.stringify(error, null, 2)
                });
                
                // Handle token expiration
                if (response.status === 401 && error.message && (error.message.includes('expired') || error.message.includes('Token expired'))) {
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    window.location.href = '/pages/auth/signin.html';
                    return;
                }
                
                throw new Error(error.message || error.error || 'Failed to like idea');
            }

            const result = await response.json();
            console.log('Vote successful:', result);
            
            // IMMEDIATE UI UPDATE: Use actual count from server
            const ideaCard = document.querySelector(`[data-idea-id="${validatedId}"]`);
            if (ideaCard) {
                const voteCountSpan = ideaCard.querySelector('.idea-stat span');
                if (voteCountSpan && result.votes) {
                    // Get current count for logging
                    const currentText = voteCountSpan.textContent;
                    const currentCount = parseInt(currentText.match(/\d+/)?.[0] || '0');
                    
                    // Use the actual count from server
                    const newCount = result.votes.likes || result.votes.total || 0;
                    
                    // Update the display
                    voteCountSpan.textContent = `${newCount} likes`;
                    console.log(`Updated vote count: ${currentCount} → ${newCount} (from server)`);
                    
                    // Add visual feedback
                    ideaCard.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        ideaCard.style.transform = 'scale(1)';
                    }, 150);
                }
            }
            
            // PERFORMANCE IMPROVEMENT 16: Invalidate cache on data change
            this.cache.ideas.clear();
            this.cache.statsTimestamp = 0; // Force stats refresh
            
            // Update stats in background without reloading ideas
            setTimeout(() => {
                this.loadStats();
            }, 500);
            
        } catch (error) {
            console.error('Error liking idea:', {
                errorType: error.constructor.name,
                errorMessage: error.message,
                errorStack: error.stack,
                fullError: error
            });
            
            // More specific error messages
            let message = 'Failed to like idea. Please try again.';
            if (error.message && error.message.includes('Invalid idea ID')) {
                message = 'Invalid idea. Please refresh the page.';
            } else if (error.message && error.message.includes('log in')) {
                message = error.message;
            } else if (error.message && error.message.includes('expired')) {
                // Already handled above, don't show duplicate alert
                return;
            } else if (error.message) {
                message = error.message;
            }
            
            alert(message);
        }
    }

    showComments(ideaId) {
        try {
            // Validate idea ID
            const validatedId = this.validateIdeaId(ideaId);
            
            console.log('Show comments for idea:', validatedId);
            
            // Find the idea
            const idea = this.allIdeas.find(i => i.id === validatedId);
            if (!idea) {
                alert('Idea not found');
                return;
            }

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal-backdrop';
            modal.style.display = 'flex'; // Make visible
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'comments-modal-title');
            
            modal.innerHTML = `
                <div class="modal-content-premium" style="max-width: 700px; animation: slideUpFade 0.3s ease-out;">
                    <button class="modal-close-btn" data-action="close-modal" aria-label="Close modal" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255, 255, 255, 0.1); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; z-index: 10;">×</button>
                    
                    <div class="modal-inner-padding" style="padding: 2rem;">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                            <h2 id="comments-modal-title" style="color: white; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">${this.escapeHtml(idea.title)}</h2>
                            <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin: 0;">
                                <i class="fas fa-comments" style="margin-right: 0.5rem;"></i>
                                <span id="modalCommentsCount">${idea.comments || 0}</span> comments
                            </p>
                        </div>
                        
                        <!-- Comments Container -->
                        <div id="commentsContainer" style="max-height: 400px; overflow-y: auto; margin-bottom: 2rem; padding-right: 0.5rem;">
                            <div style="text-align: center; padding: 3rem 2rem; color: rgba(255, 255, 255, 0.6);">
                                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem; color: #8b5cf6;"></i>
                                <p style="margin: 0;">Loading comments...</p>
                            </div>
                        </div>
                        
                        <!-- Comment Input -->
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <textarea 
                                id="commentInput" 
                                placeholder="Share your thoughts..." 
                                aria-label="Comment text"
                                style="width: 100%; min-height: 80px; padding: 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-family: inherit; font-size: 0.875rem; resize: vertical; transition: all 0.3s ease;"
                                onfocus="this.style.borderColor='rgba(139, 92, 246, 0.5)'; this.style.background='rgba(255, 255, 255, 0.15)';"
                                onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.background='rgba(255, 255, 255, 0.1)';"
                            ></textarea>
                            <div style="display: flex; gap: 0.75rem; margin-top: 1rem; align-items: center;">
                                <button 
                                    class="modal-action-btn modal-btn-primary" 
                                    data-action="submit-comment"
                                    data-idea-id="${validatedId}"
                                    style="flex: 1; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(139, 92, 246, 0.4)';"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(139, 92, 246, 0.3)';"
                                >
                                    <i class="fas fa-paper-plane"></i> Post Comment
                                </button>
                                <button 
                                    class="modal-action-btn modal-btn-secondary" 
                                    data-action="close-modal"
                                    style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;"
                                    onmouseover="this.style.background='rgba(255, 255, 255, 0.2)';"
                                    onmouseout="this.style.background='rgba(255, 255, 255, 0.1)';"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners
            const closeButtons = modal.querySelectorAll('[data-action="close-modal"]');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.remove();
                    document.body.style.overflow = 'auto';
                });
            });
            
            const submitBtn = modal.querySelector('[data-action="submit-comment"]');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    this.submitComment(validatedId);
                });
            }
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    document.body.style.overflow = 'auto';
                }
            });
            
            // Close on Escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.body.style.overflow = 'auto';
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            // Trap Focus within Modal
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (focusableElements.length === 0) return;
                    
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
            
            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
            
            // Load comments
            this.loadComments(validatedId);
            
        } catch (error) {
            console.error('Error showing comments:', error);
            alert(error.message || 'Failed to show comments');
        }
    }

    async loadComments(ideaId) {
        try {
            const response = await this.fetchWithTimeout(`/api/v1/ideas/${ideaId}/comments`);
            
            if (!response.ok) {
                const error = await response.json();
                console.error('Failed to load comments:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: error,
                    errorMessage: error.message,
                    fullError: JSON.stringify(error, null, 2)
                });
                throw new Error(error.message || error.error || 'Failed to load comments');
            }
            
            const data = await response.json();
            const comments = data.comments || [];
            
            const container = document.getElementById('commentsContainer');
            if (!container) return;
            
            if (comments.length === 0) {
                container.innerHTML = `
                    <div class="no-comments-empty">
                        <i class="fas fa-comments"></i>
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">No comments yet</p>
                        <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.875rem; margin: 0;">Be the first to share your thoughts!</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = comments.map(comment => `
                <div class="comment-item" data-comment-id="${comment.id}" style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(139, 92, 246, 0.3)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='rgba(255, 255, 255, 0.1)';">
                    <div style="display: flex; align-items: flex-start; gap: 1rem;">
                        <!-- Avatar -->
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #7c3aed); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                            <i class="fas fa-user" style="color: white; font-size: 1rem;"></i>
                        </div>
                        
                        <!-- Comment Content -->
                        <div style="flex: 1; min-width: 0;">
                            <!-- User Info -->
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                                <span style="color: white; font-weight: 700; font-size: 0.875rem;">${this.escapeHtml(comment.user?.name || 'Anonymous')}</span>
                                <span style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">
                                    <i class="fas fa-clock" style="margin-right: 0.25rem;"></i>
                                    ${this.getTimeAgo(new Date(comment.created_at))}
                                </span>
                            </div>
                            
                            <!-- Comment Text -->
                            <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 0.875rem; word-wrap: break-word; margin-bottom: 0.75rem;">
                                ${this.escapeHtml(comment.content)}
                            </div>
                            
                            <!-- Comment Actions -->
                            <div style="display: flex; gap: 1.5rem; align-items: center;">
                                <button 
                                    class="like-comment-btn" 
                                    data-comment-id="${comment.id}"
                                    style="background: none; border: none; color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; transition: color 0.3s ease; padding: 0.25rem 0.5rem; border-radius: 8px;" 
                                    onmouseover="this.style.color='#8b5cf6'; this.style.background='rgba(139, 92, 246, 0.1)';" 
                                    onmouseout="this.style.color='rgba(255, 255, 255, 0.5)'; this.style.background='transparent';"
                                >
                                    <i class="fas fa-heart"></i>
                                    <span class="like-count">${comment.likes_count || 0}</span>
                                </button>
                                <button 
                                    class="reply-comment-btn" 
                                    data-comment-id="${comment.id}"
                                    data-comment-author="${this.escapeHtml(comment.user?.name || 'Anonymous')}"
                                    style="background: none; border: none; color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; transition: color 0.3s ease; padding: 0.25rem 0.5rem; border-radius: 8px;" 
                                    onmouseover="this.style.color='#8b5cf6'; this.style.background='rgba(139, 92, 246, 0.1)';" 
                                    onmouseout="this.style.color='rgba(255, 255, 255, 0.5)'; this.style.background='transparent';"
                                >
                                    <i class="fas fa-reply"></i>
                                    <span>Reply</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners for like and reply buttons
            container.querySelectorAll('.like-comment-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const commentId = btn.dataset.commentId;
                    this.likeComment(ideaId, commentId, btn);
                });
            });
            
            container.querySelectorAll('.reply-comment-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const commentId = btn.dataset.commentId;
                    const authorName = btn.dataset.commentAuthor;
                    this.replyToComment(ideaId, commentId, authorName);
                });
            });
            
        } catch (error) {
            console.error('Error loading comments:', error);
            const container = document.getElementById('commentsContainer');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem 2rem; background: rgba(239, 68, 68, 0.05); border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.2);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; margin-bottom: 1rem; color: #ef4444;"></i>
                        <p style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">Failed to load comments</p>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin: 0;">Please try again later</p>
                    </div>
                `;
            }
        }
    }

    async submitComment(ideaId) {
        const input = document.getElementById('commentInput');
        if (!input) return;
        
        const content = input.value.trim();
        if (!content) {
            alert('Please enter a comment');
            return;
        }
        
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                alert('Please log in to comment');
                window.location.href = '/pages/auth/signin.html';
                return;
            }
            
            // Check if this is a reply
            const isReply = input.dataset.replyTo;
            const parentCommentId = input.dataset.replyTo;
            
            let url = `/api/v1/ideas/${ideaId}/comments`;
            if (isReply) {
                url = `/api/v1/ideas/${ideaId}/comments/${parentCommentId}/reply`;
            }
            
            console.log('Posting comment:', { ideaId, isReply, parentCommentId, url });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            
            console.log('Comment response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Comment failed - Response:', errorText);
                
                let error;
                try {
                    error = JSON.parse(errorText);
                } catch (e) {
                    error = { message: errorText };
                }
                
                console.error('Comment failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: error,
                    errorMessage: error.message,
                    fullError: JSON.stringify(error, null, 2)
                });
                
                // Handle token expiration
                if (response.status === 401 && error.message && (error.message.includes('expired') || error.message.includes('Token expired'))) {
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    window.location.href = '/pages/auth/signin.html';
                    return;
                }
                
                throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Clear input and reply state
            input.value = '';
            input.placeholder = 'Share your thoughts...';
            delete input.dataset.replyTo;
            delete input.dataset.replyAuthor;
            
            // Remove reply indicator if exists
            const indicator = document.getElementById('replyIndicator');
            if (indicator) {
                indicator.remove();
            }
            
            // Reload comments
            await this.loadComments(ideaId);
            
            // PERFORMANCE IMPROVEMENT 17: Invalidate cache
            this.cache.ideas.clear();
            
            // Update comment count on the card without reloading
            const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
            if (ideaCard) {
                const commentCountSpan = ideaCard.querySelectorAll('.idea-stat span')[1]; // Second stat is comments
                if (commentCountSpan) {
                    const currentText = commentCountSpan.textContent;
                    const currentCount = parseInt(currentText.match(/\d+/)?.[0] || '0');
                    const newCount = currentCount + 1;
                    commentCountSpan.textContent = `${newCount} comments`;
                    console.log(`Updated comment count: ${currentCount} → ${newCount}`);
                }
            }
            
            // Update modal header count
            const modalCountSpan = document.getElementById('modalCommentsCount');
            if (modalCountSpan) {
                const currentModalCount = parseInt(modalCountSpan.textContent || '0');
                modalCountSpan.textContent = currentModalCount + 1;
            }
            
            // Update stats in background
            setTimeout(() => {
                this.loadStats();
            }, 500);
            
        } catch (error) {
            console.error('Error posting comment:', {
                errorType: error.constructor.name,
                errorMessage: error.message,
                errorStack: error.stack,
                fullError: error
            });
            
            if (error.message && error.message.includes('expired')) {
                // Already handled above
                return;
            }
            
            alert(error.message || 'Failed to post comment. Please try again.');
        }
    }

    showLoadingState() {
        const container = document.getElementById('ideasGrid');
        if (!container) return;

        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: rgba(255, 255, 255, 0.5);"></i>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 1rem;">Loading ideas...</p>
            </div>
        `;
    }

    hideLoadingState() {
        // Loading state is replaced by actual content
    }

    showError(message) {
        const container = document.getElementById('ideasGrid');
        if (!container) return;

        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="color: rgba(255, 255, 255, 0.8);">${message}</p>
            </div>
        `;
    }

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

        return 'just now';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async toggleComments(ideaId) {
        const isExpanded = this.expandedComments.has(ideaId);
        
        if (isExpanded) {
            this.expandedComments.delete(ideaId);
        } else {
            this.expandedComments.add(ideaId);
            // Load comments when expanding
            await this.loadCommentsForIdea(ideaId);
        }

        // Re-render just the idea card
        const idea = this.allIdeas.find(i => i.id === ideaId);
        if (idea) {
            const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
            if (ideaCard) {
                ideaCard.outerHTML = this.createIdeaCard(idea);
                
                // Focus on comment input if expanding
                if (!isExpanded) {
                    setTimeout(() => {
                        const input = document.querySelector(`#comments-${ideaId} .comment-input`);
                        if (input) input.focus();
                    }, 100);
                }
            }
        }
    }

    async loadCommentsForIdea(ideaId) {
        try {
            const response = await this.fetchWithTimeout(`/api/v1/ideas/${ideaId}/comments`);
            
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            
            const data = await response.json();
            const comments = data.comments || [];
            
            // Store comments in the idea object
            const idea = this.allIdeas.find(i => i.id === ideaId);
            if (idea) {
                idea.commentsData = comments;
            }
            
            return comments;
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    }

    async postInlineComment(ideaId) {
        const input = document.querySelector(`#comments-${ideaId} .comment-input`);
        if (!input) return;

        const content = input.value.trim();
        if (!content) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                alert('Please log in to comment');
                window.location.href = '/pages/auth/signin.html';
                return;
            }

            // Check if this is a reply (starts with @username)
            const replyMatch = content.match(/^@(\w+)\s+/);
            const isReply = replyMatch !== null;
            
            let url = `/api/v1/ideas/${ideaId}/comments`;
            let body = { content };
            
            if (isReply) {
                // Find the comment being replied to
                const idea = this.allIdeas.find(i => i.id === ideaId);
                if (idea && idea.commentsData) {
                    const replyToUser = replyMatch[1];
                    const parentComment = idea.commentsData.find(c => 
                        c.user?.name?.toLowerCase() === replyToUser.toLowerCase()
                    );
                    
                    if (parentComment) {
                        url = `/api/v1/ideas/${ideaId}/comments/${parentComment.id}/reply`;
                        // Remove @username from content
                        body.content = content.replace(/^@\w+\s+/, '');
                    }
                }
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                
                if (response.status === 401) {
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    window.location.href = '/pages/auth/signin.html';
                    return;
                }
                
                throw new Error(error.message || 'Failed to post comment');
            }

            // Clear input
            input.value = '';

            // Reload comments and re-render
            await this.loadCommentsForIdea(ideaId);
            const idea = this.allIdeas.find(i => i.id === ideaId);
            if (idea) {
                const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
                if (ideaCard) {
                    ideaCard.outerHTML = this.createIdeaCard(idea);
                    
                    // Keep comments expanded and refocus input
                    setTimeout(() => {
                        const newInput = document.querySelector(`#comments-${ideaId} .comment-input`);
                        if (newInput) newInput.focus();
                    }, 100);
                }
            }

            // Update comment count in stats
            const commentCountSpan = document.querySelector(`[data-idea-id="${ideaId}"] .comment-count`);
            if (commentCountSpan && idea) {
                commentCountSpan.textContent = `${idea.commentsData.length} comments`;
            }

        } catch (error) {
            console.error('Error posting comment:', error);
            alert(error.message || 'Failed to post comment');
        }
    }

    async toggleCommentLike(commentId, button) {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                alert('Please log in to like comments');
                window.location.href = '/pages/auth/signin.html';
                return;
            }

            // Find the idea and comment
            let idea = null;
            let comment = null;
            
            for (const i of this.allIdeas) {
                if (i.commentsData) {
                    comment = i.commentsData.find(c => c.id === commentId);
                    if (comment) {
                        idea = i;
                        break;
                    }
                }
            }
            
            if (!comment || !idea) return;

            const response = await fetch(`/api/v1/ideas/${idea.id}/comments/${commentId}/like`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                
                if (response.status === 401) {
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    window.location.href = '/pages/auth/signin.html';
                    return;
                }
                
                throw new Error(error.message || 'Failed to like comment');
            }

            const data = await response.json();
            
            // Update comment data
            comment.isLiked = data.liked;
            comment.likes_count = data.likes_count;
            
            // Update UI
            button.classList.toggle('liked', data.liked);
            
            // Update the count display
            const likeCountSpan = button.querySelector('.like-count');
            if (data.likes_count > 0) {
                if (likeCountSpan) {
                    likeCountSpan.textContent = data.likes_count;
                } else {
                    // Add count span if it doesn't exist
                    const icon = button.querySelector('i');
                    icon.insertAdjacentHTML('afterend', `<span class="like-count">${data.likes_count}</span>`);
                }
            } else {
                // Remove count span if likes are 0
                if (likeCountSpan) {
                    likeCountSpan.remove();
                }
            }
            
            // Add heart animation when liking
            if (data.liked) {
                const icon = button.querySelector('i');
                icon.style.animation = 'heartPulse 0.6s ease';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 600);
            }

        } catch (error) {
            console.error('Error liking comment:', error);
            alert(error.message || 'Failed to like comment');
        }
    }

    replyToInlineComment(commentId, commentUser) {
        // Find the comment input for this idea
        const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentItem) return;
        
        const ideaCard = commentItem.closest('.idea-card');
        const commentInput = ideaCard?.querySelector('.comment-input');
        
        if (commentInput) {
            commentInput.value = `@${commentUser} `;
            commentInput.focus();
            
            // Move cursor to end
            setTimeout(() => {
                commentInput.setSelectionRange(commentInput.value.length, commentInput.value.length);
            }, 10);
        }
    }

    // Remove old modal-based methods
    showComments(ideaId) {
        // Redirect to toggle comments
        this.toggleComments(ideaId);
    }

    async loadComments(ideaId) {
        // Redirect to loadCommentsForIdea
        return await this.loadCommentsForIdea(ideaId);
    }

    async submitComment(ideaId) {
        // Redirect to postInlineComment
        return await this.postInlineComment(ideaId);
    }
    
    async submitIdea(form) {
        try {
            const formData = new FormData(form);
            const ideaData = {
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                tags: formData.get('tags')?.split(',').map(t => t.trim()).filter(Boolean) || [],
                lookingForCollaborators: formData.get('lookingForCollaborators') === 'on'
            };
            
            // Validation
            if (!ideaData.title || ideaData.title.trim().length < 5) {
                alert('Please enter a title (at least 5 characters)');
                return;
            }
            
            if (!ideaData.description || ideaData.description.trim().length < 20) {
                alert('Please enter a description (at least 20 characters)');
                return;
            }
            
            if (!ideaData.category || ideaData.category === '') {
                alert('Please select a category');
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Submit to API
            const response = await fetch('/api/v1/ideas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ideaData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit idea');
            }
            
            const result = await response.json();
            
            // Success!
            alert('Idea submitted successfully!');
            form.reset();
            
            // Switch to browse tab and reload ideas
            this.switchTab('browse');
            this.currentPage = 1;
            await this.loadIdeas();
            
            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
        } catch (error) {
            console.error('Error submitting idea:', error);
            alert('Failed to submit idea: ' + error.message);
            
            // Restore button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Idea';
            }
        }
    }
}

// Initialize the page
const ideasPage = new IdeasPage();

// Expose globally for modal buttons
window.ideasPage = ideasPage;