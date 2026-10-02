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

test("dashboard submits the default transaction type as an expense", async ({ page }) => {
  await page.request.post("http://127.0.0.1:5501/api/login", {
    data: { username: "testuser5", password: "passWorded5" },
  });
  let submittedTransaction;
  await page.route("**/api/transHistory", async (route) => {
    submittedTransaction = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Transaction added successfully!" }),
    });
  });
  await page.goto("/dashboard.html");
  await page.fill('input[name="particulars"]', "Lunch");
  await page.fill('input[name="amount"]', "25");
  await page.fill('input[name="date"]', "2026-10-02");
  const alert = page.waitForEvent("dialog");
  await page.locator("#transactionForm").evaluate((form) => form.requestSubmit());
  await (await alert).accept();

  await expect.poll(() => submittedTransaction?.type).toBe("expense");
});
