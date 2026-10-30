import { useState, type CSSProperties } from 'react'
import { useReveal } from '../useReveal'
import { imgAt, profile, projects } from '../data'
import type { Block, CaseStudy as Study } from '../caseStudies'

// Framer serves jpg/png at any size; anything else (like video) is used as-is
const sized = (src: string, w: number) => (src.includes('/images/') ? imgAt(src, w) : src)

function Media({ src, caption, video }: { src: string; caption?: string; video?: boolean }) {
  return (
    <figure className="cs-media reveal">
      {video
        ? <video src={src} autoPlay muted loop playsInline />
        : <img src={sized(src, 2048)} alt={caption ?? ''} loading="lazy" />}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// Rows of `columns` images. Each image's flex share is its own aspect ratio (read on load),
// so a row lines up at one height without cropping anything. A short last row gets spacers
// so its images stay the same size as the rows above.
// Gallery images stack one per row at the full width of the content column, so the work is big
// enough to actually read. Pass `columns` in caseStudies.ts to put small sets side by side instead.
function Gallery({ images, columns }: { images: string[]; columns: number }) {
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const known = Object.values(ratios)
  const rows: string[][] = []
  for (let i = 0; i < images.length; i += columns) rows.push(images.slice(i, i + columns))
  const avg = known.length ? known.reduce((a, r) => a + r, 0) / known.length : 16 / 9
  return (
    <div className="cs-gallery">
      {rows.map((row, ri) => (
        <div key={ri} className="cs-gallery-row">
          {row.map(src => (
            <img
              key={src}
              src={sized(src, 1600)}
              alt=""
              loading="lazy"
              style={{ '--r': ratios[src] ?? 16 / 9 } as CSSProperties}
              onLoad={e => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget
                if (w && h) setRatios(r => (r[src] === w / h ? r : { ...r, [src]: w / h }))
              }}
            />
          ))}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <span key={`s${i}`} className="cs-gallery-spacer" aria-hidden style={{ '--r': avg } as CSSProperties} />
          ))}
        </div>
      ))}
    </div>
  )
}

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case 'p': return <p className="cs-p reveal">{b.text}</p>
    case 'lead': return <p className="cs-lead reveal">{b.text}</p>
    case 'list':
      return (
        <div className="cs-list reveal">
          {b.title && <h4>{b.title}</h4>}
          <ul>{b.items.map(i => <li key={i}>{i}</li>)}</ul>
        </div>
      )
    case 'cards':
      return (
        <div className={`cs-cards ${b.items.length % 2 === 0 ? 'two' : 'three'}`}>
          {b.items.map((c, i) => (
            <div key={c.title} className="cs-card reveal">
              {b.numbered && <span className="cs-num">{String(i + 1).padStart(2, '0')}</span>}
              <h4>{c.title}</h4>
              {c.body && <p>{c.body}</p>}
              {c.points && <ul>{c.points.map(pt => <li key={pt}>{pt}</li>)}</ul>}
            </div>
          ))}
        </div>
      )
    case 'image': return <Media src={b.src} caption={b.caption} />
    case 'finding':
      return (
        <div className={`cs-finding reveal ${b.src ? '' : 'no-image'}`}>
          {b.src && <img src={sized(b.src, 1600)} alt="" loading="lazy" />}
          <div>
            <span className="cs-label">{b.theme}</span>
            <h4>{b.title}</h4>
            <dl>
              <dt>Problem</dt><dd>{b.problem}</dd>
              <dt>Recommendation</dt><dd>{b.fix}</dd>
            </dl>
          </div>
        </div>
      )
    case 'feature':
      return (
        <div className="cs-feature reveal">
          <div className="cs-feature-media">
            {b.video
              ? <video src={b.src} autoPlay muted loop playsInline />
              : <img src={sized(b.src, 1600)} alt="" loading="lazy" />}
          </div>
          <div>
            <h4>{b.title}</h4>
            <p>{b.text}</p>
          </div>
        </div>
      )
    case 'link':
      return <a className="cs-link reveal" href={b.href} target="_blank" rel="noreferrer">{b.label} ↗</a>
    case 'gallery':
      return (
        <figure className="cs-media reveal">
          <Gallery images={b.images} columns={b.columns ?? 1} />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      )
    case 'video': return <Media src={b.src} caption={b.caption} video />
    case 'table':
      return (
        <div className="cs-table reveal">
          <table>
            <thead><tr>{b.head.map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} data-label={b.head[i]}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
  }
}

export default function CaseStudy({ id, study }: { id: string; study: Study }) {
  const root = useReveal<HTMLElement>()
  const project = projects.find(p => p.id === id)!

  return (
    <article ref={root} className="cs">
      <header className="cs-head">
        <p className="cs-meta rise">
          <span>{project.title}</span><span>{study.role}</span><span>{study.date}</span>
        </p>
        <h1 className="cs-title rise" style={{ animationDelay: '.08s' }}>{study.headline}</h1>
      </header>

      <dl className="cs-facts">
        <div className="reveal"><dt>Role</dt><dd>{study.role}</dd></div>
        {study.team && <div className="reveal"><dt>Team</dt><dd>{study.team}</dd></div>}
        <div className="reveal"><dt>Timeline</dt><dd>{study.date}</dd></div>
        <div className="reveal"><dt>Project</dt><dd>{study.type}</dd></div>
        <div className="reveal"><dt>Disciplines</dt><dd>{project.tags.join(', ')}</dd></div>
      </dl>

      {study.highlights && (
        <section className="cs-highlights" style={{ '--n': study.highlights.length } as CSSProperties}>
          {study.highlights.map(h => (
            <div key={h.label} className="cs-highlight reveal">
              <span className="cs-label">Highlight</span>
              <strong>{h.value}</strong>
              <p>{h.label}</p>
            </div>
          ))}
        </section>
      )}

      <section className="cs-section">
        <h3 className="cs-section-title">Overview</h3>
        <div className="cs-body">
          {study.overview.map(t => <p key={t} className="cs-lead reveal">{t}</p>)}
        </div>
      </section>

      {study.sections.map(s => (
        <section key={s.title} className="cs-section">
          <h3 className="cs-section-title">{s.title}</h3>
          <div className="cs-body">{s.blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>
        </section>
      ))}

      <section className="cs-section">
        <h3 className="cs-section-title">Want to learn more?</h3>
        <div className="cs-body">
          <p className="cs-lead reveal">
            I'd love to walk through the thinking behind this one. Reach out at{' '}
            <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>.
          </p>
        </div>
      </section>
    </article>
  )
}
