// Takes a screenshot of every company site listed in src/data.ts (`site: '...'`) and saves it to
// public/sites/<id>.jpg. Those are the previews that pop up when you hover a project's name.
//
//   npm run previews            → only sites that don't have a screenshot yet
//   npm run previews -- --all   → retake all of them
//   npm run previews -- cosign  → retake just one (by project id)
//
// Uses your installed Google Chrome, so there's no browser download.
import { chromium } from 'playwright-core'
import { existsSync, readFileSync } from 'node:fs'

const data = readFileSync(new URL('../src/data.ts', import.meta.url), 'utf8')
const sites = [...data.matchAll(/\{ id: '([\w-]+)'.*?site: '([^']+)'/g)].map(([, id, url]) => ({ id, url }))
const args = process.argv.slice(2)
const out = id => new URL(`../public/sites/${id}.jpg`, import.meta.url).pathname
const todo = sites.filter(s =>
  args.includes('--all') ? true : args.length ? args.includes(s.id) : !existsSync(out(s.id)))

if (!todo.length) { console.log('Every site already has a screenshot. Use --all to retake them.'); process.exit(0) }

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
for (const { id, url } of todo) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(2500) // let intro animations settle
    // Hide common cookie / consent banners so they don't cover the hero
    await page.addStyleTag({ content: '[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i]{display:none!important}' })
    await page.screenshot({ path: out(id), type: 'jpeg', quality: 78, clip: { x: 0, y: 0, width: 1440, height: 900 } })
    console.log(`✓ ${id}  ${url}`)
  } catch (e) {
    console.log(`✗ ${id}  ${url}  (${e.message.split('\n')[0]})`)
  }
}
await browser.close()
