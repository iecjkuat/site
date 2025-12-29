// JKUAT Innovation Club - Upcoming Events Component

class UpcomingEvents {
    constructor() {
        this.container = document.getElementById('upcomingEventsContainer');
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            await this.loadUpcomingEvents();
        } catch (error) {
            console.error('Failed to load upcoming events:', error);
            this.showError();
        }
    }

    async loadUpcomingEvents() {
        try {
            const response = await fetch('/api/events?limit=3&upcoming=true');
            
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            
            const data = await response.json();
            const events = data.events || [];
            
            this.renderEvents(events);
        } catch (error) {
            console.error('Error loading events:', error);
            this.showMockEvents(); // Show mock events if API fails
        }
    }

    renderEvents(events) {
        if (!events || events.length === 0) {
            this.showMockEvents();
            return;
        }

        this.container.innerHTML = events.map(event => this.createEventCard(event)).join('');
    }

    showMockEvents() {
        const mockEvents = [
            {
                id: 1,
                title: "AI & Machine Learning Workshop",
                description: "Learn the fundamentals of AI and build your first ML model",
                date: "2024-01-15",
                time: "14:00",
                location: "Computer Lab 1",
                category: "workshop",
                attendees: 45,
                max_attendees: 60
            },
            {
                id: 2,
                title: "Startup Pitch Competition",
                description: "Present your startup idea to industry experts and win prizes",
                date: "2024-01-20",
                time: "10:00",
                location: "Main Auditorium",
                category: "competition",
                attendees: 28,
                max_attendees: 100
            },
            {
                id: 3,
                title: "Tech Industry Networking",
                description: "Connect with alumni working in top tech companies",
                date: "2024-01-25",
                time: "18:00",
                location: "Innovation Hub",
                category: "networking",
                attendees: 67,
                max_attendees: 80
            }
        ];

        this.container.innerHTML = mockEvents.map(event => this.createEventCard(event)).join('');
    }

    createEventCard(event) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        const categoryColors = {
            workshop: { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#60a5fa' },
            competition: { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', text: '#fbbf24' },
            networking: { bg: 'rgba(244, 114, 182, 0.2)', border: '#f472b6', text: '#f9a8d4' },
            seminar: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#34d399' },
            hackathon: { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6', text: '#a78bfa' }
        };

        const categoryStyle = categoryColors[event.category] || categoryColors.workshop;
        const attendancePercentage = Math.round((event.attendees / event.max_attendees) * 100);

        return `
            <div class="glass-card animate-on-scroll" style="padding: 2rem; position: relative; overflow: hidden; cursor: pointer; transition: all 0.3s ease;" 
                 onclick="window.location.href='/events#event-${event.id}'">
                
                <!-- Category Badge -->
                <div style="position: absolute; top: 1rem; right: 1rem;">
                    <span style="background: ${categoryStyle.bg}; color: ${categoryStyle.text}; border: 1px solid ${categoryStyle.border}; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize;">
                        ${event.category}
                    </span>
                </div>
                
                <!-- Date Badge -->
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: linear-gradient(135deg, ${categoryStyle.border}, ${categoryStyle.text}); color: white; padding: 0.75rem; border-radius: 12px; text-align: center; min-width: 60px;">
                        <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.9;">${eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                        <div style="font-size: 1.25rem; font-weight: 800;">${eventDate.getDate()}</div>
                    </div>
                    <div>
                        <h3 style="color: white; font-weight: 700; font-size: 1.25rem; margin-bottom: 0.25rem; line-height: 1.3;">${event.title}</h3>
                        <div style="display: flex; align-items: center; gap: 1rem; color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                            <span><i class="fas fa-clock" style="margin-right: 0.25rem;"></i>${event.time}</span>
                            <span><i class="fas fa-map-marker-alt" style="margin-right: 0.25rem;"></i>${event.location}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Description -->
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.95rem;">
                    ${event.description}
                </p>
                
                <!-- Attendance Info -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.25rem;">
                            <i class="fas fa-users" style="color: ${categoryStyle.text}; font-size: 0.875rem;"></i>
                            <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${event.attendees}/${event.max_attendees}</span>
                        </div>
                        <div style="width: 60px; height: 4px; background: rgba(255, 255, 255, 0.2); border-radius: 2px; overflow: hidden;">
                            <div style="width: ${attendancePercentage}%; height: 100%; background: ${categoryStyle.border}; border-radius: 2px;"></div>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="event.stopPropagation(); this.registerForEvent(${event.id})">
                        <i class="fas fa-plus"></i>Join
                    </button>
                </div>
                
            </div>
        `;
    }

    showError() {
        this.container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.8);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #f59e0b;"></i>
                <p>Unable to load upcoming events. Please try again later.</p>
                <button onclick="window.location.reload()" class="btn btn-outline btn-sm" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i>Retry
                </button>
            </div>
        `;
    }

    registerForEvent(eventId) {
        // Check if user is logged in
        const authManager = window.authManager;
        if (!authManager || !authManager.isLoggedIn()) {
            authManager.showLogin();
            return;
        }

        // Redirect to event registration
        window.location.href = `/events#event-${eventId}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UpcomingEvents();
});

// Make available globally
window.UpcomingEvents = UpcomingEvents;