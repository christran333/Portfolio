import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import * as THREE from 'three'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, useTexture } from '@react-three/drei'

// The hero Polaroid as a real 3D print (built in polaroid-lab, then moved here).
// - Resting, it sits exactly where the flat Polaroid is in the hero (it reads that element's position every frame,
//   so it scrolls with the page), floats a little, and leans toward the cursor.
// - Drag to spin it; flick it and it keeps turning, then settles on whichever side faces you. The back has the date.
// - Click it and it comes up big in the middle of the screen so you can write on the bottom border with the cursor.
//   Done, Esc, or clicking off it puts it back, with your writing still on it.
// Only loaded on desktops (see Work.tsx); phones and reduced motion keep the flat version.

// Real instant-film proportions (88 x 107 mm print, 79 x 79 mm picture), in scene units of 10 cm
const W = 0.88, H = 1.07, D = 0.014
const PIC = 0.79, SIDE = 0.045
const PIC_Y = H / 2 - SIDE - PIC / 2
const STRIP_H = H - SIDE - PIC
const STRIP_Y = -H / 2 + STRIP_H / 2
const INK_W = W * 0.94, INK_H = STRIP_H * 0.9
const INK_CW = 1600, INK_CH = Math.round(INK_CW * INK_H / INK_W)

const TAKEN = '10/24/2026' // when the photo was taken, written on the back
const INK = '#23242b'

type Mode = 'rest' | 'write'

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

// The date on the back in a Sharpie-style font (in Rock Salt a "/" reads like a "1")
function useBackDate() {
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 256; return c }, [])
  const texture = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }, [canvas])
  useEffect(() => {
    const font = '120px "Permanent Marker"'
    let tries = 0
    const id = setInterval(() => {
      document.fonts.load(font)
      if (!document.fonts.check(font) && ++tries < 50) return
      clearInterval(id)
      const g = canvas.getContext('2d')!
      g.clearRect(0, 0, 1024, 256)
      g.save(); g.translate(512, 128); g.rotate(-0.06)
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK
      g.fillText(TAKEN, 0, 0); g.restore()
      texture.needsUpdate = true
    }, 100)
    return () => clearInterval(id)
  }, [canvas, texture])
  return texture
}

// Your own handwriting on the bottom border: smoothed strokes that thin out a little when you move fast
function useInk() {
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width = INK_CW; c.height = INK_CH; return c }, [])
  const texture = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }, [canvas])
  const pen = useRef<{ x: number; y: number; mx: number; my: number; w: number } | null>(null)
  return useMemo(() => ({
    texture,
    start(x: number, y: number) {
      const g = canvas.getContext('2d')!
      g.fillStyle = INK; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill()
      pen.current = { x, y, mx: x, my: y, w: 10 }
      texture.needsUpdate = true
    },
    move(x: number, y: number) {
      const p = pen.current
      if (!p) return
      const dist = Math.hypot(x - p.x, y - p.y)
      if (dist < 1.5) return
      const g = canvas.getContext('2d')!
      p.w += (THREE.MathUtils.clamp(13 - dist * 0.12, 7, 13) - p.w) * 0.35
      const mx = (p.x + x) / 2, my = (p.y + y) / 2
      g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = p.w; g.globalAlpha = 0.94
      g.beginPath(); g.moveTo(p.mx, p.my); g.quadraticCurveTo(p.x, p.y, mx, my); g.stroke()
      g.globalAlpha = 1
      pen.current = { x, y, mx, my, w: p.w }
      texture.needsUpdate = true
    },
    end() { pen.current = null },
    drawing: () => !!pen.current,
    clear() { canvas.getContext('2d')!.clearRect(0, 0, INK_CW, INK_CH); texture.needsUpdate = true },
  }), [canvas, texture])
}

type Ink = ReturnType<typeof useInk>

function Print({ slot, mode, setMode, ink, onReady, onClosed }: { slot: RefObject<HTMLElement | null>; mode: Mode; setMode: (m: Mode) => void; ink: Ink; onReady: () => void; onClosed: () => void }) {
  const photo = useTexture('/about/hero-night.jpg')
  photo.colorSpace = THREE.SRGBColorSpace
  photo.anisotropy = 8
  const front = useMemo(() => paperTexture('#f2eee5'), [])
  const back = useMemo(() => paperTexture('#e6e1d6'), [])
  const date = useBackDate()

  const place = useRef<THREE.Group>(null!) // where it sits on screen and how big
  const root = useRef<THREE.Group>(null!) // float and sway
  const spin = useRef<THREE.Group>(null!) // turning
  const { size, camera, gl } = useThree()
  const writing = mode === 'write'
  const ready = useRef(false)
  const closing = useRef(false)

  const mouse = useRef({ x: -1e4, y: -1e4 })
  useEffect(() => {
    const m = (e: PointerEvent) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY }
    addEventListener('pointermove', m, { passive: true })
    return () => removeEventListener('pointermove', m)
  }, [])
  const s = useRef({ yaw: 0, vel: 0, pitch: 0, dragging: false, moved: 0, lastX: 0, lastY: 0, lastT: 0, hover: false, tx: 0, ty: 0, open: 0 })

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (writing) return
    e.nativeEvent.preventDefault() // no text selection while dragging
    const st = s.current
    st.dragging = true; st.moved = 0; st.vel = 0
    st.lastX = e.clientX; st.lastY = e.clientY; st.lastT = performance.now()
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - st.lastX, dy = ev.clientY - st.lastY
      const now = performance.now(), dt = Math.max(8, now - st.lastT) / 1000
      st.lastX = ev.clientX; st.lastY = ev.clientY; st.lastT = now
      st.moved += Math.abs(dx) + Math.abs(dy)
      const k = 6 / Math.max(900, size.width)
      st.yaw += dx * k
      st.vel = st.vel * 0.4 + (dx * k / dt) * 0.6
      st.pitch = THREE.MathUtils.clamp(st.pitch + dy * k * 0.6, -0.6, 0.6)
    }
    const up = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up)
      st.dragging = false
      if (performance.now() - st.lastT > 80) st.vel = 0
      st.vel = THREE.MathUtils.clamp(st.vel, -18, 18)
      if (st.moved < 5) { st.vel = 0; setMode('write') }
    }
    addEventListener('pointermove', move); addEventListener('pointerup', up)
  }

  const toInk = (e: ThreeEvent<PointerEvent>) => e.uv && [e.uv.x * INK_CW, (1 - e.uv.y) * INK_CH] as const
  const inkDown = (e: ThreeEvent<PointerEvent>) => {
    if (!writing) return
    e.stopPropagation(); e.nativeEvent.preventDefault()
    const p = toInk(e); if (!p) return
    ink.start(p[0], p[1])
    const up = () => { ink.end(); removeEventListener('pointerup', up) }
    addEventListener('pointerup', up)
  }
  const inkMove = (e: ThreeEvent<PointerEvent>) => {
    if (!writing || !ink.drawing()) return
    const p = toInk(e); if (p) ink.move(p[0], p[1])
  }

  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, dt) => {
    const st = s.current, t = state.clock.elapsedTime
    const ease = (k: number) => 1 - Math.exp(-k * dt)
    const v = state.viewport.getCurrentViewport(camera, tmp.set(0, 0, 0))
    // Positions are measured against the canvas itself, wherever it is: at rest it's a box in the page around the
    // hero photo (so it scrolls with the page natively, no lag), while writing it covers the window
    const cr = gl.domElement.getBoundingClientRect()
    const u = v.height / (cr.height || size.height) // world units per pixel at the card's depth

    // resting spot and size: the flat Polaroid's card in the hero
    const el = slot.current
    let restX = 0, restY = 0, restS = 1
    if (el) {
      const r = el.getBoundingClientRect()
      restX = (r.left + r.width / 2 - (cr.left + cr.width / 2)) * u
      restY = -(r.top + r.height / 2 - (cr.top + cr.height / 2)) * u
      restS = Math.min(r.height / H, r.width / W) * u
    }
    const bigS = Math.min((v.height * 0.8) / H, (v.width * 0.9) / W)
    st.open += ((writing ? 1 : 0) - st.open) * ease(6)
    const o = st.open
    place.current.position.set(restX * (1 - o), restY * (1 - o) + v.height * 0.035 * o, 0)
    place.current.scale.setScalar(restS + (bigS - restS) * o)

    if (writing) {
      const front = Math.round(st.yaw / (Math.PI * 2)) * Math.PI * 2
      st.yaw += (front - st.yaw) * ease(7); st.vel = 0
      st.pitch += (0 - st.pitch) * ease(7)
    } else if (!st.dragging) {
      st.yaw += st.vel * dt
      st.vel *= Math.exp(-2.2 * dt)
      if (Math.abs(st.vel) < 1.2) {
        const snap = Math.round(st.yaw / Math.PI) * Math.PI
        st.yaw += (snap - st.yaw) * ease(6)
        st.vel *= Math.exp(-6 * dt)
      }
      st.pitch *= Math.exp(-4 * dt)
    }
    // lean toward the cursor, measured from the card's own centre
    const lean = st.hover && !st.dragging && !writing && el
    let px = 0, py = 0
    if (lean) {
      const r = el.getBoundingClientRect()
      px = THREE.MathUtils.clamp((mouse.current.x - (r.left + r.width / 2)) / (r.width / 2), -1, 1)
      py = THREE.MathUtils.clamp(-(mouse.current.y - (r.top + r.height / 2)) / (r.height / 2), -1, 1)
    }
    st.tx += ((lean ? -py * 0.1 : 0) - st.tx) * ease(8)
    st.ty += ((lean ? px * 0.22 : 0) - st.ty) * ease(8)
    spin.current.rotation.set(st.pitch + st.tx, st.yaw + st.ty, 0)

    // hovering settles it slightly lower rather than lifting it, so it never crowds the nav bar above
    const y = writing ? 0 : Math.sin(t * 1.1) * 0.012 - (st.hover || st.dragging ? 0.02 : 0)
    root.current.position.y += (y - root.current.position.y) * ease(5)
    const z = writing ? 0 : Math.sin(t * 0.7) * 0.022 - 0.035
    root.current.rotation.z += (z - root.current.rotation.z) * ease(5)

    // closing finished: hand the canvas back to the page
    if (!writing && st.open < 0.004 && closing.current) { closing.current = false; onClosed() }
    if (writing) closing.current = true
    if (!ready.current) { ready.current = true; onReady() } // first frame drawn: the flat one can step aside
  })

  return (
    <group ref={place}>
      <group ref={root}>
        <group
          ref={spin}
          onPointerDown={onDown}
          onPointerOver={() => { s.current.hover = true }}
          onPointerOut={() => { s.current.hover = false }}
        >
          <RoundedBox args={[W, H, D]} radius={0.006} smoothness={4}>
            <meshStandardMaterial map={front} roughness={0.92} metalness={0} />
          </RoundedBox>
          <mesh position={[0, PIC_Y, D / 2 + 0.0006]}>
            <planeGeometry args={[PIC, PIC]} />
            <meshPhysicalMaterial map={photo} roughness={0.45} clearcoat={0.8} clearcoatRoughness={0.18} />
          </mesh>
          <mesh position={[0, STRIP_Y, D / 2 + 0.0008]} onPointerDown={inkDown} onPointerMove={inkMove}>
            <planeGeometry args={[INK_W, INK_H]} />
            <meshBasicMaterial map={ink.texture} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -D / 2 - 0.0006]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[W - 0.004, H - 0.004]} />
            <meshStandardMaterial map={back} roughness={0.95} />
          </mesh>
          <mesh position={[0, -0.02, -D / 2 - 0.0009]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[W * 0.8, W * 0.2]} />
            <meshBasicMaterial map={date} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export default function Polaroid3D({ slot, onReady }: { slot: RefObject<HTMLElement | null>; onReady: () => void }) {
  const [mode, setMode] = useState<Mode>('rest')
  const ink = useInk()
  const writing = mode === 'write'
  const [full, setFull] = useState(false) // canvas covers the window (writing, and while it shrinks back)
  const openedAt = useRef(0)
  const open = useCallback((m: Mode) => { if (m === 'write') { setFull(true); openedAt.current = performance.now() } setMode(m) }, [])
  const close = useCallback(() => { ink.end(); setMode('rest') }, [ink])

  // At rest the canvas is a box in the page around the photo, with room on every side for the spin and lean.
  // Being part of the page, it scrolls exactly with it
  const [box, setBox] = useState<CSSProperties>({})
  useLayoutEffect(() => {
    const el = slot.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const m = r.height * 0.35
      // kept inside the page's width, so it never adds sideways scrolling
      const pageW = document.documentElement.clientWidth
      const left = Math.max(0, r.left + scrollX - m), right = Math.min(pageW, r.right + scrollX + m)
      setBox({ position: 'absolute', left, top: r.top + scrollY - m, width: right - left, height: r.height + m * 2 })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el); ro.observe(document.body)
    addEventListener('resize', measure)
    return () => { ro.disconnect(); removeEventListener('resize', measure) }
  }, [slot])

  // While writing: Esc closes, and the page behind can't scroll
  useEffect(() => {
    if (!writing) return
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const html = document.documentElement, prev = html.style.overflow
    html.style.overflow = 'hidden'
    addEventListener('keydown', key)
    return () => { removeEventListener('keydown', key); html.style.overflow = prev }
  }, [writing, close])

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
      <div className={`p3d-backdrop${writing ? ' is-open' : ''}`} aria-hidden />
      <div className={`p3d-stage${full ? ' is-open' : ''}`} style={full ? undefined : box}>
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
          // a click that misses the print closes it (but not clicks on the Clear / Done bar)
          onPointerMissed={e => {
            // ignore the click that opened it (it lands while the canvas is resizing to full screen)
            if (performance.now() - openedAt.current < 400) return
            if (writing && !(e.target as Element | null)?.closest?.('.p3d-hud')) close()
          }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[2.5, 3, 4]} intensity={1.6} />
          <Environment resolution={256}>
            <Lightformer intensity={3} position={[0, 2, 3]} scale={[4, 1.2, 1]} />
            <Lightformer intensity={0.8} position={[-3, 0, 1]} rotation-y={Math.PI / 2} scale={[3, 2, 1]} />
            <Lightformer intensity={0.6} position={[3, -1, 1]} rotation-y={-Math.PI / 2} scale={[3, 2, 1]} />
          </Environment>
          <Print slot={slot} mode={mode} setMode={open} ink={ink} onReady={onReady} onClosed={() => setFull(false)} />
        </Canvas>
      </div>
      {writing && (
        <div className="p3d-hud" role="dialog" aria-label="Write on the Polaroid">
          <span>Write on the bottom with your cursor</span>
          <button type="button" className="is-ghost" onClick={ink.clear}>Clear</button>
          <button type="button" onClick={close}>Done</button>
        </div>
      )}
    </>,
    document.body,
  )
}
