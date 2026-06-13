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
  // dismiss any open hover popover so it can't intercept the tray button click
  await page.mouse.move(10, 700)
  await page.waitForTimeout(200)
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

// Typing opens the search-suggestions dropdown (bound to the search value, not
// focus) which floats over the filter row and intercepts chip/toggle clicks.
// So: only click chips/toggles while the search box is EMPTY (dropdown closed),
// and run searches only when the next step is a read.
async function clearSearch() {
  await page.locator('.search-input').fill('')
  await page.waitForTimeout(150)
}
async function selectType(re) {
  await clearSearch()
  await page.locator('.type-filter-btn', { hasText: re }).click()
  await page.waitForTimeout(300)
}
async function searchCount(term) {
  await page.locator('.search-input').fill(term)
  await page.waitForTimeout(400)
  return page.locator('.item-card').count()
}

await check('type filter: Tank excludes Death\'s Dance (regression for support leak)', async () => {
  // The old support matcher (FlatHPPoolMod||FlatMPPoolMod||AbilityHaste) put
  // Death's Dance in "support"; the new tank matcher needs real resist AND HP,
  // and Death's Dance has no HP — so Tank must filter it out.
  await clearSearch()
  await page.locator('.filter-chip', { hasText: 'Legendary' }).click() // clear active tier filter
  await page.waitForTimeout(300)
  if ((await searchCount("Death's Dance")) < 1) throw new Error("Death's Dance not found at all")
  await selectType(/^Tank$/)
  const after = await searchCount("Death's Dance")
  if (after !== 0) throw new Error(`Death's Dance still shown under Tank (${after} cards)`)
})

await check('support items hidden by default, surfaced by the Support chip', async () => {
  await selectType(/^All$/)
  const hidden = await searchCount('atlas') // World Atlas (GoldPer support)
  if (hidden !== 0) throw new Error(`support item visible by default (${hidden} cards)`)
  await selectType(/^Support$/)
  if ((await searchCount('atlas')) < 1) throw new Error('Support chip surfaced nothing')
})

await check('exclude-support toggle reveals support items', async () => {
  await selectType(/^All$/)
  if ((await searchCount('atlas')) !== 0) throw new Error('precondition: support already shown')
  await clearSearch()
  await page.locator('.support-toggle input').uncheck()
  await page.waitForTimeout(300)
  if ((await searchCount('atlas')) < 1) throw new Error('toggle did not reveal support item')
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
