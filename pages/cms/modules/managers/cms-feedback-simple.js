/**
 * Simple CMS Feedback Manager
 * Clean implementation for managing whispers and reviews
 */

export class CMSFeedbackSimple {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.currentType = 'whispers';
    }

    async load() {
        console.log('📥 Loading feedback manager...');
        console.log('📍 Current URL:', window.location.href);
        console.log('📍 Auth token exists:', !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken')));
        this.setupTypeToggle();
        await this.loadWhispers();
    }

    setupTypeToggle() {
        const tabs = document.querySelectorAll('[data-feedback-type]');
        tabs.forEach(tab => {
            tab.addEventListener('click', async () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const type = tab.dataset.feedbackType;
                this.currentType = type;
                
                document.getElementById('whispers-section').style.display = 
                    type === 'whispers' ? 'block' : 'none';
                document.getElementById('reviews-section').style.display = 
                    type === 'reviews' ? 'block' : 'none';
                
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
        console.log('📦 Whispers container found:', !!container);
        if (!container) {
            console.error('❌ whispers-list container not found in DOM!');
            return;
        }

        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: white;">Loading...</div>';

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            console.log('🔑 Token exists:', !!token);
            console.log('📡 Fetching from: /api/v1/feedback-simple/whispers');
            
            const response = await fetch('/api/v1/feedback-simple/whispers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            const data = await response.json();
            console.log('📦 Response data:', data);
            console.log('✅ Whispers loaded:', data.feedback?.length || 0);

            if (!data.success || !data.feedback || data.feedback.length === 0) {
                console.log('ℹ️ No whispers to display');
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No whispers yet</p>
                    </div>
                `;
                return;
            }

            console.log('🎨 Rendering', data.feedback.length, 'whisper cards');
            container.innerHTML = '';
            data.feedback.forEach((whisper, index) => {
                console.log(`  Creating card ${index + 1}:`, whisper.comment?.substring(0, 30));
                const card = this.createWhisperCard(whisper);
                container.appendChild(card);
            });
            console.log('✅ All whisper cards rendered');

        } catch (error) {
            console.error('❌ Error loading whispers:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle"></i> Failed to load whispers
                    <button onclick="window.cmsManager.feedbackManager.loadWhispers()" 
                            style="display: block; margin: 1rem auto; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    createWhisperCard(whisper) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #10b981;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        `;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-user-secret" style="color: #10b981;"></i>
                    <span style="color: #10b981; font-weight: 600; font-size: 0.875rem;">Anonymous</span>
                </div>
                <button class="delete-btn" data-id="${whisper.id}" 
                        style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.25rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p style="color: white; line-height: 1.6; margin-bottom: 0;">
                "${this.escapeHtml(whisper.comment)}"
            </p>
        `;

        card.querySelector('.delete-btn').addEventListener('click', () => this.deleteWhisper(whisper.id));
        return card;
    }

    async loadReviews() {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: white;">Loading...</div>';

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch('/api/v1/feedback-simple/reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            console.log('✅ Reviews loaded:', data.feedback?.length || 0);

            if (!data.success || !data.feedback || data.feedback.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No reviews yet</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';
            data.feedback.forEach(review => {
                const card = this.createReviewCard(review);
                container.appendChild(card);
            });

        } catch (error) {
            console.error('❌ Error loading reviews:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle"></i> Failed to load reviews
                    <button onclick="window.cmsManager.feedbackManager.loadReviews()" 
                            style="display: block; margin: 1rem auto; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    createReviewCard(review) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #3b82f6;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        `;

        const stars = '⭐'.repeat(review.rating || 5);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <i class="fas fa-user-circle" style="color: #3b82f6;"></i>
                        <span style="color: white; font-weight: 600; font-size: 0.875rem;">${this.escapeHtml(review.user_name)}</span>
                    </div>
                    <div style="font-size: 1rem; margin-bottom: 0.5rem;">${stars}</div>
                </div>
                <button class="delete-btn" data-id="${review.id}" 
                        style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.25rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 0;">
                "${this.escapeHtml(review.comment)}"
            </p>
        `;

        card.querySelector('.delete-btn').addEventListener('click', () => this.deleteReview(review.id));
        return card;
    }

    async deleteWhisper(id) {
        if (!confirm('Delete this whisper?')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`/api/v1/feedback-simple/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                this.cms.notifications.show('Whisper deleted', 'success');
                await this.loadWhispers();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Error deleting whisper:', error);
            this.cms.notifications.show('Failed to delete whisper', 'error');
        }
    }

    async deleteReview(id) {
        if (!confirm('Delete this review?')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`/api/v1/feedback-simple/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                this.cms.notifications.show('Review deleted', 'success');
                await this.loadReviews();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Error deleting review:', error);
            this.cms.notifications.show('Failed to delete review', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
