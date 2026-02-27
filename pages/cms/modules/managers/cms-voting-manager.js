/**
 * CMS Voting Manager Module
 * Handles all voting-related operations in the CMS
 */

export class CMSVotingManager {
    constructor(cmsManager) {
        this.cmsManager = cmsManager;
        this.apiBase = '/api/v1';
    }

    // Alias for consistency with other managers
    async load() {
        return this.loadVoting();
    }

    async loadVoting() {
        const container = document.getElementById('voting-content');
        if (!container) {
            console.error('❌ Voting container not found');
            return;
        }

        container.innerHTML = `
            <div class="cms-section-header">
                <h2><i class="fas fa-vote-yea"></i> Voting Management</h2>
                <button id="createVoteBtn" class="btn-primary">
                    <i class="fas fa-plus"></i> Create New Vote
                </button>
            </div>
            
            <div id="votesListContainer" class="votes-list">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i> Loading votes...
                </div>
            </div>
        `;

        try {
            const url = `${this.apiBase}/voting?limit=100`;
            console.log('📡 Fetching votes from:', url);
            
            const response = await fetch(url);
            console.log('📡 Voting API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API error:', response.status, errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const votes = data.elections || [];
            console.log('📊 Loaded votes:', votes.length);
            
            this.renderVotingList(votes);
            
            // Bind create button
            document.getElementById('createVoteBtn')?.addEventListener('click', () => {
                this.cmsManager.showCreateVoteModal();
            });
            
        } catch (error) {
            console.error('❌ Error loading votes:', error);
            
            const votesContainer = document.getElementById('votesListContainer');
            if (votesContainer) {
                votesContainer.innerHTML = `
                    <div class="error-state" style="text-align: center; padding: 3rem; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3>Failed to Load Votes</h3>
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 1rem;">${error.message}</p>
                        <button class="btn-primary" onclick="cmsManager.votingManager.loadVoting()">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    renderVotingList(votes) {
        const container = document.getElementById('votesListContainer');
        if (!container) return;

        if (votes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-vote-yea"></i>
                    <h3>No Votes Created</h3>
                    <p>Create your first vote to get started</p>
                </div>
            `;
            return;
        }

        const statusColors = {
            active: 'success',
            draft: 'secondary',
            completed: 'info',
            upcoming: 'warning'
        };

        container.innerHTML = `
            <div class="votes-grid">
                ${votes.map(vote => `
                    <div class="vote-card">
                        <div class="vote-card-header">
                            <span class="badge badge-${statusColors[vote.status] || 'secondary'}">
                                ${vote.status}
                            </span>
                            <span class="vote-type">${vote.election_type}</span>
                        </div>
                        
                        <h3 class="vote-title">${vote.title}</h3>
                        <p class="vote-description">${vote.description || 'No description'}</p>
                        
                        <div class="vote-meta">
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${new Date(vote.start_date).toLocaleDateString()} - ${new Date(vote.end_date).toLocaleDateString()}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-users"></i>
                                <span>${vote.votes_cast || 0} / ${vote.total_voters || 0} votes</span>
                            </div>
                        </div>
                        
                        <div class="vote-actions">
                            <button class="btn-sm btn-secondary view-vote-btn" data-vote-id="${vote.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn-sm btn-primary edit-vote-btn" data-vote-id="${vote.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-sm btn-danger delete-vote-btn" data-vote-id="${vote.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Bind event listeners using event delegation
        container.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-vote-btn');
            const editBtn = e.target.closest('.edit-vote-btn');
            const deleteBtn = e.target.closest('.delete-vote-btn');

            if (viewBtn) {
                e.preventDefault();
                const voteId = viewBtn.dataset.voteId;
                console.log('🔍 View button clicked for vote:', voteId);
                this.viewVoteDetails(voteId);
            } else if (editBtn) {
                e.preventDefault();
                const voteId = editBtn.dataset.voteId;
                console.log('✏️ Edit button clicked for vote:', voteId);
                this.editVote(voteId);
            } else if (deleteBtn) {
                e.preventDefault();
                const voteId = deleteBtn.dataset.voteId;
                console.log('🗑️ Delete button clicked for vote:', voteId);
                this.deleteVote(voteId);
            }
        });
    }

    async viewVoteDetails(id) {
        console.log('🔍 viewVoteDetails called with id:', id);
        
        try {
            const response = await fetch(`${this.apiBase}/voting/${id}`);
            
            if (!response.ok) {
                throw new Error('Failed to load vote details');
            }
            
            const vote = await response.json();
            
            // Create and show modal
            const modal = document.createElement('div');
            modal.className = 'modal-backdrop';
            modal.innerHTML = `
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2><i class="fas fa-eye"></i> ${vote.title}</h2>
                        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="vote-details-section">
                            <!-- Status Badge -->
                            <div class="detail-header">
                                <span class="badge badge-${vote.status === 'active' ? 'success' : vote.status === 'completed' ? 'info' : vote.status === 'upcoming' ? 'warning' : 'secondary'}">
                                    ${vote.status.toUpperCase()}
                                </span>
                                <span class="vote-type-badge">${vote.election_type}</span>
                            </div>
                            
                            <!-- Description -->
                            ${vote.description ? `
                                <div class="detail-block">
                                    <h3><i class="fas fa-align-left"></i> Description</h3>
                                    <p class="description-text">${vote.description}</p>
                                </div>
                            ` : ''}
                            
                            <!-- Date & Time -->
                            <div class="detail-block">
                                <h3><i class="fas fa-calendar"></i> Voting Period</h3>
                                <div class="date-range">
                                    <div class="date-item">
                                        <span class="date-label">Starts:</span>
                                        <span class="date-value">${new Date(vote.start_date).toLocaleString('en-US', { 
                                            weekday: 'short', 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}</span>
                                    </div>
                                    <div class="date-item">
                                        <span class="date-label">Ends:</span>
                                        <span class="date-value">${new Date(vote.end_date).toLocaleString('en-US', { 
                                            weekday: 'short', 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Participation Stats -->
                            <div class="detail-block">
                                <h3><i class="fas fa-chart-bar"></i> Participation</h3>
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-value">${vote.votes_cast || 0}</div>
                                        <div class="stat-label">Votes Cast</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">${vote.total_voters || 0}</div>
                                        <div class="stat-label">Total Voters</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">${vote.total_voters > 0 ? Math.round((vote.votes_cast / vote.total_voters) * 100) : 0}%</div>
                                        <div class="stat-label">Turnout</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Candidates/Options -->
                            ${vote.positions && vote.positions.length > 0 ? `
                                <div class="detail-block">
                                    <h3><i class="fas fa-users"></i> ${vote.positions[0].title || 'Candidates/Options'}</h3>
                                    <div class="candidates-grid">
                                        ${vote.positions[0].candidates?.map(c => `
                                            <div class="candidate-card">
                                                ${c.media_url ? `
                                                    <div class="candidate-media">
                                                        ${c.media_type === 'video' ? `
                                                            <video src="${c.media_url}" controls style="width: 100%; border-radius: 8px;"></video>
                                                        ` : `
                                                            <img src="${c.media_url}" alt="${c.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" />
                                                        `}
                                                    </div>
                                                ` : ''}
                                                <div class="candidate-info">
                                                    <h4>${c.name}</h4>
                                                    ${c.bio ? `<p class="candidate-bio">${c.bio}</p>` : ''}
                                                    ${c.media_type ? `<span class="media-type-badge"><i class="fas fa-${c.media_type === 'video' ? 'video' : c.media_type === 'image' ? 'image' : 'user'}"></i> ${c.media_type}</span>` : ''}
                                                </div>
                                            </div>
                                        `).join('') || '<p>No candidates added</p>'}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Settings -->
                            <div class="detail-block">
                                <h3><i class="fas fa-cog"></i> Settings</h3>
                                <div class="settings-list">
                                    <div class="setting-item">
                                        <i class="fas fa-${vote.anonymous_voting ? 'check-circle' : 'times-circle'}" style="color: ${vote.anonymous_voting ? '#10b981' : '#ef4444'}"></i>
                                        <span>Anonymous Voting: ${vote.anonymous_voting ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                    <div class="setting-item">
                                        <i class="fas fa-${vote.require_verification ? 'check-circle' : 'times-circle'}" style="color: ${vote.require_verification ? '#10b981' : '#ef4444'}"></i>
                                        <span>Verification Required: ${vote.require_verification ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Close</button>
                        <button class="btn-primary" onclick="cmsManager.votingManager.editVote('${vote.id}'); this.closest('.modal-backdrop').remove();">
                            <i class="fas fa-edit"></i> Edit Vote
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('Error viewing vote:', error);
            this.cmsManager.notifications?.show('Failed to load vote details', 'error');
        }
    }

    async editVote(id) {
        console.log('✏️ editVote called with id:', id);
        
        try {
            const response = await fetch(`${this.apiBase}/voting/${id}`);
            
            if (!response.ok) {
                throw new Error('Failed to load vote details');
            }
            
            const vote = await response.json();
            const candidates = vote.positions?.[0]?.candidates || [];
            
            // Create edit modal
            const modal = document.createElement('div');
            modal.className = 'modal-backdrop';
            modal.innerHTML = `
                <div class="modal-content large" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h2><i class="fas fa-edit"></i> Edit Vote</h2>
                        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="editVoteForm">
                            <!-- Basic Info -->
                            <div class="form-section">
                                <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                                
                                <div class="form-group">
                                    <label for="editTitle">Title *</label>
                                    <input type="text" id="editTitle" value="${vote.title}" required />
                                </div>
                                
                                <div class="form-group">
                                    <label for="editDescription">Description</label>
                                    <textarea id="editDescription" rows="3">${vote.description || ''}</textarea>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="editElectionType">Type</label>
                                        <select id="editElectionType">
                                            <option value="general" ${vote.election_type === 'general' ? 'selected' : ''}>General Vote</option>
                                            <option value="election" ${vote.election_type === 'election' ? 'selected' : ''}>Election</option>
                                            <option value="poll" ${vote.election_type === 'poll' ? 'selected' : ''}>Poll</option>
                                            <option value="referendum" ${vote.election_type === 'referendum' ? 'selected' : ''}>Referendum</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="editStatus">Status</label>
                                        <select id="editStatus">
                                            <option value="draft" ${vote.status === 'draft' ? 'selected' : ''}>Draft</option>
                                            <option value="upcoming" ${vote.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                                            <option value="active" ${vote.status === 'active' ? 'selected' : ''}>Active</option>
                                            <option value="completed" ${vote.status === 'completed' ? 'selected' : ''}>Completed</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="editStartDate">Start Date *</label>
                                        <input type="datetime-local" id="editStartDate" 
                                               value="${new Date(vote.start_date).toISOString().slice(0, 16)}" required />
                                    </div>
                                    <div class="form-group">
                                        <label for="editEndDate">End Date *</label>
                                        <input type="datetime-local" id="editEndDate" 
                                               value="${new Date(vote.end_date).toISOString().slice(0, 16)}" required />
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Candidates/Options -->
                            <div class="form-section">
                                <h3><i class="fas fa-users"></i> Candidates/Options</h3>
                                <div id="candidatesContainer">
                                    ${candidates.map((candidate, index) => `
                                        <div class="candidate-edit-card" data-candidate-id="${candidate.id}" data-index="${index}">
                                            <div class="candidate-edit-header">
                                                <span class="candidate-number">#${index + 1}</span>
                                                <button type="button" class="btn-remove-candidate" onclick="this.closest('.candidate-edit-card').remove()">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                            
                                            <div class="form-group">
                                                <label>Name *</label>
                                                <input type="text" class="candidate-name" value="${candidate.name}" required />
                                            </div>
                                            
                                            <div class="form-group">
                                                <label>Bio/Description</label>
                                                <textarea class="candidate-bio" rows="2">${candidate.bio || ''}</textarea>
                                            </div>
                                            
                                            ${candidate.media_url ? `
                                                <div class="current-media">
                                                    <label>Current Media:</label>
                                                    ${candidate.media_type === 'video' ? `
                                                        <video src="${candidate.media_url}" controls style="width: 100%; max-height: 200px; border-radius: 8px;"></video>
                                                    ` : `
                                                        <img src="${candidate.media_url}" alt="${candidate.name}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;" />
                                                    `}
                                                    <input type="hidden" class="candidate-media-url" value="${candidate.media_url}" />
                                                    <input type="hidden" class="candidate-media-type" value="${candidate.media_type || 'image'}" />
                                                </div>
                                            ` : ''}
                                            
                                            <div class="form-group">
                                                <label>Update Media (optional)</label>
                                                <input type="file" class="candidate-media-file" accept="image/*,video/*" />
                                                <small style="color: rgba(255,255,255,0.6);">Leave empty to keep current media</small>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <button type="button" class="btn-secondary" id="addCandidateBtn" style="margin-top: 1rem;">
                                    <i class="fas fa-plus"></i> Add Candidate/Option
                                </button>
                            </div>
                            
                            <!-- Settings -->
                            <div class="form-section">
                                <h3><i class="fas fa-cog"></i> Settings</h3>
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="editAnonymous" ${vote.anonymous_voting ? 'checked' : ''} />
                                        <span>Anonymous Voting</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="editVerification" ${vote.require_verification ? 'checked' : ''} />
                                        <span>Require Verification</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
                        <button class="btn-primary" id="saveEditBtn">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add candidate button handler
            let candidateCounter = candidates.length;
            document.getElementById('addCandidateBtn').addEventListener('click', () => {
                const container = document.getElementById('candidatesContainer');
                const newCard = document.createElement('div');
                newCard.className = 'candidate-edit-card';
                newCard.dataset.index = candidateCounter;
                newCard.innerHTML = `
                    <div class="candidate-edit-header">
                        <span class="candidate-number">#${candidateCounter + 1}</span>
                        <button type="button" class="btn-remove-candidate" onclick="this.closest('.candidate-edit-card').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" class="candidate-name" required />
                    </div>
                    
                    <div class="form-group">
                        <label>Bio/Description</label>
                        <textarea class="candidate-bio" rows="2"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Media (optional)</label>
                        <input type="file" class="candidate-media-file" accept="image/*,video/*" />
                    </div>
                `;
                container.appendChild(newCard);
                candidateCounter++;
            });
            
            // Handle save
            const saveBtn = document.getElementById('saveEditBtn');
            const saveHandler = async () => {
                try {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                    
                    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    
                    // Collect candidate data
                    const candidateCards = document.querySelectorAll('.candidate-edit-card');
                    const updatedCandidates = [];
                    
                    for (const card of candidateCards) {
                        const candidateData = {
                            id: card.dataset.candidateId || null,
                            name: card.querySelector('.candidate-name').value,
                            bio: card.querySelector('.candidate-bio')?.value || '',
                            media_url: card.querySelector('.candidate-media-url')?.value || null,
                            media_type: card.querySelector('.candidate-media-type')?.value || 'text',
                            display_order: parseInt(card.dataset.index),
                            is_approved: true,
                            is_active: true
                        };
                        
                        // Handle new media upload
                        const mediaFile = card.querySelector('.candidate-media-file')?.files[0];
                        if (mediaFile) {
                            // Upload new media
                            const formData = new FormData();
                            formData.append('file', mediaFile);
                            formData.append('bucket', mediaFile.type.startsWith('video/') ? 'voting-videos' : mediaFile.type.startsWith('image/') ? 'candidate-photos' : 'voting-images');
                            
                            const uploadRes = await fetch('/api/v1/upload', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: formData
                            });
                            
                            if (uploadRes.ok) {
                                const uploadData = await uploadRes.json();
                                candidateData.media_url = uploadData.url;
                                candidateData.media_type = mediaFile.type.startsWith('video/') ? 'video' : 'image';
                            }
                        }
                        
                        updatedCandidates.push(candidateData);
                    }
                    
                    const updateData = {
                        title: document.getElementById('editTitle').value,
                        description: document.getElementById('editDescription').value,
                        electionType: document.getElementById('editElectionType').value,
                        startDate: document.getElementById('editStartDate').value,
                        endDate: document.getElementById('editEndDate').value,
                        status: document.getElementById('editStatus').value,
                        anonymousVoting: document.getElementById('editAnonymous').checked,
                        requireVerification: document.getElementById('editVerification').checked,
                        positions: [{
                            id: vote.positions?.[0]?.id || null,
                            title: document.getElementById('editTitle').value,
                            description: document.getElementById('editDescription').value,
                            maxVotes: 1,
                            minVotes: 1,
                            candidates: updatedCandidates
                        }]
                    };
                    
                    const updateResponse = await fetch(`${this.apiBase}/voting/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(updateData)
                    });
                    
                    if (!updateResponse.ok) {
                        const error = await updateResponse.json();
                        throw new Error(error.error || 'Failed to update vote');
                    }
                    
                    this.cmsManager.notifications?.show('Vote updated successfully!', 'success');
                    modal.remove();
                    this.loadVoting(); // Reload the list
                    
                } catch (error) {
                    console.error('Error updating vote:', error);
                    this.cmsManager.notifications?.show(error.message || 'Failed to update vote', 'error');
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                }
            };
            
            saveBtn.addEventListener('click', saveHandler);
            
        } catch (error) {
            console.error('Error editing vote:', error);
            this.cmsManager.notifications?.show('Failed to load vote for editing', 'error');
        }
    }

    async deleteVote(id) {
        console.log('🗑️ deleteVote called with id:', id);
        
        if (!confirm('Are you sure you want to delete this vote? This action cannot be undone.')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const response = await fetch(`${this.apiBase}/voting/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete vote');
            }
            
            this.cmsManager.notifications?.show('Vote deleted successfully', 'success');
            this.loadVoting(); // Reload the list
            
        } catch (error) {
            console.error('Error deleting vote:', error);
            this.cmsManager.notifications?.show('Failed to delete vote', 'error');
        }
    }
}
