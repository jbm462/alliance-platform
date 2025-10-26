/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Human elements
        human: {
          DEFAULT: '#3B82F6', // blue-500
          light: '#DBEAFE',   // blue-100
          dark: '#1D4ED8',    // blue-700
        },
        // AI elements
        ai: {
          DEFAULT: '#10B981', // emerald-500
          light: '#D1FAE5',   // emerald-100
          dark: '#047857',    // emerald-700
        },
      },
    },
  },
  plugins: [],
} 