import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getImageUrl } from '../utils/api';
// CSS imported globally in App.jsx

const heroImages = [
  'https://bedding-store-frontend.vercel.app/hero_files/image1.png',
  'https://bedding-store-frontend.vercel.app/hero_files/image2.png',
  'https://bedding-store-frontend.vercel.app/hero_files/image3.png',
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [collections, setCollections] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 600 && window.innerWidth <= 900);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
      setIsTablet(window.innerWidth > 600 && window.innerWidth <= 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prevIdx) => (prevIdx + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const colRes = await axios.get(getApiUrl('/api/collections'));
        const prodRes = await axios.get(getApiUrl('/api/products'));

        console.log('🛍️ Products data:', prodRes.data);
        console.log('🛍️ Sample product images:', prodRes.data.slice(0, 3).map(p => ({ name: p.name, image_url: p.image_url })));

        const merged = colRes.data
          .filter(col => col.show_on_homepage)
          .map(col => ({
            ...col,
            products: prodRes.data.filter(prod => prod.collection_id === col.id)
          }));

        setCollections(merged);
        
        // Initialize card indices for each collection
        const initialIndices = {};
        merged.forEach(col => {
          initialIndices[col.id] = 0;
        });
        setCurrentCardIndex(initialIndices);
      } catch (err) {
        console.error('Failed to fetch:', err);
      }
    }

    fetchCollections();
  }, []);

  const handlePrevCard = (collectionId, totalCards) => {
    setCurrentCardIndex(prev => {
      const current = prev[collectionId] || 0;
      if (isTablet) {
        // For tablet, move by 4 cards
        return {
          ...prev,
          [collectionId]: current >= 4 ? current - 4 : 0
        };
      } else {
        // For mobile, move by 1 card
        return {
          ...prev,
          [collectionId]: current > 0 ? current - 1 : totalCards - 1
        };
      }
    });
  };

  const handleNextCard = (collectionId, totalCards) => {
    setCurrentCardIndex(prev => {
      const current = prev[collectionId] || 0;
      if (isTablet) {
        // For tablet, move by 4 cards
        return {
          ...prev,
          [collectionId]: current + 4 < totalCards ? current + 4 : current
        };
      } else {
        // For mobile, move by 1 card
        return {
          ...prev,
          [collectionId]: (current + 1) % totalCards
        };
      }
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-slider">
          <img
            src={heroImages[current]}
            alt="Hero Background"
            className="hero-bg"
          />
        </div>
        <div className="hero-content">
          <h1 className="hero-headline">Welcome to the Bedding Store.</h1>
          <p className="hero-subheadline">
            Discover premium collections, unique products, and the latest announcements.
          </p>
          <button className="hero-cta" onClick={() => navigate('/products')}>
            Shop Now
          </button>
        </div>
      </section>

      {/* Collection Showcase */}
      <div className="collections-wrapper">
        {collections.map((col) => (
          <section key={col.id} className="collection-block">
            <h2 className="collection-heading-animated">{col.name}</h2>

            <div className="product-carousel-wrapper">
              {isMobile && col.products.length > 0 ? (
                // Mobile: Show one card at a time with navigation
                <>
                  <div className="product-grid mobile-single-card">
                    {col.products.length > 0 && (
                      <div
                        className="product-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${col.products[currentCardIndex[col.id] || 0].slug}`)}
                      >
                        <div className="product-card-content">
                          <img
                            className="product-img"
                            src={getImageUrl(col.products[currentCardIndex[col.id] || 0].image_url)}
                            alt={col.products[currentCardIndex[col.id] || 0].name}
                          />
                          <h3 className="product-title">{col.products[currentCardIndex[col.id] || 0].name}</h3>
                          <p className="desc">{col.products[currentCardIndex[col.id] || 0].description}</p>
                        </div>
                        <strong className="product-price">PKR {col.products[currentCardIndex[col.id] || 0].price}</strong>
                        <button
                          className="explore-btn"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/product/${col.products[currentCardIndex[col.id] || 0].slug}`);
                          }}
                        >
                          Explore
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {col.products.length > 1 && (
                    <div className="mobile-navigation">
                      {currentCardIndex[col.id] > 0 && (
                        <button
                          className="nav-arrow nav-arrow-left"
                          onClick={() => handlePrevCard(col.id, col.products.length)}
                          aria-label="Previous product"
                        >
                          ←
                        </button>
                      )}
                      {currentCardIndex[col.id] < col.products.length - 1 && (
                        <button
                          className="nav-arrow nav-arrow-right"
                          onClick={() => handleNextCard(col.id, col.products.length)}
                          aria-label="Next product"
                        >
                          →
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : isTablet && col.products.length > 0 ? (
                // Tablet: Show 3-4 cards with scroll navigation
                <>
                  <div className="product-grid tablet-multi-card">
                    {col.products.slice(currentCardIndex[col.id] || 0, (currentCardIndex[col.id] || 0) + 4).map((prod) => (
                      <div
                        key={prod.id}
                        className="product-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${prod.slug}`)}
                      >
                        <div className="product-card-content">
                          <img
                            className="product-img"
                            src={getImageUrl(prod.image_url)}
                            alt={prod.name}
                          />
                          <h3 className="product-title">{prod.name}</h3>
                          <p className="desc">{prod.description}</p>
                        </div>
                        <strong className="product-price">PKR {prod.price}</strong>
                        <button
                          className="explore-btn"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/product/${prod.slug}`);
                          }}
                        >
                          Explore
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {col.products.length > 4 && (
                    <div className="mobile-navigation">
                      {currentCardIndex[col.id] > 0 && (
                        <button
                          className="nav-arrow nav-arrow-left"
                          onClick={() => handlePrevCard(col.id, col.products.length)}
                          aria-label="Previous products"
                        >
                          ←
                        </button>
                      )}
                      {currentCardIndex[col.id] + 4 < col.products.length && (
                        <button
                          className="nav-arrow nav-arrow-right"
                          onClick={() => handleNextCard(col.id, col.products.length)}
                          aria-label="Next products"
                        >
                          →
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                // Desktop: Show all cards in grid
                <div className="product-grid">
                  {col.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="product-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${prod.slug}`)}
                    >
                      <div className="product-card-content">
                        <img
                          className="product-img"
                          src={getImageUrl(prod.image_url)}
                          alt={prod.name}
                        />
                        <h3 className="product-title">{prod.name}</h3>
                        <p className="desc">{prod.description}</p>
                      </div>
                      <strong className="product-price">PKR {prod.price}</strong>
                      <button
                        className="explore-btn"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/product/${prod.slug}`);
                        }}
                      >
                        Explore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}