const { test, expect } = require("@playwright/test");

test("registration requires terms acceptance and matching passwords", async ({ page }) => {
  await page.goto("/register.html");
  await page.fill("#email", "ada@example.com");
  await page.fill("#username", "ada");
  await page.fill("#password", "secret");
  await page.fill("#confirm-password", "different");

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#register-form").evaluate((form) => form.requestSubmit());
  await expect(page).toHaveURL(/register\.html$/);
  await expect(page.locator("#terms")).not.toBeChecked();

  await page.check("#terms");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#register-form").evaluate((form) => form.requestSubmit());
  await expect(page).toHaveURL(/register\.html$/);
});

test("login persists the authenticated user and opens the dashboard", async ({ page }) => {
  await page.goto("/login.html");
  await page.fill("#username", "testuser5");
  await page.fill("#password", "passWorded5");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#login-form").evaluate((form) => form.requestSubmit());

  await expect(page).toHaveURL(/dashboard\.html$/);
  await expect(page.evaluate(() => localStorage.getItem("myUsername"))).resolves.toBe("testuser5");
  await expect(page.locator("#username")).toHaveText("Testuser5");
});

test("private pages redirect to login before a session exists", async ({ page }) => {
  await page.goto("/dashboard.html");
  await expect(page).toHaveURL(/login\.html\?returnTo=/);
  await page.goto("/transHistory.html");
  await expect(page).toHaveURL(/login\.html\?returnTo=/);
});

test("a valid API session restores access without client-side cached user data", async ({ page }) => {
  await page.request.post("http://127.0.0.1:5501/api/login", {
    data: { username: "testuser5", password: "passWorded5" },
  });
  await page.addInitScript(() => localStorage.clear());

  await page.goto("/dashboard.html");

  await expect(page).toHaveURL(/dashboard\.html$/);
  await expect(page.locator(".welcome-username")).toContainText("Testuser5");
});

test("all non-home pages fit narrow mobile viewports", async ({ page }) => {
  await page.request.post("http://127.0.0.1:5501/api/login", {
    data: { username: "testuser5", password: "passWorded5" },
  });

  const pages = [
    "/dashboard.html",
    "/transHistory.html",
    "/login.html",
    "/register.html",
    "/forgotPassword.html",
    "/resetPassword.html",
    "/terms.html",
    "/privacy.html",
  ];

  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of pages) {
      await page.goto(path);
      await expect.poll(
        () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        { message: `${path} should fit at ${width}px` },
      ).toBe(true);
    }
  }
});

test("dashboard toggle selects income first, switches to expenses, and submits the selected type", async ({ page }) => {
  await page.request.post("http://127.0.0.1:5501/api/login", {
    data: { username: "testuser5", password: "passWorded5" },
  });
  const submittedTransactions = [];
  await page.route("**/api/transHistory", async (route) => {
    submittedTransactions.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Transaction added successfully!" }),
    });
  });
  await page.goto("/dashboard.html");
  const toggle = page.locator("#transType");
  const incomeLabel = page.locator(".option span").nth(0);
  const expenseLabel = page.locator(".option span").nth(1);
  await expect(toggle).not.toBeChecked();
  await expect(incomeLabel).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(expenseLabel).not.toHaveCSS("color", "rgb(255, 255, 255)");

  await page.fill('input[name="particulars"]', "Lunch");
  await page.fill('input[name="amount"]', "25");
  await page.fill('input[name="date"]', "2026-10-02");
  const alert = page.waitForEvent("dialog");
  await page.locator("#transactionForm").evaluate((form) => form.requestSubmit());
  await (await alert).accept();
  await expect.poll(() => submittedTransactions[0]?.type).toBe("income");

  await page.locator('label[for="transType"]').click();
  await expect(toggle).toBeChecked();
  await expect(expenseLabel).toHaveCSS("color", "rgb(255, 255, 255)");
  await page.fill('input[name="particulars"]', "Transport");
  await page.fill('input[name="amount"]', "10");
  await page.fill('input[name="date"]', "2026-10-02");
  const expenseAlert = page.waitForEvent("dialog");
  await page.locator("#transactionForm").evaluate((form) => form.requestSubmit());
  await (await expenseAlert).accept();
  await expect.poll(() => submittedTransactions[1]?.type).toBe("expense");
});

test("dashboard and transaction history share formatted balance and transaction amounts", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.request.post("http://127.0.0.1:5501/api/login", {
    data: { username: "testuser5", password: "passWorded5" },
  });
  await page.route("**/api/balance/*", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ balance: 1234567.89, totalIncome: 2000000, totalExpense: 765432.11 }),
  }));
  await page.route("**/api/transHistory/*", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([{
      transactionId: 1,
      type: "income",
      particulars: "Salary",
      amount: 12345.67,
      date: "2026-10-06",
    }]),
  }));

  await page.goto("/dashboard.html");
  await expect(page.locator("#balance")).toHaveText("₦1,234,567.89");
  await expect(page.locator(".activity-item strong")).toHaveText("+₦12,345.67");
  const overviewWidth = await page.locator(".dashboard-card").evaluate((card) => card.getBoundingClientRect().width);
  expect(overviewWidth).toBeGreaterThanOrEqual(540);

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/transHistory.html");
  await expect(page.locator("#balance")).toHaveText("₦1,234,567.89");
  await expect(page.locator('td[data-label="Amount"]')).toHaveText("₦12,345.67");
  await expect(page.locator("tbody td").first()).toHaveCSS("display", "grid");
});
