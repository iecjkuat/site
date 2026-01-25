/**
 * Ideas Management Module
 * Handles innovation hub, idea submissions, challenges, and reviews
 */

class IdeasManagement extends BaseManagement {
    constructor(adminDashboard) {
        super(adminDashboard);
    }

    /* ================= INNOVATION MANAGEMENT (IDEAS) ================= */

    async showIdeasView(view = 'analytics') {
        console.log(`💡 Switching to ideas view: ${view}`);

        // Update admin dashboard state
        if (this.admin) {
            this.admin.currentView = view;
            this.admin.updateURL('innovation', view);
        }

        // Update sub-navigation UI
        this.updateInnovationNavUI(view);

        switch (view) {
            case 'list':
                await this.showIdeasList();
                break;
            case 'pending':
                await this.showIdeasList('pending');
                break;
            case 'approved':
                await this.showIdeasList('approved');
                break;
            case 'challenges':
                await this.showIdeaChallenges();
                break;
            case 'analytics':
            default:
                this.admin.analytics.loadInnovationAnalytics();
        }
    }

    updateInnovationNavUI(view) {
        const btnMap = {
            'analytics': 'innovationAnalyticsViewBtn',
            'list': 'ideasListBtn',
            'pending': 'pendingIdeasViewBtn',
            'challenges': 'challengesViewBtn',
            'approved': 'ideasListBtn'
        };

        const activeBtnId = btnMap[view] || 'innovationAnalyticsViewBtn';

        Object.values(btnMap).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove('active');
        });

        const activeBtn = document.getElementById(activeBtnId);
        if (activeBtn) activeBtn.classList.add('active');
    }

    async showIdeasList(filterStatus = null) {
        const container = this.getContainer("innovationAnalytics");
        if (!container) return;

        container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-info"></div><p>Loading ideas...</p></div>';

        try {
            let url = '/api/admin/ideas';
            if (filterStatus) url += `?status=${filterStatus}`;

            const { ideas } = await this.fetchWithAuth(url);
            this.renderIdeasList(ideas, container);
        } catch (error) {
            console.log('⚡️ API unavailable, using mock ideas');
            let mockIdeas = [
                { id: 1, title: "Smart Campus App", category: "Technology", author_name: "John Doe", author_email: "john@example.com", created_at: "2025-01-14T10:00:00", status: "pending" },
                { id: 2, title: "Eco-friendly Canteen", category: "Environment", author_name: "Jane Smith", author_email: "jane@example.com", created_at: "2025-01-13T14:30:00", status: "approved" },
                { id: 3, title: "Peer Tutoring Platform", category: "Education", author_name: "Alice Johnson", author_email: "alice@example.com", created_at: "2025-01-12T09:15:00", status: "implemented" },
                { id: 4, title: "Club Merch Shop", category: "Business", author_name: "Bob Brown", author_email: "bob@example.com", created_at: "2025-01-11T16:45:00", status: "rejected" }
            ];

            if (filterStatus) {
                mockIdeas = mockIdeas.filter(idea => idea.status === filterStatus);
            }

            this.renderIdeasList(mockIdeas, container);
        }
    }

    renderIdeasList(ideas, container) {
        if (!container) container = this.getContainer("innovationAnalytics");

        const rows = ideas.map(idea => `
            <tr>
                <td>
                    <div class="fw-bold">${sanitizeHTML(idea.title)}</div>
                    <small class="text-muted">${sanitizeHTML(idea.category || 'General')}</small>
                </td>
                <td>
                    <div>${sanitizeHTML(idea.author_name)}</div>
                    <small class="text-muted">${sanitizeHTML(idea.author_email)}</small>
                </td>
                <td>${new Date(idea.created_at).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${this.getIdeaStatusBadge(idea.status)}">${sanitizeHTML(idea.status)}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success" onclick="window.adminDashboard.ideasManagement.updateIdeaStatus('${idea.id}', 'approved')" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="window.adminDashboard.ideasManagement.updateIdeaStatus('${idea.id}', 'rejected')" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="window.adminDashboard.ideasManagement.viewIdeaDetails('${idea.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-lightbulb me-2 text-warning"></i>Innovation Management</h4>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.adminDashboard.ideasManagement.showIdeasList()">All</button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.adminDashboard.ideasManagement.showIdeasList('pending')">Pending</button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.adminDashboard.ideasManagement.showIdeasList('approved')">Approved</button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Idea / Category</th>
                            <th>Author</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.length ? rows : '<tr><td colspan="5" class="text-center py-4">No ideas found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    async updateIdeaStatus(id, status) {
        if (!confirm(`Are you sure you want to mark this idea as ${status}?`)) return;

        try {
            await this.fetchWithAuth(`/api/admin/ideas/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            this.showIdeasList(); // Refresh list
            this.admin.showToast(`Idea marked as ${status}`, 'success');
        } catch (error) {
            this.admin.showToast(error.message, 'error');
        }
    }

    viewIdeaDetails(id) {
        // Simple alert for now, could be a modal later
        alert("View details for idea ID: " + id);
    }

    async showIdeaChallenges() {
        const container = this.getContainer("innovationAnalytics");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-star me-2 text-warning"></i>Innovation Challenges</h4>
                <button class="btn btn-success btn-sm" onclick="window.adminDashboard.ideasManagement.createChallenge()">
                    <i class="fas fa-plus me-1"></i>Create Challenge
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">AI Innovation Challenge</h5>
                                <span class="badge bg-success">Active</span>
                            </div>
                            <p class="card-text">Develop AI solutions for campus problems</p>
                            <div class="challenge-stats mb-3">
                                <small class="text-muted">
                                    <i class="fas fa-users me-1"></i>12 participants<br>
                                    <i class="fas fa-lightbulb me-1"></i>8 submissions<br>
                                    <i class="fas fa-calendar me-1"></i>Ends: Jan 30, 2026
                                </small>
                            </div>
                            <div class="btn-group w-100">
                                <button class="btn btn-outline-primary btn-sm">View Details</button>
                                <button class="btn btn-outline-success btn-sm">Manage</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">Sustainability Hackathon</h5>
                                <span class="badge bg-warning">Planning</span>
                            </div>
                            <p class="card-text">Green technology solutions for JKUAT</p>
                            <div class="challenge-stats mb-3">
                                <small class="text-muted">
                                    <i class="fas fa-users me-1"></i>0 participants<br>
                                    <i class="fas fa-lightbulb me-1"></i>0 submissions<br>
                                    <i class="fas fa-calendar me-1"></i>Starts: Feb 15, 2026
                                </small>
                            </div>
                            <div class="btn-group w-100">
                                <button class="btn btn-outline-primary btn-sm">View Details</button>
                                <button class="btn btn-outline-success btn-sm">Manage</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">Mobile App Challenge</h5>
                                <span class="badge bg-secondary">Completed</span>
                            </div>
                            <p class="card-text">Student-focused mobile applications</p>
                            <div class="challenge-stats mb-3">
                                <small class="text-muted">
                                    <i class="fas fa-users me-1"></i>25 participants<br>
                                    <i class="fas fa-lightbulb me-1"></i>15 submissions<br>
                                    <i class="fas fa-trophy me-1"></i>3 winners
                                </small>
                            </div>
                            <div class="btn-group w-100">
                                <button class="btn btn-outline-primary btn-sm">View Results</button>
                                <button class="btn btn-outline-info btn-sm">Archive</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createChallenge() {
        this.admin.showToast('Challenge creation feature coming soon', 'info');
    }

    /* ================= EXPORT METHODS ================= */

    async exportIdeas() {
        await this.exportData('ideas');
    }

    approveIdea(id) {
        this.updateIdeaStatus(id, 'approved');
    }

    rejectIdea(id) {
        this.updateIdeaStatus(id, 'rejected');
    }

    promoteIdea(id) {
        this.admin.showToast(`Promoting idea ${id} to featured status`, 'info');
    }

    /* ================= FILTER METHODS ================= */

    applyIdeaFilter(filterId, value) {
        console.log(`Applying idea filter ${filterId}:`, value);
        // Implement idea filtering logic here
        this.admin.showToast(`Idea filter ${filterId} applied: ${value}`, 'info');
    }

    /* ================= UPDATE HANDLERS ================= */

    handleIdeaUpdate(data) {
        console.log('💡 Handling idea update in ideas management:', data);
        // Refresh ideas data if needed
        if (this.admin.currentSection === 'innovation') {
            this.showIdeasList();
        }
    }
}