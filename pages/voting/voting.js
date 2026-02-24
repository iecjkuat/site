/**
 * JKUAT Innovation Club - Voting Portal
 */

class VotingPortal {
    constructor() {
        this.elections = [];
        this.currentElection = null;
        this.apiBase = '/api/v1';
        this.isSubmitting = false;
        this.isOnline = navigator.onLine;
        this.cachedElections = null;
        this.timers = {
            countdown: null,
            refresh: null
        };
        this.init();
    }

    async init() {
        console.log('🗳️ Initializing Voting Portal...');
        
        // Setup network listeners
        this.setupNetworkListeners();
        
        this.bindEvents();
        await this.loadElections();
        this.updateStats();
        
        // Start live countdown timer (updates every second)
        this.startCountdownTimer();
        
        // Refresh election data every 30 seconds to get live vote counts
        this.startAutoRefresh();
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('You are back online!', 'success');
            this.loadElections();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('You are offline. Using cached data.', 'warning');
            if (this.cachedElections) {
                this.renderElections(this.cachedElections);
            }
        });
    }

    startCountdownTimer() {
        // Clear existing timer if any
        if (this.timers.countdown) {
            clearInterval(this.timers.countdown);
        }
        
        // Update countdown every second
        this.timers.countdown = setInterval(() => {
            document.querySelectorAll('[data-end-date]').forEach(element => {
                const endDate = element.dataset.endDate;
                const timeRemaining = this.getTimeRemaining(endDate);
                element.textContent = timeRemaining;
            });
        }, 1000);
    }

    startAutoRefresh() {
        // Clear existing timer if any
        if (this.timers.refresh) {
            clearInterval(this.timers.refresh);
        }
        
        // Refresh election data every 30 seconds (silently in background)
        this.timers.refresh = setInterval(() => {
            (async () => {
                try {
                    console.log('🔄 Auto-refreshing election data (background)...');
                    await this.refreshElectionsQuietly();
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                }
            })();
        }, 30000);
    }

    destroy() {
        // Clean up timers to prevent memory leaks
        if (this.timers.countdown) {
            clearInterval(this.timers.countdown);
            this.timers.countdown = null;
        }
        if (this.timers.refresh) {
            clearInterval(this.timers.refresh);
            this.timers.refresh = null;
        }
        
        // Remove network listeners
        window.removeEventListener('online', this.setupNetworkListeners);
        window.removeEventListener('offline', this.setupNetworkListeners);
        
        console.log('🧹 VotingPortal cleaned up');
    }

    async fetchWithTimeout(url, options = {}, timeout = 8000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your connection');
            }
            throw error;
        }
    }

    async getValidToken() {
        let token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (!token) return null;
        
        // Check if token is expired (simple JWT decode)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.warn('⚠️ Token expired');
                // Clear expired token
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                return null;
            }
        } catch (e) {
            console.error('Token validation failed:', e);
            return null;
        }
        
        return token;
    }

    sanitizeInput(input) {
        // Sanitize user input to prevent XSS
        return String(input || '')
            .replace(/[<>&'"]/g, '')
            .trim();
    }

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterElections(btn.dataset.filter);
            });
        });

        // Back button
        document.getElementById('backToList')?.addEventListener('click', () => {
            this.showListView();
        });

        // Search
        document.getElementById('voteSearch')?.addEventListener('input', (e) => {
            this.searchElections(e.target.value);
        });

        // Sort
        document.getElementById('voteSort')?.addEventListener('change', (e) => {
            this.sortElections(e.target.value);
        });
    }

    async loadElections(retryCount = 0, maxRetries = 3) {
        try {
            console.log('📡 Fetching elections from:', `${this.apiBase}/voting`);
            
            // Show loading state
            const grid = document.getElementById('votingGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading elections...</p>
                    </div>
                `;
            }
            
            // Check online status
            if (!this.isOnline) {
                const cached = localStorage.getItem('cachedElections');
                if (cached) {
                    const cachedData = JSON.parse(cached);
                    this.elections = cachedData;
                    this.renderElections(this.elections);
                    this.updateStats();
                    this.showNotification('Showing cached data', 'info');
                    return;
                }
                throw new Error('You are offline');
            }
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Received data:', data);
                this.elections = data.elections || [];
                
                // Cache for offline use
                this.cachedElections = this.elections;
                localStorage.setItem('cachedElections', JSON.stringify(this.elections));
                
                console.log('📊 Elections loaded:', this.elections.length);
                this.renderElections(this.elections);
                this.updateStats();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('❌ API error:', response.status, errorData);
                throw new Error(errorData.hint || errorData.error || `API returned ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Error loading elections (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            if (retryCount < maxRetries) {
                // Exponential backoff
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`⏳ Retrying in ${delay}ms...`);
                
                setTimeout(() => {
                    this.loadElections(retryCount + 1, maxRetries);
                }, delay);
            } else {
                // Try to load from cache on error
                const cached = localStorage.getItem('cachedElections');
                if (cached) {
                    this.elections = JSON.parse(cached);
                    this.renderElections(this.elections);
                    this.updateStats();
                    this.showNotification('Showing cached data', 'info');
                    return;
                }
                
                // Show error state with retry button
                const grid = document.getElementById('votingGrid');
                if (grid) {
                    grid.innerHTML = `
                        <div class="no-votes-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Connection Error</h3>
                            <p>${error.message || 'Unable to connect to the server'}</p>
                            <button class="btn-primary" onclick="window.votingPortal.loadElections(0, 3)">
                                <i class="fas fa-redo"></i> Retry
                            </button>
                        </div>
                    `;
                }
            }
        }
    }

    async refreshElectionsQuietly() {
        try {
            // Fetch fresh data without showing loading state
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, 5000); // Shorter timeout for background refresh
            
            if (!response.ok) {
                console.warn('⚠️ Background refresh failed:', response.status);
                return;
            }
            
            const data = await response.json();
            const newElections = data.elections || [];
            
            console.log('✅ Background refresh successful:', newElections.length, 'elections');
            
            // Check if there are new elections or updates
            const hasChanges = this.detectElectionChanges(this.elections, newElections);
            
            if (hasChanges) {
                console.log('📊 Changes detected, updating display...');
                this.elections = newElections;
                
                // Cache updated data
                this.cachedElections = this.elections;
                localStorage.setItem('cachedElections', JSON.stringify(this.elections));
                
                // Update only the stats on existing cards (no full re-render)
                this.updateElectionCardsQuietly(newElections);
            } else {
                console.log('✅ No changes detected');
            }
        } catch (error) {
            console.warn('⚠️ Background refresh failed:', error.message);
            // Fail silently - don't disrupt user experience
        }
    }

    detectElectionChanges(oldElections, newElections) {
        // Check if election count changed
        if (oldElections.length !== newElections.length) {
            return true;
        }
        
        // Check if any vote counts or stats changed
        for (let i = 0; i < newElections.length; i++) {
            const oldElection = oldElections.find(e => e.id === newElections[i].id);
            if (!oldElection) {
                return true; // New election added
            }
            
            // Check if vote counts changed
            if (oldElection.votes_cast !== newElections[i].votes_cast ||
                oldElection.total_voters !== newElections[i].total_voters ||
                oldElection.status !== newElections[i].status) {
                return true;
            }
        }
        
        return false;
    }

    updateElectionCardsQuietly(newElections) {
        newElections.forEach(election => {
            const card = document.querySelector(`[data-election-id="${election.id}"]`);
            if (!card) {
                // New election - need full re-render
                console.log('🆕 New election detected, full re-render needed');
                this.renderElections(newElections);
                return;
            }
            
            // Update vote count
            const voteCountElement = card.querySelector('.election-votes');
            if (voteCountElement) {
                const progress = election.total_voters > 0 
                    ? Math.round((election.votes_cast / election.total_voters) * 100) 
                    : 0;
                
                voteCountElement.textContent = `${election.votes_cast || 0} / ${election.total_voters || 0} votes`;
                
                // Update progress bar
                const progressBar = card.querySelector('.progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                // Update turnout percentage
                const progressText = card.querySelector('.progress-text');
                if (progressText) {
                    progressText.textContent = `${progress}% turnout`;
                }
            }
            
            // Update status badge if status changed
            const statusBadge = card.querySelector('.election-status-badge');
            if (statusBadge) {
                const status = this.getElectionStatus(election);
                statusBadge.className = `election-status-badge ${status.class}`;
                statusBadge.innerHTML = `<i class="fas fa-${status.icon}"></i> ${status.text}`;
            }
        });
        
        console.log('✅ Cards updated quietly');
    }

    renderElections(elections) {
        const grid = document.getElementById('votingGrid');
        if (!grid) {
            console.error('❌ votingGrid element not found');
            return;
        }

        console.log('🎨 Rendering elections:', elections.length);
        
        // Log first election stats for debugging
        if (elections.length > 0) {
            console.log('📊 First election stats:', {
                title: elections[0].title,
                votes_cast: elections[0].votes_cast,
                total_voters: elections[0].total_voters,
                end_date: elections[0].end_date
            });
        }

        if (elections.length === 0) {
            grid.innerHTML = `
                <div class="no-votes-message">
                    <i class="fas fa-vote-yea no-votes-icon"></i>
                    <h3 class="no-votes-title">No Elections Available</h3>
                    <p class="no-votes-text">Check back later for upcoming elections</p>
                </div>
            `;
            return;
        }

        // Use event delegation instead of individual listeners
        if (!grid.dataset.delegationAttached) {
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('[data-election-id]');
                if (card) {
                    this.viewElection(card.dataset.electionId);
                }
            });
            grid.dataset.delegationAttached = 'true';
        }

        // Use DocumentFragment for batch DOM updates
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        
        elections.forEach(election => {
            tempDiv.innerHTML = this.createElectionCard(election);
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
        });
        
        grid.innerHTML = '';
        grid.appendChild(fragment);
        
        console.log('✅ Elections rendered successfully');
    }

    createElectionCard(election) {
        const status = this.getElectionStatus(election);
        const progress = election.total_voters > 0 
            ? Math.round((election.votes_cast / election.total_voters) * 100) 
            : 0;
        
        const timeRemaining = this.getTimeRemaining(election.end_date);

        return `
            <div class="election-card glass-card" data-election-id="${election.id}">
                <div class="election-card-header">
                    <span class="election-type-badge ${election.election_type}">
                        <i class="fas fa-${this.getTypeIcon(election.election_type)}"></i>
                        ${election.election_type}
                    </span>
                    <span class="election-status-badge ${status.class}">
                        ${status.text}
                    </span>
                </div>
                
                <h3 class="election-title">${election.title}</h3>
                <p class="election-description">${election.description || ''}</p>
                
                <div class="election-stats">
                    <div class="stat-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div class="stat-content">
                            <span class="stat-label">Duration</span>
                            <span class="stat-value">${this.formatDateRange(election.start_date, election.end_date)}</span>
                        </div>
                    </div>
                    
                    ${status.canVote ? `
                        <div class="stat-item urgent">
                            <i class="fas fa-clock"></i>
                            <div class="stat-content">
                                <span class="stat-label">Time Remaining</span>
                                <span class="stat-value" data-end-date="${election.end_date}">${timeRemaining}</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <div class="stat-content">
                            <span class="stat-label">Participation</span>
                            <span class="stat-value">${election.votes_cast || 0} / ${election.total_voters || 0} votes</span>
                        </div>
                    </div>
                </div>
                
                <div class="election-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar ${status.class}" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}% turnout</span>
                </div>
                
                ${status.canVote ? `
                    <button class="btn-vote-now">
                        <i class="fas fa-vote-yea"></i>
                        Vote Now
                    </button>
                ` : status.text === 'Completed' ? `
                    <button class="btn-view-results">
                        <i class="fas fa-chart-bar"></i>
                        View Results
                    </button>
                ` : `
                    <button class="btn-view-details" disabled>
                        <i class="fas fa-info-circle"></i>
                        ${status.text}
                    </button>
                `}
            </div>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            'general': 'vote-yea',
            'leadership': 'users-cog',
            'special': 'star',
            'referendum': 'balance-scale'
        };
        return icons[type] || 'vote-yea';
    }

    getTimeRemaining(endDate) {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    }

    formatDateRange(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options = { month: 'short', day: 'numeric' };
        
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }

    getElectionStatus(election) {
        const now = new Date();
        const start = new Date(election.start_date);
        const end = new Date(election.end_date);

        if (election.status === 'active' && now >= start && now <= end) {
            return { text: 'Active', class: 'active', canVote: true };
        } else if (now < start) {
            return { text: 'Upcoming', class: 'upcoming', canVote: false };
        } else if (election.status === 'completed' || now > end) {
            return { text: 'Completed', class: 'completed', canVote: false };
        } else {
            return { text: 'Draft', class: 'draft', canVote: false };
        }
    }

    async viewElection(electionId) {
        try {
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting/${electionId}`);
            if (!response.ok) throw new Error('Failed to load election');
            
            const election = await response.json();
            
            // Validate election data
            if (!election || !election.id) {
                throw new Error('Invalid election data received');
            }
            
            this.currentElection = election;
            
            // Check if we should show results or ballot
            const status = this.getElectionStatus(election);
            if (status.text === 'Completed') {
                this.showElectionResults(election);
            } else {
                this.showElectionDetail(election);
            }
        } catch (error) {
            console.error('Error loading election:', error);
            this.showError(error.message || 'Failed to load election details');
        }
    }

    async showElectionResults(election) {
        const detailSection = document.getElementById('voteDetailSection');
        const listSection = document.getElementById('votingListSection');
        const content = document.getElementById('voteDetailContent');

        if (!detailSection || !listSection || !content) return;

        listSection.classList.add('hidden');
        detailSection.classList.remove('hidden');

        // Show loading state
        content.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading results...</p>
            </div>
        `;

        try {
            console.log('📊 Fetching results for election:', election.id);
            
            // Fetch results from API
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting/${election.id}/results`);
            
            console.log('📡 Results response status:', response.status);
            
            if (!response.ok) {
                let errorData = {};
                const responseText = await response.text();
                console.error('❌ Results API error response text:', responseText);
                
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    console.error('❌ Could not parse error response as JSON');
                    errorData = { error: responseText || 'Unknown error' };
                }
                
                console.error('❌ Results API error:', response.status, errorData);
                
                if (response.status === 403) {
                    throw new Error(errorData.error || 'Results are not yet available for this election');
                } else if (response.status === 404) {
                    throw new Error('Election not found');
                } else if (response.status === 500) {
                    throw new Error(errorData.error || 'Server error while loading results. Please check server logs.');
                } else {
                    throw new Error(errorData.error || `Failed to load results (Status: ${response.status})`);
                }
            }

            const results = await response.json();
            console.log('📊 Results received:', results);
            
            if (!Array.isArray(results) || results.length === 0) {
                throw new Error('No results data available for this election');
            }
            
            // Group results by position
            const resultsByPosition = {};
            results.forEach(result => {
                if (!resultsByPosition[result.position_id]) {
                    resultsByPosition[result.position_id] = {
                        title: result.position_title,
                        candidates: []
                    };
                }
                resultsByPosition[result.position_id].candidates.push(result);
            });

            console.log('📊 Grouped results:', resultsByPosition);

            // Render results
            content.innerHTML = `
                <div class="results-container">
                    <div class="results-header">
                        <h1 class="results-title">
                            <i class="fas fa-chart-bar"></i>
                            ${election.title} - Results
                        </h1>
                        <p class="results-subtitle">
                            ${election.anonymous_voting ? 'Anonymous Voting' : 'Public Voting'} • 
                            Ended ${this.formatDate(election.end_date)}
                        </p>
                    </div>

                    <div class="results-positions">
                        ${Object.entries(resultsByPosition).map(([positionId, position], index) => 
                            this.renderPositionResults(position, index + 1)
                        ).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Error loading results:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                electionId: election.id
            });
            
            content.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to Load Results</h3>
                    <p>${error.message || 'An unexpected error occurred'}</p>
                    <button class="btn-primary" onclick="window.votingPortal.showListView()">
                        <i class="fas fa-arrow-left"></i> Back to Elections
                    </button>
                </div>
            `;
        }
    }

    renderPositionResults(position, positionNumber) {
        const totalVotes = position.candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);
        const winner = position.candidates[0]; // First candidate has most votes (sorted by backend)

        return `
            <div class="position-results">
                <div class="position-results-header">
                    <div class="position-number">${positionNumber}</div>
                    <div>
                        <h2 class="position-title">${position.title}</h2>
                        <p class="position-stats">${totalVotes} total votes</p>
                    </div>
                </div>

                <div class="candidates-results">
                    ${position.candidates.map((candidate, index) => `
                        <div class="candidate-result ${index === 0 ? 'winner' : ''}">
                            <div class="candidate-result-info">
                                <div class="candidate-rank">${index + 1}</div>
                                <div class="candidate-details">
                                    <h3 class="candidate-name">
                                        ${candidate.candidate_name}
                                        ${index === 0 ? '<i class="fas fa-crown winner-icon"></i>' : ''}
                                    </h3>
                                    <p class="candidate-votes">${candidate.vote_count || 0} votes (${candidate.vote_percentage || 0}%)</p>
                                </div>
                            </div>
                            <div class="candidate-result-bar">
                                <div class="result-bar-fill ${index === 0 ? 'winner' : ''}" 
                                     style="width: ${candidate.vote_percentage || 0}%">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showElectionDetail(election) {
        const detailSection = document.getElementById('voteDetailSection');
        const listSection = document.getElementById('votingListSection');
        const content = document.getElementById('voteDetailContent');

        if (!detailSection || !listSection || !content) return;

        // Validate election data
        if (!election) {
            this.showError('Election data is missing');
            return;
        }

        // Validate positions array
        if (!Array.isArray(election.positions)) {
            console.error('Election has no positions:', election);
            content.innerHTML = '<p class="error">This election has no positions configured</p>';
            return;
        }

        listSection.classList.add('hidden');
        detailSection.classList.remove('hidden');

        const status = this.getElectionStatus(election);

        // Filter out invalid positions
        const validPositions = election.positions.filter(pos => pos && pos.id && pos.title);

        content.innerHTML = `
            <div class="ballot-container">
                <!-- Positions and Candidates -->
                <div class="positions-container">
                    ${validPositions.map((pos, index) => this.renderPosition(pos, election, index + 1)).join('') || '<p class="no-data">No positions available</p>'}
                </div>

                <!-- Submit Section -->
                ${status.canVote ? `
                    <div class="ballot-footer">
                        <div class="selection-summary glass-card">
                            <i class="fas fa-check-circle"></i>
                            <span id="selectionCount">0 of ${validPositions.length} positions selected</span>
                        </div>
                        <button id="submitVoteBtn" class="btn-submit-vote" disabled>
                            <i class="fas fa-paper-plane"></i>
                            Submit My Vote
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        // Bind candidate selection
        this.bindCandidateSelection(election);

        // Bind submit button
        document.getElementById('submitVoteBtn')?.addEventListener('click', () => {
            this.confirmAndSubmitVote(election.id);
        });
    }

    renderPosition(position, election, positionNumber) {
        return `
            <div class="position-section">
                <div class="position-header">
                    <div class="position-number">${positionNumber}</div>
                    <div class="position-info">
                        <h2 class="position-title">${position.title}</h2>
                        <p class="position-description">${position.description || 'Select one candidate'}</p>
                    </div>
                </div>

                <div class="candidates-grid">
                    ${position.candidates?.map(candidate => this.renderCandidate(candidate, position)).join('') || '<p class="no-candidates">No candidates available</p>'}
                </div>
            </div>
        `;
    }

    renderCandidate(candidate, position) {
        const mediaType = candidate.media_type || 'text';
        
        console.log('🎨 Rendering candidate:', candidate.name, 'Type:', mediaType, 'URL:', candidate.media_url);
        
        // Render based on media type
        let mediaContent = '';
        
        if (mediaType === 'profile' && (candidate.media_url || candidate.image_url)) {
            // Candidate with profile picture
            const imageUrl = candidate.media_url || candidate.image_url;
            mediaContent = `
                <img src="${imageUrl}" 
                     alt="${candidate.name}" 
                     class="profile-photo"
                     onerror="console.error('❌ Failed to load profile image:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="console.log('✅ Profile image loaded:', this.src)">
                <div class="profile-photo-placeholder" style="display:none;">
                    <i class="fas fa-user"></i>
                </div>
            `;
        } else if (mediaType === 'image' && (candidate.media_url || candidate.image_url)) {
            // Image voting option
            const imageUrl = candidate.media_url || candidate.image_url;
            console.log('📸 Rendering image URL:', imageUrl);
            mediaContent = `
                <img src="${imageUrl}" 
                     alt="${candidate.name}" 
                     class="option-image"
                     crossorigin="anonymous"
                     onerror="console.error('❌ Failed to load image:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="console.log('✅ Image loaded successfully:', this.src)">
                <div class="profile-photo-placeholder" style="display:none;">
                    <i class="fas fa-image"></i>
                </div>
            `;
        } else if (mediaType === 'video') {
            // Video voting option
            mediaContent = `
                ${candidate.thumbnail_url ? `
                    <img src="${candidate.thumbnail_url}" alt="${candidate.name}" class="video-thumbnail">
                ` : `
                    <div class="video-placeholder">
                        <i class="fas fa-video"></i>
                    </div>
                `}
                <div class="video-play-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
        } else {
            // Text only - no media
            mediaContent = `
                <div class="profile-photo-placeholder">
                    <i class="fas fa-user"></i>
                </div>
            `;
        }
        
        return `
            <div class="vote-option ${mediaType}" data-candidate-id="${candidate.id}" data-position-id="${position.id}">
                <div class="vote-option-content">
                    <div class="vote-option-radio">
                        <i class="fas fa-circle"></i>
                    </div>
                    <div class="vote-option-info">
                        <div class="vote-option-media ${mediaType}">
                            ${mediaContent}
                        </div>
                        <h4 class="vote-option-name">${candidate.name}</h4>
                    </div>
                </div>
            </div>
        `;
    }

    bindCandidateSelection(election) {
        const selectedCandidates = new Map(); // positionId -> candidateId

        document.querySelectorAll('.vote-option').forEach(option => {
            option.addEventListener('click', () => {
                const positionId = option.dataset.positionId;
                const candidateId = option.dataset.candidateId;

                // Deselect other options in same position
                document.querySelectorAll(`[data-position-id="${positionId}"]`).forEach(opt => {
                    opt.classList.remove('selected');
                });

                // Select this option
                option.classList.add('selected');
                selectedCandidates.set(positionId, candidateId);

                // Update selection count
                this.updateSelectionCount(selectedCandidates.size, election.positions?.length || 0);
            });
        });

        // Store selections for submission
        this.currentSelections = selectedCandidates;
    }

    updateSelectionCount(selected, total) {
        const countElement = document.getElementById('selectionCount');
        const submitBtn = document.getElementById('submitVoteBtn');

        if (countElement) {
            countElement.textContent = `${selected} of ${total} positions selected`;
        }

        if (submitBtn) {
            if (selected === total) {
                submitBtn.disabled = false;
                submitBtn.classList.add('ready');
            } else {
                submitBtn.disabled = true;
                submitBtn.classList.remove('ready');
            }
        }
    }

    confirmAndSubmitVote(electionId) {
        // Show confirmation modal
        const modal = document.createElement('div');
        modal.className = 'vote-confirmation-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content glass-card">
                <div class="modal-icon">
                    <i class="fas fa-vote-yea"></i>
                </div>
                <h2>Confirm Your Vote</h2>
                <p>Are you sure you want to submit your vote? This action cannot be undone.</p>
                <div class="modal-actions">
                    <button class="btn-cancel">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                    <button class="btn-confirm">
                        <i class="fas fa-check"></i>
                        Confirm & Submit
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
        modal.querySelector('.btn-confirm').addEventListener('click', () => {
            modal.remove();
            this.submitVote(electionId);
        });
    }

    async submitVote(electionId) {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log('⚠️ Already submitting, please wait...');
            return;
        }

        // Use the stored selections from bindCandidateSelection
        if (!this.currentSelections || this.currentSelections.size === 0) {
            this.showError('Please select at least one candidate');
            return;
        }

        // Convert Map to array format for API (use camelCase as expected by backend)
        const votes = [];
        this.currentSelections.forEach((candidateId, positionId) => {
            votes.push({
                positionId: positionId,
                candidateId: candidateId
            });
        });

        console.log('📤 Submitting votes:', votes);

        const submitBtn = document.getElementById('submitVoteBtn');

        try {
            this.isSubmitting = true;

            // Disable submit button and show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }

            // Get and validate auth token
            const token = await this.getValidToken();
            
            console.log('🔑 Token found:', token ? 'Yes' : 'No');
            
            if (!token) {
                this.showError('Please log in to vote');
                setTimeout(() => {
                    window.location.href = '/pages/auth/signin.html';
                }, 2000);
                return;
            }
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting/${electionId}/vote`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ votes })
            }, 10000); // 10 second timeout for vote submission

            console.log('📡 Vote response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Vote error:', error);
                
                // Handle specific error cases
                if (response.status === 403) {
                    throw new Error('You are not eligible to vote in this election. Please contact an administrator.');
                } else if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                } else if (response.status === 400) {
                    throw new Error(error.error || 'Invalid vote submission');
                } else {
                    throw new Error(error.error || 'Failed to submit vote');
                }
            }

            const result = await response.json();
            console.log('✅ Vote submitted successfully:', result);
            
            this.showSuccess('Vote submitted successfully!');
            
            // Refresh elections to show updated counts
            await this.loadElections();
            
            setTimeout(() => this.showListView(), 2000);
        } catch (error) {
            console.error('❌ Error submitting vote:', error);
            this.showError(error.message);
        } finally {
            this.isSubmitting = false;
            
            // Re-enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit My Vote';
            }
        }
    }

    showListView() {
        document.getElementById('voteDetailSection')?.classList.add('hidden');
        document.getElementById('votingListSection')?.classList.remove('hidden');
        this.currentElection = null;
    }

    filterElections(filter) {
        // Only filter if needed, don't copy entire array unnecessarily
        if (filter === 'all') {
            this.renderElections(this.elections);
            return;
        }
        
        const filtered = this.elections.filter(e => {
            if (['active', 'upcoming', 'completed', 'draft'].includes(filter)) {
                return e.status === filter;
            }
            return e.election_type === filter;
        });
        
        this.renderElections(filtered);
    }

    searchElections(query) {
        // Sanitize input to prevent XSS
        const sanitizedQuery = this.sanitizeInput(query).toLowerCase();
        
        if (!sanitizedQuery) {
            this.renderElections(this.elections);
            return;
        }
        
        const filtered = this.elections.filter(e => 
            (e.title && e.title.toLowerCase().includes(sanitizedQuery)) ||
            (e.description && e.description.toLowerCase().includes(sanitizedQuery))
        );
        this.renderElections(filtered);
    }

    sortElections(sortBy) {
        let sorted = [...this.elections];
        
        switch(sortBy) {
            case 'ending-soon':
                sorted.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
                break;
            case 'alphabetical':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        this.renderElections(sorted);
    }

    updateStats() {
        const active = this.elections.filter(e => e.status === 'active').length;
        const upcoming = this.elections.filter(e => e.status === 'upcoming').length;
        
        const activeEl = document.getElementById('activeCount');
        const upcomingEl = document.getElementById('upcomingCount');
        
        if (activeEl) activeEl.textContent = active;
        if (upcomingEl) upcomingEl.textContent = upcoming;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.votingPortal = new VotingPortal();
    });
} else {
    window.votingPortal = new VotingPortal();
}