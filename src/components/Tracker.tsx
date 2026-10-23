import { useEffect, useMemo, useRef, useState } from 'react'
import { KINDS, countdownLabel, daysUntil, download, getSuggestions, loadItems, loadName, prettyDate, saveItems, saveName, shareItem, toICS, todayISO, type Item, type Kind, type Suggestion } from '../lib'
import ThemeButton from './ThemeButton'
import Settings from './Settings'

const cv = (k: Kind) => ({ ['--c' as string]: `var(--${k})` })
const isSoon = (d: string) => { const n = daysUntil(d); return n >= 0 && n <= 2 }
const kindLabel = (k: Kind) => KINDS.find(x => x.id === k)!.label

export default function Tracker() {
  const [items, setItems] = useState<Item[]>(loadItems)
  const [editing, setEditing] = useState<Item | 'new' | null>(null)
  const [settings, setSettings] = useState(false)
  const [toast, setToast] = useState('')
  useEffect(() => saveItems(items), [items])
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600) }

  const { upcoming, past } = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date))
    return { upcoming: sorted.filter(i => daysUntil(i.date) >= 0), past: sorted.filter(i => daysUntil(i.date) < 0).reverse() }
  }, [items])
  const next = upcoming[0]
  const rest = upcoming.slice(1)
  const mine = rest.filter(i => !i.sharedBy)
  const shared = rest.filter(i => i.sharedBy)
  const ideas = useMemo(() => getSuggestions().filter(s => !items.some(i => i.title === s.title)), [items])

  const upsert = (it: Item) => { setItems(p => (p.some(x => x.id === it.id) ? p.map(x => (x.id === it.id ? it : x)) : [...p, it])); setEditing(null) }
  const remove = (id: string) => { setItems(p => p.filter(x => x.id !== id)); setEditing(null) }
  const addIdea = (s: Suggestion) => { setItems(p => [...p, { id: crypto.randomUUID(), title: s.title, date: s.date, kind: 'event' }]); say(`${s.title} added`) }

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <a href="#/" className="font-serif text-2xl tracking-tight">deadlinr</a>
        <div className="flex gap-2">
          <button onClick={() => setSettings(true)} aria-label="Profile and data" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card transition active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>
          </button>
          <ThemeButton />
        </div>
      </header>

      <h1 className="rise mt-10 font-serif text-4xl tracking-tight sm:text-5xl">{next ? 'Coming up' : 'Nothing due.'}</h1>

      {items.length === 0 && (
        <div className="rise mt-8 rounded-3xl border border-dashed border-line bg-card p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-sage font-serif text-2xl text-brand">0</div>
          <p className="font-serif text-2xl">A clear calendar.</p>
          <p className="mx-auto mt-2 max-w-xs text-muted">Add an exam, test or assignment, or start with a popular countdown below.</p>
          <button onClick={() => setEditing('new')} className="mt-6 min-h-12 rounded-full bg-brand px-6 font-medium text-onbrand transition active:scale-95">Add a deadline</button>
        </div>
      )}

      {next && (
        <button onClick={() => setEditing(next)} style={{ ...cv(next.kind), ['--ring' as string]: 'var(--brand)' }}
          className={`rise mt-6 block w-full rounded-3xl border border-transparent bg-brand p-6 text-left text-onbrand shadow-sm transition active:scale-[.99] sm:p-8 ${isSoon(next.date) ? 'soon' : ''}`}>
          <span className="text-sm font-medium uppercase tracking-widest opacity-80">Next · {kindLabel(next.kind)}{next.sharedBy && ` · @shared by ${next.sharedBy}`}</span>
          <span className="mt-3 block font-serif text-3xl leading-tight sm:text-4xl">{next.title}</span>
          <span className="mt-6 flex items-end justify-between gap-4">
            <span className={`font-serif text-7xl leading-none tracking-tight sm:text-8xl ${isSoon(next.date) ? 'breathe' : ''}`}>
              {daysUntil(next.date) <= 1 ? countdownLabel(daysUntil(next.date)) : daysUntil(next.date)}
              {daysUntil(next.date) > 1 && <span className="ml-2 text-xl opacity-80">days</span>}
            </span>
            <span className="text-right text-sm opacity-90">{prettyDate(next.date)}{next.subject && <><br />{next.subject}</>}</span>
          </span>
        </button>
      )}

      {mine.length > 0 && <List title="Later" items={mine} onPick={setEditing} />}
      {shared.length > 0 && <List title="Shared with you" items={shared} onPick={setEditing} />}
      {ideas.length > 0 && (
        <section className="rise mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">Popular countdowns</h2>
          <ul className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
            {ideas.map(s => (
              <li key={s.title} className="snap-start">
                <button onClick={() => addIdea(s)} aria-label={`Add ${s.title}`} className="flex min-h-[7rem] w-40 flex-col justify-between rounded-2xl border border-line bg-card p-4 text-left transition active:scale-95">
                  <span className="font-medium leading-snug">{s.title}</span>
                  <span className="flex items-end justify-between"><span className="font-serif text-2xl">{countdownLabel(daysUntil(s.date))}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-sage text-lg text-brand">+</span></span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {past.length > 0 && <List title="Past" items={past} onPick={setEditing} faded />}

      <button onClick={() => setEditing('new')} aria-label="Add a deadline"
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-10 grid h-14 w-14 place-items-center rounded-full bg-brand text-3xl leading-none text-onbrand shadow-lg transition active:scale-90 sm:right-[max(1.25rem,calc(50vw-21rem))]">+</button>

      {editing && <Sheet item={editing === 'new' ? null : editing} onSave={upsert} onDelete={remove} onClose={() => setEditing(null)} say={say} />}
      {settings && <Settings items={items} setItems={setItems} say={say} onClose={() => setSettings(false)} />}
      {toast && <div role="status" className="rise fixed inset-x-0 bottom-24 z-30 mx-auto w-fit max-w-[90%] rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg shadow-lg">{toast}</div>}
    </div>
  )
}

function List({ title, items, onPick, faded }: { title: string; items: Item[]; onPick: (i: Item) => void; faded?: boolean }) {
  return (
    <section className={`rise mt-10 ${faded ? 'opacity-60' : ''}`}>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">{title}</h2>
      <ul className="space-y-3">
        {items.map(it => {
          const n = daysUntil(it.date)
          return (
            <li key={it.id}>
              <button onClick={() => onPick(it)} style={cv(it.kind)}
                className={`flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl border border-line bg-card p-4 text-left transition active:scale-[.99] ${isSoon(it.date) ? 'soon' : ''}`}>
                <span className="bar h-10 w-1.5 shrink-0 rounded-full" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{it.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className="chip rounded-full px-2 py-0.5 text-xs font-medium">{kindLabel(it.kind)}</span>
                    {it.sharedBy && <span className="tag rounded-full px-2 py-0.5 text-xs font-medium">@shared by {it.sharedBy}</span>}
                    {it.subject && <span>{it.subject}</span>}
                    <span>{prettyDate(it.date)}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-right font-serif text-xl">
                  {isSoon(it.date) && <span className="pulse-dot" aria-hidden />}{countdownLabel(n)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Sheet({ item, onSave, onDelete, onClose, say }: { item: Item | null; onSave: (i: Item) => void; onDelete: (id: string) => void; onClose: () => void; say: (m: string) => void }) {
  const [kind, setKind] = useState<Kind>(item?.kind ?? 'exam')
  const [title, setTitle] = useState(item?.title ?? '')
  const [date, setDate] = useState(item?.date ?? todayISO())
  const [subject, setSubject] = useState(item?.subject ?? '')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const submit = () => {
    if (!title.trim() || !date) return
    onSave({ id: item?.id ?? crypto.randomUUID(), title: title.trim(), date, kind, subject: subject.trim() || undefined, sharedBy: item?.sharedBy })
  }
  const share = async () => {
    if (!item) return
    let by = loadName()
    if (!by) { by = (window.prompt('Your name (shown to the person you share with):') || '').trim(); if (!by) return; saveName(by) }
    const r = await shareItem(item, by)
    if (r === 'copied') say('Link copied. Send it to a friend')
    else if (r === 'failed') say('Could not share. Try again')
  }
  const field = 'mt-2 min-h-12 w-full rounded-xl border border-line bg-bg px-4 text-base'
  const small = 'min-h-11 flex-1 rounded-full border border-line px-4 text-sm font-medium transition active:scale-95'

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={item ? 'Edit deadline' : 'New deadline'} onClick={e => e.stopPropagation()}
        className="sheet max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-3xl">
        <h2 className="font-serif text-3xl">{item ? 'Edit deadline' : 'New deadline'}</h2>

        <div role="radiogroup" aria-label="Type" className="mt-5 grid grid-cols-4 gap-1 rounded-2xl bg-bg p-1">
          {KINDS.map(k => (
            <button key={k.id} role="radio" aria-checked={kind === k.id} onClick={() => setKind(k.id)}
              className={`min-h-11 rounded-xl text-[13px] font-medium transition ${kind === k.id ? 'bg-brand text-onbrand' : 'text-muted'}`}>{k.label}</button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-medium">Title
          <input ref={ref} value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="e.g. Databases final" className={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="mt-4 block text-sm font-medium">Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={field} />
          </label>
          <label className="mt-4 block text-sm font-medium">Subject <span className="font-normal text-muted">(optional)</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="IT 101" className={field} />
          </label>
        </div>

        {item && (
          <div className="mt-5 flex gap-3">
            <button onClick={share} className={small}>Share</button>
            <button onClick={() => { download(`${item.title}.ics`, toICS([item]), 'text/calendar'); say('Calendar file downloaded') }} className={small}>Add to calendar</button>
          </div>
        )}
        <div className="mt-4 flex gap-3">
          {item && <button onClick={() => onDelete(item.id)} className="min-h-12 rounded-full border border-line px-5 font-medium text-[var(--exam)] transition active:scale-95">Delete</button>}
          <button onClick={onClose} className="min-h-12 flex-1 rounded-full border border-line px-5 font-medium transition active:scale-95">Cancel</button>
          <button onClick={submit} disabled={!title.trim() || !date} className="min-h-12 flex-1 rounded-full bg-brand px-5 font-medium text-onbrand transition active:scale-95 disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  )
}
