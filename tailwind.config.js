/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './assets/icons/**/*.svg'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          purpleMain: '#6C63FF'
        }
      },
      fontFamily: {
        lexend: [
          "Lexend-Regular",
          "Lexend-Medium",
          "Lexend-SemiBold",
          "Lexend-Bold",
        ],
        poppins: [
          "Poppins-Regular",
          "Poppins-Medium",
          "Poppins-SemiBold",
          "Poppins-Bold",
        ],
      }
    },
  },
  plugins: [],
  darkMode: "class"
};