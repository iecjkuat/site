/**
 * JKUAT Innovation Club - Voting Portal
 */

class VotingPortal {
    constructor() {
        this.elections = [];
        this.currentElection = null;
        this.apiBase = '/api/v1';
        this.init();
    }

    async init() {
        console.log('🗳️ Initializing Voting Portal...');
        this.bindEvents();
        await this.loadElections();
        this.updateStats();
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

    async loadElections() {
        try {
            console.log('📡 Fetching elections from:', `${this.apiBase}/voting`);
            const response = await fetch(`${this.apiBase}/voting`);
            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Received data:', data);
                this.elections = data.elections || [];
                console.log('📊 Elections loaded:', this.elections.length);
                this.renderElections(this.elections);
            } else {
                const errorText = await response.text();
                console.error('❌ API error:', response.status, errorText);
                throw new Error(`API returned ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading elections:', error);
            this.showError('Failed to load elections');
            // Show empty state
            const grid = document.getElementById('votingGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="no-votes-message">
                        <i class="fas fa-exclamation-triangle no-votes-icon"></i>
                        <h3 class="no-votes-title">Unable to Load Elections</h3>
                        <p class="no-votes-text">${error.message}</p>
                    </div>
                `;
            }
        }
    }

    renderElections(elections) {
        const grid = document.getElementById('votingGrid');
        if (!grid) {
            console.error('❌ votingGrid element not found');
            return;
        }

        console.log('🎨 Rendering elections:', elections.length);

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

        grid.innerHTML = elections.map(election => this.createElectionCard(election)).join('');

        // Add click handlers
        grid.querySelectorAll('[data-election-id]').forEach(card => {
            card.addEventListener('click', () => {
                this.viewElection(card.dataset.electionId);
            });
        });
        
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
                                <span class="stat-value">${timeRemaining}</span>
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
            const response = await fetch(`${this.apiBase}/voting/${electionId}`);
            if (!response.ok) throw new Error('Failed to load election');
            
            const election = await response.json();
            this.currentElection = election;
            this.showElectionDetail(election);
        } catch (error) {
            console.error('Error loading election:', error);
            this.showError('Failed to load election details');
        }
    }

    showElectionDetail(election) {
        const detailSection = document.getElementById('voteDetailSection');
        const listSection = document.getElementById('votingListSection');
        const content = document.getElementById('voteDetailContent');

        if (!detailSection || !listSection || !content) return;

        listSection.classList.add('hidden');
        detailSection.classList.remove('hidden');

        const status = this.getElectionStatus(election);
        const timeRemaining = this.getTimeRemaining(election.end_date);

        content.innerHTML = `
            <div class="ballot-container">
                <!-- Election Header -->
                <div class="ballot-header">
                    <div class="ballot-header-content">
                        <div class="ballot-title-section">
                            <h1 class="ballot-title">${election.title}</h1>
                            <p class="ballot-subtitle">${election.description}</p>
                        </div>
                        <div class="ballot-status-section">
                            <div class="status-badge ${status.class}">
                                <i class="fas fa-circle"></i>
                                ${status.text}
                            </div>
                            ${status.canVote ? `
                                <div class="time-remaining-badge">
                                    <i class="fas fa-clock"></i>
                                    ${timeRemaining}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Voting Instructions -->
                ${status.canVote ? `
                    <div class="voting-instructions glass-card">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <h3>How to Vote</h3>
                            <p>Select one candidate for each position below. Review your selections and click "Submit Vote" when ready.</p>
                        </div>
                    </div>
                ` : ''}

                <!-- Positions and Candidates -->
                <div class="positions-container">
                    ${election.positions?.map((pos, index) => this.renderPosition(pos, election, index + 1)).join('') || '<p class="no-data">No positions available</p>'}
                </div>

                <!-- Submit Section -->
                ${status.canVote ? `
                    <div class="ballot-footer">
                        <div class="selection-summary glass-card">
                            <i class="fas fa-check-circle"></i>
                            <span id="selectionCount">0 of ${election.positions?.length || 0} positions selected</span>
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
        
        // Render based on media type
        let mediaContent = '';
        
        if (mediaType === 'profile' || candidate.image_url) {
            // Candidate with profile picture
            mediaContent = `
                <div class="vote-option-media profile">
                    ${candidate.image_url ? `
                        <img src="${candidate.image_url}" alt="${candidate.name}" class="profile-photo">
                    ` : `
                        <div class="profile-photo-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                    `}
                </div>
            `;
        } else if (mediaType === 'image') {
            // Image voting option
            mediaContent = `
                <div class="vote-option-media image">
                    <img src="${candidate.media_url || candidate.image_url}" alt="${candidate.name}" class="option-image">
                </div>
            `;
        } else if (mediaType === 'video') {
            // Video voting option
            mediaContent = `
                <div class="vote-option-media video">
                    ${candidate.thumbnail_url ? `
                        <img src="${candidate.thumbnail_url}" alt="${candidate.name}" class="video-thumbnail">
                        <div class="video-play-icon">
                            <i class="fas fa-play-circle"></i>
                        </div>
                    ` : `
                        <div class="video-placeholder">
                            <i class="fas fa-video"></i>
                        </div>
                    `}
                </div>
            `;
        }
        
        return `
            <div class="vote-option ${mediaType}" data-candidate-id="${candidate.id}" data-position-id="${position.id}">
                <div class="vote-option-content">
                    <div class="vote-option-radio">
                        <i class="fas fa-circle"></i>
                    </div>
                    ${mediaContent}
                    <div class="vote-option-info">
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
        const selectedCandidates = [];
        
        document.querySelectorAll('.candidate-card.selected').forEach(card => {
            selectedCandidates.push({
                positionId: card.dataset.positionId,
                candidateId: card.dataset.candidateId
            });
        });

        if (selectedCandidates.length === 0) {
            this.showError('Please select at least one candidate');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/voting/${electionId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ votes: selectedCandidates })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit vote');
            }

            this.showSuccess('Vote submitted successfully!');
            setTimeout(() => this.showListView(), 2000);
        } catch (error) {
            console.error('Error submitting vote:', error);
            this.showError(error.message);
        }
    }

    showListView() {
        document.getElementById('voteDetailSection')?.classList.add('hidden');
        document.getElementById('votingListSection')?.classList.remove('hidden');
        this.currentElection = null;
    }

    filterElections(filter) {
        let filtered = [...this.elections];
        
        if (filter !== 'all') {
            if (['active', 'upcoming', 'completed', 'draft'].includes(filter)) {
                filtered = filtered.filter(e => e.status === filter);
            } else {
                filtered = filtered.filter(e => e.election_type === filter);
            }
        }
        
        this.renderElections(filtered);
    }

    searchElections(query) {
        const filtered = this.elections.filter(e => 
            e.title.toLowerCase().includes(query.toLowerCase()) ||
            e.description?.toLowerCase().includes(query.toLowerCase())
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
        
        document.getElementById('activeCount').textContent = active;
        document.getElementById('upcomingCount').textContent = upcoming;
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
