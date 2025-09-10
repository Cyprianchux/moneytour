document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const terms = document.getElementById("terms").checked;

  if (!terms) {
    alert("Please accept our Terms of Service");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password })
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Registration successful! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err) {
    console.error("❌ Register request failed:", err);
    alert("Server error, try again later");
  }
});
