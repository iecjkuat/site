'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
        '⚠️  SUPABASE_URL and/or SUPABASE_SERVICE_KEY are not set.\n' +
        '   All database operations will fail until these are configured.'
    );
}

const url        = supabaseUrl        || 'https://placeholder.supabase.co';
const serviceKey = supabaseServiceKey || 'placeholder-service-key';

// Admin client — service role, bypasses RLS, server-side only
const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
        fetch: (input, init = {}) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);
            return fetch(input, { ...init, signal: controller.signal })
                .finally(() => clearTimeout(timer));
        },
    },
});

module.exports = { supabaseAdmin };
