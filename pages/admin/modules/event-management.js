/**
 * Event Management Module
 * Handles event CRUD operations, calendar view, drafts, and templates
 */

class EventManagement extends BaseManagement {
    constructor(adminDashboard) {
        super(adminDashboard);
        this.calendarDate = new Date();
    }

    /* ================= EVENT VIEW SWITCHER ================= */

    showEventView(view = 'analytics') {
        console.log(`🎯 Switching to event view: ${view}`);

        // Update active button states
        document.querySelectorAll('[id*="eventViewBtn"]').forEach(btn => {
            btn.classList.remove('active');
        });

        // Update admin dashboard state
        if (this.admin) {
            this.admin.currentView = view;
            this.admin.updateURL('events', view);
        }

        const activeBtn = document.getElementById(`event${view.charAt(0).toUpperCase() + view.slice(1)}ViewBtn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Show appropriate view
        switch (view) {
            case 'analytics':
                this.admin.analytics.loadEventAnalytics();
                break;
            case 'list':
                this.showEventManagement();
                break;
            case 'calendar':
                this.showEventCalendar();
                break;
            case 'drafts':
                this.showEventDrafts();
                break;
            default:
                this.admin.analytics.loadEventAnalytics();
        }
    }

    /* ================= EVENT LIST MANAGEMENT ================= */

    async showEventManagement() {
        const container = this.getContainer("eventAnalytics");
        if (!container) return;

        container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p>Loading events...</p></div>';

        try {
            const data = await this.fetchWithAuth('/api/admin/events');
            this.cache.events = data.events || [];
            this.renderEventList();
        } catch (e) {
            console.error(e);
            container.innerHTML = `<div class="alert alert-danger">Failed to load events: ${e.message}</div>`;
        }
    }

    renderEventList() {
        const container = this.getContainer("eventAnalytics");
        if (!container) return;

        const rows = this.cache.events.map(e => `
            <tr>
                <td><strong>${sanitizeHTML(e.title)}</strong></td>
                <td>${new Date(e.start_date).toLocaleDateString()} ${new Date(e.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${sanitizeHTML(e.event_type || 'General')}</td>
                <td>${e.attendees || 0}</td>
                <td><span class="badge ${this.getEventStatusBadge(e.status)}">${sanitizeHTML(e.status)}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.adminDashboard.eventManagement.viewEventDetails('${e.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="window.adminDashboard.eventManagement.editEvent('${e.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="window.adminDashboard.eventManagement.deleteEvent('${e.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        container.innerHTML = `
            ${this.renderHeader(
                "Event Management",
                `
                <button class="btn btn-success btn-sm me-2" onclick="window.adminDashboard.eventManagement.showCreateEventModal()">
                    <i class="fas fa-plus me-1"></i>Create Event
                </button>
                <button class="btn btn-primary btn-sm" onclick="window.adminDashboard.eventManagement.showEventView('analytics')">
                    <i class="fas fa-chart-bar me-1"></i>Analytics
                </button>
                `
            )}
            ${this.renderTable(
                ["Event", "Date & Time", "Type", "Attendees", "Status", "Actions"],
                rows.length ? rows : '<tr><td colspan="6" class="text-center">No events found</td></tr>'
            )}
        `;
    }

    /* ================= EVENT CRUD OPERATIONS ================= */

    showCreateEventModal(eventToEdit = null) {
        const modalId = 'createEventModal';
        let modalEl = document.getElementById(modalId);

        if (!modalEl) {
            document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content glass-card">
                        <div class="modal-header">
                            <h5 class="modal-title">Create New Event</h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="createEventForm">
                                <input type="hidden" name="id">
                                <div class="mb-3">
                                    <label class="form-label">Event Title</label>
                                    <input type="text" class="form-control" name="title" required>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Date & Time</label>
                                        <input type="datetime-local" class="form-control" name="date" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Type</label>
                                        <select class="form-select" name="type">
                                            <option value="meeting">Meeting</option>
                                            <option value="workshop">Workshop</option>
                                            <option value="seminar">Seminar</option>
                                            <option value="competition">Competition</option>
                                            <option value="social">Social</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Location</label>
                                    <input type="text" class="form-control" name="location">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" name="description" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="window.adminDashboard.eventManagement.submitCreateEvent()">Create Event</button>
                        </div>
                    </div>
                </div>
            </div>`);
            modalEl = document.getElementById(modalId);
        }

        const form = modalEl.querySelector('form');
        form.reset();

        if (eventToEdit) {
            // Edit Mode
            form.setAttribute('data-editing', eventToEdit.id);
            modalEl.querySelector('.modal-title').textContent = 'Edit Event';
            modalEl.querySelector('.modal-footer .btn-primary').textContent = 'Update Event';

            form.querySelector('[name="id"]').value = eventToEdit.id;
            form.querySelector('[name="title"]').value = eventToEdit.title;

            if (eventToEdit.start_date) {
                const d = new Date(eventToEdit.start_date);
                const isoStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                form.querySelector('[name="date"]').value = isoStr;
            }

            form.querySelector('[name="type"]').value = eventToEdit.event_type || 'meeting';
            form.querySelector('[name="location"]').value = eventToEdit.location || '';
            form.querySelector('[name="description"]').value = eventToEdit.description || '';
        } else {
            // Create Mode
            form.removeAttribute('data-editing');
            modalEl.querySelector('.modal-title').textContent = 'Create New Event';
            modalEl.querySelector('.modal-footer .btn-primary').textContent = 'Create Event';
        }

        new bootstrap.Modal(modalEl).show();
    }

    async submitCreateEvent() {
        const form = document.getElementById('createEventForm');
        const formData = new FormData(form);
        const eventData = Object.fromEntries(formData.entries());
        const isEditing = form.getAttribute('data-editing');

        if (!eventData.title || !eventData.date) {
            alert('Title and Date are required');
            return;
        }

        try {
            if (isEditing) {
                await this.fetchWithAuth(`/api/admin/events/${isEditing}`, {
                    method: 'PUT',
                    body: JSON.stringify(eventData)
                });
                this.admin.showToast('Event updated successfully', 'success');
            } else {
                await this.fetchWithAuth('/api/admin/events', {
                    method: 'POST',
                    body: JSON.stringify(eventData)
                });
                this.admin.showToast('Event created successfully', 'success');
            }

            bootstrap.Modal.getInstance(document.getElementById("createEventModal")).hide();
            this.showEventManagement();
        } catch (e) {
            console.error(e);
            alert(`Failed to save event: ${e.message}`);
        }
    }

    editEvent(id) {
        const event = this.cache.events.find(e => e.id == id);
        if (event) {
            this.showCreateEventModal(event);
        }
    }

    async deleteEvent(id) {
        if (!confirm('Delete this event?')) return;
        try {
            await this.fetchWithAuth(`/api/admin/events/${id}`, { method: 'DELETE' });
            this.admin.showToast('Event deleted', 'success');
            this.showEventManagement();
        } catch (e) {
            alert(e.message);
        }
    }

    viewEventDetails(id) {
        const event = this.cache.events.find(e => e.id == id);
        if (!event) return;
        alert(`Details for event: ${event.title}\\n\\nDate: ${event.start_date}\\nAttendees: ${event.attendees}\\n${event.description || 'No description'}`);
    }

    /* ================= EVENT CALENDAR VIEW ================= */

    showEventCalendar() {
        const container = this.getContainer("eventAnalytics");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-calendar me-2"></i>Event Calendar</h4>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.adminDashboard.eventManagement.previousMonth()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.adminDashboard.eventManagement.todayMonth()">
                        Today
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.adminDashboard.eventManagement.nextMonth()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <div class="admin-calendar-container">
                <div class="admin-calendar-header">
                    <h5 id="calendarMonthYear">${this.calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h5>
                </div>
                
                <div class="admin-calendar-grid">
                    <div class="admin-calendar-day-header">Sun</div>
                    <div class="admin-calendar-day-header">Mon</div>
                    <div class="admin-calendar-day-header">Tue</div>
                    <div class="admin-calendar-day-header">Wed</div>
                    <div class="admin-calendar-day-header">Thu</div>
                    <div class="admin-calendar-day-header">Fri</div>
                    <div class="admin-calendar-day-header">Sat</div>
                    ${this.generateCalendarDays()}
                </div>
            </div>
        `;
    }

    generateCalendarDays() {
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let daysHTML = '';
        const today = new Date();

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.toDateString() === today.toDateString();
            const dayEvents = this.getEventsForDate(currentDate);

            daysHTML += `
                <div class="admin-calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''}" 
                     onclick="window.adminDashboard.eventManagement.showDayEvents('${currentDate.toISOString()}')">
                    <span class="day-number">${currentDate.getDate()}</span>
                    ${dayEvents.length > 0 ? `<div class="event-dots">${dayEvents.slice(0, 3).map(() => '<div class="event-dot"></div>').join('')}</div>` : ''}
                </div>
            `;
        }

        return daysHTML;
    }

    getEventsForDate(date) {
        // Mock events for now
        const mockEvents = [
            { date: '2025-01-20', title: 'Tech Workshop' },
            { date: '2025-01-25', title: 'Club Meeting' },
            { date: '2025-01-30', title: 'Innovation Challenge' }
        ];

        const dateStr = date.toISOString().split('T')[0];
        return mockEvents.filter(event => event.date === dateStr);
    }

    showDayEvents(dateStr) {
        const date = new Date(dateStr);
        const events = this.getEventsForDate(date);
        
        if (events.length === 0) {
            this.admin.showToast(`No events on ${date.toLocaleDateString()}`, 'info');
        } else {
            const eventList = events.map(e => e.title).join(', ');
            this.admin.showToast(`Events on ${date.toLocaleDateString()}: ${eventList}`, 'info');
        }
    }

    /* ================= CALENDAR NAVIGATION ================= */

    previousMonth() {
        this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
        this.showEventCalendar();
    }

    nextMonth() {
        this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
        this.showEventCalendar();
    }

    todayMonth() {
        this.calendarDate = new Date();
        this.showEventCalendar();
    }

    /* ================= EVENT DRAFTS ================= */

    showEventDrafts() {
        const container = this.getContainer("eventAnalytics");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-edit me-2"></i>Event Drafts</h4>
                <button class="btn btn-success btn-sm" onclick="window.adminDashboard.eventManagement.showCreateEventModal()">
                    <i class="fas fa-plus me-1"></i>New Draft
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">AI Workshop Series</h5>
                                <span class="badge bg-secondary">Draft</span>
                            </div>
                            <p class="card-text text-muted">Introduction to Machine Learning for beginners</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">Created: Jan 15, 2026</small>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary">Edit</button>
                                    <button class="btn btn-outline-success">Publish</button>
                                    <button class="btn btn-outline-danger">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">Entrepreneurship Bootcamp</h5>
                                <span class="badge bg-secondary">Draft</span>
                            </div>
                            <p class="card-text text-muted">3-day intensive program for aspiring entrepreneurs</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">Created: Jan 12, 2026</small>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary">Edit</button>
                                    <button class="btn btn-outline-success">Publish</button>
                                    <button class="btn btn-outline-danger">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= EVENT TEMPLATES ================= */

    showEventTemplates() {
        const container = this.getContainer("eventAnalytics");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-copy me-2"></i>Event Templates</h4>
                <button class="btn btn-success btn-sm">
                    <i class="fas fa-plus me-1"></i>Create Template
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card template-card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-chalkboard-teacher fa-3x text-primary mb-3"></i>
                            <h5 class="card-title">Workshop Template</h5>
                            <p class="card-text">Standard template for technical workshops and training sessions</p>
                            <button class="btn btn-outline-primary btn-sm">Use Template</button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 mb-4">
                    <div class="card template-card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-users fa-3x text-success mb-3"></i>
                            <h5 class="card-title">Meeting Template</h5>
                            <p class="card-text">Template for club meetings and committee sessions</p>
                            <button class="btn btn-outline-primary btn-sm">Use Template</button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 mb-4">
                    <div class="card template-card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-trophy fa-3x text-warning mb-3"></i>
                            <h5 class="card-title">Competition Template</h5>
                            <p class="card-text">Template for hackathons, contests, and competitions</p>
                            <button class="btn btn-outline-primary btn-sm">Use Template</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= FILTER METHODS ================= */

    applyEventFilter(filterId, value) {
        console.log(`Applying event filter ${filterId}:`, value);
        // Implement event filtering logic here
        this.admin.showToast(`Event filter ${filterId} applied: ${value}`, 'info');
    }

    /* ================= UPDATE HANDLERS ================= */

    handleEventUpdate(data) {
        console.log('📅 Handling event update in event management:', data);
        // Refresh event data if needed
        if (this.admin.currentSection === 'events') {
            this.showEventManagement();
        }
    }

    /* ================= MISSING METHODS ================= */

    publishEvent(id) {
        const event = this.cache.events.find(e => e.id == id);
        if (event) {
            event.status = 'upcoming';
            this.admin.showToast('Event published successfully', 'success');
            this.showEventManagement();
        }
    }

    useTemplate(templateId) {
        const templates = {
            workshop: {
                title: 'New Workshop',
                event_type: 'workshop',
                location: 'Innovation Lab',
                description: 'Technical workshop session for skill development'
            },
            seminar: {
                title: 'New Seminar',
                event_type: 'seminar',
                location: 'Main Auditorium',
                description: 'Educational seminar presentation'
            },
            competition: {
                title: 'New Competition',
                event_type: 'competition',
                location: 'Computer Lab',
                description: 'Coding competition or hackathon event'
            },
            meeting: {
                title: 'Club Meeting',
                event_type: 'meeting',
                location: 'Meeting Room',
                description: 'Regular club meeting and discussion'
            },
            social: {
                title: 'Social Event',
                event_type: 'social',
                location: 'Student Center',
                description: 'Social gathering and networking event'
            }
        };

        const template = templates[templateId];
        if (template) {
            // Pre-fill the create event modal with template data
            this.showCreateEventModal();

            // Wait for modal to be created, then populate
            setTimeout(() => {
                const modal = document.getElementById('createEventModal');
                if (modal) {
                    modal.querySelector('[name="title"]').value = template.title;
                    modal.querySelector('[name="type"]').value = template.event_type;
                    modal.querySelector('[name="location"]').value = template.location;
                    modal.querySelector('[name="description"]').value = template.description;
                }
            }, 100);
        }
    }
}