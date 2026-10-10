import ThemeToggle from './ThemeToggle'
import { profile } from '../data'

export type Tab = 'work' | 'info'

export default function Header({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <header className="header">
      <button className="brand" onClick={() => onTab('work')} aria-label="Home">{profile.name}</button>
      <nav className="nav">
        <button aria-current={tab === 'work' ? 'page' : undefined} onClick={() => onTab('work')}>Work</button>
        <button aria-current={tab === 'info' ? 'page' : undefined} onClick={() => onTab('info')}>Info</button>
        <a href={profile.resume} target="_blank" rel="noreferrer">Resume</a>
        <ThemeToggle />
      </nav>
    </header>
  )
}
