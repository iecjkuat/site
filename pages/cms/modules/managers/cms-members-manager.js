/**
 * CMS Members Manager
 * Handles member management and user administration
 */

export class CMSMembersManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
        this.autoRefreshInterval = null;
        this.autoRefreshEnabled = true;
    }

    async load() {
        const container = document.getElementById('members-content');
        if (!container) {
            console.error('❌ Members container not found');
            return;
        }

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const members = await CMSData.getMembers();
            this.render(members);
            this.updateStats(members);
            
            // Start auto-refresh when members tab is loaded
            this.startAutoRefresh();
        } catch (error) {
            console.error('Error loading members:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load members. Please try again.'));
        }
    }

    startAutoRefresh() {
        // Clear any existing interval
        this.stopAutoRefresh();
        
        // Refresh every 30 seconds when tab is active
        this.autoRefreshInterval = setInterval(async () => {
            if (this.autoRefreshEnabled && document.visibilityState === 'visible') {
                console.log('🔄 Auto-refreshing members data...');
                
                // Clear cache to force fresh data
                CMSData.clearCache('members');
                
                try {
                    const members = await CMSData.getMembers();
                    this.render(members);
                    this.updateStats(members);
                } catch (error) {
                    console.error('Auto-refresh error:', error);
                }
            }
        }, 30000); // 30 seconds
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    destroy() {
        // Clean up when switching tabs
        this.stopAutoRefresh();
    }

    render(members) {
        const container = document.getElementById('members-content');
        container.replaceChildren();

        if (!members.length) {
            container.appendChild(CMSUI.createEmptyState('No members found.'));
            return;
        }

        // Create table wrapper with horizontal scroll
        const tableWrapper = document.createElement('div');
        tableWrapper.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            overflow-x: auto;
        `;

        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            min-width: 1400px;
        `;

        // Table header with all fields
        table.innerHTML = `
            <thead>
                <tr style="background: rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Name</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Email</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Phone</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Role</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Status</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Department</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Year</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Registration No</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Joined Date</th>
                    <th style="padding: 1rem; text-align: left; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Email Verified</th>
                    <th style="padding: 1rem; text-align: center; color: rgba(255, 255, 255, 0.9); font-weight: 600; white-space: nowrap;">Actions</th>
                </tr>
            </thead>
            <tbody id="members-table-body"></tbody>
        `;

        tableWrapper.appendChild(table);
        container.appendChild(tableWrapper);

        // Add rows
        const tbody = document.getElementById('members-table-body');
        members.forEach(member => {
            const row = this.createMemberRow(member);
            tbody.appendChild(row);
        });
    }

    createMemberRow(member) {
        const row = document.createElement('tr');
        row.style.cssText = `
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transition: background 0.2s;
        `;
        row.onmouseenter = () => row.style.background = 'rgba(255, 255, 255, 0.03)';
        row.onmouseleave = () => row.style.background = 'transparent';

        const roleColors = {
            admin: '#ef4444',
            leader: '#f59e0b',
            member: '#6b7280'
        };

        const statusColors = {
            active: '#10b981',
            inactive: '#6b7280',
            pending: '#f59e0b'
        };

        // Format date
        const formatDate = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        };

        row.innerHTML = `
            <td style="padding: 1rem; white-space: nowrap;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.875rem;">
                        ${member.name?.charAt(0) || member.email?.charAt(0) || '?'}
                    </div>
                    <span style="color: white; font-weight: 500;">${member.name || 'Unknown'}</span>
                </div>
            </td>
            <td style="padding: 1rem; color: rgba(255, 255, 255, 0.7); white-space: nowrap;">${member.email || '-'}</td>
            <td style="padding: 1rem; color: rgba(255, 255, 255, 0.7); white-space: nowrap;">${member.phone || '-'}</td>
            <td style="padding: 1rem; white-space: nowrap;">
                <span style="background: ${roleColors[member.role] || roleColors.member}20; color: ${roleColors[member.role] || roleColors.member}; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                    ${member.role || 'member'}
                </span>
            </td>
            <td style="padding: 1rem; white-space: nowrap;">
                <span style="background: ${statusColors[member.membership_status] || statusColors.inactive}20; color: ${statusColors[member.membership_status] || statusColors.inactive}; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize;">
                    ${member.membership_status || 'inactive'}
                </span>
            </td>
            <td style="padding: 1rem; color: rgba(255, 255, 255, 0.7); white-space: nowrap;">${member.college || member.course || '-'}</td>
            <td style="padding: 1rem; color: rgba(255, 255, 255, 0.7); white-space: nowrap;">${member.year_of_study ? `Year ${member.year_of_study}` : '-'}</td>
            <td style="padding: 1rem; color: rgba(255, 255, 255, 0.7); white-space: nowrap;">${member.registration_number || '-'}</td>
            <td style="padding: 1rem; color: rgba(255, 255, 255, 0.7); white-space: nowrap;">${formatDate(member.created_at)}</td>
            <td style="padding: 1rem; text-align: center; white-space: nowrap;">
                ${member.email_verified ? 
                    '<span style="color: #10b981;"><i class="fas fa-check-circle"></i> Yes</span>' : 
                    '<span style="color: #ef4444;"><i class="fas fa-times-circle"></i> No</span>'
                }
            </td>
            <td style="padding: 1rem; white-space: nowrap;">
                <div class="member-actions" style="display: flex; gap: 0.5rem; justify-content: center;">
                    ${member.role === 'admin' ? `
                        <span style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; font-style: italic;">No actions available</span>
                    ` : member.membership_status === 'pending' ? `
                        <button class="btn-approve" data-id="${member.id}" 
                                style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Approve Member">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn-deny" data-id="${member.id}" 
                                style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Deny Member">
                            <i class="fas fa-times"></i> Deny
                        </button>
                    ` : member.membership_status === 'active' ? `
                        <button class="btn-suspend" data-id="${member.id}" 
                                style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Suspend Member">
                            <i class="fas fa-pause"></i> Suspend
                        </button>
                        <button class="btn-delete" data-id="${member.id}" 
                                style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Remove Member">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    ` : member.membership_status === 'suspended' ? `
                        <button class="btn-reinstate" data-id="${member.id}" 
                                style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Reinstate Member">
                            <i class="fas fa-undo"></i> Reinstate
                        </button>
                        <button class="btn-delete" data-id="${member.id}" 
                                style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Remove Member">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    ` : `
                        <button class="btn-activate" data-id="${member.id}" 
                                style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Activate Member">
                            <i class="fas fa-check"></i> Activate
                        </button>
                        <button class="btn-delete" data-id="${member.id}" 
                                style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.375rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;" title="Remove Member">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    `}
                </div>
            </td>
        `;

        // Add event listeners
        const actionsDiv = row.querySelector('.member-actions');
        
        const approveBtn = actionsDiv.querySelector('.btn-approve');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => this.approveMember(member.id));
        }
        
        const denyBtn = actionsDiv.querySelector('.btn-deny');
        if (denyBtn) {
            denyBtn.addEventListener('click', () => this.denyMember(member.id));
        }
        
        const suspendBtn = actionsDiv.querySelector('.btn-suspend');
        if (suspendBtn) {
            suspendBtn.addEventListener('click', () => this.suspendMember(member.id));
        }
        
        const reinstateBtn = actionsDiv.querySelector('.btn-reinstate');
        if (reinstateBtn) {
            reinstateBtn.addEventListener('click', () => this.reinstateMember(member.id));
        }
        
        const activateBtn = actionsDiv.querySelector('.btn-activate');
        if (activateBtn) {
            activateBtn.addEventListener('click', () => this.activateMember(member.id));
        }
        
        const deleteBtn = actionsDiv.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteMember(member.id));
        }

        return row;
    }

    updateStats(members) {
        const totalMembers = members.length;
        const activeMembers = members.filter(m => m.membership_status === 'active').length;
        const leaders = members.filter(m => m.role === 'leader' || m.role === 'admin').length;
        const newThisMonth = members.filter(m => {
            const joinDate = new Date(m.created_at);
            const now = new Date();
            return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        }).length;

        CMSUI.animateCounter('total-members-count', totalMembers);
        CMSUI.animateCounter('active-members-count', activeMembers);
        CMSUI.animateCounter('leaders-count', leaders);
        CMSUI.animateCounter('new-members-count', newThisMonth);
    }

    async viewMember(id) {
        try {
            const member = await CMSData.getMember(id);
            this.cms.viewContent(member, 'member');
        } catch (error) {
            console.error('Error viewing member:', error);
            this.cms.notifications.show('Failed to load member details', 'error');
        }
    }

    async approveMember(id) {
        if (!confirm('Approve this member? They will gain full access to member features.')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${this.apiBase}/admin/users/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ membership_status: 'active' })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to approve member');
            }

            this.cms.notifications.show('Member approved successfully', 'success');
            
            // Clear cache before reloading
            CMSData.clearCache('members');
            await this.load();
        } catch (error) {
            console.error('Error approving member:', error);
            this.cms.notifications.show(error.message || 'Failed to approve member', 'error');
        }
    }

    async denyMember(id) {
        if (!confirm('Deny this member? They will not be able to access member features.')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${this.apiBase}/admin/users/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ membership_status: 'inactive' })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to deny member');
            }

            this.cms.notifications.show('Member denied', 'success');
            
            // Clear cache before reloading
            CMSData.clearCache('members');
            await this.load();
        } catch (error) {
            console.error('Error denying member:', error);
            this.cms.notifications.show(error.message || 'Failed to deny member', 'error');
        }
    }

    async reinstateMember(id) {
        if (!confirm('Reinstate this member? They will regain full access to member features.')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${this.apiBase}/admin/users/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ membership_status: 'active' })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reinstate member');
            }

            this.cms.notifications.show('Member reinstated successfully', 'success');
            
            // Clear cache before reloading
            CMSData.clearCache('members');
            await this.load();
        } catch (error) {
            console.error('Error reinstating member:', error);
            this.cms.notifications.show(error.message || 'Failed to reinstate member', 'error');
        }
    }

    async activateMember(id) {
        if (!confirm('Activate this member\'s membership?')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${this.apiBase}/admin/users/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ membership_status: 'active' })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to activate member');
            }

            this.cms.notifications.show('Member activated successfully', 'success');
            
            // Clear cache before reloading
            CMSData.clearCache('members');
            await this.load(); // Reload to show updated status
        } catch (error) {
            console.error('Error activating member:', error);
            this.cms.notifications.show(error.message || 'Failed to activate member', 'error');
        }
    }

    async suspendMember(id) {
        if (!confirm('Suspend this member? They will not be able to access certain features.')) return;

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${this.apiBase}/admin/users/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ membership_status: 'suspended' })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to suspend member');
            }

            this.cms.notifications.show('Member suspended successfully', 'success');
            
            // Clear cache before reloading
            CMSData.clearCache('members');
            await this.load(); // Reload to show updated status
        } catch (error) {
            console.error('Error suspending member:', error);
            this.cms.notifications.show(error.message || 'Failed to suspend member', 'error');
        }
    }

    async deleteMember(id) {
        if (!this.cms.checkOperationPermissions('delete', 'member')) {
            return;
        }

        if (!confirm('Are you sure you want to permanently remove this member? This action cannot be undone.')) {
            return;
        }

        try {
            await CMSData.deleteMember(id);
            this.cms.notifications.show('Member removed successfully', 'success');
            
            // Clear cache before reloading
            CMSData.clearCache('members');
            await this.load(); // Reload to show updated list
        } catch (error) {
            console.error('Error deleting member:', error);
            this.cms.notifications.show('Failed to remove member', 'error');
        }
    }

    async exportMembers() {
        try {
            // Show export options modal
            this.showExportModal();
        } catch (error) {
            console.error('Error exporting members:', error);
            this.cms.notifications.show('Failed to export members', 'error');
        }
    }

    showExportModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: white; margin: 0; font-size: 1.5rem;">Export Members</h3>
                    <button id="close-export-modal" style="background: none; border: none; color: rgba(255, 255, 255, 0.6); font-size: 1.5rem; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: rgba(255, 255, 255, 0.9); margin-bottom: 0.5rem; font-weight: 500;">Filter by Status</label>
                    <select id="export-status-filter" style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 1rem;">
                        <option value="all">All Members</option>
                        <option value="active">Active Members Only</option>
                        <option value="inactive">Inactive Members Only</option>
                        <option value="suspended">Suspended Members Only</option>
                        <option value="pending">Pending Members Only</option>
                    </select>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: rgba(255, 255, 255, 0.9); margin-bottom: 0.5rem; font-weight: 500;">Filter by College</label>
                    <select id="export-college-filter" style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 1rem;">
                        <option value="all">All Colleges</option>
                        <option value="COETEC">COETEC</option>
                        <option value="COHES">COHES</option>
                        <option value="CONAS">CONAS</option>
                        <option value="CODEHS">CODEHS</option>
                        <option value="CAES">CAES</option>
                    </select>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: rgba(255, 255, 255, 0.9); margin-bottom: 0.75rem; font-weight: 500;">Fields to Include</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-name" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Name</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-email" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Email</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-phone" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Phone</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-role" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Role</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-status" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Status</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-college" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>College</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-year" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Year</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-regno" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Reg Number</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-joined" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Joined Date</span>
                        </label>
                        <label style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                            <input type="checkbox" id="export-field-verified" checked style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;">
                            <span>Email Verified</span>
                        </label>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button id="cancel-export-btn" style="flex: 1; padding: 0.75rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; cursor: pointer; font-size: 1rem; transition: all 0.2s;">
                        Cancel
                    </button>
                    <button id="confirm-export-btn" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.2s;">
                        <i class="fas fa-download"></i> Export CSV
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button hover effect
        const closeBtn = modal.querySelector('#close-export-modal');
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            closeBtn.style.color = 'white';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
            closeBtn.style.color = 'rgba(255, 255, 255, 0.6)';
        });

        // Event listeners
        modal.querySelector('#close-export-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-export-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#confirm-export-btn').addEventListener('click', async () => {
            const statusFilter = modal.querySelector('#export-status-filter').value;
            const collegeFilter = modal.querySelector('#export-college-filter').value;
            
            const fields = {
                name: modal.querySelector('#export-field-name').checked,
                email: modal.querySelector('#export-field-email').checked,
                phone: modal.querySelector('#export-field-phone').checked,
                role: modal.querySelector('#export-field-role').checked,
                status: modal.querySelector('#export-field-status').checked,
                college: modal.querySelector('#export-field-college').checked,
                year: modal.querySelector('#export-field-year').checked,
                regno: modal.querySelector('#export-field-regno').checked,
                joined: modal.querySelector('#export-field-joined').checked,
                verified: modal.querySelector('#export-field-verified').checked
            };

            modal.remove();
            await this.performExport(statusFilter, collegeFilter, fields);
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async performExport(statusFilter, collegeFilter, fields) {
        try {
            this.cms.notifications.show('Preparing export...', 'info');

            // Fetch all members
            const members = await CMSData.getMembers();

            // Apply filters
            let filteredMembers = members;

            if (statusFilter !== 'all') {
                filteredMembers = filteredMembers.filter(m => m.membership_status === statusFilter);
            }

            if (collegeFilter !== 'all') {
                filteredMembers = filteredMembers.filter(m => m.college === collegeFilter);
            }

            if (filteredMembers.length === 0) {
                this.cms.notifications.show('No members match the selected filters', 'warning');
                return;
            }

            // Build CSV header based on selected fields
            const headers = [];
            if (fields.name) headers.push('Name');
            if (fields.email) headers.push('Email');
            if (fields.phone) headers.push('Phone');
            if (fields.role) headers.push('Role');
            if (fields.status) headers.push('Status');
            if (fields.college) headers.push('College');
            if (fields.year) headers.push('Year');
            if (fields.regno) headers.push('Registration Number');
            if (fields.joined) headers.push('Joined Date');
            if (fields.verified) headers.push('Email Verified');

            // Build CSV rows
            const rows = filteredMembers.map(member => {
                const row = [];
                if (fields.name) row.push(this.escapeCsv(member.name || 'Unknown'));
                if (fields.email) row.push(this.escapeCsv(member.email || ''));
                if (fields.phone) row.push(this.escapeCsv(member.phone || ''));
                if (fields.role) row.push(this.escapeCsv(member.role || 'member'));
                if (fields.status) row.push(this.escapeCsv(member.membership_status || 'inactive'));
                if (fields.college) row.push(this.escapeCsv(member.college || member.course || ''));
                if (fields.year) row.push(member.year_of_study || '');
                if (fields.regno) row.push(this.escapeCsv(member.registration_number || ''));
                if (fields.joined) row.push(this.formatDate(member.created_at));
                if (fields.verified) row.push(member.email_verified ? 'Yes' : 'No');
                return row.join(',');
            });

            // Combine header and rows
            const csv = [headers.join(','), ...rows].join('\n');

            // Create download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `members_export_${statusFilter}_${timestamp}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.cms.notifications.show(`Exported ${filteredMembers.length} members successfully`, 'success');
        } catch (error) {
            console.error('Error performing export:', error);
            this.cms.notifications.show('Failed to export members', 'error');
        }
    }

    escapeCsv(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}
