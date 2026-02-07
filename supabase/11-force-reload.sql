-- Force PostgREST schema cache reload
-- Run this and then wait 5-10 seconds before testing

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Alternative: You can also try restarting the PostgREST service
-- from Supabase dashboard or wait a few minutes for auto-refresh
