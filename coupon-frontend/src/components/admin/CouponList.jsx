import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { updateCoupon } from '../../services/api';

const CouponList = ({ coupons, onCouponUpdated }) => {
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon._id);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      isActive: coupon.isActive
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCancel = () => {
    setEditingCoupon(null);
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      await updateCoupon(id, formData);
      toast.success('Coupon updated successfully');
      setEditingCoupon(null);
      if (onCouponUpdated) onCouponUpdated();
    } catch (error) {
      toast.error(error.message || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await updateCoupon(coupon._id, { 
        ...coupon, 
        isActive: !coupon.isActive 
      });
      toast.success(`Coupon ${coupon.isActive ? 'disabled' : 'enabled'} successfully`);
      if (onCouponUpdated) onCouponUpdated();
    } catch (error) {
      toast.error(error.message || 'Failed to update coupon status');
    }
  };

  return (
    <div className="coupon-list">
      <h3>Available Coupons</h3>
      
      {coupons.length === 0 ? (
        <p className="no-coupons">No coupons available</p>
      ) : (
        <div className="table-container">
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Status</th>
                <th>Used</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className={coupon.isUsed ? 'used-coupon' : ''}>
                  {editingCoupon === coupon._id ? (
                    <td colSpan="6">
                      <form onSubmit={(e) => handleSubmit(e, coupon._id)} className="edit-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Code</label>
                            <input
                              type="text"
                              name="code"
                              value={formData.code}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Description</label>
                            <input
                              type="text"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                            />
                          </div>
                          
                          <div className="form-group checkbox">
                            <label>
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                              />
                              Active
                            </label>
                          </div>
                          
                          <div className="form-actions">
                            <button type="submit" disabled={loading}>
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" onClick={handleCancel}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td>{coupon.code}</td>
                      <td>{coupon.description}</td>
                      <td>
                        <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${coupon.isUsed ? 'used' : 'unused'}`}>
                          {coupon.isUsed ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{new Date(coupon.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="edit-button"
                            disabled={coupon.isUsed}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(coupon)}
                            className={`status-button ${coupon.isActive ? 'deactivate' : 'activate'}`}
                            disabled={coupon.isUsed}
                          >
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CouponList;