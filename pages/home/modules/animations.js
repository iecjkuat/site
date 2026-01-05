// JKUAT Innovation Club - Animations Module

class AnimationsManager {
    constructor(homeInstance) {
        this.home = homeInstance;
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

        // Initialize simple hero animations
        this.initHeroAnimations();

        // Counter animation for stats
        this.animateCounters();
    }

    initHeroAnimations() {
        // Simple fade-in animation for hero content
        setTimeout(() => {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }
        }, 300);
    }

    animateCounters() {
        console.log('🎯 Starting counter animation...');
        
        // First, fetch real statistics from the API
        this.fetchRealStats().then(stats => {
            console.log('📊 Received stats for animation:', stats);
            
            const counters = document.querySelectorAll('.counter');
            console.log(`🔢 Found ${counters.length} counter elements`);
            
            counters.forEach((counter, index) => {
                // Get the stat type from the counter's parent or data attribute
                const statItem = counter.closest('.stat-item');
                const statLabel = statItem.querySelector('.stat-label').textContent.trim();
                
                let target = 0;
                
                // Map the label to the real data
                if (statLabel.includes('Active Members')) {
                    target = stats.activeMembers;
                    console.log(`👥 Active Members: ${target}`);
                } else if (statLabel.includes('Projects Launched')) {
                    target = stats.projectsLaunched;
                    console.log(`🚀 Projects Launched: ${target}`);
                } else if (statLabel.includes('Industry Partners')) {
                    target = stats.industryPartners;
                    console.log(`🤝 Industry Partners: ${target}`);
                } else {
                    // Fallback to data-target if no match
                    target = parseInt(counter.getAttribute('data-target')) || 0;
                    console.log(`❓ Unknown stat "${statLabel}", using fallback: ${target}`);
                }
                
                console.log(`🎯 Counter ${index + 1}: "${statLabel}" -> ${target}`);
                
                // Update the data-target with real value
                counter.setAttribute('data-target', target);
                
                const duration = 2000; // 2 seconds
                const increment = target > 0 ? target / (duration / 16) : 0; // 60fps
                let current = 0;

                const updateCounter = () => {
                    if (target === 0) {
                        counter.textContent = '0';
                        return;
                    }
                    
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
                            console.log(`👀 Counter visible, starting animation for: ${statLabel}`);
                            updateCounter();
                            observer.unobserve(entry.target);
                        }
                    });
                });

                observer.observe(counter);
            });
        }).catch(error => {
            console.error('❌ Failed to fetch real stats, using fallback values:', error);
            // Fallback to original animation with hardcoded values
            this.animateCountersWithFallback();
        });
    }

    async fetchRealStats() {
        try {
            console.log('📊 Fetching real statistics from API...');
            const response = await fetch('/api/stats');
            
            console.log('📡 API Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📋 Raw API response:', data);
            
            if (data.success) {
                console.log('✅ Real statistics loaded successfully:', data.stats);
                return data.stats;
            } else {
                throw new Error(data.message || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('❌ Error fetching real statistics:', error);
            // Return fallback values
            console.log('🔄 Returning fallback stats...');
            return {
                activeMembers: 0,
                projectsLaunched: 0,
                industryPartners: 0
            };
        }
    }

    animateCountersWithFallback() {
        // Original animation logic as fallback
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
}

window.AnimationsManager = AnimationsManager;