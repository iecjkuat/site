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

        // Initialize modules
        try {
            console.log('📦 Initializing NotificationManager...');
            this.notificationManager = new NotificationManager(this);
            console.log('📦 Initializing ProjectManager...');
            this.projectManager = new ProjectManager(this);
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
            'userName', 'userName2', 'userEmail', 'userRole',
            'myProjectsGrid', 'myIdeasGrid', 'paymentHistory', 'currentTime',
            'userInitials', 'userInitials2', 'ideasCount', 'projectsCount',
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

        // Update profile card with full name
        if (this.dom.userName2) {
            this.dom.userName2.textContent = displayName;
        }

        // Update other profile fields
        if (this.dom.userEmail) {
            this.dom.userEmail.textContent = user.email || '';
        }

        if (this.dom.userRole) {
            this.dom.userRole.textContent = user.role || 'Member';
        }

        // Set initials in avatar circles
        if (this.dom.userInitials) {
            this.dom.userInitials.textContent = initials;
        }
        if (this.dom.userInitials2) {
            this.dom.userInitials2.textContent = initials;
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
            myProjects: this.projectManager.projects.length
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
    async loadMockData() {
        console.log('📊 Loading dashboard data from API...');
        await Promise.all([
            this.loadMyProjects(),
            this.loadMyIdeas(),
            this.loadPaymentHistory(),
            this.loadNotificationsList()
        ]);
    }

    async loadMyProjects() {
        const container = this.dom.myProjectsGrid;
        if (!container) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token, showing empty state');
                this.showEmptyProjects(container);
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
            const projects = data.projects || [];

            console.log('✅ Projects loaded:', projects.length);

            container.innerHTML = '';

            if (projects.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-folder-plus text-3xl mb-2 opacity-50"></i>
                        <p>No projects yet</p>
                        <a href="/projects" class="btn btn-primary btn-sm mt-3">
                            <i class="fas fa-plus"></i> Create Your First Project
                        </a>
                    </div>
                `;
                if (this.dom.projectsCount) this.dom.projectsCount.textContent = '0';
                return;
            }

            if (this.dom.projectsCount) this.dom.projectsCount.textContent = projects.length;

            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer';
                
                const statusColor = project.status === 'Active' ? 'green' : 
                                  project.status === 'Completed' ? 'blue' : 'yellow';
                
                projectCard.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="text-white font-semibold flex-1">${this.escapeHtml(project.title)}</h4>
                        <span class="px-2 py-1 text-xs rounded-full bg-${statusColor}-500/20 text-${statusColor}-400 ml-2">
                            ${this.escapeHtml(project.status || 'Planning')}
                        </span>
                    </div>
                    <p class="text-gray-400 text-sm mb-3">${this.escapeHtml(project.description || '')}</p>
                    ${project.progress_percentage !== null && project.progress_percentage !== undefined ? `
                        <div class="mb-3">
                            <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>${project.progress_percentage}%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style="width: ${project.progress_percentage}%"></div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="flex justify-between items-center text-xs text-gray-400">
                        <span class="flex items-center gap-1">
                            <i class="fas fa-tag"></i> ${this.escapeHtml(project.category || 'General')}
                        </span>
                        <span class="flex items-center gap-1">
                            <i class="fas fa-clock"></i> ${this.getTimeAgo(new Date(project.created_at))}
                        </span>
                    </div>
                `;
                
                projectCard.addEventListener('click', () => {
                    window.location.href = `/projects#${project.id}`;
                });
                
                container.appendChild(projectCard);
            });
        } catch (error) {
            console.error('❌ Error loading projects:', error);
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-exclamation-triangle text-3xl mb-2 opacity-50"></i>
                    <p>Failed to load projects</p>
                </div>
            `;
        }
    }

    async loadMyIdeas() {
        const container = this.dom.myIdeasGrid;
        if (!container) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (!token) {
                console.warn('⚠️ No auth token, showing empty state');
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-lightbulb text-3xl mb-2 opacity-50"></i>
                        <p>No ideas submitted yet</p>
                        <a href="/ideas" class="btn btn-primary btn-sm mt-3">
                            <i class="fas fa-plus"></i> Submit Your First Idea
                        </a>
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
            const ideas = data.ideas || [];

            console.log('✅ Ideas loaded:', ideas.length);

            container.innerHTML = '';

            if (ideas.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-lightbulb text-3xl mb-2 opacity-50"></i>
                        <p>No ideas submitted yet</p>
                        <a href="/ideas" class="btn btn-primary btn-sm mt-3">
                            <i class="fas fa-plus"></i> Submit Your First Idea
                        </a>
                    </div>
                `;
                if (this.dom.ideasCount) this.dom.ideasCount.textContent = '0';
                return;
            }

            if (this.dom.ideasCount) this.dom.ideasCount.textContent = ideas.length;

            ideas.forEach(idea => {
                const ideaDate = new Date(idea.created_at);
                const timeAgo = this.getTimeAgo(ideaDate);

                const statusColor = idea.status === 'approved' ? 'green' : 
                                  idea.status === 'pending' ? 'yellow' : 'gray';

                const ideaCard = document.createElement('div');
                ideaCard.className = 'p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer';
                ideaCard.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="text-white font-semibold flex-1">${this.escapeHtml(idea.title)}</h4>
                        <span class="px-2 py-1 text-xs rounded-full bg-${statusColor}-500/20 text-${statusColor}-400 ml-2">
                            ${this.escapeHtml(idea.status || 'pending')}
                        </span>
                    </div>
                    <p class="text-gray-400 text-sm mb-3">${this.escapeHtml(idea.description || '')}</p>
                    <div class="flex justify-between items-center text-xs text-gray-400">
                        <span class="flex items-center gap-1">
                            <i class="fas fa-thumbs-up"></i> ${idea.votes_count || 0} votes
                        </span>
                        <span class="flex items-center gap-1">
                            <i class="fas fa-comment"></i> ${idea.comments_count || 0} comments
                        </span>
                        <span>${timeAgo}</span>
                    </div>
                `;
                
                ideaCard.addEventListener('click', () => {
                    window.location.href = `/ideas#${idea.id}`;
                });
                
                container.appendChild(ideaCard);
            });
        } catch (error) {
            console.error('❌ Error loading ideas:', error);
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-exclamation-triangle text-3xl mb-2 opacity-50"></i>
                    <p>Failed to load ideas</p>
                </div>
            `;
        }
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

            const response = await fetch('/api/dashboard/overview', {
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
        this.startNotificationPolling();
        if (['localhost', '127.0.0.1'].includes(window.location.hostname)) this.addDemoNotificationButton();
    }

    startNotificationPolling() {
        setInterval(() => Math.random() < 0.1 && this.notificationManager.simulateNotification(), 30000);
    }

    addDemoNotificationButton() {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm demo-notif-btn';
        btn.innerHTML = '<i class="fas fa-bell"></i> Demo Notification';
        btn.addEventListener('click', () => this.notificationManager.simulateNotification());
        document.body.appendChild(btn);
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
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDashboard);
} else {
    bootDashboard();
}
