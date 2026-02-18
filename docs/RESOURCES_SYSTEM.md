# Resources & Documentation System

## Overview
The Resources system allows club administrators to upload, manage, and share documents with members through both the CMS and public Resources page.

## Features

### CMS Resources Management
- Upload documents (PDF, DOC, DOCX, TXT, ZIP)
- Edit resource metadata (title, description, category, access level)
- Delete resources
- View resource details
- Category filtering

### Public Resources Page
- Browse all accessible resources
- Filter by category
- Search resources
- Download documents
- Preview document information
- View download statistics

## Categories

1. **Constitution** - Official club constitution and governance documents
2. **Policies** - Club policies and procedures
3. **Minutes** - Meeting minutes and records
4. **Guides** - Handbooks, tutorials, and guides
5. **Reports** - Annual reports and summaries
6. **Other** - Miscellaneous documents

## Access Levels

- **Public** - Accessible to everyone
- **Members** - Accessible to club members only
- **Executive** - Accessible to executive committee only

## File Upload

### Supported Formats
- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Text files (`.txt`)
- ZIP archives (`.zip`)

### File Size Limit
- Maximum: 10MB per file

### Storage
- Files are stored in Supabase Storage bucket: `resources`
- Organized by category folders
- Unique filenames generated automatically

## API Endpoints

### Get All Resources
```
GET /api/v1/resources
Query Parameters:
  - category: Filter by category
  - accessLevel: Filter by access level
  - page: Page number (default: 1)
  - limit: Items per page (default: 20)
```

### Get Single Resource
```
GET /api/v1/resources/:id
```

### Upload Resource
```
POST /api/v1/resources/upload
Content-Type: multipart/form-data
Body:
  - file: File to upload
  - title: Resource title
  - description: Resource description
  - category: Resource category
  - access_level: Access level (public/members/executive)
```

### Update Resource
```
PUT /api/v1/resources/:id
Body:
  - title: Updated title
  - description: Updated description
  - category: Updated category
  - access_level: Updated access level
```

### Delete Resource
```
DELETE /api/v1/resources/:id
```

### Download Resource
```
POST /api/v1/resources/:id/download
```

## Database Schema

### resources Table
```sql
- id: UUID (Primary Key)
- club_id: UUID (Foreign Key → clubs)
- uploaded_by: UUID (Foreign Key → users)
- title: VARCHAR(255)
- description: TEXT
- category: VARCHAR(100)
- tags: TEXT[]
- file_url: VARCHAR(1000)
- file_name: VARCHAR(255)
- file_size: INTEGER
- file_type: VARCHAR(150)
- access_level: VARCHAR(20)
- download_count: INTEGER
- view_count: INTEGER
- storage_path: VARCHAR(1000)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Setup Instructions

### 1. Run SQL Scripts
```sql
-- Setup storage bucket and policies
supabase/17-setup-storage.sql

-- Add storage_path column
supabase/18-add-storage-path-column.sql

-- Fix file_url length
supabase/19-fix-file-url-length.sql

-- Fix file_type length
supabase/22-fix-file-type-length.sql

-- Insert sample data
supabase/24-insert-resources-data.sql
```

### 2. Verify Storage Setup
Run the test script:
```bash
node test-storage-upload.js
```

### 3. Check Database
```sql
-- Verify resources exist
SELECT * FROM resources ORDER BY created_at DESC LIMIT 10;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'resources';
```

## Usage

### CMS - Upload Document
1. Navigate to CMS → Resources tab
2. Click "Upload Document" button
3. Fill in the form:
   - Select file (max 10MB)
   - Enter title
   - Enter description
   - Select category
   - Choose access level
4. Click "Upload Document"

### CMS - Edit Resource
1. Find the resource card
2. Click "Edit" button
3. Update fields as needed
4. Click "Save Changes"

### CMS - Delete Resource
1. Find the resource card
2. Click "Delete" button
3. Confirm deletion

### Resources Page - Download
1. Browse or search for resources
2. Click on a resource card
3. Click "Download" button
4. File will be downloaded to your device

## Integration

### CMS Integration
- Located in: `pages/cms/modules/cms-manager.js`
- Methods:
  - `loadResources()` - Fetch resources from API
  - `renderResources()` - Display resources in grid
  - `showUploadResourceModal()` - Show upload form
  - `showEditResourceModal()` - Show edit form
  - `deleteResource()` - Delete resource

### Resources Page Integration
- Located in: `pages/resources/resources.js`
- Uses real API data only (no mock data)
- Features:
  - Category filtering
  - Search functionality
  - Download tracking
  - Preview modals

## Troubleshooting

### Upload Fails
1. Check file size (must be ≤ 10MB)
2. Verify file type is supported
3. Check storage bucket exists
4. Verify user is authenticated
5. Check server logs for errors

### Resources Not Showing
1. Verify resources exist in database
2. Check `club_id` is set correctly
3. Verify API endpoint is correct (`/api/v1/resources`)
4. Check authentication token
5. Check browser console for errors

### Download Not Working
1. Verify `file_url` is valid
2. Check storage bucket permissions
3. Verify resource exists
4. Check network tab for errors

## Security

### Storage Policies
- Authenticated users can upload
- Authenticated users can read
- Resource owners and admins can delete
- Public can read public resources

### Access Control
- Resources filtered by access level
- Club membership verified
- Executive-only resources restricted
- Row Level Security enabled

## Future Enhancements

- [ ] File versioning
- [ ] Resource ratings and reviews
- [ ] Advanced search with filters
- [ ] Resource collections/folders
- [ ] Bulk upload
- [ ] File preview in browser
- [ ] Download analytics
- [ ] Resource expiration dates
- [ ] Collaborative editing
- [ ] Resource sharing via links

## Related Documentation

- [CMS News Integration](./CMS_NEWS_INTEGRATION.md)
- [Resources Upload Setup](./RESOURCES_UPLOAD_SETUP.md)
- [Email Testing Guide](./EMAIL_TESTING_GUIDE.md)
