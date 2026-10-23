import { useEffect, useState } from 'react'

export type Kind = 'exam' | 'test' | 'assignment' | 'event'
export interface Item { id: string; title: string; date: string; kind: Kind; subject?: string; sharedBy?: string }

export const KINDS: { id: Kind; label: string }[] = [
  { id: 'exam', label: 'Exam' },
  { id: 'test', label: 'Test' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'event', label: 'Countdown' },
]

const KEY = 'due.items.v1'

export function loadItems(): Item[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch { return [] }
}
export function saveItems(items: Item[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* storage full or blocked */ }
}

const parse = (d: string) => { const [y, m, day] = d.split('-').map(Number); return new Date(y, m - 1, day) }

/** Whole calendar days from today (0 = today, negative = past). */
export function daysUntil(date: string): number {
  const t = new Date()
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()
  return Math.round((parse(date).getTime() - today) / 864e5)
}
export const countdownLabel = (n: number) =>
  n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n < 0 ? `${-n} day${n === -1 ? '' : 's'} ago` : `${n} days`
export const prettyDate = (d: string) =>
  parse(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const todayISO = () => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export function useTheme() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#11130e' : '#3f5a1f')
    try { localStorage.setItem('due.theme', theme) } catch { /* ignore */ }
  }, [theme])
  return { theme, toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) }
}

interface InstallEvent extends Event { prompt: () => Promise<void> }
export function useInstall() {
  const [ev, setEv] = useState<InstallEvent | null>(null)
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEv(e as InstallEvent) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])
  return ev ? async () => { await ev.prompt(); setEv(null) } : null
}

export function useHashRoute() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const h = () => { setHash(location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  return hash
}

/* ---------- Suggested countdowns ---------- */
export interface Suggestion { title: string; date: string }
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const blackFriday = (y: number) => { const dow = new Date(y, 10, 1).getDay(); return iso(y, 11, 1 + ((4 - dow + 7) % 7) + 21 + 1) }
const easter = (y: number) => { // standard Gregorian algorithm
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1
  return iso(y, month, day)
}
const nextOf = (f: (y: number) => string) => { const y = new Date().getFullYear(); const a = f(y); return daysUntil(a) >= 0 ? a : f(y + 1) }
export function getSuggestions(): Suggestion[] {
  const fixed = (m: number, d: number) => nextOf(y => iso(y, m, d))
  const list: Suggestion[] = [
    { title: 'Halloween', date: fixed(10, 31) },
    { title: 'Black Friday', date: nextOf(blackFriday) },
    { title: 'Christmas', date: fixed(12, 25) },
    { title: "New Year's Day", date: fixed(1, 1) },
    { title: "Valentine's Day", date: fixed(2, 14) },
    { title: 'Easter Sunday', date: nextOf(easter) },
    { title: 'Youth Day', date: fixed(6, 16) },
    { title: 'Heritage Day', date: fixed(9, 24) },
    { title: 'GTA 6 launch (planned)', date: '2026-11-19' },
  ]
  return list.filter(s => daysUntil(s.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))
}

/* ---------- Profile name (optional, only used when sharing) ---------- */
export const loadName = () => { try { return localStorage.getItem('due.name') || '' } catch { return '' } }
export const saveName = (n: string) => { try { localStorage.setItem('due.name', n.trim().slice(0, 40)) } catch { /* ignore */ } }

/* ---------- Sharing via link (no server needed) ---------- */
export interface Shared { t: string; d: string; k: Kind; s?: string; by: string }
const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
export const shareUrl = (it: Item, by: string) =>
  `${location.origin}/#/s/${b64(JSON.stringify({ t: it.title, d: it.date, k: it.kind, s: it.subject, by }))}`
export function decodeShare(payload: string): Shared | null {
  try {
    const raw = payload.replace(/-/g, '+').replace(/_/g, '/')
    const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw), c => c.charCodeAt(0))))
    if (typeof o.t !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.d) || !KINDS.some(k => k.id === o.k)) return null
    return { t: o.t.slice(0, 80), d: o.d, k: o.k, s: typeof o.s === 'string' ? o.s.slice(0, 40) : undefined, by: String(o.by || 'a friend').slice(0, 40) }
  } catch { return null }
}
export async function shareItem(it: Item, by: string): Promise<'shared' | 'copied' | 'failed'> {
  const url = shareUrl(it, by)
  try {
    if (navigator.share) { await navigator.share({ title: it.title, text: `${it.title}: ${countdownLabel(daysUntil(it.date))}`, url }); return 'shared' }
    await navigator.clipboard.writeText(url); return 'copied'
  } catch { return 'failed' }
}

/* ---------- Calendar (.ics) and backup ---------- */
export function download(name: string, text: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
export function toICS(items: Item[]) {
  const ymd = (d: string) => d.replace(/-/g, '')
  const esc = (s: string) => s.replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n')
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const ev = items.map(i => {
    const end = parse(i.date); end.setDate(end.getDate() + 1)
    return ['BEGIN:VEVENT', `UID:${i.id}@deadlinr`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(i.date)}`,
      `DTEND;VALUE=DATE:${ymd(iso(end.getFullYear(), end.getMonth() + 1, end.getDate()))}`,
      `SUMMARY:${esc(i.title)}`, ...(i.subject ? [`DESCRIPTION:${esc(i.subject)}`] : []), 'END:VEVENT'].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//deadlinr//EN', ...ev, 'END:VCALENDAR'].join('\r\n')
}
export const exportBackup = (items: Item[]) => JSON.stringify({ app: 'deadlinr', v: 1, items }, null, 2)
export function importBackup(text: string, current: Item[]): { items: Item[]; added: number } | null {
  try {
    const o = JSON.parse(text)
    if (o?.app !== 'deadlinr' || !Array.isArray(o.items)) return null
    const ok = (i: Item) => typeof i?.id === 'string' && typeof i.title === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(i.date) && KINDS.some(k => k.id === i.kind)
    const have = new Set(current.map(i => i.id))
    const fresh = (o.items as Item[]).filter(ok).filter(i => !have.has(i.id))
    return { items: [...current, ...fresh], added: fresh.length }
  } catch { return null }
}
