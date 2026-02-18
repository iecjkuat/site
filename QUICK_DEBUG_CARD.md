# 🚀 Quick Debug Card - Ideas Page

## ⚡ 30-Second Fix

```bash
# 1. Kill server
taskkill /F /IM node.exe

# 2. Start server
npm start

# 3. In browser console (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();

# 4. Log in again
# Go to: http://localhost:3000/pages/auth/signin.html
```

---

## 🔍 Check Error Details

Open console (F12) and look for:

### Token Expired (401):
```
status: 401
errorMessage: "Session expired. Please log in again."
```
**Fix**: Clear storage and re-login (see above)

### Duplicate Vote (409):
```
status: 409
errorMessage: "Vote already exists..."
```
**Fix**: Already handled automatically with UPSERT

### Rate Limited (429):
```
status: 429
errorMessage: "Too many authentication attempts..."
```
**Fix**: Wait 1 minute, then try again

### Server Error (500):
```
status: 500
errorMessage: "Failed to record vote"
```
**Fix**: Check server logs, run SQL scripts

---

## 📋 SQL Scripts to Run

In Supabase SQL Editor:

1. `supabase/26-fix-vote-type-constraint.sql`
2. `supabase/27-add-password-change-tracking.sql`

---

## 🧪 Test Suite

Go to: `http://localhost:3000/test-ideas-endpoints.html`

Run all tests to see what's working/broken.

---

## 📊 Console Commands

```javascript
// Check token
const token = localStorage.getItem('authToken');
console.log('Has token:', !!token);

// Check if expired
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Expired:', Date.now() > payload.exp * 1000);
}

// Test vote manually
const ideaId = document.querySelector('[data-action="like-idea"]')?.dataset.ideaId;
fetch(`/api/v1/ideas/${ideaId}/vote`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ voteType: 'like' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## ✅ Success Indicators

- ✅ Console shows detailed error objects (not just "Object")
- ✅ Like button increases/decreases count
- ✅ Comment modal opens
- ✅ Comments show your name
- ✅ No red errors in console

---

## 📞 Still Stuck?

1. Copy console error output
2. Copy server logs
3. Share both for detailed help

The new error logging will show exactly what's wrong!
