import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// Full-screen view of one case-study image. Opens fitted to the screen; for big boards (audit maps, token
// sheets) clicking the image switches to actual size so you can pan around and read the detail.
// Click outside it, press Esc, or use the close button to go back.
export default function Zoom({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [actual, setActual] = useState(false)
  const [big, setBig] = useState(false) // only offer actual size when the image is bigger than the screen

  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    addEventListener('keydown', key)
    return () => { html.style.overflow = prev; removeEventListener('keydown', key) }
  }, [onClose])

  return createPortal(
    <div className={`zoom${actual ? ' is-actual' : ''}`} role="dialog" aria-modal="true" aria-label={alt || 'Image'} onClick={onClose}>
      <button type="button" className="zoom-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" /></svg>
      </button>
      <img
        src={src}
        alt={alt}
        className={big ? 'can-actual' : ''}
        onLoad={e => {
          const i = e.currentTarget
          setBig(i.naturalWidth > innerWidth * 0.94 || i.naturalHeight > innerHeight * 0.9)
        }}
        onClick={e => { e.stopPropagation(); if (big) setActual(a => !a) }}
      />
    </div>,
    document.body,
  )
}
