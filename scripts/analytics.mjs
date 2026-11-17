// Pulls the portfolio's Vercel Web Analytics for the feedback loop (see .claude/agents/portfolio-loop.md).
//   node scripts/analytics.mjs [days]        (default 14; the plan keeps about a month, so 14 leaves a period to compare with)
// Prints, for the last N days and the N days before them: visitors and page views by page, by device, by where
// people came from, and by country, plus a day-by-day line. It uses the Vercel CLI's own login (`npx vercel
// login` once on this machine); nothing secret is stored here, and the project is looked up by name.
import { execFileSync } from 'node:child_process'

const DAYS = Number(process.argv[2]) || 14
const PROJECT = 'portfolio'
const api = path => JSON.parse(execFileSync('npx', ['--yes', 'vercel@latest', 'api', path, '--raw'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 }))

const project = api('/v9/projects?limit=100').projects.find(p => p.name === PROJECT)
if (!project) { console.error(`No Vercel project named "${PROJECT}" for this login`); process.exit(1) }
const day = 86400000, now = Date.now()
const iso = t => new Date(t).toISOString()
// a period older than the plan keeps comes back as an error: treated as "no data to compare with"
const query = (by, since, until, limit = 40) => {
  try { return api(`/v1/query/web-analytics/visits/aggregate?projectId=${project.id}&teamId=${project.accountId}&since=${iso(since)}&until=${iso(until)}&by=${by}&limit=${limit}`).data }
  catch { return null }
}

const pct = (a, b) => b ? `${a >= b ? '+' : ''}${Math.round((a - b) / b * 100)}%` : 'new'
function table(title, by, key) {
  const cur = query(by, now - DAYS * day, now) ?? [], prev = query(by, now - 2 * DAYS * day, now - DAYS * day)
  const before = Object.fromEntries((prev ?? []).map(r => [r[key], r]))
  console.log(`\n## ${title}  (last ${DAYS} days${prev ? `; change vs the ${DAYS} days before` : '; no earlier period to compare with'})`)
  for (const r of cur.sort((a, b) => b.visitors - a.visitors)) {
    const p = before[r[key]]
    console.log(`${String(r[key] || '(direct / unknown)').padEnd(28)} ${String(r.visitors).padStart(5)} visitors ${String(r.pageviews).padStart(5)} views   ${prev ? pct(r.visitors, p?.visitors) : ''}`)
  }
  return cur
}

console.log(`# Vercel Web Analytics: ${PROJECT}, ${iso(now - DAYS * day).slice(0, 10)} to ${iso(now).slice(0, 10)}`)
const pages = table('Pages', 'requestPath', 'requestPath')
table('Devices', 'deviceType', 'deviceType')
table('Where visitors came from', 'referrerHostname', 'referrerHostname')
table('Countries', 'country', 'country')

// How far people get: of everyone who saw the home page, how many opened anything else
const home = pages.find(r => r.requestPath === '/')
if (home) {
  console.log(`\n## Getting past the home page`)
  for (const r of pages.filter(r => r.requestPath !== '/').slice(0, 12))
    console.log(`${r.requestPath.padEnd(28)} ${String(Math.round(r.visitors / home.visitors * 100)).padStart(3)}% of home-page visitors`)
  console.log(`Views per visitor on the home page: ${(home.pageviews / home.visitors).toFixed(1)}`)
}
console.log(`\n## Day by day (visitors)`)
console.log((query('day', now - DAYS * day, now, 60) ?? []).map(r => `${String(r.day ?? r.timestamp ?? '').slice(5, 10)}:${r.visitors}`).join('  '))
