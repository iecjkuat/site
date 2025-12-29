// JKUAT Innovation Club - Payment Page

class PaymentPage {
    constructor() {
        this.paymentMethods = ['mpesa', 'card', 'bank'];
        this.selectedMethod = 'mpesa';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializePaymentMethods();
        this.loadPaymentInfo();
    }

    bindEvents() {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget.dataset.method);
            });
        });

        // Payment form
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePayment(e));
        }

        // Amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectAmount(e.target.dataset.amount);
            });
        });
    }

    initializePaymentMethods() {
        // Set default payment method
        this.selectPaymentMethod('mpesa');
    }

    loadPaymentInfo() {
        // Get payment info from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        const amount = urlParams.get('amount');
        const eventId = urlParams.get('eventId');

        if (type) {
            document.getElementById('paymentType').textContent = this.getPaymentTypeLabel(type);
        }
        if (amount) {
            document.getElementById('amount').value = amount;
            this.updateTotal(amount);
        }
        if (eventId) {
            this.loadEventDetails(eventId);
        }
    }

    selectPaymentMethod(method) {
        this.selectedMethod = method;

        // Update UI
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');

        // Show/hide payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });
        document.getElementById(`${method}Form`).style.display = 'block';
    }

    selectAmount(amount) {
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        document.getElementById('amount').value = amount;
        this.updateTotal(amount);
    }

    updateTotal(amount) {
        const total = parseFloat(amount) || 0;
        document.getElementById('totalAmount').textContent = `KSh ${total.toLocaleString()}`;
    }

    async handlePayment(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const paymentData = {
            method: this.selectedMethod,
            amount: formData.get('amount'),
            ...Object.fromEntries(formData)
        };

        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            const response = await window.jkuatApp.apiCall('/api/payments/process', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });

            if (response.success) {
                this.showPaymentSuccess(response);
            } else {
                throw new Error(response.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            window.jkuatApp.showToast('Payment failed. Please try again.', 'error');
        } finally {
            // Reset button
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay Now';
            submitBtn.disabled = false;
        }
    }

    showPaymentSuccess(response) {
        // Hide payment form
        document.getElementById('paymentSection').style.display = 'none';
        
        // Show success message
        const successSection = document.getElementById('successSection');
        successSection.style.display = 'block';
        
        // Update success details
        document.getElementById('transactionId').textContent = response.transactionId;
        document.getElementById('paidAmount').textContent = `KSh ${response.amount}`;
        
        window.jkuatApp.showToast('Payment successful!', 'success');
    }

    getPaymentTypeLabel(type) {
        const labels = {
            'membership': 'Membership Fee',
            'event': 'Event Registration',
            'donation': 'Donation',
            'merchandise': 'Merchandise'
        };
        return labels[type] || 'Payment';
    }

    async loadEventDetails(eventId) {
        try {
            const response = await window.jkuatApp.apiCall(`/api/events/${eventId}`);
            if (response.success) {
                document.getElementById('eventName').textContent = response.event.title;
            }
        } catch (error) {
            console.error('Error loading event details:', error);
        }
    }
}

window.PaymentPage = PaymentPage;