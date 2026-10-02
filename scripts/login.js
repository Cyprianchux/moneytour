document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

      try {
        const response = await fetch(window.moneytourApiUrl("/api/login"), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // ✅ Save userId in localStorage
          localStorage.setItem('myUserId', String(result.userId));
          localStorage.setItem('myUsername', result.username || username);
          sessionStorage.setItem("moneytourToken", result.token);

          alert('Login successful!');
          const returnTo = new URLSearchParams(window.location.search).get("returnTo");
          const safeReturnTo = returnTo && /^\/?(dashboard|transHistory)\.html$/.test(returnTo)
            ? returnTo.replace(/^\//, "")
            : "dashboard.html";
          window.location.replace(safeReturnTo);
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
