module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f4ff',
          100: '#e6e8ff',
          200: '#d2d6ff',
          300: '#b3baff',
          400: '#8c96ff',
          500: '#6366f1', // Electric Cobalt Indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        darkBg: '#070a13',
        darkCard: '#0f1322',
        darkBorder: '#1e2538',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
