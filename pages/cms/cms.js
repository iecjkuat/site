// JKUAT Innovation Club - CMS Page JavaScript

class CMSManager {
    constructor() {
        this.quillEditor = null;
        this.init();
    }

    init() {
        this.initializeQuillEditor();
        this.bindEvents();
        this.loadRecentActivity();
    }

    initializeQuillEditor() {
        // Initialize Quill editor for article creation
        if (document.getElementById('articleEditor')) {
            this.quillEditor = new Quill('#articleEditor', {
                theme: 'snow',
                placeholder: 'Write your article content here...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image', 'video'],
                        ['blockquote', 'code-block'],
                        ['clean']
                    ]
                }
            });
        }
    }

    bindEvents() {
        // Article form submission
        const articleForm = document.getElementById('articleForm');
        if (articleForm) {
            articleForm.addEventListener('submit', (e) => this.handleArticleSubmission(e));
        }

        // Modal close events
        const closeArticleModal = document.getElementById('closeArticleModal');
        if (closeArticleModal) {
            closeArticleModal.addEventListener('click', () => this.closeArticleModal());
        }

        // Click outside to close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAllModals();
            }
        });
    }

    async handleArticleSubmission(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Get content from Quill editor
        const content = this.quillEditor.root.innerHTML;
        
        if (!content || content.trim() === '<p><br></p>') {
            alert('Please enter article content');
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner"></div>Publishing...';
        submitBtn.disabled = true;

        try {
            const articleData = {
                title: formData.get('title'),
                content: content,
                category: formData.get('category'),
                status: formData.get('status'),
                tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
            };

            // Handle file upload if present
            const featuredImage = formData.get('featuredImage');
            if (featuredImage && featuredImage.size > 0) {
                const imageFormData = new FormData();
                imageFormData.append('image', featuredImage);

                const uploadResponse = await fetch('/api/content/media/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: imageFormData
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    articleData.featured_image = uploadData.url;
                }
            }

            // Create article
            const response = await fetch('/api/content/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(articleData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Article published successfully!');
                this.closeArticleModal();
                this.resetArticleForm();
                this.loadRecentActivity(); // Refresh recent activity
            } else {
                throw new Error(data.message || 'Failed to publish article');
            }

        } catch (error) {
            console.error('Article submission error:', error);
            alert('Failed to publish article: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async loadRecentActivity() {
        try {
            const response = await fetch('/api/content/recent-activity', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const activities = await response.json();
                this.renderRecentActivity(activities);
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    renderRecentActivity(activities) {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer || !activities.length) return;

        const activityHTML = activities.map(activity => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 0.5rem;">
                <div style="width: 40px; height: 40px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-newspaper" style="color: #3b82f6;"></i>
                </div>
                <div style="flex: 1;">
                    <p style="color: white; font-weight: 600; margin: 0;">${activity.title}</p>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin: 0;">
                        ${this.formatTimeAgo(activity.created_at)} by ${activity.author_name}
                    </p>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHTML;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        if (diffHours < 1) {
            return 'Just now';
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            const diffDays = Math.ceil(diffHours / 24);
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
    }

    closeArticleModal() {
        const modal = document.getElementById('createArticleModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('[id$="Modal"]');
        modals.forEach(modal => modal.classList.add('hidden'));
    }

    resetArticleForm() {
        const form = document.getElementById('articleForm');
        if (form) {
            form.reset();
            if (this.quillEditor) {
                this.quillEditor.setContents([]);
            }
        }
    }
}

// Global functions for CMS actions
window.showCreateArticle = function() {
    const modal = document.getElementById('createArticleModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
};

window.closeArticleModal = function() {
    const modal = document.getElementById('createArticleModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.showCreateEvent = function() {
    alert('Event creation interface coming soon! For now, events can be created through the events page.');
};

window.showManageContent = function() {
    alert('Content management interface coming soon! This will allow editing existing articles and managing homepage sections.');
};

window.showMediaLibrary = function() {
    alert('Media library interface coming soon! This will allow uploading and managing images, documents, and other files.');
};

window.showCreateOpportunity = function() {
    alert('Opportunity posting interface coming soon! For now, opportunities can be posted through the opportunities page.');
};

window.showAnalytics = function() {
    alert('Analytics dashboard coming soon! This will show website statistics, content performance, and user engagement metrics.');
};

// Initialize CMS manager
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and has permissions
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        alert('Please login to access the Content Management System');
        window.location.href = '/';
        return;
    }

    try {
        const userData = JSON.parse(user);
        if (!['admin', 'executive'].includes(userData.role)) {
            alert('Access denied. Only admins and executives can access the CMS.');
            window.location.href = '/dashboard';
            return;
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = '/';
        return;
    }

    // Initialize CMS manager
    window.cmsManager = new CMSManager();
});

// Make CMSManager available globally
window.CMSManager = CMSManager;