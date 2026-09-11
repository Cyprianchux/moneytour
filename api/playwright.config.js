const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test/e2e",
  use: {
    baseURL: "http://127.0.0.1:5500",
    headless: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: "node test/e2e-server.js",
    url: "http://127.0.0.1:5500",
    reuseExistingServer: !process.env.CI,
  },
});
