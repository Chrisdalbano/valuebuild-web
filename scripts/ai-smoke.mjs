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
  const disc = await page.locator('.ai-effect-panel .ai-disclaimer').textContent()
  if (!/speculative/i.test(disc)) throw new Error(`disclaimer: ${disc}`)
})

await check('AI panel degrades gracefully (pending/empty, never blank or thrown)', async () => {
  const body = await page.locator('.ai-effect-panel').textContent()
  if (!body || !body.trim()) throw new Error('AI panel empty')
})

await check('modal shows the Best-On panel with a speculative disclaimer', async () => {
  await page.waitForSelector('.item-best-on-panel', { timeout: 5000 })
  const disc = await page.locator('.item-best-on-panel .ai-disclaimer').textContent()
  if (!/speculative/i.test(disc)) throw new Error(`disclaimer: ${disc}`)
  const body = await page.locator('.item-best-on-panel').textContent()
  if (!body || !body.trim()) throw new Error('Best-On panel empty')
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
      comparisons: [
        { stat: 'Attack Damage', amount: 15, gold: 525 },
        { stat: 'Health', amount: 195, gold: 520 },
      ],
    }],
    summary: 'mock summary', caveats: 'mock caveats',
    bestOn: {
      champions: [
        { name: 'Aatrox', why: 'kit synergy reason', synergyStat: 'OnHit', confidence: 'high' },
        { name: 'Mundo', why: 'sustain reason', synergyStat: 'Health', confidence: 'medium' },
      ],
      caveats: 'varies by matchup',
    },
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
  // quantitative comparison chips (actual numbers vs base stats)
  const chips = await mock.locator('.ai-effect-panel .compare-chip').count()
  if (chips < 2) throw new Error(`expected comparison chips, got ${chips}`)
  const chip = await mock.locator('.ai-effect-panel .compare-chip').first().textContent()
  if (!/\d/.test(chip)) throw new Error(`comparison chip has no number: ${chip}`)
})

await check('ready-state renders the Best-On champion rows', async () => {
  await mock.waitForSelector('.item-best-on-panel .champ-row', { timeout: 5000 })
  const rows = await mock.locator('.item-best-on-panel .champ-row').count()
  if (rows !== 2) throw new Error(`expected 2 champion rows, got ${rows}`)
  const name = await mock.locator('.item-best-on-panel .champ-name').first().textContent()
  if (!/Aatrox/.test(name)) throw new Error(`champ name: ${name}`)
  const stat = await mock.locator('.item-best-on-panel .champ-stat').first().textContent()
  if (!/OnHit/.test(stat)) throw new Error(`synergy stat missing: ${stat}`)
})

// --- AI Research tab: pending state (real backend) ---
await check('/research renders header + honesty banner + content (pending or ready)', async () => {
  await page.goto(`${base}/research`)
  await page.waitForSelector('.research-board', { timeout: 30000 })
  const banner = await page.locator('.honesty-banner').textContent()
  if (!/hypotheses/i.test(banner)) throw new Error(`banner: ${banner}`)
  // either the pending/empty state OR the real ready content — both are valid
  await page.waitForSelector('.research-state, .research-section', { timeout: 6000 })
})

// --- AI Research tab: ready-state (route-mocked digest) ---
const rmock = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
await rmock.route('**/api/research', route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({
    status: 'ready', patch: '16.11.1', generatedAt: new Date(0).toISOString(),
    outliers: [{ itemId: '3153', name: 'Blade of the Ruined King', efficiency: 88, claim: 'effect undervalued', direction: 'undervalued' }],
    effectSpotlights: [{ itemId: '3157', name: "Zhonya's Hourglass", estimatedEffectGold: 1000, insight: 'Stasis is pure survival value' }],
    experimentalBuilds: [{ title: 'On-hit bruiser', forChampion: 'Jax', itemIds: ['3153', '3157'], rationale: 'test the synergy' }],
  }),
}))

await check('ready-state renders outliers, spotlights, and experimental builds', async () => {
  await rmock.goto(`${base}/research`)
  await rmock.waitForSelector('.research-board', { timeout: 30000 })
  await rmock.waitForSelector('.outlier-card', { timeout: 5000 })
  if (!(await rmock.locator('.spotlight-row').count())) throw new Error('no spotlights')
  if (!(await rmock.locator('.exp-build').count())) throw new Error('no experimental builds')
})

await check('research shows the mispricing chart + quantitative fields', async () => {
  // efficiency chart canvas renders from outliers carrying a numeric efficiency
  await rmock.waitForSelector('.research-board canvas', { timeout: 5000 })
  const eff = await rmock.locator('.outlier-card .eff-num').first().textContent()
  if (!/88%/.test(eff)) throw new Error(`outlier efficiency number missing: ${eff}`)
  const gold = await rmock.locator('.spotlight-gold .gold-num').first().textContent()
  if (!/1000g/.test(gold)) throw new Error(`effect gold missing: ${gold}`)
  const champ = await rmock.locator('.exp-champ').first().textContent()
  if (!/Jax/.test(champ)) throw new Error(`forChampion chip missing: ${champ}`)
})

await check('"Try this build" links into /builds?b=', async () => {
  await rmock.locator('.btn-try').first().click()
  await rmock.waitForURL('**/builds?b=*', { timeout: 5000 })
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
