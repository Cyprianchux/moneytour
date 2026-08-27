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

        if (response.ok && result.success) {
          // ✅ Save userId in localStorage
          localStorage.setItem('myUserId', JSON.stringify(result.userId));
          localStorage.setItem('myUsername', username);

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

