/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
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
      colors: {
        primaryLight: "#eef2ff",
        border: "#d1d5db",
        yellow: "#facc15",      // ha van konkrét értéked, ide tedd
        lightBlue: "#60a5fa",   // ide is a sajátod
        blackSoft: "#111827",
      },
      borderRadius: {
        card: "12px",
        pill: "17px",
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0,0,0,0.05)",
      },
      typography:{
        text: ""
      }
    },
  },
  plugins: [],
};
