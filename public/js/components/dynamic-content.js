// JKUAT Innovation Club - Dynamic Content Loader

class DynamicContentLoader {
    constructor() {
        this.init();
    }

    init() {
        this.loadLatestArticles();
    }

    async loadLatestArticles() {
        try {
            const articlesSection = document.getElementById('latest-articles');
            if (!articlesSection) return;

            // Show loading state
            articlesSection.innerHTML = `
                <div class="container" style="position: relative; z-index: 10;">
                    <div style="text-align: center; padding: 3rem;">
                        <div class="spinner" style="margin: 0 auto 1rem;"></div>
                        <p style="color: rgba(255, 255, 255, 0.8);">Loading latest updates...</p>
                    </div>
                </div>
            `;

            // Fetch articles from API
            const response = await fetch('/api/content/articles?limit=3&status=published');
            const data = await response.json();

            if (response.ok && data.articles && data.articles.length > 0) {
                this.renderArticles(data.articles);
            } else {
                this.renderEmptyState();
            }

        } catch (error) {
            console.error('Error loading articles:', error);
            this.renderErrorState();
        }
    }

    renderArticles(articles) {
        const articlesSection = document.getElementById('latest-articles');
        if (!articlesSection) return;

        const articlesHTML = articles.map(article => `
            <div class="glass-card animate-on-scroll" style="padding: 2rem; height: 100%;">
                ${article.featured_image ? `
                    <div style="width: 100%; height: 200px; background: url('${article.featured_image}') center/cover; border-radius: 12px; margin-bottom: 1.5rem;"></div>
                ` : `
                    <div style="width: 100%; height: 200px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3)); border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-newspaper" style="font-size: 3rem; color: rgba(255, 255, 255, 0.5);"></i>
                    </div>
                `}
                
                <div style="margin-bottom: 1rem;">
                    <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                        ${article.category}
                    </span>
                </div>
                
                <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem; line-height: 1.3;">
                    ${article.title}
                </h3>
                
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${this.stripHtml(article.content).substring(0, 150)}...
                </p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                        <i class="fas fa-user"></i>
                        <span>${article.author?.name || 'JKUAT Innovation Club'}</span>
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                        ${this.formatDate(article.created_at)}
                    </div>
                </div>
                
                <button onclick="readArticle('${article.id}')" class="btn btn-outline btn-sm" style="width: 100%; margin-top: 1rem;">
                    <i class="fas fa-arrow-right"></i>Read More
                </button>
            </div>
        `).join('');

        articlesSection.innerHTML = `
            <div class="container" style="position: relative; z-index: 10;">
                <!-- Section Header -->
                <div style="text-align: center; margin-bottom: 3rem;" class="animate-on-scroll">
                    <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 0.5rem 1.5rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; letter-spacing: 0.05em;">
                        LATEST UPDATES
                    </div>
                    <h2 style="font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: white; margin-bottom: 1rem; line-height: 1.2;">
                        Stay Updated with<br>
                        <span class="gradient-text accent">Our Latest News</span>
                    </h2>
                    <p style="max-width: 50rem; margin: 0 auto; font-size: 1.125rem; color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-weight: 400;">
                        Discover the latest happenings, achievements, and opportunities from our innovation community.
                    </p>
                </div>
                
                <!-- Articles Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
                    ${articlesHTML}
                </div>
                
                <!-- View All Button -->
                <div style="text-align: center;">
                    <a href="/articles" class="btn btn-primary btn-lg">
                        <i class="fas fa-newspaper"></i>View All Articles
                    </a>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        const articlesSection = document.getElementById('latest-articles');
        if (!articlesSection) return;

        articlesSection.innerHTML = `
            <div class="container" style="position: relative; z-index: 10;">
                <div class="glass-card" style="padding: 4rem; text-align: center;">
                    <div style="width: 80px; height: 80px; background: rgba(59, 130, 246, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                        <i class="fas fa-newspaper" style="font-size: 2rem; color: #3b82f6;"></i>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem;">No Articles Yet</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem;">
                        We're working on bringing you the latest updates and news. Check back soon!
                    </p>
                    <a href="/cms" class="btn btn-primary">
                        <i class="fas fa-plus"></i>Create First Article
                    </a>
                </div>
            </div>
        `;
    }

    renderErrorState() {
        const articlesSection = document.getElementById('latest-articles');
        if (!articlesSection) return;

        articlesSection.innerHTML = `
            <div class="container" style="position: relative; z-index: 10;">
                <div class="glass-card" style="padding: 4rem; text-align: center;">
                    <div style="width: 80px; height: 80px; background: rgba(239, 68, 68, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444;"></i>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem;">Unable to Load Articles</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem;">
                        We're having trouble loading the latest articles. Please try refreshing the page.
                    </p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i>Refresh Page
                    </button>
                </div>
            </div>
        `;
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
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
}

// Global function to read article
window.readArticle = function(articleId) {
    // For now, just show an alert. Later this can navigate to a full article page
    alert(`Reading article ${articleId}. Full article page coming soon!`);
};

// Initialize dynamic content loader
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('latest-articles')) {
        window.dynamicContentLoader = new DynamicContentLoader();
    }
});

// Make class available globally
window.DynamicContentLoader = DynamicContentLoader;