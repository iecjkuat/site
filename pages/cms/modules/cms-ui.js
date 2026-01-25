/**
 * CMS UI Module
 * Handles UI components, formatting, and DOM manipulation
 */

import { CMSSecurity } from './cms-security.js';

export class CMSUI {
    static formatDate(dateString) {
        if (!dateString) return 'No date';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatTimeAgo(dateString) {
        if (!dateString) return 'Unknown time';
        
        const date = new Date(dateString);
        const now = new Date();
        
        if (isNaN(date.getTime())) return 'Invalid date';
        
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
        
        const spinner = document.createElement('div');
        spinner.className = 'ig-spinner';
        
        const text = document.createElement('span');
        text.textContent = 'Loading...';
        
        loading.appendChild(spinner);
        loading.appendChild(text);
        
        return loading;
    }

    static createEmptyState(message) {
        const empty = document.createElement('div');
        empty.className = 'ig-empty';
        
        const icon = document.createElement('div');
        icon.className = 'ig-empty-icon';
        icon.textContent = '📝';
        
        const title = document.createElement('div');
        title.className = 'ig-empty-title';
        title.textContent = 'No Content Found';
        
        const text = document.createElement('div');
        text.className = 'ig-empty-text';
        text.textContent = message;
        
        empty.appendChild(icon);
        empty.appendChild(title);
        empty.appendChild(text);
        
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

        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle';
        icon.style.marginRight = '0.5rem';

        const text = document.createElement('span');
        text.textContent = `Error: ${message}`;

        error.appendChild(icon);
        error.appendChild(text);
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
        
        // Sanitize and validate icon (whitelist approach)
        const safeIcon = /^[a-z0-9-]+$/i.test(item.icon ?? '') ? item.icon : 'info-circle';
        const safeType = CMSSecurity.escapeHtml(item.type ?? '');
        
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
            width: 40px; 
            height: 40px; 
            background: rgba(59, 130, 246, 0.2); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
        `;
        
        const iconEl = document.createElement('i');
        iconEl.className = `fas fa-${safeIcon}`;
        iconEl.style.color = '#3b82f6';
        iconContainer.appendChild(iconEl);
        
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.style.flex = '1';
        
        const titleEl = document.createElement('p');
        titleEl.style.cssText = 'color: white; font-weight: 600; margin: 0; font-size: 0.875rem;';
        titleEl.textContent = CMSSecurity.escapeHtml(item.title);
        
        const metaEl = document.createElement('p');
        metaEl.style.cssText = 'color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin: 0;';
        metaEl.textContent = `${this.formatTimeAgo(item.created_at)} • ${safeType}`;
        
        contentContainer.appendChild(titleEl);
        contentContainer.appendChild(metaEl);
        
        activityItem.appendChild(iconContainer);
        activityItem.appendChild(contentContainer);
        
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
        // Create website-style content cards using secure DOM building
        const item = this.createSecureWebsiteCard(data, type);
        
        // Add selection checkbox for bulk operations
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'content-item-checkbox';
        checkbox.dataset.id = this.safeAttr(data.id);
        checkbox.style.cssText = `
            position: absolute;
            top: 1rem;
            left: 1rem;
            width: 18px;
            height: 18px;
            cursor: pointer;
            z-index: 10;
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid var(--ig-border-strong);
            border-radius: 4px;
        `;

        // Add change listener for selection callback compatibility
        checkbox.addEventListener('change', (e) => {
            handlers.onSelectionChange?.(data.id, e.target.checked);
        });

        // Insert checkbox at the beginning
        item.insertBefore(checkbox, item.firstChild);
        
        // Add event listeners for action buttons
        this.addActionListeners(item, data, type, handlers);
        
        return item;
    }

    /**
     * Security helper functions for safe content rendering
     */
    static escapeHtml(s) {
        return CMSSecurity.escapeHtml(String(s ?? ''));
    }

    // Only allow http(s) or relative URLs for images/media
    static safeUrl(url) {
        const raw = String(url ?? '').trim();
        if (!raw) return '';
        
        // Allow relative paths (/images/x.png, ./x.png)
        if (raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) return raw;
        
        // Allow http/https only
        return CMSSecurity.isSafeHttpUrl(raw) ? raw : '';
    }

    // Lock down data-* attributes to prevent breaking out of quotes
    static safeAttr(value, max = 80) {
        return this.escapeHtml(String(value ?? '').slice(0, max));
    }

    // Accept only safe hex colors, otherwise fallback
    static safeColor(value, fallback = '#6b7280') {
        const v = String(value ?? '').trim();
        return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : fallback;
    }

    /**
     * Add secure action listeners to content items
     */
    static addActionListeners(item, data, type, handlers) {
        // Use event delegation for better performance and security
        item.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            e.preventDefault();
            e.stopPropagation();

            const action = button.dataset.action;
            const id = button.dataset.id;

            // Validate that the ID matches the data ID for security
            if (id !== String(data.id)) {
                console.warn('Action button ID mismatch - potential security issue');
                return;
            }

            switch (action) {
                case 'view':
                    handlers.onView?.(data, type);
                    break;
                case 'edit':
                    handlers.onEdit?.(data, type);
                    break;
                case 'delete':
                    handlers.onDelete?.(data, type);
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        });
    }

    /**
     * Create website-style cards using secure DOM building instead of innerHTML
     */
    static createSecureWebsiteCard(data, type) {
        switch (type) {
            case 'articles':
            case 'article':
                return this.createSecureArticleCard(data);
            case 'events':
            case 'event':
                return this.createSecureEventCard(data);
            case 'opportunities':
            case 'opportunity':
                return this.createSecureOpportunityCard(data);
            case 'media':
                return this.createSecureMediaCard(data);
            default:
                return this.createSecureGenericCard(data, type);
        }
    }

    /**
     * Create article card using secure DOM building
     */
    static createSecureArticleCard(article) {
        const publishDate = new Date(article.created_at || Date.now());
        const dateStr = publishDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Sanitize all data
        const id = this.safeAttr(article.id);
        const title = this.escapeHtml(article.title);
        const category = this.escapeHtml(article.category || 'General');
        const imageUrl = this.safeUrl(article.featured_image);
        const status = this.escapeHtml(article.status ? String(article.status).toUpperCase() : 'DRAFT');
        const statusColor = this.safeColor(article.status === 'published' ? '#10b981' : 
                                          article.status === 'draft' ? '#f59e0b' : '#6b7280');

        // Get safe description
        const rawDesc = article.description || this.stripHtml(article.content_html || '');
        const shortDescription = rawDesc ? (rawDesc.length > 150 ? rawDesc.slice(0, 150) + '...' : rawDesc) : 'No content available';

        // Create article element
        const articleEl = document.createElement('article');
        articleEl.className = 'website-article-card ig-content-item';
        articleEl.dataset.id = id;
        articleEl.dataset.type = 'article';

        // Create header
        const header = document.createElement('div');
        header.className = 'article-header';

        const meta = document.createElement('div');
        meta.className = 'article-meta';

        const authorInfo = document.createElement('div');
        authorInfo.className = 'author-info';

        const avatar = document.createElement('div');
        avatar.className = 'author-avatar';
        avatar.innerHTML = '<i class="fas fa-user-edit"></i>';

        const authorDetails = document.createElement('div');
        authorDetails.className = 'author-details';

        const authorName = document.createElement('span');
        authorName.className = 'author-name';
        authorName.textContent = 'JKUAT Innovation Club';

        const publishDateEl = document.createElement('span');
        publishDateEl.className = 'publish-date';
        publishDateEl.textContent = dateStr;

        authorDetails.appendChild(authorName);
        authorDetails.appendChild(publishDateEl);
        authorInfo.appendChild(avatar);
        authorInfo.appendChild(authorDetails);

        const statusEl = document.createElement('div');
        statusEl.className = 'article-status';
        statusEl.style.color = statusColor;
        statusEl.innerHTML = '<i class="fas fa-circle"></i>';
        statusEl.appendChild(document.createTextNode(' ' + status));

        meta.appendChild(authorInfo);
        meta.appendChild(statusEl);
        header.appendChild(meta);

        // Add image if available
        if (imageUrl) {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'article-image';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = title;
            img.loading = 'lazy';
            imageDiv.appendChild(img);
            articleEl.appendChild(header);
            articleEl.appendChild(imageDiv);
        } else {
            articleEl.appendChild(header);
        }

        // Create content section
        const content = document.createElement('div');
        content.className = 'article-content';

        const titleEl = document.createElement('h2');
        titleEl.className = 'article-title';
        titleEl.textContent = title;

        const categoryEl = document.createElement('div');
        categoryEl.className = 'article-category';
        categoryEl.innerHTML = '<i class="fas fa-folder"></i>';
        categoryEl.appendChild(document.createTextNode(' ' + category));

        const excerpt = document.createElement('p');
        excerpt.className = 'article-excerpt';
        excerpt.textContent = shortDescription;

        content.appendChild(titleEl);
        content.appendChild(categoryEl);
        content.appendChild(excerpt);

        // Add tags if available
        const tags = Array.isArray(article.tags) ? article.tags : [];
        if (tags.length > 0) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'article-tags';
            tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = '#' + this.escapeHtml(tag);
                tagsDiv.appendChild(tagSpan);
            });
            content.appendChild(tagsDiv);
        }

        articleEl.appendChild(content);

        // Create actions
        const actions = this.createSecureActions(id, 'article');
        articleEl.appendChild(actions);

        return articleEl;
    }

    /**
     * Create event card using secure DOM building
     */
    static createSecureEventCard(event) {
        const startDate = new Date(event.start_date || Date.now());
        const dateStr = startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        const timeStr = startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Sanitize all data
        const id = this.safeAttr(event.id);
        const title = this.escapeHtml(event.title);
        const location = this.escapeHtml(event.location || 'TBD');
        const imageUrl = this.safeUrl(event.banner_image);
        const status = this.escapeHtml(event.status ? String(event.status).toUpperCase() : 'DRAFT');
        const statusColor = this.safeColor(event.status === 'published' ? '#10b981' : 
                                          event.status === 'draft' ? '#f59e0b' : '#6b7280');

        const eventType = event.event_type || event.type || 'workshop';
        const categoryColor = this.getCategoryColor(eventType);
        const categoryIcon = this.getCategoryIcon(eventType);

        // Safe numeric values
        const currentAttendees = Number.isFinite(+event.current_attendees) ? +event.current_attendees : 0;
        const maxAttendees = Number.isFinite(+event.max_attendees) ? +event.max_attendees : 0;
        const fee = Number.isFinite(+event.fee) ? +event.fee : 0;
        const spotsLeft = maxAttendees - currentAttendees;
        const feeText = fee > 0 ? `KSh ${fee}` : 'Free';

        // Safe description
        const rawDesc = event.description || this.stripHtml(event.description_html || '');
        const shortDescription = rawDesc ? (rawDesc.length > 120 ? rawDesc.slice(0, 120) + '...' : rawDesc) : 'No description available';

        // Create event element
        const eventEl = document.createElement('article');
        eventEl.className = 'website-event-card instagram-event-card ig-content-item';
        eventEl.dataset.id = id;
        eventEl.dataset.type = 'event';

        // Create header
        const header = document.createElement('header');
        header.className = 'event-header';

        const profile = document.createElement('div');
        profile.className = 'event-profile';

        const avatar = document.createElement('div');
        avatar.className = 'profile-avatar';
        avatar.style.background = this.safeColor(categoryColor);
        const avatarIcon = document.createElement('i');
        avatarIcon.className = `fas fa-${categoryIcon}`;
        avatar.appendChild(avatarIcon);

        const profileInfo = document.createElement('div');
        profileInfo.className = 'profile-info';

        const profileName = document.createElement('h3');
        profileName.className = 'profile-name';
        profileName.textContent = 'JKUAT Innovation Club';

        const profileLocation = document.createElement('span');
        profileLocation.className = 'profile-location';
        profileLocation.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        profileLocation.appendChild(document.createTextNode(' ' + location));

        profileInfo.appendChild(profileName);
        profileInfo.appendChild(profileLocation);
        profile.appendChild(avatar);
        profile.appendChild(profileInfo);

        const statusEl = document.createElement('div');
        statusEl.className = 'event-status';
        statusEl.style.color = statusColor;
        statusEl.innerHTML = '<i class="fas fa-circle"></i>';
        statusEl.appendChild(document.createTextNode(' ' + status));

        header.appendChild(profile);
        header.appendChild(statusEl);

        // Create media container
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'event-media-container';

        if (imageUrl) {
            const media = document.createElement('div');
            media.className = 'event-media';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = title;
            img.loading = 'lazy';
            media.appendChild(img);
            mediaContainer.appendChild(media);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'event-media placeholder';
            const placeholderContent = document.createElement('div');
            placeholderContent.className = 'placeholder-content';
            const placeholderIcon = document.createElement('i');
            placeholderIcon.className = `fas fa-${categoryIcon}`;
            placeholderIcon.style.cssText = `color: ${this.safeColor(categoryColor)}; font-size: 3rem;`;
            placeholderContent.appendChild(placeholderIcon);
            placeholderContent.appendChild(document.createElement('span')).textContent = 'No Image';
            placeholder.appendChild(placeholderContent);
            mediaContainer.appendChild(placeholder);
        }

        // Add overlays
        const overlays = document.createElement('div');
        overlays.className = 'media-overlays';

        const typeBadge = document.createElement('span');
        typeBadge.className = 'event-type-badge';
        typeBadge.style.background = this.safeColor(categoryColor);
        const badgeIcon = document.createElement('i');
        badgeIcon.className = `fas fa-${categoryIcon}`;
        typeBadge.appendChild(badgeIcon);
        typeBadge.appendChild(document.createTextNode(' ' + eventType.toUpperCase()));

        const dateBadge = document.createElement('span');
        dateBadge.className = 'event-date-badge';
        dateBadge.textContent = dateStr;

        overlays.appendChild(typeBadge);
        overlays.appendChild(dateBadge);
        mediaContainer.appendChild(overlays);

        // Create content
        const content = document.createElement('div');
        content.className = 'event-content';

        const actionsBar = document.createElement('div');
        actionsBar.className = 'event-actions-bar';
        const actionButtons = this.createSecureActions(id, 'event', 'action-buttons ig-content-actions');
        actionsBar.appendChild(actionButtons);

        const eventInfo = document.createElement('div');
        eventInfo.className = 'event-info';

        const titleEl = document.createElement('h2');
        titleEl.className = 'event-title';
        titleEl.textContent = title;

        const descEl = document.createElement('p');
        descEl.className = 'event-description';
        descEl.textContent = shortDescription;

        const details = document.createElement('div');
        details.className = 'event-details';

        // Date detail
        const dateDetail = document.createElement('div');
        dateDetail.className = 'detail-item';
        dateDetail.innerHTML = '<i class="fas fa-calendar"></i>';
        dateDetail.appendChild(document.createTextNode(` ${dateStr} at ${timeStr}`));

        // Attendees detail
        const attendeesDetail = document.createElement('div');
        attendeesDetail.className = 'detail-item';
        attendeesDetail.innerHTML = '<i class="fas fa-users"></i>';
        attendeesDetail.appendChild(document.createTextNode(` ${currentAttendees}/${maxAttendees} attendees`));

        // Fee detail
        const feeDetail = document.createElement('div');
        feeDetail.className = 'detail-item';
        feeDetail.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
        feeDetail.appendChild(document.createTextNode(` ${feeText}`));

        details.appendChild(dateDetail);
        details.appendChild(attendeesDetail);
        details.appendChild(feeDetail);

        if (spotsLeft > 0) {
            const spotsDetail = document.createElement('div');
            spotsDetail.className = 'detail-item spots-left';
            spotsDetail.innerHTML = '<i class="fas fa-ticket-alt"></i>';
            spotsDetail.appendChild(document.createTextNode(` ${spotsLeft} spots left`));
            details.appendChild(spotsDetail);
        }

        eventInfo.appendChild(titleEl);
        eventInfo.appendChild(descEl);
        eventInfo.appendChild(details);

        content.appendChild(actionsBar);
        content.appendChild(eventInfo);

        // Assemble event card
        eventEl.appendChild(header);
        eventEl.appendChild(mediaContainer);
        eventEl.appendChild(content);

        return eventEl;
    }

    /**
     * Create opportunity card using secure DOM building
     */
    static createSecureOpportunityCard(opportunity) {
        const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null;
        const deadlineText = deadline ? deadline.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : 'No deadline';

        // Sanitize all data
        const id = this.safeAttr(opportunity.id);
        const title = this.escapeHtml(opportunity.title);
        const company = this.escapeHtml(opportunity.company || opportunity.organization || 'Unknown Organization');
        const location = this.escapeHtml(opportunity.location || 'Remote');
        const salary = this.escapeHtml(opportunity.salary || '');
        const status = this.escapeHtml(opportunity.status ? String(opportunity.status).toUpperCase() : 'DRAFT');
        const statusColor = this.safeColor(opportunity.status === 'published' ? '#10b981' : 
                                          opportunity.status === 'draft' ? '#f59e0b' : '#6b7280');

        const type = opportunity.type || 'internship';
        const typeIcon = this.getOpportunityTypeIcon(type);

        // Safe description
        const rawDesc = opportunity.description || this.stripHtml(opportunity.description_html || '');
        const shortDescription = rawDesc ? (rawDesc.length > 150 ? rawDesc.slice(0, 150) + '...' : rawDesc) : 'No description available';

        // Safe numeric values
        const views = Number.isFinite(+opportunity.views) ? +opportunity.views : 0;
        const applications = Number.isFinite(+opportunity.applications) ? +opportunity.applications : 0;

        // Create opportunity element
        const oppEl = document.createElement('div');
        oppEl.className = 'website-opportunity-card glass-card ig-content-item';
        oppEl.dataset.id = id;
        oppEl.dataset.type = 'opportunity';

        // Create header
        const header = document.createElement('div');
        header.className = 'card-header';

        const typeEl = document.createElement('div');
        typeEl.className = `opportunity-type ${type}`;
        const typeIconEl = document.createElement('i');
        typeIconEl.className = `fas ${typeIcon}`;
        typeEl.appendChild(typeIconEl);
        typeEl.appendChild(document.createTextNode(' ' + type.charAt(0).toUpperCase() + type.slice(1)));

        const statusEl = document.createElement('div');
        statusEl.className = 'opportunity-status';
        statusEl.style.color = statusColor;
        statusEl.innerHTML = '<i class="fas fa-circle"></i>';
        statusEl.appendChild(document.createTextNode(' ' + status));

        header.appendChild(typeEl);
        header.appendChild(statusEl);

        // Create title
        const titleEl = document.createElement('h3');
        titleEl.className = 'opportunity-title';
        titleEl.textContent = title;

        // Create organization
        const orgEl = document.createElement('div');
        orgEl.className = 'organization';
        orgEl.textContent = company;

        // Create description
        const descEl = document.createElement('p');
        descEl.className = 'description';
        descEl.textContent = shortDescription;

        // Create details
        const details = document.createElement('div');
        details.className = 'opportunity-details';

        const locationEl = document.createElement('div');
        locationEl.className = 'location';
        locationEl.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        locationEl.appendChild(document.createTextNode(' ' + location));

        details.appendChild(locationEl);

        if (salary) {
            const salaryEl = document.createElement('div');
            salaryEl.className = 'compensation';
            salaryEl.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
            salaryEl.appendChild(document.createTextNode(' ' + salary));
            details.appendChild(salaryEl);
        }

        const deadlineEl = document.createElement('div');
        deadlineEl.className = 'deadline';
        deadlineEl.innerHTML = '<i class="fas fa-clock"></i>';
        deadlineEl.appendChild(document.createTextNode(' Deadline: ' + deadlineText));
        details.appendChild(deadlineEl);

        // Create stats
        const stats = document.createElement('div');
        stats.className = 'opportunity-stats';

        const viewsSpan = document.createElement('span');
        viewsSpan.innerHTML = '<i class="fas fa-eye"></i>';
        viewsSpan.appendChild(document.createTextNode(' ' + views));

        const appsSpan = document.createElement('span');
        appsSpan.innerHTML = '<i class="fas fa-users"></i>';
        appsSpan.appendChild(document.createTextNode(' ' + applications));

        stats.appendChild(viewsSpan);
        stats.appendChild(appsSpan);

        // Create actions
        const actions = this.createSecureActions(id, 'opportunity');

        // Assemble opportunity card
        oppEl.appendChild(header);
        oppEl.appendChild(titleEl);
        oppEl.appendChild(orgEl);
        oppEl.appendChild(descEl);
        oppEl.appendChild(details);
        oppEl.appendChild(stats);
        oppEl.appendChild(actions);

        return oppEl;
    }

    /**
     * Create media card using secure DOM building
     */
    static createSecureMediaCard(media) {
        const uploadDate = new Date(media.created_at || Date.now());
        const dateStr = uploadDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Sanitize all data
        const id = this.safeAttr(media.id);
        const name = this.escapeHtml(media.name);
        const url = this.safeUrl(media.url);
        const thumbnailUrl = this.safeUrl(media.thumbnail);
        const fileSize = media.size ? this.formatFileSize(media.size) : 'Unknown size';
        const isImage = media.type && media.type.startsWith('image/');
        const isVideo = media.type && media.type.startsWith('video/');

        // Create media element
        const mediaEl = document.createElement('div');
        mediaEl.className = 'website-media-card ig-content-item';
        mediaEl.dataset.id = id;
        mediaEl.dataset.type = 'media';

        // Create preview
        const preview = document.createElement('div');
        preview.className = 'media-preview';

        if (isImage && url) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = name;
            img.loading = 'lazy';
            preview.appendChild(img);
        } else if (isVideo && url) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            if (thumbnailUrl) {
                video.poster = thumbnailUrl;
            }
            const source = document.createElement('source');
            source.src = url;
            source.type = media.type;
            video.appendChild(source);
            preview.appendChild(video);

            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            overlay.innerHTML = '<i class="fas fa-play"></i>';
            preview.appendChild(overlay);
        } else {
            const filePreview = document.createElement('div');
            filePreview.className = 'file-preview';
            filePreview.innerHTML = '<i class="fas fa-file"></i>';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            filePreview.appendChild(nameSpan);
            preview.appendChild(filePreview);
        }

        // Create info
        const info = document.createElement('div');
        info.className = 'media-info';

        const nameEl = document.createElement('h4');
        nameEl.className = 'media-name';
        nameEl.textContent = name;

        const details = document.createElement('div');
        details.className = 'media-details';

        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'file-size';
        sizeSpan.textContent = fileSize;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'upload-date';
        dateSpan.textContent = dateStr;

        details.appendChild(sizeSpan);
        details.appendChild(dateSpan);
        info.appendChild(nameEl);
        info.appendChild(details);

        // Create actions
        const actions = this.createSecureActions(id, 'media');

        // Assemble media card
        mediaEl.appendChild(preview);
        mediaEl.appendChild(info);
        mediaEl.appendChild(actions);

        return mediaEl;
    }

    /**
     * Create generic card using secure DOM building
     */
    static createSecureGenericCard(data, type) {
        const id = this.safeAttr(data.id);
        const title = this.escapeHtml(data.title || data.name || 'Untitled');

        const item = document.createElement('div');
        item.className = 'ig-content-item';
        item.dataset.id = id;
        item.dataset.type = type;

        const header = document.createElement('div');
        header.className = 'ig-content-header';

        const info = document.createElement('div');
        info.className = 'ig-content-info';

        const titleEl = document.createElement('div');
        titleEl.className = 'ig-content-title';
        titleEl.textContent = title;

        const meta = document.createElement('div');
        meta.className = 'ig-content-meta';
        meta.innerHTML = '<i class="fas fa-tag"></i>';
        meta.appendChild(document.createTextNode(' ' + this.escapeHtml(type)));

        info.appendChild(titleEl);
        info.appendChild(meta);

        const actions = this.createSecureActions(id, type);

        header.appendChild(info);
        header.appendChild(actions);
        item.appendChild(header);

        return item;
    }

    /**
     * Create secure action buttons
     */
    static createSecureActions(id, type, className = 'ig-content-actions') {
        const actions = document.createElement('div');
        actions.className = className;

        const viewBtn = document.createElement('button');
        viewBtn.className = 'ig-btn ig-btn-view';
        viewBtn.dataset.action = 'view';
        viewBtn.dataset.id = this.safeAttr(id);
        const viewIcon = document.createElement('i');
        viewIcon.className = 'fas fa-eye';
        viewBtn.appendChild(viewIcon);
        viewBtn.appendChild(document.createTextNode(' View'));

        const editBtn = document.createElement('button');
        editBtn.className = 'ig-btn ig-btn-edit';
        editBtn.dataset.action = 'edit';
        editBtn.dataset.id = this.safeAttr(id);
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-edit';
        editBtn.appendChild(editIcon);
        editBtn.appendChild(document.createTextNode(' Edit'));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'ig-btn ig-btn-delete';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.dataset.id = this.safeAttr(id);
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(deleteIcon);
        deleteBtn.appendChild(document.createTextNode(' Delete'));

        actions.appendChild(viewBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        return actions;
    }

    static createInstagramMeta(data, type) {
        const meta = document.createElement('div');
        meta.className = 'ig-content-meta';

        const spans = [];

        if (type === 'article') {
            // Sanitize numeric values
            const views = Number.isFinite(+data.views) ? +data.views : 0;
            
            // Category span
            const categorySpan = document.createElement('span');
            const categoryIcon = document.createElement('i');
            categoryIcon.className = 'fas fa-folder';
            categorySpan.appendChild(categoryIcon);
            categorySpan.appendChild(document.createTextNode(` ${data.category || 'Uncategorized'}`));
            spans.push(categorySpan);
            
            // Status span
            const statusSpan = document.createElement('span');
            const statusIcon = document.createElement('i');
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = data.status === 'published' ? '#10b981' : '#f59e0b';
            statusSpan.appendChild(statusIcon);
            statusSpan.appendChild(document.createTextNode(` ${data.status || 'draft'}`));
            spans.push(statusSpan);
            
            // Date span
            const dateSpan = document.createElement('span');
            const dateIcon = document.createElement('i');
            dateIcon.className = 'fas fa-calendar';
            dateSpan.appendChild(dateIcon);
            dateSpan.appendChild(document.createTextNode(` ${this.formatDate(data.created_at)}`));
            spans.push(dateSpan);
            
            // Views span (if > 0)
            if (views > 0) {
                const viewsSpan = document.createElement('span');
                const viewsIcon = document.createElement('i');
                viewsIcon.className = 'fas fa-eye';
                viewsSpan.appendChild(viewsIcon);
                viewsSpan.appendChild(document.createTextNode(` ${views} views`));
                spans.push(viewsSpan);
            }
        } else if (type === 'event') {
            // Sanitize numeric values
            const registeredCount = Number.isFinite(+data.registered_count) ? +data.registered_count : 0;
            const isUpcoming = new Date(data.start_date) > new Date();
            
            // Type span
            const typeSpan = document.createElement('span');
            const typeIcon = document.createElement('i');
            typeIcon.className = 'fas fa-tag';
            typeSpan.appendChild(typeIcon);
            typeSpan.appendChild(document.createTextNode(` ${data.type || 'Event'}`));
            spans.push(typeSpan);
            
            // Date span
            const dateSpan = document.createElement('span');
            const dateIcon = document.createElement('i');
            dateIcon.className = 'fas fa-calendar';
            dateSpan.appendChild(dateIcon);
            dateSpan.appendChild(document.createTextNode(` ${this.formatDate(data.start_date)}`));
            spans.push(dateSpan);
            
            // Location span
            const locationSpan = document.createElement('span');
            const locationIcon = document.createElement('i');
            locationIcon.className = 'fas fa-map-marker-alt';
            locationSpan.appendChild(locationIcon);
            locationSpan.appendChild(document.createTextNode(` ${data.location || 'TBD'}`));
            spans.push(locationSpan);
            
            // Registered count span (if > 0)
            if (registeredCount > 0) {
                const registeredSpan = document.createElement('span');
                const registeredIcon = document.createElement('i');
                registeredIcon.className = 'fas fa-users';
                registeredSpan.appendChild(registeredIcon);
                registeredSpan.appendChild(document.createTextNode(` ${registeredCount} registered`));
                spans.push(registeredSpan);
            }
            
            // Status span
            const statusSpan = document.createElement('span');
            statusSpan.style.color = isUpcoming ? '#10b981' : '#ef4444';
            statusSpan.style.fontWeight = '600';
            statusSpan.textContent = isUpcoming ? 'Upcoming' : 'Past';
            spans.push(statusSpan);
        } else if (type === 'opportunity') {
            // Sanitize numeric values
            const applicationsCount = Number.isFinite(+data.applications_count) ? +data.applications_count : 0;
            const isActive = new Date(data.deadline) > new Date();
            
            // Company span
            const companySpan = document.createElement('span');
            const companyIcon = document.createElement('i');
            companyIcon.className = 'fas fa-building';
            companySpan.appendChild(companyIcon);
            companySpan.appendChild(document.createTextNode(` ${data.company || 'Company'}`));
            spans.push(companySpan);
            
            // Location span
            const locationSpan = document.createElement('span');
            const locationIcon = document.createElement('i');
            locationIcon.className = 'fas fa-map-marker-alt';
            locationSpan.appendChild(locationIcon);
            locationSpan.appendChild(document.createTextNode(` ${data.location || 'Remote'}`));
            spans.push(locationSpan);
            
            // Deadline span
            const deadlineSpan = document.createElement('span');
            const deadlineIcon = document.createElement('i');
            deadlineIcon.className = 'fas fa-clock';
            deadlineSpan.appendChild(deadlineIcon);
            deadlineSpan.appendChild(document.createTextNode(` Deadline: ${this.formatDate(data.deadline)}`));
            spans.push(deadlineSpan);
            
            // Applications count span (if > 0)
            if (applicationsCount > 0) {
                const applicationsSpan = document.createElement('span');
                const applicationsIcon = document.createElement('i');
                applicationsIcon.className = 'fas fa-paper-plane';
                applicationsSpan.appendChild(applicationsIcon);
                applicationsSpan.appendChild(document.createTextNode(` ${applicationsCount} applications`));
                spans.push(applicationsSpan);
            }
            
            // Status span
            const statusSpan = document.createElement('span');
            statusSpan.style.color = isActive ? '#10b981' : '#ef4444';
            statusSpan.style.fontWeight = '600';
            statusSpan.textContent = isActive ? 'Active' : 'Expired';
            spans.push(statusSpan);
        }

        // Append all spans to meta
        spans.forEach(span => meta.appendChild(span));
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
            btn.dataset.id = this.safeAttr(data.id);
            
            // Create safe DOM structure instead of innerHTML
            const iconEl = document.createElement('i');
            iconEl.className = `fas fa-${icon}`;
            const textNode = document.createTextNode(` ${text}`);
            
            btn.appendChild(iconEl);
            btn.appendChild(textNode);
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

        const spans = [];
        const spanStyle = 'color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;';
        const iconStyle = 'margin-right: 0.25rem;';

        if (type === 'article') {
            // Sanitize numeric values
            const views = Number.isFinite(+data.views) ? +data.views : 0;
            
            // Category span
            const categorySpan = document.createElement('span');
            categorySpan.style.cssText = spanStyle;
            const categoryIcon = document.createElement('i');
            categoryIcon.className = 'fas fa-folder';
            categoryIcon.style.cssText = iconStyle;
            categorySpan.appendChild(categoryIcon);
            categorySpan.appendChild(document.createTextNode(data.category || 'Uncategorized'));
            spans.push(categorySpan);
            
            // Status span
            const statusSpan = document.createElement('span');
            statusSpan.style.cssText = spanStyle;
            const statusIcon = document.createElement('i');
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.cssText = iconStyle + `color: ${data.status === 'published' ? '#10b981' : '#f59e0b'};`;
            statusSpan.appendChild(statusIcon);
            statusSpan.appendChild(document.createTextNode(data.status || 'draft'));
            spans.push(statusSpan);
            
            // Date span
            const dateSpan = document.createElement('span');
            dateSpan.style.cssText = spanStyle;
            const dateIcon = document.createElement('i');
            dateIcon.className = 'fas fa-calendar';
            dateIcon.style.cssText = iconStyle;
            dateSpan.appendChild(dateIcon);
            dateSpan.appendChild(document.createTextNode(this.formatDate(data.created_at)));
            spans.push(dateSpan);
            
            // Views span (if > 0)
            if (views > 0) {
                const viewsSpan = document.createElement('span');
                viewsSpan.style.cssText = spanStyle;
                const viewsIcon = document.createElement('i');
                viewsIcon.className = 'fas fa-eye';
                viewsIcon.style.cssText = iconStyle;
                viewsSpan.appendChild(viewsIcon);
                viewsSpan.appendChild(document.createTextNode(`${views} views`));
                spans.push(viewsSpan);
            }
        } else if (type === 'event') {
            // Sanitize numeric values
            const registeredCount = Number.isFinite(+data.registered_count) ? +data.registered_count : 0;
            const isUpcoming = new Date(data.start_date) > new Date();
            
            // Type span
            const typeSpan = document.createElement('span');
            typeSpan.style.cssText = spanStyle;
            const typeIcon = document.createElement('i');
            typeIcon.className = 'fas fa-tag';
            typeIcon.style.cssText = iconStyle;
            typeSpan.appendChild(typeIcon);
            typeSpan.appendChild(document.createTextNode(data.type || 'Event'));
            spans.push(typeSpan);
            
            // Date span
            const dateSpan = document.createElement('span');
            dateSpan.style.cssText = spanStyle;
            const dateIcon = document.createElement('i');
            dateIcon.className = 'fas fa-calendar';
            dateIcon.style.cssText = iconStyle;
            dateSpan.appendChild(dateIcon);
            dateSpan.appendChild(document.createTextNode(this.formatDate(data.start_date)));
            spans.push(dateSpan);
            
            // Location span
            const locationSpan = document.createElement('span');
            locationSpan.style.cssText = spanStyle;
            const locationIcon = document.createElement('i');
            locationIcon.className = 'fas fa-map-marker-alt';
            locationIcon.style.cssText = iconStyle;
            locationSpan.appendChild(locationIcon);
            locationSpan.appendChild(document.createTextNode(data.location || 'TBD'));
            spans.push(locationSpan);
            
            // Registered count span (if > 0)
            if (registeredCount > 0) {
                const registeredSpan = document.createElement('span');
                registeredSpan.style.cssText = spanStyle;
                const registeredIcon = document.createElement('i');
                registeredIcon.className = 'fas fa-users';
                registeredIcon.style.cssText = iconStyle;
                registeredSpan.appendChild(registeredIcon);
                registeredSpan.appendChild(document.createTextNode(`${registeredCount} registered`));
                spans.push(registeredSpan);
            }
            
            // Status span
            const statusSpan = document.createElement('span');
            statusSpan.style.cssText = `color: ${isUpcoming ? '#10b981' : '#ef4444'}; font-size: 0.875rem; font-weight: 600;`;
            statusSpan.textContent = isUpcoming ? 'Upcoming' : 'Past';
            spans.push(statusSpan);
        } else if (type === 'opportunity') {
            // Sanitize numeric values
            const applicationsCount = Number.isFinite(+data.applications_count) ? +data.applications_count : 0;
            const isActive = new Date(data.deadline) > new Date();
            
            // Company span
            const companySpan = document.createElement('span');
            companySpan.style.cssText = spanStyle;
            const companyIcon = document.createElement('i');
            companyIcon.className = 'fas fa-building';
            companyIcon.style.cssText = iconStyle;
            companySpan.appendChild(companyIcon);
            companySpan.appendChild(document.createTextNode(data.company || 'Company'));
            spans.push(companySpan);
            
            // Location span
            const locationSpan = document.createElement('span');
            locationSpan.style.cssText = spanStyle;
            const locationIcon = document.createElement('i');
            locationIcon.className = 'fas fa-map-marker-alt';
            locationIcon.style.cssText = iconStyle;
            locationSpan.appendChild(locationIcon);
            locationSpan.appendChild(document.createTextNode(data.location || 'Remote'));
            spans.push(locationSpan);
            
            // Deadline span
            const deadlineSpan = document.createElement('span');
            deadlineSpan.style.cssText = spanStyle;
            const deadlineIcon = document.createElement('i');
            deadlineIcon.className = 'fas fa-clock';
            deadlineIcon.style.cssText = iconStyle;
            deadlineSpan.appendChild(deadlineIcon);
            deadlineSpan.appendChild(document.createTextNode(`Deadline: ${this.formatDate(data.deadline)}`));
            spans.push(deadlineSpan);
            
            // Applications count span (if > 0)
            if (applicationsCount > 0) {
                const applicationsSpan = document.createElement('span');
                applicationsSpan.style.cssText = spanStyle;
                const applicationsIcon = document.createElement('i');
                applicationsIcon.className = 'fas fa-paper-plane';
                applicationsIcon.style.cssText = iconStyle;
                applicationsSpan.appendChild(applicationsIcon);
                applicationsSpan.appendChild(document.createTextNode(`${applicationsCount} applications`));
                spans.push(applicationsSpan);
            }
            
            // Status span
            const statusSpan = document.createElement('span');
            statusSpan.style.cssText = `color: ${isActive ? '#10b981' : '#ef4444'}; font-size: 0.875rem; font-weight: 600;`;
            statusSpan.textContent = isActive ? 'Active' : 'Expired';
            spans.push(statusSpan);
        }

        // Append all spans to meta
        spans.forEach(span => meta.appendChild(span));
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
            btn.dataset.id = this.safeAttr(data.id);
            btn.style.cssText = `
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                border: 1px solid ${this.safeColor(color)}33;
                background: ${this.safeColor(color)}22;
                color: ${this.safeColor(color)};
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.3s ease;
            `;
            
            // Create safe DOM structure instead of innerHTML
            const iconEl = document.createElement('i');
            iconEl.className = `fas fa-${icon}`;
            const textNode = document.createTextNode(` ${text}`);
            
            btn.appendChild(iconEl);
            btn.appendChild(textNode);

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
        title.textContent = this.escapeHtml(data.title);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'ig-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.addEventListener('click', () => modal.remove());

        header.appendChild(title);
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'ig-modal-body';

        if (type === 'article') {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.cssText = 'margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);';
            
            // Create safe DOM structure instead of innerHTML
            const categoryLabel = document.createElement('strong');
            categoryLabel.textContent = 'Category: ';
            const categoryValue = document.createTextNode(this.escapeHtml(data.category || 'Uncategorized'));
            
            const separator1 = document.createTextNode(' | ');
            
            const statusLabel = document.createElement('strong');
            statusLabel.textContent = 'Status: ';
            const statusValue = document.createTextNode(this.escapeHtml(data.status || 'draft'));
            
            const separator2 = document.createTextNode(' | ');
            
            const authorLabel = document.createElement('strong');
            authorLabel.textContent = 'Author: ';
            const authorValue = document.createTextNode(this.escapeHtml(data.author_name || 'Unknown'));
            
            categoryDiv.appendChild(categoryLabel);
            categoryDiv.appendChild(categoryValue);
            categoryDiv.appendChild(separator1);
            categoryDiv.appendChild(statusLabel);
            categoryDiv.appendChild(statusValue);
            categoryDiv.appendChild(separator2);
            categoryDiv.appendChild(authorLabel);
            categoryDiv.appendChild(authorValue);
            
            const contentDiv = document.createElement('div');
            contentDiv.style.cssText = 'line-height: 1.6; max-height: 300px; overflow-y: auto; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;';
            
            // Safe content rendering using CMSSecurity
            if (window.CMSSecurity?.renderContent) {
                window.CMSSecurity.renderContent(contentDiv, data);
            } else {
                // Ultimate fallback - plain text only
                contentDiv.textContent = data.content || data.content_html || 'No content available.';
            }
            
            body.appendChild(categoryDiv);
            body.appendChild(contentDiv);
        } else if (type === 'event') {
            const typeDiv = document.createElement('div');
            typeDiv.style.cssText = 'margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);';
            
            // Create safe DOM structure
            const typeLabel = document.createElement('strong');
            typeLabel.textContent = 'Type: ';
            const typeValue = document.createTextNode(this.escapeHtml(data.type || 'Event'));
            
            const separator1 = document.createTextNode(' | ');
            
            const dateLabel = document.createElement('strong');
            dateLabel.textContent = 'Date: ';
            const dateValue = document.createTextNode(this.formatDate(data.start_date));
            
            const separator2 = document.createTextNode(' | ');
            
            const locationLabel = document.createElement('strong');
            locationLabel.textContent = 'Location: ';
            const locationValue = document.createTextNode(this.escapeHtml(data.location || 'TBD'));
            
            typeDiv.appendChild(typeLabel);
            typeDiv.appendChild(typeValue);
            typeDiv.appendChild(separator1);
            typeDiv.appendChild(dateLabel);
            typeDiv.appendChild(dateValue);
            typeDiv.appendChild(separator2);
            typeDiv.appendChild(locationLabel);
            typeDiv.appendChild(locationValue);
            
            const detailsDiv = document.createElement('div');
            detailsDiv.style.cssText = 'margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);';
            
            // Create safe DOM structure for details
            const maxLabel = document.createElement('strong');
            maxLabel.textContent = 'Max Participants: ';
            const maxValue = document.createTextNode(data.max_participants || 'Unlimited');
            
            const sep1 = document.createTextNode(' | ');
            
            const feeLabel = document.createElement('strong');
            feeLabel.textContent = 'Fee: ';
            const feeValue = document.createTextNode('KSh ' + (data.registration_fee || 0));
            
            const sep2 = document.createTextNode(' | ');
            
            const regLabel = document.createElement('strong');
            regLabel.textContent = 'Registration: ';
            const regValue = document.createTextNode(data.requires_registration ? 'Required' : 'Not Required');
            
            detailsDiv.appendChild(maxLabel);
            detailsDiv.appendChild(maxValue);
            detailsDiv.appendChild(sep1);
            detailsDiv.appendChild(feeLabel);
            detailsDiv.appendChild(feeValue);
            detailsDiv.appendChild(sep2);
            detailsDiv.appendChild(regLabel);
            detailsDiv.appendChild(regValue);
            
            const descriptionDiv = document.createElement('div');
            descriptionDiv.style.cssText = 'line-height: 1.6; max-height: 300px; overflow-y: auto; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;';
            
            // Safe content rendering for events
            if (window.CMSSecurity?.renderContent) {
                window.CMSSecurity.renderContent(descriptionDiv, data);
            } else {
                descriptionDiv.textContent = data.description || data.description_html || 'No description available.';
            }
            
            body.appendChild(typeDiv);
            body.appendChild(detailsDiv);
            body.appendChild(descriptionDiv);
        } else if (type === 'opportunity') {
            const companyDiv = document.createElement('div');
            companyDiv.style.cssText = 'margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);';
            
            // Create safe DOM structure
            const companyLabel = document.createElement('strong');
            companyLabel.textContent = 'Company: ';
            const companyValue = document.createTextNode(this.escapeHtml(data.company || data.organization || 'Unknown'));
            
            const sep1 = document.createTextNode(' | ');
            
            const typeLabel = document.createElement('strong');
            typeLabel.textContent = 'Type: ';
            const typeValue = document.createTextNode(this.escapeHtml(data.type || 'Opportunity'));
            
            const sep2 = document.createTextNode(' | ');
            
            const locationLabel = document.createElement('strong');
            locationLabel.textContent = 'Location: ';
            const locationValue = document.createTextNode(this.escapeHtml(data.location || 'Remote'));
            
            companyDiv.appendChild(companyLabel);
            companyDiv.appendChild(companyValue);
            companyDiv.appendChild(sep1);
            companyDiv.appendChild(typeLabel);
            companyDiv.appendChild(typeValue);
            companyDiv.appendChild(sep2);
            companyDiv.appendChild(locationLabel);
            companyDiv.appendChild(locationValue);
            
            const salaryDiv = document.createElement('div');
            salaryDiv.style.cssText = 'margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);';
            
            // Create safe DOM structure for salary info
            const deadlineLabel = document.createElement('strong');
            deadlineLabel.textContent = 'Deadline: ';
            const deadlineValue = document.createTextNode(this.formatDate(data.deadline));
            
            const sepSal = document.createTextNode(' | ');
            
            const salaryLabel = document.createElement('strong');
            salaryLabel.textContent = 'Salary: ';
            const salaryValue = document.createTextNode(data.salary || 'Not specified');
            
            salaryDiv.appendChild(deadlineLabel);
            salaryDiv.appendChild(deadlineValue);
            salaryDiv.appendChild(sepSal);
            salaryDiv.appendChild(salaryLabel);
            salaryDiv.appendChild(salaryValue);
            
            body.appendChild(companyDiv);
            body.appendChild(salaryDiv);
            
            if (data.application_link) {
                const linkDiv = document.createElement('div');
                linkDiv.style.cssText = 'margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ig-border);';
                
                const linkLabel = document.createElement('strong');
                linkLabel.textContent = 'Apply: ';
                
                // Validate URL is http/https only (block javascript: etc.)
                const raw = String(data.application_link || '').trim();
                let safeUrl = '';
                
                if (CMSSecurity.isSafeHttpUrl(raw)) {
                    safeUrl = raw;
                }
                
                if (safeUrl) {
                    const link = document.createElement('a');
                    link.href = safeUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.style.color = 'var(--ig-blue)';
                    link.textContent = 'Application Link';
                    
                    linkDiv.appendChild(linkLabel);
                    linkDiv.appendChild(link);
                    body.appendChild(linkDiv);
                } else {
                    // Invalid URL - show as text only
                    const textSpan = document.createElement('span');
                    textSpan.textContent = 'Invalid application link';
                    textSpan.style.color = '#ef4444';
                    
                    linkDiv.appendChild(linkLabel);
                    linkDiv.appendChild(textSpan);
                    body.appendChild(linkDiv);
                }
            }
            
            const descriptionDiv = document.createElement('div');
            descriptionDiv.style.cssText = 'line-height: 1.6; max-height: 300px; overflow-y: auto; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;';
            
            // Safe content rendering for opportunities
            if (window.CMSSecurity?.renderContent) {
                window.CMSSecurity.renderContent(descriptionDiv, data);
            } else {
                descriptionDiv.textContent = data.description || data.description_html || 'No description available.';
            }
            
            body.appendChild(descriptionDiv);
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

        // Validate and sanitize file URL
        const safeUrl = this.safeUrl(file.url);
        const safeName = this.escapeHtml(file.name);

        if (file.type && file.type.startsWith('image/') && safeUrl) {
            const img = document.createElement('img');
            img.src = safeUrl;
            img.alt = safeName;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 0.5rem;
            `;
            preview.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = file.type && file.type.includes('pdf') ? 'fas fa-file-pdf' : 'fas fa-file';
            icon.style.cssText = `
                font-size: 3rem;
                color: rgba(255, 255, 255, 0.5);
            `;
            preview.appendChild(icon);
        }

        const name = document.createElement('div');
        name.textContent = safeName;
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
        const viewIcon = document.createElement('i');
        viewIcon.className = 'fas fa-eye';
        viewBtn.appendChild(viewIcon);
        viewBtn.setAttribute('aria-label', 'View file');
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
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handlers.onView(file);
            });
        }

        const deleteBtn = document.createElement('button');
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(deleteIcon);
        deleteBtn.setAttribute('aria-label', 'Delete file');
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
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handlers.onDelete(file.id);
            });
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
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            max-width: 600px; 
            background: rgba(255, 255, 255, 0.1); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(255, 255, 255, 0.2); 
            border-radius: 1rem; 
            padding: 2rem; 
            position: relative;
        `;
        
        const closeButton = document.createElement('button');
        closeButton.setAttribute('aria-label', 'Close modal');
        closeButton.style.cssText = `
            position: absolute; 
            top: 1rem; 
            right: 1rem; 
            width: 2.5rem; 
            height: 2.5rem; 
            border-radius: 50%; 
            border: 1px solid rgba(255, 255, 255, 0.2); 
            background: rgba(255, 255, 255, 0.1); 
            color: white; 
            font-size: 1.5rem; 
            cursor: pointer;
        `;
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => modal.remove());
        
        const title = document.createElement('h2');
        title.id = 'modal-title';
        title.style.cssText = 'color: white; margin-bottom: 1.5rem;';
        title.textContent = `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        const description = document.createElement('p');
        description.style.cssText = 'color: rgba(255, 255, 255, 0.8);';
        description.textContent = 'Form creation functionality will be implemented here.';
        
        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modal.appendChild(modalContent);
        
        return modal;
    }

    // Enhanced Search and Filtering Components
    static createSearchAndFilterBar(options = {}) {
        const container = document.createElement('div');
        container.className = 'search-filter-bar';
        container.style.cssText = `
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--ig-radius-lg);
            flex-wrap: wrap;
            align-items: center;
        `;

        // Select all checkbox
        const selectAllContainer = document.createElement('div');
        selectAllContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-right: 1rem;
        `;

        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = 'select-all-checkbox';
        selectAllCheckbox.setAttribute('data-action', 'select-all');
        selectAllCheckbox.style.cssText = `
            width: 18px;
            height: 18px;
            cursor: pointer;
        `;

        const selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = 'select-all-checkbox';
        selectAllLabel.textContent = 'Select All';
        selectAllLabel.style.cssText = `
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.875rem;
            cursor: pointer;
        `;

        selectAllContainer.appendChild(selectAllCheckbox);
        selectAllContainer.appendChild(selectAllLabel);

        // Search input
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            flex: 1;
            min-width: 250px;
            position: relative;
        `;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = options.searchPlaceholder || 'Search content...';
        searchInput.className = 'search-input';
        searchInput.style.cssText = `
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--ig-radius-md);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        `;

        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search';
        searchIcon.style.cssText = `
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.5);
            pointer-events: none;
        `;

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);

        // Filter dropdowns
        const filtersContainer = document.createElement('div');
        filtersContainer.style.cssText = `
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        `;

        if (options.filters) {
            options.filters.forEach(filter => {
                const select = this.createFilterSelect(filter);
                filtersContainer.appendChild(select);
            });
        }

        // Sort dropdown
        if (options.sortOptions) {
            const sortSelect = this.createSortSelect(options.sortOptions);
            filtersContainer.appendChild(sortSelect);
        }

        // Clear filters button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-filters-btn';
        const clearIcon = document.createElement('i');
        clearIcon.className = 'fas fa-times';
        clearBtn.appendChild(clearIcon);
        clearBtn.appendChild(document.createTextNode(' Clear'));
        clearBtn.style.cssText = `
            padding: 0.75rem 1rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: var(--ig-radius-md);
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        container.appendChild(selectAllContainer);
        container.appendChild(searchContainer);
        container.appendChild(filtersContainer);
        container.appendChild(clearBtn);

        // Add event listeners
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (options.onSearch) {
                    options.onSearch(e.target.value);
                }
            }, 300);
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filtersContainer.querySelectorAll('select').forEach(select => {
                select.value = '';
            });
            if (options.onClear) {
                options.onClear();
            }
        });

        return container;
    }

    static createFilterSelect(filter) {
        const select = document.createElement('select');
        select.className = 'filter-select';
        select.dataset.filterType = filter.type;
        select.style.cssText = `
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--ig-radius-md);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 0.875rem;
            cursor: pointer;
            min-width: 120px;
        `;

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = filter.placeholder || `All ${filter.type}`;
        select.appendChild(defaultOption);

        // Add filter options
        filter.options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            select.appendChild(optionEl);
        });

        select.addEventListener('change', (e) => {
            if (filter.onChange) {
                filter.onChange(e.target.value);
            }
        });

        return select;
    }

    static createSortSelect(sortOptions) {
        const select = document.createElement('select');
        select.className = 'sort-select';
        select.style.cssText = `
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--ig-radius-md);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 0.875rem;
            cursor: pointer;
            min-width: 140px;
        `;

        sortOptions.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            if (option.default) {
                optionEl.selected = true;
            }
            select.appendChild(optionEl);
        });

        select.addEventListener('change', (e) => {
            if (sortOptions.onChange) {
                sortOptions.onChange(e.target.value);
            }
        });

        return select;
    }

    // Bulk Operations
    static createBulkActionsBar(options = {}) {
        const container = document.createElement('div');
        container.className = 'bulk-actions-bar';
        container.style.cssText = `
            display: none;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.5rem;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: var(--ig-radius-md);
            margin-bottom: 1rem;
        `;

        const selectedCount = document.createElement('span');
        selectedCount.className = 'selected-count';
        selectedCount.style.cssText = `
            color: #60a5fa;
            font-weight: 600;
            font-size: 0.875rem;
        `;

        const actionsContainer = document.createElement('div');
        actionsContainer.style.cssText = `
            display: flex;
            gap: 0.5rem;
            margin-left: auto;
        `;

        if (options.actions) {
            options.actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = `bulk-action-${action.type}`;
                const btnIcon = document.createElement('i');
                btnIcon.className = `fas fa-${action.icon}`;
                btn.appendChild(btnIcon);
                btn.appendChild(document.createTextNode(` ${action.label}`));
                btn.style.cssText = `
                    padding: 0.5rem 1rem;
                    border: 1px solid ${action.color}33;
                    border-radius: var(--ig-radius-sm);
                    background: ${action.color}22;
                    color: ${action.color};
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                `;

                btn.addEventListener('click', () => {
                    if (action.onClick) {
                        action.onClick();
                    }
                });

                actionsContainer.appendChild(btn);
            });
        }

        container.appendChild(selectedCount);
        container.appendChild(actionsContainer);

        return container;
    }

    // Advanced Content Grid with Selection
    static createSelectableContentGrid(items, type, options = {}) {
        const container = document.createElement('div');
        container.className = 'selectable-content-grid';
        container.style.cssText = `
            display: grid;
            gap: 1.5rem;
        `;

        const selectedItems = new Set();

        items.forEach(item => {
            const itemElement = this.createSelectableContentItem(item, type, {
                ...options,
                onSelectionChange: (id, selected) => {
                    if (selected) {
                        selectedItems.add(id);
                    } else {
                        selectedItems.delete(id);
                    }
                    
                    if (options.onSelectionChange) {
                        options.onSelectionChange(Array.from(selectedItems));
                    }
                }
            });
            container.appendChild(itemElement);
        });

        return container;
    }

    /**
     * Helper functions for website-style rendering
     */
    static getCategoryColor(category) {
        const colors = {
            workshop: '#3b82f6',
            seminar: '#10b981',
            competition: '#f59e0b',
            networking: '#f472b6',
            hackathon: '#8b5cf6',
            conference: '#ef4444',
            meeting: '#6b7280'
        };
        return colors[category] || '#6b7280';
    }

    static getCategoryIcon(category) {
        const icons = {
            workshop: 'tools',
            seminar: 'chalkboard-teacher',
            competition: 'trophy',
            networking: 'users',
            hackathon: 'code',
            conference: 'microphone',
            meeting: 'handshake'
        };
        return icons[category] || 'calendar';
    }

    static getOpportunityTypeIcon(type) {
        const icons = {
            internship: 'fa-user-graduate',
            job: 'fa-briefcase',
            scholarship: 'fa-graduation-cap',
            competition: 'fa-trophy',
            fellowship: 'fa-award',
            volunteer: 'fa-hands-helping'
        };
        return icons[type] || 'fa-briefcase';
    }

    static stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Pagination Component
    static createPagination(currentPage, totalPages, onPageChange) {
        const container = document.createElement('div');
        container.className = 'pagination';
        container.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 2rem;
            padding: 1rem;
        `;

        // Previous button
        const prevBtn = document.createElement('button');
        const prevIcon = document.createElement('i');
        prevIcon.className = 'fas fa-chevron-left';
        prevBtn.appendChild(prevIcon);
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.cssText = `
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--ig-radius-sm);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            ${currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}
        `;

        if (currentPage > 1) {
            prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
        }

        container.appendChild(prevBtn);

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            const firstPage = this.createPageButton(1, currentPage, onPageChange);
            container.appendChild(firstPage);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.cssText = 'color: rgba(255, 255, 255, 0.5); padding: 0 0.5rem;';
                container.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = this.createPageButton(i, currentPage, onPageChange);
            container.appendChild(pageBtn);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.cssText = 'color: rgba(255, 255, 255, 0.5); padding: 0 0.5rem;';
                container.appendChild(ellipsis);
            }
            
            const lastPage = this.createPageButton(totalPages, currentPage, onPageChange);
            container.appendChild(lastPage);
        }

        // Next button
        const nextBtn = document.createElement('button');
        const nextIcon = document.createElement('i');
        nextIcon.className = 'fas fa-chevron-right';
        nextBtn.appendChild(nextIcon);
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.cssText = `
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--ig-radius-sm);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            ${currentPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}
        `;

        if (currentPage < totalPages) {
            nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
        }

        container.appendChild(nextBtn);

        return container;
    }

    static createPageButton(pageNum, currentPage, onPageChange) {
        const btn = document.createElement('button');
        btn.textContent = pageNum;
        btn.style.cssText = `
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--ig-radius-sm);
            background: ${pageNum === currentPage ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
            color: ${pageNum === currentPage ? '#60a5fa' : 'white'};
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 40px;
        `;

        if (pageNum !== currentPage) {
            btn.addEventListener('click', () => onPageChange(pageNum));
        }

        return btn;
    }

    // File Upload Component
    static createFileUploadArea(options = {}) {
        const container = document.createElement('div');
        container.className = 'file-upload-area';
        container.style.cssText = `
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: var(--ig-radius-lg);
            padding: 3rem 2rem;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            cursor: pointer;
        `;

        const icon = document.createElement('i');
        icon.className = 'fas fa-cloud-upload-alt';
        icon.style.cssText = `
            font-size: 3rem;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 1rem;
            display: block;
        `;

        const title = document.createElement('div');
        title.textContent = options.title || 'Drop files here or click to upload';
        title.style.cssText = `
            color: white;
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        `;

        const subtitle = document.createElement('div');
        subtitle.textContent = options.subtitle || 'Supports images, documents, and videos';
        subtitle.style.cssText = `
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.875rem;
        `;

        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = options.multiple !== false;
        input.accept = options.accept || '*/*';
        input.style.display = 'none';

        container.appendChild(icon);
        container.appendChild(title);
        container.appendChild(subtitle);
        container.appendChild(input);

        // Event listeners
        container.addEventListener('click', () => input.click());

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            container.style.background = 'rgba(59, 130, 246, 0.1)';
        });

        container.addEventListener('dragleave', () => {
            container.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            container.style.background = 'rgba(255, 255, 255, 0.05)';
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            container.style.background = 'rgba(255, 255, 255, 0.05)';
            
            const files = Array.from(e.dataTransfer.files);
            if (options.onFilesSelected) {
                options.onFilesSelected(files);
            }
        });

        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (options.onFilesSelected) {
                options.onFilesSelected(files);
            }
        });

        return container;
    }

    // Progress Bar Component
    static createProgressBar(progress = 0, options = {}) {
        const container = document.createElement('div');
        container.className = 'progress-bar-container';
        container.style.cssText = `
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border-radius: var(--ig-radius-sm);
            overflow: hidden;
            height: ${options.height || '8px'};
        `;

        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            width: ${Math.max(0, Math.min(100, progress))}%;
            transition: width 0.3s ease;
            border-radius: var(--ig-radius-sm);
        `;

        container.appendChild(bar);

        // Method to update progress
        container.updateProgress = (newProgress) => {
            bar.style.width = `${Math.max(0, Math.min(100, newProgress))}%`;
        };

        return container;
    }

    // Toast Notification Component
    static createToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        // Validate type
        if (!colors[type]) type = 'info';

        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid ${colors[type]}33;
            border-left: 4px solid ${colors[type]};
            border-radius: var(--ig-radius-md);
            padding: 1rem 1.5rem;
            color: white;
            font-size: 0.875rem;
            max-width: 400px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        `;

        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'display: flex; align-items: center; gap: 0.75rem;';

        // Create icon
        const iconEl = document.createElement('i');
        iconEl.className = `fas fa-${icons[type]}`;
        iconEl.style.cssText = `color: ${colors[type]}; font-size: 1.125rem;`;

        // Create message
        const messageEl = document.createElement('span');
        messageEl.textContent = message;

        contentDiv.appendChild(iconEl);
        contentDiv.appendChild(messageEl);
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.style.cssText = `
            margin-left: auto; 
            background: none; 
            border: none; 
            color: rgba(255, 255, 255, 0.7); 
            cursor: pointer; 
            font-size: 1.125rem;
        `;
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toast.remove();
        });
        
        contentDiv.appendChild(closeButton);
        toast.appendChild(contentDiv);

        document.body.appendChild(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }

        return toast;
    }

    // Keyboard Shortcuts Helper
    static setupKeyboardShortcuts(shortcuts) {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            const alt = e.altKey;

            shortcuts.forEach(shortcut => {
                if (shortcut.key === key && 
                    shortcut.ctrl === ctrl && 
                    shortcut.shift === shift && 
                    shortcut.alt === alt) {
                    e.preventDefault();
                    shortcut.action();
                }
            });
        });
    }
}