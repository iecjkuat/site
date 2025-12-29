// JKUAT Innovation Club - Leadership & Team Management

class LeadershipManager {
    constructor() {
        this.executives = [];
        this.patrons = [];
        this.init();
    }

    init() {
        this.loadLeadershipData();
        this.loadLeadershipStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Use event delegation for dynamically created buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            console.log('Button clicked with action:', action);

            switch (action) {
                case 'show-executive-details':
                    const executiveId = button.getAttribute('data-executive-id');
                    console.log('Showing executive details for:', executiveId);
                    this.showExecutiveDetails(executiveId);
                    break;
                
                case 'show-patron-details':
                    const patronId = button.getAttribute('data-patron-id');
                    console.log('Showing patron details for:', patronId);
                    this.showPatronDetails(patronId);
                    break;
                
                case 'send-message':
                    const messageExecutiveId = button.getAttribute('data-executive-id');
                    console.log('Sending message to executive:', messageExecutiveId);
                    
                    // Find the executive to get their user ID
                    const executive = this.executives.find(e => e.id === messageExecutiveId);
                    if (executive && executive.user) {
                        const userId = executive.user.id;
                        console.log('Redirecting to messages with user ID:', userId);
                        // Use hash to force scroll to messages interface
                        window.location.href = `/messages?recipient=${userId}#messagesInterface`;
                    } else {
                        console.error('Executive or user not found');
                        alert('Unable to start conversation. Please try again.');
                    }
                    break;
                
                default:
                    console.log('Unknown action:', action);
            }
        });
    }

    async loadLeadershipData() {
        try {
            console.log('Loading leadership data...');
            // Load executive committee and patrons in parallel
            const [executiveResponse, patronsResponse] = await Promise.all([
                fetch('/api/leadership/executive-committee'),
                fetch('/api/leadership/patrons')
            ]);

            console.log('Executive response:', executiveResponse.status);
            console.log('Patrons response:', patronsResponse.status);

            if (executiveResponse.ok) {
                const executiveData = await executiveResponse.json();
                console.log('Executive data:', executiveData);
                this.executives = executiveData.executives;
                this.renderExecutiveCommittee();
            }

            if (patronsResponse.ok) {
                const patronsData = await patronsResponse.json();
                console.log('Patrons data:', patronsData);
                this.patrons = patronsData.patrons;
                this.renderClubPatrons();
            }

        } catch (error) {
            console.error('Error loading leadership data:', error);
            this.showError('Failed to load leadership information');
        }
    }

    async loadLeadershipStats() {
        try {
            const response = await fetch('/api/leadership/stats');
            if (response.ok) {
                const stats = await response.json();
                this.updateStatsDisplay(stats);
            }
        } catch (error) {
            console.error('Error loading leadership stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        const executiveCountEl = document.getElementById('executiveCount');
        const patronCountEl = document.getElementById('patronCount');

        if (executiveCountEl) {
            executiveCountEl.textContent = stats.executiveMembers || 0;
        }
        
        if (patronCountEl) {
            patronCountEl.textContent = stats.clubPatrons || 0;
        }
    }

    renderExecutiveCommittee() {
        const container = document.getElementById('executiveGrid');
        if (!container) return;

        if (!this.executives.length) {
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-users" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: white; margin-bottom: 0.5rem;">No Executive Members</h3>
                    <p style="color: rgba(255, 255, 255, 0.7);">Executive committee information will be available soon.</p>
                </div>
            `;
            return;
        }

        const executivesHTML = this.executives.map(executive => this.createExecutiveCard(executive)).join('');
        container.innerHTML = executivesHTML;
    }

    createExecutiveCard(executive) {
        const user = executive.user;
        const initials = this.getInitials(user.name);
        const profilePhoto = executive.profilePhoto || null;
        const contactInfo = executive.contactInfo || {};
        const socialMedia = executive.socialMedia || {};
        const cardId = `exec-card-${executive.id}`;

        return `
            <div class="glass-card executive-card" id="${cardId}" style="padding: 1.5rem; transition: all 0.3s ease; cursor: pointer;" 
                 onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 15px 35px rgba(0,0,0,0.2)'" 
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''">
                
                <!-- Compact Profile Section -->
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="position: relative;">
                        ${profilePhoto ? 
                            `<img src="${profilePhoto}" alt="${user.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #10b981;">` :
                            `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);">
                                <span style="font-size: 1.25rem; font-weight: 800; color: white;">${initials}</span>
                            </div>`
                        }
                        <div style="position: absolute; bottom: -3px; right: -3px; width: 20px; height: 20px; background: #10b981; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-crown" style="font-size: 0.625rem; color: white;"></i>
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="color: white; font-weight: 700; font-size: 1.125rem; margin-bottom: 0.25rem; line-height: 1.2;">${user.name}</h3>
                        <p style="color: #10b981; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.875rem;">${executive.position}</p>
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">${user.course} • Year ${user.year_of_study}</p>
                    </div>
                </div>

                <!-- Compact Bio -->
                <div style="margin-bottom: 1rem;">
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.5; font-size: 0.8125rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${executive.bio ? executive.bio.substring(0, 120) + (executive.bio.length > 120 ? '...' : '') : 'Dedicated leader committed to driving innovation and entrepreneurship at JKUAT.'}
                    </p>
                </div>

                <!-- Quick Stats -->
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
                    ${executive.achievements && executive.achievements.length > 0 ? `
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.5rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-trophy" style="font-size: 0.75rem; color: #f59e0b;"></i>
                            <span style="color: #f59e0b; font-size: 0.75rem; font-weight: 600;">${executive.achievements.length} Achievements</span>
                        </div>
                    ` : ''}
                    
                    ${contactInfo.email ? `
                        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.5rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-envelope" style="font-size: 0.75rem; color: #10b981;"></i>
                            <span style="color: #10b981; font-size: 0.75rem; font-weight: 600;">Available</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Actions Row -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 0.5rem;">
                        ${socialMedia.linkedin ? `
                            <a href="${socialMedia.linkedin}" target="_blank" style="color: #0077b5; font-size: 1.125rem; transition: all 0.3s; padding: 0.25rem;" 
                               onmouseover="this.style.color='#10b981'; this.style.transform='scale(1.1)'" 
                               onmouseout="this.style.color='#0077b5'; this.style.transform='scale(1)'">
                                <i class="fab fa-linkedin"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.twitter ? `
                            <a href="${socialMedia.twitter}" target="_blank" style="color: #1da1f2; font-size: 1.125rem; transition: all 0.3s; padding: 0.25rem;"
                               onmouseover="this.style.color='#10b981'; this.style.transform='scale(1.1)'" 
                               onmouseout="this.style.color='#1da1f2'; this.style.transform='scale(1)'">
                                <i class="fab fa-twitter"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.instagram ? `
                            <a href="${socialMedia.instagram}" target="_blank" style="color: #e4405f; font-size: 1.125rem; transition: all 0.3s; padding: 0.25rem;"
                               onmouseover="this.style.color='#10b981'; this.style.transform='scale(1.1)'" 
                               onmouseout="this.style.color='#e4405f'; this.style.transform='scale(1)'">
                                <i class="fab fa-instagram"></i>
                            </a>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button data-action="show-executive-details" data-executive-id="${executive.id}" class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.375rem 0.75rem;">
                            <i class="fas fa-info-circle"></i>Details
                        </button>
                        ${contactInfo.email ? `
                            <button data-action="send-message" data-executive-id="${executive.id}" class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.375rem 0.75rem;">
                                <i class="fas fa-envelope"></i>Contact
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderClubPatrons() {
        const container = document.getElementById('patronsGrid');
        if (!container) return;

        if (!this.patrons.length) {
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-user-tie" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: white; margin-bottom: 0.5rem;">No Club Patrons</h3>
                    <p style="color: rgba(255, 255, 255, 0.7);">Club patron information will be available soon.</p>
                </div>
            `;
            return;
        }

        const patronsHTML = this.patrons.map(patron => this.createPatronCard(patron)).join('');
        container.innerHTML = patronsHTML;
    }

    createPatronCard(patron) {
        const initials = this.getInitials(patron.name);
        const profilePhoto = patron.profile_photo || null;
        const socialMedia = patron.social_media || {};
        const cardId = `patron-card-${patron.id}`;

        return `
            <div class="glass-card patron-card" id="${cardId}" style="padding: 1.5rem; transition: all 0.3s ease; cursor: pointer;"
                 onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 15px 35px rgba(0,0,0,0.2)'" 
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''">
                
                <!-- Compact Profile Section -->
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="position: relative;">
                        ${profilePhoto ? 
                            `<img src="${profilePhoto}" alt="${patron.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #3b82f6;">` :
                            `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);">
                                <span style="font-size: 1.25rem; font-weight: 800; color: white;">${initials}</span>
                            </div>`
                        }
                        <div style="position: absolute; bottom: -3px; right: -3px; width: 20px; height: 20px; background: #3b82f6; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-graduation-cap" style="font-size: 0.625rem; color: white;"></i>
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="color: white; font-weight: 700; font-size: 1.125rem; margin-bottom: 0.25rem; line-height: 1.2;">${patron.name}</h3>
                        <p style="color: #3b82f6; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.875rem;">${patron.title}</p>
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">${patron.department}</p>
                    </div>
                </div>

                <!-- Compact Bio -->
                <div style="margin-bottom: 1rem;">
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.5; font-size: 0.8125rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${patron.bio ? patron.bio.substring(0, 120) + (patron.bio.length > 120 ? '...' : '') : 'Distinguished faculty member and mentor supporting student innovation and entrepreneurship initiatives.'}
                    </p>
                </div>

                <!-- Specialization Tags (Limited) -->
                ${patron.specialization && patron.specialization.length > 0 ? `
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; flex-wrap: gap: 0.375rem;">
                            ${patron.specialization.slice(0, 3).map(spec => `
                                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.6875rem; font-weight: 600;">
                                    ${spec}
                                </span>
                            `).join('')}
                            ${patron.specialization.length > 3 ? `
                                <span style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.6875rem; font-weight: 600;">
                                    +${patron.specialization.length - 3} more
                                </span>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Quick Contact Info -->
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
                    ${patron.email ? `
                        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 0.5rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-envelope" style="font-size: 0.75rem; color: #3b82f6;"></i>
                            <span style="color: #3b82f6; font-size: 0.75rem; font-weight: 600;">Available</span>
                        </div>
                    ` : ''}
                    
                    ${patron.office_location ? `
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.5rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-map-marker-alt" style="font-size: 0.75rem; color: #f59e0b;"></i>
                            <span style="color: #f59e0b; font-size: 0.75rem; font-weight: 600;">On Campus</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Actions Row -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 0.5rem;">
                        ${socialMedia.linkedin ? `
                            <a href="${socialMedia.linkedin}" target="_blank" style="color: #0077b5; font-size: 1.125rem; transition: all 0.3s; padding: 0.25rem;" 
                               onmouseover="this.style.color='#3b82f6'; this.style.transform='scale(1.1)'" 
                               onmouseout="this.style.color='#0077b5'; this.style.transform='scale(1)'">
                                <i class="fab fa-linkedin"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.researchgate ? `
                            <a href="${socialMedia.researchgate}" target="_blank" style="color: #00d4aa; font-size: 1.125rem; transition: all 0.3s; padding: 0.25rem;"
                               onmouseover="this.style.color='#3b82f6'; this.style.transform='scale(1.1)'" 
                               onmouseout="this.style.color='#00d4aa'; this.style.transform='scale(1)'">
                                <i class="fab fa-researchgate"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.twitter ? `
                            <a href="${socialMedia.twitter}" target="_blank" style="color: #1da1f2; font-size: 1.125rem; transition: all 0.3s; padding: 0.25rem;"
                               onmouseover="this.style.color='#3b82f6'; this.style.transform='scale(1.1)'" 
                               onmouseout="this.style.color='#1da1f2'; this.style.transform='scale(1)'">
                                <i class="fab fa-twitter"></i>
                            </a>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button data-action="show-patron-details" data-patron-id="${patron.id}" class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.375rem 0.75rem;">
                            <i class="fas fa-info-circle"></i>Details
                        </button>
                        ${patron.email ? `
                            <a href="mailto:${patron.email}" class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.375rem 0.75rem; text-decoration: none;">
                                <i class="fas fa-envelope"></i>Contact
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    formatOfficeHours(officeHours) {
        if (!officeHours || typeof officeHours !== 'object') return null;

        const days = Object.keys(officeHours);
        if (days.length === 0) return null;

        return days.map(day => {
            const time = officeHours[day];
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            return `<div><strong>${dayName}:</strong> ${time}</div>`;
        }).join('');
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    showError(message) {
        console.error(message);
        // You could implement a toast notification here
    }

    // Modal functionality for detailed views
    showExecutiveDetails(executiveId) {
        console.log('Showing executive details for:', executiveId);
        const executive = this.executives.find(e => e.id === executiveId);
        if (!executive) {
            console.error('Executive not found:', executiveId);
            return;
        }

        console.log('Found executive:', executive);
        this.showModal(this.createExecutiveDetailModal(executive));
    }

    showPatronDetails(patronId) {
        console.log('Showing patron details for:', patronId);
        const patron = this.patrons.find(p => p.id === patronId);
        if (!patron) {
            console.error('Patron not found:', patronId);
            return;
        }

        console.log('Found patron:', patron);
        this.showModal(this.createPatronDetailModal(patron));
    }

    createExecutiveDetailModal(executive) {
        const user = executive.user;
        const initials = this.getInitials(user.name);
        const profilePhoto = executive.profilePhoto || null;
        const officeHours = this.formatOfficeHours(executive.officeHours);
        const contactInfo = executive.contactInfo || {};
        const socialMedia = executive.socialMedia || {};

        return `
            <div style="max-width: 600px; width: 90vw;">
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="position: relative;">
                        ${profilePhoto ? 
                            `<img src="${profilePhoto}" alt="${user.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #10b981;">` :
                            `<div style="width: 100px; height: 100px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
                                <span style="font-size: 2rem; font-weight: 800; color: white;">${initials}</span>
                            </div>`
                        }
                        <div style="position: absolute; bottom: -5px; right: -5px; width: 30px; height: 30px; background: #10b981; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-crown" style="font-size: 0.875rem; color: white;"></i>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin-bottom: 0.5rem;">${user.name}</h2>
                        <p style="color: #10b981; font-weight: 600; margin-bottom: 0.25rem; font-size: 1.125rem;">${executive.position}</p>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${user.course} • Year ${user.year_of_study} • ${user.college}</p>
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem;">About</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 0.875rem;">
                        ${executive.bio || 'Dedicated leader committed to driving innovation and entrepreneurship at JKUAT.'}
                    </p>
                </div>

                ${executive.achievements && executive.achievements.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-trophy" style="color: #f59e0b;"></i>Key Achievements
                        </h3>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${executive.achievements.map(achievement => `
                                <li style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative;">
                                    <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">•</span>
                                    ${achievement}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${executive.responsibilities && executive.responsibilities.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-tasks" style="color: #3b82f6;"></i>Key Responsibilities
                        </h3>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${executive.responsibilities.map(responsibility => `
                                <li style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative;">
                                    <span style="position: absolute; left: 0; color: #3b82f6; font-weight: bold;">•</span>
                                    ${responsibility}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    ${contactInfo.email ? `
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px;">
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-envelope" style="color: #10b981;"></i>Email
                            </div>
                            <div style="color: white; font-size: 0.875rem; font-weight: 600;">${contactInfo.email}</div>
                        </div>
                    ` : ''}
                    
                    ${contactInfo.phone ? `
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px;">
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-phone" style="color: #10b981;"></i>Phone
                            </div>
                            <div style="color: white; font-size: 0.875rem; font-weight: 600;">${contactInfo.phone}</div>
                        </div>
                    ` : ''}
                </div>

                ${contactInfo.office ? `
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-map-marker-alt" style="color: #10b981;"></i>Office Location
                        </div>
                        <div style="color: white; font-size: 0.875rem; font-weight: 600;">${contactInfo.office}</div>
                    </div>
                ` : ''}

                ${officeHours ? `
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                        <h3 style="color: #10b981; font-weight: 600; margin-bottom: 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-clock"></i>Office Hours
                        </h3>
                        <div style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; line-height: 1.5;">
                            ${officeHours}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; gap: 1rem;">
                        ${socialMedia.linkedin ? `
                            <a href="${socialMedia.linkedin}" target="_blank" style="color: #0077b5; font-size: 1.5rem; transition: color 0.3s;" 
                               onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='#0077b5'">
                                <i class="fab fa-linkedin"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.twitter ? `
                            <a href="${socialMedia.twitter}" target="_blank" style="color: #1da1f2; font-size: 1.5rem; transition: color 0.3s;"
                               onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='#1da1f2'">
                                <i class="fab fa-twitter"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.instagram ? `
                            <a href="${socialMedia.instagram}" target="_blank" style="color: #e4405f; font-size: 1.5rem; transition: color 0.3s;"
                               onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='#e4405f'">
                                <i class="fab fa-instagram"></i>
                            </a>
                        ` : ''}
                    </div>
                    
                    ${contactInfo.email ? `
                        <button onclick="sendMessage('${executive.id}'); if(window.leadershipManager) window.leadershipManager.closeModal();" class="btn btn-primary">
                            <i class="fas fa-envelope"></i>Send Message
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createPatronDetailModal(patron) {
        const initials = this.getInitials(patron.name);
        const profilePhoto = patron.profile_photo || null;
        const officeHours = this.formatOfficeHours(patron.office_hours);
        const socialMedia = patron.social_media || {};

        return `
            <div style="max-width: 600px; width: 90vw;">
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="position: relative;">
                        ${profilePhoto ? 
                            `<img src="${profilePhoto}" alt="${patron.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #3b82f6;">` :
                            `<div style="width: 100px; height: 100px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                                <span style="font-size: 2rem; font-weight: 800; color: white;">${initials}</span>
                            </div>`
                        }
                        <div style="position: absolute; bottom: -5px; right: -5px; width: 30px; height: 30px; background: #3b82f6; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-graduation-cap" style="font-size: 0.875rem; color: white;"></i>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <h2 style="color: white; font-weight: 700; font-size: 1.5rem; margin-bottom: 0.5rem;">${patron.name}</h2>
                        <p style="color: #3b82f6; font-weight: 600; margin-bottom: 0.25rem; font-size: 1.125rem;">${patron.title}</p>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${patron.department}</p>
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem;">About</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 0.875rem;">
                        ${patron.bio || 'Distinguished faculty member and mentor supporting student innovation and entrepreneurship initiatives.'}
                    </p>
                </div>

                ${patron.specialization && patron.specialization.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-weight: 600; margin-bottom: 1rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-star" style="color: #f59e0b;"></i>Areas of Expertise
                        </h3>
                        <div style="display: flex; flex-wrap: gap: 0.5rem;">
                            ${patron.specialization.map(spec => `
                                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.375rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                                    ${spec}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    ${patron.email ? `
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px;">
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-envelope" style="color: #3b82f6;"></i>Email
                            </div>
                            <div style="color: white; font-size: 0.875rem; font-weight: 600;">${patron.email}</div>
                        </div>
                    ` : ''}
                    
                    ${patron.phone ? `
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px;">
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-phone" style="color: #3b82f6;"></i>Phone
                            </div>
                            <div style="color: white; font-size: 0.875rem; font-weight: 600;">${patron.phone}</div>
                        </div>
                    ` : ''}
                </div>

                ${patron.office_location ? `
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-map-marker-alt" style="color: #3b82f6;"></i>Office Location
                        </div>
                        <div style="color: white; font-size: 0.875rem; font-weight: 600;">${patron.office_location}</div>
                    </div>
                ` : ''}

                ${officeHours ? `
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                        <h3 style="color: #3b82f6; font-weight: 600; margin-bottom: 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-clock"></i>Office Hours
                        </h3>
                        <div style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; line-height: 1.5;">
                            ${officeHours}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; gap: 1rem;">
                        ${socialMedia.linkedin ? `
                            <a href="${socialMedia.linkedin}" target="_blank" style="color: #0077b5; font-size: 1.5rem; transition: color 0.3s;" 
                               onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#0077b5'">
                                <i class="fab fa-linkedin"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.researchgate ? `
                            <a href="${socialMedia.researchgate}" target="_blank" style="color: #00d4aa; font-size: 1.5rem; transition: color 0.3s;"
                               onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#00d4aa'">
                                <i class="fab fa-researchgate"></i>
                            </a>
                        ` : ''}
                        ${socialMedia.twitter ? `
                            <a href="${socialMedia.twitter}" target="_blank" style="color: #1da1f2; font-size: 1.5rem; transition: color 0.3s;"
                               onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#1da1f2'">
                                <i class="fab fa-twitter"></i>
                            </a>
                        ` : ''}
                    </div>
                    
                    ${patron.email ? `
                        <a href="mailto:${patron.email}" class="btn btn-primary" style="text-decoration: none;">
                            <i class="fas fa-envelope"></i>Send Email
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showModal(content) {
        // Remove existing modal if any
        this.closeModal();

        const modal = document.createElement('div');
        modal.id = 'leadershipModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 2rem;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1.1)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            closeBtn.style.transform = 'scale(1)';
        };
        closeBtn.onclick = () => this.closeModal();

        modalContent.innerHTML = content;
        modalContent.appendChild(closeBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);

        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        };

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    closeModal() {
        const modal = document.getElementById('leadershipModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.querySelector('div').style.transform = 'scale(0.9)';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
}

// Define global functions immediately (not waiting for DOMContentLoaded)
console.log('Defining global functions...');

// Global functions
window.sendMessage = function(executiveId) {
    console.log('sendMessage called with executive ID:', executiveId);
    
    // Find the executive to get their user ID
    if (window.leadershipManager) {
        const executive = window.leadershipManager.executives.find(e => e.id === executiveId);
        if (executive && executive.user) {
            const userId = executive.user.id;
            console.log('Redirecting to messages with user ID:', userId);
            // Use hash to force scroll to messages interface
            window.location.href = `/messages?recipient=${userId}#messagesInterface`;
        } else {
            console.error('Executive or user not found');
            alert('Unable to start conversation. Please try again.');
        }
    } else {
        console.error('Leadership manager not available');
        // Fallback: redirect with executive ID and hash
        window.location.href = `/messages?recipient=${executiveId}#messagesInterface`;
    }
};

// Make modal functions globally accessible
window.showExecutiveDetails = function(executiveId) {
    console.log('showExecutiveDetails called with:', executiveId);
    console.log('leadershipManager exists:', !!window.leadershipManager);
    if (window.leadershipManager) {
        window.leadershipManager.showExecutiveDetails(executiveId);
    } else {
        console.error('Leadership manager not initialized yet');
        // Try again after a short delay
        setTimeout(() => {
            if (window.leadershipManager) {
                window.leadershipManager.showExecutiveDetails(executiveId);
            } else {
                alert('Leadership manager not ready. Please try again.');
            }
        }, 100);
    }
};

window.showPatronDetails = function(patronId) {
    console.log('showPatronDetails called with:', patronId);
    console.log('leadershipManager exists:', !!window.leadershipManager);
    if (window.leadershipManager) {
        window.leadershipManager.showPatronDetails(patronId);
    } else {
        console.error('Leadership manager not initialized yet');
        // Try again after a short delay
        setTimeout(() => {
            if (window.leadershipManager) {
                window.leadershipManager.showPatronDetails(patronId);
            } else {
                alert('Leadership manager not ready. Please try again.');
            }
        }, 100);
    }
};

window.closeLeadershipModal = function() {
    console.log('closeLeadershipModal called');
    if (window.leadershipManager) {
        window.leadershipManager.closeModal();
    }
};

// Initialize leadership manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Leadership Manager...');
    window.leadershipManager = new LeadershipManager();
    console.log('Leadership Manager initialized:', window.leadershipManager);
    
    // Test global functions
    console.log('Testing global functions...');
    console.log('showExecutiveDetails function:', typeof window.showExecutiveDetails);
    console.log('showPatronDetails function:', typeof window.showPatronDetails);
    console.log('sendMessage function:', typeof window.sendMessage);
});

// Make class available globally
window.LeadershipManager = LeadershipManager;