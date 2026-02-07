// JKUAT Innovation Club - Statistics API Routes

const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');

/**
 * GET /api/stats
 * Get real-time statistics for the homepage
 */
router.get('/', async (req, res) => {
    try {
        console.log('📊 Fetching real-time statistics...');

        // Get active members count
        const { count: activeMembersCount, error: membersError } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('membership_status', 'active');

        if (membersError) {
            console.error('❌ Error fetching active members:', membersError);
        }

        // Get projects count (from project_submissions table)
        const { count: projectsCount, error: projectsError } = await supabase
            .from('project_submissions')
            .select('id', { count: 'exact' });

        if (projectsError) {
            console.error('❌ Error fetching projects:', projectsError);
        }

        // Get industry partners count (we'll count from a partners table if it exists, or use a default)
        // First, let's check if we have any partnership-related data
        let partnersCount = 0;
        
        // Try to get partners from opportunities table (partnership category)
        const { count: opportunityPartnersCount, error: partnersError } = await supabase
            .from('opportunities')
            .select('id', { count: 'exact' })
            .eq('category', 'Partnerships');

        if (!partnersError && opportunityPartnersCount !== null) {
            partnersCount = opportunityPartnersCount;
        } else {
            // Fallback: count unique organizations from opportunities
            const { data: organizations, error: orgError } = await supabase
                .from('opportunities')
                .select('organization')
                .not('organization', 'is', null);

            if (!orgError && organizations) {
                const uniqueOrgs = new Set(organizations.map(o => o.organization));
                partnersCount = uniqueOrgs.size;
            }
        }

        // Get testimonials count
        const { count: testimonialsCount, error: testimonialsError } = await supabase
            .from('testimonials')
            .select('id', { count: 'exact' })
            .eq('is_approved', true);

        if (testimonialsError) {
            console.error('❌ Error fetching testimonials count:', testimonialsError);
        }

        // Prepare the response with real data
        const stats = {
            activeMembers: activeMembersCount || 0,
            projectsLaunched: projectsCount || 0,
            industryPartners: partnersCount || 0,
            testimonials: testimonialsCount || 0,
            timestamp: new Date().toISOString()
        };

        console.log('✅ Statistics fetched successfully:', stats);

        res.json({
            success: true,
            stats,
            message: 'Statistics retrieved successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching statistics:', error);
        
        // Return fallback stats if there's an error
        res.status(500).json({
            success: false,
            stats: {
                activeMembers: 0,
                projectsLaunched: 0,
                industryPartners: 0,
                timestamp: new Date().toISOString()
            },
            message: 'Error fetching statistics, showing fallback values',
            error: error.message
        });
    }
});

/**
 * GET /api/stats/detailed
 * Get detailed statistics breakdown
 */
router.get('/detailed', async (req, res) => {
    try {
        console.log('📊 Fetching detailed statistics...');

        // Get membership breakdown
        const { data: membershipStats, error: membershipError } = await supabase
            .from('users')
            .select('membership_status, role')
            .not('membership_status', 'is', null);

        // Get project categories breakdown
        const { data: projectStats, error: projectError } = await supabase
            .from('project_submissions')
            .select('status, category')
            .not('status', 'is', null);

        // Get events statistics
        const { count: totalEvents, error: eventsError } = await supabase
            .from('events')
            .select('id', { count: 'exact' });

        const { count: upcomingEvents, error: upcomingError } = await supabase
            .from('events')
            .select('id', { count: 'exact' })
            .eq('status', 'upcoming');

        const detailedStats = {
            membership: {
                total: membershipStats?.length || 0,
                active: membershipStats?.filter(m => m.membership_status === 'active').length || 0,
                pending: membershipStats?.filter(m => m.membership_status === 'pending').length || 0,
                expired: membershipStats?.filter(m => m.membership_status === 'expired').length || 0,
                byRole: {
                    member: membershipStats?.filter(m => m.role === 'member').length || 0,
                    admin: membershipStats?.filter(m => m.role === 'admin').length || 0,
                    super_admin: membershipStats?.filter(m => m.role === 'super_admin').length || 0
                }
            },
            projects: {
                total: projectStats?.length || 0,
                pending: projectStats?.filter(p => p.status === 'pending').length || 0,
                approved: projectStats?.filter(p => p.status === 'approved').length || 0,
                rejected: projectStats?.filter(p => p.status === 'rejected').length || 0
            },
            events: {
                total: totalEvents || 0,
                upcoming: upcomingEvents || 0
            },
            // TODO: Add testimonials stats when testimonials table is created
            testimonials: {
                total: testimonialsCount || 0,
                approved: testimonialsCount || 0,
                pending: 0 // Will be calculated when we add pending testimonials query
            },
            timestamp: new Date().toISOString()
        };

        console.log('✅ Detailed statistics fetched successfully');

        res.json({
            success: true,
            stats: detailedStats,
            message: 'Detailed statistics retrieved successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching detailed statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching detailed statistics',
            error: error.message
        });
    }
});

module.exports = router;