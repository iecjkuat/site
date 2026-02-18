# Resources Upload Setup Checklist

## ❌ Current Issue
- Upload endpoint returns 404 (Not Found)
- Storage bucket not set up yet

## ✅ Steps to Fix (Do in Order):

### 1. Run SQL Scripts in Supabase SQL Editor

**Step 1a: Create Storage Bucket**
```sql
-- Copy and run: supabase/17-setup-storage.sql
```

**Step 1b: Add Storage Path Column**
```sql
-- Copy and run: supabase/18-add-storage-path-column.sql
```

**Step 1c: Verify Setup**
```sql
-- Copy and run: supabase/verify-storage-setup.sql
```

You should see:
- ✅ Resources bucket exists
- ✅ storage_path column exists
- Storage policies found

### 2. Restart Your Server

Stop the server (Ctrl+C) and restart:
```bash
npm start
```

### 3. Test Upload

1. Go to: http://localhost:3000/cms
2. Click "Resources" tab
3. Click "Upload Document" button
4. Fill in the form:
   - Select a file (PDF, DOC, DOCX, TXT, or ZIP)
   - Enter title
   - Enter description (optional)
   - Select category
   - Select access level
5. Click "Upload Document"

### 4. Check for Errors

If upload still fails, check:

**Browser Console (F12):**
- Look for error messages
- Check the network tab for the request details

**Server Logs:**
- Look for error messages in terminal
- Check for authentication errors
- Check for storage errors

## Common Issues:

### Issue: 404 Not Found
**Solution:** Restart the server to load new routes

### Issue: "Storage bucket not found"
**Solution:** Run `supabase/17-setup-storage.sql`

### Issue: "Column storage_path does not exist"
**Solution:** Run `supabase/18-add-storage-path-column.sql`

### Issue: "Authentication required"
**Solution:** Make sure you're logged in to the CMS

### Issue: "Invalid file type"
**Solution:** Only PDF, DOC, DOCX, TXT, ZIP files are allowed

### Issue: "File too large"
**Solution:** Maximum file size is 10MB

## Verify Storage in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click "Storage" in the left sidebar
3. You should see a "resources" bucket
4. After uploading, files should appear in the bucket organized by category

## Need Help?

Check the detailed documentation:
- `docs/RESOURCES_UPLOAD_SETUP.md` - Complete setup guide
- `routes/resources.js` - Upload endpoint code
- `pages/cms/modules/cms-manager.js` - Frontend upload code
