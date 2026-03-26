# Quick Admin Dashboard Test

## 🚀 Run This in Browser Console

```javascript
// Copy and paste this entire block into your browser console
(async function quickTest() {
    console.clear();
    console.log('🔍 Quick Admin Dashboard Test\n');
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.error('❌ Not logged in! Please login first.');
        return;
    }
    
    console.log('✅ Auth token found');
    
    // Test 1: Send a test notification
    console.log('\n📤 Testing: Send Notification...');
    try {
        const response = await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                type: 'announcement',
                title: 'Test Notification',
                message: 'This is a test notification sent from the admin dashboard quick test.',
                priority: 'low',
                recipient_type: 'all'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Notification sent successfully!');
            console.log('   Recipients:', result.count);
        } else {
            console.error('❌ Failed to send notification');
            console.error('   Error:', result.error);
        }
    } catch (error) {
        console.error('❌ Send notification failed:', error.message);
    }
    
    // Test 2: Create and send a campaign
    console.log('\n📢 Testing: Create Campaign...');
    try {
        // Step 1: Create campaign
        const createResponse = await fetch('/api/admin/notifications/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Quick Test Campaign',
                description: 'Automated test campaign',
                type: 'announcement',
                title: 'Test Campaign',
                message: 'This is a test campaign created by the quick test script.',
                target_audience: {}
            })
        });
        
        const campaign = await createResponse.json();
        
        if (createResponse.ok) {
            console.log('✅ Campaign created!');
            console.log('   ID:', campaign.id);
            console.log('   Name:', campaign.name);
            
            // Step 2: Send campaign
            console.log('\n📤 Sending campaign...');
            const sendResponse = await fetch(`/api/admin/notifications/campaigns/${campaign.id}/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const sendResult = await sendResponse.json();
            
            if (sendResponse.ok) {
                console.log('✅ Campaign sent successfully!');
                console.log('   Recipients:', sendResult.recipients);
                console.log('   Notifications created:', sendResult.notifications_created);
            } else {
                console.error('❌ Failed to send campaign');
                console.error('   Error:', sendResult.error);
            }
        } else {
            console.error('❌ Failed to create campaign');
            console.error('   Error:', campaign.error);
        }
    } catch (error) {
        console.error('❌ Campaign test failed:', error.message);
    }
    
    // Test 3: Check database size
    console.log('\n💾 Testing: Database Size...');
    try {
        if (window.adminDashboard && window.adminDashboard.calculateDatabaseSize) {
            await window.adminDashboard.calculateDatabaseSize();
            const size = document.getElementById('dbSize')?.textContent;
            console.log('✅ Database size:', size);
        } else {
            console.warn('⚠️ Admin dashboard not initialized');
        }
    } catch (error) {
        console.error('❌ Database size test failed:', error.message);
    }
    
    console.log('\n✅ Quick test complete!');
    console.log('\n💡 Check the Notifications tab to see the test notifications.');
})();
```

## Expected Output

```
🔍 Quick Admin Dashboard Test

✅ Auth token found

📤 Testing: Send Notification...
✅ Notification sent successfully!
   Recipients: X

📢 Testing: Create Campaign...
✅ Campaign created!
   ID: xxx-xxx-xxx
   Name: Quick Test Campaign

📤 Sending campaign...
✅ Campaign sent successfully!
   Recipients: X
   Notifications created: X

💾 Testing: Database Size...
✅ Database size: ~X.X MB

✅ Quick test complete!

💡 Check the Notifications tab to see the test notifications.
```

## If Tests Fail

### "Not logged in"
- Login to the admin dashboard first
- Make sure you have admin role

### "Failed to send notification"
- Check that backend is running: `fetch('/health').then(r => r.json()).then(console.log)`
- Check database tables exist
- Check you have users in the database

### "Failed to create campaign"
- Same as above
- Check API endpoint is accessible

### "Database size: Not Available"
- This is OK if you have no data yet
- Add some users/events/projects to see a size

## Manual Verification

After running the test:

1. Go to **Notifications** tab
2. You should see the test notification in the list
3. Check the stats - they should have increased
4. Go to **Campaigns** section
5. You should see "Quick Test Campaign"

## Clean Up Test Data (Optional)

```javascript
// Delete test notifications (run in console)
const token = localStorage.getItem('authToken');

// Get recent notifications
fetch('/api/admin/notifications?limit=10', {
    headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
    console.log('Recent notifications:', data.notifications);
    // Manually delete if needed using the UI
});
```
