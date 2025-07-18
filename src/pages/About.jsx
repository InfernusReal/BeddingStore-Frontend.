import React from 'react';
import { useNavigate } from 'react-router-dom';
// CSS imported globally in App.jsx

export default function About() {
  const navigate = useNavigate();

  const handleExploreCollections = () => {
    navigate('/products');
  };

  const handleSocialClick = (platform) => {
    const socialLinks = {
      instagram: 'https://www.instagram.com/thebeddingstorebybs/',
      facebook: 'https://www.facebook.com/profile.php?id=61577904336330',
      twitter: 'https://x.com/thebeddingstore',
      whatsapp: 'https://api.whatsapp.com/send/?phone=923215088506&text=Hello'
    };
    window.open(socialLinks[platform], '_blank');
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Luxury Redefined</h1>
          <p className="hero-subtitle">Crafting Dreams in Every Thread</p>
          <div className="hero-description">
            Where comfort meets elegance, and every night becomes a sanctuary of luxury
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="brand-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2 className="section-title">Our Story</h2>
              <div className="story-text">
                <p className="lead-text">
                  Born from a passion for perfection, BnS represents the pinnacle of luxury bedding across Pakistan and beyond.
                </p>
                <p>
                  We believe that exceptional sleep is not a luxury—it's a necessity. Every thread we weave, every fabric we select, and every design we create is meticulously crafted to transform your bedroom into a haven of unparalleled comfort and sophistication.
                </p>
                <p>
                  From the bustling streets of Karachi to the serene valleys of the North, and extending our reach internationally, we've made it our mission to bring world-class bedding to those who refuse to compromise on quality.
                </p>
              </div>
              <div className="story-stats">
                <div className="stat">
                  <span className="stat-number">50,000+</span>
                  <span className="stat-label">Happy Customers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Cities Served</span>
                </div>
              </div>
            </div>
            <div className="story-visual">
              <div className="visual-card">
                <div className="card-content">
                  <h3>Premium Materials</h3>
                  <p>Sourced from the finest mills worldwide</p>
                </div>
              </div>
              <div className="visual-card">
                <div className="card-content">
                  <h3>Artisan Craftsmanship</h3>
                  <p>Hand-finished details in every piece</p>
                </div>
              </div>
              <div className="visual-card">
                <div className="card-content">
                  <h3>Timeless Design</h3>
                  <p>Elegance that transcends trends</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title centered">What Sets Us Apart</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Uncompromising Quality</h3>
              <p>Every thread counts. Our rigorous quality control ensures that only the finest products bear the BnS name.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Global Standards</h3>
              <p>International quality meets local expertise, bringing you bedding that rivals the world's finest hotels.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎨</div>
              <h3>Timeless Design</h3>
              <p>Our designs transcend fleeting trends, offering sophisticated elegance that ages beautifully.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🏠</div>
              <h3>Personalized Service</h3>
              <p>From consultation to delivery, we ensure your experience is as luxurious as our products.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Sustainable Luxury</h3>
              <p>Responsibility meets refinement in our eco-conscious approach to luxury bedding.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>Constantly evolving, we embrace new technologies while honoring traditional craftsmanship.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="experience-section">
        <div className="container">
          <div className="experience-content">
            <div className="experience-text">
              <h2 className="section-title">The BnS Experience</h2>
              <p className="experience-description">
                Step into a world where every detail matters. From the moment you explore our collections to the first night you sleep on our sheets, we're committed to exceeding your expectations.
              </p>
              <div className="experience-features">
                <div className="feature">
                  <div className="feature-icon">📦</div>
                  <div className="feature-content">
                    <h4>Premium Packaging</h4>
                    <p>Unboxing that feels like unwrapping a gift</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">🚚</div>
                  <div className="feature-content">
                    <h4>Swift Delivery</h4>
                    <p>From Lahore to London, we deliver luxury to your doorstep</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">💎</div>
                  <div className="feature-content">
                    <h4>Lifetime Support</h4>
                    <p>Our relationship doesn't end at purchase</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="experience-visual">
              <div className="luxury-showcase">
                <div className="showcase-item active">
                  <h3>Egyptian Cotton</h3>
                  <p>Sourced from the Nile Delta's finest</p>
                </div>
                <div className="showcase-item">
                  <h3>Bamboo Silk</h3>
                  <p>Naturally hypoallergenic luxury</p>
                </div>
                <div className="showcase-item">
                  <h3>Organic Linen</h3>
                  <p>Breathable elegance for all seasons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <div className="container">
          <div className="vision-content">
            <h2 className="section-title">Our Vision</h2>
            <p className="vision-text">
              To be Pakistan's premier luxury bedding destination and a globally recognized symbol of quality, 
              comfort, and sophisticated design. We envision a world where exceptional sleep is accessible 
              to all who value quality, and where BnS becomes synonymous with the art of beautiful living.
            </p>
            <div className="vision-quote">
              <blockquote>
                "Luxury is not about having the most expensive things. It's about having things that bring you joy, comfort, and a sense of completeness."
              </blockquote>
              <cite>— BnS Design Philosophy</cite>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Sleep?</h2>
            <p>Join thousands of satisfied customers who have elevated their bedroom experience with BnS.</p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={handleExploreCollections}>
                Explore Collections
              </button>
            </div>
            
            {/* Social Media Links */}
            <div className="social-links">
              <p className="social-text">Follow us for the latest updates</p>
              <div className="social-icons">
                <button 
                  className="social-btn instagram"
                  onClick={() => handleSocialClick('instagram')}
                  aria-label="Follow us on Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                
                <button 
                  className="social-btn facebook"
                  onClick={() => handleSocialClick('facebook')}
                  aria-label="Follow us on Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                
                <button 
                  className="social-btn twitter"
                  onClick={() => handleSocialClick('twitter')}
                  aria-label="Follow us on X (Twitter)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                  </svg>
                </button>
                
                <button 
                  className="social-btn whatsapp"
                  onClick={() => handleSocialClick('whatsapp')}
                  aria-label="Contact us on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                </button>
              </div>
              
              {/* Made by InfernusReal */}
              <div className="made-by-section">
                <span 
                  className="made-by-text"
                  onClick={() => window.open('https://www.infernusreal.com', '_blank')}
                  role="button"
                  tabIndex="0"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.open('https://www.infernusreal.com', '_blank');
                    }
                  }}
                >
                  made by InfernusReal
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
