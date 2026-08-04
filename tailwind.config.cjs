/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#3a322b',
        'brand-secondary': '#b58e6f',
        'brand-accent': '#e8e0d9',
        'brand-light': '#faf8f6',
        'brand-dark': '#211c18',
        'brand-gold': '#c5a47e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
};
