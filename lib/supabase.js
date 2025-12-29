const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side client with service key for admin operations (God Mode)
// WARNING: Bypasses RLS. Use only for admin tasks.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to get authenticated client for user requests (Respects RLS)
const getAuthenticatedClient = (token) => {
  if (!token) return supabaseAdmin;

  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Client-side configuration for frontend
const supabaseConfig = {
  url: supabaseUrl,
  anonKey: process.env.SUPABASE_ANON_KEY
};

module.exports = {
  supabase: supabaseAdmin,
  supabaseAdmin,
  getAuthenticatedClient,
  supabaseConfig
};