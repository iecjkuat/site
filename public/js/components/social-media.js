// JKUAT Innovation Club - Social Media Integration

class SocialMedia {
    constructor() {
        this.init();
    }

    init() {
        // Remove any existing social share buttons first
        this.removeSocialButtons();
        
        // Disable all social sharing functionality
        console.log('📱 Social media integration disabled by user request');
        return;
        
        // Original code disabled:
        // this.setupSocialSharing();
        // this.addSocialButtons();
        // this.trackSocialInteractions();
    }

    // Remove existing social share buttons
    removeSocialButtons() {
        const existingContainer = document.getElementById('social-share-container');
        if (existingContainer) {
            existingContainer.remove();
            console.log('📱 Removed existing social share buttons');
        }
    }

    // Setup social sharing functionality - DISABLED
    setupSocialSharing() {
        // Social sharing buttons disabled by user request
        console.log('📱 Social sharing buttons disabled');
        return;
    }

    // Add social sharing buttons
    addShareButton(platform, shareData) {
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`
        };

        // Create floating share buttons
        if (!document.getElementById('social-share-container')) {
            this.createShareContainer();
        }

        const container = document.getElementById('social-share-container');
        const button = this.createShareButtonElement(platform, shareUrls[platform]);
        container.appendChild(button);
    }

    // Create share container
    createShareContainer() {
        const container = document.createElement('div');
        container.id = 'social-share-container';
        container.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(container);

        // Show after page loads
        setTimeout(() => {
            container.style.opacity = '1';
        }, 2000);

        // Hide on mobile
        if (window.innerWidth < 768) {
            container.style.display = 'none';
        }
    }

    // Create individual share button
    createShareButtonElement(platform, url) {
        const button = document.createElement('a');
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        
        const icons = {
            facebook: 'fab fa-facebook-f',
            twitter: 'fab fa-twitter',
            linkedin: 'fab fa-linkedin-in',
            whatsapp: 'fab fa-whatsapp'
        };

        const colors = {
            facebook: '#1877f2',
            twitter: '#1da1f2',
            linkedin: '#0077b5',
            whatsapp: '#25d366'
        };

        button.innerHTML = `<i class="${icons[platform]}"></i>`;
        button.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: ${colors[platform]};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        button.addEventListener('click', () => {
            this.trackSocialShare(platform);
        });

        return button;
    }

    // Add social media links to footer
    addSocialButtons() {
        const socialLinks = document.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]');
        
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = this.getPlatformFromUrl(link.href);
                this.trackSocialClick(platform, 'footer_link');
            });
        });
    }

    // Get platform name from URL
    getPlatformFromUrl(url) {
        if (url.includes('facebook')) return 'facebook';
        if (url.includes('twitter')) return 'twitter';
        if (url.includes('instagram')) return 'instagram';
        if (url.includes('linkedin')) return 'linkedin';
        if (url.includes('whatsapp')) return 'whatsapp';
        return 'unknown';
    }

    // Track social interactions
    trackSocialInteractions() {
        // Track social media clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isSocialMediaLink(link.href)) {
                const platform = this.getPlatformFromUrl(link.href);
                this.trackSocialClick(platform, 'organic_link');
            }
        });
    }

    // Check if URL is a social media link
    isSocialMediaLink(url) {
        const socialDomains = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'whatsapp.com'];
        return socialDomains.some(domain => url.includes(domain));
    }

    // Track social sharing
    trackSocialShare(platform) {
        if (window.analytics) {
            window.analytics.trackEvent('social_share', {
                platform: platform,
                page: window.location.pathname,
                source: 'floating_button'
            });
        }
        console.log(`📱 Social share tracked: ${platform}`);
    }

    // Track social clicks
    trackSocialClick(platform, source) {
        if (window.analytics) {
            window.analytics.trackEvent('social_click', {
                platform: platform,
                source: source,
                page: window.location.pathname
            });
        }
        console.log(`📱 Social click tracked: ${platform} from ${source}`);
    }

    // Add social proof notifications - DISABLED
    addSocialProof() {
        // Social proof notifications disabled by user request
        console.log('📱 Social proof notifications disabled');
        return;
    }

    // Initialize social proof after page load - DISABLED
    initSocialProof() {
        // Social proof notifications disabled by user request
        console.log('📱 Social proof initialization disabled');
        return;
    }
}

// Initialize social media integration - DISABLED
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Social media integration completely disabled by user request');
    
    // Remove any existing social buttons immediately
    const existingContainer = document.getElementById('social-share-container');
    if (existingContainer) {
        existingContainer.remove();
        console.log('📱 Removed existing social share buttons on load');
    }
    
    // Set up observer to prevent future creation
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.id === 'social-share-container') {
                    node.remove();
                    console.log('📱 Prevented social share buttons from being created');
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Make available globally
window.SocialMedia = SocialMedia;