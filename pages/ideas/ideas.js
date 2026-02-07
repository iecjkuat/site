/**
 * Ideas Page - Main functionality for the ideas hub
 */

class IdeasPage {
    constructor() {
        this.currentTab = 'browse';
        this.currentFilters = {
            category: 'all',
            search: '',
            sort: 'newest'
        };
        this.currentPage = 0;
        this.pageSize = 12;
        this.isLoading = false;
        this.hasMore = true;

        // Reply tracking
        this.replyingTo = null;

        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupPage());
            } else {
                this.setupPage();
            }
        } catch (error) {
            console.error('Failed to initialize ideas page:', error);
        }
    }

    async setupPage() {
        try {
            console.log('ðŸš€ Setting up Ideas Page...');
            console.log('ðŸ” Checking for mock data availability...');
            console.log('window.ideasMockData:', window.ideasMockData);

            // Wait for mock data to be available
            await this.waitForMockData();

            console.log('ðŸ” Mock data after wait:', window.ideasMockData);

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadCategories();
            await this.loadStats();
            await this.loadIdeas();
            await this.loadTrendingIdeas();

            // Initialize trending ideas immediately
            this.renderTrendingIdeas(this.getTrendingIdeas());

            // Hide loading state
            this.hideLoadingState();

            console.log('âœ… Ideas Page setup complete');

        } catch (error) {
            console.error('Failed to setup page:', error);
        }
    }

    async waitForMockData() {
        return new Promise((resolve) => {
            if (window.ideasMockData) {
                console.log('âœ… Mock data already available');
                resolve();
            } else {
                console.log('â³ Waiting for mock data...');
                const checkInterval = setInterval(() => {
                    if (window.ideasMockData) {
                        console.log('âœ… Mock data loaded');
                        clearInterval(checkInterval);
                        resolve();
                    } else {
                        console.log('â³ Still waiting for mock data...');
                    }
                }, 100);

                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.warn('âš ï¸ Mock data timeout, creating fallback data');
                    // Create fallback mock data if it doesn't load
                    this.createFallbackMockData();
                    resolve();
                }, 5000);
            }
        });
    }

    createFallbackMockData() {
        console.log('ðŸ”§ Creating fallback mock data...');
        window.ideasMockData = {
            getIdeas: () => [
                {
                    id: 1,
                    title: 'Smart Campus Navigation App',
                    description: 'An AR-powered mobile app that helps students navigate the JKUAT campus using augmented reality overlays and real-time directions.',
                    author: {
                        id: 2,
                        name: 'Sarah Johnson',
                        avatar: '/assets/images/avatars/sarah.jpg',
                        role: 'Computer Science Student'
                    },
                    category: 'Mobile App',
                    tags: ['AR', 'Navigation', 'Mobile', 'Campus'],
                    status: 'approved',
                    submissionStatus: 'published',
                    votes: 45,
                    comments: 12,
                    views: 234,
                    createdAt: '2024-01-10T10:30:00Z',
                    updatedAt: '2024-01-15T14:20:00Z',
                    approvedAt: '2024-01-11T09:15:00Z',
                    approvedBy: 'admin_user',
                    difficulty: 'Medium',
                    estimatedTime: '3-4 months',
                    requiredSkills: ['React Native', 'ARKit/ARCore', 'GPS', 'UI/UX Design'],
                    stage: 'Concept',
                    isBookmarked: true,
                    hasVoted: false
                },
                {
                    id: 2,
                    title: 'Sustainable Energy Monitoring System',
                    description: 'IoT-based system to monitor and optimize energy consumption in university buildings, promoting sustainability and cost reduction.',
                    author: {
                        id: 5,
                        name: 'James Wilson',
                        avatar: '/assets/images/avatars/james.jpg',
                        role: 'Engineering Student'
                    },
                    category: 'IoT',
                    tags: ['IoT', 'Sustainability', 'Energy', 'Monitoring'],
                    status: 'approved',
                    submissionStatus: 'published',
                    votes: 38,
                    comments: 8,
                    views: 189,
                    createdAt: '2024-01-08T15:45:00Z',
                    updatedAt: '2024-01-14T09:30:00Z',
                    approvedAt: '2024-01-09T11:20:00Z',
                    approvedBy: 'admin_user',
                    difficulty: 'Hard',
                    estimatedTime: '6-8 months',
                    requiredSkills: ['Arduino/Raspberry Pi', 'Sensors', 'Data Analytics', 'Web Development'],
                    stage: 'Prototype',
                    isBookmarked: false,
                    hasVoted: true
                },
                {
                    id: 3,
                    title: 'Student Marketplace Platform',
                    description: 'A peer-to-peer marketplace where students can buy, sell, and exchange textbooks, electronics, and other items within the campus community.',
                    author: {
                        id: 8,
                        name: 'Grace Muthoni',
                        avatar: '/assets/images/avatars/grace.jpg',
                        role: 'Business Student'
                    },
                    category: 'E-commerce',
                    tags: ['Marketplace', 'E-commerce', 'Student', 'Community'],
                    status: 'approved',
                    submissionStatus: 'published',
                    votes: 52,
                    comments: 15,
                    views: 312,
                    createdAt: '2024-01-05T12:20:00Z',
                    updatedAt: '2024-01-13T16:45:00Z',
                    approvedAt: '2024-01-06T14:30:00Z',
                    approvedBy: 'admin_user',
                    difficulty: 'Medium',
                    estimatedTime: '4-5 months',
                    requiredSkills: ['Web Development', 'Database Design', 'Payment Integration', 'UI/UX'],
                    stage: 'Concept',
                    isBookmarked: true,
                    hasVoted: true
                },
                {
                    id: 4,
                    title: 'AI-Powered Study Assistant',
                    description: 'An intelligent chatbot that helps students with course materials, provides study schedules, and answers academic questions using natural language processing.',
                    author: {
                        id: 9,
                        name: 'Peter Kamau',
                        avatar: '/assets/images/avatars/peter.jpg',
                        role: 'AI/ML Enthusiast'
                    },
                    category: 'AI/ML',
                    tags: ['AI', 'Chatbot', 'Education', 'NLP'],
                    status: 'approved',
                    submissionStatus: 'published',
                    votes: 67,
                    comments: 23,
                    views: 445,
                    createdAt: '2024-01-02T09:15:00Z',
                    updatedAt: '2024-01-12T11:30:00Z',
                    approvedAt: '2024-01-03T10:45:00Z',
                    approvedBy: 'admin_user',
                    difficulty: 'Hard',
                    estimatedTime: '5-6 months',
                    requiredSkills: ['Python', 'NLP', 'Machine Learning', 'API Development'],
                    stage: 'Testing',
                    isBookmarked: false,
                    hasVoted: false
                },
                {
                    id: 5,
                    title: 'Campus Event Management System',
                    description: 'Comprehensive platform for organizing, promoting, and managing campus events with features for registration, ticketing, and feedback collection.',
                    author: {
                        id: 12,
                        name: 'Mary Njeri',
                        avatar: '/assets/images/avatars/mary.jpg',
                        role: 'Event Coordinator'
                    },
                    category: 'Web Platform',
                    tags: ['Events', 'Management', 'Registration', 'Campus'],
                    status: 'approved',
                    submissionStatus: 'published',
                    votes: 29,
                    comments: 7,
                    views: 156,
                    createdAt: '2023-12-28T14:30:00Z',
                    updatedAt: '2024-01-11T10:15:00Z',
                    approvedAt: '2023-12-29T16:20:00Z',
                    approvedBy: 'admin_user',
                    difficulty: 'Medium',
                    estimatedTime: '3-4 months',
                    requiredSkills: ['Full-stack Development', 'Database Design', 'Payment Systems'],
                    stage: 'Concept',
                    isBookmarked: false,
                    hasVoted: false
                }
            ],
            getCategories: () => [
                {
                    id: 'mobile-app',
                    name: 'Mobile App',
                    icon: 'fas fa-mobile-alt',
                    color: '#3b82f6',
                    count: 12
                },
                {
                    id: 'web-platform',
                    name: 'Web Platform',
                    icon: 'fas fa-globe',
                    color: '#10b981',
                    count: 18
                },
                {
                    id: 'iot',
                    name: 'IoT',
                    icon: 'fas fa-microchip',
                    color: '#f59e0b',
                    count: 8
                },
                {
                    id: 'ai-ml',
                    name: 'AI/ML',
                    icon: 'fas fa-brain',
                    color: '#8b5cf6',
                    count: 15
                },
                {
                    id: 'e-commerce',
                    name: 'E-commerce',
                    icon: 'fas fa-shopping-cart',
                    color: '#ef4444',
                    count: 6
                }
            ],
            getIdeaStats: () => ({
                totalIdeas: 5,
                openIdeas: 3,
                inProgressIdeas: 1,
                completedIdeas: 1,
                totalVotes: 231,
                totalComments: 65,
                totalViews: 1336,
                activeCollaborators: 25
            }),
            getTrendingIdeas: () => window.ideasMockData.getIdeas().sort((a, b) => (b.votes + b.comments + b.views) - (a.votes + a.comments + a.views)).slice(0, 5),
            getComments: (ideaId) => {
                const commentsByIdea = {
                    1: [
                        {
                            id: 1,
                            author: {
                                id: 3,
                                name: 'Mike Chen',
                                avatar: '/assets/images/avatars/mike.jpg',
                                role: 'Computer Science Student'
                            },
                            text: 'This is a brilliant idea! I\'d love to contribute to the development. I have experience with React Native and AR frameworks.',
                            timestamp: '2024-01-12T10:30:00Z',
                            likes: 5,
                            replies: [
                                {
                                    id: 2,
                                    author: {
                                        id: 2,
                                        name: 'Sarah Johnson',
                                        avatar: '/assets/images/avatars/sarah.jpg',
                                        role: 'Computer Science Student'
                                    },
                                    text: 'That would be amazing, Mike! Let\'s connect and discuss the technical requirements.',
                                    timestamp: '2024-01-12T11:15:00Z',
                                    likes: 2
                                }
                            ]
                        },
                        {
                            id: 3,
                            author: {
                                id: 4,
                                name: 'Emily Davis',
                                avatar: '/assets/images/avatars/emily.jpg',
                                role: 'UI/UX Designer'
                            },
                            text: 'I can help with the UI/UX design. This could really improve the campus experience for new students.',
                            timestamp: '2024-01-13T14:20:00Z',
                            likes: 3,
                            replies: []
                        }
                    ],
                    2: [
                        {
                            id: 4,
                            author: {
                                id: 6,
                                name: 'Lisa Wanjiku',
                                avatar: '/assets/images/avatars/lisa.jpg',
                                role: 'Environmental Science Student'
                            },
                            text: 'Great sustainability focus! Have you considered integrating with existing building management systems?',
                            timestamp: '2024-01-10T09:45:00Z',
                            likes: 4,
                            replies: []
                        }
                    ],
                    3: [
                        {
                            id: 9,
                            author: {
                                id: 11,
                                name: 'Catherine Njoki',
                                avatar: '/assets/images/avatars/catherine.jpg',
                                role: 'Business Student'
                            },
                            text: 'This marketplace idea is exactly what we need! I\'ve been looking for affordable textbooks everywhere.',
                            timestamp: '2024-01-07T11:20:00Z',
                            likes: 8,
                            replies: []
                        }
                    ],
                    4: [
                        {
                            id: 12,
                            author: {
                                id: 14,
                                name: 'Alice Wanjiru',
                                avatar: '/assets/images/avatars/alice.jpg',
                                role: 'AI/ML Student'
                            },
                            text: 'This AI assistant could be a game-changer for students! Have you considered using GPT or similar models?',
                            timestamp: '2024-01-04T12:30:00Z',
                            likes: 9,
                            replies: []
                        }
                    ],
                    5: [
                        {
                            id: 15,
                            author: {
                                id: 16,
                                name: 'Nancy Akinyi',
                                avatar: '/assets/images/avatars/nancy.jpg',
                                role: 'Event Management Student'
                            },
                            text: 'This platform would make organizing club events so much easier! Can it handle recurring events?',
                            timestamp: '2024-01-01T14:20:00Z',
                            likes: 4,
                            replies: []
                        }
                    ]
                };
                return commentsByIdea[ideaId] || [];
            }
        };
        console.log('âœ… Fallback mock data created');
    }

    setupEventListeners() {
        console.log('ðŸ”§ Setting up event listeners...');

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            });
        });

        // Quick action buttons in hero section
        const submitBtn = document.getElementById('submitIdeaBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.switchTab('submit'));
        }

        const browseBtn = document.getElementById('browseIdeasBtn');
        if (browseBtn) {
            browseBtn.addEventListener('click', () => {
                this.switchTab('browse');
                document.getElementById('browse-tab')?.scrollIntoView({ behavior: 'smooth' });
            });
        }

        const collaborateBtn = document.getElementById('collaborateBtn');
        if (collaborateBtn) {
            collaborateBtn.addEventListener('click', () => {
                this.switchTab('browse');
                this.applyFilter('all');
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreIdeas());
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') ||
                e.target.classList.contains('comments-modal-backdrop') ||
                e.target.classList.contains('comments-modal-overlay') ||
                e.target.matches('[data-action="close-modal"]') ||
                e.target.closest('[data-action="close-modal"]')) {
                this.closeAllModals();
            }
        });

        // Handle Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Form submission
        const submitForm = document.getElementById('submitIdeaForm');
        if (submitForm) {
            submitForm.addEventListener('submit', (e) => this.handleSubmitIdea(e));
        }

        // Comment form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'addCommentForm') {
                this.handleAddComment(e);
            }
        });

        // Event delegation for idea actions
        console.log('Setting up event delegation for idea actions...');
        document.addEventListener('click', (e) => {
            console.log('Document click detected:', e.target);

            // Check if clicked element or its parent has data-action
            const actionElement = e.target.matches('[data-action]') ? e.target : e.target.closest('[data-action]');

            if (actionElement) {
                console.log('Action element found:', actionElement);
                e.stopPropagation();
                e.preventDefault();

                const action = actionElement.dataset.action;
                const ideaId = actionElement.dataset.ideaId;

                console.log('Action:', action, 'Idea ID:', ideaId);

                switch (action) {
                    case 'view-idea':
                        console.log('Executing view-idea for ID:', ideaId);
                        this.viewIdea(ideaId);
                        break;
                    case 'like-idea':
                        console.log('Executing like-idea for ID:', ideaId);
                        this.likeIdea(ideaId);
                        break;
                    case 'comment-idea':
                        console.log('Executing comment-idea for ID:', ideaId);
                        this.commentOnIdea(ideaId);
                        break;
                    case 'reset-filters':
                        console.log('Executing reset-filters');
                        this.resetFilters();
                        break;
                    case 'close-modal':
                        console.log('Executing close-modal');
                        this.closeAllModals();
                        break;
                    default:
                        console.log('Unknown action:', action);
                }
            }
        });

        // Category filter clicks
        this.setupCategoryFilters();

        console.log('âœ… Event listeners setup complete');
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
            btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            btn.style.boxShadow = 'none';
        });

        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
            activeTabBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
            activeTabBtn.style.color = 'white';
            activeTabBtn.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            activeTabBtn.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)';
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });

        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.style.display = 'block';
            activeTab.classList.add('active');
        }

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    applyFilter(filter) {
        this.currentFilters.category = filter;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        const activeFilter = document.querySelector(`[data-filter="${filter}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
            activeFilter.style.background = 'rgba(139, 92, 246, 0.2)';
            activeFilter.style.border = '1px solid rgba(139, 92, 246, 0.3)';
            activeFilter.style.color = '#8b5cf6';
        }

        this.resetAndLoadIdeas();
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'browse':
                this.loadIdeas();
                break;
            case 'trending':
                this.renderTrendingIdeas(this.getTrendingIdeas());
                break;
        }
    }

    getTrendingIdeas() {
        if (window.ideasMockData) {
            return window.ideasMockData.getTrendingIdeas();
        }
        return [];
    }

    async loadCategories() {
        try {
            console.log('ðŸ“‚ Loading categories...');

            if (window.ideasMockData) {
                const categories = window.ideasMockData.getCategories();
                console.log('âœ… Categories loaded:', categories.length);
                this.renderCategoryFilters(categories);
                this.populateCategorySelect(categories);
            } else {
                console.error('âŒ Mock data not available for categories');
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    renderCategoryFilters(categories) {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        // Clear existing categories (keep the "All" button)
        const existingCategories = container.querySelectorAll('[data-category]:not([data-category="all"])');
        existingCategories.forEach(cat => cat.remove());

        // Add categories
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-chip';
            button.setAttribute('data-category', category.id);
            button.innerHTML = `
                <i class="${category.icon}" style="color: ${category.color};"></i>
                ${category.name}
            `;
            container.appendChild(button);
        });
    }

    populateCategorySelect(categories) {
        const select = document.getElementById('ideaCategory');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    async loadStats() {
        try {
            console.log('ðŸ“Š Loading stats...');

            if (window.ideasMockData) {
                const stats = window.ideasMockData.getIdeaStats();
                console.log('âœ… Stats loaded:', stats);
                this.renderStats({
                    totalIdeas: stats.totalIdeas,
                    activeIdeas: stats.openIdeas,
                    collaborations: stats.activeCollaborators,
                    implemented: stats.completedIdeas
                });
            } else {
                console.error('âŒ Mock data not available for stats');
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    renderStats(stats) {
        const totalElement = document.getElementById('totalIdeasCount');
        const activeElement = document.getElementById('activeIdeasCount');
        const collaborationsElement = document.getElementById('collaborationsCount');
        const implementedElement = document.getElementById('implementedCount');

        if (totalElement) {
            this.animateNumber(totalElement, stats.totalIdeas || 0);
        }
        if (activeElement) {
            this.animateNumber(activeElement, stats.activeIdeas || 0);
        }
        if (collaborationsElement) {
            this.animateNumber(collaborationsElement, stats.collaborations || 0);
        }
        if (implementedElement) {
            this.animateNumber(implementedElement, stats.implemented || 0);
        }
    }

    animateNumber(element, targetNumber) {
        const duration = 1000;
        const start = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(start + (targetNumber - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    async loadIdeas() {
        if (this.isLoading) return;

        console.log('ðŸ’¡ Loading ideas...');
        this.isLoading = true;
        this.showLoadingState();

        try {
            if (window.ideasMockData) {
                let ideas = window.ideasMockData.getIdeas();
                console.log('âœ… Ideas loaded:', ideas.length);

                // Apply filters
                if (this.currentFilters.category !== 'all') {
                    ideas = ideas.filter(idea =>
                        idea.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === this.currentFilters.category
                    );
                }

                if (this.currentFilters.search) {
                    const searchTerm = this.currentFilters.search.toLowerCase();
                    ideas = ideas.filter(idea =>
                        idea.title.toLowerCase().includes(searchTerm) ||
                        idea.description.toLowerCase().includes(searchTerm) ||
                        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                    );
                }

                // Apply sorting
                switch (this.currentFilters.sort) {
                    case 'popular':
                        ideas.sort((a, b) => b.votes - a.votes);
                        break;
                    case 'trending':
                        ideas.sort((a, b) => (b.votes + b.comments + b.views) - (a.votes + a.comments + a.views));
                        break;
                    case 'newest':
                    default:
                        ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        break;
                }

                console.log('ðŸ” Filtered ideas:', ideas.length);

                // Pagination
                const startIndex = this.currentPage * this.pageSize;
                const endIndex = startIndex + this.pageSize;
                const paginatedIdeas = ideas.slice(startIndex, endIndex);

                if (this.currentPage === 0) {
                    this.renderIdeas(paginatedIdeas);
                } else {
                    this.appendIdeas(paginatedIdeas);
                }

                this.hasMore = endIndex < ideas.length;
                this.updateLoadMoreButton();
            } else {
                console.error('âŒ Mock data not available for ideas');
                this.renderIdeas([]);
                this.hasMore = false;
                this.updateLoadMoreButton();
            }

        } catch (error) {
            console.error('Failed to load ideas:', error);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async loadTrendingIdeas() {
        try {
            console.log('ðŸ”¥ Loading trending ideas...');

            const trendingIdeas = this.getTrendingIdeas();
            console.log('âœ… Trending ideas loaded:', trendingIdeas.length);
            this.renderTrendingIdeas(trendingIdeas);
        } catch (error) {
            console.error('Failed to load trending ideas:', error);
            this.renderTrendingIdeas([]);
        }
    }
    renderIdeas(ideas) {
        console.log('ðŸŽ¨ Rendering ideas:', ideas.length);

        const container = document.getElementById('ideasGrid');
        const noIdeasMessage = document.getElementById('noIdeasMessage');

        if (!container) {
            console.error('âŒ Ideas grid container not found');
            return;
        }

        if (ideas.length === 0) {
            container.innerHTML = '';
            if (noIdeasMessage) {
                noIdeasMessage.style.display = 'block';
            }
            return;
        }

        if (noIdeasMessage) {
            noIdeasMessage.style.display = 'none';
        }

        container.innerHTML = ideas.map(idea => this.createIdeaCard(idea)).join('');

        console.log('âœ… Ideas rendered successfully');
    }

    renderTrendingIdeas(ideas) {
        console.log('ðŸ”¥ Rendering trending ideas:', ideas.length);

        const container = document.getElementById('trendingGrid');
        if (!container) {
            console.error('âŒ Trending grid container not found');
            return;
        }

        if (ideas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-fire" style="font-size: 3rem; color: rgba(139, 92, 246, 0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem;">No trending ideas yet</h3>
                    <p style="color: rgba(255, 255, 255, 0.6);">Be the first to submit an idea and start trending!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ideas.map(idea => this.createIdeaCard(idea)).join('');

        console.log('âœ… Trending ideas rendered successfully');
    }

    appendIdeas(ideas) {
        const container = document.getElementById('ideasGrid');
        if (!container) return;

        const newCards = ideas.map(idea => this.createIdeaCard(idea)).join('');
        container.insertAdjacentHTML('beforeend', newCards);
    }

    createIdeaCard(idea) {
        const timeAgo = this.getTimeAgo(new Date(idea.createdAt || idea.created_at));

        return `
            <div class="idea-card" data-idea-id="${idea.id}">
                <div class="idea-header">
                    <div style="flex: 1;">
                        <h3 class="idea-title">${this.escapeHtml(idea.title)}</h3>
                        <div class="idea-meta">
                            <span><i class="fas fa-user"></i> ${this.escapeHtml(idea.author.name)}</span>
                            <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                            <span class="idea-category">${this.escapeHtml(idea.category)}</span>
                        </div>
                    </div>
                </div>
                
                <p class="idea-description">${this.escapeHtml(idea.description)}</p>
                
                ${idea.tags && idea.tags.length > 0 ? `
                    <div class="idea-tags">
                        ${idea.tags.slice(0, 3).map(tag => `
                            <span class="idea-tag">${this.escapeHtml(tag)}</span>
                        `).join('')}
                        ${idea.tags.length > 3 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">+${idea.tags.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="idea-stats">
                    <div class="idea-stat">
                        <i class="fas fa-thumbs-up" style="color: #10b981;"></i>
                        <span>${idea.votes || 0} likes</span>
                    </div>
                    <div class="idea-stat">
                        <i class="fas fa-comments" style="color: #3b82f6;"></i>
                        <span>${idea.comments || 0} comments</span>
                    </div>
                    <div class="idea-stat">
                        <i class="fas fa-eye" style="color: #f59e0b;"></i>
                        <span>${idea.views || 0} views</span>
                    </div>
                </div>
                
                <div class="idea-actions">
                    <button class="btn btn-primary btn-sm" data-action="like-idea" data-idea-id="${idea.id}">
                        <i class="fas fa-thumbs-up"></i>Like Idea
                    </button>
                    <button class="btn btn-outline btn-sm" data-action="comment-idea" data-idea-id="${idea.id}">
                        <i class="fas fa-comments"></i>Comment
                    </button>
                </div>
            </div>
        `;
    }

    // Utility functions
    // Security: Prevent XSS
    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    }

    resetFilters() {
        this.currentFilters = {
            category: 'all',
            search: '',
            sort: 'newest'
        };
        this.currentPage = 0;

        // Reset UI
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');

        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'newest';

        // Reset category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        const allFilter = document.querySelector('[data-filter="all"]');
        if (allFilter) {
            allFilter.classList.add('active');
            allFilter.style.background = 'rgba(139, 92, 246, 0.2)';
            allFilter.style.border = '1px solid rgba(139, 92, 246, 0.3)';
            allFilter.style.color = '#8b5cf6';
        }

        this.loadIdeas();
    }

    resetAndLoadIdeas() {
        this.currentPage = 0;
        this.hasMore = true;
        this.loadIdeas();
    }

    loadMoreIdeas() {
        if (this.hasMore && !this.isLoading) {
            this.currentPage++;
            this.loadIdeas();
        }
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = this.hasMore ? 'inline-flex' : 'none';
        }
    }

    showLoadingState() {
        const loading = document.getElementById('ideasLoading');
        if (loading) {
            loading.style.display = 'block';
        }
    }

    hideLoadingState() {
        const loading = document.getElementById('ideasLoading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    // Modal functions
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-backdrop, #commentsModal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    viewIdea(ideaId) {
        const idea = this.findIdeaById(ideaId);
        if (!idea) {
            alert('Idea not found');
            return;
        }

        this.showIdeaDetailsModal(idea);
    }

    likeIdea(ideaId) {
        // Initialize liked ideas tracking if not exists
        if (!this.likedIdeas) {
            this.likedIdeas = new Set();
        }

        const isAlreadyLiked = this.likedIdeas.has(ideaId);
        const likeButton = document.querySelector(`[data-action="like-idea"][data-idea-id="${ideaId}"]`);

        // Find and update the like count in the UI
        const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
        if (ideaCard) {
            const likeStat = ideaCard.querySelector('.idea-stat:first-child span');
            if (likeStat) {
                const currentLikes = parseInt(likeStat.textContent.split(' ')[0]) || 0;

                if (isAlreadyLiked) {
                    // Unlike the idea
                    this.likedIdeas.delete(ideaId);
                    likeStat.textContent = `${Math.max(0, currentLikes - 1)} likes`;
                    if (likeButton) {
                        likeButton.classList.remove('liked');
                        likeButton.innerHTML = '<i class="fas fa-thumbs-up"></i>Like Idea';
                    }
                } else {
                    // Like the idea
                    this.likedIdeas.add(ideaId);
                    likeStat.textContent = `${currentLikes + 1} likes`;
                    if (likeButton) {
                        likeButton.classList.add('liked');
                        likeButton.innerHTML = '<i class="fas fa-thumbs-up"></i>Liked';
                    }
                }
            }
        }

        // Update in modal if it's open
        const modal = document.getElementById('ideaModal');
        if (modal && modal.style.display === 'flex') {
            const modalLikeStat = modal.querySelector('.idea-detail-stats div:first-child span');
            const modalLikeButton = modal.querySelector('[data-action="like-idea"]');

            if (modalLikeStat) {
                const currentLikes = parseInt(modalLikeStat.textContent.split(' ')[0]) || 0;

                if (isAlreadyLiked) {
                    modalLikeStat.textContent = `${Math.max(0, currentLikes - 1)} likes`;
                    if (modalLikeButton) {
                        modalLikeButton.classList.remove('liked');
                        modalLikeButton.innerHTML = '<i class="fas fa-thumbs-up"></i>Like This Idea';
                    }
                } else {
                    modalLikeStat.textContent = `${currentLikes + 1} likes`;
                    if (modalLikeButton) {
                        modalLikeButton.classList.add('liked');
                        modalLikeButton.innerHTML = '<i class="fas fa-thumbs-up"></i>Liked';
                    }
                }
            }
        }

        // In a real app, this would also update the backend/database
    }

    commentOnIdea(ideaId) {
        console.log('commentOnIdea called with ID:', ideaId);
        const idea = this.findIdeaById(ideaId);
        if (!idea) {
            alert('Idea not found');
            return;
        }

        console.log('Opening comments modal for idea:', idea.title);
        this.showCommentsModal(idea);
    }

    showIdeaDetailsModal(idea) {
        // Update modal title and content
        const modalTitle = document.getElementById('ideaModalTitle');
        const modalContent = document.getElementById('ideaModalContent');

        if (!modalTitle || !modalContent) {
            alert('Idea details modal not available. Please refresh the page.');
            return;
        }

        modalTitle.textContent = idea.title;

        const timeAgo = this.getTimeAgo(new Date(idea.createdAt || idea.created_at));

        modalContent.innerHTML = `
            <div class="idea-detail-header">
                <div class="idea-detail-meta">
                    <span class="approval-badge category">${this.escapeHtml(idea.category)}</span>
                    <span style="color: rgba(255, 255, 255, 0.7);">by ${this.escapeHtml(idea.author.name)}</span>
                    <span style="color: rgba(255, 255, 255, 0.7);">${timeAgo}</span>
                </div>
                
                <div class="idea-detail-stats" style="display: flex; gap: 2rem; margin: 1rem 0; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-thumbs-up" style="color: #10b981;"></i>
                        <span style="color: white;">${idea.votes || 0} likes</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-comments" style="color: #3b82f6;"></i>
                        <span style="color: white;">${idea.comments || 0} comments</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-eye" style="color: #f59e0b;"></i>
                        <span style="color: white;">${idea.views || 0} views</span>
                    </div>
                </div>
            </div>
            
            <div class="idea-detail-content" style="max-height: 60vh; overflow-y: auto; padding-right: 0.5rem;">
                <section style="margin-bottom: 2rem;">
                    <h3 style="color: white; font-size: 1.125rem; font-weight: 600; margin-bottom: 0.75rem;">Description</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${this.escapeHtml(idea.description)}</p>
                </section>
                
                ${idea.tags && idea.tags.length > 0 ? `
                    <section style="margin-bottom: 2rem;">
                        <h3 style="color: white; font-size: 1.125rem; font-weight: 600; margin-bottom: 0.75rem;">Tags</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${idea.tags.map(tag => `
                                <span style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${this.escapeHtml(tag)}</span>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}
                
                <div style="display: flex; gap: 1rem; justify-content: center; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button class="btn btn-primary" data-action="like-idea" data-idea-id="${idea.id}">
                        <i class="fas fa-thumbs-up"></i>
                        Like This Idea
                    </button>
                    <button class="btn btn-outline" data-action="comment-idea" data-idea-id="${idea.id}">
                        <i class="fas fa-comments"></i>
                        Add Comment
                    </button>
                </div>
            </div>
        `;

        // Show modal
        const modal = document.getElementById('ideaModal');
        if (modal) {
            modal.style.display = 'flex';
        } else {
            alert('Idea details modal not available. Please refresh the page.');
        }
    }

    showCommentsModal(idea) {
        console.log('🎵 showCommentsModal called for idea:', idea.title);
        this.currentIdeaId = idea.id;
        this.replyingTo = null; // Reset reply state

        const modal = document.getElementById('commentsModal');
        const titleElem = document.getElementById('commentModalIdeaTitle');
        const replyBanner = document.getElementById('replyingToBanner');

        if (!modal) {
            console.error('❌ Comments modal container not found');
            return;
        }

        if (titleElem) titleElem.textContent = idea.title;
        if (replyBanner) replyBanner.style.display = 'none';

        // Load comments data
        this.loadComments(idea.id);

        // Show modal
        modal.style.display = 'flex';

        // Focus input
        const input = modal.querySelector('.comment-input-field');
        if (input) input.focus();

        console.log('✅ Comments modal displayed');
    }

    findIdeaById(ideaId) {
        console.log('🔎 Finding idea by ID:', ideaId);
        if (window.ideasMockData) {
            const allIdeas = window.ideasMockData.getIdeas();
            console.log('Available ideas:', allIdeas.map(i => ({ id: i.id, title: i.title })));
            // Try both string and number comparison
            const found = allIdeas.find(idea => idea.id == ideaId || idea.id === parseInt(ideaId) || idea.id === ideaId.toString());
            console.log('Found idea:', found ? found.title : 'Not found');
            return found;
        }
        console.log('❌ Mock data not available');
        return null;
    }

    renderIdeaSummary(idea) {
        const container = document.getElementById('ideaSummary');
        if (!container) return;

        const timeAgo = this.getTimeAgo(new Date(idea.createdAt || idea.created_at));

        container.innerHTML = `
            <h3 class="idea-summary-title">${this.escapeHtml(idea.title)}</h3>
            <div class="idea-summary-meta">
                <span><i class="fas fa-user"></i> ${this.escapeHtml(idea.author.name)}</span>
                <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                <span><i class="fas fa-tag"></i> ${this.escapeHtml(idea.category)}</span>
                <span><i class="fas fa-lightbulb"></i> ${this.escapeHtml(idea.stage || 'Concept')}</span>
            </div>
            <p class="idea-summary-description">${this.escapeHtml(idea.description)}</p>
        `;
    }

    loadComments(ideaId) {
        // Get comments from mock data or initialize empty array
        let comments = [];
        if (window.ideasMockData) {
            comments = window.ideasMockData.getComments(ideaId);
        }

        // Get any additional comments from session storage
        const sessionComments = this.getSessionComments(ideaId);
        comments = [...comments, ...sessionComments];

        this.renderComments(comments);
    }

    getSessionComments(ideaId) {
        const key = `idea_comments_${ideaId}`;
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    saveSessionComment(ideaId, comment) {
        const key = `idea_comments_${ideaId}`;
        const existing = this.getSessionComments(ideaId);
        existing.push(comment);
        sessionStorage.setItem(key, JSON.stringify(existing));
    }

    renderComments(comments) {
        const container = document.getElementById('commentsList');
        const commentsCount = document.getElementById('commentsCount');

        if (!container) return;

        // Update comments count
        const totalComments = comments.length + comments.reduce((sum, comment) => sum + (comment.replies?.length || 0), 0);
        if (commentsCount) {
            commentsCount.textContent = `${totalComments} comment${totalComments !== 1 ? 's' : ''}`;
        }

        if (comments.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.6);">
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">💬</div>
                    <h4 style="color: rgba(255, 255, 255, 0.8); font-size: 16px; font-weight: 600; margin-bottom: 8px;">No comments yet</h4>
                    <p style="font-size: 14px; margin: 0;">Be the first to comment!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = comments.map(comment => this.createCommentHTML(comment)).join('');

        // Add event listeners for comment actions (Reply, Like, View Replies)
        this.setupCommentListeners();
    }

    createCommentHTML(comment, isReply = false) {
        const timeAgo = this.getTimeAgo(new Date(comment.timestamp));
        const authorInitials = comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const isCreator = comment.author.id === 2; // Assuming creator has ID 2

        let html = `
            <div class="comment-item ${isReply ? 'reply-item' : ''}" data-comment-id="${comment.id}">
                <div class="comment-avatar ${isReply ? 'reply-avatar' : ''}">
                    ${authorInitials}
                </div>
                <div class="comment-body">
                    <div class="comment-user-row">
                        <span class="comment-username">${this.escapeHtml(comment.author.name)}</span>
                        ${isCreator ? '<span class="creator-badge">Creator</span>' : ''}
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.text)}</div>
                    <div class="comment-footer">
                        <span class="comment-time">${timeAgo}</span>
                        <button class="reply-btn" data-comment-id="${comment.id}" data-username="${this.escapeHtml(comment.author.name)}">Reply</button>
                        <button class="like-btn ${comment.liked ? 'liked' : ''}" data-comment-id="${comment.id}">
                            <i class="${comment.liked ? 'fas' : 'far'} fa-heart"></i>
                            <span class="like-count">${comment.likes || 0}</span>
                        </button>
                    </div>
                    ${!isReply && comment.replies && comment.replies.length > 0 ? `
                        <button class="view-replies-btn" data-comment-id="${comment.id}">
                            View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'} ▼
                        </button>
                        <div class="replies-container" id="replies-${comment.id}" style="display: none;">
                            ${comment.replies.map(reply => this.createCommentHTML(reply, true)).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return html;
    }

    setupCommentListeners() {
        const modal = document.getElementById('commentsModal');
        if (!modal) return;

        // Like buttons
        modal.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCommentLike(btn);
            });
        });

        // Reply buttons
        modal.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const commentId = btn.dataset.commentId;
                const username = btn.dataset.username;
                this.initiateReply(commentId, username);
            });
        });

        // View replies buttons
        modal.querySelectorAll('.view-replies-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = btn.dataset.commentId;
                const container = document.getElementById(`replies-${commentId}`);
                if (container) {
                    const isVisible = container.style.display === 'block';
                    container.style.display = isVisible ? 'none' : 'block';
                    btn.textContent = isVisible
                        ? `View ${container.children.length} reply/replies ▼`
                        : `Hide replies ▲`;
                }
            });
        });

        // Close reply banner
        const cancelReply = document.getElementById('cancelReplyBtn');
        if (cancelReply) {
            cancelReply.onclick = () => this.cancelReply();
        }
    }

    initiateReply(commentId, username) {
        this.replyingTo = { id: commentId, username: username };
        const banner = document.getElementById('replyingToBanner');
        const text = document.getElementById('replyingToText');
        const input = document.querySelector('.comment-input-field');

        if (banner && text) {
            text.textContent = `Replying to ${username}`;
            banner.style.display = 'flex';
        }

        if (input) {
            input.focus();
            input.placeholder = `Reply to ${username}...`;
        }
    }

    cancelReply() {
        this.replyingTo = null;
        const banner = document.getElementById('replyingToBanner');
        const input = document.querySelector('.comment-input-field');

        if (banner) banner.style.display = 'none';
        if (input) {
            input.placeholder = 'Add a comment...';
        }
    }

    handleAddComment(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const commentText = formData.get('commentText');

        if (!commentText || !commentText.trim()) {
            return;
        }

        if (!this.currentIdeaId) {
            alert('Error: No idea selected for commenting');
            return;
        }

        const newComment = {
            id: Date.now(),
            author: {
                id: 'current_user',
                name: 'Current User', // In real app, get from auth
                role: 'Student'
            },
            text: commentText.trim(),
            timestamp: new Date().toISOString(),
            likes: 0,
            liked: false,
            replies: []
        };

        if (this.replyingTo) {
            // Add as reply
            const comments = this.getSessionComments(this.currentIdeaId);
            const parent = comments.find(c => c.id == this.replyingTo.id);
            if (parent) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push(newComment);
                this.saveAllSessionComments(this.currentIdeaId, comments);
            } else {
                // If parent is not in session storage (e.g., from mock data),
                // for this demo, we'll just add it as a new top-level comment
                // In a real app, this would involve fetching/updating backend data.
                this.saveSessionComment(this.currentIdeaId, newComment);
            }
            this.cancelReply();
        } else {
            // Save as a new top-level comment
            this.saveSessionComment(this.currentIdeaId, newComment);
        }

        // Update comment count in the idea
        this.incrementCommentCount(this.currentIdeaId);

        // Reload comments
        this.loadComments(this.currentIdeaId);

        // Reset form
        e.target.reset();

        // Scroll to bottom
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            setTimeout(() => {
                commentsList.scrollTop = commentsList.scrollHeight;
            }, 100);
        }

        this.showCommentSuccess('Comment posted successfully!');
    }

    saveAllSessionComments(ideaId, comments) {
        const key = `idea_comments_${ideaId}`;
        sessionStorage.setItem(key, JSON.stringify(comments));
    }

    toggleCommentLike(button) {
        const isLiked = button.classList.contains('liked');
        const icon = button.querySelector('i');
        const countSpan = button.querySelector('.like-count');
        const currentCount = parseInt(countSpan.textContent) || 0;

        if (isLiked) {
            button.classList.remove('liked');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            countSpan.textContent = Math.max(0, currentCount - 1);
        } else {
            button.classList.add('liked');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
            countSpan.textContent = currentCount + 1;
        }
    }

    toggleReplyForm(commentId) {
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        if (replyForm) {
            replyForm.classList.toggle('active');
            if (replyForm.classList.contains('active')) {
                const textarea = replyForm.querySelector('textarea');
                if (textarea) textarea.focus();
            }
        }
    }

    hideReplyForm(commentId) {
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        if (replyForm) {
            replyForm.classList.remove('active');
            replyForm.querySelector('form').reset();
        }
    }

    incrementCommentCount(ideaId) {
        // Update the comment count in the UI
        const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
        if (ideaCard) {
            const commentStat = ideaCard.querySelector('.idea-stat:nth-child(2) span');
            if (commentStat) {
                const currentCount = parseInt(commentStat.textContent.split(' ')[0]) || 0;
                commentStat.textContent = `${currentCount + 1} comments`;
            }
        }
    }

    showCommentSuccess(message) {
        // Create a temporary success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 10001;
            font-weight: 600;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle"></i>
                ${message}
            </div>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async handleSubmitIdea(e) {
        e.preventDefault();
        console.log('Submitting new idea...');

        // Get form data
        const formData = new FormData(e.target);
        const ideaData = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            problemStatement: formData.get('problemStatement'),
            stage: formData.get('stage'),
            complexityLevel: formData.get('complexityLevel'),
            requiredSkills: formData.get('requiredSkills'),
            status: 'pending',
            submittedAt: new Date().toISOString(),
            submittedBy: 'current_user'
        };

        console.log('New idea data:', ideaData);

        try {
            // Try API first
            const response = await fetch('/api/ideas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(ideaData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Idea submitted via API:', result);
                alert('Idea submitted successfully! Your submission is now pending review by our team.');
            } else {
                throw new Error('API submission failed');
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock submission');
            this.simulateIdeaSubmission(ideaData);
            alert('Idea submitted successfully! (Demo mode) Your submission is now pending review.');
        }

        // Reset form and switch to browse tab
        e.target.reset();
        this.switchTab('browse');
    }

    simulateIdeaSubmission(ideaData) {
        // In a real application, this would make an API call
        // For demo purposes, we'll add it to pending ideas
        if (!window.pendingIdeas) {
            window.pendingIdeas = [];
        }

        ideaData.id = Date.now().toString();
        window.pendingIdeas.push(ideaData);

        console.log('Idea added to pending queue:', ideaData);

        // Simulate admin notification (in real app, this would be an email/notification)
        console.log('✉️ Admin notification sent for new idea submission');
    }

    // Event handlers for category filters
    setupCategoryFilters() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn') || e.target.closest('.filter-btn')) {
                const btn = e.target.matches('.filter-btn') ? e.target : e.target.closest('.filter-btn');
                const filter = btn.dataset.filter;

                if (filter) {
                    this.applyFilter(filter);
                }
            }
        });
    }

    setupTikTokModalListeners(modal) {
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        const form = modal.querySelector('#addCommentForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleAddComment(e));
        }
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Ideas Page...');

    // Force mock data initialization if not available
    if (!window.ideasMockData) {
        console.log('🔍 Force initializing mock data...');
        try {
            window.ideasMockData = new IdeasMockData();
            console.log('✅ Mock data force initialized');
        } catch (error) {
            console.error('❌ Failed to force initialize mock data:', error);
        }
    }

    window.ideasPage = new IdeasPage();
});
