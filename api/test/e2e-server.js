const { createApp } = require("../app");
const { createFakeDb } = require("./helpers/fakeDb");

const port = Number(process.env.PORT || 5500);
createApp(createFakeDb()).listen(port, "127.0.0.1", () => {
  console.log(`E2E server listening on ${port}`);
});
