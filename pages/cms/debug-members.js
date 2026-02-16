/**
 * Debug script for Members tab
 * Run this in the browser console when on the CMS page
 */

async function debugMembersTab() {
    console.log('🔍 === MEMBERS TAB DEBUG ===');
    
    // 1. Check tab name
    const activeTab = document.querySelector('.cms-tab.active');
    const tabName = activeTab?.dataset?.tab;
    console.log('1️⃣ Active tab data-tab:', tabName);
    console.log('   Expected: "members"');
    console.log('   Match:', tabName === 'members' ? '✅' : '❌');
    
    // 2. Check currentTab in manager
    const currentTab = window.cmsManager?.currentTab;
    console.log('\n2️⃣ CMS Manager currentTab:', currentTab);
    console.log('   Expected: "members"');
    console.log('   Match:', currentTab === 'members' ? '✅' : '❌');
    
    // 3. Check selector
    const selector = window.cmsManager?.getActiveListSelector?.();
    console.log('\n3️⃣ Active list selector:', selector);
    console.log('   Expected: "#members-content"');
    console.log('   Match:', selector === '#members-content' ? '✅' : '❌');
    
    // 4. Check container exists
    const container = document.querySelector('#members-content');
    console.log('\n4️⃣ Container exists:', !!container);
    console.log('   Container:', container);
    console.log('   Children count:', container?.children?.length || 0);
    
    // 5. Check auth token
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    console.log('\n5️⃣ Auth token exists:', !!token);
    console.log('   Token (first 20 chars):', token?.substring(0, 20) + '...');
    
    // 6. Test API call directly
    console.log('\n6️⃣ Testing API call to /api/v1/admin/users...');
    try {
        const response = await fetch('/api/v1/admin/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('   Response status:', response.status);
        console.log('   Response OK:', response.ok);
        
        if (response.ok) {
            const data = await response.json();
            console.log('   Response data:', data);
            console.log('   Users array:', data.users);
            console.log('   Users count:', data.users?.length || 0);
            
            if (data.users && data.users.length > 0) {
                console.log('   ✅ SUCCESS: Found', data.users.length, 'members in database');
                console.log('   Sample member:', data.users[0]);
            } else {
                console.log('   ⚠️ WARNING: API returned empty users array');
                console.log('   This means the database has no users yet');
            }
        } else {
            const errorText = await response.text();
            console.log('   ❌ ERROR: API call failed');
            console.log('   Error:', errorText);
        }
    } catch (error) {
        console.log('   ❌ EXCEPTION:', error.message);
    }
    
    // 7. Check CMSData cache
    console.log('\n7️⃣ Checking CMSData cache...');
    if (window.CMSData) {
        console.log('   CMSData available:', true);
        console.log('   Cache size:', window.CMSData.cache?.size || 0);
    } else {
        console.log('   ⚠️ CMSData not available in window');
    }
    
    console.log('\n🔍 === DEBUG COMPLETE ===\n');
}

// Auto-run if on CMS page
if (window.location.pathname.includes('/cms')) {
    console.log('💡 Run debugMembersTab() in console to diagnose Members tab');
    window.debugMembersTab = debugMembersTab;
}
