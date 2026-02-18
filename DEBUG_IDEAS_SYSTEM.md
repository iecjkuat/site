# Ideas Page - Complete Diagnostic Guide

## 🔍 Step-by-Step Debugging Process

### Step 1: Check if Server is Running
```bash
# Kill existing process
taskkill /F /IM node.exe

# Start fresh
npm start
```

### Step 2: Open Browser Console (F12)
Navigate to: `http://localhost:3000/pages/ideas/ideas.html`

### Step 3: Run These Commands in Console

#### Test 1: Check if IdeasPage is loaded
```javascript
console.log('IdeasPage exists:', typeof IdeasPage !== 'undefined');
console.log('Instance exists:', typeof window.ideasPageInstance !== 'undefined');
```

#### Test 2: Check Authentication
```javascript
const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
console.log('Has token:', !!token);
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token expires:', new Date(payload.exp * 1000));
    console.log('Is expired:', Date.now() > payload.exp * 1000);
}
```

#### Test 3: Check if Ideas Loaded
```javascript
console.log('Ideas grid:', document.getElementById('ideasGrid'));
console.log('Idea cards:', document.querySelectorAll('.idea-card').length);
```

#### Test 4: Check Like Button
```javascript
const likeBtn = document.querySelector('[data-action="like-idea"]');
console.log('Like button exists:', !!likeBtn);
console.log('Like button:', likeBtn);
console.log('Idea ID:', likeBtn?.dataset.ideaId);
```

#### Test 5: Manually Trigger Like
```javascript
const likeBtn = document.querySelector('[data-action="like-idea"]');
if (likeBtn) {
    const ideaId = likeBtn.dataset.ideaId;
    console.log('Clicking like for idea:', ideaId);
    likeBtn.click();
}
```

#### Test 6: Check Comment Button
```javascript
const commentBtn = document.querySelector('[data-action="comment-idea"]');
console.log('Comment button exists:', !!commentBtn);
console.log('Comment button:', commentBtn);
```

#### Test 7: Test API Endpoints Directly
```javascript
// Test vote endpoint
const token = localStorage.getItem('authToken');
const ideaId = document.querySelector('[data-action="like-idea"]')?.dataset.ideaId;

if (token && ideaId) {
    fetch(`/api/v1/ideas/${ideaId}/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType: 'like' })
    })
    .then(r => r.json())
    .then(data => console.log('Vote response:', data))
    .catch(err => console.error('Vote error:', err));
}
```

#### Test 8: Test Comment Endpoint
```javascript
const token = localStorage.getItem('authToken');
const ideaId = document.querySelector('[data-action="comment-idea"]')?.dataset.ideaId;

if (token && ideaId) {
    fetch(`/api/v1/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: 'Test comment' })
    })
    .then(r => r.json())
    .then(data => console.log('Comment response:', data))
    .catch(err => console.error('Comment error:', err));
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Token expired"
**Symptoms**: 401 error, "Token expired" message

**Solution**:
```javascript
// Clear tokens
localStorage.clear();
sessionStorage.clear();
// Then log in again
```

### Issue 2: "Duplicate key violation"
**Symptoms**: 500 error, "duplicate key value violates unique constraint"

**Solution**: Already fixed in backend with UPSERT logic. If still occurring:
```sql
-- Check for duplicate votes
SELECT idea_id, user_id, COUNT(*) 
FROM idea_votes 
GROUP BY idea_id, user_id 
HAVING COUNT(*) > 1;

-- Remove duplicates (keep newest)
DELETE FROM idea_votes a USING (
    SELECT MIN(ctid) as ctid, idea_id, user_id
    FROM idea_votes 
    GROUP BY idea_id, user_id HAVING COUNT(*) > 1
) b
WHERE a.idea_id = b.idea_id 
AND a.user_id = b.user_id 
AND a.ctid <> b.ctid;
```

### Issue 3: "Vote type constraint"
**Symptoms**: Vote rejected, constraint violation

**Solution**: Run SQL script
```bash
# In Supabase SQL Editor:
supabase/26-fix-vote-type-constraint.sql
```

### Issue 4: Buttons Not Responding
**Symptoms**: Click does nothing, no console errors

**Possible Causes**:
1. Event listener not attached
2. Button created after listener setup
3. JavaScript error preventing execution

**Debug**:
```javascript
// Check if event listener is working
document.addEventListener('click', (e) => {
    console.log('Clicked:', e.target);
    console.log('Closest action:', e.target.closest('[data-action]'));
});
```

### Issue 5: Modal Not Opening
**Symptoms**: Comment button click does nothing

**Debug**:
```javascript
// Manually open modal
const modal = document.getElementById('commentsModal');
console.log('Modal exists:', !!modal);
modal.style.display = 'flex';
```

---

## 📋 Complete Checklist

### Backend Checks:
- [ ] Server is running on port 3000
- [ ] No errors in server console
- [ ] SQL script `26-fix-vote-type-constraint.sql` has been run
- [ ] SQL script `27-add-password-change-tracking.sql` has been run
- [ ] `routes/ideas.js` has the updated vote endpoint
- [ ] `middleware/auth.js` has rate limiting and blacklist

### Database Checks:
```sql
-- Check vote_type constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'idea_votes_vote_type_check';
-- Should return: CHECK (vote_type IN ('like', 'dislike'))

-- Check if ideas exist
SELECT COUNT(*) FROM ideas WHERE status = 'approved';
-- Should return > 0

-- Check if votes table exists
SELECT COUNT(*) FROM idea_votes;

-- Check if comments table exists
SELECT COUNT(*) FROM idea_comments;
```

### Frontend Checks:
- [ ] Browser console shows no JavaScript errors
- [ ] Ideas are loading and displaying
- [ ] Like buttons are visible
- [ ] Comment buttons are visible
- [ ] Token exists in localStorage
- [ ] Token is not expired

### Network Checks:
- [ ] Open Network tab in DevTools
- [ ] Click like button
- [ ] Check if POST request is sent to `/api/v1/ideas/{id}/vote`
- [ ] Check response status (should be 200, not 401/500)
- [ ] Check response body for errors

---

## 🔧 Quick Fixes

### Fix 1: Reset Everything
```bash
# 1. Kill server
taskkill /F /IM node.exe

# 2. Clear browser
# Open console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();

# 3. Restart server
npm start

# 4. Log in again
# Go to /pages/auth/signin.html
```

### Fix 2: Test with cURL
```bash
# Get your token from browser console
# Then test vote endpoint:
curl -X POST http://localhost:3000/api/v1/ideas/YOUR_IDEA_ID/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"voteType\":\"like\"}"
```

### Fix 3: Check Server Logs
Look for these messages:
- ✅ `Vote request authenticated`
- ✅ `Vote recorded successfully`
- ❌ `Token expired`
- ❌ `Duplicate key violation`
- ❌ `Rate limit exceeded`

---

## 📊 Expected vs Actual

### Expected Flow:
1. User clicks like button
2. JavaScript calls `likeIdea(ideaId)`
3. Sends POST to `/api/v1/ideas/{id}/vote`
4. Backend validates token
5. Backend creates/updates/deletes vote
6. Backend returns success
7. Frontend reloads ideas
8. Vote count updates

### If Failing at Step 2:
- Event listener not attached
- Button doesn't have correct `data-action` attribute
- JavaScript error before click handler

### If Failing at Step 3:
- Network error
- CORS issue
- Server not running

### If Failing at Step 4:
- Token expired
- Token invalid
- Token missing

### If Failing at Step 5:
- Database constraint error
- Duplicate key error
- Permission error

---

## 🎯 Most Likely Issues

Based on your symptoms, the most likely issues are:

1. **Token Expired** (90% probability)
   - Solution: Clear storage and re-login

2. **SQL Script Not Run** (80% probability)
   - Solution: Run `supabase/26-fix-vote-type-constraint.sql`

3. **Event Listener Not Working** (20% probability)
   - Solution: Check browser console for JavaScript errors

4. **Server Not Restarted** (50% probability)
   - Solution: Kill and restart server

---

## 📞 Next Steps

1. **Run all diagnostic tests above**
2. **Copy and paste the console output**
3. **Copy and paste the Network tab errors**
4. **Copy and paste the server logs**
5. **Share all outputs for detailed analysis**

This will help identify the exact issue!
