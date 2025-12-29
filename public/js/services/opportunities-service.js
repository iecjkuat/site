/**
 * Opportunities Service - Handles partnerships and opportunities data
 */
class OpportunitiesService {
    constructor() {
        this.baseUrl = '/api/opportunities';
        this.useMockData = false;
    }

    // =============================================
    // OPPORTUNITIES CRUD
    // =============================================

    async getOpportunities(params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${this.baseUrl}?${queryParams}`);
            
            if (!response.ok) throw new Error('Failed to fetch opportunities');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock opportunities:', error.message);
            return this.getMockOpportunities(params);
        }
    }

    async getOpportunity(id, userId = null) {
        try {
            const url = userId ? `${this.baseUrl}/${id}?userId=${userId}` : `${this.baseUrl}/${id}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch opportunity');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock opportunity:', error.message);
            return this.getMockOpportunity(id);
        }
    }

    async getOpportunitiesByType(type, params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${this.baseUrl}/type/${type}?${queryParams}`);
            
            if (!response.ok) throw new Error('Failed to fetch opportunities by type');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock opportunities by type:', error.message);
            return this.getMockOpportunitiesByType(type);
        }
    }

    async searchOpportunities(query, params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${this.baseUrl}/search/${encodeURIComponent(query)}?${queryParams}`);
            
            if (!response.ok) throw new Error('Failed to search opportunities');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock search:', error.message);
            return this.getMockSearchResults(query);
        }
    }

    async getUrgentOpportunities(limit = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/urgent?limit=${limit}`);
            
            if (!response.ok) throw new Error('Failed to fetch urgent opportunities');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock urgent opportunities:', error.message);
            return this.getMockUrgentOpportunities();
        }
    }

    async getRecentOpportunities(limit = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/recent?limit=${limit}`);
            
            if (!response.ok) throw new Error('Failed to fetch recent opportunities');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock recent opportunities:', error.message);
            return this.getMockRecentOpportunities();
        }
    }

    // =============================================
    // APPLICATIONS
    // =============================================

    async applyToOpportunity(opportunityId, applicationData) {
        try {
            const response = await fetch(`${this.baseUrl}/${opportunityId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit application');
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock application:', error.message);
            return { message: 'Application submitted successfully (mock)', application: { id: Date.now() } };
        }
    }

    async getUserApplications(userId, params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${this.baseUrl}/user/${userId}/applications?${queryParams}`);
            
            if (!response.ok) throw new Error('Failed to fetch user applications');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock applications:', error.message);
            return this.getMockUserApplications(userId);
        }
    }

    // =============================================
    // BOOKMARKS
    // =============================================

    async toggleBookmark(opportunityId, userId) {
        try {
            const response = await fetch(`${this.baseUrl}/${opportunityId}/bookmark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            
            if (!response.ok) throw new Error('Failed to toggle bookmark');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock bookmark:', error.message);
            return { message: 'Bookmark toggled (mock)', bookmarked: true };
        }
    }

    async getUserBookmarks(userId, params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${this.baseUrl}/user/${userId}/bookmarks?${queryParams}`);
            
            if (!response.ok) throw new Error('Failed to fetch user bookmarks');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock bookmarks:', error.message);
            return this.getMockUserBookmarks(userId);
        }
    }

    // =============================================
    // CATEGORIES AND STATS
    // =============================================

    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            
            if (!response.ok) throw new Error('Failed to fetch categories');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock categories:', error.message);
            return this.getMockCategories();
        }
    }

    async getStatistics() {
        try {
            const response = await fetch(`${this.baseUrl}/stats`);
            
            if (!response.ok) throw new Error('Failed to fetch statistics');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock statistics:', error.message);
            return this.getMockStatistics();
        }
    }

    async getRecommendations(userId, limit = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/user/${userId}/recommendations?limit=${limit}`);
            
            if (!response.ok) throw new Error('Failed to fetch recommendations');
            return await response.json();
        } catch (error) {
            console.warn('API unavailable, using mock recommendations:', error.message);
            return this.getMockRecommendations(userId);
        }
    }

    // =============================================
    // MOCK DATA METHODS
    // =============================================

    getMockOpportunities(params = {}) {
        const allOpportunities = [
            {
                id: '1',
                title: 'Safaricom Hook Innovation Challenge 2025',
                description: 'Annual innovation challenge seeking groundbreaking solutions in fintech, agritech, healthtech, and edtech. Winners receive funding, mentorship, and market access opportunities.',
                organization: 'Safaricom PLC',
                opportunity_type: 'competition',
                location: 'Nairobi, Kenya',
                location_type: 'hybrid',
                application_deadline: '2025-03-15T20:59:00Z',
                compensation_type: 'grant',
                compensation_amount: 5000000,
                compensation_currency: 'KES',
                status: 'active',
                priority_level: 'high',
                is_featured: true,
                view_count: 245,
                application_count: 67,
                bookmark_count: 89,
                tags: ['fintech', 'innovation', 'startup', 'technology'],
                category: { name: 'Competitions', icon: 'fa-trophy', color: '#f59e0b' },
                created_at: '2024-12-20T10:00:00Z',
                daysUntilDeadline: 82
            },
            {
                id: '2',
                title: 'Microsoft Imagine Cup 2025 - Kenya Regional',
                description: 'Global student technology competition where teams compete to create innovative solutions using Microsoft technologies. Regional winners advance to world finals.',
                organization: 'Microsoft Kenya',
                opportunity_type: 'competition',
                location: 'Virtual/Global',
                location_type: 'remote',
                application_deadline: '2025-02-28T20:59:00Z',
                compensation_type: 'grant',
                compensation_amount: 100000,
                compensation_currency: 'USD',
                status: 'active',
                priority_level: 'urgent',
                is_featured: true,
                view_count: 189,
                application_count: 34,
                bookmark_count: 56,
                tags: ['microsoft', 'azure', 'global', 'students'],
                category: { name: 'Competitions', icon: 'fa-trophy', color: '#f59e0b' },
                created_at: '2024-12-18T14:30:00Z',
                daysUntilDeadline: 67
            },
            {
                id: '3',
                title: 'Mastercard Foundation Scholars Program 2025',
                description: 'Comprehensive scholarship program providing financial support, leadership development, and career guidance for academically talented young people from disadvantaged backgrounds.',
                organization: 'Mastercard Foundation',
                opportunity_type: 'funding',
                location: 'Various African Universities',
                location_type: 'onsite',
                application_deadline: '2025-01-31T20:59:00Z',
                compensation_type: 'scholarship',
                compensation_amount: 2000000,
                compensation_currency: 'KES',
                status: 'active',
                priority_level: 'high',
                is_featured: true,
                view_count: 312,
                application_count: 123,
                bookmark_count: 167,
                tags: ['scholarship', 'leadership', 'africa', 'education'],
                category: { name: 'Funding', icon: 'fa-dollar-sign', color: '#10b981' },
                created_at: '2024-12-15T09:00:00Z',
                daysUntilDeadline: 39
            },
            {
                id: '4',
                title: 'Safaricom Graduate Trainee Program 2025',
                description: 'Comprehensive 18-month graduate development program offering rotational assignments across different business units. Includes mentorship and training.',
                organization: 'Safaricom PLC',
                opportunity_type: 'internship',
                location: 'Nairobi, Kenya',
                location_type: 'onsite',
                application_deadline: '2025-01-20T20:59:00Z',
                compensation_type: 'paid',
                compensation_amount: 80000,
                compensation_currency: 'KES',
                status: 'active',
                priority_level: 'urgent',
                is_featured: true,
                view_count: 456,
                application_count: 234,
                bookmark_count: 189,
                tags: ['graduate', 'telecom', 'training', 'career'],
                category: { name: 'Internships', icon: 'fa-briefcase', color: '#3b82f6' },
                created_at: '2024-12-10T11:00:00Z',
                daysUntilDeadline: 28
            },
            {
                id: '5',
                title: 'KCB Foundation Innovation Grant',
                description: 'Seed funding for innovative projects addressing social challenges in Kenya. Focus areas include financial inclusion, education technology, and healthcare solutions.',
                organization: 'Kenya Commercial Bank (KCB)',
                opportunity_type: 'grant',
                location: 'Kenya',
                location_type: 'hybrid',
                application_deadline: '2025-02-15T14:00:00Z',
                compensation_type: 'grant',
                compensation_amount: 1500000,
                compensation_currency: 'KES',
                status: 'active',
                priority_level: 'normal',
                is_featured: false,
                view_count: 178,
                application_count: 45,
                bookmark_count: 67,
                tags: ['social-impact', 'innovation', 'kenya', 'grant'],
                category: { name: 'Grants', icon: 'fa-award', color: '#f97316' },
                created_at: '2024-12-12T16:00:00Z',
                daysUntilDeadline: 54
            },
            {
                id: '6',
                title: 'Junior Software Developer - KCB Bank',
                description: 'Entry-level software developer position focusing on digital banking solutions. Work with modern technologies including React, Node.js, and cloud platforms.',
                organization: 'Kenya Commercial Bank (KCB)',
                opportunity_type: 'job',
                location: 'Nairobi, Kenya',
                location_type: 'hybrid',
                application_deadline: '2025-01-25T14:00:00Z',
                compensation_type: 'paid',
                compensation_amount: 150000,
                compensation_currency: 'KES',
                status: 'active',
                priority_level: 'normal',
                is_featured: false,
                view_count: 234,
                application_count: 89,
                bookmark_count: 45,
                tags: ['software', 'banking', 'react', 'entry-level'],
                category: { name: 'Jobs', icon: 'fa-user-tie', color: '#8b5cf6' },
                created_at: '2024-12-14T10:30:00Z',
                daysUntilDeadline: 33
            }
        ];

        // Apply filters
        let filteredOpportunities = allOpportunities;

        if (params.type) {
            filteredOpportunities = filteredOpportunities.filter(opp => opp.opportunity_type === params.type);
        }

        if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredOpportunities = filteredOpportunities.filter(opp => 
                opp.title.toLowerCase().includes(searchLower) ||
                opp.description.toLowerCase().includes(searchLower) ||
                opp.organization.toLowerCase().includes(searchLower)
            );
        }

        if (params.featured === 'true') {
            filteredOpportunities = filteredOpportunities.filter(opp => opp.is_featured);
        }

        // Apply pagination
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 20;
        const offset = (page - 1) * limit;
        const paginatedOpportunities = filteredOpportunities.slice(offset, offset + limit);

        return {
            opportunities: paginatedOpportunities,
            pagination: {
                current: page,
                total: Math.ceil(filteredOpportunities.length / limit),
                count: paginatedOpportunities.length,
                totalOpportunities: filteredOpportunities.length
            }
        };
    }

    getMockOpportunity(id) {
        const opportunities = this.getMockOpportunities().opportunities;
        const opportunity = opportunities.find(opp => opp.id === id);
        
        if (!opportunity) {
            throw new Error('Opportunity not found');
        }

        return {
            ...opportunity,
            eligibility_criteria: 'Must be a current student or recent graduate, Kenyan citizen, demonstrate innovation potential',
            application_requirements: 'Cover letter, CV/Resume, Project proposal or portfolio, Academic transcripts',
            application_url: `https://apply.example.com/${id}`,
            contact_email: 'opportunities@example.com',
            userApplication: null,
            isBookmarked: false
        };
    }

    getMockOpportunitiesByType(type) {
        const allOpportunities = this.getMockOpportunities();
        const filteredOpportunities = allOpportunities.opportunities.filter(opp => opp.opportunity_type === type);
        
        return {
            type,
            opportunities: filteredOpportunities,
            pagination: {
                current: 1,
                total: 1,
                count: filteredOpportunities.length,
                totalOpportunities: filteredOpportunities.length
            }
        };
    }

    getMockSearchResults(query) {
        return this.getMockOpportunities({ search: query });
    }

    getMockUrgentOpportunities() {
        const opportunities = this.getMockOpportunities().opportunities;
        const urgentOpportunities = opportunities
            .filter(opp => opp.daysUntilDeadline <= 30)
            .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
            .slice(0, 5);

        return {
            opportunities: urgentOpportunities,
            count: urgentOpportunities.length
        };
    }

    getMockRecentOpportunities() {
        const opportunities = this.getMockOpportunities().opportunities;
        const recentOpportunities = opportunities
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        return {
            opportunities: recentOpportunities,
            count: recentOpportunities.length
        };
    }

    getMockCategories() {
        return {
            categories: [
                { id: '1', name: 'Competitions', icon: 'fa-trophy', color: '#f59e0b', is_active: true },
                { id: '2', name: 'Funding', icon: 'fa-dollar-sign', color: '#10b981', is_active: true },
                { id: '3', name: 'Internships', icon: 'fa-briefcase', color: '#3b82f6', is_active: true },
                { id: '4', name: 'Jobs', icon: 'fa-user-tie', color: '#8b5cf6', is_active: true },
                { id: '5', name: 'Networking', icon: 'fa-users', color: '#ef4444', is_active: true },
                { id: '6', name: 'Partnerships', icon: 'fa-handshake', color: '#06b6d4', is_active: true },
                { id: '7', name: 'Grants', icon: 'fa-award', color: '#f97316', is_active: true }
            ]
        };
    }

    getMockStatistics() {
        return {
            total_opportunities: 156,
            active_opportunities: 89,
            expired_opportunities: 67,
            total_applications: 1234,
            opportunities_by_type: {
                competition: 23,
                funding: 18,
                internship: 15,
                job: 12,
                networking: 8,
                partnership: 7,
                grant: 6
            },
            top_organizations: [
                { organization: 'Safaricom PLC', count: 12 },
                { organization: 'Microsoft Kenya', count: 8 },
                { organization: 'KCB Bank', count: 6 },
                { organization: 'Mastercard Foundation', count: 5 }
            ]
        };
    }

    getMockUserApplications(userId) {
        return {
            applications: [
                {
                    id: '1',
                    application_status: 'submitted',
                    submitted_at: '2024-12-20T10:30:00Z',
                    opportunity: {
                        id: '1',
                        title: 'Safaricom Hook Innovation Challenge 2025',
                        organization: 'Safaricom PLC',
                        opportunity_type: 'competition',
                        status: 'active'
                    }
                },
                {
                    id: '2',
                    application_status: 'under_review',
                    submitted_at: '2024-12-18T14:15:00Z',
                    opportunity: {
                        id: '2',
                        title: 'Microsoft Imagine Cup 2025',
                        organization: 'Microsoft Kenya',
                        opportunity_type: 'competition',
                        status: 'active'
                    }
                }
            ],
            pagination: {
                current: 1,
                total: 1,
                count: 2,
                totalApplications: 2
            }
        };
    }

    getMockUserBookmarks(userId) {
        return {
            bookmarks: [
                {
                    id: '1',
                    created_at: '2024-12-19T16:00:00Z',
                    opportunity: this.getMockOpportunity('3')
                },
                {
                    id: '2',
                    created_at: '2024-12-18T12:00:00Z',
                    opportunity: this.getMockOpportunity('4')
                }
            ],
            pagination: {
                current: 1,
                total: 1,
                count: 2,
                totalBookmarks: 2
            }
        };
    }

    getMockRecommendations(userId) {
        return {
            recommendations: [
                {
                    opportunity_id: '1',
                    title: 'Safaricom Hook Innovation Challenge 2025',
                    organization: 'Safaricom PLC',
                    opportunity_type: 'competition',
                    match_score: 90
                },
                {
                    opportunity_id: '3',
                    title: 'Mastercard Foundation Scholars Program 2025',
                    organization: 'Mastercard Foundation',
                    opportunity_type: 'funding',
                    match_score: 85
                }
            ],
            count: 2
        };
    }
}

// Export for use in other modules
window.OpportunitiesService = OpportunitiesService;