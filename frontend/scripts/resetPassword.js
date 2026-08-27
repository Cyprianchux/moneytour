// using OTP
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const emailField = document.getElementById("email");
  const otpField = document.getElementById("otp");
  const message = document.getElementById("message");
  const resendBtn = document.getElementById("resendOtpBtn");

  // Auto-fill email from localStorage and lock email
  const savedEmail = localStorage.getItem("resetEmail");
  if (savedEmail) {
  //  emailField.value = savedEmail;
  //  emailField.setAttribute("readonly", true);
    emailField.textContent = savedEmail; // show email as plain text
  }

  otpField.focus();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // const email = document.getElementById("email").value;
    // const otp = document.getElementById("otp").value;
    const email = savedEmail;
    const otp = otpField.value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!otp || !password || !confirmPassword) {
      message.textContent = "⚠️ All fields are required.";
      message.style.color = "darkred";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "⚠️ Passwords do not match!";
      message.style.color = "darkred";
      return;
    }

    try {
      const response = await fetch("http://localhost:5500/api/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const result = await response.json();

      if (result.success) {
        message.textContent = "Password reset successful! Redirecting to login page...";
        message.style.color = "darkgreen";
        localStorage.removeItem("resetEmail"); // clear email after reset
        setTimeout(() => (window.location.href = "login.html"), 2000);
      } else {
        message.textContent =
          result.error === "Invalid OTP"
            ? "The OTP you entered is invalid."
            : result.error || "Password reset failed. Try again.";
        message.style.color = "darkred";
      }
    } catch (error) {
      console.error("Reset error:", error);
      message.textContent = "An error occurred. Please try again.";
      message.style.color = "darkred";
    }
  });

// Resend OTP
  resendBtn.addEventListener("click", async () => {
    if (!savedEmail) {
      message.textContent = "No email found. Go back and request reset again.";
      message.style.color = "darkred";
      return;
    }

    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        message.textContent = `OTP already sent! Please wait ${countdown}s.`;
      } else {
        clearInterval(timer);
        resendBtn.disabled = false;
        message.textContent = "You can now request a new OTP.";
        message.style.color = "darkgreen";
      }
    }, 1000);

    try {
      const response = await fetch("http://localhost:5500/api/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: savedEmail }),
      });

      const result = await response.json();

      if (result.success) {
        message.textContent = "📩 A new OTP has been sent to your email.";
        message.style.color = "darkgreen";
      } else {
        message.textContent = result.error || "❌ Failed to resend OTP.";
        message.style.color = "darkred";
      }
    } catch (error) {
      console.error("Resend error:", error);
      message.textContent = "❌ Error resending OTP. Try again.";
      message.style.color = "darkred";
    }
  });  
});



/* // Using token
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const message = document.getElementById("message");

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    message.textContent = "Invalid reset link. Please request a new one.";
    form.style.display = "none"; // Hide form if no token
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value.trim();

    if (!password) {
      message.textContent = "Please enter a new password.";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match!";
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
        message.textContent = "Password reset successful! You can now log in.";
        form.reset();
        form.style.display = "none"; // Hide form after success
      } else {
        if (result.error && result.error.toLowerCase().includes("expired")) {
          message.innerHTML = `
            Your reset link has expired.<br>
            <a href="forgotPassword.html">Click here to request a new one</a>.
          `;
        } else if (result.error && result.error.toLowerCase().includes("invalid")) {
          message.innerHTML = `
            Invalid reset link.<br>
            <a href="forgotPassword.html">Click here to request a new one</a>.
          `;
        } else {
          message.textContent = `${result.error || "Password reset failed."}`;
        }
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      message.textContent = "An error occurred. Please try again.";
    }
  });
});
*/

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