# Comment Like & Reply Endpoints Fix

## Problem
- Like endpoint returned "Failed to like comment"
- Reply endpoint returned "API endpoint not found"

## Root Cause
Route parameter mismatch in Express routes:
- Comment routes used `:id` for idea ID
- Like/Reply routes used `:ideaId` for idea ID
- This caused Express to not match the routes correctly

## Solution
Changed the like and reply routes to use `:id` instead of `:ideaId` to match the existing comment route pattern.

### Before
```javascript
router.post('/:ideaId/comments/:commentId/like', ...)
router.post('/:ideaId/comments/:commentId/reply', ...)
```

### After
```javascript
router.post('/:id/comments/:commentId/like', ...)
router.post('/:id/comments/:commentId/reply', ...)
```

## Routes Structure
All comment-related routes now use consistent parameter naming:
- `GET /:id/comments` - Get comments
- `POST /:id/comments` - Post comment
- `POST /:id/comments/:commentId/like` - Like/unlike comment
- `POST /:id/comments/:commentId/reply` - Reply to comment

## Testing Steps

### 1. Run the SQL Migration
Execute `supabase/29-create-idea-comment-likes.sql` in your Supabase SQL Editor to create the `idea_comment_likes` table.

### 2. Restart the Server
```bash
npm start
```

### 3. Test Like Functionality
1. Open Ideas page
2. Click "Comment" on any idea
3. Click the heart icon on a comment
4. Should see:
   - Like count increases
   - Heart turns red and fills
   - Heart pulse animation
5. Click again to unlike
   - Like count decreases
   - Heart turns gray and outlines

### 4. Test Reply Functionality
1. Click "Reply" on a comment
2. Should see:
   - Purple "Replying to [Name]" banner appears
   - Input placeholder changes
   - Input focuses
3. Type a reply and click "Post Comment"
4. Should see:
   - Reply appears in comments list
   - Reply banner disappears
   - Comment count updates

## Console Logs to Watch

### Like Success
```
Liking comment: { ideaId: "...", commentId: "...", url: "/api/v1/ideas/.../comments/.../like" }
Like response: { status: 200, statusText: "OK", ok: true }
Like successful: { liked: true, likes_count: 1, message: "Comment liked" }
```

### Reply Success
```
Posting comment: { ideaId: "...", isReply: true, parentCommentId: "...", url: "/api/v1/ideas/.../comments/.../reply" }
Comment response: { status: 201, statusText: "Created", ok: true }
```

## Backend Logs to Watch

### Like
```
❤️ Liking comment: { commentId: "...", userId: "..." }
✅ Comment liked
```

### Reply
```
💬 Replying to comment: { ideaId: "...", commentId: "...", userId: "..." }
✅ Reply posted successfully
```

## Error Handling

### Database Table Missing
If you get "relation 'idea_comment_likes' does not exist":
1. Run the SQL migration: `supabase/29-create-idea-comment-likes.sql`
2. Restart the server

### Authentication Errors
If you get 401 errors:
1. Check if you're logged in
2. Check if token is valid
3. Token might be expired - log in again

### Route Not Found (404)
If you still get 404:
1. Verify server restarted after code changes
2. Check server logs for route registration
3. Verify URL format matches: `/api/v1/ideas/:id/comments/:commentId/like`

## Files Modified
1. `routes/ideas.js` - Changed `:ideaId` to `:id` in like and reply routes
2. `pages/ideas/ideas.js` - Added detailed error logging
3. `supabase/29-create-idea-comment-likes.sql` - New table for comment likes

## Next Steps
After fixing:
1. Test like functionality thoroughly
2. Test reply functionality
3. Verify comment counts update correctly
4. Check that replies appear in the comments list
5. Test unlike functionality (toggle)
