// Smoke test for Phase 4 features: shareable builds + budget optimizer.
// Usage: node ../scripts/features-smoke.mjs [baseUrl]   (run from gold-league/)
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
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base })
const page = await context.newPage()

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
await page.waitForSelector('.budget-optimizer', { timeout: 30000 })

let sharedUrl = ''

await check('optimizer fills the build under the default budget', async () => {
  await page.locator('.btn-optimize').click()
  await page.waitForSelector('.build-slot.filled', { timeout: 5000 })
  const filled = await page.locator('.build-slot.filled').count()
  if (filled < 1) throw new Error('no slots filled')
  const summary = await page.locator('.optimizer-summary').textContent()
  if (!/total stat value/.test(summary)) throw new Error(`summary: ${summary}`)
})

await check('build syncs into the URL (?b=)', async () => {
  await page.waitForTimeout(400)
  const url = page.url()
  if (!/\?b=\d+/.test(url)) throw new Error(`url: ${url}`)
  sharedUrl = url
})

await check('optimizer respects a small budget', async () => {
  await page.locator('.budget-input').fill('3000')
  await page.locator('.btn-optimize').click()
  await page.waitForTimeout(400)
  const summary = await page.locator('.optimizer-summary').textContent()
  const spent = Number((summary.match(/([\d,]+)g spent/) || [])[1]?.replace(/,/g, ''))
  if (!(spent > 0 && spent <= 3000)) throw new Error(`spent ${spent} of 3000`)
})

await check('share button copies the canonical URL', async () => {
  await page.locator('.btn-share').click()
  await page.waitForTimeout(300)
  const label = await page.locator('.btn-share').textContent()
  if (!/copied/i.test(label)) throw new Error(`button label: ${label}`)
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  if (!/\/builds\?b=\d+/.test(clip)) throw new Error(`clipboard: ${clip}`)
})

await check('opening a shared URL hydrates the build', async () => {
  const fresh = await context.newPage()
  await fresh.goto(sharedUrl)
  await fresh.waitForSelector('.build-slot.filled', { timeout: 30000 })
  const ids = new URL(sharedUrl).searchParams.get('b').split(',')
  const filled = await fresh.locator('.build-slot.filled').count()
  if (filled !== ids.length) throw new Error(`expected ${ids.length} filled, got ${filled}`)
  await fresh.close()
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
