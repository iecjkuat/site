// JKUAT Innovation Club - Newsletter Module

class NewsletterManager {
    constructor(homeInstance) {
        this.home = homeInstance;
    }

    initializeNewsletter() {
        const newsletterForm = document.getElementById('newsletterForm');

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = document.getElementById('newsletterEmail');
                const email = emailInput.value.trim();
                
                if (!email) {
                    this.showNewsletterStatus('Please enter a valid email address.', 'error');
                    return;
                }

                // Show loading state
                const submitBtn = newsletterForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Subscribing...';
                submitBtn.disabled = true;

                try {
                    // Simulate API call (replace with actual endpoint)
                    await this.subscribeToNewsletter(email);
                    
                    this.showNewsletterStatus('🎉 Successfully subscribed! Welcome to our community.', 'success');
                    emailInput.value = '';
                    
                } catch (error) {
                    console.error('Newsletter subscription error:', error);
                    this.showNewsletterStatus('Something went wrong. Please try again later.', 'error');
                } finally {
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    async subscribeToNewsletter(email) {
        // For now, simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Store in localStorage for demo purposes
                const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
                
                if (subscribers.includes(email)) {
                    reject(new Error('Email already subscribed'));
                } else {
                    subscribers.push(email);
                    localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
                    resolve();
                }
            }, 1500);
        });
    }

    showNewsletterStatus(message, type) {
        const newsletterStatus = document.getElementById('newsletterStatus');
        if (!newsletterStatus) return;

        const bgColor = type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        const textColor = type === 'success' ? '#10b981' : '#ef4444';
        const borderColor = type === 'success' ? '#10b981' : '#ef4444';

        newsletterStatus.innerHTML = `
            <div style="background: ${bgColor}; border: 1px solid ${borderColor}; color: ${textColor}; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.875rem; font-weight: 500;">
                ${message}
            </div>
        `;
        
        newsletterStatus.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            newsletterStatus.style.display = 'none';
        }, 5000);
    }
}

window.NewsletterManager = NewsletterManager;