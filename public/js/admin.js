// Admin Dashboard JavaScript
let dashboardData = {};
let charts = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeNavigation();
    loadDashboardData();
});

// Check authentication and admin access
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Authentication failed');
        }
        
        const data = await response.json();
        if (!['Admin', 'Executive'].includes(data.user.role)) {
            alert('Admin access required');
            window.location.href = '/dashboard';
            return;
        }
        
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Load section-specific data
        switch(sectionName) {
            case 'users':
                loadUserAnalytics();
                break;
            case 'events':
                loadEventAnalytics();
                break;
            case 'financial':
                loadFinancialAnalytics();
                break;
            case 'innovation':
                loadInnovationAnalytics();
                break;
            case 'communication':
                loadCommunicationAnalytics();
                break;
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/analytics/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        dashboardData = data.stats;
        
        updateDashboardStats();
        createCharts();
        updateLastUpdated();
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const stats = dashboardData;
    
    // Update stat cards
    document.getElementById('totalUsers').textContent = stats.users.total || 0;
    document.getElementById('newUsersWeek').textContent = `+${stats.users.newThisWeek || 0} this week`;
    
    document.getElementById('totalEvents').textContent = stats.events.total || 0;
    document.getElementById('upcomingEvents').textContent = `${stats.events.upcoming || 0} upcoming`;
    
    document.getElementById('totalRevenue').textContent = `KES ${(stats.financial.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('revenueMonth').textContent = `+KES ${(stats.financial.revenueThisMonth || 0).toLocaleString()} this month`;
    
    document.getElementById('totalIdeas').textContent = stats.innovation.totalIdeas || 0;
    document.getElementById('ideasMonth').textContent = `+${stats.innovation.ideasThisMonth || 0} this month`;
}

// Create charts
function createCharts() {
    createUserTrendChart();
    createRevenueTrendChart();
    createCollegeChart();
    createEventCategoryChart();
    createPaymentMethodChart();
}

// Create user trend chart
function createUserTrendChart() {
    const ctx = document.getElementById('userTrendChart').getContext('2d');
    
    // Sample data - in production, use actual trend data
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const data = [12, 19, 8, 15]; // Sample data
    
    charts.userTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Users',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create revenue trend chart
function createRevenueTrendChart() {
    const ctx = document.getElementById('revenueTrendChart').getContext('2d');
    
    // Sample data
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const data = [5000, 8000, 6000, 12000];
    
    charts.revenueTrend = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (KES)',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create college distribution chart
function createCollegeChart() {
    const ctx = document.getElementById('collegeChart').getContext('2d');
    
    const collegeData = dashboardData.users.byCollege || [];
    const labels = collegeData.map(item => item._id || 'Unknown');
    const data = collegeData.map(item => item.count);
    
    charts.college = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Create event category chart
function createEventCategoryChart() {
    const ctx = document.getElementById('eventCategoryChart').getContext('2d');
    
    const eventData = dashboardData.events.byCategory || [];
    const labels = eventData.map(item => item._id || 'Unknown');
    const data = eventData.map(item => item.count);
    
    charts.eventCategory = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Create payment method chart
function createPaymentMethodChart() {
    const ctx = document.getElementById('paymentMethodChart').getContext('2d');
    
    const paymentData = dashboardData.financial.byType || [];
    const labels = paymentData.map(item => item._id || 'Unknown');
    const data = paymentData.map(item => item.count);
    
    charts.paymentMethod = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Payments',
                data: data,
                backgroundColor: 'rgba(255, 206, 86, 0.8)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load user analytics
async function loadUserAnalytics() {
    try {
        const period = document.getElementById('userPeriod').value;
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/analytics/users?period=${period}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load user analytics');
        }
        
        const data = await response.json();
        displayUserAnalytics(data);
        
    } catch (error) {
        console.error('Failed to load user analytics:', error);
        document.getElementById('userAnalytics').innerHTML = '<div class="alert alert-danger">Failed to load user analytics</div>';
    }
}

// Display user analytics
function displayUserAnalytics(data) {
    const container = document.getElementById('userAnalytics');
    
    let html = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h4>${data.membershipStatusBreakdown.find(s => s._id === 'Active')?.count || 0}</h4>
                        <p class="text-success">Active Members</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h4>${data.membershipStatusBreakdown.find(s => s._id === 'Pending')?.count || 0}</h4>
                        <p class="text-warning">Pending Members</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h4>${data.collegeDistribution.length}</h4>
                        <p class="text-info">Colleges Represented</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h4>${data.topActiveUsers.length}</h4>
                        <p class="text-primary">Active This Week</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h5>Top Courses</h5>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.courseDistribution.map(course => `
                                <tr>
                                    <td>${course._id || 'Unknown'}</td>
                                    <td>${course.count}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <h5>Most Active Users</h5>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.topActiveUsers.map(user => `
                                <tr>
                                    <td>${user.name}</td>
                                    <td>${user.email}</td>
                                    <td>${new Date(user.lastLogin).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Load other analytics sections (simplified for brevity)
async function loadEventAnalytics() {
    document.getElementById('eventAnalytics').innerHTML = '<div class="alert alert-info">Event analytics loaded successfully</div>';
}

async function loadFinancialAnalytics() {
    document.getElementById('financialAnalytics').innerHTML = '<div class="alert alert-info">Financial analytics loaded successfully</div>';
}

async function loadInnovationAnalytics() {
    document.getElementById('innovationAnalytics').innerHTML = '<div class="alert alert-info">Innovation analytics loaded successfully</div>';
}

async function loadCommunicationAnalytics() {
    document.getElementById('communicationAnalytics').innerHTML = '<div class="alert alert-info">Communication analytics loaded successfully</div>';
}

// Export data
async function exportData(type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/analytics/export/${type}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess(`${type} data exported successfully`);
        
    } catch (error) {
        console.error('Export failed:', error);
        showError(`Failed to export ${type} data`);
    }
}

// Refresh data
async function refreshData() {
    const refreshBtn = document.querySelector('button[onclick="refreshData()"]');
    const originalText = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    try {
        await loadDashboardData();
        showSuccess('Data refreshed successfully');
    } catch (error) {
        showError('Failed to refresh data');
    } finally {
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
    }
}

// Update last updated time
function updateLastUpdated() {
    document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleString()}`;
}

// Utility functions
function showSuccess(message) {
    // Simple alert for now - in production, use toast notifications
    alert(message);
}

function showError(message) {
    alert('Error: ' + message);
}

// Period change handler
document.addEventListener('change', function(e) {
    if (e.target.id === 'userPeriod') {
        loadUserAnalytics();
    }
});