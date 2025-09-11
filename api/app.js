require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// API health check
app.get("/api", (req, res) => {
  res.send({ status: "API is running" });
});

// REGISTER endpoint
app.post("/api/register", (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';

    db.query(checkUserQuery, [email, username], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Server error' });
      }

      if (result.length > 0) {
        // If user already exists
        return res.status(400).json({ success: false, error: 'User with this email or username already exists' });
      }

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [email, username, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }

        res.json({ success: true, message: 'User registered successfully' });
      });
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// LOGIN endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(400).json({ suceess: false, error: 'Invalid username or password.' });
      }

      const user = result[0];

      // Compare hashed passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ success: false, error: "Server error during password hashing" });
        }

        if (isMatch) {
          res.json({ success: true, message: 'Login successful!', userId: user.userId });
        } else {
          res.status(400).json({ success: false, error: 'Invalid username or password.' });
        }
      });
    });
    } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// 3. Add a Transaction
app.post('/api/transHistory', (req, res) => {
  console.log("Transaction request body:", req.body);

  const { userId, type, particulars, amount, date, } = req.body; // Expect userId to be sent in request body

  if (!userId || !type || !particulars || !amount || !date) {
    return res.status(400).json({ message: 'Please provide all fields.' });
  }

  const sql = `INSERT INTO transactions (userId, type, particulars, amount, date) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [ userId, type, particulars, amount, date ], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, error: 'Transaction not added' })
    } else {
      res.json({ success: true, message: 'Transaction added successfully!', transactionId: result.insertId });
    }
  });
});


// 4. Get All Transactions
app.get('/api/transactions/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = 'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC'; 

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
    res.json(results);
  });
});


// 5. Get User Balance
app.get('/api/balance/:userId', (req, res) => {
  const {userId} = req.params;

  const sqlIncome = 'SELECT SUM(amount) as totalIncome FROM transactions WHERE userId = ? AND type = "income"';
  const sqlExpense = 'SELECT SUM(amount) as totalExpense FROM transactions WHERE userId = ? AND type = "expense"';

  db.query(sqlIncome, [userId], (err, incomeResult) => {
    if (err) throw err;

    db.query(sqlExpense, [userId], (err, expenseResult) => {
      if (err) throw err;

      const balance = (incomeResult[0].totalIncome || 0) - (expenseResult[0].totalExpense || 0);
      res.json({
        balance,
        totalIncome: incomeResult[0].totalIncome || 0,
        totalExpense: expenseResult[0].totalExpense || 0
      });
    });
  });
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
