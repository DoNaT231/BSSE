export function formatHungarianDate(isoDate, options = {}) {
  if (!isoDate) return "";

  const defaultOptions = {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "long",     // január
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(isoDate).toLocaleString(
    "hu-HU",
    { ...defaultOptions, ...options }
  );
}