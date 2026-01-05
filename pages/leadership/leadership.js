// JKUAT Innovation Club - Leadership Page

class LeadershipPage {
    constructor() {
        this.executives = [];
        this.patrons = [];
        this.stats = {};
        console.log('LeadershipPage constructor called');
        
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            this.init();
        }, 100);
    }

    init() {
        console.log('LeadershipPage init() called');
        console.log('Available globals:', {
            jkuatApp: !!window.jkuatApp,
            mockData: !!window.MOCK_LEADERSHIP_DATA
        });
        
        // If jkuatApp is not available, use mock data immediately
        if (!window.jkuatApp && window.MOCK_LEADERSHIP_DATA) {
            console.log('jkuatApp not available, using mock data immediately');
            this.useMockData();
        } else {
            this.loadLeadershipStats();
            this.loadExecutiveCommittee();
            this.loadClubPatrons();
        }
        
        this.bindEvents();
    }

    useMockData() {
        console.log('Using mock data for all leadership content');
        if (window.MOCK_LEADERSHIP_DATA) {
            this.stats = window.MOCK_LEADERSHIP_DATA.stats;
            this.executives = window.MOCK_LEADERSHIP_DATA.executives;
            this.patrons = window.MOCK_LEADERSHIP_DATA.patrons;
            
            this.updateStatsDisplay();
            this.renderExecutiveCommittee();
            this.renderClubPatrons();
        }
    }

    bindEvents() {
        // Modal close events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeMemberModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMemberModal();
            }
        });
    }

    async loadLeadershipStats() {
        try {
            console.log('Loading leadership stats...');
            console.log('jkuatApp available:', !!window.jkuatApp);
            
            if (!window.jkuatApp) {
                throw new Error('jkuatApp not available');
            }
            
            const response = await window.jkuatApp.apiCall('/api/leadership/stats');
            console.log('Stats response:', response);
            if (response) {
                this.stats = response;
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Error loading leadership stats:', error);
            // Use mock data as fallback
            if (window.MOCK_LEADERSHIP_DATA) {
                console.log('Using mock stats data');
                this.stats = window.MOCK_LEADERSHIP_DATA.stats;
                this.updateStatsDisplay();
            } else {
                console.error('Mock data not available');
            }
        }
    }

    updateStatsDisplay() {
        console.log('updateStatsDisplay called with stats:', this.stats);
        
        const executiveCountEl = document.getElementById('executiveCount');
        const patronCountEl = document.getElementById('patronCount');
        const totalLeadershipEl = document.getElementById('totalLeadership');
        
        if (executiveCountEl) {
            executiveCountEl.textContent = this.stats.executiveMembers || 0;
        } else {
            console.error('executiveCount element not found');
        }
        
        if (patronCountEl) {
            patronCountEl.textContent = this.stats.clubPatrons || 0;
        } else {
            console.error('patronCount element not found');
        }
        
        if (totalLeadershipEl) {
            totalLeadershipEl.textContent = this.stats.totalLeadership || 0;
        } else {
            console.error('totalLeadership element not found');
        }
    }

    async loadExecutiveCommittee() {
        try {
            console.log('Loading executive committee...');
            console.log('jkuatApp available:', !!window.jkuatApp);
            
            if (!window.jkuatApp) {
                throw new Error('jkuatApp not available');
            }
            
            const response = await window.jkuatApp.apiCall('/api/leadership/executive-committee');
            console.log('Executive committee response:', response);
            if (response && response.executives) {
                this.executives = response.executives;
                console.log('Loaded executives:', this.executives);
                this.renderExecutiveCommittee();
            } else {
                console.log('No executives in response, using fallback');
                throw new Error('No executives data');
            }
        } catch (error) {
            console.error('Error loading executive committee:', error);
            // Use mock data as fallback
            if (window.MOCK_LEADERSHIP_DATA) {
                console.log('Using mock executive committee data');
                this.executives = window.MOCK_LEADERSHIP_DATA.executives;
                this.renderExecutiveCommittee();
            } else {
                console.error('Mock data not available');
                this.showError('executiveGrid', 'Failed to load executive committee');
            }
        }
    }

    async loadClubPatrons() {
        try {
            console.log('Loading club patrons...');
            console.log('jkuatApp available:', !!window.jkuatApp);
            
            if (!window.jkuatApp) {
                throw new Error('jkuatApp not available');
            }
            
            const response = await window.jkuatApp.apiCall('/api/leadership/patrons');
            console.log('Patrons response:', response);
            if (response && response.patrons) {
                this.patrons = response.patrons;
                this.renderClubPatrons();
            } else {
                console.log('No patrons in response, using fallback');
                throw new Error('No patrons data');
            }
        } catch (error) {
            console.error('Error loading club patrons:', error);
            // Use mock data as fallback
            if (window.MOCK_LEADERSHIP_DATA) {
                console.log('Using mock patrons data');
                this.patrons = window.MOCK_LEADERSHIP_DATA.patrons;
                this.renderClubPatrons();
            } else {
                console.error('Mock data not available');
                this.showError('patronsGrid', 'Failed to load club patrons');
            }
        }
    }

    renderExecutiveCommittee() {
        console.log('renderExecutiveCommittee called with:', this.executives.length, 'executives');
        const grid = document.getElementById('executiveGrid');
        
        if (!grid) {
            console.error('executiveGrid element not found!');
            return;
        }
        
        console.log('Executive grid element found, rendering...');
        
        if (this.executives.length === 0) {
            console.log('No executives to display');
            grid.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-users"></i>
                    <p>No executive committee members found.</p>
                </div>
            `;
            return;
        }

        try {
            // Define position hierarchy for proper ordering
            const positionOrder = {
                'Chairperson': 1,
                'Vice-Chairperson (Membership)': 2,
                'Vice-Chairperson (Projects)': 3,
                'Vice-Chairperson (Education)': 4,
                'Secretary-General': 5,
                'Treasurer': 6,
                'Communications & PR Officer': 7
            };

            // Sort executives by position hierarchy
            const sortedExecutives = [...this.executives].sort((a, b) => {
                const orderA = positionOrder[a.position] || 999;
                const orderB = positionOrder[b.position] || 999;
                return orderA - orderB;
            });

            console.log('Sorted executives:', sortedExecutives.length);

            const html = sortedExecutives.map(executive => {
                try {
                    return `
                        <div class="leader-card ${this.getPositionClass(executive.position)}" onclick="leadershipPageInstance.showMemberDetails('${executive.id}', 'executive')">
                            <div class="position-badge">${executive.position}</div>
                            <div class="leader-avatar">
                                ${executive.profilePhoto ? 
                                    `<img src="${executive.profilePhoto}" alt="${executive.user.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                     <div class="avatar-fallback" style="display: none;">${this.getInitials(executive.user.name)}</div>` :
                                    this.getInitials(executive.user.name)
                                }
                            </div>
                            <h3 class="leader-name">${executive.user.name}</h3>
                            <div class="leader-course">${executive.user.course || 'JKUAT Student'} • Year ${executive.user.year_of_study || 'N/A'}</div>
                            <p class="leader-bio">${this.truncateText(executive.bio || 'Dedicated to driving innovation and excellence in our club.', 120)}</p>
                            
                            ${executive.officeHours && Object.keys(executive.officeHours).length > 0 ? `
                                <div class="office-hours">
                                    <i class="fas fa-clock"></i>
                                    <span>Office Hours Available</span>
                                </div>
                            ` : ''}
                            
                            <div class="leader-contact">
                                ${executive.contactInfo?.email || executive.user.email ? `
                                    <a href="mailto:${executive.contactInfo?.email || executive.user.email}" class="contact-link" title="Email">
                                        <i class="fas fa-envelope"></i>
                                    </a>
                                ` : ''}
                                ${executive.contactInfo?.phone || executive.user.phone ? `
                                    <a href="tel:${executive.contactInfo?.phone || executive.user.phone}" class="contact-link" title="Phone">
                                        <i class="fas fa-phone"></i>
                                    </a>
                                ` : ''}
                                ${executive.socialMedia?.linkedin ? `
                                    <a href="${executive.socialMedia.linkedin}" class="contact-link" title="LinkedIn" target="_blank">
                                        <i class="fab fa-linkedin"></i>
                                    </a>
                                ` : ''}
                                ${executive.socialMedia?.twitter ? `
                                    <a href="${executive.socialMedia.twitter}" class="contact-link" title="Twitter" target="_blank">
                                        <i class="fab fa-twitter"></i>
                                    </a>
                                ` : ''}
                                ${executive.socialMedia?.instagram ? `
                                    <a href="${executive.socialMedia.instagram}" class="contact-link" title="Instagram" target="_blank">
                                        <i class="fab fa-instagram"></i>
                                    </a>
                                ` : ''}
                            </div>
                            
                            <div class="view-profile-btn">
                                <i class="fas fa-user"></i> View Full Profile
                            </div>
                        </div>
                    `;
                } catch (cardError) {
                    console.error('Error rendering executive card:', cardError, executive);
                    return `<div class="leader-card">Error rendering ${executive.user?.name || 'Unknown'}</div>`;
                }
            }).join('');

            grid.innerHTML = html;
            console.log('Executive committee rendered successfully');
            
        } catch (error) {
            console.error('Error in renderExecutiveCommittee:', error);
            grid.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                    <p>Error rendering executive committee</p>
                </div>
            `;
        }
    }

    renderClubPatrons() {
        console.log('renderClubPatrons called with:', this.patrons.length, 'patrons');
        const grid = document.getElementById('patronsGrid');
        
        if (!grid) {
            console.error('patronsGrid element not found!');
            return;
        }
        
        console.log('Patrons grid element found, rendering...');
        
        if (this.patrons.length === 0) {
            console.log('No patrons to display');
            grid.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-university"></i>
                    <p>No club patrons found.</p>
                </div>
            `;
            return;
        }

        try {
            const html = this.patrons.map(patron => {
                try {
                    return `
                        <div class="patron-card" onclick="leadershipPageInstance.showMemberDetails('${patron.id}', 'patron')">
                            <div class="patron-header">
                                <div class="patron-avatar">
                                    ${this.getInitials(patron.name)}
                                </div>
                                <div class="patron-info">
                                    <h3>${patron.name}</h3>
                                    <div class="patron-title">${patron.title}</div>
                                    ${patron.department ? `<div class="patron-department">${patron.department}</div>` : ''}
                                </div>
                            </div>
                            
                            ${patron.bio ? `<p class="patron-bio">${this.truncateText(patron.bio, 150)}</p>` : ''}
                            
                            ${patron.specialization && patron.specialization.length > 0 ? `
                                <div class="patron-specialization">
                                    ${patron.specialization.slice(0, 3).map(spec => `
                                        <span class="specialization-tag">${spec}</span>
                                    `).join('')}
                                    ${patron.specialization.length > 3 ? `<span class="specialization-tag">+${patron.specialization.length - 3} more</span>` : ''}
                                </div>
                            ` : ''}
                            
                            <div class="patron-contact">
                                <div class="patron-office">
                                    ${patron.office_location ? `<i class="fas fa-map-marker-alt"></i> ${patron.office_location}` : ''}
                                </div>
                                <div class="patron-links">
                                    ${patron.email ? `
                                        <a href="mailto:${patron.email}" class="contact-link" title="Email">
                                            <i class="fas fa-envelope"></i>
                                        </a>
                                    ` : ''}
                                    ${patron.phone ? `
                                        <a href="tel:${patron.phone}" class="contact-link" title="Phone">
                                            <i class="fas fa-phone"></i>
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                } catch (cardError) {
                    console.error('Error rendering patron card:', cardError, patron);
                    return `<div class="patron-card">Error rendering ${patron.name || 'Unknown'}</div>`;
                }
            }).join('');

            grid.innerHTML = html;
            console.log('Club patrons rendered successfully');
            
        } catch (error) {
            console.error('Error in renderClubPatrons:', error);
            grid.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                    <p>Error rendering club patrons</p>
                </div>
            `;
        }
    }

    async showMemberDetails(memberId, type) {
        try {
            let member;
            if (type === 'executive') {
                try {
                    const response = await window.jkuatApp.apiCall(`/api/leadership/executive-committee/${memberId}`);
                    member = response;
                } catch (error) {
                    // Fallback to local data
                    member = this.executives.find(e => e.id === memberId);
                }
            } else {
                member = this.patrons.find(p => p.id === memberId);
            }

            if (!member) {
                window.jkuatApp.showToast('Member details not found', 'error');
                return;
            }

            this.renderMemberModal(member, type);
            document.getElementById('memberModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading member details:', error);
            window.jkuatApp.showToast('Failed to load member details', 'error');
        }
    }

    renderMemberModal(member, type) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (type === 'executive') {
            modalTitle.textContent = `${member.user.name} - ${member.position}`;
            modalBody.innerHTML = `
                <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                    <div class="leader-avatar" style="width: 120px; height: 120px; font-size: 2.5rem;">
                        ${member.profilePhoto ? 
                            `<img src="${member.profilePhoto}" alt="${member.user.name}">` :
                            this.getInitials(member.user.name)
                        }
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem;">${member.user.name}</h3>
                        <p style="color: #10b981; font-weight: 600; margin-bottom: 0.5rem;">${member.position}</p>
                        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">${member.user.course || 'JKUAT Student'}</p>
                        <p style="color: rgba(255, 255, 255, 0.7);">Year ${member.user.year_of_study || 'N/A'} • ${member.user.college || 'JKUAT'}</p>
                    </div>
                </div>

                ${member.bio ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #10b981;">About</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${member.bio}</p>
                    </div>
                ` : ''}

                ${member.responsibilities && member.responsibilities.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #10b981;">Responsibilities</h4>
                        <ul style="color: rgba(255, 255, 255, 0.8); padding-left: 1.5rem;">
                            ${member.responsibilities.map(resp => `<li style="margin-bottom: 0.5rem;">${resp}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${member.achievements && member.achievements.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #10b981;">Achievements</h4>
                        <ul style="color: rgba(255, 255, 255, 0.8); padding-left: 1.5rem;">
                            ${member.achievements.map(ach => `<li style="margin-bottom: 0.5rem;">${ach}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${member.officeHours && Object.keys(member.officeHours).length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #10b981;">Office Hours</h4>
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1rem;">
                            ${Object.entries(member.officeHours).map(([day, time]) => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.8);">
                                    <span style="font-weight: 600; text-transform: capitalize;">${day}:</span>
                                    <span>${time}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${member.user.email ? `
                        <a href="mailto:${member.user.email}" class="btn btn-primary">
                            <i class="fas fa-envelope"></i> Send Email
                        </a>
                    ` : ''}
                    ${member.user.phone ? `
                        <a href="tel:${member.user.phone}" class="btn btn-outline">
                            <i class="fas fa-phone"></i> Call
                        </a>
                    ` : ''}
                </div>
            `;
        } else {
            modalTitle.textContent = `${member.name} - ${member.title}`;
            modalBody.innerHTML = `
                <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                    <div class="patron-avatar" style="width: 120px; height: 120px; font-size: 2.5rem;">
                        ${this.getInitials(member.name)}
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem;">${member.name}</h3>
                        <p style="color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${member.title}</p>
                        ${member.department ? `<p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">${member.department}</p>` : ''}
                        ${member.office_location ? `<p style="color: rgba(255, 255, 255, 0.7);"><i class="fas fa-map-marker-alt"></i> ${member.office_location}</p>` : ''}
                    </div>
                </div>

                ${member.bio ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #3b82f6;">About</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${member.bio}</p>
                    </div>
                ` : ''}

                ${member.specialization && member.specialization.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #3b82f6;">Specialization</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${member.specialization.map(spec => `
                                <span class="specialization-tag">${spec}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${member.office_hours && Object.keys(member.office_hours).length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #3b82f6;">Office Hours</h4>
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1rem;">
                            ${Object.entries(member.office_hours).map(([day, time]) => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.8);">
                                    <span style="font-weight: 600; text-transform: capitalize;">${day}:</span>
                                    <span>${time}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${member.email ? `
                        <a href="mailto:${member.email}" class="btn btn-primary">
                            <i class="fas fa-envelope"></i> Send Email
                        </a>
                    ` : ''}
                    ${member.phone ? `
                        <a href="tel:${member.phone}" class="btn btn-outline">
                            <i class="fas fa-phone"></i> Call
                        </a>
                    ` : ''}
                </div>
            `;
        }
    }

    closeMemberModal() {
        document.getElementById('memberModal').style.display = 'none';
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <p>${message}</p>
            </div>
        `;
    }

    getPositionClass(position) {
        const positionClasses = {
            'Chairperson': 'chairperson-card',
            'Vice-Chairperson (Membership)': 'vice-chair-card',
            'Vice-Chairperson (Projects)': 'vice-chair-card',
            'Vice-Chairperson (Education)': 'vice-chair-card',
            'Secretary-General': 'secretary-card',
            'Treasurer': 'treasurer-card',
            'Communications & PR Officer': 'communications-card'
        };
        return positionClasses[position] || 'executive-card';
    }

    getInitials(name) {
        const initials = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        return `<div class="avatar-initials">${initials}</div>`;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
}

// Global function for modal close
function closeMemberModal() {
    if (window.leadershipPageInstance) {
        window.leadershipPageInstance.closeMemberModal();
    }
}

window.LeadershipPage = LeadershipPage;