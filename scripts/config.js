// Set this to the deployed API origin when the static frontend and API use different domains.
const localHosts = ["localhost", "127.0.0.1"];
window.MONEYTOUR_API_URL =
  window.MONEYTOUR_API_URL ||
  (window.location && localHosts.includes(window.location.hostname)
    ? ""
    : "https://moneytour-api.vercel.app");
window.moneytourApiUrl = (path) =>
  `${window.MONEYTOUR_API_URL.replace(/\/$/, "")}${path}`;
window.moneytourAuthHeaders = () => {
  const token = sessionStorage.getItem("moneytourToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
