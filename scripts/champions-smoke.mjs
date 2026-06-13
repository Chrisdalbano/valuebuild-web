// Smoke test for the Champions page (mocked roster + analysis so it's
// deterministic). Usage: node ../scripts/champions-smoke.mjs [baseUrl]
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(path.join(process.cwd(), 'noop.js'))
const { chromium } = require('playwright-core')

const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--disable-web-security'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })

await page.route('**/api/champions', route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({ count: 3, champions: [
    { id: 'Aatrox', name: 'Aatrox', tags: ['Fighter'], rangeType: 'melee', patch: '16.12.1' },
    { id: 'Jinx', name: 'Jinx', tags: ['Marksman'], rangeType: 'ranged', patch: '16.12.1' },
    { id: 'Lux', name: 'Lux', tags: ['Mage', 'Support'], rangeType: 'ranged', patch: '16.12.1' },
  ] }),
}))
await page.route('**/api/champions/*/ai', route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({
    status: 'ready', patch: '16.11.1',
    coreBuild: { itemIds: ['3031', '3036'], rationale: 'core rationale' },
    buildPath: { early: ['1055'], mid: ['3031'], late: ['3036'] },
    situational: [{ when: 'vs tanks', itemIds: ['3036'], why: 'armor pen' }],
    experimental: { title: 'Off-meta idea', itemIds: ['3153'], rationale: 'why' },
    economy: { ahead: 'snowball', behind: 'stabilize' },
    caveats: 'speculative',
  }),
}))

let failures = 0
async function check(name, fn) {
  try { await fn(); console.log(`PASS  ${name}`) }
  catch (err) { failures++; console.log(`FAIL  ${name}: ${err.message.split('\n')[0]}`) }
}

await page.goto(`${base}/champions`)
await page.waitForSelector('.champion-card', { timeout: 30000 })

await check('champion grid renders the roster', async () => {
  const n = await page.locator('.champion-card').count()
  if (n !== 3) throw new Error(`expected 3 champion cards, got ${n}`)
})

await check('class filter narrows the grid', async () => {
  await page.locator('.class-chip', { hasText: 'Marksman' }).click()
  await page.waitForTimeout(200)
  const names = await page.locator('.champ-name').allTextContents()
  if (names.length !== 1 || names[0].trim() !== 'Jinx') throw new Error(`filter result: ${names}`)
  await page.locator('.class-chip', { hasText: /^All$/ }).click()
})

await check('selecting a champion opens the analysis with all sections', async () => {
  await page.locator('.champion-card', { hasText: 'Aatrox' }).click()
  await page.waitForSelector('.champ-analysis .ca-block', { timeout: 5000 })
  const disc = await page.locator('.champ-analysis .ai-disclaimer').textContent()
  if (!/speculative/i.test(disc)) throw new Error(`disclaimer: ${disc}`)
  const labels = await page.locator('.champ-analysis .ca-label').allTextContents()
  const joined = labels.join('|').toLowerCase()
  for (const need of ['core build', 'build path', 'situational', 'experimental']) {
    if (!joined.includes(need)) throw new Error(`missing section: ${need}`)
  }
})

await check('"Try this build" deep-links into /builds?b=', async () => {
  await page.locator('.champ-analysis .bir-try').first().click()
  await page.waitForURL('**/builds?b=*', { timeout: 5000 })
})

await check('back button returns to the grid', async () => {
  await page.goBack()
  await page.waitForSelector('.champion-card', { timeout: 5000 })
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
