# Support Page Message Persistence

## Overview
The support page now loads and displays all previous messages and replies, ensuring users can see their conversation history even after refreshing the page.

## Implementation

### Key Features

1. **Load Previous Messages on Page Load**
   - Automatically fetches user's support tickets when page loads
   - Retrieves all replies for each ticket
   - Builds a complete timeline of the conversation

2. **Auto-Refresh**
   - Checks for new replies every 10 seconds
   - Updates silently in the background
   - Ensures users see admin responses without manual refresh

3. **Message Timeline**
   - Combines tickets and replies into chronological order
   - Shows user messages on the left (with user avatar)
   - Shows admin replies on the right (with support avatar)
   - Displays timestamps for each message

4. **Visual Feedback**
   - Shows typing indicator while loading messages
   - Smooth animations for new messages
   - Auto-scrolls to bottom to show latest messages

## How It Works

### On Page Load
```javascript
1. User visits /support page
2. Page checks if user is logged in
3. If logged in, fetches all tickets for that user
4. For each ticket, fetches full details including replies
5. Builds timeline: [ticket1, reply1, reply2, ticket2, reply3, ...]
6. Sorts by timestamp (oldest first)
7. Renders all messages in chat window
8. Scrolls to bottom
```

### When User Sends Message
```javascript
1. User types message and clicks Send
2. Message appears in chat immediately
3. API call creates new support ticket
4. After 1 second, reloads all messages
5. New message appears in proper timeline position
```

### Auto-Refresh (Every 10 seconds)
```javascript
1. Silently fetches latest tickets and replies
2. Rebuilds timeline
3. Updates chat window if new replies exist
4. No visual interruption for user
```

## API Endpoints Used

### Get User's Tickets
```
GET /api/v1/support?userId={userId}
Headers: Authorization: Bearer {token}
Returns: { tickets: [...] }
```

### Get Ticket Details with Replies
```
GET /api/v1/support/{ticketId}
Headers: Authorization: Bearer {token}
Returns: { 
  id, description, created_at, 
  replies: [{ id, content, created_at, is_admin }] 
}
```

### Create New Ticket
```
POST /api/v1/support
Headers: Authorization: Bearer {token}
Body: { userId, subject, description, category, priority }
Returns: { ticket: {...} }
```

## Message Display

### User Messages
- Avatar: User icon (left side)
- Bubble: Light background
- Position: Left-aligned
- Timestamp: Below message

### Admin Replies
- Avatar: Headset icon (right side)
- Bubble: Purple gradient background
- Position: Right-aligned
- Timestamp: Below message

## Code Structure

### Main Methods

**`loadPreviousMessages(silent = false)`**
- Fetches all user's tickets and replies
- Builds chronological timeline
- Renders messages in chat window
- Called on page load and every 10 seconds

**`clearMessages()`**
- Removes all messages except welcome message
- Prepares chat for fresh message load

**`addMessage(text, type, timestamp)`**
- Creates message element with avatar and bubble
- Adds timestamp if provided
- Inserts into chat window
- Scrolls to bottom

**`sendUserMessage(message)`**
- Sends message to API
- Shows confirmation
- Reloads messages after 1 second

## User Experience Flow

### First Visit (No Previous Messages)
```
1. User opens /support
2. Sees welcome message
3. Types and sends first message
4. Message appears in chat
5. Confirmation message shown
```

### Return Visit (Has Previous Messages)
```
1. User opens /support
2. Sees welcome message + typing indicator
3. Previous messages load (with timestamps)
4. Chat shows full conversation history
5. User can continue conversation
```

### Receiving Admin Reply
```
1. User has support page open
2. Admin replies from CMS Messages tab
3. Within 10 seconds, reply appears in user's chat
4. User sees admin response without refreshing
```

## Technical Details

### Message Timeline Structure
```javascript
[
  {
    id: "uuid",
    content: "User's original message",
    created_at: "2024-01-15T10:30:00Z",
    isAdmin: false,
    type: "ticket"
  },
  {
    id: "uuid",
    content: "Admin's reply",
    created_at: "2024-01-15T10:35:00Z",
    isAdmin: true,
    type: "reply"
  },
  // ... more messages
]
```

### Timestamp Display
- Format: `MM/DD/YYYY HH:MM AM/PM`
- Example: `1/15/2024 10:30 AM`
- Color: Light gray (rgba(255, 255, 255, 0.6))
- Position: Below message bubble

### Auto-Refresh Logic
```javascript
// Silent refresh every 10 seconds
setInterval(() => this.loadPreviousMessages(true), 10000);

// silent = true means:
// - No typing indicator
// - No console logs
// - Smooth background update
```

## Error Handling

### User Not Logged In
- Messages don't load
- User can still see welcome message
- Prompted to log in when trying to send message

### API Errors
- Logged to console
- User sees welcome message only
- Can still attempt to send new messages

### Network Issues
- Silent failures on auto-refresh
- User's typed messages still appear locally
- Will sync when connection restored

## Testing Checklist

- [ ] Load page when logged out → See welcome message only
- [ ] Load page when logged in (no messages) → See welcome message only
- [ ] Send first message → Message appears, confirmation shown
- [ ] Refresh page → Previous message still visible
- [ ] Admin replies from CMS → Reply appears within 10 seconds
- [ ] Send multiple messages → All appear in timeline
- [ ] Refresh page → All messages and replies visible
- [ ] Check timestamps → Correct date/time format
- [ ] Check message order → Chronological (oldest first)
- [ ] Check avatars → User left, admin right
- [ ] Check auto-scroll → Always shows latest message

## Related Files

- `pages/support/support-modern.html` - Support page UI
- `pages/support/support-modern.js` - Message persistence logic
- `routes/support.js` - Backend API endpoints
- `pages/cms/modules/managers/cms-messages-manager-chat.js` - CMS Messages tab

## Future Enhancements

- WebSocket for real-time updates (no 10-second delay)
- Read receipts (show when admin has read message)
- Typing indicators (show when admin is typing)
- Message reactions/emojis
- File attachments
- Message search
- Export conversation history
