import { motion } from 'framer-motion'
import { haptic, spring } from '../lib/feedback'
import type { IconName } from '../lib/icons'
import { useTheme, type ThemePref } from '../lib/theme'
import { Icon } from './Icon'
import { Tap } from './ui'

const OPTIONS: { id: ThemePref; label: string; icon: IconName; bg: string; card: string; accent: string }[] = [
  { id: 'light', label: '淺色', icon: 'wb_sunny', bg: '#f7f3ec', card: '#ffffff', accent: '#5b8c5a' },
  { id: 'dark', label: '深色', icon: 'dark_mode', bg: '#000000', card: '#1c1c1e', accent: '#bef23c' },
  { id: 'system', label: '跟手機', icon: 'contrast', bg: 'linear-gradient(135deg,#f7f3ec 50%,#000 50%)', card: '#8e8e93', accent: '#bef23c' },
]

/** 外觀設定：淺色、深色（Apple Watch Nike 風格）、跟著手機 */
export function ThemeCard() {
  const { pref, setPref } = useTheme()
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <h2 className="mb-3 flex items-center gap-1.5 font-bold">
        <Icon name="contrast" size={20} className="text-leaf" />
        外觀
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const on = pref === o.id
          return (
            <Tap
              key={o.id}
              onClick={() => {
                haptic([8, 20, 8])
                setPref(o.id)
              }}
              className={`relative overflow-hidden rounded-2xl p-1.5 text-center ${on ? 'ring-2 ring-leaf' : 'ring-1 ring-ink/10'}`}
            >
              <span className="block h-16 rounded-xl p-2" style={{ background: o.bg }}>
                <span className="block h-3 w-3/4 rounded" style={{ background: o.card }} />
                <span className="mt-1.5 block h-5 rounded-md" style={{ background: o.card }} />
                <span className="mt-1.5 block h-2 w-1/2 rounded-full" style={{ background: o.accent }} />
              </span>
              <span className="mt-1.5 flex items-center justify-center gap-1 text-xs">
                <Icon name={o.icon} size={14} />
                {o.label}
              </span>
              {on && (
                <motion.span layoutId="theme-check" transition={spring} className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-leaf text-on-leaf">
                  <Icon name="check" size={13} weight={700} />
                </motion.span>
              )}
            </Tap>
          )
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted">深色主題參考 Apple Watch Nike 錶面：純黑底、螢光綠重點色，晚上看比較不刺眼</p>
    </section>
  )
}
