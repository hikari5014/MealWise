import { motion, MotionConfig } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { Food } from './components/Food'
import { HealthSyncProvider } from './components/HealthSync'
import { Icon } from './components/Icon'
import { BatchCookProvider } from './components/BatchCook'
import { ComposerProvider } from './components/Composer'
import { RecipeDetailProvider } from './components/RecipeDetail'
import { RecipeEditorProvider } from './components/RecipeEditor'
import { ShareProvider } from './components/Share'
import { UpdateProvider } from './components/Update'
import { Tap, ToastProvider } from './components/ui'
import { haptic, spring } from './lib/feedback'
import { setCustomRecipes } from './data/recipes'
import { itemImage } from './lib/eatout'
import { db } from './db'
import { useProfile } from './lib/hooks'
import { RecipesVersion } from './lib/recipeStore'
import type { IconName } from './lib/icons'
import Lists from './pages/Lists'
import Me from './pages/Me'
import Onboarding from './pages/Onboarding'
import Plan from './pages/Plan'
import Today from './pages/Today'
import { PantryPlanProvider } from './components/PantryPlan'
import { EatOutPickerProvider } from './components/EatOut'
import Train from './pages/Train'

const TABS = [
  { id: 'today', label: '今天', icon: 'restaurant' },
  { id: 'plan', label: '菜單', icon: 'calendar_month' },
  { id: 'lists', label: '清單', icon: 'shopping_cart' },
  { id: 'train', label: '訓練', icon: 'fitness_center' },
  { id: 'me', label: '我的', icon: 'person' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[]

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const profile = useProfile()
  // 自訂食譜：讀到後放進全部食譜清單；版本字串讓有快取的畫面重新計算
  const customs = useLiveQuery(() => db.recipes.orderBy('createdAt').toArray())
  const recipesVersion = useMemo(() => {
    // 外食品項的圖示一律照品名重新對應（舊版存的是別的圖）
    setCustomRecipes((customs ?? []).map((r) => (r.eatout ? { ...r, image: itemImage({ id: r.id, b: r.eatout.brandId, n: r.name, k: 0 }) } : r)))
    return (customs ?? []).map((r) => `${r.id}:${r.createdAt}`).join()
  }, [customs])
  const [tab, setTab] = useState<TabId>('today')
  // 底部選單先亮起來，頁面內容在背景畫，畫的時候不會擋住點擊
  const [navTab, setNavTab] = useState<TabId>('today')
  const [dir, setDir] = useState(0)

  const go = (next: TabId) => {
    if (next === navTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    haptic(6)
    setNavTab(next)
    startTransition(() => {
      setDir(TABS.findIndex((t) => t.id === next) > TABS.findIndex((t) => t.id === tab) ? 1 : -1)
      setTab(next)
    })
    window.scrollTo({ top: 0 })
  }

  return (
    <RecipesVersion.Provider value={recipesVersion}>
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <UpdateProvider>
          <HealthSyncProvider>
            <ShareProvider onImported={() => go('plan')}>
              <RecipeEditorProvider>
<RecipeDetailProvider>
              <BatchCookProvider>
              <ComposerProvider>
              <PantryPlanProvider>
              <EatOutPickerProvider>
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
                        {tab === 'train' && <Train profile={profile} />}
                        {tab === 'me' && <Me profile={profile} />}
                      </motion.div>
                    </main>
                    <BottomNav tab={navTab} onChange={go} />
                  </>
                )}
              </EatOutPickerProvider>
              </PantryPlanProvider>
              </ComposerProvider>
              </BatchCookProvider>
              </RecipeDetailProvider>
</RecipeEditorProvider>
            </ShareProvider>
          </HealthSyncProvider>
        </UpdateProvider>
      </ToastProvider>
    </MotionConfig>
    </RecipesVersion.Provider>
  )
}

/**
 * iPhone 的已知問題：鍵盤收起後，貼在底部的元素有時會卡在畫面中間。
 * 鍵盤打開時先把導覽列藏起來；收起後強制瀏覽器重新排版一次，讓它回到底部。
 */
function useKeyboardOpen() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const check = () => setOpen(vv.height < window.innerHeight * 0.78)
    const relayout = () =>
      window.setTimeout(() => {
        window.scrollTo(window.scrollX, window.scrollY)
        check()
      }, 120)
    vv.addEventListener('resize', check)
    window.addEventListener('focusout', relayout)
    window.addEventListener('orientationchange', relayout)
    return () => {
      vv.removeEventListener('resize', check)
      window.removeEventListener('focusout', relayout)
      window.removeEventListener('orientationchange', relayout)
    }
  }, [])
  return open
}

function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  const keyboard = useKeyboardOpen()
  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink/5 bg-cream/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-200 ${
        keyboard ? 'pointer-events-none translate-y-full' : ''
      }`}
    >
      <div className="mx-auto flex max-w-lg px-2">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <Tap
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5"
            >
              {active && (
                <motion.span layoutId="nav-pill" transition={spring} className="absolute inset-x-3 inset-y-1.5 rounded-2xl bg-leaf-soft" />
              )}
              <motion.span
                className={`relative grid place-items-center ${active ? 'text-leaf-dark' : 'text-muted'}`}
                animate={active ? { scale: [1, 1.25, 1.08], y: [0, -4, -1], rotate: [0, -8, 0] } : { scale: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <Icon name={t.icon} size={24} fill={active} weight={active ? 600 : 400} />
              </motion.span>
              <span className={`relative text-[11px] font-medium ${active ? 'text-leaf-dark' : 'text-muted'}`}>{t.label}</span>
            </Tap>
          )
        })}
      </div>
    </nav>
  )
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
        <Food id="bento" size={72} />
      </motion.div>
    </div>
  )
}
