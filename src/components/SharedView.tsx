import { KINDS, countdownLabel, daysUntil, decodeShare, loadItems, prettyDate, saveItems } from '../lib'

export default function SharedView({ payload }: { payload: string }) {
  const s = decodeShare(payload)
  const add = () => {
    if (s) {
      const cur = loadItems()
      if (!cur.some(i => i.title === s.t && i.date === s.d && i.sharedBy === s.by))
        saveItems([...cur, { id: crypto.randomUUID(), title: s.t, date: s.d, kind: s.k, subject: s.s, sharedBy: s.by }])
    }
    location.hash = '#/app'
  }
  if (!s) return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div><p className="font-serif text-3xl">This link looks broken.</p>
        <a href="#/app" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-medium text-onbrand">Open deadlinr</a></div>
    </div>
  )
  const n = daysUntil(s.d)
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-sage px-5 py-10">
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
        <div className="ripple h-72 w-72 rounded-full" />
        <div className="ripple absolute h-72 w-72 rounded-full" style={{ animationDelay: '1.6s' }} />
      </div>
      <div className="reveal relative w-full max-w-sm rounded-3xl border border-line bg-card p-8 text-center shadow-sm">
        <span className="tag inline-block rounded-full px-3 py-1 text-sm font-medium">@shared by {s.by}</span>
        <p className="mt-6 text-sm font-medium uppercase tracking-widest text-muted">{KINDS.find(k => k.id === s.k)!.label}{s.s ? ` · ${s.s}` : ''}</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">{s.t}</h1>
        <p className="mt-6 font-serif text-6xl">{n < 0 ? 'Passed' : n <= 1 ? countdownLabel(n) : n}</p>
        {n > 1 && <p className="text-muted">days to go</p>}
        <p className="mt-2 text-sm text-muted">{prettyDate(s.d)}</p>
        <button onClick={add} className="mt-8 min-h-12 w-full rounded-full bg-brand font-medium text-onbrand transition active:scale-95">Add to my countdowns</button>
        <a href="#/" className="mt-3 inline-flex min-h-11 items-center text-sm text-muted">No thanks</a>
      </div>
    </div>
  )
}
