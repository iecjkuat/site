/**
 * Admin Dashboard Charts
 * JKUAT Innovation & Entrepreneurship Club
 * Optimized • Dark-mode safe • Chart.js v3+
 */

class AdminCharts {
    constructor(adminDashboard) {
        this.admin = adminDashboard;

        // Chart instances
        this.charts = {
            // Dashboard charts
            userTrend: null,
            revenueTrend: null,
            collegeDistribution: null,
            eventCategory: null,
            paymentMethod: null,
            
            // Analytics section charts
            userAnalytics: null,
            eventAnalytics: null,
            ideas: null,
            userActivity: null
        };

        // State management
        this.isInitializing = false;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 5;

        // Resize handling
        this.resizeTimeout = null;

        // Current periods for charts
        this.currentPeriods = {
            userTrend: '7d',
            revenueTrend: '7d'
        };

        // Shared dark-mode config
        this.baseOptions = {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: { color: '#e5e7eb', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    titleColor: '#ffffff',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { color: '#e5e7eb' },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                },
                y: {
                    ticks: { color: '#e5e7eb' },
                    grid: { color: 'rgba(255,255,255,0.08)' },
                    beginAtZero: true
                }
            }
        };

        // Initialize period toggle handlers
        this.initializePeriodToggles();
    }

    /* ================= DATA LOADING ================= */

    initializePeriodToggles() {
        // Add event listeners for period toggle buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-period]')) {
                const period = e.target.getAttribute('data-period');
                const chartContainer = e.target.closest('.card');
                
                // Determine which chart this belongs to
                let chartType = null;
                if (chartContainer.querySelector('#userTrendChart')) {
                    chartType = 'userTrend';
                } else if (chartContainer.querySelector('#revenueTrendChart')) {
                    chartType = 'revenueTrend';
                }
                
                if (chartType) {
                    this.changePeriod(chartType, period, e.target);
                }
            }
        });
    }

    async changePeriod(chartType, period, buttonElement) {
        console.log(`📊 Changing ${chartType} chart to ${period} period`);
        
        // Update button states
        const buttonGroup = buttonElement.parentElement;
        buttonGroup.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        buttonElement.classList.add('active');
        
        // Update current period
        this.currentPeriods[chartType] = period;
        
        // Fetch new data and re-render chart
        try {
            if (chartType === 'userTrend') {
                const data = await this.fetchUserTrendData(period);
                this.renderUserTrendChart(data, period);
            } else if (chartType === 'revenueTrend') {
                const data = await this.fetchRevenueTrendData(period);
                this.renderRevenueTrendChart(data, period);
            }
        } catch (error) {
            console.error(`Failed to update ${chartType} chart:`, error);
            // Fall back to mock data
            if (chartType === 'userTrend') {
                this.renderUserTrendChart(this.getMockUserStats(), period);
            } else if (chartType === 'revenueTrend') {
                this.renderRevenueTrendChart(this.getMockFinancialStats(), period);
            }
        }
    }

    async fetchUserTrendData(period = '7d') {
        try {
            // Check cache first
            const cacheKey = `user-trend-${period}`;
            const cachedData = this.admin.cache.get(cacheKey);
            const cacheAge = Date.now() - (cachedData?.timestamp || 0);
            
            // Use cache if data is less than 60 seconds old
            if (cachedData && cacheAge < 60000) {
                console.log(`✅ Using cached user trend data for ${period}`);
                return cachedData.data;
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/users/trend?period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ User trend data loaded for ${period}:`, data);
                
                // Cache the data
                this.admin.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
                
                return data;
            }
        } catch (error) {
            console.log(`⚠️ API unavailable for user trend ${period}, using mock data`);
        }
        
        // Return mock data based on period
        return this.getMockUserTrendData(period);
    }

    async fetchRevenueTrendData(period = '7d') {
        try {
            // Check cache first
            const cacheKey = `revenue-trend-${period}`;
            const cachedData = this.admin.cache.get(cacheKey);
            const cacheAge = Date.now() - (cachedData?.timestamp || 0);
            
            // Use cache if data is less than 60 seconds old
            if (cachedData && cacheAge < 60000) {
                console.log(`✅ Using cached revenue trend data for ${period}`);
                return cachedData.data;
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/financial/trend?period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Revenue trend data loaded for ${period}:`, data);
                
                // Cache the data
                this.admin.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
                
                return data;
            }
        } catch (error) {
            console.log(`⚠️ API unavailable for revenue trend ${period}, using mock data`);
        }
        
        // Return mock data based on period
        return this.getMockRevenueTrendData(period);
    }

    async loadCharts() {
        console.log('📊 Loading charts...');
        
        // Verify Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js library not loaded');
            return;
        }

        // Verify canvas elements exist
        const requiredCanvases = ['userTrendChart', 'revenueTrendChart', 'collegeChart'];
        const missingCanvases = requiredCanvases.filter(id => !document.getElementById(id));
        
        if (missingCanvases.length > 0) {
            console.error('❌ Missing canvas elements:', missingCanvases);
            return;
        }

        console.log('✅ Chart.js loaded, canvas elements found, proceeding with chart rendering...');

        try {
            // Fetch real data from APIs
            console.log('🌐 Fetching real data from APIs...');
            
            const [userTrendData, revenueTrendData, userStats, financialStats] = await Promise.all([
                this.fetchUserTrendData(this.currentPeriods.userTrend).catch(() => {
                    console.log('⚡️ Using mock user trend data (API unavailable)');
                    return this.getMockUserTrendData(this.currentPeriods.userTrend);
                }),
                this.fetchRevenueTrendData(this.currentPeriods.revenueTrend).catch(() => {
                    console.log('⚡️ Using mock revenue trend data (API unavailable)');
                    return this.getMockRevenueTrendData(this.currentPeriods.revenueTrend);
                }),
                this.fetchData('/api/admin/users/analytics').catch(() => {
                    console.log('⚡️ Using mock user stats (API unavailable)');
                    return this.getMockUserStats();
                }),
                this.fetchData('/api/admin/financial/analytics').catch(() => {
                    console.log('⚡️ Using mock financial stats (API unavailable)');
                    return this.getMockFinancialStats();
                })
            ]);

            // Render Charts with real/mock data
            console.log('🎨 Rendering charts with fetched data...');
            this.renderUserTrendChart(userTrendData, this.currentPeriods.userTrend);
            this.renderRevenueTrendChart(revenueTrendData, this.currentPeriods.revenueTrend);
            this.renderCollegeDistributionChart(userStats);
            this.renderEventCategoryChart(userStats);
            this.renderPaymentMethodChart(financialStats);

            console.log('✅ All charts rendered successfully with real/mock data');

        } catch (error) {
            console.error('❌ Error loading charts:', error);
            console.log('⚡️ Falling back to mock data for all charts');
            
            // Fallback to mock data
            try {
                const mockUserTrend = this.getMockUserTrendData(this.currentPeriods.userTrend);
                const mockRevenueTrend = this.getMockRevenueTrendData(this.currentPeriods.revenueTrend);
                
                this.renderUserTrendChart(mockUserTrend, this.currentPeriods.userTrend);
                this.renderRevenueTrendChart(mockRevenueTrend, this.currentPeriods.revenueTrend);
                this.renderCollegeDistributionChart(this.getMockUserStats());
                this.renderEventCategoryChart(this.getMockUserStats());
                this.renderPaymentMethodChart(this.getMockFinancialStats());
                console.log('✅ Charts rendered with mock data');
            } catch (fallbackError) {
                console.error('❌ Failed to render charts even with mock data:', fallbackError);
            }
        }
    }

    getMockUserStats() {
        return {
            activeUsers: 245,
            totalUsers: 287,
            newUsersWeek: 23,
            usersByCollege: [
                { name: 'Engineering', count: 120 },
                { name: 'Business', count: 85 },
                { name: 'Agriculture', count: 45 },
                { name: 'Health Sciences', count: 37 }
            ],
            eventsByCategory: [
                { name: 'Workshops', count: 12 },
                { name: 'Competitions', count: 8 },
                { name: 'Networking', count: 6 },
                { name: 'Seminars', count: 10 },
                { name: 'Social Events', count: 4 }
            ]
        };
    }

    getMockUserTrendData(period = '7d') {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const labels = Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return d.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                ...(days > 30 ? { year: '2-digit' } : {})
            });
        });

        // Generate realistic user activity data
        const baseActivity = 245;
        const trendData = labels.map((_, i) => {
            const variation = Math.sin(i / days * Math.PI * 2) * 20; // Seasonal variation
            const growth = (i / days) * 15; // Gradual growth
            const noise = (Math.random() - 0.5) * 10; // Random variation
            return Math.max(0, Math.floor(baseActivity + variation + growth + noise));
        });

        return {
            labels,
            data: trendData,
            period,
            activeUsers: baseActivity + Math.floor(Math.random() * 20)
        };
    }

    getMockRevenueTrendData(period = '7d') {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const labels = Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            if (days <= 7) {
                return d.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (days <= 30) {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
            }
        });

        // Generate realistic revenue data
        const baseRevenue = 2000;
        const revenueData = labels.map((_, i) => {
            const weekendFactor = (i % 7 === 0 || i % 7 === 6) ? 0.7 : 1; // Lower on weekends
            const monthlyTrend = Math.sin(i / days * Math.PI * 2) * 500; // Monthly cycles
            const growth = (i / days) * 300; // Growth trend
            const noise = (Math.random() - 0.5) * 400; // Random variation
            return Math.max(0, Math.floor((baseRevenue + monthlyTrend + growth + noise) * weekendFactor));
        });

        return {
            labels,
            data: revenueData,
            period,
            totalRevenue: revenueData.reduce((sum, val) => sum + val, 0)
        };
    }

    getMockFinancialStats() {
        return {
            totalRevenue: 145000,
            monthlyRevenue: 23500,
            recentPayments: [
                { date: 'Jan 10', amount: 1500 },
                { date: 'Jan 11', amount: 2500 },
                { date: 'Jan 12', amount: 1200 },
                { date: 'Jan 13', amount: 3200 },
                { date: 'Jan 14', amount: 1800 },
                { date: 'Jan 15', amount: 2100 },
                { date: 'Jan 16', amount: 2800 }
            ],
            paymentMethods: [
                { name: 'M-Pesa', count: 180 },
                { name: 'Bank Transfer', count: 65 },
                { name: 'Cash', count: 42 }
            ]
        };
    }

    async fetchData(url) {
        const token = localStorage.getItem('authToken');
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Chart data fetch failed');
        return res.json();
    }

    /* ================= UTILITIES ================= */

    destroy(chartKey) {
        if (this.charts[chartKey]) {
            try {
                this.charts[chartKey].destroy();
                console.log(`🗑️ Destroyed ${chartKey} chart`);
            } catch (error) {
                console.warn(`⚠️ Error destroying ${chartKey} chart:`, error);
            }
            this.charts[chartKey] = null;
        }
    }

    destroyAll() {
        console.log('🗑️ Destroying all charts...');
        Object.keys(this.charts).forEach(key => this.destroy(key));
    }

    getCtx(id) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`⚠️ Canvas element '${id}' not found`);
            return null;
        }
        return el.getContext('2d');
    }

    /* ================= USER TREND CHART ================= */

    renderUserTrendChart(data, period = '7d') {
        const ctx = this.getCtx('userTrendChart');
        if (!ctx) {
            console.log('❌ userTrendChart canvas not found');
            return;
        }

        // Destroy existing chart first
        this.destroy('userTrend');

        // Hide loading spinner if present
        const wrapper = document.getElementById('userTrendChart')?.parentElement;
        if (wrapper) wrapper.querySelector('.chart-loading')?.classList.add('d-none');

        // Use the data structure from API or mock
        let labels, trendData;
        
        if (data.labels && data.data) {
            // New format from API/mock with period support
            labels = data.labels;
            trendData = data.data;
        } else {
            // Fallback to old format for backward compatibility
            labels = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            
            const base = data.activeUsers || 245;
            trendData = labels.map((_, i) => {
                return Math.floor(base * (0.85 + (i * 0.02) + Math.random() * 0.1));
            });
        }

        this.charts.userTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Active Users',
                    data: trendData,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                ...this.baseOptions,
                plugins: {
                    ...this.baseOptions.plugins,
                    title: {
                        display: false
                    }
                }
            }
        });

        console.log(`✅ User trend chart rendered for ${period} period`);
    }

    /* ================= REVENUE TREND CHART ================= */

    renderRevenueTrendChart(data, period = '7d') {
        const ctx = this.getCtx('revenueTrendChart');
        if (!ctx) {
            console.log('❌ revenueTrendChart canvas not found');
            return;
        }

        // Destroy existing chart first
        this.destroy('revenueTrend');

        // Hide loading
        const wrapper = document.getElementById('revenueTrendChart')?.parentElement;
        if (wrapper) wrapper.querySelector('.chart-loading')?.classList.add('d-none');

        // Use the data structure from API or mock
        let labels, values;
        
        if (data.labels && data.data) {
            // New format from API/mock with period support
            labels = data.labels;
            values = data.data;
        } else {
            // Fallback to old format for backward compatibility
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            values = [1500, 2500, 1200, 3200, 1800, 2100, 2800];

            // If we have real recent payments data, use it
            if (data.recentPayments && data.recentPayments.length > 0) {
                const payments = data.recentPayments.slice(0, 7);
                values = payments.map(p => p.amount);
                if (payments.length < 7) {
                    // Fill remaining with mock data
                    while (values.length < 7) {
                        values.push(Math.floor(1000 + Math.random() * 2000));
                    }
                }
            }
        }

        this.charts.revenueTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (KES)',
                    data: values,
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                ...this.baseOptions,
                plugins: {
                    ...this.baseOptions.plugins,
                    title: {
                        display: false
                    }
                }
            }
        });

        console.log(`✅ Revenue trend chart rendered for ${period} period`);
    }

    /* ================= COLLEGE DISTRIBUTION ================= */

    renderCollegeDistributionChart(data) {
        const ctx = this.getCtx('collegeChart');
        if (!ctx) {
            console.log('❌ collegeChart canvas not found');
            return;
        }

        this.destroy('collegeDistribution');

        // Use real data if available, otherwise fall back to mock data
        const collegeData = data.usersByCollege || [
            { name: 'Engineering', count: 120 },
            { name: 'Business', count: 85 },
            { name: 'Agriculture', count: 45 },
            { name: 'Health Sciences', count: 37 }
        ];

        const labels = collegeData.map(c => c.name);
        const counts = collegeData.map(c => c.count);

        this.charts.collegeDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                cutout: '60%',
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            color: '#e5e7eb',
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 11 }
                        } 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1
                    }
                }
            }
        });

        console.log('✅ College distribution chart rendered with', data.usersByCollege ? 'real' : 'mock', 'data');
    }

    /* ================= EVENT CATEGORY CHART ================= */

    renderEventCategoryChart(data) {
        const ctx = this.getCtx('eventCategoryChart');
        if (!ctx) {
            console.log('❌ eventCategoryChart canvas not found');
            return;
        }

        this.destroy('eventCategory');

        // Mock event category data
        const eventData = [
            { name: 'Workshops', count: 12 },
            { name: 'Competitions', count: 8 },
            { name: 'Networking', count: 6 },
            { name: 'Seminars', count: 10 },
            { name: 'Social Events', count: 4 }
        ];

        const labels = eventData.map(e => e.name);
        const counts = eventData.map(e => e.count);

        this.charts.eventCategory = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                cutout: '60%',
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            color: '#e5e7eb',
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 11 }
                        } 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1
                    }
                }
            }
        });

        console.log('✅ Event category chart rendered');
    }

    /* ================= PAYMENT METHOD CHART ================= */

    renderPaymentMethodChart(data) {
        const ctx = this.getCtx('paymentMethodChart');
        if (!ctx) {
            console.log('❌ paymentMethodChart canvas not found');
            return;
        }

        this.destroy('paymentMethod');

        // Mock payment method data
        const paymentData = [
            { name: 'M-Pesa', count: 180 },
            { name: 'Bank Transfer', count: 65 },
            { name: 'Cash', count: 42 }
        ];

        const labels = paymentData.map(p => p.name);
        const counts = paymentData.map(p => p.count);

        this.charts.paymentMethod = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#10b981', '#3b82f6', '#f59e0b'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                cutout: '60%',
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            color: '#e5e7eb',
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 11 }
                        } 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1
                    }
                }
            }
        });

        console.log('✅ Payment method chart rendered');
    }

    /* ================= ANALYTICS SECTION CHARTS ================= */

    renderUserAnalyticsChart(data) {
        const ctx = this.getCtx('userAnalyticsChart');
        if (!ctx) {
            console.log('❌ userAnalyticsChart canvas not found');
            return;
        }

        this.destroy('userAnalytics');

        // Generate 30-day user registration trend
        const labels = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Generate realistic registration data
        const registrationData = labels.map(() => Math.floor(Math.random() * 8) + 1);

        this.charts.userAnalytics = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Registrations',
                    data: registrationData,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                ...this.baseOptions,
                plugins: {
                    ...this.baseOptions.plugins,
                    title: {
                        display: false
                    }
                }
            }
        });

        console.log('✅ User analytics chart rendered');
    }

    renderEventAnalyticsChart(data) {
        const ctx = this.getCtx('eventAnalyticsChart');
        if (!ctx) {
            console.log('❌ eventAnalyticsChart canvas not found');
            return;
        }

        this.destroy('eventAnalytics');

        // Event performance data
        const labels = ['Workshops', 'Competitions', 'Networking', 'Seminars', 'Social'];
        const attendanceData = [85, 92, 67, 78, 89];
        const satisfactionData = [4.2, 4.5, 3.8, 4.1, 4.3];

        this.charts.eventAnalytics = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avg Attendance',
                    data: attendanceData,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                    yAxisID: 'y'
                }, {
                    label: 'Satisfaction (1-5)',
                    data: satisfactionData,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        labels: { color: '#e5e7eb', font: { size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#e5e7eb' },
                        grid: { color: 'rgba(255,255,255,0.08)' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { color: '#e5e7eb' },
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Attendance',
                            color: '#e5e7eb'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { color: '#e5e7eb' },
                        grid: { drawOnChartArea: false },
                        beginAtZero: true,
                        max: 5,
                        title: {
                            display: true,
                            text: 'Satisfaction',
                            color: '#e5e7eb'
                        }
                    }
                }
            }
        });

        console.log('✅ Event analytics chart rendered');
    }

    renderIdeasChart(data) {
        const ctx = this.getCtx('ideasChart');
        if (!ctx) {
            console.log('❌ ideasChart canvas not found');
            return;
        }

        this.destroy('ideas');

        // Ideas by category data
        const categoryData = data.ideasByCategory || [
            { category: 'Technology', count: 34 },
            { category: 'Business', count: 28 },
            { category: 'Social Impact', count: 15 },
            { category: 'Environment', count: 12 }
        ];

        const labels = categoryData.map(c => c.category);
        const counts = categoryData.map(c => c.count);

        this.charts.ideas = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                cutout: '60%',
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            color: '#e5e7eb',
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 11 }
                        } 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1
                    }
                }
            }
        });

        console.log('✅ Ideas chart rendered');
    }

    renderUserActivityChart(data) {
        const ctx = this.getCtx('userActivityChart');
        if (!ctx) {
            console.log('❌ userActivityChart canvas not found');
            return;
        }

        this.destroy('userActivity');

        // User activity data (last 7 days)
        const labels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const activityData = data.userActivity?.daily || [45, 52, 48, 61, 55, 49, 58];

        this.charts.userActivity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Active Users',
                    data: activityData,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                ...this.baseOptions,
                plugins: {
                    ...this.baseOptions.plugins,
                    title: {
                        display: false
                    }
                }
            }
        });

        console.log('✅ User activity chart rendered');
    }

    /* ================= MASTER REFRESH ================= */

    async refreshAllCharts() {
        // Prevent multiple simultaneous initializations
        if (this.isInitializing) {
            console.log('🔄 Charts already initializing, skipping...');
            return;
        }

        // Reset retry count for manual refresh
        if (this.isInitialized) {
            this.retryCount = 0;
        }

        this.isInitializing = true;
        console.log('🔄 Refreshing all charts...');
        
        try {
            // Ensure DOM is ready and Chart.js is loaded
            if (typeof Chart === 'undefined') {
                if (this.retryCount >= this.maxRetries) {
                    console.error('❌ Chart.js failed to load after maximum retries');
                    this.isInitializing = false;
                    return;
                }
                console.log(`⏳ Chart.js not loaded yet, retry ${this.retryCount + 1}/${this.maxRetries}...`);
                this.retryCount++;
                setTimeout(() => {
                    this.isInitializing = false;
                    this.refreshAllCharts();
                }, 300); // Reduced from 1000ms to 300ms
                return;
            }

            // Check if canvas elements exist (only check dashboard charts initially)
            const dashboardCanvases = ['userTrendChart', 'revenueTrendChart', 'collegeChart', 'eventCategoryChart', 'paymentMethodChart'];
            const missingCanvases = dashboardCanvases.filter(id => !document.getElementById(id));
            
            if (missingCanvases.length > 0) {
                if (this.retryCount >= this.maxRetries) {
                    console.error('❌ Canvas elements not found after maximum retries:', missingCanvases);
                    this.isInitializing = false;
                    return;
                }
                console.log(`⏳ Canvas elements not ready: ${missingCanvases.join(', ')}, retry ${this.retryCount + 1}/${this.maxRetries}...`);
                this.retryCount++;
                setTimeout(() => {
                    this.isInitializing = false;
                    this.refreshAllCharts();
                }, 300); // Reduced from 1000ms to 300ms
                return;
            }

            // All good, load the charts
            await this.loadCharts();
            this.isInitialized = true;
            this.retryCount = 0;
            
            // Add resize listener
            if (!this.resizeListenerAdded) {
                window.addEventListener('resize', () => this.handleResize());
                this.resizeListenerAdded = true;
            }
            
            console.log('✅ Charts initialization completed successfully');

        } catch (error) {
            console.error('❌ Error during chart refresh:', error);
        } finally {
            this.isInitializing = false;
        }
    }

    // Initialize charts when DOM is ready
    initializeCharts() {
        // Prevent multiple initializations
        if (this.isInitializing || this.isInitialized) {
            console.log('🎯 Charts already initialized or initializing, skipping...');
            return;
        }

        console.log('🎯 Initializing charts...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Reduce delay significantly
                setTimeout(() => this.refreshAllCharts(), 200);
            });
        } else {
            // Use requestAnimationFrame for immediate execution
            requestAnimationFrame(() => this.refreshAllCharts());
        }
    }

    // Force refresh (for manual button clicks)
    forceRefresh() {
        console.log('🔄 Force refreshing charts...');
        this.isInitialized = false;
        this.isInitializing = false;
        this.retryCount = 0;
        
        // Destroy existing charts first
        Object.keys(this.charts).forEach(key => this.destroy(key));
        
        // Then refresh
        this.refreshAllCharts();
    }

    // Debug method to check chart status
    getChartStatus() {
        const status = {
            isInitializing: this.isInitializing,
            isInitialized: this.isInitialized,
            retryCount: this.retryCount,
            charts: {}
        };
        
        Object.keys(this.charts).forEach(key => {
            status.charts[key] = !!this.charts[key];
        });
        
        console.log('📊 Chart Status:', status);
        return status;
    }

    // Handle window resize with debouncing
    handleResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            Object.values(this.charts).forEach(chart => {
                if (chart) {
                    try {
                        chart.resize();
                    } catch (error) {
                        console.warn('Chart resize error:', error);
                    }
                }
            });
        }, 250);
    }

    /* ================= ANALYTICS CHART RENDERING ================= */

    async renderAnalyticsCharts(section, data = {}) {
        console.log(`📊 Rendering analytics charts for ${section} section...`);
        
        // Use requestAnimationFrame for better performance instead of setTimeout
        requestAnimationFrame(() => {
            switch (section) {
                case 'users':
                    this.renderUserAnalyticsChart(data);
                    break;
                case 'events':
                    this.renderEventAnalyticsChart(data);
                    break;
                case 'innovation':
                    this.renderIdeasChart(data);
                    break;
                case 'advanced-users':
                    this.renderUserActivityChart(data);
                    break;
                default:
                    console.log(`No analytics charts defined for section: ${section}`);
            }
        });
    }

    // Method to refresh analytics charts when switching views
    refreshAnalyticsCharts(section) {
        const mockData = this.getMockAnalyticsData(section);
        this.renderAnalyticsCharts(section, mockData);
    }

    getMockAnalyticsData(section) {
        switch (section) {
            case 'users':
                return {
                    activeUsers: 287,
                    newRegistrations: 23,
                    profileCompletionRate: 78
                };
            case 'events':
                return {
                    totalEvents: 24,
                    upcomingEvents: 5,
                    averageAttendance: 67
                };
            case 'innovation':
                return {
                    ideasByCategory: [
                        { category: 'Technology', count: 34 },
                        { category: 'Business', count: 28 },
                        { category: 'Social Impact', count: 15 },
                        { category: 'Environment', count: 12 }
                    ]
                };
            case 'advanced-users':
                return {
                    userActivity: {
                        daily: [45, 52, 48, 61, 55, 49, 58]
                    }
                };
            default:
                return {};
        }
    }
}

window.AdminCharts = AdminCharts;
