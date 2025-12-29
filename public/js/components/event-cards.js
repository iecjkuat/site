/**
 * Event Cards Component
 * Handles event card rendering and interactions
 */

class EventCards {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }

    createEventCard(event) {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const isMultiDay = startDate.toDateString() !== endDate.toDateString();

        const dateStr = isMultiDay 
            ? `${this.eventsService.formatEventDate(event.start_date)} - ${this.eventsService.formatEventDate(event.end_date)}`
            : this.eventsService.formatEventDate(event.start_date);

        const timeStr = `${this.eventsService.formatEventTime(event.start_date)} - ${this.eventsService.formatEventTime(event.end_date)}`;

        const categoryColor = this.eventsService.getCategoryColor(event.event_type);
        const categoryIcon = this.eventsService.getCategoryIcon(event.event_type);

        const spotsText = event.max_attendees 
            ? `${event.stats.totalAttendees} of ${event.max_attendees} spots filled`
            : `${event.stats.totalAttendees} attendees`;

        const feeText = event.fee > 0 
            ? `KES ${event.fee.toLocaleString()}`
            : 'Free for members';

        const isRegistrationOpen = this.eventsService.isRegistrationOpen(event);

        return `
            <div class="event-card glass-card">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${categoryColor};"></div>
                
                <!-- Event Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <span class="category-badge" style="background: ${categoryColor}20; color: ${categoryColor};">
                        <i class="fas fa-${categoryIcon}"></i>${event.event_type}
                    </span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; font-weight: 500;">${dateStr}</span>
                </div>
                
                <!-- Event Title -->
                <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.75rem; line-height: 1.3;">${event.title}</h3>
                
                <!-- Event Description -->
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 0.875rem; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${event.description}
                </p>
                
                <!-- Event Details -->
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                        <i class="fas fa-clock" style="margin-right: 0.75rem; color: #10b981; width: 16px;"></i>
                        <span>${timeStr}</span>
                    </div>
                    <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                        <i class="fas fa-map-marker-alt" style="margin-right: 0.75rem; color: #3b82f6; width: 16px;"></i>
                        <span>${event.location}${event.venue_details ? `, ${event.venue_details}` : ''}</span>
                    </div>
                    <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                        <i class="fas fa-users" style="margin-right: 0.75rem; color: #f59e0b; width: 16px;"></i>
                        <span>${spotsText}</span>
                    </div>
                    <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                        <i class="fas fa-tag" style="margin-right: 0.75rem; color: #f472b6; width: 16px;"></i>
                        <span>${feeText}</span>
                    </div>
                </div>
                
                <!-- Event Tags -->
                ${this.createTagsSection(event.tags)}
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 0.75rem;">
                    <button 
                        class="details-btn btn btn-outline btn-sm"
                        data-event-id="${event.id}">
                        <i class="fas fa-info-circle"></i>Details
                    </button>
                    <button 
                        class="register-btn btn ${isRegistrationOpen ? 'btn-primary' : 'btn-glass'}"
                        data-event-id="${event.id}"
                        data-event-title="${event.title}"
                        data-event-fee="${event.fee}"
                        ${!isRegistrationOpen ? 'disabled' : ''}>
                        <i class="fas fa-${isRegistrationOpen ? 'calendar-plus' : 'calendar-times'}"></i>
                        ${isRegistrationOpen ? 'Register Now' : 'Registration Closed'}
                    </button>
                </div>
            </div>
        `;
    }

    createCompactEventCard(event) {
        const timeStr = `${this.eventsService.formatEventTime(event.start_date)} - ${this.eventsService.formatEventTime(event.end_date)}`;
        const categoryColor = this.eventsService.getCategoryColor(event.event_type);
        const isRegistrationOpen = this.eventsService.isRegistrationOpen(event);

        return `
            <div class="glass-card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <span style="background: ${categoryColor}20; color: ${categoryColor}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                        ${event.event_type}
                    </span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${timeStr}</span>
                </div>
                
                <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">${event.title}</h4>
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.4;">
                    ${event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}
                </p>
                
                <div style="display: flex; gap: 0.5rem;">
                    <button class="details-btn btn btn-outline btn-sm" data-event-id="${event.id}">
                        <i class="fas fa-info-circle"></i>Details
                    </button>
                    <button class="register-btn btn ${isRegistrationOpen ? 'btn-primary' : 'btn-glass'} btn-sm" 
                            data-event-id="${event.id}" data-event-title="${event.title}" data-event-fee="${event.fee}"
                            ${!isRegistrationOpen ? 'disabled' : ''}>
                        <i class="fas fa-${isRegistrationOpen ? 'calendar-plus' : 'calendar-times'}"></i>
                        ${isRegistrationOpen ? 'Register' : 'Closed'}
                    </button>
                </div>
            </div>
        `;
    }

    createTagsSection(tags) {
        if (!tags || tags.length === 0) return '';
        
        return `
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                ${tags.slice(0, 3).map(tag => `
                    <span style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
                        ${tag}
                    </span>
                `).join('')}
                ${tags.length > 3 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">+${tags.length - 3} more</span>` : ''}
            </div>
        `;
    }

    renderEvents(events, containerId) {
        console.log(`🎴 EventCards: Rendering ${events.length} events to container ${containerId}`);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ EventCards: Container ${containerId} not found!`);
            return;
        }

        if (events.length === 0) {
            console.log('📭 EventCards: No events to display, showing empty message');
            container.innerHTML = this.createNoEventsMessage();
            return;
        }

        const html = events.map(event => this.createEventCard(event)).join('');
        container.innerHTML = html;
        console.log(`✅ EventCards: Successfully rendered ${events.length} event cards`);
    }

    renderCompactEvents(events, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = events.map(event => this.createCompactEventCard(event)).join('');
    }

    createNoEventsMessage() {
        return `
            <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem;"></i>
                <h3 style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">No events found</h3>
                <p style="color: rgba(255, 255, 255, 0.6);">Try adjusting your filter or check back later for new events.</p>
            </div>
        `;
    }
}

window.EventCards = EventCards;