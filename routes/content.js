const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Middleware to verify JWT token and user permissions
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, membership_status')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check content creation permissions
const checkContentPermissions = (req, res, next) => {
  if (!['admin', 'executive'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Insufficient permissions. Only admins and executives can create content.' 
    });
  }
  next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Check if articles table exists (table should be created via schema)
const initializeArticlesTable = async () => {
  try {
    // Simple check to see if table exists by querying it
    const { error } = await supabase
      .from('articles')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found"
      console.error('Error checking articles table:', error);
    } else {
      console.log('Articles table is available');
    }
  } catch (error) {
    console.log('Articles table check:', error.message);
  }
};

// Initialize on module load
initializeArticlesTable();

// Routes

// Create new article
router.post('/articles', authenticateToken, checkContentPermissions, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('status').isIn(['published', 'draft', 'scheduled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, status, tags, featured_image, scheduled_at } = req.body;

    // Create article
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        content,
        category,
        status,
        tags: tags || [],
        featured_image,
        author_id: req.user.id,
        scheduled_at: scheduled_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        id, title, content, category, status, tags, featured_image,
        created_at, updated_at,
        author:author_id(name)
      `)
      .single();

    if (error) {
      console.error('Article creation error:', error);
      return res.status(500).json({ message: 'Failed to create article' });
    }

    res.status(201).json({
      message: 'Article created successfully',
      article
    });

  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Server error while creating article' });
  }
});

// Get all articles with pagination
router.get('/articles', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'published' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('articles')
      .select(`
        id, title, content, category, status, tags, featured_image,
        created_at, updated_at,
        author:author_id(name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Articles fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch articles' });
    }

    res.json({
      articles: articles || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Server error while fetching articles' });
  }
});

// Get single article by ID
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id, title, content, category, status, tags, featured_image,
        created_at, updated_at,
        author:author_id(name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ article });

  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Server error while fetching article' });
  }
});

// Update article
router.put('/articles/:id', authenticateToken, checkContentPermissions, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('status').optional().isIn(['published', 'draft', 'scheduled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // Check if user owns the article or is admin
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (existingArticle.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own articles' });
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, title, content, category, status, tags, featured_image,
        created_at, updated_at,
        author:author_id(name)
      `)
      .single();

    if (error) {
      console.error('Article update error:', error);
      return res.status(500).json({ message: 'Failed to update article' });
    }

    res.json({
      message: 'Article updated successfully',
      article
    });

  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Server error while updating article' });
  }
});

// Delete article
router.delete('/articles/:id', authenticateToken, checkContentPermissions, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the article or is admin
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (existingArticle.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own articles' });
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Article deletion error:', error);
      return res.status(500).json({ message: 'Failed to delete article' });
    }

    res.json({ message: 'Article deleted successfully' });

  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Server error while deleting article' });
  }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: activities, error } = await supabase
      .from('articles')
      .select(`
        id, title, created_at,
        author:author_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Recent activity fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch recent activity' });
    }

    const formattedActivities = activities.map(activity => ({
      type: 'article',
      title: `New article published: "${activity.title}"`,
      created_at: activity.created_at,
      author_name: activity.author?.name || 'Unknown'
    }));

    res.json(formattedActivities);

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error while fetching recent activity' });
  }
});

// Upload media files
router.post('/media/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Optionally store file info in database
    const { data: mediaFile, error } = await supabase
      .from('media_files')
      .insert({
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: fileUrl,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by: req.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log('Media file database insert error:', error);
      // Continue anyway, file was uploaded successfully
    }

    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ message: 'Server error while uploading file' });
  }
});

module.exports = router;