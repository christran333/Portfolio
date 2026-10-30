import { useReveal } from '../useReveal'
import { distribute, useColumnCount } from '../layout'
import { linkProps, playground } from '../data'

// Marketing, video, visuals and side experiments. Add pieces to `playground` in data.ts
export default function Exploration() {
  const root = useReveal<HTMLDivElement>()
  const shots = distribute(playground, useColumnCount())

  return (
    <div ref={root}>
      <header className="section-label page-label">
        <h1 className="rise">Exploration</h1>
        <p className="muted rise" style={{ animationDelay: '.15s' }}>Flyers, brands, videos, and whatever else I can't stop myself from making.</p>
      </header>
      <section className="grid" aria-label="Exploration">
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
