/**
 * JKUAT Innovation Club - News & Articles Page JavaScript
 * Handles content loading, filtering, search, and interactions
 */

class NewsManager {
    constructor() {
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.searchQuery = '';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.allContent = [];
        this.filteredContent = [];
        this.apiBase = '/api/v1/content';
        
        this.init();
    }

    async init() {
        console.log('NewsManager: Initializing...');
        try {
            await this.loadContent();
            this.setupEventListeners();
            this.renderContent();
            console.log('NewsManager: Initialization complete');
        } catch (error) {
            console.error('Failed to initialize news page:', error);
            this.showError('Failed to load content. Please try again later.');
        }
    }

    async loadContent() {
        this.showLoading();

        try {
            const response = await fetch(`${this.apiBase}/articles?status=published&limit=100`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.allContent = data.articles || [];
            this.filteredContent = [...this.allContent];
            
            console.log('Loaded', this.allContent.length, 'articles from database');
        } catch (error) {
            console.error('Error loading content:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const button = e.currentTarget;
                this.handleFilterChange(button.dataset.filter);
            });
        });

        // Search
        const searchInput = document.getElementById('newsSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.debounceSearch();
        });

        searchBtn.addEventListener('click', () => {
            this.applyFilters();
        });

        // Sort
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applyFilters();
        });

        // Load more
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    handleFilterChange(filter) {
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.currentFilter = filter;
        this.currentPage = 1;
        this.applyFilters();
        this.updateContentTitle();
    }

    updateContentTitle() {
        const titleMap = {
            'all': 'Latest Updates',
            'news': 'News',
            'article': 'Articles'
        };
        
        document.getElementById('contentTitle').textContent = titleMap[this.currentFilter];
    }

    applyFilters() {
        let filtered = [...this.allContent];

        // Apply type filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(item => item.category === this.currentFilter);
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(this.searchQuery) ||
                (item.excerpt && item.excerpt.toLowerCase().includes(this.searchQuery)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
                case 'date-asc':
                    return new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        this.filteredContent = filtered;
        this.renderContent();
    }

    renderContent() {
        this.hideLoading();
        this.renderNewsGrid();
        this.updateLoadMoreButton();
    }

    renderNewsGrid() {
        const newsGrid = document.getElementById('newsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredContent.length === 0) {
            newsGrid.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        
        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const itemsToShow = this.filteredContent.slice(startIndex, endIndex);

        newsGrid.innerHTML = itemsToShow.map(item => this.createNewsCard(item)).join('');
    }

    createNewsCard(item) {
        const formattedDate = this.formatDate(item.published_at || item.created_at);
        const authorName = item.author?.name || 'JKUAT Innovation Club';

        return `
            <article class="news-card ${item.category}" data-id="${item.id}">
                <div class="card-header">
                    <img src="${item.featured_image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'}" 
                         alt="${item.title}" 
                         class="card-image" 
                         loading="lazy">
                    <div class="card-overlay"></div>
                    <div class="card-badges">
                        <div class="type-badge ${item.category}">
                            <i class="fas fa-${this.getTypeIcon(item.category)}"></i>
                            ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </div>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="card-meta">
                        <div class="card-date">
                            <i class="fas fa-calendar"></i>
                            ${formattedDate}
                        </div>
                        <div class="card-author">By ${authorName}</div>
                    </div>
                    
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-excerpt">${item.excerpt || item.content.substring(0, 150) + '...'}</p>
                    
                    ${item.tags && item.tags.length > 0 ? `
                    <div class="card-tags">
                        ${item.tags.slice(0, 4).map(tag => `<span class="card-tag">#${tag}</span>`).join('')}
                    </div>
                    ` : ''}
                    
                    <div class="card-footer">
                        <div class="card-stats">
                            <div class="card-stat">
                                <i class="fas fa-eye"></i>
                                ${item.views || 0}
                            </div>
                            <div class="card-stat">
                                <i class="fas fa-heart"></i>
                                ${item.likes || 0}
                            </div>
                        </div>
                        
                        <div class="card-actions">
                            <a href="#" class="card-btn primary" onclick="newsManager.readMore('${item.id}'); return false;">
                                <i class="fas fa-book-open"></i>
                                Read More
                            </a>
                            <button class="card-btn" onclick="newsManager.shareContent('${item.id}')">
                                <i class="fas fa-share"></i>
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            'news': 'newspaper',
            'article': 'file-alt'
        };
        return icons[type] || 'file';
    }

    formatDate(date) {
        const now = new Date();
        const articleDate = new Date(date);
        const diffTime = Math.abs(now - articleDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return articleDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const totalItems = this.filteredContent.length;
        const shownItems = this.currentPage * this.itemsPerPage;

        if (shownItems >= totalItems) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
        }
    }

    loadMore() {
        this.currentPage++;
        this.renderNewsGrid();
    }

    async readMore(id) {
        try {
            const response = await fetch(`${this.apiBase}/articles/${id}`);
            
            if (!response.ok) {
                throw new Error('Failed to load article');
            }

            const data = await response.json();
            const article = data.article;

            // Create modal to show full article
            const modal = document.createElement('div');
            modal.className = 'article-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
                <div class="modal-content">
                    <button class="modal-close" onclick="this.closest('.article-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    ${article.featured_image ? `
                    <img src="${article.featured_image}" alt="${article.title}" class="modal-image">
                    ` : ''}
                    
                    <div class="modal-header">
                        <div class="type-badge ${article.category}">
                            <i class="fas fa-${this.getTypeIcon(article.category)}"></i>
                            ${article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                        </div>
                        <h2>${article.title}</h2>
                        <div class="modal-meta">
                            <span><i class="fas fa-user"></i> ${article.author?.name || 'JKUAT Innovation Club'}</span>
                            <span><i class="fas fa-calendar"></i> ${this.formatDate(article.published_at || article.created_at)}</span>
                            <span><i class="fas fa-eye"></i> ${article.views || 0} views</span>
                        </div>
                    </div>
                    
                    <div class="modal-body">
                        ${article.content.split('\n').map(p => `<p>${p}</p>`).join('')}
                    </div>
                    
                    ${article.tags && article.tags.length > 0 ? `
                    <div class="modal-tags">
                        ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    ` : ''}
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';

            // Update view count
            this.incrementViews(id);

        } catch (error) {
            console.error('Error loading article:', error);
            this.showNotification('Failed to load article', 'error');
        }
    }

    async incrementViews(id) {
        try {
            // Find article in local data and increment
            const article = this.allContent.find(a => a.id === id);
            if (article) {
                article.views = (article.views || 0) + 1;
            }
            
            // In a real implementation, you'd send this to the backend
            // await fetch(`${this.apiBase}/articles/${id}/view`, { method: 'POST' });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    shareContent(id) {
        const item = this.allContent.find(item => item.id === id);
        if (item && navigator.share) {
            navigator.share({
                title: item.title,
                text: item.excerpt || item.content.substring(0, 150),
                url: window.location.href + '?article=' + id
            }).catch(err => console.log('Share failed:', err));
        } else {
            // Fallback: copy to clipboard
            const url = window.location.href + '?article=' + id;
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy link', 'error');
            });
        }
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('newsGrid').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('newsGrid').style.display = 'grid';
    }

    showError(message) {
        this.hideLoading();
        document.getElementById('emptyState').style.display = 'flex';
        document.querySelector('#emptyState h3').textContent = 'Error Loading Content';
        document.querySelector('#emptyState p').textContent = message;
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize the news manager when the page loads
let newsManager;

document.addEventListener('DOMContentLoaded', () => {
    newsManager = new NewsManager();
});

// Export for global access
window.newsManager = newsManager;
