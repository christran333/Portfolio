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
const FINE = 7 // px per cell for the giant reveal lettering
const FPS = 30
const RADIUS = 52 // px around the pointer that lights up
const BLAST_T = 0.9 // seconds a click's shockwave takes to spread and fade
// Easter egg: 8 fast clicks blows the whole page open and spells this out
const MSG = 'CENTEREDBYVOID '
const SOLID = 'CENTEREDBYVOID' // no gaps inside the giant letters
const REVEAL_CLICKS = 8
const REVEAL_T = 4 // seconds the message holds before settling back

export default function AsciiField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

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
    let reveal: { x: number; y: number; t0: number } | null = null
    // The big lettering for the reveal, rasterized on a grid twice as fine as
    // the dots so the giant letters read cleanly
    let mask = new Float32Array(0), fcols = 0, frows = 0
    const buildMask = () => {
      fcols = Math.ceil(w / FINE); frows = Math.ceil(h / FINE)
      const off = document.createElement('canvas')
      off.width = fcols; off.height = frows
      const g = off.getContext('2d')!
      const lines = w / h > 1.15 ? ['CENTEREDBYVOID'] : ['CENTERED', 'BY', 'VOID']
      g.font = '900 100px system-ui, sans-serif'
      const widest = Math.max(...lines.map(l => g.measureText(l).width))
      const size = Math.min((fcols * 0.94 / widest) * 100, (frows * 0.7) / lines.length)
      g.font = `900 ${size}px system-ui, sans-serif`
      g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillStyle = '#fff'
      // lined up with the hero headline it replaces (falls back to center)
      const lead = document.querySelector('.intro-lead')?.getBoundingClientRect()
      const mid = lead && lead.bottom > 0 && lead.top < h ? (lead.top + lead.height / 2) / FINE : frows / 2
      lines.forEach((l, n) => g.fillText(l, fcols / 2, mid + (n - (lines.length - 1) / 2) * size * 1.0))
      const px = g.getImageData(0, 0, fcols, frows).data
      mask = new Float32Array(fcols * frows)
      for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4 + 3] / 255
    }

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
      // the reveal: a ring that sweeps the whole screen and leaves the message behind it
      let rv: { x: number; y: number; r: number; hold: number } | null = null
      if (reveal) {
        const age = t - reveal.t0
        root.classList.toggle('field-reveal', age < REVEAL_T - 0.9)
        if (age > REVEAL_T) reveal = null
        else rv = {
          x: reveal.x / CELL, y: reveal.y / CELL,
          r: Math.hypot(cols, rows) * Math.min(1, age / 1.1),
          hold: Math.min(1, (REVEAL_T - age) / 0.9), // fades out over the last second
        }
      }
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
          let spell = false
          const cx = x * CELL + CELL / 2, cy = y * CELL + CELL / 2
          if (rv && Math.hypot(x - rv.x, y - rv.y) < rv.r) {
            // giant letters glow bright; the message fills in faintly around them,
            // and the wave keeps rolling through both
            // cells under the giant letters are drawn by the fine pass below
            if ((mask[Math.floor(cy / FINE) * fcols + Math.floor(cx / FINE)] || 0) > 0.3) { heat[i] = 0; continue }
            const wv = Math.max(0, wave(x, y))
            heat[i] = Math.max(heat[i], (0.02 + 0.4 * wv * wv) * rv.hold)
            spell = true
          }
          const hv = heat[i]
          if (hv > 0.04) {
            // lifted: purple ASCII, risen a few pixels, brighter the hotter it is
            const ch = spell
              ? MSG[(x + y * 5) % MSG.length] // reads left to right, staggered row by row
              : CORE[(x * 7 + y * 13 + Math.floor(t * 6)) % CORE.length]
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
      // the giant CENTEREDBYVOID, swept in by the reveal ring, wave rolling through it
      if (rv) {
        ctx.font = `${FINE + 1}px ${mono}`
        ctx.fillStyle = accent
        const s = FINE / CELL
        for (let y = 0; y < frows; y++) {
          for (let x = 0; x < fcols; x++) {
            if ((mask[y * fcols + x] || 0) < 0.3) continue
            if (Math.hypot(x * s - rv.x, y * s - rv.y) > rv.r) continue
            // crests of the wave run bright and lift up through the letters
            const wv = Math.max(0, Math.min(1, wave(x * s, y * s)))
            ctx.globalAlpha = Math.min(1, (0.25 + 0.75 * wv * wv) * rv.hold * boost)
            ctx.fillText(SOLID[(x + y * 3) % SOLID.length], x * FINE + FINE / 2, y * FINE + FINE / 2 - wv * 3)
          }
        }
      }
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
    // A little hint by the cursor while you're building up to the reveal
    const hint = hintRef.current!
    let hintTimer = 0, slowTimer = 0
    const say = (text: string, x: number, y: number, ms = 900) => {
      hint.textContent = text
      hint.style.transform = `translate3d(${x + 16}px, ${y - 28}px, 0)`
      hint.classList.add('is-on')
      clearTimeout(hintTimer)
      hintTimer = window.setTimeout(() => hint.classList.remove('is-on'), ms)
    }
    const down = (e: PointerEvent) => {
      const hero = document.querySelector('.intro')?.getBoundingClientRect()
      if (!hero || e.clientY < hero.top || e.clientY > hero.bottom) return
      const now = t
      clicks.push(now)
      while (clicks.length && now - clicks[0] > 1.6) clicks.shift()
      const combo = clicks.length // how many clicks in the last 1.6s
      clearTimeout(slowTimer)
      if (combo >= REVEAL_CLICKS && !reveal) {
        reveal = { x: e.clientX, y: e.clientY, t0: now }
        clicks.length = 0
        hint.classList.remove('is-on')
        buildMask()
      } else if (!reveal && combo >= 3) {
        const left = REVEAL_CLICKS - combo
        say(left === 1 ? 'one more…' : combo === 3 ? 'keep clicking for a surprise' : `${left} more`, e.clientX, e.clientY)
        slowTimer = window.setTimeout(() => say('too slow, click faster', e.clientX, e.clientY, 1400), 1650)
      }
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
      root.classList.remove('has-field', 'field-scrolled', 'field-reveal')
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      clearTimeout(hintTimer); clearTimeout(slowTimer)
      document.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <>
      <canvas ref={ref} className="ascii-field" aria-hidden />
      <div ref={hintRef} className="ascii-hint" aria-hidden />
    </>
  )
}
