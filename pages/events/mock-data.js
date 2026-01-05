// Events Page Mock Data

class EventsMockData {
    static getEvents() {
        return [
            {
                id: 1,
                title: "AI & Machine Learning Workshop",
                description: "Learn the fundamentals of AI and build your first ML model with hands-on exercises.",
                date: "2025-01-15T14:00:00Z",
                location: "Engineering Block, Room E101",
                category: "workshop",
                attendees: 45,
                max_attendees: 60,
                fee: 200,
                status: "upcoming"
            },
            {
                id: 2,
                title: "Tech Entrepreneurs Meetup",
                description: "Monthly networking event bringing together tech entrepreneurs and investors.",
                date: "2025-01-25T18:00:00Z",
                location: "Innovation Hub, Main Hall",
                category: "networking",
                attendees: 64,
                max_attendees: 80,
                fee: 300,
                status: "upcoming"
            },
            {
                id: 3,
                title: "Business Plan Competition 2025",
                description: "Present your business idea to experienced judges and win seed funding.",
                date: "2025-02-20T09:00:00Z",
                location: "Business School, Conference Hall A",
                category: "competition",
                attendees: 23,
                max_attendees: 30,
                fee: 1000,
                status: "upcoming"
            }
        ];
    }

    static getCategories() {
        return [
            { id: 'workshop', name: 'Workshops', color: '#3b82f6' },
            { id: 'networking', name: 'Networking', color: '#f472b6' },
            { id: 'competition', name: 'Competitions', color: '#f59e0b' },
            { id: 'seminar', name: 'Seminars', color: '#10b981' },
            { id: 'hackathon', name: 'Hackathons', color: '#8b5cf6' }
        ];
    }
}

// Make available globally
window.EventsMockData = EventsMockData;

console.log('📊 Events mock data loaded successfully');