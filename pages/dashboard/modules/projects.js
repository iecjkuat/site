// JKUAT Innovation Club - Projects Module (Optimized)

class ProjectManager {
    constructor(dashboardInstance) {
        this.dashboard = dashboardInstance;
        this.projects = [];
        this.projectsContainer = document.getElementById('myProjectsGrid');
    }

    // Load projects into the grid
    loadProjects() {
        if (!this.projectsContainer) return;

        // Sample projects (replace with backend fetch)
        const projects = [
            {
                id: 'proj_001',
                title: 'Smart Irrigation System',
                description: 'IoT-based automated irrigation for campus farms',
                category: 'IoT',
                status: 'in_progress',
                approval: 'approved',
                teamSize: 4,
                teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
                mentor: 'Dr. Kamau',
                mentorAssigned: true,
                progress: 65,
                milestones: { completed: 3, total: 5 },
                lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                priority: 'high',
                funding: { requested: 50000, approved: 35000, spent: 15000 }
            },
            {
                id: 'proj_002',
                title: 'Student Portal App',
                description: 'Mobile app for JKUAT student services and announcements',
                category: 'Mobile App',
                status: 'completed',
                approval: 'approved',
                teamSize: 3,
                teamMembers: ['Alice Brown', 'Bob Davis', 'Carol White'],
                mentor: 'Prof. Wanjiku',
                mentorAssigned: true,
                progress: 100,
                milestones: { completed: 4, total: 4 },
                lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                priority: 'medium',
                funding: { requested: 25000, approved: 25000, spent: 23500 }
            },
            {
                id: 'proj_003',
                title: 'Campus Energy Monitor',
                description: 'Real-time energy consumption tracking and optimization system',
                category: 'Sustainability',
                status: 'idea',
                approval: 'pending',
                teamSize: 2,
                teamMembers: ['David Lee', 'Emma Taylor'],
                mentor: null,
                mentorAssigned: false,
                progress: 15,
                milestones: { completed: 0, total: 6 },
                lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                deadline: null,
                priority: 'medium',
                funding: { requested: 75000, approved: 0, spent: 0 }
            }
        ];

        this.projects = projects;
        this.renderProjects();
    }

    // Render all projects
    renderProjects() {
        const container = this.projectsContainer;
        if (!container) return;

        container.innerHTML = '';
        if (this.projects.length === 0) {
            this.showEmptyProjects(container);
            return;
        }

        this.projects.forEach(project => {
            const card = this.createProjectCard(project);
            container.appendChild(card);
        });
    }

    // Create individual project card
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'glass-card slide-in project-card';
        card.style.padding = '1.25rem';
        card.dataset.projectId = project.id;

        const statusInfo = this.getProjectStatusInfo(project.status);
        const approvalInfo = this.getApprovalStatusInfo(project.approval);
        const priorityInfo = this.getPriorityInfo(project.priority);
        const timeInfo = this.getProjectTimeInfo(project);

        // Safe funding percentage
        const fundingPercent = project.funding && project.funding.requested > 0
            ? (project.funding.approved / project.funding.requested) * 100
            : 0;

        card.innerHTML = `
            <div class="project-header mb-3">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="text-white font-semibold text-sm flex-1 pr-2">${project.title}</h4>
                    <div class="flex gap-1 flex-shrink-0">${approvalInfo.badge} ${statusInfo.badge}</div>
                </div>
                <p class="text-gray-300 text-xs mb-2 leading-relaxed">${project.description}</p>
                <div class="flex items-center gap-3 text-xs">
                    <span class="text-green-500 font-medium">${project.category}</span>
                    <span class="text-gray-400">${project.teamSize} members</span>
                    ${priorityInfo.display}
                </div>
            </div>
        `;

        // Project actions container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'project-actions flex gap-2';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-primary btn-sm flex-1';
        viewBtn.innerHTML = `<i class="fas fa-eye"></i> View`;
        viewBtn.addEventListener('click', () => this.viewProjectDetails(project.id));
        actionsContainer.appendChild(viewBtn);

        if (project.status !== 'completed') {
            const updateBtn = document.createElement('button');
            updateBtn.className = 'btn btn-outline btn-sm flex-1';
            updateBtn.innerHTML = `<i class="fas fa-edit"></i> Update`;
            updateBtn.addEventListener('click', () => this.updateProjectStatus(project.id));
            actionsContainer.appendChild(updateBtn);
        } else {
            const reportBtn = document.createElement('button');
            reportBtn.className = 'btn btn-outline btn-sm flex-1';
            reportBtn.innerHTML = `<i class="fas fa-download"></i> Report`;
            reportBtn.addEventListener('click', () => this.downloadProjectReport(project.id));
            actionsContainer.appendChild(reportBtn);
        }

        card.appendChild(actionsContainer);

        return card;
    }

    // Show empty projects message
    showEmptyProjects(container) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-project-diagram text-gray-400 text-xl"></i>
                </div>
                <h3 class="text-white text-sm font-medium mb-2">No projects yet</h3>
                <p class="text-gray-400 text-xs mb-4">Start your innovation journey by creating your first project.</p>
                <button class="btn btn-primary btn-sm" id="createProjectBtn">
                    <i class="fas fa-plus"></i> Create Project
                </button>
            </div>
        `;
        const btn = document.getElementById('createProjectBtn');
        btn?.addEventListener('click', () => this.dashboard.showSimpleProjectModal());
    }

    // ===== Project info helpers =====
    getProjectStatusInfo(status) {
        const statusMap = {
            idea: { badge: '<span class="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Idea</span>', progressColor: 'bg-yellow-500' },
            in_progress: { badge: '<span class="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">In Progress</span>', progressColor: 'bg-blue-500' },
            completed: { badge: '<span class="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Completed</span>', progressColor: 'bg-green-500' },
            on_hold: { badge: '<span class="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">On Hold</span>', progressColor: 'bg-orange-500' },
            cancelled: { badge: '<span class="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Cancelled</span>', progressColor: 'bg-red-500' }
        };
        return statusMap[status] || statusMap['idea'];
    }

    getApprovalStatusInfo(approval) {
        const approvalMap = {
            pending: { badge: '<span class="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pending</span>' },
            approved: { badge: '<span class="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">✓ Approved</span>' },
            rejected: { badge: '<span class="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">✗ Rejected</span>' }
        };
        return approvalMap[approval] || approvalMap['pending'];
    }

    getPriorityInfo(priority) {
        const priorityMap = {
            high: { display: '<span class="text-red-400 font-medium">High Priority</span>' },
            medium: { display: '<span class="text-yellow-400">Medium Priority</span>' },
            low: { display: '<span class="text-gray-400">Low Priority</span>' }
        };
        return priorityMap[priority] || priorityMap['medium'];
    }

    getProjectTimeInfo(project) {
        const lastUpdated = this.getTimeAgo(project.lastUpdated);
        if (project.deadline) {
            const daysUntil = Math.ceil((project.deadline - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntil < 0) return `Completed ${Math.abs(daysUntil)} days ago`;
            if (daysUntil <= 7) return `Due in ${daysUntil} days`;
            return `Due ${project.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
        return `Updated ${lastUpdated}`;
    }

    getTimeAgo(date) {
        const diff = Math.floor((new Date() - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // ===== Project Actions =====
    viewProjectDetails(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        this.createModal(this.getProjectDetailsContent(project));
    }

    updateProjectStatus(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        this.createModal(this.getProjectUpdateContent(project));
    }

    downloadProjectReport(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        window.jkuatApp?.showToast(`Generating report for ${project.title}...`, 'success');
        console.log('Downloading project report:', project);
    }

    requestMentorForProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        this.dashboard.showMentorRequestModal(project);
    }

    // ===== Modal helpers =====
    createModal(contentHTML) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.dataset.modalId = `modal_${Date.now()}`;
        Object.assign(modal.style, { position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '9999' });
        modal.innerHTML = contentHTML;
        document.body.appendChild(modal);

        modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => document.body.removeChild(modal)));
        modal.addEventListener('click', e => { if (e.target === modal) document.body.removeChild(modal); });
    }

    // ===== Modal content generators =====
    getProjectDetailsContent(project) {
        const statusInfo = this.getProjectStatusInfo(project.status);
        const approvalInfo = this.getApprovalStatusInfo(project.approval);
        const fundingPercent = project.funding && project.funding.requested > 0 ? (project.funding.approved / project.funding.requested) * 100 : 0;

        return `
            <div class="modal-content" style="max-width:600px; width:90%; max-height:80vh; overflow-y:auto; padding:1rem; background:#1f1f1f; border-radius:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h2 style="color:white; font-weight:700; font-size:1.5rem; margin:0;">${project.title}</h2>
                    <button class="btn-glass btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="flex gap-2 mb-2">${approvalInfo.badge} ${statusInfo.badge}</div>
                <p class="text-gray-300 mb-2">${project.description}</p>
                <p class="text-green-500 mb-1">${project.category}</p>
                <p class="${project.priority==='high'?'text-red-400':project.priority==='medium'?'text-yellow-400':'text-gray-400'} mb-2">${project.priority.charAt(0).toUpperCase()+project.priority.slice(1)}</p>
                <p class="text-gray-400 mb-1">Progress: ${project.progress}%</p>
                <div class="w-full bg-gray-700 h-2 rounded-full mb-2">
                    <div class="${statusInfo.progressColor} h-2 rounded-full" style="width:${project.progress}%"></div>
                </div>
                ${project.funding ? `<p class="text-gray-400">Funding: KSh ${project.funding.approved.toLocaleString()} / ${project.funding.requested.toLocaleString()} (${fundingPercent.toFixed(1)}%)</p>` : ''}
                <div class="flex gap-2 mt-4">
                    <button class="btn btn-outline close-modal flex-1">Close</button>
                    ${project.status !== 'completed' 
                        ? `<button class="btn btn-primary flex-1" id="updateStatusBtn">Update Status</button>` 
                        : `<button class="btn btn-primary flex-1" id="downloadReportBtn">Download Report</button>`}
                </div>
            </div>
        `;
    }

    getProjectUpdateContent(project) {
        return `
            <div class="modal-content" style="max-width:500px; width:90%; padding:1rem; background:#1f1f1f; border-radius:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h2 style="color:white; font-weight:700; font-size:1.5rem; margin:0;">Update ${project.title}</h2>
                    <button class="btn-glass btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <form id="projectUpdateForm">
                    <label class="text-white mb-1 block">Status</label>
                    <select name="status" class="glass-input mb-2">
                        <option value="idea" ${project.status==='idea'?'selected':''}>Idea</option>
                        <option value="in_progress" ${project.status==='in_progress'?'selected':''}>In Progress</option>
                        <option value="on_hold" ${project.status==='on_hold'?'selected':''}>On Hold</option>
                        <option value="completed" ${project.status==='completed'?'selected':''}>Completed</option>
                    </select>
                    <label class="text-white mb-1 block">Progress (%)</label>
                    <input type="range" name="progress" min="0" max="100" value="${project.progress}" class="w-full mb-2" oninput="this.nextElementSibling.textContent=this.value+'%'">
                    <div class="text-white text-sm mb-2">${project.progress}%</div>
                    <label class="text-white mb-1 block">Milestones Completed</label>
                    <input type="number" name="milestones" class="glass-input mb-2" min="0" max="${project.milestones.total}" value="${project.milestones.completed}">
                    <button type="submit" class="btn btn-primary w-full mt-2">Update Project</button>
                </form>
            </div>
        `;
    }
}

window.ProjectManager = ProjectManager;
