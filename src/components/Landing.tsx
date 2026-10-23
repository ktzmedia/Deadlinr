import { useInstall } from '../lib'
import ThemeButton from './ThemeButton'

const features = [
  ['Countdowns at a glance', 'Your next deadline is front and centre, with the days left in big type.'],
  ['Exams, tests, big days', 'Track deadlines, or count down to Christmas, Black Friday or GTA 6 in one tap.'],
  ['Share a countdown', 'Send one to a friend with a link. They add it to theirs. No account needed.'],
  ['Private and offline', 'No sign-up. Everything stays on your device, and it works without data.'],
]

const steps = [
  ['iPhone / iPad', 'Open in Safari', ['Tap the Share button', 'Choose “Add to Home Screen”', 'Tap Add']],
  ['Android', 'Open in Chrome', ['Tap the ⋮ menu', 'Choose “Install app” or “Add to Home screen”', 'Tap Install']],
  ['Computer', 'Open in Chrome or Edge', ['Click the install icon in the address bar', 'Or open the menu → “Install deadlinr”', 'Click Install']],
] as const

export default function Landing() {
  const install = useInstall()
  return (
    <div className="min-h-dvh">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <a href="#/" className="font-serif text-2xl tracking-tight">deadlinr</a>
        <div className="flex items-center gap-2 sm:gap-6">
          <a href="#install" className="hidden min-h-11 items-center text-sm font-medium sm:flex">How to install</a>
          <ThemeButton />
          <a href="#/app" className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-onbrand transition active:scale-95">Open app</a>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-5 pt-14 text-center sm:pt-20">
        <h1 className="rise mx-auto max-w-4xl font-serif text-[clamp(3rem,10vw,7.5rem)] leading-[.95] tracking-tight">Every deadline.<br />One calm glance.</h1>
        <p className="rise mx-auto mt-6 max-w-md text-lg text-muted" style={{ animationDelay: '.1s' }}>The free countdown app for exams, tests and assignments. No sign-up. Installs in seconds.</p>
        <div className="rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: '.2s' }}>
          <a href="#/app" className="inline-flex min-h-12 items-center rounded-full bg-brand px-7 font-medium text-onbrand transition active:scale-95">Start counting down</a>
          {install
            ? <button onClick={install} className="min-h-12 rounded-full border border-line bg-card px-7 font-medium transition active:scale-95">Install app</button>
            : <a href="#install" className="inline-flex min-h-12 items-center rounded-full border border-line bg-card px-7 font-medium transition active:scale-95">Add to home screen</a>}
        </div>

        {/* Device mockup */}
        <div className="rise relative mx-auto mt-16 max-w-3xl" style={{ animationDelay: '.3s' }}>
          <div className="absolute inset-x-0 bottom-0 top-24 rounded-t-[2.5rem] bg-sage" aria-hidden />
          <div className="relative mx-auto w-[min(21rem,86%)] rounded-t-[2.5rem] border-[10px] border-b-0 border-ink bg-bg p-5 text-left">
            <p className="font-serif text-3xl">Coming up</p>
            <div className="mt-4 rounded-3xl bg-brand p-5 text-onbrand">
              <p className="text-xs font-medium uppercase tracking-widest opacity-80">Next · Exam</p>
              <p className="mt-2 font-serif text-2xl">Databases final</p>
              <p className="mt-4 font-serif text-6xl leading-none">3<span className="ml-1 text-lg opacity-80">days</span></p>
            </div>
            {[['Networking test', 'Test', '--test', '9 days'], ['Project report', 'Assignment', '--assignment', '2 weeks']].map(([t, k, c, d]) => (
              <div key={t} style={{ ['--c' as string]: `var(${c})` }} className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                <span className="bar h-8 w-1.5 rounded-full" />
                <span className="flex-1"><span className="block text-sm font-medium">{t}</span><span className="chip rounded-full px-2 py-0.5 text-xs">{k}</span></span>
                <span className="font-serif text-lg">{d}</span>
              </div>
            ))}
            <div className="h-10" />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([t, d]) => (
          <div key={t} className="rounded-3xl border border-line bg-card p-7">
            <h2 className="font-serif text-2xl">{t}</h2>
            <p className="mt-3 text-muted">{d}</p>
          </div>
        ))}
      </section>

      <section id="install" className="mx-auto max-w-6xl scroll-mt-6 px-5 pb-20">
        <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">Add it to your home screen.</h2>
        <p className="mt-3 max-w-xl text-muted">deadlinr is a web app, so there’s no app store. Install it once and it opens like any other app, even offline.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map(([device, browser, list]) => (
            <div key={device} className="rounded-3xl bg-sage p-7">
              <h3 className="font-serif text-2xl">{device}</h3>
              <p className="mt-1 text-sm font-medium text-brand">{browser}</p>
              <ol className="mt-5 space-y-3">
                {list.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-medium text-onbrand">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted">Good to know: this adds an app icon, not a live home-screen widget. Your deadlines are saved in this browser on this device only, so clearing site data will erase them.</p>
      </section>

      <footer className="border-t border-line px-5 py-10 text-center text-sm text-muted">
        <p className="font-serif text-xl text-ink">deadlinr</p>
        <p className="mt-2">Free for students. Built with care.</p>
      </footer>
    </div>
  )
}
