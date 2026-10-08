/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f7f3ec',
        ink: '#2f2a24',
        muted: '#8a8178',
        leaf: { DEFAULT: '#5b8c5a', soft: '#e3eedf', dark: '#3f6b3e' },
        tomato: { DEFAULT: '#e07a5f', soft: '#fbe5de' },
        honey: { DEFAULT: '#e9b44c', soft: '#fbf0d9' },
        sky: { DEFAULT: '#5fa8d3', soft: '#e0f0f9' },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(47,42,36,.04), 0 4px 16px rgba(47,42,36,.06)',
      },
    },
  },
  plugins: [],
}
