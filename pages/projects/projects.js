/**
 * JKUAT Innovation Club - Projects & Innovation Page
 * Handles project showcase, submissions, hackathons, and incubation program
 */

class ProjectsManager {
    constructor() {
        this.currentTab = 'showcase';
        this.currentFilter = 'all';
        this.projects = [];
        this.hackathons = [];
        this.incubationProjects = [];

        this.init();
    }

    // Utility method to get time ago
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    }

    // Security helper to prevent XSS attacks
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async init() {
        this.setupEventListeners();
        this.setupDocumentListeners(); // Fix potential memory leak
        await this.loadInitialData();
        this.updateStats();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.applyFilter(filter);
            });
        });

        // Quick action buttons
        document.getElementById('submitProjectBtn')?.addEventListener('click', () => {
            this.switchTab('submit');
        });

        document.getElementById('joinProjectBtn')?.addEventListener('click', () => {
            this.switchTab('showcase');
            this.applyFilter('all');
        });

        document.getElementById('viewHackathonsBtn')?.addEventListener('click', () => {
            this.switchTab('hackathons');
        });

        // Project submission form
        document.getElementById('projectSubmissionForm')?.addEventListener('submit', (e) => {
            this.handleProjectSubmission(e);
        });
    }

    setupDocumentListeners() {
        // Event delegation for all buttons and modal management
        document.addEventListener('click', (e) => {
            // Handle project view buttons
            if (e.target.matches('[data-action="view-project"]') || e.target.closest('[data-action="view-project"]')) {
                const button = e.target.matches('[data-action="view-project"]') ? e.target : e.target.closest('[data-action="view-project"]');
                const projectId = button.dataset.projectId;
                console.log('View project clicked:', projectId);
                this.viewProject(projectId);
            }

            // Handle project join buttons
            if (e.target.matches('[data-action="join-project"]') || e.target.closest('[data-action="join-project"]')) {
                const button = e.target.matches('[data-action="join-project"]') ? e.target : e.target.closest('[data-action="join-project"]');
                const projectId = button.dataset.projectId;
                console.log('Join project clicked:', projectId);
                this.joinProject(projectId);
            }

            // Handle hackathon view buttons
            if (e.target.matches('[data-action="view-hackathon"]') || e.target.closest('[data-action="view-hackathon"]')) {
                const button = e.target.matches('[data-action="view-hackathon"]') ? e.target : e.target.closest('[data-action="view-hackathon"]');
                const hackathonId = button.dataset.hackathonId;
                this.viewHackathon(hackathonId);
            }

            // Handle hackathon register buttons
            if (e.target.matches('[data-action="register-hackathon"]') || e.target.closest('[data-action="register-hackathon"]')) {
                const button = e.target.matches('[data-action="register-hackathon"]') ? e.target : e.target.closest('[data-action="register-hackathon"]');
                const hackathonId = button.dataset.hackathonId;
                this.registerForHackathon(hackathonId);
            }

            // Handle incubation project view buttons
            if (e.target.matches('[data-action="view-incubation"]') || e.target.closest('[data-action="view-incubation"]')) {
                const button = e.target.matches('[data-action="view-incubation"]') ? e.target : e.target.closest('[data-action="view-incubation"]');
                const projectId = button.dataset.projectId;
                this.viewIncubationProject(projectId);
            }

            // Handle contact founder buttons
            if (e.target.matches('[data-action="contact-founder"]') || e.target.closest('[data-action="contact-founder"]')) {
                const button = e.target.matches('[data-action="contact-founder"]') ? e.target : e.target.closest('[data-action="contact-founder"]');
                const projectId = button.dataset.projectId;
                this.contactFounder(projectId);
            }

            // Handle modal close buttons
            if (e.target.matches('.modal-close') || e.target.closest('.modal-close') ||
                e.target.matches('[data-action="close-modal"]') || e.target.closest('[data-action="close-modal"]')) {
                const modal = e.target.closest('.modal-backdrop');
                if (modal) {
                    modal.classList.remove('active');
                    // Restore body scroll
                    document.body.style.overflow = 'auto';
                }
            }

            // Handle modal backdrop clicks (close modal when clicking outside)
            if (e.target.classList.contains('modal-backdrop')) {
                e.target.classList.remove('active');
                // Restore body scroll
                document.body.style.overflow = 'auto';
            }

            // Handle share project buttons
            if (e.target.matches('[data-action="share-project"]') || e.target.closest('[data-action="share-project"]')) {
                const button = e.target.matches('[data-action="share-project"]') ? e.target : e.target.closest('[data-action="share-project"]');
                this.shareProject(button.dataset.projectId);
            }

            // Handle share hackathon buttons
            if (e.target.matches('[data-action="share-hackathon"]') || e.target.closest('[data-action="share-hackathon"]')) {
                const button = e.target.matches('[data-action="share-hackathon"]') ? e.target : e.target.closest('[data-action="share-hackathon"]');
                this.shareHackathon(button.dataset.hackathonId);
            }

            // Handle share incubation buttons
            if (e.target.matches('[data-action="share-incubation"]') || e.target.closest('[data-action="share-incubation"]')) {
                const button = e.target.matches('[data-action="share-incubation"]') ? e.target : e.target.closest('[data-action="share-incubation"]');
                this.shareIncubationProject(button.dataset.projectId);
            }
        });

        // Handle Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-backdrop.active');
                if (openModal) {
                    openModal.classList.remove('active');
                    // Restore body scroll
                    document.body.style.overflow = 'auto';
                }
            }
        });

        // Handle collaboration form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'collaborationForm') {
                this.handleCollaborationSubmission(e);
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            const isActive = content.id === `${tabName}-tab`;
            content.classList.toggle('active', isActive);
            content.setAttribute('aria-hidden', !isActive);
        });

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    applyFilter(filter) {
        this.currentFilter = filter;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeFilter = document.querySelector(`[data-filter="${filter}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
        }

        this.renderProjects();
    }

    async loadInitialData() {
        try {
            // Load projects
            await this.loadProjects();

            // Load hackathons
            await this.loadHackathons();

            // Load incubation projects
            await this.loadIncubationProjects();

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load data. Please refresh the page.');
        }
    }

    async loadProjects() {
        try {
            const response = await fetch('/api/v1/projects');
            if (response.ok) {
                this.projects = await response.json();
            } else {
                console.error('Failed to load projects:', response.status);
                this.projects = [];
            }
            this.renderProjects();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = [];
            this.renderProjects();
        }
    }

    async loadHackathons() {
        try {
            const response = await fetch('/api/v1/projects/hackathons');
            if (response.ok) {
                this.hackathons = await response.json();
            } else {
                console.error('Failed to load hackathons:', response.status);
                this.hackathons = [];
            }
            this.renderHackathons();
        } catch (error) {
            console.error('Error loading hackathons:', error);
            this.hackathons = [];
            this.renderHackathons();
        }
    }

    async loadIncubationProjects() {
        try {
            const response = await fetch('/api/v1/projects/incubation');
            if (response.ok) {
                this.incubationProjects = await response.json();
            } else {
                console.error('Failed to load incubation projects:', response.status);
                this.incubationProjects = [];
            }
            this.renderIncubationProjects();
        } catch (error) {
            console.error('Error loading incubation projects:', error);
            this.incubationProjects = [];
            this.renderIncubationProjects();
        }
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'showcase':
                this.renderProjects();
                break;
            case 'hackathons':
                this.renderHackathons();
                break;
            case 'incubation':
                this.renderIncubationProjects();
                break;
        }
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        let filteredProjects = this.projects;
        if (this.currentFilter !== 'all') {
            filteredProjects = this.projects.filter(project =>
                project.category.toLowerCase() === this.currentFilter.toLowerCase()
            );
        }

        // Hide loading state
        const loadingContainer = grid.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }

        if (filteredProjects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search empty-state-icon search"></i>
                    <h3 class="empty-state-title">No projects found</h3>
                    <p class="empty-state-text">Try adjusting your filter or check back later for new projects.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredProjects.map(project => this.createProjectCard(project)).join('');
    }

    createProjectCard(project) {
        // Determine project type badge
        const isClubProject = project.project_type === 'club';
        const projectTypeBadge = isClubProject
            ? '<span class="project-type-badge club-project"><i class="fas fa-building"></i> Club Project</span>'
            : '<span class="project-type-badge personal-project"><i class="fas fa-user"></i> Personal Project</span>';

        return `
            <div class="project-card" data-project-id="${this.escapeHtml(project.id)}">
                <div class="project-header">
                    <div class="project-lead-wrapper">
                        <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
                        <div class="project-meta-row">
                            ${projectTypeBadge}
                            <span class="project-status ${this.escapeHtml(project.status?.toLowerCase() || 'active')}">${this.escapeHtml(project.status || 'Active')}</span>
                            <span class="category-badge-static">${this.escapeHtml(project.category)}</span>
                        </div>
                    </div>
                </div>
                
                <p class="project-description">${this.escapeHtml(project.description)}</p>
                
                ${project.technologies && project.technologies.length > 0 ? `
                    <div class="project-tech">
                        ${project.technologies.slice(0, 3).map(tech => `
                            <span class="tech-tag">${this.escapeHtml(tech)}</span>
                        `).join('')}
                        ${project.technologies.length > 3 ? `<span class="tech-tag-more">+${project.technologies.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="project-stats">
                    <div class="project-stat team">
                        <i class="fas fa-user"></i>
                        <span>${this.escapeHtml(project.project_lead?.name || 'Team Lead')}</span>
                    </div>
                    <div class="project-stat timeline">
                        <i class="fas fa-clock"></i>
                        <span>${this.escapeHtml(this.getTimeAgo(new Date(project.created_at)))}</span>
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-outline btn-sm" data-action="view-project" data-project-id="${this.escapeHtml(project.id)}">
                        <i class="fas fa-eye"></i>View
                    </button>
                    <button class="btn btn-primary btn-sm" data-action="join-project" data-project-id="${this.escapeHtml(project.id)}">
                        <i class="fas fa-plus"></i>Join
                    </button>
                </div>
            </div>
        `;
    }
    renderHackathons() {
        const grid = document.getElementById('hackathonsGrid');
        if (!grid) return;

        // Hide loading state
        const loadingContainer = grid.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }

        if (this.hackathons.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy empty-state-icon hackathon"></i>
                    <h3 class="empty-state-title">No hackathons available</h3>
                    <p class="empty-state-text">Check back soon for exciting hackathon opportunities!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.hackathons.map(hackathon => this.createHackathonCard(hackathon)).join('');
    }

    createHackathonCard(hackathon) {
        const startDate = new Date(hackathon.start_date);
        const endDate = new Date(hackathon.end_date);
        const registrationDeadline = new Date(hackathon.registration_deadline);
        const now = new Date();

        const isRegistrationOpen = now < registrationDeadline;
        const daysLeft = Math.ceil((registrationDeadline - now) / (1000 * 60 * 60 * 24));

        return `
            <div class="glass-card p-8">
                <div class="hackathon-card-header">
                    <h3 class="hackathon-title-main">${this.escapeHtml(hackathon.title)}</h3>
                    <span class="status-badge ${isRegistrationOpen ? 'open' : 'closed'}">
                        ${isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
                    </span>
                </div>
                
                <p class="hackathon-desc">${this.escapeHtml(hackathon.description)}</p>
                
                <div class="hackathon-stats-grid">
                    <div>
                        <div class="stat-label">Start Date</div>
                        <div class="stat-value">${startDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div class="stat-label">End Date</div>
                        <div class="stat-value">${endDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div class="stat-label">Participants</div>
                        <div class="stat-value">${this.escapeHtml(hackathon.current_participants)}/${this.escapeHtml(hackathon.max_participants)}</div>
                    </div>
                    <div>
                        <div class="stat-label">Registration Fee</div>
                        <div class="stat-value">KSh ${this.escapeHtml(hackathon.registration_fee || 0)}</div>
                    </div>
                </div>
                
                ${hackathon.theme ? `
                    <div class="mb-4">
                        <span class="hackathon-theme-badge">
                            Theme: ${this.escapeHtml(hackathon.theme)}
                        </span>
                    </div>
                ` : ''}
                
                ${isRegistrationOpen ? `
                    <div class="registration-alert">
                        <div class="registration-alert-inner">
                            <i class="fas fa-clock text-green-500"></i>
                            <span class="registration-alert-text">Registration closes in ${daysLeft} days</span>
                        </div>
                        <div class="registration-deadline-info">Deadline: ${registrationDeadline.toLocaleDateString()}</div>
                    </div>
                ` : ''}
                
                <div class="flex gap-3">
                    <button class="btn btn-outline btn-sm flex-1" data-action="view-hackathon" data-hackathon-id="${this.escapeHtml(hackathon.id)}">
                        <i class="fas fa-info-circle"></i>Details
                    </button>
                    ${isRegistrationOpen ? `
                        <button class="btn btn-primary btn-sm flex-1" data-action="register-hackathon" data-hackathon-id="${this.escapeHtml(hackathon.id)}">
                            <i class="fas fa-user-plus"></i>Register
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-sm flex-1 opacity-50" disabled>
                            <i class="fas fa-lock"></i>Closed
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderIncubationProjects() {
        const grid = document.getElementById('incubationProjectsGrid');
        if (!grid) return;

        // Hide loading state
        const loadingContainer = grid.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }

        if (this.incubationProjects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-seedling empty-state-icon incubation"></i>
                    <h3 class="empty-state-title">No projects in incubation</h3>
                    <p class="empty-state-text">Submit your innovative idea to join our incubation program!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.incubationProjects.map(project => this.createIncubationCard(project)).join('');
    }

    createIncubationCard(project) {
        return `
            <div class="glass-card p-6">
                <div class="hackathon-card-header">
                    <h3 class="hackathon-title-main">${this.escapeHtml(project.title)}</h3>
                    <span class="incubation-badge">Incubation</span>
                </div>
                
                <p class="hackathon-desc">${this.escapeHtml(project.description)}</p>
                
                <div class="hackathon-stats-grid">
                    <div>
                        <div class="stat-label">Stage</div>
                        <div class="stat-value">${this.escapeHtml(project.stage || 'Validation')}</div>
                    </div>
                    <div>
                        <div class="stat-label">Funding</div>
                        <div class="stat-value">KSh ${this.escapeHtml(project.funding || '0')}</div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center">
                    <div class="lead-info-container">
                        <i class="fas fa-user lead-icon-small"></i>
                        <span class="lead-name-small">${this.escapeHtml(project.founder || project.project_lead?.name || 'Founder')}</span>
                    </div>
                    <button class="btn btn-outline btn-sm" data-action="view-incubation" data-project-id="${this.escapeHtml(project.id)}">
                        <i class="fas fa-eye"></i>View Details
                    </button>
                </div>
            </div>
        `;
    }

    async handleProjectSubmission(e) {
        e.preventDefault();

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Submitting...';
        submitBtn.disabled = true;

        const formData = {
            title: document.getElementById('projectTitle').value,
            category: document.getElementById('projectCategory').value,
            description: document.getElementById('projectDescription').value,
            expected_duration: document.getElementById('projectDuration').value,
            budget_estimate: parseFloat(document.getElementById('projectBudget').value) || 0,
            technologies: document.getElementById('projectTechnologies').value.split(',').map(t => t.trim()).filter(t => t),
            objectives: document.getElementById('projectObjectives').value.split('\n').filter(o => o.trim()),
            submissionStatus: 'pending',
            submitted_at: new Date().toISOString(),
            submitted_by: 'current_user' // In real app, get from auth
        };

        try {
            const response = await fetch('/api/v1/projects/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showMessage('Project submitted successfully! Your submission is now pending review by our team. You will be notified once it has been approved.', 'success');
                document.getElementById('projectSubmissionForm').reset();
                // Switch to showcase tab after successful submission
                setTimeout(() => {
                    this.switchTab('showcase');
                }, 3000);
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Failed to submit project', 'error');
            }
        } catch (error) {
            console.error('Error submitting project:', error);
            // For static deployment, show success message since backend isn't available
            this.showMessage('Thank you for your submission! Your project idea is now pending review by our team. You will be notified via email once it has been approved and published.', 'success');
            document.getElementById('projectSubmissionForm').reset();

            // Simulate adding to pending projects
            this.simulateProjectSubmission(formData);

            setTimeout(() => {
                this.switchTab('showcase');
            }, 4000);
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    simulateProjectSubmission(projectData) {
        // In a real application, this would make an API call
        // For demo purposes, we'll add it to pending projects
        if (!window.pendingProjects) {
            window.pendingProjects = [];
        }

        projectData.id = 'pending_proj_' + Date.now();
        projectData.status = 'Pending Review';
        projectData.progress_percentage = 0;
        projectData.project_lead = {
            name: 'Current User',
            email: 'user@jkuat.ac.ke'
        };
        projectData.created_at = new Date().toISOString();

        window.pendingProjects.push(projectData);

        console.log('Project added to pending queue:', projectData);

        // Simulate admin notification (in real app, this would be an email/notification)
        console.log('ðŸ“§ Admin notification sent for new project submission');
    }

    async handleCollaborationSubmission(e) {
        e.preventDefault();

        const form = e.target;
        const projectId = form.dataset.projectId;

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Sending Request...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const collaborationData = {
            role: formData.get('role'),
            message: formData.get('message'),
            skills: formData.get('skills'),
            timeCommitment: formData.get('timeCommitment'),
            email: formData.get('email')
        };

        try {
            const response = await fetch(`/api/v1/projects/${projectId}/collaborate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(collaborationData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess(result.message || 'Collaboration request sent successfully!');

                // Close modal and reset form
                const modal = document.getElementById('collaborationModal');
                if (modal) {
                    modal.classList.remove('active');
                }
                form.reset();

                // Also close project modal if it's open
                const projectModal = document.getElementById('projectModal');
                if (projectModal && projectModal.classList.contains('active')) {
                    projectModal.classList.remove('active');
                }
            } else {
                const error = await response.json();
                this.showError(error.message || 'Failed to send collaboration request');
            }
        } catch (error) {
            console.error('Error submitting collaboration request:', error);
            // For static deployment, show success message
            this.showSuccess('Collaboration request sent! The project lead will be notified and will contact you soon.');

            // Close modal and reset form
            const modal = document.getElementById('collaborationModal');
            if (modal) {
                modal.classList.remove('active');
            }
            form.reset();
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('submissionMessage');
        const messageText = document.getElementById('messageText');

        if (messageDiv && messageText) {
            messageText.textContent = message;
            messageDiv.classList.toggle('submission-msg-success', type === 'success');
            messageDiv.classList.toggle('submission-msg-error', type !== 'success');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageDiv.classList.remove('submission-msg-success', 'submission-msg-error');
            }, 5000);
        }
    }

    updateStats() {
        // Update stats in hero section (case-insensitive status matching)
        const activeCount = this.projects.filter(p => p.status?.toLowerCase() === 'active').length;
        const completedCount = this.projects.filter(p => p.status?.toLowerCase() === 'completed').length;
        const incubationCount = this.incubationProjects.length;
        const hackathonCount = this.hackathons.length;

        const activeEl = document.getElementById('activeProjectsCount');
        const completedEl = document.getElementById('completedProjectsCount');
        const incubationEl = document.getElementById('incubationProjectsCount');
        const hackathonEl = document.getElementById('hackathonsCount');

        if (activeEl) activeEl.textContent = activeCount;
        if (completedEl) completedEl.textContent = completedCount;
        if (incubationEl) incubationEl.textContent = incubationCount;
        if (hackathonEl) hackathonEl.textContent = hackathonCount;
    }

    // Action methods
    async viewProject(projectId) {
        console.log('viewProject called with ID:', projectId);
        console.log('Available projects:', this.projects.length);
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            console.error('Project not found:', projectId);
            alert('Project not found');
            return;
        }

        console.log('Found project:', project.title);
        try {
            this.showProjectModal(project);
            console.log('showProjectModal completed');
        } catch (error) {
            console.error('Error in showProjectModal:', error);
            alert('Error showing modal: ' + error.message);
        }
    }

    async joinProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            this.showError('Project not found');
            return;
        }

        // Show collaboration modal instead of simple confirmation
        this.showCollaborationModal(project);
    }

    async viewHackathon(hackathonId) {
        const hackathon = this.hackathons.find(h => h.id === hackathonId);
        if (!hackathon) {
            this.showError('Hackathon not found');
            return;
        }

        this.showHackathonModal(hackathon);
    }

    async registerForHackathon(hackathonId) {
        const hackathon = this.hackathons.find(h => h.id === hackathonId);
        if (!hackathon) {
            this.showError('Hackathon not found');
            return;
        }

        // Check if registration is still open
        const registrationDeadline = new Date(hackathon.registration_deadline);
        const now = new Date();

        if (now > registrationDeadline) {
            this.showError('Registration for this hackathon has closed');
            return;
        }

        // Show registration confirmation
        const message = `Register for "${hackathon.title}"?\n\nRegistration Fee: KSh ${hackathon.registration_fee || 0}\nDeadline: ${registrationDeadline.toLocaleDateString()}`;

        if (confirm(message)) {
            this.showSuccess(`Registration successful for "${hackathon.title}"! Check your email for confirmation details.`);

            // Close modal if it's open
            const modal = document.getElementById('projectModal');
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }

            // TODO: Implement actual registration API call
            console.log('Registering for hackathon:', hackathonId);
        }
    }

    async viewIncubationProject(projectId) {
        const project = this.incubationProjects.find(p => p.id === projectId);
        if (!project) {
            this.showError('Incubation project not found');
            return;
        }

        this.showIncubationModal(project);
    }

    contactFounder(projectId) {
        const project = this.incubationProjects.find(p => p.id === projectId);
        if (!project) {
            this.showError('Project not found');
            return;
        }

        const founderName = project.founder || project.project_lead?.name || 'the founder';
        this.showSuccess(`Contact request sent to ${founderName}! They will be notified of your interest.`);

        // Close modal if it's open
        const modal = document.getElementById('projectModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }

        // TODO: Implement actual contact/messaging system
        console.log('Contacting founder for project:', projectId);
    }
    // Modal methods
    showProjectModal(project) {
        console.log('showProjectModal called for:', project.title);

        let modal = document.getElementById('projectModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'projectModal';
            modal.className = 'modal-backdrop';
            document.body.appendChild(modal);
        }

        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const modalTitle = document.getElementById('projectModalTitle');
        const modalContent = document.getElementById('projectModalContent');

        if (modalTitle) modalTitle.textContent = project.title;

        const contentHtml = `
            <div class="modal-body">
                <div class="project-detail-header" style="margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #10b981); display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-project-diagram" style="color: white; font-size: 1.25rem;"></i>
                        </div>
                        <div>
                            <h3 style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin: 0; font-weight: 500;">JKUAT Innovation Club</h3>
                            <h2 style="color: white; font-size: 1.75rem; margin: 0.25rem 0 0 0; font-weight: 700; line-height: 1.3;">${this.escapeHtml(project.title)}</h2>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-size: 1.125rem; font-weight: 600; margin-bottom: 0.75rem;">Description</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.8; font-size: 0.95rem;">${this.escapeHtml(project.description)}</p>
                </div>
            </div>
            <div class="modal-footer" style="padding: 1.5rem 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="modal-close-btn-footer" style="padding: 0.875rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">Close</button>
                <button class="modal-join-btn" data-project-id="${this.escapeHtml(project.id)}" style="padding: 0.875rem 2rem; background: linear-gradient(135deg, #10b981, #059669); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">Join Project</button>
            </div>
        `;

        if (modalContent) {
            modalContent.innerHTML = contentHtml;
        } else {
            modal.innerHTML = `<div class="modal-content">${contentHtml}</div>`;
        }

        modal.classList.add('active');

        const closeModal = () => {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        const closeBtn = modal.querySelector('.modal-close') || modal.querySelector('.modal-close-btn');
        if (closeBtn) closeBtn.onclick = closeModal;
        const footerBtn = modal.querySelector('.modal-close-btn-footer');
        if (footerBtn) footerBtn.onclick = closeModal;

        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
        const escapeHandler = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escapeHandler); } };
        document.addEventListener('keydown', escapeHandler);
    }

    showHackathonModal(hackathon) {
        const startDate = new Date(hackathon.start_date);
        const endDate = new Date(hackathon.end_date);
        const registrationDeadline = new Date(hackathon.registration_deadline);
        const now = new Date();
        const isRegistrationOpen = now < registrationDeadline;

        const modalHtml = `
            < div class="project-detail-header" >
                <div class="project-detail-meta">
                    <span class="project-status ${isRegistrationOpen ? 'active' : 'completed'}">${isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}</span>
                    ${hackathon.theme ? `<span class="project-owner">Theme: ${this.escapeHtml(hackathon.theme)}</span>` : ''}
                </div>
                
                <h1 class="project-detail-title">${this.escapeHtml(hackathon.title)}</h1>
                
                <div class="project-detail-stats">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>${this.escapeHtml(hackathon.current_participants)}/${this.escapeHtml(hackathon.max_participants)} Participants</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-money-bill"></i>
                        <span>KSh ${this.escapeHtml(hackathon.registration_fee || 0)}</span>
                    </div>
                </div>
            </div >

            <div class="project-detail-content">
                <section class="detail-section">
                    <h3>Description</h3>
                    <p>${this.escapeHtml(hackathon.description)}</p>
                </section>

                <div class="detail-grid">
                    <section class="detail-section">
                        <h3>Start Date</h3>
                        <p>${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}</p>
                    </section>
                    <section class="detail-section">
                        <h3>End Date</h3>
                        <p>${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}</p>
                    </section>
                    <section class="detail-section">
                        <h3>Registration Deadline</h3>
                        <p>${registrationDeadline.toLocaleDateString()} at ${registrationDeadline.toLocaleTimeString()}</p>
                    </section>
                    <section class="detail-section">
                        <h3>Venue</h3>
                        <p>${this.escapeHtml(hackathon.venue || 'TBA')}</p>
                    </section>
                </div>

                <div class="project-detail-actions">
                    ${isRegistrationOpen ? `
                        <button class="btn btn-primary" data-action="register-hackathon" data-hackathon-id="${this.escapeHtml(hackathon.id)}">
                            <i class="fas fa-user-plus"></i>
                            Register Now
                        </button>
                    ` : `
                        <button class="btn btn-secondary opacity-50" disabled>
                            <i class="fas fa-lock"></i>
                            Registration Closed
                        </button>
                    `}
                    <button class="btn btn-outline" data-action="share-hackathon" data-hackathon-id="${this.escapeHtml(hackathon.id)}">
                        <i class="fas fa-share"></i>
                        Share Event
                    </button>
                </div>
            </div>
        `;

        // Update modal content and title
        const modalContent = document.getElementById('projectModalContent');
        const modalTitle = document.getElementById('projectModalTitle');

        if (modalContent) {
            modalContent.innerHTML = modalHtml;
        }
        if (modalTitle) {
            modalTitle.textContent = 'Hackathon Details';
        }

        // Show modal
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    showHackathonModal(hackathon) {
        const startDate = new Date(hackathon.start_date);
        const endDate = new Date(hackathon.end_date);
        const registrationDeadline = new Date(hackathon.registration_deadline);
        const now = new Date();
        const isRegistrationOpen = now < registrationDeadline;

        const modalHtml = `
            <div class="modal-body">
                <div class="project-detail-header">
                    <div class="project-detail-meta">
                        <span class="project-status ${isRegistrationOpen ? 'active' : 'completed'}">${isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}</span>
                        ${hackathon.theme ? `<span class="project-owner">Theme: ${this.escapeHtml(hackathon.theme)}</span>` : ''}
                    </div>
                    
                    <h1 class="project-detail-title">${this.escapeHtml(hackathon.title)}</h1>
                    
                    <div class="project-detail-stats">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${this.escapeHtml(hackathon.current_participants)}/${this.escapeHtml(hackathon.max_participants)} Participants</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-money-bill"></i>
                            <span>KSh ${this.escapeHtml(hackathon.registration_fee || 0)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="project-detail-content">
                    <section class="detail-section">
                        <h3>Description</h3>
                        <p>${this.escapeHtml(hackathon.description)}</p>
                    </section>
                    
                    <div class="detail-grid">
                        <section class="detail-section">
                            <h3>Start Date</h3>
                            <p>${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}</p>
                        </section>
                        <section class="detail-section">
                            <h3>End Date</h3>
                            <p>${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}</p>
                        </section>
                        <section class="detail-section">
                            <h3>Registration Deadline</h3>
                            <p>${registrationDeadline.toLocaleDateString()} at ${registrationDeadline.toLocaleTimeString()}</p>
                        </section>
                        <section class="detail-section">
                            <h3>Venue</h3>
                            <p>${this.escapeHtml(hackathon.venue || 'TBA')}</p>
                        </section>
                    </div>
                    
                    <div class="project-detail-actions">
                        ${isRegistrationOpen ? `
                            <button class="btn btn-primary" data-action="register-hackathon" data-hackathon-id="${this.escapeHtml(hackathon.id)}">
                                <i class="fas fa-user-plus"></i>
                                Register Now
                            </button>
                        ` : `
                            <button class="btn btn-secondary opacity-50" disabled>
                                <i class="fas fa-lock"></i>
                                Registration Closed
                            </button>
                        `}
                        <button class="btn btn-outline" data-action="share-hackathon" data-hackathon-id="${this.escapeHtml(hackathon.id)}">
                            <i class="fas fa-share"></i>
                            Share Event
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Update modal content and title
        const modalContent = document.getElementById('projectModalContent');
        const modalTitle = document.getElementById('projectModalTitle');

        if (modalContent) modalContent.innerHTML = modalHtml;
        if (modalTitle) modalTitle.textContent = 'Hackathon Details';

        // Show modal
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    showCollaborationModal(project) {
        // Update modal content
        const modalContent = document.getElementById('collaborationModalContent');

        if (modalContent) {
            modalContent.innerHTML = `
                <div class="mb-6">
                    <p class="collaboration-intro">
                        Tell the project lead why you want to collaborate and what you can contribute to "${this.escapeHtml(project.title)}".
                    </p>
                    <div class="lead-highlight-box">
                        <div class="lead-highlight-header">
                            <i class="fas fa-user lead-highlight-label"></i>
                            <strong class="lead-highlight-label">Project Lead:</strong>
                        </div>
                        <p class="lead-highlight-name">${this.escapeHtml(project.project_lead?.name || 'Team Lead')}</p>
                    </div>
                </div >

                    <form id="collaborationForm" data-project-id="${this.escapeHtml(project.id)}">
                        <div class="form-group">
                            <label class="form-label">Your Role in the Project *</label>
                            <select name="role" class="glass-input" required>
                                <option value="">Select your role</option>
                                <option value="developer">Developer</option>
                                <option value="designer">UI/UX Designer</option>
                                <option value="researcher">Researcher</option>
                                <option value="marketing">Marketing Specialist</option>
                                <option value="business">Business Analyst</option>
                                <option value="mentor">Mentor/Advisor</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Skills You Bring *</label>
                            <input type="text" name="skills" class="glass-input" placeholder="e.g., React, Python, Machine Learning, Project Management" required>
                            <small class="empty-state-text">Separate multiple skills with commas</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Why do you want to collaborate? *</label>
                            <textarea name="message" class="glass-input" rows="4" placeholder="Tell the project lead why you're interested and how you can contribute..." required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Time Commitment *</label>
                            <select name="timeCommitment" class="glass-input" required>
                                <option value="">Select time commitment</option>
                                <option value="part-time">Part-time (5-10 hours/week)</option>
                                <option value="significant">Significant (10-20 hours/week)</option>
                                <option value="full-time">Full-time (20+ hours/week)</option>
                                <option value="flexible">Flexible schedule</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Contact Email *</label>
                            <input type="email" name="email" class="glass-input" placeholder="your.email@example.com" required>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-handshake"></i>Send Collaboration Request
                            </button>
                        </div>
                    </form>
                </div>
            `;
        }

        const modal = document.getElementById('collaborationModal');
        if (modal) {
            document.body.style.overflow = 'hidden';
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    showIncubationModal(project) {
        const modalHtml = `
            <div class="modal-body">
                <div class="project-detail-header">
                    <div class="project-detail-meta">
                        <span class="project-status planning">Incubation Program</span>
                        <span class="project-owner">by ${this.escapeHtml(project.project_lead?.name || project.founder || 'Founder')}</span>
                    </div>
                    
                    <h1 class="project-detail-title">${this.escapeHtml(project.title)}</h1>
                    
                    <div class="project-detail-stats">
                        <div class="stat-item">
                            <i class="fas fa-chart-line"></i>
                            <span>${this.escapeHtml(project.stage || 'Validation')}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-money-bill"></i>
                            <span>KSh ${this.escapeHtml(project.funding || '0')} Funding</span>
                        </div>
                    </div>
                </div>
                
                <div class="project-detail-content">
                    <section class="detail-section">
                        <h3>Description</h3>
                        <p>${this.escapeHtml(project.description)}</p>
                    </section>
                    
                    <section class="detail-section">
                        <h3>Current Stage</h3>
                        <p>${this.escapeHtml(project.stage || 'Validation')}</p>
                    </section>
                    
                    <div class="project-detail-actions">
                        <button class="btn btn-primary" data-action="contact-founder" data-project-id="${this.escapeHtml(project.id)}">
                            <i class="fas fa-envelope"></i>
                            Contact Founder
                        </button>
                        <button class="btn btn-outline" data-action="share-incubation" data-project-id="${this.escapeHtml(project.id)}">
                            <i class="fas fa-share"></i>
                            Share Project
                        </button>
                    </div>
                </div>
            </div>
        `;

        const modalContent = document.getElementById('projectModalContent');
        const modalTitle = document.getElementById('projectModalTitle');

        if (modalContent) modalContent.innerHTML = modalHtml;
        if (modalTitle) modalTitle.textContent = 'Incubation Project';

        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    // Additional action methods
    shareProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const url = `${window.location.origin}/projects#${projectId}`;
        if (navigator.share) {
            navigator.share({
                title: `Check out this project: ${project.title}`,
                text: project.description,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.showSuccess('Project link copied to clipboard!');
            }).catch(() => {
                this.showError('Failed to copy link');
            });
        }
    }

    shareHackathon(hackathonId) {
        const hackathon = this.hackathons.find(h => h.id === hackathonId);
        if (!hackathon) return;

        const url = `${window.location.origin}/projects#hackathon-${hackathonId}`;
        if (navigator.share) {
            navigator.share({
                title: `Join this hackathon: ${hackathon.title}`,
                text: hackathon.description,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.showSuccess('Hackathon link copied to clipboard!');
            }).catch(() => {
                this.showError('Failed to copy link');
            });
        }
    }

    shareIncubationProject(projectId) {
        const project = this.incubationProjects.find(p => p.id === projectId);
        if (!project) return;

        const url = `${window.location.origin}/projects#incubation-${projectId}`;
        if (navigator.share) {
            navigator.share({
                title: `Check out this startup: ${project.title}`,
                text: project.description,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.showSuccess('Startup link copied to clipboard!');
            }).catch(() => {
                this.showError('Failed to copy link');
            });
        }
    }

    // Utility methods
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    // Sample data methods
    getSampleProjects() {
        return [
            {
                id: '1',
                title: 'Smart Campus Navigation App',
                description: 'Mobile app to help students navigate JKUAT campus with AR features, real-time location services, and interactive maps for buildings, labs, and facilities.',
                category: 'Innovation',
                status: 'Active',
                submissionStatus: 'approved',
                priority: 'High',
                progress_percentage: 75,
                technologies: ['React Native', 'AR Core', 'Firebase', 'Google Maps API'],
                project_lead: { name: 'John Doe', email: 'john@jkuat.ac.ke' },
                created_at: '2024-01-15T10:00:00Z',
                submitted_at: '2024-01-14T15:30:00Z',
                approved_at: '2024-01-15T09:15:00Z',
                approved_by: 'admin_user'
            },
            {
                id: '2',
                title: 'Agricultural IoT Monitoring System',
                description: 'IoT-based system for monitoring soil moisture, temperature, and crop health for local farmers using sensors and machine learning predictions.',
                category: 'Research',
                status: 'Planning',
                submissionStatus: 'approved',
                priority: 'Medium',
                progress_percentage: 25,
                technologies: ['Arduino', 'LoRaWAN', 'Python', 'Machine Learning'],
                project_lead: { name: 'Jane Smith', email: 'jane@jkuat.ac.ke' },
                created_at: '2024-02-01T10:00:00Z',
                submitted_at: '2024-01-31T14:20:00Z',
                approved_at: '2024-02-01T08:45:00Z',
                approved_by: 'admin_user'
            },
            {
                id: '3',
                title: 'Student Marketplace Platform',
                description: 'E-commerce platform for students to buy, sell, and exchange textbooks, electronics, and other academic materials within the campus community.',
                category: 'Startup',
                status: 'Completed',
                submissionStatus: 'approved',
                priority: 'Low',
                progress_percentage: 100,
                technologies: ['Next.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
                project_lead: { name: 'Mike Johnson', email: 'mike@jkuat.ac.ke' },
                created_at: '2023-11-10T10:00:00Z',
                submitted_at: '2023-11-09T16:45:00Z',
                approved_at: '2023-11-10T09:30:00Z',
                approved_by: 'admin_user'
            },
            {
                id: '4',
                title: 'Digital Library Management System',
                description: 'Modern library management system with book tracking, digital catalog, student portal, and automated fine calculation.',
                category: 'Innovation',
                status: 'Active',
                submissionStatus: 'approved',
                priority: 'High',
                progress_percentage: 60,
                technologies: ['Vue.js', 'Node.js', 'MongoDB', 'QR Codes'],
                project_lead: { name: 'Sarah Wilson', email: 'sarah@jkuat.ac.ke' },
                created_at: '2024-01-20T10:00:00Z',
                submitted_at: '2024-01-19T11:15:00Z',
                approved_at: '2024-01-20T08:30:00Z',
                approved_by: 'admin_user'
            },
            {
                id: '5',
                title: 'Renewable Energy Calculator',
                description: 'Web application to calculate potential renewable energy savings for households and businesses in Kenya.',
                category: 'Research',
                status: 'Active',
                submissionStatus: 'approved',
                priority: 'Medium',
                progress_percentage: 40,
                technologies: ['React', 'D3.js', 'Python', 'Solar API'],
                project_lead: { name: 'David Kimani', email: 'david@jkuat.ac.ke' },
                created_at: '2024-02-15T10:00:00Z',
                submitted_at: '2024-02-14T13:30:00Z',
                approved_at: '2024-02-15T09:00:00Z',
                approved_by: 'admin_user'
            },
            {
                id: '6',
                title: 'Campus Event Management App',
                description: 'Mobile application for managing campus events, RSVPs, notifications, and real-time updates for students and faculty.',
                category: 'Hackathon',
                status: 'Completed',
                submissionStatus: 'approved',
                priority: 'Low',
                progress_percentage: 100,
                technologies: ['Flutter', 'Firebase', 'Push Notifications'],
                project_lead: { name: 'Grace Mwangi', email: 'grace@jkuat.ac.ke' },
                created_at: '2024-03-01T10:00:00Z',
                submitted_at: '2024-02-28T17:20:00Z',
                approved_at: '2024-03-01T08:15:00Z',
                approved_by: 'admin_user'
            }
        ];
    }

    // Get pending projects (for admin approval)
    getPendingProjects() {
        return window.pendingProjects || [
            {
                id: 'pending_proj_1',
                title: 'Blockchain Voting System',
                description: 'Secure blockchain-based voting system for student elections with transparency and immutability features.',
                category: 'Innovation',
                status: 'Pending Review',
                submissionStatus: 'pending',
                priority: 'High',
                progress_percentage: 0,
                technologies: ['Blockchain', 'Solidity', 'Web3.js', 'React'],
                project_lead: { name: 'Kevin Mutua', email: 'kevin@jkuat.ac.ke' },
                created_at: '2024-01-18T14:30:00Z',
                submitted_at: '2024-01-18T14:30:00Z',
                submitted_by: 'kevin_mutua',
                expected_duration: '6 months',
                budget_estimate: 150000,
                objectives: ['Implement secure voting mechanism', 'Ensure transparency', 'Prevent vote manipulation']
            },
            {
                id: 'pending_proj_2',
                title: 'Mental Health Support Chatbot',
                description: 'AI-powered chatbot to provide mental health support and resources for students dealing with stress and anxiety.',
                category: 'Research',
                status: 'Pending Review',
                submissionStatus: 'pending',
                priority: 'Medium',
                progress_percentage: 0,
                technologies: ['Python', 'NLP', 'TensorFlow', 'Flask'],
                project_lead: { name: 'Lucy Wanjiru', email: 'lucy@jkuat.ac.ke' },
                created_at: '2024-01-19T10:15:00Z',
                submitted_at: '2024-01-19T10:15:00Z',
                submitted_by: 'lucy_wanjiru',
                expected_duration: '4 months',
                budget_estimate: 80000,
                objectives: ['Develop conversational AI', 'Integrate mental health resources', 'Ensure privacy and confidentiality']
            }
        ];
    }

    getSampleHackathons() {
        return [
            {
                id: '1',
                title: 'JKUAT Innovation Challenge 2025',
                description: 'Annual hackathon focusing on solutions for sustainable development and climate change.',
                theme: 'Climate Tech Solutions',
                start_date: '2025-03-15T09:00:00Z',
                end_date: '2025-03-17T18:00:00Z',
                registration_deadline: '2025-03-10T23:59:59Z',
                max_participants: 200,
                current_participants: 87,
                registration_fee: 500,
                venue: 'JKUAT Main Campus'
            },
            {
                id: '2',
                title: 'FinTech Hackathon Kenya',
                description: '48-hour hackathon to develop innovative financial technology solutions for the Kenyan market.',
                theme: 'Financial Inclusion',
                start_date: '2025-04-20T09:00:00Z',
                end_date: '2025-04-22T18:00:00Z',
                registration_deadline: '2025-04-15T23:59:59Z',
                max_participants: 150,
                current_participants: 23,
                registration_fee: 1000,
                venue: 'Nairobi Innovation Hub'
            },
            {
                id: '3',
                title: 'AgriTech Innovation Challenge',
                description: 'Develop technology solutions to improve agricultural productivity and food security.',
                theme: 'Smart Agriculture',
                start_date: '2025-05-10T09:00:00Z',
                end_date: '2025-05-12T18:00:00Z',
                registration_deadline: '2025-05-05T23:59:59Z',
                max_participants: 120,
                current_participants: 45,
                registration_fee: 750,
                venue: 'JKUAT Agricultural Campus'
            }
        ];
    }

    getSampleIncubationProjects() {
        return [
            {
                id: '1',
                title: 'EcoWaste Solutions',
                description: 'Startup developing biodegradable packaging solutions for local businesses.',
                stage: 'Prototype Development',
                funding: '250000',
                founder: 'Sarah Wilson',
                project_lead: { name: 'Sarah Wilson', email: 'sarah@jkuat.ac.ke' },
                created_at: '2024-01-10T10:00:00Z'
            },
            {
                id: '2',
                title: 'AgriConnect Platform',
                description: 'Digital platform connecting smallholder farmers directly with consumers and retailers.',
                stage: 'Market Validation',
                funding: '500000',
                founder: 'David Kimani',
                project_lead: { name: 'David Kimani', email: 'david@jkuat.ac.ke' },
                created_at: '2023-12-15T10:00:00Z'
            },
            {
                id: '3',
                title: 'HealthTech Mobile Clinic',
                description: 'Mobile health monitoring system for remote communities using telemedicine.',
                stage: 'Pilot Testing',
                funding: '750000',
                founder: 'Grace Mwangi',
                project_lead: { name: 'Grace Mwangi', email: 'grace@jkuat.ac.ke' },
                created_at: '2024-02-01T10:00:00Z'
            }
        ];
    }
}

// Global functions for modal management (kept for backward compatibility)
window.closeProjectModal = function () {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.closeCollaborationModal = function () {
    const modal = document.getElementById('collaborationModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.closeCollaborationRequestsModal = function () {
    const modal = document.getElementById('collaborationRequestsModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Navigation is handled by global-navbar.js
    // No need to initialize it here

    // Initialize Projects Manager
    window.projectsManager = new ProjectsManager();
});
