-- Local development schema for MySQL Workbench.
-- This keeps the MySQL version of the MoneyTour tables separate from production.

CREATE DATABASE IF NOT EXISTS moneytour
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE moneytour;

CREATE TABLE IF NOT EXISTS users (
  userId BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  resetToken VARCHAR(20) NULL,
  resetTokenExpire DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  transactionId BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT UNSIGNED NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  particulars VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT transactions_user_fk FOREIGN KEY (userId)
    REFERENCES users(userId) ON DELETE CASCADE,
  CONSTRAINT transactions_amount_positive CHECK (amount > 0),
  INDEX transactions_user_date_idx (userId, date DESC)
);

CREATE OR REPLACE VIEW user_balances AS
SELECT
  u.userId,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS balance
FROM users u
LEFT JOIN transactions t ON t.userId = u.userId
GROUP BY u.userId;
