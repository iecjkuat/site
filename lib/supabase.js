const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('⚠️  Missing Supabase environment variables — set SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY');
}

// Use placeholder URLs so createClient doesn't throw — requests will fail gracefully
const url = supabaseUrl || 'https://placeholder.supabase.co';
const serviceKey = supabaseServiceKey || 'placeholder';
const anonKey = supabaseAnonKey || 'placeholder';

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabaseAnon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const getAuthenticatedClient = (token) => {
  if (!token) return supabaseAnon;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

const getAdminClient = () => supabaseAdmin;

const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

module.exports = {
  supabaseAdmin,
  supabaseAnon,
  getAuthenticatedClient,
  getAdminClient,
  supabaseConfig
};