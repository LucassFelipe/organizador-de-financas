/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f0f",
        surface: "#1e1e1e",
        border: "#2e2e2e",
        primary: "#4d94ff",
        secondary: "#6b7280",
        success: "#4ade80",
        danger: "#f87171",
        warning: "#fbbf24",
        info: "#22d3ee",
      },
    },
  },
  plugins: [],
}
