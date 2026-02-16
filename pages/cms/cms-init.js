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


// Event Cover Image Upload Handler
document.addEventListener('DOMContentLoaded', () => {
    const selectImageBtn = document.getElementById('selectEventImage');
    const coverImageInput = document.getElementById('eventCoverImage');
    const imagePreview = document.getElementById('eventImagePreview');
    const previewImg = document.getElementById('eventPreviewImg');
    const uploadPrompt = document.getElementById('eventImageUploadPrompt');
    const removeImageBtn = document.getElementById('removeEventImage');

    if (selectImageBtn && coverImageInput) {
        selectImageBtn.addEventListener('click', () => {
            coverImageInput.click();
        });

        coverImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size must be less than 5MB');
                    return;
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                    uploadPrompt.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                coverImageInput.value = '';
                previewImg.src = '';
                imagePreview.style.display = 'none';
                uploadPrompt.style.display = 'block';
            });
        }
    }

    // Preview Event Button
    const previewBtn = document.getElementById('previewEventBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            const form = document.getElementById('eventForm');
            const formData = new FormData(form);
            
            // Create preview modal
            const previewModal = document.createElement('div');
            previewModal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.9); z-index: 10001;
                display: flex; align-items: center; justify-content: center;
                padding: 2rem; overflow-y: auto;
            `;
            
            const previewContent = document.createElement('div');
            previewContent.style.cssText = `
                background: white; border-radius: 12px; max-width: 800px;
                width: 100%; padding: 2rem; position: relative;
            `;
            
            const coverImage = previewImg.src ? `<img src="${previewImg.src}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1.5rem;">` : '';
            
            previewContent.innerHTML = `
                <button onclick="this.closest('div[style*=fixed]').remove()" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">&times;</button>
                <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #111;">Event Preview</h2>
                <p style="color: #666; margin-bottom: 1.5rem; font-size: 0.875rem;">This is how your event will appear to users</p>
                ${coverImage}
                <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: #111;">${formData.get('title') || 'Event Title'}</h1>
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.875rem;">${formData.get('type') || 'Event Type'}</span>
                    <span style="color: #666;"><i class="fas fa-calendar"></i> ${formData.get('startDate') || 'Date TBD'}</span>
                    <span style="color: #666;"><i class="fas fa-map-marker-alt"></i> ${formData.get('location') || 'Location TBD'}</span>
                    ${formData.get('registrationFee') && formData.get('registrationFee') > 0 ? `<span style="color: #666;"><i class="fas fa-money-bill"></i> KSh ${formData.get('registrationFee')}</span>` : '<span style="color: #10b981;"><i class="fas fa-check"></i> Free</span>'}
                </div>
                <div style="color: #333; line-height: 1.6; margin-bottom: 1.5rem;">
                    ${document.querySelector('#eventEditor .ql-editor')?.innerHTML || '<p>Event description will appear here...</p>'}
                </div>
                ${formData.get('agenda') ? `<div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"><h3 style="font-weight: 600; margin-bottom: 0.5rem;">Agenda</h3><pre style="white-space: pre-wrap; font-family: inherit;">${formData.get('agenda')}</pre></div>` : ''}
                ${formData.get('requirements') ? `<div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"><h3 style="font-weight: 600; margin-bottom: 0.5rem;">Requirements</h3><p>${formData.get('requirements')}</p></div>` : ''}
            `;
            
            previewModal.appendChild(previewContent);
            document.body.appendChild(previewModal);
        });
    }
});
