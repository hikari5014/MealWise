import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import changelog from './src/data/changelog.json'

// GitHub Pages 會放在 /<repo>/ 底下，由部署流程傳入 BASE_PATH
const base = process.env.BASE_PATH ?? '/'
const version = changelog[0].version

/** 只下載用到的 Material Symbols 圖示，清單在 src/lib/icons.ts */
const iconFont = (): Plugin => ({
  name: 'material-symbols-subset',
  transformIndexHtml(html) {
    const src = readFileSync(new URL('./src/lib/icons.ts', import.meta.url), 'utf8')
    const block = src.slice(src.indexOf('['), src.indexOf('] as const'))
    const names = [...block.matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]).sort()
    const href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' +
      `&icon_names=${names.join(',')}&display=block`
    return html.replace('<!-- material-symbols -->', `<link rel="stylesheet" href="${href}" />`)
  },
})

/** 輸出 version.json，給「檢查更新」比對用（不放進離線快取） */
const versionFile = (): Plugin => ({
  name: 'version-file',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ version, changelog }, null, 2),
    })
  },
})

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    iconFont(),
    versionFile(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // 新版下載好就直接接手。舊版（v0.3 以前）的頁面只會等新版自己接手，
        // 不這樣做的話新版會一直卡在「等待中」，使用者永遠看到舊版。
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,png,webp}'],
        // 食譜照片比較大，看過才存進快取，不在安裝時全部下載
        globIgnores: ['photos/**'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/photos/'),
            handler: 'CacheFirst',
            options: { cacheName: 'recipe-photos', expiration: { maxEntries: 300 } },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: '好食光 MealWise',
        short_name: '好食光',
        description: '規劃餐點、採購清單，輕鬆記錄飲食與飲水',
        lang: 'zh-Hant-TW',
        theme_color: '#f7f3ec',
        background_color: '#f7f3ec',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
