// Interaction smoke test for the builds route (drives system Chrome).
// Usage: node ../scripts/builds-smoke.mjs [baseUrl]   (run from gold-league/)
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

await page.goto(`${base}/builds`)
await page.waitForSelector('.build-slot', { timeout: 30000 })

await check('6 empty slots + empty state + suggestions', async () => {
  const slots = await page.locator('.build-slot').count()
  if (slots !== 6) throw new Error(`expected 6 slots, got ${slots}`)
  await page.waitForSelector('.builds-empty-state', { timeout: 3000 })
  await page.waitForSelector('.suggestion-card', { timeout: 10000 })
})

await check('adding a suggestion fills a slot and shows analysis', async () => {
  await page.locator('.btn-add-suggestion').first().click()
  await page.waitForSelector('.build-slot.filled', { timeout: 3000 })
  await page.waitForSelector('.build-analysis-panel', { timeout: 3000 })
  const rec = await page.locator('.recommendation-content p').textContent()
  if (!rec.trim()) throw new Error('empty recommendation')
})

await check('build stats show totals', async () => {
  const labels = await page.locator('.build-stat .stat-label').allTextContents()
  if (!labels.some(l => /Total Cost/i.test(l))) throw new Error(`labels: ${labels}`)
})

await check('added item leaves the suggestion list (legacy filter)', async () => {
  const firstName = await page.locator('.suggestion-name').first().textContent()
  await page.locator('.btn-add-suggestion:not(:disabled)').first().click()
  await page.waitForTimeout(300)
  const names = await page.locator('.suggestion-name').allTextContents()
  if (names.includes(firstName)) throw new Error(`${firstName} still suggested`)
  const filled = await page.locator('.build-slot.filled').count()
  if (filled !== 2) throw new Error(`expected 2 filled slots, got ${filled}`)
})

await check('role filter changes suggestions subtitle', async () => {
  await page.locator('.role-btn', { hasText: 'Mage' }).click()
  await page.waitForTimeout(400)
  const subtitle = await page.locator('.suggestions-subtitle').textContent()
  if (!/Mage/.test(subtitle)) throw new Error(`subtitle: ${subtitle}`)
})

await check('slot remove empties the slot', async () => {
  const before = await page.locator('.build-slot.filled').count()
  await page.locator('.slot-remove').first().click()
  await page.waitForTimeout(300)
  const after = await page.locator('.build-slot.filled').count()
  if (after !== before - 1) throw new Error(`filled ${before} -> ${after}`)
})

await check('save build persists a named build to the panel', async () => {
  // precondition: at least one filled slot (left by the prior checks)
  if ((await page.locator('.build-slot.filled').count()) < 1) {
    await page.locator('.btn-add-suggestion').first().click()
    await page.waitForTimeout(300)
  }
  await page.locator('.btn-save-build').click()
  await page.locator('.save-build-input').fill('Smoke Test Build')
  await page.locator('.btn-save-confirm').click()
  await page.waitForSelector('.saved-builds .saved-row', { timeout: 3000 })
  const name = await page.locator('.saved-row .saved-name').first().textContent()
  if (name.trim() !== 'Smoke Test Build') throw new Error(`saved name: ${name}`)
})

await check('saved build survives a page reload (localStorage)', async () => {
  await page.reload()
  await page.waitForSelector('.build-slot', { timeout: 30000 })
  await page.waitForSelector('.saved-builds .saved-row', { timeout: 5000 })
})

await check('loading a saved build fills slots and writes the share URL', async () => {
  await page.locator('.saved-btn.load').first().click()
  await page.waitForSelector('.build-slot.filled', { timeout: 3000 })
  await page.waitForFunction(() => /[?&]b=/.test(location.search), { timeout: 3000 })
})

await check('deleting a saved build removes it from the panel', async () => {
  await page.locator('.saved-btn.danger').first().click()
  await page.waitForTimeout(300)
  if ((await page.locator('.saved-row').count()) !== 0) throw new Error('saved build still present')
})

await check('clear build returns to empty state', async () => {
  await page.locator('.btn-clear-build').click()
  await page.waitForSelector('.builds-empty-state', { timeout: 3000 })
  const filled = await page.locator('.build-slot.filled').count()
  if (filled !== 0) throw new Error(`${filled} slots still filled`)
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
