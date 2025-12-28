/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        }
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)'},
          '100%': { transform: 'translateY(0)'},
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out forwards',
      }
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}
