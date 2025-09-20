const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = express.Router();
const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");


// Forgot Password - send reset 6-digit OTP to email
router.post("/forgotPassword", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: "DB error" });
    if (results.length === 0) return res.json({ success: false, error: "No user found" });

    const user = results[0];

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000); // valid 15 min

    // Save OTP + expiry in DB
    db.query(
      "UPDATE users SET resetToken = ?, resetTokenExpire = ? WHERE userId = ?",
      [otp, otpExpire, user.userId],
      async (err2) => {
        if (err2) return res.status(500).json({ success: false, error: "DB error saving OTP" });

        const message = `
          <h2>Password Reset Code</h2>
          <p>Your OTP code is: <b>${otp}</b></p>
          <p>This code will expire in 15 minutes.</p>
        `;

        await sendEmail(email, "MoneyTour Password Reset Code", message);

        res.json({ success: true, message: "OTP sent to your email." });
      }
    );
  });
});


/*
// Forgot Password - send reset token to email
router.post("/forgotPassword", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: "DB error1" });
    if (results.length === 0) return res.json({ success: false, error: "No user found" });

    const user = results[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpire = new Date(Date.now() + 900000); // 15 min expiry

  console.log({ resetToken, resetTokenExpire, userId: user.userId });

  // Save token in DB
    db.query(
      "UPDATE users SET resetToken = ?, resetTokenExpire = ? WHERE userId = ?",
      [resetToken, resetTokenExpire, user.userId],
      async (err2) => {
        if (err2) {
          console.error("❌ MySQL error:", err2);
          return res.status(500).json({ success: false, error: "DB error2" });
        }

        const resetUrl = `http://localhost:5500/resetPassword.html?token=${resetToken}`;

        const message = `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `;

        await sendEmail(email, "MoneyTour Password Reset", message);

        res.json({ success: true, message: "Reset link sent to your email." });
      }
    );
  });
});
*/

router.post("/resetPassword", (req, res) => {
  const { email, otp, password } = req.body;

  if (!otp || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpire > ?";
  db.query(sql, [email, otp, Date.now()], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: "Database error" });
    if (results.length === 0) return res.status(400).json({ success: false, error: "Invalid or expired OTP" });

    const user = results[0];
    const hashedPassword = bcrypt.hashSync(password, 10);

    const updateSql = "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE userId = ?";
    db.query(updateSql, [hashedPassword, user.userId], (err) => {
      if (err) return res.status(500).json({ success: false, error: "Failed to reset password" });
      res.json({ success: true, message: "Password reset successful!" });
    });
  });
});


/*
// Reset Password
router.post("/resetPassword/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: "Password required" });
  }

  // Find user with token
  const sql = "SELECT * FROM users WHERE resetToken = ?";
  db.query(sql, [token], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid token" });
    }

    const user = results[0];

    // Check if expired
    if (user.resetTokenExpire < Date.now()) {
      return res.status(400).json({ success: false, error: "Token expired" });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Update password + clear reset fields
    const updateSql = "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE userId = ?";
    db.query(updateSql, [hashedPassword, user.userId], (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: "Failed to reset password" });
      }
      res.json({ success: true, message: "Password reset successful!" });
    });
  });
});
*/

/*
router.post("/resetPassword/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ success: false, error: "Password required" });

  // Find user with token
  const sql = "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpire > ?";
  db.query(sql, [token, Date.now()], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: "Database error (token)" });
    if (results.length === 0) return res.status(400).json({ success: false, error: "Invalid or expired token" });

    const user = results[0];
    // Hash new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Update password + clear reset fields
    const updateSql = "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE userId = ?";
    db.query(updateSql, [hashedPassword, user.userId], (err) => {
      if (err) return res.status(500).json({ success: false, error: "Failed to reset password" });
      res.json({ success: true, message: "Password reset successful!" });
    });
  });
});
*/

module.exports = router;
