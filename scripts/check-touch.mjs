// Touch check for the hero Polaroid: the same 3D print phones and tablets get, driven with real touch events.
//   node scripts/check-touch.mjs [url] [screenshot-folder]     (default http://localhost:5173, no screenshots)
// On four phone sizes and a tablet it checks that: an up-and-down swipe starting on the photo still scrolls the
// page (and doesn't open the print), a sideways drag spins it, the arrows change photo, a tap opens it, the open
// print with its tools row and Clear / Done bar all fit without overlapping, a finger can draw and stick stamps,
// Done closes it, and the film-strip grid opens, fits, and picks a photo. One line per size; exits 1 on a problem.
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '')
const OUT = process.argv[3]
if (OUT) mkdirSync(OUT, { recursive: true })
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9800 + Math.floor(Math.random() * 150)
const profile = mkdtempSync(join(tmpdir(), 'check-touch-'))
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' })
const wait = ms => new Promise(r => setTimeout(r, ms))
let ws, id = 0
const pend = new Map(), errs = []
for (let i = 0; i < 50 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl) } catch { /* not up yet */ } await wait(200) }
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id) } if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text) }
if (ws.readyState !== 1) await new Promise(r => (ws.onopen = r))
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.value
await send('Runtime.enable')

const H = 1.07, W = 0.88
const rect = sel => ev(`(() => { const e = document.querySelector('${sel}'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] })()`)
const mid = async sel => { const r = await rect(sel); return r && [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2] }
const hit = (a, b) => a && b && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]
const touch = (type, pts) => send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y })) })
const tap = async ([x, y]) => { await touch('touchStart', [[x, y]]); await wait(40); await touch('touchEnd', []) ; await wait(60) }
const drag = async (x0, y0, x1, y1, steps = 10) => { await touch('touchStart', [[x0, y0]]); for (let i = 1; i <= steps; i++) { await touch('touchMove', [[x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps]]); await wait(20) } await touch('touchEnd', []) }
let bad = 0
for (const [w, h] of [[390, 844], [375, 667], [360, 740], [430, 932], [820, 1180]]) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  await send('Page.navigate', { url: BASE + '/' }); await wait(3000)
  for (let i = 0; i < 40 && !await ev(`!!document.querySelector('.polaroid.is-ghost')`); i++) await wait(250) // the 3D print is a separate download
  await wait(1500)
  const shot = async n => { if (!OUT) return; const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70, clip: { x: 0, y: await ev('scrollY'), width: w, height: h, scale: 1 } }); writeFileSync(`${OUT}/${w}x${h}-${n}.jpg`, Buffer.from(r.data, 'base64')) }
  const issues = []
  if (!await ev(`!!document.querySelector('.polaroid.is-ghost')`)) issues.push('3D not active')
  if (await ev('document.documentElement.scrollWidth') > w) issues.push('sideways scroll')
  await ev(`document.querySelector('.polaroid-card').scrollIntoView({ block: 'center' })`); await wait(500)
  let card = await rect('.polaroid-card'); const nav = await rect('.p3d-nav')
  if (nav && (nav[0] < 0 || nav[2] > w)) issues.push('arrows off screen')
  await shot('1-rest')
  const c = [(card[0] + card[2]) / 2, (card[1] + card[3]) / 2]
  // an up-and-down swipe that starts on the photo still scrolls the page, and doesn't open the print
  const y0 = await ev('scrollY')
  await send('Input.synthesizeScrollGesture', { x: c[0], y: c[1], yDistance: -160, speed: 900, gestureSourceType: 'touch' }); await wait(500)
  const y1 = await ev('scrollY')
  if (Math.abs(y1 - y0) < 60) issues.push(`a swipe on the photo did not scroll the page (${y0} -> ${y1})`)
  if (await ev(`document.querySelector('.p3d-hud').classList.contains('is-open')`)) issues.push('a scroll swipe opened the print')
  await ev(`document.querySelector('.polaroid-card').scrollIntoView({ block: 'center' })`); await wait(500)
  card = await rect('.polaroid-card'); c[0] = (card[0] + card[2]) / 2; c[1] = (card[1] + card[3]) / 2
  // a sideways drag spins it to its back
  await drag(c[0] + 90, c[1], c[0] - 110, c[1]); await wait(1500); await shot('2-spun')
  await drag(c[0] - 90, c[1], c[0] + 110, c[1]); await wait(1300)
  // next arrow
  await tap(await ev(`(() => { const b = document.querySelectorAll('.p3d-nav button'), r = b[b.length - 1].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)); await wait(1200)
  const now = await ev(`document.querySelector('.p3d-sr').textContent`)
  if (!/^Photo 2 /.test(now)) issues.push('next arrow: ' + now)
  // tap opens it
  await tap(c); await wait(1500)
  if (!await ev(`document.querySelector('.p3d-hud').classList.contains('is-open')`)) issues.push('tap did not open the print')
  const phone = w <= 640
  const px = phone ? Math.min((h - 176) / H, (w - 28) / W) : Math.min(h * 0.8 / H, Math.max(120, w - 200) / W), cw = px * W, ch = px * H, cy = h / 2 - (phone ? 62 : h * 0.035)
  const big = [Math.round(w / 2 - cw / 2), Math.round(cy - ch / 2), Math.round(w / 2 + cw / 2), Math.round(cy + ch / 2)]
  const tools = await rect('.p3d-tools'), hud = await rect('.p3d-hud')
  if (hit(tools, big)) issues.push(`tools overlap the open print (tools ${tools}, print ${big})`)
  if (hit(hud, big)) issues.push(`bottom bar overlaps the open print (bar ${hud}, print ${big})`)
  if (hit(hud, tools)) issues.push(`tools overlap the bottom bar (tools ${tools}, bar ${hud})`)
  if (tools && (tools[0] < 0 || tools[2] > w || tools[1] < 0 || tools[3] > h)) issues.push('tools off screen ' + tools)
  if (hud && (hud[0] < 0 || hud[2] > w || hud[3] > h)) issues.push('bottom bar off screen ' + hud)
  if (big[0] < 0 || big[1] < 0) issues.push('open print off screen ' + big)
  // draw on the border with a finger; the page must not scroll under it
  const sy = cy + ch * 0.39
  await drag(w / 2 - cw * 0.35, sy, w / 2 - cw * 0.05, sy - 10, 12)
  // stamps: second and sixth tool
  const tb = n => ev(`(() => { const b = document.querySelectorAll('.p3d-tools button')[${n}]; b.scrollIntoView({ inline: 'center', block: 'nearest' }); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
  await tap(await tb(2)); await tap([w / 2, cy - ch * 0.2]); await tap(await tb(6)); await tap([w / 2 + cw * 0.25, sy])
  await wait(400); await shot('3-open')
  // Done closes it
  await tap(await ev(`(() => { const b = document.querySelectorAll('.p3d-hud button'), r = b[b.length - 1].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)); await wait(1500)
  if (await ev(`document.querySelector('.p3d-hud').classList.contains('is-open')`)) issues.push('Done did not close it')
  await shot('4-closed')
  // the film-strip grid
  await tap(await mid('.p3d-nav-roll')); await wait(1400)
  const g = await ev(`(() => { const d = document.querySelector('.p3d-roll'), u = d.querySelector('ul').getBoundingClientRect(); return { open: d.classList.contains('is-open'), left: u.left, right: u.right } })()`)
  if (!g.open) issues.push('grid did not open'); if (g.left < 0 || g.right > w) issues.push('grid wider than the screen')
  await shot('5-grid')
  await tap(await mid('.p3d-roll li:nth-child(4) button')); await wait(1400)
  const after = await ev(`({ grid: document.querySelector('.p3d-roll').classList.contains('is-open'), write: document.querySelector('.p3d-hud').classList.contains('is-open'), now: document.querySelector('.p3d-sr').textContent })`)
  if (after.grid || after.write || !/^Photo 4 /.test(after.now)) issues.push('picking from the grid: ' + JSON.stringify(after))
  bad += issues.length
  console.log(`${issues.length ? 'FAIL' : 'PASS'}  touch at ${w}x${h}${issues.length ? '  (' + issues.join('; ') + ')' : ''}`)
}
if (errs.length) { bad += errs.length; console.log('FAIL  JavaScript errors: ' + errs.slice(0, 3).join(' | ')) }
console.log(bad ? `\n${bad} problem(s)` : '\nTouch is clean at every size')
ws.close(); chrome.kill(); await wait(300); rmSync(profile, { recursive: true, force: true })
process.exit(bad ? 1 : 0)
