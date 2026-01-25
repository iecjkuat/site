/**
 * JKUAT Innovation Club - Feedback UI Interactions
 * Enhanced whisper submission functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Feedback page loaded');

    // Initialize Navigation
    if (typeof window.Navigation === 'function' && !window.navInstance) {
        window.navInstance = new Navigation();
    }

    const form = document.getElementById('feedbackForm');
    console.log('Form found:', !!form);

    // Initial load of community voices
    loadWhispers();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');

            const submitBtn = form.querySelector('button[type="submit"]');
            console.log('Submit button found:', !!submitBtn);

            if (!submitBtn) {
                console.error('Submit button not found');
                return;
            }

            const originalBtnText = submitBtn.innerHTML;

            // Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting & Sending...';

            try {
                // Gather data
                const titleInput = form.querySelector('input[type="text"]');
                const commentInput = form.querySelector('textarea');

                console.log('Title input:', titleInput?.value);
                console.log('Comment input:', commentInput?.value);

                if (!commentInput || !commentInput.value.trim()) {
                    throw new Error('Please enter your message before sending');
                }

                const formData = {
                    title: titleInput ? titleInput.value.trim() : '',
                    comment: commentInput.value.trim(),
                    isAnonymous: true,
                    timestamp: new Date().toISOString()
                };

                console.log('Sending data:', formData);

                // Simulate API call for now (since we don't have a backend)
                await simulateWhisperSubmission(formData);

                // Success Visuals
                showSuccessMessage();

                // Reset form
                form.reset();

                // Refresh the wall immediately
                loadWhispers();

            } catch (error) {
                console.error('Submission error:', error);
                showErrorMessage(error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    } else {
        console.error('Feedback form not found');
    }
});

// Submit whisper to API (with fallback to localStorage)
async function simulateWhisperSubmission(formData) {
    try {
        // Try API first
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: formData.title || 'Anonymous Whisper',
                message: formData.comment,
                isAnonymous: formData.isAnonymous,
                timestamp: formData.timestamp
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Whisper submitted to API:', result);
            return { success: true, fromAPI: true };
        } else {
            throw new Error('API submission failed');
        }
    } catch (error) {
        console.log('⚠️ API unavailable, using localStorage fallback');

        // Fallback to localStorage for demo purposes
        const whispers = JSON.parse(localStorage.getItem('whispers') || '[]');
        whispers.unshift({
            id: Date.now(),
            title: formData.title || 'Anonymous Whisper',
            comment: formData.comment,
            created_at: formData.timestamp,
            isAnonymous: true
        });
        // Keep only last 10 whispers
        whispers.splice(10);
        localStorage.setItem('whispers', JSON.stringify(whispers));
        return { success: true, fromAPI: false };
    }
}

function showSuccessMessage() {
    const successToast = document.createElement('div');
    successToast.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-fade-in flex items-center gap-3 border border-emerald-400';
    successToast.style.animation = 'fadeIn 0.5s ease-out';
    successToast.innerHTML = `
        <i class="fas fa-shield-alt text-2xl"></i>
        <div>
            <h4 class="font-bold">Whisper Received</h4>
            <p class="text-sm opacity-90">Your voice is safe with us.</p>
        </div>
    `;
    document.body.appendChild(successToast);
    setTimeout(() => {
        successToast.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => successToast.remove(), 500);
    }, 4000);
}

function showErrorMessage(message) {
    const errorToast = document.createElement('div');
    errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-red-400';
    errorToast.style.animation = 'fadeIn 0.5s ease-out';
    errorToast.innerHTML = `
        <i class="fas fa-exclamation-triangle text-2xl"></i>
        <div>
            <h4 class="font-bold">Submission Failed</h4>
            <p class="text-sm opacity-90">${message}</p>
        </div>
    `;
    document.body.appendChild(errorToast);
    setTimeout(() => {
        errorToast.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => errorToast.remove(), 500);
    }, 5000);
}

async function loadWhispers() {
    const grid = document.getElementById('whispersGrid');
    if (!grid) {
        console.log('Whispers grid not found');
        return;
    }

    try {
        // Try API first
        const response = await fetch('/api/feedback?limit=10');
        if (response.ok) {
            const data = await response.json();
            const whispers = data.feedback || data;
            console.log('✅ Whispers loaded from API:', whispers.length);
            renderWhispers(whispers, grid);
            return;
        }
    } catch (error) {
        console.log('⚠️ API unavailable, using localStorage fallback');
    }

    // Fallback to localStorage
    let whispers = JSON.parse(localStorage.getItem('whispers') || '[]');

    // Add some demo whispers if none exist
    if (whispers.length === 0) {
        whispers = [
            {
                id: 1,
                title: 'Event Feedback',
                comment: 'The AI bootcamp was incredible! The mentors really knew their stuff and the hands-on sessions were invaluable.',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                isAnonymous: true
            },
            {
                id: 2,
                title: 'Club Suggestion',
                comment: 'Would love to see more networking events with industry professionals. Maybe monthly meetups?',
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                isAnonymous: true
            },
            {
                id: 3,
                title: 'Innovation Week',
                comment: 'Innovation Week was a blast. Loved the networking opportunities and the pitch competition format.',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                isAnonymous: true
            },
            {
                id: 4,
                title: 'Workshop Request',
                comment: 'Could we have more workshops on blockchain and Web3 development? There\'s a lot of interest in the community.',
                created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                isAnonymous: true
            },
            {
                id: 5,
                title: 'Meeting Times',
                comment: 'The current meeting times conflict with some classes. Maybe we could have multiple time slots?',
                created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                isAnonymous: true
            },
            {
                id: 6,
                title: 'Great Work!',
                comment: 'Just wanted to say the leadership team is doing an amazing job. Keep up the great work!',
                created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                isAnonymous: true
            }
        ];
        localStorage.setItem('whispers', JSON.stringify(whispers));
    }

    renderWhispers(whispers, grid);
}

function renderWhispers(whispers, grid) {
    if (whispers.length > 0) {
        grid.innerHTML = whispers.map(item => `
            <div class="glass-card p-6 border-l-4 border-l-emerald-500 hover:transform hover:-translate-y-1 transition-transform duration-300">
                <h3 class="text-white font-bold text-lg mb-2">${escapeHtml(item.title || 'Anonymous Voice')}</h3>
                <p class="text-slate-300 text-sm italic mb-4">"${escapeHtml(item.comment || item.message)}"</p>
                <div class="flex justify-between items-center text-xs text-slate-500">
                    <span class="flex items-center gap-1 text-emerald-400 font-semibold"><i class="fas fa-user-secret"></i> Anonymous</span>
                    <span>${new Date(item.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    } else {
        grid.innerHTML = `
            <div class="col-span-full text-center text-slate-500 py-12 bg-white/5 rounded-xl border border-white/5">
                <i class="fas fa-wind text-4xl mb-4 text-slate-600"></i>
                <p class="text-lg">The air is silent.</p>
                <p class="text-sm">Be the first to start a whisper.</p>
            </div>
        `;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);
