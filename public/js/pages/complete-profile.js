// JKUAT Innovation Club - Profile Completion Wizard

class ProfileWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        
        this.interests = [
            'Web Development', 'Mobile Apps', 'AI/Machine Learning', 'Data Science',
            'Cybersecurity', 'IoT', 'Blockchain', 'Game Development',
            'UI/UX Design', 'Digital Marketing', 'Entrepreneurship', 'Fintech'
        ];
        
        this.skills = [
            'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
            'Flutter', 'Swift', 'Kotlin', 'PHP', 'SQL', 'MongoDB',
            'AWS', 'Docker', 'Git', 'Figma', 'Photoshop', 'Excel'
        ];
        
        this.goals = [
            'Learn new technologies and skills',
            'Build innovative projects',
            'Network with like-minded peers',
            'Start my own tech company',
            'Find internship opportunities',
            'Participate in hackathons',
            'Contribute to open source projects',
            'Develop leadership skills'
        ];
        
        this.init();
    }

    init() {
        this.populateInterests();
        this.populateSkills();
        this.populateGoals();
        this.bindEvents();
        this.updateProgress();
    }

    populateInterests() {
        const grid = document.getElementById('interestsGrid');
        grid.innerHTML = this.interests.map(interest => `
            <label style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: all 0.3s;" 
                   onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" 
                   onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <input type="checkbox" name="interests" value="${interest}" style="margin-right: 0.5rem; accent-color: #10b981;">
                <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem;">${interest}</span>
            </label>
        `).join('');
    }

    populateSkills() {
        const grid = document.getElementById('skillsGrid');
        grid.innerHTML = this.skills.map(skill => `
            <label style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: all 0.3s;" 
                   onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" 
                   onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <input type="checkbox" name="skills" value="${skill}" style="margin-right: 0.5rem; accent-color: #10b981;">
                <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem;">${skill}</span>
            </label>
        `).join('');
    }

    populateGoals() {
        const grid = document.getElementById('goalsGrid');
        grid.innerHTML = this.goals.map(goal => `
            <label style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: all 0.3s;" 
                   onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" 
                   onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <input type="checkbox" name="goals" value="${goal}" style="margin-right: 0.5rem; accent-color: #10b981;">
                <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem;">${goal}</span>
            </label>
        `).join('');
    }

    bindEvents() {
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('completeBtn').addEventListener('click', () => this.completeProfile());
        
        // Auto-save form data on input change
        document.addEventListener('change', (e) => {
            if (e.target.name) {
                this.saveFormData();
            }
        });
    }

    saveFormData() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!this.formData[input.name]) {
                    this.formData[input.name] = [];
                }
                if (input.checked && !this.formData[input.name].includes(input.value)) {
                    this.formData[input.name].push(input.value);
                } else if (!input.checked) {
                    this.formData[input.name] = this.formData[input.name].filter(val => val !== input.value);
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveFormData();
            this.currentStep++;
            this.showStep();
            this.updateProgress();
            this.updateButtons();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep();
            this.updateProgress();
            this.updateButtons();
        }
    }

    showStep() {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            document.getElementById(`step${i}`).classList.add('hidden');
        }
        
        // Show current step
        document.getElementById(`step${this.currentStep}`).classList.remove('hidden');
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressPercent').textContent = Math.round(progress);
        document.getElementById('currentStep').textContent = this.currentStep;
    }

    updateButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const completeBtn = document.getElementById('completeBtn');

        // Show/hide previous button
        prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';

        // Show/hide next/complete buttons
        if (this.currentStep === this.totalSteps) {
            nextBtn.classList.add('hidden');
            completeBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            completeBtn.classList.add('hidden');
        }
    }

    async completeProfile() {
        this.saveFormData();
        
        const completeBtn = document.getElementById('completeBtn');
        const originalText = completeBtn.innerHTML;
        completeBtn.innerHTML = '<div class="spinner"></div>Completing Profile...';
        completeBtn.disabled = true;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch('/api/auth/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(this.formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Update user data in localStorage
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const updatedUser = { ...currentUser, profileCompleted: true };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                alert('Profile completed successfully! Welcome to JKUAT Innovation Club!');
                window.location.href = '/dashboard';
            } else {
                throw new Error(data.message || 'Failed to complete profile');
            }
        } catch (error) {
            console.error('Profile completion error:', error);
            alert('Failed to complete profile: ' + error.message);
        } finally {
            completeBtn.innerHTML = originalText;
            completeBtn.disabled = false;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        alert('Please log in first');
        window.location.href = '/';
        return;
    }

    new ProfileWizard();
});