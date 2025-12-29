/**
 * Payment Service
 * Handles M-Pesa and other payment processing
 */

class PaymentService {
    constructor() {
        this.baseUrl = '/api/payments';
        this.pollingInterval = null;
        this.maxPollingAttempts = 60; // 5 minutes at 5-second intervals
    }

    /**
     * Initiate M-Pesa payment
     */
    async initiateMpesaPayment(paymentData) {
        try {
            console.log('💰 Initiating M-Pesa payment:', paymentData);
            
            const response = await fetch(`${this.baseUrl}/mpesa/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Payment initiation failed');
            }

            const result = await response.json();
            console.log('✅ M-Pesa payment initiated:', result);
            
            return result;
        } catch (error) {
            console.error('❌ M-Pesa payment initiation failed:', error);
            throw error;
        }
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus(paymentId) {
        try {
            const response = await fetch(`${this.baseUrl}/status/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check payment status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    }

    /**
     * Poll payment status until completion or timeout
     */
    async pollPaymentStatus(paymentId, onStatusUpdate = null) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const poll = async () => {
                try {
                    attempts++;
                    console.log(`🔄 Checking payment status (${attempts}/${this.maxPollingAttempts})`);
                    
                    const status = await this.checkPaymentStatus(paymentId);
                    
                    // Call status update callback if provided
                    if (onStatusUpdate) {
                        onStatusUpdate(status, attempts);
                    }
                    
                    if (status.status === 'completed') {
                        console.log('✅ Payment completed successfully');
                        clearInterval(this.pollingInterval);
                        resolve(status);
                    } else if (status.status === 'failed') {
                        console.log('❌ Payment failed');
                        clearInterval(this.pollingInterval);
                        reject(new Error(status.failureReason || 'Payment failed'));
                    } else if (attempts >= this.maxPollingAttempts) {
                        console.log('⏰ Payment polling timeout');
                        clearInterval(this.pollingInterval);
                        reject(new Error('Payment status check timeout'));
                    }
                    // Continue polling if status is still pending
                    
                } catch (error) {
                    console.error('Error polling payment status:', error);
                    clearInterval(this.pollingInterval);
                    reject(error);
                }
            };
            
            // Start polling immediately, then every 5 seconds
            poll();
            this.pollingInterval = setInterval(poll, 5000);
        });
    }

    /**
     * Get user payment history
     */
    async getPaymentHistory(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment history');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching payment history:', error);
            throw error;
        }
    }

    /**
     * Format phone number for M-Pesa (254XXXXXXXXX format)
     */
    formatPhoneNumber(phoneNumber) {
        // Remove any non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');
        
        // Handle different input formats
        if (cleaned.startsWith('0')) {
            // Convert 0XXXXXXXXX to 254XXXXXXXXX
            cleaned = '254' + cleaned.substring(1);
        } else if (cleaned.startsWith('254')) {
            // Already in correct format
            cleaned = cleaned;
        } else if (cleaned.length === 9) {
            // Assume it's missing country code
            cleaned = '254' + cleaned;
        }
        
        // Validate format
        if (!/^254[0-9]{9}$/.test(cleaned)) {
            throw new Error('Invalid phone number format. Use 254XXXXXXXXX or 0XXXXXXXXX');
        }
        
        return cleaned;
    }

    /**
     * Validate payment amount
     */
    validateAmount(amount) {
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount <= 0) {
            throw new Error('Invalid amount. Must be a positive number');
        }
        
        if (numAmount < 1) {
            throw new Error('Minimum payment amount is KES 1');
        }
        
        if (numAmount > 70000) {
            throw new Error('Maximum payment amount is KES 70,000');
        }
        
        return numAmount;
    }

    /**
     * Show payment modal/interface
     */
    showPaymentModal(eventData, onSuccess = null, onError = null) {
        // Remove any existing modal first
        const existingModal = document.getElementById('paymentModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML with direct event handlers
        const modalHtml = `
            <div class="payment-modal-overlay" id="paymentModal">
                <div class="payment-modal">
                    <div class="payment-modal-header">
                        <h3>💳 Event Payment</h3>
                        <button class="payment-modal-close" id="paymentModalCloseBtn">&times;</button>
                    </div>
                    
                    <div class="payment-modal-content">
                        <div class="event-summary">
                            <h4>${eventData.title}</h4>
                            <p><strong>Fee:</strong> KES ${eventData.fee.toLocaleString()}</p>
                            <p><strong>Date:</strong> ${new Date(eventData.start_date).toLocaleDateString()}</p>
                        </div>
                        
                        <form id="paymentForm" class="payment-form">
                            <div class="form-group">
                                <label for="phoneNumber">M-Pesa Phone Number</label>
                                <input 
                                    type="tel" 
                                    id="phoneNumber" 
                                    name="phoneNumber" 
                                    placeholder="254712345678 or 0712345678"
                                    required
                                >
                                <small>Enter your M-Pesa registered phone number</small>
                            </div>
                            
                            <div class="payment-status" id="paymentStatus" style="display: none;">
                                <div class="status-content">
                                    <div class="spinner"></div>
                                    <p id="statusMessage">Initiating payment...</p>
                                </div>
                            </div>
                            
                            <div class="payment-actions">
                                <button type="button" id="paymentCancelBtn" class="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" class="btn-primary">
                                    Pay KES ${eventData.fee.toLocaleString()}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add styles if not already added
        this.addPaymentModalStyles();
        
        // Set up event handlers AFTER modal is added to DOM
        setTimeout(() => {
            this.setupPaymentModalHandlers();
        }, 100);
        
        // Handle form submission
        document.getElementById('paymentForm').onsubmit = async (e) => {
            e.preventDefault();
            
            try {
                const phoneNumber = document.getElementById('phoneNumber').value;
                const formattedPhone = this.formatPhoneNumber(phoneNumber);
                const validatedAmount = this.validateAmount(eventData.fee);
                
                // Show loading state
                this.showPaymentStatus('Initiating M-Pesa payment...', 'loading');
                
                // Initiate payment
                const paymentResult = await this.initiateMpesaPayment({
                    phoneNumber: formattedPhone,
                    amount: validatedAmount,
                    eventId: eventData.id,
                    userId: JSON.parse(localStorage.getItem('user')).id
                });
                
                // Show STK push message
                this.showPaymentStatus(
                    'Check your phone for M-Pesa prompt and enter your PIN to complete payment',
                    'waiting'
                );
                
                // Start polling for payment status
                try {
                    const finalStatus = await this.pollPaymentStatus(
                        paymentResult.paymentId,
                        (status, attempt) => {
                            if (attempt <= 3) {
                                this.showPaymentStatus(
                                    'Waiting for payment confirmation...',
                                    'waiting'
                                );
                            } else {
                                this.showPaymentStatus(
                                    `Still waiting for payment... (${Math.floor(attempt * 5 / 60)}m ${(attempt * 5) % 60}s)`,
                                    'waiting'
                                );
                            }
                        }
                    );
                    
                    // Payment successful
                    this.showPaymentStatus('Payment successful! 🎉', 'success');
                    
                    setTimeout(() => {
                        this.closePaymentModal();
                        if (onSuccess) onSuccess(finalStatus);
                    }, 2000);
                    
                } catch (pollError) {
                    this.showPaymentStatus(`Payment failed: ${pollError.message}`, 'error');
                    if (onError) onError(pollError);
                }
                
            } catch (error) {
                this.showPaymentStatus(`Error: ${error.message}`, 'error');
                if (onError) onError(error);
            }
        };
    }
    
    setupPaymentModalHandlers() {
        console.log('🔧 Setting up payment modal handlers...');
        
        const modal = document.getElementById('paymentModal');
        const closeBtn = document.getElementById('paymentModalCloseBtn');
        const cancelBtn = document.getElementById('paymentCancelBtn');
        
        if (!modal) {
            console.error('❌ Payment modal not found');
            return;
        }
        
        // Close button handler
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔴 Close button clicked');
                this.closePaymentModal();
            });
            console.log('✅ Close button handler attached');
        } else {
            console.error('❌ Close button not found');
        }
        
        // Cancel button handler
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔴 Cancel button clicked');
                this.closePaymentModal();
            });
            console.log('✅ Cancel button handler attached');
        } else {
            console.error('❌ Cancel button not found');
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'paymentModal') {
                console.log('🔴 Clicked outside modal');
                this.closePaymentModal();
            }
        });
        
        // ESC key handler
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                console.log('🔴 ESC key pressed');
                this.closePaymentModal();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
        
        console.log('✅ All payment modal handlers set up');
    }

    showPaymentStatus(message, type = 'loading') {
        const statusDiv = document.getElementById('paymentStatus');
        const messageEl = document.getElementById('statusMessage');
        
        if (statusDiv && messageEl) {
            statusDiv.style.display = 'block';
            messageEl.textContent = message;
            statusDiv.className = `payment-status ${type}`;
        }
    }

    closePaymentModal() {
        console.log('🔴 Attempting to close payment modal...');
        
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.remove();
            console.log('✅ Payment modal closed and removed from DOM');
        } else {
            console.warn('⚠️ Payment modal not found in DOM');
        }
        
        // Clean up global function
        if (window.closePaymentModal) {
            delete window.closePaymentModal;
            console.log('✅ Global close function cleaned up');
        }
        
        // Stop any ongoing polling
        this.stopPolling();
        console.log('✅ Payment polling stopped');
    }

    static closePaymentModal() {
        console.log('🔴 Static close method called...');
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.remove();
            console.log('✅ Payment modal closed (static method)');
        } else {
            console.warn('⚠️ Payment modal not found (static method)');
        }
    }

    addPaymentModalStyles() {
        if (document.getElementById('payment-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'payment-modal-styles';
        styles.textContent = `
            .payment-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .payment-modal {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .payment-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .payment-modal-header h3 {
                margin: 0;
                color: #1f2937;
            }
            
            .payment-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                font-weight: bold;
            }
            
            .payment-modal-close:hover {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
                transform: scale(1.1);
            }
            
            .payment-modal-close:active {
                transform: scale(0.95);
            }
            
            .payment-modal-content {
                padding: 20px;
            }
            
            .event-summary {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .event-summary h4 {
                margin: 0 0 8px 0;
                color: #065f46;
            }
            
            .event-summary p {
                margin: 4px 0;
                color: #047857;
            }
            
            .payment-form .form-group {
                margin-bottom: 20px;
            }
            
            .payment-form label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #374151;
            }
            
            .payment-form input {
                width: 100%;
                padding: 12px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.8);
                font-size: 16px;
                transition: all 0.2s;
            }
            
            .payment-form input:focus {
                outline: none;
                border-color: #10b981;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
            }
            
            .payment-form small {
                display: block;
                margin-top: 4px;
                color: #6b7280;
                font-size: 14px;
            }
            
            .payment-status {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            
            .payment-status.loading {
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(59, 130, 246, 0.2);
            }
            
            .payment-status.waiting {
                background: rgba(245, 158, 11, 0.1);
                border-color: rgba(245, 158, 11, 0.2);
            }
            
            .payment-status.success {
                background: rgba(16, 185, 129, 0.1);
                border-color: rgba(16, 185, 129, 0.2);
            }
            
            .payment-status.error {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.2);
            }
            
            .status-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }
            
            .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-left-color: #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .payment-status.success .spinner,
            .payment-status.error .spinner {
                display: none;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .payment-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .payment-actions button {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-secondary {
                background: rgba(107, 114, 128, 0.1);
                color: #374151;
                border: 1px solid rgba(107, 114, 128, 0.2);
            }
            
            .btn-secondary:hover {
                background: rgba(107, 114, 128, 0.2);
            }
            
            .btn-primary {
                background: #10b981;
                color: white;
            }
            
            .btn-primary:hover {
                background: #059669;
            }
            
            .btn-primary:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Stop polling if needed
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}

// Create global instance
window.PaymentService = PaymentService;

// Add global helper function for debugging
window.forceClosePaymentModal = function() {
    console.log('🔧 Force closing payment modal...');
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 100);
        console.log('✅ Payment modal force closed');
    } else {
        console.log('❌ No payment modal found to close');
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentService;
}