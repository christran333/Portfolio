import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { profile } from '../data'

export type Tab = 'work' | 'exploration' | 'info'

export default function Header({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  // See-through at the very top (so the halftone shows behind it), frosted once you scroll
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 8)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
      <button className="brand" onClick={() => onTab('work')} aria-label="Home">
        <span className="brand-full">{profile.name}</span>
        <span className="brand-short" aria-hidden>{profile.name.split(' ')[0].replace('Christopher', 'Chris')}</span>
      </button>
      <nav className="nav">
        <button aria-current={tab === 'work' ? 'page' : undefined} onClick={() => onTab('work')}>Work</button>
        <button aria-current={tab === 'exploration' ? 'page' : undefined} onClick={() => onTab('exploration')}>Exploration</button>
        <button aria-current={tab === 'info' ? 'page' : undefined} onClick={() => onTab('info')}>About</button>
        <a href={profile.resume} target="_blank" rel="noreferrer">Resume</a>
        <ThemeToggle />
      </nav>
    </header>
  )
}
