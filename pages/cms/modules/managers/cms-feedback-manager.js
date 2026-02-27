/**
 * CMS Feedback Manager
 * Handles anonymous whispers and public reviews management
 */

export class CMSFeedbackManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
        this.currentType = 'whispers';
    }

    async load() {
        this.setupTypeToggle();
        await this.loadWhispers();
    }

    setupTypeToggle() {
        const typeTabs = document.querySelectorAll('[data-feedback-type]');
        typeTabs.forEach(tab => {
            tab.addEventListener('click', async () => {
                // Update active state
                typeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Get type and load content
                const type = tab.dataset.feedbackType;
                this.currentType = type;

                // Toggle sections
                document.getElementById('whispers-section').style.display = 
                    type === 'whispers' ? 'block' : 'none';
                document.getElementById('reviews-section').style.display = 
                    type === 'reviews' ? 'block' : 'none';

                // Load content
                if (type === 'whispers') {
                    await this.loadWhispers();
                } else {
                    await this.loadReviews();
                }
            });
        });
    }

    async loadWhispers() {
        const container = document.getElementById('whispers-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            console.log('🔄 Fetching whispers from API...');
            console.log('🔑 Token present:', !!token);
            
            const response = await fetch(`${this.apiBase}/feedback/whispers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', errorText);
                throw new Error(`Failed to load whispers: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Whispers data:', data);
            
            const whispers = data.feedback || data.data || data;
            
            this.renderWhispers(whispers);
        } catch (error) {
            console.error('Error loading whispers:', error);
            container.replaceChildren();
            
            // Show detailed error message
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                padding: 2rem;
                text-align: center;
                color: rgba(255, 255, 255, 0.8);
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 12px;
            `;
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 0.5rem;">Failed to Load Whispers</h3>
                <p style="font-size: 0.875rem; margin-bottom: 1rem;">${this.escapeHtml(error.message)}</p>
                <button onclick="window.cmsManager.feedbackManager.loadWhispers()" style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 0.5rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            `;
            container.appendChild(errorDiv);
        }
    }

    renderWhispers(whispers) {
        const container = document.getElementById('whispers-list');
        container.replaceChildren();

        if (!whispers.length) {
            container.appendChild(CMSUI.createEmptyState('No whispers yet. Members can submit anonymous feedback from the feedback page.'));
            return;
        }

        container.className = 'cms-content-grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';

        whispers.forEach(whisper => {
            const card = this.createWhisperCard(whisper);
            container.appendChild(card);
        });
    }

    createWhisperCard(whisper) {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.cssText = `
            padding: 1.5rem;
            border-left: 4px solid #10b981;
            position: relative;
        `;

        const date = new Date(whisper.created_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-user-secret" style="color: #10b981;"></i>
                    <span style="color: #10b981; font-weight: 600; font-size: 0.875rem;">Anonymous</span>
                </div>
                <button class="delete-whisper-btn" data-id="${whisper.id}" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.25rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <p style="color: white; line-height: 1.6; margin-bottom: 1rem; font-size: 0.9375rem;">
                "${this.escapeHtml(whisper.comment || whisper.suggestions)}"
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <span style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">
                    <i class="fas fa-clock"></i> ${formattedDate}
                </span>
                <span style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">
                    ID: ${whisper.id.substring(0, 8)}
                </span>
            </div>
        `;

        // Add delete handler
        const deleteBtn = card.querySelector('.delete-whisper-btn');
        deleteBtn.addEventListener('click', () => this.deleteWhisper(whisper.id));

        return card;
    }

    async loadReviews() {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            console.log('🔄 Fetching reviews from API...');
            console.log('🔑 Token present:', !!token);
            
            const response = await fetch(`${this.apiBase}/feedback/reviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', errorText);
                throw new Error(`Failed to load reviews: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Reviews data:', data);
            
            const reviews = data.feedback || data.data || data;
            
            this.renderReviews(reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            container.replaceChildren();
            
            // Show detailed error message
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                padding: 2rem;
                text-align: center;
                color: rgba(255, 255, 255, 0.8);
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 12px;
            `;
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 0.5rem;">Failed to Load Reviews</h3>
                <p style="font-size: 0.875rem; margin-bottom: 1rem;">${this.escapeHtml(error.message)}</p>
                <button onclick="window.cmsManager.feedbackManager.loadReviews()" style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 0.5rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            `;
            container.appendChild(errorDiv);
        }
    }

    renderReviews(reviews) {
        const container = document.getElementById('reviews-list');
        container.replaceChildren();

        if (!reviews.length) {
            container.appendChild(CMSUI.createEmptyState('No public reviews yet. Members can submit reviews from the feedback page.'));
            return;
        }

        container.className = 'cms-content-grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';

        reviews.forEach(review => {
            const card = this.createReviewCard(review);
            container.appendChild(card);
        });
    }

    createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.cssText = `
            padding: 1.5rem;
            border-left: 4px solid #3b82f6;
            position: relative;
        `;

        const date = new Date(review.created_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const stars = '⭐'.repeat(review.rating || 5);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <i class="fas fa-user-circle" style="color: #3b82f6;"></i>
                        <span style="color: white; font-weight: 600; font-size: 0.875rem;">${this.escapeHtml(review.user_name || 'Member')}</span>
                    </div>
                    <div style="font-size: 1rem; margin-bottom: 0.5rem;">${stars}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="toggle-featured-btn" data-id="${review.id}" data-featured="${review.is_featured || false}" style="background: rgba(251, 191, 36, 0.2); border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; padding: 0.25rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-star"></i> ${review.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button class="delete-review-btn" data-id="${review.id}" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.25rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            ${review.title ? `<h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">${this.escapeHtml(review.title)}</h4>` : ''}
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1rem; font-size: 0.9375rem;">
                "${this.escapeHtml(review.comment || review.suggestions)}"
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <span style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">
                    <i class="fas fa-clock"></i> ${formattedDate}
                </span>
                ${review.is_featured ? '<span style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-star"></i> Featured</span>' : ''}
            </div>
        `;

        // Add event handlers
        const featureBtn = card.querySelector('.toggle-featured-btn');
        const deleteBtn = card.querySelector('.delete-review-btn');

        featureBtn.addEventListener('click', () => this.toggleFeatured(review.id, review.is_featured));
        deleteBtn.addEventListener('click', () => this.deleteReview(review.id));

        return card;
    }

    async deleteWhisper(id) {
        if (!confirm('Are you sure you want to delete this whisper? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/feedback/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete whisper');

            this.cms.notifications.show('Whisper deleted successfully', 'success');
            await this.loadWhispers();
        } catch (error) {
            console.error('Error deleting whisper:', error);
            this.cms.notifications.show('Failed to delete whisper', 'error');
        }
    }

    async deleteReview(id) {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/feedback/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete review');

            this.cms.notifications.show('Review deleted successfully', 'success');
            await this.loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            this.cms.notifications.show('Failed to delete review', 'error');
        }
    }

    async toggleFeatured(id, currentStatus) {
        try {
            const response = await fetch(`${this.apiBase}/feedback/${id}/feature`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ is_featured: !currentStatus })
            });

            if (response.status === 501) {
                // Feature not available
                const data = await response.json();
                this.cms.notifications.show(
                    'Featured functionality requires database update. Contact system administrator.', 
                    'warning'
                );
                return;
            }

            if (!response.ok) throw new Error('Failed to update featured status');

            this.cms.notifications.show(
                currentStatus ? 'Review unfeatured' : 'Review featured on homepage', 
                'success'
            );
            await this.loadReviews();
        } catch (error) {
            console.error('Error toggling featured status:', error);
            this.cms.notifications.show('Failed to update featured status', 'error');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
