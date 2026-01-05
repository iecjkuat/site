// JKUAT Innovation Club - Refactored Dashboard Controller

class DashboardPage {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.calendarState = null;

        // Cached DOM elements
        this.dom = {};
        this.cacheDOMElements();

        // Initialize modules
        this.notificationManager = new NotificationManager(this);
        this.projectManager = new ProjectManager(this);

        this.init();
    }

    cacheDOMElements() {
        const ids = [
            'userName','userName2','userEmail','userRole','memberSince',
            'studentId','course','yearOfStudy','college','myProjects','upcomingEventsGrid',
            'paymentHistory','recentActivity','miniCalendar','payMembershipBtn','generateCardBtn'
        ];

        ids.forEach(id => {
            this.dom[id] = document.getElementById(id);
        });

        this.dom.membershipStatus = document.querySelector('.membership-status');
        this.dom.profilePics = document.querySelectorAll('.user-avatar, .profile-picture, .user-profile-pic');
    }

    async init() {
        if (this.isInitialized) return;
        console.log('📊 Initializing Dashboard...');

        await this.loadUserData();
        this.bindEvents();
        this.loadMockData();
        this.initializeNotificationSystem();

        this.isInitialized = true;
        console.log('✅ Dashboard initialized');
    }

    async loadUserData() {
        // Wait for auth to be ready
        await this.waitForAuth();
        this.currentUser = window.dashboardAuth?.getUser() || this.getUserFromStorage();

        if (!this.currentUser) {
            console.warn('⚠️ No user data found, using mock for development');
            this.currentUser = {
                name: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@student.jkuat.ac.ke',
                role: 'Member',
                membershipStatus: 'active',
                isMember: true,
                created_at: new Date().toISOString(),
                studentId: 'SCT211-0001/2023',
                course: 'Computer Science',
                yearOfStudy: 2
            };
        }

        this.renderUserProfile();
    }

    waitForAuth() {
        return new Promise(resolve => {
            if (window.dashboardAuth) resolve();
            else {
                const check = () => window.dashboardAuth ? resolve() : setTimeout(check, 100);
                check();
            }
        });
    }

    getUserFromStorage() {
        try { return JSON.parse(localStorage.getItem('user')) || null; }
        catch { return null; }
    }

    renderUserProfile() {
        const user = this.currentUser;
        const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

        // Text fields
        this.dom.userName && (this.dom.userName.textContent = displayName);
        this.dom.userName2 && (this.dom.userName2.textContent = displayName);
        this.dom.userEmail && (this.dom.userEmail.textContent = user.email || '');
        this.dom.userRole && (this.dom.userRole.textContent = user.role || 'Member');
        this.dom.memberSince && (this.dom.memberSince.textContent = new Date(user.created_at).toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'}));
        this.dom.studentId && (this.dom.studentId.textContent = user.studentId || 'N/A');
        this.dom.course && (this.dom.course.textContent = user.course || 'N/A');
        this.dom.yearOfStudy && (this.dom.yearOfStudy.textContent = user.yearOfStudy ? `Year ${user.yearOfStudy}` : 'N/A');
        this.dom.college && (this.dom.college.textContent = user.college || 'N/A');

        // Membership status
        const isActive = user.membershipStatus === 'active' || user.isMember;
        if (this.dom.membershipStatus) {
            this.dom.membershipStatus.textContent = isActive ? 'Active' : 'Inactive';
            this.dom.membershipStatus.className = `stat-number ${isActive ? 'text-green-500' : 'text-red-500'}`;
            this.dom.payMembershipBtn?.classList.toggle('hidden', isActive);
            this.dom.generateCardBtn?.classList.toggle('hidden', !isActive);
        }

        // Profile pictures / initials
        this.dom.profilePics.forEach(el => {
            if (user.profilePicture) {
                if (el.tagName === 'IMG') {
                    el.src = user.profilePicture;
                    el.alt = displayName;
                    el.style.display = 'block';
                } else {
                    el.style.backgroundImage = `url(${user.profilePicture})`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                    el.innerHTML = '';
                }
            } else {
                const initials = this.getInitials(displayName);
                if (el.tagName === 'IMG') {
                    el.style.display = 'none';
                    let initialsEl = el.nextElementSibling;
                    if (!initialsEl || !initialsEl.classList.contains('initials-avatar')) {
                        initialsEl = document.createElement('div');
                        initialsEl.className = 'initials-avatar';
                        initialsEl.style.cssText = `
                            width: 100%; height: 100%; 
                            background: linear-gradient(135deg, #10b981, #059669);
                            border-radius: 50%; display: flex; 
                            align-items: center; justify-content: center;
                            color: white; font-weight: bold;
                            font-size: 1.2em;
                        `;
                        el.parentNode.insertBefore(initialsEl, el.nextSibling);
                    }
                    initialsEl.textContent = initials;
                } else {
                    el.textContent = initials;
                    el.style.backgroundImage = 'none';
                    el.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    el.style.color = 'white';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.fontWeight = 'bold';
                }
            }
        });

        this.updateStats();
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    bindEvents() {
        const bindClick = (selector, fn) => document.getElementById(selector)?.addEventListener('click', fn);

        bindClick('createProjectBtnWelcome', () => this.showProjectModal());
        bindClick('createProjectBtnProjects', () => this.showProjectModal());
        bindClick('joinEventBtn', () => window.location.href = '/events');
        bindClick('viewProfileBtn', () => window.location.href = '/settings');
        bindClick('payMembershipBtn', () => window.location.href = '/payment');
        bindClick('generateCardBtn', () => window.jkuatApp?.showToast('Membership card generated!', 'success'));
        bindClick('markAllReadBtn', () => this.notificationManager.markAllNotificationsRead());
        bindClick('requestMentorBtn', () => this.showMentorRequestModal());
        bindClick('viewAllProjectsBtn', () => window.location.href = '/projects');

        // Logout buttons
        document.querySelectorAll('.logout-btn, #logoutBtn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                window.dashboardAuth.logout();
            });
        });
    }

    // ======= Stats =======
    updateStats() {
        const stats = {
            eventsAttended: Math.floor(Math.random()*15)+1,
            myProjects: this.projectManager.projects.length,
            accountBalance: Math.floor(Math.random()*5000)
        };

        Object.entries(stats).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = id === 'accountBalance' ? `KSh ${value.toLocaleString()}` : value;
        });
    }

    // ======= Modals =======
    createModal(contentHtml) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        Object.assign(modal.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9999',
        });
        modal.innerHTML = contentHtml;

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.addEventListener('click', e => e.target === modal && modal.remove());
        document.body.appendChild(modal);

        return modal;
    }

    showProjectModal() {
        const modalHtml = `
            <div class="modal-content" style="max-width:500px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
                    <h2 style="color:white;font-weight:700;font-size:1.5rem;margin:0;">Create Project</h2>
                    <button class="btn-glass btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <form id="createProjectForm">
                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block;color:rgba(255,255,255,0.9);font-weight:600;margin-bottom:0.5rem;">Project Title *</label>
                        <input type="text" name="title" class="glass-input" placeholder="Enter project title" required>
                    </div>
                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block;color:rgba(255,255,255,0.9);font-weight:600;margin-bottom:0.5rem;">Description *</label>
                        <textarea name="description" class="glass-input" rows="3" placeholder="Describe your project..." required></textarea>
                    </div>
                    <div style="margin-bottom:2rem;">
                        <label style="display:block;color:rgba(255,255,255,0.9);font-weight:600;margin-bottom:0.5rem;">Category</label>
                        <select name="category" class="glass-input">
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile App">Mobile App</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="IoT">IoT</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div style="display:flex;gap:1rem;justify-content:flex-end;">
                        <button type="button" class="btn btn-outline close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i>Create Project</button>
                    </div>
                </form>
            </div>
        `;

        const modal = this.createModal(modalHtml);
        modal.querySelector('#createProjectForm').addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(e.target);
            const projectData = {
                title: data.get('title'),
                description: data.get('description'),
                category: data.get('category')
            };
            this.addProjectToGrid(projectData);
            window.jkuatApp?.showToast('Project created successfully!', 'success');
            modal.remove();
        });
    }

    showMentorRequestModal(project=null) {
        const projectContext = project ? `for "${project.title}"` : '';
        const modalHtml = `
            <div class="modal-content" style="max-width:500px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
                    <h2 style="color:white;font-weight:700;font-size:1.5rem;margin:0;">Request Mentor ${projectContext}</h2>
                    <button class="btn-glass btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <form id="mentorRequestForm">
                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block;color:rgba(255,255,255,0.9);font-weight:600;margin-bottom:0.5rem;">Project/Area *</label>
                        <input type="text" name="project" class="glass-input" placeholder="What do you need help with?" value="${project?.title||''}" required>
                    </div>
                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block;color:rgba(255,255,255,0.9);font-weight:600;margin-bottom:0.5rem;">Expertise Needed</label>
                        <select name="expertise" class="glass-input">
                            <option value="Web Development" ${project?.category==='Web Development'?'selected':''}>Web Development</option>
                            <option value="Mobile App" ${project?.category==='Mobile App'?'selected':''}>Mobile App</option>
                            <option value="AI/ML" ${project?.category==='AI/ML'?'selected':''}>AI/ML</option>
                            <option value="IoT" ${project?.category==='IoT'?'selected':''}>IoT</option>
                            <option value="Business" ${project?.category==='Business'?'selected':''}>Business</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div style="margin-bottom:2rem;">
                        <label style="display:block;color:rgba(255,255,255,0.9);font-weight:600;margin-bottom:0.5rem;">Additional Details</label>
                        <textarea name="details" class="glass-input" rows="3" placeholder="Describe your needs..."></textarea>
                    </div>
                    <div style="display:flex;gap:1rem;justify-content:flex-end;">
                        <button type="button" class="btn btn-outline close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Send Request</button>
                    </div>
                </form>
            </div>
        `;
        const modal = this.createModal(modalHtml);
        modal.querySelector('#mentorRequestForm').addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(e.target);
            const request = {
                project: data.get('project'),
                expertise: data.get('expertise'),
                details: data.get('details')
            };
            window.jkuatApp?.showToast('Mentor request submitted!', 'success');
            this.notificationManager.addNotification({
                type: 'project',
                priority: 'info',
                title: 'Mentor Request Submitted',
                message: `Your mentor request for ${request.project} has been submitted.`,
                actionUrl: '/projects',
                actionText: 'View Projects'
            });
            modal.remove();
        });
    }

    // ===== Project integration =====
    addProjectToGrid(projectData) {
        if (!this.projectManager) return;

        // Create full project object with defaults
        const newProject = {
            id: `proj_${Date.now()}`,
            title: projectData.title,
            description: projectData.description,
            category: projectData.category || 'Other',
            status: 'idea',
            approval: 'pending',
            teamSize: 1,
            teamMembers: [this.currentUser?.name || 'You'],
            mentor: null,
            mentorAssigned: false,
            progress: 0,
            milestones: { completed: 0, total: 3 },
            lastUpdated: new Date(),
            deadline: null,
            priority: 'medium',
            funding: { requested: 0, approved: 0, spent: 0 }
        };

        this.projectManager.projects.unshift(newProject);
        this.projectManager.renderProjects();
        this.updateStats();
    }

    // ======= Load mock/demo data =======
    loadMockData() {
        this.notificationManager.loadNotifications();
        this.projectManager.loadProjects();
        this.loadUpcomingEvents?.();
        this.loadPaymentHistory?.();
        this.loadRecentActivity?.();
        this.loadMiniCalendar?.();
    }

    initializeNotificationSystem() {
        this.startNotificationPolling();
        if (['localhost','127.0.0.1'].includes(window.location.hostname)) this.addDemoNotificationButton();
    }

    startNotificationPolling() {
        setInterval(() => Math.random() < 0.1 && this.notificationManager.simulateNotification(), 30000);
    }

    addDemoNotificationButton() {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm';
        btn.innerHTML = '<i class="fas fa-bell"></i> Demo Notification';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = '9999';
        btn.addEventListener('click', () => this.notificationManager.simulateNotification());
        document.body.appendChild(btn);
    }
}

window.DashboardPage = DashboardPage;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Dashboard DOM loaded');
    setTimeout(() => { window.dashboardPage = new DashboardPage(); }, 300);
});
