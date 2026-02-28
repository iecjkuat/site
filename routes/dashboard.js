/**
 * JKUAT Innovation Club - Dashboard API Routes
 * Provides aggregated data for user dashboard
 */

const express = require('express');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/dashboard/overview
 * Get dashboard overview data for authenticated user
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('📊 Fetching dashboard overview for user:', userId);

    // Fetch user's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, description, category, status, progress_percentage, created_at')
      .eq('project_lead_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    }

    // Fetch user's ideas
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('id, title, description, status, votes_count, comments_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (ideasError) {
      console.error('Error fetching ideas:', ideasError);
    }

    // Fetch user's payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, currency, payment_type, payment_method, status, created_at, description')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    // Fetch user's notifications (unread)
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, type, title, message, priority, created_at, read_at, action_url, action_text')
      .eq('user_id', userId)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
    }

    // Get counts
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('project_lead_id', userId);

    const { count: ideasCount } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: unreadNotificationsCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    console.log('✅ Dashboard data fetched:', {
      projects: projects?.length || 0,
      ideas: ideas?.length || 0,
      payments: payments?.length || 0,
      notifications: notifications?.length || 0
    });

    res.json({
      projects: projects || [],
      ideas: ideas || [],
      payments: payments || [],
      notifications: notifications || [],
      counts: {
        projects: projectsCount || 0,
        ideas: ideasCount || 0,
        unreadNotifications: unreadNotificationsCount || 0
      }
    });

  } catch (error) {
    console.error('Error in GET /dashboard/overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/dashboard/stats
 * Get user statistics for dashboard
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get project stats
    const { data: projectStats } = await supabase
      .from('projects')
      .select('status')
      .eq('project_lead_id', userId);

    const activeProjects = projectStats?.filter(p => p.status === 'Active').length || 0;
    const completedProjects = projectStats?.filter(p => p.status === 'Completed').length || 0;

    // Get idea stats
    const { data: ideaStats } = await supabase
      .from('ideas')
      .select('votes_count, comments_count')
      .eq('user_id', userId);

    const totalVotes = ideaStats?.reduce((sum, idea) => sum + (idea.votes_count || 0), 0) || 0;
    const totalComments = ideaStats?.reduce((sum, idea) => sum + (idea.comments_count || 0), 0) || 0;

    // Get payment stats
    const { data: paymentStats } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const totalPaid = paymentStats?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0;

    res.json({
      projects: {
        total: projectStats?.length || 0,
        active: activeProjects,
        completed: completedProjects
      },
      ideas: {
        total: ideaStats?.length || 0,
        totalVotes,
        totalComments
      },
      payments: {
        total: paymentStats?.length || 0,
        totalAmount: totalPaid
      }
    });

  } catch (error) {
    console.error('Error in GET /dashboard/stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
