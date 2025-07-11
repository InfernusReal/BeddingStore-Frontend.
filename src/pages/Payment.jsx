import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';
import './Payment.css';

function Payment() {
  const [formData, setFormData] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get data from sessionStorage
    const savedFormData = JSON.parse(sessionStorage.getItem('formData') || '{}');
    const savedCartItems = JSON.parse(sessionStorage.getItem('finalCart') || '[]');
    const savedTotalPrice = parseFloat(sessionStorage.getItem('finalTotal') || '0');

    // If no data, show error message
    if (!savedFormData.name || savedCartItems.length === 0) {
      console.log('No valid data found');
      alert('No order data found. Please start the checkout process again.');
      window.close(); // Close the tab if opened in new tab
      return;
    }

    console.log('Payment data loaded:', { savedFormData, savedCartItems, savedTotalPrice });
    setFormData(savedFormData);
    setCartItems(savedCartItems);
    setTotalPrice(savedTotalPrice);
    setDataLoaded(true);
  }, []);

  const handlePaymentMethodChange = (method) => {
    setSelectedPayment(method);
  };

  const handleConfirmOrder = async () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    setLoading(true);

    try {
      if (selectedPayment === 'cod') {
        // For Cash on Delivery - send admin notification only
        await sendAdminNotification();
        
        // Store order in database
        await createOrder('cod', 'N/A');
        
        // Clear cart and redirect to success
        clearCartAndRedirect('cod');
      } else if (selectedPayment === 'easypaisa') {
        // For EasyPaisa - store pending order first (NO EMAIL YET)
        const orderId = await createOrder('easypaisa', 'pending');
        
        // Store order ID for tracking
        sessionStorage.setItem('pendingOrderId', orderId);
        
        // Clear cart for EasyPaisa orders too
        sessionStorage.removeItem('cartItems');
        sessionStorage.removeItem('totalCartPrice');
        sessionStorage.removeItem('buyNowProduct');
        sessionStorage.removeItem('totalPrice');
        localStorage.removeItem('cart');
        
        // Redirect to waiting screen in same tab
        navigate('/payment-success', { state: { paymentMethod: 'easypaisa', orderId } });
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendAdminNotification = async () => {
    const emailData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      products: cartItems,
      totalPrice: totalPrice,
      purpose: 'order'
    };

    const response = await fetch(getApiUrl('/api/send-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send admin notification');
    }
  };

  const createOrder = async (paymentMethod, paymentId) => {
    const orderData = {
      buyer_name: formData.name,
      buyer_email: formData.email,
      buyer_phone: formData.phone,
      buyer_address: formData.address,
      payment_method: paymentMethod,
      payment_id: paymentId,
      total_amount: totalPrice,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      items: cartItems.map(item => ({
        product_id: item.id || item.product_id,
        product_name: item.name,
        product_slug: item.slug,
        quantity: item.quantity || 1,
        price: item.price,
        subtotal: (item.quantity || 1) * item.price
      }))
    };

    const response = await fetch(getApiUrl('/api/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const result = await response.json();
    return result.orderId;
  };

  const clearCartAndRedirect = (paymentMethod) => {
    // Clear all cart-related storage
    sessionStorage.removeItem('cartItems');
    sessionStorage.removeItem('totalCartPrice');
    sessionStorage.removeItem('buyNowProduct');
    sessionStorage.removeItem('totalPrice');
    sessionStorage.removeItem('formData');
    sessionStorage.removeItem('finalCart');
    sessionStorage.removeItem('finalTotal');
    
    // Also clear localStorage cart
    localStorage.removeItem('cart');

    // For COD, show success and close tab after a few seconds
    if (paymentMethod === 'cod') {
      alert('Order placed successfully! Your order will be delivered via Cash on Delivery. This tab will close in 3 seconds.');
      setTimeout(() => {
        window.close();
      }, 3000);
    } else {
      // For EasyPaisa, redirect to success page in same tab
      navigate('/payment-success', { state: { paymentMethod, success: true } });
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Processing your order...</p>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment options...</p>
      </div>
    );
  }

  return (
    <div className="payment-wrapper">
      <div className="payment-container">
        <h2>Choose Payment Method</h2>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="customer-info">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Address:</strong> {formData.address}</p>
          </div>
          
          <div className="items-list">
            <h4>Items ({cartItems.length})</h4>
            {cartItems.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">{item.name}</span>
                <div className="item-details">
                  {item.quantity && <span className="item-qty">x{item.quantity}</span>}
                  <span className="item-price">PKR {item.price} each</span>
                  {item.quantity && (
                    <span className="item-subtotal">
                      = PKR {((item.quantity || 1) * item.price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="total-amount">
            <strong>Total: PKR {totalPrice.toLocaleString()}</strong>
          </div>
        </div>

        <div className="payment-methods">
          <div 
            className={`payment-option ${selectedPayment === 'cod' ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodChange('cod')}
          >
            <div className="payment-header">
              <input 
                type="radio" 
                name="payment" 
                value="cod"
                checked={selectedPayment === 'cod'}
                onChange={() => handlePaymentMethodChange('cod')}
              />
              <h3>Cash on Delivery (COD)</h3>
            </div>
            <p>Pay when you receive your order. No advance payment required.</p>
          </div>

          <div 
            className={`payment-option ${selectedPayment === 'easypaisa' ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodChange('easypaisa')}
          >
            <div className="payment-header">
              <input 
                type="radio" 
                name="payment" 
                value="easypaisa"
                checked={selectedPayment === 'easypaisa'}
                onChange={() => handlePaymentMethodChange('easypaisa')}
              />
              <h3>EasyPaisa</h3>
            </div>
            <p>Send money via EasyPaisa and wait for confirmation. Your order will be processed once payment is verified.</p>
            {selectedPayment === 'easypaisa' && (
              <div className="easypaisa-details">
                <div className="payment-info">
                  <h4>Send Payment To:</h4>
                  <p><strong>EasyPaisa Number:</strong> 03215088506</p>
                  <p><strong>Account Name:</strong> [The Bedding Store]</p>
                  <p><strong>Amount:</strong> PKR {totalPrice.toLocaleString()}</p>
                </div>
                <div className="payment-note">
                  <p><em>After clicking "Confirm Order", you'll be redirected to a waiting screen. Please send the money and wait for admin confirmation.</em></p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="payment-actions">
          <button 
            className="back-btn"
            onClick={() => window.close()}
          >
            Close
          </button>
          <button 
            className="confirm-btn"
            onClick={handleConfirmOrder}
            disabled={!selectedPayment || loading}
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;
