/**
 * CMS Opportunities Manager
 * Handles all opportunity-related operations
 */

export class CMSOpportunitiesManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('opportunities-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const opportunities = await CMSData.getOpportunities();
            const filteredOpportunities = this.cms.filterItems(opportunities);
            this.render(filteredOpportunities);
        } catch (error) {
            console.error('Error loading opportunities:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load opportunities. Please try again.'));
        }
    }

    render(opportunities) {
        const container = document.getElementById('opportunities-list');
        container.replaceChildren();

        if (!opportunities.length) {
            container.appendChild(CMSUI.createEmptyState('No opportunities found. Create your first opportunity!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'opportunities');

        opportunities.forEach(opportunity => {
            const item = CMSUI.createContentItem(opportunity, 'opportunity', {
                onView: (data) => this.cms.viewContent(data, 'opportunity'),
                onEdit: (id) => this.edit(id),
                onDelete: (id) => this.delete(id)
            });
            container.appendChild(item);
        });
    }

    async edit(id) {
        console.log(`✏️ Editing opportunity with ID:`, id);
        this.cms.notifications.show('Edit functionality coming soon', 'info');
    }

    async delete(id) {
        if (!this.cms.checkOperationPermissions('delete', 'opportunity')) {
            return;
        }

        if (!confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }

        try {
            await CMSData.deleteOpportunity(id);
            this.cms.notifications.show('Opportunity deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting opportunity:', error);
            this.cms.notifications.show('Failed to delete opportunity', 'error');
        }
    }
}
