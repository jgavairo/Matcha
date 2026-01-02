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
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)'},
          '100%': { transform: 'translateY(0)'},
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out forwards',
        slideDown: 'slideDown 0.3s ease-out forwards',
      },
      zIndex: {
        // Global Layout Stacking
        'filters': '40',      // Sticky filters bar (Must be above card-ui)
        'header': '50',       // Top navigation
        'notification': '55', // Notification dropdown
        'bottom-nav': '60',   // Bottom navigation
        'modal': '70',        // Modals, Drawers, Overlays
        'toast': '80',        // Toast notifications (Always on top)
        'card-overlay': '10', // Gradient overlays
        'card-content': '20', // Interactive content areas
        'card-ui': '30',      // Buttons, badges on top of content
        'undo-ui': '10',      // Buttons, badges on top of content
        'scroll-top': '35',   // Scroll to top button (Between cards and filters)
        'filter-dropdown': '38', // Dropdown menu (Behind filter bar, above content)
      }
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}
