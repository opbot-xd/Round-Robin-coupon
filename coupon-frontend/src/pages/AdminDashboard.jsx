// File: src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAllCoupons, getClaimHistory } from '../services/api';
import AdminNavbar from '../components/admin/AdminNavbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    claimedCoupons: 0,
    totalClaims: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coupons, claims] = await Promise.all([
          getAllCoupons(),
          getClaimHistory()
        ]);
        
        setStats({
          totalCoupons: coupons.length,
          activeCoupons: coupons.filter(c => c.isActive).length,
          claimedCoupons: coupons.filter(c => c.isUsed).length,
          totalClaims: claims.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="dashboard-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-content">
        <h1>Dashboard</h1>
        
        <div className="stats-cards">
          <div className="stat-card">
            <h2>{stats.totalCoupons}</h2>
            <p>Total Coupons</p>
          </div>
          
          <div className="stat-card">
            <h2>{stats.activeCoupons}</h2>
            <p>Active Coupons</p>
          </div>
          
          <div className="stat-card">
            <h2>{stats.claimedCoupons}</h2>
            <p>Claimed Coupons</p>
          </div>
          
          <div className="stat-card">
            <h2>{stats.totalClaims}</h2>
            <p>Total Claims</p>
          </div>
        </div>
        
        <div className="dashboard-summary">
          <h2>System Overview</h2>
          <p>
            The coupon distribution system is {stats.activeCoupons > 0 ? 'active' : 'inactive'} with 
            {stats.activeCoupons > 0 ? ` ${stats.activeCoupons} coupons available for users to claim.` : ' no active coupons.'}
          </p>
          <p>
            {stats.claimedCoupons} out of {stats.totalCoupons} coupons have been claimed so far.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// File: src/pages/AdminCoupons.jsx


// File: src/pages/AdminClaims.jsx
