import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getImageUrl } from '../utils/api';
import ProductDetailView from './ProductDetailView';
import './ProductDetail.css';

export default function ProductDetail() {
  // Fix image url like Products.jsx
  function fixImage(product) {
    if (!product?.image_url) return { ...product, image_url: '/placeholder.png' };
    
    return { ...product, image_url: getImageUrl(product.image_url) };
  }

  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    reviewer_name: '',
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  function handleAddToCart() {
    if (!product) return;
    
    console.log('🛒 PRODUCT PAGE: Add to cart button clicked!');
    console.log('🛒 PRODUCT PAGE: Product data:', product);
    console.log('🛒 PRODUCT PAGE: Quantity:', quantity);
    console.log('🛒 PRODUCT PAGE: window.addToCart exists?', !!window.addToCart);
    
    // Force call the database addToCart function
    if (window.addToCart) {
      console.log('🛒 PRODUCT PAGE: Calling window.addToCart');
      const productData = {
        id: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        image_url: product.image_url,
        description: product.description
      };
      window.addToCart(productData, quantity);
      
      // Force cart refresh
      localStorage.setItem('cartNeedsRefresh', 'true');
      localStorage.setItem('forceCartRefresh', 'true');
      
      // Dispatch a custom event to trigger cart refresh
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { action: 'add', product: product } }));
      
      alert(`Added ${quantity} piece(s) to cart!`);
    } else {
      console.log('🛒 PRODUCT PAGE: window.addToCart NOT AVAILABLE, using fallback');
      // Create a manual API call to add to cart
      addToCartManually(product, quantity);
    }
  }

  // Manual add to cart function
  const addToCartManually = async (product, quantity) => {
    try {
      console.log('🛒 MANUAL: Adding to cart via API call');
      
      const sessionId = localStorage.getItem('userSession') || 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      if (!localStorage.getItem('userSession')) {
        localStorage.setItem('userSession', sessionId);
      }
      
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

      console.log('🛒 MANUAL: Sending order data:', orderData);
      
      const response = await axios.post(getApiUrl('api/orders'), orderData);
      console.log('🛒 MANUAL: Success response:', response.data);
      
      // Force cart refresh
      localStorage.setItem('cartNeedsRefresh', 'true');
      localStorage.setItem('forceCartRefresh', 'true');
      
      // Dispatch a custom event to trigger cart refresh
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { action: 'add', product: product } }));
      
      alert(`Added ${quantity} piece(s) to cart!`);
      
    } catch (error) {
      console.error('🛒 MANUAL: Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
    }
  };

  // New function to fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await axios.get(getApiUrl(`/api/reviews/product/${slug}`));
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // Function to handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.reviewer_name.trim() || !newReview.comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await axios.post(getApiUrl('/api/reviews'), {
        product_slug: slug,
        reviewer_name: newReview.reviewer_name.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });
      
      // Reset form
      setNewReview({
        reviewer_name: '',
        rating: 5,
        comment: ''
      });
      
      // Refresh reviews
      fetchReviews();
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Function to render star rating
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={interactive ? () => onStarClick(index + 1) : undefined}
      >
        ★
      </span>
    ));
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(getApiUrl(`/api/products/slug/${slug}`));
        setProduct(res.data);
      } catch (err) {
        setProduct(null);
      }
    }
    fetchProduct();
    fetchReviews();
  }, [slug]);

  // Add .slug-dark class to body and navbar for this route only
  useEffect(() => {
    document.body.classList.add('slug-dark');
    const nav = document.querySelector('.navbar');
    if (nav) nav.classList.add('slug-dark');
    return () => {
      document.body.classList.remove('slug-dark');
      if (nav) nav.classList.remove('slug-dark');
    };
  }, []);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }
function handleBuyNow() {
  const fixed = fixImage(product);

  const productData = [{
    name: fixed.name,
    price: fixed.price,
    slug: fixed.slug,
    image_url: fixed.image_url,
    quantity: quantity
  }];

  const totalPrice = fixed.price * quantity;

  sessionStorage.setItem('buyNowProduct', JSON.stringify(productData));
  sessionStorage.setItem('totalPrice', totalPrice.toString());
  sessionStorage.setItem('allowCheckout', 'true');

  navigate('/checkout');
}
  return (
    <div className="product-detail-page slug-dark">
      <ProductDetailView product={fixImage(product)} editMode={false} />
      
      {/* Product Actions Container - Properly Centered */}
      <div className="product-actions-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        {/* Responsive Quantity Selector */}
        <div className="quantity-selector responsive-quantity" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '600px'
        }}>
          <label style={{ 
            color: '#fff', 
            fontSize: '1.2rem', 
            fontWeight: 600,
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}>
            Quantity:
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                color: '#fff',
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)',
                touchAction: 'manipulation'
              }}
            >
              −
            </button>
            <span style={{
              color: '#fff',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              minWidth: '50px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              letterSpacing: '1px'
            }}>
              {quantity}
            </span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                color: '#fff',
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)',
                touchAction: 'manipulation'
              }}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Responsive Action Buttons */}
        <div className="product-detail-actions responsive-actions" style={{ 
          display: 'flex', 
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '600px'
        }}>
          <button 
            className="add-to-cart responsive-btn" 
            onClick={handleAddToCart}
            style={{
              background: 'transparent',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: '14px',
              padding: '1.2rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              minWidth: '200px',
              minHeight: '54px',
              touchAction: 'manipulation',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add {quantity} to Cart
          </button>
          <button 
            className="buy-now responsive-btn" 
            onClick={handleBuyNow}
            style={{
              background: 'transparent',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: '14px',
              padding: '1.2rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              minWidth: '200px',
              minHeight: '54px',
              touchAction: 'manipulation',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Buy Now - PKR {(product?.price * quantity).toLocaleString()}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="reviews-summary">
              <div className="average-rating">
                {renderStars(Math.round(averageRating))}
                <span className="rating-text">{averageRating} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            </div>
          )}
        </div>

        {/* Add Review Form */}
        <div className="add-review-form">
          <h3>Write a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <label htmlFor="reviewer-name">Your Name</label>
              <input
                type="text"
                id="reviewer-name"
                value={newReview.reviewer_name}
                onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Rating</label>
              <div className="star-rating">
                {renderStars(newReview.rating, true, (rating) => setNewReview({ ...newReview, rating }))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="review-comment">Your Review</label>
              <textarea
                id="review-comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                rows="4"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-review-btn"
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.reviewer_name}</span>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
