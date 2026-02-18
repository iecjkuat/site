# Comment System Testing Guide

## Overview
The comment system has been fully implemented with the following features:
- Load comments for any idea
- Post new comments with authentication
- Real-time comment count updates (no page refresh)
- User information display (name, avatar, timestamp)
- Token expiration handling

## How to Test

### 1. Open an Idea and View Comments
1. Navigate to the Ideas page: `http://localhost:3000/pages/ideas/ideas.html`
2. Click the "Comment" button on any idea card
3. **Expected Result**: Modal opens showing:
   - Idea title
   - Comment count
   - Loading spinner while fetching comments
   - Existing comments (if any) with user name and timestamp
   - Comment input field at the bottom

### 2. Post a New Comment
1. In the comment modal, type a comment in the text area
2. Click "Post Comment" button
3. **Expected Result**:
   - Comment appears immediately in the list
   - Comment count updates on the modal
   - Comment count on the idea card increases by 1
   - Input field clears
   - No page refresh

### 3. View Comment Details
Each comment should display:
- User avatar icon
- User name (from database)
- Time ago (e.g., "2 minutes ago")
- Comment content

### 4. Test Authentication
1. Try to post a comment without being logged in
2. **Expected Result**: Redirected to login page

### 5. Test Token Expiration
1. If your token expires while posting a comment
2. **Expected Result**: Alert message "Your session has expired. Please log in again."
3. Redirected to login page

## Technical Implementation

### Frontend (`pages/ideas/ideas.js`)
- **showComments(ideaId)**: Opens modal and loads comments
- **loadComments(ideaId)**: Fetches comments from API
- **submitComment(ideaId)**: Posts new comment with authentication

### Backend (`routes/ideas.js`)
- **GET /:id/comments**: Returns all comments for an idea with user info
- **POST /:id/comments**: Creates new comment (requires authentication)
  - Updates `comments_count` on the idea automatically

### Database Schema
Table: `idea_comments`
- `id`: UUID (primary key)
- `idea_id`: UUID (foreign key to ideas)
- `user_id`: UUID (foreign key to users)
- `content`: TEXT (comment text)
- `parent_comment_id`: UUID (for nested replies - not yet implemented)
- `likes_count`: INTEGER (for future feature)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Features Implemented

✅ Comment modal with TikTok-style design
✅ Load comments with user information
✅ Post comments with authentication
✅ Real-time comment count updates (no page refresh)
✅ Token expiration handling
✅ Error logging with detailed information
✅ Cache invalidation after posting
✅ Background stats update

## Known Limitations

- Nested replies (parent_comment_id) are not yet implemented in the UI
- Comment likes are not yet implemented in the UI
- Comment editing/deletion not yet implemented
- No pagination for comments (loads all comments at once)

## Console Logs to Watch

When testing, check the browser console for:
- `Show comments for idea: <uuid>` - Modal opened
- `💬 Posting comment:` - Backend received comment
- `✅ Comment count updated to: X` - Backend updated count
- `Updated comment count: X → Y` - Frontend updated card

## API Endpoints

### Get Comments
```
GET /api/v1/ideas/:id/comments
Response: { comments: [...] }
```

### Post Comment
```
POST /api/v1/ideas/:id/comments
Headers: { Authorization: Bearer <token> }
Body: { content: "comment text" }
Response: { comment: {...}, message: "Comment posted successfully" }
```

## Troubleshooting

### Comments not loading
- Check browser console for errors
- Verify idea ID is valid UUID
- Check network tab for API response

### Cannot post comment
- Verify you're logged in (check localStorage/sessionStorage for authToken)
- Check if token is expired
- Verify comment content is not empty

### Comment count not updating
- Check console for "Updated comment count" log
- Verify the idea card has `data-idea-id` attribute
- Check if `.idea-stat span` elements exist

## Next Steps (Future Enhancements)

1. Implement nested replies (reply to comments)
2. Add comment likes/reactions
3. Add comment editing and deletion
4. Add pagination for comments (load more)
5. Add real-time updates using WebSocket
6. Add comment notifications
7. Add rich text formatting for comments
8. Add @mentions for users
