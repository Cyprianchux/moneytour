# MoneyTour Web Application

MoneyTour is a full-stack finance management application that allows users to register, log in, reset forgotten passwords via email, add transactions (income/expenses), view their transaction history, and see their current balance - updated on every added transaction.

Click the <a href="https://cyprianchux.github.io/moneytour/api/">link</a> to visit the page.

## Features

🔐 **User Authentication**

- Registration with email, and password (hashed with bcrypt).
- Login (with JWT-based authentication - implementation ongoing).
- "Remember Me" option (extended refresh token storage).

**Add Transactions**  
Log both _income_ and _expenses_ with details, amount, and date.

**Transaction History**  
View all transactions in a clean, tabular format.

**Balance Tracking**  
Automatically calculates and updates the current balance.

**Password Recovery**

- Forgot password flow with email reset link.
- Secure, time-limited reset tokens.

**Database Integration**

- MySQL database for storing users information and transaction details.

**Responsive UI**

- Register and login pages styled with CSS, and Material Icons.

## Tech Stack

**Frontend**

- HTML5
- CSS3
- JavaScript

**Backend**

- Node.js
- Express.js
- Bcrypt for password hashing and authentication

**Database**

- MySQL

**Other tools**

- dotenv
- cors
- body-parser

## Installation & Setup

1. Clone the repository

```
git clone https://github.com/cyprianchux/moneytour.git
cd moneytour/api
```

2. Install dependencies
   `npm install express cors body-parser dotenv mysql2`

3. Configure environment variables.
   Create .env file in the project (api) root

```
PORT=5500
DB_HOST=localhost
DB_USER=use_your_mysql_username
DB_PASSWORD=use_your_mysql_password
DB_NAME=moneytour
DB_PORT=3306
```

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

CREATE TABLE transactions (
  transactionId INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  particulars VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(userId)
);
```

5. Start the server
   `node app.js`
   I use `nodemon app.js` while working to automatically restart the server. You can install nodemon to do the same.

   The backend will start at:
   `http://localhost:5500`

## Testing

From the `api` directory:

```bash
npm test          # unit tests
npm run test:e2e  # Playwright browser tests
npm run test:all  # both suites
```

The E2E suite starts an isolated API server with an in-memory database, so it does not require MySQL credentials.

## API Endpoints

**Authentication**

- POST /api/register → Register new user.
- POST /api/login → Login user and return `userId`.

**Transactions**
POST /api/transHistory → Add a transaction.
GET /api/transHistory/:userId → Get all transactions for a user.

**Balance**
GET /api/balance/:userId → Get current balance.

**Password Recovery**

- POST /forgot-password → Send password reset email.
- POST /reset-password/:token → Reset password.

**Utility**

- GET /test-db → Test DB connection

**Frontend Pages**
`index.html` - Login/Register page
`login.html` - Login page
`register.html` - registration page
`dashboard.html` - Add new transaction & view balance
`transHistory.html` - View transaction history & current balance

**Future Improvements**
Session management or JWT authentication.
Better UI styling with modern frameworks.
Export transactions (CSV/PDF).
Data visualization (charts for spending trends).

## License

- MIT License © 2024 MoneyTour Project.
  This project was done for my personal development. Feel free to modify it for your own needs.

Click the <a href="https://cyprianchux.github.io/moneytour/api/">link</a> to visit the page.
