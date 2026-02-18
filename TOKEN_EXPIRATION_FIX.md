# Token Expiration - Immediate Fix

## 🚨 The Problem

Your error: **"Error: Token expired"**

Your JWT authentication token has expired (24-hour lifetime). This is why likes and comments aren't working.

## ✅ Immediate Solution (30 seconds)

### Option 1: Clear Browser Storage (Recommended)
1. Open browser console (F12)
2. Paste this:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```
3. Log in again
4. Try liking/commenting - should work!

### Option 2: Manual Clear
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Local Storage" → your domain
4. Delete `authToken` key
5. Click "Session Storage" → your domain  
6. Delete `authToken` key
7. Refresh page and log in again

## 🔧 What Was Fixed

The frontend (`pages/ideas/ideas.js`) now automatically:
1. Detects expired tokens
2. Shows user-friendly message: "Your session has expired. Please log in again."
3. Clears expired tokens
4. Redirects to login page

## 🎯 Next Steps

### 1. Run SQL Fix (if not done yet)
```bash
# In Supabase SQL Editor:
supabase/26-fix-vote-type-constraint.sql
```

### 2. Test After Re-login
- Click like button → Should work
- Post comment → Should work
- If token expires again → Auto-redirect to login

## 📊 Token Lifetime

Current setting: **24 hours**

Location: `middleware/auth.js` line 28
```javascript
exp: Math.floor(Date.now() / 1000) + (options.expiresIn || 24 * 60 * 60)
```

To change (optional):
- 1 hour: `1 * 60 * 60`
- 7 days: `7 * 24 * 60 * 60`
- 30 days: `30 * 24 * 60 * 60`

## 🔍 How to Check Token Status

```javascript
// In browser console:
const token = localStorage.getItem('authToken');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    
    console.log('Token expires:', expiresAt);
    console.log('Current time:', now);
    console.log('Expired?', now > expiresAt);
    console.log('Time remaining:', Math.round((expiresAt - now) / 1000 / 60), 'minutes');
} else {
    console.log('No token found');
}
```

## 🚀 Future Improvements (Optional)

### 1. Token Refresh Endpoint
Add automatic token refresh before expiration:
```javascript
// In routes/auth.js
router.post('/refresh-token', authenticateToken, async (req, res) => {
    const newToken = generateSecureToken(req.user.id, req.user.role);
    res.json({ token: newToken });
});
```

### 2. Auto-Refresh in Frontend
```javascript
// Check token expiration every 5 minutes
setInterval(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        
        // Refresh if less than 1 hour remaining
        if (expiresIn < 60 * 60 * 1000) {
            fetch('/api/v1/auth/refresh-token', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(data => localStorage.setItem('authToken', data.token));
        }
    }
}, 5 * 60 * 1000);
```

### 3. Remember Me Feature
Store longer-lived refresh token:
```javascript
// On login with "Remember Me" checked:
localStorage.setItem('refreshToken', longLivedToken);
// Use refresh token to get new access tokens
```

## ✅ Summary

**Right now**: Clear tokens and re-login (30 seconds)

**After re-login**: Everything should work perfectly

**Going forward**: System will auto-detect expired tokens and redirect to login
