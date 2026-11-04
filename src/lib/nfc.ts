// 讀寫器材上的 NFC 貼紙：Android 的 Chrome 才支援（iPhone 的網頁還不能讀 NFC）
interface NdefRecord {
  recordType: string
  data?: DataView
  encoding?: string
}
interface NdefReaderLike {
  scan(opts?: { signal?: AbortSignal }): Promise<void>
  write(msg: { records: { recordType: string; data: string }[] }, opts?: { signal?: AbortSignal }): Promise<void>
  onreading: ((e: { serialNumber?: string; message: { records: NdefRecord[] } }) => void) | null
  onreadingerror: (() => void) | null
}
type NdefCtor = new () => NdefReaderLike

const Ctor = () => (window as unknown as { NDEFReader?: NdefCtor }).NDEFReader

export const nfcSupported = () => typeof window !== 'undefined' && !!Ctor()

/** 讀一張貼紙：有網址或文字就回傳內容，空白貼紙回傳它的序號 */
export function readNfc(signal: AbortSignal): Promise<string> {
  const C = Ctor()
  if (!C) return Promise.reject(new Error('unsupported'))
  return new Promise((resolve, reject) => {
    const r = new C()
    r.onreading = (e) => {
      const dec = new TextDecoder()
      for (const rec of e.message.records) {
        if ((rec.recordType === 'url' || rec.recordType === 'text') && rec.data) return resolve(dec.decode(rec.data))
      }
      if (e.serialNumber) return resolve(`nfc:${e.serialNumber}`)
      reject(new Error('empty'))
    }
    r.onreadingerror = () => reject(new Error('read'))
    r.scan({ signal }).catch(reject)
  })
}

/** 把一段網址寫進貼紙（之後掃到就認得是哪台） */
export async function writeNfc(url: string, signal?: AbortSignal) {
  const C = Ctor()
  if (!C) throw new Error('unsupported')
  await new C().write({ records: [{ recordType: 'url', data: url }] }, { signal })
}
