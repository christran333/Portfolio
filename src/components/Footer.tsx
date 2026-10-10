import { useEffect, useState } from 'react'
import { profile } from '../data'

function useLocalTime() {
  const fmt = () => new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' })
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 30000)
    return () => clearInterval(t)
  }, [])
  return time
}

export default function Footer() {
  const time = useLocalTime()
  return (
    <footer className="footer">
      <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
      <span className="muted">{profile.location} · {time}</span>
      <span className="muted">© {new Date().getFullYear()} {profile.name}</span>
    </footer>
  )
}
