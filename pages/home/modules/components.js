// JKUAT Innovation Club - Home Components Module

class ComponentsManager {
    constructor(homeInstance) {
        this.home = homeInstance;
    }

    // Security: Prevent XSS attacks
    escapeHtml(unsafe) {
        return window.Utils?.escapeHtml(unsafe) || String(unsafe || '');
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

    async initTestimonials() {
        const testimonialsGrid = document.getElementById('testimonialsGrid');
        if (!testimonialsGrid) return;

        console.log('📝 Initializing testimonials...');

        try {
            // Try API first
            const response = await fetch('/api/testimonials?featured=true&limit=3');

            if (response.ok) {
                const data = await response.json();
                const testimonials = data.testimonials || [];
                console.log('✅ Testimonials loaded from API:', testimonials.length);
                this.renderTestimonials(testimonials, testimonialsGrid);
                return;
            }
        } catch (error) {
            console.log('⚠️ API failed, using mock testimonials:', error.message);
        }

        // Fallback to mock data
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

        console.log('📋 Using mock testimonials');
        this.renderTestimonials(testimonials, testimonialsGrid);
    }

    renderTestimonials(testimonials, container) {
        container.innerHTML = '';

        testimonials.forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-avatar avatar-${(index % 4) + 1}">
                        ${this.escapeHtml(testimonial.avatar)}
                    </div>
                    <div class="testimonial-info">
                        <h4>${this.escapeHtml(testimonial.name)}</h4>
                        <p>${this.escapeHtml(testimonial.role)}</p>
                    </div>
                </div>
                <div class="testimonial-content">
                    <p class="testimonial-text">"${this.escapeHtml(testimonial.text)}"</p>
                    <div class="testimonial-rating">
                        ${Array(testimonial.rating).fill('<span class="star">★</span>').join('')}
                    </div>
                </div>
            `;
            testimonialsGrid.appendChild(card);
        });

        console.log('✅ Testimonials loaded');
    }

    async initUpcomingEvents() {
        const eventsGrid = document.getElementById('upcomingEventsGrid');
        if (!eventsGrid) return;

        console.log('📅 Initializing upcoming events...');

        try {
            // Try API first
            const response = await fetch('/api/events?upcoming=true&limit=6');

            if (response.ok) {
                const data = await response.json();
                const events = data.events || [];
                console.log('✅ Events loaded from API:', events.length);
                this.renderEvents(events, eventsGrid);
                return;
            }
        } catch (error) {
            console.log('⚠️ API failed, using mock events:', error.message);
        }

        // Fallback to mock data
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

        console.log('📋 Using mock events');
        this.renderEvents(events, eventsGrid);
    }

    async initPartners() {
        const partnersTrack = document.getElementById('partnersScrollTrack');
        if (!partnersTrack) return;

        console.log('🤝 Initializing partners...');

        try {
            // Try API first
            const response = await fetch('/api/partners?active=true');

            if (response.ok) {
                const data = await response.json();
                const partners = data.partners || [];
                console.log('✅ Partners loaded from API:', partners.length);
                this.renderPartners(partners, partnersTrack);
                return;
            }
        } catch (error) {
            console.log('⚠️ API failed, using mock partners:', error.message);
        }

        // Fallback to mock data
        const partners = [
            { name: "Microsoft", description: "Technology Partner", logo: "MS" },
            { name: "Google", description: "Cloud Partner", logo: "GO" },
            { name: "Safaricom", description: "Innovation Partner", logo: "SF" },
            { name: "KCB Bank", description: "Financial Partner", logo: "KC" },
            { name: "Equity Bank", description: "Banking Partner", logo: "EQ" },
            { name: "USAID", description: "Development Partner", logo: "US" }
        ];

        console.log('📋 Using mock partners');
        this.renderPartners(partners, partnersTrack);
    }

    renderPartners(partners, container) {
        container.innerHTML = '';

        // Duplicate partners for seamless scrolling
        const allPartners = [...partners, ...partners];

        allPartners.forEach(partner => {
            const item = document.createElement('div');
            item.className = 'partner-item';
            item.innerHTML = `
                <div class="partner-logo">
                    ${partner.logo_url ?
                    `<img src="${this.escapeHtml(partner.logo_url)}" alt="${this.escapeHtml(partner.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="partner-fallback" style="display: none;">${this.escapeHtml(partner.logo || partner.name.substring(0, 3).toUpperCase())}</div>` :
                    `<div class="partner-fallback">${this.escapeHtml(partner.logo || partner.name.substring(0, 3).toUpperCase())}</div>`
                }
                </div>
                <h4>${this.escapeHtml(partner.name)}</h4>
                <p>${this.escapeHtml(partner.description)}</p>
            `;
            container.appendChild(item);
        });

        console.log('✅ Partners rendered');
    }

    showEventDetails() {
        this.showToast('Event details will be available soon!', 'info');
    }


    renderEvents(events, container) {
        container.innerHTML = '';

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-date">${this.escapeHtml(event.date || new Date(event.start_date).toLocaleDateString())}</div>
                <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                <p class="event-description">${this.escapeHtml(event.description)}</p>
                <div class="event-meta">
                    <span><i class="fas fa-clock"></i> ${this.escapeHtml(event.time || new Date(event.start_date).toLocaleTimeString())}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(event.location || event.venue)}</span>
                    <span><i class="fas fa-users"></i> ${this.escapeHtml(String(event.spots || event.max_attendees || 'Limited'))} spots</span>
                </div>
                <div class="event-actions">
                    <button class="btn-register" onclick="window.location.href='/events#${this.escapeHtml(event.id)}'">
                        <i class="fas fa-calendar-plus"></i> Register
                    </button>
                    <button class="btn-details" onclick="window.location.href='/events#${this.escapeHtml(event.id)}'">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
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
    showToast(message, type) {
        window.Utils?.showToast(message, type);
    }
}

window.ComponentsManager = ComponentsManager;