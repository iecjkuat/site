/**
 * JKUAT Innovation Club - Media Manager
 * Handles image and video storage for events
 */

class MediaManager {
    constructor() {
        this.storageType = this.detectStorageType();
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        this.compressionQuality = 0.8;
        
        this.init();
    }

    init() {
        console.log('📁 Media Manager initialized with storage type:', this.storageType);
        this.setupEventListeners();
    }

    detectStorageType() {
        // Check for Supabase configuration first (recommended)
        if (this.hasSupabaseConfig()) {
            return 'supabase';
        } 
        // Check for Cloudinary as backup
        else if (this.hasCloudinaryConfig()) {
            return 'cloudinary';
        } 
        // Default to local for development
        else {
            console.warn('⚠️ No cloud storage configured. Using local storage for development.');
            return 'local';
        }
    }

    hasSupabaseConfig() {
        // Check if Supabase is available (either from CDN or npm)
        return (typeof window.supabase !== 'undefined' || typeof supabase !== 'undefined') &&
               window.SUPABASE_CONFIG && 
               window.SUPABASE_CONFIG.url && 
               window.SUPABASE_CONFIG.anonKey;
    }

    hasCloudinaryConfig() {
        return window.CLOUDINARY_CONFIG && 
               window.CLOUDINARY_CONFIG.cloudName && 
               window.CLOUDINARY_CONFIG.uploadPreset;
    }

    setupEventListeners() {
        // Handle file input changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.media-upload-input')) {
                this.handleFileUpload(e.target);
            }
        });

        // Handle drag and drop
        document.addEventListener('dragover', (e) => {
            if (e.target.matches('.media-drop-zone')) {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.matches('.media-drop-zone')) {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.matches('.media-drop-zone')) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                this.handleFileDrop(e);
            }
        });
    }

    async handleFileUpload(input) {
        const files = Array.from(input.files);
        const eventId = input.dataset.eventId;
        
        if (!files.length) return;

        for (const file of files) {
            if (this.validateFile(file)) {
                await this.uploadFile(file, eventId);
            }
        }
    }

    async handleFileDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        const eventId = event.target.dataset.eventId;
        
        for (const file of files) {
            if (this.validateFile(file)) {
                await this.uploadFile(file, eventId);
            }
        }
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            this.showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
            return false;
        }

        // Check file type
        const isValidImage = this.allowedImageTypes.includes(file.type);
        const isValidVideo = this.allowedVideoTypes.includes(file.type);
        
        if (!isValidImage && !isValidVideo) {
            this.showError(`File "${file.name}" is not a supported format.`);
            return false;
        }

        return true;
    }

    async uploadFile(file, eventId) {
        const uploadId = Date.now().toString();
        this.showUploadProgress(uploadId, file.name, 0);

        try {
            // Optimize file before upload
            const optimizedFile = await this.optimizeFile(file);
            
            let result;
            
            switch (this.storageType) {
                case 'cloudinary':
                    result = await this.uploadToCloudinary(optimizedFile, uploadId);
                    break;
                case 'supabase':
                    result = await this.uploadToSupabase(optimizedFile, uploadId);
                    break;
                case 'aws':
                    result = await this.uploadToAWS(optimizedFile, uploadId);
                    break;
                case 'local':
                default:
                    result = await this.uploadToLocal(optimizedFile, uploadId);
                    break;
            }

            // Generate thumbnail for videos
            if (result.type === 'video') {
                result.thumbnail = await this.generateVideoThumbnail(optimizedFile);
            }

            this.showUploadProgress(uploadId, file.name, 100);
            this.onUploadComplete(result, eventId);
            
            setTimeout(() => this.hideUploadProgress(uploadId), 2000);
            
        } catch (error) {
            console.error('Upload failed:', error);
            this.showError(`Failed to upload "${file.name}": ${error.message}`);
            this.hideUploadProgress(uploadId);
        }
    }

    async optimizeFile(file) {
        if (file.type.startsWith('image/')) {
            return await this.optimizeImage(file);
        } else if (file.type.startsWith('video/')) {
            return await this.optimizeVideo(file);
        }
        return file;
    }

    async optimizeImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const config = window.MEDIA_CONFIG.imageOptimization;
                
                // Calculate new dimensions
                let { width, height } = img;
                const maxWidth = config.maxWidth;
                const maxHeight = config.maxHeight;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    const optimizedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    resolve(optimizedFile);
                }, file.type, config.quality / 100);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    async optimizeVideo(file) {
        // For now, just return the original file
        // Video compression would require ffmpeg.js or similar
        console.log('Video optimization not implemented yet, using original file');
        return file;
    }

    async generateVideoThumbnail(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                video.currentTime = 1; // Capture at 1 second
            };
            
            video.onseeked = () => {
                ctx.drawImage(video, 0, 0);
                
                canvas.toBlob((blob) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                }, 'image/jpeg', 0.8);
            };
            
            video.src = URL.createObjectURL(file);
        });
    }

    async uploadToCloudinary(file, uploadId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', window.CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'jkuat-events');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData,
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.showUploadProgress(uploadId, file.name, progress);
                }
            }
        );

        if (!response.ok) {
            throw new Error('Cloudinary upload failed');
        }

        const result = await response.json();
        
        return {
            url: result.secure_url,
            publicId: result.public_id,
            type: result.resource_type,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.bytes,
            storage: 'cloudinary'
        };
    }

    async uploadToSupabase(file, uploadId) {
        try {
            // Get Supabase client
            const supabaseClient = this.getSupabaseClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `events/${fileName}`;

            console.log('📤 Uploading to Supabase:', filePath);

            // Upload file
            const { data, error } = await supabaseClient.storage
                .from(window.SUPABASE_CONFIG.bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
            }

            // Get public URL
            const { data: urlData } = supabaseClient.storage
                .from(window.SUPABASE_CONFIG.bucket)
                .getPublicUrl(filePath);

            console.log('✅ Supabase upload successful:', urlData.publicUrl);

            return {
                url: urlData.publicUrl,
                path: filePath,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                size: file.size,
                name: file.name,
                storage: 'supabase',
                bucket: window.SUPABASE_CONFIG.bucket
            };

        } catch (error) {
            console.error('Supabase upload failed:', error);
            throw error;
        }
    }

    getSupabaseClient() {
        try {
            // Try to get Supabase client from global scope
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                return window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
            }
            
            // Try alternative global reference
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                return supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
            }

            console.error('Supabase client not found. Make sure Supabase JS is loaded.');
            return null;
        } catch (error) {
            console.error('Error creating Supabase client:', error);
            return null;
        }
    }

    async uploadToAWS(file, uploadId) {
        // This would require AWS SDK setup
        throw new Error('AWS S3 upload not implemented yet');
    }

    async uploadToLocal(file, uploadId) {
        // For local development, convert to base64 or use local file system
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // Simulate upload progress
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    this.showUploadProgress(uploadId, file.name, progress);
                    
                    if (progress >= 90) {
                        clearInterval(interval);
                        
                        resolve({
                            url: e.target.result, // Base64 data URL
                            type: file.type.startsWith('image/') ? 'image' : 'video',
                            size: file.size,
                            name: file.name,
                            storage: 'local'
                        });
                    }
                }, 100);
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    showUploadProgress(uploadId, fileName, progress) {
        let progressContainer = document.getElementById('upload-progress-container');
        
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'upload-progress-container';
            progressContainer.className = 'upload-progress-container';
            document.body.appendChild(progressContainer);
        }

        let progressItem = document.getElementById(`upload-${uploadId}`);
        
        if (!progressItem) {
            progressItem = document.createElement('div');
            progressItem.id = `upload-${uploadId}`;
            progressItem.className = 'upload-progress-item';
            progressContainer.appendChild(progressItem);
        }

        const isComplete = progress >= 100;
        const statusIcon = isComplete ? 'fa-check' : 'fa-spinner fa-spin';
        const statusColor = isComplete ? '#10b981' : '#3b82f6';

        progressItem.innerHTML = `
            <div class="upload-info">
                <i class="fas ${statusIcon}" style="color: ${statusColor};"></i>
                <span class="upload-filename">${fileName}</span>
            </div>
            <div class="upload-progress-bar">
                <div class="upload-progress-fill" style="width: ${progress}%; background: ${statusColor};"></div>
            </div>
            <span class="upload-percentage">${progress}%</span>
        `;
    }

    hideUploadProgress(uploadId) {
        const progressItem = document.getElementById(`upload-${uploadId}`);
        if (progressItem) {
            progressItem.style.opacity = '0';
            setTimeout(() => progressItem.remove(), 300);
        }
    }

    onUploadComplete(result, eventId) {
        console.log('Upload completed:', result);
        
        // Dispatch custom event with upload result
        document.dispatchEvent(new CustomEvent('mediaUploaded', {
            detail: { result, eventId }
        }));

        this.showSuccess(`File uploaded successfully!`);
    }

    showError(message) {
        if (window.eventsManager) {
            window.eventsManager.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }

    showSuccess(message) {
        if (window.eventsManager) {
            window.eventsManager.showToast(message, 'success');
        } else {
            console.log(message);
        }
    }

    // Utility methods for creating upload interfaces
    createMediaUploadWidget(eventId, options = {}) {
        const widget = document.createElement('div');
        widget.className = 'media-upload-widget';
        
        const allowMultiple = options.multiple !== false;
        const acceptTypes = options.acceptTypes || 'image/*,video/*';
        const showGallery = options.showGallery !== false;
        
        widget.innerHTML = `
            <div class="upload-tabs">
                <button class="upload-tab active" data-tab="upload">
                    <i class="fas fa-cloud-upload-alt"></i>
                    Upload New
                </button>
                ${showGallery ? `
                    <button class="upload-tab" data-tab="gallery">
                        <i class="fas fa-images"></i>
                        Media Gallery
                    </button>
                ` : ''}
            </div>
            
            <div class="upload-content">
                <div class="upload-panel active" data-panel="upload">
                    <div class="media-drop-zone" data-event-id="${eventId}">
                        <div class="drop-zone-content">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <h4>Upload Media</h4>
                            <p>Drag and drop files here or click to browse</p>
                            <p class="upload-limits">Max 10MB • Images: JPG, PNG, WebP • Videos: MP4, WebM</p>
                            <div class="upload-options">
                                <label class="upload-option">
                                    <input type="checkbox" id="optimize-${eventId}" checked>
                                    <span>Optimize images for web</span>
                                </label>
                                <label class="upload-option">
                                    <input type="checkbox" id="generate-thumbnails-${eventId}" checked>
                                    <span>Generate video thumbnails</span>
                                </label>
                            </div>
                        </div>
                        <input type="file" 
                               class="media-upload-input" 
                               data-event-id="${eventId}"
                               accept="${acceptTypes}"
                               ${allowMultiple ? 'multiple' : ''}
                               style="display: none;">
                    </div>
                    
                    <div class="bulk-upload-controls" style="display: none;">
                        <div class="bulk-progress">
                            <div class="bulk-progress-bar">
                                <div class="bulk-progress-fill"></div>
                            </div>
                            <span class="bulk-progress-text">0 / 0 files uploaded</span>
                        </div>
                        <button class="cancel-bulk-btn">
                            <i class="fas fa-times"></i>
                            Cancel All
                        </button>
                    </div>
                </div>
                
                ${showGallery ? `
                    <div class="upload-panel" data-panel="gallery">
                        <div class="gallery-controls">
                            <input type="text" class="gallery-search" placeholder="Search media...">
                            <select class="gallery-filter">
                                <option value="all">All Media</option>
                                <option value="image">Images Only</option>
                                <option value="video">Videos Only</option>
                            </select>
                        </div>
                        <div class="media-gallery-grid" id="gallery-${eventId}">
                            <div class="gallery-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Loading media gallery...</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="media-preview-grid" id="preview-${eventId}"></div>
        `;

        // Setup tab switching
        this.setupTabSwitching(widget);
        
        // Setup upload functionality
        this.setupUploadWidget(widget, eventId);
        
        // Load gallery if enabled
        if (showGallery) {
            this.loadMediaGallery(eventId);
        }

        return widget;
    }

    setupTabSwitching(widget) {
        const tabs = widget.querySelectorAll('.upload-tab');
        const panels = widget.querySelectorAll('.upload-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;
                
                // Update active states
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                widget.querySelector(`[data-panel="${targetPanel}"]`).classList.add('active');
            });
        });
    }

    setupUploadWidget(widget, eventId) {
        const dropZone = widget.querySelector('.media-drop-zone');
        const fileInput = widget.querySelector('.media-upload-input');
        
        // Click to upload
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File selection handler
        fileInput.addEventListener('change', (e) => {
            this.handleBulkUpload(Array.from(e.target.files), eventId);
        });
    }

    async handleBulkUpload(files, eventId) {
        if (!files.length) return;
        
        const bulkControls = document.querySelector('.bulk-upload-controls');
        const progressBar = document.querySelector('.bulk-progress-fill');
        const progressText = document.querySelector('.bulk-progress-text');
        
        bulkControls.style.display = 'flex';
        
        let completed = 0;
        const total = files.length;
        
        const updateProgress = () => {
            const percentage = (completed / total) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${completed} / ${total} files uploaded`;
        };
        
        // Upload files in parallel (max 3 at a time)
        const uploadPromises = files.map(async (file, index) => {
            try {
                await this.uploadFile(file, eventId);
                completed++;
                updateProgress();
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                completed++;
                updateProgress();
            }
        });
        
        await Promise.all(uploadPromises);
        
        // Hide bulk controls after completion
        setTimeout(() => {
            bulkControls.style.display = 'none';
        }, 2000);
    }

    async loadMediaGallery(eventId) {
        const galleryGrid = document.getElementById(`gallery-${eventId}`);
        if (!galleryGrid) return;
        
        try {
            // Load existing media from storage
            const media = await this.getExistingMedia();
            
            if (media.length === 0) {
                galleryGrid.innerHTML = `
                    <div class="gallery-empty">
                        <i class="fas fa-images"></i>
                        <p>No media files found</p>
                        <p class="gallery-empty-hint">Upload some files to see them here</p>
                    </div>
                `;
                return;
            }
            
            galleryGrid.innerHTML = media.map(item => `
                <div class="gallery-item" data-media-id="${item.id}">
                    <div class="gallery-item-preview">
                        ${item.type === 'video' ? `
                            <video src="${item.url}" poster="${item.thumbnail}"></video>
                            <div class="video-overlay">
                                <i class="fas fa-play"></i>
                            </div>
                        ` : `
                            <img src="${item.url}" alt="${item.name}">
                        `}
                    </div>
                    <div class="gallery-item-info">
                        <span class="gallery-item-name">${item.name}</span>
                        <span class="gallery-item-size">${this.formatFileSize(item.size)}</span>
                    </div>
                    <div class="gallery-item-actions">
                        <button class="gallery-action-btn select" onclick="window.mediaManager.selectMedia('${item.id}', '${eventId}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="gallery-action-btn delete" onclick="window.mediaManager.deleteMedia('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Failed to load media gallery:', error);
            galleryGrid.innerHTML = `
                <div class="gallery-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load media gallery</p>
                </div>
            `;
        }
    }

    async getExistingMedia() {
        // This would fetch from your storage/database
        // For now, return mock data
        return [
            {
                id: '1',
                name: 'workshop-photo-1.jpg',
                url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
                type: 'image',
                size: 245760,
                created_at: '2025-01-15T10:00:00Z'
            },
            {
                id: '2',
                name: 'event-video.mp4',
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300',
                type: 'video',
                size: 1048576,
                created_at: '2025-01-14T15:30:00Z'
            }
        ];
    }

    selectMedia(mediaId, eventId) {
        // Add selected media to event
        console.log('Selecting media:', mediaId, 'for event:', eventId);
        this.showSuccess('Media selected successfully!');
    }

    async deleteMedia(mediaId) {
        if (!confirm('Are you sure you want to delete this media file?')) {
            return;
        }
        
        try {
            // Delete from storage
            await this.deleteFromStorage(mediaId);
            
            // Remove from UI
            const mediaElement = document.querySelector(`[data-media-id="${mediaId}"]`);
            if (mediaElement) {
                mediaElement.remove();
            }
            
            this.showSuccess('Media deleted successfully!');
        } catch (error) {
            console.error('Failed to delete media:', error);
            this.showError('Failed to delete media file');
        }
    }

    async deleteFromStorage(mediaId) {
        // Implementation depends on storage type
        console.log('Deleting media from storage:', mediaId);
        // This would call the appropriate storage API
    }

    // Storage usage monitoring
    async getStorageUsage() {
        try {
            switch (this.storageType) {
                case 'supabase':
                    return await this.getSupabaseStorageUsage();
                case 'cloudinary':
                    return await this.getCloudinaryStorageUsage();
                case 'local':
                    return await this.getLocalStorageUsage();
                default:
                    return { used: 0, total: 0, percentage: 0 };
            }
        } catch (error) {
            console.error('Failed to get storage usage:', error);
            return { used: 0, total: 0, percentage: 0 };
        }
    }

    async getSupabaseStorageUsage() {
        // This would require a backend endpoint to check storage usage
        // For now, return mock data
        return {
            used: 245 * 1024 * 1024, // 245 MB
            total: 1024 * 1024 * 1024, // 1 GB
            percentage: 24
        };
    }

    async getCloudinaryStorageUsage() {
        // This would require Cloudinary Admin API
        return {
            used: 5.2 * 1024 * 1024 * 1024, // 5.2 GB
            total: 25 * 1024 * 1024 * 1024, // 25 GB
            percentage: 21
        };
    }

    async getLocalStorageUsage() {
        // Estimate local storage usage
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        
        return {
            used: totalSize,
            total: 5 * 1024 * 1024, // 5 MB typical limit
            percentage: (totalSize / (5 * 1024 * 1024)) * 100
        };
    }

    createStorageUsageWidget() {
        const widget = document.createElement('div');
        widget.className = 'storage-usage';
        widget.id = 'storage-usage-widget';
        
        this.updateStorageUsageWidget(widget);
        
        return widget;
    }

    async updateStorageUsageWidget(widget) {
        const usage = await this.getStorageUsage();
        const usedFormatted = this.formatFileSize(usage.used);
        const totalFormatted = this.formatFileSize(usage.total);
        
        let fillClass = 'low';
        if (usage.percentage > 80) fillClass = 'high';
        else if (usage.percentage > 60) fillClass = 'medium';
        
        widget.innerHTML = `
            <div class="storage-usage-header">
                <span class="storage-usage-title">
                    <i class="fas fa-hdd"></i>
                    Storage Usage (${this.storageType})
                </span>
                <span class="storage-usage-amount">${usedFormatted} / ${totalFormatted}</span>
            </div>
            <div class="storage-usage-bar">
                <div class="storage-usage-fill ${fillClass}" style="width: ${usage.percentage}%"></div>
            </div>
        `;
    }

    // Method to be called after uploads to refresh usage
    async refreshStorageUsage() {
        const widget = document.getElementById('storage-usage-widget');
        if (widget) {
            await this.updateStorageUsageWidget(widget);
        }
    }

    // Method to get optimized image URLs
    getOptimizedImageUrl(originalUrl, options = {}) {
        const { width = 800, height = 600, quality = 80, format = 'auto' } = options;
        
        if (originalUrl.includes('cloudinary.com')) {
            // Cloudinary transformations
            const baseUrl = originalUrl.split('/upload/')[0] + '/upload/';
            const imagePath = originalUrl.split('/upload/')[1];
            return `${baseUrl}w_${width},h_${height},c_fill,q_${quality},f_${format}/${imagePath}`;
        } else if (originalUrl.includes('supabase')) {
            // Supabase doesn't have built-in transformations, return original
            return originalUrl;
        } else {
            // For other services or local files, return original
            return originalUrl;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.mediaManager) {
        window.mediaManager = new MediaManager();
    }
});

// Make available globally
window.MediaManager = MediaManager;