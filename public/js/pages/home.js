// JKUAT Innovation Club - Home Page

class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeAnimations();
        this.initializeNewsletter();
    }

    bindEvents() {
        // Hero buttons
        const heroRegisterBtn = document.getElementById('heroRegisterBtn');
        const heroLearnMoreBtn = document.getElementById('heroLearnMoreBtn');
        const joinMembershipBtn = document.getElementById('joinMembershipBtn');
        const viewEventsBtn = document.getElementById('viewEventsBtn');

        if (heroRegisterBtn) {
            heroRegisterBtn.addEventListener('click', () => {
                const authManager = window.authManager;
                if (authManager && authManager.isLoggedIn()) {
                    window.location.href = '/dashboard';
                } else if (authManager) {
                    authManager.showRegister();
                } else {
                    // Fallback if auth manager not loaded
                    window.location.href = '/dashboard';
                }
            });
        }

        if (heroLearnMoreBtn) {
            heroLearnMoreBtn.addEventListener('click', () => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        if (joinMembershipBtn) {
            joinMembershipBtn.addEventListener('click', () => {
                const authManager = window.authManager;
                if (authManager && authManager.isLoggedIn()) {
                    window.location.href = '/dashboard';
                } else if (authManager) {
                    authManager.showRegister();
                } else {
                    window.location.href = '/dashboard';
                }
            });
        }

        if (viewEventsBtn) {
            viewEventsBtn.addEventListener('click', () => {
                window.location.href = '/events';
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    initializeAnimations() {
        // Add intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections for animation
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Counter animation for stats
        this.animateCounters();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }

    initializeNewsletter() {
        const newsletterForm = document.getElementById('newsletterForm');
        const newsletterStatus = document.getElementById('newsletterStatus');

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

// Make available globally
window.HomePage = HomePage;