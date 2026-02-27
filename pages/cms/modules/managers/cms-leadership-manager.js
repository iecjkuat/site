// Leadership Management Module for CMS

class LeadershipManager {
    constructor(cmsManager) {
        this.cmsManager = cmsManager;
        this.executives = [];
        this.patrons = [];
        this.currentSection = 'executives';
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        this.bindEvents();
        this.isInitialized = true;
    }

    bindEvents() {
        // Sub-tab switching
        document.querySelectorAll('[data-leadership-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.leadershipTab;
                this.switchSection(section);
            });
        });

        // Add buttons
        document.getElementById('add-executive-btn')?.addEventListener('click', () => {
            this.showExecutiveModal();
        });

        document.getElementById('add-patron-btn')?.addEventListener('click', () => {
            this.showPatronModal();
        });
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update tabs with proper styling
        document.querySelectorAll('[data-leadership-tab]').forEach(tab => {
            const isActive = tab.dataset.leadershipTab === section;
            if (isActive) {
                if (section === 'executives') {
                    tab.style.background = 'rgba(16, 185, 129, 0.2)';
                    tab.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    tab.style.color = '#10b981';
                } else {
                    tab.style.background = 'rgba(59, 130, 246, 0.2)';
                    tab.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    tab.style.color = '#3b82f6';
                }
            } else {
                tab.style.background = 'rgba(255, 255, 255, 0.1)';
                tab.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                tab.style.color = 'rgba(255, 255, 255, 0.7)';
            }
            tab.classList.toggle('active', isActive);
        });

        // Update sections
        document.getElementById('executives-section').style.display = 
            section === 'executives' ? 'block' : 'none';
        document.getElementById('patrons-section').style.display = 
            section === 'patrons' ? 'block' : 'none';
    }

    async loadLeadership() {
        console.log('📋 Loading leadership data...');
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const [execRes, patronRes] = await Promise.all([
                fetch('/api/v1/leadership/executive-committee', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/v1/leadership/patrons', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            console.log('API Response status:', {
                executives: execRes.status,
                patrons: patronRes.status
            });

            if (execRes.ok && patronRes.ok) {
                const execData = await execRes.json();
                const patronData = await patronRes.json();
                
                console.log('API Response data:', {
                    executives: execData.executives?.length || 0,
                    patrons: patronData.patrons?.length || 0
                });

                this.executives = execData.executives || [];
                this.patrons = patronData.patrons || [];
                
                console.log('✅ Leadership data loaded, rendering...');
                this.renderExecutives();
                this.renderPatrons();
            } else {
                console.error('API request failed:', {
                    execStatus: execRes.status,
                    patronStatus: patronRes.status
                });
                this.showToast('Failed to load leadership data', 'error');
            }
        } catch (error) {
            console.error('Error loading leadership:', error);
            this.showToast('Failed to load leadership data', 'error');
        }
    }

    renderExecutives() {
        const container = document.getElementById('executives-list');
        if (!container) {
            console.warn('executives-list container not found, skipping render');
            return;
        }

        console.log('Rendering executives:', this.executives.length);

        if (this.executives.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-users-cog" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No executive committee members yet</p>
                    <p style="font-size: 0.875rem;">Click "Add Executive" to add your first member</p>
                </div>
            `;
            return;
        }

        // Use leadership page card styling with 3 columns
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)';
        container.style.gap = '2rem';

        container.innerHTML = this.executives.map(exec => `
            <div class="leader-card" style="position: relative; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; padding: 2rem; text-align: center; color: white; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: default;">
                <!-- Edit/Delete buttons overlay -->
                <div style="position: absolute; top: 0.75rem; right: 0.75rem; display: flex; gap: 0.5rem; z-index: 10;">
                    <button onclick="leadershipManager.editExecutive('${exec.id}')" title="Edit" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <i class="fas fa-edit" style="font-size: 0.875rem;"></i>
                    </button>
                    <button onclick="leadershipManager.deleteExecutive('${exec.id}')" title="Delete" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <i class="fas fa-trash" style="font-size: 0.875rem;"></i>
                    </button>
                </div>

                <!-- Position Badge -->
                <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%) translateY(-50%); background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); white-space: nowrap;">
                    ${exec.position}
                </div>

                <!-- Avatar -->
                <div style="width: 100px; height: 100px; border-radius: 50%; margin: 1.5rem auto 1.5rem; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: 700; overflow: hidden; border: 3px solid rgba(255, 255, 255, 0.2);">
                    ${exec.profilePhoto ? 
                        `<img src="${exec.profilePhoto}" alt="${exec.user.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${this.getInitials(exec.user.name)}</div>`
                    }
                </div>

                <!-- Name -->
                <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">${exec.user.name}</h3>

                <!-- Course & Year -->
                <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 1rem;">
                    ${exec.user.course || 'JKUAT Student'} • Year ${exec.user.year_of_study || 'N/A'}
                </div>

                <!-- Bio -->
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.5; margin-bottom: 1.5rem; font-size: 0.875rem;">
                    ${exec.bio ? (exec.bio.length > 120 ? exec.bio.substring(0, 120) + '...' : exec.bio) : 'Dedicated to driving innovation and excellence in our club.'}
                </p>

                ${exec.officeHours ? `
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-clock" style="color: #10b981; font-size: 0.875rem;"></i>
                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.75rem;">Office Hours Available</span>
                    </div>
                ` : ''}

                <!-- Contact Links -->
                <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                    ${exec.contactInfo?.email || exec.user.email ? `
                        <a href="mailto:${exec.contactInfo?.email || exec.user.email}" title="Email" style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s ease;">
                            <i class="fas fa-envelope"></i>
                        </a>
                    ` : ''}
                    ${exec.contactInfo?.phone || exec.user.phone ? `
                        <a href="tel:${exec.contactInfo?.phone || exec.user.phone}" title="Phone" style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s ease;">
                            <i class="fas fa-phone"></i>
                        </a>
                    ` : ''}
                    ${exec.socialMedia?.linkedin ? `
                        <a href="${exec.socialMedia.linkedin}" title="LinkedIn" target="_blank" style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s ease;">
                            <i class="fab fa-linkedin"></i>
                        </a>
                    ` : ''}
                    ${exec.socialMedia?.twitter ? `
                        <a href="${exec.socialMedia.twitter}" title="Twitter" target="_blank" style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s ease;">
                            <i class="fab fa-twitter"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        console.log('Executives rendered successfully');
    }

    renderPatrons() {
        const container = document.getElementById('patrons-list');
        if (!container) {
            console.warn('patrons-list container not found, skipping render');
            return;
        }

        console.log('Rendering patrons:', this.patrons.length);

        if (this.patrons.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-chalkboard-teacher" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No club patrons yet</p>
                    <p style="font-size: 0.875rem;">Click "Add Patron" to add your first patron</p>
                </div>
            `;
            return;
        }

        // Use leadership page patron card styling
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
        container.style.gap = '2rem';

        container.innerHTML = this.patrons.map(patron => `
            <div style="position: relative; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; padding: 2.5rem; color: white; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease, box-shadow 0.3s ease;">
                <!-- Edit/Delete buttons overlay -->
                <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; z-index: 10;">
                    <button onclick="leadershipManager.editPatron('${patron.id}')" title="Edit" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <i class="fas fa-edit" style="font-size: 0.875rem;"></i>
                    </button>
                    <button onclick="leadershipManager.deletePatron('${patron.id}')" title="Delete" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <i class="fas fa-trash" style="font-size: 0.875rem;"></i>
                    </button>
                </div>

                <!-- Header with Avatar and Info -->
                <div style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; font-weight: 700; margin-right: 1.5rem; border: 3px solid rgba(255, 255, 255, 0.2);">
                        ${this.getInitials(patron.name)}
                    </div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">${patron.name}</h3>
                        <div style="color: #3b82f6; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">${patron.title}</div>
                        ${patron.department ? `<div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">${patron.department}</div>` : ''}
                    </div>
                </div>

                <!-- Bio -->
                ${patron.bio ? `
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.875rem;">
                        ${patron.bio.length > 150 ? patron.bio.substring(0, 150) + '...' : patron.bio}
                    </p>
                ` : ''}

                <!-- Specialization Tags -->
                ${patron.specialization && patron.specialization.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${patron.specialization.slice(0, 3).map(spec => `
                            <span style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500;">
                                ${spec}
                            </span>
                        `).join('')}
                        ${patron.specialization.length > 3 ? `
                            <span style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.7); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500;">
                                +${patron.specialization.length - 3} more
                            </span>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- Contact Info -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    ${patron.office_location ? `
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-map-marker-alt" style="color: #3b82f6;"></i>
                            ${patron.office_location}
                        </div>
                    ` : '<div></div>'}
                    
                    <div style="display: flex; gap: 0.75rem;">
                        ${patron.email ? `
                            <a href="mailto:${patron.email}" title="Email" style="width: 36px; height: 36px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s ease;">
                                <i class="fas fa-envelope" style="font-size: 0.875rem;"></i>
                            </a>
                        ` : ''}
                        ${patron.phone ? `
                            <a href="tel:${patron.phone}" title="Phone" style="width: 36px; height: 36px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s ease;">
                                <i class="fas fa-phone" style="font-size: 0.875rem;"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('Patrons rendered successfully');
    }

    getInitials(name) {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    showExecutiveModal(executive = null) {
        const isEdit = !!executive;
        const modalHTML = `
            <div class="modal-backdrop" id="executiveModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;">
                <div class="modal-content" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; position: relative;">
                    <div class="modal-header" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <h2 style="color: white; font-size: 1.5rem; margin: 0;">${isEdit ? 'Edit' : 'Add'} Executive Member</h2>
                        <button class="modal-close" onclick="leadershipManager.closeModal()" style="position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; line-height: 1;">&times;</button>
                    </div>
                    <form id="executiveForm" class="cms-form">
                        <!-- Profile Picture Upload -->
                        <div style="margin-bottom: 2rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Profile Picture</label>
                            <div style="display: flex; align-items: center; gap: 1.5rem;">
                                <div id="profilePreview" style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: 700; overflow: hidden; border: 3px solid rgba(255, 255, 255, 0.2);">
                                    ${executive?.profilePhoto ? 
                                        `<img src="${executive.profilePhoto}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                        `<span>${executive ? this.getInitials(executive.user.name) : 'JD'}</span>`
                                    }
                                </div>
                                <div style="flex: 1;">
                                    <input type="file" id="profilePictureInput" accept="image/*" style="display: none;">
                                    <button type="button" onclick="document.getElementById('profilePictureInput').click()" style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; margin-bottom: 0.5rem;">
                                        <i class="fas fa-upload"></i> Choose Image
                                    </button>
                                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin: 0;">Recommended: Square image, max 5MB</p>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <!-- Full Name -->
                            <div style="grid-column: 1 / -1;">
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Full Name <span style="color: #ef4444;">*</span></label>
                                <input type="text" name="name" value="${executive?.user.name || ''}" required style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Position -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Position <span style="color: #ef4444;">*</span></label>
                                <select name="position" required style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                                    <option value="">Select Position</option>
                                    <option value="Chairperson" ${executive?.position === 'Chairperson' ? 'selected' : ''}>Chairperson</option>
                                    <option value="Vice Chairperson" ${executive?.position === 'Vice Chairperson' ? 'selected' : ''}>Vice Chairperson</option>
                                    <option value="Secretary" ${executive?.position === 'Secretary' ? 'selected' : ''}>Secretary</option>
                                    <option value="Treasurer" ${executive?.position === 'Treasurer' ? 'selected' : ''}>Treasurer</option>
                                    <option value="Communications Director" ${executive?.position === 'Communications Director' ? 'selected' : ''}>Communications Director</option>
                                    <option value="Projects Coordinator" ${executive?.position === 'Projects Coordinator' ? 'selected' : ''}>Projects Coordinator</option>
                                </select>
                            </div>

                            <!-- Display Order -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Display Order</label>
                                <input type="number" name="display_order" value="${executive?.positionOrder || 0}" min="0" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Email -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Email</label>
                                <input type="email" name="email" value="${executive?.user.email || ''}" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Phone -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Phone</label>
                                <input type="tel" name="phone" value="${executive?.user.phone || ''}" placeholder="+254 712 345 678" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Course -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Course</label>
                                <input type="text" name="course" value="${executive?.user.course || ''}" placeholder="e.g., Bachelor of Science in Computer Science" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Year of Study -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Year of Study</label>
                                <input type="text" name="year_of_study" value="${executive?.user.year_of_study || ''}" placeholder="e.g., Fourth Year" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>
                        </div>

                        <!-- Bio -->
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Bio</label>
                            <textarea name="bio" rows="4" placeholder="Brief description about the executive member..." style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem; resize: vertical;">${executive?.bio || ''}</textarea>
                        </div>

                        <!-- Office Hours -->
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Office Hours</label>
                            <input type="text" name="office_hours" value="${executive?.officeHours || ''}" placeholder="e.g., Monday & Wednesday, 2:00 PM - 4:00 PM" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                        </div>

                        <!-- Social Links -->
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Social Media Links</label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <input type="url" name="linkedin" value="${executive?.socialMedia?.linkedin || ''}" placeholder="LinkedIn URL" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                                <input type="url" name="twitter" value="${executive?.socialMedia?.twitter || ''}" placeholder="Twitter URL" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                                <input type="url" name="github" value="${executive?.socialMedia?.github || ''}" placeholder="GitHub URL" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                                <input type="url" name="instagram" value="${executive?.socialMedia?.instagram || ''}" placeholder="Instagram URL" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div style="display: flex; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                            <button type="button" onclick="leadershipManager.closeModal()" style="flex: 1; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">Cancel</button>
                            <button type="submit" style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Executive
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Wait for DOM to be ready before attaching event listeners
        setTimeout(() => {
            // Add event listeners for close buttons
            const closeBtn = document.getElementById('closeExecutiveModalBtn');
            const cancelBtn = document.getElementById('cancelExecutiveBtn');
            const chooseImageBtn = document.getElementById('chooseImageBtn');
            const profileInput = document.getElementById('profilePictureInput');
            const profilePreview = document.getElementById('profilePreview');
            const form = document.getElementById('executiveForm');
            const modal = document.getElementById('executiveModal');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.closeModal());
            }

            // Handle profile picture selection
            if (chooseImageBtn && profileInput) {
                chooseImageBtn.addEventListener('click', () => {
                    profileInput.click();
                });
            }
            
            // Handle profile picture preview
            if (profileInput && profilePreview) {
                profileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            profilePreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Handle form submission
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveExecutive(executive?.id);
                });
            }

            // Close modal when clicking outside
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target.id === 'executiveModal') {
                        this.closeModal();
                    }
                });
            }
        }, 0);
    }

    showPatronModal(patron = null) {
        const isEdit = !!patron;
        const modalHTML = `
            <div class="modal-backdrop" id="patronModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;">
                <div class="modal-content" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; position: relative;">
                    <div class="modal-header" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <h2 style="color: white; font-size: 1.5rem; margin: 0;">${isEdit ? 'Edit' : 'Add'} Club Patron</h2>
                        <button id="closePatronModalBtn" class="modal-close" style="position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; line-height: 1;">&times;</button>
                    </div>
                    <form id="patronForm" class="cms-form">
                        <!-- Profile Picture Upload -->
                        <div style="margin-bottom: 2rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Profile Picture</label>
                            <div style="display: flex; align-items: center; gap: 1.5rem;">
                                <div id="patronProfilePreview" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; font-weight: 700; overflow: hidden; border: 3px solid rgba(255, 255, 255, 0.2);">
                                    ${patron?.profile_image_url ? 
                                        `<img src="${patron.profile_image_url}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                        `<span>${patron ? this.getInitials(patron.name) : 'DR'}</span>`
                                    }
                                </div>
                                <div style="flex: 1;">
                                    <input type="file" id="patronProfilePictureInput" accept="image/*" style="display: none;">
                                    <button type="button" id="choosePatronImageBtn" style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; margin-bottom: 0.5rem;">
                                        <i class="fas fa-upload"></i> Choose Image
                                    </button>
                                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin: 0;">Recommended: Square image, max 5MB</p>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <!-- Full Name -->
                            <div style="grid-column: 1 / -1;">
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Full Name <span style="color: #ef4444;">*</span></label>
                                <input type="text" name="name" value="${patron?.name || ''}" required style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Title -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Title <span style="color: #ef4444;">*</span></label>
                                <input type="text" name="title" value="${patron?.title || ''}" placeholder="e.g., Senior Lecturer, Professor" required style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Department -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Department</label>
                                <input type="text" name="department" value="${patron?.department || ''}" placeholder="e.g., Department of Computer Science" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Email -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Email</label>
                                <input type="email" name="email" value="${patron?.email || ''}" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Phone -->
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Phone</label>
                                <input type="tel" name="phone" value="${patron?.phone || ''}" placeholder="+254 720 111 222" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>

                            <!-- Office Location -->
                            <div style="grid-column: 1 / -1;">
                                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Office Location</label>
                                <input type="text" name="office_location" value="${patron?.office_location || ''}" placeholder="e.g., ICT Building, Room 301" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            </div>
                        </div>

                        <!-- Bio -->
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Bio</label>
                            <textarea name="bio" rows="4" placeholder="Brief description about the patron's expertise and role..." style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem; resize: vertical;">${patron?.bio || ''}</textarea>
                        </div>

                        <!-- Specialization (comma-separated) -->
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Specialization Areas</label>
                            <input type="text" name="specialization" value="${patron?.specialization?.join(', ') || ''}" placeholder="e.g., Software Engineering, AI & Machine Learning, Innovation Management" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-top: 0.25rem;">Separate multiple areas with commas</p>
                        </div>

                        <!-- Form Actions -->
                        <div style="display: flex; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                            <button type="button" id="cancelPatronBtn" style="flex: 1; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">Cancel</button>
                            <button type="submit" style="flex: 1; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Patron
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Wait for DOM to be ready before attaching event listeners
        setTimeout(() => {
            // Add event listeners for close buttons
            const closeBtn = document.getElementById('closePatronModalBtn');
            const cancelBtn = document.getElementById('cancelPatronBtn');
            const chooseImageBtn = document.getElementById('choosePatronImageBtn');
            const profileInput = document.getElementById('patronProfilePictureInput');
            const profilePreview = document.getElementById('patronProfilePreview');
            const form = document.getElementById('patronForm');
            const modal = document.getElementById('patronModal');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.closeModal());
            }

            // Handle profile picture selection
            if (chooseImageBtn && profileInput) {
                chooseImageBtn.addEventListener('click', () => {
                    profileInput.click();
                });
            }
            
            // Handle profile picture preview
            if (profileInput && profilePreview) {
                profileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            profilePreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Handle form submission
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.savePatron(patron?.id);
                });
            }

            // Close modal when clicking outside
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target.id === 'patronModal') {
                        this.closeModal();
                    }
                });
            }
        }, 0);
    }

    async saveExecutive(id = null) {
        const form = document.getElementById('executiveForm');
        const formData = new FormData(form);
        
        // Handle profile picture upload
        const profileInput = document.getElementById('profilePictureInput');
        let profileImageUrl = null;
        let storagePath = null;

        if (profileInput.files[0]) {
            try {
                const file = profileInput.files[0];
                const fileName = `exec_${Date.now()}_${file.name}`;
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                uploadFormData.append('bucket', 'leadership');
                uploadFormData.append('path', fileName);

                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const uploadRes = await fetch('/api/v1/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: uploadFormData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    profileImageUrl = uploadData.url;
                    storagePath = uploadData.path;
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
            }
        }

        // Build social links object
        const socialLinks = {};
        if (formData.get('linkedin')) socialLinks.linkedin = formData.get('linkedin');
        if (formData.get('twitter')) socialLinks.twitter = formData.get('twitter');
        if (formData.get('github')) socialLinks.github = formData.get('github');
        if (formData.get('instagram')) socialLinks.instagram = formData.get('instagram');

        const data = {
            name: formData.get('name'),
            position: formData.get('position'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            bio: formData.get('bio'),
            course: formData.get('course'),
            year_of_study: formData.get('year_of_study'),
            office_hours: formData.get('office_hours'),
            display_order: parseInt(formData.get('display_order')) || 0,
            social_links: socialLinks
        };

        if (profileImageUrl) {
            data.profile_image_url = profileImageUrl;
            data.storage_path = storagePath;
        }

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const url = id 
                ? `/api/v1/leadership/executive-committee/${id}`
                : '/api/v1/leadership/executive-committee';
            
            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showToast(`Executive ${id ? 'updated' : 'added'} successfully`, 'success');
                this.closeModal();
                this.loadLeadership();
            } else {
                const error = await response.json();
                this.showToast(error.message || 'Failed to save executive', 'error');
            }
        } catch (error) {
            console.error('Error saving executive:', error);
            this.showToast('Failed to save executive', 'error');
        }
    }

    async savePatron(id = null) {
        const form = document.getElementById('patronForm');
        const formData = new FormData(form);
        
        // Handle profile picture upload
        const profileInput = document.getElementById('patronProfilePictureInput');
        let profileImageUrl = null;
        let storagePath = null;

        if (profileInput.files[0]) {
            try {
                const file = profileInput.files[0];
                const fileName = `patron_${Date.now()}_${file.name}`;
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                uploadFormData.append('bucket', 'leadership');
                uploadFormData.append('path', fileName);

                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const uploadRes = await fetch('/api/v1/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: uploadFormData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    profileImageUrl = uploadData.url;
                    storagePath = uploadData.path;
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
            }
        }

        // Parse specialization from comma-separated string to array
        const specializationStr = formData.get('specialization');
        const specialization = specializationStr 
            ? specializationStr.split(',').map(s => s.trim()).filter(s => s)
            : [];

        const data = {
            name: formData.get('name'),
            title: formData.get('title'),
            department: formData.get('department'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            office_location: formData.get('office_location'),
            bio: formData.get('bio'),
            specialization: specialization
        };

        if (profileImageUrl) {
            data.profile_image_url = profileImageUrl;
            data.storage_path = storagePath;
        }

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const url = id 
                ? `/api/v1/leadership/patrons/${id}`
                : '/api/v1/leadership/patrons';
            
            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showToast(`Patron ${id ? 'updated' : 'added'} successfully`, 'success');
                this.closeModal();
                this.loadLeadership();
            } else {
                const error = await response.json();
                this.showToast(error.message || 'Failed to save patron', 'error');
            }
        } catch (error) {
            console.error('Error saving patron:', error);
            this.showToast('Failed to save patron', 'error');
        }
    }

    editExecutive(id) {
        const executive = this.executives.find(e => e.id === id);
        if (executive) {
            this.showExecutiveModal(executive);
        }
    }

    editPatron(id) {
        const patron = this.patrons.find(p => p.id === id);
        if (patron) {
            this.showPatronModal(patron);
        }
    }

    async deleteExecutive(id) {
        if (!confirm('Are you sure you want to remove this executive member?')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`/api/v1/leadership/executive-committee/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.showToast('Executive removed successfully', 'success');
                this.loadLeadership();
            } else {
                this.showToast('Failed to remove executive', 'error');
            }
        } catch (error) {
            console.error('Error deleting executive:', error);
            this.showToast('Failed to remove executive', 'error');
        }
    }

    async deletePatron(id) {
        if (!confirm('Are you sure you want to remove this patron?')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`/api/v1/leadership/patrons/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.showToast('Patron removed successfully', 'success');
                this.loadLeadership();
            } else {
                this.showToast('Failed to remove patron', 'error');
            }
        } catch (error) {
            console.error('Error deleting patron:', error);
            this.showToast('Failed to remove patron', 'error');
        }
    }

    closeModal() {
        document.getElementById('executiveModal')?.remove();
        document.getElementById('patronModal')?.remove();
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Alias for consistency with other managers
    async load() {
        this.init(); // Ensure events are bound
        await this.loadLeadership();
    }
}

// Make it globally accessible
window.LeadershipManager = LeadershipManager;

// ES6 export for module imports
export { LeadershipManager as CMSLeadershipManager };
