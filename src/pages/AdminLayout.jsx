import React from 'react';
import { Outlet } from 'react-router-dom';
import './AdminDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarLinks = [
    { label: 'Products', path: '/admin' },
    { label: 'Collections', path: '/admin/collections' },
    { label: 'Announcements', path: '/admin/announcements' },
    { label: 'Profit Stats', path: '/admin/profits' },
    { label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="admin-dashboard">
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
      </aside>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
