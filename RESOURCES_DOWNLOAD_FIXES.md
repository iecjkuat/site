# Resources Download Fixes

## Issues Fixed

### 1. Download Button Opening New Tab
**Problem**: When clicking download, a new tab was opening instead of downloading the file.

**Root Cause**: The `fetchAndDownload` method had a fallback that used `window.open(url, '_blank')` when fetch failed due to CORS issues.

**Solution**: 
- Replaced `window.open()` with `downloadViaIframe()` method
- Uses hidden iframe to trigger download without opening new tab
- Better handles CORS issues with Supabase Storage

### 2. CMS-Uploaded Resources Not Downloadable
**Problem**: Resources uploaded via CMS couldn't be downloaded.

**Root Causes**:
1. Resource ID type mismatch (UUID vs integer)
2. Missing `storagePath` mapping in formatResource
3. Strict comparison (`===`) failing for mixed types

**Solutions**:
- Updated `validateResourceId()` to handle both UUID and integer IDs
- Changed comparison from `===` to `==` for loose type matching
- Added `storagePath` mapping in `formatResource()` helper
- Removed `parseInt()` calls that were breaking UUID IDs
- Added comprehensive logging for debugging

## Changes Made

### Frontend (`pages/resources/resources.js`)

#### 1. Updated `validateResourceId()` Method
```javascript
validateResourceId(id) {
    if (!id) {
        throw new Error('Resource ID is required');
    }
    
    // Handle both UUID and integer IDs
    if (typeof id === 'string' && id.includes('-')) {
        return id; // UUID format
    }
    
    const num = parseInt(id);
    if (isNaN(num) || num <= 0) {
        return id; // Return as string (might be UUID)
    }
    
    return num;
}
```

#### 2. Updated Event Handler
```javascript
// Don't parse ID, let validateResourceId handle it
case 'download':
    if (resourceId) {
        this.downloadResource(resourceId); // Was: parseInt(resourceId)
    }
    break;
```

#### 3. Updated `downloadResource()` Method
- Changed `===` to `==` for ID comparison
- Added comprehensive logging
- Better error messages
- Removed fallback to simulated download on API errors

#### 4. Replaced `fetchAndDownload()` Method
- Removed `window.open()` fallback
- Added `downloadViaIframe()` as alternative
- Better CORS handling
- Proper error logging

#### 5. New `downloadViaIframe()` Method
```javascript
downloadViaIframe(url, filename) {
    // Create hidden iframe to trigger download
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    // Remove iframe after download starts
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 5000);
}
```

### Backend (`routes/resources.js`)

#### Updated `formatResource()` Helper
```javascript
const formatResource = (res) => ({
  ...res,
  uploadedBy: res.uploaded_by,
  clubId: res.club_id,
  fileUrl: res.file_url,
  fileName: res.file_name,
  fileSize: res.file_size,
  fileType: res.file_type,
  accessLevel: res.access_level,
  downloadCount: res.download_count,
  storagePath: res.storage_path, // ← ADDED THIS
  createdAt: res.created_at,
  uploader: Array.isArray(res.uploader) ? res.uploader[0] : res.uploader,
  club: Array.isArray(res.club) ? res.club[0] : res.club
});
```

## How It Works Now

### Download Flow

1. **User clicks Download button**
2. **Frontend validates ID** (handles both UUID and integer)
3. **Finds resource** using loose comparison (`==`)
4. **Calls API** `POST /api/v1/resources/:id/download`
5. **Backend**:
   - Fetches resource from database
   - Generates signed URL from `storage_path`
   - Returns download URL
6. **Frontend**:
   - Receives download URL
   - Attempts fetch with CORS
   - If CORS fails, uses hidden iframe
   - File downloads without opening new tab

### ID Type Handling

The system now handles both:
- **Integer IDs**: `123`, `456` (legacy/sample data)
- **UUID IDs**: `550e8400-e29b-41d4-a716-446655440000` (real uploads)

### CORS Handling

1. **First attempt**: Fetch with CORS mode
2. **If CORS fails**: Use hidden iframe method
3. **Never opens new tab**: Downloads directly or via iframe

## Testing

### Test Sample Files
```bash
# Sample files already uploaded
node scripts/create-sample-resource-files.js
```

### Test CMS Upload
1. Go to CMS > Resources
2. Click "Upload Document"
3. Upload a PDF/DOCX file
4. Go to Resources page
5. Click "Download" on uploaded file
6. File should download without opening new tab

### Check Console Logs
The download process now logs:
- Resource ID and title
- File URL and storage path
- API call and response
- Download method used
- Any errors encountered

## Files Modified

1. ✅ `pages/resources/resources.js`
   - `validateResourceId()` - Handle UUID/integer
   - Event handler - Remove parseInt
   - `downloadResource()` - Better logging, loose comparison
   - `fetchAndDownload()` - Remove window.open
   - `downloadViaIframe()` - New method

2. ✅ `routes/resources.js`
   - `formatResource()` - Add storagePath mapping

## Status

✅ **COMPLETE** - Both issues resolved

- Downloads work without opening new tabs
- CMS-uploaded resources are downloadable
- Handles both UUID and integer IDs
- Better error handling and logging
- CORS issues handled gracefully
