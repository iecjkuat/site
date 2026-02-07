# CMS Fix Plan - Executive Content Management System

## Overview
The CMS is the central hub where the executive team manages ALL club content:
- 📰 Articles & News
- 📅 Events
- 💼 Projects
- 📚 Resources
- 🎯 Opportunities
- 💡 Innovation Hub (Ideas)
- 💬 Communications
- 👥 Members
- 🖼️ Media Library

## Current Status

### ✅ What's Working
1. Authentication & Role-based access (admin/executive)
2. Tab navigation structure
3. Dashboard with stats
4. Basic UI components
5. API endpoints exist for all content types

### ❌ What Needs Fixing

#### 1. **Articles/News Management** (Priority: HIGH)
**Current Issue:** Tab exists but not fully functional
**API Endpoint:** `/api/v1/content`
**Needs:**
- List all articles with filters (published, draft, scheduled)
- Create new article with rich text editor
- Edit existing articles
- Delete articles
- Publish/unpublish toggle
- Featured article toggle
- Image upload for article cover

#### 2. **Events Management** (Priority: HIGH)
**Current Issue:** Tab exists but not fully functional
**API Endpoint:** `/api/v1/events`
**Needs:**
- List all events (upcoming, past, draft)
- Create new event with details (date, time, location, capacity)
- Edit existing events
- Delete events
- Manage event registrations
- Event status (published, draft, cancelled)
- Event image upload

#### 3. **Projects Management** (Priority: HIGH)
**Current Issue:** Tab doesn't exist yet
**API Endpoint:** `/api/v1/projects`
**Needs:**
- Add "Projects" tab to CMS
- List all projects (active, completed, archived)
- Create new project
- Edit project details
- Manage project members
- Project status updates
- Project images/gallery

#### 4. **Resources Management** (Priority: MEDIUM)
**Current Issue:** Tab doesn't exist yet
**API Endpoint:** `/api/v1/resources`
**Needs:**
- Add "Resources" tab to CMS
- List all resources (documents, links, tutorials)
- Upload new resources
- Edit resource details
- Delete resources
- Resource categories
- Download tracking

#### 5. **Opportunities Management** (Priority: MEDIUM)
**Current Issue:** Tab exists but not fully functional
**API Endpoint:** `/api/v1/opportunities`
**Needs:**
- List all opportunities (internships, jobs, scholarships)
- Create new opportunity
- Edit opportunities
- Delete opportunities
- Opportunity status (active, expired, filled)
- Application tracking

#### 6. **Innovation Hub** (Priority: MEDIUM)
**Current Issue:** Tab exists but needs enhancement
**API Endpoint:** `/api/v1/ideas`
**Needs:**
- Review submitted ideas
- Approve/reject ideas
- Create challenges
- Manage voting
- Idea status tracking

#### 7. **Communications** (Priority: LOW)
**Current Issue:** Tab exists but needs implementation
**API Endpoint:** `/api/v1/communication`
**Needs:**
- Send announcements to members
- Email templates
- Message history
- Recipient targeting (all, specific roles, specific colleges)

#### 8. **Members Management** (Priority: LOW)
**Current Issue:** Tab exists but needs enhancement
**API Endpoint:** `/api/v1/admin/users` or direct Supabase query
**Needs:**
- View all members
- Search/filter members
- Update member roles
- View member activity
- Export member list

#### 9. **Media Library** (Priority: MEDIUM)
**Current Issue:** Tab exists but needs implementation
**API Endpoint:** Supabase Storage
**Needs:**
- Upload images/documents
- Organize in folders
- Delete media
- Copy media URLs
- Image optimization

## Implementation Priority

### Phase 1: Core Content Management (Week 1)
1. ✅ Fix Articles/News management
2. ✅ Fix Events management
3. ✅ Add Projects tab and management
4. ✅ Fix API routing issues

### Phase 2: Extended Features (Week 2)
5. ✅ Add Resources tab and management
6. ✅ Complete Opportunities management
7. ✅ Enhance Innovation Hub
8. ✅ Implement Media Library

### Phase 3: Communication & Admin (Week 3)
9. ✅ Implement Communications system
10. ✅ Enhance Members management
11. ✅ Add bulk operations
12. ✅ Add export features

## Technical Requirements

### Frontend (CMS Pages)
- `pages/cms/cms.html` - Main CMS page
- `pages/cms/cms.js` - Entry point
- `pages/cms/modules/cms-manager.js` - Main controller
- `pages/cms/modules/cms-data.js` - Data fetching
- `pages/cms/modules/cms-ui.js` - UI components
- `pages/cms/modules/cms-editors.js` - Rich text editors
- `pages/cms/modules/cms-security.js` - Security utilities

### Backend (API Routes)
- `routes/content.js` - Articles/News
- `routes/events.js` - Events
- `routes/projects.js` - Projects
- `routes/resources.js` - Resources
- `routes/opportunities.js` - Opportunities
- `routes/ideas.js` - Innovation Hub
- `routes/communication.js` - Communications
- `routes/admin.js` - Members management

### Database Tables
- `articles` - News articles
- `events` - Club events
- `projects` - Club projects
- `resources` - Learning resources
- `opportunities` - Job/internship opportunities
- `ideas` - Innovation submissions
- `users` - Members
- `media_files` - Uploaded media

## Key Features to Implement

### 1. Rich Text Editor (Quill.js)
- Already loaded in CMS
- Use for articles, events, projects descriptions
- Support images, links, formatting

### 2. Image Upload
- Use Supabase Storage
- Resize/optimize images
- Generate thumbnails
- Copy URL to clipboard

### 3. Status Management
- Draft - Not visible to public
- Published - Live on website
- Scheduled - Publish at specific time
- Archived - Hidden but not deleted

### 4. Bulk Operations
- Select multiple items
- Bulk delete
- Bulk publish/unpublish
- Bulk status change

### 5. Search & Filters
- Search by title/content
- Filter by status
- Filter by date range
- Filter by author

### 6. Real-time Updates
- WebSocket for live updates
- Show when other executives are editing
- Auto-refresh on changes

## User Flow Examples

### Creating an Article
1. Executive clicks "Articles" tab
2. Clicks "New Article" button
3. Modal opens with form:
   - Title (required)
   - Content (rich text editor)
   - Cover image (upload)
   - Category (dropdown)
   - Tags (multi-select)
   - Status (draft/published)
   - Featured (checkbox)
4. Clicks "Save"
5. Article appears in list
6. If published, appears on News page

### Managing Events
1. Executive clicks "Events" tab
2. Sees list of all events (upcoming, past)
3. Clicks "New Event" button
4. Fills form:
   - Title, description, date, time
   - Location, capacity
   - Registration fee
   - Event image
5. Saves event
6. Event appears on Events page
7. Can view registrations
8. Can send reminders to attendees

### Managing Projects
1. Executive clicks "Projects" tab
2. Sees all projects (active, completed)
3. Clicks "New Project" button
4. Fills form:
   - Title, description
   - Team members
   - Status, progress
   - Technologies used
   - Project images
5. Saves project
6. Project appears on Projects page

## Next Steps

1. **Immediate:** Fix Articles and Events tabs to be fully functional
2. **Short-term:** Add Projects and Resources tabs
3. **Medium-term:** Complete all remaining features
4. **Long-term:** Add analytics, scheduling, and advanced features

## Success Criteria

✅ Executive can create, edit, delete articles
✅ Executive can manage events and registrations
✅ Executive can manage projects
✅ Executive can upload and manage resources
✅ Executive can post opportunities
✅ Executive can review and approve ideas
✅ Executive can send communications to members
✅ Executive can view and manage members
✅ Executive can upload and organize media
✅ All changes reflect immediately on public pages
✅ System is intuitive and easy to use
✅ No technical knowledge required

## Timeline

- **Week 1:** Core content management (Articles, Events, Projects)
- **Week 2:** Extended features (Resources, Opportunities, Media)
- **Week 3:** Communications and admin features
- **Week 4:** Testing, refinement, and training

Let's start with Phase 1! 🚀
