import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { claimCoupon } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import CooldownTimer from './CooldownTimer';

const CouponClaim = () => {
  const [loading, setLoading] = useState(false);
  const [claimedCoupon, setClaimedCoupon] = useState(null);
  const [cooldown, setCooldown] = useState(null);
  const [error, setError] = useState(null);

  const handleClaimCoupon = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await claimCoupon();
      setClaimedCoupon(response.coupon);
      toast.success('Successfully claimed a coupon!');
      localStorage.setItem('lastClaimTime', Date.now().toString());
    } catch (error) {
      setError(error.message || 'Failed to claim coupon');
      
      if (error.cooldownRemaining) {
        setCooldown(error.cooldownRemaining);
        localStorage.setItem('lastClaimTime', (Date.now() - ((24 * 60 * 60 * 1000) - error.cooldownRemaining)).toString());
      }
      
      toast.error(error.message || 'Failed to claim coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-claim-container">
      <h2>Get Your Free Coupon</h2>
      <p className="coupon-description">
        Claim one of our exclusive discount coupons. Remember, you can only claim one coupon every 24 hours.
      </p>
      
      {claimedCoupon ? (
        <div className="claimed-coupon">
          <h3>Congratulations!</h3>
          <div className="coupon-card">
            <div className="coupon-code">{claimedCoupon.code}</div>
            <p className="coupon-description">{claimedCoupon.description}</p>
          </div>
          <p className="coupon-note">Copy this code and use it at checkout.</p>
        </div>
      ) : cooldown ? (
        <div className="cooldown-container">
          <h3>Cooldown Period</h3>
          <p>You need to wait before claiming another coupon:</p>
          <CooldownTimer initialTimeRemaining={cooldown} onComplete={() => setCooldown(null)} />
        </div>
      ) : (
        <button 
          className="claim-button" 
          onClick={handleClaimCoupon} 
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : 'Claim Coupon'}
        </button>
      )}
      
      {error && !cooldown && (
        <p className="error-message">{error}</p>
      )}
    </div>
  );
};

export default CouponClaim;