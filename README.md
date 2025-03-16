# Coupon Distribution System Documentation

## Overview
The Coupon Distribution System is a web application that distributes coupons to guest users in a round-robin manner while providing an admin panel to manage coupons and prevent abuse. The system consists of a React frontend and Express/MongoDB backend.

## Architecture
The application follows a client-server architecture:
- **Frontend**: React application with user and admin interfaces
- **Backend**: Node.js/Express API with MongoDB database
- **Authentication**: JWT-based authentication for admin access

## System Components

### 1. User Interface
- **Coupon Claim Page**: Allows guest users to claim coupons
- **Cooldown Mechanism**: Prevents users from claiming multiple coupons within 24 hours
- **Feedback System**: Provides clear messages for successful/failed claims

### 2. Admin Panel
- **Dashboard**: Overview of system statistics
- **Coupon Management**: Create, update, and toggle coupon availability
- **Claims History**: View which users claimed which coupons

### 3. Abuse Prevention
- **IP Tracking**: Prevents multiple claims from the same IP
- **Cookie-Based Tracking**: Restricts claims from the same browser session
- **Cooldown System**: Enforces a waiting period between claims

## Frontend Implementation

### Setup Instructions
1. Create a new React application:
   ```bash
   cd coupon-frontend
   ```

2. Install required dependencies:
   ```bash
   npm install react-router-dom axios react-toastify date-fns
   ```

3. Replace the source code with the provided files structure.

4. Configure API endpoint in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

### Key Components

#### User Features
- **CouponClaim**: Core component that handles user coupon requests and displays results
- **CooldownTimer**: Shows remaining time until a user can claim another coupon

#### Admin Features
- **AdminLogin**: Authentication form for admin access
- **AdminDashboard**: Overview of system statistics
- **AdminCoupons**: Interface for managing coupons (add, edit, toggle status)
- **AdminClaims**: List of all coupon claims with details

### Authentication Flow
1. Admin enters credentials in the login form
2. The system validates credentials against the backend
3. Upon successful authentication, JWT token is stored in an HTTP-only cookie
4. Protected routes use `ProtectedRoute` component to verify authentication

### Core Functions
- **Coupon Claiming**: Sends a request to the backend API to claim a coupon
- **Cooldown Management**: Uses localStorage to track claim times along with server verification
- **Admin Operations**: Manage coupons through CRUD operations

## Backend Implementation

### Setup Instructions
1. Create a new Node.js project:
   ```bash
   mkdir coupon-backend
   cd coupon-backend
   npm init -y
   ```

2. Install required dependencies:
   ```bash
   npm install express mongoose cookie-parser cors jsonwebtoken bcrypt uuid dotenv
   ```

3. Create the server and database models according to API documentation.

4. Configure environment variables in `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/coupon-system
   JWT_SECRET=your_secure_jwt_secret
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   FRONTEND_URL=http://localhost:3001
   ```

5. Start the server:
   ```bash
   node server.js
   ```

### API Endpoints

#### Public Endpoints
- `POST /api/coupons/claim`: Claims a coupon for the user

#### Admin Endpoints (Protected)
- `POST /api/admin/login`: Admin authentication
- `POST /api/admin/logout`: Admin logout
- `GET /api/admin/coupons`: Get all coupons
- `POST /api/admin/coupons`: Add a new coupon
- `PUT /api/admin/coupons/:id`: Update coupon details
- `GET /api/admin/claims`: Get claim history

### Security Measures
- **JWT Authentication**: Secure admin access with short-lived tokens
- **HTTP-Only Cookies**: Prevent client-side access to auth tokens
- **CORS Configuration**: Limit API access to trusted origins
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent abuse with request limits

## Data Models

### User
```javascript
{
  username: String, // required, unique
  password: String, // hashed, required
  isAdmin: Boolean  // default: false
}
```

### Coupon
```javascript
{
  code: String,       // required, unique
  description: String,
  isActive: Boolean,  // default: true
  isUsed: Boolean,    // default: false
  createdAt: Date     // default: current date
}
```

### Claim
```javascript
{
  couponId: ObjectId, // reference to Coupon
  ipAddress: String,  // required
  sessionId: String,  // required
  claimedAt: Date     // default: current date
}
```

## Integration and Communication Flow

### User Coupon Claim Process
1. User visits the homepage and clicks "Claim Coupon"
2. Frontend sends a POST request to `/api/coupons/claim`
3. Backend validates the request:
   - Checks if the user has claimed a coupon in the last 24 hours
   - Verifies IP and session information
4. If valid, backend:
   - Selects the oldest available coupon
   - Marks it as used
   - Records the claim details
5. Frontend displays the coupon to the user or shows cooldown message

### Admin Coupon Management Process
1. Admin logs in through the admin login page
2. Upon successful authentication, admin can access:
   - Dashboard with system statistics
   - Coupon management page
   - Claims history page
3. On the coupon management page, admin can:
   - Add new coupons
   - Edit existing coupons
   - Toggle coupon availability

## Deployment Considerations

### Frontend Deployment
1. Build the React application:
   ```bash
   npm run build
   ```
2. Deploy the build folder to a static hosting service:
   - Netlify
   - Vercel
   - Firebase Hosting
   - AWS S3 + CloudFront

### Backend Deployment
1. Deploy the Node.js application to:
   - Heroku
   - AWS Elastic Beanstalk
   - DigitalOcean App Platform
   - Google Cloud Run

2. Set up a MongoDB database:
   - MongoDB Atlas (cloud solution)
   - Self-hosted MongoDB on a server

3. Configure environment variables in the hosting platform.

### Post-Deployment Tasks
1. Update CORS configuration to allow the production frontend domain
2. Configure rate limiting for production environment
3. Set up monitoring and logging
4. Create a secure admin account with a strong password

## Maintenance and Enhancement

### Regular Maintenance Tasks
- Database backups
- Log monitoring
- Security updates
- Performance optimization

### Potential Enhancements
- Email notifications for admins
- Coupon categories/tags
- Advanced analytics dashboard
- User accounts with personalized coupons
- Bulk import/export of coupons
- Expiration dates for coupons

## Troubleshooting

### Common Issues
1. **Coupon Claim Fails**: Check IP tracking and cooldown settings
2. **Admin Authentication Issues**: Verify JWT secret and cookie configuration
3. **Database Connection Problems**: Check MongoDB connection string
4. **CORS Errors**: Ensure frontend origin is allowed in backend configuration

### Debugging Tools
- Browser developer tools for frontend issues
- Backend logs for API errors
- MongoDB Compass for database inspection

## Performance Optimization

### Frontend Optimization
- Bundle size optimization
- Lazy loading of admin components
- Memoization of expensive computations
- Optimized rendering with React's useMemo and useCallback

### Backend Optimization
- Database indexing
- Query optimization
- Connection pooling
- Caching frequently accessed data

## Conclusion
The Coupon Distribution System provides a robust solution for distributing coupons in a controlled manner while preventing abuse. The combination of frontend user experience and backend security measures ensures a reliable system for both users and administrators.