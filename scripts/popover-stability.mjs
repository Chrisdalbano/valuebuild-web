// Regression test for the ItemHoverCard flip-oscillation bug: a stats card
// opened near a viewport edge must settle to a STABLE position, not loop
// flipping top<->bottom forever.
// Usage: node ../scripts/popover-stability.mjs [baseUrl]   (run from gold-league/)
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
const page = await browser.newPage({ viewport: { width: 1440, height: 820 } })

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

// Sample the teleported card's top edge over ~1s; once the entrance settles it
// must stop moving. An oscillating popover keeps changing top forever.
async function settledTops(iconLocator) {
  await iconLocator.scrollIntoViewIfNeeded()
  await iconLocator.hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  const tops = []
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(120)
    tops.push(
      await page.locator('body > .floating-card').evaluate(el => Math.round(el.getBoundingClientRect().top))
    )
  }
  return tops
}

await check('card near the TOP edge settles (forces flip top->bottom)', async () => {
  // push a card right under the navbar so placement:top has no room and flips
  await page.evaluate(() => {
    const card = document.querySelectorAll('.item-card')[4]
    card.scrollIntoView({ block: 'start' })
    window.scrollBy(0, -56)
  })
  const tops = await settledTops(page.locator('.item-card .item-icon').nth(4))
  const tail = tops.slice(-4) // after the entrance has settled
  const stable = tail.every(t => Math.abs(t - tail[0]) <= 1)
  if (!stable) throw new Error(`oscillating, tops=${tops.join(',')}`)
  await page.mouse.move(8, 760)
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
})

await check('card near the BOTTOM edge settles', async () => {
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.item-card')
    const card = cards[cards.length - 3]
    card.scrollIntoView({ block: 'end' })
  })
  const idx = await page.locator('.item-card').count()
  const tops = await settledTops(page.locator('.item-card .item-icon').nth(idx - 3))
  const tail = tops.slice(-4)
  const stable = tail.every(t => Math.abs(t - tail[0]) <= 1)
  if (!stable) throw new Error(`oscillating, tops=${tops.join(',')}`)
  await page.mouse.move(8, 60)
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
})

await check('card stays within the viewport', async () => {
  await page.evaluate(() => {
    const card = document.querySelectorAll('.item-card')[3]
    card.scrollIntoView({ block: 'start' })
    window.scrollBy(0, -56)
  })
  await page.locator('.item-card .item-icon').nth(3).hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  await page.waitForTimeout(700)
  const r = await page.locator('body > .floating-card').evaluate(el => {
    const b = el.getBoundingClientRect()
    return { top: b.top, bottom: b.bottom, vh: window.innerHeight }
  })
  if (r.top < -2 || r.bottom > r.vh + 2) throw new Error(`offscreen: top=${r.top} bottom=${r.bottom} vh=${r.vh}`)
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
