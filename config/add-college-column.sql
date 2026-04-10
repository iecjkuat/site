-- ============================================================
-- Migration: Add college column to members table
-- Run this in Supabase SQL Editor if you already ran the
-- original membership-schema.sql without the college column
-- ============================================================

ALTER TABLE members
    ADD COLUMN IF NOT EXISTS college TEXT NOT NULL DEFAULT 'COETEC';

-- Add a check constraint for valid college values
ALTER TABLE members
    DROP CONSTRAINT IF EXISTS members_college_check;

ALTER TABLE members
    ADD CONSTRAINT members_college_check
    CHECK (college IN ('COPAS', 'COETEC', 'COHES', 'COANRE', 'COHRED'));

-- Add index
CREATE INDEX IF NOT EXISTS idx_members_college ON members(college);

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
