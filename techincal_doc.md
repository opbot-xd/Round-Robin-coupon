# Coupon Distribution System - Technical Integration Guide

This document provides detailed technical information for developers working on integrating or extending the Coupon Distribution System.

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  React Frontend │◄────┤  Express API     │◄────┤  MongoDB        │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       │                        │                        │
       │                        │                        │
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Interface │     │  Authentication  │     │  Data Models    │
│  - Claim Page   │     │  - JWT Tokens    │     │  - Coupon       │
│  - Admin Panel  │     │  - HTTP Cookies  │     │  - Claim        │
└─────────────────┘     └──────────────────┘     │  - User         │
                                                 └─────────────────┘
```

## Frontend Technical Details

### Core Technologies
- **React**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Toastify**: Toast notifications
- **date-fns**: Date formatting and manipulation

### State Management
The application uses React's Context API for global state management:

```javascript
// src/context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Authentication methods...
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### API Service Methods

The frontend communicates with the backend through service methods:

```javascript
// Example service method for claiming a coupon
export const claimCoupon = async () => {
  try {
    const response = await api.post('/coupons/claim');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to claim coupon' };
  }
};
```

### Protected Routes Implementation

```javascript
// src/components/common/ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};
```

## Backend Technical Details

### Server Configuration

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Authentication Implementation

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

### Round-Robin Coupon Distribution Algorithm

```javascript
// controllers/couponController.js
const claimCoupon = async (req, res) => {
  try {
    const ipAddress = req.ip;
    const sessionId = req.cookies.sessionId || uuid();
    
    // Check for existing claim within cooldown period
    const recentClaim = await Claim.findOne({
      $or: [{ ipAddress }, { sessionId }],
      claimedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    if (recentClaim) {
      const cooldownRemaining = 24 * 60 * 60 * 1000 - (Date.now() - new Date(recentClaim.claimedAt).getTime());
      return res.status(429).json({ 
        message: 'Please wait before claiming another coupon',
        cooldownRemaining
      });
    }
    
    // Find oldest available coupon
    const coupon = await Coupon.findOne({
      isActive: true,
      isUsed: false
    }).sort({ createdAt: 1 });
    
    if (!coupon) {
      return res.status(404).json({ message: 'No coupons available' });
    }
    
    // Mark coupon as used
    coupon.isUsed = true;
    await coupon.save();
    
    // Record the claim
    await Claim.create({
      couponId: coupon._id,
      ipAddress,
      sessionId
    });
    
    // Set session cookie if not exists
    if (!req.cookies.sessionId) {
      res.cookie('sessionId', sessionId, { 
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
      });
    }
    
    res.status(200).json({ 
      message: 'Coupon claimed successfully',
      coupon: {
        code: coupon.code,
        description: coupon.description
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

## Database Schema Details

### Coupon Schema
```javascript
const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for efficient querying
CouponSchema.index({ isActive: 1, isUsed: 1, createdAt: 1 });
```

### Claim Schema
```javascript
const ClaimSchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  sessionId: {
    type