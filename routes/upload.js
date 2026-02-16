const express = require('express');
const multer = require('multer');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const path = require('path');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and videos
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed!'));
        }
    }
});

// Upload single file to event gallery
router.post('/event-gallery/:eventId', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { eventId } = req.params;
        const file = req.file;

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${eventId}/${timestamp}-${sanitizedName}`;

        console.log('📤 Uploading file:', fileName);
        console.log('📦 File size:', file.size, 'bytes');
        console.log('📝 MIME type:', file.mimetype);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('event-gallery')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Upload error:', error);
            return res.status(500).json({ 
                message: 'Failed to upload file',
                error: error.message 
            });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('event-gallery')
            .getPublicUrl(fileName);

        console.log('✅ File uploaded successfully:', publicUrl);

        // Return file info
        res.json({
            success: true,
            file: {
                type: file.mimetype.startsWith('video') ? 'video' : 'image',
                url: publicUrl,
                name: file.originalname,
                size: file.size,
                uploaded_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ 
            message: 'Server error during upload',
            error: error.message 
        });
    }
});

// Upload multiple files
router.post('/event-gallery/:eventId/batch', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const { eventId } = req.params;
        const uploadedFiles = [];
        const errors = [];

        console.log(`📤 Uploading ${req.files.length} files for event ${eventId}`);

        // Upload each file
        for (const file of req.files) {
            try {
                const timestamp = Date.now();
                const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `${eventId}/${timestamp}-${sanitizedName}`;

                const { data, error } = await supabase.storage
                    .from('event-gallery')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    errors.push({ name: file.originalname, error: error.message });
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('event-gallery')
                    .getPublicUrl(fileName);

                uploadedFiles.push({
                    type: file.mimetype.startsWith('video') ? 'video' : 'image',
                    url: publicUrl,
                    name: file.originalname,
                    size: file.size,
                    uploaded_at: new Date().toISOString()
                });

            } catch (err) {
                errors.push({ name: file.originalname, error: err.message });
            }
        }

        console.log(`✅ Uploaded ${uploadedFiles.length} files successfully`);
        if (errors.length > 0) {
            console.log(`⚠️ ${errors.length} files failed to upload`);
        }

        res.json({
            success: true,
            files: uploadedFiles,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('❌ Batch upload error:', error);
        res.status(500).json({ 
            message: 'Server error during batch upload',
            error: error.message 
        });
    }
});

// Delete file from event gallery
router.delete('/event-gallery/:eventId/:fileName', async (req, res) => {
    try {
        const { eventId, fileName } = req.params;
        const filePath = `${eventId}/${fileName}`;

        console.log('🗑️ Deleting file:', filePath);

        const { error } = await supabase.storage
            .from('event-gallery')
            .remove([filePath]);

        if (error) {
            console.error('❌ Delete error:', error);
            return res.status(500).json({ 
                message: 'Failed to delete file',
                error: error.message 
            });
        }

        console.log('✅ File deleted successfully');

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({ 
            message: 'Server error during delete',
            error: error.message 
        });
    }
});

module.exports = router;
