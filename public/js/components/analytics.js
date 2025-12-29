// JKUAT Innovation Club - Analytics Integration

class Analytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventTracking();
        this.trackUserEngagement();
        this.setupPerformanceTracking();
    }

    // Track page views
    trackPageView() {
        const pageData = {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };

        this.trackEvent('page_view', pageData);
        console.log('📊 Page view tracked:', pageData);
    }

    // Track custom events
    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userId: this.getUserId()
        };

        this.events.push(event);
        this.sendToAnalytics(event);
    }

    // Setup automatic event tracking
    setupEventTracking() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn, a[href]');
            if (button) {
                const eventData = {
                    element: button.tagName.toLowerCase(),
                    text: button.textContent.trim(),
                    href: button.href || null,
                    className: button.className,
                    id: button.id || null
                };

                this.trackEvent('button_click', eventData);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const eventData = {
                formId: form.id || null,
                formAction: form.action || null,
                formMethod: form.method || 'get'
            };

            this.trackEvent('form_submit', eventData);
        });

        // Track newsletter signup
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', () => {
                this.trackEvent('newsletter_signup', {
                    source: 'homepage'
                });
            });
        }

        // Track CTA interactions
        this.trackCTAClicks();
    }

    // Track Call-to-Action clicks
    trackCTAClicks() {
        const ctaButtons = [
            '#heroRegisterBtn',
            '#joinMembershipBtn',
            '#viewEventsBtn',
            '#heroLearnMoreBtn'
        ];

        ctaButtons.forEach(selector => {
            const button = document.querySelector(selector);
            if (button) {
                button.addEventListener('click', () => {
                    this.trackEvent('cta_click', {
                        cta_type: selector.replace('#', ''),
                        location: 'homepage'
                    });
                });
            }
        });
    }

    // Track user engagement metrics
    trackUserEngagement() {
        let scrollDepth = 0;
        let maxScrollDepth = 0;

        // Track scroll depth
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollDepth = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                
                // Track milestone scroll depths
                if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
                    this.trackEvent('scroll_depth', { depth: '25%' });
                } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
                    this.trackEvent('scroll_depth', { depth: '50%' });
                } else if (maxScrollDepth >= 75 && maxScrollDepth < 90) {
                    this.trackEvent('scroll_depth', { depth: '75%' });
                } else if (maxScrollDepth >= 90) {
                    this.trackEvent('scroll_depth', { depth: '90%' });
                }
            }
        });

        // Track time on page
        let timeOnPage = 0;
        const timeTracker = setInterval(() => {
            timeOnPage += 10;
            
            // Track engagement milestones
            if (timeOnPage === 30) {
                this.trackEvent('engagement', { type: 'time_on_page', duration: '30s' });
            } else if (timeOnPage === 60) {
                this.trackEvent('engagement', { type: 'time_on_page', duration: '1m' });
            } else if (timeOnPage === 180) {
                this.trackEvent('engagement', { type: 'time_on_page', duration: '3m' });
            }
        }, 10000);

        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            clearInterval(timeTracker);
            this.trackEvent('page_exit', {
                timeOnPage: timeOnPage,
                maxScrollDepth: maxScrollDepth
            });
        });
    }

    // Track performance metrics
    setupPerformanceTracking() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                
                if (perfData) {
                    const metrics = {
                        loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                        firstPaint: this.getFirstPaint(),
                        connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
                    };

                    this.trackEvent('performance', metrics);
                }
            }, 1000);
        });
    }

    // Get First Paint timing
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? Math.round(firstPaint.startTime) : null;
    }

    // Generate or get session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    // Get user ID (if logged in)
    getUserId() {
        // Try to get from auth manager or localStorage
        const authManager = window.authManager;
        if (authManager && authManager.isLoggedIn()) {
            return authManager.getCurrentUser()?.id || 'anonymous';
        }
        
        // Generate anonymous user ID
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
        }
        return userId;
    }

    // Send data to analytics service
    async sendToAnalytics(event) {
        try {
            // Store locally for now (replace with actual analytics service)
            const analyticsData = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            analyticsData.push(event);
            
            // Keep only last 1000 events to prevent storage overflow
            if (analyticsData.length > 1000) {
                analyticsData.splice(0, analyticsData.length - 1000);
            }
            
            localStorage.setItem('analytics_events', JSON.stringify(analyticsData));

            // In production, send to your analytics service:
            // await fetch('/api/analytics/track', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(event)
            // });

        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    // Get analytics summary
    getAnalyticsSummary() {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        const summary = {
            totalEvents: events.length,
            pageViews: events.filter(e => e.name === 'page_view').length,
            buttonClicks: events.filter(e => e.name === 'button_click').length,
            formSubmissions: events.filter(e => e.name === 'form_submit').length,
            ctaClicks: events.filter(e => e.name === 'cta_click').length,
            sessionDuration: Date.now() - this.sessionStart
        };

        return summary;
    }

    // Export analytics data
    exportData() {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        const dataStr = JSON.stringify(events, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `analytics_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new Analytics();
    console.log('📊 Analytics initialized');
});

// Make available globally
window.Analytics = Analytics;