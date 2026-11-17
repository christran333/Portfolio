// Hero Polaroid check: the 3D print, its arrows, the film-strip grid, and the open print with its tools, at every
// window size a desktop visitor might have.
//   node scripts/check-hero.mjs [url] [screenshot-folder]     (default http://localhost:5173, no screenshots)
// At each size it measures that nothing overlaps or runs off screen (arrows vs the work below, tools and the
// Clear / Done bar vs the open print), that the print opens, takes a sticker, and that the grid opens and picking
// a photo from it works. Prints one line per size and exits 1 if anything is wrong.
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '')
const OUT = process.argv[3]
if (OUT) mkdirSync(OUT, { recursive: true })
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9800 + Math.floor(Math.random() * 150)
const profile = mkdtempSync(join(tmpdir(), 'check-hero-'))
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
const sizes = [[700, 900], [861, 900], [1024, 768], [1100, 600], [1280, 720], [1440, 900], [1920, 1080], [2560, 1440]]
const m = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 })
const rect = sel => ev(`(() => { const e = document.querySelector('${sel}'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] })()`)
const hit = (a, b) => a && b && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]
let bad = 0
for (const [w, h] of sizes) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: BASE + '/' }); await wait(5000)
  const shot = async n => { if (!OUT) return; const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: w, height: h, scale: Math.min(1, 900 / w) } }); writeFileSync(`${OUT}/${w}x${h}-${n}.jpg`, Buffer.from(r.data, 'base64')) }
  const is3d = await ev(`!!document.querySelector('.polaroid.is-ghost')`)
  const card = await rect('.polaroid-card'), nav = await rect('.p3d-nav'), hint = await rect('.polaroid-hint')
  const below = await ev(`(() => { const s = document.querySelector('.intro-about'); let n = s.nextElementSibling; while (n && !n.getBoundingClientRect().height) n = n.nextElementSibling; return n ? Math.round(n.getBoundingClientRect().top) : null })()`)
  const sw = await ev('document.documentElement.scrollWidth')
  const text = await rect('.intro-about > div')
  const issues = []
  if (!is3d) issues.push('3D not active')
  if (sw > w) issues.push('sideways scroll ' + sw)
  if (nav && below != null && nav[3] > below) issues.push(`arrows overlap content below by ${nav[3] - below}px`)
  if (nav && (nav[0] < 0 || nav[2] > w)) issues.push('arrows off screen')
  if (hint && (hint[0] < 0 || hint[2] > w || hint[1] < 0)) issues.push('sign-me hint off screen ' + hint)
  if (card && (card[0] < 0 || card[2] > w)) issues.push('card off screen')
  if (hit(nav, text)) issues.push('arrows overlap the text')
  await shot('rest')
  // open it
  const c = [(card[0] + card[2]) / 2, (card[1] + card[3]) / 2]
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c[0], y: c[1] }); await wait(300)
  await m('mousePressed', c[0], c[1]); await m('mouseReleased', c[0], c[1]); await wait(1400)
  const tools = await rect('.p3d-tools'), hud = await rect('.p3d-hud')
  const opened = await ev(`document.querySelector('.p3d-hud')?.classList.contains('is-open')`)
  const px = Math.min(h * 0.8 / H, Math.max(120, w - 200) / W), cw = px * W, ch = px * H, cy = h / 2 - h * 0.035
  const big = [Math.round(w / 2 - cw / 2), Math.round(cy - ch / 2), Math.round(w / 2 + cw / 2), Math.round(cy + ch / 2)]
  if (!opened) issues.push('did not open')
  if (hit(tools, big)) issues.push(`tools overlap the open print (tools ${tools}, print ${big})`)
  if (hit(hud, big)) issues.push(`bottom bar overlaps the open print (bar ${hud}, print ${big})`)
  if (tools && (tools[0] < 0 || tools[1] < 0 || tools[3] > h)) issues.push('tools off screen ' + tools)
  if (hud && (hud[0] < 0 || hud[2] > w || hud[3] > h)) issues.push('bottom bar off screen ' + hud)
  if (big[1] < 0 || big[0] < 0) issues.push('open print off screen ' + big)
  // stamp one in the photo and one on the border
  const tb = await ev(`(() => { const r = document.querySelectorAll('.p3d-tools button')[2].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
  await m('mousePressed', tb[0], tb[1]); await m('mouseReleased', tb[0], tb[1]); await wait(100)
  for (const [x, y] of [[w / 2, cy - ch * 0.15], [w / 2 + cw * 0.2, cy + ch * 0.4]]) { await m('mousePressed', x, y); await m('mouseReleased', x, y) }
  await wait(300); await shot('open')
  // close it, then the film-strip grid: opens, fits the window's width, and picking a photo brings it up
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await wait(1300)
  await ev(`document.querySelector('.p3d-nav-roll')?.scrollIntoView({ block: 'center' })`); await wait(300)
  const rb = await ev(`(() => { const e = document.querySelector('.p3d-nav-roll'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
  if (!rb) issues.push('no film-strip button')
  else {
    await m('mousePressed', rb[0], rb[1]); await m('mouseReleased', rb[0], rb[1]); await wait(1300)
    const g = await ev(`(() => { const d = document.querySelector('.p3d-roll'), u = d.querySelector('ul').getBoundingClientRect(); return { open: d.classList.contains('is-open'), left: u.left, right: u.right, n: d.querySelectorAll('li').length } })()`)
    if (!g.open) issues.push('grid did not open')
    if (g.left < 0 || g.right > w) issues.push('grid wider than the window')
    await shot('grid')
    const pb = await ev(`(() => { const r = document.querySelector('.p3d-roll li:nth-child(3) button').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
    await m('mousePressed', pb[0], pb[1]); await m('mouseReleased', pb[0], pb[1]); await wait(1300)
    const after = await ev(`({ grid: document.querySelector('.p3d-roll').classList.contains('is-open'), write: document.querySelector('.p3d-hud').classList.contains('is-open'), now: document.querySelector('.p3d-sr').textContent })`)
    if (after.grid) issues.push('grid stayed open after picking a photo')
    if (after.write) issues.push('picking a photo opened the print')
    if (!/^Photo 3 /.test(after.now)) issues.push('picking photo 3 showed: ' + after.now)
  }
  bad += issues.length
  console.log(`${issues.length ? 'FAIL' : 'PASS'}  hero at ${w}x${h}${issues.length ? '  (' + issues.join('; ') + ')' : ''}`)
}
if (errs.length) { bad += errs.length; console.log('FAIL  JavaScript errors: ' + errs.slice(0, 3).join(' | ')) }
console.log(bad ? `\n${bad} problem(s)` : '\nHero is clean at every size')
ws.close(); chrome.kill(); await wait(300); rmSync(profile, { recursive: true, force: true })
process.exit(bad ? 1 : 0)
