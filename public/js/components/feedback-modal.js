/**
 * Event Feedback Modal Component
 * Handles post-event feedback collection with ratings, comments, and photo uploads
 */

class FeedbackModal {
    constructor() {
        this.currentEvent = null;
        this.feedbackCategories = [];
        this.uploadedPhotos = [];
        this.maxPhotos = 5;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        
        this.loadFeedbackCategories();
    }

    async loadFeedbackCategories() {
        try {
            const response = await fetch('/api/feedback/categories');
            const data = await response.json();
            this.feedbackCategories = data.categories || [];
        } catch (error) {
            console.error('Error loading feedback categories:', error);
            this.feedbackCategories = [];
        }
    }

    show(event) {
        this.currentEvent = event;
        this.uploadedPhotos = [];
        this.createModal();
        this.loadExistingFeedback();
    }

    createModal() {
        // Remove existing modal
        const existingModal = document.getElementById('feedbackModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <div id="feedbackModal" class="feedback-modal-overlay">
                <div class="feedback-modal">
                    <div class="feedback-modal-header">
                        <div>
                            <h2>📝 Event Feedback</h2>
                            <p>${this.currentEvent.title}</p>
                        </div>
                        <button class="feedback-modal-close" onclick="feedbackModal.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="feedback-modal-content">
                        <form id="feedbackForm" class="feedback-form">
                            <!-- Overall Rating -->
                            <div class="feedback-section">
                                <h3><i class="fas fa-star"></i> Overall Rating</h3>
                                <div class="rating-input" data-rating="overall">
                                    ${this.createStarRating('overall')}
                                </div>
                                <p class="rating-description">How would you rate this event overall?</p>
                            </div>

                            <!-- Detailed Ratings -->
                            <div class="feedback-section">
                                <h3><i class="fas fa-chart-bar"></i> Detailed Ratings</h3>
                                <div class="detailed-ratings">
                                    <div class="rating-row">
                                        <label>Content Quality</label>
                                        <div class="rating-input" data-rating="content">
                                            ${this.createStarRating('content')}
                                        </div>
                                    </div>
                                    <div class="rating-row">
                                        <label>Organization</label>
                                        <div class="rating-input" data-rating="organization">
                                            ${this.createStarRating('organization')}
                                        </div>
                                    </div>
                                    <div class="rating-row">
                                        <label>Venue & Facilities</label>
                                        <div class="rating-input" data-rating="venue">
                                            ${this.createStarRating('venue')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Category Ratings -->
                            <div class="feedback-section" id="categoryRatingsSection" style="display: none;">
                                <h3><i class="fas fa-list"></i> Category Ratings</h3>
                                <div id="categoryRatings">
                                    <!-- Category ratings will be populated here -->
                                </div>
                            </div>

                            <!-- Comments -->
                            <div class="feedback-section">
                                <h3><i class="fas fa-comment"></i> Your Feedback</h3>
                                <div class="form-group">
                                    <label for="feedbackTitle">Title (Optional)</label>
                                    <input type="text" id="feedbackTitle" name="title" maxlength="200" 
                                           placeholder="Give your feedback a title...">
                                </div>
                                <div class="form-group">
                                    <label for="feedbackComment">What did you think about the event?</label>
                                    <textarea id="feedbackComment" name="comment" rows="4" maxlength="2000"
                                              placeholder="Share your thoughts about the event..."></textarea>
                                    <small class="char-count">0/2000 characters</small>
                                </div>
                                <div class="form-group">
                                    <label for="feedbackSuggestions">Suggestions for Improvement</label>
                                    <textarea id="feedbackSuggestions" name="suggestions" rows="3" maxlength="2000"
                                              placeholder="How can we make future events better?"></textarea>
                                    <small class="char-count">0/2000 characters</small>
                                </div>
                            </div>

                            <!-- Recommendation -->
                            <div class="feedback-section">
                                <h3><i class="fas fa-thumbs-up"></i> Recommendation</h3>
                                <div class="recommendation-input">
                                    <label class="recommendation-option">
                                        <input type="radio" name="wouldRecommend" value="true">
                                        <span class="recommendation-label">
                                            <i class="fas fa-thumbs-up"></i>
                                            Yes, I would recommend this event
                                        </span>
                                    </label>
                                    <label class="recommendation-option">
                                        <input type="radio" name="wouldRecommend" value="false">
                                        <span class="recommendation-label">
                                            <i class="fas fa-thumbs-down"></i>
                                            No, I would not recommend this event
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <!-- Photo Upload -->
                            <div class="feedback-section">
                                <h3><i class="fas fa-camera"></i> Share Photos</h3>
                                <div class="photo-upload-area">
                                    <input type="file" id="photoUpload" multiple accept="image/*" style="display: none;">
                                    <div class="upload-dropzone" onclick="document.getElementById('photoUpload').click()">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <p>Click to upload photos or drag and drop</p>
                                        <small>Maximum 5 photos, 5MB each (JPEG, PNG, GIF, WebP)</small>
                                    </div>
                                    <div id="photoPreview" class="photo-preview-grid">
                                        <!-- Photo previews will appear here -->
                                    </div>
                                </div>
                            </div>

                            <!-- Privacy Options -->
                            <div class="feedback-section">
                                <h3><i class="fas fa-user-secret"></i> Privacy</h3>
                                <div class="privacy-options">
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="anonymousFeedback" name="isAnonymous">
                                        <span class="checkmark"></span>
                                        Submit feedback anonymously
                                    </label>
                                    <p class="privacy-note">
                                        Anonymous feedback will not show your name or profile information.
                                    </p>
                                </div>
                            </div>

                            <!-- Submit Buttons -->
                            <div class="feedback-actions">
                                <button type="button" class="btn btn-secondary" onclick="feedbackModal.close()">
                                    Cancel
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-paper-plane"></i>
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.addModalStyles();
        this.setupEventListeners();
        this.populateCategoryRatings();
    }

    createStarRating(name) {
        return Array.from({ length: 5 }, (_, i) => 
            `<span class="star" data-rating="${i + 1}" data-name="${name}">★</span>`
        ).join('');
    }

    populateCategoryRatings() {
        if (this.feedbackCategories.length === 0) return;

        const categorySection = document.getElementById('categoryRatingsSection');
        const categoryContainer = document.getElementById('categoryRatings');
        
        if (!categoryContainer) return;

        const categoryHtml = this.feedbackCategories.map(category => `
            <div class="category-rating-row">
                <div class="category-info">
                    <i class="${category.icon}"></i>
                    <div>
                        <label>${category.name}</label>
                        <small>${category.description}</small>
                    </div>
                </div>
                <div class="rating-input" data-rating="category-${category.id}">
                    ${this.createStarRating(`category-${category.id}`)}
                </div>
            </div>
        `).join('');

        categoryContainer.innerHTML = categoryHtml;
        categorySection.style.display = 'block';
    }

    setupEventListeners() {
        // Star rating interactions
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.handleStarClick(e);
            });
            
            star.addEventListener('mouseover', (e) => {
                this.handleStarHover(e);
            });
        });

        // Rating containers mouse leave
        document.querySelectorAll('.rating-input').forEach(container => {
            container.addEventListener('mouseleave', (e) => {
                this.resetStarDisplay(e.currentTarget);
            });
        });

        // Character counters
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target);
            });
        });

        // Photo upload
        const photoUpload = document.getElementById('photoUpload');
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => {
                this.handlePhotoUpload(e);
            });
        }

        // Drag and drop for photos
        const dropzone = document.querySelector('.upload-dropzone');
        if (dropzone) {
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });

            dropzone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                this.handlePhotoDrop(e);
            });
        }

        // Form submission
        const form = document.getElementById('feedbackForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeedback();
            });
        }
    }

    handleStarClick(e) {
        const star = e.target;
        const rating = parseInt(star.dataset.rating);
        const name = star.dataset.name;
        const container = star.closest('.rating-input');
        
        // Set the rating
        container.dataset.selectedRating = rating;
        
        // Update visual state
        this.updateStarDisplay(container, rating);
    }

    handleStarHover(e) {
        const star = e.target;
        const rating = parseInt(star.dataset.rating);
        const container = star.closest('.rating-input');
        
        this.updateStarDisplay(container, rating, true);
    }

    updateStarDisplay(container, rating, isHover = false) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            const starRating = index + 1;
            star.classList.remove('active', 'hover');
            
            if (starRating <= rating) {
                star.classList.add(isHover ? 'hover' : 'active');
            }
        });
    }

    resetStarDisplay(container) {
        const selectedRating = parseInt(container.dataset.selectedRating) || 0;
        this.updateStarDisplay(container, selectedRating);
    }

    updateCharacterCount(textarea) {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        const currentLength = textarea.value.length;
        const counter = textarea.parentNode.querySelector('.char-count');
        
        if (counter) {
            counter.textContent = `${currentLength}/${maxLength} characters`;
            counter.classList.toggle('warning', currentLength > maxLength * 0.9);
        }
    }

    handlePhotoUpload(e) {
        const files = Array.from(e.target.files);
        this.processPhotoFiles(files);
    }

    handlePhotoDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        this.processPhotoFiles(files);
    }

    processPhotoFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (this.uploadedPhotos.length + imageFiles.length > this.maxPhotos) {
            this.showNotification(`Maximum ${this.maxPhotos} photos allowed`, 'warning');
            return;
        }

        imageFiles.forEach(file => {
            if (file.size > this.maxFileSize) {
                this.showNotification(`${file.name} is too large (max 5MB)`, 'error');
                return;
            }

            const photoData = {
                file: file,
                id: Date.now() + Math.random(),
                caption: ''
            };

            this.uploadedPhotos.push(photoData);
            this.addPhotoPreview(photoData);
        });
    }

    addPhotoPreview(photoData) {
        const preview = document.getElementById('photoPreview');
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const photoHtml = `
                <div class="photo-preview-item" data-photo-id="${photoData.id}">
                    <img src="${e.target.result}" alt="Preview">
                    <div class="photo-caption">
                        <input type="text" placeholder="Add caption..." 
                               onchange="feedbackModal.updatePhotoCaption('${photoData.id}', this.value)">
                    </div>
                    <button type="button" class="remove-photo" 
                            onclick="feedbackModal.removePhoto('${photoData.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            preview.insertAdjacentHTML('beforeend', photoHtml);
        };
        reader.readAsDataURL(photoData.file);
    }

    updatePhotoCaption(photoId, caption) {
        const photo = this.uploadedPhotos.find(p => p.id == photoId);
        if (photo) {
            photo.caption = caption;
        }
    }

    removePhoto(photoId) {
        this.uploadedPhotos = this.uploadedPhotos.filter(p => p.id != photoId);
        const preview = document.querySelector(`[data-photo-id="${photoId}"]`);
        if (preview) {
            preview.remove();
        }
    }

    async loadExistingFeedback() {
        try {
            const response = await fetch(`/api/feedback/my-feedback/${this.currentEvent.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.feedback) {
                    this.populateExistingFeedback(data.feedback);
                }
            }
        } catch (error) {
            console.error('Error loading existing feedback:', error);
        }
    }

    populateExistingFeedback(feedback) {
        // Populate ratings
        if (feedback.overall_rating) {
            this.setRating('overall', feedback.overall_rating);
        }
        if (feedback.content_rating) {
            this.setRating('content', feedback.content_rating);
        }
        if (feedback.organization_rating) {
            this.setRating('organization', feedback.organization_rating);
        }
        if (feedback.venue_rating) {
            this.setRating('venue', feedback.venue_rating);
        }

        // Populate text fields
        if (feedback.title) {
            document.getElementById('feedbackTitle').value = feedback.title;
        }
        if (feedback.comment) {
            document.getElementById('feedbackComment').value = feedback.comment;
            this.updateCharacterCount(document.getElementById('feedbackComment'));
        }
        if (feedback.suggestions) {
            document.getElementById('feedbackSuggestions').value = feedback.suggestions;
            this.updateCharacterCount(document.getElementById('feedbackSuggestions'));
        }

        // Populate recommendation
        if (feedback.would_recommend !== null) {
            const recommendRadio = document.querySelector(`input[name="wouldRecommend"][value="${feedback.would_recommend}"]`);
            if (recommendRadio) {
                recommendRadio.checked = true;
            }
        }

        // Populate anonymous setting
        if (feedback.is_anonymous) {
            document.getElementById('anonymousFeedback').checked = true;
        }
    }

    setRating(name, rating) {
        const container = document.querySelector(`[data-rating="${name}"]`);
        if (container) {
            container.dataset.selectedRating = rating;
            this.updateStarDisplay(container, rating);
        }
    }

    async submitFeedback() {
        try {
            const formData = this.collectFormData();
            
            if (!this.validateFormData(formData)) {
                return;
            }

            // Show loading state
            this.setSubmitButtonLoading(true);

            // Submit feedback
            const response = await fetch('/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit feedback');
            }

            const result = await response.json();

            // Upload photos if any
            if (this.uploadedPhotos.length > 0) {
                await this.uploadPhotos(result.feedbackId);
            }

            this.showNotification('Feedback submitted successfully! Thank you for your input.', 'success');
            
            // Close modal after short delay
            setTimeout(() => {
                this.close();
            }, 2000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }

    collectFormData() {
        const formData = {
            eventId: this.currentEvent.id,
            overallRating: this.getRating('overall'),
            contentRating: this.getRating('content'),
            organizationRating: this.getRating('organization'),
            venueRating: this.getRating('venue'),
            title: document.getElementById('feedbackTitle').value.trim(),
            comment: document.getElementById('feedbackComment').value.trim(),
            suggestions: document.getElementById('feedbackSuggestions').value.trim(),
            isAnonymous: document.getElementById('anonymousFeedback').checked,
            wouldRecommend: this.getRecommendation(),
            categoryRatings: this.getCategoryRatings()
        };

        return formData;
    }

    getRating(name) {
        const container = document.querySelector(`[data-rating="${name}"]`);
        return container ? parseInt(container.dataset.selectedRating) || null : null;
    }

    getRecommendation() {
        const checked = document.querySelector('input[name="wouldRecommend"]:checked');
        return checked ? checked.value === 'true' : null;
    }

    getCategoryRatings() {
        const categoryRatings = [];
        
        this.feedbackCategories.forEach(category => {
            const rating = this.getRating(`category-${category.id}`);
            if (rating) {
                categoryRatings.push({
                    categoryId: category.id,
                    rating: rating,
                    comment: null // Could add category-specific comments later
                });
            }
        });

        return categoryRatings;
    }

    validateFormData(formData) {
        if (!formData.overallRating && !formData.comment && !formData.suggestions) {
            this.showNotification('Please provide at least an overall rating, comment, or suggestion', 'warning');
            return false;
        }

        return true;
    }

    async uploadPhotos(feedbackId) {
        if (this.uploadedPhotos.length === 0) return;

        const formData = new FormData();
        formData.append('eventId', this.currentEvent.id);
        formData.append('feedbackId', feedbackId);

        this.uploadedPhotos.forEach((photo, index) => {
            formData.append('photos', photo.file);
            formData.append('captions', photo.caption);
        });

        const response = await fetch('/api/feedback/photos/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload photos');
        }
    }

    setSubmitButtonLoading(loading) {
        const submitBtn = document.querySelector('.feedback-actions .btn-primary');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.innerHTML = loading 
                ? '<i class="fas fa-spinner fa-spin"></i> Submitting...'
                : '<i class="fas fa-paper-plane"></i> Submit Feedback';
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system or create simple alert
        if (window.showNotification) {
            window.showNotification('Feedback', message, type);
        } else {
            alert(message);
        }
    }

    close() {
        const modal = document.getElementById('feedbackModal');
        if (modal) {
            modal.remove();
        }
    }

    addModalStyles() {
        if (document.getElementById('feedback-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'feedback-modal-styles';
        styles.textContent = `
            .feedback-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
                overflow-y: auto;
            }

            .feedback-modal {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }

            .feedback-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 24px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }

            .feedback-modal-header h2 {
                margin: 0 0 4px 0;
                color: #1f2937;
                font-size: 1.5rem;
                font-weight: 700;
            }

            .feedback-modal-header p {
                margin: 0;
                color: #6b7280;
                font-size: 0.875rem;
            }

            .feedback-modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s;
            }

            .feedback-modal-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #ef4444;
            }

            .feedback-modal-content {
                padding: 24px;
            }

            .feedback-section {
                margin-bottom: 32px;
            }

            .feedback-section h3 {
                margin: 0 0 16px 0;
                color: #1f2937;
                font-size: 1.125rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .feedback-section h3 i {
                color: #10b981;
            }

            .rating-input {
                display: flex;
                gap: 4px;
                margin: 8px 0;
            }

            .star {
                font-size: 24px;
                color: #d1d5db;
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
            }

            .star:hover,
            .star.hover {
                color: #fbbf24;
                transform: scale(1.1);
            }

            .star.active {
                color: #f59e0b;
            }

            .rating-description {
                margin: 8px 0 0 0;
                color: #6b7280;
                font-size: 0.875rem;
            }

            .detailed-ratings {
                display: grid;
                gap: 16px;
            }

            .rating-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 8px;
            }

            .rating-row label {
                font-weight: 500;
                color: #374151;
            }

            .category-rating-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 8px;
                margin-bottom: 12px;
            }

            .category-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .category-info i {
                font-size: 20px;
                color: #10b981;
                width: 24px;
                text-align: center;
            }

            .category-info label {
                font-weight: 500;
                color: #374151;
                margin: 0;
            }

            .category-info small {
                display: block;
                color: #6b7280;
                font-size: 0.75rem;
                margin-top: 2px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #374151;
            }

            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                transition: all 0.2s;
                resize: vertical;
            }

            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #10b981;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
            }

            .char-count {
                display: block;
                text-align: right;
                margin-top: 4px;
                color: #6b7280;
                font-size: 0.75rem;
            }

            .char-count.warning {
                color: #f59e0b;
            }

            .recommendation-input {
                display: grid;
                gap: 12px;
            }

            .recommendation-option {
                display: flex;
                align-items: center;
                padding: 16px;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .recommendation-option:hover {
                background: rgba(16, 185, 129, 0.1);
            }

            .recommendation-option input {
                margin-right: 12px;
            }

            .recommendation-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
            }

            .upload-dropzone {
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 40px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                background: rgba(0, 0, 0, 0.02);
            }

            .upload-dropzone:hover,
            .upload-dropzone.dragover {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.05);
            }

            .upload-dropzone i {
                font-size: 48px;
                color: #10b981;
                margin-bottom: 16px;
            }

            .upload-dropzone p {
                margin: 0 0 8px 0;
                font-weight: 500;
                color: #374151;
            }

            .upload-dropzone small {
                color: #6b7280;
            }

            .photo-preview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 12px;
                margin-top: 16px;
            }

            .photo-preview-item {
                position: relative;
                border-radius: 8px;
                overflow: hidden;
                background: #f3f4f6;
            }

            .photo-preview-item img {
                width: 100%;
                height: 120px;
                object-fit: cover;
            }

            .photo-caption {
                padding: 8px;
            }

            .photo-caption input {
                width: 100%;
                border: none;
                background: transparent;
                font-size: 0.75rem;
                padding: 4px;
            }

            .remove-photo {
                position: absolute;
                top: 4px;
                right: 4px;
                background: rgba(239, 68, 68, 0.9);
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }

            .privacy-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .checkbox-option {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
            }

            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid #d1d5db;
                border-radius: 4px;
                position: relative;
                transition: all 0.2s;
            }

            .checkbox-option input:checked + .checkmark {
                background: #10b981;
                border-color: #10b981;
            }

            .checkbox-option input:checked + .checkmark::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
            }

            .privacy-note {
                margin: 0;
                color: #6b7280;
                font-size: 0.875rem;
            }

            .feedback-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
            }

            .feedback-actions .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .btn-secondary {
                background: rgba(107, 114, 128, 0.1);
                color: #374151;
                border: 1px solid rgba(107, 114, 128, 0.2);
            }

            .btn-secondary:hover {
                background: rgba(107, 114, 128, 0.2);
            }

            .btn-primary {
                background: #10b981;
                color: white;
            }

            .btn-primary:hover {
                background: #059669;
            }

            .btn-primary:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }

            @media (max-width: 768px) {
                .feedback-modal {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }

                .rating-row,
                .category-rating-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }

                .feedback-actions {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Create global instance
window.feedbackModal = new FeedbackModal();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackModal;
}