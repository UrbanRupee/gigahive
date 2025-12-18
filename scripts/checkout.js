// Import Payin config
import PAYIN_CONFIG from './payin-config.js';

// Generate unique 20-character order ID (alphanumeric only)
function generateOrderId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderId = '';
    for (let i = 0; i < 20; i++) {
        orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return orderId;
}

// Get total amount from cart
function getCartTotal() {
    const cartData = JSON.parse(localStorage.getItem("atc")) || [];
    let total = 0;
    cartData.forEach((item) => {
        let price = typeof item.prodprice === 'string' 
            ? parseFloat(item.prodprice.replace(/[\u20B9₹$,]/g, '')) 
            : parseFloat(item.prodprice) || 0;
        let quantity = parseInt(item.quantity) || 1;
        total += price * quantity;
    });
    return total.toFixed(2);
}

// Validate form fields
function validateCheckoutForm() {
    const email = document.getElementById('checkout-email').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const pincode = document.getElementById('pincode').value.trim();

    if (!email) {
        alert('Please enter your email address');
        return false;
    }

    if (!firstName || !lastName) {
        alert('Please enter your full name');
        return false;
    }

    if (!phone) {
        alert('Please enter your phone number');
        return false;
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return false;
    }

    if (!address || !city || !state || !pincode) {
        alert('Please fill in all shipping address fields');
        return false;
    }

    return true;
}

// Initiate Payin payment
async function initiatePayin() {
    // Validate form
    if (!validateCheckoutForm()) {
        return;
    }

    // Get form data
    const email = document.getElementById('checkout-email').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Get cart total
    const amount = getCartTotal();
    
    if (parseFloat(amount) <= 0) {
        alert('Your cart is empty. Please add items to cart.');
        window.location.href = './cart.html';
        return;
    }

    // Generate order ID
    const orderId = generateOrderId();
    
    // Store order details in localStorage for callback
    const orderData = {
        orderId: orderId,
        amount: amount,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // Prepare API request
    const requestData = {
        token: PAYIN_CONFIG.API_TOKEN,
        userid: PAYIN_CONFIG.USER_ID,
        amount: amount,
        mobile: phone,
        name: fullName,
        orderid: orderId,
        callback_url: PAYIN_CONFIG.CALLBACK_URL
    };

    // Show loading state
    const orderButton = document.querySelector("#tap");
    const originalText = orderButton.innerText;
    orderButton.innerText = "Processing...";
    orderButton.disabled = true;

    try {
        console.log('=== PAYIN API REQUEST ===');
        console.log('API URL:', `${PAYIN_CONFIG.API_BASE_URL}/initiate`);
        console.log('Request Data:', requestData);
        console.log('Request JSON:', JSON.stringify(requestData, null, 2));
        console.log('Amount:', amount, '(type:', typeof amount, ')');
        console.log('Order ID:', orderId);
        console.log('Phone:', phone);
        console.log('Name:', fullName);
        console.log('========================');
        
        // Call Payin API
        const response = await fetch(`${PAYIN_CONFIG.API_BASE_URL}/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        console.log('=== PAYIN API RESPONSE ===');
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Response text (raw):', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            console.error('Response text:', responseText);
            throw new Error('Invalid JSON response from API');
        }
        
        console.log('Response JSON:', result);
        console.log('Full response JSON:', JSON.stringify(result, null, 2));
        console.log('Response keys:', Object.keys(result));
        console.log('URL value:', result.url);
        console.log('URL type:', typeof result.url);
        console.log('========================');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (result.status === true) {
            // Payment initiated successfully
            // Just paste whatever URL comes from the server response - no logic, no construction
            let paymentUrl = result.url;
            
            console.log('URL from API response (result.url):', paymentUrl);
            console.log('Type:', typeof paymentUrl);
            console.log('Full response:', JSON.stringify(result, null, 2));
            
            // Store response data
            localStorage.setItem('orderId', orderId);
            localStorage.setItem('paymentResponse', JSON.stringify(result));
            
            // Store the URL exactly as it comes from API (even if null)
            if (paymentUrl !== undefined) {
                localStorage.setItem('paymentUrl', String(paymentUrl));
                console.log('Stored payment URL:', paymentUrl);
            } else {
                localStorage.setItem('paymentUrl', 'null');
                console.log('No URL field in response');
            }
            
            // Always redirect to payment page
            console.log('Redirecting to payment page...');
            window.location.href = './payment.html';
        } else {
            // Payment initiation failed
            const errorMsg = result.message || 'Unknown error';
            console.error('Payment initiation failed:', errorMsg);
            alert('Payment initiation failed: ' + errorMsg);
            orderButton.innerText = originalText;
            orderButton.disabled = false;
        }
    } catch (error) {
        console.error('Payment initiation error:', error);
        alert('An error occurred while initiating payment: ' + error.message + '. Please check console for details.');
        orderButton.innerText = originalText;
        orderButton.disabled = false;
    }
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    
    const orderButton = document.querySelector("#tap");
    
    if (orderButton) {
        console.log('Continue to Payment button found');
        orderButton.addEventListener("click", function(e) {
            e.preventDefault();
            console.log('Continue to Payment button clicked');
            initiatePayin();
        });
    } else {
        console.error('Continue to Payment button not found!');
    }

    // Update step indicator
    const steps = document.querySelectorAll('.steps ul li');
    if (steps.length >= 2) {
        steps[0].classList.add('active-step');
        steps[1].classList.remove('active-step');
        steps[2].classList.remove('active-step');
    }
    
    // Check if config is loaded
    console.log('Payin Config:', PAYIN_CONFIG);
});
