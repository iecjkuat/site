# Projects System - CMS & Public Page Integration

## Overview
The projects system now fully integrates the CMS with the public projects page, allowing admins to manage club projects while members can submit personal projects.

## Project Types

### Club Projects
- **Created by**: Admins/Executives via CMS
- **Badge**: Purple badge with building icon
- **Purpose**: Official club initiatives and collaborations
- **Examples**: Smart Campus Navigation, AgriTech IoT Platform

### Personal Projects
- **Created by**: Individual members via submission form
- **Badge**: Pink badge with user icon
- **Purpose**: Showcase individual member work and innovation
- **Examples**: EcoTrack, StudyBuddy, Recipe Engine

## Database Setup

### Run SQL Script
Execute in Supabase SQL Editor:
```bash
supabase/10-insert-projects-data.sql
```

This script:
1. Updates project_type constraint to include 'club' and 'personal'
2. Inserts 5 club projects
3. Inserts 5 personal projects
4. Adds realistic likes and views counts

## API Endpoints

### Public Endpoints
- `GET /api/projects` - Get all projects (both club and personal)
- `GET /api/projects/:id` - Get single project details
- `POST /api/projects/submit` - Submit personal project (members)

### Admin Endpoints (CMS)
- `GET /api/admin/projects` - Get all projects
- `POST /api/admin/projects` - Create club project
- `PUT /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project

## Features

### CMS Projects Tab
- View all projects (club and personal)
- Create new club projects
- Edit existing projects
- Delete projects
- Real-time sync with database
- No mock data - all from database

### Public Projects Page
- Display all projects with type badges
- Filter by category, status
- Differentiate club vs personal projects
- View project details
- Join/collaborate on projects

## Project Fields

### Required
- `title` - Project name
- `description` - Project description
- `project_type` - 'club' or 'personal'

### Optional
- `category` - innovation, research, startup, etc.
- `status` - planning, active, completed, on_hold, cancelled
- `github_url` - Repository link
- `demo_url` - Live demo link
- `tech_stack` / `technologies` - Array of technologies used
- `banner_image` - Project cover image
- `gallery` - Array of project images
- `tags` - Array of tags
- `progress_percentage` - 0-100
- `start_date` / `end_date` - Project timeline

## Visual Differentiation

### Club Projects
- **Badge Color**: Purple gradient
- **Icon**: Building (fa-building)
- **Text**: "CLUB PROJECT"
- **Indicates**: Official club initiative

### Personal Projects
- **Badge Color**: Pink gradient
- **Icon**: User (fa-user)
- **Text**: "PERSONAL PROJECT"
- **Indicates**: Individual member work

## Workflow

### Creating Club Project (Admin)
1. Go to CMS → Projects tab
2. Click "Create New Project"
3. Fill in project details
4. Set `project_type` to 'club'
5. Save → Appears on public projects page

### Submitting Personal Project (Member)
1. Go to Projects page
2. Click "Submit Project"
3. Fill in project details
4. Submit for review
5. After approval → Appears on projects page

## Mock Data Removal

Mock data has been removed from:
- `pages/cms/modules/cms-manager.js` - loadProjects()
- Projects now load exclusively from database
- Fallback shows empty state instead of mock data

## Next Steps

1. **Run the SQL script** to populate database
2. **Test CMS** - Create/edit/delete projects
3. **Verify public page** - Check projects display correctly
4. **Test badges** - Confirm club/personal differentiation
5. **Remove old mock files** if any remain

## Database Schema

```sql
projects (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(50),
  project_type VARCHAR(50), -- 'club' or 'personal'
  github_url TEXT,
  demo_url TEXT,
  tech_stack TEXT[],
  technologies TEXT[],
  banner_image TEXT,
  gallery JSONB,
  tags TEXT[],
  progress_percentage INTEGER,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
```

## Styling

Project type badges use:
- Gradient backgrounds
- Border with matching color
- Icon + text
- Uppercase text
- Small, compact design

CSS classes:
- `.project-type-badge` - Base styles
- `.club-project` - Purple styling
- `.personal-project` - Pink styling
