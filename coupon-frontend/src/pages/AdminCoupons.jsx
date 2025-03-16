import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/admin/AdminNavbar';
import AddCouponForm from '../components/admin/AddCouponForm';
import CouponList from '../components/admin/CouponList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAllCoupons } from '../services/api';
import { toast } from 'react-toastify';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="admin-coupons">
      <AdminNavbar />
      <div className="coupons-content">
        <h1>Manage Coupons</h1>
        
        <AddCouponForm onCouponAdded={fetchCoupons} />
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <CouponList coupons={coupons} onCouponUpdated={fetchCoupons} />
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;