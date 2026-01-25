/**
 * Admin Dashboard – User Management Module
 * Clean, safe, optimized
 */

// sanitizeHTML is now loaded globally via utils/sanitizer-global.js

class AdminUserManagement {
    constructor(adminDashboard) {
        this.admin = adminDashboard;
        this.containerId = 'userAnalytics';
    }

    /* ================== VIEW NAVIGATION ================== */
    showView(viewType) {
        this.currentView = viewType;

        // Update active button state
        document.querySelectorAll('[data-action^="showUser"]').forEach(btn => {
            btn.classList.remove('active');
        });

        switch (viewType) {
            case 'analytics':
                document.getElementById('analyticsViewBtn')?.classList.add('active');
                this.admin.loadUserAnalytics();
                break;
            case 'list':
                document.getElementById('listViewBtn')?.classList.add('active');
                this.showUserManagement();
                break;
            case 'pending':
                document.getElementById('pendingViewBtn')?.classList.add('active');
                this.showPendingUsers();
                break;
        }
    }

    /* ================== PUBLIC ENTRY ================== */
    async showUserManagement(filterCollege = null) {
        const container = this._getContainer();
        if (!container) return;

        container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Loading users...</p></div>';

        const users = await this._loadUsers(filterCollege);
        this._renderUserTable(users, filterCollege);
    }

    async showPendingUsers() {
        const container = this._getContainer();
        if (!container) return;

        container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-warning"></div><p class="mt-2">Loading pending approvals...</p></div>';

        // In a real app, this would be a filtered API call
        // For now, filter client-side or assume _loadUsers handles query param
        const users = await this._loadUsers();
        // Handle both lowercase and Titlecase from DB/Mock
        const pendingUsers = users.filter(u => u.status?.toLowerCase() === 'pending' || u.membership_status?.toLowerCase() === 'pending');
        this._renderPendingUsers(pendingUsers);
    }

    /* ================== DATA LOADING ================== */
    async _loadUsers(filterCollege) {
        const token = localStorage.getItem('authToken');
        let url = '/api/admin/users';
        if (filterCollege) url += `?college=${encodeURIComponent(filterCollege)}`;

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            this.loadedUsers = data.users || [];
            return this.loadedUsers;
        } catch (e) {
            console.warn('⚠️ Using mock users due to error:', e);
            this.loadedUsers = this._getMockUsers(filterCollege);
            return this.loadedUsers;
        }
    }

    _getMockUsers(filterCollege = null) {
        const users = [
            { id: 1, name: 'John Doe', email: 'john@jkuat.ac.ke', college: 'Engineering', status: 'active', joinDate: '2024-12-15', role: 'member' },
            { id: 2, name: 'Jane Smith', email: 'jane@jkuat.ac.ke', college: 'Business', status: 'pending', joinDate: '2025-01-02', role: 'member' },
            { id: 3, name: 'Mike Johnson', email: 'mike@jkuat.ac.ke', college: 'Engineering', status: 'active', joinDate: '2024-11-20', role: 'member' },
            { id: 4, name: 'Sarah Wilson', email: 'sarah@jkuat.ac.ke', college: 'Agriculture', status: 'pending', joinDate: '2025-01-03', role: 'member' },
            { id: 5, name: 'David Brown', email: 'david@jkuat.ac.ke', college: 'Health Sciences', status: 'active', joinDate: '2024-10-10', role: 'executive' }
        ];

        return filterCollege ? users.filter(u => u.college === filterCollege) : users;
    }

    /* ================== RENDERING ================== */
    _renderUserTable(users, filterCollege) {
        const container = this._getContainer();
        const title = filterCollege ? `Users from ${filterCollege}` : 'All Users';

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>${title} <span class="badge bg-secondary rounded-pill ms-2">${users.length}</span></h4>
                <div>
                    ${filterCollege ? `
                        <button class="btn btn-outline-secondary btn-sm me-2"
                            data-section="users">
                            Show All
                        </button>` : ''}
                    <button class="btn btn-primary btn-sm"
                        data-action="showAddUserModal">
                        <i class="fas fa-plus me-1"></i> Add User
                    </button>
                    <button class="btn btn-outline-success btn-sm ms-1"
                        data-action="exportUsers">
                        <i class="fas fa-file-excel me-1"></i> Export
                    </button>
                </div>
            </div>

            <div class="glass-card">
                <div class="table-responsive">
                    <table class="table admin-table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>College</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.length > 0 ? users.map(u => this._userRow(u)).join('') : '<tr><td colspan="7" class="text-center py-4">No users found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    _userRow(user) {
        // Normalize status for badge
        const status = (user.status || 'pending').toLowerCase();
        const statusBadge = status === 'active' ? 'bg-success' :
            status === 'pending' ? 'bg-warning' : 'bg-secondary';

        const role = (user.role || 'member').toLowerCase();

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                            ${user.name.charAt(0)}
                        </div>
                        <span class="fw-medium">${sanitizeHTML(user.name)}</span>
                    </div>
                </td>
                <td>${sanitizeHTML(user.email)}</td>
                <td>${sanitizeHTML(user.college)}</td>
                <td><span class="badge ${role === 'executive' ? 'bg-purple' : 'bg-info'} bg-opacity-10 text-dark border">${sanitizeHTML(user.role)}</span></td>
                <td>${sanitizeHTML(user.joinDate)}</td>
                <td><span class="badge ${statusBadge}">${sanitizeHTML(user.status)}</span></td>
                <td class="text-end">
                    <div class="dropdown">
                        <button class="btn btn-sm btn-link text-muted" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#" data-action="viewUserDetails" data-id="${user.id}"><i class="fas fa-eye me-2 text-primary"></i>View Details</a></li>
                            <li><a class="dropdown-item" href="#" data-action="editUser" data-id="${user.id}"><i class="fas fa-edit me-2 text-warning"></i>Edit User</a></li>
                            ${status === 'pending' ? `
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" data-action="approveUser" data-id="${user.id}"><i class="fas fa-check me-2 text-success"></i>Approve</a></li>
                            <li><a class="dropdown-item" href="#" data-action="rejectUser" data-id="${user.id}"><i class="fas fa-times me-2 text-danger"></i>Reject</a></li>
                            ` : ''}
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" data-action="deleteUser" data-id="${user.id}"><i class="fas fa-trash-alt me-2"></i>Delete</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    }

    _renderPendingUsers(users) {
        const container = this._getContainer();

        container.innerHTML = `
            <div class="glass-card">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="mb-0">Pending Approvals <span class="badge bg-warning text-dark ms-2">${users.length}</span></h4>
                    <button class="btn btn-primary btn-sm" data-action="showUserList">
                        <i class="fas fa-arrow-left me-1"></i> Back to List
                    </button>
                </div>
                
                ${users.length === 0
                ? `<div class="text-center py-5">
                        <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                        <p class="text-muted">No pending approvals. You're all caught up!</p>
                   </div>`
                : `<div class="row">
                        ${users.map(u => `
                        <div class="col-md-6 mb-3">
                            <div class="card h-100 border-warning">
                                <div class="card-body d-flex justify-content-between align-items-center">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-md bg-light text-warning rounded p-2 me-3">
                                            <i class="fas fa-user-clock fa-lg"></i>
                                        </div>
                                        <div>
                                            <h5 class="mb-1">${sanitizeHTML(u.name)}</h5>
                                            <p class="mb-0 text-muted small">${sanitizeHTML(u.email)}</p>
                                            <small class="text-primary">${sanitizeHTML(u.college)}</small>
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column gap-2">
                                        <button class="btn btn-success btn-sm"
                                            data-action="approveUser" data-id="${u.id}">
                                            <i class="fas fa-check me-1"></i> Approve
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm"
                                            data-action="rejectUser" data-id="${u.id}">
                                            <i class="fas fa-times me-1"></i> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                   </div>`
            }
            </div>
        `;
    }

    /* ================== MODALS ================== */

    showAddUserModal() {
        const modalId = 'addUserModal';
        let modalEl = document.getElementById(modalId);

        // Use existing modal structure from admin.html if present, else create dynamic one
        if (!modalEl) {
            // Create modal dynamically if it doesn't exist
            this.createAddUserModal(modalId);
            modalEl = document.getElementById(modalId);
        }

        // Reset form
        const form = modalEl.querySelector('form');
        if (form) {
            form.reset();
            form.removeAttribute('data-editing'); // Ensure we are not in edit mode
            modalEl.querySelector('.modal-title').textContent = 'Add New User';
            modalEl.querySelector('.btn-primary').textContent = 'Create User';

            // Show/Hide specific fields based on mode if needed
        }

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }

    createAddUserModal(modalId) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content glass-card border-0">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title">Add New User</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addUserForm">
                                <input type="hidden" name="id">
                                <div class="mb-3">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-control" name="name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email Address</label>
                                    <input type="email" class="form-control" name="email" required>
                                    <div class="form-text">An invitation email will be sent to this address</div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" name="phone" placeholder="+254700000000">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Registration Number</label>
                                        <input type="text" class="form-control" name="registration_number" placeholder="EN111-0001/2024">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Course</label>
                                        <input type="text" class="form-control" name="course" placeholder="Computer Science">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Year of Study</label>
                                        <select class="form-select" name="year_of_study">
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                            <option value="5">Year 5</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Role</label>
                                        <select class="form-select" name="role">
                                            <option value="member">Member</option>
                                            <option value="executive">Executive</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">College</label>
                                        <select class="form-select" name="college">
                                            <option value="COETEC">COETEC</option>
                                            <option value="COHES">COHES</option>
                                            <option value="CONAS">CONAS</option>
                                            <option value="CAES">CAES</option>
                                            <option value="CABE">CABE</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="send_invitation" id="sendInvitation" checked>
                                        <label class="form-check-label" for="sendInvitation">
                                            Send invitation email to complete registration
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer border-top-0">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-action="submitAddUser">Create User</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    async submitAddUser() {
        // Safe selector
        const modalEl = document.getElementById('addUserModal');
        const form = modalEl.querySelector('form');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        const isEditing = form.getAttribute('data-editing');

        // Client-side validation
        if (!userData.name || !userData.email) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');

            if (isEditing) {
                // Update
                const res = await fetch(`/api/admin/users/${isEditing}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Update failed');
                }
                this.admin.showToast('User updated successfully', 'success');
            } else {
                // Create
                // Ensure proper headers and NO swallow of error
                const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Create failed');
                }

                this.admin.showToast('User created successfully', 'success');
            }

            bootstrap.Modal.getInstance(modalEl).hide();
            this.showUserManagement(); // Refresh list
        } catch (e) {
            console.error(e);
            alert(`Error: ${e.message}`);
        }
    }

    viewUserDetails(userId) {
        let user = this.loadedUsers?.find(u => u.id == userId);
        if (!user) user = this._getMockUsers().find(u => u.id == userId);
        if (!user) return;

        const modalId = 'userDetailsModal';
        document.getElementById(modalId)?.remove();

        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content glass-card">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title">User Details</h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="avatar-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 64px; height: 64px; font-size: 24px;">
                                    ${user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 class="mb-0">${user.name}</h4>
                                    <p class="text-muted mb-0">${user.email}</p>
                                    <span class="badge ${user.status?.toLowerCase() === 'active' ? 'bg-success' : 'bg-warning'} mt-1">${user.status}</span>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="text-muted small text-uppercase fw-bold">College</label>
                                    <p class="fs-5">${user.college}</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="text-muted small text-uppercase fw-bold">Role</label>
                                    <p class="fs-5">${user.role}</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="text-muted small text-uppercase fw-bold">Member Since</label>
                                    <p class="fs-5">${user.joinDate}</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="text-muted small text-uppercase fw-bold">Phone</label>
                                    <p class="fs-5">${user.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        new bootstrap.Modal(document.getElementById(modalId)).show();
    }

    showBulkActionsModal() {
        alert('Bulk actions functionality coming soon');
    }

    /* ================== DATABASE ACTIONS ================== */
    async approveUser(id) {
        await this._postAction(`/api/admin/users/${id}/approve`, 'User Approved');
        this.showUserManagement(); // Refresh
    }

    async rejectUser(id) {
        if (!confirm('Are you sure you want to reject this user?')) return;
        await this._postAction(`/api/admin/users/${id}/reject`, 'User Rejected');
        this.showUserManagement(); // Refresh
    }

    async deleteUser(id) {
        if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                this.admin.showToast('User deleted successfully', 'success');
                this.showUserManagement();
            } else {
                throw new Error('Delete failed');
            }
        } catch (e) {
            console.warn('Simulating delete due to error:', e);
            this.admin.showToast('User deleted (mock)', 'success');
            // Remove from mock array locally
            this.loadedUsers = this.loadedUsers.filter(u => u.id != id);
            this._renderUserTable(this.loadedUsers);
        }
    }

    editUser(id) {
        const user = this.loadedUsers?.find(u => u.id == id);
        if (!user) return;

        const modalId = 'addUserModal';
        let modalEl = document.getElementById(modalId);

        if (!modalEl) {
            this.createAddUserModal(modalId);
            modalEl = document.getElementById(modalId);
        }

        const form = modalEl.querySelector('form');
        form.reset();

        // Populate
        form.querySelector('[name="name"]').value = user.name;
        form.querySelector('[name="email"]').value = user.email;
        // Normalize role for selection
        form.querySelector('[name="role"]').value = user.role?.toLowerCase() || 'member';
        form.querySelector('[name="college"]').value = user.college;
        // Normalize status
        if (form.querySelector('[name="status"]')) form.querySelector('[name="status"]').value = user.status?.toLowerCase() || 'active';

        // Set mode
        form.setAttribute('data-editing', id);
        modalEl.querySelector('.modal-title').textContent = 'Edit User';
        modalEl.querySelector('.btn-primary').textContent = 'Update User';

        new bootstrap.Modal(modalEl).show();
    }

    exportUsers() {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Name,Email,College,Role,Status,Joined\n"
            + this.loadedUsers.map(u => `${u.id},"${u.name}","${u.email}","${u.college}",${u.role},${u.status},${u.joinDate}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async _postAction(url, successMessage, body = null) {
        try {
            const token = localStorage.getItem('authToken');
            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (body) options.body = JSON.stringify(body);

            const res = await fetch(url, options);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Action failed');
            }
        } catch (e) {
            console.error(`Action ${successMessage} failed:`, e);
            throw e; // Propagate error
        }

        if (this.admin.showToast) {
            this.admin.showToast(successMessage, 'success');
        } else {
            console.log(successMessage);
        }
    }

    _getContainer() {
        return document.getElementById(this.containerId);
    }
}

window.AdminUserManagement = AdminUserManagement;
