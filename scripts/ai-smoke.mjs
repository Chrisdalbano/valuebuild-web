// Smoke test for the AI surfaces: the per-item effect panel (pending + mocked
// ready) and the breakdown-modal entry points. Research-tab checks are added in
// Phase B3. Usage: node ../scripts/ai-smoke.mjs [baseUrl]   (run from gold-league/)
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(path.join(process.cwd(), 'noop.js'))
const { chromium } = require('playwright-core')

const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--disable-web-security'],
})

let failures = 0
async function check(name, fn) {
  try {
    await fn()
    console.log(`PASS  ${name}`)
  } catch (err) {
    failures++
    console.log(`FAIL  ${name}: ${err.message.split('\n')[0]}`)
  }
}

// --- entry points + graceful pending state (real backend) ---
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })

await check('grid details button opens the breakdown modal', async () => {
  await page.locator('.item-card').first().hover()
  await page.locator('.item-card .card-details').first().click()
  await page.waitForSelector('.item-breakdown', { timeout: 5000 })
})

await check('modal shows the AI panel with a speculative disclaimer', async () => {
  await page.waitForSelector('.ai-effect-panel', { timeout: 5000 })
  const disc = await page.locator('.ai-disclaimer').textContent()
  if (!/speculative/i.test(disc)) throw new Error(`disclaimer: ${disc}`)
})

await check('AI panel degrades gracefully (pending/empty, never blank or thrown)', async () => {
  const body = await page.locator('.ai-effect-panel').textContent()
  if (!body || !body.trim()) throw new Error('AI panel empty')
})

await check('table-view details button also opens the modal', async () => {
  await page.locator('.btn-close').click()
  await page.waitForSelector('.item-breakdown', { state: 'detached', timeout: 3000 })
  await page.locator('.view-btn[title="Table view"]').click()
  await page.waitForSelector('.items-table tbody tr', { timeout: 3000 })
  await page.locator('.row-details').first().click()
  await page.waitForSelector('.ai-effect-panel', { timeout: 5000 })
})

// --- ready-state rendering (route-mocked canned analysis) ---
const mock = await browser.newPage({ viewport: { width: 1240, height: 1200 } })
await mock.route('**/api/items/*/ai', route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({
    status: 'ready', patch: 'mock',
    effects: [{
      name: 'On-hit', estimatedGoldValue: 520, confidence: 'medium',
      reasoning: ['step one', 'step two'], baseStatEquivalence: '≈ 15 AD',
    }],
    summary: 'mock summary', caveats: 'mock caveats',
  }),
}))

await check('ready-state renders the effect→stat→gold map with AI badges', async () => {
  await mock.goto(`${base}/`)
  await mock.waitForSelector('.item-card', { timeout: 30000 })
  await mock.locator('.item-card').first().hover()
  await mock.locator('.item-card .card-details').first().click()
  await mock.waitForSelector('.ai-effect-panel .effect-map', { timeout: 5000 })
  const badges = await mock.locator('.ai-effect-panel .ai-badge').count()
  if (badges < 1) throw new Error('no AI badges rendered')
  const equiv = await mock.locator('.flow-equiv').first().textContent()
  if (!/AD/.test(equiv)) throw new Error(`equivalence missing: ${equiv}`)
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
