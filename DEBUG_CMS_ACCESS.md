# CMS Access Debugging Guide

## Issue
Admin and Executive users cannot access the CMS page.

## Root Cause Analysis

The CMS has proper role validation in `pages/cms/modules/cms-security.js`:

```javascript
static validateRole(user) {
    // CMS access: executives (primary users) and admins (full access)
    return !!user && (user.role === 'executive' || user.role === 'admin');
}
```

The CMS checks permissions in `pages/cms/modules/cms-manager.js`:

```javascript
checkPermissions() {
    if (!window.authManager.isAuthenticated()) {
        throw new Error('Authentication required');
    }
    
    const user = window.authManager.getUser();
    if (!CMSSecurity.validateRole(user)) {
        throw new Error(`Access denied. CMS access requires executive or admin role.\nYour role: ${user?.role || 'none'}\nContact an admin to update your role if needed.`);
    }
    
    console.log('✅ CMS access granted for:', user.role, user.email);
}
```

## Possible Issues

### 1. User Object Not Including Role
The auth system might not be returning the role in the user object.

**Check in browser console:**
```javascript
// After logging in, check:
window.authManager.getUser()
// Should show: { id, email, name, role: 'admin' or 'executive', ... }
```

### 2. Role Not Stored in localStorage
When user logs in, the user object is stored in localStorage. If the role isn't included, CMS won't work.

**Check in browser console:**
```javascript
JSON.parse(localStorage.getItem('user'))
// Should include role field
```

### 3. Backend Not Returning Role
The `/api/auth/login` endpoint might not be returning the role in the response.

## Solution

### Step 1: Check Browser Console
1. Open CMS page: `http://localhost:3000/cms`
2. Open browser DevTools (F12)
3. Look at Console tab
4. You should see either:
   - ✅ "CMS access granted for: admin user@email.com"
   - ❌ "Access denied. CMS access requires executive or admin role. Your role: member"

### Step 2: Check User Object
In browser console, run:
```javascript
window.authManager.getUser()
```

Expected output:
```javascript
{
  id: "uuid",
  email: "admin@jkuat.ac.ke",
  name: "Admin User",
  role: "admin",  // ← This must be present!
  membershipStatus: "active"
}
```

### Step 3: Check localStorage
In browser console, run:
```javascript
JSON.parse(localStorage.getItem('user'))
```

Should show the same user object with role field.

### Step 4: Fix Backend Response

If the role is missing, the issue is in `routes/auth.js` login endpoint.

**Check this section in routes/auth.js:**
```javascript
res.json({
    message: 'Login successful',
    token,
    user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,  // ← Must be included!
        membershipStatus: userData.membership_status,
        profileCompleted: userData.profile_completed || false
    }
});
```

### Step 5: Fix Frontend Auth Storage

**Check pages/auth/signin.js** - after successful login:
```javascript
// Store user data
localStorage.setItem('user', JSON.stringify(result.user));
// result.user MUST include role field
```

**Check pages/shared/auth.js** - formatUser method:
```javascript
formatUser(supabaseUser) {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        role: supabaseUser.user_metadata?.role || 'member',  // ← Default to 'member'
        // ... other fields
    };
}
```

## Quick Fix SQL

If roles are set in database but not showing in user object, run this to verify:

```sql
-- Check user roles in database
SELECT id, name, email, role, membership_status 
FROM users 
WHERE email IN ('admin@jkuat.ac.ke', 'test.user@students.jkuat.ac.ke')
ORDER BY role;
```

Expected output:
```
| id   | name       | email                           | role      | membership_status |
|------|------------|---------------------------------|-----------|-------------------|
| uuid | Admin      | admin@jkuat.ac.ke               | admin     | active            |
| uuid | Exec User  | test.user@students.jkuat.ac.ke  | executive | active            |
```

## Testing Steps

1. **Logout completely**
   ```javascript
   window.authManager.logout()
   ```

2. **Clear localStorage**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

3. **Login again** with admin credentials

4. **Check user object immediately after login**
   ```javascript
   window.authManager.getUser()
   ```

5. **Try accessing CMS**
   - Go to: `http://localhost:3000/cms`
   - Should work if role is present

## Expected Behavior

### ✅ Success
- Console shows: "✅ CMS access granted for: admin admin@jkuat.ac.ke"
- CMS dashboard loads with all tabs visible
- No error messages

### ❌ Failure
- Console shows: "Access denied. CMS access requires executive or admin role. Your role: member"
- Error modal appears
- CMS doesn't load

## Next Steps

Run these commands in browser console to diagnose:

```javascript
// 1. Check if logged in
window.authManager.isAuthenticated()

// 2. Get user object
const user = window.authManager.getUser()
console.log('User:', user)

// 3. Check role specifically
console.log('Role:', user?.role)

// 4. Check localStorage
console.log('Stored user:', JSON.parse(localStorage.getItem('user')))

// 5. Check if role validation passes
console.log('Has CMS access:', user && (user.role === 'executive' || user.role === 'admin'))
```

Share the output of these commands and I can pinpoint the exact issue!
