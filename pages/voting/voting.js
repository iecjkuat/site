/**
 * JKUAT Innovation Club - Voting Portal Logic
 */

class VotingPortal {
    constructor() {
        console.log('🏗️ VotingPortal constructor called');
        this.votes = [];
        this.currentView = 'list';
        this.apiBase = '/api/v1';

        // Centralized state management
        this.state = {
            view: 'list',
            filter: 'all',
            sort: 'ending-soon',
            search: '',
            currentVoteId: null
        };

        // Selection state (not DOM-dependent)
        this.selections = {
            leadership: {}, // { posId: candId }
            project: new Set(),
            decision: null, // 'yes' or 'no'
            committee: new Set()
        };

        // Pending vote submission (avoid JSON injection)
        this.pendingVoteSubmission = null;

        console.log('🔧 VotingPortal initialized, calling init()...');
        this.init();
    }

    // Utility for ID normalization
    normalizeId(id) {
        return String(id);
    }

    async init() {
        console.log('🗳️ Initializing Voting Portal...');

        // Immediately clear any loading states
        const grid = document.getElementById('votingGrid');
        if (grid && grid.querySelector('.loading-state')) {
            console.log('🧹 Clearing initial loading state...');
            grid.innerHTML = '<div style="text-align: center; padding: 2rem; color: white;"><h3>Loading votes...</h3></div>';
        }

        this.bindEvents();
        await this.loadVotes();
        this.updateStats();
        this.checkVotingReminders();
        this.initializeSecurityFeatures();
        this.startRealTimeUpdates();
        this.initializeCountdownTimers();
        this.setupMobileOptimizations();
        this.checkFirstTimeUser();

        // Force render after initialization
        console.log('🔄 Force rendering votes after init...');
        this.renderVotes(this.votes);

        console.log('✅ Voting Portal initialization complete');
    }

    checkFirstTimeUser() {
        const hasVotedBefore = localStorage.getItem('hasVotedBefore');
        if (!hasVotedBefore && this.votes.some(vote => vote.status === 'active')) {
            setTimeout(() => {
                this.showVotingTutorial();
            }, 2000);
        }
    }

    showVotingTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        tutorial.innerHTML = `
            <div class="glass-card max-w-2xl w-full">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-graduation-cap text-2xl text-white"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-2">Welcome to the Voting Portal!</h3>
                    <p class="text-gray-300">Let's take a quick tour of how voting works</p>
                </div>
                
                <div class="space-y-4 mb-8">
                    <div class="flex items-start gap-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                            <h4 class="font-semibold text-blue-300">Browse Active Votes</h4>
                            <p class="text-sm text-gray-300">Click on any active vote card to view details and cast your ballot</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                            <h4 class="font-semibold text-green-300">Make Your Selections</h4>
                            <p class="text-sm text-gray-300">Choose candidates, projects, or decisions by clicking on the options</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                        <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                            <h4 class="font-semibold text-purple-300">Submit Securely</h4>
                            <p class="text-sm text-gray-300">Your votes are encrypted and anonymous - submit when ready!</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button class="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-colors" 
                            onclick="this.closest('.fixed').remove()">
                        Skip Tutorial
                    </button>
                    <button class="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-medium transition-colors" 
                            onclick="window.portalInstance.completeTutorial(); this.closest('.fixed').remove()">
                        Got It! Let's Vote
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(tutorial);
    }

    completeTutorial() {
        localStorage.setItem('hasVotedBefore', 'true');
        this.showSuccess('Welcome to the voting portal! Click on any active vote to get started.');
    }

    startRealTimeUpdates() {
        // Update vote counts and stats every 15 seconds for active votes
        this.realTimeInterval = setInterval(async () => {
            if (this.votes.some(vote => vote.status === 'active')) {
                await this.refreshVoteData();
            }
        }, 15000);
    }

    initializeCountdownTimers() {
        // Update countdown timers every second
        this.countdownInterval = setInterval(() => {
            document.querySelectorAll('[data-countdown]').forEach(element => {
                const endDate = element.dataset.countdown;
                const timeRemaining = this.getTimeRemaining(endDate);
                element.textContent = timeRemaining;

                // Reset classes first to avoid accumulation
                element.classList.remove('text-red-400', 'animate-pulse', 'text-yellow-400');

                // Add urgency styling for last hour
                const now = new Date();
                const end = new Date(endDate);
                const diff = end - now;

                if (diff <= 0) {
                    element.textContent = 'Ended';
                    element.classList.add('text-gray-400');
                } else {
                    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));

                    if (hoursLeft <= 1 && hoursLeft > 0) {
                        element.classList.add('text-red-400', 'animate-pulse');
                    } else {
                        element.classList.add('text-yellow-400');
                    }
                }
            });
        }, 1000);
    }

    setupMobileOptimizations() {
        // Detect mobile device
        this.isMobile = window.innerWidth <= 768;

        // Add mobile-specific event listeners
        if (this.isMobile) {
            this.setupMobileGestures();
            this.optimizeMobileLayout();
        }

        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.optimizeMobileLayout();
            }, 100);
        });
    }

    setupMobileGestures() {
        let startY = 0;
        let currentY = 0;

        // Pull-to-refresh functionality
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 100 && window.scrollY === 0) {
                this.showPullToRefreshIndicator();
            }
        });

        document.addEventListener('touchend', (e) => {
            const diff = currentY - startY;
            if (diff > 150 && window.scrollY === 0) {
                this.refreshVoteData();
            }
            this.hidePullToRefreshIndicator();
        });
    }

    optimizeMobileLayout() {
        const votingGrid = document.getElementById('votingGrid');
        if (this.isMobile && votingGrid) {
            votingGrid.className = 'grid grid-cols-1 gap-6'; // Single column on mobile
        }

        // Optimize filter buttons for mobile
        const filterContainer = document.querySelector('.flex.gap-2.flex-wrap');
        if (this.isMobile && filterContainer) {
            filterContainer.classList.add('overflow-x-auto', 'pb-2');
            filterContainer.style.scrollbarWidth = 'none';
        }
    }

    async refreshVoteData() {
        try {
            const response = await fetch('/api/voting');
            if (response.ok) {
                const data = await response.json();
                const oldVotes = [...this.votes];
                this.votes = data.votes || data;

                // Check for changes and show notifications
                this.checkForVoteUpdates(oldVotes, this.votes);

                // Re-render if we're on the list view
                if (this.currentView === 'list') {
                    this.renderVotes(this.votes);
                }

                this.updateStats();
                console.log('🔄 Vote data refreshed');
            }
        } catch (error) {
            console.log('⚠️ Failed to refresh vote data');
        }
    }

    checkForVoteUpdates(oldVotes, newVotes) {
        newVotes.forEach(newVote => {
            const oldVote = oldVotes.find(v => v.id === newVote.id);
            if (oldVote && oldVote.votes_cast !== newVote.votes_cast) {
                this.showVoteUpdateNotification(newVote);
            }
        });
    }

    showVoteUpdateNotification(vote) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg z-40 animate-slide-in';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-chart-line text-blue-300"></i>
                <div>
                    <div class="font-medium text-sm">${vote.title}</div>
                    <div class="text-xs text-blue-200">New votes: ${vote.votes_cast}/${vote.total_voters}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    showPullToRefreshIndicator() {
        if (document.getElementById('pullToRefresh')) return;

        const indicator = document.createElement('div');
        indicator.id = 'pullToRefresh';
        indicator.className = 'fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-50';
        indicator.innerHTML = '<i class="fas fa-arrow-down mr-2"></i>Pull to refresh';

        document.body.appendChild(indicator);
    }

    hidePullToRefreshIndicator() {
        const indicator = document.getElementById('pullToRefresh');
        if (indicator) {
            indicator.remove();
        }
    }

    bindEvents() {
        // Filter buttons with accessibility
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update aria-pressed states
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                this.filterVotes(btn.dataset.filter);
            });

            // Keyboard support
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Stats card click handlers
        document.querySelectorAll('#electionStatus [data-filter]').forEach(card => {
            card.addEventListener('click', (e) => {
                const filter = card.dataset.filter;
                this.filterVotes(filter);
                // Update filter button state
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                const filterBtn = document.querySelector(`[data-filter="${filter}"]`);
                if (filterBtn) {
                    filterBtn.classList.add('active');
                    filterBtn.setAttribute('aria-pressed', 'true');
                }
            });

            // Keyboard support for stats cards
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Search functionality
        const searchInput = document.getElementById('voteSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchVotes(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('voteSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortVotes(e.target.value);
            });
        }

        // Active election banner
        const voteNowBanner = document.getElementById('voteNowBanner');
        if (voteNowBanner) {
            voteNowBanner.addEventListener('click', () => {
                this.filterVotes('active');
                document.querySelector('[data-filter="active"]').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Back to list button
        document.getElementById('backToList').addEventListener('click', () => {
            this.showListView();
        });

        // Global click delegator for dynamic content
        document.addEventListener('click', (e) => {
            const target = e.target;

            // View Vote Click
            const viewVoteBtn = target.closest('[data-action="view-election"]');
            if (viewVoteBtn) {
                this.viewVote(viewVoteBtn.dataset.id);
                return;
            }

            // View Manifesto Click
            const viewManifestoBtn = target.closest('[data-action="view-manifesto"]');
            if (viewManifestoBtn) {
                e.stopPropagation();
                this.viewManifesto(viewManifestoBtn.dataset.id);
                return;
            }

            // Select Candidate Click (Leadership voting)
            const candidateCard = target.closest('[data-action="select-candidate"]');
            if (candidateCard) {
                this.selectCandidate(candidateCard.dataset.posId, candidateCard.dataset.candId, candidateCard);
                return;
            }

            // Select Project Click (Project voting)
            const projectOption = target.closest('[data-action="select-project"]');
            if (projectOption) {
                this.selectProject(projectOption.dataset.optionId, projectOption);
                return;
            }

            // Select Decision Click (Yes/No voting)
            const decisionOption = target.closest('[data-action="select-decision"]');
            if (decisionOption) {
                this.selectDecision(decisionOption.dataset.choice, decisionOption);
                return;
            }

            // Select Committee Member Click (Committee selection)
            const committeeMember = target.closest('[data-action="select-committee-member"]');
            if (committeeMember) {
                this.selectCommitteeMember(committeeMember.dataset.candId, committeeMember);
                return;
            }

            // Final Submit Click
            if (target.id === 'finalSubmitBtn') {
                this.submitVotes();
                return;
            }

            // Confirm Submit Click (from modal)
            if (target.id === 'confirmSubmitBtn') {
                if (this.pendingVoteSubmission) {
                    this.confirmSubmitVotes();
                    target.closest('.fixed').remove();
                }
                return;
            }

            // Show my votes action
            if (target.closest('[data-action="show-my-votes"]')) {
                this.showMyVotesModal();
                return;
            }

            // Show participation details
            if (target.closest('[data-action="show-participation-details"]')) {
                this.showParticipationModal();
                return;
            }
        });
    }

    async loadVotes() {
        console.log('🔄 Loading votes...');
        try {
            // Use correct API endpoint with versioning
            const response = await fetch(`${this.apiBase}/voting`);
            if (response.ok) {
                const data = await response.json();
                this.votes = data.votes || data;
                console.log('✅ Votes loaded from API:', this.votes.length);
            } else {
                throw new Error('API failed');
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock data');
            console.log('🔍 window.mockVotes available:', !!window.mockVotes);
            console.log('🔍 window.mockVotes length:', window.mockVotes?.length);

            // Fallback to mock data
            this.votes = window.mockVotes || [];

            // Add debugging for mock data
            if (this.votes.length === 0) {
                console.error('❌ No mock data available! Creating fallback data...');
                // Create minimal fallback data
                this.votes = this.createFallbackData();
            }
        }

        console.log('📊 Final votes array:', this.votes);
        console.log('📊 Vote types:', this.votes.map(v => `${v.id}: ${v.type} (${v.status})`));

        // Force render immediately after loading
        console.log('🚀 Force rendering votes immediately...');
        this.renderVotes(this.votes);
    }

    createFallbackData() {
        console.log('🔧 Creating fallback voting data...');
        return [
            {
                id: '1',
                title: 'Executive Committee Elections 2026',
                description: 'Annual elections for the leadership positions of the Innovation Club.',
                type: 'leadership',
                status: 'active',
                start_date: '2026-01-27T00:00:00Z',
                end_date: '2026-02-10T23:59:59Z',
                total_voters: 150,
                votes_cast: 89,
                positions: [
                    {
                        id: 'p1',
                        position_name: 'Club President',
                        candidates: [
                            {
                                id: 'c1',
                                name: 'John Doe',
                                course: 'Computer Science',
                                year: 3,
                                manifesto: 'Innovation for all members.',
                                votes: 45
                            },
                            {
                                id: 'c2',
                                name: 'Jane Smith',
                                course: 'Mechatronics',
                                year: 4,
                                manifesto: 'Engineering a better future.',
                                votes: 32
                            }
                        ]
                    }
                ]
            },
            {
                id: '2',
                title: 'Project Funding Priority Vote',
                description: 'Vote on which projects should receive priority funding this semester.',
                type: 'project',
                status: 'active',
                start_date: '2026-01-28T00:00:00Z',
                end_date: '2026-02-05T23:59:59Z',
                total_voters: 150,
                votes_cast: 23,
                voting_type: 'multiple_choice',
                max_selections: 3,
                options: [
                    {
                        id: 'proj1',
                        title: 'AI-Powered Campus Assistant',
                        description: 'Develop an AI chatbot to help students navigate campus services.',
                        budget_requested: 'KSh 50,000',
                        team_lead: 'Tech Team Alpha',
                        votes: 15
                    },
                    {
                        id: 'proj2',
                        title: 'Smart Irrigation System',
                        description: 'IoT-based irrigation system for the university farm.',
                        budget_requested: 'KSh 75,000',
                        team_lead: 'AgriTech Squad',
                        votes: 12
                    }
                ]
            }
        ];
    }

    updateStats() {
        const active = this.votes.filter(e => e.status === 'active').length;
        const upcoming = this.votes.filter(e => e.status === 'upcoming').length;

        // Calculate overall participation rate
        const totalVoters = this.votes.reduce((sum, vote) => sum + (vote.total_voters || 0), 0);
        const totalVotesCast = this.votes.reduce((sum, vote) => sum + (vote.votes_cast || 0), 0);
        const participationRate = totalVoters > 0 ? Math.round((totalVotesCast / totalVoters) * 100) : 0;

        // Enhanced stats with animations and DOM guards
        this.animateCounter('activeCount', active);
        this.animateCounter('upcomingCount', upcoming);
        this.animateCounter('participationRate', participationRate, '%');

        // Get user's voting history from localStorage or API
        const userVotes = this.getUserVotingHistory();
        this.animateCounter('myVotesCount', userVotes.length);

        // Update last updated timestamp with DOM guard
        const lastUpdated = document.getElementById('activeLastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = 'Updated now';
        }

        // Show/hide active election banner with DOM guard
        this.updateActiveElectionBanner(active);

        // Add real-time updates every 30 seconds
        if (!this.statsUpdateInterval) {
            this.statsUpdateInterval = setInterval(() => {
                this.refreshStats();
            }, 30000);
        }
    }

    updateActiveElectionBanner(activeCount) {
        const banner = document.getElementById('activeElectionBanner');
        const message = document.getElementById('bannerMessage');

        // DOM guards
        if (!banner || !message) return;

        if (activeCount > 0) {
            const activeVotes = this.votes.filter(v => v.status === 'active');
            const nextDeadline = this.getNextDeadline(activeVotes);

            message.textContent = `${activeCount} vote${activeCount > 1 ? 's' : ''} ${activeCount > 1 ? 'are' : 'is'} live — ${nextDeadline}`;
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    }

    getNextDeadline(activeVotes) {
        if (activeVotes.length === 0) return '';

        const now = new Date();
        const nextVote = activeVotes.reduce((earliest, vote) => {
            const voteEnd = new Date(vote.end_date);
            const earliestEnd = new Date(earliest.end_date);
            return voteEnd < earliestEnd ? vote : earliest;
        });

        const timeLeft = new Date(nextVote.end_date) - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `deadline in ${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `deadline in ${hours}h ${minutes}m`;
        } else {
            return `deadline in ${minutes}m`;
        }
    }

    searchVotes(query) {
        this.currentSearchQuery = query.toLowerCase();
        this.applyFiltersAndSearch();
    }

    sortVotes(sortBy) {
        this.currentSort = sortBy;
        this.applyFiltersAndSearch();
    }

    applyFiltersAndSearch() {
        let filtered = [...this.votes];

        // Apply current filter
        if (this.currentFilter && this.currentFilter !== 'all') {
            if (['active', 'upcoming', 'completed'].includes(this.currentFilter)) {
                filtered = filtered.filter(e => e.status === this.currentFilter);
            } else {
                filtered = filtered.filter(e => e.type === this.currentFilter);
            }
        }

        // Apply search
        if (this.currentSearchQuery) {
            filtered = filtered.filter(vote =>
                vote.title.toLowerCase().includes(this.currentSearchQuery) ||
                vote.description.toLowerCase().includes(this.currentSearchQuery) ||
                vote.type.toLowerCase().includes(this.currentSearchQuery)
            );
        }

        // Apply sort
        if (this.currentSort) {
            filtered = this.sortVoteArray(filtered, this.currentSort);
        }

        this.renderVotes(filtered);
    }

    sortVoteArray(votes, sortBy) {
        switch (sortBy) {
            case 'ending-soon':
                return votes.sort((a, b) => {
                    if (a.status === 'active' && b.status !== 'active') return -1;
                    if (b.status === 'active' && a.status !== 'active') return 1;
                    return new Date(a.end_date) - new Date(b.end_date);
                });
            case 'newest':
                return votes.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
            case 'most-popular':
                return votes.sort((a, b) => (b.votes_cast || 0) - (a.votes_cast || 0));
            case 'alphabetical':
                return votes.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return votes;
        }
    }

    showMyVotesModal() {
        const userVotes = this.getUserVotingHistory();
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-bold">My Voting History</h3>
                    <button class="text-gray-400 hover:text-white text-2xl" onclick="this.closest('.fixed').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    ${userVotes.length > 0 ? userVotes.map(vote => {
            const voteData = this.votes.find(v => v.id === vote.voteId);
            return `
                            <div class="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h4 class="font-semibold">${voteData?.title || 'Unknown Vote'}</h4>
                                        <p class="text-sm text-gray-400">${voteData?.type || 'Unknown Type'}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-green-400">✓ Voted</div>
                                        <div class="text-xs text-gray-400">${new Date(vote.timestamp).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('') : '<p class="text-gray-400 text-center py-8">No votes cast yet</p>'}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showParticipationModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="glass-card max-w-lg w-full">
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-bold">Participation Details</h3>
                    <button class="text-gray-400 hover:text-white text-2xl" onclick="this.closest('.fixed').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                        <h4 class="font-semibold text-blue-300 mb-2">How Participation is Calculated</h4>
                        <p class="text-sm text-gray-300">Participation rate shows the percentage of eligible club members who have voted across all active elections.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-3 bg-white/5 rounded-lg">
                            <div class="text-xl font-bold text-green-400">${this.votes.reduce((sum, v) => sum + (v.votes_cast || 0), 0)}</div>
                            <div class="text-xs text-gray-400">Total Votes Cast</div>
                        </div>
                        <div class="text-center p-3 bg-white/5 rounded-lg">
                            <div class="text-xl font-bold text-blue-400">${this.votes.reduce((sum, v) => sum + (v.total_voters || 0), 0)}</div>
                            <div class="text-xs text-gray-400">Eligible Voters</div>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 text-center">Updated in real-time • Club-wide average</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const difference = Math.abs(targetValue - currentValue);

        // Prevent crazy intervals for large differences
        if (difference === 0) {
            element.textContent = targetValue + suffix;
            return;
        }

        // Use time-based animation instead of step-based
        const duration = Math.min(1000, Math.max(300, difference * 50)); // 300ms to 1000ms
        const startTime = performance.now();
        const startValue = currentValue;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(startValue + (targetValue - startValue) * easeOutQuart);

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    getUserVotingHistory() {
        // Get from localStorage or return mock data
        const stored = localStorage.getItem('userVotingHistory');
        return stored ? JSON.parse(stored) : [
            { voteId: '5', timestamp: '2025-01-15T10:30:00Z' },
            { voteId: '3', timestamp: '2025-01-10T14:20:00Z' }
        ];
    }

    async refreshStats() {
        try {
            const response = await fetch('/api/voting/stats');
            if (response.ok) {
                const stats = await response.json();
                this.updateStatsFromAPI(stats);
            }
        } catch (error) {
            console.log('Stats refresh failed, using local data');
        }
    }

    checkVotingReminders() {
        const now = new Date();
        const reminders = [];

        this.votes.forEach(vote => {
            if (vote.status === 'active') {
                const endDate = new Date(vote.end_date);
                const timeLeft = endDate - now;
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

                if (hoursLeft <= 24 && hoursLeft > 0) {
                    reminders.push({
                        id: vote.id,
                        title: vote.title,
                        timeLeft: hoursLeft <= 1 ? 'Less than 1 hour' : `${hoursLeft} hours`,
                        urgency: hoursLeft <= 2 ? 'high' : hoursLeft <= 6 ? 'medium' : 'low',
                        type: vote.type
                    });
                }
            }
        });

        if (reminders.length > 0) {
            this.displayReminders(reminders);
            this.scheduleReminderNotifications(reminders);
        }
    }

    displayReminders(reminders) {
        const reminderSection = document.getElementById('votingReminders');
        const remindersList = document.getElementById('remindersList');

        remindersList.innerHTML = reminders.map(reminder => `
            <div class="flex items-center justify-between py-3 px-4 rounded-lg mb-2 ${reminder.urgency === 'high' ? 'bg-red-900/30 border border-red-500/30' :
                reminder.urgency === 'medium' ? 'bg-yellow-900/30 border border-yellow-500/30' :
                    'bg-blue-900/30 border border-blue-500/30'
            }">
                <div class="flex items-center gap-3">
                    <i class="fas ${this.getTypeIcon(reminder.type)} ${reminder.urgency === 'high' ? 'text-red-400' :
                reminder.urgency === 'medium' ? 'text-yellow-400' : 'text-blue-400'
            }"></i>
                    <div>
                        <div class="font-medium text-sm">${reminder.title}</div>
                        <div class="text-xs text-gray-400">${this.getTypeLabel(reminder.type)}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium ${reminder.urgency === 'high' ? 'text-red-400' :
                reminder.urgency === 'medium' ? 'text-yellow-400' : 'text-blue-400'
            }">${reminder.timeLeft} left</div>
                    <button class="text-xs text-gray-400 hover:text-white mt-1" 
                            onclick="window.portalInstance.viewVote('${reminder.id}')">
                        Vote Now →
                    </button>
                </div>
            </div>
        `).join('');

        reminderSection.classList.remove('hidden');
    }

    scheduleReminderNotifications(reminders) {
        // Schedule browser notifications for urgent votes
        if ('Notification' in window) {
            reminders.forEach(reminder => {
                if (reminder.urgency === 'high') {
                    this.requestNotificationPermission().then(permission => {
                        if (permission === 'granted') {
                            this.scheduleNotification(reminder);
                        }
                    });
                }
            });
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            return await Notification.requestPermission();
        }
        return Notification.permission;
    }

    scheduleNotification(reminder) {
        // Show notification every 30 minutes for urgent votes
        const notificationInterval = setInterval(() => {
            if (Notification.permission === 'granted') {
                new Notification(`🗳️ Voting Reminder: ${reminder.title}`, {
                    body: `Only ${reminder.timeLeft} left to vote!`,
                    icon: '/shared/assets/favicon.ico',
                    badge: '/shared/assets/favicon.ico',
                    tag: `vote-${reminder.id}`,
                    requireInteraction: true
                });
            }
        }, 30 * 60 * 1000); // 30 minutes

        // Clear interval when vote ends
        setTimeout(() => {
            clearInterval(notificationInterval);
        }, 2 * 60 * 60 * 1000); // 2 hours max
    }

    getTypeIcon(type) {
        const icons = {
            leadership: 'fa-crown',
            project: 'fa-lightbulb',
            decision: 'fa-gavel',
            committee: 'fa-users'
        };
        return icons[type] || 'fa-vote-yea';
    }

    getTypeLabel(type) {
        const labels = {
            leadership: 'Leadership Election',
            project: 'Project Funding',
            decision: 'Club Decision',
            committee: 'Committee Selection'
        };
        return labels[type] || 'Vote';
    }

    initializeSecurityFeatures() {
        // Add voting session tracking
        this.sessionId = this.generateSessionId();
        console.log('🔐 Voting session initialized:', this.sessionId);

        // Add vote integrity checking
        this.voteIntegrityHash = this.generateIntegrityHash();

        // Add browser fingerprinting for security
        this.browserFingerprint = this.generateBrowserFingerprint();
    }

    generateSessionId() {
        return 'vs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateIntegrityHash() {
        const data = JSON.stringify({
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            votes: this.votes.length
        });
        return btoa(data).substr(0, 16);
    }

    generateBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Voting security check', 2, 2);

        return {
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            canvas: canvas.toDataURL().substr(0, 32)
        };
    }

    renderVotes(data) {
        const grid = document.getElementById('votingGrid');
        console.log('🎯 renderVotes called with data:', data);
        console.log('🎯 Grid element found:', !!grid);

        if (!grid) {
            console.error('❌ Grid element not found!');
            return;
        }

        // Always clear the loading state first
        console.log('🧹 Clearing loading state and any existing content...');
        grid.innerHTML = ''; // Clear everything including loading skeletons

        if (!data || data.length === 0) {
            console.log('⚠️ No data available, showing empty message');
            grid.innerHTML = `
                <div class="no-votes-message">
                    <i class="fas fa-vote-yea no-votes-icon"></i>
                    <h3 class="no-votes-title">No Votes Available</h3>
                    <p class="no-votes-text">There are currently no active or upcoming votes. Check back later!</p>
                    <button onclick="window.location.reload()" class="refresh-btn">
                        <i class="fas fa-sync-alt"></i> Refresh Page
                    </button>
                </div>
            `;
            return;
        }

        console.log('✅ Rendering', data.length, 'vote cards');

        try {
            // Create election-style voting cards with interactive candidates and projects
            const cardsHTML = this.createElectionStyleCards(data);
            console.log('📝 Generated HTML length:', cardsHTML.length);

            if (!cardsHTML || cardsHTML.trim() === '') {
                throw new Error('Generated HTML is empty');
            }

            grid.innerHTML = cardsHTML;

            // Set up global functions for interactive voting
            this.setupGlobalVotingFunctions();

            // Force a repaint to ensure content is visible
            grid.style.display = 'none';
            grid.offsetHeight; // Trigger reflow
            grid.style.display = '';

            console.log('✅ Cards rendered to DOM with interactive functionality');
        } catch (error) {
            console.error('❌ Error during vote card rendering:', error);
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 2rem;">
                <i class="fas fa-exclamation-triangle style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to render voting cards. Error: ${error.message}</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; border: none;">Retry</button>
            </div>`;
        }
    }

    createElectionStyleCards(votes) {
        return votes.map(vote => {
            if (vote.type === 'leadership' && vote.status === 'active') {
                return this.createLeadershipElectionCard(vote);
            } else if (vote.type === 'project' && vote.status === 'active') {
                return this.createProjectFundingCard(vote);
            } else {
                return this.createVoteCard(vote);
            }
        }).join('');
    }

    createLeadershipElectionCard(vote) {
        const timeRemaining = this.getTimeRemaining(vote.end_date);
        const progressPercent = vote.total_voters > 0 ?
            Math.round((vote.votes_cast / vote.total_voters) * 100) : 0;

        return `
            <!-- Leadership Election Card with Candidates -->
            <div class="vote-card leadership-card" data-action="view-election" data-id="${vote.id}">
                <div class="card-header">
                    <div class="card-header-left">
                        <div class="icon-container primary">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div class="card-meta">
                            <div class="vote-type">Leadership Election</div>
                            <div class="vote-status">
                                <span class="status-dot active animate-pulse"></span>
                                <span class="status-text">active</span>
                                <span class="status-indicator status-active">LIVE</span>
                            </div>
                        </div>
                    </div>
                    <div class="time-badge urgent">
                        <div class="time-remaining">${timeRemaining}</div>
                    </div>
                </div>
                
                <h3 class="vote-title">${vote.title}</h3>
                
                ${(vote.positions || []).map(position => `
                    <!-- ${position.position_name} Position -->
                    <div class="position-group">
                        <h4 class="position-title">${position.position_name}</h4>
                        <div class="candidates-grid">
                            ${(position.candidates || []).map(candidate => `
                                <!-- Candidate ${candidate.name} -->
                                <div class="candidate-option clickable-candidate" 
                                     data-position="${position.id}" 
                                     data-candidate="${candidate.id}"
                                     onclick="window.selectCandidate(this, '${position.id}', '${candidate.id}')">
                                    <div class="candidate-info">
                                        <div class="candidate-avatar text-avatar">${candidate.name.split(' ').map(n => n[0]).join('')}</div>
                                        <div class="candidate-details">
                                            <div class="candidate-name">${candidate.name}</div>
                                            <div class="candidate-course">${candidate.course || 'Unknown Course'} - Year ${candidate.year || 'N/A'}</div>
                                            <div class="candidate-manifesto-preview">"${(candidate.manifesto || '').substring(0, 50)}..."</div>
                                        </div>
                                        <div class="vote-indicator">
                                            <i class="fas fa-check"></i>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                
                <!-- Vote Button -->
                <div class="card-footer-action">
                    <button class="vote-btn-large leadership" onclick="window.submitLeadershipVote('${vote.id}')">
                        <i class="fas fa-vote-yea"></i>Cast Your Vote
                    </button>
                    <div class="participation-stats">
                        <i class="fas fa-users"></i>${vote.votes_cast} of ${vote.total_voters} members voted (${progressPercent}%)
                    </div>
                </div>
            </div>
        `;
    }

    createProjectFundingCard(vote) {
        const timeRemaining = this.getTimeRemaining(vote.end_date);
        const progressPercent = vote.total_voters > 0 ?
            Math.round((vote.votes_cast / vote.total_voters) * 100) : 0;

        return `
            <!-- Project Funding Card -->
            <div class="vote-card project-card" data-action="view-election" data-id="${vote.id}">
                <div class="card-header">
                    <div class="card-header-left">
                        <div class="icon-container success">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="card-meta">
                            <div class="vote-type">Project Funding</div>
                            <div class="vote-status">
                                <span class="status-dot active animate-pulse"></span>
                                <span class="status-text">active</span>
                            </div>
                        </div>
                    </div>
                    <div class="time-badge">
                        <div class="time-remaining">${timeRemaining}</div>
                    </div>
                </div>
                
                <h3 class="vote-title">${vote.title}</h3>
                <p class="vote-description line-clamp-2">${vote.description || 'No description provided.'}</p>
                
                <div class="projects-list">
                    <div class="list-label">Available Projects (Select up to ${vote.max_selections || 3})</div>
                    ${(vote.options || []).map(project => `
                        <div class="project-mini-option clickable-project" 
                             data-vote-id="${vote.id}" 
                             data-project-id="${project.id}"
                             onclick="window.selectProject(this, '${vote.id}', '${project.id}')">
                            <div class="project-mini-info">
                                <div class="project-name">${project.title || 'Untitled Project'}</div>
                                <div class="project-budget">Budget: ${project.budget_requested || 'TBD'}</div>
                            </div>
                            <div class="project-check">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="card-footer-action">
                    <button class="vote-btn-large project" onclick="window.submitProjectVote('${vote.id}')">
                        <i class="fas fa-vote-yea"></i>Submit Selections
                    </button>
                    <div class="participation-stats">
                        <i class="fas fa-users"></i>${vote.votes_cast || 0} of ${vote.total_voters || 0} members voted
                    </div>
                </div>
            </div>
        `;
    }

    setupGlobalVotingFunctions() {
        // Store reference to this instance for global functions
        window.portalInstance = this;

        // Global function for candidate selection
        window.selectCandidate = (element, position, candidate) => {
            console.log(`🗳️ Selecting candidate ${candidate} for ${position}`);

            // Find all candidates for this position and deselect them
            const positionElements = document.querySelectorAll(`[onclick*="'${position}'"]`);
            positionElements.forEach(el => {
                el.style.background = 'rgba(255, 255, 255, 0.05)';
                el.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                const indicator = el.querySelector('.vote-indicator i');
                if (indicator) indicator.style.opacity = '0';
            });

            // Select this candidate
            element.style.background = 'rgba(16, 185, 129, 0.15)';
            element.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            const indicator = element.querySelector('.vote-indicator i');
            if (indicator) indicator.style.opacity = '1';

            // Store selection
            if (!this.selections.leadership) this.selections.leadership = {};
            this.selections.leadership[position] = candidate;

            console.log('✅ Leadership selections:', this.selections.leadership);
        };

        // Global function for project selection
        window.selectProject = (element, voteId, projectId) => {
            console.log(`🗳️ Toggling project ${projectId} for vote ${voteId}`);

            if (!this.selections.project) this.selections.project = new Set();

            const indicator = element.querySelector('.project-check i');
            const isSelected = element.classList.contains('selected');

            // Find the vote to get max selections
            const currentVote = this.votes.find(v => this.normalizeId(v.id) === this.normalizeId(voteId));
            const maxSelections = currentVote?.max_selections || 3;

            if (isSelected) {
                // Deselect
                element.classList.remove('selected');
                if (indicator) indicator.style.opacity = '0';
                this.selections.project.delete(projectId);
            } else if (this.selections.project.size < maxSelections) {
                // Select if under limit
                element.classList.add('selected');
                if (indicator) indicator.style.opacity = '1';
                this.selections.project.add(projectId);
            } else {
                alert(`You can only select up to ${maxSelections} projects!`);
                return;
            }

            // Update counter (if applicable, for detail view)
            const counter = document.getElementById(`selected-count-${this.normalizeId(voteId)}`);
            if (counter) counter.textContent = this.selections.project.size;

            console.log('✅ Project selections:', Array.from(this.selections.project));
        };

        // Global function for submitting leadership vote
        window.submitLeadershipVote = (voteId) => {
            console.log(`🗳️ Submitting leadership vote for ${voteId}`);

            if (!this.selections.leadership || Object.keys(this.selections.leadership).length === 0) {
                alert('Please select at least one candidate before submitting your vote.');
                return;
            }

            // Store pending submission to avoid JSON injection
            this.pendingVoteSubmission = {
                voteId: this.normalizeId(voteId),
                votes: { leadership: this.selections.leadership }
            };

            // Show confirmation modal
            const currentVote = this.votes.find(v => v.id === voteId);
            if (currentVote) {
                this.showVoteConfirmation(currentVote, { leadership: this.selections.leadership });
            }
        };

        // Global function for submitting project vote
        window.submitProjectVote = (voteId) => {
            console.log(`🗳️ Submitting project vote for ${voteId}`);

            if (!this.selections.project || this.selections.project.size === 0) {
                alert('Please select at least one project before submitting your vote.');
                return;
            }

            // Store pending submission to avoid JSON injection
            this.pendingVoteSubmission = {
                voteId: this.normalizeId(voteId),
                votes: { projects: Array.from(this.selections.project) }
            };

            // Show confirmation modal
            const currentVote = this.votes.find(v => v.id === voteId);
            if (currentVote) {
                this.showVoteConfirmation(currentVote, { projects: Array.from(this.selections.project) });
            }
        };

        // Add CSS for hover effects
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .candidate-option:hover, .project-option:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            .vote-card:hover {
                transform: translateY(-6px) scale(1.01) !important;
                border-color: rgba(16, 185, 129, 0.3) !important;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25) !important;
            }
            /* New styles for project-mini-option */
            .project-mini-option {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 0.5rem;
            }
            .project-mini-option:last-child {
                margin-bottom: 0;
            }
            .project-mini-option:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
            }
            .project-mini-option.selected {
                background: rgba(16, 185, 129, 0.15);
                border-color: rgba(16, 185, 129, 0.3);
            }
            .project-mini-info {
                flex-grow: 1;
            }
            .project-name {
                color: white;
                font-weight: 600;
                font-size: 0.9375rem;
            }
            .project-budget {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.8125rem;
            }
            .project-check {
                width: 1.25rem;
                height: 1.25rem;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 0.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                margin-left: 1rem;
            }
            .project-mini-option.selected .project-check {
                border-color: #10b981;
                background-color: #10b981;
            }
            .project-check i {
                font-size: 0.75rem;
                color: white;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .project-mini-option.selected .project-check i {
                opacity: 1;
            }
            /* General card styles */
            .vote-card {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
                backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.18);
                border-radius: 1.25rem;
                padding: 1.75rem;
                max-width: 450px;
                margin: 0 auto;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                position: relative;
                display: flex;
                flex-direction: column;
            }
            .card-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                margin-bottom: 1.5rem;
            }
            .card-header-left {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .icon-container {
                border-radius: 0.875rem;
                width: 2.75rem;
                height: 2.75rem;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.25rem;
            }
            .icon-container.primary { background: linear-gradient(135deg, #3b82f6, #2563eb); }
            .icon-container.success { background: linear-gradient(135deg, #f59e0b, #d97706); } /* Changed to orange for project */
            .icon-container.info { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
            .card-meta {
                display: flex;
                flex-direction: column;
            }
            .vote-type {
                font-size: 0.6875rem;
                color: rgba(255, 255, 255, 0.6);
                text-transform: uppercase;
                font-weight: 700;
                letter-spacing: 0.05em;
            }
            .vote-status {
                display: flex;
                align-items: center;
                gap: 0.375rem;
            }
            .status-dot {
                width: 0.375rem;
                height: 0.375rem;
                border-radius: 50%;
            }
            .status-dot.active { background-color: #10b981; }
            .status-text {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.8);
                font-weight: 500;
            }
            .status-indicator {
                background: rgba(16, 185, 129, 0.15);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.25);
                border-radius: 0.625rem;
                padding: 0.25rem 0.625rem;
                font-size: 0.6875rem;
                font-weight: 700;
                text-transform: uppercase;
            }
            .time-badge {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15));
                border: 1px solid rgba(245, 158, 11, 0.25);
                border-radius: 0.625rem;
                padding: 0.375rem 0.625rem;
                text-align: center;
            }
            .time-remaining {
                font-size: 0.75rem;
                font-weight: 600;
                color: #f59e0b;
            }
            .vote-title {
                background: linear-gradient(135deg, #ffffff, #e5e7eb);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
                font-size: 1.25rem;
                line-height: 1.4;
                margin-bottom: 0.75rem;
            }
            .vote-description {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.875rem;
                margin-bottom: 1.5rem;
            }
            .projects-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 1.5rem;
            }
            .list-label {
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            .card-footer-action {
                text-align: center;
                padding-top: 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: auto; /* Pushes footer to bottom */
            }
            .vote-btn-large {
                border: none;
                border-radius: 0.75rem;
                padding: 0.875rem 2rem;
                font-weight: 700;
                font-size: 0.9375rem;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
                width: 100%;
            }
            .vote-btn-large.project {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
            }
            .vote-btn-large i {
                margin-right: 0.5rem;
            }
            .participation-stats {
                margin-top: 0.75rem;
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.6);
            }
            .participation-stats i {
                margin-right: 0.25rem;
            }

            /* Decision Voting Card Styles */
            .decision-voting-card {
                max-width: 800px;
            }
            .detail-header {
                display: flex;
                flex-direction: column;
                md:flex-row;
                justify-content: space-between;
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            .detail-info {
                flex-grow: 1;
            }
            .detail-title {
                font-size: 1.875rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: white;
            }
            .detail-desc {
                color: #d1d5db; /* gray-300 */
            }
            .detail-timer {
                background: rgba(55, 65, 81, 0.25); /* indigo-900/40 equivalent */
                padding: 1rem;
                border-radius: 0.75rem;
                border: 1px solid rgba(99, 102, 241, 0.2); /* indigo-500/30 equivalent */
                text-align: center;
                min-width: 12.5rem; /* min-w-[200px] */
            }
            .timer-label {
                font-size: 0.875rem;
                color: #a5b4fc; /* indigo-300 */
                margin-bottom: 0.25rem;
            }
            .timer-value {
                font-size: 1.5rem;
                font-family: monospace;
                font-weight: 700;
                color: #facc15; /* yellow-400 */
            }
            .proposal-container {
                margin-bottom: 2rem;
            }
            .proposal-title {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 1rem;
                border-left: 4px solid #f59e0b; /* yellow-500 */
                padding-left: 1rem;
                color: white;
            }
            .proposal-grid {
                display: grid;
                grid-template-columns: 1fr;
                lg:grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }
            .proposal-section {
                background: rgba(255, 255, 255, 0.05); /* glass-card equivalent */
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                padding: 1.5rem;
            }
            .section-label {
                font-weight: 600;
                margin-bottom: 0.75rem;
            }
            .section-label.red { color: #f87171; } /* red-400 */
            .section-label.green { color: #34d399; } /* green-400 */
            .section-text {
                color: #d1d5db; /* gray-300 */
                font-style: italic;
            }
            .proposal-rationale {
                padding: 1rem;
                background: rgba(30, 58, 138, 0.3); /* blue-900/30 */
                border-radius: 0.5rem;
                border: 1px solid rgba(59, 130, 246, 0.3); /* blue-500/30 */
            }
            .rationale-label {
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: #93c5fd; /* blue-300 */
            }
            .rationale-text {
                color: #d1d5db; /* gray-300 */
            }
            .decision-options-container {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-bottom: 2rem;
                max-width: 48rem; /* max-w-2xl */
                margin-left: auto;
                margin-right: auto;
            }
            .decision-choice {
                background: rgba(255, 255, 255, 0.05); /* glass-card equivalent */
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                padding: 2rem;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
                flex: 1;
            }
            .decision-choice:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .decision-choice.yes:hover { background: rgba(16, 185, 129, 0.1); } /* green-900/20 */
            .decision-choice.no:hover { background: rgba(239, 68, 68, 0.1); } /* red-900/20 */
            .decision-choice.selected {
                border-color: #10b981; /* green-500 */
                background: rgba(16, 185, 129, 0.15);
            }
            .decision-choice.selected .selection-indicator {
                display: block !important;
            }
            .choice-icon {
                width: 4rem;
                height: 4rem;
                border-radius: 9999px; /* full */
                margin-left: auto;
                margin-right: auto;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            .choice-icon.yes { background-color: #16a34a; } /* green-600 */
            .choice-icon.no { background-color: #dc2626; } /* red-600 */
            .choice-icon i { color: white; }
            .choice-label {
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            .choice-label.yes { color: #34d399; } /* green-400 */
            .choice-label.no { color: #f87171; } /* red-400 */
            .choice-desc {
                color: #d1d5db; /* gray-300 */
            }
            .submission-footer {
                text-align: center;
            }
            .submit-btn-glow {
                background: #16a34a; /* green-600 */
                color: white;
                padding: 0.75rem 2rem;
                border-radius: 9999px; /* full */
                font-weight: 700;
                font-size: 1.125rem;
                transition: all 0.3s ease;
                transform: scale(1);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3); /* green-600 with opacity */
            }
            .submit-btn-glow:hover {
                background: #15803d; /* green-500 */
                transform: scale(1.05);
            }
            .submit-btn-glow i {
                margin-right: 0.5rem;
            }
            .secure-note {
                color: #9ca3af; /* gray-400 */
                font-size: 0.875rem;
                margin-top: 1rem;
            }
            .secure-note i {
                margin-right: 0.5rem;
            }

            /* Committee Selection Card Styles */
            .committee-selection-card {
                max-width: 1000px;
            }
            .committee-info-box {
                margin-top: 1rem;
                padding: 1rem;
                background: rgba(109, 40, 217, 0.3); /* purple-900/30 */
                border-radius: 0.5rem;
                border: 1px solid rgba(168, 85, 247, 0.3); /* purple-500/30 */
            }
            .committee-info-title {
                font-weight: 600;
                color: #d8b4fe; /* purple-300 */
                margin-bottom: 0.5rem;
            }
            .committee-info-desc {
                color: #d1d5db; /* gray-300 */
                font-size: 0.875rem;
                margin-bottom: 0.5rem;
            }
            .committee-info-details {
                display: flex;
                gap: 1rem;
                font-size: 0.875rem;
            }
            .committee-info-details span {
                color: #9ca3af; /* gray-400 */
            }
            .committee-info-details i {
                margin-right: 0.25rem;
            }
            .selection-limit-box {
                margin-top: 1rem;
                padding: 0.75rem;
                background: rgba(30, 58, 138, 0.3); /* blue-900/30 */
                border-radius: 0.5rem;
                border: 1px solid rgba(59, 130, 246, 0.3); /* blue-500/30 */
            }
            .selection-limit-box i {
                color: #93c5fd; /* blue-400 */
                margin-right: 0.5rem;
            }
            .selection-limit-box span {
                color: #a5b4fc; /* blue-300 */
            }
            .committee-candidates-grid {
                display: grid;
                grid-template-columns: 1fr;
                md:grid-template-columns: repeat(2, 1fr);
                lg:grid-template-columns: repeat(3, 1fr);
                gap: 1.5rem;
                justify-items: center;
                max-width: 64rem; /* max-w-5xl */
                margin-left: auto;
                margin-right: auto;
            }
            .committee-candidate {
                background: rgba(255, 255, 255, 0.05); /* glass-card equivalent */
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                padding: 1.5rem;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
            }
            .committee-candidate:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .committee-candidate.selected {
                border-color: #a855f7; /* purple-500 */
                background: rgba(168, 85, 247, 0.15); /* purple-900/20 */
            }
            .committee-candidate.selected .selection-indicator {
                display: block !important;
            }
            .candidate-avatar-circle {
                width: 4rem;
                height: 4rem;
                border-radius: 9999px; /* full */
                background: linear-gradient(135deg, #a855f7, #ec4899); /* purple-500 to pink-600 */
                margin-left: auto;
                margin-right: auto;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }
            .candidate-avatar-circle i {
                color: white;
            }
            .candidate-name-h5 {
                font-weight: 700;
                font-size: 1.125rem;
                margin-bottom: 0.5rem;
                color: white;
            }
            .candidate-course-p {
                font-size: 0.875rem;
                color: #9ca3af; /* gray-400 */
                margin-bottom: 0.5rem;
            }
            .candidate-experience-p {
                font-size: 0.75rem;
                color: #6b7280; /* gray-500 */
                margin-bottom: 1rem;
            }
            .selection-indicator {
                display: none; /* Hidden by default */
                margin-top: 1rem;
                color: #34d399; /* green-400 */
            }
            .selection-indicator i {
                font-size: 1.25rem;
            }
            .selection-indicator-text {
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
            }
            .selected-count-display {
                margin-bottom: 1rem;
            }
            .selected-count-display span {
                color: #9ca3af; /* gray-400 */
            }
            .selected-count-display .font-bold {
                color: white;
            }
        `;
        document.head.appendChild(style);

        console.log('✅ Global voting functions set up successfully');
    }

    createVoteCard(vote) {
        const statusColors = {
            active: 'bg-green-500',
            upcoming: 'bg-yellow-500',
            completed: 'bg-gray-500'
        };

        const typeIcons = {
            leadership: 'fas fa-crown',
            project: 'fas fa-lightbulb',
            decision: 'fas fa-gavel',
            committee: 'fas fa-users'
        };

        const typeLabels = {
            leadership: 'Leadership',
            project: 'Project Funding',
            decision: 'Club Decision',
            committee: 'Committee'
        };

        const progressPercent = vote.total_voters > 0 ?
            Math.round((vote.votes_cast / vote.total_voters) * 100) : 0;

        const timeRemaining = this.getTimeRemaining(vote.end_date);

        // Compact, beautiful card design with proper CSS classes
        return `
            <div class="vote-card" data-action="view-election" data-id="${vote.id}" data-vote-type="${vote.type}">
                <!-- Card Header -->
                <div class="card-header">
                    <div class="card-header-left">
                        <div class="icon-container">
                            <i class="${typeIcons[vote.type] || 'fas fa-vote-yea'}"></i>
                        </div>
                        <div class="card-meta">
                            <div class="vote-type">${typeLabels[vote.type] || 'Vote'}</div>
                            <div class="vote-status">
                                <span class="status-dot ${vote.status} ${vote.status === 'active' ? 'animate-pulse' : ''}"></span>
                                <span class="status-text">${vote.status}</span>
                                ${vote.status === 'active' ? '<span class="status-indicator status-active">LIVE</span>' : ''}
                            </div>
                        </div>
                    </div>
                    ${vote.status === 'active' ? `
                        <div class="time-badge">
                            <div class="time-remaining" data-countdown="${vote.end_date}">${timeRemaining}</div>
                        </div>
                    ` : ''}
                </div>

                <!-- Card Content -->
                <div class="card-content">
                    <h3 class="vote-title">${vote.title}</h3>
                    <p class="vote-description line-clamp-2">${vote.description}</p>

                    <!-- Progress Section -->
                    ${vote.status === 'active' || vote.status === 'completed' ? `
                        <div class="progress-container">
                            <div class="progress-header">
                                <span class="progress-label">Turnout</span>
                                <span class="progress-count">${vote.votes_cast}/${vote.total_voters}</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <div class="progress-footer">
                                <span class="progress-percent">${progressPercent}%</span>
                                ${vote.status === 'active' ? `<span class="live-indicator"><span class="live-dot"></span>Live</span>` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Real-time Activity -->
                    ${vote.status === 'active' ? `
                        <div class="activity-indicator">
                            <div class="activity-dot"></div>
                            <span>Last vote: ${this.getLastVoteTime(vote)}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Card Footer -->
                <div class="card-footer">
                    <div class="vote-dates">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDateCompact(vote.start_date)} - ${this.formatDateCompact(vote.end_date)}
                    </div>
                    <button class="vote-button ${vote.status}">
                        ${vote.status === 'active' ? '🗳️ Vote' :
                vote.status === 'upcoming' ? '👁️ View' : '📊 Results'}
                    </button>
                </div>
            </div>
        `;
    }

    getLastVoteTime(vote) {
        // Mock last vote time - in real app would come from API
        const times = ['2 min ago', '5 min ago', '12 min ago', '1 hour ago'];
        return times[Math.floor(Math.random() * times.length)];
    }

    getTimeRemaining(endDate) {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return 'Less than 1h';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateCompact(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric'
        });
    }

    filterVotes(filter) {
        this.state.filter = filter;
        this.applyFiltersAndSearch();
    }

    viewVote(id) {
        const normalizedId = this.normalizeId(id);
        const vote = this.votes.find(e => this.normalizeId(e.id) === normalizedId);
        if (!vote) return;

        console.log('Viewing vote:', vote.title);
        this.state.view = 'detail';
        this.state.currentVoteId = normalizedId;

        // Clear previous selections
        this.clearSelections();

        // Hide list, show detail
        document.getElementById('votingListSection').classList.add('hidden');
        document.getElementById('voteDetailSection').classList.remove('hidden');

        // Render detail based on vote type and status
        const container = document.getElementById('voteDetailContent');

        if (vote.status === 'completed' && vote.results_published) {
            this.renderVoteResults(vote, container);
        } else if (vote.type === 'leadership') {
            this.renderLeadershipVote(vote, container);
        } else if (vote.type === 'project') {
            this.renderProjectVoting(vote, container);
        } else if (vote.type === 'decision') {
            this.renderDecisionVoting(vote, container);
        } else if (vote.type === 'committee') {
            this.renderCommitteeSelection(vote, container);
        } else {
            // Default fallback
            this.renderLeadershipVote(vote, container);
        }
    }

    clearSelections() {
        this.selections = {
            leadership: {},
            project: new Set(),
            decision: null,
            committee: new Set()
        };
    }

    renderVoteResults(vote, container) {
        const totalVotes = vote.votes_cast || 0;

        container.innerHTML = `
            <div class="glass-card p-8 mb-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-chart-bar text-2xl text-white"></i>
                    </div>
                    <h2 class="text-3xl font-bold mb-2">${vote.title} - Results</h2>
                    <p class="text-gray-300">${vote.description}</p>
                    <div class="mt-4 flex justify-center gap-8 text-sm">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-400">${totalVotes}</div>
                            <div class="text-gray-400">Total Votes</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-400">${Math.round((totalVotes / vote.total_voters) * 100)}%</div>
                            <div class="text-gray-400">Turnout</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-400">${vote.total_voters}</div>
                            <div class="text-gray-400">Eligible Voters</div>
                        </div>
                    </div>
                </div>

                ${this.renderResultsByType(vote)}

                <div class="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                    <div class="flex items-center gap-2 text-blue-300 mb-2">
                        <i class="fas fa-info-circle"></i>
                        <span class="font-semibold">Election Information</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>Voting Period: ${this.formatDate(vote.start_date)} - ${this.formatDate(vote.end_date)}</div>
                        <div>Results Published: ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderResultsByType(vote) {
        if (vote.type === 'leadership') {
            return this.renderLeadershipResults(vote);
        } else if (vote.type === 'project') {
            return this.renderProjectResults(vote);
        } else if (vote.type === 'decision') {
            return this.renderDecisionResults(vote);
        } else if (vote.type === 'committee') {
            return this.renderCommitteeResults(vote);
        }
        return '<div class="text-center text-gray-400">Results not available</div>';
    }

    renderLeadershipResults(vote) {
        if (!vote.positions) return '';

        return vote.positions.map(position => {
            const totalPositionVotes = position.candidates?.reduce((sum, c) => sum + (c.votes || 0), 0) || 0;
            const sortedCandidates = (position.candidates || []).sort((a, b) => (b.votes || 0) - (a.votes || 0));
            const winner = sortedCandidates[0];

            return `
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold mb-6 border-l-4 border-emerald-500 pl-4">${position.position_name}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${sortedCandidates.map((candidate, index) => {
                const percentage = totalPositionVotes > 0 ? Math.round((candidate.votes / totalPositionVotes) * 100) : 0;
                const isWinner = index === 0;

                return `
                                <div class="glass-card p-6 text-center ${isWinner ? 'border-2 border-green-500 bg-green-900/20' : ''}">
                                    ${isWinner ? '<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">WINNER</div>' : ''}
                                    <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-2xl relative">
                                        <i class="fas fa-user text-white"></i>
                                        ${isWinner ? '<div class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"><i class="fas fa-crown text-xs"></i></div>' : ''}
                                    </div>
                                    <h5 class="font-bold text-lg mb-2">${candidate.name}</h5>
                                    <p class="text-sm text-gray-400 mb-4">${candidate.course} - Year ${candidate.year}</p>
                                    <div class="mb-4">
                                        <div class="text-2xl font-bold ${isWinner ? 'text-green-400' : 'text-blue-400'}">${candidate.votes || 0}</div>
                                        <div class="text-sm text-gray-400">votes (${percentage}%)</div>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2">
                                        <div class="h-2 rounded-full transition-all duration-1000 ${isWinner ? 'bg-green-500' : 'bg-blue-500'}"
                                             style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderProjectResults(vote) {
        const sortedProjects = (vote.options || []).sort((a, b) => (b.votes || 0) - (a.votes || 0));
        const totalVotes = sortedProjects.reduce((sum, p) => sum + (p.votes || 0), 0);
        const fundedProjects = sortedProjects.slice(0, vote.max_selections || 3);

        return `
            <div class="mb-8">
                <h3 class="text-2xl font-semibold mb-6 border-l-4 border-blue-500 pl-4">Project Funding Results</h3>
                <div class="mb-6 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                    <div class="text-green-300 font-semibold mb-2">✅ Funded Projects (Top ${vote.max_selections || 3})</div>
                    <div class="text-sm text-gray-300">These projects will receive funding this semester</div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${sortedProjects.map((project, index) => {
            const percentage = totalVotes > 0 ? Math.round((project.votes / totalVotes) * 100) : 0;
            const isFunded = index < (vote.max_selections || 3);

            return `
                            <div class="glass-card p-6 ${isFunded ? 'border-2 border-green-500 bg-green-900/20' : 'opacity-75'}">
                                ${isFunded ? '<div class="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">FUNDED</div>' : ''}
                                <div class="flex justify-between items-start mb-4">
                                    <h4 class="text-xl font-semibold">${project.title}</h4>
                                    <div class="text-right">
                                        <div class="text-sm text-gray-400">Budget</div>
                                        <div class="font-bold ${isFunded ? 'text-green-400' : 'text-gray-400'}">${project.budget_requested}</div>
                                    </div>
                                </div>
                                <p class="text-gray-300 mb-4">${project.description}</p>
                                <div class="flex justify-between items-center mb-4">
                                    <div class="text-sm text-gray-400">
                                        <i class="fas fa-users mr-1"></i> ${project.team_lead}
                                    </div>
                                    <div class="text-right">
                                        <div class="text-xl font-bold ${isFunded ? 'text-green-400' : 'text-blue-400'}">${project.votes || 0}</div>
                                        <div class="text-sm text-gray-400">votes (${percentage}%)</div>
                                    </div>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-3">
                                    <div class="h-3 rounded-full transition-all duration-1000 ${isFunded ? 'bg-green-500' : 'bg-blue-500'}"
                                         style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    renderDecisionResults(vote) {
        // Get stable mock results based on vote ID
        const stableResults = this.getStableDecisionResults(vote.id);
        const { yesVotes, noVotes } = stableResults;
        const totalVotes = yesVotes + noVotes;
        const yesPercentage = Math.round((yesVotes / totalVotes) * 100);
        const noPercentage = 100 - yesPercentage;
        const passed = yesPercentage > 50;

        return `
            <div class="mb-8">
                <h3 class="text-2xl font-semibold mb-6 border-l-4 border-purple-500 pl-4">Decision Results</h3>
                <div class="mb-6 p-4 ${passed ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'} rounded-lg border">
                    <div class="flex items-center gap-2 ${passed ? 'text-green-300' : 'text-red-300'} font-semibold mb-2">
                        <i class="fas ${passed ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        <span>${passed ? 'AMENDMENT PASSED' : 'AMENDMENT REJECTED'}</span>
                    </div>
                    <div class="text-sm text-gray-300">
                        ${passed ? 'The proposed amendment has been approved and will take effect immediately.' : 'The proposed amendment did not receive sufficient support.'}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="glass-card p-8 text-center ${passed ? 'border-2 border-green-500' : ''}">
                        <div class="w-16 h-16 rounded-full bg-green-600 mx-auto mb-4 flex items-center justify-center text-2xl">
                            <i class="fas fa-check text-white"></i>
                        </div>
                        <h4 class="text-2xl font-bold text-green-400 mb-2">YES</h4>
                        <div class="text-3xl font-bold mb-2">${yesVotes}</div>
                        <div class="text-lg text-green-400 mb-4">${yesPercentage}%</div>
                        <div class="w-full bg-gray-700 rounded-full h-4">
                            <div class="bg-green-500 h-4 rounded-full transition-all duration-1000"
                                 style="width: ${yesPercentage}%"></div>
                        </div>
                    </div>

                    <div class="glass-card p-8 text-center ${!passed ? 'border-2 border-red-500' : ''}">
                        <div class="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 flex items-center justify-center text-2xl">
                            <i class="fas fa-times text-white"></i>
                        </div>
                        <h4 class="text-2xl font-bold text-red-400 mb-2">NO</h4>
                        <div class="text-3xl font-bold mb-2">${noVotes}</div>
                        <div class="text-lg text-red-400 mb-4">${noPercentage}%</div>
                        <div class="w-full bg-gray-700 rounded-full h-4">
                            <div class="bg-red-500 h-4 rounded-full transition-all duration-1000"
                                 style="width: ${noPercentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStableDecisionResults(voteId) {
        const storageKey = `decisionResults_${voteId}`;
        let results = localStorage.getItem(storageKey);

        if (!results) {
            // Generate stable results based on vote ID hash
            const hash = this.simpleHash(voteId);
            const yesVotes = 45 + (hash % 40); // 45-85 range
            const noVotes = 20 + ((hash * 7) % 30); // 20-50 range

            results = JSON.stringify({ yesVotes, noVotes });
            localStorage.setItem(storageKey, results);
        }

        return JSON.parse(results);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    renderCommitteeResults(vote) {
        const mockCandidates = vote.candidates || [];
        const selectedCount = vote.max_selections || 5;
        const sortedCandidates = mockCandidates.map(c => ({
            ...c,
            votes: Math.floor(Math.random() * 80) + 20
        })).sort((a, b) => b.votes - a.votes);

        const selectedMembers = sortedCandidates.slice(0, selectedCount);
        const totalVotes = sortedCandidates.reduce((sum, c) => sum + c.votes, 0);

        return `
            <div class="mb-8">
                <h3 class="text-2xl font-semibold mb-6 border-l-4 border-purple-500 pl-4">Committee Selection Results</h3>
                <div class="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                    <div class="text-purple-300 font-semibold mb-2">🎉 Selected Committee Members</div>
                    <div class="text-sm text-gray-300">${selectedCount} members selected for ${vote.committee_info?.name || 'the committee'}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${sortedCandidates.map((candidate, index) => {
            const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
            const isSelected = index < selectedCount;

            return `
                            <div class="glass-card p-6 text-center ${isSelected ? 'border-2 border-purple-500 bg-purple-900/20' : 'opacity-75'}">
                                ${isSelected ? '<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">SELECTED</div>' : ''}
                                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mx-auto mb-4 flex items-center justify-center text-xl relative">
                                    <i class="fas fa-user text-white"></i>
                                    ${isSelected ? '<div class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"><i class="fas fa-star text-xs"></i></div>' : ''}
                                </div>
                                <h5 class="font-bold text-lg mb-2">${candidate.name}</h5>
                                <p class="text-sm text-gray-400 mb-2">${candidate.course} - Year ${candidate.year}</p>
                                <p class="text-xs text-gray-500 mb-4">${candidate.experience}</p>
                                <div class="mb-4">
                                    <div class="text-xl font-bold ${isSelected ? 'text-purple-400' : 'text-blue-400'}">${candidate.votes}</div>
                                    <div class="text-sm text-gray-400">votes (${percentage}%)</div>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="h-2 rounded-full transition-all duration-1000 ${isSelected ? 'bg-purple-500' : 'bg-blue-500'}"
                                         style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    renderLeadershipVote(vote, container) {
        const timeRemaining = this.getTimeRemaining(vote.end_date);

        container.innerHTML = `
            <div class="glass-card p-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">${vote.title}</h2>
                        <p class="text-gray-300">${vote.description}</p>
                    </div>
                    ${vote.status === 'active' ? `
                        <div class="bg-indigo-900/40 p-4 rounded-xl border border-indigo-500/30 text-center min-w-[200px]">
                            <div class="text-sm text-indigo-300 mb-1">Time Remaining</div>
                            <div class="text-2xl font-mono font-bold text-yellow-400">${timeRemaining}</div>
                        </div>
                    ` : ''}
                </div>

                <div class="grid grid-cols-1 gap-12">
                    ${(vote.positions || []).map(pos => `
                        <div>
                            <h4 class="text-xl font-semibold mb-6 border-l-4 border-emerald-500 pl-4">${pos.position_name}</h4>
                            <div class="leadership-candidates-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                                ${(pos.candidates || []).map(candidate => `
                                    <div class="candidate-card p-6 text-center hover:bg-white/10 transition-all cursor-pointer"
                                         data-action="select-candidate" data-pos-id="${pos.id}" data-cand-id="${candidate.id}">
                                        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-2xl">
                                            <i class="fas fa-user text-white"></i>
                                        </div>
                                        <h5 class="font-bold text-lg mb-2">${candidate.name}</h5>
                                        <p class="text-sm text-gray-400 mb-4">${candidate.course} - Year ${candidate.year}</p>
                                        <button class="text-emerald-400 text-sm hover:underline mb-4"
                                                data-action="view-manifesto" data-id="${candidate.id}">
                                            <i class="fas fa-file-alt mr-1"></i> View Manifesto
                                        </button>
                                        <div class="selection-indicator hidden">
                                            <i class="fas fa-check-circle text-green-400 text-xl"></i>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${vote.status === 'active' ? `
                    <div class="mt-12 text-center">
                        <button id="finalSubmitBtn" class="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                            <i class="fas fa-vote-yea mr-2"></i> Submit Final Votes
                        </button>
                        <p class="text-gray-400 text-sm mt-4"><i class="fas fa-shield-alt mr-2"></i> Your vote is encrypted and anonymous</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProjectVoting(vote, container) {
        const timeRemaining = this.getTimeRemaining(vote.end_date);

        container.innerHTML = `
            <div class="glass-card p-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">${vote.title}</h2>
                        <p class="text-gray-300">${vote.description}</p>
                        <div class="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                            <i class="fas fa-info-circle text-blue-400 mr-2"></i>
                            <span class="text-blue-300">Select up to ${vote.max_selections || 3} projects to fund</span>
                        </div>
                    </div>
                    ${vote.status === 'active' ? `
                        <div class="bg-indigo-900/40 p-4 rounded-xl border border-indigo-500/30 text-center min-w-[200px]">
                            <div class="text-sm text-indigo-300 mb-1">Time Remaining</div>
                            <div class="text-2xl font-mono font-bold text-yellow-400">${timeRemaining}</div>
                        </div>
                    ` : ''}
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center max-w-4xl mx-auto">
                    ${(vote.options || []).map(option => `
                        <div class="project-option p-6 hover:bg-white/10 transition-all cursor-pointer"
                             data-action="select-project" data-option-id="${option.id}">
                            <div class="flex justify-between items-start mb-4">
                                <h4 class="text-xl font-semibold">${option.title}</h4>
                                <div class="text-right">
                                    <div class="text-sm text-gray-400">Budget</div>
                                    <div class="font-bold text-green-400">${option.budget_requested}</div>
                                </div>
                            </div>
                            <p class="text-gray-300 mb-4">${option.description}</p>
                            <div class="flex justify-between items-center">
                                <div class="text-sm text-gray-400">
                                    <i class="fas fa-users mr-1"></i> ${option.team_lead}
                                </div>
                                <div class="text-sm text-blue-400">
                                    <i class="fas fa-thumbs-up mr-1"></i> ${option.votes || 0} votes
                                </div>
                            </div>
                            <div class="selection-indicator hidden mt-4 text-center">
                                <i class="fas fa-check-circle text-green-400 text-xl"></i>
                                <span class="text-green-400 ml-2">Selected</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${vote.status === 'active' ? `
                    <div class="mt-12 text-center">
                        <div class="mb-4">
                            <span class="text-gray-400">Selected: </span>
                            <span id="selectedCount" class="font-bold">0</span>
                            <span class="text-gray-400"> / ${vote.max_selections || 3}</span>
                        </div>
                        <button id="finalSubmitBtn" class="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                            <i class="fas fa-vote-yea mr-2"></i> Submit Project Votes
                        </button>
                        <p class="text-gray-400 text-sm mt-4"><i class="fas fa-shield-alt mr-2"></i> Your vote is encrypted and anonymous</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderDecisionVoting(vote, container) {
        const timeRemaining = this.getTimeRemaining(vote.end_date);

        container.innerHTML = `
            <div class="glass-card decision-voting-card p-8 mb-8">
                <div class="detail-header">
                    <div class="detail-info">
                        <h2 class="detail-title">${vote.title || 'Untitled Decision'}</h2>
                        <p class="detail-desc">${vote.description || 'No description provided.'}</p>
                    </div>
                    ${vote.status === 'active' ? `
                        <div class="detail-timer">
                            <div class="timer-label">Time Remaining</div>
                            <div class="timer-value">${timeRemaining}</div>
                        </div>
                    ` : ''}
                </div>

                ${vote.proposal ? `
                    <div class="proposal-container">
                        <h3 class="proposal-title">${vote.proposal.title || 'Untitled Proposal'}</h3>
                        <div class="proposal-grid">
                            <div class="proposal-section current">
                                <h4 class="section-label red">Current Text</h4>
                                <p class="section-text">"${vote.proposal.current_text || 'N/A'}"</p>
                            </div>
                            <div class="proposal-section proposed">
                                <h4 class="section-label green">Proposed Text</h4>
                                <p class="section-text">"${vote.proposal.proposed_text || 'N/A'}"</p>
                            </div>
                        </div>
                        <div class="proposal-rationale">
                            <h4 class="rationale-label">Rationale</h4>
                            <p class="rationale-text">${vote.proposal.rationale || 'No rationale provided.'}</p>
                        </div>
                    </div>
                ` : ''}

                ${vote.status === 'active' ? `
                    <div class="decision-options-container">
                        <div class="decision-choice yes" data-action="select-decision" data-choice="yes">
                            <div class="choice-icon yes">
                                <i class="fas fa-check"></i>
                            </div>
                            <h4 class="choice-label yes">YES</h4>
                            <p class="choice-desc">Support the amendment</p>
                            <div class="selection-indicator hidden">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                        <div class="decision-choice no" data-action="select-decision" data-choice="no">
                            <div class="choice-icon no">
                                <i class="fas fa-times"></i>
                            </div>
                            <h4 class="choice-label no">NO</h4>
                            <p class="choice-desc">Reject the amendment</p>
                            <div class="selection-indicator hidden">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>

                    <div class="submission-footer">
                        <button id="finalSubmitBtn" class="submit-btn-glow">
                            <i class="fas fa-vote-yea mr-2"></i> Submit Decision Vote
                        </button>
                        <p class="secure-note"><i class="fas fa-shield-alt mr-2"></i> Your vote is encrypted and anonymous</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderCommitteeSelection(vote, container) {
        const timeRemaining = this.getTimeRemaining(vote.end_date);

        container.innerHTML = `
            <div class="glass-card committee-selection-card p-8 mb-8">
                <div class="detail-header">
                    <div class="detail-info">
                        <h2 class="detail-title">${vote.title || 'Committee Selection'}</h2>
                        <p class="detail-desc">${vote.description || 'No description provided.'}</p>
                        ${vote.committee_info ? `
                            <div class="committee-info-box">
                                <h4 class="committee-info-title">${vote.committee_info.name || 'Untitled Committee'}</h4>
                                <p class="committee-info-desc">${vote.committee_info.description || 'No description.'}</p>
                                <div class="committee-info-details">
                                    <span><i class="fas fa-clock"></i> ${vote.committee_info.commitment || 'TBD'}</span>
                                    <span><i class="fas fa-users"></i> ${vote.committee_info.positions_available || 0} positions</span>
                                </div>
                            </div>
                        ` : ''}
                        <div class="selection-limit-box">
                            <i class="fas fa-info-circle"></i>
                            <span>Select up to ${vote.max_selections || 5} candidates</span>
                        </div>
                    </div>
                    ${vote.status === 'active' ? `
                        <div class="detail-timer">
                            <div class="timer-label">Time Remaining</div>
                            <div class="timer-value">${timeRemaining}</div>
                        </div>
                    ` : ''}
                </div>

                <div class="committee-candidates-grid">
                    ${(vote.candidates || []).map(candidate => `
                        <div class="committee-candidate"
                             data-action="select-committee-member" data-cand-id="${candidate.id}"
                             onclick="this.classList.toggle('selected')">
                            <div class="candidate-avatar-circle">
                                <i class="fas fa-user"></i>
                            </div>
                            <h5 class="candidate-name-h5">${candidate.name || 'Anonymous'}</h5>
                            <p class="candidate-course-p">${candidate.course || 'Unknown Course'} - Year ${candidate.year || 'N/A'}</p>
                            <p class="candidate-experience-p">${candidate.experience || 'No experience listed.'}</p>
                            <div class="selection-indicator">
                                <i class="fas fa-check-circle"></i>
                                <span class="selection-indicator-text">Selected</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${vote.status === 'active' ? `
                    <div class="submission-footer mt-12">
                        <div class="selected-count-display">
                            <span>Selected: </span>
                            <span id="selectedCount" class="font-bold">0</span>
                            <span> / ${vote.max_selections || 5}</span>
                        </div>
                        <button id="finalSubmitBtn" class="submit-btn-glow">
                            <i class="fas fa-vote-yea mr-2"></i> Submit Committee Selections
                        </button>
                        <p class="secure-note"><i class="fas fa-shield-alt mr-2"></i> Your vote is encrypted and anonymous</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showListView() {
        this.state.view = 'list';
        this.state.currentVoteId = null;
        document.getElementById('votingListSection').classList.remove('hidden');
        document.getElementById('voteDetailSection').classList.add('hidden');
    }

    selectCandidate(posId, candId, element) {
        const normalizedPosId = this.normalizeId(posId);
        const normalizedCandId = this.normalizeId(candId);

        // Update state
        this.selections.leadership[normalizedPosId] = normalizedCandId;

        // Update UI - remove selection from other candidates in the SAME position
        element.parentElement.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
            const indicator = card.querySelector('.selection-indicator');
            if (indicator) indicator.classList.add('hidden');
        });

        // Add to this one
        element.classList.add('selected');
        const indicator = element.querySelector('.selection-indicator');
        if (indicator) indicator.classList.remove('hidden');
    }

    selectProject(optionId, element) {
        const normalizedOptionId = this.normalizeId(optionId);
        const normalizedVoteId = this.normalizeId(this.state.currentVoteId);
        const currentVote = this.votes.find(e => this.normalizeId(e.id) === normalizedVoteId);
        const maxSelections = currentVote?.max_selections || 3;

        if (this.selections.project.has(normalizedOptionId)) {
            // Deselect
            this.selections.project.delete(normalizedOptionId);
            element.classList.remove('selected');
            const indicator = element.querySelector('.selection-indicator');
            if (indicator) indicator.classList.add('hidden');
        } else if (this.selections.project.size < maxSelections) {
            // Select if under limit
            this.selections.project.add(normalizedOptionId);
            element.classList.add('selected');
            const indicator = element.querySelector('.selection-indicator');
            if (indicator) indicator.classList.remove('hidden');
        } else {
            // Show limit message
            this.showError(`You can only select up to ${maxSelections} projects.`);
            return;
        }

        // Update counter
        const counter = document.getElementById('selectedCount');
        if (counter) counter.textContent = this.selections.project.size;
    }

    selectDecision(choice, element) {
        this.selections.decision = choice;

        // Update UI - remove selection from other decision options
        document.querySelectorAll('.decision-option').forEach(option => {
            option.classList.remove('selected');
            const indicator = option.querySelector('.selection-indicator');
            if (indicator) indicator.classList.add('hidden');
        });

        // Add to this one
        element.classList.add('selected');
        const indicator = element.querySelector('.selection-indicator');
        if (indicator) indicator.classList.remove('hidden');
    }

    selectCommitteeMember(candId, element) {
        const normalizedCandId = this.normalizeId(candId);
        const normalizedVoteId = this.normalizeId(this.state.currentVoteId);
        const currentVote = this.votes.find(e => this.normalizeId(e.id) === normalizedVoteId);
        const maxSelections = currentVote?.max_selections || 5;

        if (this.selections.committee.has(normalizedCandId)) {
            // Deselect
            this.selections.committee.delete(normalizedCandId);
            element.classList.remove('selected');
            const indicator = element.querySelector('.selection-indicator');
            if (indicator) indicator.classList.add('hidden');
        } else if (this.selections.committee.size < maxSelections) {
            // Select if under limit
            this.selections.committee.add(normalizedCandId);
            element.classList.add('selected');
            const indicator = element.querySelector('.selection-indicator');
            if (indicator) indicator.classList.remove('hidden');
        } else {
            // Show limit message
            this.showError(`You can only select up to ${maxSelections} committee members.`);
            return;
        }

        // Update counter
        const counter = document.getElementById('selectedCount');
        if (counter) counter.textContent = this.selections.committee.size;
    }

    getCurrentVoteId() {
        // Helper method to get current vote ID from URL or state
        return this.currentVoteId || '1'; // Fallback
    }

    viewManifesto(candId) {
        // Find the candidate data
        let candidate = null;
        for (const vote of this.votes) {
            if (vote.positions) {
                for (const position of vote.positions) {
                    candidate = position.candidates?.find(c => c.id === candId);
                    if (candidate) break;
                }
            }
            if (candidate) break;
        }

        if (!candidate) {
            this.showError('Candidate manifesto not found');
            return;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h3 class="text-2xl font-bold mb-2">${candidate.name}</h3>
                        <p class="text-gray-400">${candidate.course} - Year ${candidate.year}</p>
                    </div>
                    <button class="text-gray-400 hover:text-white text-2xl" onclick="this.closest('.fixed').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="prose prose-invert max-w-none">
                    <h4 class="text-lg font-semibold mb-3 text-emerald-400">Manifesto</h4>
                    <p class="text-gray-300 leading-relaxed">${candidate.manifesto || 'No manifesto available for this candidate.'}</p>
                </div>
                <div class="mt-6 text-center">
                    <button class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors" 
                            onclick="this.closest('.fixed').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    submitVotes() {
        const normalizedVoteId = this.normalizeId(this.state.currentVoteId);
        const currentVote = this.votes.find(e => this.normalizeId(e.id) === normalizedVoteId);
        if (!currentVote) {
            this.showError('Vote not found');
            return;
        }

        let votes = {};
        let isValid = false;

        if (currentVote.type === 'leadership') {
            votes = { ...this.selections.leadership };
            isValid = Object.keys(votes).length > 0;
        } else if (currentVote.type === 'project') {
            votes.projects = Array.from(this.selections.project);
            isValid = votes.projects.length > 0;
        } else if (currentVote.type === 'decision') {
            votes.decision = this.selections.decision;
            isValid = votes.decision !== null;
        } else if (currentVote.type === 'committee') {
            votes.committee = Array.from(this.selections.committee);
            isValid = votes.committee.length > 0;
        }

        if (!isValid) {
            this.showError('Please make at least one selection before submitting.');
            return;
        }

        // Store pending submission to avoid JSON injection
        this.pendingVoteSubmission = {
            voteId: normalizedVoteId,
            votes: votes
        };

        // Enhanced confirmation with security info
        this.showVoteConfirmation(currentVote, votes);
    }

    showVoteConfirmation(vote, votes) {
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

        const confirmMessage = this.getConfirmationMessage(vote, votes);

        confirmationModal.innerHTML = `
            <div class="glass-card max-w-2xl w-full">
                <!-- Step Indicator -->
                <div class="flex items-center justify-center mb-6">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div class="w-12 h-1 bg-green-500"></div>
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div class="w-12 h-1 bg-green-500"></div>
                        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    </div>
                </div>
                
                <div class="text-center mb-6">
                    <i class="fas fa-shield-alt text-4xl text-green-400 mb-4"></i>
                    <h3 class="text-2xl font-bold mb-2">Step 2: Confirm Your Vote</h3>
                    <p class="text-gray-300">${vote.title}</p>
                </div>
                
                <div class="bg-blue-900/30 p-6 rounded-lg border border-blue-500/30 mb-6">
                    <h4 class="font-semibold text-blue-300 mb-4">Review Your Selections:</h4>
                    <div class="space-y-3">
                        ${this.getDetailedConfirmationMessage(vote, votes)}
                    </div>
                </div>
                
                <div class="bg-green-900/30 p-4 rounded-lg border border-green-500/30 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div class="flex items-center gap-2 text-green-300">
                            <i class="fas fa-lock"></i>
                            <span>Your vote is securely recorded</span>
                        </div>
                        <div class="flex items-center gap-2 text-green-300">
                            <i class="fas fa-fingerprint"></i>
                            <span>Session verified: ${this.sessionId.substr(-8)}</span>
                        </div>
                        <div class="flex items-center gap-2 text-green-300">
                            <i class="fas fa-clock"></i>
                            <span>Timestamp: ${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="flex items-center gap-2 text-green-300">
                            <i class="fas fa-shield-alt"></i>
                            <span>Vote receipt will be generated</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button class="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-colors" 
                            onclick="this.closest('.fixed').remove()">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Review
                    </button>
                    <button id="confirmSubmitBtn" class="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                        <i class="fas fa-vote-yea mr-2"></i>Submit Vote (Step 3)
                    </button>
                </div>
                
                <p class="text-xs text-gray-400 text-center mt-4">
                    ⚠️ This action cannot be undone. Your vote will be recorded immediately.
                </p>
            </div>
        `;

        document.body.appendChild(confirmationModal);

        // Close on backdrop click
        confirmationModal.addEventListener('click', (e) => {
            if (e.target === confirmationModal) {
                confirmationModal.remove();
            }
        });
    }

    getDetailedConfirmationMessage(vote, votes) {
        let details = [];

        if (vote.type === 'leadership' && votes.leadership) {
            Object.entries(votes.leadership).forEach(([posId, candId]) => {
                const position = vote.positions?.find(p => p.id === posId);
                const candidate = position?.candidates?.find(c => c.id === candId);
                if (position && candidate) {
                    details.push(`
                        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <div>
                                <div class="font-medium">${position.position_name}</div>
                                <div class="text-sm text-gray-400">${candidate.name} - ${candidate.course}</div>
                            </div>
                            <i class="fas fa-check text-green-400"></i>
                        </div>
                    `);
                }
            });
        } else if (vote.type === 'project' && votes.projects) {
            votes.projects.forEach(projectId => {
                const project = vote.options?.find(p => p.id === projectId);
                if (project) {
                    details.push(`
                        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <div>
                                <div class="font-medium">${project.title}</div>
                                <div class="text-sm text-gray-400">${project.budget_requested} - ${project.team_lead}</div>
                            </div>
                            <i class="fas fa-check text-green-400"></i>
                        </div>
                    `);
                }
            });
        } else if (vote.type === 'decision' && votes.decision) {
            details.push(`
                <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                        <div class="font-medium">Your Decision</div>
                        <div class="text-sm text-gray-400">${vote.proposal?.title || 'Club Decision'}</div>
                    </div>
                    <div class="text-xl font-bold ${votes.decision === 'yes' ? 'text-green-400' : 'text-red-400'}">
                        ${votes.decision.toUpperCase()}
                    </div>
                </div>
            `);
        } else if (vote.type === 'committee' && votes.committee) {
            votes.committee.forEach(candId => {
                const candidate = vote.candidates?.find(c => c.id === candId);
                if (candidate) {
                    details.push(`
                        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <div>
                                <div class="font-medium">${candidate.name}</div>
                                <div class="text-sm text-gray-400">${candidate.course} - ${candidate.experience}</div>
                            </div>
                            <i class="fas fa-check text-green-400"></i>
                        </div>
                    `);
                }
            });
        }

        return details.join('');
    }

    confirmSubmitVotes() {
        if (!this.pendingVoteSubmission) {
            this.showError('No pending vote submission found');
            return;
        }

        const { voteId, votes } = this.pendingVoteSubmission;

        // Create vote submission payload with security data
        const submission = {
            voteId: voteId,
            votes: votes,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            integrityHash: this.voteIntegrityHash,
            browserFingerprint: this.browserFingerprint
        };

        // Submit votes (would normally go to API)
        console.log('Submitting secure vote:', submission);

        // Simulate API call with loading state
        this.showVoteSubmissionProgress();

        setTimeout(() => {
            const currentVote = this.votes.find(e => this.normalizeId(e.id) === this.normalizeId(voteId));
            this.showSuccess(`Thank you! Your ${currentVote.type} vote has been cast successfully.`);

            // Update local vote count (in real app, this would come from server)
            currentVote.votes_cast = (currentVote.votes_cast || 0) + 1;
            this.updateStats();

            // Store vote in user history
            this.storeUserVote(voteId);

            // Clear pending submission
            this.pendingVoteSubmission = null;

            // Return to list view
            setTimeout(() => {
                this.showListView();
            }, 2000);
        }, 1500);
    }

    storeUserVote(voteId) {
        const userVotes = this.getUserVotingHistory();
        userVotes.push({
            voteId: this.normalizeId(voteId),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('userVotingHistory', JSON.stringify(userVotes));
    }

    showVoteSubmissionProgress() {
        const progressModal = document.createElement('div');
        progressModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        progressModal.innerHTML = `
            <div class="glass-card p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                <h3 class="text-xl font-semibold mb-2">Submitting Your Vote</h3>
                <p class="text-gray-300">Please wait while we securely process your vote...</p>
                <div class="mt-4 flex items-center justify-center gap-2 text-sm text-green-400">
                    <i class="fas fa-shield-alt"></i>
                    <span>Encrypting and verifying</span>
                </div>
            </div>
        `;

        document.body.appendChild(progressModal);

        setTimeout(() => {
            progressModal.remove();
        }, 1500);
    }

    getConfirmationMessage(vote, votes) {
        let message = `Are you sure you want to submit your vote for "${vote.title}"?\n\n`;

        if (vote.type === 'leadership') {
            const positions = Object.keys(votes).length;
            message += `You have voted for ${positions} position(s).`;
        } else if (vote.type === 'project') {
            message += `You have selected ${votes.projects.length} project(s) for funding.`;
        } else if (vote.type === 'decision') {
            message += `You have voted: ${votes.decision.toUpperCase()}`;
        } else if (vote.type === 'committee') {
            message += `You have selected ${votes.committee.length} committee member(s).`;
        }

        message += '\n\nThis action cannot be undone.';
        return message;
    }

    showSuccess(message) {
        // Create a success notification - SECURITY FIX: Safe DOM manipulation
        const notification = document.createElement('div');
        notification.className = 'notification success';

        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle mr-2';
        const textNode = document.createTextNode(message);

        notification.appendChild(icon);
        notification.appendChild(textNode);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(msg) {
        // Create an error notification - SECURITY FIX: Safe DOM manipulation
        const notification = document.createElement('div');
        notification.className = 'notification error';

        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle mr-2';
        const textNode = document.createTextNode(msg);

        notification.appendChild(icon);
        notification.appendChild(textNode);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Cleanup method
    destroy() {
        // Clear all intervals
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }

        // Remove event listeners
        window.removeEventListener('orientationchange', this.optimizeMobileLayout);

        console.log('🗳️ Voting Portal cleaned up');
    }
}

window.VotingPortal = VotingPortal;

// Autonomous initialization with mock data check
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Initializing Voting Portal');

    // Immediate test - try to clear loading state
    const grid = document.getElementById('votingGrid');
    if (grid) {
        console.log('🧪 Testing immediate grid access...');
        console.log('🧪 Grid innerHTML length:', grid.innerHTML.length);
        console.log('🧪 Has loading-state:', !!grid.querySelector('.loading-state'));

        // Immediately replace loading with a simple message
        if (grid.querySelector('.loading-state')) {
            console.log('🧹 Immediately clearing loading skeletons...');
            grid.innerHTML = '<div style="text-align: center; padding: 2rem; color: white;"><h3>🗳️ Loading voting portal...</h3><p>Please wait while we load the voting options.</p></div>';
        }
    }

    // Check if mock data is available
    if (!window.mockVotes) {
        console.warn('⚠️ Mock data not available yet, waiting...');
        // Wait a bit for mock data to load
        setTimeout(() => {
            console.log('🔍 Checking mock data again:', !!window.mockVotes);
            if (window.mockVotes) {
                console.log('✅ Mock data found, initializing portal');
                initializePortal();
            } else {
                console.error('❌ Mock data still not available, initializing anyway');
                initializePortal();
            }
        }, 100);
    } else {
        console.log('✅ Mock data available immediately');
        initializePortal();
    }
});

function initializePortal() {
    if (typeof window.Navigation === 'function' && !window.navInstance) {
        window.navInstance = new Navigation();
    }
    console.log('🗳️ Creating VotingPortal instance...');

    // Ensure mock data is available before creating portal
    if (!window.mockVotes || window.mockVotes.length === 0) {
        console.log('🔧 Mock data not available, creating inline fallback...');
        window.mockVotes = [
            {
                id: '1',
                title: 'Executive Committee Elections 2026',
                description: 'Annual elections for the leadership positions of the Innovation Club.',
                type: 'leadership',
                status: 'active',
                start_date: '2026-01-27T00:00:00Z',
                end_date: '2026-02-10T23:59:59Z',
                total_voters: 150,
                votes_cast: 89,
                positions: [
                    {
                        id: 'p1',
                        position_name: 'Club President',
                        candidates: [
                            {
                                id: 'c1',
                                name: 'John Doe',
                                course: 'Computer Science',
                                year: 3,
                                manifesto: 'Innovation for all members. I will focus on increasing industry partnerships.',
                                votes: 45
                            },
                            {
                                id: 'c2',
                                name: 'Jane Smith',
                                course: 'Mechatronics',
                                year: 4,
                                manifesto: 'Engineering a better future through collaborative innovation.',
                                votes: 32
                            }
                        ]
                    },
                    {
                        id: 'p2',
                        position_name: 'Secretary General',
                        candidates: [
                            {
                                id: 'c3',
                                name: 'James Kariuki',
                                course: 'Business IT',
                                year: 2,
                                manifesto: 'Transparency and efficiency in all club operations.',
                                votes: 38
                            },
                            {
                                id: 'c4',
                                name: 'Mary Atieno',
                                course: 'Software Engineering',
                                year: 3,
                                manifesto: 'Inclusive communication and digital transformation.',
                                votes: 41
                            }
                        ]
                    }
                ]
            },
            {
                id: '2',
                title: 'Project Funding Priority Vote',
                description: 'Vote on which projects should receive priority funding this semester.',
                type: 'project',
                status: 'active',
                start_date: '2026-01-28T00:00:00Z',
                end_date: '2026-02-05T23:59:59Z',
                total_voters: 150,
                votes_cast: 23,
                voting_type: 'multiple_choice',
                max_selections: 3,
                options: [
                    {
                        id: 'proj1',
                        title: 'AI-Powered Campus Assistant',
                        description: 'Develop an AI chatbot to help students navigate campus services.',
                        budget_requested: 'KSh 50,000',
                        team_lead: 'Tech Team Alpha',
                        votes: 15
                    },
                    {
                        id: 'proj2',
                        title: 'Smart Irrigation System',
                        description: 'IoT-based irrigation system for the university farm.',
                        budget_requested: 'KSh 75,000',
                        team_lead: 'AgriTech Squad',
                        votes: 12
                    },
                    {
                        id: 'proj3',
                        title: 'Student Marketplace App',
                        description: 'Mobile app for students to buy, sell, and exchange items.',
                        budget_requested: 'KSh 40,000',
                        team_lead: 'Mobile Dev Team',
                        votes: 18
                    }
                ]
            }
        ];
        console.log('✅ Inline fallback data created:', window.mockVotes.length, 'votes');
    }

    window.portalInstance = new VotingPortal();

    // Emergency fallback - if still showing loading after 2 seconds, force render
    setTimeout(() => {
        const grid = document.getElementById('votingGrid');
        if (grid && (grid.querySelector('.loading-state') || grid.innerHTML.includes('Loading voting portal'))) {
            console.log('🚨 Emergency fallback - forcing content render');

            // Clear any loading content
            grid.innerHTML = '';

            // Force the portal to render if it exists
            if (window.portalInstance && window.portalInstance.votes && window.portalInstance.votes.length > 0) {
                console.log('🔄 Using portal instance to render votes');
                window.portalInstance.renderVotes(window.portalInstance.votes);
            } else if (window.mockVotes && window.mockVotes.length > 0) {
                console.log('🔄 Using mock data to render votes');
                if (window.portalInstance) {
                    window.portalInstance.votes = window.mockVotes;
                    window.portalInstance.renderVotes(window.mockVotes);
                } else {
                    // Create a minimal render without the full portal
                    renderEmergencyVotes(window.mockVotes);
                }
            } else {
                // Last resort - show a simple message
                grid.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: white;">
                        <i class="fas fa-vote-yea" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Voting Portal</h3>
                        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1.5rem;">The voting system is loading. Please refresh the page if this message persists.</p>
                        <button onclick="window.location.reload()" style="background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer;">
                            <i class="fas fa-refresh" style="margin-right: 0.5rem;"></i>Refresh Page
                        </button>
                    </div>
                `;
            }
        }
    }, 2000);
}

function renderEmergencyVotes(votes) {
    const grid = document.getElementById('votingGrid');
    if (!grid || !votes || votes.length === 0) return;

    console.log('🚨 Emergency render with', votes.length, 'votes');

    const cardsHTML = votes.map(vote => {
        const timeRemaining = getTimeRemaining(vote.end_date);
        const progressPercent = vote.total_voters > 0 ?
            Math.round((vote.votes_cast / vote.total_voters) * 100) : 0;

        return `
            <div class="vote-card" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; padding: 2rem; text-align: center; max-width: 400px; margin: 0 auto 2rem auto;">
                <div style="margin-bottom: 1rem;">
                    <i class="fas ${vote.type === 'leadership' ? 'fa-crown' : vote.type === 'project' ? 'fa-lightbulb' : 'fa-vote-yea'}" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
                </div>
                <h3 style="color: white; font-size: 1.25rem; margin-bottom: 1rem;">${vote.title}</h3>
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1.5rem; font-size: 0.875rem;">${vote.description}</p>
                <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: rgba(255, 255, 255, 0.7);">Turnout</span>
                        <span style="color: white; font-weight: bold;">${vote.votes_cast}/${vote.total_voters}</span>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 0.5rem; height: 6px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #10b981, #3b82f6); height: 6px; width: ${progressPercent}%; border-radius: 0.5rem;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span style="color: rgba(255, 255, 255, 0.6);">${progressPercent}%</span>
                        <span style="color: #10b981; font-size: 0.75rem;">● ${vote.status}</span>
                    </div>
                </div>
                <button style="background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 0.75rem; padding: 0.75rem 1.5rem; color: white; font-weight: 600; cursor: pointer; width: 100%;" onclick="alert('Please refresh the page to access full voting functionality')">
                    🗳️ ${vote.status === 'active' ? 'Vote Now' : vote.status === 'upcoming' ? 'Coming Soon' : 'View Results'}
                </button>
            </div>
        `;
    }).join('');

    grid.innerHTML = cardsHTML;
}

function getTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
}
