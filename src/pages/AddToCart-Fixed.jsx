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

  // FIXED: Generate or get user session ID with consistent format
  const getUserSessionId = () => {
    let sessionId = localStorage.getItem('userSession');
    if (!sessionId) {
      sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userSession', sessionId);
    }
    console.log('🛒 CURRENT USER SESSION ID:', sessionId);
    return sessionId;
  };

  // FIXED: Fetch cart items from database
  const fetchCartItems = useCallback(async () => {
    try {
      const sessionId = getUserSessionId();
      console.log('🛒 FETCHING CART ITEMS FROM DATABASE for session:', sessionId);
      
      const response = await axios.get(`${getApiUrl('api/orders/user')}/${sessionId}`);
      console.log('🛒 RAW DATABASE RESPONSE:', response.data);
      
      // Filter only cart items (status = 'temp')
      const cartOrders = response.data.filter(order => order.status === 'temp');
      console.log('🛒 FILTERED CART ORDERS:', cartOrders);
      
      setCartItems(cartOrders);
      console.log('🛒 CART ITEMS SET TO STATE:', cartOrders);
      
    } catch (error) {
      console.error('🛒 ERROR FETCHING CART ITEMS FROM DATABASE:', error);
      console.error('🛒 Error details:', error.response?.data);
      setCartItems([]);
    }
  }, []);

  // FIXED: Add item to cart - SAVES TO DATABASE
  const addToCart = useCallback(async (product, quantity = 1) => {
    try {
      const sessionId = getUserSessionId();
      console.log('🛒 DATABASE ADD TO CART CALLED!');
      console.log('🛒 Product:', product);
      console.log('🛒 Quantity:', quantity);
      console.log('🛒 Session ID:', sessionId);
      
      const orderData = {
        buyer_name: 'Guest User',
        buyer_email: 'guest@example.com',
        buyer_phone: '0000000000',
        buyer_address: 'Temp Address',
        payment_method: 'cart',
        payment_id: 'temp',
        total_amount: product.price * quantity,
        status: 'temp',
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

      console.log('🛒 Sending order data to database:', orderData);
      
      const response = await axios.post(`${getApiUrl('api/orders')}`, orderData);
      console.log('🛒 DATABASE RESPONSE:', response.data);
      
      // Refresh cart items from database
      console.log('🛒 Refreshing cart items...');
      await fetchCartItems();
      
    } catch (error) {
      console.error('🛒 DATABASE ERROR:', error);
      console.error('🛒 Error details:', error.response?.data);
    }
  }, [fetchCartItems]);

  // FIXED: Fetch order history from database
  const fetchOrderHistory = useCallback(async () => {
    try {
      const sessionId = getUserSessionId();
      console.log('📦 Fetching orders from DATABASE for session:', sessionId);
      
      const response = await axios.get(`${getApiUrl('api/orders/user')}/${sessionId}`);
      console.log('📦 User orders received from DATABASE:', response.data);
      
      // Filter only completed orders (status != 'temp')
      const completedOrders = response.data.filter(order => order.status !== 'temp');
      setOrders(completedOrders);
      
    } catch (error) {
      console.error('📦 Error fetching order history from DATABASE:', error);
      setOrders([]);
    }
  }, []);

  // Make addToCart available globally
  useEffect(() => {
    console.log('🛒 REGISTERING GLOBAL addToCart function');
    window.addToCart = addToCart;
    console.log('🛒 window.addToCart is now:', !!window.addToCart);
    
    return () => {
      console.log('🛒 CLEANING UP GLOBAL addToCart function');
      delete window.addToCart;
    };
  }, [addToCart]);

  // Load cart items on mount
  useEffect(() => {
    console.log('🛒 COMPONENT MOUNTED - Loading cart items');
    fetchCartItems();
  }, [fetchCartItems]);

  // FIXED: Handle checkout
  const handleCheckout = () => {
    console.log('🛒 CHECKOUT: Button clicked!');
    console.log('🛒 CHECKOUT: Cart items:', cartItems);
    
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      // Prepare cart data in the EXACT format that payment.jsx expects
      const finalCart = cartItems.map(item => ({
        id: item.product_id,
        product_id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.price || item.total_amount),
        slug: item.product_slug,
        image_url: item.product_image || item.image_url,
        quantity: item.quantity || 1
      }));

      const finalTotal = cartItems.reduce((total, item) => total + parseFloat(item.total_amount), 0);

      console.log('🛒 CHECKOUT: Prepared finalCart:', finalCart);
      console.log('🛒 CHECKOUT: Prepared finalTotal:', finalTotal);

      // Store data in sessionStorage using BOTH sets of keys for compatibility
      sessionStorage.setItem('cartItems', JSON.stringify(finalCart));
      sessionStorage.setItem('totalCartPrice', finalTotal.toString());
      sessionStorage.setItem('finalCart', JSON.stringify(finalCart));
      sessionStorage.setItem('finalTotal', finalTotal.toString());
      
      // Set flags for checkout flow
      sessionStorage.setItem('cartCheckout', 'true');
      sessionStorage.setItem('allowCheckout', 'true');
      
      // Remove old keys to avoid conflicts
      sessionStorage.removeItem('checkoutProducts');
      sessionStorage.removeItem('totalPrice');
      sessionStorage.removeItem('buyNowProduct');

      console.log('🛒 CHECKOUT: Data stored in sessionStorage');
      console.log('🛒 CHECKOUT: Navigating to /checkout...');
      
      // Navigate to checkout form
      navigate('/checkout');
      
    } catch (error) {
      console.error('🛒 CHECKOUT: Error preparing checkout:', error);
      alert('Error preparing checkout. Please try again.');
    }
  };

  return (
    <div className="new-cart-container">
      <div className="new-cart-header">
        <h1>Your Cart</h1>
        <div className="new-cart-tabs">
          <button 
            className={`new-tab ${view === 'cart' ? 'active' : ''}`}
            onClick={() => setView('cart')}
          >
            Cart ({cartItems.length})
          </button>
          <button 
            className={`new-tab ${view === 'orders' ? 'active' : ''}`}
            onClick={() => setView('orders')}
          >
            Order History ({orders.length})
          </button>
        </div>
      </div>

      {view === 'cart' ? (
        <div className="new-cart-content">
          {cartItems.length === 0 ? (
            <div className="new-empty-cart">
              <p>Your cart is empty</p>
              <button onClick={() => navigate('/products')}>Continue Shopping</button>
            </div>
          ) : (
            <>
              <div className="new-cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="new-cart-item">
                    <img 
                      src={getImageUrl(item.product_image || item.image_url)}
                      alt={item.product_name}
                      className="new-item-image"
                    />
                    <div className="new-item-details">
                      <h3 className="new-item-name">{item.product_name}</h3>
                      <p className="new-item-price">PKR {item.price}</p>
                      <p className="new-item-quantity">Quantity: {item.quantity}</p>
                      <p className="new-item-total">Total: PKR {item.total_amount}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="new-cart-summary">
                <h3>Total: PKR {cartItems.reduce((total, item) => total + parseFloat(item.total_amount), 0)}</h3>
                <button className="new-checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="new-orders-content">
          {orders.length === 0 ? (
            <div className="new-empty-orders">
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="new-orders-list">
              {orders.map((order) => (
                <div key={order.id} className="new-order-item">
                  <h3>Order #{order.id}</h3>
                  <p>Status: {order.status}</p>
                  <p>Total: PKR {order.total_amount}</p>
                  <p>Product: {order.product_name}</p>
                  <p>Quantity: {order.quantity}</p>
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
