# Resources Download Fix

## Problem
Resources on the Resources page were not downloadable because:
1. Sample data had placeholder URLs (`https://example.com/...`) instead of real file URLs
2. Backend wasn't generating proper Supabase Storage URLs from `storage_path`
3. Frontend didn't handle Supabase Storage URLs properly for downloads

## Solution

### 1. Backend Fix (`routes/resources.js`)

Updated the download endpoint to:
- Generate signed URLs from Supabase Storage using `storage_path`
- Fallback to public URLs if signed URL generation fails
- Properly handle CORS and authentication

```javascript
// Generate download URL from storage_path
if (resource.storage_path) {
  const { data: signedUrlData } = await supabase
    .storage
    .from('resources')
    .createSignedUrl(resource.storage_path, 3600); // 1 hour expiry
  
  if (signedUrlData?.signedUrl) {
    downloadUrl = signedUrlData.signedUrl;
  }
}
```

### 2. Frontend Fix (`pages/resources/resources.js`)

Updated the download method to:
- Fetch files from Supabase Storage URLs
- Convert to blob for proper download behavior
- Handle CORS issues
- Fallback to opening in new tab if fetch fails

```javascript
async fetchAndDownload(url, filename) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  // Trigger download...
}
```

### 3. Sample Files Script (`scripts/create-sample-resource-files.js`)

Created a script to upload sample downloadable files to Supabase Storage:
- Creates text-based sample files
- Uploads to the `resources` bucket
- Organizes by category (constitution, guides, other)

## How to Use

### Option 1: Upload Sample Files (For Testing)

Run the sample file upload script:

```bash
node scripts/create-sample-resource-files.js
```

This will:
- Create sample text files
- Upload them to Supabase Storage
- Make them downloadable on the Resources page

### Option 2: Upload Real Files (For Production)

Use the CMS to upload real files:
1. Go to CMS > Resources
2. Click "Upload Resource"
3. Fill in details and select file
4. File will be uploaded to Supabase Storage
5. Download will work automatically

## Technical Details

### Download Flow

1. User clicks "Download" button
2. Frontend calls `POST /api/v1/resources/:id/download`
3. Backend:
   - Fetches resource from database
   - Generates signed URL from `storage_path`
   - Increments download count
   - Returns download URL
4. Frontend:
   - Fetches file from URL
   - Converts to blob
   - Triggers browser download

### Storage Structure

```
resources/
├── constitution/
│   └── constitution-2024.pdf
├── guides/
│   ├── member-handbook-2024.pdf
│   └── innovation-toolkit.pdf
└── other/
    └── project-proposal-template.docx
```

### Security

- Signed URLs expire after 1 hour
- Access level (public/members) is enforced by storage policies
- Authentication required for member-only resources

## Files Modified

1. `routes/resources.js` - Updated download endpoint
2. `pages/resources/resources.js` - Updated download methods
3. `scripts/create-sample-resource-files.js` - New script for sample files
4. `supabase/30-create-downloadable-sample-resources.sql` - Updated sample data

## Testing

1. Start the server: `npm start`
2. Go to Resources page
3. Click "Download" on any resource
4. File should download successfully
5. Check download count increments

## Notes

- Sample files are text-based for demo purposes
- For production, upload real PDF/DOCX files via CMS
- Signed URLs are valid for 1 hour
- Download count is tracked in the database
