import { useState } from 'react'
import { isIOS } from '../lib/health'
import { detectIOS } from '../lib/watch'
import { Icon } from './Icon'
import { Tap } from './ui'

export type IosChoice = { ver: '27' | 'old'; mode: 'ai' | 'manual' }

/** 自動偵測 iOS 版本；偵測不到就讓使用者自己選 */
export function useIosChoice(): [IosChoice, (c: Partial<IosChoice>) => void] {
  const detected = detectIOS()
  const [c, setC] = useState<IosChoice>({ ver: detected.major && detected.major < 27 ? 'old' : '27', mode: 'ai' })
  return [c, (p) => setC((x) => ({ ...x, ...p }))]
}

/** 教學上方的版本選擇：iOS 27 以上可以選用 AI 一句話建立捷徑 */
export function IosVersionPicker({ choice, onChange }: { choice: IosChoice; onChange: (c: Partial<IosChoice>) => void }) {
  const detected = detectIOS()
  const ios = isIOS()
  return (
    <div className="space-y-2">
      <div className="rounded-3xl bg-card p-3 shadow-card">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="smartphone" size={20} className="text-leaf-dark" />
          {!ios ? (
            <span>這台不是 iPhone，下面是 iPhone 的設定方式</span>
          ) : detected.major && detected.sure ? (
            <span>
              偵測到你的手機是 <b>iOS {detected.major}</b>
            </span>
          ) : (
            <span>看不出 iOS 版本（從主畫面打開時有時看不到），請選一下：</span>
          )}
        </div>
        <div className="mt-2 flex gap-1.5">
          {(
            [
              ['27', 'iOS 27 以上'],
              ['old', 'iOS 26 以下'],
            ] as const
          ).map(([id, label]) => (
            <Tap key={id} onClick={() => onChange({ ver: id })} className={`flex-1 rounded-2xl py-2 text-sm transition-colors ${choice.ver === id ? 'bg-ink text-cream' : 'bg-cream'}`}>
              {label}
            </Tap>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted">不確定的話：到「設定 → 一般 → 關於本機 → iOS 版本」看。</p>
      </div>
      {choice.ver === '27' && (
        <div className="flex gap-1.5">
          {(
            [
              ['ai', '用 AI 一句話建立（推薦）'],
              ['manual', '自己一步步建立'],
            ] as const
          ).map(([id, label]) => (
            <Tap key={id} onClick={() => onChange({ mode: id })} className={`flex-1 rounded-2xl py-2 text-xs transition-colors ${choice.mode === id ? 'bg-leaf text-on-leaf' : 'bg-card shadow-card'}`}>
              {label}
            </Tap>
          ))}
        </div>
      )}
    </div>
  )
}

/** iOS 27 用 AI 建捷徑的前提 */
export function AiRequirements() {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      <p>iOS 27 的「捷徑」可以用一句話描述，讓 Apple Intelligence 自動組好捷徑。需要：</p>
      <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted">
        <li>支援 Apple Intelligence 的 iPhone（iPhone 15 Pro 以後）</li>
        <li>「設定 → Apple Intelligence 與 Siri」已經打開</li>
      </ul>
      <p className="text-xs text-muted">不符合的話，切到上面的「自己一步步建立」。</p>
    </div>
  )
}
