/**
 * CMS Communications Manager
 * Handles announcements and messaging
 */

export class CMSCommunicationsManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('communications-content');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const announcements = await CMSData.getAnnouncements();
            const messages = await CMSData.getMessages();
            
            this.render(announcements, messages);
        } catch (error) {
            console.error('Error loading communications:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load communications. Please try again.'));
        }
    }

    render(announcements, messages) {
        const container = document.getElementById('communications-content');
        container.replaceChildren();

        if (!announcements.length && !messages.length) {
            container.appendChild(CMSUI.createEmptyState('No communications found. Send your first announcement!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'communications');

        // Render announcements
        announcements.forEach(announcement => {
            const item = CMSUI.createContentItem(announcement, 'announcement', {
                onView: (data) => this.cms.viewContent(data, 'announcement'),
                onEdit: (id) => this.edit(id),
                onDelete: (id) => this.delete(id)
            });
            container.appendChild(item);
        });

        // Render messages
        messages.forEach(message => {
            const item = CMSUI.createContentItem(message, 'message', {
                onView: (data) => this.cms.viewContent(data, 'message'),
                onDelete: (id) => this.deleteMessage(id)
            });
            container.appendChild(item);
        });
    }

    async edit(id) {
        console.log(`✏️ Editing announcement with ID:`, id);
        this.cms.notifications.show('Edit functionality coming soon', 'info');
    }

    async delete(id) {
        if (!confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        try {
            await CMSData.deleteAnnouncement(id);
            this.cms.notifications.show('Announcement deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            this.cms.notifications.show('Failed to delete announcement', 'error');
        }
    }

    async deleteMessage(id) {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            await CMSData.deleteMessage(id);
            this.cms.notifications.show('Message deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting message:', error);
            this.cms.notifications.show('Failed to delete message', 'error');
        }
    }
}
