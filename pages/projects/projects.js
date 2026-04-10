'use strict';
/**
 * Projects Page
 * Cards use shared .content-card CSS from main.css
 */

class ProjectsManager {
    constructor() {
        this.all      = [];
        this.filtered = [];
        this.filter   = 'all';
        this.tab      = 'showcase';
        this.page     = 1;
        this.perPage  = 12;
        this.init();
    }

    async init() {
        try {
            await this.load();
            this.bindEvents();
            this.render();
        } catch (err) {
            console.error('ProjectsManager init failed:', err);
            this.showEmpty('Failed to load projects. Please try again later.');
        }
    }

    async load() {
        this.showLoading();
        const res = await fetch('/api/v1/content/projects');
        if (!res.ok) throw new Error('Projects fetch failed');
        const data = await res.json();
        this.all      = data.projects || [];
        this.filtered = [...this.all];
    }

    bindEvents() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                this.tab = btn.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`${this.tab}-tab`)?.classList.add('active');
                if (this.tab === 'showcase') this.render();
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.applyFilter();
            });
        });

        // Quick actions
        document.getElementById('submitProjectBtn')?.addEventListener('click', () => this.switchTab('submit'));
        document.getElementById('joinProjectBtn')?.addEventListener('click',   () => this.switchTab('showcase'));

        // Submission form
        document.getElementById('projectSubmissionForm')?.addEventListener('submit', e => this.handleSubmit(e));

        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.page++;
            this.renderGrid();
            this.updateLoadMore();
        });
    }

    switchTab(name) {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === name);
            b.setAttribute('aria-selected', b.dataset.tab === name);
        });
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${name}-tab`)?.classList.add('active');
        this.tab = name;
        if (name === 'showcase') this.render();
    }

    applyFilter() {
        this.filtered = this.filter === 'all'
            ? [...this.all]
            : this.all.filter(p => p.category?.toLowerCase() === this.filter);
        this.page = 1;
        this.render();
    }

    render() {
        this.hideLoading();
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        if (this.filtered.length === 0) {
            grid.innerHTML = `
                <div class="state-box" style="grid-column:1/-1;">
                    <i class="fas fa-search empty-icon"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your filter or check back later.</p>
                </div>`;
            return;
        }

        grid.style.display = 'grid';
        this.renderGrid();
        this.updateLoadMore();
    }

    renderGrid() {
        const grid  = document.getElementById('projectsGrid');
        const items = this.filtered.slice(0, this.page * this.perPage);
        grid.innerHTML = items.map(p => this.card(p)).join('');
        grid.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
    }

    card(p) {
        const statusBadge = { active: 'badge-green', completed: 'badge-blue', planning: 'badge-yellow' };
        const badge = statusBadge[p.status] || 'badge-gray';
        const label = p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Active';

        const imgHtml = p.image
            ? `<img src="${p.image}" alt="${p.title}" loading="lazy">`
            : `<div class="card-img-placeholder"><i class="fas fa-rocket"></i></div>`;

        const stackHtml = (p.tech_stack || []).length
            ? `<div class="card-tags">${(p.tech_stack || []).slice(0,4).map(t => `<span class="card-tag">${t}</span>`).join('')}</div>`
            : '';

        return `
        <article class="content-card" data-id="${p.id}">
            <div class="card-img-wrap">
                ${imgHtml}
                <span class="card-badge ${badge}">
                    <i class="fas fa-circle" style="font-size:.5rem;"></i> ${label}
                </span>
                <span class="card-badge-right">${p.category || 'innovation'}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${p.title}</h3>
                <p class="card-text">${p.description || ''}</p>
                <div class="card-meta">
                    <div class="card-meta-row">
                        <i class="fas fa-users"></i>
                        <span>${p.team_size || 1} member${(p.team_size || 1) !== 1 ? 's' : ''}</span>
                    </div>
                    ${p.github_url ? `<div class="card-meta-row"><i class="fab fa-github"></i><a href="${p.github_url}" target="_blank" rel="noopener" style="color:inherit;">GitHub</a></div>` : ''}
                </div>
                ${stackHtml}
                <div class="card-actions">
                    <button class="btn btn-primary" data-action="view" data-id="${p.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${p.demo_url ? `<a href="${p.demo_url}" target="_blank" rel="noopener" class="btn btn-ghost"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                </div>
            </div>
        </article>`;
    }

    openModal(id) {
        const p = this.all.find(x => x.id === id);
        if (!p) return;
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-box">
                <button class="modal-close" aria-label="Close">×</button>
                ${p.image ? `<img src="${p.image}" alt="${p.title}" class="modal-img">` : ''}
                <h2 class="modal-title">${p.title}</h2>
                <div class="modal-meta">
                    <div class="modal-meta-row"><i class="fas fa-tag"></i><span>${p.category}</span></div>
                    <div class="modal-meta-row"><i class="fas fa-circle" style="font-size:.5rem;"></i><span>${p.status}</span></div>
                    <div class="modal-meta-row"><i class="fas fa-users"></i><span>${p.team_size || 1} member${(p.team_size||1)!==1?'s':''}</span></div>
                </div>
                <p class="modal-body">${p.description || ''}</p>
                ${(p.tech_stack||[]).length ? `<div class="card-tags" style="margin-top:1rem;">${p.tech_stack.map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>` : ''}
                <div class="modal-actions">
                    ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener" class="btn btn-ghost"><i class="fab fa-github"></i> GitHub</a>` : ''}
                    ${p.demo_url   ? `<a href="${p.demo_url}"   target="_blank" rel="noopener" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                </div>
            </div>`;
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn    = e.target.querySelector('button[type="submit"]');
        const textEl = document.getElementById('messageText');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        const payload = {
            title:       document.getElementById('projectTitle')?.value?.trim(),
            description: document.getElementById('projectDescription')?.value?.trim(),
            category:    document.getElementById('projectCategory')?.value,
            tech_stack:  (document.getElementById('projectTechnologies')?.value || '')
                            .split(',').map(t => t.trim()).filter(Boolean),
            team_size:   1,
            status:      'planning'
        };

        if (!payload.title || !payload.description || !payload.category) {
            if (textEl) { textEl.textContent = 'Please fill in all required fields.'; textEl.style.color = '#fca5a5'; }
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i>Submit Project Idea';
            return;
        }

        try {
            const res = await fetch('/api/v1/content/projects', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                if (textEl) { textEl.textContent = 'Project submitted!'; textEl.style.color = '#6ee7b7'; }
                e.target.reset();
                await this.load();
                setTimeout(() => this.switchTab('showcase'), 1500);
            } else {
                const d = await res.json();
                if (textEl) { textEl.textContent = d.error || 'Submission failed.'; textEl.style.color = '#fca5a5'; }
            }
        } catch (_) {
            if (textEl) { textEl.textContent = 'Network error.'; textEl.style.color = '#fca5a5'; }
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i>Submit Project Idea';
        }
    }

    showLoading() {
        const grid = document.getElementById('projectsGrid');
        if (grid) grid.innerHTML = `<div class="state-box" style="grid-column:1/-1;"><div class="spinner"></div><p>Loading projects...</p></div>`;
    }

    hideLoading() {}

    showEmpty(msg) {
        const grid = document.getElementById('projectsGrid');
        if (grid) grid.innerHTML = `
            <div class="state-box" style="grid-column:1/-1;">
                <i class="fas fa-inbox empty-icon"></i>
                <p>${msg}</p>
            </div>`;
    }

    updateLoadMore() {
        const c = document.getElementById('loadMoreContainer');
        if (c) c.style.display = this.page * this.perPage < this.filtered.length ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.projectsManager = new ProjectsManager();
});
