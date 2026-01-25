/**
 * Performance Monitor
 * Tracks and optimizes dashboard performance
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.thresholds = {
            loadTime: 3000,      // 3 seconds
            renderTime: 100,     // 100ms
            memoryUsage: 50,     // 50MB
            apiResponse: 2000    // 2 seconds
        };
        this.isMonitoring = false;
        
        this.init();
    }

    init() {
        this.setupPerformanceObserver();
        this.setupMemoryMonitoring();
        this.setupNetworkMonitoring();
        this.startMonitoring();
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('📊 Performance monitoring started');
        
        // Monitor page load performance
        this.measurePageLoad();
        
        // Monitor ongoing performance
        this.startContinuousMonitoring();
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        // Disconnect observers
        this.observers.forEach(observer => {
            if (observer.disconnect) {
                observer.disconnect();
            }
        });
        
        console.log('📊 Performance monitoring stopped');
    }

    setupPerformanceObserver() {
        if (!window.PerformanceObserver) return;

        // Observe navigation timing
        const navObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.recordMetric('navigation', {
                    name: entry.name,
                    duration: entry.duration,
                    startTime: entry.startTime,
                    type: entry.entryType
                });
            });
        });

        try {
            navObserver.observe({ entryTypes: ['navigation'] });
            this.observers.set('navigation', navObserver);
        } catch (error) {
            console.warn('Navigation observer not supported:', error);
        }

        // Observe resource loading
        const resourceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.recordMetric('resource', {
                    name: entry.name,
                    duration: entry.duration,
                    size: entry.transferSize || 0,
                    type: this.getResourceType(entry.name)
                });
            });
        });

        try {
            resourceObserver.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', resourceObserver);
        } catch (error) {
            console.warn('Resource observer not supported:', error);
        }

        // Observe long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.recordMetric('longtask', {
                    duration: entry.duration,
                    startTime: entry.startTime,
                    attribution: entry.attribution
                });
                
                if (entry.duration > 50) {
                    console.warn('🐌 Long task detected:', entry.duration + 'ms');
                }
            });
        });

        try {
            longTaskObserver.observe({ entryTypes: ['longtask'] });
            this.observers.set('longtask', longTaskObserver);
        } catch (error) {
            console.warn('Long task observer not supported:', error);
        }
    }

    setupMemoryMonitoring() {
        if (!performance.memory) return;

        setInterval(() => {
            const memory = performance.memory;
            this.recordMetric('memory', {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                timestamp: Date.now()
            });

            // Check memory threshold
            const usedMB = memory.usedJSHeapSize / (1024 * 1024);
            if (usedMB > this.thresholds.memoryUsage) {
                console.warn('🧠 High memory usage:', usedMB.toFixed(2) + 'MB');
                this.suggestMemoryOptimization();
            }
        }, 10000); // Check every 10 seconds
    }

    setupNetworkMonitoring() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.recordMetric('api', {
                    url,
                    duration,
                    status: response.status,
                    success: response.ok,
                    timestamp: Date.now()
                });

                // Check API response threshold
                if (duration > this.thresholds.apiResponse) {
                    console.warn('🐌 Slow API response:', url, duration + 'ms');
                }

                return response;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.recordMetric('api', {
                    url,
                    duration,
                    error: error.message,
                    success: false,
                    timestamp: Date.now()
                });

                throw error;
            }
        };
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                
                if (navigation) {
                    const loadMetrics = {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                        totalTime: navigation.loadEventEnd - navigation.navigationStart,
                        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                        tcpConnect: navigation.connectEnd - navigation.connectStart,
                        serverResponse: navigation.responseEnd - navigation.requestStart,
                        domProcessing: navigation.domComplete - navigation.domLoading
                    };

                    this.recordMetric('pageLoad', loadMetrics);
                    
                    // Check load time threshold
                    if (loadMetrics.totalTime > this.thresholds.loadTime) {
                        console.warn('🐌 Slow page load:', loadMetrics.totalTime + 'ms');
                        this.suggestLoadOptimization(loadMetrics);
                    }

                    console.log('📊 Page load metrics:', loadMetrics);
                }
            }, 0);
        });
    }

    startContinuousMonitoring() {
        // Monitor render performance
        this.monitorRenderPerformance();
        
        // Monitor user interactions
        this.monitorUserInteractions();
        
        // Generate periodic reports
        setInterval(() => {
            this.generatePerformanceReport();
        }, 60000); // Every minute
    }

    monitorRenderPerformance() {
        // Monitor DOM mutations
        if (window.MutationObserver) {
            const mutationObserver = new MutationObserver((mutations) => {
                const startTime = performance.now();
                
                // Process mutations (this is just for timing)
                mutations.forEach(mutation => {
                    // Count changes
                });
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                if (duration > this.thresholds.renderTime) {
                    console.warn('🐌 Slow DOM update:', duration + 'ms');
                }
                
                this.recordMetric('domUpdate', {
                    duration,
                    mutationCount: mutations.length,
                    timestamp: Date.now()
                });
            });

            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });

            this.observers.set('mutation', mutationObserver);
        }
    }

    monitorUserInteractions() {
        const interactionEvents = ['click', 'scroll', 'keypress'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                const startTime = performance.now();
                
                // Use requestAnimationFrame to measure interaction response
                requestAnimationFrame(() => {
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    this.recordMetric('interaction', {
                        type: eventType,
                        duration,
                        target: event.target.tagName,
                        timestamp: Date.now()
                    });
                });
            }, { passive: true });
        });
    }

    recordMetric(category, data) {
        if (!this.metrics.has(category)) {
            this.metrics.set(category, []);
        }
        
        const metrics = this.metrics.get(category);
        metrics.push({
            ...data,
            timestamp: data.timestamp || Date.now()
        });
        
        // Keep only last 100 entries per category
        if (metrics.length > 100) {
            metrics.splice(0, metrics.length - 100);
        }
    }

    getResourceType(url) {
        const extension = url.split('.').pop().toLowerCase();
        
        if (['js'].includes(extension)) return 'script';
        if (['css'].includes(extension)) return 'stylesheet';
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
        if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) return 'font';
        
        return 'other';
    }

    generatePerformanceReport() {
        const report = {
            timestamp: new Date(),
            summary: this.generateSummary(),
            recommendations: this.generateRecommendations(),
            metrics: this.getMetricsSummary()
        };

        console.log('📊 Performance Report:', report);
        
        // Emit performance report event
        if (window.adminDashboard) {
            window.adminDashboard.emit('performance_report', report);
        }

        return report;
    }

    generateSummary() {
        const summary = {};
        
        // Page load summary
        const pageLoadMetrics = this.metrics.get('pageLoad');
        if (pageLoadMetrics && pageLoadMetrics.length > 0) {
            const latest = pageLoadMetrics[pageLoadMetrics.length - 1];
            summary.pageLoad = {
                totalTime: latest.totalTime,
                status: latest.totalTime < this.thresholds.loadTime ? 'good' : 'poor'
            };
        }

        // API performance summary
        const apiMetrics = this.metrics.get('api');
        if (apiMetrics && apiMetrics.length > 0) {
            const avgDuration = apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length;
            const successRate = apiMetrics.filter(m => m.success).length / apiMetrics.length;
            
            summary.api = {
                averageResponseTime: avgDuration,
                successRate: successRate * 100,
                status: avgDuration < this.thresholds.apiResponse && successRate > 0.95 ? 'good' : 'poor'
            };
        }

        // Memory summary
        const memoryMetrics = this.metrics.get('memory');
        if (memoryMetrics && memoryMetrics.length > 0) {
            const latest = memoryMetrics[memoryMetrics.length - 1];
            const usedMB = latest.used / (1024 * 1024);
            
            summary.memory = {
                usedMB: usedMB,
                status: usedMB < this.thresholds.memoryUsage ? 'good' : 'poor'
            };
        }

        return summary;
    }

    generateRecommendations() {
        const recommendations = [];
        const summary = this.generateSummary();

        // Page load recommendations
        if (summary.pageLoad && summary.pageLoad.status === 'poor') {
            recommendations.push({
                type: 'pageLoad',
                priority: 'high',
                message: 'Page load time is slow. Consider optimizing resources.',
                actions: [
                    'Minimize JavaScript and CSS files',
                    'Optimize images',
                    'Use lazy loading for non-critical resources',
                    'Enable browser caching'
                ]
            });
        }

        // API recommendations
        if (summary.api && summary.api.status === 'poor') {
            recommendations.push({
                type: 'api',
                priority: 'medium',
                message: 'API responses are slow or unreliable.',
                actions: [
                    'Implement request caching',
                    'Add request debouncing',
                    'Optimize database queries',
                    'Use pagination for large datasets'
                ]
            });
        }

        // Memory recommendations
        if (summary.memory && summary.memory.status === 'poor') {
            recommendations.push({
                type: 'memory',
                priority: 'high',
                message: 'High memory usage detected.',
                actions: [
                    'Clear unused data from memory',
                    'Implement virtual scrolling for large lists',
                    'Remove event listeners when not needed',
                    'Optimize image loading'
                ]
            });
        }

        // Long task recommendations
        const longTasks = this.metrics.get('longtask');
        if (longTasks && longTasks.length > 5) {
            recommendations.push({
                type: 'longtask',
                priority: 'medium',
                message: 'Multiple long tasks detected.',
                actions: [
                    'Break up long-running operations',
                    'Use Web Workers for heavy computations',
                    'Implement progressive rendering',
                    'Optimize DOM manipulations'
                ]
            });
        }

        return recommendations;
    }

    getMetricsSummary() {
        const summary = {};
        
        for (const [category, metrics] of this.metrics) {
            summary[category] = {
                count: metrics.length,
                latest: metrics[metrics.length - 1],
                average: this.calculateAverage(metrics)
            };
        }
        
        return summary;
    }

    calculateAverage(metrics) {
        if (metrics.length === 0) return null;
        
        const numericFields = ['duration', 'size', 'used', 'total'];
        const averages = {};
        
        numericFields.forEach(field => {
            const values = metrics.map(m => m[field]).filter(v => typeof v === 'number');
            if (values.length > 0) {
                averages[field] = values.reduce((sum, v) => sum + v, 0) / values.length;
            }
        });
        
        return averages;
    }

    suggestLoadOptimization(metrics) {
        const suggestions = [];
        
        if (metrics.dnsLookup > 100) {
            suggestions.push('Consider using DNS prefetching');
        }
        
        if (metrics.serverResponse > 1000) {
            suggestions.push('Server response time is slow - optimize backend');
        }
        
        if (metrics.domProcessing > 1000) {
            suggestions.push('DOM processing is slow - reduce DOM complexity');
        }
        
        console.log('💡 Load optimization suggestions:', suggestions);
        return suggestions;
    }

    suggestMemoryOptimization() {
        const suggestions = [
            'Clear unused chart instances',
            'Remove detached DOM elements',
            'Implement data pagination',
            'Use object pooling for frequently created objects'
        ];
        
        console.log('💡 Memory optimization suggestions:', suggestions);
        return suggestions;
    }

    // Performance optimization utilities
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

    // Lazy loading utility
    lazyLoad(elements, callback) {
        if (!window.IntersectionObserver) {
            // Fallback for browsers without IntersectionObserver
            elements.forEach(callback);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        elements.forEach(element => observer.observe(element));
    }

    // Export performance data
    exportMetrics() {
        const exportData = {
            timestamp: new Date(),
            metrics: Object.fromEntries(this.metrics),
            summary: this.generateSummary(),
            recommendations: this.generateRecommendations()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    // Clear metrics
    clearMetrics() {
        this.metrics.clear();
        console.log('📊 Performance metrics cleared');
    }
}

// Global performance monitor instance
window.performanceMonitor = new PerformanceMonitor();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}