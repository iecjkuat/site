-- =====================================================
-- JKUAT Innovation Club - Payment Integration Migrations
-- Run these in your Supabase SQL Editor
-- =====================================================

-- 1. Add membership tracking columns to users table
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status VARCHAR(20) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_valid_until DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;

-- Add check constraint for membership status
ALTER TABLE users ADD CONSTRAINT check_membership_status 
  CHECK (membership_status IN ('active', 'inactive', 'expired', 'suspended'));

COMMENT ON COLUMN users.membership_status IS 'Current membership status: active, inactive, expired, or suspended';
COMMENT ON COLUMN users.membership_type IS 'Type of membership: monthly, semester, or annual';
COMMENT ON COLUMN users.membership_valid_until IS 'Date when membership expires';
COMMENT ON COLUMN users.last_payment_date IS 'Date of last successful payment';

-- 2. Add receipt and notification tracking to payments table
-- =====================================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS auto_activated BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN payments.receipt_url IS 'URL to receipt PDF (if generated)';
COMMENT ON COLUMN payments.receipt_number IS 'Unique receipt number (e.g., RCP-20240101-000001)';
COMMENT ON COLUMN payments.notification_sent IS 'Whether notification was sent to user';
COMMENT ON COLUMN payments.auto_activated IS 'Whether membership was auto-activated';

-- 3. Create payment_receipts table for detailed receipt storage
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  receipt_data JSONB NOT NULL,
  pdf_url TEXT,
  viewed_at TIMESTAMP,
  downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_payment_receipt UNIQUE(payment_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_id ON payment_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_receipt_number ON payment_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_created_at ON payment_receipts(created_at DESC);

COMMENT ON TABLE payment_receipts IS 'Stores detailed receipt information for payments';
COMMENT ON COLUMN payment_receipts.receipt_data IS 'Complete receipt details in JSON format';
COMMENT ON COLUMN payment_receipts.pdf_url IS 'URL to generated PDF receipt (optional)';
COMMENT ON COLUMN payment_receipts.viewed_at IS 'When user first viewed the receipt';
COMMENT ON COLUMN payment_receipts.downloaded_at IS 'When user downloaded the receipt';

-- 4. Add indexes to payments table for better query performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payments_user_id_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_number ON payments(receipt_number);

-- 5. Add indexes to users table for membership queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON users(membership_status);
CREATE INDEX IF NOT EXISTS idx_users_membership_valid_until ON users(membership_valid_until);

-- =====================================================
-- Verification Queries
-- Run these to verify the migrations were successful
-- =====================================================

-- Check users table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('membership_status', 'membership_type', 'membership_valid_until', 'last_payment_date')
ORDER BY column_name;

-- Check payments table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name IN ('receipt_url', 'receipt_number', 'notification_sent', 'auto_activated')
ORDER BY column_name;

-- Check payment_receipts table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'payment_receipts';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('users', 'payments', 'payment_receipts')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- Sample Data Queries (Optional - for testing)
-- =====================================================

-- View users with active memberships
SELECT id, name, email, membership_status, membership_type, membership_valid_until
FROM users
WHERE membership_status = 'active'
ORDER BY membership_valid_until DESC;

-- View recent payments with receipts
SELECT 
  p.id,
  p.user_id,
  p.amount,
  p.payment_type,
  p.status,
  p.receipt_number,
  p.auto_activated,
  p.notification_sent,
  p.created_at
FROM payments p
WHERE p.status = 'completed'
ORDER BY p.created_at DESC
LIMIT 10;

-- View payment receipts
SELECT 
  pr.receipt_number,
  pr.payment_id,
  pr.viewed_at,
  pr.created_at,
  p.amount,
  p.payment_type,
  u.name as payer_name
FROM payment_receipts pr
JOIN payments p ON pr.payment_id = p.id
JOIN users u ON p.user_id = u.id
ORDER BY pr.created_at DESC
LIMIT 10;

-- =====================================================
-- Rollback Script (Use only if you need to undo changes)
-- =====================================================

/*
-- WARNING: This will delete all data in payment_receipts table
-- and remove the new columns from users and payments tables

-- Drop payment_receipts table
DROP TABLE IF EXISTS payment_receipts CASCADE;

-- Remove columns from payments table
ALTER TABLE payments DROP COLUMN IF EXISTS receipt_url;
ALTER TABLE payments DROP COLUMN IF EXISTS receipt_number;
ALTER TABLE payments DROP COLUMN IF EXISTS notification_sent;
ALTER TABLE payments DROP COLUMN IF EXISTS auto_activated;

-- Remove columns from users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_membership_status;
ALTER TABLE users DROP COLUMN IF EXISTS membership_status;
ALTER TABLE users DROP COLUMN IF EXISTS membership_type;
ALTER TABLE users DROP COLUMN IF EXISTS membership_valid_until;
ALTER TABLE users DROP COLUMN IF EXISTS last_payment_date;

-- Drop indexes
DROP INDEX IF EXISTS idx_payments_user_id_status;
DROP INDEX IF EXISTS idx_payments_payment_type;
DROP INDEX IF EXISTS idx_payments_created_at;
DROP INDEX IF EXISTS idx_payments_receipt_number;
DROP INDEX IF EXISTS idx_users_membership_status;
DROP INDEX IF EXISTS idx_users_membership_valid_until;
*/
