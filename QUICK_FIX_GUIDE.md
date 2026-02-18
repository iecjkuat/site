# Quick Fix Guide - Ideas Like & Comment System

## 🚨 ISSUES FOUND & FIXED

### Issue 1: Token Expired ✅ FIXED
**Error**: "Token expired"  
**Cause**: JWT token expired (24-hour lifetime)  
**Fix**: Frontend now auto-detects and redirects to login

### Issue 2: Duplicate Vote Error ✅ FIXED
**Error**: "duplicate key value violates unique constraint"  
**Cause**: Race condition when clicking like button rapidly  
**Fix**: Added UPSERT logic and duplicate error handling

### Issue 3: Vote Type Constraint ⚠️ NEEDS SQL FIX
**Error**: Vote type 'like' rejected by database  
**Cause**: Database expects 'up'/'down', code uses 'like'/'dislike'  
**Fix**: Run SQL script (see below)

## ⚡ Quick Start (3 Steps)

### Step 1: Run SQL Fix
Open Supabase SQL Editor and run:
```bash
supabase/26-fix-vote-type-constraint.sql
```

### Step 2: Clear Token & Re-login
```javascript
// In browser console (F12):
localStorage.clear();
sessionStorage.clear();
// Then go to login page
```

### Step 3: Test
1. Go to Ideas page
2. Click like button → Should work!
3. Click like again → Should toggle off!
4. Post a comment → Should show your name!

## 🔍 What Each Fix Does

### Token Expiration Fix
- Detects expired tokens automatically
- Shows message: "Your session has expired. Please log in again."
- Clears expired tokens
- Redirects to login page

### Duplicate Vote Fix
- Uses UPSERT instead of INSERT
- Handles race conditions gracefully
- No more duplicate key errors
- Works even with rapid clicks

### Vote Type Constraint Fix
- Changes database constraint from ('up', 'down') to ('like', 'dislike')
- Aligns database with frontend/backend code
- Allows votes to be recorded properly

## 📁 Files Changed

- `routes/ideas.js` - Fixed vote endpoint with UPSERT and better error handling
- `pages/ideas/ideas.js` - Added token expiration detection
- `supabase/26-fix-vote-type-constraint.sql` - Database constraint fix
- `DUPLICATE_VOTE_FIX.md` - Detailed duplicate vote fix explanation
- `TOKEN_EXPIRATION_FIX.md` - Token expiration guide

## 🧪 Testing Checklist

After completing all 3 steps:

### Vote System:
- [ ] Click like → Vote recorded
- [ ] Click like again → Vote removed (toggle)
- [ ] Click like, then dislike → Vote changes
- [ ] Rapid click like 5 times → No errors
- [ ] Vote count updates correctly
- [ ] No duplicate key errors
- [ ] No token expired errors

### Comment System:
- [ ] Post comment → Appears with your name
- [ ] Post multiple comments → All show correct user
- [ ] Comment count updates
- [ ] No anonymous comments

## 🔍 Quick Debug

### Still seeing "Token expired"?
```javascript
// Clear and re-login:
localStorage.clear();
sessionStorage.clear();
```

### Still seeing "duplicate key"?
Check if SQL script was run:
```sql
-- In Supabase SQL Editor:
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'idea_votes_vote_type_check';
-- Should return: CHECK (vote_type IN ('like', 'dislike'))
```

### Vote not working at all?
1. Check browser console for errors
2. Check server logs for authentication
3. Verify you're logged in: `localStorage.getItem('authToken')`
4. Check database: `SELECT * FROM idea_votes ORDER BY created_at DESC LIMIT 5;`

## ✅ What Should Work Now

- ✅ Like button records vote
- ✅ Like button toggles on/off
- ✅ Vote counts update in real-time
- ✅ No duplicate key errors (even with rapid clicks)
- ✅ Comments require authentication
- ✅ Comments show correct user info
- ✅ Token expiration auto-redirects to login
- ✅ No more 401 errors (after re-login)
- ✅ No more database constraint errors (after SQL fix)

## 📚 Detailed Documentation

- `DUPLICATE_VOTE_FIX.md` - Duplicate vote error explanation
- `TOKEN_EXPIRATION_FIX.md` - Token expiration guide
- `docs/IDEAS_FIXES_REVIEW.md` - Complete review
- `docs/IDEAS_LIKE_COMMENT_ISSUES.md` - Original issue analysis
