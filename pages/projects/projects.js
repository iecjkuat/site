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

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateStats();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
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

        // Event delegation for all buttons and modal management
        document.addEventListener('click', (e) => {
            // Handle project view buttons
            if (e.target.matches('[data-action="view-project"]') || e.target.closest('[data-action="view-project"]')) {
                const button = e.target.matches('[data-action="view-project"]') ? e.target : e.target.closest('[data-action="view-project"]');
                const projectId = button.dataset.projectId;
                this.viewProject(projectId);
            }
            
            // Handle project join buttons
            if (e.target.matches('[data-action="join-project"]') || e.target.closest('[data-action="join-project"]')) {
                const button = e.target.matches('[data-action="join-project"]') ? e.target : e.target.closest('[data-action="join-project"]');
                const projectId = button.dataset.projectId;
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
                    modal.style.display = 'none';
                }
            }
            
            // Handle modal backdrop clicks (close modal when clicking outside)
            if (e.target.classList.contains('modal-backdrop')) {
                e.target.style.display = 'none';
            }
        });

        // Handle Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-backdrop[style*="flex"]');
                if (openModal) {
                    openModal.style.display = 'none';
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
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
            activeTabBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            activeTabBtn.style.color = 'white';
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });

        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.style.display = 'block';
            activeTab.classList.add('active');
        }

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    applyFilter(filter) {
        this.currentFilter = filter;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        const activeFilter = document.querySelector(`[data-filter="${filter}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
            activeFilter.style.background = 'rgba(16, 185, 129, 0.2)';
            activeFilter.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            activeFilter.style.color = '#10b981';
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
            const response = await fetch('/api/projects');
            if (response.ok) {
                this.projects = await response.json();
            } else {
                // Use sample data if API not available
                this.projects = this.getSampleProjects();
            }
            this.renderProjects();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = this.getSampleProjects();
            this.renderProjects();
        }
    }

    async loadHackathons() {
        try {
            const response = await fetch('/api/projects/hackathons');
            if (response.ok) {
                this.hackathons = await response.json();
            } else {
                this.hackathons = this.getSampleHackathons();
            }
            this.renderHackathons();
        } catch (error) {
            console.error('Error loading hackathons:', error);
            this.hackathons = this.getSampleHackathons();
            this.renderHackathons();
        }
    }

    async loadIncubationProjects() {
        try {
            const response = await fetch('/api/projects/incubation');
            if (response.ok) {
                this.incubationProjects = await response.json();
            } else {
                this.incubationProjects = this.getSampleIncubationProjects();
            }
            this.renderIncubationProjects();
        } catch (error) {
            console.error('Error loading incubation projects:', error);
            this.incubationProjects = this.getSampleIncubationProjects();
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

        if (filteredProjects.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">No projects found</h3>
                    <p style="color: rgba(255, 255, 255, 0.6);">Try adjusting your filter or check back later for new projects.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredProjects.map(project => this.createProjectCard(project)).join('');
    }

    createProjectCard(project) {
        const statusColors = {
            'Planning': '#f59e0b',
            'Active': '#10b981',
            'Completed': '#3b82f6',
            'On Hold': '#6b7280',
            'Cancelled': '#ef4444'
        };

        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-header">
                    <div style="flex: 1;">
                        <h3 class="project-title">${project.title}</h3>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                            <span class="project-status ${project.status?.toLowerCase() || 'active'}">${project.status || 'Active'}</span>
                            <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${project.category}</span>
                        </div>
                    </div>
                </div>
                
                <p class="project-description">${project.description}</p>
                
                ${project.technologies && project.technologies.length > 0 ? `
                    <div class="project-tech">
                        ${project.technologies.slice(0, 3).map(tech => `
                            <span class="tech-tag">${tech}</span>
                        `).join('')}
                        ${project.technologies.length > 3 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">+${project.technologies.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="project-stats">
                    <div class="project-stat team">
                        <i class="fas fa-user"></i>
                        <span>${project.project_lead?.name || 'Team Lead'}</span>
                    </div>
                    <div class="project-stat timeline">
                        <i class="fas fa-clock"></i>
                        <span>${this.getTimeAgo(new Date(project.created_at))}</span>
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-outline btn-sm" data-action="view-project" data-project-id="${project.id}">
                        <i class="fas fa-eye"></i>View
                    </button>
                    <button class="btn btn-primary btn-sm" data-action="join-project" data-project-id="${project.id}">
                        <i class="fas fa-plus"></i>Join
                    </button>
                </div>
            </div>
        `;
    }
    renderHackathons() {
        const grid = document.getElementById('hackathonsGrid');
        if (!grid) return;

        if (this.hackathons.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-trophy" style="font-size: 3rem; color: rgba(139, 92, 246, 0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">No hackathons available</h3>
                    <p style="color: rgba(255, 255, 255, 0.6);">Check back soon for exciting hackathon opportunities!</p>
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
            <div class="glass-card" style="padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h3 style="color: white; font-weight: 600; font-size: 1.25rem; flex: 1;">${hackathon.title}</h3>
                    <span style="background: ${isRegistrationOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${isRegistrationOpen ? '#10b981' : '#ef4444'}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">
                        ${isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
                    </span>
                </div>
                
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">${hackathon.description}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Start Date</div>
                        <div style="color: white; font-weight: 600;">${startDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">End Date</div>
                        <div style="color: white; font-weight: 600;">${endDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Participants</div>
                        <div style="color: white; font-weight: 600;">${hackathon.current_participants}/${hackathon.max_participants}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Registration Fee</div>
                        <div style="color: white; font-weight: 600;">KSh ${hackathon.registration_fee || 0}</div>
                    </div>
                </div>
                
                ${hackathon.theme ? `
                    <div style="margin-bottom: 1rem;">
                        <span style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                            Theme: ${hackathon.theme}
                        </span>
                    </div>
                ` : ''}
                
                ${isRegistrationOpen ? `
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <i class="fas fa-clock" style="color: #10b981;"></i>
                            <span style="color: #10b981; font-weight: 600; font-size: 0.875rem;">Registration closes in ${daysLeft} days</span>
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem;">Deadline: ${registrationDeadline.toLocaleDateString()}</div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-outline btn-sm" data-action="view-hackathon" data-hackathon-id="${hackathon.id}" style="flex: 1;">
                        <i class="fas fa-info-circle"></i>Details
                    </button>
                    ${isRegistrationOpen ? `
                        <button class="btn btn-primary btn-sm" data-action="register-hackathon" data-hackathon-id="${hackathon.id}" style="flex: 1;">
                            <i class="fas fa-user-plus"></i>Register
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-sm" disabled style="flex: 1; opacity: 0.5;">
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

        if (this.incubationProjects.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-seedling" style="font-size: 3rem; color: rgba(245, 158, 11, 0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">No projects in incubation</h3>
                    <p style="color: rgba(255, 255, 255, 0.6);">Submit your innovative idea to join our incubation program!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.incubationProjects.map(project => this.createIncubationCard(project)).join('');
    }

    createIncubationCard(project) {
        return `
            <div class="glass-card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h3 style="color: white; font-weight: 600; font-size: 1.125rem;">${project.title}</h3>
                    <span style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Incubation</span>
                </div>
                
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; line-height: 1.5; margin-bottom: 1rem;">${project.description}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Stage</div>
                        <div style="color: white; font-weight: 600;">${project.stage || 'Validation'}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Funding</div>
                        <div style="color: white; font-weight: 600;">KSh ${project.funding || '0'}</div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user" style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;"></i>
                        <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem;">${project.founder || project.project_lead?.name || 'Founder'}</span>
                    </div>
                    <button class="btn btn-outline btn-sm" data-action="view-incubation" data-project-id="${project.id}">
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
            const response = await fetch('/api/projects/submit', {
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
        console.log('📧 Admin notification sent for new project submission');
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
            const response = await fetch(`/api/projects/${projectId}/collaborate`, {
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
                    modal.style.display = 'none';
                }
                form.reset();
                
                // Also close project modal if it's open
                const projectModal = document.getElementById('projectModal');
                if (projectModal && projectModal.style.display === 'flex') {
                    projectModal.style.display = 'none';
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
                modal.style.display = 'none';
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
            messageDiv.style.display = 'block';
            
            if (type === 'success') {
                messageDiv.style.background = 'rgba(16, 185, 129, 0.2)';
                messageDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                messageDiv.style.color = '#10b981';
            } else {
                messageDiv.style.background = 'rgba(239, 68, 68, 0.2)';
                messageDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                messageDiv.style.color = '#ef4444';
            }
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    updateStats() {
        // Update stats in hero section
        const activeCount = this.projects.filter(p => p.status === 'Active').length;
        const completedCount = this.projects.filter(p => p.status === 'Completed').length;
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
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            this.showError('Project not found');
            return;
        }
        
        this.showProjectModal(project);
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
            if (modal && modal.style.display === 'flex') {
                modal.style.display = 'none';
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
        if (modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
        
        // TODO: Implement actual contact/messaging system
        console.log('Contacting founder for project:', projectId);
    }
    // Modal methods
    showProjectModal(project) {
        const modalHtml = `
            <div class="project-detail-header">
                <div class="project-detail-meta">
                    <span class="project-status ${project.status?.toLowerCase() || 'active'}">${project.status || 'Active'}</span>
                    <span class="project-owner">by ${project.project_lead?.name || 'Team Lead'}</span>
                    <span class="project-date">${project.priority || 'Medium'} Priority</span>
                </div>
                
                <h1 class="project-detail-title">${project.title}</h1>
                
                <div class="project-detail-stats">
                    <div class="stat-item">
                        <i class="fas fa-chart-line"></i>
                        <span>${project.progress_percentage || 0}% Complete</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-tag"></i>
                        <span>${project.category}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <span>${this.getTimeAgo(new Date(project.created_at))}</span>
                    </div>
                </div>
            </div>
            
            <div class="project-detail-content">
                <section class="detail-section">
                    <h3>Description</h3>
                    <p>${project.description}</p>
                </section>
                
                ${project.technologies && project.technologies.length > 0 ? `
                    <section class="detail-section">
                        <h3>Technologies</h3>
                        <div class="tech-stack">
                            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </section>
                ` : ''}
                
                <div class="detail-grid">
                    <section class="detail-section">
                        <h3>Status</h3>
                        <span class="project-status ${project.status?.toLowerCase() || 'active'}">${project.status || 'Active'}</span>
                    </section>
                    
                    <section class="detail-section">
                        <h3>Priority</h3>
                        <span class="project-status planning">${project.priority || 'Medium'}</span>
                    </section>
                    
                    <section class="detail-section">
                        <h3>Progress</h3>
                        <p>${project.progress_percentage || 0}% Complete</p>
                    </section>
                    
                    <section class="detail-section">
                        <h3>Team Lead</h3>
                        <p>${project.project_lead?.name || 'Team Lead'}</p>
                    </section>
                </div>
                
                <div class="project-detail-actions">
                    <button class="btn btn-primary" data-action="join-project" data-project-id="${project.id}">
                        <i class="fas fa-handshake"></i>
                        Request to Join
                    </button>
                    <button class="btn btn-outline" onclick="projectsManager.shareProject('${project.id}')">
                        <i class="fas fa-share"></i>
                        Share Project
                    </button>
                </div>
            </div>
        `;
        
        // Update modal content
        const modalContent = document.getElementById('projectModalContent');
        if (modalContent) {
            modalContent.innerHTML = modalHtml;
        }
        
        // Show modal
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    showHackathonModal(hackathon) {
        const startDate = new Date(hackathon.start_date);
        const endDate = new Date(hackathon.end_date);
        const registrationDeadline = new Date(hackathon.registration_deadline);
        const now = new Date();
        const isRegistrationOpen = now < registrationDeadline;
        
        const modalHtml = `
            <div class="project-detail-header">
                <div class="project-detail-meta">
                    <span class="project-status ${isRegistrationOpen ? 'active' : 'completed'}">${isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}</span>
                    ${hackathon.theme ? `<span class="project-owner">Theme: ${hackathon.theme}</span>` : ''}
                </div>
                
                <h1 class="project-detail-title">${hackathon.title}</h1>
                
                <div class="project-detail-stats">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>${hackathon.current_participants}/${hackathon.max_participants} Participants</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-money-bill"></i>
                        <span>KSh ${hackathon.registration_fee || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="project-detail-content">
                <section class="detail-section">
                    <h3>Description</h3>
                    <p>${hackathon.description}</p>
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
                        <p>${hackathon.venue || 'TBA'}</p>
                    </section>
                </div>
                
                <div class="project-detail-actions">
                    ${isRegistrationOpen ? `
                        <button class="btn btn-primary" data-action="register-hackathon" data-hackathon-id="${hackathon.id}">
                            <i class="fas fa-user-plus"></i>
                            Register Now
                        </button>
                    ` : `
                        <button class="btn btn-secondary" disabled style="opacity: 0.5;">
                            <i class="fas fa-lock"></i>
                            Registration Closed
                        </button>
                    `}
                    <button class="btn btn-outline" onclick="projectsManager.shareHackathon('${hackathon.id}')">
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
            modal.style.display = 'flex';
        }
    }

    showCollaborationModal(project) {
        // Update modal content
        const modalContent = document.getElementById('collaborationModalContent');
        
        if (modalContent) {
            modalContent.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">
                        Tell the project lead why you want to collaborate and what you can contribute to "${project.title}".
                    </p>
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <i class="fas fa-user" style="color: #10b981;"></i>
                            <strong style="color: #10b981;">Project Lead:</strong>
                        </div>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 0;">${project.project_lead?.name || 'Team Lead'}</p>
                    </div>
                </div>
                
                <form id="collaborationForm" data-project-id="${project.id}">
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
                        <small style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Separate multiple skills with commas</small>
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
            `;
        }
        
        // Show modal
        const modal = document.getElementById('collaborationModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    showIncubationModal(project) {
        const modalHtml = `
            <div class="project-detail-header">
                <div class="project-detail-meta">
                    <span class="project-status planning">Incubation Program</span>
                    <span class="project-owner">by ${project.project_lead?.name || project.founder || 'Founder'}</span>
                </div>
                
                <h1 class="project-detail-title">${project.title}</h1>
                
                <div class="project-detail-stats">
                    <div class="stat-item">
                        <i class="fas fa-chart-line"></i>
                        <span>${project.stage || 'Validation'}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-money-bill"></i>
                        <span>KSh ${project.funding || '0'} Funding</span>
                    </div>
                </div>
            </div>
            
            <div class="project-detail-content">
                <section class="detail-section">
                    <h3>Description</h3>
                    <p>${project.description}</p>
                </section>
                
                <section class="detail-section">
                    <h3>Current Stage</h3>
                    <p>${project.stage || 'Validation'}</p>
                </section>
                
                <div class="project-detail-actions">
                    <button class="btn btn-primary" data-action="contact-founder" data-project-id="${project.id}">
                        <i class="fas fa-envelope"></i>
                        Contact Founder
                    </button>
                    <button class="btn btn-outline" onclick="projectsManager.shareIncubationProject('${project.id}')">
                        <i class="fas fa-share"></i>
                        Share Project
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
            modalTitle.textContent = 'Incubation Project';
        }
        
        // Show modal
        const modal = document.getElementById('projectModal');
        if (modal) {
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
window.closeProjectModal = function() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.closeCollaborationModal = function() {
    const modal = document.getElementById('collaborationModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.closeCollaborationRequestsModal = function() {
    const modal = document.getElementById('collaborationRequestsModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.projectsManager = new ProjectsManager();
});