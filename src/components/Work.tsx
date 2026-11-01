import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReveal } from '../useReveal'
import { distribute, useColumnCount } from '../layout'
import { imgAt, linkProps, profile, projects, type Project } from '../data'

// Tile cover: a looping muted clip when the project has one (played only while on screen), otherwise the image
function Cover({ p }: { p: Project }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true // React doesn't reliably set this, and browsers only autoplay muted video
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.2 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return p.video
    ? <video ref={ref} src={p.video} poster={p.img} muted loop playsInline preload="metadata" aria-label={`${p.title} preview`} />
    : <img src={imgAt(p.img, 1600)} alt={`${p.title} preview`} loading="lazy" />
}

// What the pill over the cover says on hover
function CoverLabel({ p }: { p: Project }) {
  if (p.soon && p.href) return <span className="tile-label is-two">Full case study coming soon<span className="tile-label-cta">Watch the demo ↗</span></span>
  if (p.soon) return <span className="tile-label">Coming soon</span>
  if (p.href.startsWith('http')) return <span className="tile-label">View project ↗</span>
  return <span className="tile-label">View case study</span>
}

const domain = (url: string) => new URL(url).hostname.replace(/^www\./, '')

export default function Work() {
  const root = useReveal<HTMLDivElement>()
  const heroBox = useRef<HTMLDivElement>(null)
  const siteBox = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [previewing, setPreviewing] = useState(false)
  const [site, setSite] = useState<Project | null>(null) // project whose site screenshot is showing
  const [missing, setMissing] = useState<Set<string>>(new Set()) // screenshots that haven't been made yet

  // Hovering the headline (or a company name) pops up a small window that trails the cursor.
  // Near the right edge it flips to the left of the cursor so it never runs off screen; the site
  // preview sits above the cursor (so the name you're hovering stays visible) unless there's no room.
  useEffect(() => {
    const boxes = [heroBox.current!, siteBox.current!]
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    let raf = 0
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16
      pos.y += (target.y - pos.y) * 0.16
      boxes.forEach(box => {
        box.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
        box.classList.toggle('is-flipped', pos.x + box.offsetWidth + 48 > innerWidth)
        box.classList.toggle('is-below', pos.y - box.offsetHeight - 100 < 0) // too close to the top to fit above
      })
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      if (!boxes.some(b => b.classList.contains('is-open'))) { pos.x = e.clientX; pos.y = e.clientY }
      target.x = e.clientX
      target.y = e.clientY
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', move)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move) }
  }, [])

  useEffect(() => {
    const v = video.current!
    v.muted = true // React doesn't reliably set this, and browsers only autoplay muted video
    if (previewing) v.play().catch(() => {})
    else v.pause()
  }, [previewing])

  const n = useColumnCount()
  const columns = distribute(projects, n)
  const showSite = site && !missing.has(site.id)

  return (
    <div ref={root}>
      <section className="intro">
        <h1 className="intro-lead">
          {/* Inline, so only the words themselves (not the empty space around them) open the video */}
          <span
            data-cursor-grow
            onPointerEnter={e => e.pointerType === 'mouse' && setPreviewing(true)}
            onPointerLeave={() => setPreviewing(false)}
          >
            <span className="rise" style={{ animationDelay: '.1s' }}>I'm Christopher, a product designer who cares about</span>{' '}
            <span className="rise" style={{ animationDelay: '.35s' }}>the user, solving ambiguous problems, and <span className="nowrap">visual polish.</span></span>
          </span>
        </h1>
        <p className="intro-sub rise" style={{ animationDelay: '.7s' }}>{profile.status}</p>
        <div ref={heroBox} className={`float-preview ${previewing ? 'is-open' : ''}`} aria-hidden>
          <div className="float-preview-frame">
            <video ref={video} src="/hero.mp4" muted loop playsInline preload="auto" />
          </div>
        </div>
      </section>

      <section className="grid" aria-label="Selected work" style={{ '--cols': n } as CSSProperties}>
        {columns.map((col, c) => (
          <div key={c} className="grid-col">
            {col.map(p => {
              const media = (
                <div className="tile-media" style={{ aspectRatio: p.aspect }}>
                  <Cover p={p} />
                  <CoverLabel p={p} />
                </div>
              )
              // The cover opens the case study; the company name opens the company's own site
              const title = p.site
                ? (
                  <a
                    className="tile-site"
                    href={p.site}
                    target="_blank"
                    rel="noreferrer"
                    onPointerEnter={e => e.pointerType === 'mouse' && setSite(p)}
                    onPointerLeave={() => setSite(null)}
                  >
                    {p.title}
                    {/* Same ↗ as the Exploration titles: always there so it reads as a link, lights up on hover */}
                    <span className="tile-site-arrow" aria-hidden>↗</span>
                    <span className="tile-site-cta" aria-hidden>{p.siteLabel ?? 'View site'}</span>
                    <span className="sr-only"> (opens {domain(p.site)})</span>
                  </a>
                )
                : p.href ? <a {...linkProps(p.href)}>{p.title}</a> : p.title
              return (
                <article key={p.id} className={`tile reveal${p.soon ? ' is-soon' : ''}`}>
                  {p.href
                    ? <a {...linkProps(p.href)} className="tile-cover" aria-label={`${p.title}: ${p.soon ? 'watch the demo' : 'view case study'}`}>{media}</a>
                    : <div className="tile-cover">{media}</div>}
                  <p className="tile-tags">{[p.tags[0], p.when].filter(Boolean).join(' · ')}</p>
                  <h2 className="tile-title">{title}</h2>
                  <p className="tile-summary">{p.summary}</p>
                </article>
              )
            })}
          </div>
        ))}
      </section>

      <div ref={siteBox} className={`float-preview is-site ${showSite ? 'is-open' : ''}`} aria-hidden>
        <div className="float-preview-frame">
          <div className="site-bar"><i /><i /><i /><span>{site ? domain(site.site!) : ''}</span></div>
          {/* Every screenshot is mounted up front so it's already loaded by the time you hover */}
          {projects.filter(p => p.site).map(p => (
            <img
              key={p.id}
              src={`/sites/${p.id}.jpg`}
              alt=""
              className={site?.id === p.id ? 'is-current' : ''}
              onError={() => setMissing(m => new Set(m).add(p.id))}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
