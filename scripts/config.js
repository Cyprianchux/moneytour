// Set this to the deployed API origin when the static frontend and API use different domains.
const localHosts = ["localhost", "127.0.0.1"];
window.MONEYTOUR_API_URL =
  window.MONEYTOUR_API_URL ||
  (window.location && localHosts.includes(window.location.hostname)
    ? ""
    : "https://moneytour-api.vercel.app");
window.moneytourApiUrl = (path) =>
  `${window.MONEYTOUR_API_URL.replace(/\/$/, "")}${path}`;
window.moneytourFormatAmount = (amount) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
window.moneytourTimeOfDay = (date = new Date()) => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 12 * 60) return "morning";
  if (minutes < 17 * 60 + 30) return "afternoon";
  return "evening";
};
window.moneytourAuthHeaders = () => {
  const token = sessionStorage.getItem("moneytourToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
