-- =============================================
-- JKUAT Innovation Club - Financial Transparency System
-- =============================================

-- Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category_type VARCHAR(50) NOT NULL CHECK (category_type IN ('income', 'expense')),
    parent_category_id INTEGER REFERENCES budget_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Annual Budgets Table
CREATE TABLE IF NOT EXISTS annual_budgets (
    id SERIAL PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    total_income_budget DECIMAL(15,2) DEFAULT 0,
    total_expense_budget DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'proposed', 'approved', 'active', 'closed')),
    approved_by UUID REFERENCES users(id),
    approval_date TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fiscal_year)
);

-- Budget Line Items Table
CREATE TABLE IF NOT EXISTS budget_line_items (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER REFERENCES annual_budgets(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES budget_categories(id),
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    budgeted_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance_amount DECIMAL(15,2) DEFAULT 0,
    variance_percentage DECIMAL(5,2) DEFAULT 0,
    quarter_q1 DECIMAL(15,2) DEFAULT 0,
    quarter_q2 DECIMAL(15,2) DEFAULT 0,
    quarter_q3 DECIMAL(15,2) DEFAULT 0,
    quarter_q4 DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Transactions Table
CREATE TABLE IF NOT EXISTS financial_transactions (
    id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    category_id INTEGER REFERENCES budget_categories(id),
    budget_line_item_id INTEGER REFERENCES budget_line_items(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100),
    payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'mpesa', 'cheque', 'card'
    bank_account VARCHAR(100),
    receipt_number VARCHAR(100),
    receipt_file_url TEXT,
    invoice_number VARCHAR(100),
    invoice_file_url TEXT,
    vendor_supplier VARCHAR(200),
    project_reference VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    recorded_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations and Sponsorships Table
CREATE TABLE IF NOT EXISTS donations_sponsorships (
    id SERIAL PRIMARY KEY,
    donor_type VARCHAR(50) NOT NULL CHECK (donor_type IN ('individual', 'corporate', 'organization', 'government')),
    donor_name VARCHAR(200) NOT NULL,
    donor_email VARCHAR(255),
    donor_phone VARCHAR(20),
    donor_address TEXT,
    donation_type VARCHAR(50) NOT NULL CHECK (donation_type IN ('cash', 'equipment', 'services', 'scholarship', 'sponsorship')),
    amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'KES',
    equipment_description TEXT,
    services_description TEXT,
    donation_date DATE NOT NULL,
    purpose TEXT,
    conditions TEXT,
    acknowledgment_sent BOOLEAN DEFAULT false,
    acknowledgment_date DATE,
    acknowledgment_method VARCHAR(50), -- 'email', 'letter', 'certificate', 'public_recognition'
    tax_deductible BOOLEAN DEFAULT false,
    tax_receipt_issued BOOLEAN DEFAULT false,
    tax_receipt_number VARCHAR(100),
    public_recognition BOOLEAN DEFAULT true,
    anonymous_donor BOOLEAN DEFAULT false,
    recurring_donation BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(50), -- 'monthly', 'quarterly', 'annually'
    transaction_id INTEGER REFERENCES financial_transactions(id),
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('pledged', 'received', 'acknowledged', 'completed')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Reports Table
CREATE TABLE IF NOT EXISTS financial_reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL, -- 'monthly', 'quarterly', 'annual', 'treasurer', 'audit'
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    net_balance DECIMAL(15,2) DEFAULT 0,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2) DEFAULT 0,
    cash_on_hand DECIMAL(15,2) DEFAULT 0,
    bank_balance DECIMAL(15,2) DEFAULT 0,
    outstanding_receivables DECIMAL(15,2) DEFAULT 0,
    outstanding_payables DECIMAL(15,2) DEFAULT 0,
    report_content TEXT, -- JSON or detailed report content
    report_file_url TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    prepared_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    published_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Receipts Table
CREATE TABLE IF NOT EXISTS payment_receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    transaction_id INTEGER REFERENCES financial_transactions(id),
    payer_name VARCHAR(200) NOT NULL,
    payer_email VARCHAR(255),
    payer_phone VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KES',
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    description TEXT NOT NULL,
    receipt_template VARCHAR(100) DEFAULT 'standard',
    receipt_file_url TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_sent_date TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMP,
    status VARCHAR(50) DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'sent', 'downloaded')),
    issued_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS financial_audit_trail (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(200) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'money_market'
    currency VARCHAR(10) DEFAULT 'KES',
    current_balance DECIMAL(15,2) DEFAULT 0,
    last_reconciled_date DATE,
    last_reconciled_balance DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Budget Categories (with conflict handling)
INSERT INTO budget_categories (name, description, category_type) VALUES
-- Income Categories
('Membership Fees', 'Annual and monthly membership fees from club members', 'income'),
('Event Registration', 'Registration fees from workshops, conferences, and events', 'income'),
('Sponsorships', 'Corporate and organizational sponsorships', 'income'),
('Donations', 'Individual and corporate donations', 'income'),
('Grants', 'Government and institutional grants', 'income'),
('Fundraising Events', 'Income from fundraising activities and campaigns', 'income'),
('Product Sales', 'Revenue from club merchandise and products', 'income'),
('Service Fees', 'Fees from consulting and technical services', 'income'),
('Investment Income', 'Returns from investments and savings', 'income'),
('Other Income', 'Miscellaneous income sources', 'income'),

-- Expense Categories
('Event Expenses', 'Costs for organizing workshops, conferences, and events', 'expense'),
('Equipment & Technology', 'Purchase and maintenance of equipment and technology', 'expense'),
('Marketing & Promotion', 'Advertising, promotional materials, and marketing campaigns', 'expense'),
('Travel & Transportation', 'Travel costs for events, conferences, and official business', 'expense'),
('Office Supplies', 'Stationery, printing, and general office supplies', 'expense'),
('Utilities & Communications', 'Internet, phone, electricity, and communication costs', 'expense'),
('Professional Services', 'Legal, accounting, consulting, and professional fees', 'expense'),
('Training & Development', 'Training programs, certifications, and skill development', 'expense'),
('Venue Rental', 'Costs for renting venues and facilities', 'expense'),
('Insurance', 'Insurance premiums and coverage costs', 'expense'),
('Bank Charges', 'Banking fees, transaction charges, and financial service costs', 'expense'),
('Scholarships & Awards', 'Scholarship payments and award prizes', 'expense'),
('Administrative Costs', 'General administrative and operational expenses', 'expense'),
('Other Expenses', 'Miscellaneous and unclassified expenses', 'expense')
ON CONFLICT (name) DO NOTHING;

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations_sponsorships(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_type ON donations_sponsorships(donation_type);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations_sponsorships(donor_name);
CREATE INDEX IF NOT EXISTS idx_financial_reports_period ON financial_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_financial_reports_type ON financial_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_number ON payment_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_date ON payment_receipts(payment_date);
CREATE INDEX IF NOT EXISTS idx_audit_trail_table ON financial_audit_trail(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON financial_audit_trail(timestamp);

-- Create Functions for Financial Calculations
CREATE OR REPLACE FUNCTION update_budget_variance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update variance calculations when actual amounts change
    NEW.variance_amount = NEW.actual_amount - NEW.budgeted_amount;
    
    IF NEW.budgeted_amount != 0 THEN
        NEW.variance_percentage = (NEW.variance_amount / NEW.budgeted_amount) * 100;
    ELSE
        NEW.variance_percentage = 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger for Budget Variance Updates
DROP TRIGGER IF EXISTS trigger_update_budget_variance ON budget_line_items;
CREATE TRIGGER trigger_update_budget_variance
    BEFORE UPDATE ON budget_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_variance();

-- Create Function to Update Budget Totals
CREATE OR REPLACE FUNCTION update_budget_totals(budget_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    total_income DECIMAL(15,2);
    total_expense DECIMAL(15,2);
BEGIN
    -- Calculate total income budget
    SELECT COALESCE(SUM(bli.budgeted_amount), 0) INTO total_income
    FROM budget_line_items bli
    JOIN budget_categories bc ON bli.category_id = bc.id
    WHERE bli.budget_id = budget_id_param AND bc.category_type = 'income';
    
    -- Calculate total expense budget
    SELECT COALESCE(SUM(bli.budgeted_amount), 0) INTO total_expense
    FROM budget_line_items bli
    JOIN budget_categories bc ON bli.category_id = bc.id
    WHERE bli.budget_id = budget_id_param AND bc.category_type = 'expense';
    
    -- Update budget totals
    UPDATE annual_budgets 
    SET 
        total_income_budget = total_income,
        total_expense_budget = total_expense,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = budget_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create Function for Financial Summary
CREATE OR REPLACE FUNCTION get_financial_summary(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    total_income DECIMAL(15,2),
    total_expenses DECIMAL(15,2),
    net_balance DECIMAL(15,2),
    transaction_count INTEGER,
    avg_transaction_amount DECIMAL(15,2)
) AS $$
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := DATE_TRUNC('year', CURRENT_DATE);
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE;
    END IF;
    
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN ft.transaction_type = 'income' THEN ft.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN ft.transaction_type = 'expense' THEN ft.amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN ft.transaction_type = 'income' THEN ft.amount ELSE -ft.amount END), 0) as net_balance,
        COUNT(*)::INTEGER as transaction_count,
        COALESCE(AVG(ft.amount), 0) as avg_transaction_amount
    FROM financial_transactions ft
    WHERE ft.transaction_date BETWEEN start_date AND end_date
    AND ft.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Create Function for Audit Trail
CREATE OR REPLACE FUNCTION create_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    user_id_value UUID;
    record_id_value INTEGER;
BEGIN
    -- Try to get user ID from various possible columns
    user_id_value := NULL;
    
    -- Get record ID safely
    BEGIN
        record_id_value := COALESCE(NEW.id, OLD.id);
    EXCEPTION WHEN OTHERS THEN
        record_id_value := NULL;
    END;
    
    IF TG_OP = 'DELETE' THEN
        -- For DELETE operations, try to get user from OLD record
        IF OLD IS NOT NULL THEN
            BEGIN
                user_id_value := OLD.recorded_by;
            EXCEPTION WHEN undefined_column THEN
                BEGIN
                    user_id_value := OLD.created_by;
                EXCEPTION WHEN undefined_column THEN
                    BEGIN
                        user_id_value := OLD.prepared_by;
                    EXCEPTION WHEN undefined_column THEN
                        BEGIN
                            user_id_value := OLD.issued_by;
                        EXCEPTION WHEN undefined_column THEN
                            user_id_value := NULL;
                        END;
                    END;
                END;
            END;
        END IF;
    ELSE
        -- For INSERT/UPDATE operations, try to get user from NEW record
        IF NEW IS NOT NULL THEN
            BEGIN
                user_id_value := NEW.recorded_by;
            EXCEPTION WHEN undefined_column THEN
                BEGIN
                    user_id_value := NEW.created_by;
                EXCEPTION WHEN undefined_column THEN
                    BEGIN
                        user_id_value := NEW.prepared_by;
                    EXCEPTION WHEN undefined_column THEN
                        BEGIN
                            user_id_value := NEW.issued_by;
                        EXCEPTION WHEN undefined_column THEN
                            user_id_value := NULL;
                        END;
                    END;
                END;
            END;
        END IF;
    END IF;
    
    -- Insert audit record with error handling
    BEGIN
        INSERT INTO financial_audit_trail (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id,
            timestamp
        ) VALUES (
            TG_TABLE_NAME,
            record_id_value,
            TG_OP,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
            user_id_value,
            CURRENT_TIMESTAMP
        );
    EXCEPTION WHEN OTHERS THEN
        -- If audit fails, don't block the main operation
        RAISE WARNING 'Audit trail insert failed for table %: %', TG_TABLE_NAME, SQLERRM;
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create Audit Triggers
DROP TRIGGER IF EXISTS audit_financial_transactions ON financial_transactions;
CREATE TRIGGER audit_financial_transactions
    AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

DROP TRIGGER IF EXISTS audit_donations_sponsorships ON donations_sponsorships;
CREATE TRIGGER audit_donations_sponsorships
    AFTER INSERT OR UPDATE OR DELETE ON donations_sponsorships
    FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

-- Grant Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ Financial Transparency system tables created successfully!';
    RAISE NOTICE '💰 Created tables: budget_categories, annual_budgets, budget_line_items';
    RAISE NOTICE '📊 Created tables: financial_transactions, donations_sponsorships, financial_reports';
    RAISE NOTICE '🧾 Created tables: payment_receipts, bank_accounts, financial_audit_trail';
    RAISE NOTICE '⚡ Created functions: update_budget_variance, update_budget_totals, get_financial_summary';
    RAISE NOTICE '🔍 Created audit trail system for financial transparency';
END $$;