/**
 * CMS Articles Manager
 * Handles all article-related operations
 */

export class CMSArticlesManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const articles = await CMSData.getArticles({ status: 'published' });
            const filteredArticles = this.cms.filterItems(articles);
            this.render(filteredArticles);
        } catch (error) {
            console.error('Error loading articles:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load articles. Please try again.'));
        }
    }

    render(articles) {
        const container = document.getElementById('articles-list');
        container.replaceChildren();

        if (!articles.length) {
            container.appendChild(CMSUI.createEmptyState('No articles found. Create your first article!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'articles');

        articles.forEach(article => {
            const item = CMSUI.createContentItem(article, 'article', {
                onView: (data) => this.cms.viewContent(data, 'article'),
                onEdit: (id) => this.edit(id),
                onDelete: (id) => this.delete(id)
            });
            container.appendChild(item);
        });
    }

    async edit(id) {
        console.log(`✏️ Editing article with ID:`, id);
        
        try {
            const article = await CMSAPI.getArticle(id);
            
            if (!article) {
                this.cms.notifications.show('Article not found', 'error');
                return;
            }

            // Show edit modal (implementation from original)
            // TODO: Implement edit modal
            this.cms.notifications.show('Edit functionality coming soon', 'info');
            
        } catch (error) {
            console.error('Error editing article:', error);
            this.cms.notifications.show('Failed to load article for editing', 'error');
        }
    }

    async delete(id) {
        if (!this.cms.checkOperationPermissions('delete', 'article')) {
            return;
        }

        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            await CMSData.deleteArticle(id);
            this.cms.notifications.show('Article deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting article:', error);
            this.cms.notifications.show('Failed to delete article', 'error');
        }
    }
}
