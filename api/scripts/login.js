/*
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const rememberMe = document.getElementById("remember-me").checked;

  let myUserId = null; // store logged in userId

  try {
    const res = await fetch("http://localhost:5500/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, rememberMe })
    });

    const userData = await res.json();

    if (userData.success) {
      console.log(typeof JSON.stringify(localStorage.setItem('myUserId', userData.userId))); // save userId
      alert("✅ Login successful! Redirecting to your dasboard...");
      window.location.href = "dashboard.html";
    } else {
      alert("❌ Error: " + userData.error);
    }
  } catch (err) {
    console.error("❌ Login request failed:", err);
    alert("Server error, try again later");
  }
});
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

      try {
        const response = await fetch('http://localhost:5500/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        console.log(typeof result.userId);
        console.log(result.userId);

        if (response.ok && result.success) {
          // ✅ Save userId in localStorage
          localStorage.setItem('myUserId', JSON.stringify(result.userId));

          alert('Login successful!');
          
          // Redirect to dashboard page
          window.location.href = "dashboard.html";
        } else {
          alert(result.error || 'Login failed');
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("Server error. Please try again later.");
      }
    });
  }
});

