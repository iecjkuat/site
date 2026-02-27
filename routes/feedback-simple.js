/**
 * Simple Feedback Routes
 * Handles anonymous whispers and public reviews
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Optional auth middleware - doesn't fail if no token, just populates req.user if token exists
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        // No token, continue without user
        return next();
    }
    
    try {
        // Try to authenticate, but don't fail if it doesn't work
        await authenticateToken(req, res, next);
    } catch (error) {
        // Token invalid, continue without user
        console.log('⚠️ Optional auth failed, continuing without user');
        next();
    }
};

// Submit feedback (whisper or review)
router.post('/submit', optionalAuth, [
    body('comment').isLength({ min: 3, max: 2000 }).withMessage('Comment must be 3-2000 characters'),
    body('isAnonymous').isBoolean().withMessage('isAnonymous must be boolean'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
], async (req, res) => {
    console.log('📥 Feedback submission received:', {
        isAnonymous: req.body.isAnonymous,
        hasComment: !!req.body.comment,
        rating: req.body.rating
    });

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { comment, isAnonymous, rating } = req.body;
        const userId = isAnonymous ? null : req.user?.id;

        console.log('💾 Inserting feedback:', { 
            userId, 
            isAnonymous, 
            commentLength: comment.length,
            hasUser: !!req.user,
            userEmail: req.user?.email
        });

        // Get or create "General Feedback" event
        let eventId;
        const { data: existingEvent } = await supabase
            .from('events')
            .select('id')
            .eq('title', 'General Feedback')
            .single();

        if (existingEvent) {
            eventId = existingEvent.id;
        } else {
            const { data: newEvent, error: createError } = await supabase
                .from('events')
                .insert({
                    title: 'General Feedback',
                    description: 'Container for feedback and reviews',
                    start_date: '2099-12-31T00:00:00Z',
                    end_date: '2099-12-31T23:59:59Z',
                    location: 'Online',
                    status: 'upcoming'
                })
                .select()
                .single();

            if (createError) {
                console.error('❌ Error creating event:', createError);
                throw createError;
            }
            eventId = newEvent.id;
        }

        // Insert feedback
        const { data: feedback, error: insertError } = await supabase
            .from('event_feedback')
            .insert({
                event_id: eventId,
                user_id: userId,
                rating: rating || 5,
                suggestions: comment
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Insert error:', insertError);
            throw insertError;
        }

        console.log('✅ Feedback saved:', feedback.id);

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedbackId: feedback.id
        });

    } catch (error) {
        console.error('❌ Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit feedback',
            error: error.message
        });
    }
});

// Get whispers (anonymous feedback) - CMS only
router.get('/whispers', async (req, res) => {
    console.log('📥 Fetching whispers...');

    try {
        const { data: feedback, error } = await supabase
            .from('event_feedback')
            .select('id, suggestions, user_id')
            .is('user_id', null)
            .order('id', { ascending: false })
            .limit(50);

        if (error) throw error;

        console.log('✅ Whispers fetched:', feedback?.length || 0);

        res.json({
            success: true,
            feedback: (feedback || []).map(item => ({
                id: item.id,
                comment: item.suggestions,
                created_at: new Date().toISOString()
            }))
        });

    } catch (error) {
        console.error('❌ Error fetching whispers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch whispers',
            error: error.message
        });
    }
});

// Get reviews (public feedback) - CMS only
router.get('/reviews', async (req, res) => {
    console.log('📥 Fetching reviews...');

    try {
        const { data: feedback, error } = await supabase
            .from('event_feedback')
            .select('id, suggestions, user_id, rating')
            .not('user_id', 'is', null)
            .order('id', { ascending: false })
            .limit(50);

        if (error) throw error;

        console.log('✅ Reviews fetched:', feedback?.length || 0);

        // Fetch user info for each review
        const reviews = await Promise.all((feedback || []).map(async (item) => {
            let userName = 'Member';
            if (item.user_id) {
                const { data: user } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', item.user_id)
                    .single();
                if (user) userName = user.name;
            }

            return {
                id: item.id,
                comment: item.suggestions,
                rating: item.rating || 5,
                user_name: userName,
                created_at: new Date().toISOString()
            };
        }));

        res.json({
            success: true,
            feedback: reviews
        });

    } catch (error) {
        console.error('❌ Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
    console.log('🗑️ Deleting feedback:', req.params.id);

    try {
        const { error } = await supabase
            .from('event_feedback')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        console.log('✅ Feedback deleted');

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete feedback',
            error: error.message
        });
    }
});

module.exports = router;
