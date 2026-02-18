# Duplicate Vote Error - Fixed

## 🚨 The Error

```
'Failed to record vote', error: 'duplicate key value violates unique constraint "idea_votes_idea_id_user_id_key"'
```

## 🔍 Root Cause

**Race condition**: When you click the like button, the code checks if a vote exists, doesn't find one, then tries to insert. But if you clicked twice quickly, both requests try to insert at the same time, causing a duplicate key violation.

The database has a UNIQUE constraint on `(idea_id, user_id)` to prevent duplicate votes, which is correct. The backend code just needed better handling.

## ✅ What Was Fixed

### 1. Added UPSERT Logic
Instead of just INSERT, now uses `upsert()` which handles duplicates gracefully:

```javascript
const { error: insertError } = await supabase
    .from('idea_votes')
    .upsert({
        idea_id: id,
        user_id: userId,
        vote_type: voteType
    }, {
        onConflict: 'idea_id,user_id',
        ignoreDuplicates: false
    });
```

### 2. Added Duplicate Error Handling
If a duplicate is still detected (edge case), the code now updates instead of failing:

```javascript
if (insertError.code === '23505') {
    console.log('⚠️ Duplicate detected, updating instead...');
    await supabase
        .from('idea_votes')
        .update({ vote_type: voteType })
        .eq('idea_id', id)
        .eq('user_id', userId);
}
```

### 3. Better Error Response
Returns user-friendly error message:

```javascript
if (error.code === '23505') {
    return res.status(409).json({ 
        message: 'Vote already exists. Please refresh and try again.',
        error: 'duplicate_vote'
    });
}
```

### 4. Added Vote Action Tracking
Response now includes what action was taken:

```javascript
{
    message: 'Vote recorded successfully',
    action: 'created' | 'updated' | 'removed',
    voteType: 'like' | 'dislike' | null
}
```

## 🎯 How It Works Now

### Scenario 1: First Vote
1. User clicks like
2. No existing vote found
3. UPSERT creates new vote
4. ✅ Success

### Scenario 2: Toggle Off (Click Same Button)
1. User clicks like (already liked)
2. Existing vote found with type 'like'
3. DELETE removes the vote
4. ✅ Success - vote removed

### Scenario 3: Change Vote (Like → Dislike)
1. User clicks dislike (already liked)
2. Existing vote found with type 'like'
3. UPDATE changes vote_type to 'dislike'
4. ✅ Success - vote changed

### Scenario 4: Race Condition (Double Click)
1. User double-clicks like quickly
2. Both requests check for existing vote
3. Both try to insert
4. First insert succeeds
5. Second insert detects duplicate (23505 error)
6. Second request automatically updates instead
7. ✅ Success - no error shown to user

## 🧪 Testing

### Test 1: Normal Like
- Click like button once
- Should see: "Vote recorded successfully"
- Vote count increases by 1

### Test 2: Toggle Off
- Click like button again
- Should see: "Vote recorded successfully"
- Vote count decreases by 1

### Test 3: Change Vote
- Click like, then click dislike
- Should see: "Vote recorded successfully" both times
- Like count decreases, dislike count increases

### Test 4: Rapid Clicks
- Click like button 5 times rapidly
- Should NOT see any errors
- Final state should be correct (either liked or not liked)

## 📊 Console Output

### Success:
```
✅ Vote request authenticated: {ideaId: '...', userId: '...', voteType: 'like'}
➕ New vote created
✅ Vote counts updated: {likes: 5, dislikes: 2}
Vote successful: {message: 'Vote recorded successfully', action: 'created', voteType: 'like'}
```

### Duplicate Handled:
```
✅ Vote request authenticated: {ideaId: '...', userId: '...', voteType: 'like'}
⚠️ Duplicate detected, updating instead...
✅ Vote counts updated: {likes: 5, dislikes: 2}
Vote successful: {message: 'Vote recorded successfully', action: 'updated', voteType: 'like'}
```

### Toggle Off:
```
✅ Vote request authenticated: {ideaId: '...', userId: '...', voteType: 'like'}
🗑️ Vote removed
✅ Vote counts updated: {likes: 4, dislikes: 2}
Vote successful: {message: 'Vote recorded successfully', action: 'removed', voteType: null}
```

## 🔧 Additional Fixes Needed

### 1. Run SQL Script (Still Required)
```bash
# In Supabase SQL Editor:
supabase/26-fix-vote-type-constraint.sql
```

This changes the vote_type constraint from ('up', 'down') to ('like', 'dislike').

### 2. Clear Expired Token
If you still see "Token expired" errors:
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then log in again
```

## ✅ Summary

**Fixed**: Duplicate vote error with UPSERT and better error handling

**Still need to**:
1. Run `supabase/26-fix-vote-type-constraint.sql`
2. Clear tokens and re-login if expired

**Expected behavior**: Like/dislike buttons should work smoothly, even with rapid clicks!
