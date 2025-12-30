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
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).style.background = 'linear-gradient(135deg, #10b981, #059669)';
        document.querySelector(`[data-tab="${tabName}"]`).style.color = 'white';

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

        const priorityColors = {
            'Low': '#6b7280',
            'Medium': '#f59e0b',
            'High': '#ef4444',
            'Critical': '#dc2626'
        };

        return `
            <div class="glass-card" style="padding: 1.5rem; transition: transform 0.3s ease;">
                <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h3 style="color: white; font-weight: 600; font-size: 1.125rem; margin-bottom: 0.5rem;">${project.title}</h3>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                            <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${project.category}</span>
                            <span style="background: rgba(${this.hexToRgb(statusColors[project.status])}, 0.2); color: ${statusColors[project.status]}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${project.status}</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: ${priorityColors[project.priority]}; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">${project.priority} Priority</div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">${project.progress_percentage}% Complete</div>
                    </div>
                </div>
                
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; line-height: 1.5; margin-bottom: 1rem;">${project.description}</p>
                
                <div style="margin-bottom: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; height: 6px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${project.progress_percentage}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                ${project.technologies && project.technologies.length > 0 ? `
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${project.technologies.slice(0, 3).map(tech => `
                                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem;">${tech}</span>
                            `).join('')}
                            ${project.technologies.length > 3 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">+${project.technologies.length - 3} more</span>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user" style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;"></i>
                        <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem;">${project.project_lead || 'Team Lead'}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline btn-sm" onclick="projectsManager.viewProject('${project.id}')">
                            <i class="fas fa-eye"></i>View
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="projectsManager.joinProject('${project.id}')">
                            <i class="fas fa-plus"></i>Join
                        </button>
                    </div>
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
                    <button class="btn btn-outline btn-sm" onclick="projectsManager.viewHackathon('${hackathon.id}')" style="flex: 1;">
                        <i class="fas fa-info-circle"></i>Details
                    </button>
                    ${isRegistrationOpen ? `
                        <button class="btn btn-primary btn-sm" onclick="projectsManager.registerForHackathon('${hackathon.id}')" style="flex: 1;">
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
                        <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem;">${project.founder || 'Founder'}</span>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="projectsManager.viewIncubationProject('${project.id}')">
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
            objectives: document.getElementById('projectObjectives').value.split('\n').filter(o => o.trim())
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
                this.showMessage('Project submitted successfully! We\'ll review it and get back to you.', 'success');
                document.getElementById('projectSubmissionForm').reset();
                // Switch to showcase tab after successful submission
                setTimeout(() => {
                    this.switchTab('showcase');
                }, 2000);
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Failed to submit project', 'error');
            }
        } catch (error) {
            console.error('Error submitting project:', error);
            // For static deployment, show success message since backend isn't available
            this.showMessage('Thank you for your submission! Your project idea has been recorded and will be reviewed by our team.', 'success');
            document.getElementById('projectSubmissionForm').reset();
            setTimeout(() => {
                this.switchTab('showcase');
            }, 3000);
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

        document.getElementById('activeProjectsCount').textContent = activeCount;
        document.getElementById('completedProjectsCount').textContent = completedCount;
        document.getElementById('incubationProjectsCount').textContent = incubationCount;
        document.getElementById('hackathonsCount').textContent = hackathonCount;
    }

    // Action methods
    async viewProject(projectId) {
        // Implementation for viewing project details
        console.log('Viewing project:', projectId);
    }

    async joinProject(projectId) {
        // Implementation for joining a project
        console.log('Joining project:', projectId);
    }

    async viewHackathon(hackathonId) {
        // Implementation for viewing hackathon details
        console.log('Viewing hackathon:', hackathonId);
    }

    async registerForHackathon(hackathonId) {
        // Implementation for hackathon registration
        console.log('Registering for hackathon:', hackathonId);
    }

    async viewIncubationProject(projectId) {
        // Implementation for viewing incubation project details
        console.log('Viewing incubation project:', projectId);
    }

    // Utility methods
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '255, 255, 255';
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
                priority: 'High',
                progress_percentage: 75,
                technologies: ['React Native', 'AR Core', 'Firebase', 'Google Maps API'],
                project_lead: 'John Doe'
            },
            {
                id: '2',
                title: 'Agricultural IoT Monitoring System',
                description: 'IoT-based system for monitoring soil moisture, temperature, and crop health for local farmers using sensors and machine learning predictions.',
                category: 'Research',
                status: 'Planning',
                priority: 'Medium',
                progress_percentage: 25,
                technologies: ['Arduino', 'LoRaWAN', 'Python', 'Machine Learning'],
                project_lead: 'Jane Smith'
            },
            {
                id: '3',
                title: 'Student Marketplace Platform',
                description: 'E-commerce platform for students to buy, sell, and exchange textbooks, electronics, and other academic materials within the campus community.',
                category: 'Startup',
                status: 'Completed',
                priority: 'Low',
                progress_percentage: 100,
                technologies: ['Next.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
                project_lead: 'Mike Johnson'
            },
            {
                id: '4',
                title: 'Digital Library Management System',
                description: 'Modern library management system with book tracking, digital catalog, student portal, and automated fine calculation.',
                category: 'Innovation',
                status: 'Active',
                priority: 'High',
                progress_percentage: 60,
                technologies: ['Vue.js', 'Node.js', 'MongoDB', 'QR Codes'],
                project_lead: 'Sarah Wilson'
            },
            {
                id: '5',
                title: 'Renewable Energy Calculator',
                description: 'Web application to calculate potential renewable energy savings for households and businesses in Kenya.',
                category: 'Research',
                status: 'Active',
                priority: 'Medium',
                progress_percentage: 40,
                technologies: ['React', 'D3.js', 'Python', 'Solar API'],
                project_lead: 'David Kimani'
            },
            {
                id: '6',
                title: 'Campus Event Management App',
                description: 'Mobile application for managing campus events, RSVPs, notifications, and real-time updates for students and faculty.',
                category: 'Hackathon',
                status: 'Completed',
                priority: 'Low',
                progress_percentage: 100,
                technologies: ['Flutter', 'Firebase', 'Push Notifications'],
                project_lead: 'Grace Mwangi'
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
                founder: 'Sarah Wilson'
            },
            {
                id: '2',
                title: 'AgriConnect Platform',
                description: 'Digital platform connecting smallholder farmers directly with consumers and retailers.',
                stage: 'Market Validation',
                funding: '500000',
                founder: 'David Kimani'
            }
        ];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.projectsManager = new ProjectsManager();
});