/**
 * Shared Supabase Client Configuration
 */

// Initialize Supabase client if not already done
if (typeof window !== 'undefined' && !window.supabaseClient) {
    const SUPABASE_URL = 'https://your-project.supabase.co';
    const SUPABASE_ANON_KEY = 'your-anon-key';
    
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
    } else {
        console.warn('⚠️ Supabase library not loaded');
    }
}