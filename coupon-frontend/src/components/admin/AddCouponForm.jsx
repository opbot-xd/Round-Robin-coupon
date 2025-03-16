import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { addCoupon } from '../../services/api';

const AddCouponForm = ({ onCouponAdded }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    
    setLoading(true);
    
    try {
      await addCoupon(formData);
      toast.success('Coupon added successfully');
      setFormData({
        code: '',
        description: ''
      });
      if (onCouponAdded) onCouponAdded();
    } catch (error) {
      toast.error(error.message || 'Failed to add coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-coupon-form">
      <h3>Add New Coupon</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="code">Coupon Code</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            placeholder="e.g., SUMMER25"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., 25% off summer collection"
            rows="3"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Coupon'}
        </button>
      </form>
    </div>
  );
};

export default AddCouponForm;