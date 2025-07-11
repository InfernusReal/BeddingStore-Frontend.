import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getImageUrl, BASE_URL } from '../utils/api';
import './Products.css';
import SearchBar from '../components/SearchBar';

export default function Products() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [productsByCollection, setProductsByCollection] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if screen is mobile/tablet (≤900px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [popularRes, collectionsRes, productsRes] = await Promise.all([
          axios.get('/api/products/popular'),
          axios.get('/api/collections'),
          axios.get('/api/products'),
        ]);

        const popularArr = Array.isArray(popularRes.data) ? popularRes.data : [];
        // Filter out collections that should only show on homepage
        const collectionsArr = Array.isArray(collectionsRes.data)
          ? collectionsRes.data.filter(col => !col.show_on_homepage)
          : [];
        const productsArr = Array.isArray(productsRes.data) ? productsRes.data : [];

        const fixImage = (product) => {
          if (!product.image_url) return { ...product, image_url: '/placeholder.png' };

          let url = product.image_url;

          // If it's already a full URL (Cloudinary), leave it as-is
          if (url.startsWith('http')) {
            return { ...product, image_url: url };
          }

          // Fix double prefix for local images
          if (url.startsWith('/uploads/uploads/')) {
            url = url.replace('/uploads/uploads/', '/uploads/');
          }

          // Add uploads prefix if missing for local images
          if (!url.startsWith('/uploads/')) {
            url = `/uploads/${url.replace(/^uploads[\\/]+/, '').replace(/^\\+|^\/+/, '')}`;
          }

          return {
            ...product,
            image_url: url
          };
        };

        setPopularProducts(popularArr.map(fixImage));
        setCollections(collectionsArr);

        const byCollection = {};
        collectionsArr.forEach(col => {
          byCollection[String(col.id)] = {
            name: col.name,
            products: [],
          };
        });

        productsArr.map(fixImage).forEach(product => {
          const colId = String(product.collection_id);
          if (byCollection[colId]) {
            byCollection[colId].products.push(product);
          }
        });

        setProductsByCollection(byCollection);
        
        // Initialize current card index for mobile navigation
        const initialCardIndex = { popular: 0 };
        collectionsArr.forEach(col => {
          initialCardIndex[String(col.id)] = 0;
        });
        setCurrentCardIndex(initialCardIndex);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    }

    fetchData();
  }, []);

  // Mobile navigation functions
  const handlePrevCard = (collectionKey, totalProducts) => {
    setCurrentCardIndex(prev => ({
      ...prev,
      [collectionKey]: prev[collectionKey] > 0 ? prev[collectionKey] - 1 : totalProducts - 1
    }));
  };

  const handleNextCard = (collectionKey, totalProducts) => {
    setCurrentCardIndex(prev => ({
      ...prev,
      [collectionKey]: prev[collectionKey] < totalProducts - 1 ? prev[collectionKey] + 1 : 0
    }));
  };

  function ProductCard({ product }) {
    const fallback = '/placeholder.png';
    const [imgSrc, setImgSrc] = React.useState(
      getImageUrl(product.image_url) || fallback
    );
    const navigate = useNavigate();
    return (
      <div
        className="product-card enhanced-ecom-card"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/product/${product.slug}`)}
      >
        <div className="product-img-container">
          <img
            className="product-img"
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc(fallback)}
          />
        </div>
        <div className="product-card-content">
          <div className="product-card-info">
            <h3 className="product-title">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <strong className="product-price">PKR {product.price}</strong>
          </div>
          <div className="product-card-buttons">
            <button
              className="modern-btn"
              onClick={e => {
                e.stopPropagation();
                navigate(`/product/${product.slug}`);
              }}
            >
              Explore
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered products logic
  const filteredPopular = popularProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredByCollection = {};
  Object.entries(productsByCollection).forEach(([id, group]) => {
    filteredByCollection[id] = {
      ...group,
      products: group.products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    };
  });

  return (
    <div className="products-page" style={{ position: 'relative', minHeight: '100vh' }}>
      <SearchBar onSearch={setSearchTerm} />
      {filteredPopular.length > 0 && (
        <>
          <h2 className="collection-heading most-popular-heading collection-heading-animated" style={{
            fontSize: '2.2rem',
            margin: '2.5rem 0 1.5rem 0',
            letterSpacing: '1px',
            fontFamily: 'Inter, Arial, Helvetica, sans-serif',
            fontWeight: 700
          }}>
            Most Popular:
          </h2>
          {isMobile ? (
            // Mobile: Single card with navigation
            <div className="mobile-single-card">
              <ProductCard 
                key={filteredPopular[currentCardIndex.popular || 0]?.id} 
                product={filteredPopular[currentCardIndex.popular || 0]} 
              />
            </div>
          ) : (
            // Desktop: Full grid
            <div className="product-grid">
              {filteredPopular.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {isMobile && filteredPopular.length > 1 && (
            <div className="mobile-navigation">
              <button 
                className="nav-arrow nav-arrow-left"
                onClick={() => handlePrevCard('popular', filteredPopular.length)}
                disabled={filteredPopular.length <= 1}
              >
                ‹
              </button>
              <button 
                className="nav-arrow nav-arrow-right"
                onClick={() => handleNextCard('popular', filteredPopular.length)}
                disabled={filteredPopular.length <= 1}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

      {Object.entries(filteredByCollection).map(([id, group]) => (
        group.products.length > 0 && (
          <div key={id} className="collection-block">
            <h2 className="collection-title collection-heading-animated" style={{
              fontSize: '2.2rem',
              margin: '2.5rem 0 1.5rem 0',
              letterSpacing: '1px',
              fontFamily: 'Inter, Arial, Helvetica, sans-serif',
              fontWeight: 700
            }}>{group.name}</h2>
            {isMobile ? (
              // Mobile: Single card with navigation
              <>
                <div className="mobile-single-card">
                  <ProductCard 
                    key={group.products[currentCardIndex[id] || 0]?.id} 
                    product={group.products[currentCardIndex[id] || 0]} 
                  />
                </div>
                {group.products.length > 1 && (
                  <div className="mobile-navigation">
                    <button 
                      className="nav-arrow nav-arrow-left"
                      onClick={() => handlePrevCard(id, group.products.length)}
                      disabled={group.products.length <= 1}
                    >
                      ‹
                    </button>
                    <button 
                      className="nav-arrow nav-arrow-right"
                      onClick={() => handleNextCard(id, group.products.length)}
                      disabled={group.products.length <= 1}
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Desktop: Full grid
              <div className="product-grid">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )
      ))}
    </div>
  );
}