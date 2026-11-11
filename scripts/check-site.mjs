// Site check: the tests that used to be run by hand before every push, as one command.
//   node scripts/check-site.mjs [url]        (default http://localhost:5173)
// Opens the site in headless Chrome and checks:
//   1. no JavaScript errors on the home page, a case study, About, and Exploration
//   2. no sideways scrolling at phone, tablet, laptop, and desktop widths
//   3. on a phone, every work card opens something when tapped (cover and name)
//   4. on a desktop, the 3D Polaroid loads; on a phone, the flat one is used instead
// Prints a pass/fail line per check and exits 1 if anything failed, so scripts and agents can rely on it.
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9400 + Math.floor(Math.random() * 400)
const profile = mkdtempSync(join(tmpdir(), 'check-site-'))
// --no-sandbox only when running as root (cloud containers), where Chrome refuses to start otherwise
const flags = ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : [])]
const chrome = spawn(CHROME, [...flags, 'about:blank'], { stdio: 'ignore' })
const wait = ms => new Promise(r => setTimeout(r, ms))

let ws, id = 0
const pend = new Map(), errors = []
async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page')
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); break }
    } catch { /* not up yet */ }
    await wait(200)
  }
  if (!ws) throw new Error('Chrome did not start')
  ws.onmessage = e => {
    const m = JSON.parse(e.data)
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id) }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text)
  }
  await new Promise(r => (ws.onopen = r))
}
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result?.value
async function open(path, w, h, phone) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: phone ? 2 : 1, mobile: phone })
  await send('Emulation.setTouchEmulationEnabled', { enabled: phone, maxTouchPoints: phone ? 5 : 0 })
  await send('Page.navigate', { url: BASE + path })
  await wait(3500)
}

const results = []
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`) }

try {
  await connect()
  await send('Runtime.enable')

  // 1. no JS errors
  for (const path of ['/', '/work/cosign', '/info', '/exploration']) {
    errors.length = 0
    await open(path, 1440, 900, false)
    check(`no errors on ${path}`, errors.length === 0, errors.slice(0, 2).join(' | '))
  }

  // 4a. 3D Polaroid on a desktop (checked before any phone emulation: once touch has been emulated, the browser
  // keeps reporting a touch screen, and the site rightly skips 3D)
  await open('/', 1440, 900, false)
  await wait(2500)
  // Some test browsers (cloud, no GPU) can't do 3D or don't report a mouse; then the site correctly shows the flat
  // Polaroid, so the check is skipped rather than reported as a site failure
  const env = await ev(`({ webgl2: !!document.createElement('canvas').getContext('webgl2'), mouse: matchMedia('(hover: hover) and (pointer: fine)').matches })`)
  if (env?.webgl2 && env?.mouse) check('3D Polaroid loads on desktop', await ev(`!!document.querySelector('.p3d-stage canvas') && !!document.querySelector('.polaroid.is-ghost')`))
  else console.log('SKIP  3D Polaroid loads on desktop  (this test browser has no 3D or mouse)')

  // 2. no sideways scroll
  for (const [w, h, phone] of [[390, 844, true], [820, 1180, true], [1280, 720, false], [1920, 1080, false]]) {
    for (const path of ['/', '/work/scout']) {
      await open(path, w, h, phone)
      const sw = await ev('document.documentElement.scrollWidth')
      check(`no sideways scroll at ${w}px on ${path}`, sw <= w, `page is ${sw}px wide`)
    }
  }

  // 3. every card opens something when tapped on a phone
  await open('/', 390, 844, true)
  const cards = await ev(`(async () => {
    const out = []
    for (const t of document.querySelectorAll('.grid .tile')) {
      t.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 120))
      document.documentElement.classList.remove('is-scrolling')
      const name = t.querySelector('.tile-name'), cover = t.querySelector('.tile-media')
      const at = el => { const b = el.getBoundingClientRect(); return document.elementFromPoint(b.left + 10, b.top + b.height / 2) }
      const opens = el => !!el?.closest('a.tile-cover, button.tile-cover')
      out.push([name.textContent, opens(at(cover)), opens(at(name))])
    }
    return out })()`)
  // a card with no page yet (marked "coming soon") is allowed to be inert
  const inert = await ev(`[...document.querySelectorAll('.grid .tile.is-soon')].map(t => t.querySelector('.tile-name').textContent)`)
  for (const [name, cover, label] of cards) {
    const ok = (cover && label) || inert.includes(name)
    check(`phone tap opens "${name}"`, ok, ok ? '' : `cover ${cover ? 'ok' : 'dead'}, name ${label ? 'ok' : 'dead'}`)
  }

  // 4b. flat Polaroid on a phone
  await open('/', 390, 844, true)
  check('flat Polaroid on phone (no 3D)', await ev(`!document.querySelector('.p3d-stage') && getComputedStyle(document.querySelector('.polaroid-card')).visibility === 'visible'`))
} catch (e) {
  check('site check ran', false, e.message)
} finally {
  ws?.close()
  chrome.kill()
  await wait(300)
  rmSync(profile, { recursive: true, force: true })
}

const failed = results.filter(r => !r).length
console.log(failed ? `\n${failed} check(s) failed` : `\nAll ${results.length} checks passed`)
process.exit(failed ? 1 : 0)
