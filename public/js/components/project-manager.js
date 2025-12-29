// JKUAT Innovation Club - Project Management Component

class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.tasks = [];
        this.teamMembers = [];
        this.init();
    }

    init() {
        this.loadProjects();
        this.bindEvents();
    }

    async loadProjects() {
        try {
            const response = await window.jkuatApp.apiCall('/api/projects/my-projects');
            this.projects = response.projects || [];
            this.renderProjectsGrid();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showMockProjects(); // Fallback to mock data
        }
    }

    bindEvents() {
        // Project creation
        document.getElementById('createProjectBtn')?.addEventListener('click', () => {
            this.showCreateProjectModal();
        });

        document.getElementById('createProjectBtn2')?.addEventListener('click', () => {
            this.showCreateProjectModal();
        });

        // Project actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-project-btn')) {
                this.viewProject(e.target.dataset.projectId);
            }
            if (e.target.classList.contains('edit-project-btn')) {
                this.editProject(e.target.dataset.projectId);
            }
            if (e.target.classList.contains('delete-project-btn')) {
                this.deleteProject(e.target.dataset.projectId);
            }
        });

        // Task management
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-task-btn')) {
                this.addTask(e.target.dataset.projectId);
            }
            if (e.target.classList.contains('complete-task-btn')) {
                this.completeTask(e.target.dataset.taskId);
            }
        });
    }

    renderProjectsGrid() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">
                    <i class="fas fa-project-diagram" style="font-size: 3rem; color: rgba(255, 255, 255, 0.5); margin-bottom: 1rem;"></i>
                    <h3 style="color: white; margin-bottom: 1rem;">No Projects Yet</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem;">Start your innovation journey by creating your first project!</p>
                    <button class="btn btn-primary" onclick="window.projectManager.showCreateProjectModal()">
                        <i class="fas fa-plus"></i>Create Your First Project
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="glass-card project-card" style="padding: 2rem; position: relative; overflow: hidden;">
                <!-- Project Status Indicator -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${this.getProjectStatusColor(project.status)};"></div>
                
                <!-- Project Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <span class="project-category" style="background: ${this.getCategoryColor(project.category)}; color: white; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600;">${project.category}</span>
                    </div>
                    <div class="project-actions" style="display: flex; gap: 0.5rem;">
                        <button class="btn-glass btn-icon view-project-btn" data-project-id="${project.id}" title="View Project">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-glass btn-icon edit-project-btn" data-project-id="${project.id}" title="Edit Project">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-glass btn-icon delete-project-btn" data-project-id="${project.id}" title="Delete Project">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <!-- Project Info -->
                <h3 style="color: white; font-weight: 700; margin-bottom: 0.5rem; font-size: 1.25rem;">${project.title}</h3>
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.875rem;">${project.description}</p>

                <!-- Progress Bar -->
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Progress</span>
                        <span style="color: white; font-weight: 600; font-size: 0.875rem;">${project.progress}%</span>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 50px; height: 6px; overflow: hidden;">
                        <div style="background: ${this.getProjectStatusColor(project.status)}; height: 100%; width: ${project.progress}%; transition: width 0.5s ease; border-radius: 50px;"></div>
                    </div>
                </div>

                <!-- Team Members -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Team:</span>
                        <div style="display: flex; align-items: center; gap: -0.5rem;">
                            ${project.team_members.slice(0, 3).map(member => `
                                <div style="width: 24px; height: 24px; background: rgba(16, 185, 129, 0.3); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: -0.25rem;">
                                    <span style="color: white; font-size: 0.75rem; font-weight: 600;">${member.name.charAt(0)}</span>
                                </div>
                            `).join('')}
                            ${project.team_members.length > 3 ? `
                                <div style="width: 24px; height: 24px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: -0.25rem;">
                                    <span style="color: white; font-size: 0.75rem;">+${project.team_members.length - 3}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <span class="project-status" style="background: ${this.getProjectStatusColor(project.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600;">${project.status}</span>
                </div>

                <!-- Project Stats -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="text-align: center;">
                        <div style="color: #3b82f6; font-weight: 700; font-size: 1.25rem;">${project.tasks_completed}</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">Tasks Done</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #f59e0b; font-weight: 700; font-size: 1.25rem;">${project.tasks_pending}</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">Pending</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #10b981; font-weight: 700; font-size: 1.25rem;">${this.calculateDaysLeft(project.deadline)}</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">Days Left</div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-primary btn-sm view-project-btn" data-project-id="${project.id}" style="flex: 1;">
                        <i class="fas fa-eye"></i>View Details
                    </button>
                    <button class="btn btn-outline btn-sm add-task-btn" data-project-id="${project.id}">
                        <i class="fas fa-plus"></i>Add Task
                    </button>
                </div>
            </div>
        `).join('');
    }

    showCreateProjectModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin: 0;">Create New Project</h2>
                    <button class="btn-glass btn-icon close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <form id="createProjectForm">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Project Title *</label>
                        <input type="text" name="title" class="glass-input" placeholder="Enter project title" required>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Description *</label>
                        <textarea name="description" class="glass-input" rows="3" placeholder="Describe your project..." required></textarea>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Category *</label>
                            <select name="category" class="glass-input" required>
                                <option value="">Select category</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Mobile App">Mobile App</option>
                                <option value="AI/ML">AI/ML</option>
                                <option value="IoT">IoT</option>
                                <option value="Blockchain">Blockchain</option>
                                <option value="Research">Research</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Deadline</label>
                            <input type="date" name="deadline" class="glass-input">
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Team Members (Optional)</label>
                        <input type="text" name="team_members" class="glass-input" placeholder="Enter email addresses separated by commas">
                        <small style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">Invite team members by email</small>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-plus"></i>Create Project
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#createProjectForm').addEventListener('submit', (e) => {
            this.handleCreateProject(e, modal);
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    async handleCreateProject(e, modal) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            deadline: formData.get('deadline'),
            team_members: formData.get('team_members').split(',').map(email => email.trim()).filter(email => email)
        };

        try {
            const response = await window.jkuatApp.apiCall('/api/projects', {
                method: 'POST',
                body: JSON.stringify(projectData)
            });

            if (response.success) {
                window.jkuatApp.showToast('Project created successfully!', 'success');
                this.loadProjects(); // Refresh projects
                document.body.removeChild(modal);
            } else {
                throw new Error(response.message || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            window.jkuatApp.showToast('Error creating project', 'error');
        }
    }

    async viewProject(projectId) {
        const project = this.projects.find(p => p.id == projectId);
        if (!project) return;

        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div>
                        <h2 style="color: white; font-weight: 700; font-size: 1.75rem; margin: 0;">${project.title}</h2>
                        <span class="project-category" style="background: ${this.getCategoryColor(project.category)}; color: white; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; margin-top: 0.5rem; display: inline-block;">${project.category}</span>
                    </div>
                    <button class="btn-glass btn-icon close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Project Overview -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h3 style="color: white; font-weight: 600; margin-bottom: 1rem;">Description</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem;">${project.description}</p>
                        
                        <h3 style="color: white; font-weight: 600; margin-bottom: 1rem;">Progress Overview</h3>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: rgba(255, 255, 255, 0.8);">Overall Progress</span>
                                <span style="color: white; font-weight: 600;">${project.progress}%</span>
                            </div>
                            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 50px; height: 8px; overflow: hidden; margin-bottom: 1rem;">
                                <div style="background: ${this.getProjectStatusColor(project.status)}; height: 100%; width: ${project.progress}%; border-radius: 50px;"></div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                                <div>
                                    <div style="color: #10b981; font-weight: 700; font-size: 1.25rem;">${project.tasks_completed}</div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">Completed</div>
                                </div>
                                <div>
                                    <div style="color: #f59e0b; font-weight: 700; font-size: 1.25rem;">${project.tasks_pending}</div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">Pending</div>
                                </div>
                                <div>
                                    <div style="color: #3b82f6; font-weight: 700; font-size: 1.25rem;">${this.calculateDaysLeft(project.deadline)}</div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">Days Left</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="color: white; font-weight: 600; margin-bottom: 1rem;">Team Members</h3>
                        <div style="space-y: 0.75rem;">
                            ${project.team_members.map(member => `
                                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 0.75rem;">
                                    <div style="width: 32px; height: 32px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: white; font-size: 0.875rem; font-weight: 600;">${member.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div style="color: white; font-weight: 500; font-size: 0.875rem;">${member.name}</div>
                                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">${member.email}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <h3 style="color: white; font-weight: 600; margin: 1.5rem 0 1rem;">Project Details</h3>
                        <div style="space-y: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                                <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Status:</span>
                                <span style="background: ${this.getProjectStatusColor(project.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600;">${project.status}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                                <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Deadline:</span>
                                <span style="color: white; font-size: 0.875rem;">${new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                                <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Created:</span>
                                <span style="color: white; font-size: 0.875rem;">${new Date(project.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Task Management Section -->
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="color: white; font-weight: 600; margin: 0;">Tasks & Milestones</h3>
                        <button class="btn btn-primary btn-sm" onclick="window.projectManager.showAddTaskModal(${project.id})">
                            <i class="fas fa-plus"></i>Add Task
                        </button>
                    </div>
                    
                    <div id="taskBoard" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <!-- To Do -->
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1rem;">
                            <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; text-align: center;">
                                <i class="fas fa-clock" style="color: #f59e0b; margin-right: 0.5rem;"></i>To Do
                            </h4>
                            <div class="task-column" data-status="todo">
                                ${this.generateMockTasks('todo').map(task => this.renderTaskCard(task)).join('')}
                            </div>
                        </div>
                        
                        <!-- In Progress -->
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1rem;">
                            <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; text-align: center;">
                                <i class="fas fa-play" style="color: #3b82f6; margin-right: 0.5rem;"></i>In Progress
                            </h4>
                            <div class="task-column" data-status="in-progress">
                                ${this.generateMockTasks('in-progress').map(task => this.renderTaskCard(task)).join('')}
                            </div>
                        </div>
                        
                        <!-- Done -->
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1rem;">
                            <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; text-align: center;">
                                <i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i>Done
                            </h4>
                            <div class="task-column" data-status="done">
                                ${this.generateMockTasks('done').map(task => this.renderTaskCard(task)).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button class="btn btn-outline edit-project-btn" data-project-id="${project.id}">
                        <i class="fas fa-edit"></i>Edit Project
                    </button>
                    <button class="btn btn-primary close-modal">
                        <i class="fas fa-check"></i>Done
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    renderTaskCard(task) {
        return `
            <div class="task-card" style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; cursor: pointer; transition: all 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h5 style="color: white; font-weight: 500; font-size: 0.875rem; margin: 0;">${task.title}</h5>
                    <span style="background: ${this.getTaskPriorityColor(task.priority)}; color: white; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.625rem; font-weight: 600;">${task.priority}</span>
                </div>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; margin-bottom: 0.75rem; line-height: 1.4;">${task.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 0.625rem; font-weight: 600;">${task.assignee.charAt(0)}</span>
                        </div>
                        <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">${task.assignee}</span>
                    </div>
                    <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.625rem;">${task.due_date}</span>
                </div>
            </div>
        `;
    }

    generateMockTasks(status) {
        const tasks = {
            'todo': [
                { id: 1, title: 'Design Database Schema', description: 'Create the database structure for user management', priority: 'High', assignee: 'John Doe', due_date: 'Jan 25' },
                { id: 2, title: 'Setup Development Environment', description: 'Configure local development setup', priority: 'Medium', assignee: 'Jane Smith', due_date: 'Jan 22' }
            ],
            'in-progress': [
                { id: 3, title: 'Implement Authentication', description: 'Build login and registration functionality', priority: 'High', assignee: 'Mike Johnson', due_date: 'Jan 28' }
            ],
            'done': [
                { id: 4, title: 'Project Planning', description: 'Define project scope and requirements', priority: 'High', assignee: 'Sarah Wilson', due_date: 'Jan 15' },
                { id: 5, title: 'UI Mockups', description: 'Create initial design mockups', priority: 'Medium', assignee: 'David Brown', due_date: 'Jan 18' }
            ]
        };
        return tasks[status] || [];
    }

    getTaskPriorityColor(priority) {
        const colors = {
            'High': 'rgba(239, 68, 68, 0.8)',
            'Medium': 'rgba(245, 158, 11, 0.8)',
            'Low': 'rgba(34, 197, 94, 0.8)'
        };
        return colors[priority] || colors.Medium;
    }
    getProjectStatusColor(status) {
        const colors = {
            'Planning': 'rgba(59, 130, 246, 0.8)',
            'In Progress': 'rgba(245, 158, 11, 0.8)',
            'Review': 'rgba(139, 92, 246, 0.8)',
            'Completed': 'rgba(16, 185, 129, 0.8)',
            'On Hold': 'rgba(107, 114, 128, 0.8)'
        };
        return colors[status] || colors['Planning'];
    }

    getCategoryColor(category) {
        const colors = {
            'Web Development': 'rgba(59, 130, 246, 0.8)',
            'Mobile App': 'rgba(16, 185, 129, 0.8)',
            'AI/ML': 'rgba(139, 92, 246, 0.8)',
            'IoT': 'rgba(245, 158, 11, 0.8)',
            'Blockchain': 'rgba(236, 72, 153, 0.8)',
            'Research': 'rgba(6, 182, 212, 0.8)'
        };
        return colors[category] || 'rgba(107, 114, 128, 0.8)';
    }

    calculateDaysLeft(deadline) {
        if (!deadline) return '-';
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 'Overdue';
    }

    // Mock data for demonstration
    showMockProjects() {
        this.projects = [
            {
                id: 1,
                title: 'Smart Campus IoT System',
                description: 'Developing an IoT system to monitor and optimize campus resources including energy usage, security, and maintenance.',
                category: 'IoT',
                status: 'In Progress',
                progress: 65,
                deadline: '2024-02-15',
                tasks_completed: 8,
                tasks_pending: 4,
                team_members: [
                    { name: 'John Doe', email: 'john@example.com' },
                    { name: 'Jane Smith', email: 'jane@example.com' },
                    { name: 'Mike Johnson', email: 'mike@example.com' }
                ]
            },
            {
                id: 2,
                title: 'AI-Powered Study Assistant',
                description: 'Building an AI chatbot to help students with course materials, scheduling, and academic guidance.',
                category: 'AI/ML',
                status: 'Planning',
                progress: 25,
                deadline: '2024-03-01',
                tasks_completed: 3,
                tasks_pending: 9,
                team_members: [
                    { name: 'Sarah Wilson', email: 'sarah@example.com' },
                    { name: 'David Brown', email: 'david@example.com' }
                ]
            },
            {
                id: 3,
                title: 'Student Marketplace App',
                description: 'Mobile application for students to buy, sell, and exchange textbooks, electronics, and other items.',
                category: 'Mobile App',
                status: 'Review',
                progress: 90,
                deadline: '2024-01-30',
                tasks_completed: 15,
                tasks_pending: 2,
                team_members: [
                    { name: 'Emily Davis', email: 'emily@example.com' },
                    { name: 'Chris Lee', email: 'chris@example.com' },
                    { name: 'Alex Turner', email: 'alex@example.com' },
                    { name: 'Lisa Wang', email: 'lisa@example.com' }
                ]
            }
        ];
        this.renderProjectsGrid();
    }
}

// Make available globally
window.ProjectManager = ProjectManager;

    showAddTaskModal(projectId) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin: 0;">Add New Task</h2>
                    <button class="btn-glass btn-icon close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <form id="addTaskForm">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Task Title *</label>
                        <input type="text" name="title" class="glass-input" placeholder="Enter task title" required>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Description</label>
                        <textarea name="description" class="glass-input" rows="3" placeholder="Describe the task..."></textarea>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Priority</label>
                            <select name="priority" class="glass-input">
                                <option value="Low">Low</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Due Date</label>
                            <input type="date" name="due_date" class="glass-input">
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Assign To</label>
                        <select name="assignee" class="glass-input">
                            <option value="">Select team member</option>
                            <option value="John Doe">John Doe</option>
                            <option value="Jane Smith">Jane Smith</option>
                            <option value="Mike Johnson">Mike Johnson</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-plus"></i>Add Task
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    async addTask(projectId) {
        // Implementation for adding tasks
        console.log('Adding task to project:', projectId);
    }

    async completeTask(taskId) {
        // Implementation for completing tasks
        console.log('Completing task:', taskId);
    }

    async editProject(projectId) {
        // Implementation for editing projects
        console.log('Editing project:', projectId);
    }

    async deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            // Implementation for deleting projects
            console.log('Deleting project:', projectId);
        }
    }

    // Utility methods
    getProjectStatusColor(status) {
        const colors = {
            'Planning': 'rgba(59, 130, 246, 0.8)',
            'In Progress': 'rgba(245, 158, 11, 0.8)',
            'Review': 'rgba(139, 92, 246, 0.8)',
            'Completed': 'rgba(16, 185, 129, 0.8)',
            'On Hold': 'rgba(107, 114, 128, 0.8)'
        };
        return colors[status] || colors['Planning'];
    }

    getCategoryColor(category) {
        const colors = {
            'Web Development': 'rgba(59, 130, 246, 0.8)',
            'Mobile App': 'rgba(16, 185, 129, 0.8)',
            'AI/ML': 'rgba(139, 92, 246, 0.8)',
            'IoT': 'rgba(245, 158, 11, 0.8)',
            'Blockchain': 'rgba(236, 72, 153, 0.8)',
            'Research': 'rgba(6, 182, 212, 0.8)'
        };
        return colors[category] || 'rgba(107, 114, 128, 0.8)';
    }

    calculateDaysLeft(deadline) {
        if (!deadline) return '-';
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 'Overdue';
    }

    // Mock data for demonstration
    showMockProjects() {
        this.projects = [
            {
                id: 1,
                title: 'Smart Campus IoT System',
                description: 'Developing an IoT system to monitor and optimize campus resources including energy usage, security, and maintenance.',
                category: 'IoT',
                status: 'In Progress',
                progress: 65,
                deadline: '2024-02-15',
                tasks_completed: 8,
                tasks_pending: 4,
                team_members: [
                    { name: 'John Doe', email: 'john@example.com' },
                    { name: 'Jane Smith', email: 'jane@example.com' },
                    { name: 'Mike Johnson', email: 'mike@example.com' }
                ]
            },
            {
                id: 2,
                title: 'AI-Powered Study Assistant',
                description: 'Building an AI chatbot to help students with course materials, scheduling, and academic guidance.',
                category: 'AI/ML',
                status: 'Planning',
                progress: 25,
                deadline: '2024-03-01',
                tasks_completed: 3,
                tasks_pending: 9,
                team_members: [
                    { name: 'Sarah Wilson', email: 'sarah@example.com' },
                    { name: 'David Brown', email: 'david@example.com' }
                ]
            },
            {
                id: 3,
                title: 'Student Marketplace App',
                description: 'Mobile application for students to buy, sell, and exchange textbooks, electronics, and other items.',
                category: 'Mobile App',
                status: 'Review',
                progress: 90,
                deadline: '2024-01-30',
                tasks_completed: 15,
                tasks_pending: 2,
                team_members: [
                    { name: 'Emily Davis', email: 'emily@example.com' },
                    { name: 'Chris Lee', email: 'chris@example.com' },
                    { name: 'Alex Turner', email: 'alex@example.com' },
                    { name: 'Lisa Wang', email: 'lisa@example.com' }
                ]
            }
        ];
        this.renderProjectsGrid();
    }
}

// Make available globally
window.ProjectManager = ProjectManager;