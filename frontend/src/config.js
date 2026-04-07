const isProd = process.env.NODE_ENV === "production";

export const API_BASE_URL = isProd 
  ? "https://balatonsse.hu"
  : "http://localhost:5000";

console.log('?? API_BASE_URL =', API_BASE_URL);