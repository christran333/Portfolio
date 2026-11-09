import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Analytics } from '@vercel/analytics/react'

// Agentation: click any element on the local site, leave a note, and copy it for Claude.
// Dev only: the import sits behind import.meta.env.DEV, so it's left out of the live build entirely.
const Agentation = import.meta.env.DEV
  ? lazy(() => import('agentation').then(m => ({ default: m.Agentation })))
  : null

// While the page scrolls under a still cursor, browsers still fire hover on whatever slides beneath it, which
// made cards light up and the grid dim mid-scroll. So hover effects switch off as soon as you scroll, and only
// come back once the mouse actually moves again.
const root = document.documentElement
// Mouse/trackpad only. Touch screens have no hover, and they never send a mouse move to switch it back on,
// so on a phone this would leave the work grid unclickable after the first swipe.
const canHover = matchMedia('(hover: hover) and (pointer: fine)')
addEventListener('scroll', () => { if (canHover.matches) root.classList.add('is-scrolling') }, { passive: true })
// (movement 0 = a synthetic move some browsers send when scrolling ends, not the user moving the mouse)
addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse' && (e.movementX || e.movementY)) root.classList.remove('is-scrolling')
}, { passive: true })
// Any press (mouse, finger, pen) always brings interaction back, as a safety net
addEventListener('pointerdown', () => root.classList.remove('is-scrolling'), { passive: true, capture: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    {Agentation && <Suspense fallback={null}><Agentation /></Suspense>}
  </StrictMode>,
)
