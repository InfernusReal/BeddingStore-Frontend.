import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './AdminDashboard.css';

const sidebarLinks = [
  { label: 'Products', path: '/admin' },
  { label: 'Announcements', path: '/admin/announcements' },
  { label: 'Profit Stats', path: '/admin/profits' },
  { label: 'System', path: '/admin/system' },
  { label: 'Settings', path: '/admin/settings' },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/', { replace: true });
    }
  };

  return (
    <aside className="admin-sidebar">
      {sidebarLinks.map(link => (
        <button
          key={link.path}
          className={`admin-sidebar-btn${location.pathname === link.path ? ' active' : ''}`}
          onClick={() => navigate(link.path)}
          type="button"
        >
          {link.label}
        </button>
      ))}
      
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={handleLogout}
          type="button"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
