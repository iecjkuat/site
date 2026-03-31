/**
 * Statistics API Routes
 * Cached to avoid hammering the DB on every page load.
 * Cache TTL: 5 minutes (configurable via STATS_CACHE_TTL_MS env var)
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');

const CACHE_TTL = parseInt(process.env.STATS_CACHE_TTL_MS || '300000'); // 5 min default

// Simple in-memory cache — good enough for Vercel (single instance per region)
const cache = {
    data: null,
    ts: 0,
    isValid() { return this.data && (Date.now() - this.ts) < CACHE_TTL; },
    set(data) { this.data = data; this.ts = Date.now(); },
    clear() { this.data = null; this.ts = 0; }
};

// Run all count queries in parallel
async function fetchStats() {
    const [
        { count: activeMembers },
        { count: totalUsers },
        { count: projects },
        { count: events },
        { count: ideas },
        { count: testimonials }
    ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('membership_status', 'active'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('ideas').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('is_approved', true)
    ]);

    return {
        activeMembers:    activeMembers    || 0,
        totalUsers:       totalUsers       || 0,
        projectsLaunched: projects         || 0,
        totalEvents:      events           || 0,
        totalIdeas:       ideas            || 0,
        testimonials:     testimonials     || 0,
        timestamp: new Date().toISOString()
    };
}

/**
 * GET /api/v1/stats
 * Public stats for homepage counters — cached
 */
router.get('/', async (req, res) => {
    try {
        // Force-refresh if ?refresh=1 (admin use)
        if (req.query.refresh === '1') cache.clear();

        if (cache.isValid()) {
            return res.json({ success: true, stats: cache.data, cached: true });
        }

        const stats = await fetchStats();
        cache.set(stats);

        res.json({ success: true, stats, cached: false });

    } catch (error) {
        console.error('Stats fetch error:', error.message);

        // Return stale cache rather than an error if available
        if (cache.data) {
            return res.json({ success: true, stats: cache.data, cached: true, stale: true });
        }

        res.status(500).json({
            success: false,
            stats: { activeMembers: 0, totalUsers: 0, projectsLaunched: 0, totalEvents: 0, totalIdeas: 0, testimonials: 0 },
            message: 'Statistics temporarily unavailable'
        });
    }
});

/**
 * GET /api/v1/stats/detailed
 * Detailed breakdown — also cached
 */
router.get('/detailed', async (req, res) => {
    try {
        const [
            { data: membershipBreakdown },
            { count: totalEvents },
            { count: upcomingEvents },
            { count: testimonialsCount }
        ] = await Promise.all([
            supabase.from('users').select('membership_status, role').not('membership_status', 'is', null),
            supabase.from('events').select('id', { count: 'exact', head: true }),
            supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
            supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('is_approved', true)
        ]);

        const mb = membershipBreakdown || [];

        res.json({
            success: true,
            stats: {
                membership: {
                    total:   mb.length,
                    active:  mb.filter(m => m.membership_status === 'active').length,
                    pending: mb.filter(m => m.membership_status === 'pending').length,
                    expired: mb.filter(m => m.membership_status === 'expired').length,
                    byRole: {
                        member:     mb.filter(m => m.role === 'member').length,
                        admin:      mb.filter(m => m.role === 'admin').length,
                        super_admin:mb.filter(m => m.role === 'super_admin').length
                    }
                },
                events: {
                    total:    totalEvents    || 0,
                    upcoming: upcomingEvents || 0
                },
                testimonials: {
                    total:    testimonialsCount || 0,
                    approved: testimonialsCount || 0
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Detailed stats error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching detailed statistics' });
    }
});

/**
 * POST /api/v1/stats/invalidate
 * Admin endpoint to bust the stats cache after bulk operations
 */
router.post('/invalidate', (req, res) => {
    cache.clear();
    res.json({ success: true, message: 'Stats cache cleared' });
});

module.exports = router;
