import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    published: true,
    collection_id: '',
    image: null
  });

  const [collections, setCollections] = useState([]);
  const [preview, setPreview] = useState(null);
  const [productList, setProductList] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [hovered, setHovered] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const navigate = useNavigate();

  function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;

    axios.delete(`/api/products/${id}`)
      .then(() => {
        setProductList(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error('Failed to delete:', err);
        alert('Delete failed.');
      });
  }

  useEffect(() => {
    axios.get('/api/collections').then(res => {
      setCollections(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'collection_id' ? (value ? Number(value) : '') : value 
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file || null }));
    setPreview(file ? URL.createObjectURL(file) : null);
    setSelectedFileName(file ? file.name : '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Comprehensive validation
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push("Product name is required");
    }
    
    if (!formData.description.trim()) {
      errors.push("Product description is required");
    } else if (formData.description.trim().length < 40) {
      errors.push("Product description must be at least 40 characters long");
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.push("Product price is required and must be greater than 0");
    }
    
    if (!formData.collection_id) {
      errors.push("Please select a collection");
    }
    
    if (!formData.image) {
      errors.push("Product image is required");
    }
    
    // If there are validation errors, show them and stop submission
    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return;
    }
    
    const data = new FormData();
    for (let key in formData) {
      if (key === 'image' && !formData[key]) continue;
      // Fix: send null for collection_id if empty string or falsy
      if (key === 'collection_id') {
        data.append('collection_id', formData.collection_id ? formData.collection_id : null);
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      const res = await axios.post('/api/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Product uploaded successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        published: true,
        collection_id: '',
        image: null
      });
      setPreview(null);
      setSelectedFileName('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  }

  const fetchCollections = useCallback(() => {
    axios.get('/api/collections')
      .then(res => setCollections(res.data))
      .catch(err => console.error('Collections fetch failed:', err));
  }, []);

  const fetchProducts = useCallback(() => {
    axios.get('/api/products')
      .then(res => setProductList(res.data))
      .catch(err => console.error('Product fetch failed:', err));
  }, []);

  // Fetch pending orders
  const fetchPendingOrders = useCallback(async () => {
    try {
      const response = await axios.get('/api/orders');
      const orders = Array.isArray(response.data) ? response.data : [];
      
      // Group orders by ID and filter pending EasyPaisa orders
      const groupedOrders = orders.reduce((acc, order) => {
        if (!acc[order.id]) {
          acc[order.id] = {
            id: order.id,
            buyer_name: order.buyer_name,
            buyer_email: order.buyer_email,
            buyer_phone: order.buyer_phone,
            buyer_address: order.buyer_address,
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
      
      const pendingEasyPaisaOrders = Object.values(groupedOrders).filter(
        order => order.payment_method === 'easypaisa' && order.status === 'pending'
      );
      
      setPendingOrders(pendingEasyPaisaOrders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  }, []);

  // Confirm EasyPaisa payment
  const confirmPayment = async (orderId) => {
    if (!window.confirm('Confirm that payment has been received for this order?')) {
      return;
    }

    setConfirmingPayment(orderId);

    try {
      // Confirm payment in database (this also triggers the confirmation email on the backend)
      await axios.put(`/api/orders/${orderId}/confirm`);

      alert('Payment confirmed! Email has been sent to admin only. Please contact the customer directly to arrange delivery.');

      // Refresh pending orders
      fetchPendingOrders();

    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment. Please try again.');
    } finally {
      setConfirmingPayment(null);
    }
  };

  useEffect(() => {
    // Initial load
    fetchCollections();
    fetchProducts();
    fetchPendingOrders();
  }, []); // Empty dependency array to run only once on mount

  // Sorting and filtering logic
  const filteredProducts = (Array.isArray(productList) ? productList : [])
    .filter(prod => prod.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return Number(a.price) - Number(b.price);
      if (sortBy === 'oldest') return a.id - b.id;
      // Default: newest first
      return b.id - a.id;
    });

  return (
    <>
      {/* Pending EasyPaisa Orders Section */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>🔔 Pending EasyPaisa Payments ({pendingOrders.length})</h3>
          <button 
            onClick={() => setShowPendingOrders(!showPendingOrders)}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showPendingOrders ? 'Hide' : 'Show'} Pending Orders
          </button>
        </div>
        
        {showPendingOrders && (
          <div>
            {pendingOrders.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No pending EasyPaisa payments</p>
            ) : (
              pendingOrders.map(order => (
                <div key={order.id} style={{ 
                  border: '1px solid #dee2e6', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Order #{order.id}</h4>
                      <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                        <strong>Customer:</strong> {order.buyer_name} | <strong>Phone:</strong> {order.buyer_phone}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                        <strong>Email:</strong> {order.buyer_email}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                        <strong>Address:</strong> {order.buyer_address}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#28a745', fontWeight: 'bold' }}>
                        <strong>Total Amount:</strong> PKR {order.total_amount}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                        <strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => confirmPayment(order.id)}
                      disabled={confirmingPayment === order.id}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: confirmingPayment === order.id ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: confirmingPayment === order.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        opacity: confirmingPayment === order.id ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        if (confirmingPayment !== order.id) {
                          e.target.style.backgroundColor = '#218838';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (confirmingPayment !== order.id) {
                          e.target.style.backgroundColor = '#28a745';
                        }
                      }}
                    >
                      {confirmingPayment === order.id ? (
                        <>
                          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}>⏳</span>
                          Processing...
                        </>
                      ) : (
                        '✅ Confirm Payment'
                      )}
                    </button>
                  </div>
                  
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Items:</h5>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '0.25rem 0',
                        borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <span>{item.product_name} {item.quantity > 1 && `(x${item.quantity})`}</span>
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>PKR {item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <h2>Create Product</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="product-image" className="custom-file-label">Choose Image *</label>
        <input
          type="file"
          id="product-image"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        {selectedFileName && (
          <span className="file-name">{selectedFileName}</span>
        )}
        {preview && <img src={preview} alt="Preview" style={{ width: 200, height: 200, objectFit: 'cover' }} />}
        
        <input 
          type="text" 
          name="name" 
          placeholder="Product Name *" 
          value={formData.name}
          onChange={handleChange} 
          required
        />
        
        <textarea 
          name="description" 
          placeholder="Product Description * (minimum 40 characters)" 
          value={formData.description}
          onChange={handleChange} 
          maxLength={50}
          minLength={40}
          required
          rows="4"
        />
        {formData.description && (
          <small style={{ 
            color: formData.description.length < 40 ? 'red' : 'green',
            display: 'block',
            marginTop: '0.25rem'
          }}>
            {formData.description.length}/40 characters minimum ({formData.description.length >= 40 ? '✓' : `${40 - formData.description.length} more needed`})
          </small>
        )}
        
        <input 
          type="number" 
          name="price" 
          placeholder="Price (PKR) *" 
          value={formData.price}
          onChange={handleChange} 
          min="1"
          step="0.01"
          required
        />
        
        <select 
          name="collection_id" 
          onChange={handleChange} 
          value={formData.collection_id}
          required
        >
          <option value="">Select Collection *</option>
          {(Array.isArray(collections) ? collections : []).map(col => (
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>
        
        <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
          <small style={{ color: '#6c757d' }}>
            <strong>Note:</strong> All fields marked with * are required. Please fill out all information before submitting.
          </small>
        </div>
        
        <button 
          type="submit" 
          style={{ 
            marginTop: '2rem', 
            padding: '1rem 2rem', 
            background: 'linear-gradient(135deg, #d4af37 0%, #f2d06b 100%)',
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
          }}
          onMouseDown={(e) => {
            e.target.style.transform = 'translateY(0) scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1)';
          }}
        >
          ✨ Upload Product
        </button>
      </form>

      <h3 style={{ marginTop: '2rem' }}>Your Products</h3>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.5em 1em', borderRadius: 6, border: '1px solid #bbb', fontSize: '1rem' }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '0.5em 1em', borderRadius: 6, border: '1px solid #bbb', fontSize: '1rem' }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name (A-Z)</option>
          <option value="price">Price (Low-High)</option>
        </select>
      </div>
      <div className="admin-products-grid">
        {filteredProducts.map(prod => {
          const collection = collections.find(c => c.id === prod.collection_id);
          return (
            <AdminProductCard
              key={prod.id}
              prod={prod}
              collection={collection}
              hovered={hovered}
              setHovered={setHovered}
              deleteProduct={deleteProduct}
              onDoubleClick={() => navigate(`/admin/product/${prod.slug}`)}
            />
          );
        })}
      </div>
    </>
  );
}

function AdminProductCard({ prod, collection, hovered, setHovered, deleteProduct, onDoubleClick }) {
  const fallback = '/placeholder.png';
  const BASE_URL = 'http://localhost:5000';
  
  // Handle both Cloudinary and local images
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return fallback;
    
    // If it's already a full URL (Cloudinary), return as-is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Local image - add base URL
    return `${BASE_URL}${imageUrl}`;
  };
  
  const [imgSrc, setImgSrc] = React.useState(getImageUrl(prod.image_url));

  return (
    <div
      className="admin-product-card"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(prod.id)}
      onMouseLeave={() => setHovered(null)}
      onDoubleClick={onDoubleClick}
    >
      <img 
        src={imgSrc} 
        alt={prod.name} 
        style={{ width: 150, height: 150 }} 
        onError={() => setImgSrc(fallback)} 
      />
      <div>
        <h4>{prod.name}</h4>
        <p style={{ fontSize: '0.9rem' }}>
          <i>{collection ? collection.name : 'No Collection'}</i>
        </p>
      </div>
      {hovered === prod.id && (
        <button
          onClick={() => deleteProduct(prod.id)}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
}

export default AdminDashboard;