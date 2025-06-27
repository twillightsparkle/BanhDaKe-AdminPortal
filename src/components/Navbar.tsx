import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAdmin();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/products', label: 'Manage Products', icon: '📦' },
    { path: '/add-product', label: 'Add Product', icon: '➕' },
    { path: '/orders', label: 'Orders', icon: '📋' },
    { path: '/stock', label: 'Stock Management', icon: '📊' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>🛍️ Admin Portal</h2>
      </div>

      <div className="navbar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        <span className="user-info">
          <span className="user-icon">👤</span>
          {user?.username}
        </span>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
