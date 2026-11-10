import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { caseStudies, type Block } from '../caseStudies'
import { imgAt, type Project } from '../data'

// Quick-view overlay for the "More work" list: no write-up, just the facts and the visuals.
// Everything shown here comes from that project's entry in caseStudies.ts, so there's nothing extra to maintain.

const sized = (src: string) => (src.includes('framerusercontent.com/images') ? imgAt(src, 2000) : src)

// Every image in the case study, in page order, hero first, no repeats
function visuals(id: string) {
  const s = caseStudies[id]
  if (!s) return []
  const out: { src: string; video?: boolean }[] = [{ src: s.hero }]
  const add = (b: Block) => {
    if (b.kind === 'image') out.push({ src: b.src })
    else if (b.kind === 'gallery') b.images.forEach(src => out.push({ src }))
    else if (b.kind === 'feature') out.push({ src: b.src, video: b.video })
    else if (b.kind === 'video') out.push({ src: b.src, video: true })
    else if (b.kind === 'finding' && b.src) out.push({ src: b.src })
  }
  s.sections.forEach(sec => sec.blocks.forEach(add))
  const seen = new Set<string>()
  return out.filter(v => (seen.has(v.src) ? false : (seen.add(v.src), true)))
}

type Props = { project: Project; onNext: () => void; onPrev: () => void; onClose: () => void }

export default function Peek({ project: p, onNext, onPrev, onClose }: Props) {
  const s = caseStudies[p.id]
  const panel = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  // Lock the page behind, focus the close button, and hand focus back on close
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    panel.current?.focus({ preventScroll: true }) // focus the panel itself, so no focus ring flashes on the close button
    return () => { html.style.overflow = prev; back?.focus?.({ preventScroll: true }) }
  }, [])

  // Esc closes, ← → step through the list
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose, onNext, onPrev])

  // New project: start back at the top
  useEffect(() => { scroller.current?.scrollTo(0, 0) }, [p.id])

  const facts = s
    ? [
        { label: 'Role', lines: s.role },
        s.team && { label: 'With', lines: s.team },
        { label: 'Scope', lines: s.scope },
        { label: 'When', lines: [s.date] },
      ].filter(Boolean) as { label: string; lines: string[] }[]
    : []

  return createPortal(
    <div className="peek" onClick={onClose}>
      <div className="peek-scroll" ref={scroller}>
        <div
          className="peek-panel"
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="peek-title"
          onClick={e => e.stopPropagation()}
        >
          <button type="button" className="peek-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" /></svg>
          </button>

          <div className="peek-head">
            <h2 id="peek-title" className="peek-title">{p.title}</h2>
            {p.site && <a className="peek-site" href={p.site} target="_blank" rel="noreferrer">{new URL(p.site).hostname.replace(/^www\./, '')} ↗</a>}
            <dl className="peek-facts">
              {facts.map(f => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  {f.lines.map(l => <dd key={l}>{l}</dd>)}
                </div>
              ))}
            </dl>
            <p className="peek-about">{s?.overview[0] ?? p.summary}</p>
          </div>

          <div className="peek-media">
            {visuals(p.id).map(v =>
              v.video
                ? <video key={v.src} src={v.src} autoPlay muted loop playsInline />
                : <img key={v.src} src={sized(v.src)} alt="" loading="lazy" />,
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
