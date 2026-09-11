const express = require("express");

module.exports = function createUtilityRouter(db) {
  const router = express.Router();

  router.get("/test-db", (req, res) => {
    db.query("SELECT 1 + 1 AS result", (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: "Database not reachable" });
      }
      res.json({ success: true, result: results[0].result });
    });
  });

  return router;
};
