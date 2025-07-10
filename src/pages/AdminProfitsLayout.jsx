import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './AdminProfitsLayout.css';

function AdminProfitsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();
  
  const navigationLinks = [
    { label: 'Products', path: '/admin' },
    { label: 'Collections', path: '/admin/collections' },
    { label: 'Announcements', path: '/admin/announcements' },
    { label: 'Profit Stats', path: '/admin/profits' },
    { label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="admin-profits-layout">
      {/* Top Navigation Bar */}
      <header className="admin-top-nav">
        <div className="admin-nav-container">
          <div className="admin-nav-brand">
            <h2>Admin Dashboard</h2>
          </div>
          <nav className="admin-nav-links">
            {navigationLinks.map(link => (
              <button
                key={link.path}
                className={`admin-nav-btn${location.pathname === link.path ? ' active' : ''}`}
                onClick={() => navigate(link.path)}
                type="button"
              >
                {link.label}
              </button>
            ))}
            <button
              className="admin-logout-btn"
              onClick={handleLogout}
              type="button"
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content Area - Full Width */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminProfitsLayout;
