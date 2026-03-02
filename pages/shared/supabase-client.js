/**
 * Shared Supabase Client Configuration
 */

console.log('📦 Loading Supabase client...');

const SUPABASE_URL = 'https://gakuuxwhlczhlgngcdrv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3V1eHdobGN6aGxnbmdjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzUyODksImV4cCI6MjA4MTY1MTI4OX0.wbgJik7A6qasB8FMEWZqZka8CEpZyUrSw-Ma2oLZZwM';

// Function to initialize Supabase client
function initializeSupabaseClient() {
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

// Try to initialize immediately
if (!initializeSupabaseClient()) {
    // If failed, wait for library to load
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkInterval = setInterval(() => {
        attempts++;
        console.log(`⏳ Attempt ${attempts}/${maxAttempts} to initialize Supabase...`);
        
        if (initializeSupabaseClient()) {
            clearInterval(checkInterval);
            console.log('✅ Supabase client initialized after', attempts, 'attempts');
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('❌ Failed to initialize Supabase client after', maxAttempts, 'attempts');
            console.error('Make sure the Supabase CDN script is loaded before this file');
        }
    }, 100);
}
