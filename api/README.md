# 💰 MoneyTour

MoneyTour is a full-stack finance management application that allows users to register, log in, securely manage sessions with JWT, reset forgotten passwords via email, and track financial transactions.

## Features

**User Authentication**

- Registration with email & password (hashed with bcrypt).
- Login with JWT-based authentication.
- "Remember Me" option (extended refresh token storage).

**Secure Sessions**

- Access & refresh tokens for unique user sessions.
- HTTP-only cookies for refresh tokens.

**Password Recovery**

- Forgot password flow with email reset link.
- Secure, time-limited reset tokens.

**Database Integration**

- MySQL database for storing users information and transaction details.

**Responsive UI**

- Register and login pages styled with CSS, and Material Icons.

## 🛠️ Tech Stack

**Frontend**

- HTML5
- CSS3
- JavaScript

**Backend**

- Node.js
- Express.js
- JWT (JSON Web Token) for authentication (To be updated)
- Bcrypt for password hashing
- Nodemailer for password reset emails (To be updated)

**Database**

- MySQL

## ⚙️ Installation & Setup

1. Clone the repository

```
git clone https://github.com/cyprianchux/moneytour.git
cd moneytour/api
```

2. Install dependencies
   `npm install`
3. Create .env file
4. Set up MySQL database

```
CREATE DATABASE moneytour;
USE moneytour;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(20),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Start the server
   `node app.js`

## 🔑 API Endpoints

**Authentication**

- POST /api/register → Register new user
- POST /api/login → Login user (rememberMe optional)
- POST /api/refresh → Refresh access token

GET /profile → Get user profile (protected)

**Password Recovery**

- POST /forgot-password → Send password reset email
- POST /reset-password/:token → Reset password

**Utility**

- GET /test-db → Test DB connection

## 📜 License

- MIT License © 2024 MoneyTour Project
