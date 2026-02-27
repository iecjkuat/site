/**
 * CMS Innovation Manager
 * Handles innovation hub (ideas and challenges)
 */

export class CMSInnovationManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('innovation-content');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const realIdeas = await CMSData.getIdeas();
            const realChallenges = await CMSData.getChallenges();
            
            this.updateStats(realIdeas, realChallenges);
            this.render(realIdeas, realChallenges);
        } catch (error) {
            console.error('Error loading innovation hub:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load innovation hub. Please try again.'));
        }
    }

    render(ideas, challenges) {
        const container = document.getElementById('innovation-content');
        container.replaceChildren();

        if (!ideas.length && !challenges.length) {
            container.appendChild(CMSUI.createEmptyState('No innovation content found. Create your first challenge!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'innovation');

        // Render challenges first
        challenges.forEach(challenge => {
            const item = CMSUI.createContentItem(challenge, 'challenge', {
                onView: (data) => this.cms.viewContent(data, 'challenge'),
                onEdit: (id) => this.editChallenge(id),
                onDelete: (id) => this.deleteChallenge(id)
            });
            container.appendChild(item);
        });

        // Then render ideas
        ideas.forEach(idea => {
            const item = CMSUI.createContentItem(idea, 'idea', {
                onView: (data) => this.cms.viewContent(data, 'idea'),
                onApprove: (id) => this.approveIdea(id),
                onReject: (id) => this.rejectIdea(id)
            });
            container.appendChild(item);
        });
    }

    updateStats(ideas, challenges) {
        const totalIdeas = ideas.length;
        const pendingIdeas = ideas.filter(idea => idea.status === 'pending').length;
        const approvedIdeas = ideas.filter(idea => idea.status === 'approved').length;
        const activeChallenges = challenges.filter(challenge => challenge.status === 'active').length;

        CMSUI.animateCounter('total-ideas-count', totalIdeas);
        CMSUI.animateCounter('pending-ideas-count', pendingIdeas);
        CMSUI.animateCounter('approved-ideas-count', approvedIdeas);
        CMSUI.animateCounter('active-challenges-count', activeChallenges);
    }

    async approveIdea(id) {
        try {
            await CMSData.updateIdea(id, { status: 'approved' });
            this.cms.notifications.show('Idea approved successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error approving idea:', error);
            this.cms.notifications.show('Failed to approve idea', 'error');
        }
    }

    async rejectIdea(id) {
        if (!confirm('Are you sure you want to reject this idea?')) {
            return;
        }

        try {
            await CMSData.updateIdea(id, { status: 'rejected' });
            this.cms.notifications.show('Idea rejected', 'success');
            this.load();
        } catch (error) {
            console.error('Error rejecting idea:', error);
            this.cms.notifications.show('Failed to reject idea', 'error');
        }
    }

    async editChallenge(id) {
        console.log(`✏️ Editing challenge with ID:`, id);
        this.cms.notifications.show('Edit functionality coming soon', 'info');
    }

    async deleteChallenge(id) {
        if (!confirm('Are you sure you want to delete this challenge?')) {
            return;
        }

        try {
            await CMSData.deleteChallenge(id);
            this.cms.notifications.show('Challenge deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting challenge:', error);
            this.cms.notifications.show('Failed to delete challenge', 'error');
        }
    }
}
