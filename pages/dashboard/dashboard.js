// JKUAT Innovation Club - Refactored Dashboard Controller

class DashboardPage {
    constructor() {
        console.log('🏗️ DashboardPage constructor started');
        this.isInitialized = false;
        this.currentUser = null;
        this.calendarState = null;

        // Cached DOM elements
        this.dom = {};
        this.cacheDOMElements();
        
        // Initialize data storage
        this.projects = [];
        this.ideas = [];

        // Initialize modules
        try {
            console.log('📦 Initializing NotificationManager...');
            this.notificationManager = new NotificationManager(this);
            console.log('✅ Managers created');
        } catch (e) {
            console.error('❌ Error during manager initialization:', e);
        }

        this.init();
    }

    // Security: Prevent XSS attacks
    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    cacheDOMElements() {
        const ids = [
            'userName', 'userEmail', 'userRole',
            'myProjectsGrid', 'myIdeasGrid', 'paymentHistory', 'currentTime',
            'userInitials', 'ideasCount', 'projectsCount',
            'notificationsList', 'notifBadge', 'markAllReadBtn'
        ];

        ids.forEach(id => {
            this.dom[id] = document.getElementById(id);
        });

        this.dom.profilePics = document.querySelectorAll('.user-avatar, .profile-picture, .user-profile-pic');
    }

    async init() {
        if (this.isInitialized) return;
        console.log('📊 Initializing Dashboard...');

        await this.loadUserData();
        this.bindEvents();
        this.loadMockData();
        this.initializeNotificationSystem();
        this.startClock();

        this.isInitialized = true;
        console.log('✅ Dashboard initialized');
    }

    async loadUserData() {
        console.log('🔍 Loading user data...');
        console.log('📍 Current URL:', window.location.href);

        try {
            // Check if user is logged in via JWT token (backend auth)
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');

            console.log('🔑 Auth token exists:', !!authToken);
            console.log('👤 Stored user exists:', !!storedUser);

            if (authToken) {
                console.log('🔑 Auth token (first 20 chars):', authToken.substring(0, 20) + '...');
            }

            if (storedUser) {
                console.log('📦 Raw stored user data:', storedUser);
            }

            // If we have user data, use it (even without token for now)
            if (storedUser) {
                console.log('✅ Found stored user data');

                try {
                    const userData = JSON.parse(storedUser);
                    console.log('📋 Parsed user data:', userData);

                    // Extract first name from multiple possible fields (robust approach)
                    const fullName =
                        userData.name ||
                        userData.full_name ||
                        userData.fullName ||
                        userData.username ||
                        userData.user_metadata?.full_name ||
                        userData.user_metadata?.name ||
                        [userData.user_metadata?.first_name, userData.user_metadata?.last_name].filter(Boolean).join(' ') ||
                        '';

                    console.log('� Full name from data:', fullName);
                    console.log('🔍 Checked fields:', {
                        'userData.name': userData.name,
                        'userData.full_name': userData.full_name,
                        'userData.fullName': userData.fullName,
                        'userData.username': userData.username,
                        'userData.email': userData.email
                    });

                    if (!fullName) {
                        console.error('❌ NO NAME FOUND in stored user data!');
                        console.error('📦 Full userData object:', JSON.stringify(userData, null, 2));
                    }

                    const nameParts = fullName.trim().split(' ');
                    const firstName = nameParts[0] || userData.user_metadata?.first_name || userData.email?.split('@')[0] || 'Member';
                    const lastName = nameParts.slice(1).join(' ') || userData.user_metadata?.last_name || '';

                    console.log('✂️ Name parts:', nameParts);
                    console.log('👤 Extracted firstName:', firstName);
                    console.log('👤 Extracted lastName:', lastName);

                    this.currentUser = {
                        id: userData.id,
                        email: userData.email,
                        name: fullName || userData.email?.split('@')[0] || 'Member',
                        firstName: firstName,
                        lastName: lastName,
                        role: userData.role || 'member',
                        membershipStatus: userData.membershipStatus || userData.membership_status || 'active',
                        created_at: userData.created_at,
                        studentId: userData.student_id || userData.registration_number,
                        registrationNumber: userData.registration_number,
                        course: userData.course,
                        yearOfStudy: userData.year_of_study || userData.yearOfStudy,
                        college: userData.college,
                        phone: userData.phone,
                        profilePicture: userData.profile_picture
                    };

                    console.log('✅ User data loaded from localStorage:', this.currentUser);
                    console.log('👤 First name extracted:', this.currentUser.firstName);

                    if (!authToken) {
                        console.warn('⚠️ Note: User data exists but authToken is missing. User may need to re-login for API calls.');
                    }

                } catch (parseError) {
                    console.error('❌ Error parsing stored user:', parseError);
                    console.error('❌ Parse error details:', parseError.message);
                    this.useMockUser();
                }
            } else {
                // No user data - user not logged in
                console.warn('⚠️ No user data found');
                console.log('🔍 Checking what we have:');
                console.log('   - authToken:', authToken ? 'exists' : 'missing');
                console.log('   - storedUser:', storedUser ? 'exists' : 'missing');
                console.log('⚠️ Redirecting to signin...');
                window.location.href = '/signin?redirect=/dashboard';
                return;
            }

        } catch (error) {
            console.error('❌ Error loading user data:', error);
            console.error('❌ Error stack:', error.stack);
            this.useMockUser();
        }

        this.renderUserProfile();
    }

    useMockUser() {
        console.warn('⚠️ Using mock user for development');
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

    waitForAuth() {
        return new Promise(resolve => {
            if (window.supabase) resolve();
            else {
                const check = () => window.supabase ? resolve() : setTimeout(check, 100);
                check();
            }
        });
    }

    getUserFromStorage() {
        try { return JSON.parse(localStorage.getItem('user')) || null; }
        catch { return null; }
    }

    renderUserProfile() {
        console.log('🎨 ========== RENDERING USER PROFILE ==========');
        const user = this.currentUser;

        console.log('📋 Current user object:', JSON.stringify(user, null, 2));

        // Build display name from available data
        const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Member';

        // Extract first name for welcome message
        const firstName = user.firstName || user.name?.split(' ')[0] || displayName.split(' ')[0] || user.email?.split('@')[0] || 'Member';

        // Get initials
        const initials = this.getInitials(displayName);

        console.log('👤 Display values calculated:');
        console.log('   - displayName:', displayName);
        console.log('   - firstName:', firstName);
        console.log('   - initials:', initials);
        console.log('🔍 DOM element userName:', this.dom.userName);
        console.log('🔍 DOM element exists:', !!this.dom.userName);

        // Update welcome message with actual first name
        if (this.dom.userName) {
            console.log('✏️ BEFORE - userName.textContent:', this.dom.userName.textContent);
            this.dom.userName.textContent = firstName;
            console.log('✏️ AFTER - userName.textContent:', this.dom.userName.textContent);
            console.log('✅ Updated userName element to:', firstName);

            // Force update with setAttribute as well
            this.dom.userName.setAttribute('data-name', firstName);

            // Double-check after a delay to see if something overwrites it
            setTimeout(() => {
                console.log('🔍 VERIFICATION (after 1 second) - userName.textContent:', this.dom.userName.textContent);
                if (this.dom.userName.textContent !== firstName) {
                    console.error('❌ WARNING: userName was changed from', firstName, 'to', this.dom.userName.textContent);
                    console.log('🔧 Forcing it back to:', firstName);
                    this.dom.userName.textContent = firstName;
                } else {
                    console.log('✅ VERIFIED: userName is still correct:', firstName);
                }
            }, 1000);

            // Also check after 2 seconds
            setTimeout(() => {
                console.log('🔍 FINAL CHECK (after 2 seconds) - userName.textContent:', this.dom.userName.textContent);
                if (this.dom.userName.textContent !== firstName) {
                    console.error('❌ STILL WRONG! Forcing again...');
                    this.dom.userName.textContent = firstName;
                }
            }, 2000);
        } else {
            console.error('❌ userName element not found in this.dom!');
            console.log('🔍 All cached DOM elements:', Object.keys(this.dom));
            console.log('🔍 Trying manual getElementById...');
            const manualFind = document.getElementById('userName');
            console.log('🔍 Manual find result:', manualFind);
            if (manualFind) {
                console.log('✏️ Found manually! Setting textContent...');
                manualFind.textContent = firstName;
                console.log('✅ Set via manual find to:', firstName);
                // Update the cache
                this.dom.userName = manualFind;
            }
        }

        // Set initials in avatar circles
        if (this.dom.userInitials) {
            this.dom.userInitials.textContent = initials;
        }

        // Update stats
        this.updateStats();
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    bindEvents() {
        const bindClick = (selector, fn) => document.getElementById(selector)?.addEventListener('click', fn);

        bindClick('createProjectBtn', () => this.showProjectModal());
        bindClick('joinEventBtn', () => window.location.href = '/events');
        bindClick('viewProfileBtn', () => window.location.href = '/settings');
        bindClick('payMembershipBtn', () => window.location.href = '/payment');
        bindClick('generateCardBtn', () => window.jkuatApp?.showToast('Membership card generated!', 'success'));
        bindClick('markAllReadBtn', () => this.notificationManager.markAllNotificationsRead());
        bindClick('requestMentorBtn', () => this.showMentorRequestModal());
        bindClick('viewAllProjectsBtn', () => this.showMyProjectsModal());
        bindClick('viewAllIdeasBtn', () => this.showMyIdeasModal());
        bindClick('viewAllPaymentsBtn', () => {
            window.location.href = '/payment';
        });
        bindClick('viewAllNotificationsBtn', () => this.showNotificationsModal());

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
            myProjects: this.projects?.length || 0
        };

        Object.entries(stats).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = id === 'accountBalance' ? `KSh ${value.toLocaleString()}` : value;
        });
    }

    createModal(contentHtml) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = contentHtml;

        // Use {once: true} to prevent memory leaks
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove(), { once: true });
        });

        modal.addEventListener('click', e => e.target === modal && modal.remove(), { once: true });
        document.body.appendChild(modal);

        return modal;
    }

    showProjectModal() {
        const modalHtml = `
            <div class="modal-content modal-inner">
                <div class="modal-header-flex">
                    <h2>Create Project</h2>
                    <button class="btn-glass btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <form id="createProjectForm">
                    <div class="form-group-mb">
                        <label class="form-label-block">Project Title *</label>
                        <input type="text" name="title" class="glass-input" placeholder="Enter project title" required>
                    </div>
                    <div class="form-group-mb">
                        <label class="form-label-block">Description *</label>
                        <textarea name="description" class="glass-input" rows="3" placeholder="Describe your project..." required></textarea>
                    </div>
                    <div class="form-group-mb">
                        <label class="form-label-block">Category</label>
                        <select name="category" class="glass-input">
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile App">Mobile App</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="IoT">IoT</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="modal-footer-flex">
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

    showMentorRequestModal(project = null) {
        const projectContext = project ? `for "${this.escapeHtml(project.title)}"` : '';
        const modalHtml = `
            <div class="modal-content modal-inner">
                <div class="modal-header-flex">
                    <h2>Request Mentor ${projectContext}</h2>
                    <button class="btn-glass btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <form id="mentorRequestForm">
                    <div class="form-group-mb">
                        <label class="form-label-block">Project/Area *</label>
                        <input type="text" name="project" class="glass-input" placeholder="What do you need help with?" value="${this.escapeHtml(project?.title || '')}" required>
                    </div>
                    <div class="form-group-mb">
                        <label class="form-label-block">Expertise Needed</label>
                        <select name="expertise" class="glass-input">
                            <option value="Web Development" ${project?.category === 'Web Development' ? 'selected' : ''}>Web Development</option>
                            <option value="Mobile App" ${project?.category === 'Mobile App' ? 'selected' : ''}>Mobile App</option>
                            <option value="AI/ML" ${project?.category === 'AI/ML' ? 'selected' : ''}>AI/ML</option>
                            <option value="IoT" ${project?.category === 'IoT' ? 'selected' : ''}>IoT</option>
                            <option value="Business" ${project?.category === 'Business' ? 'selected' : ''}>Business</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group-mb-lg">
                        <label class="form-label-block">Additional Details</label>
                        <textarea name="details" class="glass-input" rows="3" placeholder="Describe your needs..."></textarea>
                    </div>
                    <div class="modal-footer-flex">
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

    async showMyProjectsModal() {
        // Fetch all user's projects
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
            window.jkuatApp?.showToast('Please log in to view your projects', 'error');
            return;
        }

        try {
            const response = await fetch('/api/v1/dashboard/overview', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Failed to fetch projects');
            
            const data = await response.json();
            const projects = data.projects || [];

            const modalHtml = `
                <div class="modal-backdrop active" id="myProjectsModal">
                    <div class="modal-content-premium" style="max-width: 1200px; max-height: 90vh; overflow-y: auto;">
                        <button class="modal-close-btn" onclick="document.getElementById('myProjectsModal').remove(); document.body.style.overflow='auto';">×</button>
                        
                        <div class="modal-inner-padding">
                            <div style="text-align: center; margin-bottom: 2rem;">
                                <div class="incubation-icon-container" style="background: rgba(59, 130, 246, 0.2);">
                                    <i class="fas fa-project-diagram" style="font-size: 1.5rem; color: #3b82f6;"></i>
                                </div>
                                <h2 class="modal-title-vibrant">My Projects</h2>
                                <p class="modal-subtitle">${projects.length} project${projects.length !== 1 ? 's' : ''}</p>
                            </div>

                            ${projects.length === 0 ? `
                                <div style="text-center; padding: 3rem; color: rgba(255,255,255,0.5);">
                                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                                    <p>You haven't created any projects yet</p>
                                    <a href="/pages/projects/projects.html#create" class="btn btn-primary btn-sm" style="margin-top: 1rem;">
                                        <i class="fas fa-plus"></i> Create Your First Project
                                    </a>
                                </div>
                            ` : `
                                <div id="modalProjectsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
                                    ${projects.map(project => this.createMyProjectCard(project)).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.body.style.overflow = 'hidden';

            // Add event listeners for collaboration requests
            this.setupProjectCardListeners();

        } catch (error) {
            console.error('Error loading projects:', error);
            window.jkuatApp?.showToast('Failed to load projects', 'error');
        }
    }

    createMyProjectCard(project) {
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
                            <span class="project-status ${this.escapeHtml(project.status?.toLowerCase() || 'planning')}">${this.escapeHtml(project.status || 'Planning')}</span>
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
                        <i class="fas fa-users"></i>
                        <span id="team-count-${project.id}">Loading team...</span>
                    </div>
                    <div class="project-stat timeline">
                        <i class="fas fa-clock"></i>
                        <span>${this.escapeHtml(this.getTimeAgo(new Date(project.created_at)))}</span>
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-outline btn-sm" data-action="view-team" data-project-id="${this.escapeHtml(project.id)}">
                        <i class="fas fa-users"></i> Team
                    </button>
                    <button class="btn btn-primary btn-sm" data-action="view-requests" data-project-id="${this.escapeHtml(project.id)}">
                        <i class="fas fa-user-plus"></i> Requests
                    </button>
                </div>
            </div>
        `;
    }

    async setupProjectCardListeners() {
        // Load team counts for all projects
        const projectCards = document.querySelectorAll('[data-project-id]');
        projectCards.forEach(async (card) => {
            const projectId = card.dataset.projectId;
            await this.loadTeamCount(projectId);
        });

        // View team button
        document.querySelectorAll('[data-action="view-team"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const projectId = btn.dataset.projectId;
                await this.showTeamModal(projectId);
            });
        });

        // View requests button
        document.querySelectorAll('[data-action="view-requests"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const projectId = btn.dataset.projectId;
                await this.showCollaborationRequestsModal(projectId);
            });
        });
    }

    async loadTeamCount(projectId) {
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/collaborations?status=accepted`);
            if (response.ok) {
                const data = await response.json();
                const count = data.collaborations?.length || 0;
                const el = document.getElementById(`team-count-${projectId}`);
                if (el) el.textContent = `${count} member${count !== 1 ? 's' : ''}`;
            }
        } catch (error) {
            console.error('Error loading team count:', error);
        }
    }

    async showTeamModal(projectId) {
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/collaborations?status=accepted`);
            if (!response.ok) throw new Error('Failed to fetch team');
            
            const data = await response.json();
            const team = data.collaborations || [];

            const modalHtml = `
                <div class="modal-backdrop active" id="teamModal">
                    <div class="modal-content-premium" style="max-width: 600px;">
                        <button class="modal-close-btn" onclick="document.getElementById('teamModal').remove();">×</button>
                        
                        <div class="modal-inner-padding">
                            <h2 class="modal-title-vibrant">Team Members</h2>
                            
                            ${team.length === 0 ? `
                                <p style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">
                                    No team members yet
                                </p>
                            ` : `
                                <div style="display: flex; flex-direction: column; gap: 1rem;">
                                    ${team.map(member => `
                                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
                                            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                                ${this.escapeHtml(member.user?.name?.charAt(0) || '?')}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-weight: 600;">${this.escapeHtml(member.user?.name || 'Unknown')}</div>
                                                <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">${this.escapeHtml(member.role)}</div>
                                            </div>
                                            <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem;">
                                                ${this.escapeHtml(member.time_commitment || 'N/A')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('Error showing team:', error);
            window.jkuatApp?.showToast('Failed to load team members', 'error');
        }
    }

    async showCollaborationRequestsModal(projectId) {
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/collaborations?status=pending`);
            if (!response.ok) throw new Error('Failed to fetch requests');
            
            const data = await response.json();
            const requests = data.collaborations || [];

            const modalHtml = `
                <div class="modal-backdrop active" id="requestsModal">
                    <div class="modal-content-premium" style="max-width: 700px;">
                        <button class="modal-close-btn" onclick="document.getElementById('requestsModal').remove();">×</button>
                        
                        <div class="modal-inner-padding">
                            <h2 class="modal-title-vibrant">Collaboration Requests</h2>
                            
                            ${requests.length === 0 ? `
                                <p style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">
                                    No pending requests
                                </p>
                            ` : `
                                <div id="requestsList" style="display: flex; flex-direction: column; gap: 1rem;">
                                    ${requests.map(req => `
                                        <div class="collaboration-request" data-request-id="${req.id}" style="padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                                            <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 1rem;">
                                                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.25rem;">
                                                    ${this.escapeHtml((req.contact_email?.charAt(0) || '?').toUpperCase())}
                                                </div>
                                                <div style="flex: 1;">
                                                    <div style="color: white; font-weight: 600; margin-bottom: 0.25rem;">${this.escapeHtml(req.contact_email)}</div>
                                                    <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">
                                                        <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                                            ${this.escapeHtml(req.role)}
                                                        </span>
                                                        <span style="margin-left: 0.5rem;">${this.escapeHtml(req.time_commitment || 'N/A')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            ${req.skills_offered && req.skills_offered.length > 0 ? `
                                                <div style="margin-bottom: 1rem;">
                                                    <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem; margin-bottom: 0.5rem;">Skills:</div>
                                                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                                        ${req.skills_offered.map(skill => `
                                                            <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                                                ${this.escapeHtml(skill)}
                                                            </span>
                                                        `).join('')}
                                                    </div>
                                                </div>
                                            ` : ''}
                                            
                                            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                                                <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem; margin-bottom: 0.5rem;">Message:</div>
                                                <div style="color: rgba(255,255,255,0.9); font-size: 0.875rem;">${this.escapeHtml(req.message)}</div>
                                            </div>
                                            
                                            <div style="display: flex; gap: 0.5rem;">
                                                <button class="btn btn-primary btn-sm" onclick="dashboard.approveRequest('${req.id}', '${projectId}')">
                                                    <i class="fas fa-check"></i> Approve
                                                </button>
                                                <button class="btn btn-outline btn-sm" onclick="dashboard.denyRequest('${req.id}', '${projectId}')">
                                                    <i class="fas fa-times"></i> Deny
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('Error showing requests:', error);
            window.jkuatApp?.showToast('Failed to load collaboration requests', 'error');
        }
    }

    async approveRequest(collaborationId, projectId) {
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/collaborations/${collaborationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'accepted' })
            });

            if (!response.ok) throw new Error('Failed to approve request');

            window.jkuatApp?.showToast('Request approved!', 'success');
            
            // Refresh the requests modal
            document.getElementById('requestsModal')?.remove();
            await this.showCollaborationRequestsModal(projectId);
            
        } catch (error) {
            console.error('Error approving request:', error);
            window.jkuatApp?.showToast('Failed to approve request', 'error');
        }
    }

    async denyRequest(collaborationId, projectId) {
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/collaborations/${collaborationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'declined' })
            });

            if (!response.ok) throw new Error('Failed to deny request');

            window.jkuatApp?.showToast('Request denied', 'info');
            
            // Refresh the requests modal
            document.getElementById('requestsModal')?.remove();
            await this.showCollaborationRequestsModal(projectId);
            
        } catch (error) {
            console.error('Error denying request:', error);
            window.jkuatApp?.showToast('Failed to deny request', 'error');
        }
    }

    // ===== Project integration =====
    addProjectToGrid(projectData) {
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

        this.projects.unshift(newProject);
        
        // Re-render projects
        this.loadMyProjects();
        this.updateStats();
    }

    // ======= Load dashboard data =======
    async loadMockData() {
        console.log('📊 Loading dashboard data from API...');
        await Promise.all([
            this.loadMyProjects(),
            this.loadMyIdeas(),
            this.loadPaymentHistory(),
            this.loadNotifications()
        ]);
    }

    async loadMyProjects() {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token');
                if (this.dom.projectsCount) this.dom.projectsCount.textContent = '0';
                document.getElementById('projectsCountDisplay').textContent = '0';
                return;
            }

            const response = await fetch('/api/v1/dashboard/overview', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const data = await response.json();
            const projects = data.projects || [];
            
            // Store projects for modal
            this.projects = projects;

            console.log('✅ Projects loaded:', projects.length);

            // Update counts
            if (this.dom.projectsCount) this.dom.projectsCount.textContent = projects.length;
            document.getElementById('projectsCountDisplay').textContent = projects.length;

        } catch (error) {
            console.error('❌ Error loading projects:', error);
            if (this.dom.projectsCount) this.dom.projectsCount.textContent = '0';
            document.getElementById('projectsCountDisplay').textContent = '0';
        }
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
                        <span>${this.escapeHtml(project.project_lead?.name || 'No Lead Assigned')}</span>
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

    async loadMyIdeas() {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token');
                if (this.dom.ideasCount) this.dom.ideasCount.textContent = '0';
                document.getElementById('ideasCountDisplay').textContent = '0';
                return;
            }

            const response = await fetch('/api/v1/dashboard/overview', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const data = await response.json();
            const ideas = data.ideas || [];
            
            // Store ideas for modal
            this.ideas = ideas;

            console.log('✅ Ideas loaded:', ideas.length);

            // Update counts
            if (this.dom.ideasCount) this.dom.ideasCount.textContent = ideas.length;
            document.getElementById('ideasCountDisplay').textContent = ideas.length;

        } catch (error) {
            console.error('❌ Error loading ideas:', error);
            if (this.dom.ideasCount) this.dom.ideasCount.textContent = '0';
            document.getElementById('ideasCountDisplay').textContent = '0';
        }
    }

    async showMyIdeasModal() {
        const ideas = this.ideas || [];

        const modalHtml = `
            <div class="modal-backdrop active" id="myIdeasModal">
                <div class="modal-content-premium" style="max-width: 1200px; max-height: 90vh; overflow-y: auto;">
                    <button class="modal-close-btn" onclick="document.getElementById('myIdeasModal').remove(); document.body.style.overflow='auto';">×</button>
                    
                    <div class="modal-inner-padding">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <div class="incubation-icon-container" style="background: rgba(234, 179, 8, 0.2);">
                                <i class="fas fa-lightbulb" style="font-size: 1.5rem; color: #eab308;"></i>
                            </div>
                            <h2 class="modal-title-vibrant">My Ideas</h2>
                            <p class="modal-subtitle">${ideas.length} idea${ideas.length !== 1 ? 's' : ''}</p>
                        </div>

                        ${ideas.length === 0 ? `
                            <div style="text-center; padding: 3rem; color: rgba(255,255,255,0.5);">
                                <i class="fas fa-lightbulb" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                                <p>You haven't submitted any ideas yet</p>
                                <a href="/pages/ideas/ideas.html#submit" class="btn btn-primary btn-sm" style="margin-top: 1rem;">
                                    <i class="fas fa-plus"></i> Submit Your First Idea
                                </a>
                            </div>
                        ` : `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
                                ${ideas.map(idea => `
                                    <div style="padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                                        <div style="display: flex; justify-between; align-items: start; margin-bottom: 1rem;">
                                            <h3 style="color: white; font-weight: 600; flex: 1;">${this.escapeHtml(idea.title)}</h3>
                                            <span style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; background: rgba(234, 179, 8, 0.2); color: #fbbf24;">
                                                ${this.escapeHtml(idea.status || 'pending')}
                                            </span>
                                        </div>
                                        <p style="color: rgba(255,255,255,0.7); font-size: 0.875rem; margin-bottom: 1rem;">
                                            ${this.escapeHtml(idea.description || '')}
                                        </p>
                                        <div style="display: flex; justify-between; align-items: center; font-size: 0.75rem; color: rgba(255,255,255,0.5);">
                                            <span><i class="fas fa-thumbs-up"></i> ${idea.votes_count || 0} votes</span>
                                            <span><i class="fas fa-comments"></i> ${idea.comments_count || 0} comments</span>
                                            <span><i class="fas fa-clock"></i> ${this.getTimeAgo(new Date(idea.created_at))}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    }

    async loadPaymentHistory() {
        const container = document.getElementById('paymentHistory');
        if (!container) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token, showing empty state');
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-receipt text-3xl mb-2 opacity-50"></i>
                        <p>No payment history</p>
                    </div>
                `;
                return;
            }

            const response = await fetch('/api/v1/dashboard/overview', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            const payments = (data.payments || []).slice(0, 3);

            console.log('✅ Payments loaded:', payments.length);

            // Update payment count in compact card
            const paymentsCountEl = document.getElementById('paymentsCountDisplay');
            if (paymentsCountEl) {
                paymentsCountEl.textContent = data.payments?.length || 0;
            }

            container.innerHTML = '';

            if (payments.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-receipt text-3xl mb-2 opacity-50"></i>
                        <p>No payment history</p>
                    </div>
                `;
                return;
            }

            payments.forEach(payment => {
                const paymentDate = new Date(payment.created_at);
                const paymentItem = document.createElement('div');
                paymentItem.className = 'p-3 bg-white/5 rounded-lg border border-white/10';
                
                const statusColor = payment.status === 'completed' ? 'green' : 
                                  payment.status === 'pending' ? 'yellow' : 'red';
                
                paymentItem.innerHTML = `
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-white text-sm font-medium">${this.escapeHtml(payment.description || payment.payment_type || 'Payment')}</span>
                        <span class="text-${statusColor}-400 font-semibold">${payment.currency || 'KSh'} ${parseFloat(payment.amount || 0).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs text-gray-400">
                        <span>${paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span class="flex items-center gap-1">
                            <i class="fas ${payment.status === 'completed' ? 'fa-check-circle text-green-500' : 'fa-clock text-yellow-500'}"></i>
                            ${this.escapeHtml(payment.payment_method || 'N/A')}
                        </span>
                    </div>
                `;
                container.appendChild(paymentItem);
            });
        } catch (error) {
            console.error('❌ Error loading payments:', error);
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-exclamation-triangle text-3xl mb-2 opacity-50"></i>
                    <p>Failed to load payment history</p>
                </div>
            `;
        }
    }

    async loadNotifications() {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token');
                document.getElementById('notificationsCountDisplay').textContent = '0';
                return;
            }

            // Get user ID from stored user data
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                console.warn('⚠️ No user data');
                document.getElementById('notificationsCountDisplay').textContent = '0';
                return;
            }

            const userData = JSON.parse(storedUser);
            const userId = userData.id;

            // Fetch notifications from API
            const response = await fetch(`/api/v1/notifications/user/${userId}?unread_only=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch notifications');

            const data = await response.json();
            const notificationsCount = data.unreadCount || 0;

            console.log('✅ Notifications count:', notificationsCount);

            // Update count
            document.getElementById('notificationsCountDisplay').textContent = notificationsCount;

        } catch (error) {
            console.error('❌ Error loading notifications:', error);
            document.getElementById('notificationsCountDisplay').textContent = '0';
        }
    }

    async showNotificationsModal() {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');
            
            if (!token || !storedUser) {
                alert('Please log in to view notifications');
                return;
            }

            const userData = JSON.parse(storedUser);
            const userId = userData.id;

            // Fetch all notifications
            const response = await fetch(`/api/v1/notifications/user/${userId}?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch notifications');

            const data = await response.json();
            const notifications = data.notifications || [];

            const modalHtml = `
                <div class="modal-backdrop active" id="notificationsModal">
                    <div class="modal-content-premium" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                        <button class="modal-close-btn" onclick="document.getElementById('notificationsModal').remove(); document.body.style.overflow='auto';">×</button>
                        
                        <div class="modal-inner-padding">
                            <div style="text-align: center; margin-bottom: 2rem;">
                                <div class="incubation-icon-container" style="background: rgba(59, 130, 246, 0.2);">
                                    <i class="fas fa-bell" style="font-size: 1.5rem; color: #3b82f6;"></i>
                                </div>
                                <h2 class="modal-title-vibrant">Notifications</h2>
                                <p class="modal-subtitle">${notifications.length} notification${notifications.length !== 1 ? 's' : ''}</p>
                            </div>

                            ${notifications.length === 0 ? `
                                <div style="text-center; padding: 3rem; color: rgba(255,255,255,0.5);">
                                    <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                                    <p>No notifications yet</p>
                                </div>
                            ` : `
                                <div style="display: flex; flex-direction: column; gap: 1rem;">
                                    ${notifications.map(notif => this.renderNotificationItem(notif, userId, token)).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error loading notifications:', error);
            alert('Failed to load notifications');
        }
    }

    renderNotificationItem(notif, userId, token) {
        const isUnread = !notif.read_at;
        const priorityColors = {
            'low': 'gray',
            'medium': 'blue',
            'high': 'orange',
            'urgent': 'red'
        };
        const priorityColor = priorityColors[notif.priority] || 'blue';

        return `
            <div style="padding: 1.5rem; background: ${isUnread ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${isUnread ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)'}; border-radius: 0.5rem; position: relative;">
                ${isUnread ? '<div style="position: absolute; top: 1rem; right: 1rem; width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>' : ''}
                
                <div style="display: flex; align-items: start; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(${priorityColor === 'blue' ? '59, 130, 246' : priorityColor === 'orange' ? '245, 158, 11' : priorityColor === 'red' ? '239, 68, 68' : '156, 163, 175'}, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-bell" style="color: ${priorityColor === 'blue' ? '#3b82f6' : priorityColor === 'orange' ? '#f59e0b' : priorityColor === 'red' ? '#ef4444' : '#9ca3af'};"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <h4 style="color: white; margin: 0; font-size: 1rem;">${this.escapeHTML(notif.title)}</h4>
                            <span style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${this.getTimeAgo(new Date(notif.created_at))}</span>
                        </div>
                        <p style="color: rgba(255,255,255,0.8); margin: 0 0 0.5rem 0; font-size: 0.875rem;">${this.escapeHTML(notif.message)}</p>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: rgba(${priorityColor === 'blue' ? '59, 130, 246' : priorityColor === 'orange' ? '245, 158, 11' : priorityColor === 'red' ? '239, 68, 68' : '156, 163, 175'}, 0.2); color: ${priorityColor === 'blue' ? '#60a5fa' : priorityColor === 'orange' ? '#fbbf24' : priorityColor === 'red' ? '#f87171' : '#d1d5db'}; border-radius: 0.25rem;">
                                ${this.escapeHTML(notif.type.replace(/_/g, ' '))}
                            </span>
                            ${notif.action_url ? `
                                <a href="${this.escapeHTML(notif.action_url)}" style="font-size: 0.75rem; color: #3b82f6; text-decoration: none;">
                                    ${this.escapeHTML(notif.action_text || 'View')} →
                                </a>
                            ` : ''}
                            ${isUnread ? `
                                <button onclick="dashboard.markNotificationAsRead('${notif.id}', '${userId}', '${token}')" style="margin-left: auto; font-size: 0.75rem; padding: 0.25rem 0.5rem; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: none; border-radius: 0.25rem; cursor: pointer;">
                                    Mark as read
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async markNotificationAsRead(notificationId, userId, token) {
        try {
            const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) throw new Error('Failed to mark as read');

            // Refresh notifications
            document.getElementById('notificationsModal')?.remove();
            document.body.style.overflow = 'auto';
            await this.loadNotifications();
            this.showNotificationsModal();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async loadNotificationsList() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token, showing empty state');
                container.innerHTML = `
                    <div class="text-center py-4 text-gray-400 text-sm">
                        <i class="fas fa-bell-slash text-2xl mb-2 opacity-50"></i>
                        <p>No new notifications</p>
                    </div>
                `;
                return;
            }

            const response = await fetch('/api/dashboard/overview', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            const notifications = (data.notifications || []).slice(0, 5);

            console.log('✅ Notifications loaded:', notifications.length);

            // Update notification count in compact card
            const notifCountEl = document.getElementById('notifCount');
            if (notifCountEl) {
                notifCountEl.textContent = data.counts?.unreadNotifications || 0;
            }

            container.innerHTML = '';

            if (notifications.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4 text-gray-400 text-sm">
                        <i class="fas fa-bell-slash text-2xl mb-2 opacity-50"></i>
                        <p>No new notifications</p>
                    </div>
                `;
                if (this.dom.notifBadge) {
                    this.dom.notifBadge.classList.add('hidden');
                }
                return;
            }

            // Update badge count
            const unreadCount = notifications.filter(n => !n.read_at).length;
            if (this.dom.notifBadge) {
                if (unreadCount > 0) {
                    this.dom.notifBadge.textContent = unreadCount;
                    this.dom.notifBadge.classList.remove('hidden');
                } else {
                    this.dom.notifBadge.classList.add('hidden');
                }
            }

            notifications.forEach(notif => {
                const notifDate = new Date(notif.created_at);
                const timeAgo = this.getTimeAgo(notifDate);

                const typeColors = {
                    'event': 'blue',
                    'project': 'green',
                    'payment': 'yellow',
                    'admin': 'purple',
                    'system': 'gray'
                };
                
                const typeIcons = {
                    'event': 'fa-calendar-alt',
                    'project': 'fa-project-diagram',
                    'payment': 'fa-credit-card',
                    'admin': 'fa-bullhorn',
                    'system': 'fa-bell'
                };

                const color = typeColors[notif.type] || 'blue';
                const icon = typeIcons[notif.type] || 'fa-bell';

                const notifItem = document.createElement('div');
                notifItem.className = `p-3 rounded-lg border transition-all cursor-pointer ${!notif.read_at
                    ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`;
                notifItem.innerHTML = `
                    <div class="flex gap-3">
                        <div class="w-8 h-8 rounded-full bg-${color}-500/20 flex items-center justify-center flex-shrink-0">
                            <i class="fas ${icon} text-${color}-400 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-white font-medium text-sm">${this.escapeHtml(notif.title)}</h4>
                            <p class="text-gray-400 text-xs mt-1">${this.escapeHtml(notif.message)}</p>
                            <span class="text-xs text-gray-500 mt-1 inline-block">${timeAgo}</span>
                        </div>
                        ${!notif.read_at ? '<div class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>' : ''}
                    </div>
                `;
                
                if (notif.action_url) {
                    notifItem.addEventListener('click', () => {
                        window.location.href = notif.action_url;
                    });
                }
                
                container.appendChild(notifItem);
            });

            // Add mark all read functionality
            if (this.dom.markAllReadBtn && unreadCount > 0) {
                this.dom.markAllReadBtn.onclick = async () => {
                    try {
                        const response = await fetch(`/api/notifications/user/${this.currentUser.id}/read-all`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (response.ok) {
                            // Update UI
                            container.querySelectorAll('.bg-blue-500\\/10').forEach(el => {
                                el.className = 'p-3 rounded-lg border transition-all cursor-pointer bg-white/5 border-white/10 hover:bg-white/10';
                                const dot = el.querySelector('.bg-blue-500');
                                if (dot) dot.remove();
                            });
                            if (this.dom.notifBadge) {
                                this.dom.notifBadge.classList.add('hidden');
                            }
                        }
                    } catch (error) {
                        console.error('Error marking notifications as read:', error);
                    }
                };
            }
        } catch (error) {
            console.error('❌ Error loading notifications:', error);
            container.innerHTML = `
                <div class="text-center py-4 text-gray-400 text-sm">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2 opacity-50"></i>
                    <p>Failed to load notifications</p>
                </div>
            `;
        }
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    initializeNotificationSystem() {
        // Notification system initialized
    }

    // Update clock in real-time
    startClock() {
        const updateTime = () => {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            const timeString = now.toLocaleDateString('en-US', options);
            if (this.dom.currentTime) {
                this.dom.currentTime.textContent = timeString;
            }
        };
        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    }

}

window.DashboardPage = DashboardPage;

window.DashboardPage = DashboardPage;

// Better initialization that handles case where DOM is already loaded
const bootDashboard = () => {
    console.log('🚀 Booting Dashboard Controller...');
    if (!window.dashboardPage) {
        window.dashboardPage = new DashboardPage();
        window.dashboard = window.dashboardPage; // Expose for onclick handlers and notification methods
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDashboard);
} else {
    bootDashboard();
}
