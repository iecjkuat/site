-- ============================================================
-- JKUAT IEC Membership Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no          TEXT NOT NULL UNIQUE,
    full_name       TEXT NOT NULL,
    college         TEXT NOT NULL,          -- COPAS | COETEC | COHES | COANRE | COHRED
    course          TEXT NOT NULL,
    year_of_study   SMALLINT NOT NULL CHECK (year_of_study BETWEEN 1 AND 6),
    phone           TEXT NOT NULL,
    email           TEXT,                   -- must end in @students.jkuat.ac.ke if provided
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Membership payments table
CREATE TABLE IF NOT EXISTS membership_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    reg_no          TEXT NOT NULL,
    semester        TEXT NOT NULL,
    amount          INTEGER NOT NULL DEFAULT 200,
    payment_phone   TEXT NOT NULL,
    mpesa_ref       TEXT,
    checkout_id     TEXT,
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    initiated_at    TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_reg_no       ON members(reg_no);
CREATE INDEX IF NOT EXISTS idx_members_college      ON members(college);
CREATE INDEX IF NOT EXISTS idx_payments_reg_no      ON membership_payments(reg_no);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON membership_payments(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON membership_payments(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE members             ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

-- Drop any old permissive policies
DROP POLICY IF EXISTS "public_insert_members"   ON members;
DROP POLICY IF EXISTS "public_select_members"   ON members;
DROP POLICY IF EXISTS "public_insert_payments"  ON membership_payments;
DROP POLICY IF EXISTS "public_select_payments"  ON membership_payments;
DROP POLICY IF EXISTS "service_update_payments" ON membership_payments;

-- No anon access. All reads/writes go through the server service role only.

-- ── Admin role setup ──────────────────────────────────────────────────────────
-- Run this ONCE to promote the existing user to admin.
-- Replace the email below with the actual admin email in your Supabase auth.users table.
--
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'your-admin-email@example.com';
--
-- To verify it worked:
-- SELECT email, raw_user_meta_data->>'role' AS role FROM auth.users;
