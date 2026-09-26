/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fatigue: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          900: '#0f172a'
        },
        calm: {
          teal: '#0d9488',
          emerald: '#059669',
          amber: '#d97706',
          coral: '#e11d48'
        }
      }
    },
  },
  plugins: [],
}
