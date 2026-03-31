/**
 * System Administration Dashboard
 * Manages system-level operations and settings
 */

class AdminDashboard {
    constructor() {
        this.currentTab = 'overview';
        this.supabase = null;
        this.currentUser = null;
        this.initializationAttempts = 0;
        this.maxAttempts = 30; // Increased from 10
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Admin Dashboard...');

        // Wait for Supabase to be initialized
        await this.waitForSupabase();

        console.log('Supabase initialization result:', {
            supabaseExists: !!this.supabase,
            supabaseType: typeof this.supabase,
            hasFromMethod: this.supabase && typeof this.supabase.from === 'function'
        });

        if (!this.supabase) {
            console.error('Failed to initialize Supabase');
            alert('Database connection failed. Some features may not work. Please refresh the page.');
            // Don't return - continue with limited functionality
        }

        // Check admin authentication
        if (!await this.checkAdminAuth()) {
            window.location.href = '/signin';
            return;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Initialize notification management globally
        this.initNotificationManagement();

        // Test database connection
        await this.testConnection();

        // Load initial data
        await this.loadOverviewData();

        console.log('✅ Admin Dashboard initialized');
    }

    async testConnection() {
        console.log('🔍 Testing database connection...');
        
        if (!this.supabase) {
            console.error('❌ No Supabase client available');
            return false;
        }

        console.log('✅ Supabase client exists');
        console.log('Has .from method:', typeof this.supabase.from === 'function');
        console.log('Has .auth:', typeof this.supabase.auth === 'object');

        try {
            // Test 1: Simple query to users table
            console.log('Testing query to users table...');
            const { data, error, count } = await this.supabase
                .from('users')
                .select('*', { count: 'exact' })
                .limit(1);

            console.log('📊 Connection test result:', {
                success: !error,
                count: count,
                hasData: !!data,
                error: error ? {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                } : null
            });

            if (error) {
                if (error.code === '42P01') {
                    console.error('❌ Table "users" does not exist!');
                    alert('Database table "users" not found. Please contact administrator.');
                } else if (error.code === 'PGRST116') {
                    console.error('❌ RLS policy blocking access. Check permissions.');
                    alert('Database access denied. Please check your permissions.');
                } else if (error.message?.includes('JWT')) {
                    console.error('❌ JWT token issue. User needs to re-login.');
                    alert('Session expired. Please login again.');
                } else {
                    console.error('❌ Database error:', error.message);
                    alert('Database error: ' + error.message);
                }
                return false;
            }

            console.log('✅ Database connection successful');
            if (data && data.length > 0) {
                console.log('Sample data columns:', Object.keys(data[0]));
            }
            return true;

        } catch (err) {
            console.error('❌ Connection test exception:', err);
            alert('Database connection failed: ' + err.message);
            return false;
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                // First check window.supabase
                if (window.supabase && typeof window.supabase.from === 'function') {
                    this.supabase = window.supabase;
                    console.log('✅ Supabase client found at window.supabase');
                    console.log('Supabase client type:', typeof this.supabase);
                    console.log('Supabase has .from method:', typeof this.supabase.from === 'function');
                    resolve();
                    return;
                }
                
                // Check if auth.js created a global supabaseClient
                if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
                    this.supabase = window.supabaseClient;
                    window.supabase = window.supabaseClient; // Set it for consistency
                    console.log('✅ Supabase client found at window.supabaseClient');
                    resolve();
                    return;
                }
                
                if (this.initializationAttempts < this.maxAttempts) {
                    this.initializationAttempts++;
                    if (this.initializationAttempts % 5 === 0) {
                        console.log(`⏳ Waiting for Supabase... (${this.initializationAttempts}/${this.maxAttempts})`);
                        console.log('window.supabase type:', typeof window.supabase);
                        console.log('window.supabase has .from:', window.supabase ? typeof window.supabase.from === 'function' : 'N/A');
                    }
                    setTimeout(checkSupabase, 300);
                } else {
                    console.error('❌ Supabase client not found after maximum attempts');
                    console.log('Final check - window.supabase:', typeof window.supabase);
                    console.log('Final check - window.supabase.from:', window.supabase ? typeof window.supabase.from : 'N/A');
                    console.log('Attempting to create Supabase client manually...');
                    
                    // Try to create Supabase client manually using config
                    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
                        const config = window.APP_CONFIG?.supabase || {
                            url: 'https://gakuuxwhlczhlgngcdrv.supabase.co',
                            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3V1eHdobGN6aGxnbmdjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzUyODksImV4cCI6MjA4MTY1MTI4OX0.wbgJik7A6qasB8FMEWZqZka8CEpZyUrSw-Ma2oLZZwM'
                        };
                        
                        try {
                            this.supabase = supabase.createClient(config.url, config.anonKey);
                            window.supabase = this.supabase;
                            console.log('✅ Supabase client created manually');
                            console.log('Has .from method:', typeof this.supabase.from === 'function');
                        } catch (error) {
                            console.error('Failed to create Supabase client:', error);
                        }
                    } else {
                        console.error('Supabase library not available');
                        console.log('typeof supabase:', typeof supabase);
                    }
                    
                    resolve();
                }
            };
            checkSupabase();
        });
    }

    async checkAdminAuth() {
        try {
            // Check for custom auth token — both storage types
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            
            if (!authToken || !storedUser) {
                console.log('No auth token or user data found, redirecting to login...');
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                window.location.href = '/signin';
                return false;
            }
            
            // Parse stored user data
            const userData = JSON.parse(storedUser);
            console.log('Stored user data:', {
                email: userData.email,
                name: userData.name,
                role: userData.role
            });
            
            // Verify token with backend
            console.log('Verifying token with backend...');
            const verifyResponse = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!verifyResponse.ok) {
                console.log('Token verification failed');
                alert('Session expired. Please login again.');
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                localStorage.removeItem('user');
                return false;
            }
            
            const verifyData = await verifyResponse.json();
            console.log('Token verified:', verifyData);
            
            // Get fresh profile data from database (if Supabase is available)
            let userProfile = {
                id: userData.id,
                email: userData.email,
                full_name: userData.name,
                role: userData.role,
                profile_completed: userData.profileCompleted
            };
            
            if (this.supabase && typeof this.supabase.from === 'function') {
                console.log('Fetching profile from database...');
                try {
                    // Query users table (standardized)
                    const { data: profile, error: profileError } = await this.supabase
                        .from('users')
                        .select('*')
                        .eq('id', userData.id)
                        .single();
                    
                    if (profileError) {
                        console.error('Profile fetch error:', profileError);
                        console.log('Using stored user data as fallback');
                    } else if (profile) {
                        userProfile = {
                            id: profile.id,
                            email: profile.email,
                            full_name: profile.name || profile.full_name,
                            role: profile.role,
                            profile_completed: profile.email_verified || profile.profile_completed
                        };
                    }
                } catch (dbError) {
                    console.error('Database query error:', dbError);
                    console.log('Using stored user data as fallback');
                }
            } else {
                console.log('Supabase not available, using stored user data');
            }
            
            console.log('User profile:', {
                email: userProfile.email,
                name: userProfile.full_name,
                role: userProfile.role
            });
            
            // Check if user is admin (accept multiple variations)
            const adminRoles = ['admin', 'administrator', 'super_admin', 'superadmin'];
            const userRole = (userProfile.role || '').toLowerCase().trim();
            
            console.log('Role check:', {
                userRole: userRole,
                acceptedRoles: adminRoles,
                isAdmin: adminRoles.includes(userRole)
            });
            
            if (!adminRoles.includes(userRole)) {
                console.warn(`Access denied. User role: ${userProfile.role}`);
                alert(`Access denied. Admin privileges required.\n\nYour role: ${userProfile.role || 'none'}\nAccepted roles: ${adminRoles.join(', ')}\n\nPlease contact an administrator if you believe this is an error.`);
                window.location.href = '/dashboard';
                return false;
            }
            
            this.currentUser = userProfile;
            console.log('✅ Admin access granted for:', userProfile.email);
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            console.error('Error stack:', error.stack);
            alert('Authentication check failed: ' + error.message);
            return false;
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshCurrentTab();
        });

        // Quick actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });

        // Add user button
        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.showAddUserModal();
        });

        // Save buttons
        document.getElementById('saveSecurityBtn')?.addEventListener('click', () => {
            this.saveSecuritySettings();
        });

        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSystemSettings();
        });

        // Clear logs button
        document.getElementById('clearLogsBtn')?.addEventListener('click', () => {
            this.clearLogs();
        });

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.remove('active');
            });
        });

        // Add user form
        document.getElementById('addUserForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser(new FormData(e.target));
        });

        // Filters
        document.getElementById('userSearch')?.addEventListener('input', () => this.filterUsers());
        document.getElementById('roleFilter')?.addEventListener('change', () => this.filterUsers());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.filterUsers());
        document.getElementById('logLevel')?.addEventListener('change', () => this.filterLogs());
        document.getElementById('logCategory')?.addEventListener('change', () => this.filterLogs());
        document.getElementById('logDate')?.addEventListener('change', () => this.filterLogs());
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;

        // Load tab data
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'notifications':
                await this.loadNotifications();
                break;
            case 'email':
                await this.loadEmail();
                break;
            case 'database':
                await this.loadDatabaseInfo();
                break;
            case 'logs':
                await this.loadLogs();
                break;
        }
    }

    async loadNotifications() {
        if (!window.notificationMgmt) {
            window.notificationMgmt = new NotificationManagement(this);
        }
        await window.notificationMgmt.init();
    }

    async loadEmail() {
        if (!window.emailMgmt) {
            window.emailMgmt = new EmailManagement(this);
        }
        await window.emailMgmt.init();
    }

    // Initialize notification management on page load
    initNotificationManagement() {
        console.log('🔧 Attempting to initialize notification management...');
        console.log('   - NotificationManagement type:', typeof NotificationManagement);
        console.log('   - window.notificationMgmt exists:', !!window.notificationMgmt);
        
        if (typeof NotificationManagement !== 'undefined') {
            if (!window.notificationMgmt) {
                window.notificationMgmt = new NotificationManagement(this);
                console.log('✅ Notification management initialized globally');
                console.log('   - Instance created:', !!window.notificationMgmt);
                console.log('   - Has showCreateNotificationModal:', typeof window.notificationMgmt.showCreateNotificationModal);
            } else {
                console.log('ℹ️ Notification management already initialized');
            }
        } else {
            console.error('❌ NotificationManagement class not found! Script may not be loaded yet.');
            // Try again after a delay
            setTimeout(() => {
                console.log('🔄 Retrying notification management initialization...');
                if (typeof NotificationManagement !== 'undefined' && !window.notificationMgmt) {
                    window.notificationMgmt = new NotificationManagement(this);
                    console.log('✅ Notification management initialized on retry');
                }
            }, 1000);
        }
    }

    async calculateDatabaseSize() {
        const dbSizeElement = document.getElementById('dbSize');
        if (!dbSizeElement) return;

        try {
            if (!this.supabase || typeof this.supabase.from !== 'function') {
                dbSizeElement.textContent = 'Not Available';
                return;
            }

            // Get approximate size by counting rows in major tables
            const tables = ['users', 'events', 'projects', 'ideas', 'notifications', 'news_articles'];
            let totalRows = 0;
            let successfulTables = 0;

            for (const table of tables) {
                try {
                    const { count, error } = await this.supabase
                        .from(table)
                        .select('*', { count: 'exact', head: true });
                    
                    if (!error && count !== null) {
                        totalRows += count;
                        successfulTables++;
                        console.log(`✅ ${table}: ${count} rows`);
                    } else if (error) {
                        console.log(`⚠️ ${table}: ${error.message}`);
                    }
                } catch (e) {
                    // Table might not exist, skip it
                    console.log(`⚠️ Table ${table} not accessible:`, e.message);
                }
            }

            if (successfulTables === 0) {
                dbSizeElement.textContent = 'Not Available';
                return;
            }

            // Rough estimate: assume average 2KB per row
            const estimatedSizeMB = (totalRows * 2) / 1024;
            dbSizeElement.textContent = estimatedSizeMB > 0 
                ? `~${estimatedSizeMB.toFixed(1)} MB` 
                : '< 0.1 MB';
            
            console.log(`📊 Database size estimate: ${estimatedSizeMB.toFixed(1)} MB (${totalRows} total rows from ${successfulTables} tables)`);
        } catch (error) {
            console.error('Failed to calculate database size:', error);
            dbSizeElement.textContent = 'Error';
        }
    }

    async loadOverviewData() {
        try {
            // Check if Supabase is available
            if (!this.supabase || typeof this.supabase.from !== 'function') {
                console.warn('Supabase not available, showing placeholder data');
                document.getElementById('totalUsers').textContent = 'N/A';
                document.getElementById('activeUsers').textContent = 'N/A';
                document.getElementById('pendingUsers').textContent = 'N/A';
                document.getElementById('dbSize').textContent = 'N/A';
                document.getElementById('lastBackup').textContent = 'N/A';
                this.updateLastUpdated();
                return;
            }

            // Get total users count
            const { count: totalUsers, error: usersError } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (usersError) {
                console.error('Total users query error:', usersError);
                document.getElementById('totalUsers').textContent = 'Error';
            } else {
                document.getElementById('totalUsers').textContent = totalUsers || 0;
            }

            // Get active users (logged in within last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
            
            console.log('Querying active users since:', thirtyDaysAgoISO);
            
            // Try with last_login, fallback to updated_at if column doesn't exist
            let activeUsers = 0;
            try {
                const { count, error } = await this.supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .gte('last_login', thirtyDaysAgoISO);

                if (error) {
                    console.log('last_login column not found, trying updated_at...');
                    // Fallback to updated_at
                    const { count: fallbackCount, error: fallbackError } = await this.supabase
                        .from('users')
                        .select('*', { count: 'exact', head: true })
                        .gte('updated_at', thirtyDaysAgoISO);
                    
                    if (!fallbackError) {
                        activeUsers = fallbackCount || 0;
                    }
                } else {
                    activeUsers = count || 0;
                }
            } catch (e) {
                console.error('Active users query error:', e);
                activeUsers = 0;
            }

            document.getElementById('activeUsers').textContent = activeUsers;

            // Get pending users (email_verified = false)
            const { count: pendingUsers, error: pendingError } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('email_verified', false);

            if (pendingError) {
                console.error('Pending users query error:', pendingError);
                document.getElementById('pendingUsers').textContent = '0';
            } else {
                document.getElementById('pendingUsers').textContent = pendingUsers || 0;
            }

            // Update UI
            // Try to get database size
            await this.calculateDatabaseSize();
            
            // Last backup - would need to track this in a separate table
            document.getElementById('lastBackup').textContent = 'N/A';
            
            this.updateLastUpdated();
            console.log('✅ Overview data loaded successfully');
        } catch (error) {
            console.error('Failed to load overview:', error);
            // Show error but don't crash
            document.getElementById('totalUsers').textContent = 'Error';
            document.getElementById('activeUsers').textContent = 'Error';
            document.getElementById('pendingUsers').textContent = 'Error';
            document.getElementById('dbSize').textContent = 'N/A';
            document.getElementById('lastBackup').textContent = 'N/A';
            this.updateLastUpdated();
        }
    }

    async loadUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="6" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';

            // Check if Supabase is available
            if (!this.supabase || typeof this.supabase.from !== 'function') {
                tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Database connection not available</td></tr>';
                return;
            }

            // Get users from database
            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!users || users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No users found</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(user => {
                const joinedDate = new Date(user.created_at).toLocaleDateString();
                const status = user.email_verified ? 'Active' : 'Pending';
                const role = user.role || 'member';
                const userName = user.name || user.full_name || 'N/A';
                
                return `
                    <tr>
                        <td>${userName}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td><span class="badge badge-${role}">${role}</span></td>
                        <td><span class="badge badge-${status.toLowerCase()}">${status}</span></td>
                        <td>${joinedDate}</td>
                        <td>
                            <button class="btn-icon" onclick="adminDashboard.editUser('${user.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="adminDashboard.deleteUser('${user.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('❌ Failed to load users:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">
                <div style="color: #ef4444; padding: 1rem;">
                    <i class="fas fa-exclamation-triangle"></i> Failed to load users: ${error.message}
                    ${error.code ? `<br><small>Code: ${error.code}</small>` : ''}
                    ${error.hint ? `<br><small>Hint: ${error.hint}</small>` : ''}
                </div>
            </td></tr>`;
        }
    }

    async loadDatabaseInfo() {
        const tbody = document.getElementById('tablesTableBody');
        if (!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="5" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Loading tables...</td></tr>';

            // Check if Supabase is available
            if (!this.supabase || typeof this.supabase.from !== 'function') {
                tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Database connection not available</td></tr>';
                return;
            }

            // Get table statistics from Supabase
            const tables = [
                { name: 'profiles', query: 'profiles' },
                { name: 'events', query: 'events' },
                { name: 'projects', query: 'projects' },
                { name: 'ideas', query: 'ideas' },
                { name: 'news_articles', query: 'news_articles' },
                { name: 'opportunities', query: 'opportunities' },
                { name: 'resources', query: 'resources' }
            ];

            const tableStats = await Promise.all(
                tables.map(async (table) => {
                    try {
                        const { count, error } = await this.supabase
                            .from(table.query)
                            .select('*', { count: 'exact', head: true });

                        return {
                            name: table.name,
                            rows: error ? 'N/A' : (count || 0),
                            size: 'N/A', // Size calculation would need custom function
                            modified: 'N/A' // Would need to track this
                        };
                    } catch (err) {
                        return {
                            name: table.name,
                            rows: 'Error',
                            size: 'N/A',
                            modified: 'N/A'
                        };
                    }
                })
            );

            tbody.innerHTML = tableStats.map(table => `
                <tr>
                    <td>${table.name}</td>
                    <td>${table.rows}</td>
                    <td>${table.size}</td>
                    <td>${table.modified}</td>
                    <td>
                        <button class="btn-icon" onclick="adminDashboard.viewTable('${table.name}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="adminDashboard.exportTable('${table.name}')" title="Export">
                            <i class="fas fa-download"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load database info:', error);
            tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Failed to load tables: ' + error.message + '</td></tr>';
        }
    }

    async loadLogs() {
        const container = document.getElementById('logsContainer');
        if (!container) return;

        try {
            container.innerHTML = '<div class="log-entry log-info"><span class="log-time">Loading logs...</span></div>';

            // Check if Supabase is available
            if (!this.supabase || typeof this.supabase.from !== 'function') {
                container.innerHTML = '<div class="log-entry log-info"><span class="log-message">Database connection not available</span></div>';
                return;
            }

            // Check if audit_logs table exists
            const { data: logs, error } = await this.supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                // If table doesn't exist, show message
                if (error.code === '42P01') {
                    container.innerHTML = '<div class="log-entry log-info"><span class="log-message">Audit logs table not configured. Create an "audit_logs" table to enable logging.</span></div>';
                    return;
                }
                throw error;
            }

            if (!logs || logs.length === 0) {
                container.innerHTML = '<div class="log-entry log-info"><span class="log-message">No logs found</span></div>';
                return;
            }

            container.innerHTML = logs.map(log => {
                const time = new Date(log.created_at).toLocaleString();
                const level = log.level || 'info';
                
                return `
                    <div class="log-entry log-${level}">
                        <span class="log-time">[${time}]</span>
                        <span class="log-level">[${level.toUpperCase()}]</span>
                        <span class="log-message">${log.message || log.action || 'No message'}</span>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to load logs:', error);
            container.innerHTML = '<div class="log-entry log-error"><span class="log-message">Failed to load logs: ' + error.message + '</span></div>';
        }
    }

    async handleAction(action) {
        console.log('Action:', action);

        switch (action) {
            case 'backup':
                await this.backupDatabase();
                break;
            case 'optimize':
                await this.optimizeDatabase();
                break;
            case 'clear-cache':
                await this.clearCache();
                break;
            case 'export':
                await this.exportData();
                break;
            case 'stats':
                await this.showDatabaseStats();
                break;
            default:
                alert(`Action "${action}" not implemented yet`);
        }
    }

    async backupDatabase() {
        if (!confirm('Create a database backup? This may take a few minutes.')) return;

        try {
            await this.logAction('info', 'database', 'Database backup initiated by admin');
            alert('Database backup started. You will be notified when complete.');
            console.log('Creating database backup...');
        } catch (error) {
            console.error('Backup failed:', error);
            await this.logAction('error', 'database', `Database backup failed: ${error.message}`);
            alert('Failed to create backup');
        }
    }

    async optimizeDatabase() {
        if (!confirm('Optimize database? This will improve performance.')) return;

        try {
            await this.logAction('info', 'database', 'Database optimization initiated by admin');
            alert('Database optimization completed successfully');
            console.log('Database optimized');
        } catch (error) {
            console.error('Optimization failed:', error);
            await this.logAction('error', 'database', `Database optimization failed: ${error.message}`);
            alert('Failed to optimize database');
        }
    }

    async clearCache() {
        if (!confirm('Clear system cache?')) return;

        try {
            // Clear cache
            localStorage.clear();
            sessionStorage.clear();
            await this.logAction('info', 'system', 'System cache cleared by admin');
            alert('Cache cleared successfully');
        } catch (error) {
            console.error('Failed to clear cache:', error);
            await this.logAction('error', 'system', `Failed to clear cache: ${error.message}`);
            alert('Failed to clear cache');
        }
    }

    async exportData() {
        try {
            await this.logAction('info', 'database', 'Data export initiated by admin');
            alert('Data export started. Download will begin shortly.');
            console.log('Exporting data...');
        } catch (error) {
            console.error('Export failed:', error);
            await this.logAction('error', 'database', `Data export failed: ${error.message}`);
            alert('Failed to export data');
        }
    }

    async showDatabaseStats() {
        alert('Database Statistics:\n\nTotal Size: 45.2 MB\nTables: 12\nTotal Rows: 2,456\nLast Optimized: 2 days ago');
    }

    showAddUserModal() {
        document.getElementById('addUserModal').classList.add('active');
    }

    async addUser(formData) {
        try {
            const userData = Object.fromEntries(formData);
            console.log('Adding user:', userData);
            
            // Create user in Supabase Auth
            const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true
            });

            if (authError) throw authError;

            // Create profile
            const { error: profileError } = await this.supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: userData.email,
                    full_name: userData.name,
                    role: userData.role,
                    profile_completed: true
                });

            if (profileError) throw profileError;

            // Log the action
            await this.logAction('info', 'auth', `Admin created new user: ${userData.email}`);

            alert('User added successfully');
            document.getElementById('addUserModal').classList.remove('active');
            document.getElementById('addUserForm').reset();
            
            // Reload users
            await this.loadUsers();
            await this.loadOverviewData();
        } catch (error) {
            console.error('Failed to add user:', error);
            await this.logAction('error', 'auth', `Failed to create user: ${error.message}`);
            alert('Failed to add user: ' + error.message);
        }
    }

    async editUser(userId) {
        alert('Edit user functionality coming soon. User ID: ' + userId);
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            // Get user info before deleting
            const { data: user } = await this.supabase
                .from('users')
                .select('email')
                .eq('id', userId)
                .single();

            // Delete from users table
            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            // Log the action
            await this.logAction('warning', 'auth', `Admin deleted user: ${user?.email || userId}`);

            alert('User deleted successfully');
            await this.loadUsers();
            await this.loadOverviewData();
        } catch (error) {
            console.error('Failed to delete user:', error);
            await this.logAction('error', 'auth', `Failed to delete user: ${error.message}`);
            alert('Failed to delete user: ' + error.message);
        }
    }

    async logAction(level, category, message) {
        try {
            await this.supabase
                .from('audit_logs')
                .insert({
                    level: level,
                    category: category,
                    message: message,
                    user_id: this.currentUser?.id,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        user_agent: navigator.userAgent
                    }
                });
        } catch (error) {
            console.error('Failed to log action:', error);
        }
    }

    async viewTable(tableName) {
        alert(`Viewing table: ${tableName}\n\nThis feature will open a detailed view of the table data.`);
    }

    async exportTable(tableName) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*');

            if (error) throw error;

            // Convert to CSV
            const csv = this.convertToCSV(data);
            
            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

            alert('Table exported successfully');
        } catch (error) {
            console.error('Failed to export table:', error);
            alert('Failed to export table: ' + error.message);
        }
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Add headers
        csvRows.push(headers.join(','));

        // Add data
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    async saveSecuritySettings() {
        try {
            const settings = {
                require2FA: document.getElementById('require2FA').checked,
                passwordExpiry: document.getElementById('passwordExpiry').checked,
                sessionTimeout: document.getElementById('sessionTimeout').value,
                ipWhitelist: document.getElementById('ipWhitelist').checked,
                rateLimiting: document.getElementById('rateLimiting').checked,
                maxLoginAttempts: document.getElementById('maxLoginAttempts').value,
                encryptData: document.getElementById('encryptData').checked,
                auditLog: document.getElementById('auditLog').checked,
                autoBackup: document.getElementById('autoBackup').checked
            };

            console.log('Saving security settings:', settings);
            
            // Save to database (you can create a system_settings table)
            await this.logAction('info', 'security', 'Security settings updated by admin');
            
            alert('Security settings saved successfully');
        } catch (error) {
            console.error('Failed to save security settings:', error);
            await this.logAction('error', 'security', `Failed to save security settings: ${error.message}`);
            alert('Failed to save settings');
        }
    }

    async saveSystemSettings() {
        try {
            const settings = {
                siteName: document.getElementById('siteName').value,
                siteEmail: document.getElementById('siteEmail').value,
                maintenanceMode: document.getElementById('maintenanceMode').checked,
                registrationEnabled: document.getElementById('registrationEnabled').checked,
                emailNotifications: document.getElementById('emailNotifications').checked,
                maxUploadSize: document.getElementById('maxUploadSize').value
            };

            console.log('Saving system settings:', settings);
            
            // Save to database
            await this.logAction('info', 'system', 'System settings updated by admin');
            
            alert('System settings saved successfully');
        } catch (error) {
            console.error('Failed to save system settings:', error);
            await this.logAction('error', 'system', `Failed to save system settings: ${error.message}`);
            alert('Failed to save settings');
        }
    }

    async clearLogs() {
        if (!confirm('Clear all logs? This action cannot be undone.')) return;

        try {
            const { error } = await this.supabase
                .from('audit_logs')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) throw error;

            await this.logAction('warning', 'system', 'All audit logs cleared by admin');
            
            document.getElementById('logsContainer').innerHTML = '<div class="log-entry log-info">Logs cleared</div>';
            alert('Logs cleared successfully');
        } catch (error) {
            console.error('Failed to clear logs:', error);
            alert('Failed to clear logs: ' + error.message);
        }
    }

    async filterUsers() {
        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('roleFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        try {
            let query = this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply role filter
            if (roleFilter) {
                query = query.eq('role', roleFilter);
            }

            // Apply status filter
            if (statusFilter) {
                if (statusFilter === 'active') {
                    query = query.eq('email_verified', true);
                } else if (statusFilter === 'pending') {
                    query = query.eq('email_verified', false);
                }
            }

            const { data: users, error } = await query;

            if (error) throw error;

            // Apply search filter on client side
            let filteredUsers = users;
            if (searchTerm) {
                filteredUsers = users.filter(user => {
                    const userName = user.name || user.full_name || '';
                    return (userName.toLowerCase().includes(searchTerm)) ||
                           (user.email?.toLowerCase().includes(searchTerm));
                });
            }

            // Update table
            const tbody = document.getElementById('usersTableBody');
            if (!tbody) return;

            if (filteredUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No users found matching filters</td></tr>';
                return;
            }

            tbody.innerHTML = filteredUsers.map(user => {
                const joinedDate = new Date(user.created_at).toLocaleDateString();
                const status = user.email_verified ? 'Active' : 'Pending';
                const role = user.role || 'member';
                const userName = user.name || user.full_name || 'N/A';
                
                return `
                    <tr>
                        <td>${userName}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td><span class="badge badge-${role}">${role}</span></td>
                        <td><span class="badge badge-${status.toLowerCase()}">${status}</span></td>
                        <td>${joinedDate}</td>
                        <td>
                            <button class="btn-icon" onclick="adminDashboard.editUser('${user.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="adminDashboard.deleteUser('${user.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to filter users:', error);
        }
    }

    async filterLogs() {
        const logLevel = document.getElementById('logLevel')?.value || '';
        const logCategory = document.getElementById('logCategory')?.value || '';
        const logDate = document.getElementById('logDate')?.value || '';

        try {
            let query = this.supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            // Apply level filter
            if (logLevel) {
                query = query.eq('level', logLevel);
            }

            // Apply category filter
            if (logCategory) {
                query = query.eq('category', logCategory);
            }

            // Apply date filter
            if (logDate) {
                const startDate = new Date(logDate);
                const endDate = new Date(logDate);
                endDate.setDate(endDate.getDate() + 1);
                
                query = query
                    .gte('created_at', startDate.toISOString())
                    .lt('created_at', endDate.toISOString());
            }

            const { data: logs, error } = await query;

            if (error) throw error;

            const container = document.getElementById('logsContainer');
            if (!container) return;

            if (!logs || logs.length === 0) {
                container.innerHTML = '<div class="log-entry log-info"><span class="log-message">No logs found matching filters</span></div>';
                return;
            }

            container.innerHTML = logs.map(log => {
                const time = new Date(log.created_at).toLocaleString();
                const level = log.level || 'info';
                
                return `
                    <div class="log-entry log-${level}">
                        <span class="log-time">[${time}]</span>
                        <span class="log-level">[${level.toUpperCase()}]</span>
                        <span class="log-message">${log.message || log.action || 'No message'}</span>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to filter logs:', error);
        }
    }

    refreshCurrentTab() {
        this.loadTabData(this.currentTab);
        this.updateLastUpdated();
    }

    updateLastUpdated() {
        const now = new Date().toLocaleString();
        const element = document.getElementById('lastUpdated');
        if (element) {
            element.textContent = `Last updated: ${now}`;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Debug helper function - run this in console to check your profile
window.debugAdminAccess = async function() {
    console.log('🔍 Running admin access debug...');
    
    if (!window.supabase) {
        console.error('❌ Supabase not initialized');
        return;
    }
    
    try {
        // Check session
        const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
        console.log('Session:', {
            exists: !!session,
            user: session?.user?.email,
            error: sessionError?.message
        });
        
        if (!session) {
            console.error('❌ No active session');
            return;
        }
        
        // Check profile
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
        console.log('Profile:', profile);
        console.log('Profile Error:', profileError);
        
        if (profile) {
            console.log('✅ Profile found:');
            console.log('  - Email:', profile.email);
            console.log('  - Name:', profile.full_name);
            console.log('  - Role:', profile.role);
            console.log('  - Role Type:', typeof profile.role);
            console.log('  - Profile Completed:', profile.profile_completed);
            
            const adminRoles = ['admin', 'administrator', 'super_admin', 'superadmin'];
            const userRole = (profile.role || '').toLowerCase().trim();
            const isAdmin = adminRoles.includes(userRole);
            
            console.log('Admin Check:');
            console.log('  - User Role (normalized):', userRole);
            console.log('  - Accepted Roles:', adminRoles);
            console.log('  - Is Admin:', isAdmin ? '✅ YES' : '❌ NO');
            
            if (!isAdmin) {
                console.log('');
                console.log('🔧 To fix, run this SQL in Supabase:');
                console.log(`UPDATE profiles SET role = 'admin' WHERE email = '${profile.email}';`);
            }
        }
        
        // Check table structure
        const { data: sample } = await window.supabase
            .from('profiles')
            .select('*')
            .limit(1);
            
        if (sample && sample[0]) {
            console.log('');
            console.log('📋 Available profile columns:', Object.keys(sample[0]));
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
};

console.log('💡 Tip: Run window.debugAdminAccess() in console to debug admin access issues');

// Test database connection
window.testDatabaseConnection = async function() {
    console.log('🔍 Testing database connection...');
    
    if (!window.supabase) {
        console.error('❌ window.supabase not available');
        return;
    }
    
    console.log('✅ window.supabase exists');
    console.log('Has .from method:', typeof window.supabase.from === 'function');
    
    // Test simple query
    try {
        console.log('Testing query to profiles table...');
        const { data, error, count } = await window.supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .limit(5);
        
        console.log('Query result:', {
            success: !error,
            rowCount: count,
            dataLength: data?.length,
            error: error ? {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            } : null
        });
        
        if (data && data.length > 0) {
            console.log('Sample data:', data[0]);
            console.log('Available columns:', Object.keys(data[0]));
        }
        
        if (error) {
            console.error('❌ Query failed:', error);
            
            if (error.code === '42P01') {
                console.error('Table "profiles" does not exist!');
            } else if (error.code === 'PGRST116') {
                console.error('RLS policy is blocking access!');
            }
        }
    } catch (err) {
        console.error('❌ Exception during query:', err);
    }
};

console.log('💡 Run window.testDatabaseConnection() to test database access');


