/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  purge: ['./src/**/*.{js,ts,jsx,tsx}', '/dist/index.html'],
  theme: {
    extend: {
      colors: {
        'primary': '#7800c8',
        'text': '#101419',
        'background': '#FFFFFF',
        'menu': '#c9c9c9',
        'button': '#dbdbdb',
        'hover': '#F7F7F7',
        'border': '#D1D9DD',
        'dark-primary': '',
        'dark-text': '#F0F3F4',
        'dark-background': '#1D1D1D',
        'dark-menu': '#000000',
        'dark-button': '#101010',
        'dark-hover': '#181919',
        'dark-border': '#72767A',
        'link': '#646cff',
        'link-hover': '#535bf2',
        'error': '#d73434',
        'success': '#4bb543',
        'disabled': '',
        'unavailable': '',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
