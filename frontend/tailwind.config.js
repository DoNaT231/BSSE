/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      spacing: {
        header: "var(--bsse-space-header-offset)",
        "page-bottom": "var(--bsse-space-page-bottom)",
      },
      colors: {
        page: {
          bg: "var(--bsse-color-page-bg)",
          "bg-alt": "var(--bsse-color-page-bg-alt)",
        },
        primaryLight: "#eef2ff",
        border: "#d1d5db",
        yellow: "#facc15",
        lightBlue: "#60a5fa",
        blackSoft: "#111827",
      },
      maxWidth: {
        content: "var(--bsse-max-content)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out",
        scaleIn: "scaleIn 0.25s ease-out",
      },
      borderRadius: {
        card: "12px",
        pill: "17px",
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
