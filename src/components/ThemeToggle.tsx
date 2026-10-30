import { useState, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'dark' | 'light'

// Switches themes with a circle that grows out from wherever you clicked
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) ?? 'light')

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.dataset.theme = next
      setTheme(next)
      try { localStorage.setItem('theme', next) } catch { /* private mode */ }
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) return apply()

    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const root = document.documentElement
    root.classList.add('theme-switching')
    const transition = document.startViewTransition(() => flushSync(apply))
    transition.finished.finally(() => root.classList.remove('theme-switching'))
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.7, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  const dark = theme === 'dark'
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>
      {/* Shows the mode you'll switch to: a sun in dark mode, a moon in light mode */}
      <svg viewBox="0 0 24 24" className={dark ? '' : 'is-moon'}>
        <mask id="moon-bite">
          <rect width="24" height="24" fill="#fff" />
          <circle className="bite" cx="24" cy="2" r="7" fill="#000" />
        </mask>
        <circle className="disc" cx="12" cy="12" r="5" fill="currentColor" mask="url(#moon-bite)" />
        <g className="rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${i * 45} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  )
}
