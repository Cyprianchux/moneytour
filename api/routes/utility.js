const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Test DB Connection
router.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Database not reachable" });
    }
    res.json({ success: true, result: results[0].result });
  });
});

module.exports = router;
