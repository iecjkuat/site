# Collaboration Email Notification System

## Overview
This document describes the email notification system for project collaboration requests in the JKUAT Innovation and Entrepreneurship Club platform.

## System Architecture

### Components
1. **Email Templates** (`utils/email-templates.js`)
   - Pre-designed HTML email templates
   - Three templates: Request Received, Request Accepted, Request Declined

2. **Email Service** (`utils/collaboration-email-service.js`)
   - Handles sending emails using Nodemailer
   - Manages transporter configuration
   - Provides logging and error handling

3. **API Integration** (`routes/projects.js`)
   - Integrated into collaboration endpoints
   - Sends emails automatically on request submission and status updates

## Email Flow

### 1. When a User Submits a Collaboration Request

**Trigger:** `POST /api/v1/projects/:id/collaborate`

**Email Sent To:** Project Lead

**Email Contains:**
- Requester's name and email
- Desired role
- Skills offered
- Time commitment
- Personal message from requester
- Link to view request in dashboard

**Example:**
```
Subject: New Collaboration Request for "Smart Campus App"
To: projectlead@jkuat.ac.ke

Dear John Doe,

You have received a new collaboration request for your project "Smart Campus App".

Requester Information:
- Name: Jane Smith
- Email: jane@jkuat.ac.ke
- Role: Frontend Developer
- Skills: React, TypeScript, UI/UX
- Time Commitment: 10-20 hours/week

Their Message:
"I'm passionate about improving campus life and have experience building mobile apps..."

[View in Dashboard Button]
```

### 2. When Project Lead Accepts a Request

**Trigger:** `PUT /api/v1/projects/:projectId/collaborations/:collaborationId`
- With `status: 'accepted'`

**Email Sent To:** Requester

**Email Contains:**
- Acceptance confirmation
- Project lead's contact information (name, email, phone)
- Optional message from project lead
- Next steps
- Link to view project

**Example:**
```
Subject: ✅ Your collaboration request for "Smart Campus App" was accepted!
To: jane@jkuat.ac.ke

Dear Jane Smith,

Great News! Your collaboration request for "Smart Campus App" has been accepted!

You will be joining the project as a Frontend Developer.

Project Lead Contact:
- Name: John Doe
- Email: john@jkuat.ac.ke
- Phone: +254 712 345 678

Message from Project Lead:
"Excited to have you on board! Let's schedule a call this week to discuss the project roadmap."

Next Steps:
- The project lead will reach out to you soon
- Prepare questions about the project
- Be ready to contribute your skills!

[View Project Button]
```

### 3. When Project Lead Declines a Request

**Trigger:** `PUT /api/v1/projects/:projectId/collaborations/:collaborationId`
- With `status: 'declined'`

**Email Sent To:** Requester

**Email Contains:**
- Polite decline notification
- Optional message from project lead explaining why
- Encouragement to apply to other projects
- Link to browse other projects

**Example:**
```
Subject: Update on your collaboration request for "Smart Campus App"
To: jane@jkuat.ac.ke

Dear Jane Smith,

Thank you for your interest in collaborating on "Smart Campus App".

After careful consideration, the project lead has decided not to move forward with your collaboration request at this time.

Message from Project Lead:
"We've already filled the frontend developer position, but we encourage you to check out our other projects!"

Don't be discouraged! There are many other exciting projects:
- Browse other available projects
- Submit your own project idea
- Attend club events to network
- Join our hackathons

[Browse Other Projects Button]
```

## Configuration

### Environment Variables Required

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM="JKUAT Innovation Club <noreply@jkuat.ac.ke>"

# Frontend URL (for email links)
FRONTEND_URL=https://yourdomain.com

# Environment
NODE_ENV=production
```

### Gmail Setup (Recommended for Production)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

3. **Update .env:**
```env
EMAIL_USER=your.club.email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM="JKUAT Innovation Club <your.club.email@gmail.com>"
```

### Development/Testing Setup

For development, the system uses Ethereal Email (fake SMTP service):
- Emails are not actually sent
- Preview URLs are logged to console
- No configuration needed

## Testing

### Test Email Sending

1. **Start the server:**
```bash
npm start
```

2. **Submit a collaboration request:**
```bash
curl -X POST http://localhost:3000/api/v1/projects/PROJECT_ID/collaborate \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Developer",
    "skills": "React, Node.js",
    "message": "I would love to contribute!",
    "timeCommitment": "part-time",
    "email": "test@example.com"
  }'
```

3. **Check console for email preview URL** (in development mode)

4. **Accept/Decline a request:**
```bash
curl -X PUT http://localhost:3000/api/v1/projects/PROJECT_ID/collaborations/COLLAB_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "responseMessage": "Welcome to the team!"
  }'
```

## Email Templates Customization

### Modify Templates

Edit `utils/email-templates.js` to customize:
- Email styling (colors, fonts, layout)
- Content and messaging
- Button text and links
- Footer information

### Add New Templates

```javascript
// In utils/email-templates.js
newTemplate: (data) => {
    return {
        subject: 'Your Subject',
        html: `
            <!DOCTYPE html>
            <html>
            <!-- Your HTML here -->
            </html>
        `
    };
}
```

## Monitoring

### Email Logs

All email sending is logged to console:
```
✅ Collaboration request notification sent to john@jkuat.ac.ke
   Project: Smart Campus App
   Requester: Jane Smith
   Preview URL: https://ethereal.email/message/xxx (dev only)
```

### Error Handling

- Email failures don't block the API request
- Errors are logged but request still succeeds
- Users see success message even if email fails

## Future Enhancements

### Planned Features

1. **Email Preferences**
   - Allow users to opt-out of certain notifications
   - Choose email frequency (immediate, daily digest)

2. **In-App Notifications**
   - Complement emails with in-app notifications
   - Real-time notifications using WebSockets

3. **Email Analytics**
   - Track email open rates
   - Monitor click-through rates
   - A/B test email templates

4. **Rich Notifications**
   - Include project images in emails
   - Add calendar invites for meetings
   - Attach project documents

5. **Batch Notifications**
   - Daily/weekly digest of collaboration requests
   - Summary emails for project leads

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
```bash
echo $EMAIL_USER
echo $EMAIL_PASS
```

2. **Verify Gmail app password:**
   - Must be 16 characters
   - No spaces
   - 2FA must be enabled

3. **Check console logs:**
   - Look for error messages
   - Verify email service is initialized

4. **Test SMTP connection:**
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('SMTP Error:', error);
    } else {
        console.log('SMTP Ready:', success);
    }
});
```

### Emails Going to Spam

1. **Set up SPF record** for your domain
2. **Configure DKIM** signing
3. **Use a professional email service** (SendGrid, Mailgun, AWS SES)
4. **Avoid spam trigger words** in subject lines
5. **Include unsubscribe link**

### Gmail Daily Limit

Gmail has a sending limit:
- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2000 emails/day

For higher volume, consider:
- **SendGrid** (100 emails/day free, then paid)
- **Mailgun** (5000 emails/month free)
- **AWS SES** (62,000 emails/month free)

## Support

For issues or questions:
- Check server logs: `npm start`
- Review email service code: `utils/collaboration-email-service.js`
- Test with Ethereal: Set `NODE_ENV=development`
- Contact: innovation@jkuat.ac.ke

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ Fully Implemented
