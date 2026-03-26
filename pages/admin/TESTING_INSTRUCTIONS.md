# Admin Dashboard Testing Instructions

## Quick Test in Browser Console

Open the admin dashboard and run these commands in the browser console:

### 1. Test Authentication
```javascript
const token = localStorage.getItem('authToken');
console.log('Auth Token:', token ? 'Found' : 'Missing');

fetch('/api/auth/verify', {
    headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json()).then(d => console.log('Auth Status:', d));
```

### 2. Test Notification Stats
```javascript
const token = localStorage.getItem('authToken');
fetch('/api/admin/notifications/stats', {
    headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json()).then(d => console.log('Stats:', d));
```

### 3. Test Send Notification
```javascript
const token = localStorage.getItem('authToken');
fetch('/api/admin/notifications/send', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        type: 'announcement',
        title: 'Test Notification',
        message: 'This is a test notification from the admin dashboard',
        priority: 'medium',
        recipient_type: 'all'
    })
}).then(r => r.json()).then(d => console.log('Send Result:', d));
```

### 4. Test Create Campaign
```javascript
const token = localStorage.getItem('authToken');
fetch('/api/admin/notifications/campaigns', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        name: 'Test Campaign',
        type: 'announcement',
        title: 'Test Campaign Title',
        message: 'This is a test campaign message',
        target_audience: {}
    })
}).then(r => r.json()).then(d => console.log('Campaign Created:', d));
```

### 5. Test Database Size
```javascript
if (window.adminDashboard) {
    window.adminDashboard.calculateDatabaseSize().then(() => {
        const size = document.getElementById('dbSize').textContent;
        console.log('Database Size:', size);
    });
}
```

### 6. Test All Notification Functions
```javascript
if (window.notificationMgmt) {
    console.log('Notification Management:', {
        hasLoadOverview: typeof window.notificationMgmt.loadOverview === 'function',
        hasSendNotification: typeof window.notificationMgmt.sendNotification === 'function',
        hasCreateCampaign: typeof window.notificationMgmt.createAndSendCampaign === 'function',
        hasValidation: typeof window.notificationMgmt.validateNotificationData === 'function',
        hasEscapeHTML: typeof window.notificationMgmt.escapeHTML === 'function'
    });
}
```

## Common Issues and Fixes

### Issue: "No authentication token found"
**Fix:** Make sure you're logged in as an admin user.
```javascript
// Check if logged in
console.log('User:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('authToken'));
```

### Issue: "Database size showing N/A"
**Fix:** The database size calculation has been updated. Refresh the page and check again.

### Issue: "Failed to send notification"
**Possible causes:**
1. No auth token
2. Invalid recipient data
3. Backend API not running
4. Database tables not created

**Debug:**
```javascript
// Check backend health
fetch('/health').then(r => r.json()).then(d => console.log('Backend Health:', d));

// Check if notification tables exist
window.supabase.from('notifications').select('id').limit(1)
    .then(({data, error}) => console.log('Notifications table:', error ? 'Missing' : 'Exists'));
```

### Issue: "Campaign not sending"
**Fix:** Make sure the campaign is created first, then sent:
```javascript
// Step 1: Create campaign
const token = localStorage.getItem('authToken');
fetch('/api/admin/notifications/campaigns', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
    body: JSON.stringify({
        name: 'Test',
        type: 'announcement',
        title: 'Test',
        message: 'Test message',
        target_audience: {}
    })
}).then(r => r.json()).then(campaign => {
    console.log('Campaign created:', campaign);
    
    // Step 2: Send campaign
    return fetch(`/api/admin/notifications/campaigns/${campaign.id}/send`, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${token}`}
    });
}).then(r => r.json()).then(d => console.log('Campaign sent:', d));
```

## Full System Test

Run this comprehensive test:

```javascript
async function testAdminDashboard() {
    console.clear();
    console.log('🚀 Testing Admin Dashboard...\n');
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('❌ No auth token found');
        return;
    }
    
    // Test 1: Auth
    try {
        const authRes = await fetch('/api/auth/verify', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        console.log('✅ Auth:', authRes.ok ? 'Valid' : 'Invalid');
    } catch (e) {
        console.error('❌ Auth failed:', e.message);
    }
    
    // Test 2: Stats
    try {
        const statsRes = await fetch('/api/admin/notifications/stats', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        const stats = await statsRes.json();
        console.log('✅ Stats:', stats);
    } catch (e) {
        console.error('❌ Stats failed:', e.message);
    }
    
    // Test 3: Notifications List
    try {
        const notifRes = await fetch('/api/admin/notifications?limit=5', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        const notifs = await notifRes.json();
        console.log('✅ Notifications:', notifs.notifications?.length || 0, 'items');
    } catch (e) {
        console.error('❌ Notifications failed:', e.message);
    }
    
    // Test 4: Campaigns List
    try {
        const campRes = await fetch('/api/admin/notifications/campaigns?limit=5', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        const camps = await campRes.json();
        console.log('✅ Campaigns:', camps.campaigns?.length || 0, 'items');
    } catch (e) {
        console.error('❌ Campaigns failed:', e.message);
    }
    
    // Test 5: Templates
    try {
        const tempRes = await fetch('/api/admin/notifications/templates', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        const temps = await tempRes.json();
        console.log('✅ Templates:', temps.templates?.length || 0, 'items');
    } catch (e) {
        console.error('❌ Templates failed:', e.message);
    }
    
    // Test 6: Database
    try {
        const {data, error} = await window.supabase.from('users').select('id', {count: 'exact', head: true});
        console.log('✅ Database:', error ? 'Error' : 'Connected');
    } catch (e) {
        console.error('❌ Database failed:', e.message);
    }
    
    console.log('\n✅ Testing complete!');
}

// Run the test
testAdminDashboard();
```

## Expected Results

All tests should pass with:
- ✅ Auth: Valid
- ✅ Stats: Object with notification statistics
- ✅ Notifications: List of notifications
- ✅ Campaigns: List of campaigns
- ✅ Templates: List of templates
- ✅ Database: Connected

If any test fails, check the error message and follow the fixes above.
