# JKUAT Innovation Club - Notifications & Alerts System

## Overview

The Notifications & Alerts System provides comprehensive push notifications, in-app notifications, and email notifications for all club activities. The system supports multiple channels, user preferences, and scheduled notifications.

## Features

### ✅ Notification Channels
- **Push Notifications**: Browser push notifications using Web Push API
- **Email Notifications**: HTML email notifications with templates
- **In-App Notifications**: Notification center with real-time updates
- **SMS Notifications**: (Premium feature - planned)

### ✅ Notification Types
1. **Event Reminders**: Notifications about upcoming events (24h, 1h before)
2. **Meeting Schedules**: Meeting invitations and reminders
3. **Payment Reminders**: Due payment notifications with priority levels
4. **Announcements**: Club-wide announcements and updates
5. **Idea Comments**: Notifications when someone comments on your idea
6. **Idea Collaborations**: Collaboration requests on ideas
7. **Election Periods**: Voting reminders and election notifications
8. **System Alerts**: Important system notifications

### ✅ User Preferences
- Enable/disable specific notification types
- Choose notification channels (email, push, in-app)
- Set quiet hours (no push notifications during specified times)
- Email digest frequency (immediate, daily, weekly, never)
- Timezone settings

### ✅ Advanced Features
- Notification templates with variable substitution
- Bulk notification campaigns
- Scheduled notifications
- Notification expiration
- Read/unread tracking
- Notification analytics
- Offline support with service worker

## Database Schema

### Tables

#### `notifications`
Main notifications table storing all user notifications.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to users)
- type: notification_type enum
- priority: notification_priority enum
- status: notification_status enum
- title: VARCHAR(200)
- message: TEXT
- action_url: VARCHAR(500)
- action_text: VARCHAR(100)
- metadata: JSONB
- related_entity_type: VARCHAR(50)
- related_entity_id: UUID
- scheduled_for: TIMESTAMP
- sent_at: TIMESTAMP
- read_at: TIMESTAMP
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `notification_deliveries`
Tracks delivery status across different channels.

```sql
- id: UUID (primary key)
- notification_id: UUID (foreign key)
- channel: notification_channel enum
- status: notification_status enum
- external_id: VARCHAR(200)
- response_data: JSONB
- error_message: TEXT
- sent_at: TIMESTAMP
- delivered_at: TIMESTAMP
- opened_at: TIMESTAMP
```

#### `notification_preferences`
User preferences for notifications.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key, unique)
- email_enabled: BOOLEAN
- push_enabled: BOOLEAN
- in_app_enabled: BOOLEAN
- sms_enabled: BOOLEAN
- event_reminders: BOOLEAN
- meeting_schedules: BOOLEAN
- payment_reminders: BOOLEAN
- announcements: BOOLEAN
- idea_comments: BOOLEAN
- idea_collaborations: BOOLEAN
- election_periods: BOOLEAN
- system_alerts: BOOLEAN
- email_digest_frequency: VARCHAR(20)
- quiet_hours_start: TIME
- quiet_hours_end: TIME
- timezone: VARCHAR(50)
```

#### `push_subscriptions`
Web push notification subscriptions.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- endpoint: TEXT
- p256dh_key: TEXT
- auth_key: TEXT
- user_agent: TEXT
- device_type: VARCHAR(50)
- browser: VARCHAR(50)
- is_active: BOOLEAN
- last_used_at: TIMESTAMP
```

#### `notification_templates`
Templates for different notification types and channels.

```sql
- id: UUID (primary key)
- type: notification_type enum
- channel: notification_channel enum
- name: VARCHAR(100)
- subject_template: TEXT
- title_template: TEXT
- message_template: TEXT
- action_text_template: TEXT
- variables: JSONB
- is_active: BOOLEAN
- version: INTEGER
```

#### `notification_campaigns`
Bulk notification campaigns.

```sql
- id: UUID (primary key)
- name: VARCHAR(200)
- description: TEXT
- type: notification_type enum
- target_audience: JSONB
- estimated_recipients: INTEGER
- actual_recipients: INTEGER
- title: VARCHAR(200)
- message: TEXT
- action_url: VARCHAR(500)
- action_text: VARCHAR(100)
- scheduled_for: TIMESTAMP
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- status: VARCHAR(20)
- sent_count: INTEGER
- delivered_count: INTEGER
- opened_count: INTEGER
- clicked_count: INTEGER
- created_by: UUID
```

## API Endpoints

### Get User Notifications
```http
GET /api/notifications/user/:userId?page=1&limit=20&unread_only=false
```

**Response:**
```json
{
  "notifications": [...],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### Mark Notification as Read
```http
PATCH /api/notifications/:notificationId/read
Body: { "userId": "user-uuid" }
```

### Mark All as Read
```http
PATCH /api/notifications/user/:userId/read-all
```

### Create Notification
```http
POST /api/notifications
Body: {
  "userId": "user-uuid",
  "type": "event_reminder",
  "title": "Event Tomorrow",
  "message": "Don't forget about the hackathon tomorrow!",
  "priority": "high",
  "actionUrl": "/events/123",
  "actionText": "View Event",
  "metadata": {...},
  "scheduledFor": "2024-12-23T10:00:00Z"
}
```

### Create Bulk Notification
```http
POST /api/notifications/bulk
Body: {
  "name": "Monthly Newsletter",
  "type": "announcement",
  "title": "December Newsletter",
  "message": "Check out what's new this month!",
  "targetAudience": {
    "roles": ["member"],
    "membershipStatus": "active"
  },
  "scheduledFor": "2024-12-25T09:00:00Z"
}
```

### Subscribe to Push Notifications
```http
POST /api/notifications/push/subscribe
Body: {
  "userId": "user-uuid",
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userAgent": "..."
}
```

### Get Notification Preferences
```http
GET /api/notifications/preferences/:userId
```

### Update Notification Preferences
```http
PATCH /api/notifications/preferences/:userId
Body: {
  "email_enabled": true,
  "push_enabled": true,
  "event_reminders": true,
  ...
}
```

### Get VAPID Public Key
```http
GET /api/notifications/vapid-public-key
```

### Send Test Notification
```http
POST /api/notifications/test
Body: {
  "userId": "user-uuid",
  "type": "system_alert"
}
```

## Frontend Components

### NotificationCenter
Main notification center component that displays notifications in a dropdown panel.

**Usage:**
```javascript
// Automatically initialized when user is logged in
// Access via window.notificationCenter
```

**Features:**
- Real-time notification updates
- Unread count badge
- Mark as read functionality
- Notification filtering
- Load more pagination

### NotificationSettings
Settings component for managing notification preferences.

**Usage:**
```html
<div id="notificationSettingsContainer"></div>
<script src="/js/components/notification-settings.js"></script>
```

**Features:**
- Toggle notification channels
- Enable/disable notification types
- Set quiet hours
- Configure email digest frequency
- Test notifications
- Push notification status

## Helper Functions

### Send Event Reminder
```javascript
const NotificationHelpers = require('./utils/notification-helpers');

await NotificationHelpers.sendEventReminder(eventId, '24h');
```

### Send Meeting Schedule
```javascript
await NotificationHelpers.sendMeetingSchedule({
  title: 'Weekly Team Meeting',
  dateTime: new Date('2024-12-23T14:00:00Z'),
  location: 'Conference Room A',
  agenda: 'Discuss project updates',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  attendees: [userId1, userId2, userId3]
});
```

### Send Payment Reminder
```javascript
await NotificationHelpers.sendPaymentReminder({
  userId: 'user-uuid',
  amount: 1000,
  description: 'Membership Fee',
  dueDate: new Date('2024-12-31'),
  id: 'payment-uuid'
});
```

### Send Announcement
```javascript
await NotificationHelpers.sendAnnouncement({
  title: 'Important Update',
  message: 'The club meeting has been rescheduled...',
  priority: 'high',
  actionUrl: '/dashboard',
  actionText: 'View Details',
  targetAudience: {
    roles: ['member', 'executive'],
    membershipStatus: 'active'
  },
  id: 'announcement-uuid'
});
```

### Send Idea Comment Notification
```javascript
await NotificationHelpers.sendIdeaComment({
  ideaId: 'idea-uuid',
  commenterId: 'commenter-uuid',
  commenterName: 'John Doe',
  commentText: 'Great idea! I would love to collaborate.'
});
```

### Send Collaboration Request
```javascript
await NotificationHelpers.sendCollaborationRequest({
  ideaId: 'idea-uuid',
  requesterName: 'Jane Smith',
  message: 'I have experience in mobile development...',
  skillsOffered: ['React Native', 'UI/UX Design']
});
```

### Send Election Notification
```javascript
await NotificationHelpers.sendElectionNotification({
  title: 'Club Elections 2024',
  startDate: new Date('2024-12-20'),
  endDate: new Date('2024-12-27'),
  deadline: new Date('2024-12-27T23:59:59Z'),
  positions: ['President', 'Vice President', 'Secretary'],
  id: 'election-uuid'
});
```

## Service Worker

The service worker (`/js/sw.js`) handles:
- Push notification display
- Notification click handling
- Offline caching
- Background sync

**Features:**
- Custom notification icons and badges
- Action buttons on notifications
- Notification click tracking
- Automatic URL opening
- Offline support

## Environment Variables

Add these to your `.env` file:

```env
# VAPID Keys for Web Push (generate using web-push library)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Generating VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

## Setup Instructions

1. **Run Database Migration:**
```bash
psql -U postgres -d jkuat_clubs -f supabase/12-notifications-system.sql
```

2. **Install Dependencies:**
```bash
npm install web-push nodemailer
```

3. **Configure Environment Variables:**
Add VAPID keys and SMTP settings to `.env`

4. **Include Frontend Components:**
```html
<!-- In your HTML pages -->
<script src="/js/components/notification-center.js"></script>
<script src="/js/components/notification-settings.js"></script>
```

5. **Register Service Worker:**
The service worker is automatically registered by the NotificationCenter component.

## Testing

### Test Push Notifications
1. Open the settings page
2. Navigate to notification settings
3. Enable push notifications
4. Click "Send Test Notification"
5. Check your browser for the push notification

### Test Email Notifications
1. Configure SMTP settings in `.env`
2. Use the test endpoint:
```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid", "type": "system_alert"}'
```

### Test In-App Notifications
1. Log in to the platform
2. Click the notification bell icon
3. Notifications should appear in the dropdown

## Best Practices

1. **Always check user preferences** before sending notifications
2. **Use appropriate priority levels** (urgent for critical notifications only)
3. **Set expiration dates** for time-sensitive notifications
4. **Include action URLs** to make notifications actionable
5. **Use templates** for consistent messaging
6. **Test notifications** before sending to all users
7. **Monitor delivery rates** and adjust as needed
8. **Respect quiet hours** for push notifications
9. **Provide unsubscribe options** in emails
10. **Keep notification messages concise** and clear

## Troubleshooting

### Push Notifications Not Working
- Check if service worker is registered
- Verify VAPID keys are correct
- Ensure HTTPS is enabled (required for push notifications)
- Check browser permissions
- Verify push subscription is active

### Email Notifications Not Sending
- Check SMTP configuration
- Verify email credentials
- Check spam folder
- Review email service logs
- Test SMTP connection

### Notifications Not Appearing in Center
- Check if user is logged in
- Verify notification preferences
- Check browser console for errors
- Ensure WebSocket connection is active
- Refresh the page

## Future Enhancements

- [ ] SMS notifications integration
- [ ] WhatsApp notifications
- [ ] Notification scheduling UI
- [ ] Advanced targeting options
- [ ] A/B testing for notifications
- [ ] Rich media notifications
- [ ] Notification analytics dashboard
- [ ] Custom notification sounds
- [ ] Notification grouping
- [ ] Smart notification timing (ML-based)

## Support

For issues or questions about the notifications system:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team
- Submit an issue on GitHub

---

**Last Updated:** December 22, 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready