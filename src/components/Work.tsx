import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { useReveal } from '../useReveal'
import { useColumnCount } from '../layout'
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

// What a cover opens, shown in its bottom bar on hover
function kind(p: Project, quick: boolean) {
  if (quick) return 'Quick look'
  if (p.soon && p.href) return 'Watch the demo ↗'
  if (p.soon) return 'Coming soon'
  if (p.href.startsWith('http')) return 'View project ↗'
  return 'Case study'
}

// The work is laid out like a case study: the Product / Visual list in a left column, the cards in two columns
// on the right, lined up with the case-study pages. /?layout=grid shows the old full-width three-column grid
const SIDE = typeof location === 'undefined' || new URLSearchParams(location.search).get('layout') !== 'grid'

// Design-competition projects get their own group between the product work and the visual work
const COMPETITION = ['tactile', 'toolkit']
const GROUPS = [
  { id: 'product', label: 'Product', aria: 'Product work', items: featured.filter(p => !COMPETITION.includes(p.id)) },
  { id: 'competition', label: 'Competition', aria: 'Competition work', items: featured.filter(p => COMPETITION.includes(p.id)) },
  { id: 'visual', label: 'Visual', aria: 'Brand and visual work', items: more },
]

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
// Capital One's newer circle mark (traced from the official artwork; no public vector exists).
// Same height as the Figma mark so the two sit evenly in the sentence.
const CapitalOneLogo = () => (
  <svg className="inline-logo" viewBox="155 33 390 348" aria-hidden>
    <path d="M236.8 121.5A157 157 0 1 1 211.6 201.5" fill="none" stroke="#cc2427" strokeWidth="31" strokeLinecap="round" />
    <path fill="#cc2427" d="M174 137L255 134C292 126 352 125 421 140C450 147 463 164 463 180C462 196 441 222 409 250C380 274 333 306 292 327L270 316C300 290 332 254 330 222C328 197 300 171 252 166L174 165A14 14 0 0 1 174 137Z" />
  </svg>
)
const siteOf = (id: string) => projects.find(p => p.id === id)!.site!

// The intro paragraphs, with links (only shown here; the About page no longer repeats them)
const heroParas = [
  <>Right now I'm the founding designer at Mesa, building AI tools for a super niche and overlooked corner of tech: upstream oil &amp; gas. I own design, brand, and product, and I ship it in code. I also still do client work at <L href="https://www.francoislabs.com/">Francois Labs</L>, a design studio for early-stage startups in <L href={siteOf('cosign')}>fintech</L>, <L href={siteOf('arist')}>AI</L>, <L href={siteOf('tennr')}>healthcare</L>, and <L href="/work/scout">B2B</L>.</>,
  <>I'm studying Media Arts and Design at UT Dallas with a certificate in Applied Experience Design &amp; Research. I'm also a <L href="https://www.instagram.com/figmacampusleaders/"><span className="nowrap"><FigmaMark />Figma</span> Campus Leader</L> and a <L href="https://bass.utdallas.edu/news/capital-one-expands-student-opportunities-with-new-scholarship/"><span className="nowrap"><CapitalOneLogo />2x Capital One</span> Design &amp; Research Scholar</L>.</>,
]

export default function Work() {
  const root = useReveal<HTMLDivElement>()
  const heroBox = useRef<HTMLDivElement>(null)
  const siteBox = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [previewing, setPreviewing] = useState(false)
  const [site, setSite] = useState<Project | null>(null) // project whose site screenshot is showing
  const [missing, setMissing] = useState<Set<string>>(new Set()) // screenshots that haven't been made yet
  // Which group of work is on screen, for the side list: the last group whose top has passed 40% of the window
  const [group, setGroup] = useState<string>(GROUPS[0].id)
  const [tocShown, setTocShown] = useState(false)
  useEffect(() => {
    const update = () => {
      let cur = GROUPS[0].id
      for (const g of GROUPS) {
        const el = document.getElementById(g.id)
        if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = g.id
      }
      // at the bottom of the work, the last group wins even if its top never reached the line
      const end = document.querySelector('.work-groups')?.getBoundingClientRect().bottom ?? Infinity
      if (end <= innerHeight) cur = GROUPS[GROUPS.length - 1].id
      setGroup(cur)
      // The list starts hidden, comes in the first time you scroll down into the work, then stays (like the cards)
      const top = document.querySelector('.work-groups')?.getBoundingClientRect().top ?? 0
      if (scrollY > 40 && top < innerHeight * 0.6) setTocShown(true)
    }
    update()
    addEventListener('scroll', update, { passive: true })
    return () => removeEventListener('scroll', update)
  }, [])
  const jumpTo = (e: ReactMouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 96, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const [peek, setPeek] = useState<number | null>(null) // index into `peekable` of the open quick view

  // Hovering the headline (or a company name) pops up a small window that trails the cursor.
  // Near the right edge it flips to the left of the cursor so it never runs off screen; the site
  // preview sits above the cursor (so the name you're hovering stays visible) unless there's no room.
  useEffect(() => {
    const boxes = [heroBox.current, siteBox.current].filter((b): b is HTMLDivElement => !!b)
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
    // Scrolling away closes the floating previews too (the pointer never "leaves" when the page moves instead)
    const scrolled = () => { setPreviewing(false); setSite(null) }
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', move)
    window.addEventListener('scroll', scrolled, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); window.removeEventListener('scroll', scrolled) }
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v) return // the film preview only lives in the tagline hero
    v.muted = true // React doesn't reliably set this, and browsers only autoplay muted video
    if (previewing) v.play().catch(() => {})
    else v.pause()
  }, [previewing])

  const n = useColumnCount()
  const showSite = site && !missing.has(site.id)

  const renderCard = (p: Project) => {
          const at = peekable.indexOf(p) // >= 0: studio work that opens a quick look
          const quick = at >= 0
          const opens = quick || (!!p.href && featured.includes(p))
          // The cover carries a small bar along its bottom: the date, swapped on hover for what the cover
          // opens ("Case study", "Quick look", ...). The project name sits in the text under the cover
          const media = (
            <div className="tile-media">
              <Cover p={p} />
              <span className="tile-bar">
                <span className="tile-bar-meta">
                  {p.when && <span className="is-rest">{p.when}</span>}
                  <span className="is-hover">{kind(p, quick)}</span>
                </span>
              </span>
            </div>
          )
          return (
            <article key={p.id} className={`tile reveal${opens && !p.soon ? '' : ' is-soon'}`}>
              {quick
                ? <button type="button" className="tile-cover" onClick={() => setPeek(at)} aria-haspopup="dialog" aria-label={`${p.title}: quick look`}>{media}</button>
                : opens
                  ? <a {...linkProps(p.href)} className="tile-cover" aria-label={`${p.title}: ${p.soon ? 'watch the demo' : 'view case study'}`}>{media}</a>
                  : <div className="tile-cover">{media}</div>}
              {/* Under the cover: the name and summary. The cover's link stretches over this text too, so the whole
                  card opens one thing. "View site" is the only separate target, and hovering it shows the site's screenshot */}
              <div className="tile-info">
                <p className="tile-tags">
                  <span className="tile-name" role="heading" aria-level={2}>{p.title}</span>
                  {p.site && (
                    <>
                      <span className="tile-meta" aria-hidden> · </span>
                      <a
                        className="tile-visit"
                        href={p.site}
                        target="_blank"
                        rel="noreferrer"
                        onPointerEnter={e => e.pointerType === 'mouse' && setSite(p)}
                        onPointerLeave={() => setSite(null)}
                      >
                        {p.siteLabel ?? 'View site'} <span className="tile-visit-arrow" aria-hidden>↗</span>
                        <span className="sr-only"> (opens {domain(p.site)})</span>
                      </a>
                    </>
                  )}
                </p>
                <p className="tile-summary">{p.summary}</p>
              </div>
            </article>
          )
  }

  return (
    <div ref={root}>
      {HERO === 'about' ? (
        <section className="intro intro-about">
          <div className="intro-text">
          <h1 className="intro-lead intro-hello">
            <span className="rise">Hey, I'm Christopher.</span>
            <span className="intro-hello-sub rise" style={{ animationDelay: '.08s' }}>A product designer based in Dallas.</span>
          </h1>
          {heroParas.map((para, i) => (
            <p key={i} className="intro-para rise" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{para}</p>
          ))}
          <p className="intro-para intro-status rise" style={{ animationDelay: `${0.1 + heroParas.length * 0.12}s` }}>
            {profile.status}
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

      {/* The work in two groups (product case studies, then brand and visual quick looks). They sit flush, so it
          still reads as one grid; the side list in the left margin names the group you're in and jumps between them */}
      <div className={`work-groups${SIDE ? ' is-side' : ''}`}>
        <nav className={`work-toc${tocShown ? ' is-shown' : ''}`} aria-label="Kinds of work">
          <ul>
            {GROUPS.map((g, i) => {
              const at = GROUPS.findIndex(x => x.id === group)
              return (
              // Same progress line as the case-study contents: passed groups checked off, current one bright
              <li key={g.id} className={i < at ? 'is-done' : i === at ? 'is-current' : ''} style={{ '--i': i } as CSSProperties}>
                <a href={`#${g.id}`} className={group === g.id ? 'is-active' : ''} aria-current={group === g.id ? 'location' : undefined} onClick={e => jumpTo(e, g.id)}>
                  {g.label}
                </a>
              </li>
              )
            })}
          </ul>
        </nav>
        {GROUPS.map(g => (
          <section key={g.id} id={g.id} className="grid is-uniform work-group" aria-label={g.aria} style={{ '--cols': SIDE ? Math.min(n, 2) : n } as CSSProperties}>
            {g.items.map(renderCard)}
          </section>
        ))}
      </div>

      {peek !== null && (
        <Peek
          project={peekable[peek]}
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
