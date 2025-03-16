import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© {new Date().getFullYear()} Coupon Distribution System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;