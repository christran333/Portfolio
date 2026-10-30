import { useReveal } from '../useReveal'
import { distribute, useColumnCount } from '../layout'
import { linkProps, profile, projects } from '../data'

export default function Info() {
  const root = useReveal<HTMLDivElement>()
  const photoColumns = distribute(profile.photos, useColumnCount())

  return (
    <div ref={root}>
      <div className="info">
        <section className="info-col info-about">
          <h2 className="label rise">About</h2>
          {profile.about.map((para, i) => (
            <p key={i} className="info-text rise" style={{ animationDelay: `${0.06 + i * 0.07}s` }}>{para}</p>
          ))}

          <h2 className="label rise">What I do in my free time</h2>
          <div className="interests">
            {profile.interests.map((group, i) => (
              <div key={group.label} className="rise" style={{ animationDelay: `${0.2 + i * 0.06}s` }}>
                <h3>{group.label}</h3>
                <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="info-col">
          <h2 className="label rise">Recognition</h2>
          <ul className="info-list">
            {profile.recognition.map((r, i) => (
              <li key={r.label} className="rise" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                {r.href ? <a href={r.href} target="_blank" rel="noreferrer">{r.label}<sup>↗</sup></a> : <span>{r.label}</span>}
                <span className="muted">{r.detail}</span>
              </li>
            ))}
          </ul>

          <h2 className="label rise">Selected work</h2>
          <ul className="info-list">
            {projects.map((p, i) => (
              <li key={p.id} className="rise" style={{ animationDelay: `${0.15 + i * 0.03}s` }}>
                {p.href ? <a {...linkProps(p.href)}>{p.title}</a> : <span>{p.title}</span>}
                <span className="muted">{p.soon ? 'Coming soon' : p.tags[0]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="info-col">
          <h2 className="label rise">Elsewhere</h2>
          <ul className="info-list">
            {profile.links.map((l, i) => (
              <li key={l.label} className="rise" style={{ animationDelay: `${0.12 + i * 0.04}s` }}>
                <a href={l.href} target="_blank" rel="noreferrer">{l.label}<sup>↗</sup></a>
              </li>
            ))}
          </ul>

          <h2 className="label rise">Contact</h2>
          <p className="rise" style={{ animationDelay: '.3s' }}>
            <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
        </section>
      </div>

      <section className="grid info-photos" aria-label="Photos">
        {photoColumns.map((col, c) => (
          <div key={c} className="grid-col">
            {col.map(p => (
              <figure
                key={p.src}
                className={`tile-media info-photo reveal${p.caption ? ' has-caption' : ''}`}
                style={{ aspectRatio: p.aspect }}
                tabIndex={p.caption ? 0 : undefined}
              >
                <img src={p.src} alt={p.alt} loading="lazy" />
                {p.caption && (
                  <figcaption className="info-tag">
                    <span className="info-tag-i" aria-hidden>i</span>
                    <span className="info-tag-text">{p.caption}</span>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}
