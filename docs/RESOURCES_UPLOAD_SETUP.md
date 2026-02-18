# Resources Upload Setup Guide

## Overview
The Resources & Documentation system uses Supabase Storage to store uploaded files securely.

## Setup Steps

### 1. Create Storage Bucket in Supabase

Run this SQL in your Supabase SQL Editor:

```sql
-- File: supabase/17-setup-storage.sql
```

This creates:
- A `resources` storage bucket
- Storage policies for authenticated users
- File size limit of 10MB
- Allowed file types: PDF, DOC, DOCX, TXT, ZIP

### 2. Add Storage Path Column

Run this SQL to add the storage_path column:

```sql
-- File: supabase/18-add-storage-path-column.sql
```

### 3. Verify Setup

Check that the bucket was created:
1. Go to Supabase Dashboard
2. Navigate to Storage
3. You should see a "resources" bucket

## File Upload Flow

1. **User uploads file** via CMS
2. **File is validated** (type, size)
3. **File is uploaded** to Supabase Storage bucket
4. **Database record created** with file metadata
5. **Public URL generated** for file access

## File Organization

Files are organized by category in the storage bucket:
```
resources/
├── constitution/
│   └── 1234567890-abc123.pdf
├── policies/
│   └── 1234567891-def456.pdf
├── minutes/
│   └── 1234567892-ghi789.pdf
├── guides/
│   └── 1234567893-jkl012.pdf
├── reports/
│   └── 1234567894-mno345.pdf
└── other/
    └── 1234567895-pqr678.pdf
```

## Access Levels

- **Public**: Anyone can download
- **Members**: Only logged-in members can download
- **Executive**: Only executive/admin users can download

## File Types Supported

- PDF (`.pdf`)
- Word Documents (`.doc`, `.docx`)
- Text Files (`.txt`)
- ZIP Archives (`.zip`)

## File Size Limit

- Maximum: 10MB per file

## API Endpoints

### Upload Resource
```
POST /api/v1/resources/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- title: String (required)
- description: String (optional)
- category: String (required) - constitution|policies|minutes|guides|reports|other
- access_level: String (required) - public|members|executive
```

### Get Resources
```
GET /api/v1/resources
Query Parameters:
- category: Filter by category
- page: Page number
- limit: Items per page
```

### Update Resource
```
PUT /api/v1/resources/:id
Body:
- title: String
- description: String
- category: String
- access_level: String
```

### Delete Resource
```
DELETE /api/v1/resources/:id
```

## Troubleshooting

### Upload Fails
1. Check that storage bucket exists
2. Verify storage policies are set
3. Check file size (max 10MB)
4. Verify file type is allowed
5. Check authentication token is valid

### Files Not Accessible
1. Verify storage policies allow read access
2. Check access_level matches user permissions
3. Verify public URL is correct

### Database Errors
1. Check storage_path column exists
2. Verify foreign key constraints
3. Check user has upload permissions

## Security Notes

- Files are stored in Supabase Storage (secure)
- Access controlled by storage policies
- File names are randomized to prevent conflicts
- Original filenames are preserved in database
- Authentication required for upload
- Access level enforced on download
