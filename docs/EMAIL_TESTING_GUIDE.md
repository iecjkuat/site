# Email Notification System - Testing Guide

## Overview
The collaboration email system is now fully implemented and ready for testing. Since the club doesn't have an email account yet, we're using Ethereal Email (a fake SMTP service) for testing.

## Current Configuration

### Environment Setup
- `NODE_ENV=development` in `.env` file
- Using Ethereal Email with dummy credentials
- Emails won't actually be sent, but preview URLs will be generated

## Testing Steps

### Step 1: Restart the Server
```bash
npm start
```
The server should start on port 3000.

### Step 2: Test Collaboration Request Submission

1. Open the projects page: `http://localhost:3000/pages/projects/projects.html`
2. Click on any project card to view details
3. Click "Request Collaboration" button
4. Fill out the collaboration form:
   - Role: e.g., "Frontend Developer"
   - Skills: e.g., "React, JavaScript, CSS"
   - Time Commitment: e.g., "10 hours/week"
   - Email: Your test email
   - Message: Brief introduction
5. Click "Submit Request"

### Step 3: Check Terminal Output

After submitting, check your terminal where the server is running. You should see:

```
Email sent successfully!
Preview URL: https://ethereal.email/message/[message-id]
```

### Step 4: View Email Preview

1. Copy the preview URL from the terminal
2. Paste it into your browser
3. You'll see the HTML email that would have been sent to the project lead

### Step 5: Test Accept/Decline (CMS)

Currently, accepting/declining requests needs to be done via API or CMS. The CMS UI for managing collaboration requests will be implemented next.

For now, you can test via API:

```bash
# Get collaboration requests for a project
curl http://localhost:3000/api/v1/projects/[project-id]/collaborations

# Accept a request
curl -X PUT http://localhost:3000/api/v1/projects/[project-id]/collaborations/[collaboration-id] \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted", "responseMessage": "Welcome to the team!"}'

# Decline a request
curl -X PUT http://localhost:3000/api/v1/projects/[project-id]/collaborations/[collaboration-id] \
  -H "Content-Type: application/json" \
  -d '{"status": "declined", "responseMessage": "Thank you for your interest."}'
```

## What to Look For

### Success Indicators
- ✅ No 404 errors when submitting collaboration request
- ✅ Success message appears in the UI
- ✅ Terminal shows "Email sent successfully!" with preview URL
- ✅ Preview URL opens and shows formatted HTML email
- ✅ Email contains all the correct information (project title, role, skills, message)

### Email Content Verification

**Request Received Email (to Project Lead):**
- Subject: "New Collaboration Request for [Project Title]"
- Contains requester's name and email
- Shows role, skills, time commitment
- Includes the requester's message

**Request Accepted Email (to Requester):**
- Subject: "Your Collaboration Request Has Been Accepted!"
- Contains project title
- Shows project lead's contact info (name, email, phone)
- Includes response message from project lead

**Request Declined Email (to Requester):**
- Subject: "Update on Your Collaboration Request"
- Contains project title
- Includes response message from project lead
- Encourages exploring other opportunities

## Troubleshooting

### Issue: 404 Error on Submit
**Solution:** Routes have been reordered. Restart the server.

### Issue: No Preview URL in Terminal
**Possible causes:**
1. Email service error - check terminal for error messages
2. Ethereal credentials issue - the service generates test accounts automatically

### Issue: Email Preview Shows Broken Layout
**Solution:** The HTML templates use inline CSS and should work. Check browser console for errors.

## Next Steps

### For Production (When Club Gets Email)
1. Get Gmail account for the club
2. Enable 2FA on Gmail account
3. Generate App Password in Gmail settings
4. Update `.env` file:
   ```
   NODE_ENV=production
   EMAIL_USER=club@example.com
   EMAIL_PASS=your-app-password
   ```
5. Restart server
6. Emails will now be sent for real!

### CMS Integration (Next Task)
- Add "Collaboration Requests" tab in CMS Projects section
- Show pending/accepted/declined requests
- Add accept/decline buttons with response message input
- Real-time updates when new requests come in

## API Endpoints Reference

```
POST   /api/v1/projects/:id/collaborate
       - Submit collaboration request
       - Sends email to project lead

GET    /api/v1/projects/:id/collaborations
       - Get all requests for a project
       - Query param: ?status=pending|accepted|declined

PUT    /api/v1/projects/:projectId/collaborations/:collaborationId
       - Accept or decline request
       - Sends email to requester
```

## Database Tables

- `project_collaborations` - Stores all collaboration requests
- Fields: project_id, user_id, role, message, skills_offered, time_commitment, contact_email, status, response_message, responded_by, responded_at

## Files Modified

- `routes/projects.js` - Route ordering fixed, email integration added
- `utils/collaboration-email-service.js` - Email sending service
- `utils/email-templates.js` - HTML email templates
- `pages/projects/projects.js` - Collaboration form UI
