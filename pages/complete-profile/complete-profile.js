// complete-profile.js

class CompleteProfileWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;

        // Wizard elements
        this.steps = document.querySelectorAll('.wizard-step');
        this.progressBar = document.getElementById('progressBar');
        this.currentStepText = document.getElementById('currentStep');
        this.progressPercent = document.getElementById('progressPercent');

        // Buttons
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.completeBtn = document.getElementById('completeBtn');
        this.skipBtn = document.getElementById('skipBtn');

        // Data
        this.profileData = {};

        this.interests = ["AI", "Robotics", "Web Development", "Mobile Apps", "IoT", "Cybersecurity"];
        this.skills = ["Python", "JavaScript", "C++", "UI/UX Design", "Data Analysis", "Machine Learning"];
        this.goals = ["Networking", "Learning", "Hackathons", "Competitions", "Project Collaboration"];

        this.init();
    }

    init() {
        this.showStep(this.currentStep);
        this.populateOptions();
        this.bindEvents();
    }

    populateOptions() {
        const interestsGrid = document.getElementById('interestsGrid');
        const skillsGrid = document.getElementById('skillsGrid');
        const goalsGrid = document.getElementById('goalsGrid');

        // Populate Interests
        this.interests.forEach((interest, i) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="interests" value="${interest}" class="glass-input">
                    <span>${interest}</span>
                </label>
            `;
            interestsGrid.appendChild(div);
        });

        // Populate Skills
        this.skills.forEach((skill, i) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="skills" value="${skill}" class="glass-input">
                    <span>${skill}</span>
                </label>
            `;
            skillsGrid.appendChild(div);
        });

        // Populate Goals
        this.goals.forEach((goal, i) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="goals" value="${goal}" class="glass-input">
                    <span>${goal}</span>
                </label>
            `;
            goalsGrid.appendChild(div);
        });
    }

    bindEvents() {
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.prevBtn.addEventListener('click', () => this.prevStep());
        this.completeBtn.addEventListener('click', () => this.submitProfile());
    }

    showStep(step) {
        this.steps.forEach((el, i) => el.classList.toggle('hidden', i !== step - 1));

        this.prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
        this.nextBtn.classList.toggle('hidden', step === this.totalSteps);
        this.completeBtn.classList.toggle('hidden', step !== this.totalSteps);

        // Update progress
        const percent = Math.round((step / this.totalSteps) * 100);
        this.progressBar.style.width = `${percent}%`;
        this.currentStepText.textContent = step;
        this.progressPercent.textContent = percent;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    collectData() {
        const formElements = document.querySelectorAll('.wizard-step input, .wizard-step textarea, .wizard-step select');
        formElements.forEach(el => {
            if (el.type === 'checkbox') {
                if (!this.profileData[el.name]) this.profileData[el.name] = [];
                if (el.checked) this.profileData[el.name].push(el.value);
            } else {
                this.profileData[el.name] = el.value;
            }
        });
    }

    async submitProfile() {
        this.collectData();
        console.log('Profile Data:', this.profileData);

        try {
            // Replace with your backend or Supabase API call
            const response = await fetch('/api/profile/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.profileData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile completed successfully! Redirecting to dashboard...');
                window.location.href = '/dashboard';
            } else {
                alert(data.message || 'Failed to complete profile.');
            }
        } catch (error) {
            console.error('Profile submission error:', error);
            alert('Network error. Please try again.');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new CompleteProfileWizard());
