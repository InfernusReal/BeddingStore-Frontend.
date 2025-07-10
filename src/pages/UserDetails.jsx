import React, { useState, useEffect } from 'react';
import './UserDetails.css';
import { useNavigate } from 'react-router-dom';

function UserDetails({ cartItems: propCartItems = [], totalPrice: propTotalPrice = 0 }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const buyNowItem = JSON.parse(sessionStorage.getItem('buyNowProduct') || '[]');
    const buyNowPrice = parseFloat(sessionStorage.getItem('totalPrice') || '0');

    const storedCartItems = JSON.parse(sessionStorage.getItem('cartItems') || '[]');
    const storedCartPrice = parseFloat(sessionStorage.getItem('totalCartPrice') || '0');

    if (storedCartItems.length > 0) {
      setCartItems(storedCartItems);
      setTotalPrice(storedCartPrice);
    } else if (buyNowItem.length > 0) {
      setCartItems(buyNowItem);
      setTotalPrice(buyNowPrice);
    } else {
      setCartItems(propCartItems || []);
      setTotalPrice(propTotalPrice || 0);
    }
  }, []); // Remove dependencies to prevent infinite loop

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Save everything to sessionStorage so /payment and /payment-success can access it
    sessionStorage.setItem('formData', JSON.stringify(formData));
    sessionStorage.setItem('finalCart', JSON.stringify(cartItems));
    sessionStorage.setItem('finalTotal', totalPrice.toString());

    // Open payment page in new tab
    window.open('/payment', '_blank');
  }

  return (
    <div className="user-details-wrapper">
      <h2 style={{
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '1.6rem',
        marginBottom: '1.5rem',
        letterSpacing: '0.5px',
        color: 'var(--ud-label, #23272f)'
      }}>Information for Checkout</h2>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone (+92...)"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="address"
          placeholder="Full Delivery Address"
          value={formData.address}
          onChange={handleChange}
          required
          rows="4"
        />

        <button type="submit">Proceed</button>

        <small style={{ marginTop: '10px', color: '#555', fontStyle: 'italic' }}>
          ⚠️ Please ensure your address is accurate. Incorrect addresses may result in failed delivery.
        </small>
      </form>
    </div>
  );
}

export default UserDetails;