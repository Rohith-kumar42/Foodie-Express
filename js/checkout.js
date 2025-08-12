// Checkout page functionality
let checkoutData = null;
let appliedDiscount = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutData();
    loadOrderItems();
    calculateTotals();
});

function loadCheckoutData() {
    const data = localStorage.getItem('checkoutData');
    if (!data) {
        // Redirect to home if no checkout data
        window.location.href = 'index.html';
        return;
    }
    
    checkoutData = JSON.parse(data);
}

function loadOrderItems() {
    if (!checkoutData || !checkoutData.items) return;
    
    const orderItems = document.getElementById('orderItems');
    const summaryDetails = document.getElementById('summaryDetails');
    
    // Load order items in main section
    orderItems.innerHTML = checkoutData.items.map(item => `
        <div class="order-item">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price} each</p>
            </div>
            <div class="item-quantity">
                <span class="quantity-display">Qty: ${item.quantity}</span>
                <span class="item-total">₹${item.price * item.quantity}</span>
            </div>
        </div>
    `).join('');
    
    // Load summary items in sidebar
    summaryDetails.innerHTML = checkoutData.items.map(item => `
        <div class="summary-item">
            <div>
                <h4>${item.name}</h4>
                <p>₹${item.price} each</p>
            </div>
            <div style="text-align: right;">
                <div class="summary-quantity">×${item.quantity}</div>
                <div class="summary-price">₹${item.price * item.quantity}</div>
            </div>
        </div>
    `).join('');
}

function calculateTotals() {
    if (!checkoutData) return;
    
    const subtotal = checkoutData.total;
    const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above ₹500
    const taxes = Math.round(subtotal * 0.05); // 5% tax
    const discount = appliedDiscount;
    const finalTotal = subtotal + deliveryFee + taxes - discount;
    
    // Update UI
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('deliveryFee').textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    document.getElementById('taxes').textContent = `₹${taxes}`;
    document.getElementById('discount').textContent = `-₹${discount}`;
    document.getElementById('finalTotal').textContent = `₹${finalTotal}`;
    
    // Show/hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discount > 0) {
        discountRow.style.display = 'flex';
    } else {
        discountRow.style.display = 'none';
    }
}

function applyPromoCode() {
    const promoCode = document.getElementById('promoCode').value.trim().toLowerCase();
    const validCodes = {
        'welcome10': 0.10, // 10% discount
        'save50': 50,      // ₹50 off
        'first20': 0.20,   // 20% discount
        'foodie15': 0.15   // 15% discount
    };
    
    if (validCodes[promoCode]) {
        const discountValue = validCodes[promoCode];
        
        if (discountValue < 1) {
            // Percentage discount
            appliedDiscount = Math.round(checkoutData.total * discountValue);
        } else {
            // Fixed amount discount
            appliedDiscount = discountValue;
        }
        
        calculateTotals();
        showMessage('Promo code applied successfully!', 'success');
        document.getElementById('promoCode').disabled = true;
    } else {
        showMessage('Invalid promo code. Try: WELCOME10, SAVE50, FIRST20, FOODIE15', 'error');
    }
}

function placeOrder() {
    // Validate payment method
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
        showMessage('Please select a payment method', 'error');
        return;
    }
    
    // Generate order ID
    const orderId = 'FE' + Date.now().toString().slice(-6);
    
    // Create order object
    const order = {
        id: orderId,
        items: checkoutData.items,
        subtotal: checkoutData.total,
        deliveryFee: checkoutData.total > 500 ? 0 : 40,
        taxes: Math.round(checkoutData.total * 0.05),
        discount: appliedDiscount,
        total: calculateFinalTotal(),
        paymentMethod: selectedPayment.value,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart and checkout data
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');
    
    // Show confirmation modal
    document.getElementById('orderId').textContent = '#' + orderId;
    document.getElementById('confirmationModal').classList.add('active');
}

function calculateFinalTotal() {
    const subtotal = checkoutData.total;
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const taxes = Math.round(subtotal * 0.05);
    return subtotal + deliveryFee + taxes - appliedDiscount;
}

function trackOrder() {
    // In a real app, this would redirect to order tracking page
    showMessage('Order tracking feature coming soon!', 'info');
    goHome();
}

function goHome() {
    window.location.href = 'index.html';
}

function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    
    let icon = 'fas fa-info-circle';
    let color = '#3498db';
    
    switch(type) {
        case 'success':
            icon = 'fas fa-check-circle';
            color = '#48c479';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            color = '#e74c3c';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            color = '#f39c12';
            break;
    }
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}