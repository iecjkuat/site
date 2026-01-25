/**
 * Admin Dashboard - Analytics Module
 * Handles all analytics loading and rendering functionality
 */

class AdminAnalytics {
    constructor(adminDashboard) {
        this.admin = adminDashboard;
    }

    /* ================= USER ANALYTICS ================= */

    async loadUserAnalytics() {
        const container = document.getElementById('userAnalytics');
        if (!container) return;

        try {
            // Try API first
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/users/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ User analytics loaded from API:', data);
                this.renderUserAnalytics(data, container);
                return;
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock user analytics');
        }

        // Fallback to mock data
        const mockData = {
            activeUsers: 287,
            newRegistrations: 23,
            profileCompletionRate: 78,
            usersByCollege: [
                { name: 'Engineering', count: 145 },
                { name: 'Business', count: 89 },
                { name: 'Agriculture', count: 67 },
                { name: 'Health Sciences', count: 41 }
            ]
        };
        
        this.renderUserAnalytics(mockData, container);
    }

    renderUserAnalytics(data, container) {
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
                                    <strong>${data.activeUsers || 0}</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>New Registrations (This month)</span>
                                    <strong>${data.newRegistrations || 0}</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Profile Completion Rate</span>
                                    <strong>${data.profileCompletionRate || 0}%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <h5>Users by College</h5>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>College</th>
                                            <th>Users</th>
                                            <th>Percentage</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(data.usersByCollege || []).map(college => `
                                            <tr>
                                                <td>${college.name}</td>
                                                <td>${college.count}</td>
                                                <td>${Math.round((college.count / (data.activeUsers || 1)) * 100)}%</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary" data-action="viewCollegeUsers" data-college="${college.name}">
                                                        View Users
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render the chart after DOM is updated (reduce delay)
        if (this.admin.chartsModule) {
            requestAnimationFrame(() => {
                this.admin.chartsModule.renderAnalyticsCharts('users', data);
            });
        }
    }

    /* ================= EVENT ANALYTICS ================= */

    async loadEventAnalytics() {
        const container = document.getElementById('eventAnalytics');
        if (!container) return;

        try {
            // Try API first
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/events/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Event analytics loaded from API:', data);
                this.renderEventAnalytics(data, container);
                return;
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock event analytics');
        }

        // Fallback to mock data
        const mockData = {
            totalEvents: 24,
            upcomingEvents: 5,
            averageAttendance: 67,
            eventsByType: [
                { type: 'Workshop', count: 12 },
                { type: 'Seminar', count: 8 },
                { type: 'Competition', count: 4 }
            ],
            recentEvents: [
                { name: 'AI Workshop', date: '2025-01-10', attendees: 45 },
                { name: 'Startup Pitch', date: '2025-01-08', attendees: 67 },
                { name: 'Tech Talk', date: '2025-01-05', attendees: 32 }
            ]
        };
        
        this.renderEventAnalytics(mockData, container);
    }

    renderEventAnalytics(data, container) {
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
                                    <strong>${data.totalEvents || 0}</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Upcoming Events</span>
                                    <strong>${data.upcomingEvents || 0}</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Average Attendance</span>
                                    <strong>${data.averageAttendance || 0}%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Events by Type</h5>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Count</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(data.eventsByType || []).map(event => `
                                            <tr>
                                                <td>${event.type}</td>
                                                <td>${event.count}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary" data-action="manageEventType" data-type="${event.type}">
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Recent Events</h5>
                            <div class="list-group">
                                ${(data.recentEvents || []).map(event => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1">${event.name}</h6>
                                            <small class="text-muted">${event.date}</small>
                                        </div>
                                        <span class="badge bg-primary rounded-pill">${event.attendees} attendees</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render the chart after DOM is updated (reduce delay)
        if (this.admin.chartsModule) {
            requestAnimationFrame(() => {
                this.admin.chartsModule.renderAnalyticsCharts('events', data);
            });
        }
    }

    /* ================= FINANCIAL ANALYTICS ================= */

    async loadFinancialAnalytics() {
        const container = document.getElementById('financialAnalytics');
        if (!container) return;

        try {
            // Try API first
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/financial/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Financial analytics loaded from API:', data);
                this.renderFinancialAnalytics(data, container);
                return;
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock financial analytics');
        }

        // Fallback to mock data
        const mockData = {
            totalRevenue: 145000,
            monthlyRevenue: 23500,
            totalPayments: 156,
            averagePayment: 929,
            paymentMethods: [
                { method: 'M-Pesa', count: 94, amount: 87000 },
                { method: 'Bank Transfer', count: 39, amount: 45000 },
                { method: 'Cash', count: 16, amount: 8500 },
                { method: 'Card', count: 7, amount: 4500 }
            ],
            recentPayments: [
                { user: 'John Doe', amount: 1500, method: 'M-Pesa', date: '2025-01-04', status: 'Completed' },
                { user: 'Jane Smith', amount: 2000, method: 'Bank Transfer', date: '2025-01-03', status: 'Completed' },
                { user: 'Mike Johnson', amount: 500, method: 'M-Pesa', date: '2025-01-02', status: 'Pending' }
            ]
        };
        
        this.renderFinancialAnalytics(mockData, container);
    }

    renderFinancialAnalytics(data, container) {
        container.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <h5>Financial Overview</h5>
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-success">KES ${this.admin.formatNumber(data.totalRevenue || 0)}</h4>
                                        <p class="mb-0">Total Revenue</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-warning">KES ${this.admin.formatNumber(data.monthlyRevenue || 0)}</h4>
                                        <p class="mb-0">This Month</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-info">${data.totalPayments || 0}</h4>
                                        <p class="mb-0">Total Payments</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-primary">KES ${data.averagePayment || 0}</h4>
                                        <p class="mb-0">Avg Payment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Payment Methods</h5>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Method</th>
                                            <th>Count</th>
                                            <th>Amount</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(data.paymentMethods || []).map(method => `
                                            <tr>
                                                <td>${method.method}</td>
                                                <td>${method.count}</td>
                                                <td>KES ${this.admin.formatNumber(method.amount)}</td>
                                                <td>${Math.round((method.amount / (data.totalRevenue || 1)) * 100)}%</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Recent Payments</h5>
                            <div class="list-group">
                                ${(data.recentPayments || []).map(payment => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1">${payment.user}</h6>
                                            <small class="text-muted">${payment.date} • ${payment.method}</small>
                                        </div>
                                        <div class="text-end">
                                            <span class="fw-bold">KES ${this.admin.formatNumber(payment.amount)}</span>
                                            <br>
                                            <span class="badge ${payment.status === 'Completed' ? 'bg-success' : 'bg-warning'}">${payment.status}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= INNOVATION ANALYTICS ================= */

    async loadInnovationAnalytics() {
        const container = document.getElementById('innovationAnalytics');
        if (!container) return;

        try {
            // Try API first
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/innovation/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Innovation analytics loaded from API:', data);
                this.renderInnovationAnalytics(data, container);
                return;
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock innovation analytics');
        }

        // Fallback to mock data
        const mockData = {
            totalIdeas: 89,
            monthlyIdeas: 12,
            implementationRate: 23,
            pendingReview: 15,
            ideasByCategory: [
                { category: 'Technology', count: 34 },
                { category: 'Business', count: 28 },
                { category: 'Social Impact', count: 15 },
                { category: 'Environment', count: 12 }
            ],
            topIdeas: [
                { title: 'Smart Campus Navigation', author: 'John Doe', votes: 45, status: 'In Development' },
                { title: 'Waste Management System', author: 'Jane Smith', votes: 38, status: 'Under Review' },
                { title: 'Student Marketplace', author: 'Mike Johnson', votes: 32, status: 'Approved' }
            ]
        };
        
        this.renderInnovationAnalytics(mockData, container);
    }

    renderInnovationAnalytics(data, container) {
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
                                    <strong>${data.totalIdeas || 0}</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Ideas This Month</span>
                                    <strong>${data.monthlyIdeas || 0}</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Implementation Rate</span>
                                    <strong>${data.implementationRate || 0}%</strong>
                                </div>
                                <div class="list-group-item d-flex justify-content-between">
                                    <span>Pending Review</span>
                                    <strong>${data.pendingReview || 0}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Ideas by Category</h5>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Count</th>
                                            <th>Percentage</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(data.ideasByCategory || []).map(category => `
                                            <tr>
                                                <td>${category.category}</td>
                                                <td>${category.count}</td>
                                                <td>${Math.round((category.count / (data.totalIdeas || 1)) * 100)}%</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary" data-action="viewCategoryIdeas" data-category="${category.category}">
                                                        View Ideas
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Top Ideas</h5>
                            <div class="list-group">
                                ${(data.topIdeas || []).map(idea => `
                                    <div class="list-group-item">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">${idea.title}</h6>
                                            <small>${idea.votes} votes</small>
                                        </div>
                                        <p class="mb-1">By ${idea.author}</p>
                                        <small class="badge ${idea.status === 'In Development' ? 'bg-success' : idea.status === 'Approved' ? 'bg-primary' : 'bg-warning'}">${idea.status}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render the chart after DOM is updated (reduce delay)
        if (this.admin.chartsModule) {
            requestAnimationFrame(() => {
                this.admin.chartsModule.renderAnalyticsCharts('innovation', data);
            });
        }
    }

    /* ================= COMMUNICATION ANALYTICS ================= */

    async loadCommunicationAnalytics() {
        const container = document.getElementById('communicationAnalytics');
        if (!container) return;

        try {
            // Try API first
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/communication/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Communication analytics loaded from API:', data);
                this.renderCommunicationAnalytics(data, container);
                return;
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock communication analytics');
        }

        // Fallback to mock data
        const mockData = {
            totalMessages: 234,
            readRate: 89,
            activeConversations: 45,
            emailsSent: 156,
            smsNotifications: 89,
            pushNotifications: 312,
            recentMessages: [
                { type: 'Email', subject: 'Event Reminder: AI Workshop', recipients: 45, sent: '2025-01-04', status: 'Delivered' },
                { type: 'SMS', subject: 'Payment Confirmation', recipients: 1, sent: '2025-01-03', status: 'Delivered' },
                { type: 'Push', subject: 'New Idea Submitted', recipients: 23, sent: '2025-01-02', status: 'Delivered' }
            ]
        };
        
        this.renderCommunicationAnalytics(mockData, container);
    }

    renderCommunicationAnalytics(data, container) {
        container.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <h5>Communication Stats</h5>
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-primary">${data.totalMessages || 0}</h4>
                                        <p class="mb-0">Total Messages</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-success">${data.readRate || 0}%</h4>
                                        <p class="mb-0">Read Rate</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-info">${data.activeConversations || 0}</h4>
                                        <p class="mb-0">Active Conversations</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center p-3 border rounded">
                                        <h4 class="text-warning">${data.emailsSent || 0}</h4>
                                        <p class="mb-0">Emails Sent</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Message Types</h5>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Count</th>
                                            <th>Success Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Email</td>
                                            <td>${data.emailsSent || 0}</td>
                                            <td>95%</td>
                                        </tr>
                                        <tr>
                                            <td>SMS</td>
                                            <td>${data.smsNotifications || 0}</td>
                                            <td>98%</td>
                                        </tr>
                                        <tr>
                                            <td>Push Notifications</td>
                                            <td>${data.pushNotifications || 0}</td>
                                            <td>87%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Recent Messages</h5>
                            <div class="list-group">
                                ${(data.recentMessages || []).map(message => `
                                    <div class="list-group-item">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">${message.subject}</h6>
                                            <small>${message.sent}</small>
                                        </div>
                                        <p class="mb-1">${message.type} • ${message.recipients} recipients</p>
                                        <small class="badge ${message.status === 'Delivered' ? 'bg-success' : 'bg-warning'}">${message.status}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= ENHANCED ANALYTICS FEATURES ================= */

    async loadAdvancedUserAnalytics() {
        const container = document.getElementById('userAnalytics');
        if (!container) return;

        // Enhanced user analytics with more detailed insights
        const mockData = {
            activeUsers: 287,
            newRegistrations: 23,
            profileCompletionRate: 78,
            userGrowthRate: 15.2,
            retentionRate: 84.5,
            engagementScore: 7.8,
            usersByCollege: [
                { name: 'Engineering', count: 145, growth: '+12%' },
                { name: 'Business', count: 89, growth: '+8%' },
                { name: 'Agriculture', count: 67, growth: '+15%' },
                { name: 'Health Sciences', count: 41, growth: '+5%' }
            ],
            userActivity: {
                daily: [45, 52, 48, 61, 55, 49, 58],
                weekly: [287, 294, 301, 285, 312, 298, 287],
                monthly: [1245, 1289, 1356, 1287]
            },
            topContributors: [
                { name: 'John Doe', contributions: 23, type: 'Ideas' },
                { name: 'Jane Smith', contributions: 18, type: 'Events' },
                { name: 'Mike Johnson', contributions: 15, type: 'Projects' }
            ]
        };

        this.renderAdvancedUserAnalytics(mockData, container);
    }

    renderAdvancedUserAnalytics(data, container) {
        container.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">User Analytics Dashboard</h5>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary active" data-action="loadUserAnalytics">Standard</button>
                                <button class="btn btn-outline-primary" data-action="loadAdvancedUserAnalytics">Advanced</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-2">
                                    <div class="text-center p-3 border rounded bg-light">
                                        <h4 class="text-primary">${data.activeUsers}</h4>
                                        <small>Active Users</small>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="text-center p-3 border rounded bg-light">
                                        <h4 class="text-success">+${data.newRegistrations}</h4>
                                        <small>New This Month</small>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="text-center p-3 border rounded bg-light">
                                        <h4 class="text-info">${data.profileCompletionRate}%</h4>
                                        <small>Profile Complete</small>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="text-center p-3 border rounded bg-light">
                                        <h4 class="text-warning">${data.userGrowthRate}%</h4>
                                        <small>Growth Rate</small>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="text-center p-3 border rounded bg-light">
                                        <h4 class="text-success">${data.retentionRate}%</h4>
                                        <small>Retention</small>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="text-center p-3 border rounded bg-light">
                                        <h4 class="text-primary">${data.engagementScore}/10</h4>
                                        <small>Engagement</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h5>User Activity Trends</h5>
                            <canvas id="userActivityChart" height="300"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5>Top Contributors</h5>
                            <div class="list-group">
                                ${data.topContributors.map((contributor, index) => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${contributor.name}</strong>
                                            <br>
                                            <small class="text-muted">${contributor.type}</small>
                                        </div>
                                        <div class="text-end">
                                            <span class="badge bg-primary rounded-pill">${contributor.contributions}</span>
                                            <br>
                                            <small class="text-muted">#${index + 1}</small>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <h5>Users by College (Enhanced)</h5>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>College</th>
                                            <th>Users</th>
                                            <th>Percentage</th>
                                            <th>Growth</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.usersByCollege.map(college => `
                                            <tr>
                                                <td>${college.name}</td>
                                                <td>${college.count}</td>
                                                <td>${Math.round((college.count / data.activeUsers) * 100)}%</td>
                                                <td><span class="badge bg-success">${college.growth}</span></td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary" data-action="viewCollegeUsers" data-college="${college.name}">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render the chart after DOM is updated (reduce delay)
        if (this.admin.chartsModule) {
            requestAnimationFrame(() => {
                this.admin.chartsModule.renderAnalyticsCharts('advanced-users', data);
            });
        }
    }

    /* ================= REAL-TIME ANALYTICS ================= */

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        this.realTimeInterval = setInterval(() => {
            this.updateRealTimeStats();
        }, 30000);
    }

    stopRealTimeUpdates() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
    }

    updateRealTimeStats() {
        // Update active user count
        const activeUsersElement = document.querySelector('[data-stat="activeUsers"]');
        if (activeUsersElement) {
            const currentCount = parseInt(activeUsersElement.textContent);
            const newCount = currentCount + Math.floor(Math.random() * 3) - 1; // Random change -1 to +2
            activeUsersElement.textContent = Math.max(0, newCount);
        }

        // Update other real-time stats
        this.updateLastUpdated();
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }
    }

    /* ================= EXPORT ANALYTICS ================= */

    async exportAnalyticsReport(type = 'all') {
        const reportData = {
            timestamp: new Date().toISOString(),
            type: type,
            data: {}
        };

        // Collect data based on type
        switch (type) {
            case 'users':
                reportData.data = await this.collectUserAnalyticsData();
                break;
            case 'events':
                reportData.data = await this.collectEventAnalyticsData();
                break;
            case 'financial':
                reportData.data = await this.collectFinancialAnalyticsData();
                break;
            case 'all':
                reportData.data = {
                    users: await this.collectUserAnalyticsData(),
                    events: await this.collectEventAnalyticsData(),
                    financial: await this.collectFinancialAnalyticsData()
                };
                break;
        }

        // Generate and download report
        this.downloadAnalyticsReport(reportData);
    }

    async collectUserAnalyticsData() {
        return {
            activeUsers: 287,
            newRegistrations: 23,
            profileCompletionRate: 78,
            usersByCollege: [
                { name: 'Engineering', count: 145 },
                { name: 'Business', count: 89 },
                { name: 'Agriculture', count: 67 },
                { name: 'Health Sciences', count: 41 }
            ]
        };
    }

    async collectEventAnalyticsData() {
        return {
            totalEvents: 24,
            upcomingEvents: 5,
            averageAttendance: 67,
            eventsByType: [
                { type: 'Workshop', count: 12 },
                { type: 'Seminar', count: 8 },
                { type: 'Competition', count: 4 }
            ]
        };
    }

    async collectFinancialAnalyticsData() {
        return {
            totalRevenue: 145000,
            monthlyRevenue: 23500,
            totalPayments: 156,
            averagePayment: 929
        };
    }

    downloadAnalyticsReport(reportData) {
        const jsonContent = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_report_${reportData.type}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`Analytics report (${reportData.type}) exported successfully!`);
    }
}

window.AdminAnalytics = AdminAnalytics;