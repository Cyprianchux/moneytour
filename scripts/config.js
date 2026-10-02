// Set this to the deployed API origin when the static frontend and API use different domains.
window.MONEYTOUR_API_URL = window.MONEYTOUR_API_URL || "";
window.moneytourApiUrl = (path) =>
  `${window.MONEYTOUR_API_URL.replace(/\/$/, "")}${path}`;
window.moneytourAuthHeaders = () => {
  const token = sessionStorage.getItem("moneytourToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
