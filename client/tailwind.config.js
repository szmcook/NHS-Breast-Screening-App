const colors = require('tailwindcss/colors')
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'highlight': '#005eb8',
        'background': '#d8dde0',
        'backgroundShadow': '#4a474a',
        'behindBackground': '#1e1e23'
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
