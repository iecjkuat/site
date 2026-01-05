// Dashboard Page - Authentication Component (Refactored)

class DashboardAuth {
    constructor() {
        this.currentUser = null;
        this.domCache = {}; // Cache DOM elements for performance
        this.init();
    }

    init() {
        console.log('🔐 Initializing DashboardAuth...');
        this.cacheDomElements();
        this.checkAuthState();
        this.bindEvents();
        console.log('✅ DashboardAuth initialized');
    }

    cacheDomElements() {
        this.domCache = {
            userNameEls: document.querySelectorAll('.user-name'),
            userEmailEls: document.querySelectorAll('.user-email'),
            userName: document.getElementById('userName'),
            userName2: document.getElementById('userName2'),
            userEmail: document.getElementById('userEmail'),
            userRole: document.getElementById('userRole'),
            memberSince: document.getElementById('memberSince'),
            membershipStatus: document.querySelector('.membership-status'),
            payBtn: document.getElementById('payMembershipBtn'),
            cardBtn: document.getElementById('generateCardBtn'),
            avatarEls: document.querySelectorAll('.user-avatar, .profile-picture'),
            studentIdEl: document.getElementById('studentId'),
            courseEl: document.getElementById('course'),
            yearOfStudyEl: document.getElementById('yearOfStudy')
        };
    }

    async checkAuthState() {
        const token = localStorage.getItem('authToken');

        if (token) {
            await this.fetchRealUser(token);
        } else {
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) {
                try {
                    this.currentUser = JSON.parse(cachedUser);
                    this.updateUIForLoggedInUser();
                    console.log('✅ Using cached user data:', this.currentUser);
                } catch {
                    this.createMockUser();
                }
            } else {
                this.createMockUser();
            }
        }
    }

    async fetchRealUser(token) {
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                this.mapRealUser(userData);
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                this.updateUIForLoggedInUser();
                console.log('✅ Real user data loaded:', this.currentUser);
            } else if (response.status === 401) {
                console.warn('⚠️ Invalid token, clearing auth data');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                this.createMockUser();
            } else {
                throw new Error('Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            this.createMockUser();
        }
    }

    mapRealUser(userData) {
        this.currentUser = {
            id: userData.id,
            name: userData.name || 'User',
            firstName: userData.name?.split(' ')[0] || '',
            lastName: userData.name?.split(' ').slice(1).join(' ') || '',
            email: userData.email,
            phone: userData.phone,
            studentId: userData.registration_number,
            course: userData.course,
            yearOfStudy: userData.year_of_study,
            college: userData.college,
            role: userData.role || 'Member',
            membershipStatus: userData.membership_status,
            isMember: userData.membership_status === 'active',
            profilePicture: userData.profile_picture,
            bio: userData.bio,
            dateOfBirth: userData.date_of_birth,
            gender: userData.gender,
            linkedinUrl: userData.linkedin_url,
            skills: userData.skills,
            interests: userData.interests,
            experienceLevel: userData.experience_level,
            goals: userData.goals,
            preferredCommunication: userData.preferred_communication,
            socialLinks: userData.social_links,
            emailVerified: userData.email_verified,
            phoneVerified: userData.phone_verified,
            profileCompleted: userData.profile_completed,
            created_at: userData.created_at,
            updated_at: userData.updated_at
        };
        window.currentUser = this.currentUser;
    }

    createMockUser() {
        this.currentUser = {
            id: 'mock-user-1',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@student.jkuat.ac.ke',
            studentId: 'SCT211-0001/2023',
            course: 'Computer Science',
            role: 'Member',
            isMember: true,
            membershipStatus: 'active',
            created_at: new Date().toISOString(),
            profilePicture: null
        };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        window.currentUser = this.currentUser;

        this.updateUIForLoggedInUser();
        console.log('✅ Mock user created for development:', this.currentUser);
    }

    updateUIForLoggedInUser() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim() || 'User';
        const fadeIn = el => el?.classList.add('fade-in');

        // Update names and email
        this.domCache.userNameEls.forEach(el => { el.textContent = displayName; fadeIn(el); });
        this.domCache.userEmailEls.forEach(el => { el.textContent = this.currentUser.email || ''; fadeIn(el); });
        if (this.domCache.userName) { this.domCache.userName.textContent = displayName; fadeIn(this.domCache.userName); }
        if (this.domCache.userName2) { this.domCache.userName2.textContent = displayName; fadeIn(this.domCache.userName2); }
        if (this.domCache.userEmail) { this.domCache.userEmail.textContent = this.currentUser.email || ''; fadeIn(this.domCache.userEmail); }

        // Role and member since
        if (this.domCache.userRole) { this.domCache.userRole.textContent = this.currentUser.role || 'Member'; fadeIn(this.domCache.userRole); }
        if (this.domCache.memberSince && this.currentUser.created_at) {
            this.domCache.memberSince.textContent = new Date(this.currentUser.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            fadeIn(this.domCache.memberSince);
        }

        // Membership status & buttons
        const isActive = this.currentUser.membershipStatus === 'active' || this.currentUser.isMember;
        if (this.domCache.membershipStatus) {
            this.domCache.membershipStatus.textContent = isActive ? 'Active' : 'Inactive';
            this.domCache.membershipStatus.className = isActive ? 'stat-number text-green-500' : 'stat-number text-red-500';
        }
        if (this.domCache.payBtn) this.domCache.payBtn.classList.toggle('hidden', isActive);
        if (this.domCache.cardBtn) this.domCache.cardBtn.classList.toggle('hidden', !isActive);

        // Profile picture / initials
        this.domCache.avatarEls.forEach(el => {
            if (this.currentUser.profilePicture) {
                if (el.tagName === 'IMG') {
                    el.src = this.currentUser.profilePicture;
                    el.alt = displayName;
                } else {
                    el.style.backgroundImage = `url(${this.currentUser.profilePicture})`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                }
            } else if (el.tagName !== 'IMG') {
                el.textContent = this.getInitials(displayName);
                el.style.backgroundImage = 'none';
            }
        });

        // Student info
        if (this.domCache.studentIdEl && this.currentUser.studentId) { this.domCache.studentIdEl.textContent = this.currentUser.studentId; fadeIn(this.domCache.studentIdEl); }
        if (this.domCache.courseEl && this.currentUser.course) { this.domCache.courseEl.textContent = this.currentUser.course; fadeIn(this.domCache.courseEl); }
        if (this.domCache.yearOfStudyEl && this.currentUser.yearOfStudy) { this.domCache.yearOfStudyEl.textContent = `Year ${this.currentUser.yearOfStudy}`; fadeIn(this.domCache.yearOfStudyEl); }
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.currentUser = null;

        window.jkuatApp?.showToast('Logged out successfully!', 'success');

        setTimeout(() => window.location.href = '/', 1000);
    }

    bindEvents() {
        document.addEventListener('click', e => {
            if (e.target.matches('.logout-btn, #logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Dashboard Auth DOM loaded');
    window.dashboardAuth = new DashboardAuth();
});

window.DashboardAuth = DashboardAuth;
