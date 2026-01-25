/**
 * Base Management Module
 * Shared utilities and base functionality for all management modules
 */

class BaseManagement {
    constructor(adminDashboard) {
        this.admin = adminDashboard;
        
        // Shared cache for all management modules
        this.cache = {
            events: [],
            ideas: [],
            payments: [],
            messages: []
        };
    }

    /* ================= SHARED UTILITIES ================= */

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

    /* ================= SHARED STATUS BADGE HELPERS ================= */

    getEventStatusBadge(status) {
        const statusMap = {
            'completed': 'bg-success',
            'upcoming': 'bg-primary', 
            'draft': 'bg-secondary',
            'cancelled': 'bg-danger'
        };
        return statusMap[status?.toLowerCase()] || 'bg-secondary';
    }

    getIdeaStatusBadge(status) {
        const statusMap = {
            'approved': 'bg-success',
            'rejected': 'bg-danger',
            'implemented': 'bg-info',
            'pending': 'bg-warning'
        };
        return statusMap[status?.toLowerCase()] || 'bg-warning';
    }

    getPaymentStatusBadge(status) {
        const statusMap = {
            'completed': 'bg-success',
            'pending': 'bg-warning',
            'failed': 'bg-danger',
            'cancelled': 'bg-secondary'
        };
        return statusMap[status?.toLowerCase()] || 'bg-secondary';
    }

    /* ================= SHARED EXPORT FUNCTIONALITY ================= */

    async exportData(type) {
        console.log(`📊 Exporting data: ${type}`);
        this.admin.showToast(`Preparing ${type} export...`, 'info');

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/export/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.admin.showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.admin.showToast('Failed to export data', 'danger');
        }
    }
}