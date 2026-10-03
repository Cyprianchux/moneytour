const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const configScript = fs.readFileSync(
  path.join(__dirname, "../../scripts/config.js"),
  "utf8",
);

function loadConfig(window = {}) {
  vm.runInNewContext(configScript, { window });
  return window;
}

test("uses the deployed API when no API origin is configured", () => {
  const window = loadConfig({ location: { hostname: "moneytour.vercel.app" } });

  assert.equal(window.MONEYTOUR_API_URL, "https://moneytour-api.vercel.app");
  assert.equal(
    window.moneytourApiUrl("/api/register"),
    "https://moneytour-api.vercel.app/api/register",
  );
});

test("uses the local server for localhost development", () => {
  const window = loadConfig({ location: { hostname: "localhost" } });

  assert.equal(window.MONEYTOUR_API_URL, "");
  assert.equal(window.moneytourApiUrl("/api/register"), "/api/register");
});

test("preserves a runtime API origin override", () => {
  const window = loadConfig({
    MONEYTOUR_API_URL: "https://api.example.com/",
    location: { hostname: "localhost" },
  });

  assert.equal(
    window.moneytourApiUrl("/api/login"),
    "https://api.example.com/api/login",
  );
});
