'use strict';

// ── Supabase client — fetched from server API (works on Vercel + localhost) ───
let sb      = null;
let session = null;
let activePanel    = 'events';
let editingId      = null;
let deleteCallback = null;

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
    try {
        const res = await fetch('/api/v1/admin/config');
        const cfg = await res.json();

        if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
            throw new Error('Supabase config missing from server.');
        }

        sb = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

        const { data } = await sb.auth.getSession();
        if (!data.session) { window.location.href = '/iec-admin'; return; }

        const role = data.session.user?.user_metadata?.role || data.session.user?.app_metadata?.role;
        if (role !== 'admin') { await sb.auth.signOut(); window.location.href = '/iec-admin'; return; }

        session = data.session;
        bindNav();
        loadPanel('events');

    } catch (err) {
        console.error('Dashboard init failed:', err);
        document.body.innerHTML = `<div style="color:#fca5a5;padding:2rem;font-family:sans-serif;">
            Dashboard error: ${err.message}<br><a href="/iec-admin" style="color:#10b981;">Back to login</a>
        </div>`;
    }
})();

// ── Auth header ───────────────────────────────────────────────────────────────
function authHeaders() {
    return {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
}

// ── Navigation ────────────────────────────────────────────────────────────────
function bindNav() {
    document.querySelectorAll('.nav-item[data-panel]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activePanel = btn.dataset.panel;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${activePanel}`).classList.add('active');
            const labels = { events: 'Events', articles: 'Blog', projects: 'Projects' };
            const creates = { events: 'New Event', articles: 'New Post', projects: 'New Project' };
            document.getElementById('panelTitle').textContent  = labels[activePanel];
            document.getElementById('createLabel').textContent = creates[activePanel];
            loadPanel(activePanel);
        });
    });

    document.getElementById('createBtn').addEventListener('click', () => openCreate(activePanel));
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await sb.auth.signOut();
        window.location.href = '/iec-admin';
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', e => {
        if (e.target === document.getElementById('modal')) closeModal();
    });
}

// ── Load panel data ───────────────────────────────────────────────────────────
async function loadPanel(panel) {
    showLoading(panel);
    try {
        const res  = await fetch(`/api/v1/admin/${panel}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        renderList(panel, data[panel] || []);
    } catch (err) {
        console.error(`Load ${panel} error:`, err);
        showEmpty(panel);
    }
}

// ── Render lists ──────────────────────────────────────────────────────────────
function renderList(panel, items) {
    const list = document.getElementById(`${panel}-list`);
    document.getElementById(`${panel}-loading`).style.display = 'none';

    if (!items.length) { showEmpty(panel); return; }

    document.getElementById(`${panel}-empty`).style.display = 'none';
    list.innerHTML = items.map(item => renderItem(panel, item)).join('');

    list.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => openEdit(panel, btn.dataset.edit));
    });
    list.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(panel, btn.dataset.delete, btn.dataset.title));
    });
}

function renderItem(panel, item) {
    const thumb = item.banner_image || item.featured_image || item.image;
    const thumbHtml = thumb
        ? `<div class="content-item-thumb"><img src="${thumb}" alt=""></div>`
        : `<div class="content-item-thumb"><i class="fas fa-${panel === 'events' ? 'calendar' : panel === 'articles' ? 'newspaper' : 'rocket'}"></i></div>`;

    let meta = '';
    let badge = '';

    if (panel === 'events') {
        const d = item.start_date ? new Date(item.start_date).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' }) : '—';
        meta  = `${d}${item.location ? ' · ' + item.location : ''}${item.fee > 0 ? ' · KES ' + item.fee : ' · Free'}`;
        badge = statusBadge(item.status, { upcoming:'green', ongoing:'blue', completed:'gray', cancelled:'red' });
    } else if (panel === 'articles') {
        const d = item.published_at ? new Date(item.published_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' }) : 'Draft';
        meta  = `${item.category} · ${d} · ${item.author_name}`;
        badge = statusBadge(item.status, { published:'green', draft:'yellow' });
    } else {
        meta  = `${item.category} · ${item.tech_stack?.slice(0,3).join(', ') || '—'}`;
        badge = statusBadge(item.status, { active:'green', planning:'yellow', completed:'gray' });
    }

    return `
    <div class="content-item">
        ${thumbHtml}
        <div class="content-item-info">
            <div class="content-item-title">${item.title}</div>
            <div class="content-item-meta">${badge} ${meta}</div>
        </div>
        <div class="content-item-actions">
            <button class="btn btn-secondary btn-icon" data-edit="${item.id}" title="Edit">
                <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-danger btn-icon" data-delete="${item.id}" data-title="${item.title}" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>`;
}

function statusBadge(status, map) {
    const cls = map[status] || 'gray';
    return `<span class="badge badge-${cls}">${status}</span>`;
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(title) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalAlert').style.display = 'none';
    document.getElementById('modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = '';
    editingId = null;
}

function showModalAlert(msg, type = 'error') {
    const el = document.getElementById('modalAlert');
    el.className = type === 'success' ? 'alert-success' : 'form-error';
    el.textContent = msg;
    el.style.display = 'block';
}

// ── Create ────────────────────────────────────────────────────────────────────
function openCreate(panel) {
    editingId = null;
    const titles = { events: 'New Event', articles: 'New Blog Post', projects: 'New Project' };
    openModal(titles[panel]);
    document.getElementById('modalBody').innerHTML = buildForm(panel, null);
    bindFormEvents(panel);
}

// ── Edit ──────────────────────────────────────────────────────────────────────
async function openEdit(panel, id) {
    editingId = id;
    openModal('Edit');
    document.getElementById('modalBody').innerHTML = '<div class="spinner"></div>';

    try {
        const res  = await fetch(`/api/v1/admin/${panel}`, { headers: authHeaders() });
        const data = await res.json();
        const item = (data[panel] || []).find(i => i.id === id);
        if (!item) throw new Error('Not found');

        document.getElementById('modalTitle').textContent = `Edit ${panel === 'articles' ? 'Post' : panel.slice(0,-1).charAt(0).toUpperCase() + panel.slice(0,-1).slice(1)}`;
        document.getElementById('modalBody').innerHTML = buildForm(panel, item);
        bindFormEvents(panel);
    } catch (err) {
        showModalAlert('Failed to load item.');
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────
function confirmDelete(panel, id, title) {
    document.getElementById('confirmModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    deleteCallback = async () => {
        const res = await fetch(`/api/v1/admin/${panel}/${id}`, {
            method: 'DELETE', headers: authHeaders()
        });
        closeConfirm();
        if (res.ok) loadPanel(panel);
        else showModalAlert('Delete failed.');
    };
    document.getElementById('confirmDeleteBtn').onclick = deleteCallback;
}

function closeConfirm() {
    document.getElementById('confirmModal').style.display = 'none';
    document.body.style.overflow = '';
}

// ── Form builder ──────────────────────────────────────────────────────────────
function buildForm(panel, item) {
    const v = (key, fallback = '') => item ? (item[key] ?? fallback) : fallback;
    const arr = (key) => item ? (item[key] || []).join(', ') : '';

    if (panel === 'events') return `
        <form id="contentForm">
            <div class="field"><label>Title *</label>
                <input name="title" required value="${v('title')}" placeholder="Event title"></div>
            <div class="field"><label>Description</label>
                <textarea name="description" rows="3" placeholder="What is this event about?">${v('description')}</textarea></div>
            <div class="field-row">
                <div class="field"><label>Type</label>
                    <select name="event_type">
                        ${['hackathon','workshop','networking','seminar','general'].map(t =>
                            `<option value="${t}" ${v('event_type','general')===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`
                        ).join('')}
                    </select></div>
                <div class="field"><label>Status</label>
                    <select name="status">
                        ${['upcoming','ongoing','completed','cancelled'].map(t =>
                            `<option value="${t}" ${v('status','upcoming')===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`
                        ).join('')}
                    </select></div>
            </div>
            <div class="field-row">
                <div class="field"><label>Start Date *</label>
                    <input type="datetime-local" name="start_date" required value="${v('start_date','').slice(0,16)}"></div>
                <div class="field"><label>End Date</label>
                    <input type="datetime-local" name="end_date" value="${v('end_date','').slice(0,16)}"></div>
            </div>
            <div class="field-row">
                <div class="field"><label>Location</label>
                    <input name="location" value="${v('location')}" placeholder="e.g. JKUAT Main Hall"></div>
                <div class="field"><label>Fee (KES)</label>
                    <input type="number" name="fee" min="0" value="${v('fee',0)}" placeholder="0 = Free"></div>
            </div>
            <div class="field"><label>Banner Image</label>
                <div class="upload-area" id="uploadArea">
                    <input type="file" accept="image/*" id="imageFile" data-bucket="event-media">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Click to upload image (max 5MB)</p>
                </div>
                <img id="imagePreview" class="upload-preview" src="${v('banner_image')}" ${v('banner_image')?'style="display:block"':''}>
                <input type="hidden" name="banner_image" id="imageUrl" value="${v('banner_image')}">
            </div>
            <div class="field"><label>Video URL <span style="opacity:.5;font-weight:400;">(YouTube / Google Drive)</span></label>
                <input name="video_url" value="${v('video_url')}" placeholder="https://youtube.com/watch?v=..."></div>
            <div class="field"><label>Tags <span style="opacity:.5;font-weight:400;">(comma separated)</span></label>
                <input name="tags" value="${arr('tags')}" placeholder="hackathon, innovation, tech"></div>
            <div id="formError" class="form-error" style="display:none;"></div>
            <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.25rem;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="submitBtn">
                    <i class="fas fa-save"></i> Save Event
                </button>
            </div>
        </form>`;

    if (panel === 'articles') return `
        <form id="contentForm">
            <div class="field"><label>Title *</label>
                <input name="title" required value="${v('title')}" placeholder="Post title"></div>
            <div class="field-row">
                <div class="field"><label>Category</label>
                    <select name="category">
                        ${['news','article','announcement'].map(t =>
                            `<option value="${t}" ${v('category','news')===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`
                        ).join('')}
                    </select></div>
                <div class="field"><label>Status</label>
                    <select name="status">
                        <option value="draft" ${v('status','draft')==='draft'?'selected':''}>Draft</option>
                        <option value="published" ${v('status')==='published'?'selected':''}>Published</option>
                    </select></div>
            </div>
            <div class="field"><label>Author Name</label>
                <input name="author_name" value="${v('author_name','JKUAT IEC')}" placeholder="JKUAT IEC"></div>
            <div class="field"><label>Excerpt</label>
                <textarea name="excerpt" rows="2" placeholder="Short summary shown on the blog card">${v('excerpt')}</textarea></div>
            <div class="field"><label>Content</label>
                <textarea name="content" rows="8" placeholder="Full article content...">${v('content')}</textarea></div>
            <div class="field"><label>Featured Image</label>
                <div class="upload-area" id="uploadArea">
                    <input type="file" accept="image/*" id="imageFile" data-bucket="article-media">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Click to upload image (max 5MB)</p>
                </div>
                <img id="imagePreview" class="upload-preview" src="${v('featured_image')}" ${v('featured_image')?'style="display:block"':''}>
                <input type="hidden" name="featured_image" id="imageUrl" value="${v('featured_image')}">
            </div>
            <div class="field"><label>Tags <span style="opacity:.5;font-weight:400;">(comma separated)</span></label>
                <input name="tags" value="${arr('tags')}" placeholder="innovation, startup, tech"></div>
            <div id="formError" class="form-error" style="display:none;"></div>
            <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.25rem;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="submitBtn">
                    <i class="fas fa-save"></i> Save Post
                </button>
            </div>
        </form>`;

    // projects
    return `
        <form id="contentForm">
            <div class="field"><label>Title *</label>
                <input name="title" required value="${v('title')}" placeholder="Project title"></div>
            <div class="field"><label>Description</label>
                <textarea name="description" rows="3" placeholder="What does this project do?">${v('description')}</textarea></div>
            <div class="field-row">
                <div class="field"><label>Category</label>
                    <select name="category">
                        ${['innovation','research','startup','hackathon'].map(t =>
                            `<option value="${t}" ${v('category','innovation')===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`
                        ).join('')}
                    </select></div>
                <div class="field"><label>Status</label>
                    <select name="status">
                        ${['active','planning','completed'].map(t =>
                            `<option value="${t}" ${v('status','active')===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`
                        ).join('')}
                    </select></div>
            </div>
            <div class="field-row">
                <div class="field"><label>Team Size</label>
                    <input type="number" name="team_size" min="1" value="${v('team_size',1)}"></div>
                <div class="field"><label>Tech Stack <span style="opacity:.5;font-weight:400;">(comma separated)</span></label>
                    <input name="tech_stack" value="${arr('tech_stack')}" placeholder="React, Node.js, Python"></div>
            </div>
            <div class="field"><label>Project Image</label>
                <div class="upload-area" id="uploadArea">
                    <input type="file" accept="image/*" id="imageFile" data-bucket="project-media">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Click to upload image (max 5MB)</p>
                </div>
                <img id="imagePreview" class="upload-preview" src="${v('image')}" ${v('image')?'style="display:block"':''}>
                <input type="hidden" name="image" id="imageUrl" value="${v('image')}">
            </div>
            <div class="field-row">
                <div class="field"><label>GitHub URL</label>
                    <input name="github_url" value="${v('github_url')}" placeholder="https://github.com/..."></div>
                <div class="field"><label>Demo URL</label>
                    <input name="demo_url" value="${v('demo_url')}" placeholder="https://..."></div>
            </div>
            <div id="formError" class="form-error" style="display:none;"></div>
            <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.25rem;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="submitBtn">
                    <i class="fas fa-save"></i> Save Project
                </button>
            </div>
        </form>`;
}

// ── Form events (image upload + submit) ───────────────────────────────────────
function bindFormEvents(panel) {
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                showModalAlert('Image must be under 5MB.');
                return;
            }

            const bucket  = fileInput.dataset.bucket;
            const preview = document.getElementById('imagePreview');
            const urlInput = document.getElementById('imageUrl');

            // Show local preview immediately
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';

            // Upload to server
            try {
                const res = await fetch(`/api/v1/admin/upload/${bucket}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type':  file.type,
                        'X-File-Name':   file.name,
                    },
                    body: file,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                urlInput.value = data.url;
            } catch (err) {
                showModalAlert('Image upload failed: ' + err.message);
                preview.style.display = 'none';
                urlInput.value = '';
            }
        });
    }

    document.getElementById('contentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const errEl = document.getElementById('formError');
        errEl.style.display = 'none';
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const form = e.target;
            const body = {};
            new FormData(form).forEach((val, key) => { body[key] = val; });

            // Convert tags / tech_stack to arrays
            if (body.tags)       body.tags       = body.tags.split(',').map(t => t.trim()).filter(Boolean);
            if (body.tech_stack) body.tech_stack = body.tech_stack.split(',').map(t => t.trim()).filter(Boolean);

            const method = editingId ? 'PATCH' : 'POST';
            const url    = editingId
                ? `/api/v1/admin/${panel}/${editingId}`
                : `/api/v1/admin/${panel}`;

            const res  = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Save failed.');

            closeModal();
            loadPanel(panel);

        } catch (err) {
            errEl.textContent = err.message;
            errEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Save';
        }
    });
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showLoading(panel) {
    document.getElementById(`${panel}-loading`).style.display = 'block';
    document.getElementById(`${panel}-empty`).style.display   = 'none';
    document.getElementById(`${panel}-list`).innerHTML        = '';
}

function showEmpty(panel) {
    document.getElementById(`${panel}-loading`).style.display = 'none';
    document.getElementById(`${panel}-empty`).style.display   = 'block';
}
