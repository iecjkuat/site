/**
 * Admin Dashboard Issue Fixer
 * This script diagnoses and fixes common admin dashboard issues
 * Run in browser console: copy and paste this entire file
 */

(async function() {
    console.log('🔧 ========== ADMIN DASHBOARD DIAGNOSTIC & FIX ==========\n');

    // ============================================
    // 1. CHECK AUTHENTICATION
    // ============================================
    console.log('1️⃣ Checking Authentication...');
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (!authToken) {
        console.error('❌ No auth token found!');
        console.log('   Please login first');
        return;
    }
    console.log('✅ Auth token exists');

    if (!userData) {
        console.error('❌ No user data found!');
        return;
    }

    let user;
    try {
        user = JSON.parse(userData);
        console.log('✅ User data:', user.email, '- Role:', user.role);
    } catch (e) {
        console.error('❌ Failed to parse user data');
        return;
    }

    // ============================================
    // 2. CHECK NOTIFICATION MANAGEMENT
    // ============================================
    console.log('\n2️⃣ Checking Notification Management...');
    
    if (typeof NotificationManagement === 'undefined') {
        console.error('❌ NotificationManagement class not loaded!');
        console.log('   Check if notifications-management.js is loaded');
        return;
    }
    console.log('✅ NotificationManagement class exists');

    if (!window.notificationMgmt) {
        console.warn('⚠️ window.notificationMgmt not initialized');
        console.log('   Initializing now...');
        
        if (window.adminDashboard) {
            window.notificationMgmt = new NotificationManagement(window.adminDashboard);
            console.log('✅ Initialized window.notificationMgmt');
        } else {
            console.error('❌ window.adminDashboard not found');
        }
    } else {
        console.log('✅ window.notificationMgmt exists');
    }

    // Verify methods exist
    const methods = ['showCreateNotificationModal', 'showCreateCampaignModal', 'sendNotification', 'createAndSendCampaign'];
    let allMethodsExist = true;
    methods.forEach(method => {
        if (typeof window.notificationMgmt[method] === 'function') {
            console.log(`   ✅ ${method} exists`);
        } else {
            console.error(`   ❌ ${method} missing`);
            allMethodsExist = false;
        }
    });

    if (!allMethodsExist) {
        console.error('❌ Some methods are missing!');
        return;
    }

    // ============================================
    // 3. TEST API ENDPOINTS
    // ============================================
    console.log('\n3️⃣ Testing API Endpoints...');

    // Test stats endpoint
    try {
        console.log('   Testing /api/admin/notifications/stats...');
        const statsResponse = await fetch('/api/admin/notifications/stats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('   ✅ Stats endpoint working:', stats);
        } else {
            const errorText = await statsResponse.text();
            console.error(`   ❌ Stats endpoint failed (${statsResponse.status}):`, errorText);
        }
    } catch (e) {
        console.error('   ❌ Stats endpoint error:', e.message);
    }

    // Test notifications list
    try {
        console.log('   Testing /api/admin/notifications...');
        const listResponse = await fetch('/api/admin/notifications', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (listResponse.ok) {
            const data = await listResponse.json();
            console.log(`   ✅ List endpoint working (${data.notifications?.length || 0} notifications)`);
        } else {
            const errorText = await listResponse.text();
            console.error(`   ❌ List endpoint failed (${listResponse.status}):`, errorText);
        }
    } catch (e) {
        console.error('   ❌ List endpoint error:', e.message);
    }

    // Test campaigns
    try {
        console.log('   Testing /api/admin/notifications/campaigns...');
        const campaignsResponse = await fetch('/api/admin/notifications/campaigns', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (campaignsResponse.ok) {
            const data = await campaignsResponse.json();
            console.log(`   ✅ Campaigns endpoint working (${data.campaigns?.length || 0} campaigns)`);
        } else {
            const errorText = await campaignsResponse.text();
            console.error(`   ❌ Campaigns endpoint failed (${campaignsResponse.status}):`, errorText);
        }
    } catch (e) {
        console.error('   ❌ Campaigns endpoint error:', e.message);
    }

    // ============================================
    // 4. TEST SEND NOTIFICATION
    // ============================================
    console.log('\n4️⃣ Testing Send Notification Function...');
    
    try {
        console.log('   Attempting to send test notification...');
        const testData = {
            type: 'announcement',
            title: 'Test Notification',
            message: 'This is a test notification from the diagnostic script',
            priority: 'low',
            recipient_type: 'single',
            recipient_email: user.email
        };

        const sendResponse = await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(testData)
        });

        if (sendResponse.ok) {
            const result = await sendResponse.json();
            console.log(`   ✅ Test notification sent successfully to ${result.count} user(s)!`);
            console.log('   Result:', result);
        } else {
            const errorData = await sendResponse.json().catch(() => ({ error: 'Unknown error' }));
            console.error(`   ❌ Failed to send test notification (${sendResponse.status}):`, errorData);
        }
    } catch (e) {
        console.error('   ❌ Send notification error:', e.message);
    }

    // ============================================
    // 5. CHECK DATABASE TABLES
    // ============================================
    console.log('\n5️⃣ Checking Database Tables...');
    
    if (!window.supabase) {
        console.error('❌ Supabase client not available');
    } else {
        const tables = ['notifications', 'notification_campaigns', 'notification_templates', 'users'];
        
        for (const table of tables) {
            try {
                const { count, error } = await window.supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    console.error(`   ❌ Table "${table}": ${error.message}`);
                } else {
                    console.log(`   ✅ Table "${table}": ${count} rows`);
                }
            } catch (e) {
                console.error(`   ❌ Table "${table}": ${e.message}`);
            }
        }
    }

    // ============================================
    // 6. CHECK BUTTON ONCLICK HANDLERS
    // ============================================
    console.log('\n6️⃣ Checking Button Handlers...');
    
    // Switch to notifications tab
    const notifTab = document.querySelector('[data-tab="notifications"]');
    if (notifTab) {
        notifTab.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const container = document.getElementById('notificationContent');
        if (container) {
            const buttons = container.querySelectorAll('button');
            console.log(`   Found ${buttons.length} buttons in notification content`);
            
            buttons.forEach((btn, index) => {
                const text = btn.textContent.trim();
                const onclick = btn.getAttribute('onclick');
                
                if (text.includes('Send Notification') || text.includes('Create Campaign')) {
                    console.log(`   Button "${text}":`);
                    console.log(`      - onclick: ${onclick ? 'exists' : 'MISSING'}`);
                    
                    if (onclick) {
                        if (onclick.includes('window.notificationMgmt')) {
                            console.log('      ✅ Uses window.notificationMgmt');
                        } else {
                            console.warn('      ⚠️ Does not use window.notificationMgmt');
                        }
                    }
                }
            });
        } else {
            console.error('   ❌ Notification content container not found');
        }
    }

    // ============================================
    // 7. FIX COMMON ISSUES
    // ============================================
    console.log('\n7️⃣ Applying Fixes...');
    
    // Ensure global instance exists
    if (!window.notificationMgmt && window.adminDashboard && typeof NotificationManagement !== 'undefined') {
        window.notificationMgmt = new NotificationManagement(window.adminDashboard);
        console.log('   ✅ Created window.notificationMgmt instance');
    }

    // Add helper functions to window for easy testing
    window.testSendNotification = async function() {
        console.log('📤 Testing send notification...');
        if (window.notificationMgmt) {
            window.notificationMgmt.showCreateNotificationModal();
            console.log('✅ Modal should be open');
        } else {
            console.error('❌ window.notificationMgmt not available');
        }
    };

    window.testCreateCampaign = async function() {
        console.log('📢 Testing create campaign...');
        if (window.notificationMgmt) {
            window.notificationMgmt.showCreateCampaignModal();
            console.log('✅ Modal should be open');
        } else {
            console.error('❌ window.notificationMgmt not available');
        }
    };

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✅ ========== DIAGNOSTIC COMPLETE ==========');
    console.log('\n📝 Quick Test Commands:');
    console.log('   window.testSendNotification()  - Open send notification modal');
    console.log('   window.testCreateCampaign()    - Open create campaign modal');
    console.log('   window.notificationMgmt        - Check instance');
    console.log('\n💡 If buttons still don\'t work:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Verify you\'re logged in as admin');
    console.log('   3. Check network tab for failed API calls');
    console.log('   4. Try: window.testSendNotification()');
})();
