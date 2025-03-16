// server.js - Main application entry point
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://round-robin-coupon-bice.vercel.app",  // Reflects the request origin
  credentials: true
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const claimSchema = new mongoose.Schema({
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  ipAddress: { type: String, required: true },
  sessionId: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Coupon = mongoose.model('Coupon', couponSchema);
const Claim = mongoose.model('Claim', claimSchema);

// Authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Route to create initial admin user
app.post('/api/setup', async (req, res) => {
  try {
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const admin = new User({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashedPassword,
      isAdmin: true
    });

    await admin.save();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user', error: error.message });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({ message: 'Login successful', isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

// Admin: Get all coupons
app.get('/api/admin/coupons', authenticateAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// Admin: Add a new coupon
app.post('/api/admin/coupons', authenticateAdmin, async (req, res) => {
  try {
    const { code, description } = req.body;
    
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = new Coupon({
      code,
      description,
      isActive: true,
      isUsed: false
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
});

// Admin: Update coupon
app.put('/api/admin/coupons/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, isActive } = req.body;
    
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id, 
      { code, description, isActive },
      { new: true }
    );
    
    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.status(200).json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
});

// Admin: Get claim history
app.get('/api/admin/claims', authenticateAdmin, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('couponId')
      .sort({ claimedAt: -1 });
    
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claims', error: error.message });
  }
});

//test hello world
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

// User: Claim a coupon
app.post('/api/coupons/claim', async (req, res) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let { sessionId } = req.cookies;
    
    // Create a session ID if it doesn't exist
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }
    
    // Check if the user has claimed a coupon within the cooldown period
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const recentClaim = await Claim.findOne({
      $or: [
        { ipAddress, claimedAt: { $gt: new Date(Date.now() - cooldownPeriod) } },
        { sessionId, claimedAt: { $gt: new Date(Date.now() - cooldownPeriod) } }
      ]
    });
    
    if (recentClaim) {
      return res.status(429).json({ 
        message: 'You have already claimed a coupon recently. Please try again later.',
        nextAvailableTime: new Date(recentClaim.claimedAt.getTime() + cooldownPeriod)
      });
    }
    
    // Find an available coupon using round-robin approach
    const availableCoupon = await Coupon.findOne({ isActive: true, isUsed: false })
      .sort({ createdAt: 1 });
    
    if (!availableCoupon) {
      return res.status(404).json({ message: 'No coupons available at this time' });
    }
    
    // Mark the coupon as used
    availableCoupon.isUsed = true;
    await availableCoupon.save();
    
    // Record the claim
    const claim = new Claim({
      couponId: availableCoupon._id,
      ipAddress,
      sessionId
    });
    
    await claim.save();
    
    res.status(200).json({ 
      message: 'Coupon claimed successfully',
      coupon: {
        code: availableCoupon.code,
        description: availableCoupon.description
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error claiming coupon', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});