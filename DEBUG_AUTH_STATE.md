# Debug Auth State Issue

## Problem
Navbar still shows "Login" even after successful login.

## Changes Made

### 1. Added Redirect Parameter
**Files**: `pages/auth/signin.js`, `pages/shared/global-navbar.js`, `pages/home/home.js`

Now when you click "Login", it saves the current page:
```
/signin?redirect=/events
```

After login, you'll be redirected back to `/events` instead of `/dashboard`.

### 2. Enhanced Auth State Restoration
**File**: `pages/shared/auth.js`

Added:
- Immediate UI update after restoring session
- Delayed event dispatch (100ms) to ensure listeners are ready
- More console logging for debugging

## Debugging Steps

### Step 1: Check Browser Console
After logging in, open browser console (F12) and look for these messages:

```
✅ Restored JWT session: your-email@students.jkuat.ac.ke
👤 User object: {id: "...", name: "...", email: "..."}
✅ Auth Manager initialized
🔐 Dispatching userLoggedIn event with user: {...}
🔐 User logged in event received: {...}
✅ Updated navbar button for logged in user: Logout
```

### Step 2: Check localStorage
In browser console, run:
```javascript
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', localStorage.getItem('user'));
```

Should show:
- Token: A long JWT string
- User: JSON object with your user data

### Step 3: Check Auth Manager
In browser console, run:
```javascript
console.log('Auth Manager:', window.authManager);
console.log('Is Authenticated:', window.authManager?.isAuthenticated());
console.log('Current User:', window.authManager?.getUser());
```

Should show:
- Auth Manager: Object with methods
- Is Authenticated: true
- Current User: Your user object

### Step 4: Manually Trigger Update
If navbar still shows "Login", try manually triggering the update in console:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
```

This should update the navbar to "Logout".

## Common Issues & Solutions

### Issue 1: Auth.js Not Loaded
**Symptom**: `window.authManager` is undefined
**Solution**: Check if `<script src="/shared/auth.js"></script>` is in the HTML

### Issue 2: Event Listener Not Attached
**Symptom**: Event dispatched but navbar doesn't update
**Solution**: Check if global-navbar.js is loaded after auth.js

### Issue 3: Timing Issue
**Symptom**: Navbar initializes before auth system
**Solution**: The 100ms delay in auth.js should fix this

### Issue 4: Multiple Auth Systems
**Symptom**: Conflicting auth implementations
**Solution**: Ensure only one auth system is active

## Quick Fix Test

### Test 1: Hard Refresh
1. Login successfully
2. Press Ctrl+Shift+R (hard refresh)
3. Check if navbar shows "Logout"

If this works, it's a timing issue.

### Test 2: Manual Check
1. Login successfully
2. Open console
3. Run: `window.authManager.isAuthenticated()`
4. Should return `true`
5. Run: `document.getElementById('navbar-login-btn').textContent`
6. Should show "Logout" or user name

### Test 3: Force Update
1. Login successfully
2. Open console
3. Run:
```javascript
const navbar = window.globalNavbar || window.GlobalNavbar;
if (navbar) {
    const user = window.authManager.getUser();
    navbar.updateAuthButton(user);
}
```

## Expected Flow

### Login Flow:
1. User clicks "Login" on any page (e.g., `/events`)
2. Redirects to `/signin?redirect=/events`
3. User enters credentials
4. Backend validates and returns token + user data
5. Token saved to localStorage/sessionStorage
6. User data saved to localStorage
7. Redirects to `/events` (original page)
8. Page loads, auth.js initializes
9. Auth.js finds token in localStorage
10. Restores user session
11. Dispatches `userLoggedIn` event
12. Navbar receives event
13. Updates button to "Logout"

### Navbar Update Flow:
1. `auth.js` dispatches `userLoggedIn` event
2. `global-navbar.js` listens for event
3. Calls `updateAuthButton(user)`
4. Finds `#navbar-login-btn` element
5. Changes innerHTML to "Logout"
6. Changes onclick handler

## Files to Check

### 1. Check HTML has auth.js
Look for this in your HTML files:
```html
<script src="/shared/auth.js"></script>
<script src="/shared/global-navbar.js"></script>
```

Order matters! auth.js should load before global-navbar.js.

### 2. Check Console for Errors
Look for:
- Script loading errors
- JavaScript errors
- Failed API calls
- Missing elements

### 3. Check Network Tab
After login, check:
- `/api/auth/login` returns 200 OK
- Response includes `token` and `user`
- No CORS errors

## If Still Not Working

### Option 1: Add Debug Logging
Add this to the top of your page:
```javascript
window.addEventListener('userLoggedIn', (e) => {
    console.log('🎯 DEBUG: userLoggedIn event received!', e.detail);
});
```

### Option 2: Check Element Exists
```javascript
console.log('Navbar button:', document.getElementById('navbar-login-btn'));
```

### Option 3: Force Reload Auth
```javascript
if (window.authManager) {
    window.authManager.init();
}
```

## Next Steps

1. Login to your app
2. Open browser console (F12)
3. Look for the log messages listed above
4. Share any errors you see
5. Check if `window.authManager.isAuthenticated()` returns true

If you see errors or unexpected behavior, let me know what the console shows!
