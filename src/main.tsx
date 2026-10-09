import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { applyTheme, getThemePref } from './lib/theme'

// 主題：一開始套用一次；選「跟手機」時，手機切換深淺色也跟著換
applyTheme(getThemePref())
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(getThemePref()))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
