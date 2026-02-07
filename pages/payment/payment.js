// JKUAT Innovation Club - Enhanced Payments & Billing Page
// Incorporating Security & Performance Best Practices

class PaymentPage {
    constructor() {
        this.selectedService = null;
        this.selectedServiceData = null;
        this.selectedPaymentMethod = 'mpesa';
        this.currentAmount = 0;
        this.availableEvents = [];
        this.availableMerchandise = [];
        this.paymentAttempts = 0;
        this.maxPaymentAttempts = 5;
        this.init();
    }

    init() {
        console.log('🚀 Initializing Enhanced Payment Page...');
        this.bindEvents();
        this.loadAvailableServices();
        this.initializeSecurityFeatures();
    }

    // ===== SECURITY ENHANCEMENTS =====
    // Note: Real CSRF protection must be server-side with session-bound tokens

    validateAmount(amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000) {
            throw new Error('Invalid amount. Please enter a value between 1 and 1,000,000 KSh.');
        }
        return numAmount;
    }

    sanitizePhoneNumber(phone) {
        // Remove all non-digits and validate format
        const cleaned = phone.replace(/\D/g, '');

        // Handle different input formats
        if (cleaned.length === 10 && cleaned.startsWith('0')) {
            // Convert 0XXXXXXXXX to 254XXXXXXXXX
            return '254' + cleaned.substring(1);
        } else if (cleaned.length === 9) {
            // Convert XXXXXXXXX to 254XXXXXXXXX
            return '254' + cleaned;
        } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
            // Already in correct format
            return cleaned;
        } else {
            throw new Error('Invalid phone number format. Please use format: 0XXXXXXXXX or 254XXXXXXXXX');
        }
    }

    checkRateLimit() {
        // Note: This is client-side UX throttling only. Real rate limiting must be server-side.
        if (this.paymentAttempts >= this.maxPaymentAttempts) {
            throw new Error('Too many payment attempts. Please wait before trying again.');
        }
        this.paymentAttempts++;
    }

    initializeSecurityFeatures() {
        // Clear sensitive data on page unload
        window.addEventListener('beforeunload', () => {
            this.clearSensitiveData();
        });

        // Implement input validation
        this.setupInputValidation();
    }

    setupInputValidation() {
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value;
                // Allow digits, spaces, dashes, and plus signs for user convenience
                value = value.replace(/[^\d\s\-\+]/g, '');
                e.target.value = value;

                // Update placeholder based on input
                if (value.length === 0) {
                    e.target.placeholder = '0XXXXXXXXX or 254XXXXXXXXX';
                }
            });

            phoneInput.addEventListener('blur', (e) => {
                const value = e.target.value.trim();
                if (value) {
                    try {
                        const sanitized = this.sanitizePhoneNumber(value);
                        e.target.value = sanitized;
                        e.target.classList.add('border-success');
                        e.target.classList.remove('border-error');
                    } catch (error) {
                        e.target.classList.add('border-error');
                        e.target.classList.remove('border-success');
                        this.showMessage(error.message, 'warning');
                    }
                }
            });
        }

        const amountInput = document.getElementById('paymentAmount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (value > 1000000) {
                    e.target.value = 1000000;
                    this.showMessage('Maximum amount is KSh 1,000,000', 'warning');
                } else if (value < 0) {
                    e.target.value = 0;
                }
            });
        }
    }

    clearSensitiveData() {
        // Clear form data
        const sensitiveInputs = document.querySelectorAll('input[type="tel"], input[type="number"]');
        sensitiveInputs.forEach(input => {
            input.value = '';
        });
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Service selection - single clean handler
        document.querySelectorAll('.select-service-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.currentTarget.closest('.service-card');
                if (!card) return;
                this.selectService(card.dataset.service);
            });
        });

        // Back to services
        const backBtn = document.getElementById('backToServices');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showServiceSelection();
            });
        }

        // Payment method selection with keyboard support
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                const methodType = e.currentTarget.dataset.method;
                this.selectPaymentMethod(methodType);
            });
            
            // Keyboard support for accessibility
            method.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const methodType = e.currentTarget.dataset.method;
                    this.selectPaymentMethod(methodType);
                }
            });
        });

        // Amount input
        const amountInput = document.getElementById('paymentAmount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                try {
                    const amount = this.validateAmount(e.target.value);
                    this.updateAmount(amount);
                } catch (error) {
                    this.showMessage(error.message, 'error');
                    this.updateAmount(0);
                }
            });
        }

        // Phone number input for progress tracking
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                this.updateProgress();
            });
        }

        // Card inputs for progress tracking
        const cardInputs = ['cardNumber', 'expiryDate', 'cvv'];
        cardInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateProgress();
                });
            }
        });

        // Print receipt button
        const printBtn = document.getElementById('printReceiptBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Payment form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                this.handlePayment(e);
            });
        }
    }

    // ===== SERVICE LOADING =====
    async loadAvailableServices() {
        try {
            // Load events with timeout
            const eventsController = new AbortController();
            const eventsTimeout = setTimeout(() => eventsController.abort(), 5000);

            const eventsResponse = await fetch('/api/events?status=upcoming&limit=10', {
                signal: eventsController.signal
            });
            clearTimeout(eventsTimeout);

            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                this.availableEvents = eventsData.events || [];
            }

            // Load merchandise with timeout
            const merchController = new AbortController();
            const merchTimeout = setTimeout(() => merchController.abort(), 5000);

            const merchResponse = await fetch('/api/merchandise?available=true', {
                signal: merchController.signal
            });
            clearTimeout(merchTimeout);

            if (merchResponse.ok) {
                const merchData = await merchResponse.json();
                this.availableMerchandise = merchData.items || [];
            }
        } catch (error) {
            console.warn('Could not load services, using fallback data:', error);
            this.loadFallbackServices();
        }
    }

    loadFallbackServices() {
        // Fallback events data with relative dates
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        const twoMonths = new Date(today);
        twoMonths.setMonth(today.getMonth() + 2);
        
        this.availableEvents = [
            {
                id: 'event-1',
                title: 'Innovation Workshop',
                description: 'Learn design thinking and innovation methodologies',
                fee: 500,
                start_date: nextMonth.toISOString().split('T')[0],
                category: 'Workshop'
            },
            {
                id: 'event-2',
                title: 'Tech Hackathon',
                description: '48-hour coding competition with prizes',
                fee: 1000,
                start_date: twoMonths.toISOString().split('T')[0],
                category: 'Competition'
            },
            {
                id: 'event-3',
                title: 'Entrepreneurship Bootcamp',
                description: 'Intensive business development program',
                fee: 1500,
                start_date: twoMonths.toISOString().split('T')[0],
                category: 'Bootcamp'
            }
        ];

        // Fallback merchandise data
        this.availableMerchandise = [
            {
                id: 'merch-1',
                name: 'Club T-Shirt',
                description: 'Official JKUAT Innovation Club t-shirt',
                price: 800,
                sizes: ['S', 'M', 'L', 'XL']
            },
            {
                id: 'merch-2',
                name: 'Club Hoodie',
                description: 'Premium hoodie with club logo',
                price: 2500,
                sizes: ['S', 'M', 'L', 'XL']
            },
            {
                id: 'merch-3',
                name: 'Club Mug',
                description: 'Ceramic mug with innovation quotes',
                price: 600,
                sizes: ['Standard']
            }
        ];
    }

    // ===== SERVICE SELECTION =====
    selectService(serviceType) {
        this.selectedService = serviceType;
        this.showServiceDetails(serviceType);
    }

    showServiceDetails(serviceType) {
        // Hide service selection
        document.getElementById('serviceSelection').classList.add('hidden');

        // Show service details
        document.getElementById('serviceDetails').classList.remove('hidden');

        // Update service header
        this.updateServiceHeader(serviceType);

        // Generate service options
        this.generateServiceOptions(serviceType);

        // Generate quick amounts
        this.generateQuickAmounts(serviceType);

        // Update summary
        this.updateSummary();
    }

    updateServiceHeader(serviceType) {
        const serviceConfig = this.getServiceConfig(serviceType);

        // SECURITY FIX: Use safe DOM manipulation instead of innerHTML
        const iconContainer = document.getElementById('selectedServiceIcon');
        iconContainer.innerHTML = ''; // Clear existing content
        const icon = document.createElement('i');
        icon.className = serviceConfig.icon;
        iconContainer.appendChild(icon);
        iconContainer.className = `selected-service-icon ${serviceType}`;
        
        // Safe text content updates
        document.getElementById('selectedServiceTitle').textContent = serviceConfig.title;
        document.getElementById('selectedServiceDescription').textContent = serviceConfig.description;
    }

    generateServiceOptions(serviceType) {
        const optionsContainer = document.getElementById('serviceOptions');
        let optionsHTML = '';

        switch (serviceType) {
            case 'membership':
                optionsHTML = `
                    <div class="service-option" data-option="annual" data-amount="2000">
                        <h4>Annual Membership</h4>
                        <p>Full year membership with all benefits</p>
                        <span class="option-price">KSh 2,000</span>
                    </div>
                    <div class="service-option" data-option="semester" data-amount="1200">
                        <h4>Semester Membership</h4>
                        <p>One semester membership</p>
                        <span class="option-price">KSh 1,200</span>
                    </div>
                    <div class="service-option" data-option="monthly" data-amount="500">
                        <h4>Monthly Membership</h4>
                        <p>One month trial membership</p>
                        <span class="option-price">KSh 500</span>
                    </div>
                `;
                break;

            case 'events':
                optionsHTML = this.availableEvents.map(event => `
                    <div class="service-option" data-option="event-${this.escapeHtml(event.id)}" data-amount="${event.fee}" data-event-id="${this.escapeHtml(event.id)}">
                        <h4>${this.escapeHtml(event.title)}</h4>
                        <p>${this.escapeHtml(event.description)}</p>
                        <span class="option-price">KSh ${event.fee?.toLocaleString() || 'TBD'}</span>
                    </div>
                `).join('');
                break;

            case 'merchandise':
                optionsHTML = this.availableMerchandise.map(item => `
                    <div class="service-option" data-option="merch-${this.escapeHtml(item.id)}" data-amount="${item.price}" data-merch-id="${this.escapeHtml(item.id)}">
                        <h4>${this.escapeHtml(item.name)}</h4>
                        <p>${this.escapeHtml(item.description)}</p>
                        <span class="option-price">KSh ${item.price?.toLocaleString()}</span>
                    </div>
                `).join('');
                break;

            case 'donation':
                optionsHTML = `
                    <div class="service-option" data-option="general" data-amount="0">
                        <h4>General Donation</h4>
                        <p>Support club activities and initiatives</p>
                        <span class="option-price">Any amount</span>
                    </div>
                    <div class="service-option" data-option="scholarship" data-amount="0">
                        <h4>Scholarship Fund</h4>
                        <p>Help fund member scholarships and grants</p>
                        <span class="option-price">Any amount</span>
                    </div>
                    <div class="service-option" data-option="equipment" data-amount="0">
                        <h4>Equipment Fund</h4>
                        <p>Contribute to new equipment and tools</p>
                        <span class="option-price">Any amount</span>
                    </div>
                `;
                break;

            case 'projects':
                optionsHTML = `
                    <div class="service-option" data-option="innovation" data-amount="0">
                        <h4>Innovation Projects</h4>
                        <p>Fund student innovation and research projects</p>
                        <span class="option-price">KSh 100+</span>
                    </div>
                    <div class="service-option" data-option="startup" data-amount="0">
                        <h4>Startup Support</h4>
                        <p>Support member startup initiatives</p>
                        <span class="option-price">KSh 500+</span>
                    </div>
                `;
                break;

            case 'custom':
                optionsHTML = `
                    <div class="service-option" data-option="custom" data-amount="0">
                        <h4>Custom Payment</h4>
                        <p>Special fees or services as requested by club administration</p>
                        <span class="option-price">Custom amount</span>
                    </div>
                `;
                break;
        }

        optionsContainer.innerHTML = optionsHTML;

        // Add click handlers for options
        optionsContainer.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                optionsContainer.querySelectorAll('.service-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // Add active class to selected option
                option.classList.add('selected');

                // Update selected service data
                this.selectedServiceData = {
                    option: option.dataset.option,
                    amount: parseFloat(option.dataset.amount) || 0,
                    eventId: option.dataset.eventId,
                    merchId: option.dataset.merchId,
                    title: option.querySelector('h4').textContent,
                    description: option.querySelector('p').textContent
                };

                // Update amount if fixed
                if (this.selectedServiceData.amount > 0) {
                    document.getElementById('paymentAmount').value = this.selectedServiceData.amount;
                    this.updateAmount(this.selectedServiceData.amount);
                }

                this.updateSummary();
            });
        });
    }

    generateQuickAmounts(serviceType) {
        const quickAmountsContainer = document.getElementById('quickAmounts');
        let amounts = [];

        switch (serviceType) {
            case 'membership':
                amounts = [500, 1200, 2000];
                break;
            case 'events':
                amounts = [500, 1000, 1500];
                break;
            case 'donation':
            case 'projects':
                amounts = [100, 500, 1000];
                break;
            case 'merchandise':
                amounts = [600, 1500, 2500];
                break;
            case 'custom':
                amounts = [500, 1000, 2000];
                break;
            default:
                amounts = [500, 1000, 2000];
        }

        quickAmountsContainer.innerHTML = amounts.map(amount => `
            <button type="button" class="quick-amount-btn" data-amount="${amount}">
                KSh ${amount.toLocaleString()}
            </button>
        `).join('');

        // Add click handlers
        quickAmountsContainer.querySelectorAll('.quick-amount-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                quickAmountsContainer.querySelectorAll('.quick-amount-btn').forEach(b => {
                    b.classList.remove('active');
                });

                // Add active class to clicked button
                btn.classList.add('active');

                // Update amount
                const amount = parseFloat(btn.dataset.amount);
                document.getElementById('paymentAmount').value = amount;
                this.updateAmount(amount);
            });
        });
    }

    updateAmount(amount) {
        this.currentAmount = amount;
        this.updateSummary();
    }

    updateSummary() {
        const serviceConfig = this.getServiceConfig(this.selectedService);

        document.getElementById('summaryService').textContent = serviceConfig.title;
        document.getElementById('summaryItem').textContent = this.selectedServiceData?.title || 'Not selected';
        document.getElementById('summaryTotal').textContent = `KSh ${this.currentAmount.toLocaleString()}`;

        // Update button amount
        const btnAmount = document.getElementById('btnAmount');
        if (btnAmount) {
            btnAmount.textContent = `KSh ${this.currentAmount.toLocaleString()}`;
        }

        // Update progress and enable/disable payment button
        this.updateProgress();
    }

    updateProgress() {
        const steps = document.querySelectorAll('.progress-step');
        const paymentBtn = document.getElementById('paymentSubmitBtn');
        const instructions = document.getElementById('instructionsList');

        // Reset all steps
        steps.forEach(step => {
            step.classList.remove('completed', 'active');
        });

        let currentStep = 1;
        let isComplete = false;
        let nextInstructions = [];

        // Step 1: Service selected (always completed when in details view)
        if (steps[0]) steps[0].classList.add('completed');
        currentStep = 2;

        // Step 2: Service option selected
        if (this.selectedServiceData) {
            if (steps[1]) steps[1].classList.add('completed');
            currentStep = 3;
        } else {
            if (steps[1]) steps[1].classList.add('active');
            nextInstructions.push('Select a service option above');
        }

        // Step 3: Amount entered
        if (this.currentAmount > 0 && this.selectedServiceData) {
            if (steps[2]) steps[2].classList.add('completed');
            currentStep = 4;
        } else if (this.selectedServiceData) {
            if (steps[2]) steps[2].classList.add('active');
            nextInstructions.push('Enter the payment amount');
        }

        // Step 4: Payment details (check based on selected method)
        let paymentDetailsComplete = false;
        if (this.selectedPaymentMethod === 'mpesa') {
            const phoneInput = document.getElementById('phoneNumber');
            try {
                paymentDetailsComplete = !!phoneInput?.value && this.sanitizePhoneNumber(phoneInput.value).length === 12;
            } catch {
                paymentDetailsComplete = false;
            }
        } else if (this.selectedPaymentMethod === 'card') {
            const cardNumber = document.getElementById('cardNumber');
            const expiry = document.getElementById('expiryDate');
            const cvv = document.getElementById('cvv');
            paymentDetailsComplete = cardNumber?.value.length >= 16 &&
                expiry?.value.length >= 5 &&
                cvv?.value.length >= 3;
        } else if (this.selectedPaymentMethod === 'bank') {
            paymentDetailsComplete = true; // Bank transfer doesn't require form input
        }

        if (paymentDetailsComplete && this.currentAmount > 0 && this.selectedServiceData) {
            if (steps[3]) steps[3].classList.add('completed');
            currentStep = 5;
        } else if (this.currentAmount > 0 && this.selectedServiceData) {
            if (steps[3]) steps[3].classList.add('active');
            if (this.selectedPaymentMethod === 'mpesa') {
                nextInstructions.push('Enter your M-Pesa phone number');
            } else if (this.selectedPaymentMethod === 'card') {
                nextInstructions.push('Fill in your card details');
            }
        }

        // Step 5: Ready for payment
        if (paymentDetailsComplete && this.currentAmount > 0 && this.selectedServiceData) {
            if (steps[4]) steps[4].classList.add('active');
            isComplete = true;
            nextInstructions = ['Click the payment button to proceed with STK push'];
        }

        // Update payment button
        if (paymentBtn) {
            paymentBtn.disabled = !isComplete;
            if (isComplete) {
                paymentBtn.querySelector('.btn-text').textContent = 'Send STK Push';
            } else {
                paymentBtn.querySelector('.btn-text').textContent = 'Complete Steps Above';
            }
        }

        // Update instructions
        if (instructions) {
            if (nextInstructions.length === 0) {
                nextInstructions = ['All steps completed! Ready to process payment.'];
            }

            // Safe DOM manipulation without HTML parsing
            instructions.replaceChildren(
                ...nextInstructions.map(text => {
                    const li = document.createElement('li');
                    li.textContent = text;
                    return li;
                })
            );
        }
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;

        // Update UI and accessibility attributes
        document.querySelectorAll('.payment-method').forEach(m => {
            const isSelected = m.dataset.method === method;
            m.classList.toggle('active', isSelected);
            m.setAttribute('aria-checked', isSelected.toString());
        });

        // Show/hide payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.add('hidden');
        });
        document.getElementById(`${method}Form`).classList.remove('hidden');

        // Update progress
        this.updateProgress();
    }

    // ===== PAYMENT PROCESSING =====
    async handlePayment(e) {
        e.preventDefault();

        try {
            // Security checks
            this.checkRateLimit();

            if (!this.selectedServiceData) {
                throw new Error('Please select a service option');
            }

            if (this.currentAmount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            const formData = new FormData(e.target);

            // Validate based on selected payment method
            let phoneNumber = '';
            if (this.selectedPaymentMethod === 'mpesa') {
                const phoneInput = formData.get('phone');
                if (!phoneInput || phoneInput.trim() === '') {
                    throw new Error('Please enter your M-Pesa phone number');
                }
                phoneNumber = this.sanitizePhoneNumber(phoneInput);
            }

            const amount = this.validateAmount(this.currentAmount);

            const paymentData = {
                service: this.selectedService,
                serviceData: this.selectedServiceData,
                method: this.selectedPaymentMethod,
                amount: amount,
                phoneNumber: phoneNumber,
                userId: this.getCurrentUserId(),
                description: this.generatePaymentDescription(),
                timestamp: Date.now()
            };

            // Add specific IDs if available
            if (this.selectedServiceData.eventId) {
                paymentData.eventId = this.selectedServiceData.eventId;
            }

            // Show loading state
            this.setPaymentButtonLoading(true);

            let response;

            if (this.selectedPaymentMethod === 'mpesa') {
                response = await this.processMpesaPayment(paymentData);
            } else {
                response = await this.processOtherPayment(paymentData);
            }

            if (response.success) {
                if (this.selectedPaymentMethod === 'mpesa') {
                    this.showProcessingSection(response.data);
                    this.pollPaymentStatus(response.data.paymentId);
                } else {
                    this.showSuccessSection(response);
                }
            } else {
                throw new Error(response.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            this.showMessage(error.message || 'Payment failed. Please try again.', 'error');
        } finally {
            this.setPaymentButtonLoading(false);
        }
    }

    async processMpesaPayment(paymentData) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch('/api/payment-service/lipana/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(paymentData),
                signal: controller.signal
            });

            clearTimeout(timeout);
            return await response.json();
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    async processOtherPayment(paymentData) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(paymentData),
                signal: controller.signal
            });

            clearTimeout(timeout);
            return await response.json();
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    showProcessingSection(paymentData) {
        // Hide service details
        document.getElementById('serviceDetails').classList.add('hidden');

        // Show processing section
        document.getElementById('processingSection').classList.remove('hidden');

        // Update processing details
        document.getElementById('transactionRef').textContent = paymentData.transactionRef || paymentData.checkoutRequestId;
        document.getElementById('processingAmount').textContent = `KSh ${this.currentAmount.toLocaleString()}`;

        this.showMessage('M-Pesa prompt sent to your phone!', 'info');
    }

    async pollPaymentStatus(paymentId) {
        const maxAttempts = 30; // 5 minutes
        let attempts = 0;

        const checkStatus = async () => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(`/api/payment-service/status/${paymentId}`, {
                    signal: controller.signal
                });
                clearTimeout(timeout);

                const data = await response.json();

                if (data.status === 'completed') {
                    this.showSuccessSection({
                        transactionId: data.transactionReference,
                        amount: data.amount,
                        service: this.selectedServiceData.title
                    });
                    return;
                } else if (data.status === 'failed') {
                    this.showPaymentError('Payment failed. Please try again.');
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 10000); // Check every 10 seconds
                } else {
                    this.showPaymentTimeout();
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 10000);
                } else {
                    this.showPaymentError('Unable to verify payment status. Please contact support.');
                }
            }
        };

        setTimeout(checkStatus, 5000); // Start checking after 5 seconds
    }

    showSuccessSection(response) {
        // Hide other sections
        document.getElementById('serviceDetails').classList.add('hidden');
        document.getElementById('processingSection').classList.add('hidden');

        // Show success section
        document.getElementById('successSection').classList.remove('hidden');

        // Update success details
        document.getElementById('successTransactionId').textContent = response.transactionId || 'N/A';
        document.getElementById('successAmount').textContent = `KSh ${this.currentAmount.toLocaleString()}`;
        document.getElementById('successService').textContent = this.selectedServiceData?.title || 'Payment';

        this.showMessage('Payment successful!', 'success');

        // Clear sensitive data after success
        this.clearSensitiveData();
    }

    showPaymentError(message) {
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.innerHTML = `
                <i class="fas fa-times-circle text-error"></i>
                <span class="text-error">${this.escapeHtml(message)}</span>
            `;
        }
        this.showMessage(message, 'error');
    }

    showPaymentTimeout() {
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.innerHTML = `
                <i class="fas fa-clock text-warning"></i>
                <span class="text-warning">Payment verification timed out. Please check your M-Pesa messages.</span>
            `;
        }
        this.showMessage('Payment verification timed out', 'warning');
    }

    showServiceSelection() {
        // Show service selection
        document.getElementById('serviceSelection').classList.remove('hidden');

        // Hide other sections
        document.getElementById('serviceDetails').classList.add('hidden');
        document.getElementById('processingSection').classList.add('hidden');
        document.getElementById('successSection').classList.add('hidden');

        // Reset state
        this.selectedService = null;
        this.selectedServiceData = null;
        this.currentAmount = 0;
        this.paymentAttempts = 0; // Reset rate limiting
    }

    setPaymentButtonLoading(loading) {
        const submitBtn = document.getElementById('paymentSubmitBtn');
        if (submitBtn) {
            if (loading) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Processing Payment...</span>';
                submitBtn.disabled = true;
            } else {
                submitBtn.innerHTML = `
                    <i class="fas fa-lock"></i> 
                    <span class="btn-text">Send STK Push</span>
                    <span class="btn-amount" id="btnAmount">KSh ${this.currentAmount.toLocaleString()}</span>
                `;
                // Don't automatically enable - let updateProgress handle it
                this.updateProgress();
            }
        }
    }

    // ===== UTILITY METHODS =====
    generatePaymentDescription() {
        if (!this.selectedServiceData) return 'JKUAT Innovation Club Payment';

        return `${this.selectedServiceData.title} - JKUAT Innovation Club`;
    }

    getCurrentUserId() {
        // Try to get user ID from various sources
        if (window.jkuatApp?.user?.id) {
            return window.jkuatApp.user.id;
        }

        // Fallback for development
        return '550e8400-e29b-41d4-a716-446655440000';
    }

    getServiceConfig(serviceType) {
        const configs = {
            membership: {
                title: 'Membership Fee',
                description: 'Annual or semester club membership registration',
                icon: 'fas fa-id-card'
            },
            events: {
                title: 'Event Registration',
                description: 'Pay for workshops, hackathons, and club events',
                icon: 'fas fa-calendar-alt'
            },
            donation: {
                title: 'Donation',
                description: 'Support club activities and initiatives',
                icon: 'fas fa-heart'
            },
            merchandise: {
                title: 'Merchandise',
                description: 'Club t-shirts, hoodies, and branded items',
                icon: 'fas fa-tshirt'
            },
            projects: {
                title: 'Project Funding',
                description: 'Contribute to innovation projects and research',
                icon: 'fas fa-lightbulb'
            },
            custom: {
                title: 'Other Services',
                description: 'Custom payments for special services or fees',
                icon: 'fas fa-plus-circle'
            }
        };

        return configs[serviceType] || configs.custom;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        if (window.notifications) {
            window.notifications.show(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Enhanced Payment Page DOM loaded');
    try {
        window.paymentPage = new PaymentPage();
        console.log('✅ Enhanced PaymentPage instance created successfully');
    } catch (error) {
        console.error('❌ Error creating Enhanced PaymentPage instance:', error);
    }
});

// Make available globally
window.PaymentPage = PaymentPage;