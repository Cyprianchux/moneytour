const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../../app");
const { createFakeDb } = require("../helpers/fakeDb");
const { request } = require("../helpers/http");

async function withServer(callback) {
  const db = createFakeDb();
  const server = createApp(db).listen(0);
  try {
    await callback({ db, server });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("reports API health and database health", async () => {
  await withServer(async ({ server }) => {
    assert.deepEqual((await request(server, "GET", "/api")).body, { status: "API is running" });
    assert.deepEqual((await request(server, "GET", "/api/test-db")).body, { success: true, result: 2 });
  });
});

test("registers a user and rejects duplicate credentials", async () => {
  await withServer(async ({ server }) => {
    const payload = { email: "ada@example.com", username: "ada", password: "secret" };
    const created = await request(server, "POST", "/api/register", payload);
    assert.equal(created.status, 200);
    assert.equal(created.body.success, true);

    const duplicate = await request(server, "POST", "/api/register", payload);
    assert.equal(duplicate.status, 400);
    assert.match(duplicate.body.error, /already exists/);
  });
});

test("logs in with a valid password and rejects an invalid password", async () => {
  await withServer(async ({ db, server }) => {
    await db.addUser({ email: "ada@example.com", username: "ada", password: "secret" });

    const valid = await request(server, "POST", "/api/login", { username: "ada", password: "secret" });
    assert.equal(valid.status, 200);
    assert.deepEqual(valid.body, { success: true, message: "Login successful!", userId: 1 });

    const invalid = await request(server, "POST", "/api/login", { username: "ada", password: "wrong" });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error, "Invalid username or password.");
  });
});

test("adds transactions and calculates the user balance", async () => {
  await withServer(async ({ db, server }) => {
    await db.addUser({ email: "ada@example.com", username: "ada", password: "secret" });
    const income = await request(server, "POST", "/api/transHistory", {
      userId: 1,
      type: "income",
      particulars: "Salary",
      amount: 1000,
      date: "2026-09-01",
    });
    const expense = await request(server, "POST", "/api/transHistory", {
      userId: 1,
      type: "expense",
      particulars: "Food",
      amount: 250,
      date: "2026-09-02",
    });

    assert.equal(income.body.success, true);
    assert.equal(expense.body.success, true);
    assert.deepEqual((await request(server, "GET", "/api/balance/1")).body, {
      balance: 750,
      totalIncome: 1000,
      totalExpense: 250,
    });
    assert.equal((await request(server, "GET", "/api/transHistory/1")).body.length, 2);
  });
});
