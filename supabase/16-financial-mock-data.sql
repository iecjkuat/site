-- =============================================
-- JKUAT Innovation Club - Financial Transparency Mock Data
-- =============================================

-- Temporarily disable audit triggers for data insertion
DROP TRIGGER IF EXISTS audit_financial_transactions ON financial_transactions;
DROP TRIGGER IF EXISTS audit_donations_sponsorships ON donations_sponsorships;

-- Insert Bank Accounts
INSERT INTO bank_accounts (account_name, bank_name, account_number, account_type, current_balance, is_primary) VALUES
('JKUAT Innovation Club - Main Account', 'Kenya Commercial Bank', '1234567890', 'checking', 450000.00, true),
('JKUAT Innovation Club - Savings', 'Equity Bank', '0987654321', 'savings', 250000.00, false),
('JKUAT Innovation Club - Projects Fund', 'Co-operative Bank', '5555666677', 'checking', 180000.00, false);

-- Insert Annual Budget for 2024
INSERT INTO annual_budgets (fiscal_year, title, description, status, approved_by, approval_date, created_by) VALUES
(2024, 'JKUAT Innovation Club Budget 2024', 'Annual budget for fiscal year 2024 covering all club activities, events, and operational expenses', 'active', 
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
'2024-01-15 10:00:00',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1));

-- Insert Budget Line Items for Income
INSERT INTO budget_line_items (budget_id, category_id, item_name, description, budgeted_amount, actual_amount, quarter_q1, quarter_q2, quarter_q3, quarter_q4) VALUES
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Membership Fees'), 'Annual Membership Fees', 'Membership fees from 200 active members', 300000.00, 285000.00, 75000.00, 70000.00, 80000.00, 60000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Event Registration'), 'Workshop Registration Fees', 'Registration fees from technical workshops and training sessions', 450000.00, 420000.00, 100000.00, 120000.00, 110000.00, 90000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Sponsorships'), 'Corporate Sponsorships', 'Sponsorships from tech companies and organizations', 800000.00, 650000.00, 200000.00, 150000.00, 200000.00, 100000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Donations'), 'Individual Donations', 'Donations from alumni and supporters', 200000.00, 180000.00, 50000.00, 40000.00, 50000.00, 40000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Grants'), 'University Innovation Grant', 'Grant from JKUAT for innovation initiatives', 500000.00, 500000.00, 500000.00, 0, 0, 0),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Fundraising Events'), 'Annual Fundraising Gala', 'Revenue from annual fundraising event', 150000.00, 165000.00, 0, 0, 165000.00, 0);

-- Insert Budget Line Items for Expenses
INSERT INTO budget_line_items (budget_id, category_id, item_name, description, budgeted_amount, actual_amount, quarter_q1, quarter_q2, quarter_q3, quarter_q4) VALUES
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Event Expenses'), 'Workshop and Conference Costs', 'Costs for organizing workshops, hackathons, and conferences', 600000.00, 550000.00, 150000.00, 140000.00, 160000.00, 100000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Equipment & Technology'), 'Lab Equipment and Software', 'Purchase of 3D printers, VR headsets, and software licenses', 400000.00, 380000.00, 200000.00, 80000.00, 100000.00, 0),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Marketing & Promotion'), 'Marketing and Publicity', 'Social media ads, posters, banners, and promotional materials', 150000.00, 135000.00, 35000.00, 40000.00, 30000.00, 30000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Travel & Transportation'), 'Travel for Competitions', 'Travel costs for national and international competitions', 200000.00, 185000.00, 50000.00, 45000.00, 60000.00, 30000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Office Supplies'), 'Stationery and Supplies', 'Office supplies, printing, and general materials', 80000.00, 72000.00, 18000.00, 20000.00, 18000.00, 16000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Venue Rental'), 'Event Venue Costs', 'Rental costs for event venues and facilities', 180000.00, 165000.00, 45000.00, 40000.00, 50000.00, 30000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Training & Development'), 'Member Training Programs', 'Training workshops and certification programs for members', 120000.00, 110000.00, 30000.00, 25000.00, 35000.00, 20000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Scholarships & Awards'), 'Innovation Awards and Scholarships', 'Prize money and scholarships for outstanding members', 100000.00, 95000.00, 25000.00, 20000.00, 30000.00, 20000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Administrative Costs'), 'Administrative Expenses', 'General administrative and operational costs', 90000.00, 82000.00, 22000.00, 20000.00, 20000.00, 20000.00),
((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Bank Charges'), 'Banking Fees', 'Bank charges and transaction fees', 30000.00, 26000.00, 7000.00, 6000.00, 7000.00, 6000.00);

-- Update budget totals
SELECT update_budget_totals((SELECT id FROM annual_budgets WHERE fiscal_year = 2024 LIMIT 1));

-- Insert Sample Financial Transactions (Income)
INSERT INTO financial_transactions (transaction_type, category_id, budget_line_item_id, amount, description, transaction_date, reference_number, payment_method, bank_account, receipt_number, status, recorded_by, approved_by, approval_date) VALUES
-- Membership Fees
('income', (SELECT id FROM budget_categories WHERE name = 'Membership Fees'), (SELECT id FROM budget_line_items WHERE item_name = 'Annual Membership Fees' LIMIT 1), 15000.00, 'Membership fees - January batch (30 members)', '2024-01-15', 'MEM-2024-001', 'mpesa', 'KCB-1234567890', 'RCP-2024-001', 'completed', 
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-01-15 14:00:00'),

('income', (SELECT id FROM budget_categories WHERE name = 'Membership Fees'), (SELECT id FROM budget_line_items WHERE item_name = 'Annual Membership Fees' LIMIT 1), 25000.00, 'Membership fees - February batch (50 members)', '2024-02-10', 'MEM-2024-002', 'bank_transfer', 'KCB-1234567890', 'RCP-2024-002', 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-02-10 10:00:00'),

-- Event Registration
('income', (SELECT id FROM budget_categories WHERE name = 'Event Registration'), (SELECT id FROM budget_line_items WHERE item_name = 'Workshop Registration Fees' LIMIT 1), 85000.00, 'Workshop registration - AI & Machine Learning Workshop (85 participants)', '2024-03-05', 'EVT-2024-001', 'mpesa', 'KCB-1234567890', 'RCP-2024-003', 'completed',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-03-05 16:00:00'),

('income', (SELECT id FROM budget_categories WHERE name = 'Event Registration'), (SELECT id FROM budget_line_items WHERE item_name = 'Workshop Registration Fees' LIMIT 1), 120000.00, 'Annual Tech Conference registration (200 participants)', '2024-06-15', 'EVT-2024-002', 'bank_transfer', 'KCB-1234567890', 'RCP-2024-004', 'completed',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-06-15 11:00:00'),

-- Sponsorships
('income', (SELECT id FROM budget_categories WHERE name = 'Sponsorships'), (SELECT id FROM budget_line_items WHERE item_name = 'Corporate Sponsorships' LIMIT 1), 200000.00, 'Platinum sponsorship - Safaricom PLC for Annual Tech Conference', '2024-02-20', 'SPO-2024-001', 'bank_transfer', 'KCB-1234567890', 'RCP-2024-005', 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-02-20 09:00:00'),

('income', (SELECT id FROM budget_categories WHERE name = 'Sponsorships'), (SELECT id FROM budget_line_items WHERE item_name = 'Corporate Sponsorships' LIMIT 1), 150000.00, 'Gold sponsorship - Microsoft Kenya for Innovation Challenge', '2024-04-10', 'SPO-2024-002', 'bank_transfer', 'KCB-1234567890', 'RCP-2024-006', 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-04-10 14:00:00'),

-- Grants
('income', (SELECT id FROM budget_categories WHERE name = 'Grants'), (SELECT id FROM budget_line_items WHERE item_name = 'University Innovation Grant' LIMIT 1), 500000.00, 'JKUAT Innovation Grant 2024 - University allocation for innovation initiatives', '2024-01-30', 'GRT-2024-001', 'bank_transfer', 'KCB-1234567890', 'RCP-2024-007', 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-01-30 10:00:00');

-- Insert Sample Financial Transactions (Expenses)
INSERT INTO financial_transactions (transaction_type, category_id, budget_line_item_id, amount, description, transaction_date, reference_number, payment_method, bank_account, invoice_number, vendor_supplier, status, recorded_by, approved_by, approval_date) VALUES
-- Event Expenses
('expense', (SELECT id FROM budget_categories WHERE name = 'Event Expenses'), (SELECT id FROM budget_line_items WHERE item_name = 'Workshop and Conference Costs' LIMIT 1), 120000.00, 'AI Workshop - Venue, catering, materials, and speaker fees', '2024-03-10', 'EXP-2024-001', 'bank_transfer', 'KCB-1234567890', 'INV-2024-001', 'JKUAT Conference Center', 'completed',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-03-08 15:00:00'),

('expense', (SELECT id FROM budget_categories WHERE name = 'Event Expenses'), (SELECT id FROM budget_line_items WHERE item_name = 'Workshop and Conference Costs' LIMIT 1), 180000.00, 'Annual Tech Conference - Full event organization costs', '2024-06-20', 'EXP-2024-002', 'bank_transfer', 'KCB-1234567890', 'INV-2024-002', 'Event Masters Kenya', 'completed',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-06-18 10:00:00'),

-- Equipment & Technology
('expense', (SELECT id FROM budget_categories WHERE name = 'Equipment & Technology'), (SELECT id FROM budget_line_items WHERE item_name = 'Lab Equipment and Software' LIMIT 1), 180000.00, 'Purchase of 2 professional 3D printers for innovation lab', '2024-02-15', 'EXP-2024-003', 'bank_transfer', 'KCB-1234567890', 'INV-2024-003', 'TechHub Kenya Ltd', 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-02-13 11:00:00'),

('expense', (SELECT id FROM budget_categories WHERE name = 'Equipment & Technology'), (SELECT id FROM budget_line_items WHERE item_name = 'Lab Equipment and Software' LIMIT 1), 120000.00, 'VR headsets and development software licenses', '2024-05-20', 'EXP-2024-004', 'bank_transfer', 'KCB-1234567890', 'INV-2024-004', 'Virtual Reality Solutions', 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-05-18 14:00:00'),

-- Marketing & Promotion
('expense', (SELECT id FROM budget_categories WHERE name = 'Marketing & Promotion'), (SELECT id FROM budget_line_items WHERE item_name = 'Marketing and Publicity' LIMIT 1), 45000.00, 'Social media advertising campaign for Tech Conference', '2024-05-01', 'EXP-2024-005', 'mpesa', 'KCB-1234567890', 'INV-2024-005', 'Digital Marketing Pro', 'completed',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-04-29 16:00:00'),

-- Travel & Transportation
('expense', (SELECT id FROM budget_categories WHERE name = 'Travel & Transportation'), (SELECT id FROM budget_line_items WHERE item_name = 'Travel for Competitions' LIMIT 1), 85000.00, 'Travel costs for National Innovation Challenge - Nairobi (10 members)', '2024-04-15', 'EXP-2024-006', 'bank_transfer', 'KCB-1234567890', 'INV-2024-006', 'Swift Travel Agency', 'completed',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-04-13 09:00:00'),

-- Scholarships & Awards
('expense', (SELECT id FROM budget_categories WHERE name = 'Scholarships & Awards'), (SELECT id FROM budget_line_items WHERE item_name = 'Innovation Awards and Scholarships' LIMIT 1), 50000.00, 'Innovation Challenge prizes - 1st, 2nd, 3rd place winners', '2024-07-10', 'EXP-2024-007', 'mpesa', 'KCB-1234567890', NULL, 'Prize Winners', 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), '2024-07-10 15:00:00');

-- Insert Donations and Sponsorships
INSERT INTO donations_sponsorships (donor_type, donor_name, donor_email, donor_phone, donation_type, amount, donation_date, purpose, acknowledgment_sent, acknowledgment_date, acknowledgment_method, public_recognition, status, created_by) VALUES
('corporate', 'Safaricom PLC', 'corporate@safaricom.co.ke', '+254722000000', 'sponsorship', 200000.00, '2024-02-20', 'Platinum sponsorship for Annual Tech Conference 2024', true, '2024-02-22', 'email', true, 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('corporate', 'Microsoft Kenya', 'kenya@microsoft.com', '+254733000000', 'sponsorship', 150000.00, '2024-04-10', 'Gold sponsorship for Innovation Challenge', true, '2024-04-12', 'email', true, 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('corporate', 'Google Developer Groups Kenya', 'gdg@google.com', '+254744000000', 'services', 80000.00, '2024-03-15', 'Technical training and mentorship services', true, '2024-03-17', 'certificate', true, 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('individual', 'Dr. James Mwangi', 'james.mwangi@alumni.jkuat.ac.ke', '+254755000000', 'cash', 50000.00, '2024-05-20', 'General support for club activities', true, '2024-05-22', 'letter', true, 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('individual', 'Anonymous Donor', NULL, NULL, 'cash', 30000.00, '2024-06-10', 'Scholarship fund for underprivileged students', true, '2024-06-12', 'email', false, 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('organization', 'Kenya ICT Authority', 'info@icta.go.ke', '+254766000000', 'equipment', 120000.00, '2024-07-05', 'Donation of IoT development kits and sensors', true, '2024-07-08', 'public_recognition', true, 'completed',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1));

-- Insert Payment Receipts
INSERT INTO payment_receipts (receipt_number, payer_name, payer_email, payer_phone, amount, payment_date, payment_method, payment_reference, description, email_sent, email_sent_date, status, issued_by) VALUES
('RCP-2024-001', 'John Kamau', 'john.kamau@student.jkuat.ac.ke', '+254712345678', 500.00, '2024-01-15', 'mpesa', 'QAB1CD2EF3', 'Annual membership fee 2024', true, '2024-01-15 14:30:00', 'sent',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('RCP-2024-002', 'Mary Wanjiku', 'mary.wanjiku@student.jkuat.ac.ke', '+254723456789', 500.00, '2024-02-10', 'mpesa', 'QBC2DE3FG4', 'Annual membership fee 2024', true, '2024-02-10 10:30:00', 'sent',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('RCP-2024-003', 'Peter Omondi', 'peter.omondi@student.jkuat.ac.ke', '+254734567890', 1000.00, '2024-03-05', 'mpesa', 'QCD3EF4GH5', 'AI Workshop registration fee', true, '2024-03-05 16:30:00', 'sent',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)),

('RCP-2024-004', 'Grace Akinyi', 'grace.akinyi@student.jkuat.ac.ke', '+254745678901', 600.00, '2024-06-15', 'bank_transfer', 'TRF123456', 'Tech Conference early bird registration', true, '2024-06-15 11:30:00', 'sent',
(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)),

('RCP-2024-005', 'Safaricom PLC', 'corporate@safaricom.co.ke', '+254722000000', 200000.00, '2024-02-20', 'bank_transfer', 'TRF789012', 'Platinum sponsorship - Annual Tech Conference', true, '2024-02-20 09:30:00', 'sent',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1));

-- Insert Financial Report
INSERT INTO financial_reports (report_type, report_period_start, report_period_end, fiscal_year, title, summary, total_income, total_expenses, net_balance, opening_balance, closing_balance, cash_on_hand, bank_balance, status, prepared_by, approved_by, published_date) VALUES
('quarterly', '2024-01-01', '2024-03-31', 2024, 'Q1 2024 Financial Report', 
'First quarter financial report showing strong income from membership fees, sponsorships, and university grant. Major expenses included equipment purchases and event organization. Overall positive cash flow with healthy reserves.',
925000.00, 345000.00, 580000.00, 300000.00, 880000.00, 50000.00, 830000.00, 'published',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
'2024-04-15 10:00:00'),

('quarterly', '2024-04-01', '2024-06-30', 2024, 'Q2 2024 Financial Report',
'Second quarter report highlighting successful Tech Conference with strong registration and sponsorship income. Equipment and technology investments completed. Continued positive financial performance.',
270000.00, 385000.00, -115000.00, 880000.00, 765000.00, 45000.00, 720000.00, 'published',
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
'2024-07-15 10:00:00');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Financial transparency mock data inserted successfully!';
    RAISE NOTICE '💰 Created annual budget with income and expense line items';
    RAISE NOTICE '📊 Added 14 sample financial transactions (income and expenses)';
    RAISE NOTICE '🎁 Added 6 donations and sponsorships records';
    RAISE NOTICE '🧾 Added 5 payment receipts';
    RAISE NOTICE '📈 Added 2 quarterly financial reports';
    RAISE NOTICE '🏦 Added 3 bank accounts';
END $$;

-- Re-enable audit triggers after data insertion
CREATE TRIGGER audit_financial_transactions
    AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

CREATE TRIGGER audit_donations_sponsorships
    AFTER INSERT OR UPDATE OR DELETE ON donations_sponsorships
    FOR EACH ROW EXECUTE FUNCTION create_audit_trail();