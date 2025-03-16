# Coupon Distribution API Documentation

This API provides a round-robin coupon distribution system with admin panel functionality to manage coupons and prevent abuse.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install express mongoose cookie-parser cors jsonwebtoken bcrypt uuid dotenv
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/coupon-system
   JWT_SECRET=your_secure_jwt_secret
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   FRONTEND_URL=http://localhost:3001
   ```
4. Start the server:
   ```
   node server.js
   ```
5. Initialize the admin user:
   ```
   curl -X POST http://localhost:3000/api/setup
   ```

## API Endpoints

### Admin Authentication

#### Login
- **URL**: `/api/admin/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "your_password"
  }
  ```
- **Response**: Returns a JWT token in an HTTP-only cookie

#### Logout
- **URL**: `/api/admin/logout`
- **Method**: `POST`
- **Response**: Clears the authentication cookie

### Coupon Management (Admin Only)

#### Get All Coupons
- **URL**: `/api/admin/coupons`
- **Method**: `GET`
- **Auth**: Required (JWT token in cookie or Authorization header)
- **Response**: Returns an array of all coupons

#### Add New Coupon
- **URL**: `/api/admin/coupons`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "code": "DISCOUNT20",
    "description": "20% off on all products"
  }
  ```
- **Response**: Returns the created coupon

#### Update Coupon
- **URL**: `/api/admin/coupons/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Body**:
  ```json
  {
    "code": "DISCOUNT20",
    "description": "20% off on all products",
    "isActive": true
  }
  ```
- **Response**: Returns the updated coupon

#### Get Claim History
- **URL**: `/api/admin/claims`
- **Method**: `GET`
- **Auth**: Required
- **Response**: Returns an array of all claims with coupon details

### User Coupon Claim

#### Claim a Coupon
- **URL**: `/api/coupons/claim`
- **Method**: `POST`
- **Response**: Returns the claimed coupon or an error message
- **Notes**: 
  - Implements IP and session-based tracking to prevent abuse
  - Enforces a 24-hour cooldown period between claims
  - Distributes coupons in a round-robin manner (oldest first)

## Data Models

### User
- `username`: String (required, unique)
- `password`: String (hashed, required)
- `isAdmin`: Boolean (default: false)

### Coupon
- `code`: String (required, unique)
- `description`: String
- `isActive`: Boolean (default: true)
- `isUsed`: Boolean (default: false)
- `createdAt`: Date (default: current date)

### Claim
- `couponId`: ObjectId (reference to Coupon)
- `ipAddress`: String (required)
- `sessionId`: String (required)
- `claimedAt`: Date (default: current date)

## Security Features

1. **Authentication**: JWT-based authentication for admin access
2. **Abuse Prevention**:
   - IP tracking to prevent multiple claims from the same IP
   - Cookie-based session tracking to prevent claims from the same browser
   - Cooldown period between claims (24 hours)
3. **Data Protection**:
   - HTTP-only cookies for storing tokens
   - Password hashing with bcrypt
   - Request validation and error handling

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- `200/201`: Success
- `400`: Bad request (e.g., invalid input)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `429`: Too many requests (rate limiting)
- `500`: Server error