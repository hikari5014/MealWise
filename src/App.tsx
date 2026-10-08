import { motion, MotionConfig } from 'framer-motion'
import { useState } from 'react'
import { HealthSyncProvider } from './components/HealthSync'
import { RecipeDetailProvider } from './components/RecipeDetail'
import { ToastProvider } from './components/ui'
import { haptic, spring } from './lib/feedback'
import { useProfile } from './lib/hooks'
import Lists from './pages/Lists'
import Me from './pages/Me'
import Onboarding from './pages/Onboarding'
import Plan from './pages/Plan'
import Today from './pages/Today'

const TABS = [
  { id: 'today', label: '今天', icon: '🍽' },
  { id: 'plan', label: '菜單', icon: '📅' },
  { id: 'lists', label: '清單', icon: '🛒' },
  { id: 'me', label: '我的', icon: '🙂' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const profile = useProfile()
  const [tab, setTab] = useState<TabId>('today')
  const [dir, setDir] = useState(0)

  const go = (next: TabId) => {
    if (next === tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    haptic(6)
    setDir(TABS.findIndex((t) => t.id === next) > TABS.findIndex((t) => t.id === tab) ? 1 : -1)
    setTab(next)
    window.scrollTo({ top: 0 })
  }

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <HealthSyncProvider>
          <RecipeDetailProvider>
            {profile === undefined ? (
              <Splash />
            ) : profile === null ? (
              <Onboarding />
            ) : (
              <>
                <main className="mx-auto max-w-lg px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-[calc(12px+env(safe-area-inset-top))]">
                  {/* 只做「進場」動畫：換頁不必等舊頁離場，切換更跟手也更穩定 */}
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: dir * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {tab === 'today' && <Today profile={profile} onGoPlan={() => go('plan')} />}
                    {tab === 'plan' && <Plan profile={profile} />}
                    {tab === 'lists' && <Lists profile={profile} />}
                    {tab === 'me' && <Me profile={profile} />}
                  </motion.div>
                </main>
                <BottomNav tab={tab} onChange={go} />
              </>
            )}
          </RecipeDetailProvider>
        </HealthSyncProvider>
      </ToastProvider>
    </MotionConfig>
  )
}

function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/5 bg-cream/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg px-2">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5"
            >
              {active && (
                <motion.span layoutId="nav-pill" transition={spring} className="absolute inset-x-3 inset-y-1.5 rounded-2xl bg-leaf-soft" />
              )}
              <motion.span
                className="relative text-xl"
                animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                transition={spring}
              >
                {t.icon}
              </motion.span>
              <span className={`relative text-[11px] font-medium ${active ? 'text-leaf-dark' : 'text-muted'}`}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <motion.div
        className="text-5xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🍱
      </motion.div>
    </div>
  )
}
