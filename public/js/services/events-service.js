// JKUAT Innovation Club - Events Service

class EventsService {
    constructor() {
        this.baseUrl = '/api/events';
        this.useMockData = false; // Switch to real API
    }

    async getEvents(params = {}) {
        console.log('🔧 EventsService: getEvents called with params:', params);
        console.log('🔧 EventsService: useMockData =', this.useMockData);
        
        if (this.useMockData) {
            console.log('📊 EventsService: Using mock data mode');
            return this.getMockEvents(params);
        }

        try {
            const queryParams = new URLSearchParams({
                page: 1,
                limit: 12,
                upcoming: true,
                ...params
            });

            console.log('🌐 EventsService: Fetching from API:', `${this.baseUrl}?${queryParams}`);
            const response = await fetch(`${this.baseUrl}?${queryParams}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch events: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ EventsService: API response received:', result);
            return result;
        } catch (error) {
            console.warn('⚠️ EventsService: API unavailable, switching to mock data:', error.message);
            this.useMockData = true;
            return this.getMockEvents(params);
        }
    }

    async getEvent(id) {
        if (this.useMockData) {
            const event = EventsMockData.getEventById(id);
            if (!event) {
                throw new Error('Event not found');
            }
            return event;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch event: ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.warn('API unavailable, using mock data:', error.message);
            this.useMockData = true;
            const event = EventsMockData.getEventById(id);
            if (!event) {
                throw new Error('Event not found');
            }
            return event;
        }
    }

    async registerForEvent(eventId, userId) {
        if (this.useMockData) {
            // Simulate registration delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return EventsMockData.simulateRegistration(eventId, userId);
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            return response.json();
        } catch (error) {
            console.warn('API unavailable, using mock registration:', error.message);
            this.useMockData = true;
            await new Promise(resolve => setTimeout(resolve, 1000));
            return EventsMockData.simulateRegistration(eventId, userId);
        }
    }

    async getCategories() {
        if (this.useMockData) {
            return { categories: EventsMockData.getCategories() };
        }

        try {
            const response = await fetch(`${this.baseUrl}/categories/list`);
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.warn('API unavailable, using mock categories:', error.message);
            this.useMockData = true;
            return { categories: EventsMockData.getCategories() };
        }
    }

    async getAttendanceStats(eventId) {
        if (this.useMockData) {
            return EventsMockData.getAttendanceData(eventId);
        }

        try {
            const response = await fetch(`${this.baseUrl}/attendance/${eventId}/stats`);
            if (!response.ok) {
                throw new Error(`Failed to fetch attendance stats: ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.warn('API unavailable, using mock attendance data:', error.message);
            this.useMockData = true;
            return EventsMockData.getAttendanceData(eventId);
        }
    }

    async getLiveUpdates(eventId, since) {
        if (this.useMockData) {
            return EventsMockData.getLiveUpdates(eventId, since);
        }

        try {
            const params = since ? `?since=${since}` : '';
            const response = await fetch(`${this.baseUrl}/notifications/${eventId}/live-updates${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch live updates: ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.warn('API unavailable, using mock live updates:', error.message);
            this.useMockData = true;
            return EventsMockData.getLiveUpdates(eventId, since);
        }
    }

    async checkInWithQR(eventId, qrData, location) {
        if (this.useMockData) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return EventsMockData.simulateQRCheckin(eventId, qrData);
        }

        try {
            const response = await fetch(`${this.baseUrl}/attendance/${eventId}/checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ qrData, location })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Check-in failed');
            }

            return response.json();
        } catch (error) {
            console.warn('API unavailable, using mock check-in:', error.message);
            this.useMockData = true;
            await new Promise(resolve => setTimeout(resolve, 800));
            return EventsMockData.simulateQRCheckin(eventId, qrData);
        }
    }

    // Mock data helper methods
    getMockEvents(params) {
        console.log('📊 EventsService: Getting mock events with params:', params);
        let events = EventsMockData.getEvents();
        console.log(`📊 EventsService: Loaded ${events.length} mock events from EventsMockData`);
        
        // Apply filters
        if (params.category && params.category !== 'all') {
            events = events.filter(event => event.event_type === params.category);
            console.log(`🔍 EventsService: Filtered by category '${params.category}': ${events.length} events`);
        }
        
        if (params.upcoming === 'true') {
            const now = new Date();
            events = events.filter(event => 
                event.status === 'upcoming' && new Date(event.start_date) > now
            );
            console.log(`🔍 EventsService: Filtered upcoming events: ${events.length} events`);
        }
        
        // Apply pagination
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 12;
        const offset = (page - 1) * limit;
        const paginatedEvents = events.slice(offset, offset + limit);
        
        const result = {
            events: paginatedEvents,
            pagination: {
                current: page,
                total: Math.ceil(events.length / limit),
                count: paginatedEvents.length,
                totalEvents: events.length
            }
        };
        
        console.log(`✅ EventsService: Returning ${result.events.length} events (page ${page})`);
        return result;
    }

    // Utility methods
    formatEventDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatEventTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
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

    getCategoryIcon(category) {
        const icons = {
            'workshop': 'tools',
            'seminar': 'chalkboard-teacher',
            'hackathon': 'code',
            'competition': 'trophy',
            'networking': 'handshake',
            'training': 'graduation-cap'
        };
        return icons[category] || 'calendar';
    }

    isRegistrationOpen(event) {
        const now = new Date();
        const registrationDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
        
        return event.status === 'upcoming' && 
               (!registrationDeadline || now < registrationDeadline) &&
               (!event.max_attendees || event.stats.totalAttendees < event.max_attendees);
    }

    // Enable/disable mock data mode
    setMockDataMode(enabled) {
        this.useMockData = enabled;
    }

    isMockDataMode() {
        return this.useMockData;
    }
}

// Export for use in other modules
window.EventsService = EventsService;