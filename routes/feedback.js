/**
 * Event Feedback Routes
 * Handles post-event feedback collection, analytics, and photo uploads
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult, param } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/feedback-photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `feedback-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 photos per feedback
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// Get feedback categories
router.get('/categories', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('feedback_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (error) throw error;

        res.json({
            categories: categories || []
        });
    } catch (error) {
        console.error('Error fetching feedback categories:', error);
        res.status(500).json({ message: 'Failed to fetch feedback categories' });
    }
});

// Get recent public feedback (Whispers)
router.get('/public', async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        // Fetch recent feedback to display on the wall
        // We fetching only title, comment, and timestamp
        const { data: feedback, error } = await supabase
            .from('event_feedback')
            .select('id, title, comment, created_at, is_anonymous')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) throw error;

        res.json({
            feedback: feedback || []
        });
    } catch (error) {
        console.error('Error fetching public feedback:', error);
        res.status(500).json({ message: 'Failed to fetch public feedback' });
    }
});

// Get event feedback (public view)
router.get('/event/:eventId', [
    param('eventId').isUUID().withMessage('Valid event ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId } = req.params;
        const { page = 1, limit = 10, includePhotos = false } = req.query;

        // Get feedback with user info (excluding anonymous)
        const { data: feedback, error: feedbackError } = await supabase
            .from('event_feedback')
            .select(`
                id,
                overall_rating,
                content_rating,
                organization_rating,
                venue_rating,
                title,
                comment,
                suggestions,
                is_anonymous,
                would_recommend,
                created_at,
                users:user_id(name, profile_picture_url)
            `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (feedbackError) throw feedbackError;

        let photos = [];
        if (includePhotos === 'true') {
            const { data: photoData, error: photoError } = await supabase
                .from('event_feedback_photos')
                .select(`
                    id,
                    photo_url,
                    caption,
                    uploaded_at,
                    users:user_id(name)
                `)
                .eq('event_id', eventId)
                .eq('is_approved', true)
                .eq('is_public', true)
                .order('uploaded_at', { ascending: false });

            if (!photoError) {
                photos = photoData || [];
            }
        }

        // Get feedback analytics
        const { data: analytics, error: analyticsError } = await supabase
            .from('event_feedback_analytics')
            .select('*')
            .eq('event_id', eventId)
            .single();

        res.json({
            feedback: feedback || [],
            photos: photos,
            analytics: analytics || {
                total_feedback_count: 0,
                avg_overall_rating: 0,
                would_recommend_count: 0,
                total_photos_count: 0
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                hasMore: feedback && feedback.length === parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching event feedback:', error);
        res.status(500).json({ message: 'Failed to fetch event feedback' });
    }
});

// Submit event or general feedback
router.post('/submit', [
    body('eventId').optional().isUUID().withMessage('Valid event ID required'),
    body('overallRating').optional().isInt({ min: 1, max: 5 }).withMessage('Overall rating must be 1-5'),
    body('title').optional().isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
    body('comment').optional().isLength({ max: 2000 }).withMessage('Comment must be 2000 characters or less'),
    body('isAnonymous').optional().isBoolean().withMessage('Anonymous flag must be boolean')
], async (req, res) => {
    const fs = require('fs');
    const logFile = path.resolve(__dirname, '../feedback_debug.log');
    const log = (msg) => { try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { } };
    log('--- START REQUEST ---');
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            eventId = null,
            overallRating,
            contentRating,
            organizationRating,
            venueRating,
            title,
            comment,
            suggestions,
            isAnonymous = false,
            wouldRecommend,
            categoryRatings = []
        } = req.body;

        // Get user ID from auth (if not anonymous)
        const userId = isAnonymous ? null : req.user?.id;

        // Check if user already submitted feedback for this event (prevent duplicates) - ONLY IF EVENT ID EXISTS
        if (eventId && userId) {
            const { data: existingFeedback } = await supabase
                .from('event_feedback')
                .select('id')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .single();

            if (existingFeedback) {
                return res.status(400).json({
                    message: 'You have already submitted feedback for this event'
                });
            }
        }

        // Verify user attended the event (if not anonymous and event exists)
        let attendanceConfirmed = false;
        if (eventId && userId) {
            const { data: attendance } = await supabase
                .from('event_attendees')
                .select('attendance_status')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .single();

            attendanceConfirmed = attendance?.attendance_status === 'attended';
        }

        // Resolve General Feedback Event if eventId is null
        let finalEventId = eventId;
        if (!finalEventId) {
            try {
                // Try to find existing 'General Feedback' event
                const { data: generalEvent } = await supabase
                    .from('events')
                    .select('id')
                    .eq('title', 'General Feedback')
                    .single();

                if (generalEvent) {
                    finalEventId = generalEvent.id;
                } else {
                    // Create if not exists
                    const { data: newEvent, error: createError } = await supabase
                        .from('events')
                        .insert({
                            title: 'General Feedback',
                            description: 'Container for general anonymous feedback/whispers.',
                            date: '2099-12-31',
                            start_date: '2099-12-31T00:00:00Z',
                            end_date: '2099-12-31T23:59:59Z',
                            location: 'Online',
                            status: 'published'
                        })
                        .select()
                        .single();

                    if (createError) throw createError;
                    finalEventId = newEvent.id;
                }
            } catch (err) {
                console.error('Error resolving General Feedback event:', err);
                return res.status(500).json({ error: 'System configuration error' });
            }
        }

        // Insert main feedback
        const { data: feedback, error: feedbackError } = await supabase
            .from('event_feedback')
            .insert({
                event_id: finalEventId,
                user_id: isAnonymous ? null : userId,
                rating: overallRating || 5, // Map to 'rating'
                suggestions: comment || suggestions || '', // Map main comment to 'suggestions'
                // Removed fields that don't exist in live DB:
                // overall_rating, content_rating, organization_rating, venue_rating, 
                // title, is_anonymous, attendance_confirmed, would_recommend
            })
            .select()
            .single();

        if (feedbackError) throw feedbackError;

        // Insert category ratings if provided
        if (categoryRatings.length > 0) {
            const categoryRatingInserts = categoryRatings.map(cr => ({
                feedback_id: feedback.id,
                category_id: cr.categoryId,
                rating: cr.rating,
                comment: cr.comment
            }));

            const { error: categoryError } = await supabase
                .from('feedback_category_ratings')
                .insert(categoryRatingInserts);

            if (categoryError) {
                console.error('Error inserting category ratings:', categoryError);
                // Don't fail the whole request, just log the error
            }
        }

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedbackId: feedback.id,
            isAnonymous: isAnonymous
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        log(`[CATCH] ${error.message}\n${error.stack}`);
        res.status(500).json({ message: `Failed to submit feedback: ${error.message}` });
    }
});

// Upload feedback photos
router.post('/photos/upload', upload.array('photos', 5), [
    body('eventId').isUUID().withMessage('Valid event ID required'),
    body('feedbackId').optional().isUUID().withMessage('Valid feedback ID required'),
    body('captions').optional().isArray().withMessage('Captions must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No photos uploaded' });
        }

        const { eventId, feedbackId, captions = [] } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required for photo uploads' });
        }

        // Process uploaded photos
        const photoInserts = req.files.map((file, index) => ({
            feedback_id: feedbackId || null,
            event_id: eventId,
            user_id: userId,
            photo_url: `/uploads/feedback-photos/${file.filename}`,
            photo_filename: file.filename,
            photo_size: file.size,
            photo_type: file.mimetype,
            caption: captions[index] || null,
            is_public: true,
            is_approved: false // Requires moderation
        }));

        const { data: photos, error: photoError } = await supabase
            .from('event_feedback_photos')
            .insert(photoInserts)
            .select();

        if (photoError) throw photoError;

        res.status(201).json({
            message: 'Photos uploaded successfully',
            photos: photos.map(photo => ({
                id: photo.id,
                url: photo.photo_url,
                caption: photo.caption,
                status: 'pending_approval'
            }))
        });

    } catch (error) {
        console.error('Error uploading feedback photos:', error);
        res.status(500).json({ message: 'Failed to upload photos' });
    }
});

// Get feedback analytics for organizers
router.get('/analytics/:eventId', [
    param('eventId').isUUID().withMessage('Valid event ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId } = req.params;

        // Get comprehensive analytics
        const { data: analytics, error: analyticsError } = await supabase
            .from('event_feedback_analytics')
            .select('*')
            .eq('event_id', eventId)
            .single();

        if (analyticsError && analyticsError.code !== 'PGRST116') {
            throw analyticsError;
        }

        // Get feedback summary using the database function
        const { data: summary, error: summaryError } = await supabase
            .rpc('get_event_feedback_summary', { event_uuid: eventId });

        if (summaryError) {
            console.error('Error getting feedback summary:', summaryError);
        }

        // Get sentiment analysis
        const { data: sentiment, error: sentimentError } = await supabase
            .rpc('calculate_feedback_sentiment', { event_uuid: eventId });

        if (sentimentError) {
            console.error('Error calculating sentiment:', sentimentError);
        }

        // Get category breakdown
        const { data: categoryBreakdown, error: categoryError } = await supabase
            .from('feedback_category_ratings')
            .select(`
                rating,
                comment,
                feedback_categories:category_id(name, icon)
            `)
            .eq('feedback_id', eventId);

        res.json({
            analytics: analytics || {
                total_feedback_count: 0,
                avg_overall_rating: 0,
                would_recommend_count: 0,
                total_photos_count: 0
            },
            summary: summary?.[0] || {
                total_feedback: 0,
                avg_rating: 0,
                recommendation_rate: 0,
                top_positive_comments: [],
                top_suggestions: [],
                category_ratings: {}
            },
            sentiment: sentiment?.[0] || {
                sentiment_score: 0,
                sentiment_label: 'No Data',
                positive_feedback_count: 0,
                neutral_feedback_count: 0,
                negative_feedback_count: 0
            },
            categoryBreakdown: categoryBreakdown || []
        });

    } catch (error) {
        console.error('Error fetching feedback analytics:', error);
        res.status(500).json({ message: 'Failed to fetch feedback analytics' });
    }
});

// Get user's feedback for an event
router.get('/my-feedback/:eventId', [
    param('eventId').isUUID().withMessage('Valid event ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Get user's feedback
        const { data: feedback, error: feedbackError } = await supabase
            .from('event_feedback')
            .select(`
                *,
                feedback_category_ratings(
                    rating,
                    comment,
                    feedback_categories:category_id(name, icon)
                )
            `)
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (feedbackError && feedbackError.code !== 'PGRST116') {
            throw feedbackError;
        }

        // Get user's photos
        const { data: photos, error: photoError } = await supabase
            .from('event_feedback_photos')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId);

        if (photoError) {
            console.error('Error fetching user photos:', photoError);
        }

        res.json({
            feedback: feedback || null,
            photos: photos || [],
            canSubmitFeedback: !feedback
        });

    } catch (error) {
        console.error('Error fetching user feedback:', error);
        res.status(500).json({ message: 'Failed to fetch user feedback' });
    }
});

// Update feedback (only by original author)
router.put('/:feedbackId', [
    param('feedbackId').isUUID().withMessage('Valid feedback ID required'),
    body('overallRating').optional().isInt({ min: 1, max: 5 }),
    body('contentRating').optional().isInt({ min: 1, max: 5 }),
    body('organizationRating').optional().isInt({ min: 1, max: 5 }),
    body('venueRating').optional().isInt({ min: 1, max: 5 }),
    body('title').optional().isLength({ max: 200 }),
    body('comment').optional().isLength({ max: 2000 }),
    body('suggestions').optional().isLength({ max: 2000 }),
    body('wouldRecommend').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { feedbackId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const updateData = {};
        const allowedFields = [
            'overallRating', 'contentRating', 'organizationRating',
            'venueRating', 'title', 'comment', 'suggestions', 'wouldRecommend'
        ];

        // Map camelCase to snake_case
        const fieldMapping = {
            overallRating: 'overall_rating',
            contentRating: 'content_rating',
            organizationRating: 'organization_rating',
            venueRating: 'venue_rating',
            wouldRecommend: 'would_recommend'
        };

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                const dbField = fieldMapping[field] || field;
                updateData[dbField] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const { data: feedback, error } = await supabase
            .from('event_feedback')
            .update(updateData)
            .eq('id', feedbackId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Feedback not found or not authorized' });
            }
            throw error;
        }

        res.json({
            message: 'Feedback updated successfully',
            feedback: feedback
        });

    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ message: 'Failed to update feedback' });
    }
});

// Delete feedback (only by original author or admin)
router.delete('/:feedbackId', [
    param('feedbackId').isUUID().withMessage('Valid feedback ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { feedbackId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        let query = supabase
            .from('event_feedback')
            .delete()
            .eq('id', feedbackId);

        // If not admin, restrict to own feedback
        if (userRole !== 'admin' && userRole !== 'superadmin') {
            query = query.eq('user_id', userId);
        }

        const { error } = await query;

        if (error) {
            throw error;
        }

        res.json({ message: 'Feedback deleted successfully' });

    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Failed to delete feedback' });
    }
});

module.exports = router;