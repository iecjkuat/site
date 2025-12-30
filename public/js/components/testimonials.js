// JKUAT Innovation Club - Testimonials Component
// TODO: Implement dynamic testimonials from database

class Testimonials {
    constructor() {
        this.container = document.getElementById('testimonialsGrid');
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            await this.loadTestimonials();
        } catch (error) {
            console.error('Failed to load testimonials:', error);
            this.showStaticTestimonials();
        }
        
        console.log('📝 Testimonials component initialized');
    }

    async loadTestimonials() {
        try {
            console.log('📝 Fetching testimonials from API...');
            const response = await fetch('/api/testimonials?featured=true&limit=3');
            
            if (!response.ok) {
                throw new Error('Failed to fetch testimonials');
            }
            
            const data = await response.json();
            const testimonials = data.testimonials || [];
            
            console.log(`✅ Loaded ${testimonials.length} testimonials`);
            this.renderTestimonials(testimonials);
        } catch (error) {
            console.error('Error loading testimonials:', error);
            this.showStaticTestimonials();
        }
    }

    renderTestimonials(testimonials) {
        if (!testimonials || testimonials.length === 0) {
            this.showStaticTestimonials();
            return;
        }

        this.container.innerHTML = testimonials.map(testimonial => this.createTestimonialCard(testimonial)).join('');
    }

    createTestimonialCard(testimonial) {
        const colors = [
            { bg: 'linear-gradient(135deg, #10b981, #059669)' },
            { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
            { bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
            { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
            { bg: 'linear-gradient(135deg, #ef4444, #dc2626)' },
            { bg: 'linear-gradient(135deg, #06b6d4, #0891b2)' }
        ];
        
        // Use a simple hash of the name to pick a consistent color
        const colorIndex = testimonial.name.length % colors.length;
        const color = colors[colorIndex];
        
        // Generate initials from name
        const initials = testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Format course and year
        const subtitle = testimonial.course && testimonial.year ? 
            `${testimonial.course}, ${testimonial.year}` : 
            testimonial.course || testimonial.title || 'Club Member';

        return `
            <div class="glass-card animate-on-scroll" style="padding: 2.5rem; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${color.bg};"></div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    ${testimonial.photo_url ? 
                        `<img src="${testimonial.photo_url}" alt="${testimonial.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">` :
                        `<div style="width: 60px; height: 60px; background: ${color.bg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">
                            ${initials}
                        </div>`
                    }
                    <div>
                        <h4 style="color: white; font-weight: 600; margin-bottom: 0.25rem;">${testimonial.name}</h4>
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">${subtitle}</p>
                    </div>
                </div>
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-style: italic; margin-bottom: 1rem;">
                    "${testimonial.content}"
                </p>
                <div style="display: flex; gap: 0.25rem;">
                    ${'★'.repeat(testimonial.rating || 5).split('').map(star => `<span style="color: #fbbf24; font-size: 1rem;">${star}</span>`).join('')}
                </div>
            </div>
        `;
    }

    showStaticTestimonials() {
        // Keep the current static testimonials as fallback
        console.log('📝 Using static testimonials (dynamic testimonials not implemented yet)');
    }
}

// Initialize testimonials component
document.addEventListener('DOMContentLoaded', () => {
    new Testimonials();
});

// Make available globally for future use
window.Testimonials = Testimonials;

/* 
TODO: Future Database Schema for Testimonials

CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    year VARCHAR(50),
    title VARCHAR(255), -- Job title or position
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    photo_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Endpoints to implement:
-- GET /api/testimonials - Get approved testimonials
-- POST /api/testimonials - Submit new testimonial (authenticated)
-- PUT /api/testimonials/:id/approve - Approve testimonial (admin only)
-- DELETE /api/testimonials/:id - Delete testimonial (admin only)
*/