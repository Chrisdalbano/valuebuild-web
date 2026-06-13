import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(path.join(process.cwd(), 'noop.js'))
const { chromium } = require('playwright-core')
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--disable-web-security'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
let failures = 0
const check = async (name, fn) => {
  try { await fn(); console.log('PASS ', name) } catch (e) { failures++; console.log('FAIL ', name, '-', e.message.split('\n')[0]) }
}

const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })

await check('grid icons lazy-load through ItemIcon on scroll', async () => {
  await page.locator('.item-card').first().scrollIntoViewIfNeeded()
  await page.waitForSelector('.item-card .item-icon.loaded', { timeout: 8000 })
})

await check('hovering a grid icon floats THE stats card to <body>', async () => {
  await page.locator('.item-card .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card .item-stats-card', { timeout: 3000 })
  const name = await page.locator('.item-stats-card h4').textContent()
  if (!name.trim()) throw new Error('empty card')
})

await check('hovering the card BODY (not the icon) also floats the stats card', async () => {
  await page.mouse.move(10, 700) // leave any open card
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
  // hover the title/stats area, away from the icon, and confirm the popover opens
  await page.locator('.item-card .card-title').first().hover()
  await page.waitForSelector('body > .floating-card .item-stats-card', { timeout: 3000 })
})

await check('whole-card hover stays open — no open/close oscillation', async () => {
  // Regression: when the popover flips to overlap the card it stole the pointer,
  // fired the card's mouseleave, and oscillated. Hover a top-row card (most
  // likely to flip down over itself) and confirm it stays stably open.
  await page.mouse.move(10, 700)
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
  const card = page.locator('.item-card').first()
  await card.hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  // sample stability over time: must remain exactly one open card, never 0
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(120)
    const n = await page.locator('body > .floating-card').count()
    if (n !== 1) throw new Error(`popover oscillated — count ${n} at sample ${i}`)
  }
})

await check('card hides on mouse leave', async () => {
  await page.mouse.move(10, 700)
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
})

await check('table-view icon hover floats card (no clipping container)', async () => {
  await page.locator('.view-btn[title="Table view"]').click()
  await page.waitForSelector('.items-table tbody tr', { timeout: 3000 })
  await page.locator('.items-table .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  await page.mouse.move(10, 700)
})

await check('swap-modal icon hover card stacks ABOVE the modal', async () => {
  await page.locator('.view-btn[title="Grid view"]').click()
  await page.locator('.item-card').nth(0).click()
  await page.locator('.item-card').nth(1).click()
  await page.locator('.btn-compare-now').click()
  await page.waitForURL('**/compare', { timeout: 5000 })
  await page.locator('.add-item-card').click()
  await page.waitForSelector('.swap-modal', { timeout: 3000 })
  await page.locator('.swap-item .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  const z = await page.evaluate(() => {
    const card = document.querySelector('.floating-card')
    const modal = document.querySelector('.swap-modal').closest('.modal-overlay')
    return [getComputedStyle(card).zIndex, getComputedStyle(modal).zIndex].map(Number)
  })
  if (!(z[0] > z[1])) throw new Error(`popover z ${z[0]} not above modal z ${z[1]}`)
})

await check('build slot hover shows stats card', async () => {
  await page.keyboard.press('Escape')
  await page.goto(`${base}/builds`)
  await page.waitForSelector('.suggestion-card', { timeout: 30000 })
  await page.locator('.btn-add-suggestion').first().click()
  await page.waitForSelector('.build-slot.filled', { timeout: 3000 })
  await page.locator('.build-slot.filled .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures ? 1 : 0)
