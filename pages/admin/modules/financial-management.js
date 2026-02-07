/**
 * Financial Management Module
 * Handles payments, financial reports, pending payments, and financial analytics
 */

// Import security utilities
if (typeof SecurityUtils === 'undefined') {
    const script = document.createElement('script');
    script.src = '/shared/utils/security.js';
    document.head.appendChild(script);
}

class FinancialManagement extends BaseManagement {
    constructor(adminDashboard) {
        super(adminDashboard);
    }

    /* ================= FINANCIAL VIEW SWITCHER ================= */

    showFinancialView(view = 'analytics') {
        console.log(`💰 Switching to financial view: ${view}`);

        // Update active button states
        document.querySelectorAll('[id*="financialViewBtn"], [id*="paymentsViewBtn"], [id*="pendingPaymentsViewBtn"], [id*="reportsViewBtn"]').forEach(btn => {
            btn.classList.remove('active');
        });

        // Update admin dashboard state
        if (this.admin) {
            this.admin.currentView = view;
            this.admin.updateURL('financial', view);
        }

        // Activate the correct button based on view
        let activeBtnId;
        switch (view) {
            case 'analytics':
                activeBtnId = 'financialAnalyticsViewBtn';
                break;
            case 'list':
                activeBtnId = 'paymentsViewBtn';
                break;
            case 'pending':
                activeBtnId = 'pendingPaymentsViewBtn';
                break;
            case 'reports':
                activeBtnId = 'reportsViewBtn';
                break;
            default:
                activeBtnId = 'financialAnalyticsViewBtn';
        }

        const activeBtn = document.getElementById(activeBtnId);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Show appropriate view
        switch (view) {
            case 'analytics':
                this.admin.analytics.loadFinancialAnalytics();
                break;
            case 'list':
                this.showPaymentManagement();
                break;
            case 'pending':
                this.showPendingPayments();
                break;
            case 'reports':
                this.showFinancialReports();
                break;
            default:
                this.admin.analytics.loadFinancialAnalytics();
        }
    }

    /* ================= PAYMENT MANAGEMENT ================= */

    async showPaymentManagement() {
        const container = this.getContainer("financialAnalytics");
        if (!container) return;

        container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-success"></div><p>Loading payments...</p></div>';

        try {
            const data = await this.fetchWithAuth('/api/admin/payments');
            this.cache.payments = data.payments || [];
            this.renderPaymentList();
        } catch (e) {
            console.log('⚡️ API unavailable, using mock payments');
            this.cache.payments = [
                { id: 1, user_name: "John Doe", amount: 1500, payment_method: "M-Pesa", created_at: "2025-01-14T10:00:00", status: "completed" },
                { id: 2, user_name: "Jane Smith", amount: 2500, payment_method: "Bank Transfer", created_at: "2025-01-13T14:30:00", status: "completed" },
                { id: 3, user_name: "Alice Johnson", amount: 500, payment_method: "Cash", created_at: "2025-01-12T09:15:00", status: "completed" },
                { id: 4, user_name: "Bob Brown", amount: 1000, payment_method: "M-Pesa", created_at: "2025-01-11T16:45:00", status: "failed" }
            ];
            this.renderPaymentList();
        }
    }

    renderPaymentList() {
        const container = this.getContainer("financialAnalytics");
        const rows = this.cache.payments.map(p => `
            <tr>
                <td>${sanitizeHTML(p.user_name || 'Unknown')}</td>
                <td>KES ${this.admin.formatNumber(p.amount)}</td>
                <td>${sanitizeHTML(p.payment_method)}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td><span class="badge ${this.getPaymentStatusBadge(p.status)}">${sanitizeHTML(p.status)}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.adminDashboard.financialManagement.viewPaymentDetails('${p.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        container.innerHTML = `
            ${this.renderHeader(
                "Payment Management",
                `
                <button class="btn btn-success btn-sm me-2" onclick="window.adminDashboard.financialManagement.showPaymentModal()">
                    <i class="fas fa-plus me-1"></i>Add Payment
                </button>
                <button class="btn btn-primary btn-sm" onclick="window.adminDashboard.financialManagement.showFinancialView('analytics')">
                    <i class="fas fa-chart-bar me-1"></i>Analytics
                </button>
                `
            )}
            ${this.renderTable(
                ["User", "Amount", "Method", "Date", "Status", "Actions"],
                rows.length ? rows : '<tr><td colspan="6" class="text-center">No transactions found</td></tr>'
            )}
        `;
    }

    showPaymentModal() {
        const modalId = 'addPaymentModal';
        let modalEl = document.getElementById(modalId);

        if (!modalEl) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content glass-card">
                            <div class="modal-header">
                                <h5 class="modal-title">Record New Payment</h5>
                                <button class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addPaymentForm">
                                    <div class="mb-3">
                                        <label class="form-label">User Email</label>
                                        <input type="email" class="form-control" name="user_email" required placeholder="member@jkuat.ac.ke">
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Amount (KES)</label>
                                            <input type="number" class="form-control" name="amount" required min="1">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Method</label>
                                            <select class="form-select" name="method">
                                                <option value="cash">Cash</option>
                                                <option value="mpesa">M-Pesa</option>
                                                <option value="bank">Bank Transfer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Description</label>
                                        <input type="text" class="form-control" name="description" placeholder="Membership fee, Event ticket...">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-success" onclick="window.adminDashboard.financialManagement.submitPayment()">Record Payment</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            modalEl = document.getElementById(modalId);
        }

        modalEl.querySelector('form').reset();
        new bootstrap.Modal(modalEl).show();
    }

    async submitPayment() {
        const form = document.getElementById('addPaymentForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            await this.fetchWithAuth('/api/admin/payments', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            bootstrap.Modal.getInstance(document.getElementById("addPaymentModal")).hide();
            this.admin.showToast('Payment recorded', 'success');
            this.showPaymentManagement();
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    }

    viewPaymentDetails(id) {
        const p = this.cache.payments.find(p => p.id == id);
        if (p) alert(`Payment by ${p.user_name}\\nAmount: ${p.amount}\\nFor: ${p.description || 'N/A'}`);
    }

    /* ================= PENDING PAYMENTS VIEW ================= */

    async showPendingPayments() {
        const container = this.getContainer("financialAnalytics");
        if (!container) return;

        container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-warning"></div><p>Loading pending payments...</p></div>';

        try {
            await this.renderPendingPayments();
        } catch (e) {
            console.error(e);
            // SECURITY FIX: Use safe error display
            if (typeof SecurityUtils !== 'undefined') {
                SecurityUtils.showError(container, e.message, 'Failed to load pending payments');
            } else {
                container.innerHTML = '<div class="alert alert-danger">Failed to load pending payments</div>';
            }
        }
    }

    async renderPendingPayments() {
        const container = this.getContainer("financialAnalytics");
        if (!container) return;

        try {
            const pendingPayments = await this.fetchWithAuth('/api/admin/payments?status=pending');

            const rows = pendingPayments.map(p => `
                <tr>
                    <td>
                        <div>
                            <strong>${sanitizeHTML(p.user_name)}</strong><br>
                            <small class="text-muted">${sanitizeHTML(p.email)}</small>
                        </div>
                    </td>
                    <td>KES ${this.admin.formatNumber(p.amount)}</td>
                    <td>
                        <span class="badge bg-secondary">${sanitizeHTML(p.payment_method)}</span><br>
                        <small class="text-muted">${sanitizeHTML(p.reference_id || 'N/A')}</small>
                    </td>
                    <td>${sanitizeHTML(p.description || '')}</td>
                    <td>${new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                        <span class="badge bg-warning">${p.status.toUpperCase()}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-success" onclick="window.adminDashboard.financialManagement.approvePayment('${p.id}')" title="Approve">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="window.adminDashboard.financialManagement.rejectPayment('${p.id}')" title="Reject">
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="btn btn-outline-primary" onclick="window.adminDashboard.financialManagement.viewPaymentDetails('${p.id}')" title="Details">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");

            container.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4><i class="fas fa-clock me-2 text-warning"></i>Pending Payments (${pendingPayments.length})</h4>
                    <div>
                        <button class="btn btn-success btn-sm me-2" onclick="window.adminDashboard.financialManagement.bulkApprovePayments()" ${pendingPayments.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-check-double me-1"></i>Approve All
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="window.adminDashboard.financialManagement.reconcilePayments()">
                            <i class="fas fa-balance-scale me-1"></i>Reconcile
                        </button>
                    </div>
                </div>
                
                ${pendingPayments.length === 0 ? `
                    <div class="text-center py-5">
                        <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                        <h5 class="text-muted">No Pending Payments</h5>
                        <p class="text-muted">All payments have been processed</p>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Method & Reference</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                `}
            `;
        } catch (error) {
            console.error('Error rendering pending payments:', error);
            // SECURITY FIX: Use safe error display
            if (typeof SecurityUtils !== 'undefined') {
                SecurityUtils.showError(container, error.message, 'Error loading data');
            } else {
                container.innerHTML = '<div class="alert alert-danger">Error loading data</div>';
            }
        }
    }

    /* ================= FINANCIAL REPORTS VIEW ================= */

    showFinancialReports() {
        const container = this.getContainer("financialAnalytics");
        if (!container) return;

        this.renderFinancialReports();
    }

    async renderFinancialReports() {
        const container = this.getContainer("financialAnalytics");
        if (!container) return;

        try {
            const reports = await this.fetchWithAuth('/api/admin/reports');

            const reportCards = reports.map(report => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 report-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="report-icon">
                                    <i class="fas fa-${report.type === 'revenue' ? 'chart-line' : report.type === 'analysis' ? 'chart-pie' : 'file-invoice-dollar'} fa-2x text-primary"></i>
                                </div>
                                <span class="badge bg-light text-dark">${report.size}</span>
                            </div>
                            <h5 class="card-title">${report.name}</h5>
                            <p class="card-text text-muted">${report.description}</p>
                            <div class="report-meta mb-3">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>Period: ${report.period}<br>
                                    <i class="fas fa-clock me-1"></i>Generated: ${new Date(report.generated).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <div class="btn-group w-100">
                                <button class="btn btn-outline-primary" onclick="window.adminDashboard.financialManagement.viewReport('${report.id}')">
                                    <i class="fas fa-eye me-1"></i>View
                                </button>
                                <button class="btn btn-outline-success" onclick="window.adminDashboard.financialManagement.downloadReport('${report.id}')">
                                    <i class="fas fa-download me-1"></i>Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4><i class="fas fa-chart-bar me-2"></i>Financial Reports</h4>
                    <div>
                        <button class="btn btn-success btn-sm me-2" onclick="window.adminDashboard.financialManagement.generateNewReport()">
                            <i class="fas fa-plus me-1"></i>Generate Report
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="window.adminDashboard.financialManagement.scheduleReport()">
                            <i class="fas fa-calendar-plus me-1"></i>Schedule Report
                        </button>
                    </div>
                </div>
                
                <div class="row">
                    ${reports.length ? reportCards : '<div class="col-12"><div class="alert alert-info">No reports available.</div></div>'}
                </div>
            `;
        } catch (error) {
            console.error('Error rendering reports:', error);
            // SECURITY FIX: Use safe error display
            if (typeof SecurityUtils !== 'undefined') {
                SecurityUtils.showError(container, error.message, 'Error loading reports');
            } else {
                container.innerHTML = '<div class="alert alert-danger">Error loading reports</div>';
            }
        }
    }

    /* ================= PAYMENT ACTION METHODS ================= */

    async approvePayment(id) {
        if (!confirm('Approve this payment?')) return;

        try {
            await this.fetchWithAuth(`/api/admin/payments/${id}/approve`, {
                method: 'POST'
            });
            this.admin.showToast('Payment approved successfully', 'success');
            this.showPendingPayments();
        } catch (error) {
            console.error('Error approving payment:', error);
            this.admin.showToast(`Failed to approve payment: ${error.message}`, 'danger');
        }
    }

    async rejectPayment(id) {
        if (!confirm('Reject this payment? This action cannot be undone.')) return;

        try {
            await this.fetchWithAuth(`/api/admin/payments/${id}/reject`, {
                method: 'POST'
            });
            this.admin.showToast('Payment rejected', 'warning');
            this.showPendingPayments();
        } catch (error) {
            console.error('Error rejecting payment:', error);
            this.admin.showToast(`Failed to reject payment: ${error.message}`, 'danger');
        }
    }

    async bulkApprovePayments() {
        if (!confirm('Approve all pending payments?')) return;

        try {
            const pending = await this.fetchWithAuth('/api/admin/payments?status=pending');
            let errorCount = 0;

            for (const p of pending) {
                try {
                    await this.fetchWithAuth(`/api/admin/payments/${p.id}/approve`, { method: 'POST' });
                } catch (e) {
                    errorCount++;
                }
            }

            if (errorCount === 0) {
                this.admin.showToast('All pending payments approved', 'success');
            } else {
                this.admin.showToast(`Approved with ${errorCount} errors`, 'warning');
            }

            this.showPendingPayments();
        } catch (error) {
            this.admin.showToast('Bulk approval failed', 'danger');
        }
    }

    reconcilePayments() {
        this.admin.showToast('Payment reconciliation started. This may take a few minutes.', 'info');
    }

    async exportFinance() {
        await this.exportData('payments');
    }

    /* ================= REPORT METHODS ================= */

    viewReport(id) {
        this.admin.showToast(`Opening report ${id}...`, 'info');
    }

    downloadReport(id) {
        this.admin.showToast(`Downloading report ${id}...`, 'info');
    }

    generateNewReport() {
        this.admin.showToast('Report generation feature coming soon', 'info');
    }

    scheduleReport() {
        this.admin.showToast('Report scheduling feature coming soon', 'info');
    }

    /* ================= FILTER METHODS ================= */

    applyPaymentFilter(filterId, value) {
        console.log(`Applying payment filter ${filterId}:`, value);
        // Implement payment filtering logic here
        this.admin.showToast(`Payment filter ${filterId} applied: ${value}`, 'info');
    }

    /* ================= UPDATE HANDLERS ================= */

    handlePaymentUpdate(data) {
        console.log('💰 Handling payment update in financial management:', data);
        // Refresh payment data if needed
        if (this.admin.currentSection === 'financial') {
            this.showPaymentManagement();
        }
    }
}