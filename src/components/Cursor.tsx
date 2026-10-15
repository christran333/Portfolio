import { useEffect, useRef, useState } from 'react'

// Anything you can click or drag; the dot grows over these
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"], [role="tab"], [data-cursor-grow]'

type Mode = 'dot' | 'grow'

// A small dot that inverts whatever it's over (white on dark, black on light), and grows over anything interactive.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('dot')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const target = { x: -100, y: -100 }
    const pos = { x: -100, y: -100 }
    let raf = 0
    let scrollQueued = false
    let lastMode: Mode = 'dot'

    // Ease toward the pointer for a slightly weighted feel, and stop once it has caught up,
    // so nothing runs every frame while the mouse is still
    const loop = () => {
      const dx = target.x - pos.x
      const dy = target.y - pos.y
      pos.x += dx * 0.3
      pos.y += dy * 0.3
      dot.current!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      raf = Math.abs(dx) + Math.abs(dy) > 0.1 ? requestAnimationFrame(loop) : 0
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(loop) }
    const sense = (el: Element | null) => {
      const next: Mode = el?.closest(INTERACTIVE) ? 'grow' : 'dot'
      if (next !== lastMode) { lastMode = next; setMode(next) }
    }
    const move = (e: PointerEvent) => {
      setVisible(true)
      target.x = e.clientX
      target.y = e.clientY
      sense(e.target as Element)
      wake()
    }
    // Content moves under a still pointer while scrolling; check at most once per frame
    const scroll = () => {
      if (scrollQueued) return
      scrollQueued = true
      requestAnimationFrame(() => { scrollQueued = false; sense(document.elementFromPoint(target.x, target.y)) })
    }
    const leave = () => setVisible(false)

    window.addEventListener('pointermove', move)
    window.addEventListener('scroll', scroll, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', scroll)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  const state = `${visible ? 'is-visible' : ''} is-${mode}`
  return <div ref={dot} className={`cursor cursor-dot ${state}`} aria-hidden><i /></div>
}
