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
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Executive committee fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch executive committee' });
    }

    // Format the response to match frontend expectations
    const formattedExecutives = executives.map(exec => ({
      id: exec.id,
      position: exec.position,
      positionOrder: exec.display_order,
      bio: exec.bio,
      profilePhoto: exec.profile_image_url,
      officeHours: exec.office_hours || '',
      contactInfo: {
        email: exec.email,
        phone: exec.phone
      },
      socialMedia: exec.social_links || {},
      startDate: exec.term_start_date,
      endDate: exec.term_end_date,
      achievements: [],
      responsibilities: [],
      // Create user object from executive_committee fields for frontend compatibility
      user: {
        id: exec.user_id,
        name: exec.name,
        email: exec.email,
        phone: exec.phone,
        course: exec.course,
        year_of_study: exec.year_of_study,
        college: 'JKUAT'
      }
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
      .select('*')
      .eq('id', id)
      .single();

    if (error || !executive) {
      return res.status(404).json({ message: 'Executive member not found' });
    }

    const formattedExecutive = {
      id: executive.id,
      position: executive.position,
      positionOrder: executive.display_order,
      bio: executive.bio,
      profilePhoto: executive.profile_image_url,
      officeHours: executive.office_hours || '',
      contactInfo: {
        email: executive.email,
        phone: executive.phone
      },
      socialMedia: executive.social_links || {},
      startDate: executive.term_start_date,
      endDate: executive.term_end_date,
      achievements: [],
      responsibilities: [],
      user: {
        id: executive.user_id,
        name: executive.name,
        email: executive.email,
        phone: executive.phone,
        course: executive.course,
        year_of_study: executive.year_of_study,
        college: 'JKUAT',
        bio: executive.bio,
        skills: []
      }
    };

    res.json(formattedExecutive);

  } catch (error) {
    console.error('Executive member fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching executive member' });
  }
});

// Add new executive member (admin only)
router.post('/executive-committee', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('email').optional().isEmail().withMessage('Valid email is required')
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
      name, position, email, phone, bio, course, year_of_study,
      office_hours, term_start_date, term_end_date, display_order, social_links
    } = req.body;

    const { data: newExecutive, error } = await supabase
      .from('executive_committee')
      .insert({
        name,
        position,
        email,
        phone,
        bio,
        course,
        year_of_study,
        office_hours,
        term_start_date: term_start_date || new Date().toISOString().split('T')[0],
        term_end_date,
        display_order: display_order || 0,
        social_links: social_links || {},
        is_active: true
      })
      .select('*')
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
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('position').optional().notEmpty().withMessage('Position cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
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
      .select('*')
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

// Update club patron (admin only)
router.put('/patrons/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
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

    const { data: updatedPatron, error } = await supabase
      .from('club_patrons')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Patron update error:', error);
      return res.status(500).json({ message: 'Failed to update club patron' });
    }

    if (!updatedPatron) {
      return res.status(404).json({ message: 'Club patron not found' });
    }

    res.json({
      message: 'Club patron updated successfully',
      patron: updatedPatron
    });

  } catch (error) {
    console.error('Update patron error:', error);
    res.status(500).json({ message: 'Server error while updating club patron' });
  }
});

// Delete club patron (admin only)
router.delete('/patrons/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;

    // Soft delete by setting is_active to false
    const { data: deletedPatron, error } = await supabase
      .from('club_patrons')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, title')
      .single();

    if (error) {
      console.error('Patron deletion error:', error);
      return res.status(500).json({ message: 'Failed to remove club patron' });
    }

    if (!deletedPatron) {
      return res.status(404).json({ message: 'Club patron not found' });
    }

    res.json({
      message: 'Club patron removed successfully',
      patron: deletedPatron
    });

  } catch (error) {
    console.error('Delete patron error:', error);
    res.status(500).json({ message: 'Server error while removing club patron' });
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