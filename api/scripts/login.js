document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const rememberMe = document.getElementById("remember-me").checked;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, rememberMe })
    });

    const data = await res.json();

    if (data.success) {
      alert("Login successful! Redirecting...");
      window.location.href = "dashboard.html";
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error("❌ Login request failed:", err);
    alert("Server error, try again later");
  }
});
