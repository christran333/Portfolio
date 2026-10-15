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
    const sense = (el: Element | null) => {
      setMode(el?.closest(INTERACTIVE) ? 'grow' : 'dot')
    }
    const move = (e: PointerEvent) => {
      setVisible(true)
      target.x = e.clientX
      target.y = e.clientY
      // Follow the pointer exactly, with no easing lag
      dot.current!.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      sense(e.target as Element)
    }
    // Content moves under a still pointer while scrolling
    const scroll = () => sense(document.elementFromPoint(target.x, target.y))
    const leave = () => setVisible(false)

    window.addEventListener('pointermove', move)
    window.addEventListener('scroll', scroll, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', scroll)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  const state = `${visible ? 'is-visible' : ''} is-${mode}`
  return <div ref={dot} className={`cursor cursor-dot ${state}`} aria-hidden><i /></div>
}
