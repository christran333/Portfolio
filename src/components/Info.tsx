import type { CSSProperties } from 'react'
import { useReveal } from '../useReveal'
import { distribute, useColumnCount } from '../layout'
import { linkProps, profile, projects } from '../data'
import { caseStudies } from '../caseStudies'

type Entry = { when: string; role: string; org: string; href?: string; work?: string[] }

const project = (id: string) => projects.find(p => p.id === id)!
// When a project started: the case study's date, else the one on its tile ("Spring 2025 → Fall 2025" shows as "Spring 2025")
const projectWhen = (id: string) => (caseStudies[id]?.date ?? project(id).when ?? '').split('→')[0].trim()
// On the timeline, a project name links to the company's own website (the case studies live on the home page)
const ProjectName = ({ id }: { id: string }) => {
  const p = project(id)
  return p.site ? <a {...linkProps(p.site)}>{p.title}</a> : <span>{p.title}</span>
}

// Resume-style list: dates on the left, role and company. A place with `work` lists
// each project as its own row nested underneath.
function Timeline({ title, entries, delay }: { title: string; entries: Entry[]; delay: number }) {
  return (
    <>
      <h2 className="label rise">{title}</h2>
      <ol className="timeline">
        {entries.map((e, i) => (
          <li key={e.org} className="timeline-entry rise" style={{ animationDelay: `${delay + i * 0.05}s` }}>
            <div className="timeline-row">
              <span className="timeline-when">{e.when}</span>
              <p className="timeline-role">
                {/* The whole line is the link (no underline), so it dims as one on hover like the project names */}
                {e.href ? <a {...linkProps(e.href)}>{e.role}, {e.org}</a> : <>{e.role}, {e.org}</>}
              </p>
            </div>
            {e.work && (
              <ul className="timeline-projects">
                {e.work.map(id => (
                  <li key={id} className="timeline-row is-project">
                    <span className="timeline-when">{projectWhen(id)}</span>
                    <p className="timeline-project"><ProjectName id={id} /></p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </>
  )
}

export default function Info() {
  const root = useReveal<HTMLDivElement>()
  const n = useColumnCount()
  const photoColumns = distribute(profile.photos, n)

  return (
    <div ref={root}>
      <div className="info">
        <section className="info-col info-about">
          <h2 className="label rise">About</h2>
          {profile.aboutIntro.map((para, i) => (
            <p key={i} className="info-text rise" style={{ animationDelay: `${0.06 + i * 0.07}s` }}>{para}</p>
          ))}
        </section>

        {/* Right column: the resume-style timeline level with the About text, then the lists */}
        <section className="info-col info-experience">
          <Timeline title="Experience" entries={profile.experience} delay={0.2} />

          <h2 className="label rise">Elsewhere</h2>
          <ul className="info-list">
            {profile.links.map((l, i) => (
              <li key={l.label} className="rise" style={{ animationDelay: `${0.12 + i * 0.04}s` }}>
                <a href={l.href} target="_blank" rel="noreferrer">{l.label}<sup>↗</sup></a>
              </li>
            ))}
          </ul>

          <h2 className="label rise">Resume</h2>
          <p className="rise" style={{ animationDelay: '.36s' }}>
            <a className="underline" href={profile.resume} target="_blank" rel="noreferrer">View my resume<sup>↗</sup></a>
          </p>
        </section>
      </div>

      <section className="grid info-photos" aria-label="Photos" style={{ '--cols': n } as CSSProperties}>
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
