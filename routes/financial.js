const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// =============================================
// FINANCIAL REPORTS ROUTES
// =============================================

// Get financial dashboard summary
router.get('/dashboard', async (req, res) => {
    try {
        console.log('📊 Financial dashboard API called');
        
        const { period = 'current_year' } = req.query;
        
        let startDate, endDate;
        const now = new Date();
        
        switch(period) {
            case 'current_month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'current_quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'current_year':
            default:
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
        }
        
        console.log('📅 Date range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);
        
        // Try to get financial summary with error handling
        let summary = null;
        try {
            const { data: summaryData, error: summaryError } = await supabase
                .rpc('get_financial_summary', {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                });
            
            if (summaryError) {
                console.error('❌ Summary function error:', summaryError);
                // Provide default summary if function fails
                summary = [{
                    total_income: 0,
                    total_expenses: 0,
                    net_balance: 0,
                    transaction_count: 0,
                    avg_transaction_amount: 0
                }];
            } else {
                summary = summaryData;
            }
        } catch (error) {
            console.error('❌ Summary function failed:', error);
            summary = [{
                total_income: 0,
                total_expenses: 0,
                net_balance: 0,
                transaction_count: 0,
                avg_transaction_amount: 0
            }];
        }
        
        // Get recent transactions with error handling
        let recentTransactions = [];
        try {
            const { data: transactionsData, error: transactionsError } = await supabase
                .from('financial_transactions')
                .select(`
                    *,
                    budget_categories(name, category_type)
                `)
                .order('transaction_date', { ascending: false })
                .limit(10);
            
            if (transactionsError) {
                console.error('❌ Transactions query error:', transactionsError);
            } else {
                recentTransactions = transactionsData || [];
            }
        } catch (error) {
            console.error('❌ Transactions query failed:', error);
        }
        
        // Get budget comparison with error handling
        let budgetComparison = [];
        try {
            const { data: budgetData, error: budgetError } = await supabase
                .from('budget_line_items')
                .select(`
                    *,
                    budget_categories(name, category_type),
                    annual_budgets(fiscal_year)
                `)
                .eq('annual_budgets.fiscal_year', now.getFullYear())
                .order('budgeted_amount', { ascending: false });
            
            if (budgetError) {
                console.error('❌ Budget query error:', budgetError);
            } else {
                budgetComparison = budgetData || [];
            }
        } catch (error) {
            console.error('❌ Budget query failed:', error);
        }
        
        // Get bank balances with error handling
        let bankAccounts = [];
        try {
            const { data: bankData, error: bankError } = await supabase
                .from('bank_accounts')
                .select('*')
                .eq('is_active', true)
                .order('is_primary', { ascending: false });
            
            if (bankError) {
                console.error('❌ Bank accounts query error:', bankError);
            } else {
                bankAccounts = bankData || [];
            }
        } catch (error) {
            console.error('❌ Bank accounts query failed:', error);
        }
        
        const response = {
            summary: summary[0] || {
                total_income: 0,
                total_expenses: 0,
                net_balance: 0,
                transaction_count: 0,
                avg_transaction_amount: 0
            },
            recentTransactions: recentTransactions,
            budgetComparison: budgetComparison,
            bankAccounts: bankAccounts,
            period: {
                start: startDate,
                end: endDate,
                type: period
            }
        };
        
        console.log('✅ Financial dashboard response prepared');
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error fetching financial dashboard:', error);
        res.status(500).json({ 
            error: 'Failed to fetch financial dashboard',
            message: error.message 
        });
    }
});

// Get financial reports
router.get('/reports', async (req, res) => {
    try {
        const { 
            type, 
            fiscal_year,
            status = 'published',
            page = 1, 
            limit = 10 
        } = req.query;

        let query = supabase
            .from('financial_reports')
            .select(`
                *,
                users!financial_reports_prepared_by_fkey(name, email),
                users!financial_reports_approved_by_fkey(name, email)
            `)
            .order('report_period_end', { ascending: false });

        // Apply filters
        if (type) {
            query = query.eq('report_type', type);
        }

        if (fiscal_year) {
            query = query.eq('fiscal_year', fiscal_year);
        }

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: reports, error, count } = await query;

        if (error) throw error;

        res.json({
            reports: reports || [],
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / limit),
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching financial reports:', error);
        res.status(500).json({ error: 'Failed to fetch financial reports' });
    }
});

// Get single financial report
router.get('/reports/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: report, error } = await supabase
            .from('financial_reports')
            .select(`
                *,
                users!financial_reports_prepared_by_fkey(name, email),
                users!financial_reports_reviewed_by_fkey(name, email),
                users!financial_reports_approved_by_fkey(name, email)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!report) {
            return res.status(404).json({ error: 'Financial report not found' });
        }

        res.json(report);
    } catch (error) {
        console.error('Error fetching financial report:', error);
        res.status(500).json({ error: 'Failed to fetch financial report' });
    }
});

// =============================================
// BUDGET ROUTES
// =============================================

// Get budget overview
router.get('/budget', async (req, res) => {
    try {
        const { fiscal_year = new Date().getFullYear() } = req.query;

        // Get budget
        const { data: budget, error: budgetError } = await supabase
            .from('annual_budgets')
            .select(`
                *,
                users!annual_budgets_created_by_fkey(name, email),
                users!annual_budgets_approved_by_fkey(name, email)
            `)
            .eq('fiscal_year', fiscal_year)
            .single();

        if (budgetError && budgetError.code !== 'PGRST116') throw budgetError;

        // Get budget line items
        const { data: lineItems, error: lineItemsError } = await supabase
            .from('budget_line_items')
            .select(`
                *,
                budget_categories(name, category_type, description)
            `)
            .eq('budget_id', budget?.id || 0)
            .order('budgeted_amount', { ascending: false });

        if (lineItemsError) throw lineItemsError;

        // Group by category type
        const incomeItems = lineItems?.filter(item => item.budget_categories.category_type === 'income') || [];
        const expenseItems = lineItems?.filter(item => item.budget_categories.category_type === 'expense') || [];

        res.json({
            budget: budget || null,
            incomeItems,
            expenseItems,
            summary: {
                totalIncomeBudget: incomeItems.reduce((sum, item) => sum + parseFloat(item.budgeted_amount), 0),
                totalExpenseBudget: expenseItems.reduce((sum, item) => sum + parseFloat(item.budgeted_amount), 0),
                totalIncomeActual: incomeItems.reduce((sum, item) => sum + parseFloat(item.actual_amount), 0),
                totalExpenseActual: expenseItems.reduce((sum, item) => sum + parseFloat(item.actual_amount), 0)
            }
        });
    } catch (error) {
        console.error('Error fetching budget:', error);
        res.status(500).json({ error: 'Failed to fetch budget' });
    }
});

// Get budget categories
router.get('/budget/categories', async (req, res) => {
    try {
        const { type } = req.query;

        let query = supabase
            .from('budget_categories')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (type) {
            query = query.eq('category_type', type);
        }

        const { data: categories, error } = await query;

        if (error) throw error;

        res.json(categories || []);
    } catch (error) {
        console.error('Error fetching budget categories:', error);
        res.status(500).json({ error: 'Failed to fetch budget categories' });
    }
});

// =============================================
// TRANSACTIONS ROUTES
// =============================================

// Get financial transactions
router.get('/transactions', async (req, res) => {
    try {
        const { 
            type, 
            category_id,
            start_date,
            end_date,
            status = 'completed',
            page = 1, 
            limit = 20 
        } = req.query;

        let query = supabase
            .from('financial_transactions')
            .select(`
                *,
                budget_categories(name, category_type),
                budget_line_items(item_name),
                users!financial_transactions_recorded_by_fkey(name, email),
                users!financial_transactions_approved_by_fkey(name, email)
            `)
            .order('transaction_date', { ascending: false });

        // Apply filters
        if (type) {
            query = query.eq('transaction_type', type);
        }

        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        if (start_date) {
            query = query.gte('transaction_date', start_date);
        }

        if (end_date) {
            query = query.lte('transaction_date', end_date);
        }

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: transactions, error, count } = await query;

        if (error) throw error;

        res.json({
            transactions: transactions || [],
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / limit),
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get single transaction
router.get('/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: transaction, error } = await supabase
            .from('financial_transactions')
            .select(`
                *,
                budget_categories(name, category_type, description),
                budget_line_items(item_name, description),
                users!financial_transactions_recorded_by_fkey(name, email),
                users!financial_transactions_approved_by_fkey(name, email)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

// Create new transaction
router.post('/transactions', authenticateToken, requireRole(['admin', 'treasurer']), async (req, res) => {
    try {
        const {
            transactionType,
            categoryId,
            budgetLineItemId,
            amount,
            description,
            transactionDate,
            referenceNumber,
            paymentMethod,
            bankAccount,
            receiptNumber,
            invoiceNumber,
            vendorSupplier,
            projectReference,
            notes
        } = req.body;

        const { data: transaction, error } = await supabase
            .from('financial_transactions')
            .insert({
                transaction_type: transactionType,
                category_id: categoryId,
                budget_line_item_id: budgetLineItemId,
                amount,
                description,
                transaction_date: transactionDate,
                reference_number: referenceNumber,
                payment_method: paymentMethod,
                bank_account: bankAccount,
                receipt_number: receiptNumber,
                invoice_number: invoiceNumber,
                vendor_supplier: vendorSupplier,
                project_reference: projectReference,
                notes,
                recorded_by: req.user.id,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// =============================================
// DONATIONS & SPONSORSHIPS ROUTES
// =============================================

// Get donations and sponsorships
router.get('/donations', async (req, res) => {
    try {
        const { 
            donor_type, 
            donation_type,
            start_date,
            end_date,
            page = 1, 
            limit = 20 
        } = req.query;

        let query = supabase
            .from('donations_sponsorships')
            .select(`
                *,
                users!donations_sponsorships_created_by_fkey(name, email)
            `)
            .order('donation_date', { ascending: false });

        // Apply filters
        if (donor_type) {
            query = query.eq('donor_type', donor_type);
        }

        if (donation_type) {
            query = query.eq('donation_type', donation_type);
        }

        if (start_date) {
            query = query.gte('donation_date', start_date);
        }

        if (end_date) {
            query = query.lte('donation_date', end_date);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: donations, error, count } = await query;

        if (error) throw error;

        res.json({
            donations: donations || [],
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / limit),
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});

// Get donation statistics
router.get('/donations/stats', async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const { data: stats, error } = await supabase
            .from('donations_sponsorships')
            .select('donor_type, donation_type, amount, donation_date')
            .gte('donation_date', `${year}-01-01`)
            .lte('donation_date', `${year}-12-31`);

        if (error) throw error;

        // Calculate statistics
        const totalAmount = stats.reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);
        const totalCount = stats.length;

        const byDonorType = stats.reduce((acc, donation) => {
            acc[donation.donor_type] = (acc[donation.donor_type] || 0) + parseFloat(donation.amount || 0);
            return acc;
        }, {});

        const byDonationType = stats.reduce((acc, donation) => {
            acc[donation.donation_type] = (acc[donation.donation_type] || 0) + parseFloat(donation.amount || 0);
            return acc;
        }, {});

        const monthlyTrends = stats.reduce((acc, donation) => {
            const month = new Date(donation.donation_date).getMonth();
            acc[month] = (acc[month] || 0) + parseFloat(donation.amount || 0);
            return acc;
        }, {});

        res.json({
            totalAmount,
            totalCount,
            averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
            byDonorType,
            byDonationType,
            monthlyTrends,
            year: parseInt(year)
        });
    } catch (error) {
        console.error('Error fetching donation statistics:', error);
        res.status(500).json({ error: 'Failed to fetch donation statistics' });
    }
});

// =============================================
// PAYMENT RECEIPTS ROUTES
// =============================================

// Get payment receipts
router.get('/receipts', async (req, res) => {
    try {
        const { 
            start_date,
            end_date,
            payer_name,
            page = 1, 
            limit = 20 
        } = req.query;

        let query = supabase
            .from('payment_receipts')
            .select(`
                *,
                users!payment_receipts_issued_by_fkey(name, email)
            `)
            .order('payment_date', { ascending: false });

        // Apply filters
        if (start_date) {
            query = query.gte('payment_date', start_date);
        }

        if (end_date) {
            query = query.lte('payment_date', end_date);
        }

        if (payer_name) {
            query = query.ilike('payer_name', `%${payer_name}%`);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: receipts, error, count } = await query;

        if (error) throw error;

        res.json({
            receipts: receipts || [],
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / limit),
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching receipts:', error);
        res.status(500).json({ error: 'Failed to fetch receipts' });
    }
});

// Download receipt PDF
router.get('/receipts/:id/download', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: receipt, error } = await supabase
            .from('payment_receipts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!receipt) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        // Update download count
        await supabase
            .from('payment_receipts')
            .update({ 
                download_count: (receipt.download_count || 0) + 1,
                last_downloaded: new Date().toISOString()
            })
            .eq('id', id);

        // Generate PDF
        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${receipt.receipt_number}.pdf"`);
        
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('JKUAT Innovation Club', 50, 50);
        doc.fontSize(16).text('Payment Receipt', 50, 80);
        doc.fontSize(12);
        
        doc.text(`Receipt Number: ${receipt.receipt_number}`, 50, 120);
        doc.text(`Date: ${new Date(receipt.payment_date).toLocaleDateString()}`, 50, 140);
        doc.text(`Payer: ${receipt.payer_name}`, 50, 160);
        doc.text(`Amount: KES ${parseFloat(receipt.amount).toLocaleString()}`, 50, 180);
        doc.text(`Payment Method: ${receipt.payment_method}`, 50, 200);
        doc.text(`Description: ${receipt.description}`, 50, 220);
        
        if (receipt.payment_reference) {
            doc.text(`Reference: ${receipt.payment_reference}`, 50, 240);
        }

        doc.text('Thank you for your payment!', 50, 280);
        doc.text('JKUAT Innovation and Entrepreneurship Club', 50, 300);

        doc.end();

    } catch (error) {
        console.error('Error downloading receipt:', error);
        res.status(500).json({ error: 'Failed to download receipt' });
    }
});

// =============================================
// BANK ACCOUNTS ROUTES
// =============================================

// Get bank accounts
router.get('/bank-accounts', authenticateToken, requireRole(['admin', 'treasurer']), async (req, res) => {
    try {
        const { data: accounts, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .order('is_primary', { ascending: false })
            .order('account_name');

        if (error) throw error;

        res.json(accounts || []);
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
});

module.exports = router;