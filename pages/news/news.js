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
        
        this.init();
    }

    async init() {
        console.log('NewsManager: Initializing...');
        try {
            await this.loadContent();
            console.log('NewsManager: Content loaded, setting up event listeners...');
            this.setupEventListeners();
            console.log('NewsManager: Event listeners set up, rendering content...');
            this.renderContent();
            console.log('NewsManager: Initialization complete');
        } catch (error) {
            console.error('Failed to initialize news page:', error);
            this.showError('Failed to load content. Please try again later.');
        }
    }

    async loadContent() {
        // Show loading state
        console.log('NewsManager: Showing loading state...');
        this.showLoading();

        try {
            // In a real app, this would fetch from your API
            // For now, we'll use mock data
            console.log('NewsManager: Loading mock content...');
            this.allContent = await this.getMockContent();
            this.filteredContent = [...this.allContent];
            console.log('NewsManager: Loaded', this.allContent.length, 'items');
        } catch (error) {
            console.error('Error loading content:', error);
            throw error;
        }
    }

    async getMockContent() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return [
            {
                id: 1,
                type: 'announcement',
                priority: 'urgent',
                pinned: true,
                title: 'Important: Club Meeting Rescheduled',
                excerpt: 'Our weekly club meeting has been moved to Friday, 3:00 PM in the Innovation Lab. Please mark your calendars.',
                content: 'Due to unforeseen circumstances, we need to reschedule our weekly club meeting...',
                author: 'Club Secretary',
                date: new Date('2026-01-25'),
                image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['meeting', 'schedule', 'important'],
                views: 245,
                likes: 18
            },
            {
                id: 2,
                type: 'news',
                priority: 'normal',
                pinned: false,
                title: 'JKUAT Innovation Club Wins National Tech Competition',
                excerpt: 'Our team secured first place in the National University Tech Innovation Challenge with their groundbreaking IoT solution.',
                content: 'We are thrilled to announce that our innovation team has won the prestigious National University Tech Innovation Challenge...',
                author: 'Sarah Kimani',
                date: new Date('2026-01-24'),
                image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['competition', 'achievement', 'iot', 'technology'],
                views: 892,
                likes: 67
            },
            {
                id: 3,
                type: 'article',
                priority: 'normal',
                pinned: false,
                title: 'The Future of AI in Education: A Student Perspective',
                excerpt: 'Exploring how artificial intelligence is transforming the educational landscape and what it means for students.',
                content: 'Artificial Intelligence is revolutionizing every aspect of our lives, and education is no exception...',
                author: 'Michael Ochieng',
                date: new Date('2026-01-23'),
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['ai', 'education', 'technology', 'future'],
                views: 456,
                likes: 34
            },
            {
                id: 4,
                type: 'event',
                priority: 'high',
                pinned: true,
                title: 'Upcoming: Innovation Showcase 2024',
                excerpt: 'Join us for our annual Innovation Showcase featuring student projects, industry speakers, and networking opportunities.',
                content: 'Mark your calendars for the most anticipated event of the year - Innovation Showcase 2024...',
                author: 'Events Team',
                date: new Date('2026-01-22'),
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['event', 'showcase', 'networking', 'projects'],
                views: 1234,
                likes: 89
            },
            {
                id: 5,
                type: 'news',
                priority: 'normal',
                pinned: false,
                title: 'New Partnership with Tech Industry Leaders',
                excerpt: 'JKUAT Innovation Club announces strategic partnerships with leading technology companies for internship and mentorship programs.',
                content: 'We are excited to announce new partnerships with several leading technology companies...',
                author: 'Partnership Team',
                date: new Date('2026-01-21'),
                image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['partnership', 'internship', 'mentorship', 'industry'],
                views: 678,
                likes: 45
            },
            {
                id: 6,
                type: 'article',
                priority: 'normal',
                pinned: false,
                title: 'Building Sustainable Tech Solutions: A Guide',
                excerpt: 'Learn how to develop technology solutions that are not only innovative but also environmentally sustainable.',
                content: 'In today\'s world, sustainability is not just a buzzword - it\'s a necessity...',
                author: 'Grace Wanjiku',
                date: new Date('2026-01-20'),
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['sustainability', 'technology', 'environment', 'guide'],
                views: 321,
                likes: 28
            },
            {
                id: 7,
                type: 'announcement',
                priority: 'normal',
                pinned: false,
                title: 'New Lab Equipment Available for Projects',
                excerpt: 'The Innovation Lab has been upgraded with new equipment including 3D printers, Arduino kits, and VR headsets.',
                content: 'We are pleased to announce that our Innovation Lab has received new equipment...',
                author: 'Lab Manager',
                date: new Date('2026-01-19'),
                image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['lab', 'equipment', 'projects', '3d-printing'],
                views: 543,
                likes: 41
            },
            {
                id: 8,
                type: 'event',
                priority: 'normal',
                pinned: false,
                title: 'Workshop: Introduction to Machine Learning',
                excerpt: 'Join our hands-on workshop to learn the basics of machine learning and build your first ML model.',
                content: 'Whether you\'re a beginner or looking to refresh your knowledge, this workshop is perfect for you...',
                author: 'Workshop Team',
                date: new Date('2026-01-18'),
                image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                tags: ['workshop', 'machine-learning', 'ai', 'hands-on'],
                views: 789,
                likes: 56
            }
        ];
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const button = e.currentTarget; // Use currentTarget instead of target
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
            'announcement': 'Announcements',
            'news': 'News',
            'article': 'Articles',
            'event': 'Events'
        };
        
        document.getElementById('contentTitle').textContent = titleMap[this.currentFilter];
    }

    applyFilters() {
        let filtered = [...this.allContent];

        // Apply type filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(item => item.type === this.currentFilter);
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(this.searchQuery) ||
                item.excerpt.toLowerCase().includes(this.searchQuery) ||
                item.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
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
        this.renderPinnedContent();
        this.renderNewsGrid();
        this.updateLoadMoreButton();
    }

    renderPinnedContent() {
        const pinnedContent = this.allContent.filter(item => item.pinned);
        const pinnedGrid = document.getElementById('pinnedGrid');
        const pinnedSection = document.getElementById('pinnedSection');

        if (pinnedContent.length === 0) {
            pinnedSection.style.display = 'none';
            return;
        }

        pinnedSection.style.display = 'block';
        pinnedGrid.innerHTML = pinnedContent.map(item => this.createNewsCard(item, true)).join('');
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

    createNewsCard(item, isPinned = false) {
        const formattedDate = this.formatDate(item.date);
        const priorityBadge = item.priority !== 'normal' ? 
            `<div class="priority-badge ${item.priority}">
                <i class="fas fa-exclamation"></i>
                ${item.priority.toUpperCase()}
            </div>` : '';

        return `
            <article class="news-card ${item.type} ${isPinned ? 'pinned' : ''}" data-id="${item.id}">
                <div class="card-header">
                    <img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy">
                    <div class="card-overlay"></div>
                    <div class="card-badges">
                        <div class="type-badge ${item.type}">
                            <i class="fas fa-${this.getTypeIcon(item.type)}"></i>
                            ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </div>
                        ${priorityBadge}
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="card-meta">
                        <div class="card-date">
                            <i class="fas fa-calendar"></i>
                            ${formattedDate}
                        </div>
                        <div class="card-author">By ${item.author}</div>
                    </div>
                    
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-excerpt">${item.excerpt}</p>
                    
                    <div class="card-tags">
                        ${item.tags.map(tag => `<span class="card-tag">#${tag}</span>`).join('')}
                    </div>
                    
                    <div class="card-footer">
                        <div class="card-stats">
                            <div class="card-stat">
                                <i class="fas fa-eye"></i>
                                ${item.views}
                            </div>
                            <div class="card-stat">
                                <i class="fas fa-heart"></i>
                                ${item.likes}
                            </div>
                        </div>
                        
                        <div class="card-actions">
                            <a href="#" class="card-btn primary" onclick="newsManager.readMore(${item.id})">
                                <i class="fas fa-book-open"></i>
                                Read More
                            </a>
                            <button class="card-btn" onclick="newsManager.shareContent(${item.id})">
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
            'announcement': 'bullhorn',
            'news': 'newspaper',
            'article': 'file-alt',
            'event': 'calendar'
        };
        return icons[type] || 'file';
    }

    formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
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

    readMore(id) {
        const item = this.allContent.find(item => item.id === id);
        if (item) {
            // In a real app, this would navigate to a detailed view
            // For now, we'll show an alert
            alert(`Opening: ${item.title}\n\n${item.content}`);
        }
    }

    shareContent(id) {
        const item = this.allContent.find(item => item.id === id);
        if (item && navigator.share) {
            navigator.share({
                title: item.title,
                text: item.excerpt,
                url: window.location.href + '#' + id
            });
        } else {
            // Fallback: copy to clipboard
            const url = window.location.href + '#' + id;
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
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
        // Use the global notification system if available
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