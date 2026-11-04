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

// Small brand marks at the start of a link in the hero copy, sized to the text.
// Each sits in a nowrap span with the link's first word so it never ends up alone at the end of a line
const FigmaMark = () => (
  <svg className="inline-logo" viewBox="0 0 38 57" aria-hidden>
    <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
  </svg>
)
// The full Capital One logo: red swoosh, with the wordmark in the page's text colour so it reads on the dark background
const CapitalOneLogo = () => (
  <svg className="inline-logo is-capital-one" viewBox="0 0 418 150" aria-hidden>
    <path fill="#cc2427" d="M283.7,108.5h-.1c-17.8,12.6-38.8,25.8-61.5,39.7l-.9.5a.7.7,0,1,0,.8,1.1l.7-.4c19.3-10,41.4-21.9,63.6-34.2l.4-.2A24.7,24.7,0,0,1,283.7,108.5ZM400.5,13.9c-28-30.9-208.6-3.1-285.3,13.7l-1.8.4a.8.8,0,0,0-.6.8.6.6,0,0,0,.8.5l1.8-.3C179,17.7,311.3,2,339.7,30.2c8.7,8.6,6.7,19.7-3.4,32.8a25.7,25.7,0,0,1,11,15.8C386.6,52.7,413,27.7,400.5,13.9Z" />
    <path fill="currentColor" d="m133 84.3a10.4 10.4 0 0 0-6.1 2 9.4 9.4 0 0 0-3.3 6c-0.6 3.1-0.3 5.2 0.9 6.6a7.1 7.1 0 0 0 5.3 2 10.2 10.2 0 0 0 4.4-0.9 8.1 8.1 0 0 0 3.3-2.8 12.5 12.5 0 0 0 1.9-4.6c0.5-2.8 0.1-4.8-1.2-6.2a6.7 6.7 0 0 0-5.2-2.1zm-31.1 38.8 8.3-46.8h15l-1.2 6a14.2 14.2 0 0 1 6.3-4.5 27 27 0 0 1 9.7-2c3.9 0 6.3 0.2 9.2 1.7a12.4 12.4 0 0 1 6 6.6 16.8 16.8 0 0 1 0.8 9.5 20.7 20.7 0 0 1-8.4 13.7c-4.6 3.3-8.7 4.2-14.6 4.2a20.4 20.4 0 0 1-5.3-0.6 12.1 12.1 0 0 1-3.4-1.3 15.5 15.5 0 0 1-2.8-2.6l-2.8 16.1zm173.1-12.1h-17.4l8.8-48.6 16.9 0.4zm-86.8-35.1 1.2-7.1 17.8-3.8-1.9 10.9h8.8l-1.7 7.1h-8.5l-5.1 28h-17.3l5.2-28h-6.5l1.3-7h6.7zm-138.6 22.6a62.3 62.3 0 0 1-14.2 1.5c-8.1 0-14.6-4-14.2-11.5 0.2-4.9 6.1-15.3 20.9-15.3a24.3 24.3 0 0 1 13.3 3.6l2.1-12.1a40.3 40.3 0 0 0-16.8-2.8c-19.5 0.2-38.2 9-40.5 27s20 22.9 29.9 22.9c5.7 0 11.7-0.3 17.2-0.8zm189.7-3.5-2.9 0.8-6.7 1.2a10.8 10.8 0 0 0-4.5 1.4 3 3 0 0 0-1.5 2.2 2.2 2.2 0 0 0 0.9 2.4c0.9 0.6 2.3 0.8 4.3 0.8a16.1 16.1 0 0 0 4.4-0.6 10.2 10.2 0 0 0 3.6-1.9 5.1 5.1 0 0 0 1.5-2.3 22.4 22.4 0 0 0 0.9-4zm18.4-11.5c-0.1 1.7-0.4 3.3-0.8 5.8l-3.1 17.5a3.2 3.2 0 0 0 1.7 3.6v0.6h-17.9v-4.5a36 36 0 0 1-8.6 3.7 32.2 32.2 0 0 1-8.6 1c-5.7 0-9-0.6-11.3-2.6s-3.4-3.4-3.3-6.2a9.5 9.5 0 0 1 2.2-5.2 13.3 13.3 0 0 1 4.7-3.3 25.4 25.4 0 0 1 7.1-2c3.2-0.5 7.6-1 13.5-1.5a24 24 0 0 0 5.8-1.3c1.2-0.5 1.7-1 1.9-2s-0.2-2.8-2.6-3.3c-6.4-1.3-18.4 0.8-24.6 2.3l3.3-9a161.7 161.7 0 0 1 23.9-2c12.7 0.1 16.8 3.8 16.7 8.4zm-102.2 27.5 6.2-34.9h17.1l-6.2 34.9zm7.2-42.9c0.5-2.9 5-5.2 10.1-5.2s8.7 2.3 8.2 5.2-5 5.2-10.1 5.2-8.7-2.4-8.2-5.2zm-77.2 26.8a13 13 0 0 1-2.9 0.8l-6.6 1.2a10.8 10.8 0 0 0-4.6 1.4 3.2 3.2 0 0 0-1.5 2.3 2.1 2.1 0 0 0 1 2.3 7.3 7.3 0 0 0 4.2 0.9 16.2 16.2 0 0 0 4.4-0.7 10.2 10.2 0 0 0 3.6-1.9 5.1 5.1 0 0 0 1.5-2.3 14.7 14.7 0 0 0 0.9-4zm18.4-11.4c-0.1 1.7-0.4 3.2-0.8 5.8l-3.1 17.4a3.2 3.2 0 0 0 1.7 3.6v0.7h-17.9v-4.4a40.2 40.2 0 0 1-8.6 3.6 31.8 31.8 0 0 1-8.5 1.1c-5.8 0-9.1-0.6-11.3-2.6s-3.5-3.4-3.4-6.3a9.6 9.6 0 0 1 2.2-5.1 13.5 13.5 0 0 1 4.7-3.4 28.9 28.9 0 0 1 7.2-2c3.1-0.5 7.5-1 13.4-1.5a15.7 15.7 0 0 0 5.8-1.3c1.3-0.5 1.7-1 1.9-2s-0.2-2.8-2.6-3.3c-6.4-1.2-18.4 0.8-24.6 2.4l3.3-9.1a162.8 162.8 0 0 1 23.9-2c12.7 0 16.8 3.7 16.7 8.4z" />
    <path fill="currentColor" d="m344.6 88.2 3.9-0.4c1.3 0 2.4 0.3 2.5 1.5s-1.3 6-1.6 7.3l-2.7 11.7c-1 4.8-2.2 9.8-3.2 13.8h6.8l3.8-18.6c11.8-12.2 16.3-16.2 19-16.2a2 2 0 0 1 2.2 2.2c0.1 2.1-1.3 7-1.7 8.4l-4 13.5c-0.8 3.1-1.5 5.8-1.4 7.8s1.9 4.3 4.5 4.3c5 0 8.7-5.2 11.8-10.3l-0.9-1.7c-1.3 2-4.2 6.5-6.6 6.5-0.7 0-1.4-0.5-1.4-1.7a20.5 20.5 0 0 1 1-5.5l4.4-15.9c1.1-4.4 1.7-7.2 1.7-8.7s-1.9-4.3-4.5-4.3c-4.5 0-10.5 3.3-23.1 17.8h-0.2l1.6-7.1c0.9-3.9 1.7-7.9 2.5-10.7a114.5 114.5 0 0 1-14.5 4.1zm66.9 0.4c-0.1-2.8-1.5-4.7-4.4-4.7-7 0-14.4 13.7-15.7 19.2 11.4 0 20.4-6.8 20.1-14.5zm1.5 21.5 1.3 0.9c-3.4 6.9-10.3 12.5-18.5 12.5-6.7 0-12.1-4.4-12.4-12.7-0.6-15 13.5-28.9 24.9-28.9 4.9 0 9.5 2.2 9.7 7.5 0.4 11.9-16.3 15.5-27.3 15.7a14.3 14.3 0 0 0-0.4 4.4c0.2 5 3.2 9.1 9.3 9.1s10.7-4.3 13.4-8.5zm-117.9-9.7c0.3 10.9 7.2 19.8 16.2 19.8 17.4 0 24.8-21.4 24.3-35.7-0.4-10.9-7.4-19.8-16.4-19.8-15 0-24.7 21.3-24.1 35.7zm-9.2-0.6c-0.7-18.6 13.9-37.6 35-37.6 14.2 0 23.4 9.5 23.9 23.9 0.7 19.6-12.9 37.6-35 37.6-14.2 0-23.4-9.4-23.9-23.9z" />
  </svg>
)
const siteOf = (id: string) => projects.find(p => p.id === id)!.site!

// The intro paragraphs, with links (only shown here; the About page no longer repeats them)
const heroParas = [
  <>I'm a product designer based in Dallas. I care about research, solving ambiguous problems, and getting the visual details right. Right now I'm a Product Design Intern at <L href="https://www.francoislabs.com/">Francois Labs</L>, designing for early-stage startups in <L href={siteOf('cosign')}>fintech</L>, <L href={siteOf('arist')}>AI</L>, <L href={siteOf('tennr')}>healthcare</L>, and <L href="/work/scout">B2B</L>.</>,
  <>I'm studying Media Arts and Design at UT Dallas with a certificate in Applied Experience Design &amp; Research. I'm also a <L href="https://www.instagram.com/figmacampusleaders/"><span className="nowrap"><FigmaMark />Figma</span> Campus Leader</L> and a <L href="https://bass.utdallas.edu/news/capital-one-expands-student-opportunities-with-new-scholarship/"><span className="nowrap"><CapitalOneLogo />2x</span> Capital One Design &amp; Research Scholar</L>.</>,
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
            alt="Christopher laughing behind his laptop, mid-conversation"
            width={1033}
            height={1300}
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
