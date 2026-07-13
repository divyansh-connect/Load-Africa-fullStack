# API Documentation

This document covers the core backend REST APIs provided by the LoadAfrica server. All requests should have content-type headers set to `application/json`. Authenticated routes require the user token passed via cookies or authentication headers.

---

## Authentication APIs

### 1. Register User
- **Method**: `POST`
- **URL**: `/api/v1/auth/register`
- **Purpose**: Registers a new customer, broker, fleet owner, or admin.
- **Request Body**:
  ```json
  {
    "email": "shipper@test.com",
    "password": "Password123",
    "role": "CUSTOMER",
    "firstName": "Wendy",
    "lastName": "Molefe",
    "phone": "+27711234567",
    "companyName": "Wendy Logistics Pty"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": { "id": "user-uuid", "email": "shipper@test.com", "role": "CUSTOMER" }
  }
  ```

---

### 2. Login User
- **Method**: `POST`
- **URL**: `/api/v1/auth/login`
- **Purpose**: Authenticates a user and returns their profile with session token.
- **Request Body**:
  ```json
  {
    "email": "shipper@test.com",
    "password": "Password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "id": "user-uuid", "email": "shipper@test.com", "role": "CUSTOMER" }
  }
  ```

---

## Booking APIs

### 1. Request Quote Recommendations
- **Method**: `POST`
- **URL**: `/api/v1/bookings/quote`
- **Purpose**: Estimates pricing details for a shipment based on distance and payload weight.
- **Request Body**:
  ```json
  {
    "distance": 320,
    "weight": 15
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "baseRate": 4800, "brokerFee": 480, "totalEstimated": 5280 }
  }
  ```

---

### 2. Create Booking Request
- **Method**: `POST`
- **URL**: `/api/v1/bookings`
- **Purpose**: Shippers create a new transport booking.
- **Request Body**:
  ```json
  {
    "cargo_name": "Machinery parts",
    "weight": 12,
    "pickup_address": "Johannesburg, South Africa",
    "delivery_address": "Durban, South Africa",
    "vehicleType": "FLATBED"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": { "id": "bk-uuid", "status": "PENDING" }
  }
  ```

---

## Broker APIs (Requires BROKER role authorization)

### 1. Fetch Broker Dashboard Statistics
- **Method**: `GET`
- **URL**: `/api/v1/broker/dashboard`
- **Purpose**: Retrieves counts of quote requests, active bookings, commissions, and stats.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "pendingQuotes": 4, "activeLoads": 2, "totalCommission": 3250 }
  }
  ```

---

### 2. Submit Quote
- **Method**: `POST`
- **URL**: `/api/v1/broker/quotes/:bookingId`
- **Purpose**: Submits a broker-calculated quote bid for a booking.
- **Request Body**:
  ```json
  {
    "amount": 7200,
    "validUntil": "2026-07-15T12:00:00Z"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Quote submitted successfully"
  }
  ```
