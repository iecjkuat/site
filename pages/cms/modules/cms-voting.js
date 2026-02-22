/**
 * CMS Voting Module - WhatsApp-style Poll Creator
 */

class CMSVoting {
    constructor() {
        this.apiBase = '/api/v1';
        this.currentOptions = [];
        this.init();
    }

    init() {
        this.loadVotes();
        this.bindEvents();
    }

    bindEvents() {
        // Create new vote button
        document.getElementById('createVoteBtn')?.addEventListener('click', () => {
            this.showCreateVoteModal();
        });
    }

    async loadVotes() {
        try {
            const response = await fetch(`${this.apiBase}/voting?limit=100`);
            if (!response.ok) throw new Error('Failed to load votes');
            
            const data = await response.json();
            this.renderVotesList(data.elections || []);
        } catch (error) {
            console.error('Error loading votes:', error);
            this.showError('Failed to load votes');
        }
    }

    renderVotesList(votes) {
        const container = document.getElementById('votesListContainer');
        if (!container) return;

        if (votes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-vote-yea"></i>
                    <h3>No Votes Created</h3>
                    <p>Create your first vote to get started</p>
                    <button class="btn-primary" onclick="cmsVoting.showCreateVoteModal()">
                        <i class="fas fa-plus"></i> Create Vote
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="votes-grid">
                ${votes.map(vote => this.renderVoteCard(vote)).join('')}
            </div>
        `;
    }

    renderVoteCard(vote) {
        const status = vote.status;
        const statusColors = {
            active: 'green',
            draft: 'gray',
            completed: 'blue',
            upcoming: 'yellow'
        };

        return `
            <div class="vote-card">
                <div class="vote-card-header">
                    <span class="vote-status ${statusColors[status]}">${status}</span>
                    <div class="vote-actions">
                        <button onclick="cmsVoting.editVote('${vote.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="cmsVoting.deleteVote('${vote.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3>${vote.title}</h3>
                <p>${vote.description || ''}</p>
                <div class="vote-meta">
                    <span><i class="fas fa-calendar"></i> ${new Date(vote.start_date).toLocaleDateString()}</span>
                    <span><i class="fas fa-users"></i> ${vote.votes_cast || 0} votes</span>
                </div>
            </div>
        `;
    }

    showCreateVoteModal() {
        this.currentOptions = [];
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'createVoteModal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2><i class="fas fa-poll"></i> Create New Vote</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <!-- Step 1: Basic Info -->
                    <div class="form-section">
                        <h3>Vote Details</h3>
                        
                        <div class="form-group">
                            <label>Question/Title *</label>
                            <input type="text" id="voteTitle" placeholder="e.g., Who should be the next president?" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Description (Optional)</label>
                            <textarea id="voteDescription" rows="3" placeholder="Add more context about this vote..."></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Vote Type</label>
                                <select id="voteType">
                                    <option value="general">General Poll</option>
                                    <option value="leadership">Leadership Election</option>
                                    <option value="project">Project Selection</option>
                                    <option value="referendum">Yes/No Decision</option>
                                    <option value="special">Special Vote</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Option Type</label>
                                <select id="optionType" onchange="cmsVoting.updateOptionTypeUI()">
                                    <option value="text">Plain Text</option>
                                    <option value="profile">Candidate (with photo)</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Start Date & Time</label>
                                <input type="datetime-local" id="voteStartDate" required>
                            </div>
                            
                            <div class="form-group">
                                <label>End Date & Time</label>
                                <input type="datetime-local" id="voteEndDate" required>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 2: Options -->
                    <div class="form-section">
                        <div class="section-header">
                            <h3>Vote Options</h3>
                            <button class="btn-secondary" onclick="cmsVoting.addOption()">
                                <i class="fas fa-plus"></i> Add Option
                            </button>
                        </div>
                        
                        <div id="optionsContainer" class="options-container">
                            <p class="text-muted">Click "Add Option" to create voting choices</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn-primary" onclick="cmsVoting.saveVote()">
                        <i class="fas fa-check"></i> Create Vote
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set default dates
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        document.getElementById('voteStartDate').value = tomorrow.toISOString().slice(0, 16);
        document.getElementById('voteEndDate').value = nextWeek.toISOString().slice(0, 16);
    }

    updateOptionTypeUI() {
        // This will be called when option type changes
        // We'll update the add option form based on selected type
    }

    addOption() {
        const optionType = document.getElementById('optionType').value;
        const container = document.getElementById('optionsContainer');
        
        if (container.querySelector('.text-muted')) {
            container.innerHTML = '';
        }
        
        const optionId = Date.now();
        let optionHTML = '';
        
        switch(optionType) {
            case 'text':
                optionHTML = this.renderTextOption(optionId);
                break;
            case 'profile':
                optionHTML = this.renderProfileOption(optionId);
                break;
            case 'image':
                optionHTML = this.renderImageOption(optionId);
                break;
            case 'video':
                optionHTML = this.renderVideoOption(optionId);
                break;
        }
        
        container.insertAdjacentHTML('beforeend', optionHTML);
    }

    renderTextOption(id) {
        return `
            <div class="option-item" data-option-id="${id}" data-type="text">
                <div class="option-header">
                    <span class="option-number">${this.currentOptions.length + 1}</span>
                    <input type="text" class="option-input" placeholder="Enter option text" required>
                    <button class="btn-icon-danger" onclick="cmsVoting.removeOption(${id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderProfileOption(id) {
        return `
            <div class="option-item" data-option-id="${id}" data-type="profile">
                <div class="option-header">
                    <span class="option-number">${this.currentOptions.length + 1}</span>
                    <div class="option-profile-form">
                        <input type="text" class="option-name" placeholder="Candidate name" required>
                        <input type="url" class="option-photo" placeholder="Photo URL (optional)">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Photo
                            <input type="file" accept="image/*" onchange="cmsVoting.handlePhotoUpload(event, ${id})" hidden>
                        </label>
                    </div>
                    <button class="btn-icon-danger" onclick="cmsVoting.removeOption(${id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="photo-preview" id="photoPreview${id}"></div>
            </div>
        `;
    }

    renderImageOption(id) {
        return `
            <div class="option-item" data-option-id="${id}" data-type="image">
                <div class="option-header">
                    <span class="option-number">${this.currentOptions.length + 1}</span>
                    <div class="option-media-form">
                        <input type="text" class="option-title" placeholder="Image title/description" required>
                        <input type="url" class="option-media-url" placeholder="Image URL">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Image
                            <input type="file" accept="image/*" onchange="cmsVoting.handleMediaUpload(event, ${id})" hidden>
                        </label>
                    </div>
                    <button class="btn-icon-danger" onclick="cmsVoting.removeOption(${id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="media-preview" id="mediaPreview${id}"></div>
            </div>
        `;
    }

    renderVideoOption(id) {
        return `
            <div class="option-item" data-option-id="${id}" data-type="video">
                <div class="option-header">
                    <span class="option-number">${this.currentOptions.length + 1}</span>
                    <div class="option-media-form">
                        <input type="text" class="option-title" placeholder="Video title/description" required>
                        <input type="url" class="option-media-url" placeholder="Video URL">
                        <input type="url" class="option-thumbnail" placeholder="Thumbnail URL (optional)">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Video
                            <input type="file" accept="video/*" onchange="cmsVoting.handleMediaUpload(event, ${id})" hidden>
                        </label>
                    </div>
                    <button class="btn-icon-danger" onclick="cmsVoting.removeOption(${id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="media-preview" id="mediaPreview${id}"></div>
            </div>
        `;
    }

    removeOption(id) {
        const option = document.querySelector(`[data-option-id="${id}"]`);
        if (option) {
            option.remove();
            this.renumberOptions();
        }
    }

    renumberOptions() {
        document.querySelectorAll('.option-item').forEach((item, index) => {
            const number = item.querySelector('.option-number');
            if (number) number.textContent = index + 1;
        });
    }

    async handlePhotoUpload(event, optionId) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Show preview
        const preview = document.getElementById(`photoPreview${optionId}`);
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
        
        // TODO: Upload to storage and get URL
        // For now, we'll use the data URL
    }

    async handleMediaUpload(event, optionId) {
        const file = event.target.files[0];
        if (!file) return;
        
        const preview = document.getElementById(`mediaPreview${optionId}`);
        const reader = new FileReader();
        
        if (file.type.startsWith('image/')) {
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
        } else if (file.type.startsWith('video/')) {
            reader.onload = (e) => {
                preview.innerHTML = `<video src="${e.target.result}" controls></video>`;
            };
        }
        
        reader.readAsDataURL(file);
    }

    async saveVote() {
        try {
            // Collect form data
            const title = document.getElementById('voteTitle').value.trim();
            const description = document.getElementById('voteDescription').value.trim();
            const voteType = document.getElementById('voteType').value;
            const startDate = document.getElementById('voteStartDate').value;
            const endDate = document.getElementById('voteEndDate').value;
            
            if (!title || !startDate || !endDate) {
                this.showError('Please fill in all required fields');
                return;
            }
            
            // Collect options
            const options = [];
            document.querySelectorAll('.option-item').forEach(item => {
                const type = item.dataset.type;
                const optionData = { type };
                
                switch(type) {
                    case 'text':
                        optionData.name = item.querySelector('.option-input').value;
                        break;
                    case 'profile':
                        optionData.name = item.querySelector('.option-name').value;
                        optionData.image_url = item.querySelector('.option-photo').value;
                        break;
                    case 'image':
                    case 'video':
                        optionData.name = item.querySelector('.option-title').value;
                        optionData.media_url = item.querySelector('.option-media-url').value;
                        if (type === 'video') {
                            optionData.thumbnail_url = item.querySelector('.option-thumbnail')?.value;
                        }
                        break;
                }
                
                if (optionData.name) {
                    options.push(optionData);
                }
            });
            
            if (options.length < 2) {
                this.showError('Please add at least 2 options');
                return;
            }
            
            // Create vote
            const voteData = {
                title,
                description,
                electionType: voteType,
                startDate,
                endDate,
                positions: [{
                    title: title,
                    description: description,
                    maxVotes: 1,
                    minVotes: 1,
                    candidates: options
                }]
            };
            
            const response = await fetch(`${this.apiBase}/voting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(voteData)
            });
            
            if (!response.ok) throw new Error('Failed to create vote');
            
            this.showSuccess('Vote created successfully!');
            document.getElementById('createVoteModal').remove();
            this.loadVotes();
            
        } catch (error) {
            console.error('Error saving vote:', error);
            this.showError('Failed to create vote');
        }
    }

    async deleteVote(id) {
        if (!confirm('Are you sure you want to delete this vote?')) return;
        
        try {
            const response = await fetch(`${this.apiBase}/voting/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete vote');
            
            this.showSuccess('Vote deleted successfully');
            this.loadVotes();
        } catch (error) {
            console.error('Error deleting vote:', error);
            this.showError('Failed to delete vote');
        }
    }

    showSuccess(message) {
        // TODO: Implement toast notification
        alert(message);
    }

    showError(message) {
        // TODO: Implement toast notification
        alert(message);
    }
}

// Initialize
window.cmsVoting = new CMSVoting();
