import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

// The note, one letter at a time, so it can be written left to right like a real pen.
// Small fixed wobbles keep it looking hand-done instead of typeset:
//   r = angle, y = baseline shift (px), t = seconds the pen spends on the letter,
//   o = ink strength (a marker never lays down an even black), f = which way the stroke fades out (deg)
// The space is a longer pause, like lifting the pen between words.
const NOTE = 'GO EXPLORE'
const WOBBLE = [
  { r: -4, y: 1, t: .2, o: .94, f: 100 }, { r: 3, y: -1, t: .17, o: .86, f: 70 }, { r: 0, y: 0, t: .3, o: 1, f: 90 },
  { r: 2, y: 2, t: .16, o: .97, f: 120 }, { r: -3, y: 0, t: .15, o: .84, f: 80 }, { r: 4, y: -2, t: .19, o: .92, f: 160 },
  { r: -2, y: 1, t: .14, o: .8, f: 95 }, { r: 3, y: -1, t: .18, o: .9, f: 60 }, { r: -4, y: 2, t: .16, o: .95, f: 110 },
  { r: 1, y: -1, t: .2, o: .78, f: 85 },
]
let at = .05
const LETTERS = [...NOTE].map((ch, i) => {
  const w = WOBBLE[i]
  const letter = { ch, delay: at, dur: w.t * .8, r: w.r, y: w.y, o: w.o, f: w.f }
  at += w.t
  return letter
})

// The hero photo as an instant-film print.
// Hover: it lifts off the page and tilts toward the cursor, turning a little to the side.
// Click: "GO EXPLORE" gets written along the bottom of the frame in marker; click again to wipe it.
export default function Polaroid({ src, alt, width, height, style }: {
  src: string; alt: string; width: number; height: number; style?: CSSProperties
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [written, setWritten] = useState(false)

  // Tilt toward the pointer: -1..1 across the print, turned into a few degrees each way
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 2 - 1
    const y = ((e.clientY - r.top) / r.height) * 2 - 1
    el.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(x * 10).toFixed(2)}deg`)
  }
  const leave = () => {
    ref.current!.style.setProperty('--tilt-x', '0deg')
    ref.current!.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <button
      ref={ref}
      type="button"
      className={`polaroid rise${written ? ' is-written' : ''}`}
      style={style}
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={() => setWritten(w => !w)}
      aria-pressed={written}
      aria-label={written ? 'Photo of Christopher, signed “Go explore”' : 'Photo of Christopher. Click to sign it'}
    >
      {/* The paper itself is an inner layer, so the tilt never fights the page's fade-in animation */}
      <span className="polaroid-card">
        <span className="polaroid-photo">
          <img src={src} alt={alt} width={width} height={height} />
        </span>
        {/* The handwriting: each letter is uncovered left to right in turn, as the pen moves */}
        <span className="polaroid-note" aria-hidden>
          {LETTERS.map((l, i) => (
            <span
              key={i}
              className={l.ch === ' ' ? 'is-space' : undefined}
              style={{ '--d': `${l.delay}s`, '--t': `${l.dur}s`, '--r': `${l.r}deg`, '--y': `${l.y}px`, '--o': l.o, '--f': `${l.f}deg` } as CSSProperties}
            >{l.ch}</span>
          ))}
        </span>
      </span>
    </button>
  )
}
