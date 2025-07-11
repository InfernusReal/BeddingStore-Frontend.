import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const state = location.state;
    
    if (!state) {
      // If no state, redirect to home
      navigate('/');
      return;
    }

    if (state.paymentMethod === 'cod' && state.success) {
      setOrderStatus('confirmed');
    } else if (state.paymentMethod === 'easypaisa') {
      setOrderStatus('pending');
      setOrderId(state.orderId);
      
      // Start polling for payment confirmation
      if (state.orderId) {
        startPaymentStatusPolling(state.orderId);
      }
    }
  }, [location.state, navigate]);

  const startPaymentStatusPolling = (orderId) => {
    setLoading(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(getApiUrl(`/api/orders/${orderId}/status`));
        const data = await response.json();
        
        if (data.status === 'confirmed') {
          setOrderStatus('confirmed');
          setLoading(false);
          clearInterval(pollInterval);
          
          // Clear the pending order ID
          sessionStorage.removeItem('pendingOrderId');
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    }, 5000); // Check every 5 seconds

    // Stop polling after 30 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setLoading(false);
    }, 30 * 60 * 1000);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/cart'); // Assuming this shows order history
  };

  if (orderStatus === 'confirmed') {
    return (
      <div className="payment-success-wrapper">
        <div className="success-container">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#28a745"/>
              <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1>Order Confirmed!</h1>
          <p className="success-message">
            Thank you for your order! We've received your order and will process it shortly.
            We'll contact you soon to arrange delivery.
          </p>
          
          {orderId && (
            <div className="order-info">
              <p><strong>Order ID:</strong> #{orderId}</p>
            </div>
          )}

          <div className="success-actions">
            <button className="continue-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
            <button className="orders-btn" onClick={handleViewOrders}>
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === 'pending') {
    return (
      <div className="payment-success-wrapper">
        <div className="pending-container">
          <div className="pending-icon">
            {loading && (
              <div className="loading-spinner"></div>
            )}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#ffc107"/>
              <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1>Payment Pending</h1>
          <p className="pending-message">
            Your order has been created and is waiting for payment confirmation.
          </p>
          
          <div className="easypaisa-instructions">
            <h3>Complete Your Payment:</h3>
            <div className="payment-details">
              <p><strong>EasyPaisa Number:</strong> 03XX-XXXXXXX</p>
              <p><strong>Account Name:</strong> [Your Business Name]</p>
              <p><strong>Amount:</strong> PKR {sessionStorage.getItem('finalTotal')}</p>
              {orderId && <p><strong>Order ID:</strong> #{orderId}</p>}
            </div>
            
            <div className="instructions-list">
              <h4>Steps to complete payment:</h4>
              <ol>
                <li>Send the exact amount via EasyPaisa to the number above</li>
                <li>Keep your transaction ID for reference</li>
                <li>Wait on this page for confirmation (usually 5-10 minutes)</li>
              </ol>
            </div>
          </div>

          {loading && (
            <div className="status-check">
              <p>🔄 Checking payment status...</p>
              <p className="status-note">This page will automatically update once your payment is confirmed.</p>
            </div>
          )}

          <div className="pending-actions">
            <button className="home-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state or error state
  return (
    <div className="payment-success-wrapper">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default PaymentSuccess;
