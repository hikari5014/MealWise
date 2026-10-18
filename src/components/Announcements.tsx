// 「今天」頁上方的公告（管理員從後台發布，看過可以關掉）
import { AnimatePresence, motion } from 'framer-motion'
import { useAnnouncements } from '../lib/shared'
import { Icon } from './Icon'
import { Tap } from './ui'

const STYLE = {
  info: { box: 'bg-sky-soft', icon: 'campaign', color: 'text-sky' },
  success: { box: 'bg-leaf-soft', icon: 'celebration', color: 'text-leaf-dark' },
  warning: { box: 'bg-honey-soft', icon: 'warning', color: 'text-honey-ink' },
} as const

export function AnnouncementBanner() {
  const { visible, dismiss } = useAnnouncements()
  return (
    <AnimatePresence initial={false}>
      {visible.map((a) => {
        const s = STYLE[a.level] ?? STYLE.info
        return (
          <motion.div key={a.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className={`flex items-start gap-2 rounded-3xl p-3 ${s.box}`} data-testid="announcement">
              <Icon name={s.icon} size={22} fill className={`mt-0.5 ${s.color}`} />
              <div className="min-w-0 flex-1">
                <div className="font-bold">{a.title}</div>
                {a.body && <p className="whitespace-pre-line text-sm">{a.body}</p>}
              </div>
              <Tap aria-label="關閉公告" onClick={() => dismiss(a.id)} className="p-1 text-muted">
                <Icon name="close" size={18} />
              </Tap>
            </div>
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}
