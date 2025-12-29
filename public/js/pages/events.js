// JKUAT Innovation Club - Simplified Events Page

class EventsPage {
    constructor() {
        console.log('🚀 EventsPage: Initializing...');
        this.eventsService = new EventsService();
        this.eventCalendar = new EventCalendar();
        this.eventModal = new EventModal(this.eventsService);
        this.eventCards = new EventCards(this.eventsService);
        this.notifications = new EventNotifications();
        
        this.currentPage = 1;
        this.currentCategory = 'all';
        this.currentView = 'list';
        this.allEvents = [];
        this.filteredEvents = [];
        this.categories = [];
        this.isLoading = false;
        this.hasMoreEvents = true;
        
        console.log('🔧 EventsPage: Components created, starting init...');
        this.init();
    }

    async init() {
        console.log('🔧 EventsPage: Starting initialization...');
        this.bindEvents();
        await this.loadInitialData();
        this.setupCallbacks();
        console.log('✅ EventsPage: Initialization complete');
    }

    bindEvents() {
        // View toggle
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-btn')) {
                this.switchView(e.target.dataset.view);
            }
        });

        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.filterByCategory(e.target.dataset.category);
            }
        });

        // Calendar navigation
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
            this.eventCalendar.navigateMonth(-1);
        });

        document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
            this.eventCalendar.navigateMonth(1);
        });

        document.getElementById('todayBtn')?.addEventListener('click', () => {
            this.eventCalendar.goToToday();
        });

        // Event actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('details-btn')) {
                this.eventModal.show(e.target.dataset.eventId);
            }
            
            if (e.target.classList.contains('register-btn')) {
                this.handleEventRegistration(e);
            }
            
            if (e.target.id === 'loadMoreBtn') {
                this.loadMoreEvents();
            }
        });
    }

    setupCallbacks() {
        // Calendar date selection
        this.eventCalendar.setDateSelectCallback((dateStr, events) => {
            this.showSelectedDateEvents(dateStr, events);
        });

        // Modal registration
        this.eventModal.setRegisterCallback((eventData) => {
            this.handleEventRegistration(eventData);
        });
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadCategories(),
                this.loadEvents()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showErrorState();
        }
    }

    async loadCategories() {
        try {
            const data = await this.eventsService.getCategories();
            this.categories = data.categories || [];
            this.renderCategoryFilters();
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.categories = this.getDefaultCategories();
            this.renderCategoryFilters();
        }
    }

    async loadEvents(page = 1, category = 'all') {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const params = { page, limit: 12, upcoming: true };
            if (category !== 'all') {
                params.category = category;
            }

            const data = await this.eventsService.getEvents(params);

            if (page === 1) {
                this.allEvents = data.events || [];
                this.filteredEvents = [...this.allEvents];
            } else {
                this.allEvents = [...this.allEvents, ...(data.events || [])];
                this.filteredEvents = [...this.allEvents];
            }

            this.hasMoreEvents = data.pagination.current < data.pagination.total;
            this.currentPage = page;

            this.renderCurrentView();
            this.updateStats();

        } catch (error) {
            console.error('Failed to load events:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    switchView(view) {
        this.currentView = view;
        this.updateViewButtons(view);
        this.showViewSection(view);
        this.renderCurrentView();
    }

    updateViewButtons(activeView) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        const activeBtn = document.querySelector(`[data-view="${activeView}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            activeBtn.style.color = 'white';
        }
    }

    showViewSection(view) {
        const eventsSection = document.getElementById('eventsSection');
        const calendarSection = document.getElementById('calendarSection');
        const categoryFiltersContainer = document.getElementById('categoryFiltersContainer');

        if (view === 'calendar') {
            if (eventsSection) eventsSection.style.display = 'none';
            if (calendarSection) calendarSection.style.display = 'block';
            if (categoryFiltersContainer) categoryFiltersContainer.style.display = 'none';
        } else {
            if (eventsSection) eventsSection.style.display = 'block';
            if (calendarSection) calendarSection.style.display = 'none';
            if (categoryFiltersContainer) categoryFiltersContainer.style.display = 'block';
        }
    }

    renderCurrentView() {
        console.log(`📊 EventsPage: Rendering ${this.currentView} view with ${this.filteredEvents.length} events`);
        if (this.currentView === 'calendar') {
            this.eventCalendar.setEvents(this.allEvents);
        } else {
            this.eventCards.renderEvents(this.filteredEvents, 'eventsGrid');
            this.updateLoadMoreButton();
        }
    }

    showSelectedDateEvents(dateStr, events) {
        const selectedDateEvents = document.getElementById('selectedDateEvents');
        const selectedDateTitle = document.getElementById('selectedDateTitle');

        if (events.length > 0) {
            const date = new Date(dateStr);
            selectedDateTitle.textContent = `Events on ${date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}`;
            
            this.eventCards.renderCompactEvents(events, 'selectedDateEventsGrid');
            selectedDateEvents.style.display = 'block';
        } else {
            selectedDateEvents.style.display = 'none';
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.updateCategoryButtons(category);
        
        if (category === 'all') {
            this.filteredEvents = [...this.allEvents];
        } else {
            this.filteredEvents = this.allEvents.filter(event => event.event_type === category);
        }

        this.renderCurrentView();
    }

    updateCategoryButtons(activeCategory) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${activeCategory}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    async handleEventRegistration(event) {
        const button = event.target;
        const eventId = button.dataset.eventId;
        const eventTitle = button.dataset.eventTitle;
        const eventFee = parseFloat(button.dataset.eventFee);

        // Check authentication
        const authManager = window.jkuatApp?.getModule('auth');
        if (!authManager || !authManager.isLoggedIn()) {
            this.notifications.showToast('Login Required', 'Please login to register for events', 'warning');
            return;
        }

        // Confirm registration
        const confirmMessage = eventFee > 0 
            ? `Register for "${eventTitle}"?\n\nRegistration fee: KES ${eventFee.toLocaleString()}`
            : `Register for "${eventTitle}"?\n\nThis event is free for members.`;

        if (!confirm(confirmMessage)) return;

        // Show loading
        const originalText = button.innerHTML;
        button.innerHTML = '<div class="spinner"></div>Registering...';
        button.disabled = true;

        try {
            const user = authManager.getUser();
            const result = await this.eventsService.registerForEvent(eventId, user.id);

            this.notifications.showToast('Registration Successful', 
                result.requiresPayment ? 'Please proceed to payment' : 'You\'re all set!', 
                'success');

            if (result.requiresPayment) {
                window.location.href = `/payment?event=${eventId}&registration=${result.registration.id}`;
            } else {
                await this.loadEvents(1, this.currentCategory);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.notifications.showToast('Registration Failed', error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async loadMoreEvents() {
        await this.loadEvents(this.currentPage + 1, this.currentCategory);
    }

    renderCategoryFilters() {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        const allButton = container.querySelector('.category-btn[data-category="all"]');
        container.innerHTML = '';
        
        if (allButton) {
            container.appendChild(allButton);
        }

        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn btn-glass';
            button.dataset.category = category.value;
            button.innerHTML = `
                <i class="fas fa-${this.eventsService.getCategoryIcon(category.value)}"></i>
                ${category.label}
                ${category.count > 0 ? `<span class="badge">${category.count}</span>` : ''}
            `;
            container.appendChild(button);
        });
    }

    updateStats() {
        const totalEventsEl = document.getElementById('totalEventsCount');
        const upcomingEventsEl = document.getElementById('upcomingEventsCount');
        const totalAttendeesEl = document.getElementById('totalAttendeesCount');

        if (totalEventsEl) totalEventsEl.textContent = this.allEvents.length;
        
        if (upcomingEventsEl) {
            const upcomingCount = this.allEvents.filter(event => 
                event.status === 'upcoming' && new Date(event.start_date) > new Date()
            ).length;
            upcomingEventsEl.textContent = upcomingCount;
        }

        if (totalAttendeesEl) {
            const totalAttendees = this.allEvents.reduce((sum, event) => 
                sum + (event.stats?.totalAttendees || 0), 0
            );
            totalAttendeesEl.textContent = totalAttendees;
        }
    }

    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = this.hasMoreEvents ? 'block' : 'none';
        }
    }

    showLoadingState() {
        const loadingEl = document.getElementById('eventsLoading');
        const eventsSection = document.getElementById('eventsSection');

        if (loadingEl) loadingEl.style.display = 'block';
        if (eventsSection) eventsSection.style.display = 'none';
    }

    hideLoadingState() {
        const loadingEl = document.getElementById('eventsLoading');
        const eventsSection = document.getElementById('eventsSection');

        if (loadingEl) loadingEl.style.display = 'none';
        if (eventsSection) eventsSection.style.display = 'block';
    }

    showErrorState() {
        this.notifications.showToast('Error', 'Failed to load events', 'error');
    }

    getDefaultCategories() {
        return [
            { value: 'workshop', label: 'Workshop', count: 0 },
            { value: 'seminar', label: 'Seminar', count: 0 },
            { value: 'hackathon', label: 'Hackathon', count: 0 },
            { value: 'competition', label: 'Competition', count: 0 },
            { value: 'networking', label: 'Networking', count: 0 }
        ];
    }
}

// Global function for reset filters
function resetFilters() {
    if (window.eventsPageInstance) {
        window.eventsPageInstance.filterByCategory('all');
    }
}

// Make available globally
window.EventsPage = EventsPage;

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadCategories(),
                this.loadEvents()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showErrorState();
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        document.querySelector(`[data-view="${view}"]`).style.background = 'linear-gradient(135deg, #10b981, #059669)';
        document.querySelector(`[data-view="${view}"]`).style.color = 'white';

        // Show/hide sections
        const eventsSection = document.getElementById('eventsSection');
        const calendarSection = document.getElementById('calendarSection');
        const categoryFiltersContainer = document.getElementById('categoryFiltersContainer');

        if (view === 'calendar') {
            if (eventsSection) eventsSection.style.display = 'none';
            if (calendarSection) calendarSection.style.display = 'block';
            if (categoryFiltersContainer) categoryFiltersContainer.style.display = 'none';
            this.renderCalendar();
        } else {
            if (eventsSection) eventsSection.style.display = 'block';
            if (calendarSection) calendarSection.style.display = 'none';
            if (categoryFiltersContainer) categoryFiltersContainer.style.display = 'block';
            this.renderEvents();
        }
    }

    initializeCalendar() {
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const calendarTitle = document.getElementById('calendarTitle');
        
        if (!calendarGrid || !calendarTitle) return;

        // Update title
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        calendarTitle.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Clear calendar
        calendarGrid.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Generate calendar days
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dateStr = date.toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === this.selectedDate;
            const dayEvents = this.getEventsForDate(dateStr);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.dataset.date = dateStr;
            dayElement.style.cssText = `
                min-height: 80px;
                padding: 0.5rem;
                background: ${isCurrentMonth ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
                border: 1px solid ${isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.1)'};
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                ${isToday ? 'box-shadow: inset 0 0 0 2px #3b82f6;' : ''}
            `;

            dayElement.innerHTML = `
                <div style="font-weight: ${isToday ? '700' : '500'}; color: ${isCurrentMonth ? 'white' : 'rgba(255, 255, 255, 0.4)'}; margin-bottom: 0.25rem;">
                    ${date.getDate()}
                </div>
                ${dayEvents.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 1px;">
                        ${dayEvents.slice(0, 2).map(event => `
                            <div style="background: ${this.eventsService.getCategoryColor(event.event_type)}; color: white; font-size: 0.625rem; padding: 1px 4px; border-radius: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${event.title}
                            </div>
                        `).join('')}
                        ${dayEvents.length > 2 ? `
                            <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.625rem;">+${dayEvents.length - 2} more</div>
                        ` : ''}
                    </div>
                ` : ''}
            `;

            // Hover effects
            dayElement.addEventListener('mouseenter', () => {
                if (isCurrentMonth) {
                    dayElement.style.background = 'rgba(255, 255, 255, 0.1)';
                }
            });

            dayElement.addEventListener('mouseleave', () => {
                dayElement.style.background = isCurrentMonth ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
            });

            calendarGrid.appendChild(dayElement);
        }
    }

    getEventsForDate(dateStr) {
        return this.allEvents.filter(event => {
            const eventDate = new Date(event.start_date).toISOString().split('T')[0];
            return eventDate === dateStr;
        });
    }

    selectCalendarDate(dateStr) {
        this.selectedDate = dateStr;
        this.renderCalendar();
        
        const events = this.getEventsForDate(dateStr);
        const selectedDateEvents = document.getElementById('selectedDateEvents');
        const selectedDateTitle = document.getElementById('selectedDateTitle');
        const selectedDateEventsGrid = document.getElementById('selectedDateEventsGrid');

        if (events.length > 0) {
            const date = new Date(dateStr);
            selectedDateTitle.textContent = `Events on ${date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}`;
            
            selectedDateEventsGrid.innerHTML = events.map(event => this.createCompactEventCard(event)).join('');
            selectedDateEvents.style.display = 'block';
        } else {
            selectedDateEvents.style.display = 'none';
        }
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

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }

    async loadCategories() {
        try {
            const data = await this.eventsService.getCategories();
            this.categories = data.categories || [];
            this.renderCategoryFilters();
        } catch (error) {
            console.error('Failed to load categories:', error);
            // Use default categories
            this.categories = [
                { value: 'workshop', label: 'Workshop', count: 0 },
                { value: 'seminar', label: 'Seminar', count: 0 },
                { value: 'hackathon', label: 'Hackathon', count: 0 },
                { value: 'competition', label: 'Competition', count: 0 },
                { value: 'networking', label: 'Networking', count: 0 }
            ];
            this.renderCategoryFilters();
        }
    }

    async loadEvents(page = 1, category = 'all') {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const params = { page, limit: 12, upcoming: true };
            if (category !== 'all') {
                params.category = category;
            }

            const data = await this.eventsService.getEvents(params);

            if (page === 1) {
                this.allEvents = data.events || [];
                this.filteredEvents = [...this.allEvents];
            } else {
                this.allEvents = [...this.allEvents, ...(data.events || [])];
                this.filteredEvents = [...this.allEvents];
            }

            this.hasMoreEvents = data.pagination.current < data.pagination.total;
            this.currentPage = page;

            this.renderEvents();
            this.updateStats();
            this.updateCategoryCounts();

        } catch (error) {
            console.error('Failed to load events:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    renderCategoryFilters() {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        // Keep the "All Events" button
        const allButton = container.querySelector('.category-btn[data-category="all"]');
        container.innerHTML = '';
        if (allButton) {
            container.appendChild(allButton);
        } else {
            // Create all events button if it doesn't exist
            const allBtn = document.createElement('button');
            allBtn.className = 'category-btn btn-glass active';
            allBtn.dataset.category = 'all';
            allBtn.innerHTML = '<i class="fas fa-th-large"></i> All Events';
            container.appendChild(allBtn);
        }

        // Add category buttons
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn btn-glass';
            button.dataset.category = category.value;
            button.innerHTML = `
                <i class="fas fa-${this.eventsService.getCategoryIcon(category.value)}"></i>
                ${category.label}
                ${category.count > 0 ? `<span class="badge">${category.count}</span>` : ''}
            `;
            container.appendChild(button);
        });
    }

    renderEvents() {
        const eventsGrid = document.getElementById('eventsGrid');
        const noEventsMessage = document.getElementById('noEventsMessage');
        const loadMoreContainer = document.getElementById('loadMoreContainer');

        if (!eventsGrid) return;

        if (this.filteredEvents.length === 0) {
            eventsGrid.innerHTML = '';
            if (noEventsMessage) noEventsMessage.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        if (noEventsMessage) noEventsMessage.style.display = 'none';

        eventsGrid.innerHTML = this.filteredEvents.map(event => this.createEventCard(event)).join('');

        // Show/hide load more button
        if (loadMoreContainer) {
            loadMoreContainer.style.display = this.hasMoreEvents ? 'block' : 'none';
        }
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
                ${event.tags && event.tags.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${event.tags.slice(0, 3).map(tag => `
                            <span style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
                                ${tag}
                            </span>
                        `).join('')}
                        ${event.tags.length > 3 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">+${event.tags.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
                
                <!-- Registration Button -->
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

    async handleEventRegistration(event) {
        const button = event.target;
        const eventId = button.dataset.eventId;
        const eventTitle = button.dataset.eventTitle;
        const eventFee = parseFloat(button.dataset.eventFee);

        // Check if user is logged in
        const authManager = window.jkuatApp.getModule('auth');
        if (!authManager.isLoggedIn()) {
            alert('Please login to register for events.');
            authManager.showLogin();
            return;
        }

        // Confirm registration
        const confirmMessage = eventFee > 0 
            ? `Register for "${eventTitle}"?\n\nRegistration fee: KES ${eventFee.toLocaleString()}\n\nYou will be redirected to payment after registration.`
            : `Register for "${eventTitle}"?\n\nThis event is free for members.`;

        if (!confirm(confirmMessage)) {
            return;
        }

        // Show loading state
        const originalText = button.innerHTML;
        button.innerHTML = '<div class="spinner"></div>Registering...';
        button.disabled = true;

        try {
            const user = authManager.getUser();
            const result = await this.eventsService.registerForEvent(eventId, user.id);

            alert('Registration successful! ' + (result.requiresPayment ? 'Please proceed to payment.' : 'You\'re all set!'));

            if (result.requiresPayment) {
                window.location.href = `/payment?event=${eventId}&registration=${result.registration.id}`;
            } else {
                // Reload events to update attendee count
                await this.loadEvents(1, this.currentCategory);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        } finally {
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;

        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Filter events
        if (category === 'all') {
            this.filteredEvents = [...this.allEvents];
        } else {
            this.filteredEvents = this.allEvents.filter(event => event.event_type === category);
        }

        this.renderEvents();
    }

    async loadMoreEvents() {
        await this.loadEvents(this.currentPage + 1, this.currentCategory);
    }

    updateStats() {
        const totalEventsEl = document.getElementById('totalEventsCount');
        const upcomingEventsEl = document.getElementById('upcomingEventsCount');
        const totalAttendeesEl = document.getElementById('totalAttendeesCount');

        if (totalEventsEl) {
            totalEventsEl.textContent = this.allEvents.length;
        }

        if (upcomingEventsEl) {
            const upcomingCount = this.allEvents.filter(event => 
                event.status === 'upcoming' && new Date(event.start_date) > new Date()
            ).length;
            upcomingEventsEl.textContent = upcomingCount;
        }

        if (totalAttendeesEl) {
            const totalAttendees = this.allEvents.reduce((sum, event) => 
                sum + (event.stats?.totalAttendees || 0), 0
            );
            totalAttendeesEl.textContent = totalAttendees;
        }
    }

    updateCategoryCounts() {
        this.categories.forEach(category => {
            const count = this.allEvents.filter(event => event.event_type === category.value).length;
            category.count = count;
        });
        this.renderCategoryFilters();
    }

    showLoadingState() {
        const loadingEl = document.getElementById('eventsLoading');
        const eventsSection = document.getElementById('eventsSection');

        if (loadingEl) loadingEl.style.display = 'block';
        if (eventsSection) eventsSection.style.display = 'none';
    }

    hideLoadingState() {
        const loadingEl = document.getElementById('eventsLoading');
        const eventsSection = document.getElementById('eventsSection');

        if (loadingEl) loadingEl.style.display = 'none';
        if (eventsSection) eventsSection.style.display = 'block';
    }

    showErrorState() {
        const eventsGrid = document.getElementById('eventsGrid');
        const noEventsMessage = document.getElementById('noEventsMessage');

        if (eventsGrid) eventsGrid.innerHTML = '';
        if (noEventsMessage) {
            noEventsMessage.style.display = 'block';
            noEventsMessage.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 3rem; max-width: 500px; margin: 0 auto;">
                    <div style="width: 80px; height: 80px; background: rgba(239, 68, 68, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444;"></i>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem;">Error Loading Events</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem;">We're having trouble loading events right now. Please try again later.</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i>Try Again
                    </button>
                </div>
            `;
        }
    }

    // Event Details Modal Methods
    async showEventDetails(eventId) {
        try {
            const event = await this.eventsService.getEvent(eventId);
            this.currentModalEvent = event;
            
            // Populate modal content
            document.getElementById('modalEventTitle').textContent = event.title;
            
            const categoryEl = document.getElementById('modalEventCategory');
            const categoryColor = this.eventsService.getCategoryColor(event.event_type);
            categoryEl.textContent = event.event_type;
            categoryEl.style.background = `${categoryColor}20`;
            categoryEl.style.color = categoryColor;
            
            // Event details
            const detailsEl = document.getElementById('modalEventDetails');
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            const isMultiDay = startDate.toDateString() !== endDate.toDateString();
            
            detailsEl.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">📅 Date & Time</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.25rem;">
                            ${isMultiDay 
                                ? `${this.eventsService.formatEventDate(event.start_date)} - ${this.eventsService.formatEventDate(event.end_date)}`
                                : this.eventsService.formatEventDate(event.start_date)
                            }
                        </p>
                        <p style="color: rgba(255, 255, 255, 0.8);">
                            ${this.eventsService.formatEventTime(event.start_date)} - ${this.eventsService.formatEventTime(event.end_date)}
                        </p>
                    </div>
                    
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">📍 Location</h4>
                        <p style="color: rgba(255, 255, 255, 0.8);">${event.location}</p>
                        ${event.venue_details ? `<p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${event.venue_details}</p>` : ''}
                    </div>
                    
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">👥 Attendance</h4>
                        <p style="color: rgba(255, 255, 255, 0.8);">
                            ${event.stats.totalAttendees} ${event.max_attendees ? `of ${event.max_attendees}` : ''} attendees
                        </p>
                        ${event.max_attendees && event.stats.spotsRemaining !== null ? 
                            `<p style="color: ${event.stats.spotsRemaining > 0 ? '#10b981' : '#ef4444'}; font-size: 0.875rem;">
                                ${event.stats.spotsRemaining > 0 ? `${event.stats.spotsRemaining} spots remaining` : 'Event is full'}
                            </p>` : ''
                        }
                    </div>
                    
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">💰 Fee</h4>
                        <p style="color: rgba(255, 255, 255, 0.8);">
                            ${event.fee > 0 ? `KES ${event.fee.toLocaleString()}` : 'Free for members'}
                        </p>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">📝 Description</h4>
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${event.description}</p>
                </div>
                
                ${event.tags && event.tags.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">🏷️ Tags</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${event.tags.map(tag => `
                                <span style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2);">
                                    ${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${event.registration_deadline ? `
                    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
                        <h4 style="color: #f59e0b; font-weight: 600; margin-bottom: 0.5rem;">⏰ Registration Deadline</h4>
                        <p style="color: rgba(255, 255, 255, 0.8);">
                            ${new Date(event.registration_deadline).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                ` : ''}
            `;
            
            // Generate QR code for registered users
            const authManager = window.jkuatApp?.getModule('auth');
            if (authManager && authManager.isLoggedIn()) {
                this.generateEventQRCode(event);
            }
            
            // Update modal buttons
            const registerBtn = document.getElementById('modalRegisterBtn');
            const isRegistrationOpen = this.eventsService.isRegistrationOpen(event);
            
            if (isRegistrationOpen) {
                registerBtn.innerHTML = '<i class="fas fa-calendar-plus"></i>Register for Event';
                registerBtn.className = 'btn btn-primary';
                registerBtn.disabled = false;
            } else {
                registerBtn.innerHTML = '<i class="fas fa-calendar-times"></i>Registration Closed';
                registerBtn.className = 'btn btn-glass';
                registerBtn.disabled = true;
            }
            
            // Show modal
            document.getElementById('eventDetailsModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            console.error('Error loading event details:', error);
            this.showNotification('Error', 'Failed to load event details', 'error');
        }
    }

    closeModal() {
        document.getElementById('eventDetailsModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentModalEvent = null;
    }

    async generateEventQRCode(event) {
        try {
            const qrData = {
                eventId: event.id,
                eventTitle: event.title,
                attendeeId: window.jkuatApp?.getModule('auth')?.getUser()?.id,
                timestamp: new Date().toISOString()
            };
            
            const qrCodeContainer = document.getElementById('qrCodeContainer');
            const qrCodeSection = document.getElementById('qrCodeSection');
            
            // Clear previous QR code
            qrCodeContainer.innerHTML = '';
            
            // Generate QR code
            await QRCode.toCanvas(qrCodeContainer, JSON.stringify(qrData), {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            qrCodeSection.style.display = 'block';
            
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    async handleModalRegistration() {
        if (!this.currentModalEvent) return;
        
        const event = {
            target: {
                dataset: {
                    eventId: this.currentModalEvent.id,
                    eventTitle: this.currentModalEvent.title,
                    eventFee: this.currentModalEvent.fee
                }
            }
        };
        
        await this.handleEventRegistration(event);
        this.closeModal();
    }

    shareEvent() {
        if (!this.currentModalEvent) return;
        
        const event = this.currentModalEvent;
        const shareData = {
            title: event.title,
            text: `Join me at ${event.title} - ${event.description.substring(0, 100)}...`,
            url: `${window.location.origin}/events?event=${event.id}`
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
            this.showNotification('Shared', 'Event details copied to clipboard', 'success');
        }
    }

    setEventReminder() {
        if (!this.currentModalEvent) return;
        
        const event = this.currentModalEvent;
        const eventDate = new Date(event.start_date);
        const reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
        
        // Store reminder in localStorage
        const reminders = JSON.parse(localStorage.getItem('eventReminders') || '[]');
        const reminder = {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.start_date,
            reminderTime: reminderTime.toISOString(),
            created: new Date().toISOString()
        };
        
        reminders.push(reminder);
        localStorage.setItem('eventReminders', JSON.stringify(reminders));
        
        this.showNotification('Reminder Set', `You'll be reminded 24 hours before ${event.title}`, 'success');
        
        // Schedule notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            this.scheduleNotification(reminder);
        }
    }

    // Notification System
    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Check for due reminders
        this.checkReminders();
        
        // Set up periodic reminder checks
        setInterval(() => {
            this.checkReminders();
        }, 60000); // Check every minute
    }

    checkReminders() {
        const reminders = JSON.parse(localStorage.getItem('eventReminders') || '[]');
        const now = new Date();
        
        reminders.forEach((reminder, index) => {
            const reminderTime = new Date(reminder.reminderTime);
            
            if (now >= reminderTime && !reminder.sent) {
                this.sendReminder(reminder);
                
                // Mark as sent
                reminders[index].sent = true;
                localStorage.setItem('eventReminders', JSON.stringify(reminders));
            }
        });
    }

    sendReminder(reminder) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Event Reminder: ${reminder.eventTitle}`, {
                body: `Your event starts in 24 hours`,
                icon: '/assets/images/logo.png',
                tag: `event-${reminder.eventId}`
            });
        }
        
        // In-app notification
        this.showNotification(
            'Event Reminder', 
            `${reminder.eventTitle} starts tomorrow!`, 
            'info'
        );
    }

    scheduleNotification(reminder) {
        const now = new Date();
        const reminderTime = new Date(reminder.reminderTime);
        const delay = reminderTime.getTime() - now.getTime();
        
        if (delay > 0) {
            setTimeout(() => {
                this.sendReminder(reminder);
            }, delay);
        }
    }

    showNotification(title, message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const toastIcon = document.getElementById('toastIcon');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast) return;
        
        // Set icon and color based on type
        const config = {
            success: { icon: 'fas fa-check-circle', color: '#10b981' },
            error: { icon: 'fas fa-exclamation-circle', color: '#ef4444' },
            info: { icon: 'fas fa-info-circle', color: '#3b82f6' },
            warning: { icon: 'fas fa-exclamation-triangle', color: '#f59e0b' }
        };
        
        const { icon, color } = config[type] || config.success;
        
        toastIcon.className = icon;
        toastIcon.style.color = color;
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Update border color
        toast.querySelector('.glass-card').style.borderLeftColor = color;
        
        // Show toast
        toast.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }
}

// Make available globally
window.EventsPage = EventsPage;