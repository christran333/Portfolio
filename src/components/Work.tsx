import { useEffect, useRef, useState } from 'react'
import { useReveal } from '../useReveal'
import { distribute, useColumnCount } from '../layout'
import { imgAt, linkProps, playground, profile, projects } from '../data'

export default function Work() {
  const root = useReveal<HTMLDivElement>()
  const preview = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [previewing, setPreviewing] = useState(false)

  // Hovering the headline pops up a small video window that trails the cursor
  useEffect(() => {
    const box = preview.current!
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    let raf = 0
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16
      pos.y += (target.y - pos.y) * 0.16
      box.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      if (!box.classList.contains('is-open')) { pos.x = e.clientX; pos.y = e.clientY }
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
  const shots = distribute(playground, n)

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
            <span className="rise" style={{ animationDelay: '.05s' }}>I'm Chris, an interdisciplinary designer who researches,</span>{' '}
            <span className="rise" style={{ animationDelay: '.12s' }}>builds, and ships <span className="nowrap">0→1</span> products <span className="nowrap">end-to-end.</span></span>
          </span>
        </h1>
        <p className="intro-sub rise" style={{ animationDelay: '.24s' }}>{profile.status}</p>
        <div ref={preview} className={`intro-preview ${previewing ? 'is-open' : ''}`} aria-hidden>
          <video ref={video} src="/hero.mp4" muted loop playsInline preload="auto" />
        </div>
      </section>

      <section className="grid" aria-label="Selected work">
        {columns.map((col, c) => (
          <div key={c} className="grid-col">
            {col.map(p => (
              <a key={p.id} {...linkProps(p.href)} className="tile reveal">
                <div className="tile-media" style={{ aspectRatio: p.aspect }}>
                  <img src={imgAt(p.img, 1600)} alt={`${p.title} preview`} loading="lazy" />
                </div>
                <p className="tile-tags">{[p.tags[0], p.when].filter(Boolean).join(' · ')}</p>
                <h2 className="tile-title">{p.title}</h2>
                <p className="tile-summary">{p.summary}</p>
              </a>
            ))}
          </div>
        ))}
      </section>

      <header className="section-label">
        <h2>Visuals & experiments</h2>
        <p className="muted">Flyers, brands, videos, and whatever else I can't stop myself from making.</p>
      </header>
      <section className="grid" aria-label="Visuals and experiments">
        {shots.map((col, c) => (
          <div key={c} className="grid-col">
            {col.map(s => {
              const media = (
                <>
                  <div className="tile-media" style={{ aspectRatio: s.aspect }}>
                    {s.youtube && (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${s.youtube}?autoplay=1&mute=1&loop=1&playlist=${s.youtube}&controls=0&playsinline=1&modestbranding=1&rel=0`}
                        title={s.title}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        loading="lazy"
                      />
                    )}
                    {s.src && /\.(mp4|webm)$/.test(s.src) && <video src={s.src} autoPlay muted loop playsInline />}
                    {s.src && !/\.(mp4|webm)$/.test(s.src) && <img src={s.src} alt={s.title} loading="lazy" />}
                    {!s.src && !s.youtube && import.meta.env.DEV && <span className="shot-empty">public/playground/ → set src in data.ts</span>}
                  </div>
                  <div className="shot-caption">
                    <h3 className="tile-title">{s.title}{s.href && <span className="shot-arrow" aria-hidden> ↗</span>}</h3>
                    <p className="tile-tags">{s.caption}</p>
                  </div>
                </>
              )
              const key = s.youtube ?? s.src ?? s.title
              return s.href
                ? <a key={key} {...linkProps(s.href)} className="tile shot is-link reveal">{media}</a>
                : <figure key={key} className="tile shot reveal">{media}</figure>
            })}
          </div>
        ))}
      </section>
    </div>
  )
}
