'use strict';

/**
 * Admin API — protected CRUD + file upload
 * Every route requires a valid Supabase Auth JWT with role=admin
 */

const express = require('express');
const router  = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ── Auth middleware ───────────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    try {
        // Verify the JWT using the anon client (validates against Supabase Auth)
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth:   { autoRefreshToken: false, persistSession: false },
        });

        const { data: { user }, error } = await client.auth.getUser();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired session.' });
        }

        // Check admin role in user metadata
        const role = user.user_metadata?.role || user.app_metadata?.role;
        if (role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        req.adminUser = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({ error: 'Authentication failed.' });
    }
}

// ── POST /api/v1/admin/verify-secret — public, no auth needed ────────────────
// Validates the ADMIN_SIGNUP_SECRET before allowing account creation.
// Rate limited to 5 attempts per IP per minute.
const secretAttempts = new Map();
router.post('/verify-secret', (req, res) => {
    const ip  = req.ip || 'unknown';
    const now = Date.now();
    const entry = secretAttempts.get(ip) || { count: 0, start: now };
    if (now - entry.start > 60000) { entry.count = 0; entry.start = now; }
    entry.count++;
    secretAttempts.set(ip, entry);

    if (entry.count > 5) {
        return res.status(429).set('Retry-After', '60').json({ error: 'Too many attempts.' });
    }

    const adminSecret = process.env.ADMIN_SIGNUP_SECRET;
    if (!adminSecret) {
        return res.status(500).json({ error: 'Admin signup is not configured.' });
    }

    const provided = String(req.body.secret || '');
    // Constant-time comparison
    const ha = require('crypto').createHash('sha256').update(provided).digest();
    const hb = require('crypto').createHash('sha256').update(adminSecret).digest();
    const valid = require('crypto').timingSafeEqual(ha, hb);

    if (!valid) return res.status(401).json({ error: 'Invalid secret.' });
    return res.json({ ok: true });
});

// Apply auth to all routes below this line
router.use(requireAdmin);
// ── File upload helper ────────────────────────────────────────────────────────
async function uploadImage(bucket, fileBuffer, fileName, mimeType) {
    const ext  = mimeType.split('/')[1] || 'jpg';
    const path = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}.${ext}`;

    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, fileBuffer, { contentType: mimeType, upsert: false });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

// ── Sanitise helper ───────────────────────────────────────────────────────────
const s = (v, max = 500) => (typeof v === 'string' ? v.trim().substring(0, max) : '');
const arr = (v) => (Array.isArray(v) ? v.map(i => String(i).trim()).filter(Boolean) : []);

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET all events (admin sees all including cancelled)
router.get('/events', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .order('start_date', { ascending: false });
        if (error) throw error;
        return res.json({ events: data || [] });
    } catch (err) {
        console.error('Admin events fetch:', err);
        return res.status(500).json({ error: 'Failed to load events.' });
    }
});

// POST create event
router.post('/events', async (req, res) => {
    try {
        const body = req.body;
        if (!body.title || !body.start_date) {
            return res.status(400).json({ error: 'title and start_date are required.' });
        }

        const payload = {
            title:       s(body.title, 200),
            description: s(body.description, 5000),
            event_type:  ['hackathon','workshop','networking','seminar','general'].includes(body.event_type) ? body.event_type : 'general',
            status:      ['upcoming','ongoing','completed','cancelled'].includes(body.status) ? body.status : 'upcoming',
            start_date:  body.start_date,
            end_date:    body.end_date || null,
            location:    s(body.location, 300),
            fee:         Math.max(0, parseInt(body.fee) || 0),
            banner_image: s(body.banner_image, 500) || null,
            video_url:   s(body.video_url, 500) || null,
            tags:        arr(body.tags),
            created_by:  req.adminUser.id,
        };

        const { data, error } = await supabaseAdmin.from('events').insert(payload).select('id').single();
        if (error) throw error;
        return res.status(201).json({ success: true, id: data.id });
    } catch (err) {
        console.error('Create event error:', err);
        return res.status(500).json({ error: 'Failed to create event.' });
    }
});

// PATCH update event
router.patch('/events/:id', async (req, res) => {
    try {
        const body = req.body;
        const updates = {};

        if (body.title)       updates.title       = s(body.title, 200);
        if (body.description !== undefined) updates.description = s(body.description, 5000);
        if (body.event_type)  updates.event_type  = body.event_type;
        if (body.status)      updates.status      = body.status;
        if (body.start_date)  updates.start_date  = body.start_date;
        if (body.end_date !== undefined) updates.end_date = body.end_date || null;
        if (body.location !== undefined) updates.location = s(body.location, 300);
        if (body.fee !== undefined)      updates.fee      = Math.max(0, parseInt(body.fee) || 0);
        if (body.banner_image !== undefined) updates.banner_image = s(body.banner_image, 500) || null;
        if (body.video_url !== undefined)    updates.video_url    = s(body.video_url, 500) || null;
        if (body.tags)        updates.tags        = arr(body.tags);

        const { error } = await supabaseAdmin.from('events').update(updates).eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
    } catch (err) {
        console.error('Update event error:', err);
        return res.status(500).json({ error: 'Failed to update event.' });
    }
});

// DELETE event
router.delete('/events/:id', async (req, res) => {
    try {
        const { error } = await supabaseAdmin.from('events').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
    } catch (err) {
        console.error('Delete event error:', err);
        return res.status(500).json({ error: 'Failed to delete event.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/articles', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return res.json({ articles: data || [] });
    } catch (err) {
        console.error('Admin articles fetch:', err);
        return res.status(500).json({ error: 'Failed to load articles.' });
    }
});

router.post('/articles', async (req, res) => {
    try {
        const body = req.body;
        if (!body.title) return res.status(400).json({ error: 'title is required.' });

        const isPublished = body.status === 'published';
        const payload = {
            title:          s(body.title, 200),
            excerpt:        s(body.excerpt, 500),
            content:        s(body.content, 50000),
            category:       ['news','article','announcement'].includes(body.category) ? body.category : 'news',
            status:         isPublished ? 'published' : 'draft',
            featured_image: s(body.featured_image, 500) || null,
            tags:           arr(body.tags),
            author_name:    s(body.author_name, 100) || 'JKUAT IEC',
            published_at:   isPublished ? new Date().toISOString() : null,
            created_by:     req.adminUser.id,
        };

        const { data, error } = await supabaseAdmin.from('articles').insert(payload).select('id').single();
        if (error) throw error;
        return res.status(201).json({ success: true, id: data.id });
    } catch (err) {
        console.error('Create article error:', err);
        return res.status(500).json({ error: 'Failed to create article.' });
    }
});

router.patch('/articles/:id', async (req, res) => {
    try {
        const body = req.body;
        const updates = {};

        if (body.title)       updates.title       = s(body.title, 200);
        if (body.excerpt !== undefined)  updates.excerpt  = s(body.excerpt, 500);
        if (body.content !== undefined)  updates.content  = s(body.content, 50000);
        if (body.category)    updates.category    = body.category;
        if (body.featured_image !== undefined) updates.featured_image = s(body.featured_image, 500) || null;
        if (body.tags)        updates.tags        = arr(body.tags);
        if (body.author_name) updates.author_name = s(body.author_name, 100);
        if (body.status) {
            updates.status = body.status;
            if (body.status === 'published') updates.published_at = new Date().toISOString();
        }

        const { error } = await supabaseAdmin.from('articles').update(updates).eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
    } catch (err) {
        console.error('Update article error:', err);
        return res.status(500).json({ error: 'Failed to update article.' });
    }
});

router.delete('/articles/:id', async (req, res) => {
    try {
        const { error } = await supabaseAdmin.from('articles').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
    } catch (err) {
        console.error('Delete article error:', err);
        return res.status(500).json({ error: 'Failed to delete article.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/projects', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return res.json({ projects: data || [] });
    } catch (err) {
        console.error('Admin projects fetch:', err);
        return res.status(500).json({ error: 'Failed to load projects.' });
    }
});

router.post('/projects', async (req, res) => {
    try {
        const body = req.body;
        if (!body.title) return res.status(400).json({ error: 'title is required.' });

        const payload = {
            title:       s(body.title, 200),
            description: s(body.description, 5000),
            category:    ['innovation','research','startup','hackathon'].includes(body.category) ? body.category : 'innovation',
            status:      ['active','completed','planning'].includes(body.status) ? body.status : 'active',
            tech_stack:  arr(body.tech_stack),
            image:       s(body.image, 500) || null,
            github_url:  s(body.github_url, 500) || null,
            demo_url:    s(body.demo_url, 500) || null,
            team_size:   Math.max(1, parseInt(body.team_size) || 1),
            created_by:  req.adminUser.id,
        };

        const { data, error } = await supabaseAdmin.from('projects').insert(payload).select('id').single();
        if (error) throw error;
        return res.status(201).json({ success: true, id: data.id });
    } catch (err) {
        console.error('Create project error:', err);
        return res.status(500).json({ error: 'Failed to create project.' });
    }
});

router.patch('/projects/:id', async (req, res) => {
    try {
        const body = req.body;
        const updates = {};

        if (body.title)       updates.title       = s(body.title, 200);
        if (body.description !== undefined) updates.description = s(body.description, 5000);
        if (body.category)    updates.category    = body.category;
        if (body.status)      updates.status      = body.status;
        if (body.tech_stack)  updates.tech_stack  = arr(body.tech_stack);
        if (body.image !== undefined)      updates.image      = s(body.image, 500) || null;
        if (body.github_url !== undefined) updates.github_url = s(body.github_url, 500) || null;
        if (body.demo_url !== undefined)   updates.demo_url   = s(body.demo_url, 500) || null;
        if (body.team_size)   updates.team_size   = Math.max(1, parseInt(body.team_size) || 1);

        const { error } = await supabaseAdmin.from('projects').update(updates).eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
    } catch (err) {
        console.error('Update project error:', err);
        return res.status(500).json({ error: 'Failed to update project.' });
    }
});

router.delete('/projects/:id', async (req, res) => {
    try {
        const { error } = await supabaseAdmin.from('projects').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
    } catch (err) {
        console.error('Delete project error:', err);
        return res.status(500).json({ error: 'Failed to delete project.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/upload/:bucket', async (req, res) => {
    const validBuckets = ['event-media', 'article-media', 'project-media'];
    const bucket = req.params.bucket;

    if (!validBuckets.includes(bucket)) {
        return res.status(400).json({ error: 'Invalid bucket.' });
    }

    try {
        // Expect raw binary body with Content-Type header set to image mime type
        const mimeType = req.headers['content-type'] || 'image/jpeg';
        if (!mimeType.startsWith('image/')) {
            return res.status(400).json({ error: 'Only image files are allowed.' });
        }

        const fileName = req.headers['x-file-name'] || 'upload';
        const chunks   = [];

        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
            try {
                const buffer = Buffer.concat(chunks);

                // 5MB limit
                if (buffer.length > 5 * 1024 * 1024) {
                    return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
                }

                const url = await uploadImage(bucket, buffer, fileName, mimeType);
                return res.json({ success: true, url });
            } catch (err) {
                console.error('Upload error:', err);
                return res.status(500).json({ error: 'Upload failed.' });
            }
        });
    } catch (err) {
        console.error('Upload route error:', err);
        return res.status(500).json({ error: 'Upload failed.' });
    }
});

module.exports = router;
