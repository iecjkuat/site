/**
 * Communication Management Module
 * Handles bulk messaging, templates, scheduled messages, and communication analytics
 */

// Import security utilities (Instagram-style pattern)
if (typeof SecurityUtils === 'undefined') {
    const script = document.createElement('script');
    script.src = '/shared/utils/security.js';
    document.head.appendChild(script);
}

class CommunicationManagement extends BaseManagement {
    constructor(adminDashboard) {
        super(adminDashboard);
    }

    /* ================= COMMUNICATION VIEW SWITCHER ================= */

    async showCommunicationView(view = 'analytics') {
        console.log(`💬 Switching to communication view: ${view}`);

        // Update admin dashboard state
        if (this.admin) {
            this.admin.currentView = view;
            this.admin.updateURL('communication', view);
        }

        // Update sub-navigation UI
        this.updateCommunicationNavUI(view);

        const container = this.getContainer("communicationAnalytics");
        if (!container) return;

        container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-info"></div><p>Loading...</p></div>';

        try {
            switch (view) {
                case 'analytics':
                    await this.renderCommunicationAnalytics();
                    break;
                case 'list':
                    await this.renderCommunicationList();
                    break;
                case 'scheduled':
                    await this.renderScheduledMessages();
                    break;
                case 'templates':
                    await this.renderMessageTemplates();
                    break;
                default:
                    await this.renderCommunicationAnalytics();
            }
        } catch (error) {
            console.error(`Error loading communication ${view}:`, error);
            // SECURITY FIX: Use safe error display (Instagram-style pattern)
            if (typeof SecurityUtils !== 'undefined') {
                SecurityUtils.showError(container, error.message, `Error loading ${view}`);
            } else {
                container.innerHTML = `<div class="alert alert-danger">Error loading ${view}</div>`;
            }
        }
    }

    updateCommunicationNavUI(view) {
        const viewToBtn = {
            'analytics': 'commAnalyticsViewBtn',
            'list': 'messagesViewBtn',
            'scheduled': 'scheduledMessagesViewBtn',
            'templates': 'templatesViewBtn'
        };

        // Remove active class from all comm buttons
        Object.values(viewToBtn).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove('active');
        });

        // Add active class to current view button
        const activeBtnId = viewToBtn[view];
        if (activeBtnId) {
            const btn = document.getElementById(activeBtnId);
            if (btn) btn.classList.add('active');
        }
    }

    /* ================= COMMUNICATION ANALYTICS ================= */

    async renderCommunicationAnalytics() {
        const container = this.getContainer("communicationAnalytics");
        if (!container) return;

        // Mock data for analytics
        container.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <h5><i class="fas fa-chart-bar me-2"></i>Communication Analytics</h5>
                    <div class="alert alert-info-glass border-0">
                        <i class="fas fa-info-circle me-2"></i>Detailed communication charts are coming soon.
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="glass-card p-4 h-100">
                        <h6>Message Distribution</h6>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Email</span>
                            <span class="badge bg-primary">65%</span>
                        </div>
                        <div class="progress mb-3" style="height: 10px;">
                            <div class="progress-bar bg-primary" style="width: 65%"></div>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>SMS</span>
                            <span class="badge bg-success">20%</span>
                        </div>
                        <div class="progress mb-3" style="height: 10px;">
                            <div class="progress-bar bg-success" style="width: 20%"></div>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Push Notifications</span>
                            <span class="badge bg-info">15%</span>
                        </div>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar bg-info" style="width: 15%"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="glass-card p-4 h-100">
                        <h6>Engagement Rate</h6>
                        <div class="text-center py-4">
                            <h2 class="display-4 font-weight-bold text-success">78%</h2>
                            <p class="text-muted">Average open rate</p>
                        </div>
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="text-primary">
                                    <h5>92%</h5>
                                    <small>Email</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-success">
                                    <h5>85%</h5>
                                    <small>SMS</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-info">
                                    <h5>67%</h5>
                                    <small>Push</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= MESSAGE LIST ================= */

    async renderCommunicationList() {
        const container = this.getContainer("communicationAnalytics");
        if (!container) return;

        // Mock message data
        const messages = [
            { id: 1, subject: "Welcome to Innovation Club", type: "email", recipients: 45, sent_at: "2025-01-15T10:00:00", status: "sent" },
            { id: 2, subject: "Event Reminder: AI Workshop", type: "notification", recipients: 120, sent_at: "2025-01-14T14:30:00", status: "sent" },
            { id: 3, subject: "Monthly Newsletter", type: "email", recipients: 200, sent_at: "2025-01-13T09:00:00", status: "sent" },
            { id: 4, subject: "Payment Due Reminder", type: "sms", recipients: 25, sent_at: "2025-01-12T16:00:00", status: "sent" }
        ];

        const rows = messages.map(msg => `
            <tr>
                <td>
                    <div class="fw-bold">${sanitizeHTML(msg.subject)}</div>
                    <small class="text-muted">
                        <i class="fas fa-${msg.type === 'email' ? 'envelope' : msg.type === 'sms' ? 'sms' : 'bell'} me-1"></i>
                        ${msg.type.toUpperCase()}
                    </small>
                </td>
                <td>${msg.recipients}</td>
                <td>${new Date(msg.sent_at).toLocaleDateString()}</td>
                <td>
                    <span class="badge bg-success">${sanitizeHTML(msg.status)}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.adminDashboard.communicationManagement.viewMessageDetails('${msg.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="window.adminDashboard.communicationManagement.duplicateMessage('${msg.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-list me-2"></i>Message History</h4>
                <button class="btn btn-success btn-sm" onclick="window.adminDashboard.communicationManagement.showComposeModal()">
                    <i class="fas fa-plus me-1"></i>Compose Message
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Subject / Type</th>
                            <th>Recipients</th>
                            <th>Sent Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.length ? rows : '<tr><td colspan="5" class="text-center py-4">No messages found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    /* ================= SCHEDULED MESSAGES ================= */

    async renderScheduledMessages() {
        const container = this.getContainer("communicationAnalytics");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-clock me-2"></i>Scheduled Messages</h4>
                <button class="btn btn-success btn-sm" onclick="window.adminDashboard.communicationManagement.scheduleMessage()">
                    <i class="fas fa-calendar-plus me-1"></i>Schedule Message
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">Event Reminder: Tech Talk</h5>
                                <span class="badge bg-warning">Scheduled</span>
                            </div>
                            <p class="card-text text-muted">Reminder for upcoming tech talk on AI</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>Jan 20, 2026 at 9:00 AM<br>
                                    <i class="fas fa-users me-1"></i>150 recipients
                                </small>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary">Edit</button>
                                    <button class="btn btn-outline-danger">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">Monthly Newsletter</h5>
                                <span class="badge bg-info">Recurring</span>
                            </div>
                            <p class="card-text text-muted">Monthly club newsletter with updates</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>Every 1st of month<br>
                                    <i class="fas fa-users me-1"></i>All members
                                </small>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary">Edit</button>
                                    <button class="btn btn-outline-secondary">Pause</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= MESSAGE TEMPLATES ================= */

    async renderMessageTemplates() {
        const container = this.getContainer("communicationAnalytics");
        if (!container) return;

        const templates = [
            { id: 1, name: "Welcome Message", type: "email", usage: 45, created: "2025-01-10" },
            { id: 2, name: "Event Reminder", type: "notification", usage: 120, created: "2025-01-08" },
            { id: 3, name: "Payment Reminder", type: "sms", usage: 25, created: "2025-01-05" },
            { id: 4, name: "Meeting Invitation", type: "email", usage: 80, created: "2025-01-03" }
        ];

        const cards = templates.map(template => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 template-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title">${template.name}</h5>
                            <span class="badge bg-secondary">${template.type}</span>
                        </div>
                        <div class="template-stats mb-3">
                            <small class="text-muted">
                                <i class="fas fa-chart-bar me-1"></i>Used ${template.usage} times<br>
                                <i class="fas fa-calendar me-1"></i>Created: ${new Date(template.created).toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="btn-group w-100">
                            <button class="btn btn-outline-primary btn-sm" onclick="window.adminDashboard.communicationManagement.useTemplate('${template.id}')">
                                <i class="fas fa-paper-plane me-1"></i>Use
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="window.adminDashboard.communicationManagement.editTemplate('${template.id}')">
                                <i class="fas fa-edit me-1"></i>Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-copy me-2"></i>Message Templates</h4>
                <button class="btn btn-success btn-sm" onclick="window.adminDashboard.communicationManagement.showTemplateModal()">
                    <i class="fas fa-plus me-1"></i>Create Template
                </button>
            </div>
            
            <div class="row">
                ${cards}
            </div>
        `;
    }

    /* ================= MODAL METHODS ================= */

    showTemplateModal() {
        const modalId = 'templateModal';
        let modalEl = document.getElementById(modalId);

        if (!modalEl) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content glass-card border-0">
                            <div class="modal-header border-bottom-0">
                                <h5 class="modal-title">Create Message Template</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="templateForm">
                                    <div class="mb-3">
                                        <label class="form-label">Template Name</label>
                                        <input type="text" class="form-control" name="name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Subject</label>
                                        <input type="text" class="form-control" name="subject" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Content</label>
                                        <textarea class="form-control" name="content" rows="5" required></textarea>
                                        <div class="form-text">Use {{name}} variable for dynamic personalization</div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer border-top-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="window.adminDashboard.communicationManagement.saveTemplate()">
                                    <i class="fas fa-save me-1"></i> Save Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            modalEl = document.getElementById(modalId);
        }

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }

    async saveTemplate() {
        // Mock save for now
        this.admin.showToast('Template saved successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('templateModal')).hide();
    }

    showComposeModal() {
        const modalId = 'composeMessageModal';
        let modalEl = document.getElementById(modalId);

        if (!modalEl) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content glass-card border-0">
                            <div class="modal-header border-bottom-0">
                                <h5 class="modal-title">Compose Bulk Message</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="composeMessageForm">
                                    <div class="mb-3">
                                        <label class="form-label">Recipients</label>
                                        <select class="form-select" name="recipients">
                                            <option value="all">All Users</option>
                                            <option value="members">Active Members</option>
                                            <option value="executives">Executives</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Message Type</label>
                                        <select class="form-select" name="type">
                                            <option value="email">Email</option>
                                            <option value="notification">Push Notification</option>
                                            <option value="sms">SMS</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Subject</label>
                                        <input type="text" class="form-control" name="subject" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Message Content</label>
                                        <textarea class="form-control" name="message" rows="5" required></textarea>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer border-top-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="window.adminDashboard.communicationManagement.sendBulkMessage()">
                                    <i class="fas fa-paper-plane me-1"></i> Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            modalEl = document.getElementById(modalId);
        }

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }

    async sendBulkMessage() {
        const form = document.querySelector('#composeMessageForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const btn = document.querySelector('#composeMessageModal .btn-primary');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Sending...';
        btn.disabled = true;

        try {
            await this.fetchWithAuth('/api/admin/messages/bulk', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            this.admin.showToast('Message sent successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('composeMessageModal')).hide();
            form.reset();
        } catch (error) {
            this.admin.showToast(error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    /* ================= TEMPLATE ACTIONS ================= */

    useTemplate(id) {
        this.admin.showToast(`Using template ${id}...`, 'info');
        this.showComposeModal();
    }

    editTemplate(id) {
        this.admin.showToast(`Editing template ${id}...`, 'info');
        this.showTemplateModal();
    }

    viewMessageDetails(id) {
        this.admin.showToast(`Viewing message ${id} details...`, 'info');
    }

    duplicateMessage(id) {
        this.admin.showToast(`Duplicating message ${id}...`, 'info');
        this.showComposeModal();
    }

    scheduleMessage() {
        this.admin.showToast('Message scheduling feature coming soon', 'info');
    }

    /* ================= EXPORT METHODS ================= */

    async exportMessages() {
        await this.exportData('messages');
    }

    /* ================= FILTER METHODS ================= */

    applyMessageFilter(filterId, value) {
        console.log(`Applying message filter ${filterId}:`, value);
        // Implement message filtering logic here
        this.admin.showToast(`Message filter ${filterId} applied: ${value}`, 'info');
    }

    /* ================= UPDATE HANDLERS ================= */

    handleMessageUpdate(data) {
        console.log('💬 Handling message update in communication management:', data);
        // Refresh message data if needed
        if (this.admin.currentSection === 'communication') {
            this.renderCommunicationList();
        }
    }
}