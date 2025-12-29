/**
 * Event Calendar Component
 * Handles calendar view functionality
 */

class EventCalendar {
    constructor(eventsData = []) {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.events = eventsData;
        this.onDateSelect = null; // Callback for date selection
    }

    setEvents(events) {
        this.events = events;
        this.render();
    }

    setDateSelectCallback(callback) {
        this.onDateSelect = callback;
    }

    render() {
        this.updateTitle();
        this.renderCalendarGrid();
    }

    updateTitle() {
        const calendarTitle = document.getElementById('calendarTitle');
        if (!calendarTitle) return;

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        calendarTitle.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderCalendarGrid() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        calendarGrid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = this.createDayElement(date);
            calendarGrid.appendChild(dayElement);
        }
    }

    createDayElement(date) {
        const dateStr = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const isSelected = dateStr === this.selectedDate;
        const dayEvents = this.getEventsForDate(dateStr);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = dateStr;
        
        this.styleDayElement(dayElement, isCurrentMonth, isToday, isSelected);
        dayElement.innerHTML = this.getDayContent(date, dayEvents, isCurrentMonth);
        
        this.addDayEventListeners(dayElement, isCurrentMonth);
        
        return dayElement;
    }

    styleDayElement(element, isCurrentMonth, isToday, isSelected) {
        element.style.cssText = `
            min-height: 80px;
            padding: 0.5rem;
            background: ${isCurrentMonth ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
            border: 1px solid ${isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.1)'};
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            ${isToday ? 'box-shadow: inset 0 0 0 2px #3b82f6;' : ''}
        `;
    }

    getDayContent(date, dayEvents, isCurrentMonth) {
        return `
            <div style="font-weight: ${date.toDateString() === new Date().toDateString() ? '700' : '500'}; color: ${isCurrentMonth ? 'white' : 'rgba(255, 255, 255, 0.4)'}; margin-bottom: 0.25rem;">
                ${date.getDate()}
            </div>
            ${dayEvents.length > 0 ? this.getEventIndicators(dayEvents) : ''}
        `;
    }

    getEventIndicators(dayEvents) {
        return `
            <div style="display: flex; flex-direction: column; gap: 1px;">
                ${dayEvents.slice(0, 2).map(event => `
                    <div style="background: ${this.getCategoryColor(event.event_type)}; color: white; font-size: 0.625rem; padding: 1px 4px; border-radius: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${event.title}
                    </div>
                `).join('')}
                ${dayEvents.length > 2 ? `
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.625rem;">+${dayEvents.length - 2} more</div>
                ` : ''}
            </div>
        `;
    }

    addDayEventListeners(dayElement, isCurrentMonth) {
        dayElement.addEventListener('mouseenter', () => {
            if (isCurrentMonth) {
                dayElement.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });

        dayElement.addEventListener('mouseleave', () => {
            dayElement.style.background = isCurrentMonth ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
        });

        dayElement.addEventListener('click', () => {
            this.selectDate(dayElement.dataset.date);
        });
    }

    getEventsForDate(dateStr) {
        return this.events.filter(event => {
            const eventDate = new Date(event.start_date).toISOString().split('T')[0];
            return eventDate === dateStr;
        });
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.render();
        
        if (this.onDateSelect) {
            const events = this.getEventsForDate(dateStr);
            this.onDateSelect(dateStr, events);
        }
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    getCategoryColor(category) {
        const colors = {
            'workshop': '#3b82f6',
            'seminar': '#10b981',
            'hackathon': '#8b5cf6',
            'competition': '#f59e0b',
            'networking': '#f472b6',
            'training': '#06b6d4'
        };
        return colors[category] || '#6b7280';
    }
}

window.EventCalendar = EventCalendar;