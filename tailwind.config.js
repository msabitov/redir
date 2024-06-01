/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      spacing: {
        '4xs': '4px',
        '3xs': '6px',
        '2xs': '8px',
        'xs': '10px',
        's': '12px',
        'm': '14px'
      },
      colors: {
        'back': '#cecaca'
      }
    }
  },
  plugins: [],
}

