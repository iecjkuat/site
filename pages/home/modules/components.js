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
            this.initSuccessStories();
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

    async initSuccessStories() {
        const storiesContainer = document.getElementById('storiesContainer');
        if (!storiesContainer) return;

        console.log('🏆 Initializing success stories...');

        try {
            // Try API first
            const response = await fetch('/api/testimonials?featured=true&limit=4');

            if (response.ok) {
                const data = await response.json();
                const stories = data.testimonials || [];
                console.log('✅ Success stories loaded from API:', stories.length);
                this.renderSuccessStories(stories, storiesContainer);
                return;
            }
        } catch (error) {
            console.log('⚠️ API failed, using mock success stories:', error.message);
        }

        // Fallback to mock data
        const stories = [
            {
                id: 1,
                name: "Alex Mwangi",
                title: "Software Engineer at Safaricom",
                content: "The Innovation Club transformed my university experience. Through the mentorship program and hackathons, I developed the skills that landed me my dream job at Safaricom.",
                course: "Computer Science",
                year: "2023 Graduate",
                rating: 5,
                is_featured: true,
                achievement: "Landed job at Safaricom",
                impact: "Built 3 mobile apps used by 10K+ users"
            },
            {
                id: 2,
                name: "Grace Wanjiku",
                title: "Founder, EcoTech Solutions",
                content: "Starting my green technology startup seemed impossible until I joined the club. The entrepreneurship workshops and investor connections made it a reality.",
                course: "Environmental Engineering",
                year: "2022 Graduate",
                rating: 5,
                is_featured: true,
                achievement: "Founded successful startup",
                impact: "Raised KSh 5M in seed funding"
            },
            {
                id: 3,
                name: "David Kimani",
                title: "AI Research Scientist",
                content: "The research opportunities and industry partnerships opened doors I never knew existed. Now I'm working on cutting-edge AI projects that impact millions.",
                course: "Electrical Engineering",
                year: "2021 Graduate",
                rating: 5,
                is_featured: true,
                achievement: "Published 5 research papers",
                impact: "AI model deployed in 20+ countries"
            },
            {
                id: 4,
                name: "Sarah Mutua",
                title: "Product Manager at Microsoft",
                content: "The leadership roles and project management experience I gained prepared me for my current position at Microsoft. The network I built is invaluable.",
                course: "Business Information Technology",
                year: "2023 Graduate",
                rating: 5,
                is_featured: true,
                achievement: "Product Manager at Microsoft",
                impact: "Managing products used by 100M+ users"
            }
        ];

        console.log('📋 Using mock success stories');
        this.renderSuccessStories(stories, storiesContainer);
    }

    renderSuccessStories(stories, container) {
        container.innerHTML = '';
        
        // Store stories for carousel
        this.stories = stories;
        this.currentSlide = 0;

        stories.forEach((story, index) => {
            const card = document.createElement('div');
            card.className = 'success-story-card';
            card.innerHTML = `
                <div class="story-header">
                    <div class="story-avatar avatar-${(index % 4) + 1}">
                        ${this.escapeHtml(story.name.split(' ').map(n => n[0]).join(''))}
                    </div>
                    <div class="story-info">
                        <h4>${this.escapeHtml(story.name)}</h4>
                        <p class="story-title">${this.escapeHtml(story.title)}</p>
                    </div>
                </div>
                
                <div class="story-content">
                    <p class="story-text">"${this.escapeHtml(story.content.substring(0, 120))}..."</p>
                    
                    <div class="story-achievement">
                        <i class="fas fa-trophy"></i>
                        <span>${this.escapeHtml(story.achievement || 'Key Achievement')}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        console.log('✅ Success stories loaded');
        
        // Initialize carousel controls
        this.initCarouselControls();
    }
    
    initCarouselControls() {
        const prevBtn = document.getElementById('storiesPrevBtn');
        const nextBtn = document.getElementById('storiesNextBtn');
        const indicatorsContainer = document.getElementById('storiesIndicators');
        const track = document.getElementById('storiesContainer');
        
        if (!prevBtn || !nextBtn || !indicatorsContainer || !track) return;
        
        // Calculate slides per view based on screen size
        const getSlidesPerView = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };
        
        const totalSlides = this.stories.length;
        const slidesPerView = getSlidesPerView();
        const maxSlide = Math.max(0, totalSlides - slidesPerView);
        
        // Create indicators
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i <= maxSlide; i++) {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
        
        // Navigation button handlers
        prevBtn.addEventListener('click', () => this.previousSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) this.nextSlide();
            if (touchEndX - touchStartX > 50) this.previousSlide();
        });
        
        // Update on window resize
        window.addEventListener('resize', () => {
            this.updateCarousel();
        });
        
        // Initial update
        this.updateCarousel();
    }
    
    goToSlide(index) {
        const track = document.getElementById('storiesContainer');
        if (!track) return;
        
        const getSlidesPerView = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };
        
        const slidesPerView = getSlidesPerView();
        const maxSlide = Math.max(0, this.stories.length - slidesPerView);
        
        this.currentSlide = Math.max(0, Math.min(index, maxSlide));
        this.updateCarousel();
    }
    
    nextSlide() {
        const getSlidesPerView = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };
        
        const slidesPerView = getSlidesPerView();
        const maxSlide = Math.max(0, this.stories.length - slidesPerView);
        
        if (this.currentSlide < maxSlide) {
            this.currentSlide++;
            this.updateCarousel();
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateCarousel();
        }
    }
    
    updateCarousel() {
        const track = document.getElementById('storiesContainer');
        const prevBtn = document.getElementById('storiesPrevBtn');
        const nextBtn = document.getElementById('storiesNextBtn');
        const indicators = document.querySelectorAll('.carousel-indicator');
        
        if (!track) return;
        
        const getSlidesPerView = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };
        
        const slidesPerView = getSlidesPerView();
        const slideWidth = 100 / slidesPerView;
        const maxSlide = Math.max(0, this.stories.length - slidesPerView);
        
        // Ensure currentSlide is within bounds
        this.currentSlide = Math.max(0, Math.min(this.currentSlide, maxSlide));
        
        // Update track position
        track.style.transform = `translateX(-${this.currentSlide * slideWidth}%)`;
        
        // Update button states
        if (prevBtn) prevBtn.disabled = this.currentSlide === 0;
        if (nextBtn) nextBtn.disabled = this.currentSlide >= maxSlide;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
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
        this.initSuccessStories();
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