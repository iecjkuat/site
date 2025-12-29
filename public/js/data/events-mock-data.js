/**
 * Events Mock Data
 * Provides sample data for testing and development
 */

class EventsMockData {
    static getEvents() {
        return [
            {
                id: '1',
                title: 'Innovation Workshop 2024',
                description: 'Join us for an intensive workshop on innovation methodologies, design thinking, and startup fundamentals. Learn from industry experts and network with fellow innovators.',
                event_type: 'workshop',
                start_date: '2024-12-28T10:25:00Z',
                end_date: '2024-12-29T16:30:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Engineering Block, Room E101. Please bring your laptop and notebook.',
                max_attendees: 50,
                registration_required: true,
                registration_deadline: '2024-12-27T23:59:59Z',
                fee: 200,
                status: 'upcoming',
                tags: ['innovation', 'workshop', 'design thinking', 'startup'],
                stats: {
                    totalAttendees: 37,
                    spotsRemaining: 13
                }
            },
            {
                id: '2',
                title: 'AI & Machine Learning in Agriculture',
                description: 'Explore the applications of artificial intelligence and machine learning in modern agriculture. Discover how technology is revolutionizing farming practices.',
                event_type: 'seminar',
                start_date: '2025-01-15T14:00:00Z',
                end_date: '2025-01-15T17:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Main Auditorium, Ground Floor',
                max_attendees: 200,
                registration_required: true,
                registration_deadline: '2025-01-12T23:59:59Z',
                fee: 0,
                status: 'upcoming',
                tags: ['AI', 'machine learning', 'agriculture', 'technology'],
                stats: {
                    totalAttendees: 156,
                    spotsRemaining: 44
                }
            },
            {
                id: '3',
                title: 'JKUAT Innovation Challenge 2025',
                description: 'Annual 48-hour hackathon focusing on solutions for sustainable development and climate change. Teams will compete to develop innovative tech solutions.',
                event_type: 'hackathon',
                start_date: '2025-03-15T09:00:00Z',
                end_date: '2025-03-17T18:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Innovation Hub, Multiple Labs',
                max_attendees: 150,
                registration_required: true,
                registration_deadline: '2025-03-10T23:59:59Z',
                fee: 500,
                status: 'upcoming',
                tags: ['hackathon', 'competition', 'climate tech', 'sustainability'],
                stats: {
                    totalAttendees: 87,
                    spotsRemaining: 63
                }
            },
            {
                id: '4',
                title: 'Tech Entrepreneurs Meetup',
                description: 'Monthly networking event bringing together tech entrepreneurs, investors, and innovators. Share ideas, find co-founders, and build valuable connections.',
                event_type: 'networking',
                start_date: '2025-01-25T18:00:00Z',
                end_date: '2025-01-25T21:00:00Z',
                location: 'JKUAT Innovation Hub',
                venue_details: 'Main Hall, 2nd Floor',
                max_attendees: 80,
                registration_required: true,
                registration_deadline: '2025-01-23T23:59:59Z',
                fee: 300,
                status: 'upcoming',
                tags: ['networking', 'entrepreneurs', 'tech', 'startups'],
                stats: {
                    totalAttendees: 64,
                    spotsRemaining: 16
                }
            },
            {
                id: '5',
                title: 'Business Plan Competition 2025',
                description: 'Present your business idea to a panel of experienced judges including venture capitalists and successful entrepreneurs. Winners receive seed funding.',
                event_type: 'competition',
                start_date: '2025-02-20T09:00:00Z',
                end_date: '2025-02-20T17:00:00Z',
                location: 'JKUAT Business School',
                venue_details: 'Conference Hall A',
                max_attendees: 30,
                registration_required: true,
                registration_deadline: '2025-02-15T23:59:59Z',
                fee: 1000,
                status: 'upcoming',
                tags: ['business plan', 'competition', 'funding', 'entrepreneurship'],
                stats: {
                    totalAttendees: 23,
                    spotsRemaining: 7
                }
            },
            {
                id: '6',
                title: 'Digital Marketing for Startups',
                description: 'Comprehensive training on digital marketing strategies specifically tailored for startups and small businesses. Learn about social media marketing and SEO.',
                event_type: 'training',
                start_date: '2025-01-30T13:00:00Z',
                end_date: '2025-01-30T17:00:00Z',
                location: 'JKUAT Computer Lab',
                venue_details: 'ICT Building, Lab 3',
                max_attendees: 40,
                registration_required: true,
                registration_deadline: '2025-01-28T23:59:59Z',
                fee: 150,
                status: 'upcoming',
                tags: ['digital marketing', 'training', 'startups', 'social media'],
                stats: {
                    totalAttendees: 31,
                    spotsRemaining: 9
                }
            },
            {
                id: '7',
                title: 'Blockchain Technology Workshop',
                description: 'Introduction to blockchain technology, cryptocurrencies, and decentralized applications. Hands-on session building simple smart contracts.',
                event_type: 'workshop',
                start_date: '2024-11-15T10:00:00Z',
                end_date: '2024-11-15T16:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Engineering Block, Room E205',
                max_attendees: 35,
                registration_required: true,
                registration_deadline: '2024-11-12T23:59:59Z',
                fee: 250,
                status: 'completed',
                tags: ['blockchain', 'cryptocurrency', 'smart contracts', 'technology'],
                stats: {
                    totalAttendees: 32,
                    spotsRemaining: 0
                }
            },
            {
                id: '8',
                title: 'Women in Tech Leadership Summit',
                description: 'Empowering women in technology through leadership development, mentorship, and networking. Featured keynote speakers and panel discussions.',
                event_type: 'seminar',
                start_date: '2024-10-08T09:00:00Z',
                end_date: '2024-10-08T17:00:00Z',
                location: 'JKUAT Conference Center',
                venue_details: 'Main Conference Hall',
                max_attendees: 120,
                registration_required: true,
                registration_deadline: '2024-10-05T23:59:59Z',
                fee: 0,
                status: 'completed',
                tags: ['women in tech', 'leadership', 'career development', 'networking'],
                stats: {
                    totalAttendees: 98,
                    spotsRemaining: 0
                }
            },
            {
                id: '9',
                title: 'Open Source Contribution Workshop',
                description: 'Learn how to contribute to open source projects and build your developer portfolio. We will cover Git/GitHub workflows and making your first pull request.',
                event_type: 'workshop',
                start_date: '2025-02-05T14:00:00Z',
                end_date: '2025-02-05T18:00:00Z',
                location: 'JKUAT Computer Lab',
                venue_details: 'ICT Building, Lab 1 & 2',
                max_attendees: 60,
                registration_required: true,
                registration_deadline: '2025-02-03T23:59:59Z',
                fee: 0,
                status: 'upcoming',
                tags: ['open source', 'git', 'github', 'programming'],
                stats: {
                    totalAttendees: 45,
                    spotsRemaining: 15
                }
            },
            {
                id: '10',
                title: 'Startup Bootcamp Weekend',
                description: 'Intensive 3-day bootcamp covering all aspects of starting a tech company. From idea validation to product development, fundraising, and scaling.',
                event_type: 'training',
                start_date: '2025-04-04T09:00:00Z',
                end_date: '2025-04-06T18:00:00Z',
                location: 'JKUAT Innovation Hub',
                venue_details: 'Multiple Rooms - Full Facility',
                max_attendees: 25,
                registration_required: true,
                registration_deadline: '2025-03-30T23:59:59Z',
                fee: 2500,
                status: 'upcoming',
                tags: ['bootcamp', 'startup', 'intensive', 'mentorship'],
                stats: {
                    totalAttendees: 18,
                    spotsRemaining: 7
                }
            },
            {
                id: '11',
                title: 'Annual Innovation Expo 2025',
                description: 'The biggest innovation showcase of the year! Students, startups, and companies will exhibit their latest innovations. Includes product demonstrations and investor meetings.',
                event_type: 'networking',
                start_date: '2025-05-15T08:00:00Z',
                end_date: '2025-05-17T20:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Multiple Venues - Campus Wide',
                max_attendees: 500,
                registration_required: true,
                registration_deadline: '2025-05-10T23:59:59Z',
                fee: 500,
                status: 'upcoming',
                tags: ['expo', 'innovation', 'showcase', 'networking', 'investors'],
                stats: {
                    totalAttendees: 287,
                    spotsRemaining: 213
                }
            },
            {
                id: '12',
                title: 'International Tech Conference',
                description: 'Due to unforeseen circumstances, this event has been cancelled. All registered participants will receive full refunds.',
                event_type: 'seminar',
                start_date: '2025-01-20T09:00:00Z',
                end_date: '2025-01-20T17:00:00Z',
                location: 'JKUAT Conference Center',
                venue_details: 'Main Hall',
                max_attendees: 200,
                registration_required: true,
                registration_deadline: '2025-01-18T23:59:59Z',
                fee: 1500,
                status: 'cancelled',
                tags: ['conference', 'international', 'cancelled'],
                stats: {
                    totalAttendees: 0,
                    spotsRemaining: 200
                }
            }
        ];
    }

    static getCategories() {
        return [
            { value: 'workshop', label: 'Workshop', count: 4 },
            { value: 'seminar', label: 'Seminar', count: 3 },
            { value: 'hackathon', label: 'Hackathon', count: 1 },
            { value: 'networking', label: 'Networking', count: 2 },
            { value: 'competition', label: 'Competition', count: 1 },
            { value: 'training', label: 'Training', count: 2 }
        ];
    }

    static getEventById(id) {
        return this.getEvents().find(event => event.id === id);
    }

    static getEventsByCategory(category) {
        if (category === 'all') {
            return this.getEvents();
        }
        return this.getEvents().filter(event => event.event_type === category);
    }

    static getUpcomingEvents() {
        const now = new Date();
        return this.getEvents().filter(event => {
            return event.status === 'upcoming' && new Date(event.start_date) > now;
        });
    }

    static getCompletedEvents() {
        return this.getEvents().filter(event => event.status === 'completed');
    }

    static getEventStats() {
        const events = this.getEvents();
        const totalEvents = events.length;
        const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
        const totalAttendees = events.reduce((sum, event) => sum + event.stats.totalAttendees, 0);

        return {
            totalEvents,
            upcomingEvents,
            totalAttendees,
            completedEvents: events.filter(e => e.status === 'completed').length
        };
    }

    static getAttendanceData(eventId) {
        // Mock attendance data for testing
        return {
            total_registered: 45,
            attended: 38,
            no_show: 7,
            pending: 0,
            attendance_rate: 84,
            recent_checkins: [
                { name: 'John Doe', registration_number: 'EN01/12345/2021', check_in_time: '2024-12-22T10:30:00Z' },
                { name: 'Jane Smith', registration_number: 'EN01/12346/2021', check_in_time: '2024-12-22T10:25:00Z' },
                { name: 'Mike Johnson', registration_number: 'EN01/12347/2021', check_in_time: '2024-12-22T10:20:00Z' }
            ]
        };
    }

    static getLiveUpdates(eventId, since) {
        // Mock live updates for testing
        return {
            timestamp: new Date().toISOString(),
            stats: {
                total_registered: 45,
                checked_in: 38
            },
            recent_activity: [
                {
                    type: 'checkin',
                    user: 'Alice Brown',
                    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
                },
                {
                    type: 'registration',
                    user: 'Bob Wilson',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
                },
                {
                    type: 'checkin',
                    user: 'Carol Davis',
                    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 minutes ago
                }
            ]
        };
    }

    static simulateRegistration(eventId, userId) {
        // Mock registration response
        return {
            message: 'Registration successful',
            registration: {
                id: 'reg_' + Math.random().toString(36).substr(2, 9),
                event_id: eventId,
                user_id: userId,
                registration_date: new Date().toISOString(),
                payment_status: 'paid'
            },
            requiresPayment: false
        };
    }

    static simulateQRCheckin(eventId, qrData) {
        // Mock QR check-in response
        return {
            message: 'Check-in successful',
            registration: {
                id: 'reg_' + Math.random().toString(36).substr(2, 9),
                attendance_status: 'attended',
                check_in_time: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        };
    }
}

// Make available globally
window.EventsMockData = EventsMockData;