const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to verify JWT token
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
      .select('id, name, email, role')
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

// Get all executive committee members
router.get('/executive-committee', async (req, res) => {
  try {
    const { data: executives, error } = await supabase
      .from('executive_committee')
      .select(`
        id, position, position_order, bio, profile_photo, office_hours,
        contact_info, social_media, start_date, end_date, is_active,
        achievements, responsibilities, created_at,
        users!inner(id, name, email, phone, course, year_of_study, college)
      `)
      .eq('is_active', true)
      .order('position_order', { ascending: true });

    if (error) {
      console.error('Executive committee fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch executive committee' });
    }

    // Format the response
    const formattedExecutives = executives.map(exec => ({
      id: exec.id,
      position: exec.position,
      positionOrder: exec.position_order,
      bio: exec.bio,
      profilePhoto: exec.profile_photo,
      officeHours: exec.office_hours,
      contactInfo: exec.contact_info,
      socialMedia: exec.social_media,
      startDate: exec.start_date,
      endDate: exec.end_date,
      achievements: exec.achievements,
      responsibilities: exec.responsibilities,
      user: exec.users
    }));

    res.json({
      executives: formattedExecutives,
      count: formattedExecutives.length
    });

  } catch (error) {
    console.error('Executive committee error:', error);
    res.status(500).json({ message: 'Server error while fetching executive committee' });
  }
});

// Get club patrons
router.get('/patrons', async (req, res) => {
  try {
    const { data: patrons, error } = await supabase
      .from('club_patrons')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Patrons fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch club patrons' });
    }

    res.json({
      patrons: patrons || [],
      count: patrons?.length || 0
    });

  } catch (error) {
    console.error('Patrons error:', error);
    res.status(500).json({ message: 'Server error while fetching club patrons' });
  }
});

// Get single executive member
router.get('/executive-committee/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: executive, error } = await supabase
      .from('executive_committee')
      .select(`
        id, position, position_order, bio, profile_photo, office_hours,
        contact_info, social_media, start_date, end_date, is_active,
        achievements, responsibilities, created_at, updated_at,
        users!inner(id, name, email, phone, course, year_of_study, college, bio, skills)
      `)
      .eq('id', id)
      .single();

    if (error || !executive) {
      return res.status(404).json({ message: 'Executive member not found' });
    }

    const formattedExecutive = {
      id: executive.id,
      position: executive.position,
      positionOrder: executive.position_order,
      bio: executive.bio,
      profilePhoto: executive.profile_photo,
      officeHours: executive.office_hours,
      contactInfo: executive.contact_info,
      socialMedia: executive.social_media,
      startDate: executive.start_date,
      endDate: executive.end_date,
      achievements: executive.achievements,
      responsibilities: executive.responsibilities,
      user: executive.users
    };

    res.json(formattedExecutive);

  } catch (error) {
    console.error('Executive member fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching executive member' });
  }
});

// Add new executive member (admin only)
router.post('/executive-committee', authenticateToken, [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('positionOrder').isInt({ min: 1 }).withMessage('Valid position order is required'),
  body('bio').optional().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId, position, positionOrder, bio, officeHours,
      contactInfo, socialMedia, startDate, achievements, responsibilities
    } = req.body;

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if user is already in executive committee
    const { data: existing } = await supabase
      .from('executive_committee')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'User is already in executive committee' });
    }

    const { data: newExecutive, error } = await supabase
      .from('executive_committee')
      .insert({
        user_id: userId,
        position,
        position_order: positionOrder,
        bio,
        office_hours: officeHours || {},
        contact_info: contactInfo || {},
        social_media: socialMedia || {},
        start_date: startDate,
        achievements: achievements || [],
        responsibilities: responsibilities || []
      })
      .select(`
        id, position, position_order, bio, office_hours, contact_info,
        social_media, start_date, achievements, responsibilities,
        users!inner(id, name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Executive creation error:', error);
      return res.status(500).json({ message: 'Failed to add executive member' });
    }

    res.status(201).json({
      message: 'Executive member added successfully',
      executive: newExecutive
    });

  } catch (error) {
    console.error('Add executive error:', error);
    res.status(500).json({ message: 'Server error while adding executive member' });
  }
});

// Update executive member (admin only)
router.put('/executive-committee/:id', authenticateToken, [
  body('position').optional().notEmpty().withMessage('Position cannot be empty'),
  body('positionOrder').optional().isInt({ min: 1 }).withMessage('Valid position order is required'),
  body('bio').optional().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: updatedExecutive, error } = await supabase
      .from('executive_committee')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, position, position_order, bio, office_hours, contact_info,
        social_media, start_date, end_date, achievements, responsibilities,
        users!inner(id, name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Executive update error:', error);
      return res.status(500).json({ message: 'Failed to update executive member' });
    }

    if (!updatedExecutive) {
      return res.status(404).json({ message: 'Executive member not found' });
    }

    res.json({
      message: 'Executive member updated successfully',
      executive: updatedExecutive
    });

  } catch (error) {
    console.error('Update executive error:', error);
    res.status(500).json({ message: 'Server error while updating executive member' });
  }
});

// Remove executive member (admin only)
router.delete('/executive-committee/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;

    // Soft delete by setting is_active to false
    const { data: deletedExecutive, error } = await supabase
      .from('executive_committee')
      .update({ 
        is_active: false, 
        end_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, position')
      .single();

    if (error) {
      console.error('Executive deletion error:', error);
      return res.status(500).json({ message: 'Failed to remove executive member' });
    }

    if (!deletedExecutive) {
      return res.status(404).json({ message: 'Executive member not found' });
    }

    res.json({
      message: 'Executive member removed successfully',
      executive: deletedExecutive
    });

  } catch (error) {
    console.error('Delete executive error:', error);
    res.status(500).json({ message: 'Server error while removing executive member' });
  }
});

// Add club patron (admin only)
router.post('/patrons', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('department').optional().notEmpty().withMessage('Department cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, title, department, email, phone, officeLocation,
      officeHours, bio, socialMedia, specialization
    } = req.body;

    const { data: newPatron, error } = await supabase
      .from('club_patrons')
      .insert({
        name,
        title,
        department,
        email,
        phone,
        office_location: officeLocation,
        office_hours: officeHours || {},
        bio,
        social_media: socialMedia || {},
        specialization: specialization || []
      })
      .select('*')
      .single();

    if (error) {
      console.error('Patron creation error:', error);
      return res.status(500).json({ message: 'Failed to add club patron' });
    }

    res.status(201).json({
      message: 'Club patron added successfully',
      patron: newPatron
    });

  } catch (error) {
    console.error('Add patron error:', error);
    res.status(500).json({ message: 'Server error while adding club patron' });
  }
});

// Get leadership statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: executiveCount },
      { count: patronCount },
      { data: positions }
    ] = await Promise.all([
      supabase.from('executive_committee').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('club_patrons').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('executive_committee').select('position').eq('is_active', true)
    ]);

    const positionBreakdown = {};
    positions?.forEach(p => {
      positionBreakdown[p.position] = (positionBreakdown[p.position] || 0) + 1;
    });

    res.json({
      executiveMembers: executiveCount || 0,
      clubPatrons: patronCount || 0,
      totalLeadership: (executiveCount || 0) + (patronCount || 0),
      positionBreakdown
    });

  } catch (error) {
    console.error('Leadership stats error:', error);
    res.status(500).json({ message: 'Server error while fetching leadership statistics' });
  }
});

module.exports = router;