// JKUAT Innovation Club - Achievement System

class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.userAchievements = [];
        this.userLevel = 1;
        this.userXP = 0;
        this.init();
    }

    init() {
        this.loadAchievements();
        this.loadUserProgress();
        this.bindEvents();
    }

    async loadAchievements() {
        try {
            const response = await window.jkuatApp.apiCall('/api/achievements');
            this.achievements = response.achievements || [];
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.loadMockAchievements();
        }
    }

    async loadUserProgress() {
        try {
            const response = await window.jkuatApp.apiCall('/api/user/achievements');
            this.userAchievements = response.achievements || [];
            this.userLevel = response.level || 1;
            this.userXP = response.xp || 0;
            this.updateLevelDisplay();
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.loadMockProgress();
        }
    }

    bindEvents() {
        // Achievement modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('achievement-badge')) {
                this.showAchievementDetails(e.target.dataset.achievementId);
            }
        });

        // Level up celebration
        document.addEventListener('levelUp', (e) => {
            this.celebrateLevelUp(e.detail.newLevel);
        });
    }

    updateLevelDisplay() {
        const levelElement = document.getElementById('userLevel');
        const levelTextElement = document.getElementById('userLevelText');
        const levelProgressElement = document.getElementById('levelProgress');

        if (levelElement) levelElement.textContent = this.userLevel;
        if (levelTextElement) levelTextElement.textContent = this.userLevel;

        // Calculate progress to next level
        const xpForCurrentLevel = this.getXPForLevel(this.userLevel);
        const xpForNextLevel = this.getXPForLevel(this.userLevel + 1);
        const progressPercent = ((this.userXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

        if (levelProgressElement) {
            levelProgressElement.style.width = `${Math.min(progressPercent, 100)}%`;
        }

        // Update XP display
        const xpDisplay = document.querySelector('.xp-display');
        if (xpDisplay) {
            xpDisplay.textContent = `${this.userXP}/${xpForNextLevel} XP`;
        }
    }

    renderAchievementsBadges() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;

        const recentAchievements = this.userAchievements.slice(0, 6);
        
        if (recentAchievements.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-trophy" style="font-size: 2rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem;"></i>
                    <p style="color: rgba(255, 255, 255, 0.6);">No achievements yet. Start participating to earn badges!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 1rem;">
                ${recentAchievements.map(achievement => `
                    <div class="achievement-badge" data-achievement-id="${achievement.id}" style="text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="width: 60px; height: 60px; background: ${this.getAchievementColor(achievement.category)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; box-shadow: 0 8px 20px ${this.getAchievementColor(achievement.category)}40;">
                            <i class="${achievement.icon}" style="font-size: 1.5rem; color: white;"></i>
                        </div>
                        <h4 style="color: white; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">${achievement.title}</h4>
                        <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.625rem;">${achievement.earned_date}</span>
                    </div>
                `).join('')}
            </div>
            <a href="/achievements" class="btn btn-outline btn-sm btn-full" style="margin-top: 1rem;">
                <i class="fas fa-trophy"></i>View All Achievements
            </a>
        `;
    }

    showAchievementDetails(achievementId) {
        const achievement = this.userAchievements.find(a => a.id == achievementId);
        if (!achievement) return;

        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <button class="btn-glass btn-icon close-modal" style="position: absolute; top: 1rem; right: 1rem;">
                    <i class="fas fa-times"></i>
                </button>

                <div style="width: 120px; height: 120px; background: ${this.getAchievementColor(achievement.category)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 20px 40px ${this.getAchievementColor(achievement.category)}40;">
                    <i class="${achievement.icon}" style="font-size: 3rem; color: white;"></i>
                </div>

                <h2 style="color: white; font-weight: 800; margin-bottom: 1rem; font-size: 2rem;">${achievement.title}</h2>
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1.5rem; line-height: 1.6;">${achievement.description}</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 12px;">
                        <div style="color: #f59e0b; font-weight: 700; font-size: 1.5rem;">+${achievement.xp_reward}</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">XP Earned</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 12px;">
                        <div style="color: #10b981; font-weight: 700; font-size: 1.5rem;">${achievement.rarity}</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">Rarity</div>
                    </div>
                </div>

                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                    Earned on ${new Date(achievement.earned_date).toLocaleDateString()}
                </div>

                <button class="btn btn-primary close-modal" style="margin-top: 2rem;">
                    <i class="fas fa-check"></i>Awesome!
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind close events
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    celebrateLevelUp(newLevel) {
        const celebration = document.createElement('div');
        celebration.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; animation: levelUpBounce 0.6s ease-out;">
                    <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 20px 40px rgba(245, 158, 11, 0.4);">
                        <span style="color: white; font-weight: 800; font-size: 3rem;">${newLevel}</span>
                    </div>
                    <h2 style="color: white; font-weight: 800; margin-bottom: 1rem; font-size: 2.5rem;">Level Up!</h2>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem; font-size: 1.25rem;">You've reached Level ${newLevel}!</p>
                    <button class="btn btn-primary btn-lg" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-rocket"></i>Continue Journey
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(celebration);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (celebration.parentElement) {
                celebration.remove();
            }
        }, 5000);
    }

    async awardAchievement(achievementType, data = {}) {
        try {
            const response = await window.jkuatApp.apiCall('/api/achievements/award', {
                method: 'POST',
                body: JSON.stringify({
                    type: achievementType,
                    data: data
                })
            });

            if (response.success && response.achievement) {
                this.showNewAchievementNotification(response.achievement);
                this.userAchievements.push(response.achievement);
                this.userXP += response.achievement.xp_reward;
                
                // Check for level up
                const newLevel = this.calculateLevel(this.userXP);
                if (newLevel > this.userLevel) {
                    this.userLevel = newLevel;
                    this.celebrateLevelUp(newLevel);
                }
                
                this.updateLevelDisplay();
                this.renderAchievementsBadges();
            }
        } catch (error) {
            console.error('Error awarding achievement:', error);
        }
    }

    showNewAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, ${this.getAchievementColor(achievement.category)}, ${this.getAchievementColor(achievement.category)}CC);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 1rem;
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="${achievement.icon}" style="color: white; font-size: 1.5rem;"></i>
                </div>
                <div>
                    <h4 style="color: white; font-weight: 600; margin-bottom: 0.25rem;">Achievement Unlocked!</h4>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem; margin: 0;">${achievement.title}</p>
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">+${achievement.xp_reward} XP</span>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 500);
        }, 4000);
    }

    // Utility methods
    getXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    calculateLevel(xp) {
        let level = 1;
        while (this.getXPForLevel(level + 1) <= xp) {
            level++;
        }
        return level;
    }

    getAchievementColor(category) {
        const colors = {
            'participation': 'rgba(59, 130, 246, 0.8)',
            'leadership': 'rgba(245, 158, 11, 0.8)',
            'innovation': 'rgba(139, 92, 246, 0.8)',
            'collaboration': 'rgba(16, 185, 129, 0.8)',
            'learning': 'rgba(6, 182, 212, 0.8)',
            'milestone': 'rgba(236, 72, 153, 0.8)'
        };
        return colors[category] || colors.participation;
    }

    // Mock data for demonstration
    loadMockAchievements() {
        this.achievements = [
            {
                id: 1,
                title: 'First Steps',
                description: 'Complete your first event registration',
                category: 'participation',
                icon: 'fas fa-baby',
                xp_reward: 50,
                rarity: 'Common'
            },
            {
                id: 2,
                title: 'Team Player',
                description: 'Join your first project team',
                category: 'collaboration',
                icon: 'fas fa-users',
                xp_reward: 100,
                rarity: 'Common'
            },
            {
                id: 3,
                title: 'Innovation Spark',
                description: 'Create your first project',
                category: 'innovation',
                icon: 'fas fa-lightbulb',
                xp_reward: 200,
                rarity: 'Uncommon'
            }
        ];
    }

    loadMockProgress() {
        this.userLevel = 5;
        this.userXP = 650;
        this.userAchievements = [
            {
                id: 1,
                title: 'First Steps',
                description: 'Complete your first event registration',
                category: 'participation',
                icon: 'fas fa-baby',
                xp_reward: 50,
                rarity: 'Common',
                earned_date: '2024-01-15'
            },
            {
                id: 2,
                title: 'Team Player',
                description: 'Join your first project team',
                category: 'collaboration',
                icon: 'fas fa-users',
                xp_reward: 100,
                rarity: 'Common',
                earned_date: '2024-01-20'
            },
            {
                id: 3,
                title: 'Innovation Spark',
                description: 'Create your first project',
                category: 'innovation',
                icon: 'fas fa-lightbulb',
                xp_reward: 200,
                rarity: 'Uncommon',
                earned_date: '2024-02-01'
            },
            {
                id: 4,
                title: 'Event Enthusiast',
                description: 'Attend 5 events',
                category: 'participation',
                icon: 'fas fa-calendar-check',
                xp_reward: 150,
                rarity: 'Uncommon',
                earned_date: '2024-02-10'
            }
        ];
        this.updateLevelDisplay();
        this.renderAchievementsBadges();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes levelUpBounce {
        0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
        50% { transform: scale(1.1) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .achievement-badge:hover {
        transform: translateY(-5px);
    }
`;
document.head.appendChild(style);

// Make available globally
window.AchievementSystem = AchievementSystem;