'use strict';
/**
 * Events Page
 * Cards use shared .content-card CSS from main.css
 */

class EventsManager {
    constructor() {
        this.all      = [];
        this.filtered = [];
        this.filter   = 'all';
        this.search   = '';
        this.page     = 1;
        this.perPage  = 12;
        this.init();
    }

    async init() {
        try {
            await this.load();
            this.bindEvents();
            this.updateStats();
            this.render();
        } catch (err) {
            console.error('EventsManager init failed:', err);
            this.showEmpty('Failed to load events. Please try again later.');
        }
    }

    async load() {
        this.showLoading();
        try {
            const res = await fetch('/api/v1/content/events');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const raw = data.events || [];
            this.all = raw.map(e => {
                try { return this.normalise(e); }
                catch (err) { console.warn('Failed to normalise event:', e.id, err); return null; }
            }).filter(Boolean);
            this.filtered = [...this.all];
        } catch (err) {
            console.error('Events load error:', err);
            throw err;
        }
    }

    normalise(e) {
        const startDate = e.start_date || e.created_at;
        const now       = new Date();
        const start     = new Date(startDate);
        const diffDays  = Math.floor((start - now) / 86400000);
        let status = 'upcoming';
        if (e.status === 'completed' || start < now) status = 'past';
        else if (diffDays === 0) status = 'today';
        return {
            id:       e.id,
            title:    e.title,
            desc:     e.description || '',
            image:    e.banner_image || null,
            date:     startDate,
            endDate:  e.end_date || null,
            location: e.location || null,
            type:     (e.event_type || 'general').toLowerCase(),
            tags:     e.tags || [],
            fee:      e.fee || 0,
            status,
        };
    }

    bindEvents() {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filter = tab.dataset.filter;
                this.page   = 1;
                this.applyFilters();
            });
        });

        document.getElementById('eventsSearch')?.addEventListener('input', e => {
            this.search = e.target.value.toLowerCase().trim();
            clearTimeout(this._st);
            this._st = setTimeout(() => { this.page = 1; this.applyFilters(); }, 280);
        });

        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.page++;
            this.renderGrid();
            this.updateLoadMore();
        });
    }

    applyFilters() {
        let items = [...this.all];
        switch (this.filter) {
            case 'upcoming':  items = items.filter(e => e.status !== 'past'); break;
            case 'past':      items = items.filter(e => e.status === 'past'); break;
            case 'free':      items = items.filter(e => e.fee === 0); break;
            case 'hackathon': items = items.filter(e => e.type === 'hackathon'); break;
            case 'workshop':  items = items.filter(e => e.type === 'workshop'); break;
        }
        if (this.search) {
            items = items.filter(e =>
                e.title.toLowerCase().includes(this.search) ||
                e.desc.toLowerCase().includes(this.search) ||
                e.tags.some(t => t.toLowerCase().includes(this.search))
            );
        }
        items.sort((a, b) => {
            if (a.status !== 'past' && b.status === 'past') return -1;
            if (a.status === 'past' && b.status !== 'past') return 1;
            return new Date(a.date) - new Date(b.date);
        });
        this.filtered = items;
        this.render();
    }

    updateStats() {
        const upcoming = this.all.filter(e => e.status !== 'past').length;
        const free     = this.all.filter(e => e.fee === 0).length;
        const el = id => document.getElementById(id);
        if (el('upcomingCount')) el('upcomingCount').textContent = upcoming;
        if (el('totalCount'))    el('totalCount').textContent    = this.all.length;
        if (el('freeCount'))     el('freeCount').textContent     = free;
    }

    render() {
        this.hideLoading();
        if (this.filtered.length === 0) { this.showEmpty('No events match your filter.'); return; }
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('eventsGrid').style.display = 'grid';
        this.renderGrid();
        this.updateLoadMore();
    }

    renderGrid() {
        const grid  = document.getElementById('eventsGrid');
        const items = this.filtered.slice(0, this.page * this.perPage);
        grid.innerHTML = items.map(e => this.card(e)).join('');
        grid.querySelectorAll('[data-action="details"]').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        grid.querySelectorAll('[data-action="register"]').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
    }

    card(e) {
        const isPast    = e.status === 'past';
        const isToday   = e.status === 'today';
        const badgeCls  = isPast ? 'badge-gray' : isToday ? 'badge-yellow' : 'badge-green';
        const badgeLbl  = isPast ? 'Past' : isToday ? 'Today' : 'Upcoming';
        const badgeIcon = isPast ? 'check-circle' : isToday ? 'fire' : 'calendar-alt';

        const imgHtml = e.image
            ? `<img src="${e.image}" alt="${e.title}" loading="lazy">`
            : `<div class="card-img-placeholder"><i class="fas fa-calendar-alt"></i></div>`;

        const tagsHtml = e.tags.length
            ? `<div class="card-tags">${e.tags.slice(0,3).map(t => `<span class="card-tag">#${t}</span>`).join('')}</div>`
            : '';

        const feeHtml = e.fee > 0
            ? `<div class="card-meta-row fee-paid"><i class="fas fa-tag"></i> KES ${e.fee.toLocaleString()}</div>`
            : `<div class="card-meta-row fee-free"><i class="fas fa-check-circle"></i> Free to Attend</div>`;

        const actionHtml = isPast
            ? `<button class="btn btn-ghost" disabled style="opacity:.4;cursor:not-allowed;"><i class="fas fa-lock"></i> Ended</button>`
            : `<button class="btn btn-primary" data-action="register" data-id="${e.id}">
                   <i class="fas fa-calendar-plus"></i> Register
               </button>`;

        return `
        <article class="content-card${isPast ? ' is-past' : ''}" data-id="${e.id}">
            <div class="card-img-wrap">
                ${imgHtml}
                <span class="card-badge ${badgeCls}">
                    <i class="fas fa-${badgeIcon}"></i> ${badgeLbl}
                </span>
                ${e.type !== 'general' ? `<span class="card-badge-right">${e.type}</span>` : ''}
            </div>
            <div class="card-body">
                <h3 class="card-title">${e.title}</h3>
                <p class="card-text">${e.desc}</p>
                <div class="card-meta">
                    <div class="card-meta-row">
                        <i class="fas fa-clock"></i>
                        <span>${this.fmtDate(e.date)}${e.endDate ? ' – ' + this.fmtDate(e.endDate) : ''}</span>
                    </div>
                    ${e.location ? `<div class="card-meta-row"><i class="fas fa-map-marker-alt"></i><span>${e.location}</span></div>` : ''}
                    ${feeHtml}
                </div>
                ${tagsHtml}
                <div class="card-actions">
                    ${actionHtml}
                    <button class="btn btn-ghost" data-action="details" data-id="${e.id}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        </article>`;
    }

    openModal(id) {
        const e = this.all.find(ev => ev.id === id);
        if (!e) return;
        const isPast = e.status === 'past';
        const modal  = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-box">
                <button class="modal-close" aria-label="Close">×</button>
                ${e.image ? `<img src="${e.image}" alt="${e.title}" class="modal-img">` : ''}
                <h2 class="modal-title">${e.title}</h2>
                <div class="modal-meta">
                    <div class="modal-meta-row"><i class="fas fa-clock"></i><span>${this.fmtDate(e.date)}</span></div>
                    ${e.endDate ? `<div class="modal-meta-row"><i class="fas fa-hourglass-end"></i><span>Ends ${this.fmtDate(e.endDate)}</span></div>` : ''}
                    ${e.location ? `<div class="modal-meta-row"><i class="fas fa-map-marker-alt"></i><span>${e.location}</span></div>` : ''}
                    <div class="modal-meta-row"><i class="fas fa-tag"></i><span>${e.fee > 0 ? 'KES ' + e.fee.toLocaleString() : 'Free'}</span></div>
                </div>
                <p class="modal-body">${e.desc || 'No description available.'}</p>
                <div class="modal-actions">
                    ${!isPast
                        ? `<button class="btn btn-primary"><i class="fas fa-calendar-plus"></i> Register Now</button>`
                        : `<button class="btn btn-ghost" disabled style="opacity:.4;">Event Ended</button>`}
                    <button class="btn btn-ghost modal-share"><i class="fas fa-share"></i> Share</button>
                </div>
            </div>`;
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', ev => { if (ev.target === modal) modal.remove(); });
        modal.querySelector('.modal-share').addEventListener('click', () => {
            const url = `${window.location.origin}/events#${id}`;
            if (navigator.share) navigator.share({ title: e.title, url }).catch(() => {});
            else navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
        });
        document.body.appendChild(modal);
    }

    fmtDate(d) {
        if (!d) return '';
        const date = new Date(d);
        const diff = Math.floor((date - Date.now()) / 86400000);
        if (diff === 0)  return 'Today';
        if (diff === 1)  return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        if (diff > 0 && diff < 7) return `In ${diff} days`;
        return date.toLocaleDateString('en-KE', { year:'numeric', month:'short', day:'numeric' });
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('eventsGrid').style.display   = 'none';
        document.getElementById('emptyState').style.display   = 'none';
    }

    hideLoading() { document.getElementById('loadingState').style.display = 'none'; }

    showEmpty(msg) {
        document.getElementById('eventsGrid').style.display   = 'none';
        document.getElementById('emptyState').style.display   = 'flex';
        const p = document.querySelector('#emptyState p');
        if (p) p.textContent = msg;
    }

    updateLoadMore() {
        const c = document.getElementById('loadMoreContainer');
        if (c) c.style.display = this.page * this.perPage < this.filtered.length ? 'block' : 'none';
    }
}

let eventsManager;
document.addEventListener('DOMContentLoaded', () => {
    eventsManager = new EventsManager();
    window.eventsManager = eventsManager;
});
