/**
 * Legacy Management Module
 * Contains remaining functionality that hasn't been extracted to specialized modules
 * This will be gradually phased out as more functionality is moved to specialized modules
 */

class AdminManagement {
    constructor(adminDashboard) {
        this.admin = adminDashboard;

        // Cache loaded data
        this.cache = {
            events: [],
            ideas: [],
            payments: [],
            messages: []
        };
    }

    /* ================= UTILITIES ================= */

    getContainer(id) {
        return document.getElementById(id);
    }

    badge(status, map) {
        return map[status] || "secondary";
    }

    renderHeader(title, actions = "") {
        return `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">${title}</h4>
                <div>${actions}</div>
            </div>
        `;
    }

    renderTable(headers, rows) {
        return `
            <div class="card glass-card border-0">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table align-middle table-hover">
                            <thead class="table-light">
                                <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    async fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const res = await fetch(url, { ...options, headers });
        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `Error ${res.status}`);
        }
        return res.json();
    }

    /* ================= EXPORT METHODS ================= */

    async exportData(type) {
        console.log(`📊 Exporting data: ${type}`);
        this.admin.showToast(`Preparing ${type} export...`, 'info');

        try {
            const token = localStorage.getItem('authToken');
            // Map types to endpoints if different
            const endpointMap = {
                'users': '/api/admin/users/export',
                'events': '/api/admin/events/export',
                'payments': '/api/admin/finance/export',
                'ideas': '/api/admin/ideas/export'
            };

            const url = endpointMap[type] || `/api/admin/${type}/export`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Export failed with status ${response.status}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            this.admin.showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.admin.showToast(`Failed to export ${type} data: ${error.message}`, 'error');
        }
    }

    async exportSelectedData() {
        const types = [
            { id: 'exportUsers', type: 'users' },
            { id: 'exportEvents', type: 'events' },
            { id: 'exportPayments', type: 'payments' },
            { id: 'exportIdeas', type: 'ideas' }
        ];

        let selectedAny = false;

        for (const item of types) {
            const checkbox = document.getElementById(item.id);
            if (checkbox && checkbox.checked) {
                selectedAny = true;
                await this.exportData(item.type);
            }
        }

        if (!selectedAny) {
            this.admin.showToast('Please select at least one data type to export', 'warning');
        }
    }

    async exportAllData() {
        if (!confirm('Export all data categories? This will trigger multiple downloads.')) return;

        const types = ['users', 'events', 'payments', 'ideas'];
        for (const type of types) {
            await this.exportData(type);
        }
    }

    async exportSpecificData(type) {
        // Map specific report types to general data types
        const typeMap = {
            'user-activity': 'users',
            'demographics': 'users',
            'attendance': 'events',
            'event-performance': 'events',
            'revenue': 'payments',
            'innovation-metrics': 'ideas',
            'challenge-results': 'ideas'
        };

        const dataType = typeMap[type] || type;
        await this.exportData(dataType);
    }

    /* ================= LEGACY METHODS (TO BE MOVED) ================= */

    // These methods are kept for backward compatibility
    // They will be gradually moved to appropriate specialized modules

    showSettingsModal() {
        this.admin.showToast('Settings modal coming soon', 'info');
    }

    generateReport(type) {
        this.admin.showToast(`Generating ${type} report...`, 'info');
    }

    downloadReport(reportId) {
        this.admin.showToast(`Downloading report ${reportId}...`, 'info');
    }

    showExportModal() {
        this.admin.showToast('Export modal coming soon', 'info');
    }

    /* ================= FILTER METHODS ================= */

    applyEventFilter(filterId, value) {
        console.log(`Applying event filter ${filterId}:`, value);
        // Delegate to event management module
        if (this.admin.eventManagement) {
            // Event management module should handle this
        }
    }

    applyPaymentFilter(filterId, value) {
        console.log(`Applying payment filter ${filterId}:`, value);
        // Delegate to financial management module
        if (this.admin.financialManagement) {
            // Financial management module should handle this
        }
    }

    applyIdeaFilter(filterId, value) {
        console.log(`Applying idea filter ${filterId}:`, value);
        // Delegate to ideas management module
        if (this.admin.ideasManagement) {
            // Ideas management module should handle this
        }
    }

    applyMessageFilter(filterId, value) {
        console.log(`Applying message filter ${filterId}:`, value);
        // Delegate to communication management module
        if (this.admin.communicationManagement) {
            // Communication management module should handle this
        }
    }

    /* ================= UPDATE HANDLERS ================= */

    handleEventUpdate(data) {
        console.log('📅 Handling event update in legacy management:', data);
        // Delegate to event management module
        if (this.admin.eventManagement) {
            // Event management module should handle this
        }
    }

    handlePaymentUpdate(data) {
        console.log('💰 Handling payment update in legacy management:', data);
        // Delegate to financial management module
        if (this.admin.financialManagement) {
            // Financial management module should handle this
        }
    }

    handleIdeaUpdate(data) {
        console.log('💡 Handling idea update in legacy management:', data);
        // Delegate to ideas management module
        if (this.admin.ideasManagement) {
            // Ideas management module should handle this
        }
    }
}

window.AdminManagement = AdminManagement;