/**
 * CMS Events Manager
 * Handles all event-related operations
 */

export class CMSEventsManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('events-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const events = await CMSData.getEvents();
            const filteredEvents = this.cms.filterItems(events);
            this.render(filteredEvents);
        } catch (error) {
            console.error('Error loading events:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load events. Please try again.'));
        }
    }

    render(events) {
        const container = document.getElementById('events-list');
        container.replaceChildren();

        if (!events.length) {
            container.appendChild(CMSUI.createEmptyState('No events found. Create your first event!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'events');

        events.forEach(event => {
            const item = CMSUI.createContentItem(event, 'event', {
                onView: (data) => this.cms.viewContent(data, 'event'),
                onEdit: (id) => this.edit(id),
                onDelete: (id) => this.delete(id)
            });
            container.appendChild(item);
        });
    }

    async edit(id) {
        console.log(`✏️ Editing event with ID:`, id);
        this.cms.notifications.show('Edit functionality coming soon', 'info');
    }

    async delete(id) {
        if (!this.cms.checkOperationPermissions('delete', 'event')) {
            return;
        }

        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            await CMSData.deleteEvent(id);
            this.cms.notifications.show('Event deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting event:', error);
            this.cms.notifications.show('Failed to delete event', 'error');
        }
    }
}
