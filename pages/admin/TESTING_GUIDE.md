# Admin Dashboard Testing Guide

## 🚨 Current Issues

Based on your report, the following issues need to be fixed:
1. ❌ Cannot send notifications from admin dashboard
2. ❌ Cannot create campaigns from admin dashboard  
3. ❌ Database size showing "N/A"

## 🔧 Quick Fix Steps

### Step 1: Restart Server
```bash
# Stop the server (Ctrl+C)
npm start
```

### Step 2: Clear Browser Cache
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Select "Cached images and files"
- Click "Clear data"
- OR press `Ctrl+Shift+R` to hard refresh

### Step 3: Run Diagnostic Script

1. Navigate to: `http://localhost:3000/pages/admin/test-notifications.html`
2. This will open a comprehensive test suite
3. Click each test button to diagnose issues

### Step 4: Run Console Diagnostic

1. Open admin dashboard: `http://localhost:3000/pages/admin/admin.html`
2. Open browser console (F12)
3. Copy and paste the contents of `fix-admin-issues.js` into console
4. Press Enter
5. Review the diagnostic output

## 📋 Manual Testing Checklist

### Test 1: Authentication
- [ ] Navigate to admin dashboard
- [ ] Check console for "✅ Admin access granted"
- [ ] Verify no authentication errors

### Test 2: Notification Tab
- [ ] Click "Notifications" tab
- [ ] Check console for "✅ Notification management initialized globally"
- [ ] Verify statistics cards are visible
- [ ] Check for "Send Notification" and "Create Campaign" buttons

### Test 3: Send Notification Button
- [ ] Click "Send Notification" button
- [ ] Modal should open
- [ ] Fill in form:
  - Type: "announcement"
  - Recipient: "All Users"
  - Priority: "medium"
  - Title: "Test"
  - Message: "Testing"
- [ ] Click "Send Notification" in modal
- [ ] Should see success alert

### Test 4: Create Campaign Button
- [ ] Click "Create Campaign" button
- [ ] Modal should open
- [ ] Fill in form:
  - Name: "Test Campaign"
  - Type: "announcement"
  - Title: "Test"
  - Message: "Testing"
- [ ] Click "Create & Send"
- [ ] Should see success alert

### Test 5: Database Size
- [ ] Go to "Overview" tab
- [ ] Check "Database Size" stat card
- [ ] Should show estimated size (e.g., "~2.5 MB")
- [ ] If shows "N/A", check console for errors

### Test 6: User Management
- [ ] Go to "Users" tab
- [ ] Should see list of users
- [ ] Check for any error messages

## 🐛 Common Issues & Solutions

### Issue: Buttons Don't Work

**Symptoms:**
- Clicking "Send Notification" does nothing
- Clicking "Create Campaign" does nothing
- No modal appears

**Solutions:**
1. Check console for `window.notificationMgmt`
   ```javascript
   window.notificationMgmt
   // Should show: NotificationManagement {admin: AdminDashboard, ...}
   ```

2. If undefined, run:
   ```javascript
   window.notificationMgmt = new NotificationManagement(window.adminDashboard);
   ```

3. Test button manually:
   ```javascript
   window.notificationMgmt.showCreateNotificationModal();
   ```

### Issue: API Errors

**Symptoms:**
- "Failed to send notification" error
- Network errors in console
- 401 Unauthorized errors

**Solutions:**
1. Check auth token:
   ```javascript
   localStorage.getItem('authToken')
   // Should return a JWT token
   ```

2. Verify token is valid:
   ```javascript
   fetch('/api/auth/verify', {
     headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
   }).then(r => r.json()).then(console.log)
   ```

3. Check user role:
   ```javascript
   JSON.parse(localStorage.getItem('user')).role
   // Should be 'admin'
   ```

### Issue: Database Size Shows "N/A"

**Symptoms:**
- Database size stat shows "N/A"
- No size calculation happening

**Solutions:**
1. Check if Supabase is connected:
   ```javascript
   window.supabase
   // Should show Supabase client object
   ```

2. Manually calculate size:
   ```javascript
   window.adminDashboard.calculateDatabaseSize()
   ```

3. Check console for table access errors

### Issue: Tables Not Loading

**Symptoms:**
- "Loading..." message persists
- "No users found" or "Error loading users"

**Solutions:**
1. Check Supabase connection
2. Verify table exists in database
3. Check RLS policies allow admin access
4. Run SQL in Supabase:
   ```sql
   SELECT * FROM users LIMIT 1;
   ```

## 🧪 Test Files

### 1. test-notifications.html
**Purpose:** Visual test suite with UI
**Location:** `/pages/admin/test-notifications.html`
**Usage:**
- Open in browser
- Click test buttons
- View results in real-time

### 2. fix-admin-issues.js
**Purpose:** Console diagnostic script
**Location:** `/pages/admin/fix-admin-issues.js`
**Usage:**
- Copy entire file contents
- Paste in browser console
- Press Enter
- Review diagnostic output

### 3. test-admin-functionality.js
**Purpose:** Comprehensive automated tests
**Location:** `/pages/admin/test-admin-functionality.js`
**Usage:**
- Copy entire file contents
- Paste in browser console
- Press Enter
- Check `window.testResults` for details

## 📊 Expected Console Output

### Successful Initialization
```
🔧 Initializing Admin Dashboard...
✅ Supabase client found at window.supabase
🔐 Starting admin auth check...
✅ Admin access granted for: admin@example.com
🔧 Attempting to initialize notification management...
✅ Notification management initialized globally
✅ Admin Dashboard initialized
```

### Successful Button Click
```
📢 Initializing Notification Management...
✅ Notification management initialized globally
[User clicks "Send Notification"]
[Modal opens]
[User fills form and clicks send]
✅ Notification sent successfully to 5 user(s)!
```

## 🔍 Debugging Commands

Run these in browser console to debug:

```javascript
// Check global objects
window.adminDashboard
window.notificationMgmt
window.supabase

// Check NotificationManagement class
typeof NotificationManagement

// Check methods
typeof window.notificationMgmt.showCreateNotificationModal
typeof window.notificationMgmt.sendNotification

// Test API endpoints
fetch('/api/admin/notifications/stats', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(console.log)

// Test send notification
fetch('/api/admin/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify({
    type: 'announcement',
    title: 'Test',
    message: 'Test message',
    priority: 'medium',
    recipient_type: 'all'
  })
}).then(r => r.json()).then(console.log)

// Manually open modal
window.notificationMgmt.showCreateNotificationModal()

// Check database size
window.adminDashboard.calculateDatabaseSize()
```

## 📝 Reporting Issues

If issues persist, provide:
1. Browser console output (full log)
2. Network tab showing failed requests
3. Screenshots of error messages
4. Results from test-notifications.html
5. Output from fix-admin-issues.js

## ✅ Success Criteria

All tests pass when:
- [ ] "Send Notification" button opens modal
- [ ] Modal form submits successfully
- [ ] Success alert shows with user count
- [ ] "Create Campaign" button opens modal
- [ ] Campaign form submits successfully
- [ ] Database size shows estimated value
- [ ] Users table loads with data
- [ ] No console errors
- [ ] All API endpoints return 200 OK

## 🎯 Next Steps

After fixing issues:
1. Test end-to-end flow
2. Send real notification to yourself
3. Check user dashboard for notification
4. Verify notification appears correctly
5. Test mark as read functionality

---

**Last Updated:** 2026-03-04
**Status:** Diagnostic tools ready
**Action Required:** Run tests and report results
