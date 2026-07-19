/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        municipal: {
          slate: '#475569',
          indigo: '#4f46e5',
          emerald: '#10b981',
          light: '#f8fafc',
          dark: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
