'use strict';

/**
 * Projects Page — fetches from /api/v1/content/projects
 */

class ProjectsManager {
    constructor() {
        this.all      = [];
        this.filtered = [];
        this.filter   = 'all';
        this.tab      = 'showcase';
        this.init();
    }

    async init() {
        try {
            await this.load();
            this.bindEvents();
            this.render();
        } catch (err) {
            console.error('ProjectsManager init failed:', err);
            this.showEmpty('projectsGrid', 'Failed to load projects. Please try again later.');
        }
    }

    async load() {
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

        // Quick action buttons
        document.getElementById('submitProjectBtn')?.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.tab === 'submit');
                b.setAttribute('aria-selected', b.dataset.tab === 'submit');
            });
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('submit-tab')?.classList.add('active');
        });

        document.getElementById('joinProjectBtn')?.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.tab === 'showcase');
            });
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('showcase-tab')?.classList.add('active');
        });

        // Project submission form
        document.getElementById('projectSubmissionForm')?.addEventListener('submit', e => this.handleSubmit(e));

        // Modal close via backdrop
        document.addEventListener('click', e => {
            if (e.target.classList.contains('modal-backdrop')) {
                e.target.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (e.target.matches('.modal-close') || e.target.closest('.modal-close') ||
                e.target.matches('[data-action="close-modal"]')) {
                const modal = e.target.closest('.modal-backdrop');
                if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop.active').forEach(m => {
                    m.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }
        });
    }

    applyFilter() {
        this.filtered = this.filter === 'all'
            ? [...this.all]
            : this.all.filter(p => p.category?.toLowerCase() === this.filter);
        this.render();
    }

    render() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        if (this.filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:3rem; opacity:.6;">
                    <i class="fas fa-search" style="font-size:2.5rem; margin-bottom:1rem; display:block; opacity:.4;"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your filter or check back later for new projects.</p>
                </div>`;
            return;
        }

        grid.innerHTML = this.filtered.map(p => this.card(p)).join('');
    }

    card(p) {
        const statusColors = { active: '#10b981', completed: '#3b82f6', planning: '#f59e0b' };
        const color = statusColors[p.status] || '#9ca3af';
        const stack = (p.tech_stack || []).slice(0, 4).map(t =>
            `<span class="tech-tag">${t}</span>`).join('');

        return `
        <div class="project-card">
            <div class="project-header">
                <div>
                    <h3 class="project-title">${p.title}</h3>
                    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.35rem;">
                        <span class="project-status ${p.status}" style="color:${color};">${p.status}</span>
                        <span style="font-size:.72rem;padding:.2rem .6rem;border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);">${p.category}</span>
                    </div>
                </div>
            </div>
            <p class="project-description">${p.description || ''}</p>
            ${stack ? `<div class="project-tech">${stack}</div>` : ''}
            <div class="project-stats">
                <div class="project-stat team">
                    <i class="fas fa-users"></i>
                    <span>${p.team_size || 1} member${(p.team_size || 1) !== 1 ? 's' : ''}</span>
                </div>
                ${p.github_url ? `<div class="project-stat"><i class="fab fa-github"></i><a href="${p.github_url}" target="_blank" rel="noopener" style="color:inherit;">GitHub</a></div>` : ''}
            </div>
            <div class="project-actions">
                ${p.demo_url ? `<a href="${p.demo_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fab fa-github"></i> Code</a>` : ''}
                ${!p.demo_url && !p.github_url ? `<span style="font-size:.8rem;opacity:.5;">No links yet</span>` : ''}
            </div>
        </div>`;
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const msgEl = document.getElementById('submissionMessage');
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
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });

            if (res.ok) {
                if (textEl) { textEl.textContent = 'Project submitted successfully!'; textEl.style.color = '#6ee7b7'; }
                e.target.reset();
                await this.load();
                setTimeout(() => {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'showcase'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    document.getElementById('showcase-tab')?.classList.add('active');
                    this.render();
                }, 1500);
            } else {
                const d = await res.json();
                if (textEl) { textEl.textContent = d.error || 'Submission failed.'; textEl.style.color = '#fca5a5'; }
            }
        } catch (_) {
            if (textEl) { textEl.textContent = 'Network error. Please try again.'; textEl.style.color = '#fca5a5'; }
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i>Submit Project Idea';
        }
    }

    showEmpty(gridId, msg) {
        const grid = document.getElementById(gridId);
        if (grid) grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:3rem;opacity:.6;">
                <i class="fas fa-inbox" style="font-size:2.5rem;margin-bottom:1rem;display:block;opacity:.4;"></i>
                <p>${msg}</p>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.projectsManager = new ProjectsManager();
});
