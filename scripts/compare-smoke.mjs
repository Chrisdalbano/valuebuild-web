// Interaction smoke test for the compare route (drives system Chrome).
// Usage: node ../scripts/compare-smoke.mjs [baseUrl]   (run from gold-league/)
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

await check('empty state renders with browse CTA', async () => {
  await page.goto(`${base}/compare`)
  await page.waitForSelector('.empty-state', { timeout: 30000 })
  await page.waitForSelector('.btn-browse-items', { timeout: 3000 })
})

// Build a 3-item comparison via the explorer
await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })
for (const i of [0, 1, 2]) await page.locator('.item-card').nth(i).click()
await page.locator('.btn-compare-now').click()
await page.waitForURL('**/compare', { timeout: 5000 })

await check('insights panel shows winner + 4 cards', async () => {
  await page.waitForSelector('.insights-section', { timeout: 5000 })
  const cards = await page.locator('.insight-card').count()
  if (cards !== 4) throw new Error(`expected 4 insight cards, got ${cards}`)
  if (!(await page.locator('.winner-name').textContent())) throw new Error('winner empty')
})

await check('three charts render', async () => {
  const canvases = await page.locator('.chart-card canvas').count()
  if (canvases !== 3) throw new Error(`expected 3 canvases, got ${canvases}`)
})

await check('3 detail cards + add-item card', async () => {
  const cards = await page.locator('.items-grid .detail-card').count()
  if (cards !== 4) throw new Error(`expected 3 + add card = 4, got ${cards}`) // 3 items + AddItemCard
})

await check('each detail card carries the AI effect panel (speculative)', async () => {
  // The compare view reuses the per-item AI panel; it must render (pending or
  // ready), never blank. One panel per real item (excludes the add-item card).
  const panels = await page.locator('.items-grid .detail-card .ai-effect-panel').count()
  if (panels !== 3) throw new Error(`expected 3 AI panels, got ${panels}`)
  const disc = await page.locator('.ai-effect-panel .ai-disclaimer').first().textContent()
  if (!/speculative/i.test(disc)) throw new Error(`disclaimer: ${disc}`)
})

// --- recipe hover-card regressions (need a recipe-bearing item present) ---
// The top-efficiency grid items are basic components with no recipe; add a
// known legendary (Infinity Edge — a recipe item for all of LoL's history),
// run the recipe hover checks, then remove it to restore the 3-item state the
// count-sensitive checks below depend on.
await check('add a legendary so a recipe is present', async () => {
  await page.locator('.add-item-card').click()
  await page.waitForSelector('.swap-modal', { timeout: 3000 })
  await page.locator('.swap-search-input').fill('infinity edge')
  await page.waitForTimeout(300)
  await page.locator('.swap-item:not(.already-selected)').first().click()
  await page.waitForSelector('.swap-modal', { state: 'detached', timeout: 3000 })
  await page.waitForSelector('.detail-card .recipe-final-icon', { timeout: 3000 })
})

await check('recipe final item floats its own stats card on hover', async () => {
  // Regression: the recipe's FINAL item was a bare icon (no hover card) — it
  // must now float a stats card like the components do.
  await page.locator('.detail-card .recipe-final-icon').first().hover()
  await page.waitForSelector('body > .floating-card .item-stats-card', { timeout: 3000 })
  const name = await page.locator('.item-stats-card h4').textContent()
  if (!name.trim()) throw new Error('empty final-item card')
  await page.mouse.move(10, 800)
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
})

await check('hovering one recipe component opens exactly one card (no dup-key)', async () => {
  // Regression: duplicate :key (e.g. 2x Long Sword) made both hover cards open
  // at once. Any single component hover must yield exactly one floating card.
  await page.locator('.detail-card .recipe-comp-icon').first().hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  await page.waitForTimeout(150)
  const cards = await page.locator('body > .floating-card').count()
  if (cards !== 1) throw new Error(`expected 1 floating card, got ${cards}`)
  await page.mouse.move(10, 800)
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
  // restore 3-item state: drop the legendary we added
  await page.locator('.detail-card:has(.recipe-final-icon) .btn-remove-item').first().click()
  await page.waitForTimeout(400)
})

await check('analysis panel has recommendation text', async () => {
  const text = await page.locator('.analysis-text').textContent()
  if (!/best gold efficiency/.test(text)) throw new Error(`unexpected: ${text.slice(0, 60)}`)
})

await check('remove button drops an item', async () => {
  await page.locator('.detail-card .btn-remove-item').first().click()
  await page.waitForTimeout(400)
  const cards = await page.locator('.items-grid .detail-card').count()
  if (cards !== 3) throw new Error(`expected 2 + add card = 3, got ${cards}`)
})

await check('add-item modal opens, searches, and adds', async () => {
  await page.locator('.add-item-card').click()
  await page.waitForSelector('.swap-modal', { timeout: 3000 })
  await page.locator('.swap-search-input').fill('sword')
  await page.waitForTimeout(300)
  await page.locator('.swap-item:not(.already-selected)').first().click()
  await page.waitForSelector('.swap-modal', { state: 'detached', timeout: 3000 })
  const cards = await page.locator('.items-grid .detail-card').count()
  if (cards !== 4) throw new Error(`expected 3 + add card = 4, got ${cards}`)
})

await check('swap modal swaps an item', async () => {
  const nameBefore = await page.locator('.detail-title h4').first().textContent()
  await page.locator('.detail-card .btn-swap-item').first().click()
  await page.waitForSelector('.swap-modal', { timeout: 3000 })
  await page.locator('.swap-item:not(.already-selected)').first().click()
  await page.waitForSelector('.swap-modal', { state: 'detached', timeout: 3000 })
  const nameAfter = await page.locator('.detail-title h4').first().textContent()
  if (nameBefore === nameAfter) throw new Error('item did not change')
})

await check('single-item notice appears at 1 item', async () => {
  while ((await page.locator('.detail-card .btn-remove-item').count()) > 1) {
    await page.locator('.detail-card .btn-remove-item').first().click()
    await page.waitForTimeout(300)
  }
  await page.waitForSelector('.single-item-view', { timeout: 3000 })
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
