/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e", // Emerald 500
        secondary: "#3b82f6", // Blue 500
        dark: "#0f172a", // Slate 900
      }
    },
  },
  plugins: [],
}
