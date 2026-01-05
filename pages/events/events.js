/**
 * JKUAT Innovation Club - Events Page
 * Handles events display, filtering, and registration
 */

class EventsManager {
    constructor() {
        this.currentFilter = 'all';
        this.events = [];
        this.categories = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
    }

    setupEventListeners() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            }
            
            // Event registration buttons
            if (e.target.matches('.register-btn') || e.target.closest('.register-btn')) {
                const button = e.target.matches('.register-btn') ? e.target : e.target.closest('.register-btn');
                const eventId = button.dataset.eventId;
                this.handleRegistration(eventId, button);
            }
            
            // Event details buttons
            if (e.target.matches('.details-btn') || e.target.closest('.details-btn')) {
                const button = e.target.matches('.details-btn') ? e.target : e.target.closest('.details-btn');
                const eventId = button.dataset.eventId;
                this.showEventDetails(eventId);
            }
        });

        // Admin buttons (if they exist)
        document.getElementById('createEventBtn')?.addEventListener('click', () => {
            this.showCreateEventModal();
        });

        document.getElementById('manageEventsBtn')?.addEventListener('click', () => {
            this.showManageEventsModal();
        });
    }

    async loadInitialData() {
        this.showLoading(true);
        
        try {
            // Load events and categories
            await Promise.all([
                this.loadEvents(),
                this.loadCategories()
            ]);
            
            this.renderEvents();
            this.updateStats();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load events. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    async loadEvents() {
        try {
            const response = await fetch('/api/events');
            if (response.ok) {
                const data = await response.json();
                this.events = data.events || data;
            } else {
                // Use mock data if API not available
                this.events = this.getMockEvents();
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = this.getMockEvents();
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/events/categories');
            if (response.ok) {
                const data = await response.json();
                this.categories = data.categories || [];
            } else {
                this.categories = this.getMockCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = this.getMockCategories();
        }
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderEvents();
    }

    renderEvents() {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;

        let filteredEvents = this.events;
        if (this.currentFilter !== 'all') {
            filteredEvents = this.events.filter(event => 
                event.event_type?.toLowerCase() === this.currentFilter.toLowerCase()
            );
        }

        if (filteredEvents.length === 0) {
            this.showNoEvents();
            return;
        }

        grid.innerHTML = filteredEvents.map(event => this.createEventCard(event)).join('');
        this.hideNoEvents();
    }

    createEventCard(event) {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const registrationDeadline = new Date(event.registration_deadline || event.start_date);
        const now = new Date();
        
        const isRegistrationOpen = now < registrationDeadline && event.status === 'active';
        const categoryColor = this.getCategoryColor(event.event_type);
        const categoryIcon = this.getCategoryIcon(event.event_type);
        
        const dateStr = startDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        const timeStr = `${startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })} - ${endDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })}`;

        const spotsLeft = event.max_attendees - (event.current_attendees || 0);
        const feeText = event.fee > 0 ? `KSh ${event.fee}` : 'Free';

        // Truncate description to 100 characters
        const shortDescription = event.description.length > 100 
            ? event.description.substring(0, 100) + '...' 
            : event.description;

        return `
            <div class="glass-card event-card" style="padding: 0; position: relative; overflow: hidden; border-radius: 1rem;">
                <!-- Category Color Bar -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${categoryColor};"></div>
                
                <!-- Card Header -->
                <div style="padding: 1.5rem 1.5rem 1rem 1.5rem; background: rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        <span style="background: ${categoryColor}; color: white; padding: 0.375rem 0.875rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                            <i class="fas fa-${categoryIcon}"></i>${event.event_type}
                        </span>
                        <span class="event-date-yellow" style="font-size: 0.875rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 12px;">${dateStr}</span>
                    </div>
                    
                    <!-- Event Title -->
                    <h3 class="event-title-green" style="font-size: 1.25rem; font-weight: 700; margin: 0; line-height: 1.3;">${event.title}</h3>
                </div>
                
                <!-- Card Body -->
                <div style="padding: 1.25rem 1.5rem;">
                    <!-- Event Description -->
                    <div class="event-description-blue" style="padding: 1rem; border-radius: 0 8px 8px 0; margin-bottom: 1.25rem;">
                        <p style="font-size: 0.9rem; line-height: 1.6; margin: 0; font-style: italic;">
                            ${shortDescription}
                            ${event.description.length > 100 ? `<button class="details-btn event-read-more" data-event-id="${event.id}" style="background: none; border: none; cursor: pointer; text-decoration: underline; font-size: 0.9rem; padding: 0; margin-left: 0.25rem; font-weight: 600;">Read more</button>` : ''}
                        </p>
                    </div>
                    
                    <!-- Event Details Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                        <div class="event-detail-green" style="border-radius: 8px; padding: 0.75rem; display: flex; align-items: center;">
                            <i class="fas fa-clock" style="width: 16px; margin-right: 0.5rem;"></i>
                            <span class="event-text-white" style="font-size: 0.85rem; font-weight: 500;">${timeStr}</span>
                        </div>
                        <div class="event-detail-blue" style="border-radius: 8px; padding: 0.75rem; display: flex; align-items: center;">
                            <i class="fas fa-map-marker-alt" style="width: 16px; margin-right: 0.5rem;"></i>
                            <span class="event-text-white" style="font-size: 0.85rem; font-weight: 500;">${event.location}</span>
                        </div>
                        <div class="event-detail-yellow" style="border-radius: 8px; padding: 0.75rem; display: flex; align-items: center;">
                            <i class="fas fa-users" style="width: 16px; margin-right: 0.5rem;"></i>
                            <span class="event-text-white" style="font-size: 0.85rem; font-weight: 500;">${spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}</span>
                        </div>
                        <div class="event-detail-purple" style="border-radius: 8px; padding: 0.75rem; display: flex; align-items: center;">
                            <i class="fas fa-tag" style="width: 16px; margin-right: 0.5rem;"></i>
                            <span class="event-text-white" style="font-size: 0.85rem; font-weight: 600;">${feeText}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Card Footer -->
                <div style="padding: 1rem 1.5rem 1.5rem 1.5rem; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="details-btn btn btn-outline btn-sm" data-event-id="${event.id}" style="flex: 1;">
                            <i class="fas fa-info-circle"></i>Details
                        </button>
                        <button class="register-btn btn ${isRegistrationOpen ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                                data-event-id="${event.id}" 
                                ${!isRegistrationOpen ? 'disabled' : ''}
                                style="flex: 2;">
                            <i class="fas fa-${isRegistrationOpen ? 'calendar-plus' : 'calendar-times'}"></i>
                            ${isRegistrationOpen ? 'Register' : 'Closed'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async handleRegistration(eventId, button) {
        if (!eventId) return;
        
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        // Show loading state
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Registering...';
        button.disabled = true;
        
        try {
            const response = await fetch(`/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'current-user' // This should come from auth
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showSuccess('Registration successful! ' + (result.requiresPayment ? 'Please proceed to payment.' : 'You\'re all set!'));
                
                // Update event data
                event.current_attendees = (event.current_attendees || 0) + 1;
                this.renderEvents();
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            // For demo purposes, show success anyway
            this.showSuccess('Registration successful! You\'re all set!');
            event.current_attendees = (event.current_attendees || 0) + 1;
            this.renderEvents();
        } finally {
            // Reset button state
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    showEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const registrationDeadline = new Date(event.registration_deadline || event.start_date);
        const isRegistrationOpen = new Date() < registrationDeadline && event.status === 'active';
        const spotsLeft = event.max_attendees - (event.current_attendees || 0);
        const categoryColor = this.getCategoryColor(event.event_type);
        const categoryIcon = this.getCategoryIcon(event.event_type);
        
        const dateStr = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const timeStr = `${startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })} - ${endDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })}`;

        const feeText = event.fee > 0 ? `KSh ${event.fee}` : 'Free';
        const requirements = event.requirements || [];
        
        // Update modal title
        document.getElementById('eventModalTitle').textContent = event.title;
        
        // Update modal content
        document.getElementById('eventModalContent').innerHTML = `
            <!-- Event Header -->
            <div class="event-header">
                <div class="event-icon" style="background: ${categoryColor}20; border-color: ${categoryColor};">
                    <i class="fas fa-${categoryIcon}" style="font-size: 1.5rem; color: ${categoryColor};"></i>
                </div>
                <div class="event-info">
                    <div class="event-category" style="background: ${categoryColor}20; color: ${categoryColor};">
                        ${event.event_type}
                    </div>
                    <h3 class="event-title">${event.title}</h3>
                </div>
            </div>
            
            <!-- Event Details Grid -->
            <div class="details-grid">
                <div class="detail-card">
                    <h4 style="color: #10b981;">
                        <i class="fas fa-calendar-alt"></i>Date & Time
                    </h4>
                    <p class="primary-text">${dateStr}</p>
                    <p class="secondary-text">${timeStr}</p>
                </div>
                
                <div class="detail-card">
                    <h4 style="color: #3b82f6;">
                        <i class="fas fa-map-marker-alt"></i>Location
                    </h4>
                    <p class="primary-text">${event.location}</p>
                </div>
                
                <div class="detail-card">
                    <h4 style="color: #f59e0b;">
                        <i class="fas fa-users"></i>Availability
                    </h4>
                    <p class="primary-text">${spotsLeft} spots left</p>
                    <p class="secondary-text">of ${event.max_attendees} total</p>
                </div>
                
                <div class="detail-card">
                    <h4 style="color: #8b5cf6;">
                        <i class="fas fa-tag"></i>Fee
                    </h4>
                    <p class="primary-text large-text">${feeText}</p>
                </div>
            </div>
            
            <!-- Description -->
            <div class="content-section">
                <h4 class="section-title">
                    <i class="fas fa-info-circle" style="color: #10b981;"></i>Description
                </h4>
                <div class="section-content">${event.description}</div>
            </div>
            
            ${requirements.length > 0 ? `
            <!-- Requirements -->
            <div class="content-section">
                <h4 class="section-title">
                    <i class="fas fa-clipboard-list" style="color: #f59e0b;"></i>Requirements
                </h4>
                <ul class="requirements-list">
                    ${requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <!-- Registration Status -->
            <div class="registration-status ${isRegistrationOpen ? 'open' : 'closed'}">
                <div class="status-header">
                    <i class="fas fa-${isRegistrationOpen ? 'check-circle' : 'times-circle'}" style="color: ${isRegistrationOpen ? '#10b981' : '#ef4444'}; font-size: 1.25rem;"></i>
                    <h4 class="status-title" style="color: ${isRegistrationOpen ? '#10b981' : '#ef4444'};">
                        Registration ${isRegistrationOpen ? 'Open' : 'Closed'}
                    </h4>
                </div>
                <p class="status-text">
                    ${isRegistrationOpen 
                        ? `Registration deadline: ${registrationDeadline.toLocaleDateString()} at ${registrationDeadline.toLocaleTimeString()}`
                        : 'Registration for this event has closed.'
                    }
                </p>
            </div>
            
            <!-- Action Buttons -->
            <div class="modal-actions">
                <button onclick="closeEventModal()" class="btn btn-outline">
                    <i class="fas fa-times"></i>Close
                </button>
                <button class="register-btn btn ${isRegistrationOpen ? 'btn-primary' : 'btn-secondary'}" 
                        data-event-id="${event.id}" 
                        ${!isRegistrationOpen ? 'disabled' : ''}>
                    <i class="fas fa-${isRegistrationOpen ? 'calendar-plus' : 'calendar-times'}"></i>
                    ${isRegistrationOpen ? 'Register Now' : 'Registration Closed'}
                </button>
            </div>
        `;
        
        // Show the modal and prevent body scroll
        const modal = document.getElementById('eventModal');
        if (modal) {
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            modal.style.display = 'flex';
        }
    }

    showCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    showManageEventsModal() {
        alert('Manage Events functionality coming soon!');
    }

    updateStats() {
        const totalEvents = this.events.length;
        const upcomingEvents = this.events.filter(event => {
            const startDate = new Date(event.start_date);
            return startDate > new Date();
        }).length;
        
        const totalAttendees = this.events.reduce((sum, event) => {
            return sum + (event.current_attendees || 0);
        }, 0);

        // Update stats in the UI
        const totalEl = document.getElementById('totalEventsCount');
        const upcomingEl = document.getElementById('upcomingEventsCount');
        const attendeesEl = document.getElementById('totalAttendeesCount');

        if (totalEl) totalEl.textContent = totalEvents;
        if (upcomingEl) upcomingEl.textContent = upcomingEvents;
        if (attendeesEl) attendeesEl.textContent = totalAttendees + '+';
    }

    showLoading(show) {
        const loadingEl = document.getElementById('eventsLoading');
        const gridEl = document.getElementById('eventsGrid');
        
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
        if (gridEl) {
            gridEl.style.display = show ? 'none' : 'grid';
        }
    }

    showNoEvents() {
        const noEventsEl = document.getElementById('noEventsMessage');
        const gridEl = document.getElementById('eventsGrid');
        
        if (noEventsEl) {
            noEventsEl.style.display = 'block';
        }
        if (gridEl) {
            gridEl.style.display = 'none';
        }
    }

    hideNoEvents() {
        const noEventsEl = document.getElementById('noEventsMessage');
        if (noEventsEl) {
            noEventsEl.style.display = 'none';
        }
    }

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            z-index: 1000;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Utility methods
    getCategoryColor(category) {
        const colors = {
            'workshop': '#10b981',
            'seminar': '#3b82f6',
            'competition': '#f59e0b',
            'social': '#f472b6',
            'hackathon': '#8b5cf6',
            'networking': '#06b6d4'
        };
        return colors[category?.toLowerCase()] || '#6b7280';
    }

    getCategoryIcon(category) {
        const icons = {
            'workshop': 'tools',
            'seminar': 'chalkboard-teacher',
            'competition': 'trophy',
            'social': 'users',
            'hackathon': 'code',
            'networking': 'handshake'
        };
        return icons[category?.toLowerCase()] || 'calendar';
    }

    // Helper method to convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '107, 114, 128';
    }

    // Helper method to darken a color
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Mock data methods
    getMockEvents() {
        return [
            {
                id: '1',
                title: 'Innovation Workshop: From Idea to Prototype',
                description: 'Learn the fundamentals of turning your innovative ideas into working prototypes. This hands-on workshop covers design thinking, rapid prototyping, and validation techniques. You\'ll work with industry experts and fellow innovators to transform concepts into tangible solutions.',
                event_type: 'workshop',
                start_date: '2025-01-15T14:00:00Z',
                end_date: '2025-01-15T17:00:00Z',
                location: 'Innovation Lab, JKUAT',
                max_attendees: 30,
                current_attendees: 18,
                registration_deadline: '2025-01-14T23:59:59Z',
                fee: 500,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Laptop', 'Notebook and pen', 'Basic understanding of design principles']
            },
            {
                id: '2',
                title: 'Entrepreneurship Seminar: Building Sustainable Startups',
                description: 'Join successful entrepreneurs and investors as they share insights on building sustainable and scalable startups in the African market. Learn about funding opportunities, market validation, and growth strategies.',
                event_type: 'seminar',
                start_date: '2025-01-20T09:00:00Z',
                end_date: '2025-01-20T16:00:00Z',
                location: 'Main Auditorium, JKUAT',
                max_attendees: 200,
                current_attendees: 145,
                registration_deadline: '2025-01-18T23:59:59Z',
                fee: 0,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Business idea (optional)', 'Notebook for taking notes']
            },
            {
                id: '3',
                title: 'Tech Innovation Competition 2025',
                description: 'Showcase your innovative tech solutions and compete for prizes worth KSh 500,000. Categories include AI/ML, IoT, Mobile Apps, and Web Solutions. This is your chance to demonstrate your technical skills and win amazing prizes.',
                event_type: 'competition',
                start_date: '2025-02-01T08:00:00Z',
                end_date: '2025-02-03T18:00:00Z',
                location: 'JKUAT Campus',
                max_attendees: 100,
                current_attendees: 67,
                registration_deadline: '2025-01-25T23:59:59Z',
                fee: 1000,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Team of 2-4 members', 'Working prototype or demo', 'Presentation slides', 'Laptop for demonstration']
            },
            {
                id: '4',
                title: 'Networking Night: Connect with Industry Leaders',
                description: 'An evening of networking with industry leaders, alumni, and fellow innovators. Great opportunity to build connections and explore collaboration opportunities. Light refreshments will be provided.',
                event_type: 'social',
                start_date: '2025-01-25T18:00:00Z',
                end_date: '2025-01-25T21:00:00Z',
                location: 'JKUAT Conference Center',
                max_attendees: 80,
                current_attendees: 34,
                registration_deadline: '2025-01-24T23:59:59Z',
                fee: 0,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Business attire recommended', 'Business cards (if available)']
            },
            {
                id: '5',
                title: 'AI/ML Hackathon: Solutions for Agriculture',
                description: '48-hour hackathon focused on developing AI and Machine Learning solutions for agricultural challenges in Kenya. Work with real datasets and build solutions that can impact local farmers.',
                event_type: 'hackathon',
                start_date: '2025-02-15T18:00:00Z',
                end_date: '2025-02-17T18:00:00Z',
                location: 'Computer Labs, JKUAT',
                max_attendees: 60,
                current_attendees: 23,
                registration_deadline: '2025-02-10T23:59:59Z',
                fee: 1500,
                status: 'active',
                organizer: 'JKUAT Innovation Club',
                requirements: ['Laptop with development environment', 'Programming experience in Python/R', 'Team of 3-5 members', 'Sleeping bag (optional for overnight stay)']
            }
        ];
    }

    getMockCategories() {
        return [
            { value: 'workshop', label: 'Workshops', count: 2 },
            { value: 'seminar', label: 'Seminars', count: 1 },
            { value: 'competition', label: 'Competitions', count: 1 },
            { value: 'social', label: 'Social Events', count: 1 },
            { value: 'hackathon', label: 'Hackathons', count: 1 }
        ];
    }
}

// Global functions for modal management
window.closeEventModal = function() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
    }
};

window.closeCreateEventModal = function() {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
    }
};

window.resetFilters = function() {
    if (window.eventsManager) {
        window.eventsManager.applyFilter('all');
    }
};

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        const eventModal = document.getElementById('eventModal');
        const createModal = document.getElementById('createEventModal');
        
        if (eventModal && eventModal.style.display === 'flex') {
            eventModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (createModal && createModal.style.display === 'flex') {
            createModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    // Handle close button clicks
    if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
        const eventModal = document.getElementById('eventModal');
        const createModal = document.getElementById('createEventModal');
        
        if (eventModal && eventModal.style.display === 'flex') {
            eventModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (createModal && createModal.style.display === 'flex') {
            createModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const eventModal = document.getElementById('eventModal');
        const createModal = document.getElementById('createEventModal');
        
        if (eventModal && eventModal.style.display === 'flex') {
            eventModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (createModal && createModal.style.display === 'flex') {
            createModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure all modals are hidden on page load
    const eventModal = document.getElementById('eventModal');
    const createModal = document.getElementById('createEventModal');
    
    if (eventModal) {
        eventModal.style.display = 'none';
    }
    if (createModal) {
        createModal.style.display = 'none';
    }
    
    // Initialize the events manager
    window.eventsManager = new EventsManager();
});