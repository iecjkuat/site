// =============================================
// JKUAT Innovation Club - Analytics Dashboard
// =============================================

class AnalyticsDashboard {
    constructor() {
        this.currentTab = 'overview';
        this.dateRange = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        };
        this.charts = {};
        this.data = {};
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setDefaultDates();
        await this.loadDashboardData();
    }

    setupEventListeners() {
        // Date range update
        document.getElementById('updateRange')?.addEventListener('click', () => {
            this.updateDateRange();
        });

        // Tab switching
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const format = e.target.dataset.format;
                this.exportData(type, format);
            });
        });

        // Retry button
        document.getElementById('retryLoad')?.addEventListener('click', () => {
            this.loadDashboardData();
        });
    }

    setDefaultDates() {
        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');
        
        if (startInput) startInput.value = this.dateRange.start;
        if (endInput) endInput.value = this.dateRange.end;
    }

    updateDateRange() {
        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');
        
        if (startInput && endInput) {
            this.dateRange.start = startInput.value;
            this.dateRange.end = endInput.value;
            this.loadDashboardData();
        }
    }

    async loadDashboardData() {
        try {
            this.showLoading();
            
            const response = await fetch(`/api/analytics/dashboard?start_date=${this.dateRange.start}&end_date=${this.dateRange.end}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-user-id': localStorage.getItem('userId')
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.data = await response.json();
            this.renderDashboard();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError();
        }
    }

    showLoading() {
        document.getElementById('loadingState')?.classList.remove('hidden');
        document.getElementById('errorState')?.classList.add('hidden');
        document.getElementById('quickStats')?.classList.add('hidden');
        document.getElementById('analyticsContent')?.classList.add('hidden');
        document.getElementById('exportOptions')?.classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('quickStats')?.classList.remove('hidden');
        document.getElementById('analyticsContent')?.classList.remove('hidden');
        document.getElementById('exportOptions')?.classList.remove('hidden');
    }

    showError() {
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('errorState')?.classList.remove('hidden');
        document.getElementById('quickStats')?.classList.add('hidden');
        document.getElementById('analyticsContent')?.classList.add('hidden');
        document.getElementById('exportOptions')?.classList.add('hidden');
    }

    renderDashboard() {
        this.renderQuickStats();
        this.renderTabContent();
    }

    renderQuickStats() {
        const statsContainer = document.getElementById('quickStats');
        if (!statsContainer || !this.data) return;

        const stats = [
            {
                title: 'Total Members',
                value: this.data.membership?.total_members || 0,
                change: `+${this.data.membership?.new_registrations || 0}`,
                icon: 'fas fa-users',
                color: 'blue'
            },
            {
                title: 'Active Events',
                value: this.data.events?.total_events || 0,
                change: `${this.data.events?.attendance_rate || 0}% attendance`,
                icon: 'fas fa-calendar',
                color: 'green'
            },
            {
                title: 'Total Revenue',
                value: `KES ${(this.data.payments?.total_revenue || 0).toLocaleString()}`,
                change: `${this.data.payments?.success_rate || 0}% success rate`,
                icon: 'fas fa-money-bill-wave',
                color: 'purple'
            },
            {
                title: 'Page Views',
                value: this.data.engagement?.total_page_views || 0,
                change: `${this.data.engagement?.unique_visitors || 0} unique visitors`,
                icon: 'fas fa-eye',
                color: 'orange'
            },
            {
                title: 'Ideas Submitted',
                value: this.data.ideas?.total_ideas || 0,
                change: `${this.data.ideas?.approved_ideas || 0} approved`,
                icon: 'fas fa-lightbulb',
                color: 'yellow'
            },
            {
                title: 'Feedback Rating',
                value: `${this.data.feedback?.avg_rating || 0}/5`,
                change: `${this.data.feedback?.total_feedback || 0} responses`,
                icon: 'fas fa-star',
                color: 'pink'
            }
        ];

        statsContainer.innerHTML = stats.map(stat => `
            <div class="glass-card" style="padding: 2rem; border-radius: 20px; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(${this.getColorRGB(stat.color)}, 0.2); border-radius: 15px; margin: 0 auto 1rem auto;">
                    <i class="${stat.icon}" style="font-size: 1.5rem; color: ${this.getColorHex(stat.color)};"></i>
                </div>
                <h3 style="color: white; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">${stat.value}</h3>
                <p style="color: rgba(255, 255, 255, 0.7); font-weight: 600; margin-bottom: 0.5rem;">${stat.title}</p>
                <p style="color: ${this.getColorHex(stat.color)}; font-size: 0.875rem; font-weight: 500;">${stat.change}</p>
            </div>
        `).join('');
    }

    getColorRGB(color) {
        const colors = {
            blue: '59, 130, 246',
            green: '16, 185, 129',
            purple: '139, 92, 246',
            orange: '245, 158, 11',
            yellow: '251, 191, 36',
            pink: '236, 72, 153'
        };
        return colors[color] || '59, 130, 246';
    }

    getColorHex(color) {
        const colors = {
            blue: '#3b82f6',
            green: '#10b981',
            purple: '#8b5cf6',
            orange: '#f59e0b',
            yellow: '#fbbf24',
            pink: '#ec4899'
        };
        return colors[color] || '#3b82f6';
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.background = 'rgba(255, 255, 255, 0.1)';
            tab.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.background = 'rgba(59, 130, 246, 0.2)';
            activeTab.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        }

        this.currentTab = tabName;
        this.renderTabContent();
    }

    renderTabContent() {
        const contentContainer = document.getElementById('tabContent');
        if (!contentContainer) return;

        switch (this.currentTab) {
            case 'overview':
                this.renderOverviewTab(contentContainer);
                break;
            case 'membership':
                this.renderMembershipTab(contentContainer);
                break;
            case 'events':
                this.renderEventsTab(contentContainer);
                break;
            case 'payments':
                this.renderPaymentsTab(contentContainer);
                break;
            case 'engagement':
                this.renderEngagementTab(contentContainer);
                break;
            case 'feedback':
                this.renderFeedbackTab(contentContainer);
                break;
            case 'ideas':
                this.renderIdeasTab(contentContainer);
                break;
        }
    }

    renderOverviewTab(container) {
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Membership Growth</h3>
                    <canvas id="membershipGrowthChart" width="400" height="200"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Event Attendance</h3>
                    <canvas id="eventAttendanceChart" width="400" height="200"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Revenue Trends</h3>
                    <canvas id="revenueChart" width="400" height="200"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">User Engagement</h3>
                    <canvas id="engagementChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.createMembershipGrowthChart();
            this.createEventAttendanceChart();
            this.createRevenueChart();
            this.createEngagementChart();
        }, 100);
    }

    renderMembershipTab(container) {
        const membershipData = this.data.membership || {};
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Members by Year</h3>
                    <canvas id="membersByYearChart" width="350" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Members by College</h3>
                    <canvas id="membersByCollegeChart" width="350" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px; grid-column: 1 / -1;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Membership Statistics</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                        <div style="text-align: center; padding: 1.5rem; background: rgba(59, 130, 246, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">${membershipData.total_members || 0}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Total Members</div>
                        </div>
                        <div style="text-align: center; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #10b981;">${membershipData.active_members || 0}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Active Members</div>
                        </div>
                        <div style="text-align: center; padding: 1.5rem; background: rgba(245, 158, 11, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">${membershipData.new_registrations || 0}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">New Registrations</div>
                        </div>
                        <div style="text-align: center; padding: 1.5rem; background: rgba(139, 92, 246, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #8b5cf6;">${membershipData.growth_rate || 0}%</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Growth Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.createMembersByYearChart();
            this.createMembersByCollegeChart();
        }, 100);
    }

    renderEventsTab(container) {
        const eventsData = this.data.events || {};
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Events by Status</h3>
                    <canvas id="eventsByStatusChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Monthly Attendance</h3>
                    <canvas id="monthlyAttendanceChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px; grid-column: 1 / -1;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Top Events</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; color: white;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
                                    <th style="padding: 1rem; text-align: left;">Event</th>
                                    <th style="padding: 1rem; text-align: center;">Date</th>
                                    <th style="padding: 1rem; text-align: center;">Registrations</th>
                                    <th style="padding: 1rem; text-align: center;">Attendance</th>
                                    <th style="padding: 1rem; text-align: center;">Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderTopEventsTable(eventsData.top_events)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.createEventsByStatusChart();
            this.createMonthlyAttendanceChart();
        }, 100);
    }

    renderPaymentsTab(container) {
        const paymentsData = this.data.payments || {};
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Revenue by Type</h3>
                    <canvas id="revenueByTypeChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Monthly Revenue</h3>
                    <canvas id="monthlyRevenueChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px; grid-column: 1 / -1;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Payment Statistics</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                        <div style="text-align: center; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #10b981;">KES ${(paymentsData.total_revenue || 0).toLocaleString()}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Total Revenue</div>
                        </div>
                        <div style="text-align: center; padding: 1.5rem; background: rgba(59, 130, 246, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">${paymentsData.total_transactions || 0}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Total Transactions</div>
                        </div>
                        <div style="text-align: center; padding: 1.5rem; background: rgba(245, 158, 11, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">${paymentsData.success_rate || 0}%</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Success Rate</div>
                        </div>
                        <div style="text-align: center; padding: 1.5rem; background: rgba(139, 92, 246, 0.1); border-radius: 15px;">
                            <div style="font-size: 2rem; font-weight: 700; color: #8b5cf6;">KES ${(paymentsData.avg_transaction_amount || 0).toLocaleString()}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Avg Transaction</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.createRevenueByTypeChart();
            this.createMonthlyRevenueChart();
        }, 100);
    }

    renderEngagementTab(container) {
        const engagementData = this.data.engagement || {};
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Device Breakdown</h3>
                    <canvas id="deviceBreakdownChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Daily Activity</h3>
                    <canvas id="dailyActivityChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px; grid-column: 1 / -1;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Most Visited Pages</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; color: white;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
                                    <th style="padding: 1rem; text-align: left;">Page</th>
                                    <th style="padding: 1rem; text-align: center;">Views</th>
                                    <th style="padding: 1rem; text-align: center;">Unique Visitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderMostVisitedPagesTable(engagementData.most_visited_pages)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.createDeviceBreakdownChart();
            this.createDailyActivityChart();
        }, 100);
    }

    renderFeedbackTab(container) {
        const feedbackData = this.data.feedback || {};
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Feedback by Rating</h3>
                    <canvas id="feedbackByRatingChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Sentiment Analysis</h3>
                    <canvas id="sentimentAnalysisChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px; grid-column: 1 / -1;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Recent Feedback</h3>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${this.renderRecentFeedback(feedbackData.recent_feedback)}
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.createFeedbackByRatingChart();
            this.createSentimentAnalysisChart();
        }, 100);
    }

    renderIdeasTab(container) {
        const ideasData = this.data.ideas || {};
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Ideas by Category</h3>
                    <canvas id="ideasByCategoryChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Monthly Submissions</h3>
                    <canvas id="monthlySubmissionsChart" width="400" height="250"></canvas>
                </div>
                <div class="glass-card" style="padding: 2rem; border-radius: 20px; grid-column: 1 / -1;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1.5rem;">Top Contributors</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; color: white;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
                                    <th style="padding: 1rem; text-align: left;">Contributor</th>
                                    <th style="padding: 1rem; text-align: center;">Ideas Count</th>
                                    <th style="padding: 1rem; text-align: center;">Avg Upvotes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderTopContributorsTable(ideasData.top_contributors)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.createIdeasByCategoryChart();
            this.createMonthlySubmissionsChart();
        }, 100);
    }

    // Chart creation methods
    createMembershipGrowthChart() {
        const ctx = document.getElementById('membershipGrowthChart');
        if (!ctx) return;

        const membershipData = this.data.membership || {};
        
        this.charts.membershipGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Total Members',
                    data: [120, 135, 150, 165, 180, membershipData.total_members || 195],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: this.getChartOptions()
        });
    }

    createEventAttendanceChart() {
        const ctx = document.getElementById('eventAttendanceChart');
        if (!ctx) return;

        const eventsData = this.data.events || {};
        
        this.charts.eventAttendance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Attendance',
                    data: [85, 92, 78, 95, 88, eventsData.total_attendance || 90],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }]
            },
            options: this.getChartOptions()
        });
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const paymentsData = this.data.payments || {};
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (KES)',
                    data: [45000, 52000, 48000, 58000, 55000, paymentsData.total_revenue || 62000],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: this.getChartOptions()
        });
    }

    createEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        const engagementData = this.data.engagement || {};
        
        this.charts.engagement = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['New Users', 'Returning Users'],
                datasets: [{
                    data: [
                        engagementData.new_vs_returning?.new_users || 30,
                        engagementData.new_vs_returning?.returning_users || 70
                    ],
                    backgroundColor: ['#f59e0b', '#3b82f6'],
                    borderWidth: 0
                }]
            },
            options: {
                ...this.getChartOptions(),
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        };
    }

    // Additional chart methods would go here...
    createMembersByYearChart() {
        const ctx = document.getElementById('membersByYearChart');
        if (!ctx) return;

        const membershipData = this.data.membership || {};
        const yearData = membershipData.members_by_year || {};
        
        this.charts.membersByYear = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(yearData),
                datasets: [{
                    data: Object.values(yearData),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: {
                ...this.getChartOptions(),
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    // Export functionality
    async exportData(type, format) {
        try {
            const response = await fetch(`/api/analytics/export/${type}?format=${format}&start_date=${this.dateRange.start}&end_date=${this.dateRange.end}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-user-id': localStorage.getItem('userId')
                }
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-analytics-${this.dateRange.start}-to-${this.dateRange.end}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        }
    }

    // Helper methods for rendering tables
    renderTopEventsTable(events) {
        if (!events || !Array.isArray(events)) return '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">No events data available</td></tr>';
        
        return events.map(event => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <td style="padding: 1rem;">${event.title}</td>
                <td style="padding: 1rem; text-align: center;">${new Date(event.date).toLocaleDateString()}</td>
                <td style="padding: 1rem; text-align: center;">${event.registrations}</td>
                <td style="padding: 1rem; text-align: center;">${event.attendance}</td>
                <td style="padding: 1rem; text-align: center;">${Math.round((event.attendance / event.registrations) * 100)}%</td>
            </tr>
        `).join('');
    }

    renderMostVisitedPagesTable(pages) {
        if (!pages || !Array.isArray(pages)) return '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">No page data available</td></tr>';
        
        return pages.map(page => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <td style="padding: 1rem;">${page.page}</td>
                <td style="padding: 1rem; text-align: center;">${page.views}</td>
                <td style="padding: 1rem; text-align: center;">${page.unique_visitors}</td>
            </tr>
        `).join('');
    }

    renderTopContributorsTable(contributors) {
        if (!contributors || !Array.isArray(contributors)) return '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">No contributors data available</td></tr>';
        
        return contributors.map(contributor => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <td style="padding: 1rem;">${contributor.user_name}</td>
                <td style="padding: 1rem; text-align: center;">${contributor.ideas_count}</td>
                <td style="padding: 1rem; text-align: center;">${Math.round(contributor.avg_upvotes)}</td>
            </tr>
        `).join('');
    }

    renderRecentFeedback(feedback) {
        if (!feedback || !Array.isArray(feedback)) return '<div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">No recent feedback available</div>';
        
        return feedback.map(item => `
            <div style="padding: 1rem; margin-bottom: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: white;">${item.event_title}</strong>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="color: #fbbf24;">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>
                        <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <p style="color: rgba(255, 255, 255, 0.8); margin: 0;">${item.comment}</p>
            </div>
        `).join('');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});