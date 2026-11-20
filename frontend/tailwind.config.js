/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yt: {
          red: '#FF0000',
          darkred: '#CC0000',
          dark: '#0F0F0F',
          surface: '#FFFFFF',
          softbg: '#F9F9F9',
          border: '#E5E5E5',
          text: '#0F0F0F',
          muted: '#606060'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Google Sans', 'Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
