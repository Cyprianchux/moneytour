const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const registerScript = fs.readFileSync(
  path.join(__dirname, "../../scripts/register.js"),
  "utf8",
);

function setupRegisterForm({
  terms = true,
  username = "ada",
  password = "secret",
  confirmPassword = "secret",
} = {}) {
  const elements = {
    "register-form": { addEventListener(_event, handler) { this.submit = handler; } },
    email: { value: "ada@example.com" },
    username: { value: username },
    password: { value: password },
    "confirm-password": { value: confirmPassword },
    terms: { checked: terms },
  };
  const alerts = [];
  const requests = [];
  const context = {
    document: { getElementById: (id) => elements[id] },
    alert: (message) => alerts.push(message),
    fetch: async (...args) => {
      requests.push(args);
      return { json: async () => ({ success: true }) };
    },
    window: { location: {}, moneytourApiUrl: (url) => url },
    console,
  };
  vm.runInNewContext(registerScript, context);
  return { elements, alerts, requests };
}

test("registration blocks submission when terms are not accepted", async () => {
  const { elements, alerts, requests } = setupRegisterForm({ terms: false });
  await elements["register-form"].submit({ preventDefault() {} });

  assert.deepEqual(alerts, ["Please accept our Terms of Service"]);
  assert.equal(requests.length, 0);
});

test("registration stores usernames in lowercase", async () => {
  const { elements, requests } = setupRegisterForm({ username: "Ada Lovelace" });
  await elements["register-form"].submit({ preventDefault() {} });

  assert.equal(JSON.parse(requests[0][1].body).username, "ada lovelace");
});

test("registration blocks mismatched passwords", async () => {
  const { elements, alerts, requests } = setupRegisterForm({ confirmPassword: "different" });
  await elements["register-form"].submit({ preventDefault() {} });

  assert.deepEqual(alerts, ["Passwords do not match."]);
  assert.equal(requests.length, 0);
});

test("registration posts the form details to the API", async () => {
  const { elements, requests } = setupRegisterForm();
  await elements["register-form"].submit({ preventDefault() {} });

  assert.equal(requests[0][0], "/api/register");
  assert.deepEqual(JSON.parse(requests[0][1].body), {
    email: "ada@example.com",
    username: "ada",
    password: "secret",
  });
});
