const { createApp } = require("./app");

const PORT = process.env.PORT || 5500;
createApp().listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
