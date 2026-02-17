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

        this.init();
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
            console.log('🚀 Setting up Ideas Page...');

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data from API
            await this.loadCategories();
            await this.loadStats();
            await this.loadIdeas();

            // Hide loading state
            this.hideLoadingState();

            console.log('✅ Ideas Page setup complete');

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
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.loadIdeas();
                }, 500);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }

        // Idea actions (like, comment)
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            const actionType = action.dataset.action;
            const ideaId = action.dataset.ideaId;

            switch (actionType) {
                case 'like-idea':
                    this.likeIdea(ideaId);
                    break;
                case 'comment-idea':
                    this.showComments(ideaId);
                    break;
            }
        });
    }

    async loadCategories() {
        try {
            console.log('📂 Loading categories...');

            const response = await fetch('/api/v1/ideas/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');

            const data = await response.json();
            this.categories = data.categories || [];

            console.log('✅ Categories loaded:', this.categories.length);
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
            <button class="category-filter active" data-category="all">
                <i class="fas fa-th"></i>
                <span>All Ideas</span>
            </button>
            ${categories.map(cat => `
                <button class="category-filter" data-category="${cat.id}">
                    <i class="fas ${cat.icon || 'fa-lightbulb'}"></i>
                    <span>${this.escapeHtml(cat.name)}</span>
                </button>
            `).join('')}
        `;

        container.innerHTML = html;
    }

    populateCategorySelect(categories) {
        const select = document.getElementById('categorySelect');
        if (!select) return;

        const html = `
            <option value="">Select Category</option>
            ${categories.map(cat => `
                <option value="${cat.id}">${this.escapeHtml(cat.name)}</option>
            `).join('')}
        `;

        select.innerHTML = html;
    }

    async loadStats() {
        try {
            console.log('📊 Loading stats...');

            const response = await fetch('/api/v1/ideas/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');

            const stats = await response.json();

            console.log('✅ Stats loaded:', stats);
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
        
        // Update individual stat elements
        const totalIdeasEl = document.getElementById('totalIdeasCount');
        const activeIdeasEl = document.getElementById('activeIdeasCount');
        const collaborationsEl = document.getElementById('collaborationsCount');
        const implementedEl = document.getElementById('implementedCount');

        if (totalIdeasEl) {
            totalIdeasEl.textContent = stats.totalIdeas || 0;
            console.log('Updated totalIdeasCount to', stats.totalIdeas);
        }
        
        if (activeIdeasEl) {
            activeIdeasEl.textContent = stats.totalIdeas || 0; // Using totalIdeas for active ideas
            console.log('Updated activeIdeasCount to', stats.totalIdeas);
        }
        
        if (collaborationsEl) {
            collaborationsEl.textContent = stats.activeCollaborators || 0;
            console.log('Updated collaborationsCount to', stats.activeCollaborators);
        }
        
        if (implementedEl) {
            // Count of implemented ideas (we don't have this in stats, so set to 0 or calculate)
            implementedEl.textContent = 0;
            console.log('Updated implementedCount to 0');
        }
    }

    async loadIdeas() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            console.log('💡 Loading ideas...');
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

            console.log('📡 Fetching ideas with params:', params.toString());

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(`/api/v1/ideas?${params}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const loadTime = Date.now() - startTime;
            console.log(`⏱️ Ideas fetch took ${loadTime}ms`);

            if (!response.ok) throw new Error('Failed to fetch ideas');

            const data = await response.json();
            const ideas = data.ideas || [];

            console.log('✅ Ideas loaded:', ideas.length, `in ${loadTime}ms`);

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
                views: idea.likes_count || 0, // Using likes_count as views
                createdAt: idea.created_at,
                created_at: idea.created_at
            }));

            this.renderIdeas(this.allIdeas);
            this.hasMore = ideas.length === this.pageSize;
            this.updateLoadMoreButton();

        } catch (error) {
            console.error('Error loading ideas:', error);
            this.showError('Failed to load ideas');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    renderIdeas(ideas) {
        const container = document.getElementById('ideasGrid');
        console.log('renderIdeas called with', ideas.length, 'ideas');
        console.log('Container found:', container);
        
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

        const html = ideas.map(idea => this.createIdeaCard(idea)).join('');
        console.log('Setting innerHTML with', html.length, 'characters');
        container.innerHTML = html;
        console.log('Ideas rendered successfully');
    }

    createIdeaCard(idea) {
        const timeAgo = this.getTimeAgo(new Date(idea.createdAt || idea.created_at));

        return `
            <div class="idea-card" data-idea-id="${idea.id}">
                <div class="idea-header">
                    <div style="flex: 1;">
                        <h3 class="idea-title">${this.escapeHtml(idea.title)}</h3>
                        <div class="idea-meta">
                            <span><i class="fas fa-user"></i> ${this.escapeHtml(idea.author.name)}</span>
                            <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                            <span class="idea-category">${this.escapeHtml(idea.category)}</span>
                        </div>
                    </div>
                </div>
                
                <p class="idea-description">${this.escapeHtml(idea.description)}</p>
                
                ${idea.tags && idea.tags.length > 0 ? `
                    <div class="idea-tags">
                        ${idea.tags.slice(0, 3).map(tag => `
                            <span class="idea-tag">${this.escapeHtml(tag)}</span>
                        `).join('')}
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
                        <span>${idea.comments || 0} comments</span>
                    </div>
                    <div class="idea-stat">
                        <i class="fas fa-eye" style="color: #f59e0b;"></i>
                        <span>${idea.views || 0} views</span>
                    </div>
                </div>
                
                <div class="idea-actions">
                    <button class="btn btn-primary btn-sm" data-action="like-idea" data-idea-id="${idea.id}">
                        <i class="fas fa-thumbs-up"></i>Like Idea
                    </button>
                    <button class="btn btn-outline btn-sm" data-action="comment-idea" data-idea-id="${idea.id}">
                        <i class="fas fa-comments"></i>Comment
                    </button>
                </div>
            </div>
        `;
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
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
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            console.log('🔐 Attempting to like idea:', {
                ideaId,
                hasToken: !!token,
                tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
            });
            
            const response = await fetch(`/api/v1/ideas/${ideaId}/vote`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ voteType: 'like' })
            });

            console.log('📡 Vote response:', {
                status: response.status,
                ok: response.ok
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Vote failed:', error);
                throw new Error(error.message || 'Failed to like idea');
            }

            const result = await response.json();
            console.log('✅ Vote successful:', result);
            
            // Reload ideas to get updated counts
            await this.loadIdeas();
            await this.loadStats();
        } catch (error) {
            console.error('Error liking idea:', error);
            alert(error.message || 'Failed to like idea. Please try again.');
        }
    }

    showComments(ideaId) {
        console.log('Show comments for idea:', ideaId);
        
        // Find the idea
        const idea = this.allIdeas.find(i => i.id === ideaId);
        if (!idea) {
            alert('Idea not found');
            return;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop active';
        modal.innerHTML = `
            <div class="modal-content-premium" style="max-width: 700px;">
                <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').remove()">×</button>
                
                <div class="modal-inner-padding">
                    <h2 class="modal-title-vibrant">${this.escapeHtml(idea.title)}</h2>
                    <p class="modal-subtitle">Comments (${idea.comments || 0})</p>
                    
                    <div id="commentsContainer" style="max-height: 400px; overflow-y: auto; margin: 2rem 0;">
                        <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                            <p>Loading comments...</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <textarea 
                            id="commentInput" 
                            placeholder="Write a comment..." 
                            style="width: 100%; min-height: 100px; padding: 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-family: inherit; resize: vertical;"
                        ></textarea>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button 
                                class="modal-action-btn modal-btn-primary" 
                                onclick="window.ideasPage.submitComment('${ideaId}')"
                                style="flex: 1;"
                            >
                                <i class="fas fa-paper-plane"></i> Post Comment
                            </button>
                            <button 
                                class="modal-action-btn modal-btn-secondary" 
                                onclick="this.closest('.modal-backdrop').remove()"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Load comments
        this.loadComments(ideaId);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });
    }

    async loadComments(ideaId) {
        try {
            const response = await fetch(`/api/v1/ideas/${ideaId}/comments`);
            if (!response.ok) throw new Error('Failed to load comments');
            
            const data = await response.json();
            const comments = data.comments || [];
            
            const container = document.getElementById('commentsContainer');
            if (!container) return;
            
            if (comments.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
                        <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = comments.map(comment => `
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-user-circle" style="font-size: 1.5rem; color: rgba(255, 255, 255, 0.5);"></i>
                        <div>
                            <div style="color: white; font-weight: 600;">${this.escapeHtml(comment.user?.name || 'Anonymous')}</div>
                            <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">${this.getTimeAgo(new Date(comment.created_at))}</div>
                        </div>
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin-left: 2.25rem;">
                        ${this.escapeHtml(comment.content)}
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading comments:', error);
            const container = document.getElementById('commentsContainer');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Failed to load comments</p>
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
            const response = await fetch(`/api/v1/ideas/${ideaId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to post comment');
            }
            
            // Clear input
            input.value = '';
            
            // Reload comments
            await this.loadComments(ideaId);
            
            // Reload ideas to update comment count
            await this.loadIdeas();
            await this.loadStats();
            
        } catch (error) {
            console.error('Error posting comment:', error);
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
}

// Initialize the page
const ideasPage = new IdeasPage();

// Expose globally for modal buttons
window.ideasPage = ideasPage;
