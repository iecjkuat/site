const express = require('express');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// Middleware to check admin access
const requireAdmin = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    // In a real app, you'd verify the JWT token here
    // For now, we'll assume the user is authenticated and check their role
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'User ID required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Get comprehensive dashboard analytics
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    const { data, error } = await supabase
      .rpc('get_admin_dashboard_analytics', {
        start_date,
        end_date
      });

    if (error) {
      console.error('Error fetching dashboard analytics:', error);
      return res.status(500).json({ message: 'Failed to fetch analytics' });
    }

    res.json(data[0] || {});
  } catch (error) {
    console.error('Error in dashboard analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get membership statistics
router.get('/membership', requireAdmin, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    const { data, error } = await supabase
      .rpc('get_membership_statistics', {
        start_date,
        end_date
      });

    if (error) {
      console.error('Error fetching membership statistics:', error);
      return res.status(500).json({ message: 'Failed to fetch membership statistics' });
    }

    res.json(data[0] || {});
  } catch (error) {
    console.error('Error in membership analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event analytics
router.get('/events', requireAdmin, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    const { data, error } = await supabase
      .rpc('get_event_analytics', {
        start_date,
        end_date
      });

    if (error) {
      console.error('Error fetching event analytics:', error);
      return res.status(500).json({ message: 'Failed to fetch event analytics' });
    }

    res.json(data[0] || {});
  } catch (error) {
    console.error('Error in event analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment analytics
router.get('/payments', requireAdmin, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    const { data, error } = await supabase
      .rpc('get_payment_analytics', {
        start_date,
        end_date
      });

    if (error) {
      console.error('Error fetching payment analytics:', error);
      return res.status(500).json({ message: 'Failed to fetch payment analytics' });
    }

    res.json(data[0] || {});
  } catch (error) {
    console.error('Error in payment analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get engagement analytics
router.get('/engagement', requireAdmin, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    const { data, error } = await supabase
      .rpc('get_engagement_analytics', {
        start_date,
        end_date
      });

    if (error) {
      console.error('Error fetching engagement analytics:', error);
      return res.status(500).json({ message: 'Failed to fetch engagement analytics' });
    }

    res.json(data[0] || {});
  } catch (error) {
    console.error('Error in engagement analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feedback analytics
router.get('/feedback', requireAdmin, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    const { data, error } = await supabase
      .rpc('get_feedback_analytics', {
        start_date,
        end_date
      });

    if (error) {
      console.error('Error fetching feedback analytics:', error);
      return res.status(500).json({ message: 'Failed to fetch feedback analytics' });
    }

    res.json(data[0] || {});
  } catch (error) {
    console.error('Error in feedback analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ideas analytics
router.get('/ideas', requireAdmin, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    const { data, error } = await supabase
      .rpc('get_ideas_analytics', {
        start_date,
        end_date
      });

    if (error) {
      console.error('Error fetching ideas analytics:', error);
      return res.status(500).json({ message: 'Failed to fetch ideas analytics' });
    }

    res.json(data[0] || {});
  } catch (error) {
    console.error('Error in ideas analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track page view (for analytics)
router.post('/track/view', async (req, res) => {
  try {
    const {
      page_path,
      page_title,
      session_id,
      user_id,
      duration_seconds,
      referrer
    } = req.body;

    const { error } = await supabase
      .from('analytics_views')
      .insert({
        user_id: user_id || null,
        page_path,
        page_title,
        session_id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        referrer,
        duration_seconds
      });

    if (error) {
      console.error('Error tracking page view:', error);
      return res.status(500).json({ message: 'Failed to track view' });
    }

    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error in view tracking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start user session
router.post('/track/session/start', async (req, res) => {
  try {
    const {
      user_id,
      session_id,
      device_type,
      browser,
      os
    } = req.body;

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user_id || null,
        session_id,
        device_type,
        browser,
        os,
        ip_address: req.ip
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return res.status(500).json({ message: 'Failed to start session' });
    }

    res.json({ session: data });
  } catch (error) {
    console.error('Error in session start:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End user session
router.post('/track/session/end', async (req, res) => {
  try {
    const {
      session_id,
      pages_visited,
      actions_performed
    } = req.body;

    const { error } = await supabase
      .from('user_sessions')
      .update({
        end_time: new Date().toISOString(),
        duration_minutes: supabase.raw('EXTRACT(EPOCH FROM (NOW() - start_time)) / 60'),
        pages_visited,
        actions_performed
      })
      .eq('session_id', session_id);

    if (error) {
      console.error('Error ending session:', error);
      return res.status(500).json({ message: 'Failed to end session' });
    }

    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    console.error('Error in session end:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report templates
router.get('/reports/templates', requireAdmin, async (req, res) => {
  try {
    const { data: templates, error } = await supabase
      .from('report_templates')
      .select(`
        *,
        created_by_user:users!report_templates_created_by_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching report templates:', error);
      return res.status(500).json({ message: 'Failed to fetch report templates' });
    }

    res.json({ templates });
  } catch (error) {
    console.error('Error in report templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create report template
router.post('/reports/templates', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      report_type,
      filters,
      chart_config,
      is_public
    } = req.body;

    const { data: template, error } = await supabase
      .from('report_templates')
      .insert({
        name,
        description,
        report_type,
        filters,
        chart_config,
        is_public,
        created_by: req.userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report template:', error);
      return res.status(500).json({ message: 'Failed to create report template' });
    }

    res.status(201).json({ template });
  } catch (error) {
    console.error('Error in report template creation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export analytics data
router.get('/export/:type', requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { 
      format = 'json',
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'membership':
        const { data: membershipData } = await supabase.rpc('get_membership_statistics', { start_date, end_date });
        data = membershipData[0];
        filename = `membership-analytics-${start_date}-to-${end_date}`;
        break;
      
      case 'events':
        const { data: eventsData } = await supabase.rpc('get_event_analytics', { start_date, end_date });
        data = eventsData[0];
        filename = `events-analytics-${start_date}-to-${end_date}`;
        break;
      
      case 'payments':
        const { data: paymentsData } = await supabase.rpc('get_payment_analytics', { start_date, end_date });
        data = paymentsData[0];
        filename = `payments-analytics-${start_date}-to-${end_date}`;
        break;
      
      case 'dashboard':
        const { data: dashboardData } = await supabase.rpc('get_admin_dashboard_analytics', { start_date, end_date });
        data = dashboardData[0];
        filename = `dashboard-analytics-${start_date}-to-${end_date}`;
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert JSON to CSV (simplified)
      const csv = Object.entries(data)
        .map(([key, value]) => `${key},${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(data);
    }
  } catch (error) {
    console.error('Error in analytics export:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;