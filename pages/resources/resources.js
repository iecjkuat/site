// JKUAT Innovation Club - Resources Page

class ResourcesPage {
    constructor() {
        this.resources = [];
        this.filteredResources = [];
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.totalPages = 1;
        this.isLoading = false;
        this.searchQuery = '';
        
        // Memory management & cleanup
        this.searchTimeout = null;
        this.loadController = null;
        this.abortController = new AbortController();
        this.eventHandlers = new Map();
        
        // API configuration
        this.API = {
            BASE: '/api/v1',
            RESOURCES: '/resources',
            DOWNLOAD: (id) => `/resources/${id}/download`
        };
        
        this.init();
    }
    
    /**
     * Get authentication token
     * @returns {string} - Auth token or empty string
     */
    getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    }
    
    /**
     * Validate resource ID
     * @param {string|number} id - The ID to validate
     * @returns {number} - Validated ID as number
     */
    validateResourceId(id) {
        if (!id) {
            throw new Error('Resource ID is required');
        }
        
        // Handle both UUID and integer IDs
        if (typeof id === 'string' && id.includes('-')) {
            // UUID format
            return id;
        }
        
        const num = parseInt(id);
        if (isNaN(num) || num <= 0) {
            // If not a valid number, return as string (might be UUID)
            return id;
        }
        
        return num;
    }
    
    /**
     * Cleanup method - prevents memory leaks
     */
    destroy() {
        console.log('🧹 Cleaning up Resources Page...');
        
        // Clear timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Abort in-flight requests
        if (this.loadController) {
            this.loadController.abort();
        }
        this.abortController.abort();
        
        // Remove event listeners
        this.eventHandlers.forEach((handler, element) => {
            const [eventType, fn] = handler;
            element.removeEventListener(eventType, fn);
        });
        this.eventHandlers.clear();
        
        console.log('✅ Resources Page cleaned up');
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

    async init() {
        console.log('📚 Initializing Resources Page...');

        try {
            // Load resources data
            await this.loadResources();

            // Setup event listeners
            this.setupEventListeners();
            this.setupDocumentListeners(); // Refactored to call once

            // Update stats
            this.updateStats();

            console.log('✅ Resources Page initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing resources page:', error);
            this.showError('Failed to load resources');
        }
    }

    async loadResources(category = 'all', page = 1, append = false) {
        this.isLoading = true;
        this.showLoading();

        try {
            console.log('📊 Loading resources data...');

            // Cancel previous request
            if (this.loadController) {
                this.loadController.abort();
            }
            this.loadController = new AbortController();

            // Build API URL using consistent endpoint
            let apiUrl = `${this.API.BASE}${this.API.RESOURCES}?page=${page}&limit=12`;
            if (category !== 'all') {
                apiUrl += `&category=${encodeURIComponent(category)}`;
            }

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                signal: this.loadController.signal
            });

            if (response.ok) {
                const data = await response.json();
                const newResources = data.resources || [];
                
                // Append or replace resources
                if (append) {
                    this.resources = [...this.resources, ...newResources];
                    this.filteredResources = [...this.filteredResources, ...newResources];
                } else {
                    this.resources = newResources;
                    this.filteredResources = [...this.resources];
                }
                
                this.currentPage = data.pagination?.current || 1;
                this.totalPages = data.pagination?.total || 1;

                console.log('✅ Resources loaded:', newResources.length);
            } else {
                if (response.status === 401) {
                    throw new Error('Please log in to view resources');
                } else if (response.status === 429) {
                    throw new Error('Too many requests. Please try again later');
                }
                console.error('❌ API failed with status:', response.status);
                throw new Error('API request failed');
            }

            this.renderResources();

        } catch (error) {
            // Handle abort gracefully
            if (error.name === 'AbortError') {
                console.log('Request was cancelled');
                return;
            }
            
            console.error('❌ Error loading resources:', error);
            
            // More specific error messages
            let message = 'Failed to load resources';
            if (error.message.includes('log in')) {
                message = error.message;
                setTimeout(() => window.location.href = '/pages/auth/signin.html', 2000);
            } else if (error.message.includes('Too many requests')) {
                message = error.message;
            } else if (error.message.includes('Failed to fetch')) {
                message = 'Network error. Please check your internet connection';
            }
            
            this.showMessage(message, 'error');
            
            if (!append) {
                this.resources = [];
                this.filteredResources = [];
                this.renderResources();
            }
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // Removed getMockResources() - using only real data from database

    renderResources() {
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;

        if (this.filteredResources.length === 0) {
            resourcesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No Resources Found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                    <button class="btn btn-primary" data-action="reset-filters">
                        <i class="fas fa-refresh"></i> Reset Filters
                    </button>
                </div>
            `;
            return;
        }

        resourcesGrid.innerHTML = this.filteredResources.map(resource => `
            <div class="glass-card resource-card" data-category="${this.escapeHtml(resource.category)}">
                <div class="resource-header">
                    <div class="resource-category-badge ${this.escapeHtml(resource.category.toLowerCase())}">
                        <i class="fas ${this.escapeHtml(this.getCategoryIcon(resource.category))}"></i>
                        ${this.escapeHtml(resource.category)}
                    </div>
                    <div class="resource-access-level ${this.escapeHtml((resource.accessLevel || 'public').toLowerCase())}">
                        ${this.escapeHtml(resource.accessLevel || 'PUBLIC')}
                    </div>
                </div>
                
                <div class="resource-content">
                    <h3 class="resource-title">${this.escapeHtml(resource.title)}</h3>
                    <p class="resource-description">${this.escapeHtml(resource.description)}</p>
                    
                    <div class="resource-meta">
                        <div class="meta-item">
                            <i class="fas fa-file-${this.escapeHtml(this.getFileIcon(resource.fileType))}"></i>
                            <span>${this.escapeHtml((resource.fileType || 'FILE').toUpperCase())}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-download"></i>
                            <span>${this.escapeHtml(resource.downloadCount || 0)} downloads</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-weight-hanging"></i>
                            <span>${this.escapeHtml(resource.fileSize || 'Unknown size')}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${new Date(resource.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="resource-uploader">
                        <i class="fas fa-user"></i>
                        <span>Uploaded by ${this.escapeHtml(resource.uploader?.name || 'Unknown')}</span>
                    </div>
                    
                    ${resource.tags && resource.tags.length > 0 ? `
                        <div class="resource-tags">
                            ${resource.tags.slice(0, 3).map(tag => `
                                <span class="tag">${this.escapeHtml(tag)}</span>
                            `).join('')}
                            ${resource.tags.length > 3 ? `<span class="tag-more">+${resource.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="resource-actions">
                    <button class="btn btn-primary" data-action="download" data-resource-id="${this.escapeHtml(resource.id)}">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-outline" data-action="preview" data-resource-id="${this.escapeHtml(resource.id)}">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for the buttons
        this.addResourceButtonListeners();
    }

    addResourceButtonListeners() {
        // This method is now only for grid-specific listeners if needed, 
        // but it's largely replaced by setupDocumentListeners for efficiency.
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid || resourcesGrid.dataset.listenersAttached) return;

        // Use event delegation to handle dynamically created buttons within the grid
        resourcesGrid.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const resourceId = button.dataset.resourceId;

            switch (action) {
                case 'download':
                    if (resourceId) {
                        this.downloadResource(resourceId); // Don't parse, let validateResourceId handle it
                    }
                    break;
                case 'preview':
                    if (resourceId) {
                        this.previewResource(resourceId); // Don't parse, let validateResourceId handle it
                    }
                    break;
                case 'reset-filters':
                    this.resetFilters();
                    break;
            }
        });

        resourcesGrid.dataset.listenersAttached = 'true';
    }

    setupDocumentListeners() {
        // Handle modal events globally, added once in init
        // Use AbortController for cleanup
        const clickHandler = (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) {
                // Close modal when clicking backdrop
                if (e.target.classList.contains('modal-backdrop')) {
                    e.target.remove();
                    document.body.style.overflow = 'auto';
                }
                return;
            }

            const action = button.dataset.action;

            switch (action) {
                case 'close-modal':
                    const modal = button.closest('.modal-backdrop');
                    if (modal) {
                        modal.remove();
                        document.body.style.overflow = 'auto';
                    }
                    break;
                case 'download':
                    const resourceId = button.dataset.resourceId;
                    const closeModal = button.dataset.closeModal;
                    if (resourceId) {
                        try {
                            const validId = this.validateResourceId(resourceId);
                            this.downloadResource(validId);
                            if (closeModal === 'true') {
                                const modal = button.closest('.modal-backdrop');
                                if (modal) {
                                    setTimeout(() => {
                                        modal.remove();
                                        document.body.style.overflow = 'auto';
                                    }, 1000);
                                }
                            }
                        } catch (error) {
                            this.showMessage(error.message, 'error');
                        }
                    }
                    break;
                case 'submit-upload':
                    this.submitUpload();
                    break;
            }
        };
        
        document.addEventListener('click', clickHandler, { 
            signal: this.abortController.signal 
        });
    }

    setupEventListeners() {
        // Category filter buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const category = button.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('resourceSearch');
        if (searchInput) {
            const searchHandler = (e) => {
                clearTimeout(this.searchTimeout);
                
                // Cancel previous request
                if (this.loadController) {
                    this.loadController.abort();
                }
                
                this.searchTimeout = setTimeout(() => {
                    this.searchResources(e.target.value);
                }, 300);
            };
            
            searchInput.addEventListener('input', searchHandler);
            this.eventHandlers.set(searchInput, ['input', searchHandler]);
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreResourcesBtn');
        if (loadMoreBtn) {
            const loadMoreHandler = () => this.loadMoreResources();
            loadMoreBtn.addEventListener('click', loadMoreHandler);
            this.eventHandlers.set(loadMoreBtn, ['click', loadMoreHandler]);
        }

        // Upload resource button
        const uploadBtn = document.getElementById('uploadResourceBtn');
        if (uploadBtn) {
            const uploadHandler = () => this.showUploadModal();
            uploadBtn.addEventListener('click', uploadHandler);
            this.eventHandlers.set(uploadBtn, ['click', uploadHandler]);
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;

        if (category === 'all') {
            this.filteredResources = [...this.resources];
        } else {
            this.filteredResources = this.resources.filter(resource =>
                resource.category.toLowerCase() === category.toLowerCase()
            );
        }

        this.renderResources();
        this.updateStats();
    }

    searchResources(query) {
        this.searchQuery = query.toLowerCase().trim();

        if (!this.searchQuery) {
            this.filteredResources = [...this.resources];
        } else {
            this.filteredResources = this.resources.filter(resource =>
                resource.title.toLowerCase().includes(this.searchQuery) ||
                resource.description.toLowerCase().includes(this.searchQuery) ||
                resource.category.toLowerCase().includes(this.searchQuery) ||
                (resource.tags && resource.tags.some(tag =>
                    tag.toLowerCase().includes(this.searchQuery)
                ))
            );
        }

        this.renderResources();
        this.updateStats();
    }

    async downloadResource(resourceId) {
        try {
            // Validate resource ID
            const validId = this.validateResourceId(resourceId);
            
            const resource = this.resources.find(r => r.id == validId); // Use == for loose comparison
            if (!resource) {
                console.error('Resource not found. Looking for ID:', validId, 'in resources:', this.resources.map(r => ({ id: r.id, title: r.title })));
                this.showMessage('Resource not found', 'error');
                return;
            }

            console.log('📥 Downloading resource:', resource.title);
            console.log('   - ID:', resource.id);
            console.log('   - File URL:', resource.fileUrl);
            console.log('   - Storage Path:', resource.storagePath);

            // Show download starting message
            this.showMessage('Starting download...', 'info');

            try {
                // Use consistent API endpoint
                console.log('Calling API:', `${this.API.BASE}${this.API.DOWNLOAD(validId)}`);
                const response = await fetch(`${this.API.BASE}${this.API.DOWNLOAD(validId)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });

                console.log('API Response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response data:', data);

                    // Update download count in UI
                    resource.downloadCount = (resource.downloadCount || 0) + 1;
                    this.renderResources();

                    // If API provides download URL, use it
                    if (data.downloadUrl) {
                        console.log('Using download URL from API:', data.downloadUrl);
                        
                        // Try direct download first
                        this.initiateDownload(data.downloadUrl, data.fileName || resource.title);
                        
                        // If direct download might not work (opens in browser), offer proxy option
                        setTimeout(() => {
                            console.log('If download didn\'t start, you can use proxy endpoint');
                        }, 2000);
                        
                        this.showMessage(`Downloaded: ${resource.title}`, 'success');
                    } else {
                        console.warn('No download URL in response, trying proxy endpoint');
                        // Try proxy endpoint as fallback
                        const proxyUrl = `${this.API.BASE}/resources/${validId}/download-proxy`;
                        window.location.href = proxyUrl;
                        this.showMessage(`Downloading: ${resource.title}`, 'success');
                    }

                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Download API error:', response.status, errorData);
                    
                    // Try proxy endpoint as fallback
                    console.log('Trying proxy endpoint as fallback');
                    const proxyUrl = `${this.API.BASE}/resources/${validId}/download-proxy`;
                    window.location.href = proxyUrl;
                    this.showMessage(`Downloading: ${resource.title}`, 'info');
                }
            } catch (apiError) {
                console.error('API download failed:', apiError);
                
                // Try proxy endpoint as last resort
                console.log('Trying proxy endpoint as last resort');
                const proxyUrl = `${this.API.BASE}/resources/${validId}/download-proxy`;
                window.location.href = proxyUrl;
                this.showMessage(`Downloading: ${resource.title}`, 'info');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showMessage(error.message || 'Download failed', 'error');
        }
    }

    initiateDownload(url, filename) {
        console.log('Initiating download:', { url, filename });
        
        // For Supabase Storage URLs, use direct link with download attribute
        // This works better than fetch for large files and avoids CORS issues
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank'; // Fallback if download attribute doesn't work
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
        
        console.log('Download link clicked');
    }

    async fetchAndDownload(url, filename) {
        // This method is no longer used - keeping for backwards compatibility
        console.warn('fetchAndDownload is deprecated, using direct download');
        this.initiateDownload(url, filename);
    }

    downloadViaIframe(url, filename) {
        // This method is no longer used - keeping for backwards compatibility
        console.warn('downloadViaIframe is deprecated, using direct download');
        this.initiateDownload(url, filename);
    }

    simulateDownload(resource) {
        // Simulate file download for demo purposes
        const content = this.generateDownloadContent(resource);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const filename = `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        this.initiateDownload(url, filename);

        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        // Update download count
        resource.downloadCount = (resource.downloadCount || 0) + 1;
        this.renderResources();
    }

    generateDownloadContent(resource) {
        return `
JKUAT Innovation and Entrepreneurship Club
${resource.title}
${'='.repeat(resource.title.length + 40)}

Category: ${resource.category}
File Type: ${(resource.fileType || 'Unknown').toUpperCase()}
Downloads: ${resource.downloadCount || 0}
Uploaded: ${new Date(resource.createdAt).toLocaleDateString()}
Uploader: ${resource.uploader?.name || 'Unknown'}

Description:
${resource.description}

${resource.tags && resource.tags.length > 0 ? `
Tags: ${resource.tags.join(', ')}
` : ''}

Content:
--------
This is a sample document for the JKUAT Innovation and Entrepreneurship Club.

The actual document would contain detailed information about:
- ${resource.category} guidelines and procedures
- Best practices and methodologies
- Implementation examples and case studies
- Resources and references

For the full document content, please contact the club administration
or check the official club resources repository.

---
Generated: ${new Date().toLocaleString()}
JKUAT Innovation Club - Resources System
        `.trim();
    }

    previewResource(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return;

        this.showResourcePreviewModal(resource);
    }

    showResourcePreviewModal(resource) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content preview-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-eye"></i> Preview: ${this.escapeHtml(resource.title)}</h2>
                    <button class="modal-close" data-action="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="preview-container">
                        ${this.generatePreviewContent(resource)}
                    </div>
                    
                    <div class="preview-info">
                        <div class="info-row">
                            <strong>File Type:</strong> ${this.escapeHtml((resource.fileType || 'Unknown').toUpperCase())}
                        </div>
                        <div class="info-row">
                            <strong>File Size:</strong> ${this.escapeHtml(resource.fileSize || 'Unknown')}
                        </div>
                        <div class="info-row">
                            <strong>Downloads:</strong> ${this.escapeHtml(resource.downloadCount || 0)}
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" data-action="download" data-resource-id="${this.escapeHtml(resource.id)}" data-close-modal="true">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="btn btn-outline" data-action="close-modal">
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    generatePreviewContent(resource) {
        const fileType = (resource.fileType || '').toLowerCase();

        // For demo purposes, we'll show sample content based on file type
        // In a real application, you'd fetch the actual file content
        switch (fileType) {
            case 'pdf':
                return `
                    <div class="pdf-preview">
                        <div class="pdf-header">
                            <i class="fas fa-file-pdf"></i>
                            <span>PDF Document Preview</span>
                        </div>
                        <div class="pdf-content">
                            <h3>${this.escapeHtml(resource.title)}</h3>
                            <p><strong>Document Summary:</strong></p>
                            <p>${this.escapeHtml(resource.description)}</p>
                            
                            <div class="sample-content">
                                <h4>Sample Content:</h4>
                                <div class="content-block">
                                    <p>This is a preview of the ${this.escapeHtml(resource.category.toLowerCase())} document. The full document contains detailed information about:</p>
                                    <ul>
                                        <li>Club policies and procedures</li>
                                        <li>Member guidelines and expectations</li>
                                        <li>Innovation frameworks and methodologies</li>
                                        <li>Technical standards and best practices</li>
                                    </ul>
                                    <p><em>Download the full document to access all content and detailed sections.</em></p>
                                </div>
                            </div>
                        </div>
                        <div class="preview-note">
                            <i class="fas fa-info-circle"></i>
                            This is a limited preview. Download the full document for complete content.
                        </div>
                    </div>
                `;

            case 'doc':
            case 'docx':
                return `
                    <div class="doc-preview">
                        <div class="doc-header">
                            <i class="fas fa-file-word"></i>
                            <span>Word Document Preview</span>
                        </div>
                        <div class="doc-content">
                            <div class="document-title">${this.escapeHtml(resource.title)}</div>
                            <div class="document-meta">
                                <span>Category: ${this.escapeHtml(resource.category)}</span> | 
                                <span>Type: ${this.escapeHtml(resource.fileType.toUpperCase())}</span>
                            </div>
                            
                            <div class="document-body">
                                <h3>Document Overview</h3>
                                <p>${this.escapeHtml(resource.description)}</p>
                                
                                <h3>Key Sections</h3>
                                <div class="section-list">
                                    <div class="section-item">
                                        <strong>1. Introduction</strong>
                                        <p>Overview of the ${this.escapeHtml(resource.category.toLowerCase())} and its purpose within the JKUAT Innovation Club.</p>
                                    </div>
                                    <div class="section-item">
                                        <strong>2. Guidelines</strong>
                                        <p>Detailed instructions and best practices for implementation.</p>
                                    </div>
                                    <div class="section-item">
                                        <strong>3. Examples</strong>
                                        <p>Practical examples and case studies for reference.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="preview-note">
                            <i class="fas fa-info-circle"></i>
                            Preview shows document structure. Download for full content and formatting.
                        </div>
                    </div>
                `;

            case 'txt':
                return `
                    <div class="txt-preview">
                        <div class="txt-header">
                            <i class="fas fa-file-alt"></i>
                            <span>Text Document Preview</span>
                        </div>
                        <div class="txt-content">
                            <pre class="text-content">
${this.escapeHtml(resource.title)}
${'='.repeat(resource.title.length)}

Description: ${this.escapeHtml(resource.description)}

Category: ${this.escapeHtml(resource.category)}

This is a sample preview of the text document content.
The actual document contains detailed information and
instructions related to ${this.escapeHtml(resource.category.toLowerCase())}.

Key topics covered:
- Innovation methodologies
- Club procedures and guidelines
- Best practices and standards
- Implementation examples

Download the complete document to access all content.
                            </pre>
                        </div>
                    </div>
                `;

            default:
                return `
                    <div class="generic-preview">
                        <div class="generic-header">
                            <i class="fas fa-file"></i>
                            <span>File Preview</span>
                        </div>
                        <div class="generic-content">
                            <h3>${this.escapeHtml(resource.title)}</h3>
                            <p><strong>Description:</strong> ${this.escapeHtml(resource.description)}</p>
                            <p><strong>Category:</strong> ${this.escapeHtml(resource.category)}</p>
                            <p><strong>File Type:</strong> ${this.escapeHtml((resource.fileType || 'Unknown').toUpperCase())}</p>
                            
                            <div class="file-info">
                                <p>This file type (${this.escapeHtml(resource.fileType || 'unknown')}) cannot be previewed directly in the browser.</p>
                                <p>Please download the file to view its contents with the appropriate application.</p>
                            </div>
                        </div>
                        <div class="preview-note">
                            <i class="fas fa-download"></i>
                            Download required to view this file type.
                        </div>
                    </div>
                `;
        }
    }

    showResourceModal(resource) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.escapeHtml(resource.title)}</h2>
                    <button class="modal-close" data-action="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="resource-preview">
                        <div class="preview-icon">
                            <i class="fas fa-file-${this.escapeHtml(this.getFileIcon(resource.fileType))}"></i>
                        </div>
                        <div class="preview-details">
                            <h3>${this.escapeHtml(resource.title)}</h3>
                            <p>${this.escapeHtml(resource.description)}</p>
                            
                            <div class="preview-meta">
                                <div class="meta-row">
                                    <strong>Category:</strong> ${this.escapeHtml(resource.category)}
                                </div>
                                <div class="meta-row">
                                    <strong>File Type:</strong> ${this.escapeHtml((resource.fileType || 'Unknown').toUpperCase())}
                                </div>
                                <div class="meta-row">
                                    <strong>File Size:</strong> ${this.escapeHtml(resource.fileSize || 'Unknown')}
                                </div>
                                <div class="meta-row">
                                    <strong>Downloads:</strong> ${this.escapeHtml(resource.downloadCount || 0)}
                                </div>
                                <div class="meta-row">
                                    <strong>Uploaded:</strong> ${new Date(resource.createdAt).toLocaleDateString()}
                                </div>
                                <div class="meta-row">
                                    <strong>Uploader:</strong> ${this.escapeHtml(resource.uploader?.name || 'Unknown')}
                                </div>
                            </div>
                            
                            ${resource.tags && resource.tags.length > 0 ? `
                                <div class="preview-tags">
                                    <strong>Tags:</strong>
                                    <div class="tags-list">
                                        ${resource.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" data-action="download" data-resource-id="${this.escapeHtml(resource.id)}" data-close-modal="true">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="btn btn-outline" data-action="close-modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Upload Resource</h2>
                    <button class="modal-close" data-action="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="uploadProgress" class="upload-progress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <p id="progressText">Uploading...</p>
                    </div>
                    <form id="uploadResourceForm" class="upload-form">
                        <div class="form-group">
                            <label for="resourceTitle">Title *</label>
                            <input type="text" id="resourceTitle" name="title" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="resourceDescription">Description *</label>
                            <textarea id="resourceDescription" name="description" rows="3" required></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="resourceCategory">Category *</label>
                                <select id="resourceCategory" name="category" required>
                                    <option value="">Select Category</option>
                                    <option value="Constitution">Constitution</option>
                                    <option value="Handbook">Handbook</option>
                                    <option value="Templates">Templates</option>
                                    <option value="Guidelines">Guidelines</option>
                                    <option value="Innovation">Innovation</option>
                                    <option value="Technical">Technical</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="resourceAccess">Access Level *</label>
                                <select id="resourceAccess" name="accessLevel" required>
                                    <option value="PUBLIC">Public</option>
                                    <option value="MEMBERS">Members Only</option>
                                    <option value="LEADERSHIP">Leadership Only</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="resourceFile">File *</label>
                            <input type="file" id="resourceFile" name="file" accept=".pdf,.doc,.docx,.txt,.zip" required onchange="validateFile(this)">
                            <small>Supported formats: PDF, DOC, DOCX, TXT, ZIP (Max 10MB)</small>
                            <div id="fileValidationMessage" class="validation-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="resourceTags">Tags (comma-separated)</label>
                            <input type="text" id="resourceTags" name="tags" placeholder="e.g., guide, template, innovation">
                        </div>
                    </form>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" data-action="submit-upload">
                            <i class="fas fa-upload"></i> Upload Resource
                        </button>
                        <button class="btn btn-outline" data-action="close-modal">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    validateFile(input) {
        const file = input.files[0];
        const validationMessage = document.getElementById('fileValidationMessage');
        
        if (!file) {
            validationMessage.textContent = '';
            return true;
        }

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            validationMessage.textContent = 'Invalid file type. Please select a supported format.';
            validationMessage.className = 'validation-message error';
            input.value = '';
            return false;
        }

        if (file.size > maxSize) {
            validationMessage.textContent = 'File too large. Maximum size is 10MB.';
            validationMessage.className = 'validation-message error';
            input.value = '';
            return false;
        }

        validationMessage.textContent = 'File validated successfully.';
        validationMessage.className = 'validation-message success';
        return true;
    }

    async submitUpload() {
        const form = document.getElementById('uploadResourceForm');
        const formData = new FormData(form);
        const fileInput = document.getElementById('resourceFile');

        if (!this.validateFile(fileInput)) {
            return;
        }

        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        try {
            progressContainer.style.display = 'block';
            this.showMessage('Uploading resource...', 'info');

            // Simulate upload with progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Uploading... ${Math.round(progress)}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 200);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 3000));

            clearInterval(interval);
            progressFill.style.width = '100%';
            progressText.textContent = 'Upload complete!';

            setTimeout(() => {
                this.showMessage('Resource uploaded successfully!', 'success');
                document.querySelector('.modal-backdrop').remove();
                this.loadResources();
            }, 500);

        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage('Upload failed', 'error');
            progressContainer.style.display = 'none';
        }
    }

    loadMoreResources() {
        if (this.currentPage < this.totalPages) {
            // Pass true to append resources instead of replacing
            this.loadResources(this.currentCategory, this.currentPage + 1, true);
        }
    }

    resetFilters() {
        this.currentCategory = 'all';

        // Reset UI
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-category="all"]')?.classList.add('active');

        this.filteredResources = [...this.resources];
        this.renderResources();
        this.updateStats();
    }

    updateStats() {
        // Update hero stats
        const totalResourcesEl = document.getElementById('totalResourcesCount');
        const categoriesEl = document.getElementById('categoriesCount');
        const downloadsEl = document.getElementById('downloadsCount');

        if (totalResourcesEl) {
            totalResourcesEl.textContent = this.filteredResources.length;
        }

        if (categoriesEl) {
            const uniqueCategories = [...new Set(this.resources.map(r => r.category))];
            categoriesEl.textContent = uniqueCategories.length;
        }

        if (downloadsEl) {
            const totalDownloads = this.resources.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
            downloadsEl.textContent = totalDownloads > 1000 ? `${(totalDownloads / 1000).toFixed(1)}K` : totalDownloads;
        }
    }

    getCategoryIcon(category) {
        const icons = {
            'Constitution': 'fa-gavel',
            'Handbook': 'fa-book',
            'Templates': 'fa-file-alt',
            'Guidelines': 'fa-list-ul',
            'Innovation': 'fa-lightbulb',
            'Technical': 'fa-code'
        };
        return icons[category] || 'fa-file';
    }

    getFileIcon(fileType) {
        const icons = {
            'pdf': 'pdf',
            'doc': 'word',
            'docx': 'word',
            'txt': 'alt',
            'zip': 'archive'
        };
        return icons[(fileType || '').toLowerCase()] || 'alt';
    }

    showLoading() {
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (resourcesGrid) {
            resourcesGrid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Loading resources...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is hidden when resources are rendered
    }

    showError(message) {
        if (window.notifications) {
            window.notifications.show(message, 'error');
        } else {
            console.error(message);
        }
    }

    showMessage(message, type = 'info') {
        if (window.notifications) {
            window.notifications.show(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📚 Resources Page DOM loaded');
    try {
        window.resourcesPage = new ResourcesPage();
        console.log('✅ ResourcesPage instance created successfully:', window.resourcesPage);
    } catch (error) {
        console.error('❌ Error creating ResourcesPage instance:', error);
    }
});

// Make available globally
window.ResourcesPage = ResourcesPage;

// Add global validation function
function validateFile(input) {
    if (window.resourcesPage) {
        window.resourcesPage.validateFile(input);
    }
}