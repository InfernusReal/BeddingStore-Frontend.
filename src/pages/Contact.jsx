import React, { useState } from 'react';
import { getApiUrl } from '../utils/api';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message
        });
        setFormData({ name: '', phone: '', message: '' }); // Clear form
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Get in Touch</h1>
          <p className="hero-subtitle">Let's Create Your Dream Bedroom Together</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>We'd Love to Hear From You</h2>
              
              <div className="contact-features">
                <div className="feature-item">
                  <div className="feature-icon">💬</div>
                  <div className="feature-text">
                    <h4>Quick Response</h4>
                    <p>We typically respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-text">
                    <h4>Expert Guidance</h4>
                    <p>Professional advice for your bedding needs</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🏆</div>
                  <div className="feature-text">
                    <h4>Premium Service</h4>
                    <p>Luxury experience from inquiry to delivery</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <h3>Send Us a Message</h3>
                
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <span className="label-text">Full Name</span>
                    <span className="label-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    <span className="label-text">Phone Number</span>
                    <span className="label-required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +92 300 1234567"
                    required
                    className="form-input"
                  />
                  <small className="input-hint">
                    Include country code for international numbers
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    <span className="label-text">Your Message</span>
                    <span className="label-required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your bedding needs, questions, or how we can help you..."
                    required
                    rows="5"
                    className="form-textarea"
                    minLength="10"
                  />
                  <small className="input-hint">
                    Minimum 10 characters ({formData.message.length}/10)
                  </small>
                </div>

                {submitStatus && (
                  <div className={`status-message ${submitStatus.type}`}>
                    <div className="status-icon">
                      {submitStatus.type === 'success' ? '✅' : '❌'}
                    </div>
                    <p>{submitStatus.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📤</span>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="additional-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🕒</div>
              <h4>Response Time</h4>
              <p>We aim to respond to all inquiries within 24 hours during business days.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🚚</div>
              <h4>Delivery Information</h4>
              <p>Ask us about delivery options and timelines for your location across Pakistan.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">💎</div>
              <h4>Custom Orders</h4>
              <p>Interested in bespoke bedding? Let us know your requirements for a personalized quote.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
