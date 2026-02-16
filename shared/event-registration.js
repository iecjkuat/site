/**
 * Event Registration Component
 * Handles event registration, QR code generation, and display
 */

class EventRegistration {
    constructor() {
        this.apiBase = '/api/v1/events';
    }

    /**
     * Register for an event
     */
    async register(eventId, notes = '') {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                throw new Error('Please sign in to register for events');
            }

            console.log('🎫 Attempting registration:', { eventId, hasToken: !!token });

            const response = await fetch(`${this.apiBase}/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notes })
            });

            console.log('📡 Registration response:', { 
                status: response.status, 
                statusText: response.statusText,
                ok: response.ok 
            });

            const data = await response.json();
            console.log('📦 Registration data:', data);

            if (!response.ok) {
                throw new Error(data.message || `Registration failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Get user's registration for an event
     */
    async getRegistration(eventId) {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) return null;

            const response = await fetch(`${this.apiBase}/${eventId}/registration`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Failed to fetch registration');

            const data = await response.json();
            return data.registration;
        } catch (error) {
            console.error('Error fetching registration:', error);
            return null;
        }
    }

    /**
     * Get all user's registrations
     */
    async getMyRegistrations(status = null) {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) return [];

            const url = status 
                ? `${this.apiBase}/registrations/my?status=${status}`
                : `${this.apiBase}/registrations/my`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch registrations');

            const data = await response.json();
            return data.registrations || [];
        } catch (error) {
            console.error('Error fetching registrations:', error);
            return [];
        }
    }

    /**
     * Cancel registration
     */
    async cancelRegistration(eventId) {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`${this.apiBase}/${eventId}/registration`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Cancellation failed');
            }

            return data;
        } catch (error) {
            console.error('Cancellation error:', error);
            throw error;
        }
    }

    /**
     * Generate QR code image from registration data
     * Uses QRCode.js library (needs to be included in HTML)
     */
    async generateQRCodeImage(qrData, size = 256) {
        return new Promise((resolve, reject) => {
            if (typeof QRCode === 'undefined') {
                reject(new Error('QRCode library not loaded. Include qrcode.min.js'));
                return;
            }

            const canvas = document.createElement('canvas');
            QRCode.toCanvas(canvas, qrData, {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(canvas.toDataURL());
                }
            });
        });
    }

    /**
     * Display registration modal with QR code
     */
    async showRegistrationModal(registration) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 2rem;
            max-width: 500px;
            width: 100%;
            color: white;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        `;

        // Generate QR code if available
        let qrCodeHTML = '';
        if (registration.qr_code) {
            try {
                const qrImage = await this.generateQRCodeImage(registration.qr_code, 256);
                qrCodeHTML = `
                    <div style="background: white; padding: 1rem; border-radius: 12px; margin: 1.5rem 0;">
                        <img src="${qrImage}" alt="QR Code" style="width: 100%; height: auto; display: block;">
                    </div>
                    <p style="font-size: 0.9rem; opacity: 0.9; text-align: center; margin-top: 1rem;">
                        Show this QR code at the event for check-in
                    </p>
                `;
            } catch (error) {
                console.error('Error generating QR code:', error);
                qrCodeHTML = `
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 12px; margin: 1.5rem 0; text-align: center;">
                        <p style="margin: 0;">QR Code will be available after payment confirmation</p>
                    </div>
                `;
            }
        }

        const statusBadge = this.getStatusBadge(registration.registration_status);
        const paymentBadge = this.getPaymentBadge(registration.payment_status);

        content.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="margin: 0 0 0.5rem 0; font-size: 1.75rem;">Registration ${registration.registration_status === 'confirmed' ? 'Confirmed' : 'Pending'}!</h2>
                <p style="opacity: 0.9; margin: 0 0 1.5rem 0;">${registration.event?.title || 'Event'}</p>
                
                <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem;">
                    ${statusBadge}
                    ${paymentBadge}
                </div>

                ${qrCodeHTML}

                <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 12px; margin-top: 1.5rem; text-align: left;">
                    <div style="display: grid; gap: 0.75rem; font-size: 0.9rem;">
                        ${registration.event?.start_date ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="opacity: 0.7;">📅</span>
                                <span>${new Date(registration.event.start_date).toLocaleString()}</span>
                            </div>
                        ` : ''}
                        ${registration.event?.location ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="opacity: 0.7;">📍</span>
                                <span>${registration.event.location}</span>
                            </div>
                        ` : ''}
                        ${registration.event?.fee ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="opacity: 0.7;">💰</span>
                                <span>KSh ${registration.event.fee}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <button id="closeModalBtn" style="
                    margin-top: 1.5rem;
                    padding: 0.75rem 2rem;
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    font-size: 1rem;
                ">
                    Close
                </button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Close button handler
        const closeBtn = content.querySelector('#closeModalBtn');
        closeBtn.onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            'confirmed': { color: '#10b981', text: 'Confirmed', icon: '✓' },
            'pending': { color: '#f59e0b', text: 'Pending', icon: '⏳' },
            'waitlisted': { color: '#6366f1', text: 'Waitlisted', icon: '⏸' },
            'cancelled': { color: '#ef4444', text: 'Cancelled', icon: '✕' }
        };

        const badge = badges[status] || badges['pending'];

        return `
            <span style="
                background: ${badge.color};
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
            ">
                ${badge.icon} ${badge.text}
            </span>
        `;
    }

    /**
     * Get payment badge HTML
     */
    getPaymentBadge(status) {
        const badges = {
            'paid': { color: '#10b981', text: 'Paid', icon: '💳' },
            'pending': { color: '#f59e0b', text: 'Payment Pending', icon: '⏳' },
            'waived': { color: '#6366f1', text: 'Free', icon: '🎁' },
            'refunded': { color: '#ef4444', text: 'Refunded', icon: '↩' }
        };

        const badge = badges[status] || badges['pending'];

        return `
            <span style="
                background: ${badge.color};
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
            ">
                ${badge.icon} ${badge.text}
            </span>
        `;
    }

    /**
     * Show registration button with status
     */
    createRegistrationButton(event, registration = null) {
        const button = document.createElement('button');
        button.style.cssText = `
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 1rem;
            width: 100%;
            transition: all 0.3s ease;
        `;

        // Check if event has started (registration closed)
        const now = new Date();
        const eventStartDate = new Date(event.start_date);
        const hasStarted = now >= eventStartDate;

        if (hasStarted) {
            // Event has started - registration closed
            button.textContent = '🔒 Registration Closed';
            button.style.background = 'rgba(107, 114, 128, 0.3)';
            button.style.color = 'rgba(255, 255, 255, 0.6)';
            button.style.cursor = 'not-allowed';
            button.disabled = true;
            return button;
        }

        if (registration) {
            // Already registered
            if (registration.registration_status === 'confirmed') {
                button.textContent = '✓ Registered - View QR Code';
                button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                button.style.color = 'white';
                button.onclick = () => this.showRegistrationModal(registration);
            } else if (registration.registration_status === 'pending') {
                button.textContent = '⏳ Registration Pending Payment';
                button.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                button.style.color = 'white';
                button.onclick = () => this.showRegistrationModal(registration);
            } else if (registration.registration_status === 'waitlisted') {
                button.textContent = '⏸ On Waitlist';
                button.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)';
                button.style.color = 'white';
                button.onclick = () => this.showRegistrationModal(registration);
            } else if (registration.registration_status === 'cancelled') {
                button.textContent = '🎫 Register Again';
                button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                button.style.color = 'white';
                button.onclick = () => this.handleRegistration(event.id);
            }
        } else {
            // Not registered - show register button
            button.textContent = '🎫 Register for Event';
            button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            button.style.color = 'white';
            button.onclick = () => this.handleRegistration(event.id);
        }

        return button;
    }

    /**
     * Handle registration click
     */
    async handleRegistration(eventId) {
        try {
            const result = await this.register(eventId);
            
            if (result.waitlisted) {
                alert('Event is full. You have been added to the waitlist.');
            }
            
            if (result.registration) {
                await this.showRegistrationModal(result.registration);
            }
            
            // Reload page to update button state
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            alert(error.message || 'Registration failed. Please try again.');
        }
    }
}

// Global instance
window.eventRegistration = new EventRegistration();
