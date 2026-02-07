// JKUAT Innovation Club - Testimonials API Routes

const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/testimonials
 * Get approved testimonials for public display
 */
router.get('/', async (req, res) => {
    try {
        const { featured, limit = 6 } = req.query;
        
        console.log('📝 Fetching testimonials...');
        
        let query = supabase
            .from('testimonials')
            .select('*')
            .eq('is_approved', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });
        
        // Filter by featured if requested
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }
        
        // Apply limit
        if (limit && !isNaN(limit)) {
            query = query.limit(parseInt(limit));
        }
        
        const { data: testimonials, error } = await query;
        
        if (error) {
            console.error('❌ Error fetching testimonials:', error);
            throw error;
        }
        
        console.log(`✅ Fetched ${testimonials?.length || 0} testimonials`);
        
        res.json({
            success: true,
            testimonials: testimonials || [],
            count: testimonials?.length || 0,
            message: 'Testimonials retrieved successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in testimonials route:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching testimonials',
            error: error.message
        });
    }
});

/**
 * POST /api/testimonials
 * Submit a new testimonial (authenticated users)
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { content, rating = 5, course, year, title } = req.body;
        
        if (!content || content.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Testimonial content must be at least 10 characters long'
            });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        
        console.log('📝 Creating new testimonial...');
        
        const testimonialData = {
            user_id: req.user.id,
            name: req.user.full_name || req.user.email.split('@')[0],
            content: content.trim(),
            rating: parseInt(rating),
            course: course?.trim() || null,
            year: year?.trim() || null,
            title: title?.trim() || null,
            is_approved: false, // Require approval for new testimonials
            display_order: 999 // Put new ones at the end
        };
        
        const { data: testimonial, error } = await supabase
            .from('testimonials')
            .insert([testimonialData])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error creating testimonial:', error);
            throw error;
        }
        
        console.log('✅ Testimonial created successfully');
        
        res.status(201).json({
            success: true,
            testimonial,
            message: 'Testimonial submitted successfully and is pending approval'
        });
        
    } catch (error) {
        console.error('❌ Error creating testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting testimonial',
            error: error.message
        });
    }
});

/**
 * PUT /api/testimonials/:id/approve
 * Approve a testimonial (admin only)
 */
router.put('/:id/approve', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (!['admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        const { id } = req.params;
        const { is_featured = false, display_order } = req.body;
        
        console.log(`📝 Approving testimonial ${id}...`);
        
        const updateData = {
            is_approved: true,
            is_featured: Boolean(is_featured)
        };
        
        if (display_order !== undefined) {
            updateData.display_order = parseInt(display_order);
        }
        
        const { data: testimonial, error } = await supabase
            .from('testimonials')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error approving testimonial:', error);
            throw error;
        }
        
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        
        console.log('✅ Testimonial approved successfully');
        
        res.json({
            success: true,
            testimonial,
            message: 'Testimonial approved successfully'
        });
        
    } catch (error) {
        console.error('❌ Error approving testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving testimonial',
            error: error.message
        });
    }
});

/**
 * GET /api/testimonials/pending
 * Get pending testimonials for admin review
 */
router.get('/pending', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (!['admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        console.log('📝 Fetching pending testimonials...');
        
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error fetching pending testimonials:', error);
            throw error;
        }
        
        console.log(`✅ Fetched ${testimonials?.length || 0} pending testimonials`);
        
        res.json({
            success: true,
            testimonials: testimonials || [],
            count: testimonials?.length || 0,
            message: 'Pending testimonials retrieved successfully'
        });
        
    } catch (error) {
        console.error('❌ Error fetching pending testimonials:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending testimonials',
            error: error.message
        });
    }
});

/**
 * DELETE /api/testimonials/:id
 * Delete a testimonial (admin only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin or owns the testimonial
        const { id } = req.params;
        
        // First get the testimonial to check ownership
        const { data: testimonial, error: fetchError } = await supabase
            .from('testimonials')
            .select('user_id')
            .eq('id', id)
            .single();
        
        if (fetchError || !testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        
        // Check permissions
        const isOwner = testimonial.user_id === req.user.id;
        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }
        
        console.log(`📝 Deleting testimonial ${id}...`);
        
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('❌ Error deleting testimonial:', error);
            throw error;
        }
        
        console.log('✅ Testimonial deleted successfully');
        
        res.json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting testimonial',
            error: error.message
        });
    }
});

module.exports = router;