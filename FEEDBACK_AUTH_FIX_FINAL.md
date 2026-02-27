# Feedback Authentication Fix - Public Reviews

## 🐛 Problem

When submitting a "Public Review" (not anonymous), it was being saved as an anonymous whisper with `user_id = NULL`.

## 🔍 Root Cause

The backend route `/api/v1/feedback-simple/submit` was NOT using authentication middleware, so `req.user` was always undefined, even when a valid token was sent.

**Backend code (line 33):**
```javascript
const userId = isAnonymous ? null : req.user?.id;
```

Since `req.user` was always undefined, `userId` was always `null`, making all submissions anonymous.

## ✅ Solution

Added **optional authentication middleware** that:
1. Checks if Authorization header exists
2. If yes, authenticates and populates `req.user`
3. If no or invalid, continues without user (for anonymous whispers)

### Changes Made

**File: `routes/feedback-simple.js`**

1. **Imported auth middleware:**
```javascript
const { authenticateToken } = require('../middleware/auth');
```

2. **Created optional auth middleware:**
```javascript
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return next(); // No token, continue without user
    }
    
    try {
        await authenticateToken(req, res, next);
    } catch (error) {
        console.log('⚠️ Optional auth failed, continuing without user');
        next(); // Invalid token, continue without user
    }
};
```

3. **Applied middleware to submit route:**
```javascript
router.post('/submit', optionalAuth, [ // <-- Added optionalAuth
    body('comment').isLength({ min: 3, max: 2000 })...
```

4. **Enhanced logging:**
```javascript
console.log('💾 Inserting feedback:', { 
    userId, 
    isAnonymous, 
    commentLength: comment.length,
    hasUser: !!req.user,
    userEmail: req.user?.email
});
```

## 🧪 How to Test

### Step 1: Restart Server
```bash
# Stop server (Ctrl+C)
# Start server
npm start
```

### Step 2: Test Anonymous Whisper
1. Go to `/feedback`
2. Stay on "Anonymous Whisper" mode
3. Submit a message
4. Check server logs: should show `hasUser: false, userId: null`
5. Check CMS → Feedback → Whispers: should appear

### Step 3: Test Public Review
1. **Make sure you're logged in**
2. Go to `/feedback`
3. Click "Public Review" button
4. Select rating (1-5 stars)
5. Submit a message
6. Check server logs: should show `hasUser: true, userId: [your-id], userEmail: [your-email]`
7. Check CMS → Feedback → Reviews: should appear with your name

## 📊 Expected Server Logs

### Anonymous Whisper:
```
📥 Feedback submission received: { isAnonymous: true, hasComment: true, rating: undefined }
💾 Inserting feedback: { 
  userId: null, 
  isAnonymous: true, 
  commentLength: 10,
  hasUser: false,
  userEmail: undefined
}
✅ Feedback saved: [id]
```

### Public Review:
```
📥 Feedback submission received: { isAnonymous: false, hasComment: true, rating: 5 }
💾 Inserting feedback: { 
  userId: 'abc123...', 
  isAnonymous: false, 
  commentLength: 15,
  hasUser: true,
  userEmail: 'admin@jkuat.ac.ke'
}
✅ Feedback saved: [id]
```

## 🎯 What This Fixes

- ✅ Anonymous whispers still work (no login required)
- ✅ Public reviews now save with user ID
- ✅ Reviews appear in "Public Reviews" tab (not whispers)
- ✅ Reviews show user name in CMS
- ✅ Better logging for debugging

## 📝 Summary

The issue was that the backend wasn't extracting user information from the JWT token. Now it does, so public reviews are properly associated with the logged-in user.

**Before:** All submissions → `user_id = NULL` → Anonymous whispers
**After:** 
- Anonymous whispers → `user_id = NULL` → Whispers tab
- Public reviews → `user_id = [user-id]` → Reviews tab
