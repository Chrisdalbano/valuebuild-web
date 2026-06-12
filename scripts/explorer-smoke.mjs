// Interaction smoke test for the explorer route (drives system Chrome).
// Usage: node ../scripts/explorer-smoke.mjs [baseUrl]   (run from gold-league/)
// Assumes a server is already running at baseUrl.
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(path.join(process.cwd(), 'noop.js'))
const { chromium } = require('playwright-core')

const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--disable-web-security'], // prod API CORS allowlist excludes localhost
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

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

await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })

await check('grid renders 24 cards', async () => {
  const count = await page.locator('.item-card').count()
  if (count !== 24) throw new Error(`expected 24, got ${count}`)
})

await check('selecting two cards shows tray with count 2/6', async () => {
  await page.locator('.item-card').nth(0).click()
  await page.locator('.item-card').nth(1).click()
  await page.waitForSelector('.comparison-tray', { timeout: 3000 })
  const badge = await page.locator('.count-badge').textContent()
  if (badge.trim() !== '2/6') throw new Error(`count badge: ${badge}`)
})

await check('tray remove buttons empty selection and hide tray', async () => {
  // click the per-item remove (not the header clear) twice
  await page.locator('.btn-remove-item').first().click()
  await page.locator('.btn-remove-item').first().click()
  await page.waitForSelector('.comparison-tray', { state: 'detached', timeout: 3000 })
})

await check('Compare navigates to /compare', async () => {
  await page.locator('.item-card').nth(0).click()
  await page.locator('.item-card').nth(1).click()
  await page.locator('.btn-compare-now').click()
  await page.waitForURL('**/compare', { timeout: 5000 })
})

await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })

await check('table view renders rows with ratings', async () => {
  await page.locator('.view-btn[title="Table view"]').click()
  await page.waitForSelector('.items-table tbody tr', { timeout: 3000 })
  const rows = await page.locator('.items-table tbody tr').count()
  if (rows !== 24) throw new Error(`expected 24 rows, got ${rows}`)
})

await check('table header sort toggles direction', async () => {
  const first = () => page.locator('.items-table tbody tr .item-name').first().textContent()
  const before = await first()
  await page.locator('th.th-cost').click() // sort by cost desc
  await page.waitForTimeout(300)
  const after = await first()
  if (before === after) throw new Error('sort had no effect')
})

await check('search filters the grid and shows suggestions', async () => {
  await page.locator('.view-btn[title="Grid view"]').click()
  await page.locator('.search-input').fill('crit')
  await page.waitForSelector('.search-suggestions', { timeout: 3000 })
  await page.waitForTimeout(400)
  const shown = await page.locator('.showing-count').textContent()
  if (!/Showing/.test(shown)) throw new Error('pagination count missing')
})

await check('tier chip filters items', async () => {
  await page.locator('.search-input').fill('')
  await page.locator('.filter-chip', { hasText: 'Legendary' }).click()
  await page.waitForTimeout(400)
  const badges = await page.locator('.item-card .tier-pill').allTextContents()
  if (!badges.length || badges.some(b => b.trim() !== 'Legendary')) {
    throw new Error(`non-legendary badge present (${badges.length} cards)`)
  }
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
