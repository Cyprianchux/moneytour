(() => {
  const publicPages = new Set([
    "index.html",
    "login.html",
    "register.html",
    "forgotPassword.html",
    "resetPassword.html",
    "terms.html",
    "privacy.html",
  ]);
  const pageName = window.location.pathname.split("/").pop() || "index.html";
  window.moneytourSessionReady = Promise.resolve(null);

  function clearSession() {
    localStorage.removeItem("myUserId");
    localStorage.removeItem("myUsername");
    sessionStorage.removeItem("moneytourToken");
  }

  window.moneytourLogout = async () => {
    try {
      await fetch(window.moneytourApiUrl("/api/logout"), {
        method: "POST",
        credentials: "include",
        headers: window.moneytourAuthHeaders(),
      });
    } finally {
      clearSession();
      window.location.replace("/index.html");
    }
  };

  if (publicPages.has(pageName)) return;

  document.body.classList.add("auth-checking");
  window.moneytourSessionReady = new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", async () => {
      try {
        const response = await fetch(window.moneytourApiUrl("/api/session"), {
          credentials: "include",
          headers: window.moneytourAuthHeaders(),
        });
        if (!response.ok) {
          clearSession();
          const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.replace(`/login.html?returnTo=${returnTo}`);
          resolve(null);
          return;
        }

        const session = await response.json();
        localStorage.setItem("myUserId", String(session.userId));
        localStorage.setItem("myUsername", session.username);
        document.body.classList.remove("auth-checking");
        resolve(session);
      } catch (error) {
        console.error("Could not verify the MoneyTour session:", error);
        clearSession();
        window.location.replace("/login.html");
        resolve(null);
      }
    });
  });
})();
