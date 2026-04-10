'use strict';
/**
 * Blog Page — articles, news, announcements
 * Cards use shared .content-card CSS from main.css
 */

class BlogManager {
    constructor() {
        this.all      = [];
        this.filtered = [];
        this.filter   = 'all';
        this.sort     = 'date-desc';
        this.search   = '';
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
            console.error('BlogManager init failed:', err);
            this.showEmpty('Failed to load posts. Please try again later.');
        }
    }

    async load() {
        this.showLoading();
        const res = await fetch('/api/v1/content/articles');
        if (!res.ok) throw new Error('Articles fetch failed');
        const data = await res.json();
        this.all      = (data.articles || []).map(a => this.normalise(a));
        this.filtered = [...this.all];
    }

    normalise(a) {
        return {
            id:      a.id,
            type:    a.category || 'article',
            title:   a.title,
            excerpt: a.excerpt || '',
            image:   a.featured_image || null,
            date:    a.published_at || a.created_at,
            author:  a.author_name || 'JKUAT IEC',
            tags:    a.tags || [],
            content: a.content || '',
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

        document.getElementById('blogSearch')?.addEventListener('input', e => {
            this.search = e.target.value.toLowerCase().trim();
            clearTimeout(this._st);
            this._st = setTimeout(() => { this.page = 1; this.applyFilters(); }, 280);
        });

        document.getElementById('sortSelect')?.addEventListener('change', e => {
            this.sort = e.target.value;
            this.page = 1;
            this.applyFilters();
        });

        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.page++;
            this.renderGrid();
            this.updateLoadMore();
        });
    }

    applyFilters() {
        let items = [...this.all];
        if (this.filter !== 'all') items = items.filter(i => i.type === this.filter);
        if (this.search) {
            items = items.filter(i =>
                i.title.toLowerCase().includes(this.search) ||
                i.excerpt.toLowerCase().includes(this.search) ||
                i.tags.some(t => t.toLowerCase().includes(this.search))
            );
        }
        items.sort((a, b) => {
            if (this.sort === 'date-asc')  return new Date(a.date) - new Date(b.date);
            if (this.sort === 'title-asc') return a.title.localeCompare(b.title);
            return new Date(b.date) - new Date(a.date);
        });
        this.filtered = items;
        this.render();
    }

    render() {
        this.hideLoading();
        if (this.filtered.length === 0) { this.showEmpty('No posts match your filter.'); return; }
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('blogGrid').style.display   = 'grid';
        this.renderGrid();
        this.updateLoadMore();
    }

    renderGrid() {
        const grid  = document.getElementById('blogGrid');
        const items = this.filtered.slice(0, this.page * this.perPage);
        grid.innerHTML = items.map(i => this.card(i)).join('');
        // Bind card buttons
        grid.querySelectorAll('[data-action="read"]').forEach(btn => {
            btn.addEventListener('click', () => this.openPost(btn.dataset.id));
        });
        grid.querySelectorAll('[data-action="share"]').forEach(btn => {
            btn.addEventListener('click', () => this.share(btn.dataset.id));
        });
    }

    card(item) {
        const typeIcons  = { article: 'file-alt', news: 'newspaper', announcement: 'bullhorn' };
        const typeBadges = { article: 'badge-purple', news: 'badge-blue', announcement: 'badge-yellow' };
        const icon  = typeIcons[item.type]  || 'file-alt';
        const badge = typeBadges[item.type] || 'badge-blue';
        const label = item.type.charAt(0).toUpperCase() + item.type.slice(1);

        const imgHtml = item.image
            ? `<img src="${item.image}" alt="${item.title}" loading="lazy">`
            : `<div class="card-img-placeholder"><i class="fas fa-${icon}"></i></div>`;

        const tagsHtml = item.tags.length
            ? `<div class="card-tags">${item.tags.slice(0,3).map(t => `<span class="card-tag">#${t}</span>`).join('')}</div>`
            : '';

        return `
        <article class="content-card" data-id="${item.id}">
            <div class="card-img-wrap">
                ${imgHtml}
                <span class="card-badge ${badge}">
                    <i class="fas fa-${icon}"></i> ${label}
                </span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-text">${item.excerpt}</p>
                <div class="card-meta">
                    <div class="card-meta-row">
                        <i class="fas fa-calendar"></i>
                        <span>${this.fmtDate(item.date)}</span>
                    </div>
                    <div class="card-meta-row">
                        <i class="fas fa-user"></i>
                        <span>${item.author}</span>
                    </div>
                </div>
                ${tagsHtml}
                <div class="card-actions">
                    <button class="btn btn-primary" data-action="read" data-id="${item.id}">
                        <i class="fas fa-book-open"></i> Read More
                    </button>
                    <button class="btn btn-ghost" data-action="share" data-id="${item.id}">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        </article>`;
    }

    openPost(id) {
        const item = this.all.find(i => i.id === id);
        if (!item) return;
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-box">
                <button class="modal-close" aria-label="Close">×</button>
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="modal-img">` : ''}
                <h2 class="modal-title">${item.title}</h2>
                <div class="modal-meta">
                    <div class="modal-meta-row"><i class="fas fa-calendar"></i><span>${this.fmtDate(item.date)}</span></div>
                    <div class="modal-meta-row"><i class="fas fa-user"></i><span>${item.author}</span></div>
                </div>
                <div class="modal-body">${item.content || item.excerpt}</div>
            </div>`;
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    share(id) {
        const item = this.all.find(i => i.id === id);
        const url  = `${window.location.origin}/blog?id=${id}`;
        if (navigator.share && item) navigator.share({ title: item.title, url }).catch(() => {});
        else navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
    }

    fmtDate(d) {
        if (!d) return '';
        const date = new Date(d);
        const diff = Math.floor((Date.now() - date) / 86400000);
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7)  return `${diff} days ago`;
        return date.toLocaleDateString('en-KE', { year:'numeric', month:'short', day:'numeric' });
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('blogGrid').style.display     = 'none';
        document.getElementById('emptyState').style.display   = 'none';
    }

    hideLoading() { document.getElementById('loadingState').style.display = 'none'; }

    showEmpty(msg) {
        document.getElementById('blogGrid').style.display   = 'none';
        document.getElementById('emptyState').style.display = 'flex';
        const p = document.querySelector('#emptyState p');
        if (p) p.textContent = msg;
    }

    updateLoadMore() {
        const c = document.getElementById('loadMoreContainer');
        if (c) c.style.display = this.page * this.perPage < this.filtered.length ? 'block' : 'none';
    }
}

let blogManager;
document.addEventListener('DOMContentLoaded', () => {
    blogManager = new BlogManager();
    window.blogManager = blogManager;
});
