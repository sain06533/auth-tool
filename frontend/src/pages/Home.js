import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Auth Tool</h1>
        <p className="subtitle">Secure Authentication with Image-Based Verification</p>
        <div className="features">
          <div className="feature-card">
            <i className="feature-icon">🔒</i>
            <h3>Secure Login</h3>
            <p>Multi-step authentication process for enhanced security</p>
          </div>
          <div className="feature-card">
            <i className="feature-icon">🖼️</i>
            <h3>Image Verification</h3>
            <p>Select and mark points on images for secure verification</p>
          </div>
          <div className="feature-card">
            <i className="feature-icon">⚡</i>
            <h3>Fast & Reliable</h3>
            <p>Quick and efficient authentication process</p>
          </div>
        </div>
      </div>
      <div className="cta-section">
        <h2>Get Started Today</h2>
        <p>Join thousands of users who trust our authentication system</p>
        <div className="cta-buttons">
          <button className="cta-button primary" onClick={() => navigate('/register')}>Register Now</button>
          <button className="cta-button secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default Home; 