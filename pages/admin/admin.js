/**
 * JKUAT Innovation Club - Admin Dashboard
 * Comprehensive admin interface for platform management
 */

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.charts = {};
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Admin Dashboard...');
        
        // Check admin authentication
        if (!await this.checkAdminAuth()) {
            window.location.href = '/dashboard';
            return;
        }

        this.setupEventListeners();
        await this.loadDashboardData();
        this.updateLastUpdated();
        
        console.log('✅ Admin Dashboard initialized');
    }

    async checkAdminAuth() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return false;

            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return false;

            const userData = await response.json();
            
            // Check if user is admin
            if (userData.user?.role !== 'admin') {
                alert('Access denied. Admin privileges required.');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.showSection(section);
            });
        });

        // Period selector
        const userPeriodSelect = document.getElementById('userPeriod');
        if (userPeriodSelect) {
            userPeriodSelect.addEventListener('change', () => {
                this.loadUserAnalytics();
            });
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Add active class to clicked nav link
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'users':
                await this.loadUserAnalytics();
                break;
            case 'events':
                await this.loadEventAnalytics();
                break;
            case 'financial':
                await this.loadFinancialAnalytics();
                break;
            case 'innovation':
                await this.loadInnovationAnalytics();
                break;
            case 'communication':
                await this.loadCommunicationAnalytics();
                break;
        }
    }

    async loadDashboardData() {
        try {
            console.log('📊 Loading dashboard data...');
            
            // Load overview stats
            await Promise.all([
                this.loadOverviewStats(),
                this.loadCharts()
            ]);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadOverviewStats() {
        try {
            const token = localStorage.getItem('authToken');
            
            // Load stats from various endpoints
            const [usersRes, eventsRes, paymentsRes, ideasRes] = await Promise.all([
                fetch('/api/stats/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/stats/events', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/stats/payments', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/stats/ideas', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const [usersData, eventsData, paymentsData, ideasData] = await Promise.all([
                usersRes.ok ? usersRes.json() : { total: 0, newThisWeek: 0 },
                eventsRes.ok ? eventsRes.json() : { total: 0, upcoming: 0 },
                paymentsRes.ok ? paymentsRes.json() : { totalRevenue: 0, monthlyRevenue: 0 },
                ideasRes.ok ? ideasRes.json() : { total: 0, monthlyIdeas: 0 }
            ]);

            // Update UI
            this.updateElement('totalUsers', usersData.total || 0);
            this.updateElement('newUsersWeek', `+${usersData.newThisWeek || 0} this week`);
            
            this.updateElement('totalEvents', eventsData.total || 0);
            this.updateElement('upcomingEvents', `${eventsData.upcoming || 0} upcoming`);
            
            this.updateElement('totalRevenue', `KES ${this.formatNumber(paymentsData.totalRevenue || 0)}`);
            this.updateElement('revenueMonth', `+KES ${this.formatNumber(paymentsData.monthlyRevenue || 0)} this month`);
            
            this.updateElement('totalIdeas', ideasData.total || 0);
            this.updateElement('ideasMonth', `+${ideasData.monthlyIdeas || 0} this month`);

        } catch (error) {
            console.error('Failed to load overview stats:', error);
            // Set default values
            this.updateElement('totalUsers', '0');
            this.updateElement('totalEvents', '0');
            this.updateElement('totalRevenue', 'KES 0');
            this.updateElement('totalIdeas', '0');
        }
    }

    async loadCharts() {
        try {
            // Load chart data
            await Promise.all([
                this.loadUserTrendChart(),
                this.loadRevenueTrendChart(),
                this.loadCollegeChart(),
                this.loadEventCategoryChart(),
                this.loadPaymentMethodChart()
            ]);
        } catch (error) {
            console.error('Failed to load charts:', error);
        }
    }

    async loadUserTrendChart() {
        const ctx = document.getElementById('userTrendChart');
        if (!ctx) return;

        // Sample data - replace with actual API call
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [12, 19, 8, 15, 25, 18],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        };

        this.charts.userTrend = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async loadRevenueTrendChart() {
        const ctx = document.getElementById('revenueTrendChart');
        if (!ctx) return;

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue (KES)',
                data: [5000, 8000, 6000, 12000, 15000, 10000],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            }]
        };

        this.charts.revenueTrend = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async loadCollegeChart() {
        const ctx = document.getElementById('collegeChart');
        if (!ctx) return;

        const data = {
            labels: ['Engineering', 'Agriculture', 'Architecture', 'Health Sciences', 'COHES'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        };

        this.charts.college = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async loadEventCategoryChart() {
        const ctx = document.getElementById('eventCategoryChart');
        if (!ctx) return;

        const data = {
            labels: ['Workshop', 'Seminar', 'Competition', 'Networking', 'Social'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        };

        this.charts.eventCategory = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async loadPaymentMethodChart() {
        const ctx = document.getElementById('paymentMethodChart');
        if (!ctx) return;

        const data = {
            labels: ['M-Pesa', 'Bank Transfer', 'Cash', 'Card'],
            datasets: [{
                data: [60, 25, 10, 5],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ]
            }]
        };

        this.charts.paymentMethod = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async loadUserAnalytics() {
        const container = document.getElementById('userAnalytics');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>User Registration Trends</h5>
                            <canvas id="userAnalyticsChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>User Activity</h5>
                            <div class="list-group">
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Active Users (Last 7 days)</span>
                                    <strong>45</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>New Registrations (This month)</span>
                                    <strong>12</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Profile Completion Rate</span>
                                    <strong>78%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadEventAnalytics() {
        const container = document.getElementById('eventAnalytics');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h5>Event Performance</h5>
                            <canvas id="eventAnalyticsChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5>Event Stats</h5>
                            <div class="list-group">
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Total Events</span>
                                    <strong>24</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Upcoming Events</span>
                                    <strong>5</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Average Attendance</span>
                                    <strong>67%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadFinancialAnalytics() {
        const container = document.getElementById('financialAnalytics');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <h5>Financial Overview</h5>
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-success">KES 45,000</h4>
                                        <p class="mb-0">Total Revenue</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-warning">KES 12,000</h4>
                                        <p class="mb-0">This Month</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-info">156</h4>
                                        <p class="mb-0">Total Payments</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-primary">KES 289</h4>
                                        <p class="mb-0">Avg Payment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadInnovationAnalytics() {
        const container = document.getElementById('innovationAnalytics');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Ideas Submitted</h5>
                            <canvas id="ideasChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Innovation Metrics</h5>
                            <div class="list-group">
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Total Ideas</span>
                                    <strong>89</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Ideas This Month</span>
                                    <strong>12</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Implementation Rate</span>
                                    <strong>23%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCommunicationAnalytics() {
        const container = document.getElementById('communicationAnalytics');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <h5>Communication Stats</h5>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-primary">234</h4>
                                        <p class="mb-0">Total Messages</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-success">89%</h4>
                                        <p class="mb-0">Read Rate</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-info">45</h4>
                                        <p class="mb-0">Active Conversations</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        this.updateElement('lastUpdated', `Last updated: ${timeString}`);
    }

    showError(message) {
        console.error(message);
        // You could show a toast notification here
    }
}

// Global functions for HTML onclick handlers
window.refreshData = async function() {
    if (window.adminDashboard) {
        await window.adminDashboard.loadDashboardData();
        window.adminDashboard.updateLastUpdated();
    }
};

window.exportData = function(type) {
    console.log(`Exporting ${type} data...`);
    alert(`Export ${type} functionality will be implemented soon!`);
};

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

console.log('📊 Admin Dashboard script loaded');