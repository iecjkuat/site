// JKUAT Innovation Club - Animations Module (Optimized & Safe)

class AnimationsManager {
    constructor(homeInstance) {
        this.home = homeInstance;
        this.counterObserver = null;
    }

    initializeAnimations() {
        this.initScrollAnimations();
        this.initHeroAnimations();
        this.animateCounters();
    }

    /* ================= SCROLL ANIMATIONS ================= */

    initScrollAnimations() {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    /* ================= HERO ================= */

    initHeroAnimations() {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }

    /* ================= COUNTERS ================= */

    async animateCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        let stats;
        try {
            stats = await this.fetchRealStats();
        } catch {
            stats = null;
        }

        this.counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const counter = entry.target;
                this.counterObserver.unobserve(counter);
                this.runCounter(counter, stats);
            });
        }, { threshold: 0.3 });

        counters.forEach(counter => {
            counter.textContent = '0';
            this.counterObserver.observe(counter);
        });
    }

    runCounter(counter, stats) {
        const statItem = counter.closest('.stat-item');
        const labelEl = statItem?.querySelector('.stat-label');
        const label = labelEl?.textContent || '';

        let target = parseInt(counter.dataset.target) || 0;

        if (stats) {
            if (label.includes('Active Members')) target = stats.activeMembers;
            else if (label.includes('Projects')) target = stats.projectsLaunched;
            else if (label.includes('Industry')) target = stats.industryPartners;
        }

        if (target <= 0) {
            counter.textContent = '0';
            return;
        }

        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        };

        requestAnimationFrame(update);
    }

    /* ================= API ================= */

    async fetchRealStats() {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Stats API failed');

        const data = await response.json();
        if (!data?.success || !data.stats) throw new Error('Invalid stats');

        return {
            activeMembers: Number(data.stats.activeMembers) || 0,
            projectsLaunched: Number(data.stats.projectsLaunched) || 0,
            industryPartners: Number(data.stats.industryPartners) || 0
        };
    }
}

window.AnimationsManager = AnimationsManager;
