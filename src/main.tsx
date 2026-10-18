import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { applyTheme, getThemePref } from './lib/theme'
import { installSyncHooks } from './lib/sync'

// 主題：一開始套用一次；選「跟手機」時，手機切換深淺色也跟著換
applyTheme(getThemePref())
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(getThemePref()))

// 記下每筆資料的修改時間，登入後才知道要同步哪些
installSyncHooks()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
