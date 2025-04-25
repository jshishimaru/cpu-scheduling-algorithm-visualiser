/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          500: '#795548',
        },
        blueGray: {
          500: '#607D8B',
        },
      },
    },
  },
  plugins: [],
}
