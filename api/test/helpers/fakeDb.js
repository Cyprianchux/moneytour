const bcrypt = require("bcryptjs");

function createFakeDb() {
  const users = [];
  const transactions = [];

  return {
    users,
    transactions,
    query(sql, params, callback) {
      if (typeof params === "function") {
        callback = params;
        params = [];
      }

      if (sql === "SELECT 1 + 1 AS result") {
        return callback(null, [{ result: 2 }]);
      }

      if (sql.includes("SELECT * FROM users WHERE email = ? OR username = ?")) {
        const [email, username] = params;
        return callback(null, users.filter((user) => user.email === email || user.username === username));
      }

      if (sql.includes("INSERT INTO users")) {
        const [email, username, password] = params;
        const user = { userId: users.length + 1, email, username, password };
        users.push(user);
        return callback(null, { insertId: user.userId });
      }

      if (sql.includes("SELECT * FROM users WHERE username = ?")) {
        return callback(null, users.filter((user) => user.username === params[0]));
      }

      if (sql.includes("SELECT * FROM transactions WHERE userId = ?")) {
        return callback(null, transactions.filter((transaction) => transaction.userId === Number(params[0])));
      }

      if (sql.includes("INSERT INTO transactions")) {
        const [userId, type, particulars, amount, date] = params;
        const transaction = {
          transactionId: transactions.length + 1,
          userId: Number(userId),
          type,
          particulars,
          amount: Number(amount),
          date,
        };
        transactions.push(transaction);
        return callback(null, { insertId: transaction.transactionId });
      }

      if (sql.includes("SUM(amount)") && sql.includes('type = "income"')) {
        const totalIncome = transactions
          .filter((transaction) => transaction.userId === Number(params[0]) && transaction.type === "income")
          .reduce((total, transaction) => total + transaction.amount, 0);
        return callback(null, [{ totalIncome: totalIncome || null }]);
      }

      if (sql.includes("SUM(amount)") && sql.includes('type = "expense"')) {
        const totalExpense = transactions
          .filter((transaction) => transaction.userId === Number(params[0]) && transaction.type === "expense")
          .reduce((total, transaction) => total + transaction.amount, 0);
        return callback(null, [{ totalExpense: totalExpense || null }]);
      }

      throw new Error(`Unhandled SQL in fake database: ${sql}`);
    },
    async addUser({ email, username, password }) {
      users.push({
        userId: users.length + 1,
        email,
        username,
        password: await bcrypt.hash(password, 10),
      });
    },
  };
}

module.exports = { createFakeDb };
