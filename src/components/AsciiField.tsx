import { useEffect, useRef } from 'react'

// A faint halftone wave that rolls behind the whole homepage. Moving the mouse
// over the hero lifts the dots near the pointer into purple ASCII, which settles
// back down behind you. Kept light: ~30fps, capped pixel ratio, and it stops
// whenever the tab is hidden.
const DOT_R = [0.45, 0.7, 0.95] // px radius for each halftone step
const DOT_A = [0.12, 0.15, 0.18] // and its opacity
const CORE = 'ACHERS$#%&?'
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.47)
const CELL = 14 // px per cell
const FPS = 30
const RADIUS = 52 // px around the pointer that lights up
const BLAST_T = 0.9 // seconds a click's shockwave takes to spread and fade

export default function AsciiField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, cols = 0, rows = 0
    let heat = new Float32Array(0)
    let raf = 0, last = 0, t = 0
    let fg = '#ededeb', accent = '#a98bff', mono = 'monospace'
    let boost = 1 // dark ink on a light page needs a bit more opacity to show
    const pointer = { x: -1e4, y: -1e4, active: false }
    // Clicks on the hero send out a shockwave; clicking fast stacks them into bigger blasts
    const blasts: { x: number; y: number; t0: number; max: number; str: number }[] = []
    const clicks: number[] = []

    const readTheme = () => {
      const s = getComputedStyle(document.documentElement)
      fg = s.getPropertyValue('--fg').trim() || fg
      accent = s.getPropertyValue('--accent').trim() || accent
      mono = s.getPropertyValue('--mono').trim() || mono
      boost = document.documentElement.dataset.theme === 'light' ? 1.8 : 1
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth; h = window.innerHeight
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL)
      heat = new Float32Array(cols * rows)
    }

    // The wave: two swells rolling diagonally, plus a slow ripple for texture
    const wave = (x: number, y: number) => {
      const a = Math.sin(x * 0.11 - y * 0.05 - t * 1.1)
      const b = Math.sin(x * 0.04 + y * 0.09 - t * 0.7 + 1.3)
      const c = Math.sin(Math.hypot(x - cols * 0.75, y - rows * 0.4) * 0.22 - t * 1.6)
      return 0.5 + 0.28 * a + 0.16 * b + 0.08 * c
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.font = `9px ${mono}`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      const pc = pointer.x / CELL, pr = pointer.y / CELL, rad = RADIUS / CELL
      // tiny halftone dots, batched into one path per size so it stays cheap
      const paths = [new Path2D(), new Path2D(), new Path2D()]
      for (let b = blasts.length - 1; b >= 0; b--) if (t - blasts[b].t0 > BLAST_T) blasts.splice(b, 1)
      const rings = blasts.map(b => {
        const k = (t - b.t0) / BLAST_T
        return { x: b.x / CELL, y: b.y / CELL, r: (b.max / CELL) * (1 - (1 - k) ** 3), s: b.str * (1 - k) }
      })
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x
          // warm up the cells near the pointer; everything cools off over time
          if (pointer.active) {
            const d = Math.hypot(x - pc, y - pr)
            if (d < rad) heat[i] = Math.min(1, heat[i] + (1 - d / rad) * 0.35)
          }
          for (const g of rings) {
            const off = Math.abs(Math.hypot(x - g.x, y - g.y) - g.r)
            if (off < 2.2) heat[i] = Math.min(1, heat[i] + (1 - off / 2.2) * g.s)
          }
          heat[i] *= 0.88
          const hv = heat[i]
          const cx = x * CELL + CELL / 2, cy = y * CELL + CELL / 2
          if (hv > 0.04) {
            // lifted: purple ASCII, risen a few pixels, brighter the hotter it is
            const ch = CORE[(x * 7 + y * 13 + Math.floor(t * 6)) % CORE.length]
            ctx.globalAlpha = Math.min(1, (0.12 + 0.48 * hv) * boost)
            ctx.fillStyle = accent
            ctx.fillText(ch, cx, cy - hv * 4)
            continue
          }
          // halftone dot sized by the wave, ordered-dithered so it reads smooth
          const level = wave(x, y)
          const step = Math.max(0, Math.min(3, Math.round(level * 3 + BAYER[(y & 3) * 4 + (x & 3)])))
          if (!step) continue
          const r = DOT_R[step - 1]
          paths[step - 1].moveTo(cx + r, cy)
          paths[step - 1].arc(cx, cy, r, 0, Math.PI * 2)
        }
      }
      ctx.fillStyle = fg
      paths.forEach((p, i) => { ctx.globalAlpha = DOT_A[i] * boost; ctx.fill(p) })
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden || now - last < 1000 / FPS) return
      last = now
      t += 1 / FPS
      draw()
    }

    // On the homepage the header goes see-through at the top so the dots run
    // behind it, then gets its frosted background back once you scroll
    const root = document.documentElement
    root.classList.add('has-field')
    const onScroll = () => root.classList.toggle('field-scrolled', window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    readTheme(); resize(); draw()
    const onResize = () => { resize(); draw() }
    window.addEventListener('resize', onResize)
    const mo = new MutationObserver(() => { readTheme(); draw() })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    // Only the hero reacts to the mouse
    const move = (e: PointerEvent) => {
      pointer.x = e.clientX; pointer.y = e.clientY
      const hero = document.querySelector('.intro')?.getBoundingClientRect()
      pointer.active = !!hero && e.clientY >= hero.top && e.clientY <= hero.bottom
    }
    const leave = () => { pointer.active = false }
    const down = (e: PointerEvent) => {
      const hero = document.querySelector('.intro')?.getBoundingClientRect()
      if (!hero || e.clientY < hero.top || e.clientY > hero.bottom) return
      const now = t
      clicks.push(now)
      while (clicks.length && now - clicks[0] > 1.2) clicks.shift()
      const combo = clicks.length // how many clicks in the last 1.2s
      blasts.push({ x: e.clientX, y: e.clientY, t0: now, max: Math.min(620, 110 + combo * 70), str: Math.min(1, 0.45 + combo * 0.1) })
      if (blasts.length > 12) blasts.shift()
    }
    if (!reduce) {
      raf = requestAnimationFrame(loop)
      window.addEventListener('pointermove', move, { passive: true })
      window.addEventListener('pointerdown', down, { passive: true })
      document.addEventListener('pointerleave', leave)
    }
    return () => {
      cancelAnimationFrame(raf); mo.disconnect()
      root.classList.remove('has-field', 'field-scrolled')
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      document.removeEventListener('pointerleave', leave)
    }
  }, [])

  return <canvas ref={ref} className="ascii-field" aria-hidden />
}
