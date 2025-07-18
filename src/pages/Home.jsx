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

  const handleSocialClick = (platform) => {
    const socialLinks = {
      whatsapp: 'https://api.whatsapp.com/send/?phone=923005079539&text=Hello+there%21+I+am+interested+in+your+services'
    };
    window.open(socialLinks[platform], '_blank');
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
        
        {/* WhatsApp Contact Button */}
        <div className="hero-whatsapp-floating">
          <button 
            className="hero-whatsapp-btn"
            onClick={() => handleSocialClick('whatsapp')}
            aria-label="Contact us on WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
            </svg>
            <span className="hero-whatsapp-text">Chat with us</span>
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