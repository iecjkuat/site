-- ============================================================
-- DROP ALL TABLES IN PUBLIC SCHEMA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ⚠️  IRREVERSIBLE. Back up any data you need first.
-- ============================================================

-- Drop all tables (CASCADE handles foreign keys automatically)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.table_name);
        RAISE NOTICE 'Dropped table: %', r.table_name;
    END LOOP;
END $$;

-- Confirm
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ All tables dropped successfully'
        ELSE '⚠️  ' || COUNT(*) || ' table(s) still remain: ' ||
             string_agg(table_name, ', ')
    END AS result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
