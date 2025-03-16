import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = () => {
  const { logout } = useAuth();

  return (
    <div className="admin-navbar">
      <h2>Admin Panel</h2>
      <div className="admin-nav-links">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/admin/coupons" 
          className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}
        >
          Manage Coupons
        </NavLink>
        <NavLink 
          to="/admin/claims" 
          className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}
        >
          Claim History
        </NavLink>
      </div>
      <button className="logout-button" onClick={logout}>Logout</button>
    </div>
  );
};

export default AdminNavbar;