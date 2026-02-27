/**
 * CMS Resources Manager
 * Handles resources and documents management
 */

export class CMSResourcesManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('resources-list');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const resources = await CMSData.getResources();
            const filteredResources = this.cms.filterItems(resources);
            this.render(filteredResources);
        } catch (error) {
            console.error('Error loading resources:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load resources. Please try again.'));
        }
    }

    render(resources) {
        const container = document.getElementById('resources-list');
        container.replaceChildren();

        if (!resources.length) {
            container.appendChild(CMSUI.createEmptyState('No resources found. Upload your first resource!'));
            return;
        }

        container.className = 'ig-content-grid';
        container.setAttribute('data-content-type', 'resources');

        resources.forEach(resource => {
            const item = CMSUI.createContentItem(resource, 'resource', {
                onView: (data) => this.cms.viewContent(data, 'resource'),
                onEdit: (id) => this.edit(id),
                onDelete: (id) => this.delete(id)
            });
            
            container.appendChild(item);
        });
    }

    async edit(id) {
        console.log(`✏️ Editing resource with ID:`, id);
        
        try {
            console.log('📥 Fetching resource data...');
            const resource = await CMSData.getResource(id);
            console.log('📦 Resource data received:', resource);
            
            if (!resource) {
                throw new Error('Resource not found');
            }
            
            this.showEditModal(resource);
        } catch (error) {
            console.error('❌ Error loading resource:', error);
            this.cms.notifications.show('Failed to load resource: ' + error.message, 'error');
        }
    }

    showEditModal(resource = null) {
        const isEdit = !!resource;
        console.log('🎨 Showing edit modal, isEdit:', isEdit, 'resource:', resource);
        
        const modalHTML = `
            <div class="modal-backdrop" id="resourceModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;">
                <div class="modal-content" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; position: relative;">
                    <div class="modal-header" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <h2 style="color: white; font-size: 1.5rem; margin: 0;">${isEdit ? 'Edit' : 'Upload'} Resource</h2>
                        <button class="modal-close" id="closeResourceModal" style="position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; line-height: 1;">&times;</button>
                    </div>
                    <form id="resourceForm" class="cms-form">
                        <input type="hidden" name="id" value="${resource?.id || ''}">
                        
                        <!-- Title -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Title <span style="color: #ef4444;">*</span></label>
                            <input type="text" name="title" value="${this.escapeHtml(resource?.title || '')}" required placeholder="e.g., Club Constitution 2024" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                        </div>

                        <!-- Category -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Category <span style="color: #ef4444;">*</span></label>
                            <select name="category" id="categorySelect" required style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                                <option value="">Select Category</option>
                                <option value="constitution" ${resource?.category === 'constitution' ? 'selected' : ''}>Constitution</option>
                                <option value="policies" ${resource?.category === 'policies' ? 'selected' : ''}>Policies</option>
                                <option value="minutes" ${resource?.category === 'minutes' ? 'selected' : ''}>Meeting Minutes</option>
                                <option value="guides" ${resource?.category === 'guides' ? 'selected' : ''}>Guides & Tutorials</option>
                                <option value="reports" ${resource?.category === 'reports' ? 'selected' : ''}>Reports</option>
                                <option value="other" ${resource?.category === 'other' || (resource?.category && !['constitution', 'policies', 'minutes', 'guides', 'reports'].includes(resource?.category)) ? 'selected' : ''}>Other</option>
                            </select>
                        </div>

                        <!-- Custom Category Input (shown when "Other" is selected) -->
                        <div id="customCategoryContainer" style="margin-bottom: 1.5rem; display: ${resource?.category === 'other' || (resource?.category && !['constitution', 'policies', 'minutes', 'guides', 'reports'].includes(resource?.category)) ? 'block' : 'none'};">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Custom Category <span style="color: #ef4444;">*</span></label>
                            <input type="text" name="custom_category" id="customCategoryInput" value="${resource?.category && !['constitution', 'policies', 'minutes', 'guides', 'reports', 'other'].includes(resource?.category) ? this.escapeHtml(resource.category) : ''}" placeholder="e.g., Training Materials, Templates, etc." style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-top: 0.5rem;">
                                <i class="fas fa-info-circle"></i> Enter a custom category name for this resource.
                            </p>
                        </div>

                        <!-- Description -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Description</label>
                            <textarea name="description" rows="4" placeholder="Brief description of the resource..." style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem; resize: vertical;">${this.escapeHtml(resource?.description || '')}</textarea>
                        </div>

                        ${isEdit ? `
                        <!-- Current File Info -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Current File</label>
                            <div id="currentFileContainer" style="padding: 1rem; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <i class="fas fa-file-alt" style="color: #3b82f6; font-size: 1.25rem;"></i>
                                    <div>
                                        <p style="color: white; font-weight: 600; margin: 0; font-size: 0.875rem;">${this.escapeHtml(resource?.fileName || resource?.file_name || 'Unknown')}</p>
                                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin: 0;">${resource?.fileType || resource?.file_type || 'Unknown type'}</p>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button type="button" id="viewCurrentFileBtn" style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button type="button" id="removeCurrentFileBtn" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                                        <i class="fas fa-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                            <input type="hidden" id="removeFileFlag" name="remove_file" value="false">
                        </div>

                        <!-- Replace File Option -->
                        <div id="replaceFileSection" style="margin-bottom: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                Replace File (Optional)
                            </label>
                            <div style="position: relative;">
                                <input type="file" name="file" id="replaceFileInput" style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                                <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-top: 0.5rem;">
                                    <i class="fas fa-info-circle"></i> Upload a new file to replace the current one.
                                </p>
                            </div>
                        </div>
                        ` : `
                        <!-- File Upload -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">File <span style="color: #ef4444;">*</span></label>
                            <input type="file" name="file" required style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-top: 0.5rem;">Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max 10MB)</p>
                        </div>
                        `}

                        <!-- Form Actions -->
                        <div style="display: flex; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                            <button type="button" id="cancelResourceBtn" style="flex: 1; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">Cancel</button>
                            <button type="submit" style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Upload'} Resource
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        const modal = document.getElementById('resourceModal');
        const closeBtn = document.getElementById('closeResourceModal');
        const cancelBtn = document.getElementById('cancelResourceBtn');
        const viewFileBtn = document.getElementById('viewCurrentFileBtn');
        const removeFileBtn = document.getElementById('removeCurrentFileBtn');
        const currentFileContainer = document.getElementById('currentFileContainer');
        const replaceFileSection = document.getElementById('replaceFileSection');
        const replaceFileInput = document.getElementById('replaceFileInput');
        const removeFileFlag = document.getElementById('removeFileFlag');

        const closeModal = () => {
            modal?.remove();
        };

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);

        // Category select change handler - show/hide custom category input
        const categorySelect = document.getElementById('categorySelect');
        const customCategoryContainer = document.getElementById('customCategoryContainer');
        const customCategoryInput = document.getElementById('customCategoryInput');
        
        if (categorySelect && customCategoryContainer && customCategoryInput) {
            categorySelect.addEventListener('change', (e) => {
                if (e.target.value === 'other') {
                    customCategoryContainer.style.display = 'block';
                    customCategoryInput.required = true;
                } else {
                    customCategoryContainer.style.display = 'none';
                    customCategoryInput.required = false;
                    customCategoryInput.value = '';
                }
            });
        }

        // View current file button
        if (viewFileBtn && resource) {
            const fileUrl = resource.fileUrl || resource.file_url;
            if (fileUrl) {
                viewFileBtn.addEventListener('click', () => {
                    window.open(fileUrl, '_blank');
                });
            }
        }

        // Remove current file button
        if (removeFileBtn && currentFileContainer && replaceFileSection && replaceFileInput && removeFileFlag) {
            removeFileBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to remove the current file? You will need to upload a new file to replace it.')) {
                    // Hide current file container
                    currentFileContainer.style.display = 'none';
                    
                    // Update replace file section to show it's required
                    replaceFileSection.innerHTML = `
                        <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                            Upload New File <span style="color: #ef4444;">*</span>
                        </label>
                        <div style="position: relative;">
                            <input type="file" name="file" id="replaceFileInput" required style="width: 100%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem; color: white; font-size: 0.875rem;">
                            <p style="color: rgba(239, 68, 68, 0.8); font-size: 0.75rem; margin-top: 0.5rem;">
                                <i class="fas fa-exclamation-triangle"></i> Current file removed. You must upload a new file.
                            </p>
                        </div>
                    `;
                    
                    // Set flag to indicate file should be removed
                    removeFileFlag.value = 'true';
                    
                    this.cms.notifications.show('Current file marked for removal. Please upload a new file.', 'warning');
                }
            });
        }

        // Close on backdrop click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Bind form submit
        document.getElementById('resourceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveResource(new FormData(e.target), isEdit);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async saveResource(formData, isEdit) {
        try {
            const submitBtn = document.querySelector('#resourceForm button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            if (isEdit) {
                const id = formData.get('id');
                const file = formData.get('file');
                const removeFile = formData.get('remove_file') === 'true';
                
                console.log('💾 Saving resource (edit mode)');
                console.log('   - ID:', id);
                console.log('   - Remove file flag:', removeFile);
                console.log('   - New file:', file ? `${file.name} (${file.size} bytes)` : 'None');
                
                // Handle custom category
                let category = formData.get('category');
                if (category === 'other') {
                    const customCategory = formData.get('custom_category');
                    if (!customCategory || customCategory.trim() === '') {
                        throw new Error('Please enter a custom category name');
                    }
                    category = customCategory.trim().toLowerCase();
                }
                
                const data = {
                    title: formData.get('title'),
                    category: category,
                    description: formData.get('description'),
                    access_level: 'members' // Default to members only
                };

                // If file is marked for removal or a new file is uploaded, handle it
                if (removeFile || (file && file.size > 0)) {
                    if (!file || file.size === 0) {
                        throw new Error('Please upload a new file to replace the removed one');
                    }

                    console.log('📤 Uploading replacement file:', file.name, 'Size:', file.size);

                    // For file replacement, we'll use the resources upload endpoint
                    // which creates a complete new resource, then we delete the old one
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);
                    uploadFormData.append('title', formData.get('title'));
                    uploadFormData.append('category', category); // Use the processed category
                    uploadFormData.append('description', formData.get('description') || '');
                    uploadFormData.append('access_level', 'members'); // Default to members only

                    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    
                    console.log('🔑 Token:', token ? 'Present' : 'Missing');
                    console.log('📋 FormData contents:');
                    for (let [key, value] of uploadFormData.entries()) {
                        console.log(`   ${key}:`, value instanceof File ? `File(${value.name})` : value);
                    }
                    
                    const uploadRes = await fetch('/api/v1/resources/upload', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: uploadFormData
                    }).catch(err => {
                        console.error('❌ Fetch error (network level):', err);
                        throw new Error('Network error: Unable to reach server. Check your connection and try again.');
                    });
                    
                    console.log('📡 Upload response status:', uploadRes.status);
                    
                    if (!uploadRes.ok) {
                        const errorText = await uploadRes.text();
                        console.error('❌ Upload failed:', errorText);
                        throw new Error(`File upload failed: ${uploadRes.status} - ${errorText}`);
                    }
                    
                    const uploadData = await uploadRes.json();
                    console.log('✅ New resource created:', uploadData);

                    // Delete the old resource
                    console.log('🗑️ Deleting old resource:', id);
                    await CMSData.deleteResource(id);
                    
                    this.cms.notifications.show('Resource replaced successfully', 'success');
                    document.getElementById('resourceModal')?.remove();
                    this.load();
                    return;
                }

                // If no file change, just update the metadata
                console.log('📝 Updating metadata only (no file change)');
                console.log('   - Data:', data);
                await CMSData.updateResource(id, data);
                this.cms.notifications.show('Resource updated successfully', 'success');
            } else {
                // Handle file upload for new resource
                console.log('📤 Creating new resource');
                const file = formData.get('file');
                if (!file || file.size === 0) {
                    throw new Error('Please select a file');
                }

                console.log('   - File:', file.name, 'Size:', file.size);

                // Handle custom category
                let category = formData.get('category');
                if (category === 'other') {
                    const customCategory = formData.get('custom_category');
                    if (!customCategory || customCategory.trim() === '') {
                        throw new Error('Please enter a custom category name');
                    }
                    category = customCategory.trim().toLowerCase();
                }

                // Use the upload endpoint which handles everything
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                uploadFormData.append('title', formData.get('title'));
                uploadFormData.append('category', category); // Use the processed category
                uploadFormData.append('description', formData.get('description') || '');
                uploadFormData.append('access_level', 'members'); // Default to members only

                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                
                const uploadRes = await fetch('/api/v1/resources/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadFormData
                }).catch(err => {
                    console.error('❌ Fetch error (network level):', err);
                    throw new Error('Network error: Unable to reach server. Check your connection and try again.');
                });

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text();
                    console.error('❌ Upload failed:', errorText);
                    throw new Error(`File upload failed: ${uploadRes.status} - ${errorText}`);
                }

                const uploadData = await uploadRes.json();
                console.log('✅ Resource created:', uploadData);
                
                this.cms.notifications.show('Resource uploaded successfully', 'success');
            }

            document.getElementById('resourceModal')?.remove();
            this.load();
        } catch (error) {
            console.error('❌ Error saving resource:', error);
            this.cms.notifications.show(error.message || 'Failed to save resource', 'error');
            const submitBtn = document.querySelector('#resourceForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Upload'} Resource`;
            }
        }
    }

    async delete(id) {
        if (!this.cms.checkOperationPermissions('delete', 'resource')) {
            return;
        }

        if (!confirm('Are you sure you want to delete this resource?')) {
            return;
        }

        try {
            await CMSData.deleteResource(id);
            this.cms.notifications.show('Resource deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting resource:', error);
            this.cms.notifications.show('Failed to delete resource', 'error');
        }
    }

    async download(id) {
        try {
            const resource = await CMSData.getResource(id);
            if (resource.file_url) {
                // Create a temporary anchor element to trigger download
                const link = document.createElement('a');
                link.href = resource.file_url;
                link.download = resource.file_name || resource.title || 'download';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                
                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.cms.notifications.show('Download started', 'success');
            } else {
                this.cms.notifications.show('Resource file not found', 'error');
            }
        } catch (error) {
            console.error('Error downloading resource:', error);
            this.cms.notifications.show('Failed to download resource', 'error');
        }
    }
}
