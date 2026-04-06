/**
 * Supabase Client ES Module
 * Provides a clean ES module interface for pages that use type="module"
 * Config is fetched from backend API to avoid hardcoding credentials
 */

let supabaseClient = null;
let configPromise = null;

/**
 * Fetch Supabase configuration from backend
 * @returns {Promise<{url: string, anonKey: string}>}
 */
async function fetchConfig() {
    if (configPromise) {
        return configPromise;
    }

    configPromise = (async () => {
        try {
            const response = await fetch('/api/config/supabase');
            if (!response.ok) {
                throw new Error('Failed to fetch Supabase config');
            }
            const config = await response.json();

            if (!config.url) {
                throw new Error('Supabase URL not provided by backend');
            }

            // Anon key is optional - some setups use it, some don't
            return {
                url: config.url,
                anonKey: config.anonKey || null
            };
        } catch (err) {
            console.error('Error fetching Supabase config:', err);
            throw err;
        }
    })();

    return configPromise;
}

/**
 * Initialize and return the Supabase client
 * @returns {Promise<Object>} Supabase client instance
 */
export async function getSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    // Load Supabase library if not already loaded
    if (typeof window.supabase === 'undefined' && typeof supabase === 'undefined') {
        await loadSupabaseScript();
    }

    // Use global supabase from CDN
    const supabaseLib = window.supabase || supabase;

    if (!supabaseLib || !supabaseLib.createClient) {
        throw new Error('Failed to load Supabase library');
    }

    // Fetch config from backend
    const config = await fetchConfig();

    supabaseClient = supabaseLib.createClient(config.url, config.anonKey || '');

    return supabaseClient;
}

/**
 * Load Supabase library from CDN
 * @returns {Promise<void>}
 */
function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.91.0/dist/umd/supabase.js';
        script.async = true;

        script.onload = () => {
            // Give it a moment to initialize
            setTimeout(resolve, 100);
        };

        script.onerror = () => {
            reject(new Error('Failed to load Supabase library'));
        };

        document.head.appendChild(script);
    });
}

/**
 * Get the current Supabase client (throws if not initialized)
 * @returns {Object} Supabase client instance
 */
export function getSupabaseSync() {
    if (!supabaseClient) {
        throw new Error('Supabase not initialized. Call getSupabase() first.');
    }
    return supabaseClient;
}

// Export both named and default exports for flexibility
export default { getSupabase, getSupabaseSync };

// Also expose as global for backwards compatibility with non-module scripts
export async function initGlobalSupabase() {
    const client = await getSupabase();
    window.supabaseClient = client;
    return client;
}