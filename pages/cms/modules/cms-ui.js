/**
 * CMS UI Module
 * Handles UI components, formatting, and DOM manipulation
 */

import { CMSSecurity } from './cms-security.js';

export class CMSUI {
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = 'ig-loading';
        loading.innerHTML = `
            <div class="ig-spinner"></div>
            Loading...
        `;
        return loading;
    }

    static createEmptyState(message) {
        const empty = document.createElement('div');
        empty.className = 'ig-empty';
        empty.innerHTML = `
            <div class="ig-empty-icon">📝</div>
            <div class="ig-empty-title">No Content Found</div>
            <div class="ig-empty-text">${message}</div>
        `;
        return empty;
    }

    static createErrorElement(message) {
        const error = document.createElement('div');
        error.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: var(--ig-radius-md);
        `;
        error.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
            Error: ${CMSSecurity.escapeHtml(message)}
        `;
        return error;
    }

    static animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static createActivityItem(item, onClick) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        activityItem.innerHTML = `
            <div style="width: 40px; height: 40px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-${item.icon}" style="color: #3b82f6;"></i>
            </div>
            <div style="flex: 1;">
                <p style="color: white; font-weight: 600; margin: 0; font-size: 0.875rem;">${CMSSecurity.escapeHtml(item.title)}</p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin: 0;">
                    ${this.formatTimeAgo(item.created_at)} • ${item.type}
                </p>
            </div>
        `;
        
        activityItem.addEventListener('mouseenter', () => {
            activityItem.style.background = 'rgba(255, 255, 255, 0.1)';
            activityItem.style.transform = 'translateX(5px)';
        });
        
        activityItem.addEventListener('mouseleave', () => {
            activityItem.style.background = 'rgba(255, 255, 255, 0.05)';
            activityItem.style.transform = 'translateX(0)';
        });
        
        if (onClick) {
            activityItem.addEventListener('click', onClick);
        }
        
        return activityItem;
    }

    static createContentItem(data, type, handlers = {}) {
        const item = document.createElement('div');
        item.className = 'ig-content-item';

        const header = document.createElement('div');
        header.className = 'ig-content-header';

        const info = document.createElement('div');
        info.className = 'ig-content-info';

        const title = document.createElement('div');
        title.className = 'ig-content-title';
        title.textContent = data.title;

        const meta = this.createInstagramMeta(data, type);
        
        info.appendChild(title);
        info.appendChild(meta);

        const actions = this.createInstagramActions(data, type, handlers);

        header.appendChild(info);
        header.appendChild(actions);
        item.appendChild(header);

        // Add tags if they exist
        if (data.tags && data.tags.length > 0) {
            const tagsContainer = this.createInstagramTags(data.tags);
            item.appendChild(tagsContainer);
        }

        return item;
    }

    static createInstagramMeta(data, type) {
        const meta = document.createElement('div');
        meta.className = 'ig-content-meta';

        if (type === 'article') {
            meta.innerHTML = `
                <span><i class="fas fa-folder"></i> ${CMSSecurity.escapeHtml(data.category)}</span>
                <span><i class="fas fa-circle" style="color: ${data.status === 'published' ? '#10b981' : '#f59e0b'};"></i> ${CMSSecurity.escapeHtml(data.status)}</span>
                <span><i class="fas fa-calendar"></i> ${this.formatDate(data.created_at)}</span>
                ${data.views ? `<span><i class="fas fa-eye"></i> ${data.views} views</span>` : ''}
            `;
        } else if (type === 'event') {
            const isUpcoming = new Date(data.start_date) > new Date();
            meta.innerHTML = `
                <span><i class="fas fa-tag"></i> ${CMSSecurity.escapeHtml(data.type)}</span>
                <span><i class="fas fa-calendar"></i> ${this.formatDate(data.start_date)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${CMSSecurity.escapeHtml(data.location)}</span>
                ${data.registered_count ? `<span><i class="fas fa-users"></i> ${data.registered_count} registered</span>` : ''}
                <span style="color: ${isUpcoming ? '#10b981' : '#ef4444'}; font-weight: 600;">${isUpcoming ? 'Upcoming' : 'Past'}</span>
            `;
        } else if (type === 'opportunity') {
            const isActive = new Date(data.deadline) > new Date();
            meta.innerHTML = `
                <span><i class="fas fa-building"></i> ${CMSSecurity.escapeHtml(data.company)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${CMSSecurity.escapeHtml(data.location)}</span>
                <span><i class="fas fa-clock"></i> Deadline: ${this.formatDate(data.deadline)}</span>
                ${data.applications_count ? `<span><i class="fas fa-paper-plane"></i> ${data.applications_count} applications</span>` : ''}
                <span style="color: ${isActive ? '#10b981' : '#ef4444'}; font-weight: 600;">${isActive ? 'Active' : 'Expired'}</span>
            `;
        }

        return meta;
    }

    static createInstagramActions(data, type, handlers) {
        const actions = document.createElement('div');
        actions.className = 'ig-content-actions';

        const buttons = [
            { 
                action: 'view', 
                class: 'ig-btn ig-btn-view', 
                icon: 'eye', 
                text: 'View'
            },
            { 
                action: 'edit', 
                class: 'ig-btn ig-btn-edit', 
                icon: 'edit', 
                text: 'Edit'
            },
            { 
                action: 'delete', 
                class: 'ig-btn ig-btn-delete', 
                icon: 'trash', 
                text: 'Delete'
            }
        ];

        buttons.forEach(({ action, class: btnClass, icon, text }) => {
            const btn = document.createElement('button');
            btn.className = btnClass;
            btn.dataset.action = `${action}-${type}`;
            btn.dataset.id = data.id;
            btn.innerHTML = `<i class="fas fa-${icon}"></i> ${text}`;
            actions.appendChild(btn);
        });

        return actions;
    }

    static createInstagramTags(tags) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'ig-tags';
        
        tags.slice(0, 5).forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'ig-tag';
            tagEl.textContent = `#${tag}`;
            tagsContainer.appendChild(tagEl);
        });
        
        if (tags.length > 5) {
            const moreTag = document.createElement('span');
            moreTag.className = 'ig-tag';
            moreTag.textContent = `+${tags.length - 5} more`;
            moreTag.style.background = 'var(--ig-border)';
            tagsContainer.appendChild(moreTag);
        }

        return tagsContainer;
    }

    static createMetaInfo(data, type) {
        const meta = document.createElement('div');
        meta.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 0.75rem;
        `;

        if (type === 'article') {
            meta.innerHTML = `
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-folder" style="margin-right: 0.25rem;"></i>
                    ${CMSSecurity.escapeHtml(data.category)}
                </span>
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-circle" style="margin-right: 0.25rem; color: ${data.status === 'published' ? '#10b981' : '#f59e0b'};"></i>
                    ${CMSSecurity.escapeHtml(data.status)}
                </span>
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-calendar" style="margin-right: 0.25rem;"></i>
                    ${this.formatDate(data.created_at)}
                </span>
                ${data.views ? `<span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-eye" style="margin-right: 0.25rem;"></i>
                    ${data.views} views
                </span>` : ''}
            `;
        } else if (type === 'event') {
            const isUpcoming = new Date(data.start_date) > new Date();
            meta.innerHTML = `
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-tag" style="margin-right: 0.25rem;"></i>
                    ${CMSSecurity.escapeHtml(data.type)}
                </span>
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-calendar" style="margin-right: 0.25rem;"></i>
                    ${this.formatDate(data.start_date)}
                </span>
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-map-marker-alt" style="margin-right: 0.25rem;"></i>
                    ${CMSSecurity.escapeHtml(data.location)}
                </span>
                ${data.registered_count ? `<span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-users" style="margin-right: 0.25rem;"></i>
                    ${data.registered_count} registered
                </span>` : ''}
                <span style="color: ${isUpcoming ? '#10b981' : '#ef4444'}; font-size: 0.875rem; font-weight: 600;">
                    ${isUpcoming ? 'Upcoming' : 'Past'}
                </span>
            `;
        } else if (type === 'opportunity') {
            const isActive = new Date(data.deadline) > new Date();
            meta.innerHTML = `
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-building" style="margin-right: 0.25rem;"></i>
                    ${CMSSecurity.escapeHtml(data.company)}
                </span>
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-map-marker-alt" style="margin-right: 0.25rem;"></i>
                    ${CMSSecurity.escapeHtml(data.location)}
                </span>
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-clock" style="margin-right: 0.25rem;"></i>
                    Deadline: ${this.formatDate(data.deadline)}
                </span>
                ${data.applications_count ? `<span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                    <i class="fas fa-paper-plane" style="margin-right: 0.25rem;"></i>
                    ${data.applications_count} applications
                </span>` : ''}
                <span style="color: ${isActive ? '#10b981' : '#ef4444'}; font-size: 0.875rem; font-weight: 600;">
                    ${isActive ? 'Active' : 'Expired'}
                </span>
            `;
        }

        return meta;
    }

    static createTagsContainer(tags) {
        if (!tags || !tags.length) return null;

        const tagsContainer = document.createElement('div');
        tagsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        `;
        
        tags.slice(0, 3).forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.textContent = tag;
            tagEl.style.cssText = `
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                font-weight: 500;
            `;
            tagsContainer.appendChild(tagEl);
        });
        
        if (tags.length > 3) {
            const moreTag = document.createElement('span');
            moreTag.textContent = `+${tags.length - 3} more`;
            moreTag.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
            `;
            tagsContainer.appendChild(moreTag);
        }

        return tagsContainer;
    }

    static createActionButtons(data, type, handlers) {
        const actions = document.createElement('div');
        actions.className = 'content-actions';
        actions.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-left: 1rem;
        `;

        const buttons = [
            { 
                action: 'view', 
                color: '#10b981', 
                icon: 'eye', 
                text: 'View',
                handler: handlers.onView 
            },
            { 
                action: 'edit', 
                color: '#3b82f6', 
                icon: 'edit', 
                text: 'Edit',
                handler: handlers.onEdit 
            },
            { 
                action: 'delete', 
                color: '#ef4444', 
                icon: 'trash', 
                text: 'Delete',
                handler: handlers.onDelete 
            }
        ];

        buttons.forEach(({ action, color, icon, text, handler }) => {
            const btn = document.createElement('button');
            btn.className = `btn-${action}`;
            btn.dataset.action = `${action}-${type}`;
            btn.dataset.id = data.id;
            btn.style.cssText = `
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                border: 1px solid ${color}33;
                background: ${color}22;
                color: ${color};
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.3s ease;
            `;
            btn.innerHTML = `<i class="fas fa-${icon}"></i> ${text}`;

            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-1px)';
                btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });

            actions.appendChild(btn);
        });

        return actions;
    }

    static createContentModal(data, type) {
        const modal = document.createElement('div');
        modal.className = 'ig-modal';

        const content = document.createElement('div');
        content.className = 'ig-modal-content';

        const header = document.createElement('div');
        header.className = 'ig-modal-header';

        const title = document.createElement('div');
        title.className = 'ig-modal-title';
        title.textContent = data.title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'ig-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.remove();

        header.appendChild(title);
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'ig-modal-body';

        if (type === 'article') {
            body.innerHTML = `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);">
                    <strong>Category:</strong> ${CMSSecurity.escapeHtml(data.category)} | 
                    <strong>Status:</strong> ${CMSSecurity.escapeHtml(data.status)} | 
                    <strong>Author:</strong> ${CMSSecurity.escapeHtml(data.author_name)}
                </div>
                <div style="line-height: 1.6;">${data.content || '<p>No content available.</p>'}</div>
            `;
        } else if (type === 'event') {
            body.innerHTML = `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);">
                    <strong>Type:</strong> ${CMSSecurity.escapeHtml(data.type)} | 
                    <strong>Date:</strong> ${this.formatDate(data.start_date)} | 
                    <strong>Location:</strong> ${CMSSecurity.escapeHtml(data.location)}
                </div>
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);">
                    <strong>Max Participants:</strong> ${data.max_participants || 'Unlimited'} | 
                    <strong>Fee:</strong> KSh ${data.registration_fee || 0} | 
                    <strong>Registration:</strong> ${data.requires_registration ? 'Required' : 'Not Required'}
                </div>
                <div style="line-height: 1.6;">${data.description || '<p>No description available.</p>'}</div>
            `;
        } else if (type === 'opportunity') {
            body.innerHTML = `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);">
                    <strong>Company:</strong> ${CMSSecurity.escapeHtml(data.company)} | 
                    <strong>Type:</strong> ${CMSSecurity.escapeHtml(data.type)} | 
                    <strong>Location:</strong> ${CMSSecurity.escapeHtml(data.location)}
                </div>
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);">
                    <strong>Deadline:</strong> ${this.formatDate(data.deadline)} | 
                    <strong>Salary:</strong> ${data.salary || 'Not specified'}
                </div>
                ${data.application_link ? `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);">
                    <strong>Apply:</strong> <a href="${data.application_link}" target="_blank" style="color: var(--ig-blue);">Application Link</a>
                </div>` : ''}
                <div style="line-height: 1.6;">${data.description || '<p>No description available.</p>'}</div>
            `;
        }

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    static createMediaItem(file, handlers = {}) {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        `;

        const preview = document.createElement('div');
        preview.className = 'media-preview';
        preview.style.cssText = `
            width: 100%;
            height: 150px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            overflow: hidden;
            position: relative;
        `;

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = file.url;
            img.alt = file.name;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 0.5rem;
            `;
            preview.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = file.type.includes('pdf') ? 'fas fa-file-pdf' : 'fas fa-file';
            icon.style.cssText = `
                font-size: 3rem;
                color: rgba(255, 255, 255, 0.5);
            `;
            preview.appendChild(icon);
        }

        const name = document.createElement('div');
        name.textContent = file.name;
        name.style.cssText = `
            color: white;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            word-break: break-all;
        `;

        const size = document.createElement('div');
        size.textContent = this.formatFileSize(file.size);
        size.style.cssText = `
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.75rem;
            margin-bottom: 1rem;
        `;

        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 0.5rem;
            justify-content: center;
        `;

        const viewBtn = document.createElement('button');
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.style.cssText = `
            padding: 0.5rem;
            border-radius: 0.375rem;
            border: 1px solid rgba(16, 185, 129, 0.3);
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        `;
        if (handlers.onView) {
            viewBtn.onclick = () => handlers.onView(file);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.style.cssText = `
            padding: 0.5rem;
            border-radius: 0.375rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        `;
        if (handlers.onDelete) {
            deleteBtn.onclick = () => handlers.onDelete(file.id);
        }

        actions.appendChild(viewBtn);
        actions.appendChild(deleteBtn);

        mediaItem.appendChild(preview);
        mediaItem.appendChild(name);
        mediaItem.appendChild(size);
        mediaItem.appendChild(actions);

        // Add hover effects
        mediaItem.addEventListener('mouseenter', () => {
            mediaItem.style.transform = 'translateY(-4px)';
            mediaItem.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
        });
        mediaItem.addEventListener('mouseleave', () => {
            mediaItem.style.transform = 'translateY(0)';
            mediaItem.style.boxShadow = 'none';
        });

        return mediaItem;
    }

    static createContentForm(type, onSubmit) {
        // This would create a comprehensive form modal
        // For now, returning a simple implementation
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; padding: 2rem; position: relative;">
                <button onclick="this.closest('.modal-backdrop').remove()" style="position: absolute; top: 1rem; right: 1rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.1); color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                <h2 style="color: white; margin-bottom: 1.5rem;">Create ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <p style="color: rgba(255, 255, 255, 0.8);">Form creation functionality will be implemented here.</p>
            </div>
        `;
        return modal;
    }
}