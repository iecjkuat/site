/**
 * JKUAT Innovation Club - Admin Media Management
 * Interface for managing uploaded media files
 */

class AdminMediaManager {
    constructor() {
        this.mediaFiles = [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.selectedFiles = new Set();
        
        this.init();
    }

    async init() {
        console.log('🔧 Admin Media Manager initialized');
        this.setupEventListeners();
        await this.loadMediaFiles();
        this.renderMediaGrid();
        this.updateStats();
    }

    setupEventListeners() {
        // Filter and sort controls
        document.addEventListener('change', (e) => {
            if (e.target.matches('#mediaFilter')) {
                this.currentFilter = e.target.value;
                this.renderMediaGrid();
            }
            
            if (e.target.matches('#mediaSort')) {
                this.currentSort = e.target.value;
                this.renderMediaGrid();
            }
        });

        // Search functionality
        document.addEventListener('input', (e) => {
            if (e.target.matches('#mediaSearch')) {
                this.handleSearch(e.target.value);
            }
        });

        // Bulk actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('#selectAllMedia')) {
                this.toggleSelectAll();
            }
            
            if (e.target.matches('#deleteSelectedMedia')) {
                this.deleteSelectedMedia();
            }
            
            if (e.target.matches('#downloadSelectedMedia')) {
                this.downloadSelectedMedia();
            }
            
            if (e.target.matches('.media-item-checkbox')) {
                this.toggleFileSelection(e.target.dataset.fileId);
            }
            
            if (e.target.matches('.delete-media-btn')) {
                this.deleteMediaFile(e.target.dataset.fileId);
            }
            
            if (e.target.matches('.download-media-btn')) {
                this.downloadMediaFile(e.target.dataset.fileId);
            }
            
            if (e.target.matches('.view-media-btn')) {
                this.viewMediaFile(e.target.dataset.fileId);
            }
        });

        // Storage cleanup
        document.addEventListener('click', (e) => {
            if (e.target.matches('#cleanupUnusedMedia')) {
                this.cleanupUnusedMedia();
            }
            
            if (e.target.matches('#optimizeStorage')) {
                this.optimizeStorage();
            }
        });
    }

    async loadMediaFiles() {
        try {
            // Try to load from API first
            const response = await fetch('/api/admin/media');
            if (response.ok) {
                const data = await response.json();
                this.mediaFiles = data.files || [];
            } else {
                // Fallback to mock data
                this.mediaFiles = this.getMockMediaFiles();
            }
        } catch (error) {
            console.error('Error loading media files:', error);
            this.mediaFiles = this.getMockMediaFiles();
        }
    }

    renderMediaGrid() {
        const container = document.getElementById('adminMediaGrid');
        if (!container) return;

        let filteredFiles = this.getFilteredFiles();
        filteredFiles = this.getSortedFiles(filteredFiles);

        if (filteredFiles.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = filteredFiles.map(file => this.renderMediaItem(file)).join('');
        this.updateSelectionUI();
    }

    getFilteredFiles() {
        let filtered = [...this.mediaFiles];

        // Apply type filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(file => {
                if (this.currentFilter === 'images') return file.type.startsWith('image/');
                if (this.currentFilter === 'videos') return file.type.startsWith('video/');
                if (this.currentFilter === 'unused') return !file.usedInEvents || file.usedInEvents.length === 0;
                return true;
            });
        }

        // Apply search filter
        const searchTerm = document.getElementById('mediaSearch')?.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(file => 
                file.name.toLowerCase().includes(searchTerm) ||
                file.alt?.toLowerCase().includes(searchTerm) ||
                file.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    }

    getSortedFiles(files) {
        return files.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                case 'oldest':
                    return new Date(a.uploadedAt) - new Date(b.uploadedAt);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return b.size - a.size;
                case 'type':
                    return a.type.localeCompare(b.type);
                default:
                    return 0;
            }
        });
    }

    renderMediaItem(file) {
        const isSelected = this.selectedFiles.has(file.id);
        const fileSize = this.formatFileSize(file.size);
        const uploadDate = new Date(file.uploadedAt).toLocaleDateString();
        const usageCount = file.usedInEvents?.length || 0;

        return `
            <div class="admin-media-item ${isSelected ? 'selected' : ''}" data-file-id="${file.id}">
                <div class="media-item-header">
                    <input type="checkbox" 
                           class="media-item-checkbox" 
                           data-file-id="${file.id}"
                           ${isSelected ? 'checked' : ''}>
                    <div class="media-item-actions">
                        <button class="action-btn view-media-btn" data-file-id="${file.id}" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn download-media-btn" data-file-id="${file.id}" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn delete-media-btn" data-file-id="${file.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="media-item-preview">
                    ${file.type.startsWith('video/') ? `
                        <video src="${file.url}" poster="${file.thumbnail}"></video>
                        <div class="media-type-badge video">
                            <i class="fas fa-play"></i>
                        </div>
                    ` : `
                        <img src="${file.url}" alt="${file.alt || file.name}" loading="lazy">
                    `}
                    ${file.type.startsWith('image/') ? `
                        <div class="media-type-badge image">
                            <i class="fas fa-image"></i>
                        </div>
                    ` : ''}
                </div>
                
                <div class="media-item-info">
                    <h4 class="media-item-name" title="${file.name}">${file.name}</h4>
                    <div class="media-item-details">
                        <span class="media-size">${fileSize}</span>
                        <span class="media-date">${uploadDate}</span>
                    </div>
                    <div class="media-usage">
                        <span class="usage-count ${usageCount === 0 ? 'unused' : ''}">
                            <i class="fas fa-${usageCount === 0 ? 'exclamation-triangle' : 'check-circle'}"></i>
                            ${usageCount === 0 ? 'Unused' : `Used in ${usageCount} event${usageCount > 1 ? 's' : ''}`}
                        </span>
                    </div>
                    ${file.tags && file.tags.length > 0 ? `
                        <div class="media-tags">
                            ${file.tags.map(tag => `<span class="media-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="admin-empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-images"></i>
                </div>
                <h3>No Media Files Found</h3>
                <p>No files match your current filter criteria.</p>
                <button class="btn btn-primary" onclick="document.getElementById('mediaFilter').value='all'; window.adminMediaManager.currentFilter='all'; window.adminMediaManager.renderMediaGrid();">
                    <i class="fas fa-refresh"></i>
                    Reset Filters
                </button>
            </div>
        `;
    }

    updateStats() {
        const totalFiles = this.mediaFiles.length;
        const totalSize = this.mediaFiles.reduce((sum, file) => sum + file.size, 0);
        const imageCount = this.mediaFiles.filter(f => f.type.startsWith('image/')).length;
        const videoCount = this.mediaFiles.filter(f => f.type.startsWith('video/')).length;
        const unusedCount = this.mediaFiles.filter(f => !f.usedInEvents || f.usedInEvents.length === 0).length;

        // Update stats display
        this.updateStatElement('totalFilesCount', totalFiles);
        this.updateStatElement('totalStorageSize', this.formatFileSize(totalSize));
        this.updateStatElement('imageFilesCount', imageCount);
        this.updateStatElement('videoFilesCount', videoCount);
        this.updateStatElement('unusedFilesCount', unusedCount);

        // Update storage usage
        this.updateStorageUsage(totalSize);
    }

    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    async updateStorageUsage(usedBytes) {
        const storageWidget = document.getElementById('adminStorageUsage');
        if (!storageWidget) return;

        // Get storage limits based on provider
        const limits = this.getStorageLimits();
        const percentage = (usedBytes / limits.total) * 100;
        
        let statusClass = 'good';
        if (percentage > 80) statusClass = 'critical';
        else if (percentage > 60) statusClass = 'warning';

        storageWidget.innerHTML = `
            <div class="storage-usage-header">
                <h4>Storage Usage</h4>
                <span class="storage-percentage ${statusClass}">${percentage.toFixed(1)}%</span>
            </div>
            <div class="storage-usage-bar">
                <div class="storage-usage-fill ${statusClass}" style="width: ${percentage}%"></div>
            </div>
            <div class="storage-usage-details">
                <span>Used: ${this.formatFileSize(usedBytes)}</span>
                <span>Available: ${this.formatFileSize(limits.total - usedBytes)}</span>
                <span>Total: ${this.formatFileSize(limits.total)}</span>
            </div>
        `;
    }

    getStorageLimits() {
        // Return limits based on configured storage provider
        if (window.mediaManager?.storageType === 'supabase') {
            return { total: 1024 * 1024 * 1024 }; // 1GB
        } else if (window.mediaManager?.storageType === 'cloudinary') {
            return { total: 25 * 1024 * 1024 * 1024 }; // 25GB
        } else {
            return { total: 5 * 1024 * 1024 }; // 5MB for local
        }
    }

    toggleFileSelection(fileId) {
        if (this.selectedFiles.has(fileId)) {
            this.selectedFiles.delete(fileId);
        } else {
            this.selectedFiles.add(fileId);
        }
        this.updateSelectionUI();
    }

    toggleSelectAll() {
        const filteredFiles = this.getFilteredFiles();
        const allSelected = filteredFiles.every(file => this.selectedFiles.has(file.id));
        
        if (allSelected) {
            // Deselect all
            filteredFiles.forEach(file => this.selectedFiles.delete(file.id));
        } else {
            // Select all
            filteredFiles.forEach(file => this.selectedFiles.add(file.id));
        }
        
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const selectedCount = this.selectedFiles.size;
        const bulkActions = document.getElementById('bulkActions');
        const selectAllBtn = document.getElementById('selectAllMedia');
        
        if (bulkActions) {
            bulkActions.style.display = selectedCount > 0 ? 'flex' : 'none';
        }
        
        if (selectAllBtn) {
            const filteredFiles = this.getFilteredFiles();
            const allSelected = filteredFiles.length > 0 && filteredFiles.every(file => this.selectedFiles.has(file.id));
            selectAllBtn.textContent = allSelected ? 'Deselect All' : 'Select All';
        }

        // Update selected count display
        const selectedCountEl = document.getElementById('selectedCount');
        if (selectedCountEl) {
            selectedCountEl.textContent = `${selectedCount} selected`;
        }

        // Update checkboxes
        document.querySelectorAll('.media-item-checkbox').forEach(checkbox => {
            const fileId = checkbox.dataset.fileId;
            checkbox.checked = this.selectedFiles.has(fileId);
            
            const mediaItem = checkbox.closest('.admin-media-item');
            if (mediaItem) {
                mediaItem.classList.toggle('selected', this.selectedFiles.has(fileId));
            }
        });
    }

    async deleteSelectedMedia() {
        if (this.selectedFiles.size === 0) return;
        
        const fileCount = this.selectedFiles.size;
        if (!confirm(`Are you sure you want to delete ${fileCount} selected file${fileCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
            return;
        }

        const selectedIds = Array.from(this.selectedFiles);
        
        try {
            // Show loading state
            this.showBulkActionProgress('Deleting files...', 0);
            
            let completed = 0;
            for (const fileId of selectedIds) {
                await this.deleteMediaFile(fileId, false);
                completed++;
                this.showBulkActionProgress(`Deleting files... (${completed}/${selectedIds.length})`, (completed / selectedIds.length) * 100);
            }
            
            this.selectedFiles.clear();
            await this.loadMediaFiles();
            this.renderMediaGrid();
            this.updateStats();
            
            this.hideBulkActionProgress();
            this.showToast(`${fileCount} file${fileCount > 1 ? 's' : ''} deleted successfully`, 'success');
            
        } catch (error) {
            console.error('Error deleting files:', error);
            this.hideBulkActionProgress();
            this.showToast('Failed to delete some files', 'error');
        }
    }

    async deleteMediaFile(fileId, showConfirm = true) {
        const file = this.mediaFiles.find(f => f.id === fileId);
        if (!file) return;

        if (showConfirm && !confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            // Try to delete via API
            const response = await fetch(`/api/admin/media/${fileId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('API deletion failed');
            }

            // Remove from local array
            this.mediaFiles = this.mediaFiles.filter(f => f.id !== fileId);
            this.selectedFiles.delete(fileId);
            
            if (showConfirm) {
                this.renderMediaGrid();
                this.updateStats();
                this.showToast('File deleted successfully', 'success');
            }

        } catch (error) {
            console.error('Error deleting file:', error);
            
            // Fallback: remove from local array only
            this.mediaFiles = this.mediaFiles.filter(f => f.id !== fileId);
            this.selectedFiles.delete(fileId);
            
            if (showConfirm) {
                this.renderMediaGrid();
                this.updateStats();
                this.showToast('File deleted (local only)', 'warning');
            }
        }
    }

    async downloadSelectedMedia() {
        if (this.selectedFiles.size === 0) return;
        
        const selectedFiles = this.mediaFiles.filter(f => this.selectedFiles.has(f.id));
        
        if (selectedFiles.length === 1) {
            this.downloadMediaFile(selectedFiles[0].id);
        } else {
            // Create ZIP file for multiple downloads
            this.downloadMultipleFiles(selectedFiles);
        }
    }

    async downloadMediaFile(fileId) {
        const file = this.mediaFiles.find(f => f.id === fileId);
        if (!file) return;

        try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showToast('File downloaded', 'success');
        } catch (error) {
            console.error('Error downloading file:', error);
            this.showToast('Failed to download file', 'error');
        }
    }

    async downloadMultipleFiles(files) {
        this.showToast('Preparing download... (This may take a moment)', 'info');
        
        try {
            // This would require a ZIP library like JSZip
            // For now, download files individually
            for (const file of files) {
                await this.downloadMediaFile(file.id);
                await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
            }
        } catch (error) {
            console.error('Error downloading multiple files:', error);
            this.showToast('Failed to download some files', 'error');
        }
    }

    viewMediaFile(fileId) {
        const file = this.mediaFiles.find(f => f.id === fileId);
        if (!file) return;

        // Create modal for viewing file
        const modal = document.createElement('div');
        modal.className = 'media-view-modal';
        modal.innerHTML = `
            <div class="media-view-content">
                <div class="media-view-header">
                    <h3>${file.name}</h3>
                    <button class="close-media-view">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="media-view-body">
                    ${file.type.startsWith('video/') ? `
                        <video src="${file.url}" controls poster="${file.thumbnail}"></video>
                    ` : `
                        <img src="${file.url}" alt="${file.alt || file.name}">
                    `}
                </div>
                <div class="media-view-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>File Size:</label>
                            <span>${this.formatFileSize(file.size)}</span>
                        </div>
                        <div class="info-item">
                            <label>Type:</label>
                            <span>${file.type}</span>
                        </div>
                        <div class="info-item">
                            <label>Uploaded:</label>
                            <span>${new Date(file.uploadedAt).toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <label>Usage:</label>
                            <span>${file.usedInEvents?.length || 0} events</span>
                        </div>
                    </div>
                    ${file.usedInEvents && file.usedInEvents.length > 0 ? `
                        <div class="usage-details">
                            <label>Used in events:</label>
                            <ul>
                                ${file.usedInEvents.map(event => `<li>${event.title}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.close-media-view');
        closeBtn.addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async cleanupUnusedMedia() {
        const unusedFiles = this.mediaFiles.filter(f => !f.usedInEvents || f.usedInEvents.length === 0);
        
        if (unusedFiles.length === 0) {
            this.showToast('No unused files found', 'info');
            return;
        }

        if (!confirm(`Found ${unusedFiles.length} unused files. Delete them to free up storage space?`)) {
            return;
        }

        try {
            this.showBulkActionProgress('Cleaning up unused files...', 0);
            
            let completed = 0;
            for (const file of unusedFiles) {
                await this.deleteMediaFile(file.id, false);
                completed++;
                this.showBulkActionProgress(`Cleaning up... (${completed}/${unusedFiles.length})`, (completed / unusedFiles.length) * 100);
            }
            
            await this.loadMediaFiles();
            this.renderMediaGrid();
            this.updateStats();
            
            this.hideBulkActionProgress();
            this.showToast(`${unusedFiles.length} unused files deleted`, 'success');
            
        } catch (error) {
            console.error('Error cleaning up files:', error);
            this.hideBulkActionProgress();
            this.showToast('Failed to cleanup some files', 'error');
        }
    }

    async optimizeStorage() {
        this.showToast('Storage optimization feature coming soon!', 'info');
        // This would implement:
        // - Image compression
        // - Duplicate file detection
        // - Format conversion
        // - Thumbnail generation
    }

    handleSearch(searchTerm) {
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.renderMediaGrid();
        }, 300);
    }

    showBulkActionProgress(message, percentage) {
        let progressModal = document.getElementById('bulkActionProgress');
        
        if (!progressModal) {
            progressModal = document.createElement('div');
            progressModal.id = 'bulkActionProgress';
            progressModal.className = 'bulk-action-progress-modal';
            progressModal.innerHTML = `
                <div class="progress-content">
                    <div class="progress-message"></div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-percentage"></div>
                </div>
            `;
            document.body.appendChild(progressModal);
        }

        progressModal.querySelector('.progress-message').textContent = message;
        progressModal.querySelector('.progress-fill').style.width = `${percentage}%`;
        progressModal.querySelector('.progress-percentage').textContent = `${Math.round(percentage)}%`;
        progressModal.style.display = 'flex';
    }

    hideBulkActionProgress() {
        const progressModal = document.getElementById('bulkActionProgress');
        if (progressModal) {
            progressModal.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        if (window.eventsManager) {
            window.eventsManager.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getMockMediaFiles() {
        return [
            {
                id: '1',
                name: 'workshop-innovation-2025.jpg',
                type: 'image/jpeg',
                size: 2457600, // 2.4 MB
                url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                alt: 'Innovation Workshop 2025',
                uploadedAt: '2025-01-10T10:00:00Z',
                uploadedBy: 'admin',
                usedInEvents: [
                    { id: '1', title: 'Innovation Workshop: From Idea to Prototype' }
                ],
                tags: ['workshop', 'innovation', 'prototype']
            },
            {
                id: '2',
                name: 'entrepreneurship-seminar.jpg',
                type: 'image/jpeg',
                size: 1843200, // 1.8 MB
                url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                alt: 'Entrepreneurship Seminar',
                uploadedAt: '2025-01-08T15:30:00Z',
                uploadedBy: 'admin',
                usedInEvents: [
                    { id: '2', title: 'Entrepreneurship Seminar: Building Sustainable Startups' }
                ],
                tags: ['seminar', 'entrepreneurship', 'business']
            },
            {
                id: '3',
                name: 'tech-competition-promo.mp4',
                type: 'video/mp4',
                size: 15728640, // 15 MB
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                alt: 'Tech Competition Promotional Video',
                uploadedAt: '2025-01-05T12:00:00Z',
                uploadedBy: 'admin',
                usedInEvents: [
                    { id: '3', title: 'Tech Innovation Competition 2025' }
                ],
                tags: ['competition', 'tech', 'video', 'promo']
            },
            {
                id: '4',
                name: 'networking-event-photo.jpg',
                type: 'image/jpeg',
                size: 3145728, // 3 MB
                url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                alt: 'Networking Event Photo',
                uploadedAt: '2025-01-12T09:15:00Z',
                uploadedBy: 'admin',
                usedInEvents: [
                    { id: '4', title: 'Networking Night: Connect with Industry Leaders' }
                ],
                tags: ['networking', 'social', 'industry']
            },
            {
                id: '5',
                name: 'unused-stock-photo.jpg',
                type: 'image/jpeg',
                size: 2097152, // 2 MB
                url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                alt: 'Unused Stock Photo',
                uploadedAt: '2025-01-01T00:00:00Z',
                uploadedBy: 'admin',
                usedInEvents: [], // Unused file
                tags: ['stock', 'unused']
            }
        ];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('adminMediaGrid')) {
        window.adminMediaManager = new AdminMediaManager();
    }
});

// Make available globally
window.AdminMediaManager = AdminMediaManager;