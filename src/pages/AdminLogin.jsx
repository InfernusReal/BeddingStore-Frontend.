import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login(password);
    
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.message || 'Invalid password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        <div className="login-header">
          <h1 className="login-title">🔐 Admin Access</h1>
          <p className="login-subtitle">Enter your admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`password-input ${error ? 'error' : ''}`}
              placeholder="Enter admin password"
              disabled={isLoading}
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Verifying...
              </>
            ) : (
              'Access Admin Dashboard'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="hint-text">
            💡 Tip: Use <kbd>Ctrl+0</kbd> to quickly access admin login
          </p>
        </div>
      </div>
    </div>
  );
}
