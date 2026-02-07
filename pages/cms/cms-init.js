/**
 * CMS Initialization Script
 * Handles modal management and event listeners
 */

// Debug logging
console.log('🔍 Starting CMS initialization...');
console.log('📍 Current URL:', window.location.href);
console.log('🔐 Auth Manager:', window.authManager ? 'Loaded' : 'Not loaded');

// Modal Management Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Specific modal functions
function showCreateArticle() {
    showModal('createArticleModal');
}

function closeArticleModal() {
    hideModal('createArticleModal');
}

function showCreateEvent() {
    showModal('createEventModal');
}

function closeEventModal() {
    hideModal('createEventModal');
}

function showCreateOpportunity() {
    showModal('createOpportunityModal');
}

function closeOpportunityModal() {
    hideModal('createOpportunityModal');
}

function showMediaLibrary() {
    if (window.cmsManager) {
        window.cmsManager.switchTab('media');
    }
}

function showMediaUpload() {
    if (window.cmsManager) {
        window.cmsManager.switchTab('media');
    }
}

// Initialize CMS when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 CMS DOM loaded, initializing...');

    // Add event listeners for buttons (replacing inline onclick handlers)
    const addClickListener = (id, handler) => {
        const element = document.getElementById(id);
        if (element && typeof handler === 'function') {
            element.addEventListener('click', handler);
        }
    };

    // Quick action buttons
    document.querySelectorAll('.cms-quick-action').forEach(action => {
        action.addEventListener('click', () => {
            const actionType = action.dataset.action;
            switch (actionType) {
                case 'create-article':
                    showCreateArticle();
                    break;
                case 'create-event':
                    showCreateEvent();
                    break;
                case 'create-project':
                    if (window.cmsManager) window.cmsManager.showCreateForm('project');
                    break;
                case 'create-opportunity':
                    showCreateOpportunity();
                    break;
                case 'review-ideas':
                    if (window.cmsManager) window.cmsManager.switchTab('innovation');
                    break;
                case 'show-media':
                    showMediaLibrary();
                    break;
            }
        });
    });

    // Tab-specific create buttons
    addClickListener('new-article-btn', () => {
        showCreateArticle();
    });
    addClickListener('new-event-btn', () => {
        showCreateEvent();
    });
    addClickListener('new-project-btn', () => {
        if (window.cmsManager) window.cmsManager.showCreateForm('project');
    });
    addClickListener('new-opportunity-btn', () => {
        showCreateOpportunity();
    });
    addClickListener('upload-media-btn', () => {
        showMediaUpload();
    });

    // New tab buttons
    addClickListener('create-challenge-btn', () => {
        if (window.cmsManager) window.cmsManager.showCreateForm('challenge');
    });
    addClickListener('export-ideas-btn', () => {
        if (window.cmsManager) window.cmsManager.exportContent();
    });
    addClickListener('send-announcement-btn', () => {
        if (window.cmsManager) window.cmsManager.showCreateForm('announcement');
    });
    addClickListener('message-templates-btn', () => {
        if (window.cmsManager) window.cmsManager.notifications.show('Message templates feature coming soon!', 'info');
    });
    addClickListener('message-members-btn', () => {
        if (window.cmsManager) window.cmsManager.showCreateForm('announcement');
    });
    addClickListener('export-members-btn', () => {
        if (window.cmsManager) window.cmsManager.exportContent();
    });

    // Modal close buttons
    addClickListener('close-event-modal', () => {
        closeEventModal();
    });
    addClickListener('close-opportunity-modal', () => {
        closeOpportunityModal();
    });
    addClickListener('close-article-modal', () => {
        closeArticleModal();
    });
    addClickListener('close-announcement-modal', () => {
        hideModal('sendAnnouncementModal');
    });
    addClickListener('close-challenge-modal', () => {
        hideModal('createChallengeModal');
    });

    // The global navbar is already loaded via the script tag in head
    // Just wait a moment for it to initialize
    setTimeout(() => {
        console.log('✅ CMS page ready with secure event handlers');
    }, 500);
});

// Catch module loading errors
window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('cms')) {
        console.error('❌ CMS Module Error:', e.message, e.filename);
    }
});
