// JKUAT Innovation Club - Financial Page

class FinancialPage {
    constructor() {
        this.financialData = {};
        this.charts = {};
        this.init();
    }

    async init() {
        console.log('🏦 Initializing Financial Page...');
        
        try {
            // Load financial data
            await this.loadFinancialData();
            
            // Initialize charts
            this.initializeCharts();
            
            // Load recent transactions
            await this.loadRecentTransactions();
            
            // Load budget categories
            await this.loadBudgetCategories();
            
            // Load treasurer reports
            await this.loadTreasurerReports();
            
            // Load donations
            await this.loadDonations();
            
            // Update hero stats
            this.updateHeroStats();
            
            console.log('✅ Financial Page initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing financial page:', error);
            this.showError('Failed to load financial data');
        }
    }

    async loadFinancialData() {
        try {
            console.log('📊 Loading financial dashboard data...');
            
            const response = await fetch('/api/financial/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });

            if (response.ok) {
                this.financialData = await response.json();
                console.log('✅ Financial data loaded:', this.financialData);
            } else {
                // Use mock data if API fails
                console.warn('⚠️ API failed, using mock data');
                this.financialData = this.getMockFinancialData();
            }
        } catch (error) {
            console.error('❌ Error loading financial data:', error);
            // Use mock data as fallback
            this.financialData = this.getMockFinancialData();
        }
    }

    getMockFinancialData() {
        return {
            summary: {
                total_income: 850000,
                total_expenses: 620000,
                net_balance: 230000,
                transaction_count: 45,
                avg_transaction_amount: 18888
            },
            recentTransactions: [
                {
                    id: 1,
                    description: 'Event Registration Fees - Tech Summit 2024',
                    amount: 45000,
                    transaction_type: 'income',
                    transaction_date: '2024-01-15',
                    status: 'completed',
                    budget_categories: { name: 'Event Revenue', category_type: 'income' }
                },
                {
                    id: 2,
                    description: 'Equipment Purchase - Laptops',
                    amount: -85000,
                    transaction_type: 'expense',
                    transaction_date: '2024-01-12',
                    status: 'completed',
                    budget_categories: { name: 'Equipment', category_type: 'expense' }
                },
                {
                    id: 3,
                    description: 'Membership Fees Collection',
                    amount: 25000,
                    transaction_type: 'income',
                    transaction_date: '2024-01-10',
                    status: 'completed',
                    budget_categories: { name: 'Membership', category_type: 'income' }
                }
            ],
            budgetComparison: [
                {
                    id: 1,
                    item_name: 'Events & Workshops',
                    budgeted_amount: 300000,
                    actual_amount: 245000,
                    budget_categories: { name: 'Events', category_type: 'expense' }
                },
                {
                    id: 2,
                    item_name: 'Equipment & Technology',
                    budgeted_amount: 200000,
                    actual_amount: 185000,
                    budget_categories: { name: 'Equipment', category_type: 'expense' }
                }
            ],
            bankAccounts: [
                {
                    id: 1,
                    account_name: 'JKUAT Innovation Club - Main Account',
                    account_number: '****1234',
                    bank_name: 'KCB Bank',
                    current_balance: 230000,
                    is_primary: true
                }
            ]
        };
    }

    updateHeroStats() {
        const summary = this.financialData.summary || {};
        
        // Update hero statistics
        const totalBudgetEl = document.getElementById('totalBudget');
        const totalExpensesEl = document.getElementById('totalExpenses');
        const remainingBudgetEl = document.getElementById('remainingBudget');
        
        if (totalBudgetEl) {
            totalBudgetEl.textContent = `KSh ${this.formatCurrency(summary.total_income || 0)}`;
        }
        
        if (totalExpensesEl) {
            totalExpensesEl.textContent = `KSh ${this.formatCurrency(Math.abs(summary.total_expenses || 0))}`;
        }
        
        if (remainingBudgetEl) {
            remainingBudgetEl.textContent = `KSh ${this.formatCurrency(summary.net_balance || 0)}`;
        }
    }

    initializeCharts() {
        console.log('📈 Initializing charts...');
        
        // Initialize budget breakdown chart
        this.initializeBudgetChart();
        
        // Initialize expenses timeline chart
        this.initializeExpensesChart();
    }

    initializeBudgetChart() {
        const ctx = document.getElementById('budgetChart');
        if (!ctx) return;

        const summary = this.financialData.summary || {};
        
        this.charts.budgetChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expenses', 'Remaining'],
                datasets: [{
                    data: [
                        summary.total_income || 0,
                        Math.abs(summary.total_expenses || 0),
                        summary.net_balance || 0
                    ],
                    backgroundColor: [
                        '#10b981',
                        '#ef4444',
                        '#3b82f6'
                    ],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                return `${context.label}: KSh ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    initializeExpensesChart() {
        const ctx = document.getElementById('expensesChart');
        if (!ctx) return;

        // Generate mock monthly data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const expensesData = [45000, 52000, 38000, 65000, 48000, 55000];
        const incomeData = [75000, 68000, 82000, 90000, 78000, 85000];

        this.charts.expensesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: expensesData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'white',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: KSh ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: (value) => `KSh ${this.formatCurrency(value)}`
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    async loadRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) return;

        const transactions = this.financialData.recentTransactions || [];
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No recent transactions found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.transaction_type}">
                    <i class="fas ${transaction.transaction_type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        ${new Date(transaction.transaction_date).toLocaleDateString()} • 
                        ${transaction.budget_categories?.name || 'General'}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.transaction_type}">
                    ${transaction.transaction_type === 'income' ? '+' : '-'}KSh ${this.formatCurrency(Math.abs(transaction.amount))}
                </div>
            </div>
        `).join('');
    }

    async loadBudgetCategories() {
        const container = document.getElementById('budgetCategories');
        if (!container) return;

        const categories = this.financialData.budgetComparison || [];
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <p>No budget categories found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => {
            const percentage = category.budgeted_amount > 0 
                ? (category.actual_amount / category.budgeted_amount * 100).toFixed(1)
                : 0;
            
            return `
                <div class="category-item">
                    <div class="category-header">
                        <span class="category-name">${category.item_name}</span>
                        <span class="category-percentage">${percentage}%</span>
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                    </div>
                    <div class="category-amounts">
                        <span class="actual">KSh ${this.formatCurrency(category.actual_amount)}</span>
                        <span class="budgeted">/ KSh ${this.formatCurrency(category.budgeted_amount)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadTreasurerReports() {
        const container = document.getElementById('treasurerReports');
        if (!container) return;

        // Mock treasurer reports
        const reports = [
            {
                id: 1,
                title: 'Q4 2024 Financial Report',
                description: 'Comprehensive financial overview for the fourth quarter of 2024',
                report_date: '2024-01-15',
                status: 'published',
                file_url: '#'
            },
            {
                id: 2,
                title: 'Annual Budget 2024',
                description: 'Approved annual budget breakdown and allocations',
                report_date: '2024-01-01',
                status: 'published',
                file_url: '#'
            }
        ];

        container.innerHTML = reports.map(report => `
            <div class="report-card">
                <div class="report-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="report-content">
                    <h4 class="report-title">${report.title}</h4>
                    <p class="report-description">${report.description}</p>
                    <div class="report-meta">
                        <span class="report-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(report.report_date).toLocaleDateString()}
                        </span>
                        <span class="report-status ${report.status}">
                            <i class="fas fa-check-circle"></i>
                            ${report.status}
                        </span>
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn-icon" onclick="downloadReport('${report.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadDonations() {
        const container = document.getElementById('donationsGrid');
        if (!container) return;

        // Mock donations data
        const donations = [
            {
                id: 1,
                donor_name: 'Tech Corp Kenya',
                donor_type: 'corporate',
                amount: 150000,
                donation_type: 'sponsorship',
                donation_date: '2024-01-10',
                purpose: 'Annual Tech Summit Sponsorship'
            },
            {
                id: 2,
                donor_name: 'Alumni Association',
                donor_type: 'organization',
                amount: 75000,
                donation_type: 'donation',
                donation_date: '2024-01-05',
                purpose: 'Equipment Fund'
            },
            {
                id: 3,
                donor_name: 'Innovation Partners',
                donor_type: 'corporate',
                amount: 100000,
                donation_type: 'grant',
                donation_date: '2023-12-20',
                purpose: 'Student Project Grants'
            }
        ];

        container.innerHTML = donations.map(donation => `
            <div class="donation-card">
                <div class="donation-header">
                    <div class="donor-info">
                        <h4 class="donor-name">${donation.donor_name}</h4>
                        <span class="donor-type">${donation.donor_type}</span>
                    </div>
                    <div class="donation-amount">
                        KSh ${this.formatCurrency(donation.amount)}
                    </div>
                </div>
                <div class="donation-details">
                    <p class="donation-purpose">${donation.purpose}</p>
                    <div class="donation-meta">
                        <span class="donation-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(donation.donation_date).toLocaleDateString()}
                        </span>
                        <span class="donation-type">
                            <i class="fas fa-tag"></i>
                            ${donation.donation_type}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-KE').format(amount);
    }

    showError(message) {
        if (window.notifications) {
            window.notifications.show(message, 'error');
        } else {
            console.error(message);
        }
    }

    showSuccess(message) {
        if (window.notifications) {
            window.notifications.show(message, 'success');
        } else {
            console.log(message);
        }
    }
}

// Global functions for button actions
window.downloadChart = function(chartId) {
    console.log(`Downloading chart: ${chartId}`);
    // Implementation for chart download
};

window.exportTransactions = function() {
    console.log('Exporting transactions...');
    // Implementation for transaction export
};

window.downloadReport = function(reportId) {
    console.log(`Downloading report: ${reportId}`);
    // Implementation for report download
};

window.searchReceipts = function() {
    const email = document.getElementById('receiptEmail')?.value;
    const phone = document.getElementById('receiptPhone')?.value;
    const dateRange = document.getElementById('receiptDate')?.value;
    
    console.log('Searching receipts:', { email, phone, dateRange });
    
    // Show results section
    const resultsSection = document.getElementById('receiptsResults');
    const resultsList = document.getElementById('receiptsList');
    
    if (resultsSection && resultsList) {
        resultsSection.style.display = 'block';
        
        // Mock receipt results
        const receipts = [
            {
                id: 1,
                receipt_number: 'RCP-2024-001',
                amount: 5000,
                payment_date: '2024-01-15',
                description: 'Event Registration Fee',
                payment_method: 'M-Pesa'
            },
            {
                id: 2,
                receipt_number: 'RCP-2024-002',
                amount: 2500,
                payment_date: '2024-01-10',
                description: 'Membership Fee',
                payment_method: 'Bank Transfer'
            }
        ];
        
        resultsList.innerHTML = receipts.map(receipt => `
            <div class="receipt-item">
                <div class="receipt-info">
                    <div class="receipt-number">${receipt.receipt_number}</div>
                    <div class="receipt-description">${receipt.description}</div>
                    <div class="receipt-meta">
                        ${new Date(receipt.payment_date).toLocaleDateString()} • 
                        ${receipt.payment_method}
                    </div>
                </div>
                <div class="receipt-amount">
                    KSh ${new Intl.NumberFormat('en-KE').format(receipt.amount)}
                </div>
                <div class="receipt-actions">
                    <button class="btn btn-primary" onclick="downloadReceipt('${receipt.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `).join('');
    }
};

window.downloadReceipt = function(receiptId) {
    console.log(`Downloading receipt: ${receiptId}`);
    // Implementation for receipt download
};

// Make FinancialPage available globally
window.FinancialPage = FinancialPage;