import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Work from './components/Work'
import Info from './components/Info'
import Exploration from './components/Exploration'
import CaseStudy from './components/CaseStudy'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import { caseStudies } from './caseStudies'
import { profile, projects } from './data'

// "/" → work, "/exploration" → exploration, "/info" → info, "/work/<id>" → that case study (unknown ids fall back to work)
const pageFor = (path: string) => {
  const id = path.match(/^\/work\/([\w-]+)\/?$/)?.[1]
  if (id && caseStudies[id]) return { page: 'case' as const, id }
  const clean = path.replace(/\/$/, '')
  if (clean === '/info') return { page: 'info' as const, id: '' }
  if (clean === '/exploration') return { page: 'exploration' as const, id: '' }
  return { page: 'work' as const, id: '' }
}

export default function App() {
  const [path, setPath] = useState(location.pathname)
  const scrolls = useRef<Record<string, number>>({}) // scroll position per page, for the back button
  const restore = useRef<number | null>(null)
  const route = pageFor(path)

  const show = (next: string, scrollTo: number) => {
    restore.current = scrollTo
    setPath(next)
  }

  useLayoutEffect(() => {
    if (restore.current === null) return
    window.scrollTo(0, restore.current)
    restore.current = null
  }, [path])

  const navigate = (to: string) => {
    if (to === location.pathname) return window.scrollTo(0, 0)
    scrolls.current[location.pathname] = window.scrollY
    history.pushState(null, '', to)
    show(to, 0)
  }

  // Back / forward buttons
  useEffect(() => {
    history.scrollRestoration = 'manual'
    const pop = () => show(location.pathname, scrolls.current[location.pathname] ?? 0)
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])

  // Route same-site link clicks through the router instead of reloading the page
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      const url = new URL(a.href)
      if (url.origin !== location.origin || url.pathname === location.pathname && url.hash) return
      e.preventDefault()
      navigate(url.pathname)
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  })

  useEffect(() => {
    const project = route.page === 'case' ? projects.find(p => p.id === route.id) : null
    document.title = project ? `${project.title} — ${profile.name}` : profile.name
  }, [route.page, route.id])

  return (
    <>
      <Header tab={route.page === 'case' ? 'work' : route.page} onTab={t => navigate(t === 'work' ? '/' : `/${t}`)} />
      <main key={path}>
        {route.page === 'case' && <CaseStudy id={route.id} study={caseStudies[route.id]} />}
        {route.page === 'info' && <Info />}
        {route.page === 'exploration' && <Exploration />}
        {route.page === 'work' && <Work />}
      </main>
      <Footer />
      <Cursor />
    </>
  )
}
