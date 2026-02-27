/**
 * CMS Projects Manager
 * Handles all project-related operations
 */

export class CMSProjectsManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('projects-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const projects = await CMSData.getProjects();
            const filteredProjects = this.cms.filterItems(projects);
            this.render(filteredProjects);
        } catch (error) {
            console.error('Error loading projects:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load projects. Please try again.'));
        }
    }

    render(projects) {
        const container = document.getElementById('projects-list');
        container.replaceChildren();

        if (!projects.length) {
            container.appendChild(CMSUI.createEmptyState('No projects found. Create your first project!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'projects');

        projects.forEach(project => {
            const item = CMSUI.createContentItem(project, 'project', {
                onView: (data) => this.cms.viewContent(data, 'project'),
                onEdit: (id) => this.edit(id),
                onDelete: (id) => this.delete(id)
            });
            container.appendChild(item);
        });
    }

    async edit(id) {
        console.log(`✏️ Editing project with ID:`, id);
        this.cms.notifications.show('Edit functionality coming soon', 'info');
    }

    async delete(id) {
        if (!this.cms.checkOperationPermissions('delete', 'project')) {
            return;
        }

        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            await CMSData.deleteProject(id);
            this.cms.notifications.show('Project deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting project:', error);
            this.cms.notifications.show('Failed to delete project', 'error');
        }
    }
}
