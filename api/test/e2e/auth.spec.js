const { test, expect } = require("@playwright/test");

test("registration requires accepting the terms", async ({ page }) => {
  await page.goto("/register.html");
  await page.fill("#email", "ada@example.com");
  await page.fill("#username", "ada");
  await page.fill("#password", "secret");
  await page.fill("#confirm-password", "secret");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#register-form").evaluate((form) => form.requestSubmit());

  await expect(page).toHaveURL(/register\.html$/);
  await expect(page.locator("#terms")).not.toBeChecked();
});

test("login stores the user and redirects to the dashboard", async ({ page }) => {
  await page.route("**/api/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Login successful!", userId: 7 }),
    });
  });

  await page.goto("/login.html");
  await page.fill("#username", "ada");
  await page.fill("#password", "secret");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#login-form").evaluate((form) => form.requestSubmit());

  await expect(page).toHaveURL(/dashboard\.html$/);
  await expect(page.evaluate(() => localStorage.getItem("myUserId"))).resolves.toBe("7");
  await expect(page.locator("#username")).toHaveText("Ada");
});
