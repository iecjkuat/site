// JKUAT Innovation Club - Performance Optimization

class Performance {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.optimizeImages();
        this.setupIntersectionObserver();
        this.preloadCriticalResources();
        this.setupServiceWorker();
    }

    // Setup lazy loading for images and content
    setupLazyLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Lazy load sections
        const sections = document.querySelectorAll('.lazy-section');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Optimize images
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" for native lazy loading
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // Add error handling
            img.addEventListener('error', () => {
                img.src = '/assets/images/placeholder.svg';
                console.warn('Image failed to load:', img.src);
            });

            // Add load event for analytics
            img.addEventListener('load', () => {
                if (window.analytics) {
                    window.analytics.trackEvent('image_load', {
                        src: img.src,
                        alt: img.alt || 'no-alt'
                    });
                }
            });
        });
    }

    // Setup intersection observer for animations
    setupIntersectionObserver() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Track animation views
                    if (window.analytics) {
                        window.analytics.trackEvent('animation_view', {
                            element: entry.target.className,
                            id: entry.target.id || null
                        });
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            '/css/main.css',
            '/js/core/app.js',
            '/js/components/auth.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            
            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            }
            
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    // Setup service worker for caching
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('🔧 Service Worker registered:', registration);
                    })
                    .catch(error => {
                        console.log('❌ Service Worker registration failed:', error);
                    });
            });
        }
    }

    // Optimize CSS delivery
    optimizeCSSDelivery() {
        // Load non-critical CSS asynchronously
        const nonCriticalCSS = [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        ];

        nonCriticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
            document.head.appendChild(link);
        });
    }

    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Monitor performance metrics
    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(this.sendToAnalytics);
                getFID(this.sendToAnalytics);
                getFCP(this.sendToAnalytics);
                getLCP(this.sendToAnalytics);
                getTTFB(this.sendToAnalytics);
            });
        }

        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (window.analytics) {
                    window.analytics.trackEvent('memory_usage', {
                        used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
                        total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
                        limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) // MB
                    });
                }
            }, 30000); // Every 30 seconds
        }
    }

    // Send performance data to analytics
    sendToAnalytics(metric) {
        if (window.analytics) {
            window.analytics.trackEvent('web_vital', {
                name: metric.name,
                value: metric.value,
                rating: metric.rating
            });
        }
        console.log('📊 Web Vital:', metric);
    }

    // Optimize scroll performance
    optimizeScrollPerformance() {
        let ticking = false;

        const updateScrollPosition = () => {
            // Update scroll-dependent elements
            const scrollTop = window.pageYOffset;
            const scrollPercent = (scrollTop / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

            // Update progress bar if exists
            const progressBar = document.querySelector('.scroll-progress');
            if (progressBar) {
                progressBar.style.width = `${scrollPercent}%`;
            }

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Add scroll progress bar
    addScrollProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(135deg, #10b981, #3b82f6);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }

    // Initialize all performance optimizations
    initializeAll() {
        this.optimizeCSSDelivery();
        this.monitorPerformance();
        this.optimizeScrollPerformance();
        this.addScrollProgressBar();
        
        console.log('⚡ Performance optimizations initialized');
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    const performance = new Performance();
    performance.initializeAll();
});

// Make available globally
window.Performance = Performance;