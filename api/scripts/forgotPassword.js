document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    try {
      const response = await fetch("http://localhost:5500/api/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        message.textContent = "OTP sent! Redirecting...";
        message.style.color = "darkgreen";
        localStorage.setItem("resetEmail", email); // save email for reset page
        setTimeout(() => {
          window.location.href = "resetPassword.html";
        }, 1500);
      }
/*
      if (result.success) {
        message.textContent = "Reset link sent! Please check your email.";
        form.reset();
      } else {
        message.textContent = `${result.error || "Could not send reset link"}`;
      }
*/
    } catch (error) {
      console.error("Error sending reset email:", error);
      message.textContent = "An error occurred. Please try again.";
      message.style.color = "darkred";
    }
  });
});
