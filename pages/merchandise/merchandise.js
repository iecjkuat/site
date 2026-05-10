// Merchandise Store JavaScript

// Product Data
const products = [
    {
        id: 1,
        name: "IEC Wristband",
        description: "Comfortable silicone wristband with embossed IEC logo. Perfect for daily wear and showing your club pride.",
        price: 150,
        image: null, // Will show icon placeholder
        icon: "fas fa-hand-paper",
        badge: "Popular",
        colors: [
            { name: "Blue", value: "#0ea5e9" },
            { name: "Green", value: "#10b981" },
            { name: "Black", value: "#1f2937" },
            { name: "White", value: "#ffffff" }
        ],
        sizes: ["S", "M", "L"],
        category: "accessories"
    },
    {
        id: 2,
        name: "IEC T-Shirt",
        description: "Premium cotton t-shirt with modern IEC design. Comfortable fit for casual wear and club events.",
        price: 800,
        image: null,
        icon: "fas fa-tshirt",
        badge: "Best Seller",
        colors: [
            { name: "Navy Blue", value: "#1e40af" },
            { name: "White", value: "#ffffff" },
            { name: "Gray", value: "#6b7280" },
            { name: "Black", value: "#1f2937" }
        ],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "apparel"
    },
    {
        id: 3,
        name: "IEC Polo Shirt",
        description: "Professional polo shirt with embroidered IEC logo. Perfect for formal events and presentations.",
        price: 1200,
        image: null,
        icon: "fas fa-user-tie",
        badge: "Premium",
        colors: [
            { name: "Navy Blue", value: "#1e40af" },
            { name: "White", value: "#ffffff" },
            { name: "Light Blue", value: "#3b82f6" },
            { name: "Gray", value: "#6b7280" }
        ],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "apparel"
    }
];

// Cart Management
let cart = [];

// Initialize cart from localStorage
function initializeCart() {
    try {
        const savedCart = localStorage.getItem('iecCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('iecCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Merchandise page loaded');
    console.log('Products data:', products);
    
    // Check if elements exist
    const heroSection = document.querySelector('.merchandise-hero');
    const productsSection = document.querySelector('.products-section');
    const productsGrid = document.getElementById('productsGrid');
    
    console.log('Hero section found:', !!heroSection);
    console.log('Products section found:', !!productsSection);
    console.log('Products grid found:', !!productsGrid);
    
    // Initialize cart first
    initializeCart();
    
    // Then render everything
    renderProducts();
    updateCartUI();
    updateFloatingCartCount();
    
    console.log('Initialization complete');
    
    // Force show sections if they're hidden
    if (heroSection) {
        heroSection.style.display = 'block';
        heroSection.style.visibility = 'visible';
        heroSection.style.opacity = '1';
    }
    
    if (productsSection) {
        productsSection.style.display = 'block';
        productsSection.style.visibility = 'visible';
        productsSection.style.opacity = '1';
    }
});

// Render products
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.error('Products grid element not found');
        return;
    }
    
    console.log('Rendering products to grid');
    grid.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
    
    console.log('Products rendered successfully');
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.name}">` : 
                `<i class="${product.icon}"></i>`
            }
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">KES ${product.price.toLocaleString()}</div>
            
            <div class="product-options">
                ${product.colors ? `
                    <div class="option-group">
                        <label class="option-label">Color:</label>
                        <div class="color-options">
                            ${product.colors.map((color, index) => `
                                <div class="color-option ${index === 0 ? 'selected' : ''}" 
                                     style="background-color: ${color.value}; ${color.value === '#ffffff' ? 'border: 2px solid #e5e7eb;' : ''}"
                                     data-color="${color.name}"
                                     onclick="selectColor(${product.id}, '${color.name}', this)">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${product.sizes ? `
                    <div class="option-group">
                        <label class="option-label">Size:</label>
                        <div class="size-options">
                            ${product.sizes.map((size, index) => `
                                <div class="size-option ${index === 0 ? 'selected' : ''}" 
                                     data-size="${size}"
                                     onclick="selectSize(${product.id}, '${size}', this)">
                                    ${size}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="quantity-selector">
                    <label class="option-label">Quantity:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
                        <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="10" readonly>
                        <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                    </div>
                </div>
            </div>
            
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i>
                Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Select color
function selectColor(productId, colorName, element) {
    const colorOptions = element.parentElement.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    element.classList.add('selected');
}

// Select size
function selectSize(productId, size, element) {
    const sizeOptions = element.parentElement.querySelectorAll('.size-option');
    sizeOptions.forEach(option => option.classList.remove('selected'));
    element.classList.add('selected');
}

// Change quantity
function changeQuantity(productId, change) {
    const input = document.getElementById(`qty-${productId}`);
    let newValue = parseInt(input.value) + change;
    if (newValue >= 1 && newValue <= 10) {
        input.value = newValue;
    }
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const productCard = document.querySelector(`[onclick="addToCart(${productId})"]`).closest('.product-card');
    
    // Get selected options
    const selectedColor = productCard.querySelector('.color-option.selected')?.dataset.color || null;
    const selectedSize = productCard.querySelector('.size-option.selected')?.dataset.size || null;
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

    // Create cart item
    const cartItem = {
        id: Date.now(), // Unique cart item ID
        productId: productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        icon: product.icon
    };

    // Check if same item already exists
    const existingItemIndex = cart.findIndex(item => 
        item.productId === productId && 
        item.color === selectedColor && 
        item.size === selectedSize
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    // Save to localStorage
    saveCart();

    // Update UI
    updateCartUI();
    updateFloatingCartCount();

    // Show success feedback
    showAddToCartFeedback(productCard);
}

// Show add to cart feedback
function showAddToCartFeedback(productCard) {
    const button = productCard.querySelector('.add-to-cart-btn');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = '#10b981';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '#0ea5e9';
    }, 1500);
}

// Toggle cart sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Update cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cart.length === 0) {
        // Show empty state
        cartItems.innerHTML = `
            <div class="cart-empty" id="cartEmpty">
                <div class="cart-empty-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h4>Your cart is empty</h4>
                <p>Looks like you haven't added any items to your cart yet. Start shopping to fill it up!</p>
                <button type="button" class="continue-shopping-btn" onclick="toggleCart()">
                    <i class="fas fa-arrow-left"></i>
                    Continue Shopping
                </button>
            </div>
        `;
        cartTotal.textContent = '0';
        checkoutBtn.disabled = true;
        return;
    }

    // Hide empty state and show cart items
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <i class="${item.icon}"></i>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">KES ${item.price.toLocaleString()} each</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
                </div>
                ${item.color || item.size ? `
                    <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">
                        ${item.color ? `Color: ${item.color}` : ''}
                        ${item.color && item.size ? ' • ' : ''}
                        ${item.size ? `Size: ${item.size}` : ''}
                    </div>
                ` : ''}
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remove item">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString();
    checkoutBtn.disabled = false;
}

// Update cart item quantity
function updateCartItemQuantity(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCartUI();
        updateFloatingCartCount();
    }
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
    updateFloatingCartCount();
}

// Update floating cart count
function updateFloatingCartCount() {
    const countElement = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    countElement.textContent = totalItems;
    if (totalItems > 0) {
        countElement.classList.remove('hidden');
    } else {
        countElement.classList.add('hidden');
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) return;
    
    // Populate order summary
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    
    orderItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-details">
                <div class="order-item-name">${item.name} (${item.quantity}x)</div>
                <div class="order-item-options">
                    ${item.color ? `Color: ${item.color}` : ''}
                    ${item.color && item.size ? ' • ' : ''}
                    ${item.size ? `Size: ${item.size}` : ''}
                </div>
            </div>
            <div class="order-item-price">KES ${(item.price * item.quantity).toLocaleString()}</div>
        `;
        orderItems.appendChild(orderItem);
    });
    
    orderTotal.textContent = total.toLocaleString();
    
    // Show checkout modal
    document.getElementById('checkoutModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('open');
    document.body.style.overflow = '';
}

// Submit order
function submitOrder(event) {
    event.preventDefault();
    
    const formData = {
        customerName: document.getElementById('customerName').value,
        customerRegNo: document.getElementById('customerRegNo').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerEmail: document.getElementById('customerEmail').value,
        deliveryLocation: document.getElementById('deliveryLocation').value,
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // Validate phone number
    const phoneRegex = /^(0|\+254|254)?[17]\d{8}$/;
    if (!phoneRegex.test(formData.customerPhone)) {
        alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Order...';
    
    // Create order first
    fetch('/api/v1/merchandise/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Order created, now initiate M-Pesa payment
            initiatePayment(data.orderId, formData.customerPhone, formData.totalAmount);
        } else {
            throw new Error(data.error || 'Failed to create order');
        }
    })
    .catch(error => {
        console.error('Order creation error:', error);
        alert('Failed to create order: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

// Initiate M-Pesa payment
function initiatePayment(orderId, phoneNumber, amount) {
    const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initiating Payment...';
    
    fetch('/api/v1/payments/mpesa/stkpush', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phoneNumber: phoneNumber,
            amount: amount,
            orderId: orderId,
            accountReference: `IEC-${orderId}`,
            transactionDesc: `Payment for IEC Merchandise Order`
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // STK Push sent successfully
            showPaymentPending(data.checkoutRequestId, orderId);
        } else {
            throw new Error(data.error || 'Payment initiation failed');
        }
    })
    .catch(error => {
        console.error('Payment initiation error:', error);
        alert('Payment initiation failed: ' + error.message);
        const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Place Order';
    });
}

// Show payment pending modal
function showPaymentPending(checkoutRequestId, orderId) {
    // Close checkout modal
    closeCheckoutModal();
    
    // Show payment pending modal
    const modal = document.createElement('div');
    modal.className = 'payment-pending-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="payment-pending-content">
                <div class="payment-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3>Payment Request Sent</h3>
                <p>Please check your phone and enter your M-Pesa PIN to complete the payment.</p>
                <div class="payment-amount">
                    <strong>Amount: KES ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</strong>
                </div>
                <div class="payment-status" id="paymentStatus">
                    <i class="fas fa-spinner fa-spin"></i> Waiting for payment...
                </div>
                <div class="payment-actions">
                    <button type="button" class="btn btn-secondary" onclick="cancelPayment()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Start checking payment status
    checkPaymentStatus(checkoutRequestId, orderId);
}

// Check payment status
function checkPaymentStatus(checkoutRequestId, orderId, attempts = 0) {
    const maxAttempts = 60; // Check for 5 minutes (60 * 5 seconds)
    
    if (attempts >= maxAttempts) {
        showPaymentTimeout();
        return;
    }
    
    fetch(`/api/v1/payments/mpesa/status/${checkoutRequestId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const transaction = data.transaction;
                
                if (transaction.status === 'completed') {
                    showPaymentSuccess(orderId, transaction.mpesaReceipt);
                } else if (transaction.status === 'failed') {
                    showPaymentFailed(transaction.resultDesc);
                } else if (transaction.status === 'timeout') {
                    showPaymentTimeout();
                } else {
                    // Still pending, check again in 5 seconds
                    setTimeout(() => {
                        checkPaymentStatus(checkoutRequestId, orderId, attempts + 1);
                    }, 5000);
                }
            } else {
                // Transaction not found yet, check again
                setTimeout(() => {
                    checkPaymentStatus(checkoutRequestId, orderId, attempts + 1);
                }, 5000);
            }
        })
        .catch(error => {
            console.error('Payment status check error:', error);
            setTimeout(() => {
                checkPaymentStatus(checkoutRequestId, orderId, attempts + 1);
            }, 5000);
        });
}

// Show payment success
function showPaymentSuccess(orderId, mpesaReceipt) {
    const modal = document.querySelector('.payment-pending-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Payment Successful!</h3>
                    <p>Your payment has been received and your order is being processed.</p>
                    <div class="payment-details">
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>M-Pesa Receipt:</strong> ${mpesaReceipt}</p>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="closePaymentModal()">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        updateFloatingCartCount();
    }
}

// Show payment failed
function showPaymentFailed(reason) {
    const modal = document.querySelector('.payment-pending-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="error-content">
                    <div class="error-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h3>Payment Failed</h3>
                    <p>${reason || 'The payment could not be processed. Please try again.'}</p>
                    <div class="payment-actions">
                        <button type="button" class="btn btn-primary" onclick="retryPayment()">
                            Try Again
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="closePaymentModal()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Show payment timeout
function showPaymentTimeout() {
    const modal = document.querySelector('.payment-pending-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="timeout-content">
                    <div class="timeout-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3>Payment Timeout</h3>
                    <p>The payment request has timed out. Please try again.</p>
                    <div class="payment-actions">
                        <button type="button" class="btn btn-primary" onclick="retryPayment()">
                            Try Again
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="closePaymentModal()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Close payment modal
function closePaymentModal() {
    const modal = document.querySelector('.payment-pending-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Cancel payment
function cancelPayment() {
    closePaymentModal();
}

// Retry payment
function retryPayment() {
    closePaymentModal();
    // Reopen checkout modal
    checkout();
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('open');
    document.body.style.overflow = '';
}

// Product modal functions (for future expansion)
function openProductModal(productId) {
    // Implementation for detailed product view
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const modals = ['productModal', 'checkoutModal', 'successModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
});

// Handle escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.product-modal.open, .checkout-modal.open, .success-modal.open');
        openModals.forEach(modal => {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        });
        
        if (document.getElementById('cartSidebar').classList.contains('open')) {
            toggleCart();
        }
    }
});