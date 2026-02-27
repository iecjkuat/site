/**
 * Simple Feedback System
 * Clean implementation with no dependencies
 */

console.log('✅ Feedback script loaded');

let currentMode = 'whisper';
let selectedRating = 5;

// Wait for auth system to be ready
function waitForAuth() {
    return new Promise((resolve) => {
        if (window.authManager) {
            console.log('✅ Auth manager already available');
            resolve();
        } else {
            console.log('⏳ Waiting for auth manager...');
            document.addEventListener('authReady', () => {
                console.log('✅ Auth manager ready');
                resolve();
            });
            
            // Fallback timeout
            setTimeout(() => {
                console.log('⚠️ Auth manager timeout, continuing anyway');
                resolve();
            }, 3000);
        }
    });
}

// Wait for DOM and Auth
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ DOM loaded');
    
    // Wait for auth system
    await waitForAuth();
    
    const form = document.getElementById('feedbackForm');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const stars = document.querySelectorAll('.star');
    const ratingGroup = document.getElementById('ratingGroup');
    const submitBtn = document.getElementById('submitBtn');
    const commentInput = document.getElementById('comment');
    
    if (!form) {
        console.error('❌ Form not found!');
        return;
    }
    
    console.log('✅ Form found, setting up...');
    
    // Show user info if logged in
    const user = window.authManager?.getUser();
    if (user) {
        console.log('👤 User logged in:', user.name || user.email);
        const userInfo = document.createElement('div');
        userInfo.style.cssText = `
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.5rem;
        `;
        userInfo.innerHTML = `
            <i class="fas fa-user-check" style="color: #10b981;"></i>
            Logged in as <strong>${user.name || user.email}</strong>
        `;
        document.querySelector('.container').insertBefore(userInfo, document.querySelector('.mode-toggle'));
    } else {
        console.log('👤 User not logged in');
    }
    
    // Mode toggle
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            console.log('🔄 Switching to mode:', mode);
            
            currentMode = mode;
            
            // Update button states
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide rating
            if (mode === 'review') {
                ratingGroup.style.display = 'block';
                submitBtn.innerHTML = '<i class="fas fa-star"></i> Post Review';
                
                // Check if logged in using authManager
                const isLoggedIn = window.authManager?.isAuthenticated?.();
                console.log('🔐 Is logged in:', isLoggedIn);
                
                if (!isLoggedIn) {
                    showToast('Please log in to post a public review', 'error');
                    // Switch back to whisper
                    setTimeout(() => {
                        modeBtns[0].click();
                    }, 2000);
                }
            } else {
                ratingGroup.style.display = 'none';
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Whisper';
            }
        });
    });
    
    // Rating stars
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            console.log('⭐ Rating selected:', selectedRating);
            updateStars();
        });
    });
    
    function updateStars() {
        stars.forEach((star, index) => {
            if (index < selectedRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📤 Form submitted');
        
        const comment = commentInput.value.trim();
        
        if (!comment || comment.length < 3) {
            showToast('Please enter at least 3 characters', 'error');
            return;
        }
        
        if (comment.length > 2000) {
            showToast('Message is too long (max 2000 characters)', 'error');
            return;
        }
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const data = {
                comment: comment,
                isAnonymous: currentMode === 'whisper',
                rating: currentMode === 'review' ? selectedRating : undefined
            };
            
            console.log('📤 Sending:', data);
            console.log('📍 URL: /api/v1/feedback-simple/submit');
            console.log('📍 Method: POST');
            console.log('📍 Has token:', !!token);
            
            const response = await fetch('/api/v1/feedback-simple/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            const responseText = await response.text();
            console.log('📦 Response text:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Failed to parse response as JSON');
                throw new Error('Invalid response from server');
            }
            
            console.log('📦 Response data:', result);
            
            if (response.ok && result.success) {
                showToast(currentMode === 'whisper' ? 'Whisper sent!' : 'Review posted!', 'success');
                form.reset();
                selectedRating = 5;
                updateStars();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            showToast(error.message || 'Failed to submit', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = currentMode === 'whisper' 
                ? '<i class="fas fa-paper-plane"></i> Send Whisper'
                : '<i class="fas fa-star"></i> Post Review';
        }
    });
    
    console.log('✅ Setup complete');
});

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

console.log('✅ Feedback script ready');
