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

test("login persists the user and opens the dashboard", async ({ page }) => {
  await page.route("**/api/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Login successful!", userId: 7 }),
    }),
  );

  await page.goto("/login.html");
  await page.fill("#username", "ada");
  await page.fill("#password", "secret");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#login-form").evaluate((form) => form.requestSubmit());

  await expect(page).toHaveURL(/dashboard\.html$/);
  await expect(page.evaluate(() => localStorage.getItem("myUserId"))).resolves.toBe("7");
  await expect(page.locator("#username")).toHaveText("Ada");
});

test("dashboard submits the default transaction type as an expense", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("myUserId", "7");
    localStorage.setItem("myUsername", "ada");
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
