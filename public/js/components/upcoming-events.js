// JKUAT Innovation Club - Upcoming Events Component

class UpcomingEvents {
    constructor() {
        this.container = document.getElementById('upcomingEventsGrid');
        this.init();
    }

    async init() {
        if (!this.container) {
            console.error('❌ upcomingEventsGrid container not found');
            return;
        }
        
        console.log('🚀 UpcomingEvents component initializing...');
        
        try {
            await this.loadUpcomingEvents();
        } catch (error) {
            console.error('❌ Failed to load upcoming events:', error);
            this.showError();
        }
    }

    async loadUpcomingEvents() {
        let realEvents = [];
        let mockEvents = [];
        
        // Try to fetch real events from API
        try {
            console.log('🔄 Fetching real events from API...');
            const response = await fetch('/api/events?limit=10&upcoming=true'); // Get more real events
            
            if (response.ok) {
                const data = await response.json();
                realEvents = data.events || [];
                console.log(`✅ Loaded ${realEvents.length} real events from API`);
            } else {
                console.log('⚠️ API response not OK, will show mock data only');
            }
        } catch (error) {
            console.log('⚠️ API fetch failed, will show mock data only:', error.message);
        }
        
        // Always get mock events to show alongside real events
        if (window.EventsMockData) {
            console.log('✅ EventsMockData found, loading mock events...');
            const upcomingMockEvents = window.EventsMockData.getUpcomingEvents();
            mockEvents = upcomingMockEvents.map(event => ({
                id: `mock_${event.id}`, // Prefix to avoid ID conflicts with real events
                title: event.title,
                description: event.description,
                date: event.start_date.split('T')[0],
                time: new Date(event.start_date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }),
                location: event.venue_details || event.location,
                category: event.event_type,
                attendees: event.stats.totalAttendees,
                max_attendees: event.max_attendees,
                fee: event.fee,
                source: 'mock'
            }));
            console.log(`📋 Loaded ${mockEvents.length} mock events for display`);
        } else {
            console.error('❌ EventsMockData not found! Mock data will not be available.');
            console.log('Available window objects:', Object.keys(window).filter(key => key.includes('Event')));
            
            // Fallback mock events if EventsMockData is not available
            mockEvents = [
                {
                    id: 'mock_fallback_1',
                    title: "AI & Machine Learning Workshop",
                    description: "Learn the fundamentals of AI and build your first ML model with hands-on exercises",
                    date: "2025-01-15",
                    time: "14:00",
                    location: "Engineering Block, Room E101",
                    category: "workshop",
                    attendees: 45,
                    max_attendees: 60,
                    fee: 200,
                    source: 'mock'
                },
                {
                    id: 'mock_fallback_2',
                    title: "Tech Entrepreneurs Meetup",
                    description: "Monthly networking event bringing together tech entrepreneurs, investors, and innovators",
                    date: "2025-01-25",
                    time: "18:00",
                    location: "Innovation Hub, Main Hall",
                    category: "networking",
                    attendees: 64,
                    max_attendees: 80,
                    fee: 300,
                    source: 'mock'
                },
                {
                    id: 'mock_fallback_3',
                    title: "Business Plan Competition 2025",
                    description: "Present your business idea to experienced judges and win seed funding",
                    date: "2025-02-20",
                    time: "09:00",
                    location: "Business School, Conference Hall A",
                    category: "competition",
                    attendees: 23,
                    max_attendees: 30,
                    fee: 1000,
                    source: 'mock'
                }
            ];
            console.log(`📋 Using ${mockEvents.length} fallback mock events`);
        }
        
        // Combine real and mock events - show both together
        let combinedEvents = [];
        
        // Add real events first (they get priority positioning)
        if (realEvents.length > 0) {
            combinedEvents = [...realEvents];
            console.log(`✅ Added ${realEvents.length} real events`);
        }
        
        // Add mock events after real events
        if (mockEvents.length > 0) {
            combinedEvents = [...combinedEvents, ...mockEvents];
            console.log(`📋 Added ${mockEvents.length} mock events`);
        }
        
        // Show the first 6 events total (real + mock) to avoid overwhelming the homepage
        const eventsToShow = combinedEvents.slice(0, 6);
        
        if (eventsToShow.length === 0) {
            console.log('⚠️ No events to display (neither real nor mock)');
            this.showNoEvents();
            return;
        }
        
        console.log(`📊 Displaying ${eventsToShow.length} total events: ${realEvents.length} real + ${Math.min(mockEvents.length, 6 - realEvents.length)} mock`);
        
        this.renderEvents(eventsToShow);
    }

    renderEvents(events) {
        if (!events || events.length === 0) {
            this.showNoEvents();
            return;
        }

        // Add source indicators and organize events
        const eventsHTML = events.map(event => {
            // Add source indicator for development - real events get a "LIVE" badge, mock events get "DEMO"
            let sourceIndicator = '';
            if (event.source === 'mock') {
                sourceIndicator = `<div style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(245, 158, 11, 0.9); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.625rem; font-weight: 600; z-index: 10;">DEMO</div>`;
            } else {
                sourceIndicator = `<div style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(34, 197, 94, 0.9); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.625rem; font-weight: 600; z-index: 10;">LIVE</div>`;
            }
            
            return this.createEventCard(event, sourceIndicator);
        }).join('');

        // Add the "View All Events" button after the events
        const viewAllButton = `
            <div style="text-align: center; grid-column: 1 / -1; margin-top: 1rem;" class="animate-on-scroll">
                <a href="/events" style="
                    display: inline-flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    padding: 0.75rem 1.5rem; 
                    background: linear-gradient(135deg, #10b981, #059669); 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 50px; 
                    font-size: 1rem; 
                    font-weight: 600; 
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                    transition: all 0.3s ease;
                    width: auto;
                    min-width: auto;
                    max-width: none;
                " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 15px 35px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(16, 185, 129, 0.3)'">
                    <i class="fas fa-calendar-alt"></i>View All Events
                </a>
            </div>
        `;

        this.container.innerHTML = eventsHTML + viewAllButton;
        
        // Log the mix of events for debugging
        const realCount = events.filter(e => e.source !== 'mock').length;
        const mockCount = events.filter(e => e.source === 'mock').length;
        console.log(`📊 Displaying ${events.length} events: ${realCount} real (LIVE), ${mockCount} mock (DEMO)`);
        
        // Update the grid layout to handle more events
        this.container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    }

    showNoEvents() {
        this.container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.8); grid-column: 1 / -1;">
                <i class="fas fa-calendar-plus" style="font-size: 3rem; margin-bottom: 1rem; color: #64748b;"></i>
                <h3 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">No Upcoming Events</h3>
                <p style="margin-bottom: 1.5rem;">Check back soon for exciting new events and workshops!</p>
                <a href="/events" style="
                    display: inline-flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    padding: 0.75rem 1.5rem; 
                    background: linear-gradient(135deg, #10b981, #059669); 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 50px; 
                    font-size: 1rem; 
                    font-weight: 600; 
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                    transition: all 0.3s ease;
                    width: auto;
                    min-width: auto;
                    max-width: none;
                " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 15px 35px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(16, 185, 129, 0.3)'">
                    <i class="fas fa-calendar-alt"></i>View All Events
                </a>
            </div>
        `;
    }

    createEventCard(event, sourceIndicator = '') {
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
            hackathon: { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6', text: '#a78bfa' },
            training: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#4ade80' }
        };

        const categoryStyle = categoryColors[event.category] || categoryColors.workshop;
        const attendancePercentage = Math.round((event.attendees / event.max_attendees) * 100);
        
        // Format fee display
        const feeDisplay = event.fee === 0 ? 'Free' : `KSh ${event.fee.toLocaleString()}`;
        const feeColor = event.fee === 0 ? '#22c55e' : '#fbbf24';

        return `
            <div class="glass-card animate-on-scroll" style="padding: 2rem; position: relative; overflow: hidden; cursor: pointer; transition: all 0.3s ease;" 
                 onclick="window.location.href='/events#event-${event.id}'" 
                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.2)'" 
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.1)'">
                
                ${sourceIndicator}
                
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
                    <div style="flex: 1;">
                        <h3 style="color: white; font-weight: 700; font-size: 1.25rem; margin-bottom: 0.5rem; line-height: 1.3;">${event.title}</h3>
                        <div style="display: flex; align-items: center; gap: 1rem; color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; flex-wrap: wrap;">
                            <span><i class="fas fa-clock" style="margin-right: 0.25rem; color: ${categoryStyle.text};"></i>${event.time}</span>
                            <span><i class="fas fa-map-marker-alt" style="margin-right: 0.25rem; color: ${categoryStyle.text};"></i>${event.location}</span>
                            <span><i class="fas fa-tag" style="margin-right: 0.25rem; color: ${feeColor};"></i>${feeDisplay}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Description -->
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.95rem;">
                    ${event.description}
                </p>
                
                <!-- Attendance Info & Action -->
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-users" style="color: ${categoryStyle.text}; font-size: 0.875rem;"></i>
                            <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; font-weight: 500;">${event.attendees}/${event.max_attendees}</span>
                        </div>
                        <div style="flex: 1; max-width: 80px; height: 6px; background: rgba(255, 255, 255, 0.2); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${attendancePercentage}%; height: 100%; background: ${categoryStyle.border}; border-radius: 3px; transition: width 0.3s ease;"></div>
                        </div>
                        <span style="color: ${categoryStyle.text}; font-size: 0.75rem; font-weight: 600;">${attendancePercentage}%</span>
                    </div>
                    <button class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.5rem 1rem; white-space: nowrap;" onclick="event.stopPropagation(); window.upcomingEvents.registerForEvent(${event.id})">
                        <i class="fas fa-plus" style="margin-right: 0.25rem;"></i>Register
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
    console.log('🏠 DOM loaded, initializing UpcomingEvents...');
    
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        window.upcomingEvents = new UpcomingEvents();
    }, 100);
});

// Make available globally
window.UpcomingEvents = UpcomingEvents;