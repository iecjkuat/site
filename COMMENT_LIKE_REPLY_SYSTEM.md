# Comment Like & Reply System Implementation

## Overview
Implemented full like and reply functionality for idea comments, allowing users to interact with comments through likes and threaded replies.

## Database Changes

### New Table: `idea_comment_likes`
Created table to track comment likes with automatic count updates.

**File**: `supabase/29-create-idea-comment-likes.sql`

**Schema**:
- `id`: UUID primary key
- `comment_id`: References `idea_comments(id)`
- `user_id`: References `users(id)`
- `created_at`: Timestamp
- **Unique constraint**: (comment_id, user_id) - prevents duplicate likes

**Triggers**:
- Automatically updates `likes_count` on `idea_comments` table
- Increments on INSERT, decrements on DELETE

## Backend Implementation

### New Endpoints

#### 1. Like/Unlike Comment
**POST** `/api/v1/ideas/:ideaId/comments/:commentId/like`

**Authentication**: Required

**Behavior**:
- If not liked: Creates like record, increments count
- If already liked: Removes like record, decrements count (toggle)

**Response**:
```json
{
  "liked": true,
  "likes_count": 5,
  "message": "Comment liked"
}
```

#### 2. Reply to Comment
**POST** `/api/v1/ideas/:ideaId/comments/:commentId/reply`

**Authentication**: Required

**Body**:
```json
{
  "content": "Reply text"
}
```

**Behavior**:
- Creates new comment with `parent_comment_id` set
- Updates total comment count on idea
- Returns reply with user information

**Response**:
```json
{
  "reply": {
    "id": "uuid",
    "content": "Reply text",
    "user": { "name": "User Name" },
    "created_at": "timestamp"
  },
  "message": "Reply posted successfully"
}
```

## Frontend Implementation

### Like Functionality

#### Visual Features
- **Like count display**: Shows number of likes next to heart icon
- **Toggle behavior**: Click to like, click again to unlike
- **Color change**: Gray → Red when liked
- **Icon change**: Outline heart → Filled heart when liked
- **Animation**: Heart pulse animation on like
- **Hover effect**: Purple highlight on hover

#### Implementation
```javascript
async likeComment(ideaId, commentId, buttonElement)
```

**Features**:
- Disables button during request (prevents double-clicks)
- Updates like count in real-time
- Changes button appearance based on liked state
- Handles authentication errors
- Shows heart pulse animation

### Reply Functionality

#### Visual Features
- **Reply indicator**: Purple banner showing "Replying to [Name]"
- **Cancel button**: X button to cancel reply
- **Placeholder update**: Changes to "Replying to [Name]..."
- **Auto-focus**: Focuses input when reply clicked
- **Slide-down animation**: Smooth appearance of reply indicator

#### Implementation
```javascript
async replyToComment(ideaId, commentId, authorName)
```

**Features**:
- Stores reply context in input dataset
- Shows visual indicator above input
- Allows canceling reply
- Clears state after posting
- Maintains reply thread structure

### Comment Submission Updates

**Enhanced** `submitComment()` method:
- Detects if replying (checks `input.dataset.replyTo`)
- Uses different endpoint for replies
- Clears reply state after posting
- Removes reply indicator
- Reloads comments to show new reply

## UI/UX Enhancements

### Comment Card Updates
- Like button shows count: `❤️ 5`
- Reply button: `↩️ Reply`
- Both buttons have hover effects
- Buttons are properly spaced
- Responsive padding and sizing

### Animations
1. **Heart Pulse**: Plays when liking a comment
2. **Slide Down**: Reply indicator appears smoothly
3. **Hover Effects**: Smooth color transitions

### Color Scheme
- **Default**: `rgba(255, 255, 255, 0.5)` (gray)
- **Hover**: `#8b5cf6` (purple)
- **Liked**: `#ef4444` (red)
- **Reply Indicator**: Purple gradient background

## Testing Checklist

### Like Functionality
- [x] Click like button to like comment
- [x] Like count increases
- [x] Heart icon changes to filled
- [x] Color changes to red
- [x] Heart pulse animation plays
- [x] Click again to unlike
- [x] Like count decreases
- [x] Heart icon changes to outline
- [x] Color changes back to gray
- [x] Requires authentication
- [x] Handles token expiration

### Reply Functionality
- [x] Click reply button
- [x] Reply indicator appears
- [x] Input placeholder updates
- [x] Input focuses automatically
- [x] Cancel button works
- [x] Post reply successfully
- [x] Reply appears in comments
- [x] Reply indicator clears
- [x] Comment count updates
- [x] Requires authentication

## Database Triggers

### Automatic Like Count Updates
```sql
CREATE TRIGGER update_idea_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON idea_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_idea_comment_likes_count();
```

**Benefits**:
- No manual count updates needed
- Always accurate
- Atomic operations
- Prevents race conditions

## Security Features

1. **Authentication Required**: Both endpoints require valid JWT token
2. **User Validation**: Checks `req.user.id` exists
3. **Unique Constraint**: Prevents duplicate likes in database
4. **Token Expiration**: Handles expired tokens gracefully
5. **Input Validation**: Validates UUIDs and content

## Performance Optimizations

1. **Button Disable**: Prevents double-clicks during API calls
2. **Optimistic UI**: Could be added for instant feedback
3. **Batch Updates**: Trigger handles count updates efficiently
4. **Index Creation**: Indexes on comment_id and user_id for fast lookups

## Future Enhancements

### Nested Replies
- Display replies indented under parent comments
- "View replies" button for comments with replies
- Collapse/expand reply threads

### Like List
- Show who liked a comment
- Click like count to see list of users

### Notifications
- Notify users when their comment is liked
- Notify users when someone replies to their comment

### Real-time Updates
- WebSocket for live like count updates
- Live reply notifications
- Presence indicators

### Rich Interactions
- Emoji reactions (not just likes)
- Edit comments
- Delete comments
- Report comments
- Pin comments

## Code Structure

### Frontend Methods
```
IdeasPage class:
├── likeComment(ideaId, commentId, buttonElement)
│   ├── Validates authentication
│   ├── Sends POST request
│   ├── Updates UI based on response
│   └── Handles errors
│
├── replyToComment(ideaId, commentId, authorName)
│   ├── Shows reply indicator
│   ├── Updates input placeholder
│   ├── Stores reply context
│   └── Adds cancel handler
│
└── submitComment(ideaId)
    ├── Checks for reply context
    ├── Uses appropriate endpoint
    ├── Clears reply state
    └── Reloads comments
```

### Backend Routes
```
routes/ideas.js:
├── POST /:ideaId/comments/:commentId/like
│   ├── Check existing like
│   ├── Toggle like/unlike
│   └── Return updated count
│
└── POST /:ideaId/comments/:commentId/reply
    ├── Create reply comment
    ├── Set parent_comment_id
    └── Update idea comment count
```

## Error Handling

### Frontend
- Authentication errors → Redirect to login
- Network errors → Show error message
- Token expiration → Clear tokens and redirect
- Validation errors → Show alert

### Backend
- Missing authentication → 401 Unauthorized
- Invalid UUIDs → 400 Bad Request
- Database errors → 500 Internal Server Error
- Duplicate likes → Handled by unique constraint

## Success Metrics

✅ Users can like comments with visual feedback
✅ Users can unlike comments (toggle)
✅ Like counts update in real-time
✅ Users can reply to comments
✅ Reply context is clear with visual indicator
✅ All interactions require authentication
✅ Smooth animations enhance UX
✅ Database maintains data integrity
✅ Performance is optimized with indexes
✅ Error handling is comprehensive
