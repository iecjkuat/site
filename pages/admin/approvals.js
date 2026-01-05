/**
 * Admin Approvals Page - Main functionality
 * JKUAT Innovation and Entrepreneurship Club
 */

class AdminApprovalsManager {
    constructor() {
        this.currentTab = 'pending-ideas';
        this.pendingIdeas = [];
        this.pendingProjects = [];
        this.approvedToday = [];
        this.rejectedToday = [];
        this.currentSubmission = null;
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupPage());
            } else {
                this.setupPage();
            }
        } catch (error) {
            console.error('Failed to initialize admin approvals page:', error);
        }
    }

    async setupPage() {
        try {
            console.log('🚀 Setting up Admin Approvals Page...');
            
            // Wait for mock data to be available
            await this.waitForMockData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadPendingSubmissions();
            await this.updateStats();
            
            console.log('✅ Admin Approvals Page setup complete');
            
        } catch (error) {
            console.error('Failed to setup admin page:', error);
        }
    }

    async waitForMockData() {
        return new Promise((resolve) => {
            const checkData = () => {
                if (window.ideasMockData && window.ProjectsMockData) {
                    console.log('✅ Mock data available');
                    resolve();
                } else {
                    console.log('⏳ Waiting for mock data...');
                    setTimeout(checkData, 100);
                }
            };
            checkData();
        });
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') || 
                e.target.matches('[data-action="close-modal"]') || 
                e.target.closest('[data-action="close-modal"]')) {
                this.closeAllModals();
            }
        });

        // Handle Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Rejection form submission
        const rejectionForm = document.getElementById('rejectionForm');
        if (rejectionForm) {
            rejectionForm.addEventListener('submit', (e) => this.handleRejection(e));
        }

        // Event delegation for approval actions
        document.addEventListener('click', (e) => {
            // Handle approve buttons
            if (e.target.matches('[data-action="approve"]') || e.target.closest('[data-action="approve"]')) {
                const button = e.target.matches('[data-action="approve"]') ? e.target : e.target.closest('[data-action="approve"]');
                const submissionId = button.dataset.submissionId;
                const submissionType = button.dataset.submissionType;
                this.approveSubmission(submissionId, submissionType);
            }
            
            // Handle reject buttons
            if (e.target.matches('[data-action="reject"]') || e.target.closest('[data-action="reject"]')) {
                const button = e.target.matches('[data-action="reject"]') ? e.target : e.target.closest('[data-action="reject"]');
                const submissionId = button.dataset.submissionId;
                const submissionType = button.dataset.submissionType;
                this.showRejectionModal(submissionId, submissionType);
            }
            
            // Handle view details buttons
            if (e.target.matches('[data-action="view-details"]') || e.target.closest('[data-action="view-details"]')) {
                const button = e.target.matches('[data-action="view-details"]') ? e.target : e.target.closest('[data-action="view-details"]');
                const submissionId = button.dataset.submissionId;
                const submissionType = button.dataset.submissionType;
                this.viewSubmissionDetails(submissionId, submissionType);
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
            btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            btn.style.boxShadow = 'none';
        });

        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
            activeTabBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            activeTabBtn.style.color = 'white';
            activeTabBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            activeTabBtn.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)';
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });

        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.style.display = 'block';
            activeTab.classList.add('active');
        }

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'pending-ideas':
                this.renderPendingIdeas();
                break;
            case 'pending-projects':
                this.renderPendingProjects();
                break;
            case 'approved':
                this.renderApproved();
                break;
            case 'rejected':
                this.renderRejected();
                break;
        }
    }

    async loadPendingSubmissions() {
        try {
            console.log('📋 Loading pending submissions...');
            
            // Load pending ideas
            if (window.ideasMockData) {
                this.pendingIdeas = window.ideasMockData.getPendingIdeas();
                console.log('✅ Pending ideas loaded:', this.pendingIdeas.length);
            }
            
            // Load pending projects
            if (window.projectsManager) {
                this.pendingProjects = window.projectsManager.getPendingProjects();
            } else {
                // Fallback to mock data
                this.pendingProjects = window.pendingProjects || [];
            }
            console.log('✅ Pending projects loaded:', this.pendingProjects.length);
            
            // Load initial tab data
            this.renderPendingIdeas();
            
        } catch (error) {
            console.error('Failed to load pending submissions:', error);
        }
    }

    renderPendingIdeas() {
        const container = document.getElementById('pendingIdeasGrid');
        if (!container) return;

        if (this.pendingIdeas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div class="glass-card">
                        <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-check-circle" style="font-size: 2rem; color: #10b981;"></i>
                        </div>
                        <h3 style="color: white; margin-bottom: 1rem;">No Pending Ideas</h3>
                        <p style="color: rgba(255, 255, 255, 0.8);">All idea submissions have been reviewed. Great job!</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.pendingIdeas.map(idea => this.createApprovalCard(idea, 'idea')).join('');
    }

    renderPendingProjects() {
        const container = document.getElementById('pendingProjectsGrid');
        if (!container) return;

        if (this.pendingProjects.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div class="glass-card">
                        <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-check-circle" style="font-size: 2rem; color: #10b981;"></i>
                        </div>
                        <h3 style="color: white; margin-bottom: 1rem;">No Pending Projects</h3>
                        <p style="color: rgba(255, 255, 255, 0.8);">All project submissions have been reviewed. Great job!</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.pendingProjects.map(project => this.createApprovalCard(project, 'project')).join('');
    }

    createApprovalCard(submission, type) {
        const timeAgo = this.getTimeAgo(new Date(submission.submittedAt || submission.created_at));
        
        return `
            <div class="approval-card pending">
                <div class="approval-header">
                    <div style="flex: 1;">
                        <h3 class="approval-title">${submission.title}</h3>
                        <div class="approval-meta">
                            <span class="approval-badge pending">Pending Review</span>
                            <span class="approval-badge category">${submission.category}</span>
                            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                                <i class="fas fa-user"></i> ${submission.author?.name || submission.project_lead?.name || 'Unknown'}
                            </span>
                            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                                <i class="fas fa-clock"></i> ${timeAgo}
                            </span>
                        </div>
                    </div>
                </div>
                
                <p class="approval-description">${submission.description}</p>
                
                <div class="approval-details">
                    <div class="approval-detail">
                        <div class="approval-detail-label">Type</div>
                        <div class="approval-detail-value">${type === 'idea' ? 'Idea' : 'Project'}</div>
                    </div>
                    <div class="approval-detail">
                        <div class="approval-detail-label">Difficulty</div>
                        <div class="approval-detail-value">${submission.difficulty || submission.complexityLevel || 'Medium'}</div>
                    </div>
                    ${submission.expected_duration ? `
                        <div class="approval-detail">
                            <div class="approval-detail-label">Duration</div>
                            <div class="approval-detail-value">${submission.expected_duration}</div>
                        </div>
                    ` : ''}
                    ${submission.budget_estimate ? `
                        <div class="approval-detail">
                            <div class="approval-detail-label">Budget</div>
                            <div class="approval-detail-value">KSh ${submission.budget_estimate.toLocaleString()}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="approval-actions">
                    <button class="btn btn-outline btn-sm" data-action="view-details" data-submission-id="${submission.id}" data-submission-type="${type}">
                        <i class="fas fa-eye"></i>View Details
                    </button>
                    <button class="btn btn-danger btn-sm" data-action="reject" data-submission-id="${submission.id}" data-submission-type="${type}">
                        <i class="fas fa-times"></i>Reject
                    </button>
                    <button class="btn btn-primary btn-sm" data-action="approve" data-submission-id="${submission.id}" data-submission-type="${type}">
                        <i class="fas fa-check"></i>Approve
                    </button>
                </div>
            </div>
        `;
    }

    approveSubmission(submissionId, submissionType) {
        const submission = this.findSubmission(submissionId, submissionType);
        if (!submission) {
            alert('Submission not found');
            return;
        }

        if (confirm(`Are you sure you want to approve "${submission.title}"?`)) {
            // Update submission status
            submission.status = 'approved';
            submission.submissionStatus = 'approved';
            submission.approvedAt = new Date().toISOString();
            submission.approvedBy = 'admin_user';

            // Move to approved list
            this.approvedToday.push({
                ...submission,
                type: submissionType,
                approvedAt: new Date().toISOString()
            });

            // Remove from pending
            if (submissionType === 'idea') {
                this.pendingIdeas = this.pendingIdeas.filter(item => item.id !== submissionId);
            } else {
                this.pendingProjects = this.pendingProjects.filter(item => item.id !== submissionId);
            }

            // Update UI
            this.updateStats();
            this.loadTabData(this.currentTab);

            // Show success message
            this.showSuccessMessage(`${submissionType === 'idea' ? 'Idea' : 'Project'} "${submission.title}" has been approved and published!`);

            // In a real app, this would make an API call to update the database
            console.log('✅ Approved submission:', submission);
            
            // Simulate notification to submitter
            console.log('📧 Approval notification sent to:', submission.author?.name || submission.project_lead?.name);
        }
    }

    showRejectionModal(submissionId, submissionType) {
        this.currentSubmission = { id: submissionId, type: submissionType };
        
        const modal = document.getElementById('rejectionModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    handleRejection(e) {
        e.preventDefault();
        
        if (!this.currentSubmission) return;
        
        const formData = new FormData(e.target);
        const rejectionData = {
            reason: formData.get('rejectionReason'),
            comments: formData.get('rejectionComments')
        };

        const submission = this.findSubmission(this.currentSubmission.id, this.currentSubmission.type);
        if (!submission) {
            alert('Submission not found');
            return;
        }

        // Update submission status
        submission.status = 'rejected';
        submission.submissionStatus = 'rejected';
        submission.rejectedAt = new Date().toISOString();
        submission.rejectedBy = 'admin_user';
        submission.rejectionReason = rejectionData.reason;
        submission.rejectionComments = rejectionData.comments;

        // Move to rejected list
        this.rejectedToday.push({
            ...submission,
            type: this.currentSubmission.type,
            rejectedAt: new Date().toISOString()
        });

        // Remove from pending
        if (this.currentSubmission.type === 'idea') {
            this.pendingIdeas = this.pendingIdeas.filter(item => item.id !== this.currentSubmission.id);
        } else {
            this.pendingProjects = this.pendingProjects.filter(item => item.id !== this.currentSubmission.id);
        }

        // Close modal and reset form
        this.closeAllModals();
        e.target.reset();

        // Update UI
        this.updateStats();
        this.loadTabData(this.currentTab);

        // Show success message
        this.showSuccessMessage(`${this.currentSubmission.type === 'idea' ? 'Idea' : 'Project'} "${submission.title}" has been rejected.`);

        // In a real app, this would make an API call to update the database
        console.log('❌ Rejected submission:', submission);
        
        // Simulate notification to submitter
        console.log('📧 Rejection notification sent to:', submission.author?.name || submission.project_lead?.name);

        this.currentSubmission = null;
    }

    findSubmission(submissionId, submissionType) {
        if (submissionType === 'idea') {
            return this.pendingIdeas.find(item => item.id === submissionId);
        } else {
            return this.pendingProjects.find(item => item.id === submissionId);
        }
    }

    viewSubmissionDetails(submissionId, submissionType) {
        const submission = this.findSubmission(submissionId, submissionType);
        if (!submission) {
            alert('Submission not found');
            return;
        }

        // Show detailed modal (implementation would be similar to project/idea detail modals)
        alert(`Viewing details for: ${submission.title}\n\nFull implementation would show a detailed modal with all submission information.`);
    }

    renderApproved() {
        const container = document.getElementById('approvedGrid');
        if (!container) return;

        if (this.approvedToday.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <div class="glass-card">
                        <div style="width: 80px; height: 80px; background: rgba(107, 114, 128, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-calendar-day" style="font-size: 2rem; color: #6b7280;"></i>
                        </div>
                        <h3 style="color: white; margin-bottom: 1rem;">No Approvals Today</h3>
                        <p style="color: rgba(255, 255, 255, 0.8);">No submissions have been approved today yet.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.approvedToday.map(item => this.createHistoryCard(item, 'approved')).join('');
    }

    renderRejected() {
        const container = document.getElementById('rejectedGrid');
        if (!container) return;

        if (this.rejectedToday.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <div class="glass-card">
                        <div style="width: 80px; height: 80px; background: rgba(107, 114, 128, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-calendar-day" style="font-size: 2rem; color: #6b7280;"></i>
                        </div>
                        <h3 style="color: white; margin-bottom: 1rem;">No Rejections Today</h3>
                        <p style="color: rgba(255, 255, 255, 0.8);">No submissions have been rejected today.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.rejectedToday.map(item => this.createHistoryCard(item, 'rejected')).join('');
    }

    createHistoryCard(item, status) {
        const timeAgo = this.getTimeAgo(new Date(item.approvedAt || item.rejectedAt));
        
        return `
            <div class="approval-card ${status}">
                <div class="approval-header">
                    <div style="flex: 1;">
                        <h3 class="approval-title">${item.title}</h3>
                        <div class="approval-meta">
                            <span class="approval-badge ${status}">${status === 'approved' ? 'Approved' : 'Rejected'}</span>
                            <span class="approval-badge category">${item.category}</span>
                            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                                <i class="fas fa-clock"></i> ${timeAgo}
                            </span>
                        </div>
                    </div>
                </div>
                
                <p class="approval-description">${item.description}</p>
                
                ${status === 'rejected' && item.rejectionReason ? `
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                        <div style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">Rejection Reason:</div>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${item.rejectionReason}</div>
                        ${item.rejectionComments ? `
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-top: 0.5rem;">${item.rejectionComments}</div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    updateStats() {
        const pendingIdeasEl = document.getElementById('pendingIdeasCount');
        const pendingProjectsEl = document.getElementById('pendingProjectsCount');
        const approvedTodayEl = document.getElementById('approvedTodayCount');
        const rejectedTodayEl = document.getElementById('rejectedTodayCount');

        if (pendingIdeasEl) {
            this.animateNumber(pendingIdeasEl, this.pendingIdeas.length);
        }
        if (pendingProjectsEl) {
            this.animateNumber(pendingProjectsEl, this.pendingProjects.length);
        }
        if (approvedTodayEl) {
            this.animateNumber(approvedTodayEl, this.approvedToday.length);
        }
        if (rejectedTodayEl) {
            this.animateNumber(rejectedTodayEl, this.rejectedToday.length);
        }
    }

    animateNumber(element, targetNumber) {
        const duration = 1000;
        const start = parseInt(element.textContent) || 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (targetNumber - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showSuccessMessage(message) {
        // Create a temporary success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 10000;
            font-weight: 600;
            max-width: 400px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Admin Approvals Page...');
    window.adminApprovalsManager = new AdminApprovalsManager();
});