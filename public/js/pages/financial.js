// =============================================
// JKUAT Innovation Club - Financial Page JavaScript
// =============================================

// Mock Data for Financial Dashboard
const MOCK_DATA = {
    dashboard: {
        summary: {
            total_income: 2250000,
            total_expenses: 1897000,
            net_balance: 353000,
            transaction_count: 47,
            avg_transaction_amount: 47872
        },
        recentTransactions: [
            {
                id: 1,
                transaction_type: 'income',
                amount: 200000,
                description: 'Safaricom PLC - Platinum Sponsorship for Annual Tech Conference',
                transaction_date: '2024-12-20',
                status: 'completed',
                budget_categories: { name: 'Sponsorships', category_type: 'income' }
            },
            {
                id: 2,
                transaction_type: 'expense',
                amount: 120000,
                description: 'AI Workshop - Venue, catering, materials, and speaker fees',
                transaction_date: '2024-12-18',
                status: 'completed',
                budget_categories: { name: 'Event Expenses', category_type: 'expense' }
            },
            {
                id: 3,
                transaction_type: 'income',
                amount: 85000,
                description: 'Workshop registration - AI & Machine Learning Workshop (85 participants)',
                transaction_date: '2024-12-15',
                status: 'completed',
                budget_categories: { name: 'Event Registration', category_type: 'income' }
            },
            {
                id: 4,
                transaction_type: 'expense',
                amount: 180000,
                description: 'Purchase of 2 professional 3D printers for innovation lab',
                transaction_date: '2024-12-10',
                status: 'completed',
                budget_categories: { name: 'Equipment & Technology', category_type: 'expense' }
            },
            {
                id: 5,
                transaction_type: 'income',
                amount: 25000,
                description: 'Membership fees - December batch (50 members)',
                transaction_date: '2024-12-05',
                status: 'completed',
                budget_categories: { name: 'Membership Fees', category_type: 'income' }
            }
        ],
        budgetComparison: [
            {
                id: 1,
                item_name: 'Corporate Sponsorships',
                budgeted_amount: 800000,
                actual_amount: 650000,
                variance_amount: -150000,
                variance_percentage: -18.75,
                budget_categories: { name: 'Sponsorships', category_type: 'income' }
            },
            {
                id: 2,
                item_name: 'Workshop and Conference Costs',
                budgeted_amount: 600000,
                actual_amount: 550000,
                variance_amount: -50000,
                variance_percentage: -8.33,
                budget_categories: { name: 'Event Expenses', category_type: 'expense' }
            },
            {
                id: 3,
                item_name: 'Lab Equipment and Software',
                budgeted_amount: 400000,
                actual_amount: 380000,
                variance_amount: -20000,
                variance_percentage: -5.0,
                budget_categories: { name: 'Equipment & Technology', category_type: 'expense' }
            },
            {
                id: 4,
                item_name: 'Workshop Registration Fees',
                budgeted_amount: 450000,
                actual_amount: 420000,
                variance_amount: -30000,
                variance_percentage: -6.67,
                budget_categories: { name: 'Event Registration', category_type: 'income' }
            },
            {
                id: 5,
                item_name: 'Annual Membership Fees',
                budgeted_amount: 300000,
                actual_amount: 285000,
                variance_amount: -15000,
                variance_percentage: -5.0,
                budget_categories: { name: 'Membership Fees', category_type: 'income' }
            },
            {
                id: 6,
                item_name: 'Travel for Competitions',
                budgeted_amount: 200000,
                actual_amount: 185000,
                variance_amount: -15000,
                variance_percentage: -7.5,
                budget_categories: { name: 'Travel & Transportation', category_type: 'expense' }
            }
        ],
        bankAccounts: [
            {
                id: 1,
                account_name: 'JKUAT Innovation Club - Main Account',
                bank_name: 'Kenya Commercial Bank',
                account_number: '1234567890',
                account_type: 'checking',
                current_balance: 450000,
                is_primary: true,
                is_active: true
            },
            {
                id: 2,
                account_name: 'JKUAT Innovation Club - Savings',
                bank_name: 'Equity Bank',
                account_number: '0987654321',
                account_type: 'savings',
                current_balance: 250000,
                is_primary: false,
                is_active: true
            },
            {
                id: 3,
                account_name: 'JKUAT Innovation Club - Projects Fund',
                bank_name: 'Co-operative Bank',
                account_number: '5555666677',
                account_type: 'checking',
                current_balance: 180000,
                is_primary: false,
                is_active: true
            }
        ]
    },
    reports: [
        {
            id: 1,
            report_type: 'quarterly',
            title: 'Q4 2024 Financial Report',
            summary: 'Fourth quarter financial report showing strong income from sponsorships and event registrations. Major expenses included equipment purchases and event organization. Overall positive cash flow with healthy reserves.',
            report_period_start: '2024-10-01',
            report_period_end: '2024-12-31',
            fiscal_year: 2024,
            total_income: 875000,
            total_expenses: 720000,
            net_balance: 155000,
            opening_balance: 300000,
            closing_balance: 455000,
            cash_on_hand: 55000,
            bank_balance: 400000,
            status: 'published',
            published_date: '2024-12-20T10:00:00Z',
            users: { name: 'John Doe', email: 'treasurer@jkuatinnovation.ac.ke' }
        },
        {
            id: 2,
            report_type: 'quarterly',
            title: 'Q3 2024 Financial Report',
            summary: 'Third quarter report highlighting successful Innovation Challenge with strong participation and sponsorship income. Equipment and technology investments completed as planned.',
            report_period_start: '2024-07-01',
            report_period_end: '2024-09-30',
            fiscal_year: 2024,
            total_income: 650000,
            total_expenses: 580000,
            net_balance: 70000,
            opening_balance: 230000,
            closing_balance: 300000,
            cash_on_hand: 45000,
            bank_balance: 255000,
            status: 'published',
            published_date: '2024-10-15T10:00:00Z',
            users: { name: 'John Doe', email: 'treasurer@jkuatinnovation.ac.ke' }
        },
        {
            id: 3,
            report_type: 'monthly',
            title: 'December 2024 Monthly Report',
            summary: 'December monthly report covering year-end activities, final sponsorship payments, and preparation for 2025 budget planning.',
            report_period_start: '2024-12-01',
            report_period_end: '2024-12-31',
            fiscal_year: 2024,
            total_income: 285000,
            total_expenses: 240000,
            net_balance: 45000,
            opening_balance: 410000,
            closing_balance: 455000,
            cash_on_hand: 55000,
            bank_balance: 400000,
            status: 'published',
            published_date: '2024-12-31T16:00:00Z',
            users: { name: 'John Doe', email: 'treasurer@jkuatinnovation.ac.ke' }
        },
        {
            id: 4,
            report_type: 'annual',
            title: 'Annual Financial Report 2024',
            summary: 'Comprehensive annual report for fiscal year 2024 showing record-breaking income from sponsorships and successful cost management. Net positive growth of 23% compared to 2023.',
            report_period_start: '2024-01-01',
            report_period_end: '2024-12-31',
            fiscal_year: 2024,
            total_income: 2250000,
            total_expenses: 1897000,
            net_balance: 353000,
            opening_balance: 150000,
            closing_balance: 503000,
            cash_on_hand: 55000,
            bank_balance: 448000,
            status: 'published',
            published_date: '2024-12-31T23:59:00Z',
            users: { name: 'John Doe', email: 'treasurer@jkuatinnovation.ac.ke' }
        },
        {
            id: 5,
            report_type: 'treasurer',
            title: 'Treasurer\'s Report - December 2024',
            summary: 'Monthly treasurer report highlighting key financial decisions, budget variances, and recommendations for the upcoming quarter.',
            report_period_start: '2024-12-01',
            report_period_end: '2024-12-31',
            fiscal_year: 2024,
            total_income: 285000,
            total_expenses: 240000,
            net_balance: 45000,
            opening_balance: 410000,
            closing_balance: 455000,
            cash_on_hand: 55000,
            bank_balance: 400000,
            status: 'published',
            published_date: '2024-12-31T18:00:00Z',
            users: { name: 'John Doe', email: 'treasurer@jkuatinnovation.ac.ke' }
        },
        {
            id: 6,
            report_type: 'quarterly',
            title: 'Q2 2024 Financial Report',
            summary: 'Second quarter report showing successful Tech Conference execution and strong membership growth. Investment in new equipment showing positive returns.',
            report_period_start: '2024-04-01',
            report_period_end: '2024-06-30',
            fiscal_year: 2024,
            total_income: 580000,
            total_expenses: 520000,
            net_balance: 60000,
            opening_balance: 170000,
            closing_balance: 230000,
            cash_on_hand: 35000,
            bank_balance: 195000,
            status: 'published',
            published_date: '2024-07-15T10:00:00Z',
            users: { name: 'John Doe', email: 'treasurer@jkuatinnovation.ac.ke' }
        }
    ],
    budget: {
        budget: {
            id: 1,
            fiscal_year: 2024,
            title: 'JKUAT Innovation Club Budget 2024',
            description: 'Annual budget for fiscal year 2024 covering all club activities, events, and operational expenses',
            total_income_budget: 2400000,
            total_expense_budget: 2200000,
            status: 'active',
            approved_by: 'admin@jkuatinnovation.ac.ke',
            approval_date: '2024-01-15T10:00:00Z',
            users: { name: 'Admin User', email: 'admin@jkuatinnovation.ac.ke' }
        },
        incomeItems: [
            {
                id: 1,
                item_name: 'Corporate Sponsorships',
                description: 'Sponsorships from tech companies and organizations',
                budgeted_amount: 800000,
                actual_amount: 650000,
                variance_amount: -150000,
                variance_percentage: -18.75,
                quarter_q1: 200000,
                quarter_q2: 150000,
                quarter_q3: 200000,
                quarter_q4: 100000,
                budget_categories: { name: 'Sponsorships', category_type: 'income' }
            },
            {
                id: 2,
                item_name: 'Workshop Registration Fees',
                description: 'Registration fees from technical workshops and training sessions',
                budgeted_amount: 450000,
                actual_amount: 420000,
                variance_amount: -30000,
                variance_percentage: -6.67,
                quarter_q1: 100000,
                quarter_q2: 120000,
                quarter_q3: 110000,
                quarter_q4: 90000,
                budget_categories: { name: 'Event Registration', category_type: 'income' }
            },
            {
                id: 3,
                item_name: 'Annual Membership Fees',
                description: 'Membership fees from 200 active members',
                budgeted_amount: 300000,
                actual_amount: 285000,
                variance_amount: -15000,
                variance_percentage: -5.0,
                quarter_q1: 75000,
                quarter_q2: 70000,
                quarter_q3: 80000,
                quarter_q4: 60000,
                budget_categories: { name: 'Membership Fees', category_type: 'income' }
            },
            {
                id: 4,
                item_name: 'University Innovation Grant',
                description: 'Grant from JKUAT for innovation initiatives',
                budgeted_amount: 500000,
                actual_amount: 500000,
                variance_amount: 0,
                variance_percentage: 0,
                quarter_q1: 500000,
                quarter_q2: 0,
                quarter_q3: 0,
                quarter_q4: 0,
                budget_categories: { name: 'Grants', category_type: 'income' }
            },
            {
                id: 5,
                item_name: 'Individual Donations',
                description: 'Donations from alumni and supporters',
                budgeted_amount: 200000,
                actual_amount: 180000,
                variance_amount: -20000,
                variance_percentage: -10.0,
                quarter_q1: 50000,
                quarter_q2: 40000,
                quarter_q3: 50000,
                quarter_q4: 40000,
                budget_categories: { name: 'Donations', category_type: 'income' }
            },
            {
                id: 6,
                item_name: 'Annual Fundraising Gala',
                description: 'Revenue from annual fundraising event',
                budgeted_amount: 150000,
                actual_amount: 165000,
                variance_amount: 15000,
                variance_percentage: 10.0,
                quarter_q1: 0,
                quarter_q2: 0,
                quarter_q3: 165000,
                quarter_q4: 0,
                budget_categories: { name: 'Fundraising Events', category_type: 'income' }
            }
        ],
        expenseItems: [
            {
                id: 7,
                item_name: 'Workshop and Conference Costs',
                description: 'Costs for organizing workshops, hackathons, and conferences',
                budgeted_amount: 600000,
                actual_amount: 550000,
                variance_amount: -50000,
                variance_percentage: -8.33,
                quarter_q1: 150000,
                quarter_q2: 140000,
                quarter_q3: 160000,
                quarter_q4: 100000,
                budget_categories: { name: 'Event Expenses', category_type: 'expense' }
            },
            {
                id: 8,
                item_name: 'Lab Equipment and Software',
                description: 'Purchase of 3D printers, VR headsets, and software licenses',
                budgeted_amount: 400000,
                actual_amount: 380000,
                variance_amount: -20000,
                variance_percentage: -5.0,
                quarter_q1: 200000,
                quarter_q2: 80000,
                quarter_q3: 100000,
                quarter_q4: 0,
                budget_categories: { name: 'Equipment & Technology', category_type: 'expense' }
            },
            {
                id: 9,
                item_name: 'Marketing and Publicity',
                description: 'Social media ads, posters, banners, and promotional materials',
                budgeted_amount: 150000,
                actual_amount: 135000,
                variance_amount: -15000,
                variance_percentage: -10.0,
                quarter_q1: 35000,
                quarter_q2: 40000,
                quarter_q3: 30000,
                quarter_q4: 30000,
                budget_categories: { name: 'Marketing & Promotion', category_type: 'expense' }
            },
            {
                id: 10,
                item_name: 'Travel for Competitions',
                description: 'Travel costs for national and international competitions',
                budgeted_amount: 200000,
                actual_amount: 185000,
                variance_amount: -15000,
                variance_percentage: -7.5,
                quarter_q1: 50000,
                quarter_q2: 45000,
                quarter_q3: 60000,
                quarter_q4: 30000,
                budget_categories: { name: 'Travel & Transportation', category_type: 'expense' }
            },
            {
                id: 11,
                item_name: 'Stationery and Supplies',
                description: 'Office supplies, printing, and general materials',
                budgeted_amount: 80000,
                actual_amount: 72000,
                variance_amount: -8000,
                variance_percentage: -10.0,
                quarter_q1: 18000,
                quarter_q2: 20000,
                quarter_q3: 18000,
                quarter_q4: 16000,
                budget_categories: { name: 'Office Supplies', category_type: 'expense' }
            },
            {
                id: 12,
                item_name: 'Event Venue Costs',
                description: 'Rental costs for event venues and facilities',
                budgeted_amount: 180000,
                actual_amount: 165000,
                variance_amount: -15000,
                variance_percentage: -8.33,
                quarter_q1: 45000,
                quarter_q2: 40000,
                quarter_q3: 50000,
                quarter_q4: 30000,
                budget_categories: { name: 'Venue Rental', category_type: 'expense' }
            },
            {
                id: 13,
                item_name: 'Member Training Programs',
                description: 'Training workshops and certification programs for members',
                budgeted_amount: 120000,
                actual_amount: 110000,
                variance_amount: -10000,
                variance_percentage: -8.33,
                quarter_q1: 30000,
                quarter_q2: 25000,
                quarter_q3: 35000,
                quarter_q4: 20000,
                budget_categories: { name: 'Training & Development', category_type: 'expense' }
            },
            {
                id: 14,
                item_name: 'Innovation Awards and Scholarships',
                description: 'Prize money and scholarships for outstanding members',
                budgeted_amount: 100000,
                actual_amount: 95000,
                variance_amount: -5000,
                variance_percentage: -5.0,
                quarter_q1: 25000,
                quarter_q2: 20000,
                quarter_q3: 30000,
                quarter_q4: 20000,
                budget_categories: { name: 'Scholarships & Awards', category_type: 'expense' }
            },
            {
                id: 15,
                item_name: 'Administrative Expenses',
                description: 'General administrative and operational costs',
                budgeted_amount: 90000,
                actual_amount: 82000,
                variance_amount: -8000,
                variance_percentage: -8.89,
                quarter_q1: 22000,
                quarter_q2: 20000,
                quarter_q3: 20000,
                quarter_q4: 20000,
                budget_categories: { name: 'Administrative Costs', category_type: 'expense' }
            },
            {
                id: 16,
                item_name: 'Banking Fees',
                description: 'Bank charges and transaction fees',
                budgeted_amount: 30000,
                actual_amount: 26000,
                variance_amount: -4000,
                variance_percentage: -13.33,
                quarter_q1: 7000,
                quarter_q2: 6000,
                quarter_q3: 7000,
                quarter_q4: 6000,
                budget_categories: { name: 'Bank Charges', category_type: 'expense' }
            }
        ],
        summary: {
            totalIncomeBudget: 2400000,
            totalExpenseBudget: 2200000,
            totalIncomeActual: 2200000,
            totalExpenseActual: 1800000,
            netBudget: 200000,
            netActual: 400000,
            varianceAmount: 200000,
            variancePercentage: 100.0
        }
    },
    donations: [
        {
            id: 1,
            donor_type: 'corporate',
            donor_name: 'Safaricom PLC',
            donation_type: 'sponsorship',
            amount: 200000,
            donation_date: '2024-12-20',
            purpose: 'Platinum sponsorship for Annual Tech Conference 2024',
            public_recognition: true,
            status: 'completed'
        },
        {
            id: 2,
            donor_type: 'corporate',
            donor_name: 'Microsoft Kenya',
            donation_type: 'sponsorship',
            amount: 150000,
            donation_date: '2024-11-15',
            purpose: 'Gold sponsorship for Innovation Challenge',
            public_recognition: true,
            status: 'completed'
        },
        {
            id: 3,
            donor_type: 'individual',
            donor_name: 'Dr. James Mwangi',
            donation_type: 'cash',
            amount: 50000,
            donation_date: '2024-10-20',
            purpose: 'General support for club activities',
            public_recognition: true,
            status: 'completed'
        }
    ]
};

let currentSection = 'dashboard';
let currentPage = {
    reports: 1,
    transactions: 1,
    donations: 1
};

let currentFilters = {
    dashboard: { period: 'current_year' },
    reports: { type: '', year: '' },
    transactions: { type: '', start_date: '', end_date: '' },
    donations: { donor_type: '' }
};

let data = {
    dashboard: null,
    reports: [],
    budget: null,
    transactions: [],
    donations: []
};

let charts = {};

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load navigation
        const navResponse = await fetch('/templates/components/navigation.html');
        const navHTML = await navResponse.text();
        document.getElementById('navigation-placeholder').innerHTML = navHTML;
        
        console.log('✅ Navigation loaded successfully');
        
        // Initialize financial page
        await initializeFinancial();
        
    } catch (error) {
        console.error('❌ Error loading templates:', error);
    }
});

async function initializeFinancial() {
    console.log('🚀 Initializing Financial page...');
    
    try {
        // Show loading state
        showLoadingState();
        
        setupEventListeners();
        await showSection('dashboard'); // Default section
        
        console.log('✅ Financial page initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing financial:', error);
        showNotification('Failed to load financial data', 'error');
        showErrorState('Failed to initialize financial dashboard');
    }
}

function showLoadingState() {
    // Show loading in summary cards
    document.getElementById('totalIncomeAmount').textContent = 'Loading...';
    document.getElementById('totalExpensesAmount').textContent = 'Loading...';
    document.getElementById('netBalanceAmount').textContent = 'Loading...';
    
    // Show loading in content areas
    const loadingHTML = `
        <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.8);">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #10b981; margin-bottom: 1rem;"></i>
            <p>Loading financial data...</p>
        </div>
    `;
    
    const bankAccountsList = document.getElementById('bankAccountsList');
    const recentTransactionsList = document.getElementById('recentTransactionsList');
    
    if (bankAccountsList) bankAccountsList.innerHTML = loadingHTML;
    if (recentTransactionsList) recentTransactionsList.innerHTML = loadingHTML;
}

function showErrorState(message) {
    // Update summary cards with error state
    document.getElementById('totalIncomeAmount').textContent = 'Error';
    document.getElementById('totalExpensesAmount').textContent = 'Error';
    document.getElementById('netBalanceAmount').textContent = 'Error';
    
    // Show error message in main content areas
    const errorHTML = `
        <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.8);">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                <i class="fas fa-refresh"></i> Retry
            </button>
        </div>
    `;
    
    // Update content areas
    const bankAccountsList = document.getElementById('bankAccountsList');
    const recentTransactionsList = document.getElementById('recentTransactionsList');
    
    if (bankAccountsList) bankAccountsList.innerHTML = errorHTML;
    if (recentTransactionsList) recentTransactionsList.innerHTML = errorHTML;
}

// =============================================
// SECTION MANAGEMENT
// =============================================

async function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${section}Section`).style.display = 'block';
    
    // Load data for the section
    switch(section) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'reports':
            await loadReports();
            break;
        case 'budget':
            await loadBudget();
            break;
        case 'transactions':
            await loadTransactions();
            break;
        case 'donations':
            await loadDonations();
            break;
    }
}

// =============================================
// DASHBOARD FUNCTIONS
// =============================================

async function loadDashboard() {
    try {
        console.log('📊 Loading financial dashboard...');
        
        const params = new URLSearchParams({
            period: currentFilters.dashboard.period
        });
        
        const response = await fetch(`/api/financial/dashboard?${params}`);
        
        if (response.ok) {
            data.dashboard = await response.json();
            console.log('✅ Dashboard data loaded from API:', data.dashboard);
            renderDashboard();
        } else {
            console.warn('⚠️ API failed, using mock data. Status:', response.status, response.statusText);
            // Use mock data when API fails
            data.dashboard = MOCK_DATA.dashboard;
            renderDashboard();
        }
    } catch (error) {
        console.warn('⚠️ API error, using mock data:', error.message);
        // Use mock data when API is unavailable
        data.dashboard = MOCK_DATA.dashboard;
        renderDashboard();
    }
}

function renderDashboard() {
    const dashboard = data.dashboard;
    
    // Update summary cards
    document.getElementById('totalIncomeAmount').textContent = 
        `KES ${parseFloat(dashboard.summary.total_income || 0).toLocaleString()}`;
    document.getElementById('totalExpensesAmount').textContent = 
        `KES ${parseFloat(dashboard.summary.total_expenses || 0).toLocaleString()}`;
    document.getElementById('netBalanceAmount').textContent = 
        `KES ${parseFloat(dashboard.summary.net_balance || 0).toLocaleString()}`;
    
    // Render bank accounts
    renderBankAccounts(dashboard.bankAccounts);
    
    // Render recent transactions
    renderRecentTransactions(dashboard.recentTransactions);
    
    // Render charts
    renderIncomeExpenseChart(dashboard.summary);
    renderBudgetActualChart(dashboard.budgetComparison);
}

function renderDashboardError(message) {
    console.log('🚨 Rendering dashboard error:', message);
    
    // Update summary cards with error state
    document.getElementById('totalIncomeAmount').textContent = 'Error';
    document.getElementById('totalExpensesAmount').textContent = 'Error';
    document.getElementById('netBalanceAmount').textContent = 'Error';
    
    // Show error message in main content areas
    const errorHTML = `
        <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.8);">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                <i class="fas fa-refresh"></i> Retry
            </button>
        </div>
    `;
    
    // Update content areas
    const bankAccountsList = document.getElementById('bankAccountsList');
    const recentTransactionsList = document.getElementById('recentTransactionsList');
    
    if (bankAccountsList) bankAccountsList.innerHTML = errorHTML;
    if (recentTransactionsList) recentTransactionsList.innerHTML = errorHTML;
    
    showNotification(message, 'error');
}

function renderBankAccounts(accounts) {
    const container = document.getElementById('bankAccountsList');
    
    if (!accounts || accounts.length === 0) {
        container.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center;">No bank accounts found</p>';
        return;
    }
    
    container.innerHTML = accounts.map(account => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 1rem;">
            <div>
                <div style="color: white; font-weight: 600; margin-bottom: 0.25rem;">${account.account_name}</div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${account.bank_name}</div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">****${account.account_number.slice(-4)}</div>
            </div>
            <div style="text-align: right;">
                <div style="color: #10b981; font-weight: 700; font-size: 1.125rem;">
                    KES ${parseFloat(account.current_balance).toLocaleString()}
                </div>
                ${account.is_primary ? '<div style="color: #f59e0b; font-size: 0.75rem;">PRIMARY</div>' : ''}
            </div>
        </div>
    `).join('');
}

function renderRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactionsList');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center;">No recent transactions</p>';
        return;
    }
    
    container.innerHTML = transactions.slice(0, 5).map(transaction => {
        const isIncome = transaction.transaction_type === 'income';
        const color = isIncome ? '#10b981' : '#ef4444';
        const icon = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
            <div class="transaction-item" data-transaction-id="${transaction.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 1rem; cursor: pointer; transition: background 0.3s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${color}20; display: flex; align-items: center; justify-content: center;">
                        <i class="fas ${icon}" style="color: ${color};"></i>
                    </div>
                    <div>
                        <div style="color: white; font-weight: 600; margin-bottom: 0.25rem;">${transaction.description || 'No description'}</div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                            ${transaction.budget_categories?.name || 'Uncategorized'}
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">
                            ${new Date(transaction.transaction_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: ${color}; font-weight: 700;">
                        ${isIncome ? '+' : '-'}KES ${parseFloat(transaction.amount || 0).toLocaleString()}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; text-transform: capitalize;">
                        ${transaction.status || 'pending'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click event listeners to transaction items
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', function() {
            const transactionId = this.dataset.transactionId;
            if (transactionId) {
                openTransactionModal(transactionId);
            }
        });
    });
}

function renderIncomeExpenseChart(summary) {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) {
        console.error('❌ Income/Expense chart canvas not found');
        return;
    }
    
    try {
        const context = ctx.getContext('2d');
        
        if (charts.incomeExpense) {
            charts.incomeExpense.destroy();
        }
        
        const totalIncome = parseFloat(summary.total_income || 0);
        const totalExpenses = parseFloat(summary.total_expenses || 0);
        
        // If no data, show a placeholder chart
        if (totalIncome === 0 && totalExpenses === 0) {
            charts.incomeExpense = new Chart(context, {
                type: 'doughnut',
                data: {
                    labels: ['No Data Available'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['rgba(107, 114, 128, 0.5)'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.6)',
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            enabled: false
                        }
                    }
                }
            });
            return;
        }
        
        charts.incomeExpense = new Chart(context, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [totalIncome, totalExpenses],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderColor: ['#059669', '#dc2626'],
                    borderWidth: 2,
                    hoverBackgroundColor: ['#34d399', '#f87171'],
                    hoverBorderColor: ['#047857', '#b91c1c'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = totalIncome + totalExpenses;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: KES ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
        
        console.log('✅ Income/Expense chart rendered successfully');
        
    } catch (error) {
        console.error('❌ Error rendering Income/Expense chart:', error);
        
        // Show error message on canvas
        const context = ctx.getContext('2d');
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('Chart Error', ctx.width / 2, ctx.height / 2);
    }
}

function renderBudgetActualChart(budgetComparison) {
    const ctx = document.getElementById('budgetActualChart');
    if (!ctx) {
        console.error('❌ Budget/Actual chart canvas not found');
        return;
    }
    
    try {
        const context = ctx.getContext('2d');
        
        if (charts.budgetActual) {
            charts.budgetActual.destroy();
        }
        
        // Handle empty data
        if (!budgetComparison || budgetComparison.length === 0) {
            charts.budgetActual = new Chart(context, {
                type: 'bar',
                data: {
                    labels: ['No Budget Data'],
                    datasets: [{
                        label: 'No Data',
                        data: [0],
                        backgroundColor: 'rgba(107, 114, 128, 0.5)',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.6)',
                                font: { size: 10 }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.6)',
                                font: { size: 10 }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
            return;
        }
        
        const labels = budgetComparison.slice(0, 6).map(item => {
            const name = item.item_name || 'Unknown';
            return name.length > 15 ? name.substring(0, 15) + '...' : name;
        });
        const budgetedData = budgetComparison.slice(0, 6).map(item => parseFloat(item.budgeted_amount || 0));
        const actualData = budgetComparison.slice(0, 6).map(item => parseFloat(item.actual_amount || 0));
        
        charts.budgetActual = new Chart(context, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Budgeted',
                        data: budgetedData,
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        borderWidth: 1,
                        borderRadius: 4,
                        maxBarThickness: 40,
                        hoverBackgroundColor: '#60a5fa',
                        hoverBorderColor: '#1d4ed8'
                    },
                    {
                        label: 'Actual',
                        data: actualData,
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1,
                        borderRadius: 4,
                        maxBarThickness: 40,
                        hoverBackgroundColor: '#34d399',
                        hoverBorderColor: '#047857'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'white',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            usePointStyle: true,
                            pointStyle: 'rect'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: KES ${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white',
                            font: {
                                size: 10
                            },
                            maxRotation: 45
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return 'KES ' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        console.log('✅ Budget/Actual chart rendered successfully');
        
    } catch (error) {
        console.error('❌ Error rendering Budget/Actual chart:', error);
        
        // Show error message on canvas
        const context = ctx.getContext('2d');
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('Chart Error', ctx.width / 2, ctx.height / 2);
    }
}

// =============================================
// REPORTS FUNCTIONS
// =============================================

async function loadReports() {
    try {
        console.log('📊 Loading financial reports...');
        
        const params = new URLSearchParams({
            page: currentPage.reports,
            limit: 6,
            type: currentFilters.reports.type,
            fiscal_year: currentFilters.reports.year
        });
        
        const response = await fetch(`/api/financial/reports?${params}`);
        if (response.ok) {
            const result = await response.json();
            
            if (currentPage.reports === 1) {
                data.reports = result.reports;
            } else {
                data.reports = [...data.reports, ...result.reports];
            }
            
            renderReports();
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreReports');
            if (result.pagination && result.pagination.current < result.pagination.total) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
            
            console.log('✅ Reports loaded from API');
        } else {
            console.warn('⚠️ Reports API failed, using mock data. Status:', response.status, response.statusText);
            // Use mock data when API fails
            data.reports = MOCK_DATA.reports;
            renderReports();
        }
    } catch (error) {
        console.warn('⚠️ Reports API error, using mock data:', error.message);
        // Use mock data when API is unavailable
        data.reports = MOCK_DATA.reports;
        renderReports();
    }
}

function renderReports() {
    const container = document.getElementById('reportsGrid');
    
    if (data.reports.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 1rem;">No Reports Found</h3>
                <p style="color: rgba(255, 255, 255, 0.8);">No financial reports match your current filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.reports.map(report => createReportCard(report)).join('');
}

function createReportCard(report) {
    const startDate = new Date(report.report_period_start);
    const endDate = new Date(report.report_period_end);
    const statusColors = {
        'draft': '#6b7280',
        'review': '#f59e0b',
        'approved': '#10b981',
        'published': '#3b82f6'
    };
    
    return `
        <div class="glass-card report-card" style="padding: 2rem; cursor: pointer; position: relative;" onclick="openReportModal('${report.id}')">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${statusColors[report.status] || '#6b7280'};"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span style="background: ${statusColors[report.status]}20; color: ${statusColors[report.status]}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${report.status}
                </span>
                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; text-transform: capitalize;">
                    ${report.report_type}
                </span>
            </div>
            
            <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.75rem; line-height: 1.3;">
                ${report.title}
            </h3>
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 0.875rem; margin-bottom: 1.5rem;">
                ${report.summary ? (report.summary.length > 120 ? report.summary.substring(0, 120) + '...' : report.summary) : 'No summary available'}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-calendar" style="margin-right: 0.5rem; color: #3b82f6; width: 16px;"></i>
                    <span>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-chart-line" style="margin-right: 0.5rem; color: #10b981; width: 16px;"></i>
                    <span>KES ${parseFloat(report.net_balance || 0).toLocaleString()}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openReportModal('${report.id}')">
                    <i class="fas fa-eye"></i>View
                </button>
                ${report.report_file_url ? `
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.open('${report.report_file_url}', '_blank')">
                        <i class="fas fa-download"></i>Download
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// =============================================
// BUDGET FUNCTIONS
// =============================================

async function loadBudget() {
    try {
        console.log('💰 Loading budget data...');
        
        const params = new URLSearchParams({
            fiscal_year: currentFilters.budget?.year || new Date().getFullYear()
        });
        
        const response = await fetch(`/api/financial/budget?${params}`);
        if (response.ok) {
            data.budget = await response.json();
            renderBudget();
            console.log('✅ Budget loaded from API');
        } else {
            console.warn('⚠️ Budget API failed, using mock data. Status:', response.status, response.statusText);
            // Use mock data when API fails
            data.budget = MOCK_DATA.budget;
            renderBudget();
        }
    } catch (error) {
        console.warn('⚠️ Budget API error, using mock data:', error.message);
        // Use mock data when API is unavailable
        data.budget = MOCK_DATA.budget;
        renderBudget();
    }
}

function renderBudget() {
    const budget = data.budget;
    
    // Render budget summary
    renderBudgetSummary(budget.summary);
    
    // Render income budget
    renderBudgetItems('incomeBudgetList', budget.incomeItems);
    
    // Render expense budget
    renderBudgetItems('expenseBudgetList', budget.expenseItems);
}

function renderBudgetSummary(summary) {
    const container = document.getElementById('budgetSummary');
    
    container.innerHTML = `
        <div class="glass-card" style="padding: 2rem; text-align: center;">
            <div style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">
                KES ${summary.totalIncomeBudget.toLocaleString()}
            </div>
            <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8); font-weight: 500;">Total Income Budget</div>
        </div>
        <div class="glass-card" style="padding: 2rem; text-align: center;">
            <div style="font-size: 2rem; font-weight: 800; color: #ef4444; margin-bottom: 0.5rem;">
                KES ${summary.totalExpenseBudget.toLocaleString()}
            </div>
            <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8); font-weight: 500;">Total Expense Budget</div>
        </div>
        <div class="glass-card" style="padding: 2rem; text-align: center;">
            <div style="font-size: 2rem; font-weight: 800; color: #3b82f6; margin-bottom: 0.5rem;">
                KES ${(summary.totalIncomeBudget - summary.totalExpenseBudget).toLocaleString()}
            </div>
            <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8); font-weight: 500;">Net Budget</div>
        </div>
    `;
}

function renderBudgetItems(containerId, items) {
    const container = document.getElementById(containerId);
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center;">No budget items found</p>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        const variance = parseFloat(item.actual_amount) - parseFloat(item.budgeted_amount);
        const varianceColor = variance >= 0 ? '#10b981' : '#ef4444';
        const varianceIcon = variance >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
            <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="color: white; font-weight: 600;">${item.item_name}</div>
                    <div style="color: ${varianceColor}; font-size: 0.875rem;">
                        <i class="fas ${varianceIcon}"></i> ${Math.abs(item.variance_percentage || 0).toFixed(1)}%
                    </div>
                </div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 1rem;">
                    ${item.description || 'No description'}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6);">Budgeted</div>
                        <div style="color: white; font-weight: 600;">KES ${parseFloat(item.budgeted_amount).toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6);">Actual</div>
                        <div style="color: white; font-weight: 600;">KES ${parseFloat(item.actual_amount).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// =============================================
// EVENT LISTENERS
// =============================================

function setupEventListeners() {
    // Section navigation buttons
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('button').dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });
    
    // Dashboard period filter
    document.getElementById('dashboardPeriod').addEventListener('change', (e) => {
        currentFilters.dashboard.period = e.target.value;
        loadDashboard();
    });
    
    // Report filters
    document.getElementById('reportTypeFilter').addEventListener('change', (e) => {
        currentFilters.reports.type = e.target.value;
        currentPage.reports = 1;
        loadReports();
    });
    
    document.getElementById('reportYearFilter').addEventListener('change', (e) => {
        currentFilters.reports.year = e.target.value;
        currentPage.reports = 1;
        loadReports();
    });
    
    // Budget year filter
    document.getElementById('budgetYearFilter').addEventListener('change', (e) => {
        currentFilters.budget = { year: e.target.value };
        loadBudget();
    });
    
    // Load more buttons
    document.getElementById('loadMoreReports').addEventListener('click', () => {
        currentPage.reports++;
        loadReports();
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            e.target.style.display = 'none';
        }
    });
}

// =============================================
// MODAL FUNCTIONS
// =============================================

async function openReportModal(reportId) {
    try {
        const response = await fetch(`/api/financial/reports/${reportId}`);
        if (response.ok) {
            const report = await response.json();
            renderReportModal(report);
            document.getElementById('reportModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading report details:', error);
        showNotification('Failed to load report details', 'error');
    }
}

function renderReportModal(report) {
    const modalContent = document.getElementById('reportModalContent');
    const startDate = new Date(report.report_period_start);
    const endDate = new Date(report.report_period_end);
    
    modalContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${report.report_type}
                </span>
                <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${report.status}
                </span>
            </div>
            
            <h2 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${report.title}</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; font-size: 0.875rem;">
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Period:</strong><br>
                    ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Fiscal Year:</strong><br>
                    ${report.fiscal_year}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Prepared by:</strong><br>
                    ${report.users?.name || 'System'}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 1.5rem; text-align: center;">
                    <div style="color: #10b981; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                        KES ${parseFloat(report.total_income || 0).toLocaleString()}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Total Income</div>
                </div>
                <div style="background: rgba(239, 68, 68, 0.1); border-radius: 8px; padding: 1.5rem; text-align: center;">
                    <div style="color: #ef4444; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                        KES ${parseFloat(report.total_expenses || 0).toLocaleString()}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Total Expenses</div>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); border-radius: 8px; padding: 1.5rem; text-align: center;">
                    <div style="color: #3b82f6; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                        KES ${parseFloat(report.net_balance || 0).toLocaleString()}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Net Balance</div>
                </div>
            </div>
            
            ${report.summary ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">Summary</h4>
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${report.summary}</p>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
                ${report.report_file_url ? `
                    <button class="btn btn-primary" onclick="window.open('${report.report_file_url}', '_blank')">
                        <i class="fas fa-download"></i> Download Report
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="closeReportModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

async function openTransactionModal(transactionId) {
    try {
        const response = await fetch(`/api/financial/transactions/${transactionId}`);
        if (response.ok) {
            const transaction = await response.json();
            renderTransactionModal(transaction);
            document.getElementById('transactionModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading transaction details:', error);
        showNotification('Failed to load transaction details', 'error');
    }
}

function renderTransactionModal(transaction) {
    const modalContent = document.getElementById('transactionModalContent');
    const transactionDate = new Date(transaction.transaction_date);
    const isIncome = transaction.transaction_type === 'income';
    
    modalContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <span style="background: ${isIncome ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${isIncome ? '#10b981' : '#ef4444'}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${transaction.transaction_type}
                </span>
                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${transaction.status}
                </span>
            </div>
            
            <h2 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${transaction.description}</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; font-size: 0.875rem;">
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Amount:</strong><br>
                    KES ${parseFloat(transaction.amount).toLocaleString()}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Date:</strong><br>
                    ${transactionDate.toLocaleDateString()}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Category:</strong><br>
                    ${transaction.budget_categories?.name || 'Uncategorized'}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Payment Method:</strong><br>
                    ${transaction.payment_method || 'N/A'}
                </div>
            </div>
            
            ${transaction.reference_number ? `
                <div style="margin-bottom: 1rem;">
                    <strong style="color: white;">Reference Number:</strong>
                    <span style="color: rgba(255, 255, 255, 0.8); margin-left: 0.5rem;">${transaction.reference_number}</span>
                </div>
            ` : ''}
            
            ${transaction.vendor_supplier ? `
                <div style="margin-bottom: 1rem;">
                    <strong style="color: white;">Vendor/Supplier:</strong>
                    <span style="color: rgba(255, 255, 255, 0.8); margin-left: 0.5rem;">${transaction.vendor_supplier}</span>
                </div>
            ` : ''}
            
            ${transaction.notes ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">Notes</h4>
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${transaction.notes}</p>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
                ${transaction.receipt_file_url ? `
                    <button class="btn btn-primary" onclick="window.open('${transaction.receipt_file_url}', '_blank')">
                        <i class="fas fa-receipt"></i> View Receipt
                    </button>
                ` : ''}
                ${transaction.invoice_file_url ? `
                    <button class="btn btn-secondary" onclick="window.open('${transaction.invoice_file_url}', '_blank')">
                        <i class="fas fa-file-invoice"></i> View Invoice
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="closeTransactionModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
}

function closeTransactionModal() {
    document.getElementById('transactionModal').style.display = 'none';
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function showNotification(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const icon = document.getElementById('toastIcon');
    const title = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMessage');
    
    // Set icon and colors based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#10b981';
        toast.querySelector('.glass-card').style.borderLeftColor = '#10b981';
        title.textContent = 'Success';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-triangle';
        icon.style.color = '#ef4444';
        toast.querySelector('.glass-card').style.borderLeftColor = '#ef4444';
        title.textContent = 'Error';
    } else if (type === 'info') {
        icon.className = 'fas fa-info-circle';
        icon.style.color = '#3b82f6';
        toast.querySelector('.glass-card').style.borderLeftColor = '#3b82f6';
        title.textContent = 'Info';
    }
    
    messageEl.textContent = message;
    toast.style.display = 'block';
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}