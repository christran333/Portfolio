import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReveal } from '../useReveal'
import { distribute, useColumnCount } from '../layout'
import { imgAt, linkProps, profile, projects, type Project } from '../data'
import { caseStudies } from '../caseStudies'
import Peek from './Peek'
import Polaroid from './Polaroid'

// Home page: full case studies in the big grid, everything else in a compact list that opens a quick view
const featured = projects.filter(p => p.featured)
const more = projects.filter(p => !p.featured && !p.hidden)
const peekable = more.filter(p => !p.soon && caseStudies[p.id])

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

// Which hero the home page opens with: 'about' = the short intro paragraphs (like the old portfolio),
// 'tagline' = the big serif headline
const HERO: 'about' | 'tagline' = 'about'

// Underlined inline link for the hero paragraphs (external links open in a new tab)
const L = ({ href, children }: { href: string; children: React.ReactNode }) => <a className="underline" {...linkProps(href)}>{children}</a>
const siteOf = (id: string) => projects.find(p => p.id === id)!.site!

// The intro paragraphs, with links (only shown here; the About page no longer repeats them)
const heroParas = [
  <>I'm a product designer based in Dallas. I care about research, solving ambiguous problems, and getting the visual details right. Right now I'm a Product Design Intern at <L href="https://www.francoislabs.com/">Francois Labs</L>, designing for early-stage startups in <L href={siteOf('cosign')}>fintech</L>, <L href={siteOf('arist')}>AI</L>, <L href={siteOf('tennr')}>healthcare</L>, and <L href="/work/scout">B2B</L>.</>,
  <>I'm studying Media Arts and Design at UT Dallas with a certificate in Applied Experience Design &amp; Research. I'm also a <L href="https://www.instagram.com/figmacampusleaders/">Figma Campus Leader</L> and a <L href="https://bass.utdallas.edu/news/capital-one-expands-student-opportunities-with-new-scholarship/">2x Capital One Design &amp; Research Scholar</L>.</>,
  <>Outside of school and client work, I play in a band, screen print shirts, and run my creative collective <L href="https://www.instagram.com/centeredbyvoid/">@centeredbyvoid</L>.</>,
]

export default function Work() {
  const root = useReveal<HTMLDivElement>()
  const heroBox = useRef<HTMLDivElement>(null)
  const siteBox = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [previewing, setPreviewing] = useState(false)
  const [site, setSite] = useState<Project | null>(null) // project whose site screenshot is showing
  const [missing, setMissing] = useState<Set<string>>(new Set()) // screenshots that haven't been made yet
  const [peek, setPeek] = useState<number | null>(null) // index into `peekable` of the open quick view

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
  const columns = distribute(featured, n)
  const showSite = site && !missing.has(site.id)

  return (
    <div ref={root}>
      {HERO === 'about' ? (
        <section className="intro intro-about">
          <div className="intro-text">
          <h1 className="intro-lead intro-hello">
            {/* Hovering the words plays the film in a small window that trails the cursor, like the tagline did */}
            <span
              className="rise"
              data-cursor-grow
              onPointerEnter={e => e.pointerType === 'mouse' && setPreviewing(true)}
              onPointerLeave={() => setPreviewing(false)}
            >Hey, I'm Christopher.</span>
          </h1>
          {heroParas.map((para, i) => (
            <p key={i} className="intro-para rise" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{para}</p>
          ))}
          <p className="intro-para intro-status rise" style={{ animationDelay: `${0.1 + heroParas.length * 0.12}s` }}>
            Let's build something.
            <span className="intro-icons">
              <a href={profile.links.find(l => l.label === 'X')!.href} target="_blank" rel="noreferrer" aria-label="X (Twitter)">
                <svg viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href={profile.links.find(l => l.label === 'LinkedIn')!.href} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                {/* A solid square reads bigger than the open shapes beside it, so it's drawn a touch smaller */}
                <svg viewBox="0 0 24 24" aria-hidden className="is-solid"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.71 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.892v6.249zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`}>
                <svg viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" /></svg>
              </a>
            </span>
          </p>
          </div>
          {/* Instant-film print: thick paper border with the wide bottom edge, and a film look on the photo (all CSS) */}
          <Polaroid
            style={{ animationDelay: '.25s' }}
            src="/about/hero-portrait.jpg"
            alt="Christopher smiling and throwing a peace sign in a garden full of purple flowers"
            width={1100}
            height={1031}
          />
          <div ref={heroBox} className={`float-preview ${previewing ? 'is-open' : ''}`} aria-hidden>
            <div className="float-preview-frame">
              <video ref={video} src="/hero.mp4" muted loop playsInline preload="auto" />
            </div>
          </div>
        </section>
      ) : (
      <section className="intro">
        <h1 className="intro-lead">
          {/* Inline, so only the words themselves (not the empty space around them) open the video */}
          <span
            data-cursor-grow
            onPointerEnter={e => e.pointerType === 'mouse' && setPreviewing(true)}
            onPointerLeave={() => setPreviewing(false)}
          >
            <span className="rise" style={{ animationDelay: '.1s' }}>I'm Christopher, a product designer who cares about</span>{' '}
            <span className="rise" style={{ animationDelay: '.35s' }}>storytelling, solving ambiguous problems, and <span className="nowrap">visual polish.</span></span>
          </span>
        </h1>
        <p className="intro-sub rise" style={{ animationDelay: '.7s' }}>{profile.status}</p>
        <div ref={heroBox} className={`float-preview ${previewing ? 'is-open' : ''}`} aria-hidden>
          <div className="float-preview-frame">
            <video ref={video} src="/hero.mp4" muted loop playsInline preload="auto" />
          </div>
        </div>
      </section>
      )}

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

      <section aria-labelledby="more-h">
        <header className="section-label">
          <h2 id="more-h">More work</h2>
          <p className="muted">Brand, visual, and product work for early-stage startups.</p>
        </header>
        <div className="grid" style={{ '--cols': n } as CSSProperties}>
          {distribute(more, n).map((col, c) => (
            <div key={c} className="grid-col">
              {col.map(p => {
                const at = peekable.indexOf(p)
                const media = (
                  <div className="tile-media" style={{ aspectRatio: p.aspect }}>
                    <Cover p={p} />
                    <span className="tile-label">{at >= 0 ? 'Quick look' : 'Coming soon'}</span>
                  </div>
                )
                return (
                  <article key={p.id} className={`tile reveal${at < 0 ? ' is-soon' : ''}`}>
                    {at >= 0
                      ? <button type="button" className="tile-cover" onClick={() => setPeek(at)} aria-haspopup="dialog" aria-label={`${p.title}: quick look`}>{media}</button>
                      : <div className="tile-cover">{media}</div>}
                    <p className="tile-tags">{[p.tags[0], p.when].filter(Boolean).join(' · ')}</p>
                    <h2 className="tile-title">
                      {p.site
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
                            <span className="tile-site-arrow" aria-hidden>↗</span>
                            <span className="tile-site-cta" aria-hidden>{p.siteLabel ?? 'View site'}</span>
                            <span className="sr-only"> (opens {domain(p.site)})</span>
                          </a>
                        )
                        : at >= 0 ? <button type="button" className="tile-title-btn" onClick={() => setPeek(at)}>{p.title}</button> : p.title}
                    </h2>
                    <p className="tile-summary">{p.summary}</p>
                  </article>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      {peek !== null && (
        <Peek
          project={peekable[peek]}
          next={peekable[(peek + 1) % peekable.length]}
          onNext={() => setPeek((peek + 1) % peekable.length)}
          onPrev={() => setPeek((peek - 1 + peekable.length) % peekable.length)}
          onClose={() => setPeek(null)}
        />
      )}

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
