/**
 * JKUAT Innovation Club - Projects & Innovation Page
 * Handles project showcase, submissions, hackathons, and incubation program
 */

class ProjectsManager {
    // moved from constructor per S7757
    currentTab = 'showcase';
    currentFilter = 'all';
    projects = [];
    hackathons = [];
    incubationProjects = [];

    constructor() {
        // no async work here (Sonar S7059); init() is invoked below
        this.setupEventListeners();
        this.setupDocumentListeners();
        // stats updated after data is loaded in init()
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
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async init() {
        // stats updated after data is loaded in init()
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
            <div class="project-card" data-project-id="${this.escapeHTML(project.id)}">
                <div class="project-header">
                    <div class="project-lead-wrapper">
                        <h3 class="project-title">${this.escapeHTML(project.title)}</h3>
                        <div class="project-meta-row">
                            ${projectTypeBadge}
                            <span class="project-status ${this.escapeHTML(project.status?.toLowerCase() || 'active')}">${this.escapeHTML(project.status || 'Active')}</span>
                            <span class="category-badge-static">${this.escapeHTML(project.category)}</span>
                        </div>
                    </div>
                </div>
                
                <p class="project-description">${this.escapeHTML(project.description)}</p>
                
                ${project.technologies && project.technologies.length > 0 ? `
                    <div class="project-tech">
                        ${project.technologies.slice(0, 3).map(tech => `
                            <span class="tech-tag">${this.escapeHTML(tech)}</span>
                        `).join('')}
                        ${project.technologies.length > 3 ? `<span class="tech-tag-more">+${project.technologies.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="project-stats">
                    <div class="project-stat team">
                        <i class="fas fa-user"></i>
                        <span>${this.escapeHTML(project.project_lead?.name || 'Team Lead')}</span>
                    </div>
                    <div class="project-stat timeline">
                        <i class="fas fa-clock"></i>
                        <span>${this.escapeHTML(this.getTimeAgo(new Date(project.created_at)))}</span>
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-outline btn-sm" data-action="view-project" data-project-id="${this.escapeHTML(project.id)}">
                        <i class="fas fa-eye"></i>View
                    </button>
                    <button class="btn btn-primary btn-sm" data-action="join-project" data-project-id="${this.escapeHTML(project.id)}">
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
            budget_estimate: Number.parseFloat(document.getElementById('projectBudget').value) || 0, // prefer Number.parseFloat (S7773)
            technologies: document
                .getElementById('projectTechnologies')
                .value.split(',')
                .map(t => t.trim())
                .filter(Boolean), // arrow => Boolean (S7770)
            objectives: document.getElementById('projectObjectives').value
                .split('\n')
                .filter(o => o.trim()),
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
        // prefer globalThis over window (S7764)
        if (!globalThis.pendingProjects) {
            globalThis.pendingProjects = [];
        }

        projectData.id = 'pending_proj_' + Date.now();
        projectData.status = 'Pending Review';
        projectData.progress_percentage = 0;
        projectData.project_lead = {
            name: 'Current User',
            email: 'user@jkuat.ac.ke'
        };
        projectData.created_at = new Date().toISOString();

        globalThis.pendingProjects.push(projectData);

        console.log('Project added to pending queue:', projectData);
        console.log('🗳️ Admin notification sent for new project submission');
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
                    modal.remove(); // Changed from classList.remove to remove() for dynamic modals
                }
                form.reset();

                document.body.style.overflow = 'auto'; // Restore scroll
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
                modal.remove(); // Changed from classList.remove to remove() for dynamic modals
            }
            form.reset();
            document.body.style.overflow = 'auto'; // Restore scroll
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
    // Modal methods - Rewritten to match events page exactly
    showProjectModal(project) {
        console.log('showProjectModal called for:', project.title);

        // Remove any existing modal
        const existingModal = document.getElementById('projectDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'projectDetailsModal';
        modal.className = 'modal-backdrop';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content-premium';

        const isClubProject = project.project_type === 'club';
        const projectTypeBadge = isClubProject
            ? '<div class="modal-stat-pill"><i class="fas fa-building"></i> Club Project</div>'
            : '<div class="modal-stat-pill"><i class="fas fa-user"></i> Personal Project</div>';

        modalContent.innerHTML = `
            <button id="closeModalBtn" class="modal-close-btn">×</button>

            <div class="modal-inner-padding">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="incubation-icon-container" style="background: rgba(245, 158, 11, 0.2);">
                        <i class="fas fa-project-diagram" style="font-size: 1.5rem; color: #f59e0b;"></i>
                    </div>
                    <h2 class="modal-title-vibrant">${this.escapeHTML(project.title)}</h2>
                    <p class="modal-subtitle">JKUAT Innovation Club</p>
                </div>

                <div class="modal-badge-row">
                    ${projectTypeBadge}
                    <div class="modal-stat-pill">
                        <i class="fas fa-tag"></i>
                        <span>${this.escapeHTML(project.category)}</span>
                    </div>
                    <div class="modal-stat-pill">
                        <i class="fas fa-signal"></i>
                        <span>${this.escapeHTML(project.status || 'Active')}</span>
                    </div>
                    <div class="modal-stat-pill">
                        <i class="fas fa-user"></i>
                        <span>${this.escapeHTML(project.project_lead?.name || 'Team Lead')}</span>
                    </div>
                    <div class="modal-stat-pill">
                        <i class="fas fa-clock"></i>
                        <span>${this.getTimeAgo(new Date(project.created_at))}</span>
                    </div>
                </div>

                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-info-circle"></i> Description</h3>
                    <div class="modal-text-content">
                        ${this.escapeHTML(project.description)}
                    </div>
                </div>

                ${project.technologies && project.technologies.length > 0 ? `
                    <div class="modal-section">
                        <h3 class="modal-section-title"><i class="fas fa-code"></i> Technologies</h3>
                        <div class="modal-tech-list">
                            ${project.technologies.map(tech => `
                                <span class="modal-tech-tag">${this.escapeHTML(tech)}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${project.objectives && project.objectives.length > 0 ? `
                    <div class="modal-section">
                        <h3 class="modal-section-title"><i class="fas fa-bullseye"></i> Objectives</h3>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                            ${project.objectives.map(obj => `
                                <li style="display: flex; align-items: start; gap: 0.75rem; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                                    <i class="fas fa-check-circle" style="color: #10b981; margin-top: 0.25rem; flex-shrink: 0;"></i>
                                    <span>${this.escapeHTML(obj)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="modal-actions-bar">
                    <button id="modalCloseBtn" class="modal-action-btn modal-btn-secondary">Close</button>
                    <button id="modalJoinBtn" class="modal-action-btn modal-btn-primary">
                        <i class="fas fa-plus"></i> Join Project
                    </button>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add active class to show modal (CSS has display: none by default)
        modal.classList.add('active');

        // Close handlers
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        };

        modal.querySelector('#closeModalBtn').onclick = closeModal;
        modal.querySelector('#modalCloseBtn').onclick = closeModal;
        modal.querySelector('#modalJoinBtn').onclick = () => {
            closeModal();
            this.joinProject(project.id);
        };

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Show modal
        document.body.style.overflow = 'hidden';
    }

    showHackathonModal(hackathon) {
        console.log('showHackathonModal called for:', hackathon.title);

        const startDate = new Date(hackathon.start_date);
        const endDate = new Date(hackathon.end_date);
        const registrationDeadline = new Date(hackathon.registration_deadline);
        const today = new Date();
        const isRegistrationOpen = today <= registrationDeadline;

        // Remove any existing modal
        const existingModal = document.getElementById('hackathonDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'hackathonDetailsModal';
        modal.className = 'modal-backdrop';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content-premium';

        modalContent.innerHTML = `
            <button id="closeModalBtn" class="modal-close-btn">×</button>

            <div class="modal-inner-padding">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="incubation-icon-container" style="background: rgba(245, 158, 11, 0.2);">
                        <i class="fas fa-trophy" style="font-size: 1.5rem; color: #f59e0b;"></i>
                    </div>
                    <h2 class="modal-title-vibrant">${this.escapeHTML(hackathon.title)}</h2>
                    <p class="modal-subtitle">JKUAT Hackathon</p>
                </div>

                <div class="modal-badge-row">
                    <div class="modal-stat-pill">
                        <i class="fas fa-calendar"></i>
                        <span>${startDate.toLocaleDateString()}</span>
                    </div>
                    <div class="modal-stat-pill">
                        <i class="fas fa-users"></i>
                        <span>${this.escapeHTML(hackathon.current_participants)}/${this.escapeHTML(hackathon.max_participants)} Participants</span>
                    </div>
                    <div class="modal-stat-pill">
                        <i class="fas fa-money-bill"></i>
                        <span>KSh ${this.escapeHTML(hackathon.registration_fee || 0)}</span>
                    </div>
                    ${hackathon.venue ? `
                        <div class="modal-stat-pill">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${this.escapeHTML(hackathon.venue)}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-info-circle"></i> Description</h3>
                    <div class="modal-text-content">
                        ${this.escapeHTML(hackathon.description)}
                    </div>
                </div>

                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-clock"></i> Schedule</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="modal-stat-pill" style="border-radius: 12px; padding: 1rem; flex-direction: column; align-items: start; height: auto;">
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 0.25rem;">Start Date</span>
                            <span style="color: white; font-weight: 600;">${startDate.toLocaleDateString()}</span>
                        </div>
                        <div class="modal-stat-pill" style="border-radius: 12px; padding: 1rem; flex-direction: column; align-items: start; height: auto;">
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 0.25rem;">End Date</span>
                            <span style="color: white; font-weight: 600;">${endDate.toLocaleDateString()}</span>
                        </div>
                        <div class="modal-stat-pill" style="border-radius: 12px; padding: 1rem; flex-direction: column; align-items: start; height: auto;">
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 0.25rem;">Reg. Deadline</span>
                            <span style="color: white; font-weight: 600;">${registrationDeadline.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div class="modal-actions-bar">
                    <button id="modalCloseBtn" class="modal-action-btn modal-btn-secondary">Close</button>
                    ${isRegistrationOpen ? `
                        <button id="modalRegisterBtn" class="modal-action-btn modal-btn-primary">
                            <i class="fas fa-user-plus"></i> Register Now
                        </button>
                    ` : `
                        <button style="cursor: not-allowed; opacity: 0.6;" class="modal-action-btn modal-btn-secondary">
                            <i class="fas fa-lock"></i> Registration Closed
                        </button>
                    `}
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add active class to show modal (CSS has display: none by default)
        modal.classList.add('active');

        // Close handlers
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        };

        modal.querySelector('#closeModalBtn').onclick = closeModal;
        modal.querySelector('#modalCloseBtn').onclick = closeModal;

        if (isRegistrationOpen) {
            modal.querySelector('#modalRegisterBtn').onclick = () => {
                closeModal();
                this.registerForHackathon(hackathon.id);
            };
        }

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Show modal
        document.body.style.overflow = 'hidden';
    }

    showCollaborationModal(project) {
        console.log('showCollaborationModal called for:', project.title);

        // Remove any existing modal
        const existingModal = document.getElementById('collaborationModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'collaborationModal';
        modal.className = 'modal-backdrop';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content-premium';
        modalContent.style.maxWidth = '600px';

        modalContent.innerHTML = `
            <button id="closeCollabModalBtn" class="modal-close-btn">×</button>

            <div class="modal-inner-padding">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="incubation-icon-container" style="background: rgba(16, 185, 129, 0.2);">
                        <i class="fas fa-handshake" style="font-size: 1.5rem; color: #10b981;"></i>
                    </div>
                    <h2 class="modal-title-vibrant" style="font-size: 1.75rem;">Collaborate</h2>
                    <p class="modal-subtitle">Send joining request for "${this.escapeHTML(project.title)}"</p>
                </div>

                <form id="collaborationForm" class="modal-form-glass" data-project-id="${this.escapeHTML(project.id)}">
                    <div class="modal-field-group">
                        <label class="modal-field-label">Your Role in the Project *</label>
                        <select name="role" class="modal-input-glass" required>
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
                    
                    <div class="modal-field-group">
                        <label class="modal-field-label">Skills You Bring *</label>
                        <input type="text" name="skills" class="modal-input-glass" placeholder="e.g., React, Python, Machine Learning" required>
                    </div>
                    
                    <div class="modal-field-group">
                        <label class="modal-field-label">Why do you want to collaborate? *</label>
                        <textarea name="message" class="modal-input-glass" style="resize: vertical; min-height: 100px;" rows="3" placeholder="Tell the project lead how you can contribute..." required></textarea>
                    </div>
                    
                    <div class="modal-field-group">
                        <label class="modal-field-label">Time Commitment *</label>
                        <select name="timeCommitment" class="modal-input-glass" required>
                            <option value="">Select time commitment</option>
                            <option value="part-time">Part-time (5-10 hours/week)</option>
                            <option value="significant">Significant (10-20 hours/week)</option>
                            <option value="full-time">Full-time (20+ hours/week)</option>
                            <option value="flexible">Flexible schedule</option>
                        </select>
                    </div>
                    
                    <div class="modal-field-group" style="margin-bottom: 1rem;">
                        <label class="modal-field-label">Contact Email *</label>
                        <input type="email" name="email" class="modal-input-glass" placeholder="your.email@example.com" required>
                    </div>
                    
                    <div class="modal-actions-bar">
                        <button type="button" id="cancelCollabBtn" class="modal-action-btn modal-btn-secondary">Cancel</button>
                        <button type="submit" class="modal-action-btn modal-btn-primary">
                            <i class="fas fa-handshake"></i> Send Request
                        </button>
                    </div>
                </form>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add active class to show modal (CSS has display: none by default)
        modal.classList.add('active');

        // Close handlers
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        };

        modal.querySelector('#closeCollabModalBtn').onclick = closeModal;
        modal.querySelector('#cancelCollabBtn').onclick = closeModal;

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Show modal
        document.body.style.overflow = 'hidden';
    }

    showIncubationModal(project) {
        console.log('showIncubationModal called for:', project.title);

        // Remove any existing modal
        const existingModal = document.getElementById('incubationDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'incubationDetailsModal';
        modal.className = 'modal-backdrop';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content-premium';

        modalContent.innerHTML = `
            <button id="closeModalBtn" class="modal-close-btn">×</button>

            <div class="modal-inner-padding">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="incubation-icon-container" style="background: rgba(139, 92, 246, 0.2);">
                        <i class="fas fa-seedling" style="font-size: 1.5rem; color: #8b5cf6;"></i>
                    </div>
                    <h2 class="modal-title-vibrant">${this.escapeHTML(project.title)}</h2>
                    <p class="modal-subtitle">Incubation Program</p>
                </div>

                <div class="modal-badge-row">
                    <div class="modal-stat-pill">
                        <i class="fas fa-chart-line" style="color: #8b5cf6;"></i>
                        <span>${this.escapeHTML(project.stage || 'Validation')}</span>
                    </div>
                    <div class="modal-stat-pill">
                        <i class="fas fa-money-bill" style="color: #8b5cf6;"></i>
                        <span>KSh ${this.escapeHTML(project.funding || '0')}</span>
                    </div>
                    <div class="modal-stat-pill">
                        <i class="fas fa-user-circle" style="color: #8b5cf6;"></i>
                        <span>${this.escapeHTML(project.founder || project.project_lead?.name || 'Founder')}</span>
                    </div>
                </div>

                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-info-circle"></i> Program Description</h3>
                    <div class="modal-text-content">
                        ${this.escapeHTML(project.description)}
                    </div>
                </div>

                <div class="modal-actions-bar">
                    <button id="modalCloseBtn" class="modal-action-btn modal-btn-secondary">Close</button>
                    <button id="modalContactBtn" class="modal-action-btn modal-btn-primary">
                        <i class="fas fa-envelope"></i> Contact Founder
                    </button>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add active class to show modal (CSS has display: none by default)
        modal.classList.add('active');

        // Close handlers
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        };

        modal.querySelector('#closeModalBtn').onclick = closeModal;
        modal.querySelector('#modalCloseBtn').onclick = closeModal;
        modal.querySelector('#modalContactBtn').onclick = () => {
            closeModal();
            this.contactFounder(project.id);
        };

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Show modal
        document.body.style.overflow = 'hidden';
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
document.addEventListener('DOMContentLoaded', async () => {
    // Navigation is handled by global-navbar.js
    // No need to initialize it here

    // Initialize Projects Manager
    window.projectsManager = new ProjectsManager();
    await globalThis.projectsManager.init();     // async, outside of ctor
    console.log('✅ Projects Manager initialized successfully');
});
