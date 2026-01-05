// JKUAT Innovation Club - Home Page Mock Data

// Events Mock Data
class HomeEventsMockData {
    static getUpcomingEvents() {
        return [
            {
                id: 1,
                title: "AI & Machine Learning Workshop",
                description: "Learn the fundamentals of AI and build your first ML model with hands-on exercises and expert guidance.",
                start_date: "2025-01-15T14:00:00Z",
                venue_details: "Engineering Block, Room E101",
                location: "Engineering Block, Room E101",
                event_type: "workshop",
                stats: { totalAttendees: 45 },
                max_attendees: 60,
                fee: 200
            },
            {
                id: 2,
                title: "Tech Entrepreneurs Meetup",
                description: "Monthly networking event bringing together tech entrepreneurs, investors, and innovators from across Kenya.",
                start_date: "2025-01-25T18:00:00Z",
                venue_details: "Innovation Hub, Main Hall",
                location: "Innovation Hub, Main Hall",
                event_type: "networking",
                stats: { totalAttendees: 64 },
                max_attendees: 80,
                fee: 300
            },
            {
                id: 3,
                title: "Business Plan Competition 2025",
                description: "Present your business idea to experienced judges and win seed funding for your startup venture.",
                start_date: "2025-02-20T09:00:00Z",
                venue_details: "Business School, Conference Hall A",
                location: "Business School, Conference Hall A",
                event_type: "competition",
                stats: { totalAttendees: 23 },
                max_attendees: 30,
                fee: 1000
            },
            {
                id: 4,
                title: "Web Development Bootcamp",
                description: "Intensive 3-day bootcamp covering modern web development technologies including React, Node.js, and MongoDB.",
                start_date: "2025-02-05T09:00:00Z",
                venue_details: "Computer Lab 1, ICT Building",
                location: "Computer Lab 1, ICT Building",
                event_type: "workshop",
                stats: { totalAttendees: 28 },
                max_attendees: 35,
                fee: 500
            },
            {
                id: 5,
                title: "Innovation Showcase 2025",
                description: "Annual showcase where students present their innovative projects to industry leaders and potential investors.",
                start_date: "2025-03-15T10:00:00Z",
                venue_details: "Main Auditorium",
                location: "Main Auditorium",
                event_type: "competition",
                stats: { totalAttendees: 156 },
                max_attendees: 200,
                fee: 0
            },
            {
                id: 6,
                title: "Cybersecurity Awareness Seminar",
                description: "Learn about the latest cybersecurity threats and how to protect yourself and your business online.",
                start_date: "2025-01-30T15:00:00Z",
                venue_details: "Lecture Hall 3, Engineering Block",
                location: "Lecture Hall 3, Engineering Block",
                event_type: "seminar",
                stats: { totalAttendees: 89 },
                max_attendees: 120,
                fee: 150
            }
        ];
    }
}

// Testimonials Mock Data
class HomeTestimonialsMockData {
    static getFeaturedTestimonials() {
        return [
            {
                id: 1,
                name: "Sarah Wanjiku",
                course: "Computer Science",
                year: "3rd Year",
                content: "Joining the Innovation Club was the best decision I made at JKUAT. The mentorship and networking opportunities helped me launch my first startup, which now employs 5 people!",
                rating: 5,
                photo_url: null
            },
            {
                id: 2,
                name: "David Kimani",
                course: "Electrical Engineering",
                year: "4th Year", 
                content: "The hackathons and workshops here are incredible. I've learned more practical skills in one semester than in my entire academic journey. Now I'm working as a software engineer at a top tech company.",
                rating: 5,
                photo_url: null
            },
            {
                id: 3,
                name: "Grace Muthoni",
                course: "Information Technology",
                year: "2nd Year",
                content: "The club's supportive community and industry connections opened doors I never thought possible. The mentorship program connected me with amazing professionals who guided my career path.",
                rating: 5,
                photo_url: null
            }
        ];
    }
}

// Partners Mock Data
class HomePartnersMockData {
    static getPartners() {
        return [
            {
                id: 1,
                name: "Safaricom",
                description: "Leading telecommunications company",
                logo_url: null,
                website: "https://safaricom.co.ke"
            },
            {
                id: 2,
                name: "Microsoft",
                description: "Global technology corporation",
                logo_url: null,
                website: "https://microsoft.com"
            },
            {
                id: 3,
                name: "Google",
                description: "Technology and internet services",
                logo_url: null,
                website: "https://google.com"
            },
            {
                id: 4,
                name: "IBM",
                description: "International technology company",
                logo_url: null,
                website: "https://ibm.com"
            },
            {
                id: 5,
                name: "Equity Bank",
                description: "Leading financial services provider",
                logo_url: null,
                website: "https://equitybank.co.ke"
            },
            {
                id: 6,
                name: "KCB Group",
                description: "Premier banking institution",
                logo_url: null,
                website: "https://kcbgroup.com"
            }
        ];
    }
}

// Make classes available globally for home page
window.EventsMockData = HomeEventsMockData;
window.TestimonialsMockData = HomeTestimonialsMockData;
window.PartnersMockData = HomePartnersMockData;

console.log('📊 Home page mock data loaded successfully');