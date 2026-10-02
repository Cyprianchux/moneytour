const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test/e2e",
  use: {
    baseURL: "http://127.0.0.1:5501",
    headless: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: "node ../moneytour-api/test/e2e-server.js",
    url: "http://127.0.0.1:5501",
    env: { PORT: "5501" },
    reuseExistingServer: false,
  },
});
