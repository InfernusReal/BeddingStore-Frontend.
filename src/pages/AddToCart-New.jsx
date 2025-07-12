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
    let sessionId = localStorage.getItem('userSession');
    if (!sessionId) {
      sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userSession', sessionId);
    }
    console.log('🛒 CURRENT USER SESSION ID:', sessionId);
    return sessionId;
  };

  // Fetch cart items from DATABASE
  const fetchCartItems = useCallback(async () => {
    try {
      const sessionId = getUserSessionId();
      console.log('🛒 FETCHING CART ITEMS FROM DATABASE for session:', sessionId);
      
      const response = await axios.get(`${getApiUrl('api/orders/user')}/${sessionId}`);
      console.log('🛒 RAW DATABASE RESPONSE:', response.data);
      
      // Filter only cart items (status = 'temp')
      const cartOrders = response.data.filter(order => order.status === 'temp');
      console.log('🛒 FILTERED CART ORDERS:', cartOrders);
      
      // DEBUG: Check what image data we have
      cartOrders.forEach(order => {
        console.log('🛒 CART ITEM DEBUG:', {
          id: order.id,
          product_name: order.product_name,
          product_image: order.product_image,
          image_url: order.image_url,
          product_slug: order.product_slug
        });
      });
      
      // If cart items don't have images, fetch them from products
      const enrichedCartItems = await Promise.all(
        cartOrders.map(async (order) => {
          if (!order.product_image && !order.image_url && order.product_slug) {
            try {
              console.log('🛒 FETCHING PRODUCT DATA for slug:', order.product_slug);
              const productRes = await axios.get(`${getApiUrl('api/products/slug')}/${order.product_slug}`);
              console.log('🛒 PRODUCT DATA FETCHED:', productRes.data);
              return {
                ...order,
                product_image: productRes.data.image_url
              };
            } catch (err) {
              console.error('🛒 ERROR FETCHING PRODUCT DATA:', err);
              return order;
            }
          }
          return order;
        })
      );
      
      console.log('🛒 ENRICHED CART ITEMS:', enrichedCartItems);
      setCartItems(enrichedCartItems);
      
    } catch (error) {
      console.error('🛒 ERROR FETCHING CART ITEMS FROM DATABASE:', error);
      console.error('🛒 Error details:', error.response?.data);
      setCartItems([]);
    }
  }, []);

  // Add item to cart - SAVES TO DATABASE
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
        status: 'temp', // Changed from 'cart' to 'temp' to fit database column
        user_session: sessionId,
        items: [{
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          product_image: product.image_url, // Add image URL to order data
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

  // Fetch order history from DATABASE
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
          image_url: order.product_image || order.image_url
        }, newQuantity);
      }
    } catch (error) {
      console.error('📊 Error updating quantity in DATABASE:', error);
    }
  };

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

  // Listen for cart refresh flag (when user returns after checkout)
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem('cartNeedsRefresh') === 'true' || localStorage.getItem('forceCartRefresh') === 'true') {
        console.log('🛒 CART NEEDS REFRESH - Refreshing cart items and orders');
        localStorage.removeItem('cartNeedsRefresh');
        localStorage.removeItem('forceCartRefresh');
        fetchCartItems();
        fetchOrderHistory();
      }
    };

    const handleCartUpdated = (event) => {
      console.log('🛒 CART UPDATED EVENT RECEIVED:', event.detail);
      setTimeout(() => {
        fetchCartItems();
        fetchOrderHistory();
      }, 1000);
    };

    // Check on mount
    handleStorageChange();
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom cart events
    window.addEventListener('cartUpdated', handleCartUpdated);
    
    // Also check periodically in case storage event doesn't fire
    const interval = setInterval(() => {
      handleStorageChange();
    }, 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdated);
      clearInterval(interval);
    };
  }, [fetchCartItems, fetchOrderHistory]);

  // AGGRESSIVE refresh when view changes
  useEffect(() => {
    if (view === 'cart') {
      console.log('🛒 VIEW CHANGED TO CART - AGGRESSIVE REFRESH');
      setTimeout(() => fetchCartItems(), 500);
      setTimeout(() => fetchCartItems(), 1500);
    }
    if (view === 'orders') {
      console.log('🛒 VIEW CHANGED TO ORDERS - AGGRESSIVE REFRESH');
      setTimeout(() => fetchOrderHistory(), 500);
      setTimeout(() => fetchOrderHistory(), 1500);
    }
  }, [view, fetchCartItems, fetchOrderHistory]);

  // Handle checkout
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
      // Keys that UserDetails.jsx expects
      sessionStorage.setItem('cartItems', JSON.stringify(finalCart));
      sessionStorage.setItem('totalCartPrice', finalTotal.toString());
      
      // Keys that payment.jsx expects
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
        <h1 className="new-cart-title">Your Cart</h1>
        <div className="new-cart-toggle">
          <button 
            className={`new-toggle-btn ${view === 'cart' ? 'active' : ''}`}
            onClick={() => setView('cart')}
          >
            <span className="new-toggle-icon">🛒</span>
            Cart ({cartItems.length})
          </button>
          <button 
            className={`new-toggle-btn ${view === 'orders' ? 'active' : ''}`}
            onClick={() => setView('orders')}
          >
            <span className="new-toggle-icon">📦</span>
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {view === 'cart' ? (
        cartItems.length === 0 ? (
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
                <div 
                  key={item.id}
                  className="new-cart-item"
                >
                  <div className="new-item-image">
                    <img 
                      src={getImageUrl(item.product_image || item.image_url || '/placeholder.png')} 
                      alt={item.product_name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  
                  <div className="new-item-details">
                    <h3 className="new-item-name">{item.product_name}</h3>
                    <p className="new-item-price">₨ {parseFloat(item.price || item.total_amount).toLocaleString()}</p>
                    <p className="new-item-quantity">Quantity: {item.quantity || 1}</p>
                    <div className="new-item-meta">
                      <span className="new-item-category">Bedding</span>
                      {item.product_slug && (
                        <button 
                          className="new-view-product-btn"
                          onClick={() => navigate(`/product/${item.product_slug}`)}
                        >
                          View Product
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="new-item-controls">
                    <div className="new-item-total">
                      <span className="new-total-label">Total</span>
                      <span className="new-total-amount">₨ {parseFloat(item.total_amount).toLocaleString()}</span>
                    </div>
                    
                    <button 
                      className="new-remove-btn"
                      onClick={() => deleteOrder(item.id)}
                    >
                      <span className="new-remove-icon">🗑️</span>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="new-cart-summary">
              <div className="new-summary-content">
                <div className="new-summary-row">
                  <span>Items:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="new-summary-row new-total-row">
                  <span>Total:</span>
                  <span>₨ {calculateTotal().toLocaleString()}</span>
                </div>
                <button className="new-checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="new-orders-section">
          {orders.length === 0 ? (
            <div className="new-empty-orders">
              <div className="new-empty-orders-icon">📦</div>
              <h2>No orders yet</h2>
              <p>Your order history will appear here.</p>
            </div>
          ) : (
            <div className="new-orders-grid">
              {orders.map((order) => (
                <div key={order.id} className="new-order-card">
                  <div className="new-order-header">
                    <div className="new-order-info">
                      <h3 className="new-order-id">Order #{order.id}</h3>
                      <span className="new-order-date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`new-order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="new-order-details">
                    <div className="new-product-info">
                      <h4 className="new-product-name">{order.product_name || 'Product'}</h4>
                      <p className="new-product-price">₨ {parseFloat(order.price || order.total_amount).toLocaleString()}</p>
                    </div>
                    <div className="new-delivery-info">
                      <span className="new-delivery-label">🚚 Delivery</span>
                      <span className="new-delivery-time">5-10 days</span>
                    </div>
                    <div className="new-order-amount">
                      <span className="new-amount-label">Total Amount</span>
                      <span className="new-amount-value">₨ {parseFloat(order.total_amount).toLocaleString()}</span>
                    </div>
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
