/**
 * Admin Dashboard Comprehensive Test Script
 * Run this in the browser console to test all functionality
 */

class AdminDashboardTester {
    constructor() {
        this.results = [];
        this.authToken = localStorage.getItem('authToken');
    }

    log(test, status, message, data = null) {
        const result = { test, status, message, data, timestamp: new Date().toISOString() };
        this.results.push(result);
        
        const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${test}: ${message}`);
        if (data) console.log('   Data:', data);
    }

    async runAllTests() {
        console.log('🧪 ========== ADMIN DASHBOARD COMPREHENSIVE TEST ==========\n');
        
        await this.testAuthentication();
        await this.testDOMElements();
        await this.testGlobalObjects();
        await this.testNotificationButtons();
        await this.testNotificationAPI();
        await this.testDatabaseSize();
        await this.testUserManagement();
        
        console.log('\n📊 ========== TEST SUMMARY ==========');
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const warnings = this.results.filter(r => r.status === 'warn').length;
        
        console.log(`Total Tests: ${this.results.length}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️ Warnings: ${warnings}`);
        
        if (failed > 0) {
            console.log('\n🔍 Failed Tests:');
            this.results.filter(r => r.status === 'fail').forEach(r => {
                console.log(`   - ${r.test}: ${r.message}`);
            });
        }
        
        return this.results;
    }

    async testAuthentication() {
        console.log('\n🔐 Testing Authentication...');
        
        // Check auth token
        if (this.authToken) {
            this.log('Auth Token', 'pass', 'Auth token exists in localStorage');
        } else {
            this.log('Auth Token', 'fail', 'No auth token found');
            return;
        }

        // Check user data
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.log('User Data', 'pass', `User: ${user.email}`, { role: user.role });
                
                if (user.role !== 'admin') {
                    this.log('Admin Role', 'fail', `User role is "${user.role}", not "admin"`);
                }
            } catch (e) {
                this.log('User Data', 'fail', 'Failed to parse user data');
            }
        } else {
            this.log('User Data', 'fail', 'No user data in localStorage');
        }

        // Test token validity
        try {
            const response = await fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            
            if (response.ok) {
                this.log('Token Validity', 'pass', 'Token is valid');
            } else {
                this.log('Token Validity', 'fail', `Token invalid: ${response.status}`);
            }
        } catch (e) {
            this.log('Token Validity', 'fail', `Error verifying token: ${e.message}`);
        }
    }

    async testDOMElements() {
        console.log('\n🎨 Testing DOM Elements...');
        
        const elements = {
            'notificationContent': 'Notification content container',
            'notificationsList': 'Notifications list',
            'totalUsers': 'Total users stat',
            'activeUsers': 'Active users stat',
            'pendingUsers': 'Pending users stat',
            'dbSize': 'Database size stat',
            'usersTableBody': 'Users table body',
            'tablesTableBody': 'Tables table body'
        };

        for (const [id, description] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                this.log(`DOM: ${id}`, 'pass', `${description} found`);
            } else {
                this.log(`DOM: ${id}`, 'fail', `${description} not found`);
            }
        }
    }

    async testGlobalObjects() {
        console.log('\n🌐 Testing Global Objects...');
        
        // Check window.adminDashboard
        if (window.adminDashboard) {
            this.log('Global: adminDashboard', 'pass', 'adminDashboard exists');
        } else {
            this.log('Global: adminDashboard', 'fail', 'adminDashboard not found');
        }

        // Check NotificationManagement class
        if (typeof NotificationManagement !== 'undefined') {
            this.log('Global: NotificationManagement', 'pass', 'NotificationManagement class exists');
        } else {
            this.log('Global: NotificationManagement', 'fail', 'NotificationManagement class not found');
        }

        // Check window.notificationMgmt instance
        if (window.notificationMgmt) {
            this.log('Global: notificationMgmt', 'pass', 'notificationMgmt instance exists');
            
            // Check methods
            const methods = ['showCreateNotificationModal', 'showCreateCampaignModal', 'sendNotification', 'createAndSendCampaign'];
            methods.forEach(method => {
                if (typeof window.notificationMgmt[method] === 'function') {
                    this.log(`Method: ${method}`, 'pass', `${method} method exists`);
                } else {
                    this.log(`Method: ${method}`, 'fail', `${method} method not found`);
                }
            });
        } else {
            this.log('Global: notificationMgmt', 'fail', 'notificationMgmt instance not initialized');
        }

        // Check Supabase
        if (window.supabase) {
            this.log('Global: supabase', 'pass', 'Supabase client exists');
        } else {
            this.log('Global: supabase', 'warn', 'Supabase client not found');
        }
    }

    async testNotificationButtons() {
        console.log('\n🔘 Testing Notification Buttons...');
        
        // Switch to notifications tab
        const notifTab = document.querySelector('[data-tab="notifications"]');
        if (notifTab) {
            notifTab.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.log('Tab Switch', 'pass', 'Switched to notifications tab');
        } else {
            this.log('Tab Switch', 'fail', 'Notifications tab not found');
            return;
        }

        // Check if buttons exist
        const container = document.getElementById('notificationContent');
        if (!container) {
            this.log('Notification Container', 'fail', 'Container not rendered');
            return;
        }

        const sendBtn = Array.from(container.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Send Notification')
        );
        const campaignBtn = Array.from(container.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Create Campaign')
        );

        if (sendBtn) {
            this.log('Button: Send Notification', 'pass', 'Send Notification button found');
            
            // Check onclick handler
            const onclick = sendBtn.getAttribute('onclick');
            if (onclick && onclick.includes('notificationMgmt')) {
                this.log('Button Handler: Send', 'pass', 'onclick handler configured');
            } else {
                this.log('Button Handler: Send', 'fail', 'onclick handler missing or incorrect');
            }
        } else {
            this.log('Button: Send Notification', 'fail', 'Send Notification button not found');
        }

        if (campaignBtn) {
            this.log('Button: Create Campaign', 'pass', 'Create Campaign button found');
            
            const onclick = campaignBtn.getAttribute('onclick');
            if (onclick && onclick.includes('notificationMgmt')) {
                this.log('Button Handler: Campaign', 'pass', 'onclick handler configured');
            } else {
                this.log('Button Handler: Campaign', 'fail', 'onclick handler missing or incorrect');
            }
        } else {
            this.log('Button: Create Campaign', 'fail', 'Create Campaign button not found');
        }
    }

    async testNotificationAPI() {
        console.log('\n🌐 Testing Notification API...');
        
        if (!this.authToken) {
            this.log('API Test', 'fail', 'No auth token available');
            return;
        }

        // Test stats endpoint
        try {
            const response = await fetch('/api/admin/notifications/stats', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.log('API: Stats', 'pass', 'Stats endpoint working', data);
            } else {
                const error = await response.text();
                this.log('API: Stats', 'fail', `Stats endpoint failed: ${response.status}`, error);
            }
        } catch (e) {
            this.log('API: Stats', 'fail', `Stats endpoint error: ${e.message}`);
        }

        // Test notifications list endpoint
        try {
            const response = await fetch('/api/admin/notifications', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.log('API: List', 'pass', `Notifications list working (${data.notifications?.length || 0} items)`);
            } else {
                const error = await response.text();
                this.log('API: List', 'fail', `List endpoint failed: ${response.status}`, error);
            }
        } catch (e) {
            this.log('API: List', 'fail', `List endpoint error: ${e.message}`);
        }

        // Test campaigns endpoint
        try {
            const response = await fetch('/api/admin/notifications/campaigns', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.log('API: Campaigns', 'pass', `Campaigns endpoint working (${data.campaigns?.length || 0} items)`);
            } else {
                const error = await response.text();
                this.log('API: Campaigns', 'fail', `Campaigns endpoint failed: ${response.status}`, error);
            }
        } catch (e) {
            this.log('API: Campaigns', 'fail', `Campaigns endpoint error: ${e.message}`);
        }
    }

    async testDatabaseSize() {
        console.log('\n💾 Testing Database Size...');
        
        const dbSizeElement = document.getElementById('dbSize');
        if (!dbSizeElement) {
            this.log('DB Size Element', 'fail', 'dbSize element not found');
            return;
        }

        const currentValue = dbSizeElement.textContent;
        this.log('DB Size Display', 'warn', `Current value: "${currentValue}"`);

        if (currentValue === 'N/A' || currentValue === '0 MB') {
            this.log('DB Size Value', 'fail', 'Database size not calculated');
            
            // Try to get database size via Supabase
            if (window.supabase) {
                try {
                    // Query to get approximate database size
                    const { data, error } = await window.supabase.rpc('pg_database_size', {
                        database_name: 'postgres'
                    });
                    
                    if (error) {
                        this.log('DB Size Query', 'fail', `Failed to query size: ${error.message}`);
                    } else {
                        this.log('DB Size Query', 'pass', `Database size retrieved: ${data}`);
                    }
                } catch (e) {
                    this.log('DB Size Query', 'fail', `Error querying size: ${e.message}`);
                }
            }
        } else {
            this.log('DB Size Value', 'pass', `Database size: ${currentValue}`);
        }
    }

    async testUserManagement() {
        console.log('\n👥 Testing User Management...');
        
        // Switch to users tab
        const usersTab = document.querySelector('[data-tab="users"]');
        if (usersTab) {
            usersTab.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.log('Users Tab', 'pass', 'Switched to users tab');
        } else {
            this.log('Users Tab', 'fail', 'Users tab not found');
            return;
        }

        const tbody = document.getElementById('usersTableBody');
        if (!tbody) {
            this.log('Users Table', 'fail', 'Users table body not found');
            return;
        }

        const content = tbody.textContent;
        if (content.includes('Loading')) {
            this.log('Users Table', 'warn', 'Users still loading');
        } else if (content.includes('No users')) {
            this.log('Users Table', 'warn', 'No users found');
        } else if (content.includes('Error') || content.includes('Failed')) {
            this.log('Users Table', 'fail', 'Error loading users');
        } else {
            const rows = tbody.querySelectorAll('tr');
            this.log('Users Table', 'pass', `Users loaded (${rows.length} rows)`);
        }
    }
}

// Auto-run tests
console.log('🚀 Starting Admin Dashboard Tests...\n');
const tester = new AdminDashboardTester();
tester.runAllTests().then(results => {
    console.log('\n✅ Tests complete!');
    console.log('💾 Results saved to window.testResults');
    window.testResults = results;
});
