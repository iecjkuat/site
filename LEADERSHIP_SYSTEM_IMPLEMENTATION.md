# Leadership System Implementation Guide

## Overview
Complete leadership management system with database tables, storage buckets, API routes, and CMS integration.

## Files Created

### 1. Database Setup
- ✅ `supabase/33-create-leadership-tables.sql` - Tables and storage bucket
- ✅ `supabase/34-insert-leadership-data.sql` - Sample data
- ✅ `routes/leadership-new.js` - Complete API routes

### 2. Database Tables

#### executive_committee
- id (UUID, primary key)
- club_id (UUID, foreign key)
- user_id (UUID, foreign key, optional)
- name, position, email, phone
- bio, course, year_of_study
- profile_image_url, storage_path
- office_hours, term_start_date, term_end_date
- is_active, display_order
- social_links (JSONB)
- created_at, updated_at

#### club_patrons
- id (UUID, primary key)
- club_id (UUID, foreign key)
- name, title, department
- email, phone, office_location
- bio, specialization (array)
- profile_image_url, storage_path
- is_active, display_order
- social_links (JSONB)
- created_at, updated_at

### 3. Storage Bucket

**Bucket Name**: `leadership`
- Public: Yes
- Size Limit: 5MB
- Allowed Types: JPEG, JPG, PNG, WEBP
- Structure:
  - `executive/` - Executive member photos
  - `patrons/` - Patron photos

### 4. API Endpoints

#### Executive Committee
- `GET /api/v1/leadership/executive` - Get all executives
- `POST /api/v1/leadership/executive` - Create executive (with image upload)
- `PUT /api/v1/leadership/executive/:id` - Update executive
- `DELETE /api/v1/leadership/executive/:id` - Delete executive

#### Club Patrons
- `GET /api/v1/leadership/patrons` - Get all patrons
- `POST /api/v1/leadership/patrons` - Create patron (with image upload)
- `PUT /api/v1/leadership/patrons/:id` - Update patron
- `DELETE /api/v1/leadership/patrons/:id` - Delete patron

#### Stats
- `GET /api/v1/leadership/stats` - Get leadership statistics

## Setup Steps

### Step 1: Run Database Scripts
```bash
# In Supabase SQL Editor, run in order:
1. supabase/33-create-leadership-tables.sql
2. supabase/34-insert-leadership-data.sql
```

### Step 2: Update Server Routes
In `server.js`, add:
```javascript
const leadershipRoutes = require('./routes/leadership-new');
app.use(`${apiVersion}/leadership`, leadershipRoutes);
```

### Step 3: Update Leadership Page
Remove mock data and fetch from API:
```javascript
// In pages/leadership/leadership.js
async loadLeadership() {
    const [execRes, patronRes, statsRes] = await Promise.all([
        fetch('/api/v1/leadership/executive'),
        fetch('/api/v1/leadership/patrons'),
        fetch('/api/v1/leadership/stats')
    ]);
    
    const executives = await execRes.json();
    const patrons = await patronRes.json();
    const stats = await statsRes.json();
    
    this.renderExecutives(executives.executives);
    this.renderPatrons(patrons.patrons);
    this.updateStats(stats);
}
```

### Step 4: Add CMS Leadership Tab
Create new tab in CMS for managing leadership:
- Add/Edit/Delete executives
- Add/Edit/Delete patrons
- Upload profile images
- Manage display order
- Set active/inactive status

## Sample Data Included

### Executive Committee (6 members)
1. John Kamau - Chairperson
2. Mary Wanjiku - Vice Chairperson
3. David Omondi - Secretary
4. Grace Akinyi - Treasurer
5. Peter Mwangi - Communications Director
6. Sarah Njeri - Projects Coordinator

### Club Patrons (3 members)
1. Dr. James Kariuki - Senior Lecturer (Computer Science)
2. Prof. Elizabeth Wambui - Professor (Business Administration)
3. Dr. Michael Otieno - Senior Lecturer (Electrical Engineering)

## Features

### Executive Management
- Profile images with upload
- Position-based ordering
- Office hours tracking
- Term dates (start/end)
- Social media links
- Course and year of study
- Bio and contact info

### Patron Management
- Profile images with upload
- Title and department
- Office location
- Specialization areas (array)
- Social media links
- Bio and contact info

### Image Upload
- Automatic resize/optimization
- Secure storage in Supabase
- Public URLs for display
- Automatic cleanup on delete

### Display Features
- Active/inactive status
- Custom display order
- Responsive grid layout
- Profile modals
- Social media integration

## Next Steps

1. ✅ Run database scripts
2. ✅ Update server.js with new routes
3. ⏳ Update leadership page to fetch from API
4. ⏳ Create CMS leadership management tab
5. ⏳ Test image uploads
6. ⏳ Test CRUD operations

## CMS Integration (To Be Implemented)

The CMS will have a "Leadership" tab with:

### Executive Committee Section
- List all executives with cards
- Add new executive button
- Edit/Delete actions
- Image upload
- Form fields:
  - Name, Position, Email, Phone
  - Bio, Course, Year of Study
  - Office Hours
  - Term Start/End Dates
  - Social Links (LinkedIn, Twitter, GitHub)
  - Display Order
  - Active Status

### Club Patrons Section
- List all patrons with cards
- Add new patron button
- Edit/Delete actions
- Image upload
- Form fields:
  - Name, Title, Department
  - Email, Phone, Office Location
  - Bio
  - Specialization (multi-select)
  - Social Links
  - Display Order
  - Active Status

### Features
- Drag-and-drop reordering
- Bulk actions (activate/deactivate)
- Search and filter
- Image preview before upload
- Validation and error handling
- Success/error notifications

## Testing Checklist

- [ ] Database tables created
- [ ] Storage bucket created
- [ ] Sample data inserted
- [ ] API endpoints working
- [ ] Image upload working
- [ ] Leadership page displays data
- [ ] CMS tab created
- [ ] CRUD operations work
- [ ] Image deletion works
- [ ] Display order works
- [ ] Active/inactive toggle works

## Security Notes

- Image uploads limited to 5MB
- Only authenticated users can create/update/delete
- Admin role required for modifications
- Storage bucket has proper policies
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

## Performance Considerations

- Images optimized on upload
- Lazy loading for profile images
- Caching of leadership data
- Indexed database queries
- Efficient storage structure

## Maintenance

### Adding New Executive
1. Go to CMS > Leadership > Executive Committee
2. Click "Add Executive"
3. Fill form and upload image
4. Save

### Updating Display Order
1. Drag and drop cards in CMS
2. Order saved automatically
3. Reflects immediately on public page

### Deactivating Member
1. Edit member in CMS
2. Toggle "Active" status
3. Member hidden from public page but retained in database

## Troubleshooting

### Images Not Uploading
- Check storage bucket exists
- Verify bucket is public
- Check file size < 5MB
- Verify file type is image

### Data Not Displaying
- Check API endpoints are registered
- Verify database tables exist
- Check sample data was inserted
- Verify frontend is fetching from correct endpoint

### Permission Errors
- Check storage policies
- Verify user authentication
- Check admin role assignment
