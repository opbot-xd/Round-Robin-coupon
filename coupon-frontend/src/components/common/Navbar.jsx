import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Coupon Distribution
        </Link>

        <div className="navbar-links">
          {isAuthenticated && isAdminPath ? (
            <>
              <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/admin/coupons" className="nav-link">Coupons</Link>
              <Link to="/admin/claims" className="nav-link">Claims</Link>
              <button onClick={logout} className="nav-button">Logout</button>
            </>
          ) : (
            !isAdminPath && (
              <Link to="/admin/login" className="nav-link">Admin Login</Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;