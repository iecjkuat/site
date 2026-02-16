# Project Collaboration System

## Overview
The project collaboration system allows members to request to join projects as collaborators. This document explains the complete workflow.

## How It Works

### 1. User Submits Collaboration Request

When a user clicks "Join Project" on a project card:

1. **Modal Opens**: A collaboration form modal appears with fields:
   - Role (e.g., Developer, Designer, Marketing)
   - Message (Why they want to collaborate)
   - Skills (Comma-separated list of skills they can contribute)
   - Time Commitment (e.g., "5 hours/week")
   - Email (Contact email)

2. **Form Submission**: When user clicks "Submit Collaboration Request":
   - Frontend sends POST request to `/api/v1/projects/:projectId/collaborate`
   - Request includes all form data as JSON

### 2. Backend Processing

The API endpoint (`routes/projects.js`) does the following:

1. **Validation**:
   - Checks if project exists
   - Validates required fields (role, message, email)
   - Checks if user already has a pending/accepted request for this project

2. **Data Storage**:
   - Creates record in `project_collaborations` table with:
     - `project_id`: The project they want to join
     - `user_id`: Currently uses anonymous user ID (will use authenticated user in production)
     - `role`: Their desired role
     - `message`: Their collaboration message
     - `skills_offered`: Array of skills
     - `time_commitment`: Time they can commit
     - `contact_email`: Their email
     - `status`: Set to 'pending'

3. **Response**:
   - Returns success message: "Collaboration request submitted successfully! The project lead will be notified."
   - Includes collaboration details (id, project title, role, status, created_at)

### 3. Frontend Feedback

After successful submission:
- Shows success message to user
- Closes the collaboration modal
- Closes the project details modal
- Resets the form

### 4. Project Lead Review (Future Feature)

Project leads can:
- View all collaboration requests for their projects via `/api/v1/projects/:id/collaborations`
- Accept or decline requests via `/api/v1/projects/:projectId/collaborations/:collaborationId`
- When accepting/declining, they can include a response message

## Database Schema

### project_collaborations Table

```sql
CREATE TABLE project_collaborations (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    skills_offered TEXT[],
    time_commitment VARCHAR(100),
    contact_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    response_message TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);
```

### Status Values
- `pending`: Request submitted, awaiting review
- `accepted`: Project lead accepted the request
- `declined`: Project lead declined the request
- `withdrawn`: User withdrew their request

## Security

### Row Level Security (RLS) Policies

1. **Anyone can create**: Any user can submit a collaboration request
2. **Users can view own**: Users can see their own requests
3. **Project leads can view**: Project leads see all requests for their projects
4. **Project leads can update**: Project leads can accept/decline requests
5. **Users can withdraw**: Users can withdraw their own pending requests
6. **Admins can manage all**: Admins have full access

## API Endpoints

### Submit Collaboration Request
```
POST /api/v1/projects/:projectId/collaborate

Body:
{
  "role": "Developer",
  "message": "I'd love to help with the frontend",
  "skills": "React, TypeScript, UI/UX",
  "timeCommitment": "10 hours/week",
  "email": "user@example.com"
}

Response:
{
  "message": "Collaboration request submitted successfully!",
  "collaboration": {
    "id": "uuid",
    "project_title": "Smart Campus Nav",
    "role": "Developer",
    "status": "pending",
    "created_at": "2026-02-17T..."
  }
}
```

### Get Collaboration Requests (Project Lead)
```
GET /api/v1/projects/:projectId/collaborations?status=pending

Response:
{
  "collaborations": [
    {
      "id": "uuid",
      "role": "Developer",
      "message": "...",
      "skills_offered": ["React", "TypeScript"],
      "time_commitment": "10 hours/week",
      "contact_email": "user@example.com",
      "status": "pending",
      "created_at": "...",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "count": 1
}
```

### Accept/Decline Request (Project Lead)
```
PUT /api/v1/projects/:projectId/collaborations/:collaborationId

Body:
{
  "status": "accepted",
  "responseMessage": "Welcome to the team!"
}

Response:
{
  "message": "Collaboration request accepted successfully",
  "collaboration": { ... }
}
```

## Future Enhancements

1. **Email Notifications**: Send email to project lead when new request arrives
2. **In-App Notifications**: Real-time notifications for project leads
3. **User Authentication**: Replace anonymous user ID with actual authenticated user
4. **Collaboration Dashboard**: Page for users to track their requests
5. **Project Lead Dashboard**: Page for project leads to manage requests
6. **Auto-Accept**: Option for projects to auto-accept collaborators
7. **Skill Matching**: Suggest projects based on user skills
8. **Team Chat**: Built-in chat for accepted collaborators

## Setup Instructions

1. **Run SQL Script**: Execute `supabase/11-project-collaborations.sql` in your Supabase SQL editor
2. **Verify Table**: Check that `project_collaborations` table exists
3. **Test Submission**: Try submitting a collaboration request from the projects page
4. **Check Database**: Verify the request was saved in the database

## Troubleshooting

### Request Fails with "Table doesn't exist"
- Run the SQL script: `supabase/11-project-collaborations.sql`

### Request Fails with "Already have pending request"
- User already submitted a request for this project
- They need to wait for project lead to respond or withdraw their request

### Request Succeeds but No Notification
- Email notifications are not yet implemented (TODO)
- Project leads need to manually check the collaborations endpoint

## Related Files

- Frontend: `pages/projects/projects.js` (handleCollaborationSubmission)
- Backend: `routes/projects.js` (POST /:id/collaborate)
- Database: `supabase/11-project-collaborations.sql`
- Documentation: `docs/PROJECT_COLLABORATION_SYSTEM.md` (this file)
