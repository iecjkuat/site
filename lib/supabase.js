const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Admin client with service key for admin operations (God Mode - Bypasses RLS)
// Use ONLY for: admin.createUser, admin.deleteUser, admin.generateLink, admin.updateUserById
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Public client with anon key for user authentication (Respects RLS)
// Use for: auth.signInWithPassword, auth.signUp, and any user-facing operations
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to get authenticated client for user requests (Respects RLS)
// SECURITY: Never escalate to admin when token is missing
const getAuthenticatedClient = (token) => {
  if (!token) {
    // Return anon client, never escalate to admin
    return supabaseAnon;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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

// Explicit admin client getter (for clarity when admin is truly needed)
const getAdminClient = () => supabaseAdmin;

// Client-side configuration for frontend
const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

module.exports = {
  supabaseAdmin,    // Admin operations only
  supabaseAnon,     // User auth operations
  getAuthenticatedClient,
  getAdminClient,
  supabaseConfig
};