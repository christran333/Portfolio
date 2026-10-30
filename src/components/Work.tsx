import { useEffect, useRef, useState } from 'react'
import { useReveal } from '../useReveal'
import { distribute, useColumnCount } from '../layout'
import AsciiField from './AsciiField'
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

  return (
    <div ref={root}>
      <section className="intro">
        <AsciiField />
        <h1 className="intro-lead">
          {/* Inline, so only the words themselves (not the empty space around them) open the video */}
          <span
            data-cursor-grow
            onPointerEnter={e => e.pointerType === 'mouse' && setPreviewing(true)}
            onPointerLeave={() => setPreviewing(false)}
          >
            <span className="rise" style={{ animationDelay: '.1s' }}>I'm Christopher, a product designer who cares about</span>{' '}
            <span className="rise" style={{ animationDelay: '.35s' }}>research, solving ambiguous problems, and <span className="nowrap">visual polish.</span></span>
          </span>
        </h1>
        <p className="intro-sub rise" style={{ animationDelay: '.7s' }}>{profile.status}</p>
        <div ref={preview} className={`intro-preview ${previewing ? 'is-open' : ''}`} aria-hidden>
          <video ref={video} src="/hero.mp4" muted loop playsInline preload="auto" />
        </div>
      </section>

      <section className="grid" aria-label="Selected work">
        {columns.map((col, c) => (
          <div key={c} className="grid-col">
            {col.map(p => {
              const body = (
                <>
                  <div className="tile-media" style={{ aspectRatio: p.aspect }}>
                    <Cover p={p} />
                    {p.soon && (
                      <span className="tile-soon">
                        {p.href ? <>Full case study coming soon<span className="tile-soon-cta">Watch the demo ↗</span></> : 'Coming soon'}
                      </span>
                    )}
                  </div>
                  <p className="tile-tags">{[p.tags[0], p.when].filter(Boolean).join(' · ')}</p>
                  <h2 className="tile-title">{p.title}</h2>
                  <p className="tile-summary">{p.summary}</p>
                </>
              )
              const cls = `tile reveal${p.soon ? ' is-soon' : ''}`
              return p.href
                ? <a key={p.id} {...linkProps(p.href)} className={cls}>{body}</a>
                : <div key={p.id} className={cls}>{body}</div>
            })}
          </div>
        ))}
      </section>

    </div>
  )
}
