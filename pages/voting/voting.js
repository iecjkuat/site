/**
 * JKUAT Innovation Club - Voting Portal Logic
 */

class VotingPortal {
    constructor() {
        this.votes = [];
        this.currentView = 'list';
        this.init();
    }

    async init() {
        console.log('🗳️ Initializing Voting Portal...');
        this.bindEvents();
        await this.loadVotes();
        this.updateStats();
    }

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterVotes(btn.dataset.filter);
            });
        });

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
        });
    }

    async loadVotes() {
        try {
            // Try API first
            const response = await fetch('/api/voting');
            if (response.ok) {
                const data = await response.json();
                this.votes = data.votes || data;
                console.log('✅ Votes loaded from API:', this.votes.length);
            } else {
                throw new Error('API failed');
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using mock data');
            // Fallback to mock data
            this.votes = window.mockVotes || [];
        }

        this.renderVotes(this.votes);
    }

    updateStats() {
        const active = this.votes.filter(e => e.status === 'active').length;
        const upcoming = this.votes.filter(e => e.status === 'upcoming').length;

        document.getElementById('activeCount').textContent = active;
        document.getElementById('upcomingCount').textContent = upcoming;
        // My votes would come from a separate endpoint or mock
        document.getElementById('myVotesCount').textContent = '2';
    }

    renderVotes(data) {
        const grid = document.getElementById('votingGrid');
        if (!data || data.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-vote-yea text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-400">No votes available at the moment.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = data.map(vote => this.createVoteCard(vote)).join('');
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
            leadership: 'Leadership Vote',
            project: 'Project Vote',
            decision: 'Club Decision',
            committee: 'Committee Selection'
        };

        const progressPercent = vote.total_voters > 0 ? 
            Math.round((vote.votes_cast / vote.total_voters) * 100) : 0;

        const timeRemaining = this.getTimeRemaining(vote.end_date);

        return `
            <div class="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer" 
                 data-action="view-election" data-id="${vote.id}">
                
                <!-- Header -->
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <i class="${typeIcons[vote.type] || 'fas fa-vote-yea'} text-2xl text-blue-400"></i>
                        <div>
                            <span class="text-sm text-gray-400">${typeLabels[vote.type] || 'Vote'}</span>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full ${statusColors[vote.status]}"></span>
                                <span class="text-sm capitalize text-gray-300">${vote.status}</span>
                            </div>
                        </div>
                    </div>
                    ${vote.status === 'active' ? `
                        <div class="text-right">
                            <div class="text-sm text-gray-400">Time Left</div>
                            <div class="text-sm font-medium text-yellow-400">${timeRemaining}</div>
                        </div>
                    ` : ''}
                </div>

                <!-- Title & Description -->
                <h3 class="text-xl font-semibold mb-2 text-white">${vote.title}</h3>
                <p class="text-gray-300 text-sm mb-4 line-clamp-2">${vote.description}</p>

                <!-- Progress & Stats -->
                ${vote.status === 'active' ? `
                    <div class="mb-4">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-400">Participation</span>
                            <span class="text-white">${vote.votes_cast}/${vote.total_voters} votes</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full transition-all" 
                                 style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="text-xs text-gray-400 mt-1">${progressPercent}% turnout</div>
                    </div>
                ` : ''}

                <!-- Action Button -->
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-400">
                        ${this.formatDate(vote.start_date)} - ${this.formatDate(vote.end_date)}
                    </div>
                    <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                        ${vote.status === 'active' ? 'Vote Now' : 
                          vote.status === 'upcoming' ? 'View Details' : 'View Results'}
                    </button>
                </div>
            </div>
        `;
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

    filterVotes(filter) {
        let filtered = this.votes;
        
        if (filter !== 'all') {
            if (['active', 'upcoming', 'completed'].includes(filter)) {
                filtered = this.votes.filter(e => e.status === filter);
            } else {
                // Filter by type
                filtered = this.votes.filter(e => e.type === filter);
            }
        }
        
        this.renderVotes(filtered);
    }

    viewVote(id) {
        const vote = this.votes.find(e => e.id === id);
        if (!vote) return;

        console.log('Viewing vote:', vote.title);
        this.currentView = 'detail';
        this.currentVoteId = id; // Store current vote ID

        // Hide list, show detail
        document.getElementById('votingListSection').classList.add('hidden');
        document.getElementById('voteDetailSection').classList.remove('hidden');

        // Render detail based on vote type
        const container = document.getElementById('voteDetailContent');
        
        if (vote.type === 'leadership') {
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
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${(pos.candidates || []).map(candidate => `
                                    <div class="glass-card p-6 text-center candidate-card hover:bg-white/10 transition-all cursor-pointer" 
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

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${(vote.options || []).map(option => `
                        <div class="glass-card p-6 project-option hover:bg-white/10 transition-all cursor-pointer" 
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

                ${vote.proposal ? `
                    <div class="mb-8">
                        <h3 class="text-2xl font-semibold mb-4 border-l-4 border-yellow-500 pl-4">${vote.proposal.title}</h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="glass-card p-6">
                                <h4 class="font-semibold mb-3 text-red-400">Current Text</h4>
                                <p class="text-gray-300 italic">"${vote.proposal.current_text}"</p>
                            </div>
                            <div class="glass-card p-6">
                                <h4 class="font-semibold mb-3 text-green-400">Proposed Text</h4>
                                <p class="text-gray-300 italic">"${vote.proposal.proposed_text}"</p>
                            </div>
                        </div>
                        <div class="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                            <h4 class="font-semibold mb-2 text-blue-300">Rationale</h4>
                            <p class="text-gray-300">${vote.proposal.rationale}</p>
                        </div>
                    </div>
                ` : ''}

                ${vote.status === 'active' ? `
                    <div class="flex justify-center gap-8 mb-8">
                        <div class="glass-card p-8 text-center decision-option hover:bg-green-900/20 transition-all cursor-pointer" 
                             data-action="select-decision" data-choice="yes">
                            <div class="w-16 h-16 rounded-full bg-green-600 mx-auto mb-4 flex items-center justify-center text-2xl">
                                <i class="fas fa-check text-white"></i>
                            </div>
                            <h4 class="text-xl font-bold text-green-400 mb-2">YES</h4>
                            <p class="text-gray-300">Support the amendment</p>
                            <div class="selection-indicator hidden mt-4">
                                <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="glass-card p-8 text-center decision-option hover:bg-red-900/20 transition-all cursor-pointer" 
                             data-action="select-decision" data-choice="no">
                            <div class="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 flex items-center justify-center text-2xl">
                                <i class="fas fa-times text-white"></i>
                            </div>
                            <h4 class="text-xl font-bold text-red-400 mb-2">NO</h4>
                            <p class="text-gray-300">Reject the amendment</p>
                            <div class="selection-indicator hidden mt-4">
                                <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="text-center">
                        <button id="finalSubmitBtn" class="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                            <i class="fas fa-vote-yea mr-2"></i> Submit Decision Vote
                        </button>
                        <p class="text-gray-400 text-sm mt-4"><i class="fas fa-shield-alt mr-2"></i> Your vote is encrypted and anonymous</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderCommitteeSelection(vote, container) {
        const timeRemaining = this.getTimeRemaining(vote.end_date);
        
        container.innerHTML = `
            <div class="glass-card p-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">${vote.title}</h2>
                        <p class="text-gray-300">${vote.description}</p>
                        ${vote.committee_info ? `
                            <div class="mt-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                                <h4 class="font-semibold text-purple-300 mb-2">${vote.committee_info.name}</h4>
                                <p class="text-gray-300 text-sm mb-2">${vote.committee_info.description}</p>
                                <div class="flex gap-4 text-sm">
                                    <span class="text-gray-400"><i class="fas fa-clock mr-1"></i> ${vote.committee_info.commitment}</span>
                                    <span class="text-gray-400"><i class="fas fa-users mr-1"></i> ${vote.committee_info.positions_available} positions</span>
                                </div>
                            </div>
                        ` : ''}
                        <div class="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                            <i class="fas fa-info-circle text-blue-400 mr-2"></i>
                            <span class="text-blue-300">Select up to ${vote.max_selections || 5} candidates</span>
                        </div>
                    </div>
                    ${vote.status === 'active' ? `
                        <div class="bg-indigo-900/40 p-4 rounded-xl border border-indigo-500/30 text-center min-w-[200px]">
                            <div class="text-sm text-indigo-300 mb-1">Time Remaining</div>
                            <div class="text-2xl font-mono font-bold text-yellow-400">${timeRemaining}</div>
                        </div>
                    ` : ''}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${(vote.candidates || []).map(candidate => `
                        <div class="glass-card p-6 text-center committee-candidate hover:bg-white/10 transition-all cursor-pointer" 
                             data-action="select-committee-member" data-cand-id="${candidate.id}">
                            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mx-auto mb-4 flex items-center justify-center text-xl">
                                <i class="fas fa-user text-white"></i>
                            </div>
                            <h5 class="font-bold text-lg mb-2">${candidate.name}</h5>
                            <p class="text-sm text-gray-400 mb-2">${candidate.course} - Year ${candidate.year}</p>
                            <p class="text-xs text-gray-500 mb-4">${candidate.experience}</p>
                            <div class="selection-indicator hidden">
                                <i class="fas fa-check-circle text-green-400 text-xl"></i>
                                <span class="text-green-400 text-sm block mt-1">Selected</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${vote.status === 'active' ? `
                    <div class="mt-12 text-center">
                        <div class="mb-4">
                            <span class="text-gray-400">Selected: </span>
                            <span id="selectedCount" class="font-bold">0</span>
                            <span class="text-gray-400"> / ${vote.max_selections || 5}</span>
                        </div>
                        <button id="finalSubmitBtn" class="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                            <i class="fas fa-vote-yea mr-2"></i> Submit Committee Selections
                        </button>
                        <p class="text-gray-400 text-sm mt-4"><i class="fas fa-shield-alt mr-2"></i> Your vote is encrypted and anonymous</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showListView() {
        this.currentView = 'list';
        document.getElementById('votingListSection').classList.remove('hidden');
        document.getElementById('voteDetailSection').classList.add('hidden');
    }

    selectCandidate(posId, candId, element) {
        // Remove selection from other candidates in the SAME position
        element.parentElement.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('.selection-indicator').classList.add('hidden');
        });
        // Add to this one
        element.classList.add('selected');
        element.querySelector('.selection-indicator').classList.remove('hidden');
    }

    selectProject(optionId, element) {
        const currentVote = this.votes.find(e => e.id === this.getCurrentVoteId());
        const maxSelections = currentVote?.max_selections || 3;
        
        // Count current selections
        const selectedProjects = document.querySelectorAll('.project-option.selected');
        
        if (element.classList.contains('selected')) {
            // Deselect
            element.classList.remove('selected');
            element.querySelector('.selection-indicator').classList.add('hidden');
        } else if (selectedProjects.length < maxSelections) {
            // Select if under limit
            element.classList.add('selected');
            element.querySelector('.selection-indicator').classList.remove('hidden');
        } else {
            // Show limit message
            this.showError(`You can only select up to ${maxSelections} projects.`);
            return;
        }
        
        // Update counter
        const selectedCount = document.querySelectorAll('.project-option.selected').length;
        const counter = document.getElementById('selectedCount');
        if (counter) counter.textContent = selectedCount;
    }

    selectDecision(choice, element) {
        // Remove selection from other decision options
        document.querySelectorAll('.decision-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('.selection-indicator').classList.add('hidden');
        });
        // Add to this one
        element.classList.add('selected');
        element.querySelector('.selection-indicator').classList.remove('hidden');
    }

    selectCommitteeMember(candId, element) {
        const currentVote = this.votes.find(e => e.id === this.getCurrentVoteId());
        const maxSelections = currentVote?.max_selections || 5;
        
        // Count current selections
        const selectedMembers = document.querySelectorAll('.committee-candidate.selected');
        
        if (element.classList.contains('selected')) {
            // Deselect
            element.classList.remove('selected');
            element.querySelector('.selection-indicator').classList.add('hidden');
        } else if (selectedMembers.length < maxSelections) {
            // Select if under limit
            element.classList.add('selected');
            element.querySelector('.selection-indicator').classList.remove('hidden');
        } else {
            // Show limit message
            this.showError(`You can only select up to ${maxSelections} committee members.`);
            return;
        }
        
        // Update counter
        const selectedCount = document.querySelectorAll('.committee-candidate.selected').length;
        const counter = document.getElementById('selectedCount');
        if (counter) counter.textContent = selectedCount;
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
        const currentVote = this.votes.find(e => e.id === this.currentVoteId);
        if (!currentVote) {
            this.showError('Vote not found');
            return;
        }

        let votes = {};
        let isValid = false;

        if (currentVote.type === 'leadership') {
            // Collect leadership votes
            const selectedCandidates = document.querySelectorAll('.candidate-card.selected');
            selectedCandidates.forEach(card => {
                const posId = card.dataset.posId;
                const candId = card.dataset.candId;
                votes[posId] = candId;
            });
            isValid = selectedCandidates.length > 0;
        } else if (currentVote.type === 'project') {
            // Collect project votes
            const selectedProjects = document.querySelectorAll('.project-option.selected');
            votes.projects = Array.from(selectedProjects).map(proj => proj.dataset.optionId);
            isValid = votes.projects.length > 0;
        } else if (currentVote.type === 'decision') {
            // Collect decision vote
            const selectedDecision = document.querySelector('.decision-option.selected');
            if (selectedDecision) {
                votes.decision = selectedDecision.dataset.choice;
                isValid = true;
            }
        } else if (currentVote.type === 'committee') {
            // Collect committee votes
            const selectedMembers = document.querySelectorAll('.committee-candidate.selected');
            votes.committee = Array.from(selectedMembers).map(member => member.dataset.candId);
            isValid = votes.committee.length > 0;
        }

        if (!isValid) {
            this.showError('Please make at least one selection before submitting.');
            return;
        }

        // Show confirmation
        const confirmMessage = this.getConfirmationMessage(currentVote, votes);
        if (!confirm(confirmMessage)) {
            return;
        }

        // Submit votes (would normally go to API)
        console.log('Submitting votes:', votes);
        
        // Show success message
        this.showSuccess(`Thank you! Your ${currentVote.type} votes have been cast successfully.`);
        
        // Return to list view
        setTimeout(() => {
            this.showListView();
        }, 2000);
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
        // Create a success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(msg) {
        // Create an error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${msg}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

window.VotingPortal = VotingPortal;

// Autonomous initialization
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.Navigation === 'function' && !window.navInstance) {
        window.navInstance = new Navigation();
    }
    window.portalInstance = new VotingPortal();
});
