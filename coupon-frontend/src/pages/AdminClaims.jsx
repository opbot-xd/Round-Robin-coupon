import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/admin/AdminNavbar';
import ClaimHistory from '../components/admin/ClaimHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getClaimHistory } from '../services/api';
import { toast } from 'react-toastify';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await getClaimHistory();
        setClaims(data);
      } catch (error) {
        toast.error('Failed to fetch claim history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClaims();
  }, []);

  return (
    <div className="admin-claims">
      <AdminNavbar />
      <div className="claims-content">
        <h1>Claim History</h1>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ClaimHistory claims={claims} />
        )}
      </div>
    </div>
  );
};

export default AdminClaims;