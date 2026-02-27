/**
 * CMS Media Manager
 * Handles media library and file uploads
 */

export class CMSMediaManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
        this.apiBase = '/api/v1';
    }

    async load() {
        const container = document.getElementById('media-library');
        if (!container) return;

        container.replaceChildren();
        container.appendChild(CMSUI.createLoadingElement());

        try {
            const media = await CMSData.getMedia();
            this.render(media);
        } catch (error) {
            console.error('Error loading media:', error);
            container.replaceChildren();
            container.appendChild(CMSUI.createEmptyState('Failed to load media. Please try again.'));
        }
    }

    render(mediaItems) {
        const container = document.getElementById('media-library');
        container.replaceChildren();

        if (!mediaItems.length) {
            container.appendChild(CMSUI.createEmptyState('No media files found. Upload your first file!'));
            return;
        }

        // Create media grid
        const grid = document.createElement('div');
        grid.className = 'media-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            padding: 1rem;
        `;

        mediaItems.forEach(item => {
            const card = this.createMediaCard(item);
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    createMediaCard(item) {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        const isImage = item.type?.startsWith('image/');
        const isVideo = item.type?.startsWith('video/');

        card.innerHTML = `
            <div class="media-preview" style="width: 100%; height: 150px; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${isImage ? `
                    <img src="${item.url}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                ` : isVideo ? `
                    <video src="${item.url}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                ` : `
                    <i class="fas fa-file" style="font-size: 3rem; color: rgba(255,255,255,0.3);"></i>
                `}
            </div>
            <div class="media-info" style="padding: 0.75rem;">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: rgba(255,255,255,0.6);">
                    <span>${this.formatFileSize(item.size)}</span>
                    <span>${new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div class="media-actions" style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <button class="btn-sm btn-secondary" onclick="cmsManager.mediaManager.viewMedia('${item.id}')" style="flex: 1; font-size: 0.75rem;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-primary" onclick="cmsManager.mediaManager.copyUrl('${item.url}')" style="flex: 1; font-size: 0.75rem;">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="cmsManager.mediaManager.deleteMedia('${item.id}')" style="flex: 1; font-size: 0.75rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    async viewMedia(id) {
        try {
            const media = await CMSData.getMediaItem(id);
            
            // Open in lightbox or new tab
            if (media.type?.startsWith('image/')) {
                window.lightbox?.open(media.url);
            } else {
                window.open(media.url, '_blank');
            }
        } catch (error) {
            console.error('Error viewing media:', error);
            this.cms.notifications.show('Failed to load media', 'error');
        }
    }

    async copyUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.cms.notifications.show('URL copied to clipboard!', 'success');
        } catch (error) {
            console.error('Error copying URL:', error);
            this.cms.notifications.show('Failed to copy URL', 'error');
        }
    }

    async deleteMedia(id) {
        if (!this.cms.checkOperationPermissions('delete', 'media')) {
            return;
        }

        if (!confirm('Are you sure you want to delete this media file? This action cannot be undone.')) {
            return;
        }

        try {
            await CMSData.deleteMedia(id);
            this.cms.notifications.show('Media deleted successfully', 'success');
            this.load();
        } catch (error) {
            console.error('Error deleting media:', error);
            this.cms.notifications.show('Failed to delete media', 'error');
        }
    }

    async uploadMedia(file, bucket = 'media') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', bucket);

            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const response = await fetch(`${this.apiBase}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            this.cms.notifications.show('File uploaded successfully!', 'success');
            this.load(); // Reload media library
            
            return data.url;
        } catch (error) {
            console.error('Error uploading media:', error);
            this.cms.notifications.show('Failed to upload file', 'error');
            throw error;
        }
    }
}
