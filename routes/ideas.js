/**
 * Ideas & Innovation Hub Routes
 * Handles idea submission, collaboration, voting, and innovation management
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult, param } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/ideas/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `idea-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per idea
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    }
});

// Get all ideas with filtering and pagination
router.get('/', async (req, res) => {
    const startTime = Date.now();
    console.log('📥 GET /ideas request received:', {
        query: req.query,
        timestamp: new Date().toISOString()
    });

    try {
        const { status, category, userId, page = 1, limit = 10, search, sort = 'newest' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        console.log('🔍 Query params:', { status, category, userId, page, limit, search, sort, offset });

        let query = supabase
            .from('ideas')
            .select(`
                *,
                users:user_id(name, profile_picture),
                idea_categories:category_id(name, icon, color)
            `)
            .eq('status', 'approved'); // Only show approved ideas

        console.log('⏳ Executing Supabase query...');

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        if (category) {
            query = query.eq('category_id', category);
        }

        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply sorting
        switch (sort) {
            case 'popular':
                query = query.order('upvotes', { ascending: false });
                break;
            case 'trending':
                query = query.order('created_at', { ascending: false }).limit(50);
                break;
            default: // newest
                query = query.order('created_at', { ascending: false });
        }

        // Apply pagination
        query = query.range(offset, offset + parseInt(limit) - 1);

        const { data: ideas, error } = await query;

        const queryTime = Date.now() - startTime;
        console.log(`✅ Supabase query completed in ${queryTime}ms, returned ${ideas?.length || 0} ideas`);

        if (error) {
            console.error('❌ Supabase query error:', error);
            throw error;
        }

        // Get total count for pagination
        let countQuery = supabase
            .from('ideas')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved'); // Only count approved ideas

        if (status) countQuery = countQuery.eq('status', status);
        if (category) countQuery = countQuery.eq('category', category);
        if (userId) countQuery = countQuery.eq('user_id', userId);
        if (search) countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

        const { count, error: countError } = await countQuery;

        if (countError) throw countError;

        res.json({
            ideas: ideas || [],
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / parseInt(limit)),
                count: ideas?.length || 0,
                totalIdeas: count
            }
        });

    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).json({ message: 'Failed to fetch ideas', error: error.message });
    }
});

// Get idea categories
router.get('/categories', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('idea_categories')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json({ categories: categories || [] });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories', categories: [] });
    }
});

// Get idea statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total ideas count
        const { count: totalIdeas, error: ideasError } = await supabase
            .from('ideas')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');

        if (ideasError) {
            console.error('Error counting ideas:', ideasError);
            throw ideasError;
        }

        // Get total votes
        const { data: votesData, error: votesError } = await supabase
            .from('ideas')
            .select('votes_count')
            .eq('status', 'approved');

        if (votesError) {
            console.error('Error fetching votes:', votesError);
        }

        const totalVotes = votesData?.reduce((sum, idea) => sum + (idea.votes_count || 0), 0) || 0;

        // Get total comments
        const { data: commentsData, error: commentsError } = await supabase
            .from('ideas')
            .select('comments_count')
            .eq('status', 'approved');

        if (commentsError) {
            console.error('Error fetching comments:', commentsError);
        }

        const totalComments = commentsData?.reduce((sum, idea) => sum + (idea.comments_count || 0), 0) || 0;

        // Get active collaborators (users looking for team)
        const { count: activeCollaborators, error: collabError } = await supabase
            .from('ideas')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .eq('looking_for_team', true);

        if (collabError) {
            console.error('Error counting collaborators:', collabError);
        }

        console.log('Stats:', { totalIdeas, totalVotes, totalComments, activeCollaborators });

        res.json({
            totalIdeas: totalIdeas || 0,
            totalVotes: totalVotes,
            totalComments: totalComments,
            activeCollaborators: activeCollaborators || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            message: 'Failed to fetch stats',
            error: error.message,
            totalIdeas: 0,
            totalVotes: 0,
            totalComments: 0,
            activeCollaborators: 0
        });
    }
});

// Get single idea by ID
router.get('/:id', [
    param('id').isUUID().withMessage('Valid idea ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        const { data: idea, error } = await supabase
            .from('ideas')
            .select(`
                *,
                users:user_id(name, profile_picture),
                idea_categories:category_id(name, icon, color)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Idea not found' });
            }
            throw error;
        }

        // Increment view count
        await supabase
            .from('ideas')
            .update({ views_count: (idea.views_count || 0) + 1 })
            .eq('id', id);

        res.json(idea);

    } catch (error) {
        console.error('Error fetching idea:', error);
        res.status(500).json({ message: 'Failed to fetch idea' });
    }
});

// Create new idea
router.post('/', upload.array('attachments', 5), [
    body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    body('categoryId').isUUID().withMessage('Valid category ID required'),
    body('problemStatement').optional().isLength({ max: 2000 }),
    body('solutionOverview').optional().isLength({ max: 2000 }),
    body('targetAudience').optional().isLength({ max: 500 }),
    body('stage').optional().isIn(['concept', 'prototype', 'testing', 'implementation', 'launched']),
    body('complexityLevel').optional().isIn(['low', 'medium', 'high']),
    body('estimatedTimeline').optional().isLength({ max: 100 }),
    body('requiredSkills').optional().isArray(),
    body('tags').optional().isArray(),
    body('isSeekingCollaborators').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const {
            title,
            description,
            categoryId,
            problemStatement,
            solutionOverview,
            targetAudience,
            stage = 'concept',
            complexityLevel = 'medium',
            estimatedTimeline,
            requiredSkills = [],
            tags = [],
            isSeekingCollaborators = false
        } = req.body;

        // Process uploaded files
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/ideas/${file.filename}`,
            size: file.size,
            type: file.mimetype
        })) : [];

        // Create keywords for search
        const keywords = [title, description, ...tags].join(' ').toLowerCase();

        const { data: idea, error } = await supabase
            .from('ideas')
            .insert({
                user_id: userId,
                club_id: req.user?.club_id || null,
                title,
                description,
                category_id: categoryId, // Use category_id instead of category
                problem_statement: problemStatement,
                solution_overview: solutionOverview,
                target_audience: targetAudience,
                stage,
                complexity_level: complexityLevel,
                estimated_timeline: estimatedTimeline,
                required_skills: requiredSkills,
                tags,
                keywords,
                visibility: 'public', // Default to public
                is_seeking_collaborators: isSeekingCollaborators,
                attachments: attachments,
                status: 'active' // Set as active instead of draft
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Idea created successfully',
            idea: idea
        });

    } catch (error) {
        console.error('Error creating idea:', error);
        res.status(500).json({ message: 'Failed to create idea' });
    }
});

// Vote on an idea
router.post('/:id/vote', [
    param('id').isUUID().withMessage('Valid idea ID required'),
    body('voteType').isIn(['like', 'dislike']).withMessage('Vote type must be like or dislike')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { voteType } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if user already voted
        const { data: existingVote } = await supabase
            .from('idea_votes')
            .select('*')
            .eq('idea_id', id)
            .eq('user_id', userId)
            .single();

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                // Remove vote if same type
                await supabase
                    .from('idea_votes')
                    .delete()
                    .eq('id', existingVote.id);
            } else {
                // Update vote type
                await supabase
                    .from('idea_votes')
                    .update({ vote_type: voteType })
                    .eq('id', existingVote.id);
            }
        } else {
            // Create new vote
            await supabase
                .from('idea_votes')
                .insert({
                    idea_id: id,
                    user_id: userId,
                    vote_type: voteType
                });
        }

        // Update idea vote counts
        const { data: voteCounts } = await supabase
            .from('idea_votes')
            .select('vote_type')
            .eq('idea_id', id);

        const likes = voteCounts?.filter(v => v.vote_type === 'like').length || 0;
        const dislikes = voteCounts?.filter(v => v.vote_type === 'dislike').length || 0;

        await supabase
            .from('ideas')
            .update({
                likes_count: likes,
                dislikes_count: dislikes
            })
            .eq('id', id);

        res.json({
            message: 'Vote recorded successfully',
            likes,
            dislikes
        });

    } catch (error) {
        console.error('Error voting on idea:', error);
        res.status(500).json({ message: 'Failed to record vote' });
    }
});

// Get idea categories
router.get('/categories/list', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('idea_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (error) throw error;

        res.json({
            categories: categories || []
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

// Get comments for an idea
router.get('/:id/comments', [
    param('id').isUUID().withMessage('Valid idea ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        const { data: comments, error } = await supabase
            .from('idea_comments')
            .select(`
                *,
                user:user_id(id, name, profile_picture)
            `)
            .eq('idea_id', id)
            .is('parent_comment_id', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ comments: comments || [] });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Failed to fetch comments', comments: [] });
    }
});

// Post a comment on an idea
router.post('/:id/comments', [
    param('id').isUUID().withMessage('Valid idea ID required'),
    body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { content } = req.body;
        
        // Use a default user ID for anonymous comments
        // In a real app, you'd get this from authentication middleware
        const anonymousUserId = (await supabase.from('users').select('id').limit(1).single()).data?.id;

        if (!anonymousUserId) {
            return res.status(500).json({ message: 'No users found in database' });
        }

        // Create comment
        const { data: comment, error } = await supabase
            .from('idea_comments')
            .insert({
                idea_id: id,
                user_id: anonymousUserId,
                content
            })
            .select(`
                *,
                user:user_id(id, name, profile_picture)
            `)
            .single();

        if (error) throw error;

        // Update comment count on idea
        const { data: commentCount } = await supabase
            .from('idea_comments')
            .select('id', { count: 'exact', head: true })
            .eq('idea_id', id);

        await supabase
            .from('ideas')
            .update({ comments_count: commentCount || 0 })
            .eq('id', id);

        res.status(201).json({ comment, message: 'Comment posted successfully' });

    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ message: 'Failed to post comment' });
    }
});

// Vote on an idea (supports both custom JWT and Supabase auth)
router.post('/:id/vote', [
    param('id').isUUID().withMessage('Valid idea ID required'),
    body('voteType').isIn(['like', 'dislike']).withMessage('Valid vote type required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { voteType } = req.body;
        
        let userId = null;
        
        // Try to get user from authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            // Try custom JWT first
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET, {
                    algorithms: ['HS256'],
                    issuer: 'jkuat-innovation-club',
                    audience: 'jkuat-platform'
                });
                userId = decoded.userId;
                console.log('✅ Authenticated with custom JWT:', userId);
            } catch (jwtError) {
                // If custom JWT fails, try Supabase auth
                try {
                    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
                    if (user && !authError) {
                        userId = user.id;
                        console.log('✅ Authenticated with Supabase auth:', userId);
                    }
                } catch (supabaseError) {
                    console.error('Both auth methods failed:', { jwtError, supabaseError });
                }
            }
        }
        
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        console.log('✅ Vote request authenticated:', { ideaId: id, userId, voteType });

        // Check if user already voted
        const { data: existingVote, error: voteError } = await supabase
            .from('idea_votes')
            .select('*')
            .eq('idea_id', id)
            .eq('user_id', userId)
            .single();

        if (existingVote) {
            // Update existing vote
            const { error: updateError } = await supabase
                .from('idea_votes')
                .update({ vote_type: voteType })
                .eq('id', existingVote.id);

            if (updateError) throw updateError;
        } else {
            // Create new vote
            const { error: insertError } = await supabase
                .from('idea_votes')
                .insert({
                    idea_id: id,
                    user_id: userId,
                    vote_type: voteType
                });

            if (insertError) throw insertError;
        }

        // Update idea vote counts
        const { data: voteCounts, error: countError } = await supabase
            .from('idea_votes')
            .select('vote_type')
            .eq('idea_id', id);

        if (!countError && voteCounts) {
            const likes = voteCounts.filter(v => v.vote_type === 'like').length;
            
            await supabase
                .from('ideas')
                .update({ 
                    votes_count: likes
                })
                .eq('id', id);
        }

        console.log('✅ Vote recorded successfully');
        res.json({ message: 'Vote recorded successfully' });

    } catch (error) {
        console.error('❌ Error voting on idea:', error);
        res.status(500).json({ message: 'Failed to record vote', error: error.message });
    }
});

// Get collaboration requests for an idea
router.get('/:id/collaborations', [
    param('id').isUUID().withMessage('Valid idea ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        const { data: collaborations, error } = await supabase
            .from('idea_collaborations')
            .select(`
                *,
                users:user_id(name, profile_picture, skills)
            `)
            .eq('idea_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(collaborations || []);

    } catch (error) {
        console.error('Error fetching collaborations:', error);
        res.status(500).json({ message: 'Failed to fetch collaboration requests' });
    }
});

// Request collaboration on an idea
router.post('/:id/collaborate', [
    param('id').isUUID().withMessage('Valid idea ID required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('role').optional().isLength({ max: 50 }),
    body('skillsOffered').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { message, role = 'contributor', skillsOffered = [] } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if user already requested collaboration
        const { data: existing, error: existingError } = await supabase
            .from('idea_collaborations')
            .select('*')
            .eq('idea_id', id)
            .eq('user_id', userId)
            .single();

        if (existing) {
            return res.status(400).json({ message: 'Collaboration request already exists' });
        }

        // Create collaboration request
        const { data: collaboration, error } = await supabase
            .from('idea_collaborations')
            .insert({
                idea_id: id,
                user_id: userId,
                role,
                message,
                skills_offered: skillsOffered,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(collaboration);

    } catch (error) {
        console.error('Error creating collaboration request:', error);
        res.status(500).json({ message: 'Failed to create collaboration request' });
    }
});

module.exports = router;