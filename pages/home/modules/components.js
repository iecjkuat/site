// JKUAT Innovation Club - Home Components Module

class ComponentsManager {
    constructor(homeInstance) {
        this.home = homeInstance;
    }

    initializeComponents() {
        console.log('🏠 Initializing home page components...');
        
        // Initialize components with delay to ensure all scripts are loaded
        setTimeout(() => {
            this.initTestimonials();
            this.initUpcomingEvents();
            this.initPartners();
        }, 500);
    }

    initTestimonials() {
        const testimonialsGrid = document.getElementById('testimonialsGrid');
        if (!testimonialsGrid) return;

        console.log('📝 Initializing testimonials...');
        
        // Mock testimonials data
        const testimonials = [
            {
                name: "Sarah Wanjiku",
                role: "Computer Science Student",
                text: "Joining the Innovation Club was the best decision I made at JKUAT. The mentorship and networking opportunities helped me launch my first startup.",
                rating: 5,
                avatar: "SW"
            },
            {
                name: "David Kimani",
                role: "Engineering Student",
                text: "The hackathons and workshops provided hands-on experience that complemented my classroom learning. I've grown tremendously as a developer.",
                rating: 5,
                avatar: "DK"
            },
            {
                name: "Grace Muthoni",
                role: "Business Student",
                text: "The entrepreneurship programs and industry connections opened doors I never knew existed. Now I'm running my own tech consultancy.",
                rating: 5,
                avatar: "GM"
            }
        ];

        testimonialsGrid.innerHTML = '';
        
        testimonials.forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-avatar avatar-${(index % 4) + 1}">
                        ${testimonial.avatar}
                    </div>
                    <div class="testimonial-info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.role}</p>
                    </div>
                </div>
                <div class="testimonial-content">
                    <p class="testimonial-text">"${testimonial.text}"</p>
                    <div class="testimonial-rating">
                        ${Array(testimonial.rating).fill('<span class="star">★</span>').join('')}
                    </div>
                </div>
            `;
            testimonialsGrid.appendChild(card);
        });
        
        console.log('✅ Testimonials loaded');
    }

    initUpcomingEvents() {
        const eventsGrid = document.getElementById('upcomingEventsGrid');
        if (!eventsGrid) return;

        console.log('📅 Initializing upcoming events...');
        
        // Mock events data
        const events = [
            {
                title: "AI/ML Workshop Series",
                description: "Learn machine learning fundamentals and build your first AI model with industry experts.",
                date: "January 15, 2026",
                time: "2:00 PM",
                location: "Innovation Lab",
                type: "Workshop",
                spots: 25
            },
            {
                title: "Startup Pitch Competition",
                description: "Present your startup idea to a panel of investors and win funding for your venture.",
                date: "January 22, 2026",
                time: "10:00 AM",
                location: "Main Auditorium",
                type: "Competition",
                spots: 50
            }
        ];

        eventsGrid.innerHTML = '';
        
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-date">${event.date}</div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
                <div class="event-meta">
                    <span><i class="fas fa-clock"></i> ${event.time}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    <span><i class="fas fa-users"></i> ${event.spots} spots</span>
                </div>
                <div class="event-actions">
                    <button class="btn-register">
                        <i class="fas fa-calendar-plus"></i> Register
                    </button>
                    <button class="btn-details">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            `;
            eventsGrid.appendChild(card);
        });
        
        console.log('✅ Upcoming events loaded');
    }

    initPartners() {
        const partnersTrack = document.getElementById('partnersScrollTrack');
        if (!partnersTrack) return;

        console.log('🤝 Initializing partners...');
        
        // Mock partners data
        const partners = [
            { name: "Microsoft", description: "Technology Partner", logo: "MS" },
            { name: "Google", description: "Cloud Partner", logo: "GO" },
            { name: "Safaricom", description: "Innovation Partner", logo: "SF" },
            { name: "KCB Bank", description: "Financial Partner", logo: "KC" },
            { name: "Equity Bank", description: "Banking Partner", logo: "EQ" },
            { name: "USAID", description: "Development Partner", logo: "US" }
        ];

        partnersTrack.innerHTML = '';
        
        // Duplicate partners for seamless scrolling
        const allPartners = [...partners, ...partners];
        
        allPartners.forEach(partner => {
            const item = document.createElement('div');
            item.className = 'partner-item';
            item.innerHTML = `
                <div class="partner-logo">
                    <div class="partner-fallback">${partner.logo}</div>
                </div>
                <h4>${partner.name}</h4>
                <p>${partner.description}</p>
            `;
            partnersTrack.appendChild(item);
        });
        
        console.log('✅ Partners loaded');
    }

    showEventDetails() {
        this.home.showToast('Event details will be available soon!', 'info');
    }

    // Method to refresh all dynamic components
    refreshComponents() {
        console.log('🔄 Refreshing home page components...');
        this.initTestimonials();
        this.initUpcomingEvents();
        this.initPartners();
        console.log('✅ Components refresh completed');
    }

    // Method to check component status
    getComponentStatus() {
        return {
            testimonials: !!document.getElementById('testimonialsGrid'),
            upcomingEvents: !!document.getElementById('upcomingEventsGrid'),
            partners: !!document.getElementById('partnersScrollTrack'),
            isInitialized: true
        };
    }
}

window.ComponentsManager = ComponentsManager;