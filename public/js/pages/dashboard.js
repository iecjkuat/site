// JKUAT Innovation Club - Simple Dashboard Page

class DashboardPage {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
    }

    async loadUserData() {
        try {
            const authManager = window.jkuatApp.getModule('auth');
            this.currentUser = authManager.getCurrentUser();
            
            if (!this.currentUser) {
                window.location.href = '/';
                return;
            }

            this.updateUserInfo();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    bindEvents() {
        // Simple project creation
        document.getElementById('createProjectBtn')?.addEventListener('click', () => {
            this.showSimpleProjectModal();
        });

        // Navigation events
        document.getElementById('joinEventBtn')?.addEventListener('click', () => {
            window.location.href = '/events';
        });

        document.getElementById('viewProfileBtn')?.addEventListener('click', () => {
            window.location.href = '/settings';
        });
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const elements = {
            'userName': `${this.currentUser.first_name} ${this.currentUser.last_name}`,
            'userName2': `${this.currentUser.first_name} ${this.currentUser.last_name}`,
            'userEmail': this.currentUser.email,
            'userRole': this.currentUser.role || 'Member',
            'memberSince': this.formatDate(this.currentUser.created_at)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    showSimpleProjectModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin: 0;">Create Project</h2>
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

                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 0.5rem;">Category</label>
                        <select name="category" class="glass-input">
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile App">Mobile App</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="IoT">IoT</option>
                            <option value="Other">Other</option>
                        </select>
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
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        modal.querySelector('#createProjectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            window.jkuatApp.showToast('Project created successfully!', 'success');
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

window.DashboardPage = DashboardPage;