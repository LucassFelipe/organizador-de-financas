/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0d6efd",
        secondary: "#6c757d",
        success: "#198754",
        danger: "#dc3545",
        warning: "#ffc107",
        info: "#0dcaf0",
        light: "#f8f9fa",
        dark: "#212529",
      },
    },
  },
  plugins: [],
}
