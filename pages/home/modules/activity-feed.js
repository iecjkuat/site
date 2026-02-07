/**
 * Activity Feed Module - Instagram-style Social Feed
 * JKUAT Innovation Club Home Page
 */

class ActivityFeed {
    constructor() {
        this.currentFilter = 'all';
        this.feedItems = [];
        this.loadedItems = 0;
        this.itemsPerLoad = 6;
        
        this.init();
    }

    init() {
        console.log('🔄 Activity Feed initialized');
        this.setupEventListeners();
        this.loadFeedData();
    }

    setupEventListeners() {
        // Filter tabs
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-tab')) {
                this.handleFilterChange(e.target);
            }
            
            if (e.target.matches('#loadMoreBtn')) {
                this.loadMoreItems();
            }
            
            // Feed item interactions
            if (e.target.matches('.feed-action-btn')) {
                this.handleFeedAction(e.target);
            }
        });
    }

    async loadFeedData() {
        try {
            // Show loading state
            const feedContainer = document.getElementById('feedContainer');
            if (feedContainer) {
                feedContainer.innerHTML = `
                    <div class="feed-loading">
                        <div class="loading-spinner"></div>
                        <p>Loading latest updates...</p>
                    </div>
                `;
            }
            
            // Try to load from API first
            const response = await fetch('/api/activity-feed');
            if (response.ok) {
                const data = await response.json();
                this.feedItems = data.items || [];
            } else {
                // Use mock data
                this.feedItems = this.getMockFeedData();
            }
            
            this.renderFeed();
        } catch (error) {
            console.error('Error loading feed data:', error);
            this.feedItems = this.getMockFeedData();
            this.renderFeed();
        }
    }

    handleFilterChange(tab) {
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update filter
        this.currentFilter = tab.dataset.filter;
        this.loadedItems = 0;
        
        // Re-render feed
        this.renderFeed();
    }

    renderFeed() {
        const feedContainer = document.getElementById('feedContainer');
        if (!feedContainer) return;

        const filteredItems = this.getFilteredItems();
        const itemsToShow = filteredItems.slice(0, this.loadedItems + this.itemsPerLoad);
        
        if (itemsToShow.length === 0) {
            feedContainer.innerHTML = this.renderEmptyState();
            return;
        }

        feedContainer.innerHTML = itemsToShow.map(item => this.renderFeedItem(item)).join('');
        this.loadedItems = itemsToShow.length;
        
        // Update load more button
        this.updateLoadMoreButton(filteredItems.length);
    }

    getFilteredItems() {
        if (this.currentFilter === 'all') {
            return this.feedItems;
        }
        return this.feedItems.filter(item => item.type === this.currentFilter);
    }

    renderFeedItem(item) {
        const timeAgo = this.getTimeAgo(item.timestamp);
        const hasMedia = item.media && item.media.url;
        
        return `
            <article class="feed-item" data-item-id="${item.id}" data-type="${item.type}">
                <div class="feed-header">
                    <div class="feed-avatar" style="background: ${item.author.color || this.getRandomColor()};">
                        ${item.author.avatar || item.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="feed-info">
                        <h4>${this.escapeHtml(item.author.name)}</h4>
                        <div class="feed-meta">
                            <span class="feed-type">${this.getTypeLabel(item.type)}</span>
                            <span class="feed-time">${timeAgo}</span>
                        </div>
                    </div>
                    <div class="feed-menu">
                        <button class="feed-menu-btn" data-action="menu" data-item-id="${item.id}">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>

                <div class="feed-content">
                    ${hasMedia ? `
                        <div class="feed-media-container">
                            ${item.media.type === 'video' ? `
                                <video class="feed-media" poster="${this.validateMediaUrl(item.media.thumbnail) ? this.escapeHtml(item.media.thumbnail) : '/assets/placeholder.jpg'}" controls>
                                    <source src="${this.validateMediaUrl(item.media.url) ? this.escapeHtml(item.media.url) : ''}" type="video/mp4">
                                </video>
                            ` : `
                                <img class="feed-media" src="${this.validateMediaUrl(item.media.url) ? this.escapeHtml(item.media.url) : '/assets/placeholder.jpg'}" 
                                     alt="${this.escapeHtml(item.media.alt || item.title)}" loading="lazy">
                            `}
                        </div>
                    ` : ''}
                    
                    <div class="feed-text">
                        <h3 class="feed-title">${this.escapeHtml(item.title)}</h3>
                        <p class="feed-description">${this.escapeHtml(item.description)}</p>
                        
                        ${item.tags && item.tags.length > 0 ? `
                            <div class="feed-tags">
                                ${item.tags.map(tag => `<span class="feed-tag">#${tag}</span>`).join(' ')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="feed-actions">
                    <div class="action-buttons">
                        <button class="feed-action-btn like-btn ${item.isLiked ? 'liked' : ''}" 
                                data-action="like" data-item-id="${item.id}">
                            <i class="fas fa-heart"></i>
                            <span>${item.likes || 0}</span>
                        </button>
                        <button class="feed-action-btn comment-btn" 
                                data-action="comment" data-item-id="${item.id}">
                            <i class="fas fa-comment"></i>
                            <span>${item.comments || 0}</span>
                        </button>
                        <button class="feed-action-btn share-btn" 
                                data-action="share" data-item-id="${item.id}">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                    
                    ${item.cta ? `
                        <div class="feed-cta">
                            <button class="feed-cta-btn" data-action="cta" data-item-id="${item.id}">
                                <i class="fas fa-${item.cta.icon}"></i>
                                ${item.cta.text}
                            </button>
                        </div>
                    ` : ''}
                </div>
            </article>
        `;
    }

    renderEmptyState() {
        return `
            <div class="feed-empty-state">
                <div class="empty-icon">
                    <i class="fas fa-stream"></i>
                </div>
                <h3>No updates found</h3>
                <p>No ${this.currentFilter === 'all' ? '' : this.currentFilter} updates match your current filter.</p>
                <button class="btn-outline-modern" onclick="window.activityFeed.handleFilterChange(document.querySelector('.filter-tab[data-filter=all]'))">
                    <i class="fas fa-refresh"></i> Show All Updates
                </button>
            </div>
        `;
    }

    loadMoreItems() {
        const filteredItems = this.getFilteredItems();
        const remainingItems = filteredItems.length - this.loadedItems;
        
        if (remainingItems > 0) {
            this.renderFeed();
        }
    }

    updateLoadMoreButton(totalItems) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        const remainingItems = totalItems - this.loadedItems;
        
        if (remainingItems > 0) {
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i> 
                Load ${Math.min(remainingItems, this.itemsPerLoad)} More Updates
            `;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    handleFeedAction(button) {
        const action = button.dataset.action;
        const itemId = button.dataset.itemId;
        
        switch (action) {
            case 'like':
                this.toggleLike(itemId, button);
                break;
            case 'comment':
                this.showComments(itemId);
                break;
            case 'share':
                this.shareItem(itemId);
                break;
            case 'cta':
                this.handleCTA(itemId);
                break;
            case 'menu':
                this.showItemMenu(itemId, button);
                break;
        }
    }

    toggleLike(itemId, button) {
        const item = this.feedItems.find(i => i.id === itemId);
        if (!item) return;
        
        item.isLiked = !item.isLiked;
        item.likes = (item.likes || 0) + (item.isLiked ? 1 : -1);
        
        // Update UI
        button.classList.toggle('liked');
        const countSpan = button.querySelector('span');
        if (countSpan) {
            countSpan.textContent = item.likes;
        }
        
        // Add animation
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
        
        // Show feedback
        this.showToast(item.isLiked ? 'Added to favorites!' : 'Removed from favorites', 'success');
    }

    showComments(itemId) {
        // This would open a comments modal
        this.showToast('Comments feature coming soon!', 'info');
    }

    shareItem(itemId) {
        const item = this.feedItems.find(i => i.id === itemId);
        if (!item) return;
        
        const shareData = {
            title: item.title,
            text: item.description,
            url: `${window.location.origin}#feed-${itemId}`
        };
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).then(() => {
                this.showToast('Shared successfully!', 'success');
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showToast('Link copied to clipboard!', 'success');
            }).catch(() => {
                this.showToast('Unable to share', 'error');
            });
        }
    }

    handleCTA(itemId) {
        const item = this.feedItems.find(i => i.id === itemId);
        if (!item || !item.cta) return;
        
        if (item.cta.action === 'register') {
            window.location.href = '../events/events.html';
        } else if (item.cta.action === 'learn-more') {
            window.location.href = item.cta.url || '#';
        } else if (item.cta.action === 'join') {
            // Handle join action
            this.showToast('Redirecting to registration...', 'info');
        }
    }

    showItemMenu(itemId, button) {
        // This would show a context menu for the item
        this.showToast('Item menu coming soon!', 'info');
    }

    // Utility methods
    validateMediaUrl(url) {
        if (!url) return false;
        try {
            const urlObj = new URL(url);
            // Only allow https and data URLs, block javascript: and other dangerous protocols
            return ['https:', 'data:'].includes(urlObj.protocol) && 
                   !urlObj.hostname.includes('javascript:') &&
                   !url.toLowerCase().includes('javascript:');
        } catch {
            return false;
        }
    }

    getTypeLabel(type) {
        const labels = {
            'events': 'Event',
            'projects': 'Project',
            'achievements': 'Achievement',
            'news': 'News',
            'announcements': 'Announcement'
        };
        return labels[type] || 'Update';
    }

    getTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    getRandomColor() {
        const colors = [
            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #f59e0b, #d97706)',
            'linear-gradient(135deg, #ef4444, #dc2626)',
            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            'linear-gradient(135deg, #06b6d4, #0891b2)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getMockFeedData() {
        return [
            {
                id: '1',
                type: 'events',
                title: 'Innovation Workshop: From Idea to Prototype',
                description: 'Join us for an exciting hands-on workshop where you\'ll learn to transform your innovative ideas into working prototypes. Industry experts will guide you through the entire process.',
                author: {
                    name: 'JKUAT Innovation Club',
                    avatar: null,
                    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                },
                media: {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    alt: 'Innovation Workshop'
                },
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                likes: 24,
                comments: 8,
                isLiked: false,
                tags: ['workshop', 'innovation', 'prototype'],
                cta: {
                    text: 'Register Now',
                    icon: 'calendar-plus',
                    action: 'register'
                }
            },
            {
                id: '2',
                type: 'achievements',
                title: 'Student Startup Wins KSh 2M Funding',
                description: 'Congratulations to our member Sarah Kimani whose AgriTech startup just secured KSh 2M in seed funding! Her innovative solution for small-scale farmers is making a real impact.',
                author: {
                    name: 'Sarah Kimani',
                    avatar: null,
                    color: 'linear-gradient(135deg, #10b981, #059669)'
                },
                media: {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    alt: 'Startup Success'
                },
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                likes: 67,
                comments: 15,
                isLiked: true,
                tags: ['startup', 'funding', 'agritech', 'success'],
                cta: {
                    text: 'Learn More',
                    icon: 'external-link-alt',
                    action: 'learn-more'
                }
            },
            {
                id: '3',
                type: 'projects',
                title: 'Smart Campus IoT Project Launch',
                description: 'Our team has launched a comprehensive IoT system to monitor and optimize energy usage across JKUAT campus. Real-time data shows 30% reduction in energy waste!',
                author: {
                    name: 'Tech Team',
                    avatar: null,
                    color: 'linear-gradient(135deg, #f59e0b, #d97706)'
                },
                media: {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    alt: 'IoT Project'
                },
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                likes: 45,
                comments: 12,
                isLiked: false,
                tags: ['iot', 'sustainability', 'campus', 'technology']
            },
            {
                id: '4',
                type: 'news',
                title: 'Partnership with Google Developer Groups',
                description: 'Exciting news! We\'ve partnered with Google Developer Groups Kenya to bring exclusive workshops, mentorship programs, and internship opportunities to our members.',
                author: {
                    name: 'JKUAT Innovation Club',
                    avatar: null,
                    color: 'linear-gradient(135deg, #ef4444, #dc2626)'
                },
                media: {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    alt: 'Partnership Announcement'
                },
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                likes: 89,
                comments: 23,
                isLiked: true,
                tags: ['partnership', 'google', 'opportunities', 'mentorship'],
                cta: {
                    text: 'Join Program',
                    icon: 'user-plus',
                    action: 'join'
                }
            },
            {
                id: '5',
                type: 'events',
                title: 'Monthly Hackathon: AI for Social Good',
                description: 'This month\'s hackathon focuses on developing AI solutions that address social challenges in our community. Form teams and compete for amazing prizes!',
                author: {
                    name: 'Events Team',
                    avatar: null,
                    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                },
                media: {
                    type: 'video',
                    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
                    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    alt: 'Hackathon Promo'
                },
                timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
                likes: 156,
                comments: 34,
                isLiked: false,
                tags: ['hackathon', 'ai', 'social-good', 'competition'],
                cta: {
                    text: 'Register Team',
                    icon: 'users',
                    action: 'register'
                }
            },
            {
                id: '6',
                type: 'achievements',
                title: 'Club Reaches 500 Members Milestone',
                description: 'We\'re thrilled to announce that our innovation community has grown to 500+ active members! Thank you to everyone who makes this community amazing.',
                author: {
                    name: 'JKUAT Innovation Club',
                    avatar: null,
                    color: 'linear-gradient(135deg, #06b6d4, #0891b2)'
                },
                media: {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    alt: 'Community Celebration'
                },
                timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                likes: 234,
                comments: 67,
                isLiked: true,
                tags: ['milestone', 'community', 'growth', 'celebration']
            }
        ];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.activityFeed = new ActivityFeed();
});

// Make available globally
window.ActivityFeed = ActivityFeed;