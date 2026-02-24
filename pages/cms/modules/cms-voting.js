/**
 * CMS Voting Module - WhatsApp-style Poll Creator
 */

console.log('🔧 Loading CMS Voting module...');

class CMSVoting {
    constructor() {
        this.apiBase = '/api/v1';
        this.currentOptions = [];
        this.toastTimeouts = new Set();
        this.eventsbound = false; // Track if events are already bound
        this.init();
    }

    init() {
        // Don't auto-load votes - let CMS manager handle rendering
        // Just bind events for when modals are shown
        if (!this.eventsBound) {
            this.bindEvents();
            this.eventsBound = true;
        }
    }

    async fetchWithTimeout(url, options = {}, timeout = 10000) {
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
                throw new Error('Request timeout - please try again');
            }
            throw error;
        }
    }

    destroy() {
        // Clean up timeouts to prevent memory leaks
        if (this.toastTimeouts) {
            this.toastTimeouts.forEach(id => clearTimeout(id));
            this.toastTimeouts.clear();
        }
        console.log('🧹 CMSVoting cleaned up');
    }

    validateDates(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }
        
        if (start >= end) {
            throw new Error('End date must be after start date');
        }
        
        // Check if start date is in the past (optional warning)
        const now = new Date();
        if (start < now) {
            console.warn('⚠️ Start date is in the past');
        }
        
        return true;
    }

    trapFocus(modal) {
        const focusable = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusable.length === 0) return;
        
        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];
        
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        };
        
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
        modal.addEventListener('keydown', handleEscapeKey);
        
        // Focus first element
        setTimeout(() => firstFocusable.focus(), 100);
        
        // Store cleanup function
        modal._focusTrapCleanup = () => {
            modal.removeEventListener('keydown', handleTabKey);
            modal.removeEventListener('keydown', handleEscapeKey);
        };
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

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toast);
        
        const timeoutId = setTimeout(() => {
            toast.remove();
            this.toastTimeouts.delete(timeoutId);
        }, 3000);
        
        this.toastTimeouts.add(timeoutId);
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    bindEvents() {
        console.log('🎯 Binding events for CMS Voting...');
        
        // Create new vote button
        document.getElementById('createVoteBtn')?.addEventListener('click', () => {
            this.showCreateVoteModal();
        });

        // Event delegation for dynamic content
        document.addEventListener('click', (e) => {
            // View vote button
            const viewBtn = e.target.closest('.view-vote-btn');
            if (viewBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = viewBtn.dataset.id;
                console.log('👁️ View button clicked, ID:', id);
                if (id) {
                    this.viewVote(id);
                } else {
                    console.error('❌ No ID found on view button');
                }
                return;
            }

            // Edit vote button
            const editBtn = e.target.closest('.edit-vote-btn');
            if (editBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = editBtn.dataset.id;
                console.log('✏️ Edit button clicked, ID:', id);
                if (id) {
                    this.editVote(id);
                } else {
                    console.error('❌ No ID found on edit button');
                }
                return;
            }

            // Delete vote button
            const deleteBtn = e.target.closest('.delete-vote-btn');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = deleteBtn.dataset.id;
                console.log('🗑️ Delete button clicked, ID:', id);
                if (id) {
                    this.deleteVote(id);
                } else {
                    console.error('❌ No ID found on delete button');
                }
                return;
            }
            const deleteBtn = e.target.closest('.delete-vote-btn');
            if (deleteBtn) {
                e.preventDefault();
                const id = deleteBtn.dataset.id;
                if (id) this.deleteVote(id);
                return;
            }

            // Close modal (close button)
            const closeBtn = e.target.closest('.modal-close');
            if (closeBtn) {
                const modal = closeBtn.closest('.modal-overlay');
                if (modal) modal.remove();
                return;
            }

            // Close modal (overlay click)
            if (e.target.classList.contains('modal-overlay')) {
                e.target.remove();
                return;
            }

            // Add option button in modal
            const addOptionBtn = e.target.closest('#addOptionBtn');
            if (addOptionBtn) {
                e.preventDefault();
                this.addOption();
                return;
            }

            // Remove option button
            const removeOptionBtn = e.target.closest('.remove-option-btn');
            if (removeOptionBtn) {
                e.preventDefault();
                const optionId = removeOptionBtn.dataset.optionId;
                if (optionId) this.removeOption(optionId);
                return;
            }

            // Save vote button (create)
            const saveVoteBtn = e.target.closest('#saveVoteBtn');
            if (saveVoteBtn) {
                e.preventDefault();
                this.saveVote();
                return;
            }

            // Update vote button (edit)
            const updateVoteBtn = e.target.closest('#updateVoteBtn');
            if (updateVoteBtn) {
                e.preventDefault();
                const id = updateVoteBtn.dataset.id;
                if (id) this.updateVote(id);
                return;
            }

            // Cancel button in modal
            const cancelBtn = e.target.closest('.cancel-modal-btn');
            if (cancelBtn) {
                const modal = cancelBtn.closest('.modal-overlay');
                if (modal) modal.remove();
                return;
            }
        });

        // Handle file inputs separately (change events)
        document.addEventListener('change', (e) => {
            // Photo upload for profile options
            if (e.target.matches('.photo-upload-input')) {
                const optionId = e.target.dataset.optionId;
                if (optionId) this.handlePhotoUpload(e, optionId);
            }
            
            // Media upload for image/video options
            if (e.target.matches('.media-upload-input')) {
                const optionId = e.target.dataset.optionId;
                if (optionId) this.handleMediaUpload(e, optionId);
            }
        });

        // Handle option type change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'optionType') {
                this.updateOptionTypeUI();
            }
        });
    }

    async loadVotes(retryCount = 0, maxRetries = 3) {
        const container = document.getElementById('votesListContainer');
        if (!container) {
            console.error('❌ votesListContainer not found in DOM');
            return;
        }
        
        // Show loading state
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading votes...</p>
            </div>
        `;
        
        try {
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting?limit=100`, {}, 8000);
            
            if (!response.ok) throw new Error('Failed to load votes');
            
            const data = await response.json();
            console.log('📊 Loaded votes:', data.elections?.length || 0);
            this.renderVotesList(data.elections || []);
        } catch (error) {
            console.error(`Error loading votes (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            if (retryCount < maxRetries) {
                // Exponential backoff: 1s, 2s, 3s
                const delay = 1000 * (retryCount + 1);
                console.log(`⏳ Retrying in ${delay}ms...`);
                
                container.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Retrying... (${retryCount + 1}/${maxRetries})</p>
                    </div>
                `;
                
                setTimeout(() => {
                    this.loadVotes(retryCount + 1, maxRetries);
                }, delay);
            } else {
                // All retries failed
                container.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Failed to Load Votes</h3>
                        <p>${error.message}</p>
                        <button class="btn-primary" onclick="cmsVoting.loadVotes()">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
                this.showError('Failed to load votes');
            }
        }
    }

    renderVotesList(votes) {
        const container = document.getElementById('votesListContainer');
        if (!container) {
            console.error('❌ votesListContainer not found');
            return;
        }

        console.log('🎨 Rendering', votes.length, 'votes');

        if (votes.length === 0) {
            container.innerHTML = `
                <div class="empty-state" role="status" aria-live="polite">
                    <i class="fas fa-vote-yea" aria-hidden="true"></i>
                    <h3>No Votes Created</h3>
                    <p>Create your first vote to get started</p>
                    <button class="btn-primary" 
                            id="createVoteBtn"
                            aria-label="Create your first vote">
                        <i class="fas fa-plus" aria-hidden="true"></i> Create Vote
                    </button>
                </div>
            `;
            
            // Rebind create button
            document.getElementById('createVoteBtn')?.addEventListener('click', () => {
                this.showCreateVoteModal();
            });
            
            return;
        }

        container.innerHTML = `
            <div class="votes-grid" role="list" aria-label="List of votes">
                ${votes.map(vote => this.renderVoteCard(vote)).join('')}
            </div>
        `;
        
        console.log('✅ Votes rendered, checking buttons...');
        
        // Verify buttons exist
        const viewButtons = container.querySelectorAll('.view-vote-btn');
        const editButtons = container.querySelectorAll('.edit-vote-btn');
        const deleteButtons = container.querySelectorAll('.delete-vote-btn');
        
        console.log(`📊 Found ${viewButtons.length} view buttons, ${editButtons.length} edit buttons, ${deleteButtons.length} delete buttons`);
    }

    renderVoteCard(vote) {
        const status = vote.status || 'draft';
        const statusColors = {
            active: 'green',
            draft: 'gray',
            completed: 'blue',
            upcoming: 'yellow'
        };

        const votesCast = vote.votes_cast || 0;
        const totalVoters = vote.total_voters || 0;
        const turnout = totalVoters > 0 ? Math.round((votesCast / totalVoters) * 100) : 0;
        const voteTitle = this.escapeHtml(vote.title);

        return `
            <div class="vote-card" 
                 data-vote-id="${this.escapeHtml(vote.id)}"
                 role="article"
                 aria-label="Vote: ${voteTitle}">
                <div class="vote-card-header">
                    <span class="vote-status ${statusColors[status] || 'gray'}" 
                          role="status"
                          aria-label="Status: ${this.escapeHtml(status)}">
                        ${this.escapeHtml(status)}
                    </span>
                    <div class="vote-actions" role="group" aria-label="Vote actions">
                        <button class="view-vote-btn" 
                                data-id="${this.escapeHtml(vote.id)}" 
                                title="View ${voteTitle}"
                                aria-label="View details for ${voteTitle}">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                            <span class="sr-only">View</span>
                        </button>
                        <button class="edit-vote-btn" 
                                data-id="${this.escapeHtml(vote.id)}" 
                                title="Edit ${voteTitle}"
                                aria-label="Edit ${voteTitle}">
                            <i class="fas fa-edit" aria-hidden="true"></i>
                            <span class="sr-only">Edit</span>
                        </button>
                        <button class="delete-vote-btn" 
                                data-id="${this.escapeHtml(vote.id)}" 
                                title="Delete ${voteTitle}"
                                aria-label="Delete ${voteTitle}">
                            <i class="fas fa-trash" aria-hidden="true"></i>
                            <span class="sr-only">Delete</span>
                        </button>
                    </div>
                </div>
                <h3>${voteTitle}</h3>
                <p>${this.escapeHtml(vote.description || 'No description')}</p>
                <div class="vote-meta" role="contentinfo" aria-label="Vote statistics">
                    <span aria-label="Start date: ${new Date(vote.start_date).toLocaleDateString()}">
                        <i class="fas fa-calendar" aria-hidden="true"></i> 
                        ${new Date(vote.start_date).toLocaleDateString()}
                    </span>
                    <span aria-label="${votesCast} votes cast out of ${totalVoters} eligible voters">
                        <i class="fas fa-users" aria-hidden="true"></i> 
                        ${votesCast} / ${totalVoters} votes
                    </span>
                    <span aria-label="Turnout: ${turnout} percent">
                        <i class="fas fa-chart-line" aria-hidden="true"></i> 
                        ${turnout}% turnout
                    </span>
                </div>
            </div>
        `;
    }

    showCreateVoteModal() {
        this.currentOptions = [];
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'createVoteModal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'createVoteModalTitle');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2 id="createVoteModalTitle">
                        <i class="fas fa-poll" aria-hidden="true"></i> Create New Vote
                    </h2>
                    <button class="modal-close" aria-label="Close modal">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-section">
                        <h3>Vote Details</h3>
                        
                        <div class="form-group">
                            <label for="voteTitle">Question/Title *</label>
                            <input type="text" 
                                   id="voteTitle" 
                                   placeholder="e.g., Who should be the next president?" 
                                   required
                                   aria-required="true">
                        </div>
                        
                        <div class="form-group">
                            <label for="voteDescription">Description (Optional)</label>
                            <textarea id="voteDescription" 
                                      rows="3" 
                                      placeholder="Add more context about this vote..."
                                      aria-describedby="descriptionHint"></textarea>
                            <span id="descriptionHint" class="sr-only">Optional description to provide more context</span>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="voteType">Vote Type</label>
                                <select id="voteType" aria-label="Select vote type">
                                    <option value="general">General Poll</option>
                                    <option value="leadership">Leadership Election</option>
                                    <option value="project">Project Selection</option>
                                    <option value="referendum">Yes/No Decision</option>
                                    <option value="special">Special Vote</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="optionType">Option Type</label>
                                <select id="optionType" aria-label="Select option type">
                                    <option value="text">Plain Text</option>
                                    <option value="profile">Candidate (with photo)</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="voteStartDate">Start Date & Time</label>
                                <input type="datetime-local" 
                                       id="voteStartDate" 
                                       required
                                       aria-required="true">
                            </div>
                            
                            <div class="form-group">
                                <label for="voteEndDate">End Date & Time</label>
                                <input type="datetime-local" 
                                       id="voteEndDate" 
                                       required
                                       aria-required="true">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <div class="section-header">
                            <h3>Vote Options</h3>
                            <button class="btn-secondary" 
                                    id="addOptionBtn"
                                    aria-label="Add voting option">
                                <i class="fas fa-plus" aria-hidden="true"></i> Add Option
                            </button>
                        </div>
                        
                        <div id="optionsContainer" 
                             class="options-container"
                             role="list"
                             aria-label="Voting options">
                            <p class="text-muted">Click "Add Option" to create voting choices</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary cancel-modal-btn" aria-label="Cancel and close">
                        Cancel
                    </button>
                    <button class="btn-primary" 
                            id="saveVoteBtn"
                            aria-label="Create vote">
                        <i class="fas fa-check" aria-hidden="true"></i> Create Vote
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
        
        // Set up focus trap for accessibility
        this.trapFocus(modal);
    }

    updateOptionTypeUI() {
        const optionType = document.getElementById('optionType')?.value;
        const container = document.getElementById('optionsContainer');
        
        if (!container) return;
        
        // Show hint based on selected type
        let hint = '';
        switch(optionType) {
            case 'text':
                hint = 'Add plain text options for simple polls';
                break;
            case 'profile':
                hint = 'Add candidates with profile photos';
                break;
            case 'image':
                hint = 'Add image options that users can vote for';
                break;
            case 'video':
                hint = 'Add video options with optional thumbnails';
                break;
        }
        
        // Update hint if container is empty
        if (container.children.length === 0 || container.querySelector('.text-muted')) {
            container.innerHTML = `<p class="text-muted">${hint}</p>`;
        }
    }

    addOption() {
        const optionType = document.getElementById('optionType').value;
        const container = document.getElementById('optionsContainer');
        
        if (container.querySelector('.text-muted')) {
            container.innerHTML = '';
        }
        
        const optionId = Date.now() + Math.floor(Math.random() * 1000);
        this.currentOptions.push({ id: optionId, type: optionType });
        
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
        this.renumberOptions();
    }

    renderTextOption(id) {
        return `
            <div class="option-item" data-option-id="${id}" data-type="text">
                <div class="option-header">
                    <span class="option-number">${this.currentOptions.length}</span>
                    <input type="text" class="option-input" placeholder="Enter option text" required>
                    <button class="btn-icon-danger remove-option-btn" data-option-id="${id}">
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
                    <span class="option-number">${this.currentOptions.length}</span>
                    <div class="option-profile-form">
                        <input type="text" class="option-name" placeholder="Candidate name" required>
                        <input type="url" class="option-photo" placeholder="Photo URL (optional)">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Photo
                            <input type="file" class="photo-upload-input" data-option-id="${id}" accept="image/*" hidden>
                        </label>
                    </div>
                    <button class="btn-icon-danger remove-option-btn" data-option-id="${id}">
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
                    <span class="option-number">${this.currentOptions.length}</span>
                    <div class="option-media-form">
                        <input type="text" class="option-title" placeholder="Image title/description" required>
                        <input type="url" class="option-media-url" placeholder="Image URL">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Image
                            <input type="file" class="media-upload-input" data-option-id="${id}" accept="image/*" hidden>
                        </label>
                    </div>
                    <button class="btn-icon-danger remove-option-btn" data-option-id="${id}">
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
                    <span class="option-number">${this.currentOptions.length}</span>
                    <div class="option-media-form">
                        <input type="text" class="option-title" placeholder="Video title/description" required>
                        <input type="url" class="option-media-url" placeholder="Video URL">
                        <input type="url" class="option-thumbnail" placeholder="Thumbnail URL (optional)">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Video
                            <input type="file" class="media-upload-input" data-option-id="${id}" accept="video/*" hidden>
                        </label>
                    </div>
                    <button class="btn-icon-danger remove-option-btn" data-option-id="${id}">
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
            this.currentOptions = this.currentOptions.filter(opt => opt.id != id);
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
        
        const preview = document.getElementById(`photoPreview${optionId}`);
        if (!preview) return;
        
        // Show loading state
        preview.innerHTML = `<div class="upload-loading"><i class="fas fa-spinner fa-spin"></i> Uploading...</div>`;
        
        try {
            // Upload to storage
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'candidate-photos');
            
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            }, 30000); // 30 second timeout for file uploads
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const { url } = await response.json();
            
            // Show preview with uploaded image
            preview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">`;
            
            // Set the photo URL input
            const photoInput = document.querySelector(`[data-option-id="${optionId}"] .option-photo`);
            if (photoInput) {
                photoInput.value = url;
            }
            
            this.showSuccess('Photo uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            preview.innerHTML = `<div class="upload-error"><i class="fas fa-exclamation-triangle"></i> Upload failed</div>`;
            this.showError('Failed to upload photo');
        }
    }

    async handleMediaUpload(event, optionId) {
        const file = event.target.files[0];
        if (!file) return;
        
        const preview = document.getElementById(`mediaPreview${optionId}`);
        if (!preview) return;
        
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
            this.showError('Please upload an image or video file');
            return;
        }
        
        // Show loading state
        preview.innerHTML = `<div class="upload-loading"><i class="fas fa-spinner fa-spin"></i> Uploading...</div>`;
        
        try {
            // Upload to storage
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', isImage ? 'voting-images' : 'voting-videos');
            
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            }, 30000); // 30 second timeout for file uploads
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const { url } = await response.json();
            
            // Show preview
            if (isImage) {
                preview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">`;
            } else {
                preview.innerHTML = `<video src="${url}" controls style="max-width: 150px; max-height: 100px;"></video>`;
            }
            
            // Set the media URL input
            const urlInput = document.querySelector(`[data-option-id="${optionId}"] .option-media-url`);
            if (urlInput) {
                urlInput.value = url;
            }
            
            this.showSuccess(`${isImage ? 'Image' : 'Video'} uploaded successfully`);
        } catch (error) {
            console.error('Upload error:', error);
            preview.innerHTML = `<div class="upload-error"><i class="fas fa-exclamation-triangle"></i> Upload failed</div>`;
            this.showError('Failed to upload file');
        }
    }

    async saveVote() {
        try {
            const title = document.getElementById('voteTitle')?.value.trim();
            const description = document.getElementById('voteDescription')?.value.trim();
            const voteType = document.getElementById('voteType')?.value;
            const startDate = document.getElementById('voteStartDate')?.value;
            const endDate = document.getElementById('voteEndDate')?.value;
            
            if (!title || !startDate || !endDate) {
                this.showError('Please fill in all required fields');
                return;
            }
            
            if (new Date(startDate) >= new Date(endDate)) {
                this.showError('End date must be after start date');
                return;
            }
            
            const options = [];
            document.querySelectorAll('.option-item').forEach(item => {
                const type = item.dataset.type;
                const optionData = { type };
                
                switch(type) {
                    case 'text':
                        const textInput = item.querySelector('.option-input');
                        if (textInput && textInput.value.trim()) {
                            optionData.name = textInput.value.trim();
                        }
                        break;
                    case 'profile':
                        const nameInput = item.querySelector('.option-name');
                        const photoInput = item.querySelector('.option-photo');
                        if (nameInput && nameInput.value.trim()) {
                            optionData.name = nameInput.value.trim();
                            if (photoInput && photoInput.value.trim()) {
                                optionData.image_url = photoInput.value.trim();
                            }
                        }
                        break;
                    case 'image':
                    case 'video':
                        const titleInput = item.querySelector('.option-title');
                        const mediaUrlInput = item.querySelector('.option-media-url');
                        if (titleInput && titleInput.value.trim()) {
                            optionData.name = titleInput.value.trim();
                            if (mediaUrlInput && mediaUrlInput.value.trim()) {
                                optionData.media_url = mediaUrlInput.value.trim();
                            }
                            if (type === 'video') {
                                const thumbInput = item.querySelector('.option-thumbnail');
                                if (thumbInput && thumbInput.value.trim()) {
                                    optionData.thumbnail_url = thumbInput.value.trim();
                                }
                            }
                        }
                        break;
                }
                
                if (optionData.name) {
                    options.push(optionData);
                }
            });
            
            if (options.length < 2) {
                this.showError('Please add at least 2 valid options');
                return;
            }
            
            // Show loading state on button
            const saveBtn = document.getElementById('saveVoteBtn');
            const originalBtnText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
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
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(voteData)
            }, 15000); // 15 second timeout for create
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create vote');
            }
            
            this.showSuccess('Vote created successfully!');
            document.getElementById('createVoteModal')?.remove();
            this.loadVotes();
            
        } catch (error) {
            console.error('Error saving vote:', error);
            this.showError(error.message || 'Failed to create vote');
            
            // Restore button state
            const saveBtn = document.getElementById('saveVoteBtn');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Create Vote';
            }
        }
    }

    async deleteVote(id) {
        if (!confirm('Are you sure you want to delete this vote? This action cannot be undone.')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }, 10000);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete vote');
            }
            
            this.showSuccess('Vote deleted successfully');
            this.loadVotes();
        } catch (error) {
            console.error('Error deleting vote:', error);
            this.showError(error.message || 'Failed to delete vote');
        }
    }

    async viewVote(id) {
        try {
            // Show loading toast
            const loadingToast = document.createElement('div');
            loadingToast.className = 'toast-notification info';
            loadingToast.id = 'loadingToast';
            loadingToast.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            loadingToast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                background: #3b82f6;
                color: white;
                border-radius: 8px;
                z-index: 9999;
            `;
            document.body.appendChild(loadingToast);
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting/${id}`, {}, 8000);
            
            // Remove loading toast
            loadingToast.remove();
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to load vote details');
            }
            
            const vote = await response.json();
            this.showVoteDetailsModal(vote);
        } catch (error) {
            console.error('Error loading vote:', error);
            document.getElementById('loadingToast')?.remove();
            this.showError(error.message || 'Failed to load vote details');
        }
    }

    showVoteDetailsModal(vote) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2><i class="fas fa-eye"></i> ${this.escapeHtml(vote.title)}</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="vote-details">
                        <div class="detail-row">
                            <strong>Status:</strong>
                            <span class="vote-status ${vote.status || 'draft'}">${this.escapeHtml(vote.status || 'draft')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Description:</strong>
                            <p>${this.escapeHtml(vote.description || 'No description')}</p>
                        </div>
                        <div class="detail-row">
                            <strong>Type:</strong>
                            <span>${this.escapeHtml(vote.election_type)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Start Date:</strong>
                            <span>${new Date(vote.start_date).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <strong>End Date:</strong>
                            <span>${new Date(vote.end_date).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Votes Cast:</strong>
                            <span>${vote.votes_cast || 0} / ${vote.total_voters || 0} (${vote.total_voters > 0 ? Math.round((vote.votes_cast / vote.total_voters) * 100) : 0}% turnout)</span>
                        </div>
                        
                        ${vote.positions && vote.positions.length > 0 ? `
                            <div class="detail-row">
                                <strong>Positions & Candidates:</strong>
                                <div class="positions-list">
                                    ${vote.positions.map(pos => `
                                        <div class="position-item">
                                            <h4>${this.escapeHtml(pos.title)}</h4>
                                            <ul>
                                                ${pos.candidates?.map(c => `<li>${this.escapeHtml(c.name)}</li>`).join('') || '<li>No candidates</li>'}
                                            </ul>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary cancel-modal-btn">Close</button>
                    <button class="btn-primary edit-vote-btn" data-id="${this.escapeHtml(vote.id)}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up focus trap for accessibility
        this.trapFocus(modal);
    }

    async editVote(id) {
        try {
            // Show loading toast
            const loadingToast = document.createElement('div');
            loadingToast.className = 'toast-notification info';
            loadingToast.id = 'loadingToast';
            loadingToast.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            loadingToast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                background: #3b82f6;
                color: white;
                border-radius: 8px;
                z-index: 9999;
            `;
            document.body.appendChild(loadingToast);
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting/${id}`, {}, 8000);
            
            // Remove loading toast
            loadingToast.remove();
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to load vote details');
            }
            
            const vote = await response.json();
            this.showEditVoteModal(vote);
        } catch (error) {
            console.error('Error loading vote:', error);
            document.getElementById('loadingToast')?.remove();
            this.showError(error.message || 'Failed to load vote details');
        }
    }

    showEditVoteModal(vote) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'editVoteModal';
        
        // Store current options for editing
        this.currentOptions = [];
        
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Edit Vote</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-section">
                        <h3>Vote Details</h3>
                        
                        <div class="form-group">
                            <label>Question/Title *</label>
                            <input type="text" id="editVoteTitle" value="${this.escapeHtml(vote.title)}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="editVoteDescription" rows="3">${this.escapeHtml(vote.description || '')}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Vote Type</label>
                                <select id="editVoteType">
                                    <option value="general" ${vote.election_type === 'general' ? 'selected' : ''}>General Poll</option>
                                    <option value="leadership" ${vote.election_type === 'leadership' ? 'selected' : ''}>Leadership Election</option>
                                    <option value="project" ${vote.election_type === 'project' ? 'selected' : ''}>Project Selection</option>
                                    <option value="referendum" ${vote.election_type === 'referendum' ? 'selected' : ''}>Yes/No Decision</option>
                                    <option value="special" ${vote.election_type === 'special' ? 'selected' : ''}>Special Vote</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Status</label>
                                <select id="editVoteStatus">
                                    <option value="draft" ${vote.status === 'draft' ? 'selected' : ''}>Draft</option>
                                    <option value="upcoming" ${vote.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                                    <option value="active" ${vote.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="completed" ${vote.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Start Date & Time</label>
                                <input type="datetime-local" id="editVoteStartDate" value="${new Date(vote.start_date).toISOString().slice(0, 16)}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>End Date & Time</label>
                                <input type="datetime-local" id="editVoteEndDate" value="${new Date(vote.end_date).toISOString().slice(0, 16)}" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="editResultsVisible" ${vote.results_visible ? 'checked' : ''}>
                                Make results visible before completion
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="editAnonymousVoting" ${vote.anonymous_voting ? 'checked' : ''}>
                                Enable anonymous voting
                            </label>
                        </div>
                    </div>
                    
                    <!-- Candidates/Options Section -->
                    <div class="form-section">
                        <div class="section-header">
                            <h3>Candidates/Options</h3>
                            <button class="btn-secondary" id="addEditOptionBtn">
                                <i class="fas fa-plus"></i> Add Option
                            </button>
                        </div>
                        
                        <div id="editOptionsContainer" class="options-container">
                            ${this.renderExistingOptions(vote)}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary cancel-modal-btn">Cancel</button>
                    <button class="btn-primary" id="updateVoteBtn" data-id="${this.escapeHtml(vote.id)}">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind add option button for edit modal
        document.getElementById('addEditOptionBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.addEditOption();
        });
        
        // Set up focus trap for accessibility
        this.trapFocus(modal);
    }

    renderExistingOptions(vote) {
        if (!vote.positions || vote.positions.length === 0 || !vote.positions[0].candidates) {
            return '<p class="text-muted">No options available. Click "Add Option" to create new ones.</p>';
        }
        
        const candidates = vote.positions[0].candidates;
        let html = '';
        
        candidates.forEach((candidate, index) => {
            const optionId = Date.now() + index;
            this.currentOptions.push({ id: optionId, candidateId: candidate.id });
            
            // Determine option type based on candidate data
            let type = 'text';
            if (candidate.image_url) type = 'profile';
            if (candidate.media_url && candidate.media_type === 'image') type = 'image';
            if (candidate.media_url && candidate.media_type === 'video') type = 'video';
            
            html += `
                <div class="option-item" data-option-id="${optionId}" data-candidate-id="${candidate.id}" data-type="${type}">
                    <div class="option-header">
                        <span class="option-number">${index + 1}</span>
                        ${this.renderEditOptionFields(type, candidate, optionId)}
                        <button class="btn-icon-danger remove-option-btn" data-option-id="${optionId}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    ${type === 'profile' && candidate.image_url ? `
                        <div class="photo-preview" id="photoPreview${optionId}">
                            <img src="${candidate.image_url}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
                        </div>
                    ` : ''}
                    ${(type === 'image' || type === 'video') && candidate.media_url ? `
                        <div class="media-preview" id="mediaPreview${optionId}">
                            ${type === 'image' ? 
                                `<img src="${candidate.media_url}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">` :
                                `<video src="${candidate.media_url}" controls style="max-width: 150px; max-height: 100px;"></video>`
                            }
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        return html;
    }

    renderEditOptionFields(type, candidate, optionId) {
        switch(type) {
            case 'text':
                return `<input type="text" class="option-input" value="${this.escapeHtml(candidate.name)}" required>`;
            
            case 'profile':
                return `
                    <div class="option-profile-form">
                        <input type="text" class="option-name" value="${this.escapeHtml(candidate.name)}" required>
                        <input type="url" class="option-photo" value="${this.escapeHtml(candidate.image_url || '')}" placeholder="Photo URL (optional)">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Photo
                            <input type="file" class="photo-upload-input" data-option-id="${optionId}" accept="image/*" hidden>
                        </label>
                    </div>
                `;
            
            case 'image':
                return `
                    <div class="option-media-form">
                        <input type="text" class="option-title" value="${this.escapeHtml(candidate.name)}" required>
                        <input type="url" class="option-media-url" value="${this.escapeHtml(candidate.media_url || '')}" placeholder="Image URL">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Image
                            <input type="file" class="media-upload-input" data-option-id="${optionId}" accept="image/*" hidden>
                        </label>
                    </div>
                `;
            
            case 'video':
                return `
                    <div class="option-media-form">
                        <input type="text" class="option-title" value="${this.escapeHtml(candidate.name)}" required>
                        <input type="url" class="option-media-url" value="${this.escapeHtml(candidate.media_url || '')}" placeholder="Video URL">
                        <input type="url" class="option-thumbnail" value="${this.escapeHtml(candidate.thumbnail_url || '')}" placeholder="Thumbnail URL (optional)">
                        <label class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload Video
                            <input type="file" class="media-upload-input" data-option-id="${optionId}" accept="video/*" hidden>
                        </label>
                    </div>
                `;
        }
    }

    addEditOption() {
        const container = document.getElementById('editOptionsContainer');
        if (!container) return;
        
        if (container.querySelector('.text-muted')) {
            container.innerHTML = '';
        }
        
        const optionId = Date.now() + Math.floor(Math.random() * 1000);
        this.currentOptions.push({ id: optionId });
        
        // Default to text type for new options
        const optionHTML = `
            <div class="option-item" data-option-id="${optionId}" data-type="text">
                <div class="option-header">
                    <span class="option-number">${this.currentOptions.length}</span>
                    <input type="text" class="option-input" placeholder="Enter option text" required>
                    <button class="btn-icon-danger remove-option-btn" data-option-id="${optionId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', optionHTML);
        this.renumberOptions();
    }

    async updateVote(id) {
        try {
            const title = document.getElementById('editVoteTitle')?.value.trim();
            const description = document.getElementById('editVoteDescription')?.value.trim();
            const electionType = document.getElementById('editVoteType')?.value;
            const status = document.getElementById('editVoteStatus')?.value;
            const startDate = document.getElementById('editVoteStartDate')?.value;
            const endDate = document.getElementById('editVoteEndDate')?.value;
            const resultsVisible = document.getElementById('editResultsVisible')?.checked || false;
            const anonymousVoting = document.getElementById('editAnonymousVoting')?.checked || false;
            
            if (!title || !startDate || !endDate) {
                this.showError('Please fill in all required fields');
                return;
            }
            
            if (new Date(startDate) >= new Date(endDate)) {
                this.showError('End date must be after start date');
                return;
            }
            
            // Show loading state on button
            const updateBtn = document.getElementById('updateVoteBtn');
            const originalBtnText = updateBtn.innerHTML;
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const response = await this.fetchWithTimeout(`${this.apiBase}/voting/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    electionType,
                    status,
                    startDate,
                    endDate,
                    resultsVisible,
                    anonymousVoting
                })
            }, 15000); // 15 second timeout for update
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update vote');
            }
            
            this.showSuccess('Vote updated successfully!');
            document.getElementById('editVoteModal')?.remove();
            this.loadVotes();
            
        } catch (error) {
            console.error('Error updating vote:', error);
            this.showError(error.message || 'Failed to update vote');
            
            // Restore button state
            const updateBtn = document.getElementById('updateVoteBtn');
            if (updateBtn) {
                updateBtn.disabled = false;
                updateBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            }
        }
    }
}

// Initialize
console.log('🔧 Creating window.cmsVoting instance...');
window.cmsVoting = new CMSVoting();
console.log('✅ window.cmsVoting created:', window.cmsVoting);