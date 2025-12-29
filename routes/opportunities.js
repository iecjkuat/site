const express = require('express');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// Get all opportunities
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      location, 
      status = 'active',
      search,
      featured,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    let query = supabase
      .from('opportunities')
      .select(`
        *,
        category:opportunity_categories(name, icon, color),
        applications:opportunity_applications(count),
        bookmarks:opportunity_bookmarks(count)
      `)
      .eq('status', status);

    // Apply filters
    if (type) {
      query = query.eq('opportunity_type', type);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,organization.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: opportunities, error, count } = await query;

    if (error) {
      console.error('Error fetching opportunities:', error);
      return res.status(500).json({ message: 'Failed to fetch opportunities' });
    }

    // Add computed fields
    const opportunitiesWithStatus = opportunities.map(opportunity => ({
      ...opportunity,
      isExpired: opportunity.application_deadline && new Date() > new Date(opportunity.application_deadline),
      daysUntilDeadline: opportunity.application_deadline 
        ? Math.ceil((new Date(opportunity.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json({
      opportunities: opportunitiesWithStatus,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: opportunities.length,
        totalOpportunities: count
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get opportunity by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        category:opportunity_categories(name, icon, color),
        created_by_user:users!opportunities_created_by_fkey(name, email),
        applications:opportunity_applications(
          id,
          application_status,
          submitted_at,
          user:users(name, email)
        ),
        bookmarks:opportunity_bookmarks(user_id)
      `)
      .eq('id', id)
      .single();

    if (error || !opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Track view if user is provided
    if (userId) {
      await supabase
        .from('opportunity_views')
        .insert({
          opportunity_id: id,
          user_id: userId,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
    }

    // Check if user has applied or bookmarked
    let userApplication = null;
    let isBookmarked = false;

    if (userId) {
      const { data: application } = await supabase
        .from('opportunity_applications')
        .select('*')
        .eq('opportunity_id', id)
        .eq('user_id', userId)
        .single();

      const { data: bookmark } = await supabase
        .from('opportunity_bookmarks')
        .select('id')
        .eq('opportunity_id', id)
        .eq('user_id', userId)
        .single();

      userApplication = application;
      isBookmarked = !!bookmark;
    }

    const opportunityWithStatus = {
      ...opportunity,
      isExpired: opportunity.application_deadline && new Date() > new Date(opportunity.application_deadline),
      daysUntilDeadline: opportunity.application_deadline 
        ? Math.ceil((new Date(opportunity.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null,
      userApplication,
      isBookmarked
    };

    res.json(opportunityWithStatus);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to opportunity
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      userId, 
      coverLetter, 
      resumeUrl, 
      portfolioUrl, 
      customResponses = {} 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if opportunity exists and is active
    const { data: opportunity, error: opportunityError } = await supabase
      .from('opportunities')
      .select('id, status, application_deadline')
      .eq('id', id)
      .single();

    if (opportunityError || !opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.status !== 'active') {
      return res.status(400).json({ message: 'Opportunity is not active' });
    }

    if (opportunity.application_deadline && new Date() > new Date(opportunity.application_deadline)) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if user has already applied
    const { data: existingApplication } = await supabase
      .from('opportunity_applications')
      .select('id')
      .eq('opportunity_id', id)
      .eq('user_id', userId)
      .single();

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this opportunity' });
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from('opportunity_applications')
      .insert({
        opportunity_id: id,
        user_id: userId,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
        portfolio_url: portfolioUrl,
        custom_responses: customResponses
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return res.status(500).json({ message: 'Failed to submit application' });
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error applying to opportunity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bookmark/unbookmark opportunity
router.post('/:id/bookmark', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if already bookmarked
    const { data: existingBookmark } = await supabase
      .from('opportunity_bookmarks')
      .select('id')
      .eq('opportunity_id', id)
      .eq('user_id', userId)
      .single();

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from('opportunity_bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (error) {
        return res.status(500).json({ message: 'Failed to remove bookmark' });
      }

      res.json({ message: 'Bookmark removed', bookmarked: false });
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('opportunity_bookmarks')
        .insert({
          opportunity_id: id,
          user_id: userId
        });

      if (error) {
        return res.status(500).json({ message: 'Failed to add bookmark' });
      }

      res.json({ message: 'Opportunity bookmarked', bookmarked: true });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get opportunities by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20, status = 'active' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: opportunities, error, count } = await supabase
      .from('opportunities')
      .select(`
        *,
        category:opportunity_categories(name, icon, color)
      `)
      .eq('opportunity_type', type)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching opportunities by type:', error);
      return res.status(500).json({ message: 'Failed to fetch opportunities' });
    }

    const opportunitiesWithStatus = opportunities.map(opportunity => ({
      ...opportunity,
      isExpired: opportunity.application_deadline && new Date() > new Date(opportunity.application_deadline),
      daysUntilDeadline: opportunity.application_deadline 
        ? Math.ceil((new Date(opportunity.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json({
      type,
      opportunities: opportunitiesWithStatus,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: opportunities.length,
        totalOpportunities: count
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search opportunities
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20, status = 'active' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: opportunities, error, count } = await supabase
      .from('opportunities')
      .select(`
        *,
        category:opportunity_categories(name, icon, color)
      `)
      .eq('status', status)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,organization.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Error searching opportunities:', error);
      return res.status(500).json({ message: 'Failed to search opportunities' });
    }

    const opportunitiesWithStatus = opportunities.map(opportunity => ({
      ...opportunity,
      isExpired: opportunity.application_deadline && new Date() > new Date(opportunity.application_deadline),
      daysUntilDeadline: opportunity.application_deadline 
        ? Math.ceil((new Date(opportunity.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json({
      query,
      opportunities: opportunitiesWithStatus,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: opportunities.length,
        totalOpportunities: count
      }
    });
  } catch (error) {
    console.error('Error searching opportunities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get urgent opportunities (deadline within 7 days)
router.get('/urgent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        category:opportunity_categories(name, icon, color)
      `)
      .eq('status', 'active')
      .not('application_deadline', 'is', null)
      .gte('application_deadline', new Date().toISOString())
      .lte('application_deadline', sevenDaysFromNow.toISOString())
      .order('application_deadline', { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching urgent opportunities:', error);
      return res.status(500).json({ message: 'Failed to fetch urgent opportunities' });
    }

    const opportunitiesWithStatus = opportunities.map(opportunity => ({
      ...opportunity,
      isExpired: false,
      daysUntilDeadline: Math.ceil((new Date(opportunity.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      opportunities: opportunitiesWithStatus,
      count: opportunities.length
    });
  } catch (error) {
    console.error('Error fetching urgent opportunities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent opportunities
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        category:opportunity_categories(name, icon, color)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching recent opportunities:', error);
      return res.status(500).json({ message: 'Failed to fetch recent opportunities' });
    }

    const opportunitiesWithStatus = opportunities.map(opportunity => ({
      ...opportunity,
      isExpired: opportunity.application_deadline && new Date() > new Date(opportunity.application_deadline),
      daysUntilDeadline: opportunity.application_deadline 
        ? Math.ceil((new Date(opportunity.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json({
      opportunities: opportunitiesWithStatus,
      count: opportunities.length
    });
  } catch (error) {
    console.error('Error fetching recent opportunities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get opportunity statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .rpc('get_opportunity_statistics');

    if (error) {
      console.error('Error fetching opportunity statistics:', error);
      return res.status(500).json({ message: 'Failed to fetch statistics' });
    }

    res.json(stats[0] || {
      total_opportunities: 0,
      active_opportunities: 0,
      expired_opportunities: 0,
      total_applications: 0,
      opportunities_by_type: {},
      top_organizations: []
    });
  } catch (error) {
    console.error('Error fetching opportunity statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get opportunity categories
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('opportunity_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ message: 'Failed to fetch categories' });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's applications
router.get('/user/:userId/applications', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    let query = supabase
      .from('opportunity_applications')
      .select(`
        *,
        opportunity:opportunities(
          id,
          title,
          organization,
          opportunity_type,
          application_deadline,
          status
        )
      `)
      .eq('user_id', userId);

    if (status) {
      query = query.eq('application_status', status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Error fetching user applications:', error);
      return res.status(500).json({ message: 'Failed to fetch applications' });
    }

    res.json({
      applications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: applications.length,
        totalApplications: count
      }
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookmarks
router.get('/user/:userId/bookmarks', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: bookmarks, error, count } = await supabase
      .from('opportunity_bookmarks')
      .select(`
        *,
        opportunity:opportunities(
          *,
          category:opportunity_categories(name, icon, color)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching user bookmarks:', error);
      return res.status(500).json({ message: 'Failed to fetch bookmarks' });
    }

    res.json({
      bookmarks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count: bookmarks.length,
        totalBookmarks: count
      }
    });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommendations for user
router.get('/user/:userId/recommendations', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const { data: recommendations, error } = await supabase
      .rpc('get_opportunity_recommendations', {
        user_uuid: userId,
        limit_count: parseInt(limit)
      });

    if (error) {
      console.error('Error fetching recommendations:', error);
      return res.status(500).json({ message: 'Failed to fetch recommendations' });
    }

    res.json({
      recommendations: recommendations || [],
      count: recommendations?.length || 0
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;