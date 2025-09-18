document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const message = document.getElementById("message");

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    message.textContent = "❌ Invalid reset link. Please request a new one.";
    form.style.display = "none"; // Hide form if no token
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value.trim();

    if (!password) {
      message.textContent = "⚠️ Please enter a new password.";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "❌ Passwords do not match!";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5500/resetPassword/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        message.textContent = "✅ Password reset successful! You can now log in.";
        form.reset();
        form.style.display = "none"; // Hide form after success
      } else {
        if (result.error && result.error.toLowerCase().includes("expired")) {
          message.innerHTML = `
            ❌ Your reset link has expired.<br>
            <a href="forgotPassword.html">Click here to request a new one</a>.
          `;
        } else if (result.error && result.error.toLowerCase().includes("invalid")) {
          message.innerHTML = `
            ❌ Invalid reset link.<br>
            <a href="forgotPassword.html">Click here to request a new one</a>.
          `;
        } else {
          message.textContent = `❌ ${result.error || "Password reset failed."}`;
        }
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      message.textContent = "❌ An error occurred. Please try again.";
    }
  });
});


/*
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const message = document.getElementById("message");

  // Get token from URL. Get token from query string (?token=xxxx)
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    message.textContent = "❌ Invalid reset link. No token found.";
    form.style.display = "none";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      message.textContent = "❌ Passwords do not match!";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5500/api/resetPassword/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      
      if (result.success) {
        message.textContent = "✅ Password reset successful! You can now log in.";
        form.reset();

        // Wait 2 seconds then redirect
        setTimeout(() => {
          window.location.href = "login.html"; // your login page
        }, 2000);
      } else {
        message.textContent = `❌ ${result.error || "Password reset failed"}`;
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      message.textContent = "❌ An error occurred. Please try again.";
    }
  });
});
*/