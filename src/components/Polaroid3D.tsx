import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import * as THREE from 'three'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, useTexture } from '@react-three/drei'

// The hero photo as a real 3D instant-film print (built in polaroid-lab, then moved here), one of a few you can go through.
// - Resting, it sits exactly where the flat Polaroid is in the hero (it reads that element's position every frame,
//   so it scrolls with the page), floats a little, and leans toward the cursor.
// - Drag to spin it; flick it and it keeps turning, then settles on whichever side faces you. The back says when
//   and where it was taken.
// - Click it and it comes up big in the middle of the screen so you can write on the bottom border with the cursor.
//   Done, Esc, or clicking off it puts it back, with your writing still on it.
// - The arrows under it go to the next / previous photo: the one showing slides off to the side turning edge-on, and the
//   new one comes round from the other side. One print is on screen at a time; each keeps its own writing.
// Phones and tablets get it too, by touch: drag sideways to spin (up and down still scrolls the page), tap to open,
// write with a finger. On a narrow screen the open print sits higher with the tools in a row under it.
// Loaded wherever there's WebGL and motion is allowed (see Work.tsx); everyone else keeps the flat version.

// Real instant-film proportions (88 x 107 mm print, 79 x 79 mm picture), in scene units of 10 cm
const W = 0.88, H = 1.07, D = 0.014
const PIC = 0.79, SIDE = 0.045
const PIC_Y = H / 2 - SIDE - PIC / 2
const STRIP_H = H - SIDE - PIC
const STRIP_Y = -H / 2 + STRIP_H / 2
const INK_W = W * 0.94, INK_H = STRIP_H * 0.9
const INK_CW = 1600, INK_CH = Math.round(INK_CW * INK_H / INK_W)
const INK = '#23242b'

// The prints, in order. `back` is what's written on the back, in pen (blank if left out): the date it was taken,
// then a line or two under it
type Line = { text: string; size: number; y: number; weight?: number }
const note = (date: string, ...lines: string[]): Line[] => [
  { text: date, size: 96, y: 0.43, weight: 700 },
  ...lines.map((text, i) => ({ text, size: 50, y: 0.525 + i * 0.053, weight: 700 })),
]
const PRINTS: { src: string; alt: string; back?: Line[] }[] = [
  { src: '/about/hero-night.jpg', alt: "Christopher on a street at night, lit by a camera flash", back: note('10/24/2026', 'McAllen, Texas', 'On tour with my band, Hearth') },
  // Film scans, cropped square for the print's window
  { src: '/about/film/pizza.jpg', alt: "Joel and Kaden eating pizza at a yellow table", back: note('10/25/2026', 'Joel & Kaden', 'Shredders Pizza', 'Houston, Texas') },
  { src: '/about/film/show-floor.jpg', alt: "The band playing on the floor of the pizzeria with the crowd behind", back: note('10/25/2026', 'Playing our show in the', 'pizzeria at Shredders') },
  { src: '/about/film/guitars-up.jpg', alt: "A guitar and a bass held up over the crowd", back: note('10/25/2026', 'More photos from Shredders') },
  { src: '/about/film/crew.jpg', alt: "Sugar and Hearth together outside at night", back: note('10/25/2026', 'SUGAR x HEARTH', 'The band we toured with') },
  { src: '/about/film/driveway.jpg', alt: "Christopher and Alex standing in a driveway", back: note('10/23/2026', 'Me and my homie Alex') },
  { src: '/about/film/parking-lot.jpg', alt: "Christopher's girlfriend in a parking lot at night", back: note('10/22/2026', 'My beautiful girlfriend') },
  { src: '/about/film/sun-flare.jpg', alt: "Four of the band walking in low sun", back: note('10/23/2026', 'Band tour kickoff road trip') },
]

// Stamps you can stick anywhere on the front of a print while it's open, FigJam style. Emoji for now; to add custom
// ones later, this list (and `stamp` in createInk, which draws them) is the place
const STAMPS = ['❤️', '🔥', '⭐', '👍', '😎', '🤘', '🎸', '🍕', '✌️']
const STK_CW = 1536, STK_CH = Math.round(STK_CW * H / W) // the sticker layer: a canvas over the whole front
const STAMP_PX = 208 // a sticker's size on that canvas

const ROLL_TILT = [-2.5, 1.5, -1, 2.5, 1, -2, 2, -1.5] // each print in the all-photos grid sits a little crooked
const TOUCH = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
const PHONE = 640 // px: at this window width and under, the open print uses the phone layout
const SLIDE = 0.7 // seconds for one print to slide out and the next to slide in

type Mode = 'rest' | 'write'
// The idle twist that hints the print can be spun: the first comes PEEK_FIRST seconds after the page loads, so it's
// seen straight away; after that there's a long quiet gap, one every PEEK_EVERY seconds, each taking PEEK_LEN.
// Hovering stops it (and the long gap starts over); it stops for good once someone has spun the print
const PEEK_FIRST = 0.6, PEEK_EVERY = 10, PEEK_LEN = 2.1

function paperTexture(base: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = base
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 9000; i++) {
    const v = Math.random()
    g.fillStyle = v > 0.5 ? `rgba(255,255,255,${v * 0.08})` : `rgba(60,50,40,${v * 0.07})`
    g.fillRect(Math.random() * 512, Math.random() * 512, 1.2, 1.2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Crop a photo to the square window like the print would (centred), whatever shape the file is
function cover(t: THREE.Texture) {
  const img = t.image as { width: number; height: number }
  const a = img.width / img.height
  if (a > 1) { t.repeat.set(1 / a, 1); t.offset.set((1 - 1 / a) / 2, 0) } else { t.repeat.set(1, a); t.offset.set(0, (1 - a) / 2) }
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
}

// The back of a print, written in pen: when and where it was taken.
// Drawn on a canvas the size of the whole back, in Daniel, a ballpoint hand that stays readable
const BACK_CW = 1024, BACK_CH = Math.round(BACK_CW * H / W)
function useBackNotes() {
  const notes = useMemo(() => PRINTS.map(() => {
    const c = document.createElement('canvas'); c.width = BACK_CW; c.height = BACK_CH
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return { canvas: c, texture: t }
  }), [])
  useEffect(() => {
    const fonts = [...new Set(PRINTS.flatMap(p => p.back ?? []).map(l => `${l.weight ?? 400} ${l.size}px "Daniel"`))]
    let tries = 0
    const id = setInterval(() => {
      fonts.forEach(f => document.fonts.load(f))
      if (!fonts.every(f => document.fonts.check(f)) && ++tries < 50) return
      clearInterval(id)
      PRINTS.forEach((p, i) => {
        if (!p.back) return
        const { canvas, texture } = notes[i]
        const g = canvas.getContext('2d')!
        g.clearRect(0, 0, BACK_CW, BACK_CH)
        g.save(); g.translate(BACK_CW / 2, BACK_CH / 2); g.rotate(-0.05); g.translate(-BACK_CW / 2, -BACK_CH / 2)
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.globalAlpha = 0.9
        p.back.forEach(l => {
          g.font = `${l.weight ?? 400} ${l.size}px "Daniel"`
          // a line too long for the print is written smaller, so it never runs off the edge
          const fit = Math.min(1, (BACK_CW * 0.84) / g.measureText(l.text).width)
          if (fit < 1) g.font = `${l.weight ?? 400} ${Math.floor(l.size * fit)}px "Daniel"`
          g.fillText(l.text, BACK_CW / 2, BACK_CH * l.y)
        })
        g.restore()
        texture.needsUpdate = true
      })
    }, 100)
    return () => clearInterval(id)
  }, [notes])
  return notes.map(n => n.texture)
}

// A stamp drawn as a die-cut sticker: the emoji with an even, rounded off-white edge all the way round.
// Made once per emoji and kept. How the edge is made:
//  1. the emoji is drawn centred by its real outline (emoji aren't centred in their own text box), on a canvas
//     with room to spare, so nothing gets cut off
//  2. its shape is made solid (emoji have soft, see-through fringes) and pushed outward all round by the edge width
//  3. that grown shape is blurred and then cut back to a hard line at half strength. Blurring rounds off the
//     points and fills the narrow gaps (between fingers, round a guitar's neck) the way a real sticker's cut does,
//     where a plain outline follows every nook and looks ragged
const stickerCache = new Map<string, { canvas: HTMLCanvasElement; n: number }>()
function stickerArt(emoji: string) {
  const hit = stickerCache.get(emoji)
  if (hit) return hit
  const edge = STAMP_PX * 0.085, n = Math.ceil(STAMP_PX * 1.7)
  const layer = () => { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d', { willReadFrequently: true })!] as const }

  const [glyph, gg] = layer()
  gg.font = `${STAMP_PX}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
  gg.textAlign = 'left'; gg.textBaseline = 'alphabetic'
  const m = gg.measureText(emoji)
  const gw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  gg.fillText(emoji, (n - gw) / 2 + m.actualBoundingBoxLeft, (n - gh) / 2 + m.actualBoundingBoxAscent)

  const [solid, sg] = layer() // the emoji's shape, fully opaque
  for (let i = 0; i < 4; i++) sg.drawImage(glyph, 0, 0)
  const [grown, wg] = layer() // ...pushed out by the edge width in every direction
  wg.drawImage(solid, 0, 0)
  for (let a = 0; a < 40; a++) wg.drawImage(solid, Math.cos(a / 40 * Math.PI * 2) * edge, Math.sin(a / 40 * Math.PI * 2) * edge)
  const [out, og] = layer() // ...blurred (drawn as a shadow of itself, which every browser can blur)
  og.shadowColor = '#000'; og.shadowBlur = edge * 1.5; og.shadowOffsetX = n * 3
  og.drawImage(grown, -n * 3, 0)
  og.shadowColor = 'transparent'
  // ...and cut back to a clean line, in the sticker's off-white
  const px = og.getImageData(0, 0, n, n), d = px.data
  for (let i = 0; i < d.length; i += 4) {
    const a = THREE.MathUtils.clamp((d[i + 3] / 255 - 0.44) / 0.12, 0, 1)
    d[i] = 251; d[i + 1] = 250; d[i + 2] = 247; d[i + 3] = a * 255
  }
  og.putImageData(px, 0, 0)
  og.drawImage(glyph, 0, 0)
  const made = { canvas: out, n }
  stickerCache.set(emoji, made)
  return made
}

// Your own handwriting on a print's bottom border: smoothed strokes that thin out a little when you move fast.
// One per print, so whatever you write stays on that print when you come back to it
function createInk() {
  const canvas = document.createElement('canvas'); canvas.width = INK_CW; canvas.height = INK_CH
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8
  let pen: { x: number; y: number; mx: number; my: number; w: number } | null = null
  // Stickers go on their own layer over the whole front (writing stays on the border). It's a big canvas, so it
  // starts as a single empty pixel and only becomes full size the first time this print gets a sticker
  const stickerCanvas = document.createElement('canvas'); stickerCanvas.width = stickerCanvas.height = 1
  const stickers = new THREE.CanvasTexture(stickerCanvas); stickers.colorSpace = THREE.SRGBColorSpace; stickers.anisotropy = 8
  return {
    texture,
    stickers,
    start(x: number, y: number) {
      const g = canvas.getContext('2d')!
      g.fillStyle = INK; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill()
      pen = { x, y, mx: x, my: y, w: 10 }
      texture.needsUpdate = true
    },
    move(x: number, y: number) {
      const p = pen
      if (!p) return
      const dist = Math.hypot(x - p.x, y - p.y)
      if (dist < 1.5) return
      const g = canvas.getContext('2d')!
      p.w += (THREE.MathUtils.clamp(13 - dist * 0.12, 7, 13) - p.w) * 0.35
      const mx = (p.x + x) / 2, my = (p.y + y) / 2
      g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = p.w; g.globalAlpha = 0.94
      g.beginPath(); g.moveTo(p.mx, p.my); g.quadraticCurveTo(p.x, p.y, mx, my); g.stroke()
      g.globalAlpha = 1
      pen = { x, y, mx, my, w: p.w }
      texture.needsUpdate = true
    },
    end() { pen = null },
    drawing: () => !!pen,
    // Stick an emoji down as a sticker (see stickerArt): a soft shadow under it, turned a little at random like it
    // was pressed on by hand. x, y are on the sticker layer (STK_CW x STK_CH, the whole front)
    stamp(x: number, y: number, emoji: string) {
      if (stickerCanvas.width !== STK_CW) { stickerCanvas.width = STK_CW; stickerCanvas.height = STK_CH; stickers.dispose() }
      const { canvas: sticker, n } = stickerArt(emoji)
      const g = stickerCanvas.getContext('2d')!
      const half = STAMP_PX * 0.6 // kept on the print, not hanging off its edge
      g.save()
      g.translate(THREE.MathUtils.clamp(x, half, STK_CW - half), THREE.MathUtils.clamp(y, half, STK_CH - half))
      g.rotate((Math.random() - 0.5) * 0.45)
      g.shadowColor = 'rgba(20, 16, 12, .34)'; g.shadowBlur = 12; g.shadowOffsetY = 5
      g.drawImage(sticker, -n / 2, -n / 2)
      g.restore()
      stickers.needsUpdate = true
    },
    // Copy this print's marks (writing on the border, stickers anywhere) onto a small canvas laid over a flat
    // picture of the print, w x h, as the all-photos grid shows them
    paint(g: CanvasRenderingContext2D, w: number, h: number) {
      g.clearRect(0, 0, w, h)
      const iw = INK_W / W * w, ih = INK_H / H * h
      g.drawImage(canvas, (w - iw) / 2, (0.5 - STRIP_Y / H) * h - ih / 2, iw, ih)
      if (stickerCanvas.width > 1) g.drawImage(stickerCanvas, 0, 0, w, h)
    },
    clear() {
      canvas.getContext('2d')!.clearRect(0, 0, INK_CW, INK_CH); texture.needsUpdate = true
      stickerCanvas.getContext('2d')!.clearRect(0, 0, stickerCanvas.width, stickerCanvas.height); stickers.needsUpdate = true
    },
  }
}

type Ink = ReturnType<typeof createInk>
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeIn = (p: number) => p * p * p
const easeOut = (p: number) => 1 - Math.pow(1 - p, 4)
const easeOutBack = (p: number) => 1 + 2.1 * Math.pow(p - 1, 3) + 1.1 * Math.pow(p - 1, 2) // overshoots a little, then settles

function Prints({ slot, mode, setMode, inks, index, dir, stamp, onReady, onClosed }: {
  slot: RefObject<HTMLElement | null>; mode: Mode; setMode: (m: Mode) => void; inks: Ink[]
  index: number; dir: RefObject<number>; stamp: RefObject<string | null>; onReady: () => void; onClosed: () => void
}) {
  const photos = useTexture(PRINTS.map(p => p.src))
  useMemo(() => photos.forEach(cover), [photos])
  const front = useMemo(() => paperTexture('#f2eee5'), [])
  const back = useMemo(() => paperTexture('#e6e1d6'), [])
  const notes = useBackNotes()

  const place = useRef<THREE.Group>(null!) // where it sits on screen and how big
  const root = useRef<THREE.Group>(null!) // float, sway and lean
  const holders = useRef<THREE.Group[]>([]) // each print's slide out / in when the photo changes
  const spins = useRef<THREE.Group[]>([]) // each print's turning
  const { size, camera, gl } = useThree()
  const writing = mode === 'write'
  const ready = useRef(false)
  const closing = useRef(false)

  const mouse = useRef({ x: -1e4, y: -1e4 })
  useEffect(() => {
    // only a mouse hovers: a finger's last position would otherwise leave the print "hovered" (leaning, never idle)
    const m = (e: PointerEvent) => { if (e.pointerType === 'mouse') { mouse.current.x = e.clientX; mouse.current.y = e.clientY } }
    addEventListener('pointermove', m, { passive: true })
    return () => removeEventListener('pointermove', m)
  }, [])
  const s = useRef({ dragging: false, moved: 0, lastX: 0, lastY: 0, lastT: 0, hover: false, pres: 0, tx: 0, ty: 0, open: 0, openV: 0, fy: 0, spun: false, idle: 0, peek: 0 })
  // each print's own turning (a print always arrives face up, even if it was left showing its back)
  const cards = useRef(PRINTS.map(() => ({ yaw: 0, vel: 0, pitch: 0 })))
  // Which print is showing, and the change in progress (if any): `from` slides out while `to` slides in
  const cur = useRef(index)
  const slide = useRef<{ from: number; to: number; dir: number; p: number } | null>(null)
  useEffect(() => {
    if (index === cur.current) return
    slide.current = { from: cur.current, to: index, dir: dir.current || 1, p: 0 }
    cur.current = index
    s.current.dragging = false
    cards.current[index].yaw = 0; cards.current[index].vel = 0; cards.current[index].pitch = 0 // arrives face up
  }, [index, dir])

  const onDown = (hit: number, e: ThreeEvent<PointerEvent>) => {
    // Mid-change, the print on its way out is the one under the cursor (the new one is still edge-on): a press
    // on it counts for the new one. Any other print isn't showing at all
    const i = cur.current
    if (hit !== i && hit !== slide.current?.from) return
    if ((e.nativeEvent.target as Element | null)?.closest?.('.p3d-roll')) return // the all-photos grid is open over it
    e.stopPropagation()
    if (writing) return
    if (slide.current) slide.current.p = 1 // still arriving: it lands now, so the click or drag isn't swallowed
    e.nativeEvent.preventDefault() // no text selection while dragging
    const st = s.current, c = cards.current[i]
    st.dragging = true; st.moved = 0; c.vel = 0
    st.lastX = e.clientX; st.lastY = e.clientY; st.lastT = performance.now()
    const move = (ev: PointerEvent) => {
      if (!st.dragging) return
      const dx = ev.clientX - st.lastX, dy = ev.clientY - st.lastY
      const now = performance.now(), dt = Math.max(8, now - st.lastT) / 1000
      st.lastX = ev.clientX; st.lastY = ev.clientY; st.lastT = now
      st.moved += Math.abs(dx) + Math.abs(dy)
      const k = 6 / Math.max(420, size.width) // a drag across most of the window is one full turn; on a phone, a thumb's sweep is half a turn
      c.yaw += dx * k
      c.vel = c.vel * 0.4 + (dx * k / dt) * 0.6
      c.pitch = THREE.MathUtils.clamp(c.pitch + dy * k * 0.6, -0.6, 0.6)
      if (!st.spun && st.moved > 5) st.spun = true // spun once: no more twist hints
    }
    const touch = e.nativeEvent.pointerType !== 'mouse'
    const done = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel) }
    const up = () => {
      done()
      if (!st.dragging) return // the photo was changed mid-drag
      st.dragging = false
      if (performance.now() - st.lastT > 80) c.vel = 0
      c.vel = THREE.MathUtils.clamp(c.vel, -18, 18)
      if (st.moved < (touch ? 12 : 5)) { c.vel = 0; setMode('write') } // a tap (a finger is never perfectly still)
    }
    // On a touch screen, a drag that turns out to be up-and-down is taken over by the browser to scroll the page
    // (the photo's slot allows that: touch-action pan-y). The press ends there: no spin, and it's not a tap
    const cancel = () => { done(); st.dragging = false; c.vel = 0 }
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', cancel)
  }

  // Presses on the open print land on one sheet over its whole front. With a stamp picked, a press anywhere
  // sticks it there. With the pen, only the bottom border takes ink: the press is worked out in the border's own
  // canvas, and one that starts on the photo does nothing
  const toInk = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return null
    const x = (e.uv.x - 0.5) * W, y = (e.uv.y - 0.5) * H // on the print, from its centre
    return [(x / INK_W + 0.5) * INK_CW, (1 - ((y - STRIP_Y) / INK_H + 0.5)) * INK_CH] as const
  }
  const frontDown = (i: number, e: ThreeEvent<PointerEvent>) => {
    if (!writing || i !== cur.current || !e.uv) return
    e.stopPropagation(); e.nativeEvent.preventDefault()
    if (stamp.current) { inks[i].stamp(e.uv.x * STK_CW, (1 - e.uv.y) * STK_CH, stamp.current); return } // one press, one sticker
    const p = toInk(e)
    if (!p || p[0] < 0 || p[0] > INK_CW || p[1] < 0 || p[1] > INK_CH) return
    inks[i].start(p[0], p[1])
    const up = () => { inks[i].end(); removeEventListener('pointerup', up); removeEventListener('pointercancel', up) }
    addEventListener('pointerup', up); addEventListener('pointercancel', up)
  }
  const frontMove = (i: number, e: ThreeEvent<PointerEvent>) => {
    if (!writing || !inks[i].drawing()) return
    const p = toInk(e); if (p) inks[i].move(p[0], p[1])
  }

  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, dt) => {
    const st = s.current, t = state.clock.elapsedTime
    const ease = (k: number) => 1 - Math.exp(-k * dt)
    const v = state.viewport.getCurrentViewport(camera, tmp.set(0, 0, 0))
    // Positions are measured against the canvas itself, wherever it is: at rest it's a box in the page around the
    // hero photo (so it scrolls with the page natively, no lag), while writing it covers the window.
    // World units per screen pixel, across and down, come from the canvas's size on screen right now. For a frame
    // after it switches between box and window, the picture is still drawn at the old size and stretched to the
    // new one (unevenly); measuring each direction separately keeps the print the right size and in the right
    // place through that frame instead of jumping
    const cr = gl.domElement.getBoundingClientRect()
    const ux = v.width / (cr.width || size.width), uy = v.height / (cr.height || size.height)

    // resting spot and size: the flat Polaroid's card in the hero (in pixels, from the canvas's centre)
    const el = slot.current
    let restX = 0, restY = 0, restPx = 300
    if (el) {
      const r = el.getBoundingClientRect()
      restX = r.left + r.width / 2 - (cr.left + cr.width / 2)
      restY = -(r.top + r.height / 2 - (cr.top + cr.height / 2))
      restPx = Math.min(r.height / H, r.width / W)
    }
    // Open: 80% of the window's height, or less in a narrow window, where it leaves room beside it for the tools.
    // On a phone-width screen (PHONE and under) there's no room beside it at all: it fills the width, sits higher,
    // and the tools go in a row under it (the CSS does the same switch at the same width)
    const phone = cr.width <= PHONE
    // (the phone numbers: 140px at the bottom is the tools row plus the Clear / Done bar; the print gets the rest)
    const bigPx = phone ? Math.min((cr.height - 176) / H, (cr.width - 28) / W) : Math.min((cr.height * 0.8) / H, Math.max(120, cr.width - 200) / W)
    const lift = phone ? 62 / cr.height : 0.035 // how far above the middle of the window the open print sits
    // Opening and closing ride one spring (a soft start, a quick middle, and it settles without a bounce), and
    // everything else about the move hangs off it: where the print is, how big, and how much of its resting
    // float, sway and lean are left. So it reads as one motion instead of several things easing separately
    const step = Math.min(dt, 1 / 30)
    st.openV += ((writing ? 1 : 0) - st.open) * 150 * step - st.openV * 24 * step
    st.open += st.openV * step
    const o = st.open
    const px2 = restPx * Math.pow(bigPx / restPx, o) // grows by proportion, so the size change looks even throughout
    place.current.position.set(restX * (1 - o) * ux, (restY * (1 - o) + cr.height * lift * o) * uy, 0)
    place.current.scale.set(px2 * ux, px2 * uy, px2 * uy)

    // Lean toward the cursor, measured from the card's own centre. "Hovering" is judged against the flat card's
    // fixed spot (plus a margin), not the tilting 3D print: otherwise leaning moves the print's edge out from
    // under the cursor, hover drops, it swings back, and it stutters. The lean fades in and out (st.pres)
    // instead of switching on at full strength
    let px = 0, py = 0
    st.hover = false
    if (el && !writing) {
      const r = el.getBoundingClientRect()
      px = (mouse.current.x - (r.left + r.width / 2)) / (r.width / 2)
      py = -(mouse.current.y - (r.top + r.height / 2)) / (r.height / 2)
      st.hover = Math.abs(px) < 1.12 && Math.abs(py) < 1.12
      px = THREE.MathUtils.clamp(px, -1, 1); py = THREE.MathUtils.clamp(py, -1, 1)
    }
    st.pres += ((st.hover && !st.dragging ? 1 : 0) - st.pres) * ease(3.5)
    st.tx += (-py * 0.09 * st.pres - st.tx) * ease(5)
    st.ty += (px * 0.2 * st.pres - st.ty) * ease(5)
    // hovering settles it slightly lower rather than lifting it, so it never crowds the nav bar above
    const rest = Math.max(0, 1 - o) // how much of the resting float, sway and lean applies (none once it's open)
    st.fy += (Math.sin(t * 1.1) * 0.012 - (st.dragging ? 0.02 : 0.02 * st.pres) - st.fy) * ease(5)
    root.current.position.y = st.fy * rest
    root.current.rotation.set(st.tx * rest, st.ty * rest, (Math.sin(t * 0.7) * 0.022 - 0.035) * rest)

    // Until someone spins it, the print twists to one side and back every few seconds while it's left alone,
    // hinting that it turns. The clock only runs while nothing is touching it, and starts over after a hover;
    // the twist itself is eased, so a hover arriving mid-twist settles it instead of snapping it straight
    const idle = !st.spun && !writing && !slide.current && !st.hover && !st.dragging
    st.idle = idle ? st.idle + dt : PEEK_FIRST - (PEEK_EVERY - PEEK_LEN) // after a hover: the long gap, not the quick first one
    const since = (st.idle - PEEK_FIRST) % PEEK_EVERY, pk = since / PEEK_LEN
    const want = st.idle > PEEK_FIRST && pk < 1 ? Math.sin(pk * Math.PI * 2) * Math.sin(pk * Math.PI) * 0.75 : 0
    st.peek += (want - st.peek) * ease(idle ? 30 : 7)
    const peek = st.peek

    const sl = slide.current
    if (sl) sl.p = clamp01(sl.p + Math.min(dt, 1 / 30) / SLIDE) // stepped per frame, so a dropped frame can't skip it
    const p = sl ? sl.p : 1
    if (sl && p >= 1) slide.current = null
    PRINTS.forEach((_, i) => {
      const c = cards.current[i], h = holders.current[i], sp = spins.current[i]
      if (!h || !sp) return
      // Changing photo, like prints on a carousel: the one showing slides off to the side while turning edge-on
      // (so it's gone by the time it would crowd anything); as it goes, the new one comes round from the other
      // side, edge-on at first, and turns to face you with a small settle. Nothing fades: it's all movement
      let x = 0, turn = 0, sc = 1, show = i === cur.current
      if (sl && p < 1 && i === sl.from) {
        const e = easeIn(clamp01(p / 0.5))
        x = -sl.dir * e * W * 0.42; turn = -sl.dir * e * Math.PI / 2; sc = 1 - e * 0.06; show = p < 0.5
      } else if (sl && p < 1 && i === sl.to) {
        const q = clamp01((p - 0.4) / 0.6), e = easeOut(q), back = easeOutBack(q)
        x = sl.dir * (1 - e) * W * 0.34; turn = sl.dir * (1 - back) * Math.PI / 2; sc = 0.94 + e * 0.06; show = q > 0
      }
      h.visible = show
      h.position.set(x, 0, 0)
      h.scale.setScalar(sc)

      if (i === cur.current && !(sl && p < 1)) {
        if (writing) {
          const f = Math.round(c.yaw / (Math.PI * 2)) * Math.PI * 2
          c.yaw += (f - c.yaw) * ease(7); c.vel = 0
          c.pitch += (0 - c.pitch) * ease(7)
        } else if (!st.dragging) {
          c.yaw += c.vel * dt
          c.vel *= Math.exp(-2.2 * dt)
          if (Math.abs(c.vel) < 1.2) {
            const snap = Math.round(c.yaw / Math.PI) * Math.PI
            c.yaw += (snap - c.yaw) * ease(6)
            c.vel *= Math.exp(-6 * dt)
          }
          c.pitch *= Math.exp(-4 * dt)
        }
      } else { c.vel = 0; c.pitch *= Math.exp(-6 * dt) }
      sp.rotation.set(c.pitch, c.yaw + turn + (i === cur.current ? peek : 0), 0)
    })

    // closing finished: hand the canvas back to the page
    if (!writing && Math.abs(st.open) < 0.002 && Math.abs(st.openV) < 0.02 && closing.current) { closing.current = false; onClosed() }
    if (writing) closing.current = true
    if (!ready.current) { ready.current = true; onReady() } // first frame drawn: the flat one can step aside
  })

  return (
    <group ref={place}>
      <group ref={root}>
        {PRINTS.map((p, i) => (
          <group key={p.src} ref={g => { if (g) holders.current[i] = g }} visible={i === 0}>
            <group ref={g => { if (g) spins.current[i] = g }} onPointerDown={e => onDown(i, e)}>
              <RoundedBox args={[W, H, D]} radius={0.006} smoothness={4}>
                <meshStandardMaterial map={front} roughness={0.92} metalness={0} />
              </RoundedBox>
              <mesh position={[0, PIC_Y, D / 2 + 0.0006]}>
                <planeGeometry args={[PIC, PIC]} />
                <meshPhysicalMaterial map={photos[i]} roughness={0.45} clearcoat={0.8} clearcoatRoughness={0.18} />
              </mesh>
              <mesh position={[0, STRIP_Y, D / 2 + 0.0008]}>
                <planeGeometry args={[INK_W, INK_H]} />
                <meshBasicMaterial map={inks[i].texture} transparent depthWrite={false} toneMapped={false} />
              </mesh>
              {/* the sticker layer, over the whole front; it's also the sheet that takes the presses while open */}
              <mesh position={[0, 0, D / 2 + 0.0012]} renderOrder={1} onPointerDown={e => frontDown(i, e)} onPointerMove={e => frontMove(i, e)}>
                <planeGeometry args={[W, H]} />
                <meshBasicMaterial map={inks[i].stickers} transparent depthWrite={false} toneMapped={false} />
              </mesh>
              <mesh position={[0, 0, -D / 2 - 0.0006]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[W - 0.004, H - 0.004]} />
                <meshStandardMaterial map={back} roughness={0.95} />
              </mesh>
              {p.back && (
                <mesh position={[0, 0, -D / 2 - 0.0009]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[W - 0.004, H - 0.004]} />
                  <meshBasicMaterial map={notes[i]} transparent depthWrite={false} toneMapped={false} />
                </mesh>
              )}
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function Polaroid3D({ slot, onReady }: { slot: RefObject<HTMLElement | null>; onReady: () => void }) {
  const [mode, setMode] = useState<Mode>('rest')
  const inks = useMemo(() => PRINTS.map(createInk), [])
  const [index, setIndex] = useState(0) // which photo is showing
  const dir = useRef(1) // which arrow was pressed last: 1 next, -1 previous
  const go = (d: number) => { dir.current = d; setIndex(i => (i + d + PRINTS.length) % PRINTS.length) }
  // The film roll under the print opens every photo at once, as a grid of prints over the page; picking one
  // closes it and brings that print up
  const [roll, setRoll] = useState(false)
  // Each print in the grid has a small canvas over it carrying that print's writing and stickers, copied across
  // every time the grid opens
  const marks = useRef<(HTMLCanvasElement | null)[]>([])
  useEffect(() => {
    if (!roll) return
    marks.current.forEach((c, i) => {
      if (!c) return
      c.width = 520; c.height = Math.round(520 * H / W)
      inks[i].paint(c.getContext('2d')!, c.width, c.height)
    })
  }, [roll, inks])
  const pick = (i: number) => { setRoll(false); if (i !== index) { dir.current = i > index ? 1 : -1; setIndex(i) } }
  const ink = inks[index]
  // What a press on the open print's border does: null = write with the pen, otherwise stick that stamp down
  const [tool, setTool] = useState<string | null>(null)
  const stamp = useRef<string | null>(null)
  stamp.current = tool
  const writing = mode === 'write'
  const [full, setFull] = useState(false) // canvas covers the window (writing, and while it shrinks back)
  const openedAt = useRef(0)
  const open = useCallback((m: Mode) => { if (m === 'write') { setFull(true); openedAt.current = performance.now() } setMode(m) }, [])
  const close = useCallback(() => { ink.end(); setMode('rest') }, [ink])

  // At rest the canvas is a box in the page, so it scrolls exactly with the page. The box is the size of the window,
  // centred on the photo top to bottom: the same size the canvas is when a print is open and it's pinned to the
  // window. So opening and closing never resize the canvas (resizing it used to blur and jolt the print for a few
  // frames); it only changes from riding the page to being pinned
  const [box, setBox] = useState<{ top: number; width: number; height: number }>({ top: 0, width: 0, height: 0 })
  const [nav, setNav] = useState<CSSProperties>({}) // the arrows, centred under the print
  useLayoutEffect(() => {
    const el = slot.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      // the page's width, not the window's, so it never adds sideways scrolling
      const width = document.documentElement.clientWidth, height = innerHeight
      setBox({ top: r.top + scrollY + r.height / 2 - height / 2, width, height })
      setNav({ left: r.left + scrollX, top: r.bottom + scrollY + 22, width: r.width })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el); ro.observe(document.body)
    addEventListener('resize', measure)
    return () => { ro.disconnect(); removeEventListener('resize', measure) }
  }, [slot])

  // While a print or the grid is open: Esc closes it, and the page behind can't scroll
  useEffect(() => {
    if (!writing && !roll) return
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (roll) setRoll(false); else close() } }
    const html = document.documentElement, prev = html.style.overflow
    html.style.overflow = 'hidden'
    addEventListener('keydown', key)
    return () => { removeEventListener('keydown', key); html.style.overflow = prev }
  }, [writing, roll, close])

  // Only draw while the hero is on screen (or while writing), so it costs nothing further down the page
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = slot.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [slot])

  return createPortal(
    <>
      <div
        className={`p3d-backdrop${writing ? ' is-open' : ''}`}
        aria-hidden
        // with a stamp picked, the cursor is that stamp, so you can see what you're about to stick down
        style={writing && tool ? { cursor: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><text x='28' y='43' font-size='42' text-anchor='middle'>${tool}</text></svg>`)}") 28 28, crosshair` } : undefined}
      />
      <div
        className={`p3d-stage${full ? ' is-open' : ''}`}
        style={{ position: full ? 'fixed' : 'absolute', left: 0, top: full ? 0 : box.top, width: box.width, height: box.height }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 24 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          frameloop={visible || full ? 'always' : 'never'}
          eventSource={document.body}
          // map the cursor using where the canvas actually is right now (it isn't always the whole window)
          onCreated={state => { state.setEvents({
            compute: (event, st) => {
              const r = st.gl.domElement.getBoundingClientRect()
              st.pointer.set(((event.clientX - r.left) / r.width) * 2 - 1, -((event.clientY - r.top) / r.height) * 2 + 1)
              st.raycaster.setFromCamera(st.pointer, st.camera)
            },
          }) }}
          // a click that misses the print closes it (but not clicks on the Clear / Done bar or the tools)
          onPointerMissed={e => {
            // ignore the click that opened it (it lands while the canvas is resizing to full screen)
            if (performance.now() - openedAt.current < 400) return
            if (writing && !(e.target as Element | null)?.closest?.('.p3d-hud, .p3d-tools')) close()
          }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[2.5, 3, 4]} intensity={1.6} />
          <Environment resolution={256}>
            <Lightformer intensity={3} position={[0, 2, 3]} scale={[4, 1.2, 1]} />
            <Lightformer intensity={0.8} position={[-3, 0, 1]} rotation-y={Math.PI / 2} scale={[3, 2, 1]} />
            <Lightformer intensity={0.6} position={[3, -1, 1]} rotation-y={-Math.PI / 2} scale={[3, 2, 1]} />
          </Environment>
          <Prints slot={slot} mode={mode} setMode={open} inks={inks} index={index} dir={dir} stamp={stamp} onReady={onReady} onClosed={() => setFull(false)} />
        </Canvas>
      </div>
      {/* Under the print: hand-drawn arrows to the previous / next photo, with a roll of film between them that opens all of them (which photo is showing is only read out to screen readers) */}
      {PRINTS.length > 1 && (
        <div className="p3d-nav" style={nav}>
          <button type="button" aria-label="Previous photo" onClick={() => go(-1)}>
            <svg viewBox="0 0 34 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M31 11c-8-2-17-2-27-1" /><path d="M11 4c-3 2-5 4-7 6 3 2 5 3 8 6" />
            </svg>
          </button>
          {/* between the arrows: a strip of film that opens every photo at once */}
          <button type="button" className="p3d-nav-roll" aria-label="See all the photos" aria-haspopup="dialog" onClick={() => setRoll(true)}>
<svg viewBox="0 0 40 34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {/* The film-strip icon Christopher picked, redrawn by hand to sit with the arrows: the lines overshoot
                  their corners and wobble. Frame, the two bands, the divider between frames, the sprocket holes */}
              <path d="M4.900 6.300c10-.800 20.100-.700 30.100.200M34.500 5.600c.700 7.500.600 15.100-.300 22.600M35.100 27.900c-10 .800-20 .800-30-.100M5.600 28.700c-.800-7.600-.800-15.300.100-22.900" />
              <path d="M5.500 11.400c9.700-.600 19.400-.500 29.100.300M5.300 22.900c9.800.600 19.500.600 29.200-.200" />
              <path d="M20.100 11.500c-.400 3.800-.300 7.600.200 11.400" />
              <path d="M12.500 6.400l.100 4.700M20 6.200l.200 4.900M27.600 6.400l-.100 4.900M12.600 23.200l-.100 4.700M20.200 23.300l.100 4.800M27.700 23.100l.100 4.800" />
            </svg>
          </button>
          <span className="p3d-sr" aria-live="polite">Photo {index + 1} of {PRINTS.length}</span>
          <button type="button" aria-label="Next photo" onClick={() => go(1)}>
            <svg viewBox="0 0 34 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 11c8-2 17-2 27-1" /><path d="M23 4c3 2 5 4 7 6-3 2-5 3-8 6" />
            </svg>
          </button>
        </div>
      )}
      {/* Every photo at once: a grid of prints over the whole page. Picking one brings that print up in the hero */}
      <div className={`p3d-roll${roll ? ' is-open' : ''}`} inert={!roll} role="dialog" aria-modal="true" aria-label="All the photos" onClick={() => setRoll(false)}>
        <ul>
          {PRINTS.map((p, i) => (
            <li key={p.src} style={{ '--i': i, '--tilt': `${ROLL_TILT[i % ROLL_TILT.length]}deg` } as CSSProperties}>
              <button type="button" aria-label={`${p.alt}. Show this photo`} aria-current={i === index || undefined} onClick={e => { e.stopPropagation(); pick(i) }}>
                <span><img src={p.src} alt="" loading="lazy" decoding="async" draggable={false} /></span>
                <canvas ref={c => { marks.current[i] = c }} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="p3d-roll-close" onClick={() => setRoll(false)}>Close</button>
      </div>
      {/* Open: tools down the left of the print (the pen, then stamps to stick on the border) and the Clear / Done bar
          under it. Both stay in the page and slide in and out with the print, instead of popping */}
      {(
        <div className={`p3d-tools${writing ? ' is-open' : ''}`} inert={!writing} role="toolbar" aria-label="Pen and stamps" aria-orientation="vertical">
          <button type="button" className={tool ? undefined : 'is-on'} aria-pressed={!tool} aria-label="Pen" onClick={() => setTool(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 20l1-4.5L16.5 4a2.1 2.1 0 013 3L8 18.5 4 20z" /><path d="M14.5 6l3 3" />
            </svg>
          </button>
          <span className="p3d-tools-rule" aria-hidden />
          {STAMPS.map(e => (
            <button key={e} type="button" className={tool === e ? 'is-on' : undefined} aria-pressed={tool === e} aria-label={`Stamp ${e}`} onClick={() => setTool(e)}>
              <span aria-hidden>{e}</span>
            </button>
          ))}
        </div>
      )}
      {(
        <div className={`p3d-hud${writing ? ' is-open' : ''}`} inert={!writing} role="dialog" aria-label="Write on the Polaroid">
          <span>{tool ? (TOUCH ? 'Tap it to stick it down' : 'Click anywhere on it to stick it down') : (TOUCH ? 'Draw on the bottom' : 'Write on the bottom with your cursor')}</span>
          <button type="button" className="is-ghost" onClick={ink.clear}>Clear</button>
          <button type="button" onClick={close}>Done</button>
        </div>
      )}
    </>,
    document.body,
  )
}
