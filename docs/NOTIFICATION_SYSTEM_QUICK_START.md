# Notification System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Database Setup (1 minute)
1. Open Supabase SQL Editor
2. Run: `database/create_notifications_system_clean.sql`
3. Verify: You should see 6 new tables created

### Step 2: Start Server (30 seconds)
```bash
npm start
```
Server should start on `http://localhost:3000`

### Step 3: Send Your First Notification (2 minutes)

#### As Admin:
1. Navigate to: `http://localhost:3000/admin`
2. Click "Notifications" tab
3. Click "Send Notification" button
4. Fill in:
   - Type: `announcement`
   - Recipient: `All Users`
   - Priority: `medium`
   - Title: `Welcome to Notifications!`
   - Message: `This is your first notification`
5. Click "Send Notification"

#### As User:
1. Navigate to: `http://localhost:3000/dashboard`
2. See notification count on "Notifications" card
3. Click "View" button
4. See your notification!

## 📝 Common Tasks

### Send Notification to Single User
```javascript
// Admin Dashboard → Notifications → Send Notification
Recipient Type: Single User
User Email: user@example.com
```

### Send Notification to All Members
```javascript
// Admin Dashboard → Notifications → Send Notification
Recipient Type: By Role
Role: Members
```

### Create Campaign
```javascript
// Admin Dashboard → Notifications → Create Campaign
Name: Monthly Newsletter
Type: Newsletter
Message: Your monthly update...
```

### Mark Notification as Read
```javascript
// User Dashboard → Notifications → View → Mark as read
```

## 🔧 API Examples

### Send Notification (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/notifications/send \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "announcement",
    "title": "Test",
    "message": "Hello World",
    "priority": "medium",
    "recipient_type": "all"
  }'
```

### Get User Notifications
```bash
curl http://localhost:3000/api/v1/notifications/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Statistics
```bash
curl http://localhost:3000/api/admin/notifications/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🎯 Notification Types

| Type | Use Case |
|------|----------|
| `announcement` | General announcements |
| `event_reminder` | Upcoming events |
| `payment_reminder` | Payment due dates |
| `system_alert` | Critical system messages |
| `membership_update` | Membership changes |
| `project_update` | Project notifications |

## 🎨 Priority Levels

| Priority | Color | Use Case |
|----------|-------|----------|
| `low` | Gray | FYI messages |
| `medium` | Blue | Standard notifications |
| `high` | Orange | Important updates |
| `urgent` | Red | Critical alerts |

## 🎯 Targeting Options

| Type | Description |
|------|-------------|
| `single` | One user by email |
| `all` | All users |
| `role` | By role (member, admin, moderator) |
| `status` | By membership status (active, inactive, expired) |

## 🐛 Troubleshooting

### Notifications not showing?
1. Check database: `SELECT * FROM notifications LIMIT 5;`
2. Check user ID matches
3. Check auth token is valid

### Can't send notifications?
1. Verify admin role: `SELECT role FROM users WHERE id = 'YOUR_ID';`
2. Check server logs for errors
3. Verify database tables exist

### Count not updating?
1. Refresh dashboard
2. Check browser console for errors
3. Verify API endpoint is accessible

## 📚 Documentation

- **Full Design**: `docs/NOTIFICATION_SYSTEM_DESIGN.md`
- **Implementation Status**: `docs/NOTIFICATION_SYSTEM_IMPLEMENTATION_STATUS.md`
- **Complete Guide**: `docs/NOTIFICATION_SYSTEM_COMPLETE.md`
- **This Guide**: `docs/NOTIFICATION_SYSTEM_QUICK_START.md`

## ✅ Verification Checklist

- [ ] Database tables created
- [ ] Server running without errors
- [ ] Admin can access notifications tab
- [ ] Admin can send notification
- [ ] User can see notification count
- [ ] User can view notifications
- [ ] User can mark as read

## 🎉 You're Ready!

The notification system is fully operational. Start sending notifications to your users!

---

**Need Help?** Check the full documentation in `docs/NOTIFICATION_SYSTEM_COMPLETE.md`
