import React, { useEffect, useState, useCallback } from 'react';
import './AddToCart.css';
import { useNavigate } from 'react-router-dom';

export default function AddToCart() {
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const navigate = useNavigate();

  // Fix image url like Products.jsx
  function fixImage(item) {
    if (!item?.image_url) return { ...item, image_url: '/placeholder.png' };
    let url = item.image_url;
    if (url.startsWith('/uploads/uploads/')) {
      url = url.replace('/uploads/uploads/', '/uploads/');
    }
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
        // Group orders by ID
        const groupedOrders = orders.reduce((acc, order) => {
          if (!acc[order.id]) {
            acc[order.id] = {
              id: order.id,
              buyer_name: order.buyer_name,
              buyer_email: order.buyer_email,
              payment_method: order.payment_method,
              status: order.status,
              total_amount: order.total_amount,
              created_at: order.created_at,
              items: []
            };
          }
          
          if (order.product_name) {
            acc[order.id].items.push({
              product_name: order.product_name,
              product_slug: order.product_slug,
              price: order.price,
              quantity: order.quantity
            });
          }
          
          return acc;
        }, {});
        
        // Get all orders (not just pending)
        const allOrders = Object.values(groupedOrders)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by newest first
        
        setOrderHistory(allOrders);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  }, []);

  // Fetch cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(storedCart);
    };

    const loadCartAndOrders = () => {
      loadCart();
      fetchOrderHistory();
    };

    loadCartAndOrders();

    // Listen for storage changes to refresh cart when orders are placed
    const handleStorageChange = () => {
      loadCart();
    };

    const handleFocusChange = () => {
      loadCartAndOrders();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocusChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocusChange);
    };
  }, []); // Remove fetchOrderHistory from dependencies

  // Separate useEffect for fetchOrderHistory to avoid infinite loop
  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  // Update quantity for a cart item
  function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) return;
    
    const updated = [...cartItems];
    updated[index].quantity = newQuantity;
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  // Remove a product from cart
  function handleRemove(index) {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  // Total price with quantities
  const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  // ✅ FINALIZED handleBuyNow with quantity support
  function handleBuyNow() {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCartPrice = storedCart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

    sessionStorage.setItem('cartItems', JSON.stringify(storedCart));
    sessionStorage.setItem('totalCartPrice', totalCartPrice);
    sessionStorage.setItem('allowCheckout', 'true');

    navigate('/checkout');
  }

  // Delete order from history
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order from your history? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from local state
        setOrderHistory(orderHistory.filter(order => order.id !== orderId));
        alert('Order history deleted successfully!');
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order history. Please try again.');
    }
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">🛒 Your Cart</h1>

      {/* Order History Section */}
      {orderHistory.length > 0 && (
        <div className="order-history-section">
          <div className="order-history-header">
            <h2>📋 Your Order History ({orderHistory.length})</h2>
            <button 
              className="toggle-history-btn"
              onClick={() => setShowOrderHistory(!showOrderHistory)}
            >
              {showOrderHistory ? 'Hide' : 'Show'} Order History
            </button>
          </div>
          
          {showOrderHistory && (
            <div className="order-history-list">
              {orderHistory.map(order => (
                <div key={order.id} className="order-history-item">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <div className="order-status-info">
                      <span className={`status-badge ${order.payment_method === 'easypaisa' ? 'easypaisa' : 'cod'}`}>
                        {order.payment_method === 'easypaisa' ? '💳 EasyPaisa' : '💰 COD'}
                      </span>
                      <span className={`order-status ${order.status}`}>
                        {order.status === 'pending' && '⏳ Pending'}
                        {order.status === 'confirmed' && '✅ Confirmed'}
                        {order.status === 'shipped' && '🚚 Shipped'}
                        {order.status === 'delivered' && '📦 Delivered'}
                        {order.status === 'cancelled' && '❌ Cancelled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-info">
                      <p><strong>Customer:</strong> {order.buyer_name}</p>
                      <p><strong>Total:</strong> PKR {order.total_amount}</p>
                      <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> 
                        <span className={`status-text ${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    
                    <div className="order-items">
                      <h4>Items Ordered:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="ordered-item">
                          <span className="item-name">{item.product_name}</span>
                          <div className="item-details">
                            {item.quantity > 1 && <span className="item-qty">x{item.quantity}</span>}
                            <span className="item-price">PKR {item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>

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
                  
                  {/* Quantity Controls */}
                  <div className="quantity-controls" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '0.75rem 0',
                    padding: '0.5rem',
                    background: 'var(--quantity-bg, #f8f9fa)',
                    borderRadius: '8px',
                    border: '1px solid var(--quantity-border, #dee2e6)'
                  }}>
                    <label style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--quantity-label, #495057)',
                      minWidth: '60px'
                    }}>
                      Quantity:
                    </label>
                    <button 
                      onClick={() => updateQuantity(index, itemQuantity - 1)}
                      style={{
                        background: 'var(--quantity-btn, #6c757d)',
                        border: 'none',
                        color: 'white',
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      -
                    </button>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      minWidth: '30px',
                      textAlign: 'center',
                      color: 'var(--quantity-value, #212529)'
                    }}>
                      {itemQuantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(index, itemQuantity + 1)}
                      style={{
                        background: 'var(--quantity-btn, #6c757d)',
                        border: 'none',
                        color: 'white',
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                    <div style={{
                      marginLeft: '12px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--quantity-total, #28a745)'
                    }}>
                      Total: PKR {itemTotal.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="cart-actions">
                    <button className="remove-btn" onClick={() => handleRemove(index)}>Remove</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {cartItems.length > 0 && (
        <>
          <div className="delivery-note">
            <div className="delivery-icon">🚚</div>
            <div className="delivery-text">
              <strong>Delivery Time:</strong> 5-10 days
            </div>
          </div>
          
          <div className="cart-total">
            <span className="cart-total-label">Total:</span>
            <span className="cart-total-value">PKR {totalPrice}</span>
            <button className="checkout-btn" onClick={handleBuyNow}>Proceed to Checkout</button>
          </div>
        </>
      )}


    </div>
  );
}