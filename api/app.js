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
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (result.length > 0) {
        // If user already exists
        return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
      }

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [email, username, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
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
      if (err) throw err;

      if (result.length === 0) {
        return res.status(400).json({ message: 'Invalid username or password.' });
      }

      const user = result[0];

      // Compare hashed passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          res.json({ message: 'Login successful!' });
        } else {
          res.status(400).json({ message: 'Invalid username or password.' });
        }
      });
    });
    } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
