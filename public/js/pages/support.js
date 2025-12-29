// JKUAT Innovation Club - Support Page

class SupportPage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeFAQ();
        this.initializeContactForm();
    }

    bindEvents() {
        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // FAQ search
        const faqSearch = document.getElementById('faqSearch');
        if (faqSearch) {
            faqSearch.addEventListener('input', (e) => this.handleFAQSearch(e.target.value));
        }

        // FAQ categories
        const categoryButtons = document.querySelectorAll('.faq-category');
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => this.filterFAQByCategory(e.target.dataset.category));
        });

        // Live chat button
        const liveChatBtn = document.getElementById('liveChatBtn');
        if (liveChatBtn) {
            liveChatBtn.addEventListener('click', () => this.openLiveChat());
        }
    }

    initializeFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const header = item.querySelector('.faq-header');
            const content = item.querySelector('.faq-content');
            
            if (header && content) {
                header.addEventListener('click', () => {
                    const isOpen = content.style.display === 'block';
                    
                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        const otherContent = otherItem.querySelector('.faq-content');
                        const otherIcon = otherItem.querySelector('.faq-icon');
                        if (otherContent) {
                            otherContent.style.display = 'none';
                        }
                        if (otherIcon) {
                            otherIcon.style.transform = 'rotate(0deg)';
                        }
                    });
                    
                    // Toggle current item
                    if (!isOpen) {
                        content.style.display = 'block';
                        const icon = header.querySelector('.faq-icon');
                        if (icon) {
                            icon.style.transform = 'rotate(180deg)';
                        }
                    }
                });
            }
        });
    }

    initializeContactForm() {
        // Initialize form validation
        const form = document.getElementById('contactForm');
        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = Object.fromEntries(formData);

        // Validate form
        if (!this.validateContactForm(contactData)) {
            return;
        }

        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            const response = await window.jkuatApp.apiCall('/api/support/contact', {
                method: 'POST',
                body: JSON.stringify(contactData)
            });

            if (response.success) {
                window.jkuatApp.showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
                e.target.reset();
            } else {
                throw new Error(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            window.jkuatApp.showToast('Error sending message. Please try again.', 'error');
        } finally {
            // Reset button state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            submitBtn.disabled = false;
        }
    }

    validateContactForm(data) {
        let isValid = true;

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            this.showFieldError('name', 'Name must be at least 2 characters');
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Subject validation
        if (!data.subject || data.subject.trim().length < 5) {
            this.showFieldError('subject', 'Subject must be at least 5 characters');
            isValid = false;
        }

        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            this.showFieldError('message', 'Message must be at least 10 characters');
            isValid = false;
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        switch (field.name) {
            case 'name':
                if (value.length < 2) {
                    this.showFieldError(field.name, 'Name must be at least 2 characters');
                    isValid = false;
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showFieldError(field.name, 'Please enter a valid email address');
                    isValid = false;
                }
                break;
            case 'subject':
                if (value.length < 5) {
                    this.showFieldError(field.name, 'Subject must be at least 5 characters');
                    isValid = false;
                }
                break;
            case 'message':
                if (value.length < 10) {
                    this.showFieldError(field.name, 'Message must be at least 10 characters');
                    isValid = false;
                }
                break;
        }

        if (isValid) {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        field.style.borderColor = '#ef4444';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    handleFAQSearch(query) {
        const faqItems = document.querySelectorAll('.faq-item');
        const searchTerm = query.toLowerCase().trim();

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm) || searchTerm === '') {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Show no results message if needed
        const visibleItems = Array.from(faqItems).filter(item => item.style.display !== 'none');
        const noResultsMsg = document.getElementById('noFAQResults');
        
        if (visibleItems.length === 0 && searchTerm !== '') {
            if (!noResultsMsg) {
                const msg = document.createElement('div');
                msg.id = 'noFAQResults';
                msg.className = 'glass-card';
                msg.style.cssText = 'padding: 2rem; text-align: center; margin-top: 1rem;';
                msg.innerHTML = `
                    <i class="fas fa-search" style="font-size: 2rem; color: #f59e0b; margin-bottom: 1rem;"></i>
                    <h3 style="color: white; margin-bottom: 0.5rem;">No Results Found</h3>
                    <p style="color: rgba(255, 255, 255, 0.8);">Try different keywords or contact us directly.</p>
                `;
                document.querySelector('.faq-container').appendChild(msg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    filterFAQByCategory(category) {
        const faqItems = document.querySelectorAll('.faq-item');
        const categoryButtons = document.querySelectorAll('.faq-category');

        // Update button states
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        // Filter FAQ items
        faqItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    openLiveChat() {
        // Simulate live chat opening
        window.jkuatApp.showToast('Live chat feature coming soon! Please use the contact form for now.', 'info');
        
        // In a real implementation, this would open a chat widget
        // Example: window.Intercom && window.Intercom('show');
    }
}

// Make available globally
window.SupportPage = SupportPage;