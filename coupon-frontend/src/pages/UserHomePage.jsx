import React from 'react';
import CouponClaim from '../components/user/CouponClaim';

const UserHomePage = () => {
  return (
    <div className="user-home-page">
      <div className="hero-section">
        <h1>Get Your Exclusive Discount</h1>
        <p>
          Claim a special discount coupon to use on your next purchase.
          New coupons are distributed daily on a first-come, first-served basis.
        </p>
      </div>
      
      <div className="claim-section">
        <CouponClaim />
      </div>
      
      <div className="info-section">
        <h2>How It Works</h2>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">1</div>
            <h3>Claim a Coupon</h3>
            <p>Click the claim button to get your unique discount coupon code.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">2</div>
            <h3>Copy Your Code</h3>
            <p>Save your coupon code to use during checkout.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">3</div>
            <h3>Enjoy Your Discount</h3>
            <p>Use your coupon code at checkout to receive your discount.</p>
          </div>
        </div>
        
        <div className="terms">
          <h3>Terms &amp; Conditions</h3>
          <ul>
            <li>One coupon per user every 24 hours</li>
            <li>Coupons are distributed on a first-come, first-served basis</li>
            <li>All coupons are subject to availability</li>
            <li>Coupons cannot be combined with other offers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserHomePage;