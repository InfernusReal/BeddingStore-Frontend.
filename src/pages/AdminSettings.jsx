import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { getApiUrl } from '../utils/api';
import './AdminSettings.css';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { logout } = useAdminAuth();

  useEffect(() => {
    fetchAccessLogs();
  }, []);

  const fetchAccessLogs = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/access-logs'));
      if (response.ok) {
        const logs = await response.json();
        setAccessLogs(logs);
      }
    } catch (error) {
      console.error('Error fetching access logs:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(getApiUrl('/api/admin/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully! You will be logged out in 3 seconds.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Auto logout after password change
        setTimeout(() => {
          logout();
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (success) => {
    return (
      <span className={`status-badge ${success ? 'success' : 'failed'}`}>
        {success ? '✅ Success' : '❌ Failed'}
      </span>
    );
  };

  return (
    <div className="admin-settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">⚙️ Admin Settings</h1>
          <p className="settings-subtitle">Manage your admin credentials and monitor access</p>
        </div>

        {/* Password Change Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">🔐 Change Admin Password</h2>
            <p className="section-subtitle">Update your admin login password</p>
          </div>

          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="currentPassword" className="input-label">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="newPassword" className="input-label">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className="update-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Access Logs Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">📊 Access Logs</h2>
            <p className="section-subtitle">Monitor admin login attempts and access history</p>
            <button 
              onClick={fetchAccessLogs}
              className="refresh-btn"
            >
              🔄 Refresh Logs
            </button>
          </div>

          <div className="logs-container">
            {accessLogs.length === 0 ? (
              <div className="no-logs">
                <div className="no-logs-icon">📋</div>
                <h3>No Access Logs</h3>
                <p>Access attempts will appear here</p>
              </div>
            ) : (
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>IP Address</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLogs.map((log, index) => (
                      <tr key={index} className="log-row">
                        <td className="log-date">{formatDate(log.timestamp)}</td>
                        <td className="log-ip">{log.ip}</td>
                        <td className="log-location">{log.location || 'Unknown'}</td>
                        <td className="log-status">{getStatusBadge(log.success)}</td>
                        <td className="log-agent">{log.userAgent || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
