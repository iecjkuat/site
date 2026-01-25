// JKUAT Innovation Club - Opportunities Page Manager

class OpportunitiesManager {
    constructor() {
        this.opportunities = [];
        this.filteredOpportunities = [];
        this.currentFilter = 'all';
        this.currentFilters = {
            page: 1,
            limit: 12,
            type: '',
            category: '',
            location: '',
            search: '',
            featured: false,
            sort: 'created_at'
        };
        this.isLoading = false;
        this.currentUser = null;
        this.init();
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async init() {
        console.log('🚀 Initializing OpportunitiesManager...');

        // Get current user if available
        this.currentUser = window.currentUser || null;

        // Initialize mock service if no real service available
        this.initializeService();

        // Load opportunities and bind events
        await this.loadOpportunities();
        this.bindEvents();

        console.log('✅ OpportunitiesManager initialized');
    }

    initializeService() {
        // Enhanced service with API integration
        this.opportunitiesService = {
            getOpportunities: async (filters) => {
                try {
                    // Try API first
                    const params = new URLSearchParams({
                        page: filters.page || 1,
                        limit: filters.limit || 12,
                        type: filters.type || '',
                        location: filters.location || '',
                        search: filters.search || '',
                        sort: filters.sort || 'created_at',
                        featured: filters.featured || false
                    });

                    const response = await fetch(`/api/opportunities?${params}`);

                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Opportunities loaded from API:', data.opportunities?.length || 0);
                        return data;
                    } else {
                        throw new Error('API failed');
                    }
                } catch (error) {
                    console.log('⚠️ API unavailable, using mock data');

                    // Fallback to mock data
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const mockData = window.opportunitiesMockData || this.getMockOpportunities();
                    let opportunities = [...mockData];

                    // Apply filters
                    if (filters.type) {
                        opportunities = opportunities.filter(opp => opp.opportunity_type === filters.type);
                    }
                    if (filters.location) {
                        opportunities = opportunities.filter(opp => opp.location.includes(filters.location));
                    }
                    if (filters.search) {
                        const searchTerm = filters.search.toLowerCase();
                        opportunities = opportunities.filter(opp =>
                            opp.title.toLowerCase().includes(searchTerm) ||
                            opp.description.toLowerCase().includes(searchTerm) ||
                            opp.organization.toLowerCase().includes(searchTerm)
                        );
                    }
                    if (filters.featured) {
                        opportunities = opportunities.filter(opp => opp.is_featured);
                    }

                    // Sort
                    opportunities.sort((a, b) => {
                        switch (filters.sort) {
                            case 'created_at':
                                return new Date(b.created_at) - new Date(a.created_at);
                            case 'application_deadline':
                                return new Date(a.application_deadline) - new Date(b.application_deadline);
                            case 'view_count':
                                return b.view_count - a.view_count;
                            case 'compensation_amount':
                                return (b.compensation_amount || 0) - (a.compensation_amount || 0);
                            default:
                                return 0;
                        }
                    });

                    // Pagination
                    const page = filters.page || 1;
                    const limit = filters.limit || 12;
                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedOpportunities = opportunities.slice(startIndex, endIndex);

                    return {
                        opportunities: paginatedOpportunities,
                        pagination: {
                            current: page,
                            total: Math.ceil(opportunities.length / limit),
                            totalOpportunities: opportunities.length
                        }
                    };
                }
            },

            getOpportunity: async (id, userId) => {
                const mockData = window.opportunitiesMockData || this.getMockOpportunities();
                const opportunity = mockData.find(opp => opp.id === parseInt(id));
                if (opportunity) {
                    // Add user-specific data
                    opportunity.isBookmarked = false;
                    opportunity.userApplication = null;
                }
                return opportunity;
            },

            toggleBookmark: async (opportunityId, userId) => {
                // Mock bookmark toggle
                return {
                    bookmarked: true,
                    message: 'Opportunity bookmarked successfully!'
                };
            },

            getCategories: async () => {
                return {
                    categories: [
                        { id: 1, name: 'Competition', color: '#f59e0b' },
                        { id: 2, name: 'Funding', color: '#10b981' },
                        { id: 3, name: 'Internship', color: '#3b82f6' },
                        { id: 4, name: 'Job', color: '#8b5cf6' },
                        { id: 5, name: 'Networking', color: '#ef4444' },
                        { id: 6, name: 'Grant', color: '#06b6d4' }
                    ]
                };
            }
        };
    }

    getMockOpportunities() {
        return [
            {
                id: 1,
                title: "Google Summer of Code 2026",
                organization: "Google",
                description: "Work with open source organizations on exciting projects during the summer. Get mentored by experienced developers and contribute to real-world software used by millions.",
                opportunity_type: "internship",
                location: "Remote",
                location_type: "remote",
                compensation_amount: 150000,
                compensation_currency: "KES",
                compensation_type: "stipend",
                application_deadline: "2026-03-15",
                daysUntilDeadline: 69,
                is_featured: true,
                view_count: 1250,
                application_count: 89,
                bookmark_count: 156,
                tags: ["Open Source", "Programming", "Mentorship", "Remote"],
                eligibility_criteria: "Must be enrolled in a university program. Strong programming skills required.",
                application_requirements: "Resume, cover letter, and code samples required.",
                application_url: "https://summerofcode.withgoogle.com",
                created_at: "2026-01-01T00:00:00Z",
                category: { color: '#3b82f6' }
            },
            {
                id: 2,
                title: "Safaricom Innovation Challenge",
                organization: "Safaricom",
                description: "Develop innovative solutions for Kenya's digital transformation. Win cash prizes and get a chance to work with Safaricom's innovation team.",
                opportunity_type: "competition",
                location: "Nairobi, Kenya",
                location_type: "hybrid",
                compensation_amount: 500000,
                compensation_currency: "KES",
                compensation_type: "prize",
                application_deadline: "2026-02-28",
                daysUntilDeadline: 54,
                is_featured: true,
                view_count: 890,
                application_count: 67,
                bookmark_count: 123,
                tags: ["Innovation", "Mobile Technology", "Kenya", "Fintech"],
                eligibility_criteria: "Open to Kenyan citizens and residents. Team or individual participation allowed.",
                application_requirements: "Project proposal, prototype demo, and presentation required.",
                created_at: "2026-01-02T00:00:00Z",
                category: { color: '#f59e0b' }
            },
            {
                id: 3,
                title: "Microsoft Africa Development Centre Internship",
                organization: "Microsoft",
                description: "Join Microsoft's engineering teams in Kenya and Nigeria. Work on products used by millions of people across Africa and globally.",
                opportunity_type: "internship",
                location: "Nairobi, Kenya",
                location_type: "onsite",
                compensation_amount: 80000,
                compensation_currency: "KES",
                compensation_type: "monthly",
                application_deadline: "2026-04-30",
                daysUntilDeadline: 115,
                is_featured: false,
                view_count: 756,
                application_count: 234,
                bookmark_count: 189,
                tags: ["Software Engineering", "Cloud", "AI", "Microsoft"],
                eligibility_criteria: "Computer Science or related field. Strong programming skills in C#, Python, or JavaScript.",
                application_requirements: "Resume, transcripts, and coding assessment required.",
                created_at: "2026-01-03T00:00:00Z",
                category: { color: '#3b82f6' }
            },
            {
                id: 4,
                title: "Startup Funding Bootcamp",
                organization: "iHub Nairobi",
                description: "Learn how to raise funding for your startup. Network with investors and get mentorship from successful entrepreneurs.",
                opportunity_type: "networking",
                location: "Nairobi, Kenya",
                location_type: "onsite",
                compensation_amount: null,
                compensation_currency: null,
                compensation_type: null,
                application_deadline: "2026-02-15",
                daysUntilDeadline: 41,
                is_featured: false,
                view_count: 445,
                application_count: 78,
                bookmark_count: 92,
                tags: ["Entrepreneurship", "Funding", "Networking", "Startups"],
                eligibility_criteria: "Must have a startup idea or existing startup. Open to all backgrounds.",
                application_requirements: "Startup pitch deck and application form required.",
                created_at: "2026-01-04T00:00:00Z",
                category: { color: '#ef4444' }
            },
            {
                id: 5,
                title: "Kenya Climate Innovation Grant",
                organization: "Kenya Climate Ventures",
                description: "Funding for climate-focused startups and projects in Kenya. Up to $50,000 in grant funding plus mentorship and support.",
                opportunity_type: "grant",
                location: "Kenya",
                location_type: "hybrid",
                compensation_amount: 5000000,
                compensation_currency: "KES",
                compensation_type: "grant",
                application_deadline: "2026-03-31",
                daysUntilDeadline: 85,
                is_featured: true,
                view_count: 623,
                application_count: 45,
                bookmark_count: 167,
                tags: ["Climate", "Sustainability", "Grant", "Environment"],
                eligibility_criteria: "Climate-focused projects or startups based in Kenya.",
                application_requirements: "Detailed project proposal, budget, and impact assessment required.",
                created_at: "2026-01-05T00:00:00Z",
                category: { color: '#06b6d4' }
            },
            {
                id: 6,
                title: "Software Developer - Fintech Startup",
                organization: "Tala Kenya",
                description: "Join our engineering team building financial products for emerging markets. Work with cutting-edge technology and make a real impact.",
                opportunity_type: "job",
                location: "Nairobi, Kenya",
                location_type: "hybrid",
                compensation_amount: 120000,
                compensation_currency: "KES",
                compensation_type: "monthly",
                application_deadline: null,
                daysUntilDeadline: null,
                is_featured: false,
                view_count: 892,
                application_count: 156,
                bookmark_count: 203,
                tags: ["Fintech", "Full-time", "React", "Node.js"],
                eligibility_criteria: "3+ years of software development experience. Experience with React and Node.js preferred.",
                application_requirements: "Resume, portfolio, and technical interview required.",
                created_at: "2026-01-06T00:00:00Z",
                category: { color: '#8b5cf6' }
            }
        ];
    }

    bindEvents() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Apply filter
                this.currentFilter = btn.dataset.filter;
                this.applyFilter(this.currentFilter);
            });
        });
    }

    async loadOpportunities() {
        const grid = document.getElementById('opportunitiesGrid');
        const loading = document.getElementById('opportunitiesLoading');
        const noMessage = document.getElementById('noOpportunitiesMessage');

        // Show loading
        if (loading) loading.style.display = 'block';
        if (noMessage) noMessage.style.display = 'none';
        if (grid) grid.innerHTML = '';

        try {
            const data = await this.opportunitiesService.getOpportunities(this.currentFilters);
            this.opportunities = data.opportunities;
            this.renderOpportunities();

            // Update stats
            this.updateStats(data.pagination.totalOpportunities);

        } catch (error) {
            console.error('Error loading opportunities:', error);
            this.showError('Failed to load opportunities. Please try again.');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    renderOpportunities() {
        const grid = document.getElementById('opportunitiesGrid');
        const noMessage = document.getElementById('noOpportunitiesMessage');

        if (!this.opportunities || this.opportunities.length === 0) {
            if (grid) grid.innerHTML = '';
            if (noMessage) noMessage.style.display = 'block';
            return;
        }

        if (noMessage) noMessage.style.display = 'none';

        if (grid) {
            grid.innerHTML = this.opportunities.map(opportunity =>
                this.createOpportunityCard(opportunity)
            ).join('');

            // Add click handlers for View Details buttons
            this.addViewDetailsHandlers();
        }
    }

    createOpportunityCard(opportunity) {
        const deadlineText = opportunity.application_deadline
            ? `<div class="deadline">
                 <i class="fas fa-clock"></i>
                 Deadline: ${new Date(opportunity.application_deadline).toLocaleDateString()}
               </div>`
            : '';

        const compensationText = opportunity.compensation_amount
            ? `<div class="compensation">
                 <i class="fas fa-money-bill-wave"></i>
                 ${this.escapeHtml(this.formatCompensation(opportunity))}
               </div>`
            : '';

        return `
            <div class="opportunity-card glass-card" data-id="${this.escapeHtml(opportunity.id)}">
                <div class="card-header">
                    <div class="opportunity-type ${this.escapeHtml(opportunity.opportunity_type)}">
                        <i class="fas ${this.escapeHtml(this.getTypeIcon(opportunity.opportunity_type))}"></i>
                        ${this.escapeHtml(opportunity.opportunity_type.charAt(0).toUpperCase() + opportunity.opportunity_type.slice(1))}
                    </div>
                    ${opportunity.is_featured ? '<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
                </div>
                
                <h3 class="opportunity-title">${this.escapeHtml(opportunity.title)}</h3>
                <div class="organization">${this.escapeHtml(opportunity.organization)}</div>
                <p class="description">${this.escapeHtml(opportunity.description)}</p>
                
                <div class="opportunity-details">
                    <div class="location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${this.escapeHtml(opportunity.location)}
                    </div>
                    ${compensationText}
                    ${deadlineText}
                </div>
                
                <div class="opportunity-stats">
                    <span><i class="fas fa-eye"></i> ${this.escapeHtml(opportunity.view_count)}</span>
                    <span><i class="fas fa-users"></i> ${this.escapeHtml(opportunity.application_count)}</span>
                </div>
                
                <div class="opportunity-actions">
                    <button class="btn btn-primary view-details" data-id="${this.escapeHtml(opportunity.id)}">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        `;
    }

    addViewDetailsHandlers() {
        const viewButtons = document.querySelectorAll('.view-details');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const opportunityId = btn.dataset.id;
                this.showOpportunityDetails(opportunityId);
            });
        });
    }

    showOpportunityDetails(opportunityId) {
        // Find the opportunity in our data
        const opportunity = this.opportunities.find(opp => opp.id === parseInt(opportunityId));
        if (opportunity) {
            this.openDetailsModal(opportunity);
        }
    }

    openDetailsModal(opportunity) {
        const modal = document.getElementById('opportunityModal');
        const modalContent = document.getElementById('opportunityModalContent');

        if (!modal || !modalContent) return;

        const compensationText = opportunity.compensation_amount
            ? `<p><strong>💰 Compensation:</strong> ${this.escapeHtml(this.formatCompensation(opportunity))}</p>`
            : '';

        const deadlineText = opportunity.application_deadline
            ? `<p><strong>⏰ Application Deadline:</strong> ${new Date(opportunity.application_deadline).toLocaleDateString()}</p>`
            : '';

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${this.escapeHtml(opportunity.title)}</h2>
                <p class="organization"><strong>🏢 ${this.escapeHtml(opportunity.organization)}</strong></p>
                <div class="opportunity-type-badge ${this.escapeHtml(opportunity.opportunity_type)}">
                    <i class="fas ${this.escapeHtml(this.getTypeIcon(opportunity.opportunity_type))}"></i>
                    ${this.escapeHtml(opportunity.opportunity_type.charAt(0).toUpperCase() + opportunity.opportunity_type.slice(1))}
                </div>
            </div>
            
            <div class="modal-body">
                <div class="opportunity-details">
                    <p><strong>📍 Location:</strong> ${this.escapeHtml(opportunity.location)}</p>
                    ${compensationText}
                    ${deadlineText}
                </div>
                
                <div class="description-section">
                    <h3>📋 Details</h3>
                    <div class="description-content">
                        ${this.escapeHtml(opportunity.description)}
                        
                        ${opportunity.eligibility_criteria ? `
                            <br><br><strong>✅ Eligibility:</strong><br>
                            ${this.escapeHtml(opportunity.eligibility_criteria)}
                        ` : ''}
                        
                        ${opportunity.application_requirements ? `
                            <br><br><strong>📝 Requirements:</strong><br>
                            ${this.escapeHtml(opportunity.application_requirements)}
                        ` : ''}
                        
                        ${opportunity.application_url ? `
                            <br><br><strong>🔗 Apply Here:</strong><br>
                            <a href="${this.escapeHtml(opportunity.application_url)}" target="_blank" style="color: #3b82f6; text-decoration: underline;">
                                ${this.escapeHtml(opportunity.application_url)}
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    applyFilter(filter) {
        this.currentFilters.type = filter === 'all' ? '' : filter;
        this.currentFilters.page = 1;
        this.loadOpportunities();
    }

    updateStats(totalCount) {
        const totalElement = document.getElementById('totalOpportunitiesCount');
        if (totalElement) {
            totalElement.textContent = totalCount || this.opportunities.length;
        }
    }

    showError(message) {
        const grid = document.getElementById('opportunitiesGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message glass-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this.escapeHtml(message)}</p>
                    <button class="btn btn-primary" onclick="window.opportunitiesManager.loadOpportunities()">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    // Utility methods
    getTypeIcon(type) {
        const icons = {
            competition: 'fa-trophy',
            funding: 'fa-dollar-sign',
            internship: 'fa-briefcase',
            job: 'fa-user-tie',
            networking: 'fa-users',
            partnership: 'fa-handshake',
            grant: 'fa-award'
        };
        return icons[type] || 'fa-briefcase';
    }

    getDeadlineColor(daysUntilDeadline) {
        if (!daysUntilDeadline) return 'rgba(255, 255, 255, 0.6)';
        if (daysUntilDeadline <= 7) return '#ef4444';
        if (daysUntilDeadline <= 30) return '#f59e0b';
        return '#10b981';
    }

    formatCompensation(opportunity) {
        if (!opportunity.compensation_amount) return null;

        const amount = new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: opportunity.compensation_currency || 'KES',
            minimumFractionDigits: 0
        }).format(opportunity.compensation_amount);

        return amount;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Opportunities page DOM loaded');
    window.opportunitiesManager = new OpportunitiesManager();
});

// Make available globally
window.OpportunitiesManager = OpportunitiesManager;