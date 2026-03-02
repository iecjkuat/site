# Modern Support Chat System - Messages Tab

## Overview
The Messages tab in the CMS uses the exact same chat window structure and logic from the support page (`/support`), providing a consistent and familiar interface for executives to respond to support messages.

## Architecture

### Files
- **Manager**: `pages/cms/modules/managers/cms-messages-manager-chat.js`
- **Support Page**: `pages/support/support-modern.html` & `pages/support/support-modern.js`
- **Backend API**: `routes/support.js`
- **Database**: `support_tickets` and `support_ticket_replies` tables

## Chat Window Structure

The chat window follows this exact structure from the support page:

```
┌─────────────────────────────────────┐
│  Chat Header                        │
│  ┌───┐ User Name                    │
│  │ A │ user@email.com               │
│  └───┘                              │
├─────────────────────────────────────┤
│  Chat Messages (Scrollable)         │
│                                     │
│  ┌───┐ ┌──────────────┐            │
│  │ U │ │ User message │            │
│  └───┘ └──────────────┘            │
│                                     │
│        ┌──────────────┐ ┌───┐      │
│        │ Admin reply  │ │ A │      │
│        └──────────────┘ └───┘      │
│                                     │
├─────────────────────────────────────┤
│  Input Area                         │
│  [Type your reply...] [Send]        │
└─────────────────────────────────────┘
```

## Key Features

### 1. Two-Column Layout
- **Left**: Conversations list with user avatars, names, and message previews
- **Right**: Active chat window with full conversation

### 2. Message Display
- **User messages**: Avatar on left, light bubble
- **Admin messages**: Avatar on right, green gradient bubble
- **Timestamps**: Displayed below each message
- **Read indicators**: Check marks for admin messages

### 3. Real-time Features
- Auto-refresh every 10 seconds
- Unread message badges
- Conversation sorting by most recent

### 4. User Experience
- Click conversation to open chat
- Type reply and press Enter or click Send
- Messages scroll to bottom automatically
- Textarea auto-expands as you type

## CSS Styling

All styles are scoped within the Messages manager to avoid conflicts:

- **Colors**: Matches CMS dark theme with purple/green gradients
- **Layout**: CSS Grid for responsive two-column design
- **Animations**: Smooth slide-in for new messages
- **Scrollbars**: Custom styled for consistency

## API Integration

### Endpoints Used
- `GET /api/v1/support` - Fetch all tickets
- `GET /api/v1/support/:id` - Fetch ticket with replies
- `POST /api/v1/support/:id/reply` - Send reply
- `PATCH /api/v1/support/:id/read` - Mark as read

### Data Flow
1. Load all tickets and group by user
2. Display conversations sorted by most recent
3. When conversation selected, fetch full details with replies
4. Flatten tickets + replies into timeline
5. Render chat window with messages
6. Send replies via API and reload conversation

## Comparison with Support Page

| Feature | Support Page | CMS Messages Tab |
|---------|-------------|------------------|
| Layout | Welcome card + Chat | Conversations + Chat |
| User Role | Submit messages | Reply to messages |
| Message Direction | User → System | Admin → User |
| Auto-refresh | No | Yes (10s) |
| Conversation List | No | Yes |
| Multiple Chats | No | Yes |

## Usage

### For Executives
1. Navigate to CMS → Messages tab
2. See list of all conversations with unread badges
3. Click any conversation to open chat window
4. Type reply in input field
5. Press Enter or click Send button
6. Message is sent and conversation updates

### For Users
1. Visit `/support` page
2. Type message in chat window
3. Message appears in CMS Messages tab
4. Executive replies from CMS
5. Reply appears in support page (on refresh)

## Technical Notes

### Memory Management
- Cleanup method stops auto-refresh interval
- Called when switching away from Messages tab

### Error Handling
- Failed API calls show error states
- Empty states for no conversations
- Loading states during data fetch

### Security
- All messages sanitized with `escapeHtml()`
- Auth token required for all API calls
- Only admins/leaders can access CMS

## Future Enhancements

Possible improvements:
- Real-time updates via WebSocket
- Typing indicators
- File attachments
- Message search
- Conversation filters (unread, urgent, etc.)
- Bulk actions (mark all as read)
- Canned responses
- Message templates

## Troubleshooting

### Messages not appearing
- Check browser console for API errors
- Verify auth token is valid
- Ensure support tickets exist in database

### Chat window not loading
- Check `cms-content` div exists in HTML
- Verify manager is imported in cms-manager.js
- Check browser console for JavaScript errors

### Styling issues
- Ensure no CSS conflicts with global styles
- Check that styles are scoped to `.messages-container`
- Verify all CSS classes are unique

## Related Documentation
- [Support Messages System](./SUPPORT_MESSAGES_SYSTEM.md)
- [Real-time Support Chat](./REAL_TIME_SUPPORT_CHAT.md)
- [CMS Security Improvements](./CMS_SECURITY_IMPROVEMENTS.md)
