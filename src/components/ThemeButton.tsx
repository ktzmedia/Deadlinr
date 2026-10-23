import { useTheme } from '../lib'

export default function ThemeButton() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-lg transition active:scale-95">
      <span aria-hidden>{theme === 'dark' ? '☀︎' : '☾'}</span>
    </button>
  )
}
