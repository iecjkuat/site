# Ideas Page - Like & Comment System Issues

## Issues Identified

### 1. DUPLICATE VOTE ENDPOINT (Critical)
**Location**: `routes/ideas.js` lines 365 and 556

There are TWO `POST /:id/vote` endpoints defined:
- First endpoint (line 365): Missing authentication middleware, expects `req.user` but doesn't use `authenticateToken`
- Second endpoint (line 556): Has custom authentication logic that tries both JWT and Supabase auth

**Problem**: Express uses the FIRST matching route, so the broken endpoint at line 365 is being used.

### 2. VOTE TYPE MISMATCH (Critical)
**Location**: `supabase/07-fix-schema-issues.sql` line 778

Database schema defines vote types as:
```sql
vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down'))
```

But frontend and backend are using:
```javascript
voteType: 'like' // or 'dislike'
```

**Problem**: Database constraint rejects 'like'/'dislike' values, only accepts 'up'/'down'.

### 3. VOTE COUNT COLUMN INCONSISTENCY (Medium)
**Location**: `routes/ideas.js` and database schema

- First endpoint (line 365) updates: `votes_count`
- Second endpoint (line 556) updates: `likes_count` and `dislikes_count`
- Database has both columns: `likes_count`, `comments_count`, `votes_count`

**Problem**: Inconsistent column usage causes vote counts to not display correctly.

### 4. COMMENT ENDPOINT MISSING AUTHENTICATION (Critical)
**Location**: `routes/ideas.js` line 499

Comment endpoint uses anonymous user:
```javascript
const anonymousUserId = (await supabase.from('users').select('id').limit(1).single()).data?.id;
```

**Problem**: 
- Comments are posted as random first user in database
- No authentication required
- Security vulnerability

### 5. MISSING AUTHENTICATION MIDDLEWARE (Critical)
**Location**: `routes/ideas.js`

Neither vote nor comment endpoints use `authenticateToken` middleware properly.

**Problem**: Routes don't validate JWT tokens consistently.

## Files to Fix

### Priority 1 (Must Fix):
1. `routes/ideas.js` - Remove duplicate endpoint, fix authentication, fix vote types
2. `supabase/07-fix-schema-issues.sql` - Update vote_type constraint OR change frontend/backend to use 'up'/'down'

### Priority 2 (Should Fix):
3. `pages/ideas/ideas.js` - Update frontend to match backend vote types if needed

## Recommended Fixes

### Fix 1: Remove Duplicate Vote Endpoint
Delete the FIRST vote endpoint (lines 365-450) and keep only the second one (lines 556+).

### Fix 2: Add Authentication Middleware
```javascript
router.post('/:id/vote', authenticateToken, [
    param('id').isUUID().withMessage('Valid idea ID required'),
    body('voteType').isIn(['like', 'dislike']).withMessage('Valid vote type required')
], async (req, res) => {
    // Use req.user.id from authenticateToken middleware
    const userId = req.user.id;
    // ... rest of code
});

router.post('/:id/comments', authenticateToken, [
    param('id').isUUID().withMessage('Valid idea ID required'),
    body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
    // Use req.user.id from authenticateToken middleware
    const userId = req.user.id;
    // ... rest of code
});
```

### Fix 3: Fix Vote Type Constraint
Option A - Update database constraint:
```sql
ALTER TABLE idea_votes DROP CONSTRAINT IF EXISTS idea_votes_vote_type_check;
ALTER TABLE idea_votes ADD CONSTRAINT idea_votes_vote_type_check 
    CHECK (vote_type IN ('like', 'dislike'));
```

Option B - Update frontend/backend to use 'up'/'down' instead of 'like'/'dislike'.

### Fix 4: Standardize Vote Count Column
Decide on ONE approach:
- Use `votes_count` for total votes (likes - dislikes)
- OR use `likes_count` and `dislikes_count` separately

Update all endpoints and frontend to use the same columns consistently.

## Testing Checklist

After fixes:
- [ ] Like button works and updates count immediately
- [ ] Unlike (clicking like again) removes vote
- [ ] Vote count displays correctly
- [ ] Comment submission requires authentication
- [ ] Comments appear with correct user name/avatar
- [ ] Comment count updates correctly
- [ ] Browser console shows no errors
- [ ] Server logs show successful authentication
- [ ] Database shows correct vote_type values
- [ ] Database shows correct user_id for comments

## Current Behavior vs Expected

### Current (Broken):
- Like button click → 401 Unauthorized OR database constraint error
- Comment submission → Posts as random user
- Vote counts don't update

### Expected (After Fix):
- Like button click → Vote recorded, count updates immediately
- Comment submission → Requires login, posts as authenticated user
- Vote counts update in real-time
