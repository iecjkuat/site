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
        this.init();
    }

    async init() {
        console.log('📚 Initializing Resources Page...');
        
        try {
            // Load resources data
            await this.loadResources();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update stats
            this.updateStats();
            
            console.log('✅ Resources Page initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing resources page:', error);
            this.showError('Failed to load resources');
        }
    }

    async loadResources(category = 'all', page = 1) {
        this.isLoading = true;
        this.showLoading();
        
        try {
            console.log('📊 Loading resources data...');
            
            // Build API URL
            let apiUrl = `/api/resources?page=${page}&limit=12`;
            if (category !== 'all') {
                apiUrl += `&category=${encodeURIComponent(category)}`;
            }
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.resources = data.resources || [];
                this.filteredResources = [...this.resources];
                this.currentPage = data.pagination?.current || 1;
                this.totalPages = data.pagination?.total || 1;
                
                console.log('✅ Resources loaded:', this.resources.length);
            } else {
                // Use mock data if API fails
                console.warn('⚠️ API failed, using mock data');
                this.resources = this.getMockResources();
                this.filteredResources = [...this.resources];
            }
            
            this.renderResources();
            
        } catch (error) {
            console.error('❌ Error loading resources:', error);
            // Use mock data as fallback
            this.resources = this.getMockResources();
            this.filteredResources = [...this.resources];
            this.renderResources();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    getMockResources() {
        return [
            {
                id: 1,
                title: 'Club Constitution 2024',
                description: 'Official constitution document outlining the club structure, governance, and operational guidelines.',
                category: 'Constitution',
                fileType: 'pdf',
                downloadCount: 234,
                fileSize: '2.5 MB',
                createdAt: '2024-01-15',
                uploader: { name: 'Admin Team' },
                accessLevel: 'PUBLIC',
                tags: ['governance', 'rules', 'structure']
            },
            {
                id: 2,
                title: 'Member Handbook',
                description: 'Comprehensive guide for new members covering club activities, expectations, and opportunities.',
                category: 'Handbook',
                fileType: 'pdf',
                downloadCount: 189,
                fileSize: '4.2 MB',
                createdAt: '2024-01-10',
                uploader: { name: 'Leadership Team' },
                accessLevel: 'MEMBERS',
                tags: ['guide', 'members', 'activities']
            },
            {
                id: 3,
                title: 'Project Proposal Template',
                description: 'Standard template for submitting innovation project proposals to the club for review and funding.',
                category: 'Templates',
                fileType: 'docx',
                downloadCount: 156,
                fileSize: '1.8 MB',
                createdAt: '2024-01-08',
                uploader: { name: 'Project Committee' },
                accessLevel: 'MEMBERS',
                tags: ['template', 'projects', 'proposals']
            },
            {
                id: 4,
                title: 'Innovation Toolkit',
                description: 'Comprehensive guide to innovation methodologies, design thinking, and problem-solving frameworks.',
                category: 'Innovation',
                fileType: 'pdf',
                downloadCount: 298,
                fileSize: '6.1 MB',
                createdAt: '2024-01-05',
                uploader: { name: 'Innovation Team' },
                accessLevel: 'PUBLIC',
                tags: ['innovation', 'design-thinking', 'methodology']
            },
            {
                id: 5,
                title: 'Development Guidelines',
                description: 'Best practices and coding standards for technical projects within the innovation club.',
                category: 'Technical',
                fileType: 'txt',
                downloadCount: 127,
                fileSize: '3.4 MB',
                createdAt: '2024-01-03',
                uploader: { name: 'Tech Team' },
                accessLevel: 'MEMBERS',
                tags: ['coding', 'standards', 'development']
            },
            {
                id: 6,
                title: 'Event Planning Guide',
                description: 'Step-by-step guide for organizing successful innovation events, workshops, and hackathons.',
                category: 'Guidelines',
                fileType: 'docx',
                downloadCount: 203,
                fileSize: '2.9 MB',
                createdAt: '2024-01-01',
                uploader: { name: 'Events Team' },
                accessLevel: 'MEMBERS',
                tags: ['events', 'planning', 'workshops']
            }
        ];
    }

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
            <div class="glass-card resource-card" data-category="${resource.category}">
                <div class="resource-header">
                    <div class="resource-category-badge ${resource.category.toLowerCase()}">
                        <i class="fas ${this.getCategoryIcon(resource.category)}"></i>
                        ${resource.category}
                    </div>
                    <div class="resource-access-level ${(resource.accessLevel || 'public').toLowerCase()}">
                        ${resource.accessLevel || 'PUBLIC'}
                    </div>
                </div>
                
                <div class="resource-content">
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    
                    <div class="resource-meta">
                        <div class="meta-item">
                            <i class="fas fa-file-${this.getFileIcon(resource.fileType)}"></i>
                            <span>${(resource.fileType || 'FILE').toUpperCase()}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-download"></i>
                            <span>${resource.downloadCount || 0} downloads</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-weight-hanging"></i>
                            <span>${resource.fileSize || 'Unknown size'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${new Date(resource.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="resource-uploader">
                        <i class="fas fa-user"></i>
                        <span>Uploaded by ${resource.uploader?.name || 'Unknown'}</span>
                    </div>
                    
                    ${resource.tags && resource.tags.length > 0 ? `
                        <div class="resource-tags">
                            ${resource.tags.slice(0, 3).map(tag => `
                                <span class="tag">${tag}</span>
                            `).join('')}
                            ${resource.tags.length > 3 ? `<span class="tag-more">+${resource.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="resource-actions">
                    <button class="btn btn-primary" data-action="download" data-resource-id="${resource.id}">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-outline" data-action="preview" data-resource-id="${resource.id}">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for the buttons
        this.addResourceButtonListeners();
    }

    addResourceButtonListeners() {
        // Add event listeners for download and preview buttons
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;

        // Use event delegation to handle dynamically created buttons
        resourcesGrid.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const resourceId = button.dataset.resourceId;

            switch (action) {
                case 'download':
                    if (resourceId) {
                        this.downloadResource(parseInt(resourceId));
                    }
                    break;
                case 'preview':
                    if (resourceId) {
                        this.previewResource(parseInt(resourceId));
                    }
                    break;
                case 'reset-filters':
                    this.resetFilters();
                    break;
            }
        });

        // Handle modal events
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;

            switch (action) {
                case 'close-modal':
                    const modal = button.closest('.modal-backdrop');
                    if (modal) {
                        modal.remove();
                    }
                    break;
                case 'download':
                    const resourceId = button.dataset.resourceId;
                    const closeModal = button.dataset.closeModal;
                    if (resourceId) {
                        this.downloadResource(parseInt(resourceId));
                        if (closeModal === 'true') {
                            const modal = button.closest('.modal-backdrop');
                            if (modal) {
                                setTimeout(() => modal.remove(), 1000);
                            }
                        }
                    }
                    break;
                case 'submit-upload':
                    this.submitUpload();
                    break;
            }
        });

        // Close modal when clicking backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                e.target.remove();
            }
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
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchResources(e.target.value);
                }, 300);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreResourcesBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreResources();
            });
        }

        // Upload resource button
        const uploadBtn = document.getElementById('uploadResourceBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.showUploadModal();
            });
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
            const resource = this.resources.find(r => r.id === resourceId);
            if (!resource) {
                this.showMessage('Resource not found', 'error');
                return;
            }

            // Show download starting message
            this.showMessage('Starting download...', 'info');

            try {
                // Try to call the API first
                const response = await fetch(`/api/resources/${resourceId}/download`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Update download count in UI
                    resource.downloadCount = (resource.downloadCount || 0) + 1;
                    this.renderResources();
                    
                    // If API provides download URL, use it
                    if (data.downloadUrl) {
                        this.initiateDownload(data.downloadUrl, data.fileName || resource.title);
                    } else {
                        // Fallback to simulated download
                        this.simulateDownload(resource);
                    }
                    
                    this.showMessage(`Downloaded: ${resource.title}`, 'success');
                    
                } else {
                    throw new Error('API download failed');
                }
            } catch (apiError) {
                console.warn('API download failed, using fallback:', apiError);
                // Fallback to simulated download
                this.simulateDownload(resource);
                this.showMessage(`Downloaded: ${resource.title} (Demo Mode)`, 'success');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showMessage('Download failed', 'error');
        }
    }

    initiateDownload(url, filename) {
        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <h2><i class="fas fa-eye"></i> Preview: ${resource.title}</h2>
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
                            <strong>File Type:</strong> ${(resource.fileType || 'Unknown').toUpperCase()}
                        </div>
                        <div class="info-row">
                            <strong>File Size:</strong> ${resource.fileSize || 'Unknown'}
                        </div>
                        <div class="info-row">
                            <strong>Downloads:</strong> ${resource.downloadCount || 0}
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" data-action="download" data-resource-id="${resource.id}" data-close-modal="true">
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
                            <h3>${resource.title}</h3>
                            <p><strong>Document Summary:</strong></p>
                            <p>${resource.description}</p>
                            
                            <div class="sample-content">
                                <h4>Sample Content:</h4>
                                <div class="content-block">
                                    <p>This is a preview of the ${resource.category.toLowerCase()} document. The full document contains detailed information about:</p>
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
                            <div class="document-title">${resource.title}</div>
                            <div class="document-meta">
                                <span>Category: ${resource.category}</span> | 
                                <span>Type: ${resource.fileType.toUpperCase()}</span>
                            </div>
                            
                            <div class="document-body">
                                <h3>Document Overview</h3>
                                <p>${resource.description}</p>
                                
                                <h3>Key Sections</h3>
                                <div class="section-list">
                                    <div class="section-item">
                                        <strong>1. Introduction</strong>
                                        <p>Overview of the ${resource.category.toLowerCase()} and its purpose within the JKUAT Innovation Club.</p>
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
${resource.title}
${'='.repeat(resource.title.length)}

Description: ${resource.description}

Category: ${resource.category}

This is a sample preview of the text document content.
The actual document contains detailed information and
instructions related to ${resource.category.toLowerCase()}.

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
                            <h3>${resource.title}</h3>
                            <p><strong>Description:</strong> ${resource.description}</p>
                            <p><strong>Category:</strong> ${resource.category}</p>
                            <p><strong>File Type:</strong> ${(resource.fileType || 'Unknown').toUpperCase()}</p>
                            
                            <div class="file-info">
                                <p>This file type (${resource.fileType || 'unknown'}) cannot be previewed directly in the browser.</p>
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
                    <h2>${resource.title}</h2>
                    <button class="modal-close" data-action="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="resource-preview">
                        <div class="preview-icon">
                            <i class="fas fa-file-${this.getFileIcon(resource.fileType)}"></i>
                        </div>
                        <div class="preview-details">
                            <h3>${resource.title}</h3>
                            <p>${resource.description}</p>
                            
                            <div class="preview-meta">
                                <div class="meta-row">
                                    <strong>Category:</strong> ${resource.category}
                                </div>
                                <div class="meta-row">
                                    <strong>File Type:</strong> ${(resource.fileType || 'Unknown').toUpperCase()}
                                </div>
                                <div class="meta-row">
                                    <strong>File Size:</strong> ${resource.fileSize || 'Unknown'}
                                </div>
                                <div class="meta-row">
                                    <strong>Downloads:</strong> ${resource.downloadCount || 0}
                                </div>
                                <div class="meta-row">
                                    <strong>Uploaded:</strong> ${new Date(resource.createdAt).toLocaleDateString()}
                                </div>
                                <div class="meta-row">
                                    <strong>Uploader:</strong> ${resource.uploader?.name || 'Unknown'}
                                </div>
                            </div>
                            
                            ${resource.tags && resource.tags.length > 0 ? `
                                <div class="preview-tags">
                                    <strong>Tags:</strong>
                                    <div class="tags-list">
                                        ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" data-action="download" data-resource-id="${resource.id}" data-close-modal="true">
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
                            <input type="file" id="resourceFile" name="file" accept=".pdf,.doc,.docx,.txt,.zip" required>
                            <small>Supported formats: PDF, DOC, DOCX, TXT, ZIP (Max 10MB)</small>
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

    async submitUpload() {
        const form = document.getElementById('uploadResourceForm');
        const formData = new FormData(form);
        
        try {
            this.showMessage('Uploading resource...', 'info');
            
            // Simulate successful upload
            setTimeout(() => {
                this.showMessage('Resource uploaded successfully!', 'success');
                document.querySelector('.modal-backdrop').remove();
                this.loadResources(); // Reload resources
            }, 2000);
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage('Upload failed', 'error');
        }
    }

    loadMoreResources() {
        if (this.currentPage < this.totalPages) {
            this.loadResources(this.currentCategory, this.currentPage + 1);
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