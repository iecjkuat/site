/**
 * Opportunities Page - Partnerships & Opportunities Frontend
 */
class OpportunitiesPage {
    constructor() {
        this.opportunitiesService = new OpportunitiesService();
        this.currentFilters = {
            page: 1,
            limit: 12,
            type: '',
            category: '',
            location: '',
            search: '',
            featured: false
        };
        this.currentUser = null;
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Opportunities Page...');
        
        // Get current user if available
        this.currentUser = window.jkuatApp?.getModule('auth')?.getCurrentUser();
        
        // Initialize UI components
        this.initializeUI();
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Opportunities Page initialized');
    }

    initializeUI() {
        // Create main opportunities interface
        this.createOpportunitiesInterface();
        
        // Initialize filters
        this.initializeFilters();
        
        // Initialize search
        this.initializeSearch();
    }

    createOpportunitiesInterface() {
        const container = document.createElement('div');
        container.className = 'opportunities-container';
        container.innerHTML = `
            <!-- Filters Section -->
            <section class="filters-section" style="padding: 2rem 0; position: relative; z-index: 10;">
                <div class="container">
                    <div class="glass-card" style="padding: 2rem; border-radius: 20px;">
                        <!-- Filter Tabs -->
                        <div class="filter-tabs" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
                            <button class="filter-tab active" data-type="" style="padding: 0.75rem 1.5rem; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 25px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-th-large"></i> All Opportunities
                            </button>
                            <button class="filter-tab" data-type="competition" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px; color: rgba(255, 255, 255, 0.8); font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-trophy"></i> Competitions
                            </button>
                            <button class="filter-tab" data-type="funding" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px; color: rgba(255, 255, 255, 0.8); font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-dollar-sign"></i> Funding
                            </button>
                            <button class="filter-tab" data-type="internship" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px; color: rgba(255, 255, 255, 0.8); font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-briefcase"></i> Internships
                            </button>
                            <button class="filter-tab" data-type="job" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px; color: rgba(255, 255, 255, 0.8); font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-user-tie"></i> Jobs
                            </button>
                            <button class="filter-tab" data-type="networking" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px; color: rgba(255, 255, 255, 0.8); font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-users"></i> Networking
                            </button>
                            <button class="filter-tab" data-type="grant" style="padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px; color: rgba(255, 255, 255, 0.8); font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-award"></i> Grants
                            </button>
                        </div>
                        
                        <!-- Additional Filters -->
                        <div class="additional-filters" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: end;">
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-bottom: 0.5rem;">Location</label>
                                <select id="locationFilter" class="glass-input" style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white;">
                                    <option value="">All Locations</option>
                                    <option value="Nairobi">Nairobi</option>
                                    <option value="Kenya">Kenya</option>
                                    <option value="Remote">Remote</option>
                                    <option value="International">International</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-bottom: 0.5rem;">Sort By</label>
                                <select id="sortFilter" class="glass-input" style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white;">
                                    <option value="created_at">Newest First</option>
                                    <option value="application_deadline">Deadline</option>
                                    <option value="view_count">Most Popular</option>
                                    <option value="compensation_amount">Highest Compensation</option>
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8); cursor: pointer;">
                                    <input type="checkbox" id="featuredFilter" style="accent-color: #3b82f6;">
                                    Featured Only
                                </label>
                                <button id="clearFilters" class="btn-glass" style="padding: 0.75rem 1rem; white-space: nowrap;">
                                    <i class="fas fa-times"></i> Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Opportunities Grid -->
            <section class="opportunities-section" style="padding: 2rem 0 4rem 0; position: relative; z-index: 10;">
                <div class="container">
                    <!-- Stats Bar -->
                    <div class="stats-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 2rem; background: rgba(255, 255, 255, 0.1); border-radius: 15px; backdrop-filter: blur(10px);">
                        <div id="opportunitiesCount" style="color: white; font-weight: 600;">
                            Loading opportunities...
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button id="gridViewBtn" class="view-toggle active" style="padding: 0.5rem; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; color: white; cursor: pointer;">
                                <i class="fas fa-th"></i>
                            </button>
                            <button id="listViewBtn" class="view-toggle" style="padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: rgba(255, 255, 255, 0.7); cursor: pointer;">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Opportunities Grid -->
                    <div id="opportunitiesGrid" class="opportunities-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
                        <!-- Loading placeholder -->
                        <div class="loading-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: rgba(255, 255, 255, 0.7);">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                            <div>Loading opportunities...</div>
                        </div>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="paginationContainer" class="pagination-container" style="display: flex; justify-content: center; align-items: center; gap: 1rem;">
                        <!-- Pagination will be inserted here -->
                    </div>
                </div>
            </section>
        `;
        
        // Insert after hero section
        const heroSection = document.querySelector('section');
        heroSection.parentNode.insertBefore(container, heroSection.nextSibling);
    }

    initializeFilters() {
        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active state
                filterTabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'rgba(255, 255, 255, 0.1)';
                    t.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    t.style.color = 'rgba(255, 255, 255, 0.8)';
                });
                
                tab.classList.add('active');
                tab.style.background = 'rgba(59, 130, 246, 0.2)';
                tab.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                tab.style.color = 'white';
                
                // Update filter and reload
                this.currentFilters.type = tab.dataset.type;
                this.currentFilters.page = 1;
                this.loadOpportunities();
            });
        });

        // Additional filters
        const locationFilter = document.getElementById('locationFilter');
        const sortFilter = document.getElementById('sortFilter');
        const featuredFilter = document.getElementById('featuredFilter');
        const clearFilters = document.getElementById('clearFilters');

        locationFilter.addEventListener('change', () => {
            this.currentFilters.location = locationFilter.value;
            this.currentFilters.page = 1;
            this.loadOpportunities();
        });

        sortFilter.addEventListener('change', () => {
            this.currentFilters.sort = sortFilter.value;
            this.currentFilters.page = 1;
            this.loadOpportunities();
        });

        featuredFilter.addEventListener('change', () => {
            this.currentFilters.featured = featuredFilter.checked;
            this.currentFilters.page = 1;
            this.loadOpportunities();
        });

        clearFilters.addEventListener('click', () => {
            this.clearAllFilters();
        });
    }

    initializeSearch() {
        const searchInput = document.getElementById('opportunitySearch');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.currentFilters.page = 1;
                    this.loadOpportunities();
                }, 500);
            });
        }
    }

    async loadInitialData() {
        // Load opportunities
        await this.loadOpportunities();
        
        // Load categories for future use
        try {
            const categoriesData = await this.opportunitiesService.getCategories();
            this.categories = categoriesData.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadOpportunities() {
        const grid = document.getElementById('opportunitiesGrid');
        const countElement = document.getElementById('opportunitiesCount');
        
        // Show loading
        grid.innerHTML = `
            <div class="loading-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: rgba(255, 255, 255, 0.7);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <div>Loading opportunities...</div>
            </div>
        `;

        try {
            const data = await this.opportunitiesService.getOpportunities(this.currentFilters);
            this.renderOpportunities(data.opportunities);
            this.renderPagination(data.pagination);
            
            // Update count
            const { current, totalOpportunities } = data.pagination;
            countElement.textContent = `Showing ${data.opportunities.length} of ${totalOpportunities} opportunities`;
            
        } catch (error) {
            console.error('Error loading opportunities:', error);
            grid.innerHTML = `
                <div class="error-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: rgba(255, 255, 255, 0.7);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;"></i>
                    <div>Failed to load opportunities. Please try again.</div>
                </div>
            `;
        }
    }

    renderOpportunities(opportunities) {
        const grid = document.getElementById('opportunitiesGrid');
        
        if (!opportunities || opportunities.length === 0) {
            grid.innerHTML = `
                <div class="empty-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: rgba(255, 255, 255, 0.7);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.8);">No opportunities found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = opportunities.map(opportunity => this.createOpportunityCard(opportunity)).join('');
        
        // Add event listeners to cards
        this.setupCardEventListeners();
    }

    createOpportunityCard(opportunity) {
        const deadlineColor = this.getDeadlineColor(opportunity.daysUntilDeadline);
        const typeIcon = this.getTypeIcon(opportunity.opportunity_type);
        const compensationText = this.formatCompensation(opportunity);
        
        return `
            <div class="opportunity-card glass-card" data-id="${opportunity.id}" style="padding: 2rem; border-radius: 20px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;">
                ${opportunity.is_featured ? '<div class="featured-badge" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-star"></i> Featured</div>' : ''}
                
                <!-- Header -->
                <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="opportunity-icon" style="width: 50px; height: 50px; background: ${opportunity.category?.color || '#3b82f6'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; flex-shrink: 0;">
                        <i class="fas ${typeIcon}"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="color: white; font-weight: 700; font-size: 1.125rem; margin-bottom: 0.5rem; line-height: 1.3;">${opportunity.title}</h3>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; font-weight: 600;">${opportunity.organization}</div>
                    </div>
                </div>
                
                <!-- Description -->
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${opportunity.description}</p>
                
                <!-- Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 0.25rem;">Type</div>
                        <div style="color: white; font-weight: 600; text-transform: capitalize;">${opportunity.opportunity_type}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 0.25rem;">Location</div>
                        <div style="color: white; font-weight: 600;">${opportunity.location}</div>
                    </div>
                    ${compensationText ? `
                    <div style="grid-column: 1 / -1;">
                        <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 0.25rem;">Compensation</div>
                        <div style="color: #10b981; font-weight: 700;">${compensationText}</div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">
                        <span><i class="fas fa-eye"></i> ${opportunity.view_count}</span>
                        <span><i class="fas fa-users"></i> ${opportunity.application_count}</span>
                        <span><i class="fas fa-bookmark"></i> ${opportunity.bookmark_count}</span>
                    </div>
                    ${opportunity.application_deadline ? `
                    <div style="color: ${deadlineColor}; font-size: 0.75rem; font-weight: 600;">
                        <i class="fas fa-clock"></i> ${opportunity.daysUntilDeadline} days left
                    </div>
                    ` : ''}
                </div>
                
                <!-- Tags -->
                ${opportunity.tags && opportunity.tags.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
                    ${opportunity.tags.slice(0, 3).map(tag => `
                        <span style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.8); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">${tag}</span>
                    `).join('')}
                    ${opportunity.tags.length > 3 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">+${opportunity.tags.length - 3} more</span>` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    setupCardEventListeners() {
        const cards = document.querySelectorAll('.opportunity-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const opportunityId = card.dataset.id;
                this.openOpportunityModal(opportunityId);
            });
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        });
    }

    async openOpportunityModal(opportunityId) {
        try {
            const opportunity = await this.opportunitiesService.getOpportunity(
                opportunityId, 
                this.currentUser?.id
            );
            
            this.showOpportunityModal(opportunity);
        } catch (error) {
            console.error('Error loading opportunity details:', error);
            window.jkuatApp?.showToast('Failed to load opportunity details', 'error');
        }
    }

    showOpportunityModal(opportunity) {
        const modal = document.createElement('div');
        modal.className = 'opportunity-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;
        
        const deadlineColor = this.getDeadlineColor(opportunity.daysUntilDeadline);
        const typeIcon = this.getTypeIcon(opportunity.opportunity_type);
        const compensationText = this.formatCompensation(opportunity);
        
        modal.innerHTML = `
            <div class="modal-content glass-card" style="max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 3rem; border-radius: 25px; position: relative;">
                <button class="close-modal" style="position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255, 255, 255, 0.1); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                    <i class="fas fa-times"></i>
                </button>
                
                <!-- Header -->
                <div style="display: flex; align-items: flex-start; gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="opportunity-icon" style="width: 70px; height: 70px; background: ${opportunity.category?.color || '#3b82f6'}; border-radius: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.75rem; flex-shrink: 0;">
                        <i class="fas ${typeIcon}"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h2 style="color: white; font-weight: 800; font-size: 1.75rem; margin-bottom: 0.5rem; line-height: 1.2;">${opportunity.title}</h2>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">${opportunity.organization}</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
                            <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                                <i class="fas ${typeIcon}"></i> ${opportunity.opportunity_type}
                            </span>
                            ${opportunity.is_featured ? '<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;"><i class="fas fa-star"></i> Featured</span>' : ''}
                            ${opportunity.application_deadline ? `<span style="color: ${deadlineColor}; font-weight: 600;"><i class="fas fa-clock"></i> ${opportunity.daysUntilDeadline} days left</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Description -->
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1rem;">Description</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.7; font-size: 1rem;">${opportunity.description}</p>
                </div>
                
                <!-- Details Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                    <div class="detail-card" style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 15px;">
                        <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-map-marker-alt" style="color: #ef4444;"></i> Location
                        </h4>
                        <p style="color: rgba(255, 255, 255, 0.8);">${opportunity.location}</p>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; text-transform: capitalize;">${opportunity.location_type}</p>
                    </div>
                    
                    ${compensationText ? `
                    <div class="detail-card" style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 15px;">
                        <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-money-bill-wave" style="color: #10b981;"></i> Compensation
                        </h4>
                        <p style="color: #10b981; font-weight: 700; font-size: 1.125rem;">${compensationText}</p>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; text-transform: capitalize;">${opportunity.compensation_type}</p>
                    </div>
                    ` : ''}
                    
                    ${opportunity.application_deadline ? `
                    <div class="detail-card" style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 15px;">
                        <h4 style="color: white; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-calendar-alt" style="color: #f59e0b;"></i> Deadline
                        </h4>
                        <p style="color: ${deadlineColor}; font-weight: 700;">${this.formatDate(opportunity.application_deadline)}</p>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${opportunity.daysUntilDeadline} days remaining</p>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Requirements -->
                ${opportunity.eligibility_criteria || opportunity.application_requirements ? `
                <div style="margin-bottom: 2rem;">
                    ${opportunity.eligibility_criteria ? `
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="color: white; font-weight: 700; margin-bottom: 1rem;">Eligibility Criteria</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${opportunity.eligibility_criteria}</p>
                    </div>
                    ` : ''}
                    
                    ${opportunity.application_requirements ? `
                    <div>
                        <h3 style="color: white; font-weight: 700; margin-bottom: 1rem;">Application Requirements</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${opportunity.application_requirements}</p>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                <!-- Tags -->
                ${opportunity.tags && opportunity.tags.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-weight: 700; margin-bottom: 1rem;">Tags</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                        ${opportunity.tags.map(tag => `
                            <span style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.8); padding: 0.5rem 1rem; border-radius: 15px; font-size: 0.875rem;">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Actions -->
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${this.currentUser ? `
                        ${!opportunity.userApplication ? `
                            <button class="apply-btn btn-primary" data-id="${opportunity.id}" style="flex: 1; min-width: 200px; padding: 1rem 2rem; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; border-radius: 15px; color: white; font-weight: 700; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-paper-plane"></i> Apply Now
                            </button>
                        ` : `
                            <div style="flex: 1; min-width: 200px; padding: 1rem 2rem; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 15px; color: #10b981; font-weight: 700; text-align: center;">
                                <i class="fas fa-check"></i> Applied (${opportunity.userApplication.application_status})
                            </div>
                        `}
                        <button class="bookmark-btn" data-id="${opportunity.id}" data-bookmarked="${opportunity.isBookmarked}" style="padding: 1rem; background: ${opportunity.isBookmarked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; border: 1px solid ${opportunity.isBookmarked ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.2)'}; border-radius: 15px; color: ${opportunity.isBookmarked ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)'}; cursor: pointer; transition: all 0.3s;">
                            <i class="fas ${opportunity.isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
                        </button>
                    ` : `
                        <div style="flex: 1; padding: 1rem 2rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 15px; color: rgba(255, 255, 255, 0.8); text-align: center;">
                            <i class="fas fa-sign-in-alt"></i> Login to apply and bookmark
                        </div>
                    `}
                    
                    ${opportunity.application_url ? `
                        <a href="${opportunity.application_url}" target="_blank" class="btn-glass" style="padding: 1rem 2rem; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; border-radius: 15px;">
                            <i class="fas fa-external-link-alt"></i> External Link
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup modal event listeners
        this.setupModalEventListeners(modal, opportunity);
    }

    setupModalEventListeners(modal, opportunity) {
        // Close modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Apply button
        const applyBtn = modal.querySelector('.apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.showApplicationModal(opportunity);
            });
        }
        
        // Bookmark button
        const bookmarkBtn = modal.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', async () => {
                await this.toggleBookmark(opportunity.id, bookmarkBtn);
            });
        }
    }

    showApplicationModal(opportunity) {
        // Implementation for application modal
        console.log('Show application modal for:', opportunity.title);
        window.jkuatApp?.showToast('Application modal would open here', 'info');
    }

    async toggleBookmark(opportunityId, button) {
        if (!this.currentUser) {
            window.jkuatApp?.showToast('Please login to bookmark opportunities', 'warning');
            return;
        }
        
        try {
            const result = await this.opportunitiesService.toggleBookmark(opportunityId, this.currentUser.id);
            
            // Update button state
            const isBookmarked = result.bookmarked;
            button.dataset.bookmarked = isBookmarked;
            button.style.background = isBookmarked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)';
            button.style.borderColor = isBookmarked ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.2)';
            button.style.color = isBookmarked ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)';
            button.querySelector('i').className = `fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`;
            
            window.jkuatApp?.showToast(result.message, 'success');
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            window.jkuatApp?.showToast('Failed to update bookmark', 'error');
        }
    }

    renderPagination(pagination) {
        const container = document.getElementById('paginationContainer');
        
        if (pagination.total <= 1) {
            container.innerHTML = '';
            return;
        }
        
        const { current, total } = pagination;
        let paginationHTML = '';
        
        // Previous button
        if (current > 1) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${current - 1}" style="padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white; cursor: pointer;">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, current - 2);
        const endPage = Math.min(total, current + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === current ? 'active' : ''}" data-page="${i}" style="padding: 0.75rem 1rem; background: ${i === current ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; border: 1px solid ${i === current ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.2)'}; border-radius: 10px; color: white; cursor: pointer; min-width: 45px;">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        if (current < total) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${current + 1}" style="padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white; cursor: pointer;">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        container.innerHTML = paginationHTML;
        
        // Add event listeners
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                this.currentFilters.page = page;
                this.loadOpportunities();
            });
        });
    }

    setupEventListeners() {
        // View toggle buttons
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        
        gridViewBtn.addEventListener('click', () => {
            this.setViewMode('grid');
        });
        
        listViewBtn.addEventListener('click', () => {
            this.setViewMode('list');
        });
    }

    setViewMode(mode) {
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        const grid = document.getElementById('opportunitiesGrid');
        
        if (mode === 'grid') {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            gridViewBtn.style.background = 'rgba(59, 130, 246, 0.2)';
            gridViewBtn.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            listViewBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            listViewBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            listViewBtn.style.color = 'rgba(255, 255, 255, 0.7)';
            
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        } else {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            listViewBtn.style.background = 'rgba(59, 130, 246, 0.2)';
            listViewBtn.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            gridViewBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            gridViewBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            gridViewBtn.style.color = 'rgba(255, 255, 255, 0.7)';
            
            grid.style.gridTemplateColumns = '1fr';
        }
    }

    clearAllFilters() {
        // Reset filters
        this.currentFilters = {
            page: 1,
            limit: 12,
            type: '',
            category: '',
            location: '',
            search: '',
            featured: false
        };
        
        // Reset UI
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.background = 'rgba(255, 255, 255, 0.1)';
            tab.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            tab.style.color = 'rgba(255, 255, 255, 0.8)';
        });
        
        document.querySelector('.filter-tab[data-type=""]').classList.add('active');
        document.querySelector('.filter-tab[data-type=""]').style.background = 'rgba(59, 130, 246, 0.2)';
        document.querySelector('.filter-tab[data-type=""]').style.borderColor = 'rgba(59, 130, 246, 0.3)';
        document.querySelector('.filter-tab[data-type=""]').style.color = 'white';
        
        document.getElementById('locationFilter').value = '';
        document.getElementById('sortFilter').value = 'created_at';
        document.getElementById('featuredFilter').checked = false;
        document.getElementById('opportunitySearch').value = '';
        
        // Reload opportunities
        this.loadOpportunities();
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
    if (window.location.pathname.includes('opportunities')) {
        new OpportunitiesPage();
    }
});