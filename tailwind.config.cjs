/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // base
        background: "#020617", // slate-950
        foreground: "#e5e7eb", // slate-200

        // brand
        primary: {
          DEFAULT: "#2563eb", // blue-600
          foreground: "#f9fafb",
        },
        secondary: {
          DEFAULT: "#111827", // gray-900
          foreground: "#e5e7eb",
        },

        // neutrales (usando escala de slate para coherencia)
        slate: require("tailwindcss/colors").slate,
      },
      fontFamily: {
        // misma fuente que JobBoard
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 25px -5px rgba(15,23,42,0.15), 0 8px 10px -6px rgba(15,23,42,0.15)",
      },
      borderRadius: {
        xl: "0.9rem",
      },
    },
  },
  plugins: [],
};
