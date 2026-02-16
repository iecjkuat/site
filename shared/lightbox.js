/**
 * Image/Video Lightbox Utility
 * Displays images and videos in full-screen overlay with navigation
 */

class Lightbox {
    constructor() {
        this.currentIndex = 0;
        this.gallery = [];
        this.lightboxElement = null;
    }

    open(index, gallery) {
        this.currentIndex = index;
        this.gallery = gallery;
        this.create();
        this.render();
        this.attachEventListeners();
    }

    create() {
        this.lightboxElement = document.createElement('div');
        this.lightboxElement.id = 'lightbox';
        this.lightboxElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(this.lightboxElement);
        document.body.style.overflow = 'hidden';
    }

    render() {
        const media = this.gallery[this.currentIndex];
        const isVideo = media.type === 'video';

        const content = isVideo ? `
            <video 
                src="${this.escapeHTML(media.url)}" 
                controls 
                autoplay 
                style="max-width: 95vw; max-height: 90vh; width: auto; height: auto; border-radius: 8px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
            </video>
        ` : `
            <img 
                src="${this.escapeHTML(media.url)}" 
                alt="Gallery image"
                style="max-width: 95vw; max-height: 90vh; width: auto; height: auto; border-radius: 8px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
        `;

        this.lightboxElement.innerHTML = `
            <!-- Close button -->
            <button 
                id="lightbox-close" 
                style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: none; border-radius: 50%; width: 50px; height: 50px; color: white; font-size: 2rem; cursor: pointer; z-index: 10; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;"
                onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                ×
            </button>

            ${this.gallery.length > 1 ? `
                <!-- Previous button -->
                <button 
                    id="lightbox-prev" 
                    style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: none; border-radius: 50%; width: 50px; height: 50px; color: white; font-size: 1.5rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;"
                    onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ‹
                </button>

                <!-- Next button -->
                <button 
                    id="lightbox-next" 
                    style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: none; border-radius: 50%; width: 50px; height: 50px; color: white; font-size: 1.5rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;"
                    onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ›
                </button>
            ` : ''}

            <!-- Content -->
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                ${content}
                <div style="margin-top: 1rem;">
                    ${this.gallery.length > 1 ? `
                        <p style="color: white; margin: 0; font-size: 0.9rem; font-weight: 500;">
                            ${this.currentIndex + 1} / ${this.gallery.length}
                        </p>
                    ` : ''}
                    ${media.name ? `
                        <p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0 0 0; font-size: 0.85rem;">
                            ${this.escapeHTML(media.name)}
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Close button
        const closeBtn = document.getElementById('lightbox-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.close();
        }

        // Navigation buttons
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');
        
        if (prevBtn) prevBtn.onclick = () => this.prev();
        if (nextBtn) nextBtn.onclick = () => this.next();

        // Close on background click
        this.lightboxElement.onclick = (e) => {
            if (e.target === this.lightboxElement) this.close();
        };

        // Keyboard navigation
        this.keyHandler = (e) => {
            switch(e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.gallery.length;
        this.render();
        this.attachEventListeners();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.gallery.length) % this.gallery.length;
        this.render();
        this.attachEventListeners();
    }

    close() {
        if (this.lightboxElement) {
            this.lightboxElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                this.lightboxElement.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }
        document.removeEventListener('keydown', this.keyHandler);
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Add CSS animations
if (!document.getElementById('lightbox-styles')) {
    const style = document.createElement('style');
    style.id = 'lightbox-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Global instance
window.lightbox = new Lightbox();
