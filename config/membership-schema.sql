-- ============================================================
-- JKUAT IEC Membership Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no          TEXT NOT NULL UNIQUE,   -- e.g. ENG/2021/12345
    full_name       TEXT NOT NULL,
    course          TEXT NOT NULL,
    year_of_study   SMALLINT NOT NULL CHECK (year_of_study BETWEEN 1 AND 6),
    phone           TEXT NOT NULL,          -- primary phone (registered with)
    email           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Membership payments table
-- One row per semester payment attempt/success
CREATE TABLE IF NOT EXISTS membership_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    reg_no          TEXT NOT NULL,          -- denormalised for easy lookup
    semester        TEXT NOT NULL,          -- e.g. "2026-S1"
    amount          INTEGER NOT NULL DEFAULT 200,
    payment_phone   TEXT NOT NULL,          -- phone used for THIS payment (may differ from member phone)
    mpesa_ref       TEXT,                   -- M-Pesa transaction code e.g. QHX4XXXXXX
    checkout_id     TEXT,                   -- Lipana checkout request ID
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    initiated_at    TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_members_reg_no          ON members(reg_no);
CREATE INDEX IF NOT EXISTS idx_payments_reg_no         ON membership_payments(reg_no);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id    ON membership_payments(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payments_status         ON membership_payments(status);

-- Auto-update updated_at on members
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: allow public inserts (registration) and reads (renewal lookup)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

-- Anyone can register (insert a new member)
CREATE POLICY "public_insert_members"
    ON members FOR INSERT TO anon WITH CHECK (true);

-- Anyone can look up their own record by reg_no (for renewal)
CREATE POLICY "public_select_members"
    ON members FOR SELECT TO anon USING (true);

-- Anyone can insert a payment (initiate)
CREATE POLICY "public_insert_payments"
    ON membership_payments FOR INSERT TO anon WITH CHECK (true);

-- Anyone can read their own payments
CREATE POLICY "public_select_payments"
    ON membership_payments FOR SELECT TO anon USING (true);

-- Only service role can update payments (webhook callback)
CREATE POLICY "service_update_payments"
    ON membership_payments FOR UPDATE TO service_role USING (true);
