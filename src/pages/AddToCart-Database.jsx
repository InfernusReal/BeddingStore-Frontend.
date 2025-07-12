import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getImageUrl } from '../utils/api';
import axios from 'axios';
import './AddToCart-New.css';

const AddToCartNew = () => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const [view, setView] = useState('cart'); // 'cart' or 'orders'
  const navigate = useNavigate();

  // Generate or get user session ID
  const getUserSessionId = () => {
    let sessionId = localStorage.getItem('userSessionId');
    if (!sessionId) {
      sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userSessionId', sessionId);
    }
    return sessionId;
  };

  // Add item to cart - SAVES TO DATABASE
  const addToCart = async (product, quantity = 1) => {
    try {
      const sessionId = getUserSessionId();
      console.log('🛒 Adding to cart via DATABASE:', product, 'quantity:', quantity);
      
      const orderData = {
        buyer_name: 'Guest User',
        buyer_email: 'guest@example.com',
        buyer_phone: '0000000000',
        buyer_address: 'Temp Address',
        payment_method: 'cart',
        payment_id: 'temp',
        total_amount: product.price * quantity,
        status: 'cart',
        user_session: sessionId,
        items: [{
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          quantity: quantity,
          price: product.price,
          subtotal: product.price * quantity
        }]
      };

      const response = await axios.post(`${getApiUrl('api/orders')}`, orderData);
      console.log('🛒 Item added to DATABASE successfully:', response.data);
      
      // Refresh cart items from database
      fetchCartItems();
      
    } catch (error) {
      console.error('🛒 Error adding to cart:', error);
    }
  };

  // Fetch cart items from DATABASE
  const fetchCartItems = useCallback(async () => {
    try {
      const sessionId = getUserSessionId();
      console.log('🛒 Fetching cart items from DATABASE for session:', sessionId);
      
      const response = await axios.get(`${getApiUrl('api/orders/user')}/${sessionId}`);
      console.log('🛒 Cart items received from DATABASE:', response.data);
      
      // Filter only cart items (status = 'cart')
      const cartOrders = response.data.filter(order => order.status === 'cart');
      setCartItems(cartOrders);
      
    } catch (error) {
      console.error('🛒 Error fetching cart items from DATABASE:', error);
      setCartItems([]);
    }
  }, []);

  // Fetch order history from DATABASE
  const fetchOrderHistory = useCallback(async () => {
    try {
      const sessionId = getUserSessionId();
      console.log('📦 Fetching orders from DATABASE for session:', sessionId);
      
      const response = await axios.get(`${getApiUrl('api/orders/user')}/${sessionId}`);
      console.log('📦 User orders received from DATABASE:', response.data);
      
      // Filter only completed orders (status != 'cart')
      const completedOrders = response.data.filter(order => order.status !== 'cart');
      setOrders(completedOrders);
      
    } catch (error) {
      console.error('📦 Error fetching order history from DATABASE:', error);
      setOrders([]);
    }
  }, []);

  // Delete order from DATABASE
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const sessionId = getUserSessionId();
      console.log('🗑️ Deleting order from DATABASE:', orderId, 'for session:', sessionId);
      
      const response = await axios.delete(`${getApiUrl('api/orders')}/${orderId}`, {
        headers: {
          'User-Session': sessionId,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log('🗑️ Order deleted from DATABASE successfully');
        alert('Order deleted successfully');
        // Refresh both cart and orders
        fetchCartItems();
        fetchOrderHistory();
      }
    } catch (error) {
      console.error('🗑️ Error deleting order from DATABASE:', error);
      alert('Error deleting order');
    }
  };

  // Update quantity in DATABASE
  const updateQuantity = async (orderId, newQuantity) => {
    if (newQuantity <= 0) return;
    
    try {
      console.log('📊 Updating quantity in DATABASE:', orderId, 'to', newQuantity);
      
      // For now, delete and re-add with new quantity
      // In a real app, you'd have an update endpoint
      const order = cartItems.find(item => item.id === orderId);
      if (order) {
        await deleteOrder(orderId);
        await addToCart({
          id: order.product_id,
          name: order.product_name,
          slug: order.product_slug,
          price: order.price,
          image_url: order.image_url
        }, newQuantity);
      }
    } catch (error) {
      console.error('📊 Error updating quantity in DATABASE:', error);
    }
  };

  // Make addToCart available globally
  useEffect(() => {
    window.addToCart = addToCart;
    return () => {
      delete window.addToCart;
    };
  }, []);

  // Load cart items on mount
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Fetch order history when view changes to orders
  useEffect(() => {
    if (view === 'orders') {
      fetchOrderHistory();
    }
  }, [view, fetchOrderHistory]);

  // Continue shopping
  const continueShopping = () => {
    navigate('/products');
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.total_amount) || 0), 0);
  };

  return (
    <div className="new-cart-container">
      <div className="new-cart-header">
        <h1>Shopping Cart</h1>
        <div className="new-cart-nav">
          <button 
            className={`new-nav-btn ${view === 'cart' ? 'active' : ''}`}
            onClick={() => setView('cart')}
          >
            Cart ({cartItems.length})
          </button>
          <button 
            className={`new-nav-btn ${view === 'orders' ? 'active' : ''}`}
            onClick={() => setView('orders')}
          >
            Order History ({orders.length})
          </button>
        </div>
      </div>

      {view === 'cart' ? (
        <div className="new-cart-view">
          {cartItems.length === 0 ? (
            <div className="new-empty-cart">
              <div className="new-empty-cart-icon">🛍️</div>
              <h2>Your cart is empty</h2>
              <p>Items you add to cart will appear here.</p>
              <button className="new-continue-shopping-btn" onClick={continueShopping}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="new-cart-content">
              <div className="new-cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="new-cart-item">
                    <div className="new-item-image">
                      <img 
                        src={getImageUrl(item.image_url)} 
                        alt={item.product_name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    
                    <div className="new-item-details">
                      <h3 className="new-item-name">{item.product_name}</h3>
                      <p className="new-item-price">₨ {parseFloat(item.total_amount).toLocaleString()}</p>
                      <div className="new-item-meta">
                        <span className="new-item-category">Bedding</span>
                        <button 
                          className="new-view-product-btn"
                          onClick={() => navigate(`/product/${item.product_slug}`)}
                        >
                          View Product
                        </button>
                      </div>
                    </div>

                    <div className="new-item-actions">
                      <button 
                        className="new-delete-btn"
                        onClick={() => deleteOrder(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="new-cart-summary">
                <div className="new-summary-row">
                  <span>Total Items:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="new-summary-row new-total">
                  <span>Total Amount:</span>
                  <span>₨ {calculateTotal().toLocaleString()}</span>
                </div>
                <button className="new-checkout-btn" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="new-orders-view">
          {orders.length === 0 ? (
            <div className="new-empty-orders">
              <div className="new-empty-orders-icon">📦</div>
              <h2>No orders yet</h2>
              <p>Your order history will appear here.</p>
            </div>
          ) : (
            <div className="new-orders-list">
              {orders.map((order) => (
                <div key={order.id} className="new-order-card">
                  <div className="new-order-header">
                    <h3>Order #{order.id}</h3>
                    <span className="new-order-status">{order.status}</span>
                  </div>
                  <div className="new-order-details">
                    <p>Total: ₨ {parseFloat(order.total_amount).toLocaleString()}</p>
                    <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="new-order-actions">
                    <button 
                      className="new-delete-order-btn"
                      onClick={() => deleteOrder(order.id)}
                    >
                      Delete Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddToCartNew;
