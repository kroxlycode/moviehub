/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a202c',
        secondary: '#ffd700',
        accent: '#e53e3e',
        dark: '#0f0f0f',
        'dark-lighter': '#1a1a1a',
        'gray-custom': '#2d2d2d'
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2d2d2d 100%)',
        'gradient-overlay': 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)'
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

