/** @type {import('tailwindcss').Config} */
// 顏色都是 CSS 變數（定義在 src/index.css），切換淺色／深色主題時整個 app 一起換
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: v('cream'),
        card: v('card'),
        ink: v('ink'),
        muted: v('muted'),
        'on-leaf': v('on-leaf'),
        leaf: { DEFAULT: v('leaf'), soft: v('leaf-soft'), dark: v('leaf-dark') },
        tomato: { DEFAULT: v('tomato'), soft: v('tomato-soft') },
        honey: { DEFAULT: v('honey'), soft: v('honey-soft'), ink: v('honey-ink') },
        sky: { DEFAULT: v('sky'), soft: v('sky-soft') },
        frost: { DEFAULT: v('frost'), soft: v('frost-soft') },
        rose: { DEFAULT: v('rose'), soft: v('rose-soft') },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
}
