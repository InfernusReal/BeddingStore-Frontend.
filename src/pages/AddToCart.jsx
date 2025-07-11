import React, { useEffect, useState, useCallback } from 'react';
import './AddToCart.css';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';
import axios from 'axios';

export default function AddToCart() {
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const navigate = useNavigate();

  // Fix image url like Products.jsx
  function fixImage(item) {
    if (!item?.image_url) return { ...item, image_url: '/placeholder.png' };
    
    let url = item.image_url;
    
    // If it's already a full URL (Cloudinary), leave it as-is
    if (url.startsWith('http')) {
      return { ...item, image_url: url };
    }
    
    // Fix double prefix for local images
    if (url.startsWith('/uploads/uploads/')) {
      url = url.replace('/uploads/uploads/', '/uploads/');
    }
    
    // Add uploads prefix if missing for local images
    if (!url.startsWith('/uploads/')) {
      url = `/uploads/${url.replace(/^uploads[\\/]+/, '').replace(/^\\+|^\/+/, '')}`;
    }
    
    return { ...item, image_url: `http://localhost:5000${url}` };
  }

  // Fetch order history for the user
  const fetchOrderHistory = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const orders = await response.json();
      
      if (Array.isArray(orders)) {
        setOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  }, []);

  // Update quantity for a cart item
  function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) return;
    
    const updated = [...cartItems];
    updated[index].quantity = newQuantity;
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  // Remove cart item
  function removeFromCart(index) {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  // Delete an order
  const deleteOrder = async (orderId) => {
    try {
      const response = await axios.delete(`/api/orders/${orderId}`);
      if (response.status === 200) {
        setOrders(orders.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Submit order
  const submitOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setIsLoading(true);
    setConfirmationMessage('');

    try {
      const response = await axios.post(getApiUrl('/api/orders'), {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      });

      if (response.status === 201) {
        setConfirmationMessage('Order submitted successfully! You will be contacted shortly.');
        setCartItems([]);
        localStorage.removeItem('cart');
        fetchOrderHistory();
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setConfirmationMessage('Error submitting order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  // Calculate total
  const total = cartItems.reduce((sum, item) => {
    const fixed = fixImage(item);
    return sum + (Number(fixed.price) * (item.quantity || 1));
  }, 0);

  return (
    <div className="add-to-cart-page">
      <h1>Your Cart</h1>
      
      {confirmationMessage && (
        <div className="confirmation-message">
          {confirmationMessage}
        </div>
      )}

      {!showOrderHistory && (
        <div className="cart-actions">
          <button 
            className="toggle-history-btn"
            onClick={() => setShowOrderHistory(!showOrderHistory)}
          >
            {showOrderHistory ? 'Hide' : 'Show'} Order History
          </button>
        </div>
      )}

      {showOrderHistory && (
        <div className="order-history-section">
          <div className="order-history-header">
            <h2>Order History</h2>
            <button 
              className="toggle-history-btn"
              onClick={() => setShowOrderHistory(!showOrderHistory)}
            >
              Hide Order History
            </button>
          </div>
          
          {orders.length === 0 ? (
            <p className="empty-msg">No orders found.</p>
          ) : (
            <div className="order-history-grid">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="order-items">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span>{item.product_name} {item.quantity > 1 && `(x${item.quantity})`}</span>
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>PKR {item.price}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total">
                    <strong>Total: PKR {order.total}</strong>
                    <div className="order-actions">
                      <button className="delete-order-btn" onClick={() => deleteOrder(order.id)}>🗑️ Delete Order History</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="cart-grid">
        {cartItems.length === 0 ? (
          <p className="empty-msg">Your cart is empty </p>
        ) : (
          cartItems.map((item, index) => {
            const fixed = fixImage(item);
            const itemQuantity = item.quantity || 1;
            const itemTotal = Number(fixed.price) * itemQuantity;
            
            return (
              <div className="cart-item" key={index}>
                <img src={fixed.image_url} alt={fixed.name} className="cart-img" />
                <div className="cart-info">
                  <h3>{fixed.name}</h3>
                  <p className="cart-desc">{fixed.description}</p>
                  <p className="cart-price">PKR {fixed.price} each</p>
                  
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(index, itemQuantity - 1)}
                      disabled={itemQuantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity-display">{itemQuantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(index, itemQuantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="item-total">
                    Subtotal: PKR {itemTotal.toFixed(2)}
                  </p>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-summary">
          <div className="delivery-note">
            <span className="delivery-icon">🚚</span>
            <span className="delivery-text">
              Free delivery in Lahore • Cash on delivery available
            </span>
          </div>
          
          <div className="cart-total">
            <span className="cart-total-label">Total:</span>
            <span className="cart-total-value">PKR {total.toFixed(2)}</span>
          </div>
          
          <button 
            className="checkout-btn"
            onClick={submitOrder}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
}
