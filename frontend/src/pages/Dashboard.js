import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span className="welcome-text">Welcome back, User!</span>
          <div className="user-avatar">👤</div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Login History</h3>
          <p className="stat-number">12</p>
          <p className="stat-label">Last 30 days</p>
        </div>
        <div className="stat-card">
          <h3>Security Score</h3>
          <p className="stat-number">95%</p>
          <p className="stat-label">Excellent</p>
        </div>
        <div className="stat-card">
          <h3>Last Login</h3>
          <p className="stat-number">2h ago</p>
          <p className="stat-label">From Chrome</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">🔐</span>
              <div className="activity-details">
                <p className="activity-title">Successful Login</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🖼️</span>
              <div className="activity-details">
                <p className="activity-title">Image Verification</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">⚙️</span>
              <div className="activity-details">
                <p className="activity-title">Settings Updated</p>
                <p className="activity-time">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="security-section">
          <h2>Security Settings</h2>
          <div className="security-options">
            <div className="security-option">
              <div className="option-info">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
              </div>
              <button className="toggle-button">Enable</button>
            </div>
            <div className="security-option">
              <div className="option-info">
                <h3>Login Notifications</h3>
                <p>Get notified when someone logs into your account</p>
              </div>
              <button className="toggle-button active">Enabled</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 