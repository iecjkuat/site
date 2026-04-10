'use strict';

/**
 * Public read-only content API
 * No auth required — serves published content to the public pages
 */

const express = require('express');
const router  = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

// ── GET /api/v1/content/events ────────────────────────────────────────────────
router.get('/events', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('id,title,description,event_type,status,start_date,end_date,location,fee,banner_image,video_url,tags')
            .neq('status', 'cancelled')
            .order('start_date', { ascending: true });

        if (error) throw error;
        return res.json({ events: data || [] });
    } catch (err) {
        console.error('Events fetch error:', err);
        return res.status(500).json({ error: 'Failed to load events.' });
    }
});

// ── GET /api/v1/content/articles ──────────────────────────────────────────────
router.get('/articles', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('id,title,excerpt,category,featured_image,tags,author_name,published_at')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) throw error;
        return res.json({ articles: data || [] });
    } catch (err) {
        console.error('Articles fetch error:', err);
        return res.status(500).json({ error: 'Failed to load articles.' });
    }
});

// ── GET /api/v1/content/articles/:id ─────────────────────────────────────────
router.get('/articles/:id', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .eq('id', req.params.id)
            .eq('status', 'published')
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Article not found.' });
        return res.json({ article: data });
    } catch (err) {
        console.error('Article fetch error:', err);
        return res.status(500).json({ error: 'Failed to load article.' });
    }
});

// ── GET /api/v1/content/projects ──────────────────────────────────────────────
router.get('/projects', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('id,title,description,category,status,tech_stack,image,github_url,demo_url,team_size')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json({ projects: data || [] });
    } catch (err) {
        console.error('Projects fetch error:', err);
        return res.status(500).json({ error: 'Failed to load projects.' });
    }
});

module.exports = router;
