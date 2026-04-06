/**
 * Shared Supabase Client Configuration
 * Fetches config from backend API to avoid hardcoding credentials
 */

console.log('📦 Loading Supabase client...');

// Config will be fetched from backend
let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;

// Function to initialize Supabase client
async function initializeSupabaseClient() {
    // Check if already initialized
    if (window.supabase) {
        console.log('✅ Supabase client already initialized');
        return true;
    }

    // Check if Supabase library is loaded
    if (typeof supabase === 'undefined') {
        console.log('⏳ Supabase library not loaded yet...');
        return false;
    }

    // Check if createClient function exists
    if (typeof supabase.createClient !== 'function') {
        console.error('❌ Supabase library loaded but createClient not found');
        console.log('Available supabase properties:', Object.keys(supabase));
        return false;
    }

    // Fetch config from backend if not already fetched
    if (!SUPABASE_URL) {
        try {
            const response = await fetch('/api/config/supabase');
            if (!response.ok) {
                throw new Error('Failed to fetch Supabase config');
            }
            const config = await response.json();
            SUPABASE_URL = config.url;
            SUPABASE_ANON_KEY = config.anonKey || '';
            console.log('✅ Supabase config fetched from backend');
        } catch (error) {
            console.error('❌ Failed to fetch Supabase config:', error);
            return false;
        }
    }

    try {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized and available at window.supabase');
        console.log('Client type:', typeof window.supabase);
        console.log('Has .from method:', typeof window.supabase.from === 'function');
        console.log('Has .auth method:', typeof window.supabase.auth === 'object');
        return true;
    } catch (error) {
        console.error('❌ Failed to create Supabase client:', error);
        return false;
    }
}

// Try to initialize immediately (async)
initializeSupabaseClient().then(success => {
    if (!success) {
        // If failed, wait for library to load
        let attempts = 0;
        const maxAttempts = 20;

        const checkInterval = setInterval(async () => {
            attempts++;
            console.log(`⏳ Attempt ${attempts}/${maxAttempts} to initialize Supabase...`);

            if (await initializeSupabaseClient()) {
                clearInterval(checkInterval);
                console.log('✅ Supabase client initialized after', attempts, 'attempts');
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ Failed to initialize Supabase client after', maxAttempts, 'attempts');
                console.error('Make sure the Supabase CDN script is loaded before this file');
            }
        }, 100);
    }
});
