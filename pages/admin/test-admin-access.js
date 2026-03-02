const SUPABASE_URL = 'https://gakuuxwhlczhlgngcdrv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3V1eHdobGN6aGxnbmdjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzUyODksImV4cCI6MjA4MTY1MTI4OX0.wbgJik7A6qasB8FMEWZqZka8CEpZyUrSw-Ma2oLZZwM';

let supabaseClient;

function log(message, type = 'info') {
    const results = document.getElementById('results');
    const div = document.createElement('div');
    div.className = `result ${type}`;
    div.innerHTML = `<pre>${message}</pre>`;
    results.appendChild(div);
}

function clearResults() {
    document.getElementById('results').innerHTML = '';
}

async function runDiagnostic() {
    clearResults();
    log('🔍 Starting diagnostic...', 'info');
    
    try {
        // Step 1: Check for custom auth token
        log('Step 1: Checking custom authentication...', 'info');
        const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (!authToken) {
            log('❌ No auth token found!', 'error');
            log('', 'info');
            log('🔧 SOLUTION: You need to sign in', 'warning');
            log('Go to /pages/auth/signin.html and login', 'warning');
            return;
        }
        
        log('✅ Auth token found', 'success');
        
        if (!storedUser) {
            log('❌ No user data found!', 'error');
            log('', 'info');
            log('🔧 SOLUTION: Sign in again', 'warning');
            log('Go to /pages/auth/signin.html and login', 'warning');
            return;
        }
        
        log('✅ User data found', 'success');
        
        const userData = JSON.parse(storedUser);
        log(`User Email: ${userData.email}`, 'info');
        log(`User ID: ${userData.id}`, 'info');
        log(`User Role: ${userData.role}`, 'info');
        
        // Step 2: Verify token with backend
        log('Step 2: Verifying token with backend...', 'info');
        const verifyResponse = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!verifyResponse.ok) {
            log('❌ Token verification failed!', 'error');
            log('Your session has expired.', 'warning');
            log('', 'info');
            log('🔧 SOLUTION: Sign in again', 'warning');
            log('Go to /pages/auth/signin.html and login', 'warning');
            return;
        }
        
        log('✅ Token verified successfully', 'success');
        const verifyData = await verifyResponse.json();
        log(`Verified user: ${verifyData.user?.email || 'unknown'}`, 'info');
        
        // Step 3: Check Supabase library
        log('Step 3: Checking Supabase library...', 'info');
        if (typeof supabase === 'undefined') {
            log('❌ ERROR: Supabase library not loaded!', 'error');
            return;
        }
        log('✅ Supabase library loaded', 'success');
        
        // Step 4: Initialize client
        log('Step 4: Initializing Supabase client...', 'info');
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        log('✅ Supabase client initialized', 'success');
        
        // Step 5: Fetch profile from database
        await checkProfile(userData.id, userData.email, userData.role);
        
    } catch (error) {
        log(`❌ Unexpected Error: ${error.message}`, 'error');
        log(`Stack: ${error.stack}`, 'error');
    }
}

async function checkProfile(userId, userEmail, userRole) {
    try {
        // Fetch profile from database
        log('Step 5: Fetching user profile from database...', 'info');
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (profileError) {
            log(`⚠️ Profile fetch warning: ${profileError.message}`, 'warning');
            log('Using stored user data instead', 'info');
            log('', 'info');
            log(`Stored Role: "${userRole}"`, 'info');
        } else {
            log('✅ Profile found in database', 'success');
            log(`Full Profile Data:\n${JSON.stringify(profile, null, 2)}`, 'info');
            userRole = profile.role;
        }
        
        // Step 6: Check admin role
        log('Step 6: Checking admin role...', 'info');
        log(`Current Role: "${userRole}"`, 'info');
        log(`Role Type: ${typeof userRole}`, 'info');
        
        const adminRoles = ['admin', 'administrator', 'super_admin', 'superadmin'];
        const normalizedRole = (userRole || '').toLowerCase().trim();
        const isAdmin = adminRoles.includes(normalizedRole);
        
        log(`Normalized Role: "${normalizedRole}"`, 'info');
        log(`Accepted Admin Roles: ${adminRoles.join(', ')}`, 'info');
        
        if (isAdmin) {
            log('✅ YOU HAVE ADMIN ACCESS!', 'success');
            log('You should be able to access /pages/admin/admin.html', 'success');
        } else {
            log('❌ YOU DO NOT HAVE ADMIN ACCESS', 'error');
            log('', 'info');
            log('🔧 TO FIX: Run this SQL in Supabase SQL Editor:', 'warning');
            log(`UPDATE profiles SET role = 'admin' WHERE email = '${userEmail}';`, 'warning');
            log('', 'info');
            log('Then sign out and sign in again.', 'warning');
        }
        
        log('', 'info');
        log('✅ Diagnostic complete!', 'success');
        
    } catch (error) {
        log(`❌ Error checking profile: ${error.message}`, 'error');
    }
}

// Setup event listeners
window.addEventListener('load', () => {
    document.getElementById('runBtn').addEventListener('click', runDiagnostic);
    document.getElementById('clearBtn').addEventListener('click', clearResults);
    log('Page loaded. Click "Run Diagnostic" to check your admin access.', 'info');
});
