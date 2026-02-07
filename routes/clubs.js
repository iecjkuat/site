const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const router = express.Router();

// Get all active clubs
router.get('/', async (req, res) => {
  try {
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select(`
        id, name, short_name, description, email, phone, website, faculty, 
        status, established_date, member_count, created_at
      `)
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching clubs:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(clubs || []);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get club by ID or shortName
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    let query = supabase
      .from('clubs')
      .select(`
        id, name, short_name, description, email, phone, website, faculty,
        advisor_name, advisor_email, status, established_date, member_count,
        settings, theme, created_at, updated_at
      `);
    
    if (uuidRegex.test(identifier)) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('short_name', identifier.toUpperCase());
    }
    
    const { data: club, error } = await query.single();
    
    if (error || !club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id);

    // Get event count
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id);

    const clubWithStats = {
      ...club,
      stats: {
        totalMembers: memberCount || 0,
        totalEvents: eventCount || 0
      }
    };

    res.json(clubWithStats);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new club
router.post('/register', [
  body('name').notEmpty().withMessage('Club name is required'),
  body('shortName').isLength({ min: 2, max: 10 }).withMessage('Short name must be 2-10 characters'),
  body('description').notEmpty().withMessage('Description is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('faculty').notEmpty().withMessage('Faculty is required'),
  body('advisorName').notEmpty().withMessage('Faculty advisor name is required'),
  body('advisorEmail').isEmail().withMessage('Valid advisor email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, shortName, description, email, phone, website,
      faculty, advisorName, advisorEmail, membershipFee
    } = req.body;

    // Check if club already exists
    const { data: existingClubs } = await supabase
      .from('clubs')
      .select('id')
      .or(`email.eq.${email},short_name.eq.${shortName.toUpperCase()},name.eq.${name}`);

    if (existingClubs && existingClubs.length > 0) {
      return res.status(400).json({
        message: 'Club already exists with this name, short name, or email'
      });
    }

    // Create new club
    const { data: club, error: createError } = await supabase
      .from('clubs')
      .insert({
        name,
        short_name: shortName.toUpperCase(),
        description,
        email,
        phone,
        website,
        faculty,
        advisor_name: advisorName,
        advisor_email: advisorEmail,
        settings: {
          membershipFee: membershipFee || 0,
          allowSelfRegistration: true,
          requireApproval: false,
          features: {
            events: true,
            payments: true,
            messaging: true,
            ideasHub: true,
            resources: true,
            opportunities: true,
            support: true
          }
        },
        status: 'pending' // Default status
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase create error:', createError);
      throw createError;
    }

    res.status(201).json({
      message: 'Club registration submitted successfully. Awaiting approval.',
      club: {
        id: club.id,
        name: club.name,
        shortName: club.short_name
      }
    });
  } catch (error) {
    console.error('Club registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Update club settings (admin only)
router.put('/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: club, error: fetchError } = await supabase
      .from('clubs')
      .select('settings')
      .eq('id', id)
      .single();

    if (fetchError || !club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Merge settings
    const updatedSettings = {
      ...club.settings,
      ...updates.settings
    };

    const updateData = {
      settings: updatedSettings
    };

    if (updates.theme) {
      updateData.theme = updates.theme;
    }

    const { data: updatedClub, error: updateError } = await supabase
      .from('clubs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }

    res.json({
      message: 'Club settings updated successfully',
      club: updatedClub
    });
  } catch (error) {
    console.error('Error updating club settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get club members
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get members with pagination
    const { data: members, count, error } = await supabase
      .from('users')
      .select(`
        id, name, email, registration_number, course, year_of_study, college,
        membership_status, role, created_at,
        club:clubs(name, short_name)
      `, { count: 'exact' })
      .eq('club_id', id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    // Map fields to match expected local format (camelCase)
    const formattedMembers = members.map(m => ({
      ...m,
      registrationNumber: m.registration_number,
      yearOfStudy: m.year_of_study,
      membershipStatus: m.membership_status,
      club: m.club // relational data might come as array or object depending on One-to-One vs One-to-Many
    }));

    res.json({
      members: formattedMembers,
      pagination: {
        current: page,
        total: Math.ceil(count / limit),
        count: members.length,
        totalMembers: count
      }
    });
  } catch (error) {
    console.error('Error fetching club members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get club statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id')
      .eq('id', id)
      .single();

    if (clubError || !club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Fetch raw data to aggregate (Supabase doesn't do complex GROUP BY easily)
    // For scalability, this should be done with RPC or Views, but for now we fetch minimal data
    
    // 1. Users Stats
    const { data: users } = await supabase
      .from('users')
      .select('membership_status, year_of_study, college')
      .eq('club_id', id);

    // 2. Event Stats
    const { data: events } = await supabase
      .from('events')
      .select('status')
      .eq('club_id', id);

    // 3. Payment Stats
    const { data: payments } = await supabase
      .from('payments') // Assuming table name
      .select('status, amount')
      .eq('club_id', id);

    // Aggregation Helpers
    const countBy = (arr, key) => {
      return arr.reduce((acc, item) => {
        const val = item[key] || 'Unknown';
        if (!acc[val]) acc[val] = 0;
        acc[val]++;
        return acc;
      }, {});
    };

    const membersByStatus = countBy(users || [], 'membership_status');
    const membersByYear = countBy(users || [], 'year_of_study');
    const membersByCollege = countBy(users || [], 'college');
    const eventsByStatusMap = countBy(events || [], 'status');
    const paymentsByStatusMap = countBy(payments || [], 'status');

    // Calculate Totals
    const totalMembers = (users || []).length;
    const totalEvents = (events || []).length;
    const totalRevenue = (payments || [])
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Format for response
    const formatStats = (map, keyName) => Object.keys(map).map(k => ({ [keyName]: k, count: map[k] }));
    const formatPaymentStats = (map) => Object.keys(map).map(k => ({
       status: k, 
       count: map[k], 
       totalAmount: (payments || []).filter(p => p.status === k).reduce((s, p) => s + (Number(p.amount) || 0), 0)
    }));

    const stats = {
      basic: {
        totalMembers,
        totalEvents,
        totalRevenue
      },
      detailed: {
        membersByStatus: formatStats(membersByStatus, 'status'),
        membersByYear: formatStats(membersByYear, 'year'),
        membersByCollege: formatStats(membersByCollege, 'college'),
        eventsByStatus: formatStats(eventsByStatusMap, 'status'),
        paymentsByStatus: formatPaymentStats(paymentsByStatusMap)
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching club stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject club (super admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
    // Case-insensitive check
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get current settings first if reason is provided
    let updateData = { status: status.toLowerCase() }; // Supabase often uses lowercase enums
    
    if (reason) {
      const { data: club } = await supabase
        .from('clubs')
        .select('settings')
        .eq('id', id)
        .single();
        
      if (club) {
        updateData.settings = {
          ...club.settings,
          statusReason: reason
        };
      }
    }

    const { data: updatedClub, error } = await supabase
      .from('clubs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: `Club status updated to ${status}`,
      club: updatedClub
    });
  } catch (error) {
    console.error('Error updating club status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search clubs
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // Perform search
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*, users(count), events(count)')
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,short_name.ilike.%${query}%,description.ilike.%${query}%,faculty.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    const clubsWithStats = clubs.map(club => ({
      ...club,
      stats: {
        totalMembers: club.users ? club.users[0]?.count : 0, // Approx count if using head/count
        totalEvents: club.events ? club.events[0]?.count : 0
      }
    }));

    res.json(clubsWithStats);
  } catch (error) {
    console.error('Error searching clubs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;