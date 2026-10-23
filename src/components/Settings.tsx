import { useEffect, useState } from 'react'
import { download, exportBackup, importBackup, loadName, saveName, toICS, type Item } from '../lib'

export default function Settings({ items, setItems, say, onClose }: { items: Item[]; setItems: (i: Item[]) => void; say: (m: string) => void; onClose: () => void }) {
  const [name, setName] = useState(loadName)
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  const btn = 'flex min-h-12 w-full items-center justify-center rounded-full border border-line px-5 font-medium transition active:scale-95'

  const restore = async (f?: File) => {
    if (!f) return
    const r = importBackup(await f.text(), items)
    if (!r) return say('That file is not a deadlinr backup')
    setItems(r.items); say(`Restored ${r.added} new item${r.added === 1 ? '' : 's'}`)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Profile and data" onClick={e => e.stopPropagation()}
        className="sheet max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-3xl">
        <h2 className="font-serif text-3xl">Profile &amp; data</h2>

        <label className="mt-5 block text-sm font-medium">Your name <span className="font-normal text-muted">(optional)</span>
          <input value={name} onChange={e => { setName(e.target.value); saveName(e.target.value) }} placeholder="Shown when you share a countdown"
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-bg px-4 text-base" />
        </label>
        <p className="mt-2 text-sm text-muted">Accounts and cross-device sync aren’t available yet. deadlinr works fully without signing in, and your data stays on this device.</p>

        <div className="mt-6 space-y-3">
          <button className={btn} onClick={() => { download('deadlinr-backup.json', exportBackup(items), 'application/json'); say('Backup downloaded') }}>Download backup</button>
          <label className={`${btn} cursor-pointer`}>Restore from backup
            <input type="file" accept="application/json,.json" className="sr-only" onChange={e => { restore(e.target.files?.[0]); e.target.value = '' }} />
          </label>
          <button className={btn} disabled={!items.length} onClick={() => { download('deadlinr.ics', toICS(items), 'text/calendar'); say('Calendar file downloaded') }}>Export all to calendar (.ics)</button>
        </div>
        <button onClick={onClose} className="mt-6 min-h-12 w-full rounded-full bg-brand font-medium text-onbrand transition active:scale-95">Done</button>
      </div>
    </div>
  )
}
